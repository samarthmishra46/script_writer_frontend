import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Search,
  FolderPlus,
  Loader2,
  Menu,
  Plus,
  Coins,
  RefreshCw,
} from "lucide-react";
import { buildApiUrl } from "../config/api";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import SubscriptionBanner from "../components/SubscriptionBanner";
//import StoryboardGenerator from "../components/StoryboardGenerator";
import { useBrands } from "../context/useBrands";
import type { User } from "../utils/userTypes";

interface Script {
  _id: string;
  title: string;
  createdAt: string;
  metadata?: {
    brand_name?: string;
    product?: string;
    adType?: string;
    imageUrl?: string;
    campaign?: {
      theme?: string;
      headline?: string;
    };
    [key: string]: unknown;
  };
  brand_name?: string;
  product?: string;
}

interface ScriptGroup {
  key: string;
  brand_name: string;
  product: string;
  scriptCount: number;
  latestDate: Date;
  preview: string;
  firstScriptId: string;
  latestScriptId: string;
  adType?: string;
  imageUrl?: string;
  campaignTheme?: string;
  // UGC-specific fields
  videoUrl?: string;
  thumbnailUrl?: string;
  selectedCharacter?: string;
}

interface Brand {
  name: string;
  products: string[];
  id: string;
}

const Dashboard: React.FC = () => {
  const [scripts, setScripts] = useState<Script[]>([]);
  const [scriptGroups, setScriptGroups] = useState<ScriptGroup[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  //const [selectedScriptId, setSelectedScriptId] = useState<string | null>(null);
  //const [showStoryboard, setShowStoryboard] = useState(false);
  // const [hasStoryboardAccess, setHasStoryboardAccess] = useState<
  //   boolean | null
  // >(null);
  //const [checkingAccess, setCheckingAccess] = useState(false);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [brandsLoading, setBrandsLoading] = useState(false);
  const [brandsError, setBrandsError] = useState<string | null>(null);
  const [sidebarRefreshTrigger, setSidebarRefreshTrigger] = useState(0);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isRefreshingCredits, setIsRefreshingCredits] = useState(false);
 // const [sortOption, setSortOption] = useState("newest");
  const location = useLocation();
  const navigate = useNavigate();
  const brandsContext = useBrands();

  const numberFormatter = useMemo(
    () => new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }),
    []
  );

  const fetchUserProfile = useCallback(async () => {
    if (typeof window === "undefined") {
      return;
    }

    const authToken = localStorage.getItem("token");
    if (!authToken) {
      setCurrentUser(null);
      return;
    }

    try {
      const response = await fetch(buildApiUrl("api/auth/me"), {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user profile");
      }

      const data: User = await response.json();
      localStorage.setItem("user", JSON.stringify(data));
      setCurrentUser(data);
    } catch (profileError) {
      console.error("Failed to refresh user profile:", profileError);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser) as User;
        setCurrentUser(parsed);
      } catch {
        localStorage.removeItem("user");
      }
    }

    fetchUserProfile();
  }, [fetchUserProfile]);

  useEffect(() => {
    const handleWindowFocus = () => {
      fetchUserProfile();
    };

    window.addEventListener("focus", handleWindowFocus);
    return () => window.removeEventListener("focus", handleWindowFocus);
  }, [fetchUserProfile]);

  const handleRefreshCredits = useCallback(async () => {
    setIsRefreshingCredits(true);
    try {
      await fetchUserProfile();
    } finally {
      setIsRefreshingCredits(false);
    }
  }, [fetchUserProfile]);

  const creditsSummary = currentUser?.credits;
  const creditBalance = creditsSummary?.balance ?? 0;
  const lifetimeGranted = creditsSummary?.lifetimeGranted ?? 0;
  const lifetimeSpent = creditsSummary?.lifetimeSpent ?? 0;
  const formattedBalance = numberFormatter.format(Math.max(0, Math.round(creditBalance)));
  const formattedLifetimeGranted = numberFormatter.format(
    Math.max(0, Math.round(lifetimeGranted))
  );
  const formattedLifetimeSpent = numberFormatter.format(
    Math.max(0, Math.round(lifetimeSpent))
  );
  const lastUpdatedDisplay = creditsSummary?.lastUpdated
    ? new Date(creditsSummary.lastUpdated).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "Awaiting first grant";
  const recentEvent = creditsSummary?.mostRecentEvent || null;
  const recentEventTimestamp = recentEvent?.createdAt
    ? new Date(recentEvent.createdAt).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : null;

  const formatEventAmount = (amount?: number) => {
    if (typeof amount !== "number" || Number.isNaN(amount)) {
      return "0";
    }
    const sign = amount > 0 ? "+" : "";
    return `${sign}${numberFormatter.format(Math.round(amount))}`;
  };

  const formatEventLabel = (event?: string) => {
    if (!event) {
      return "Latest activity";
    }

    return event
      .split("_")
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  };

  // Helper function to extract brand and product information from scripts
  const extractBrandsFromScripts = useCallback(
    (scripts: Script[]) => {
      setBrandsLoading(true);
      try {
        const brandsMap = new Map<string, Brand>();

        scripts.forEach((script) => {
          const brandName =
            script.brand_name ||
            (script.metadata?.brand_name as string) ||
            "Unknown Brand";
          const product =
            script.product ||
            (script.metadata?.product as string) ||
            "Unknown Product";

          if (!brandsMap.has(brandName)) {
            // Create new brand with this product
            brandsMap.set(brandName, {
              name: brandName,
              products: [product],
              id: brandName.toLowerCase().replace(/\s+/g, "-"),
            });
          } else {
            // Add product to existing brand if it's not already in the list
            const brand = brandsMap.get(brandName)!;
            if (!brand.products.includes(product)) {
              brand.products.push(product);
            }
          }
        });

        // Convert map to array
        const brandsArray = Array.from(brandsMap.values());
        setBrands(brandsArray);

        // Update the global context if the data has changed
        if (
          JSON.stringify(brandsArray) !== JSON.stringify(brandsContext.brands)
        ) {
          brandsContext.updateBrands(brandsArray);
        }

        setBrandsError(null);
      } catch (error) {
        console.error("Error extracting brands from scripts:", error);
        setBrandsError("Failed to process brand information");
      } finally {
        setBrandsLoading(false);
      }
    },
    [brandsContext]
  );

  // Fetch scripts function defined with useCallback for memoization
  const fetchScripts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication required");
        return;
      }

      // Fetch unified data from scripts endpoint (includes both regular scripts and UGC ads)
      const response = await fetch(buildApiUrl("api/scripts"), {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

  const result = await response.json();
  const allData = (result.success ? result.data : result) as Script[];

      console.log('📊 Unified data fetched from scripts endpoint:', allData.length, 'items');

      // Sort by creation date (newest first)
      const sortedScripts = allData.sort(
        (a: Script, b: Script) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      // Debug UGC videos
      const ugcScripts = sortedScripts.filter((script: Script) => script.metadata?.adType === 'ugc');
      console.log('🎬 UGC Videos in dashboard data:', ugcScripts.map((script: Script) => ({
        id: script._id,
        product: script.metadata?.product,
        hasVideoUrl: !!script.metadata?.videoUrl,
        videoUrl: script.metadata?.videoUrl,
        status: script.metadata?.status
      })));

      setScripts(sortedScripts || []);
    } catch (error) {
      console.error("Error fetching scripts:", error);
      setError("Failed to load scripts. Please try again.");
      // Fallback to sample data for demo
      const sampleScripts = [
        {
          _id: "1",
          title: "Ayush Wellness Script",
          createdAt: "2025-07-30",
          metadata: {
            brand_name: "Ayush Wellness",
            product: "Herbal Supplement",
          },
        },
        {
          _id: "2",
          title: "DNA Consulting Script",
          createdAt: "2025-07-29",
          metadata: {
            brand_name: "DNA Consulting",
            product: "Business Advisory",
          },
        },
        {
          _id: "3",
          title: "Pawblaze.in Script",
          createdAt: "2025-07-28",
          metadata: {
            brand_name: "Pawblaze",
            product: "Pet Food",
          },
        },
      ];
      setScripts(sampleScripts as Script[]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check if user has access to storyboard generation
  // const checkStoryboardAccess = useCallback(async () => {
  //   setCheckingAccess(true);
  //   try {
  //     const token = localStorage.getItem("token");
  //     if (!token) {
  //       setHasStoryboardAccess(false);
  //       return;
  //     }

  //     const response = await fetch(buildApiUrl("api/storyboard/status"), {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     });

  //     if (!response.ok) {
  //       setHasStoryboardAccess(false);
  //       return;
  //     }

  //     const data = await response.json();
  //     setHasStoryboardAccess(data.storyboardAccess || false);
  //   } catch (error) {
  //     console.error("Error checking storyboard access:", error);
  //     setHasStoryboardAccess(false);
  //   } finally {
  //     setCheckingAccess(false);
  //   }
  // }, []);

  useEffect(() => {
    const hash = location.hash;
    if (hash) {
      // Wait for the page to fully render
      setTimeout(() => {
        const element = document.querySelector(hash) as HTMLElement;

        if (element) {
          element.scrollIntoView({ behavior: "smooth" });

          if ("focus" in element) {
            (element as HTMLInputElement).focus();
          }
        }
      }, 200); // small delay ensures element exists
    }
  }, [location]);

  // Fetch scripts on component mount
  useEffect(() => {
    fetchScripts();
   
  }, [fetchScripts]);

  // Extract brands from scripts when scripts change
  useEffect(() => {
    if (scripts.length > 0 && !brandsLoading) {
      extractBrandsFromScripts(scripts);
    }
  }, [scripts, brandsLoading, extractBrandsFromScripts]);

  // Group scripts by brand_name + product
  useEffect(() => {
    if (scripts.length === 0) return;

    const groups = new Map<string, ScriptGroup>();

    scripts.forEach((script) => {
      const brand_name =
        script.brand_name ||
        (script.metadata?.brand_name as string) ||
        "Unknown Brand";
      const product =
        script.product ||
        (script.metadata?.product as string) ||
        "Unknown Product";
      const key = `${brand_name}-${product}`;

      const scriptDate = new Date(script.createdAt);

      if (!groups.has(key)) {
        // Create new group
        groups.set(key, {
          key,
          brand_name,
          product,
          scriptCount: 1,
          latestDate: scriptDate,
          preview: "/api/placeholder/150/100",
          firstScriptId: script._id,
          latestScriptId: script._id,
          adType: script.metadata?.adType as string,
          imageUrl: (script.metadata?.imageUrl as string) || 
                   (Array.isArray(script.metadata?.allImageUrls) && script.metadata.allImageUrls.length > 0 
                    ? script.metadata.allImageUrls[0] as string 
                    : undefined),
          campaignTheme: script.metadata?.campaign?.theme as string,
          // UGC-specific fields
          videoUrl: script.metadata?.videoUrl as string,
          thumbnailUrl: script.metadata?.thumbnailUrl as string,
          selectedCharacter: script.metadata?.selectedCharacter as string,
        });
      } else {
        // Update existing group
        const group = groups.get(key)!;
        group.scriptCount += 1;

        // Update latest script if this one is newer
        if (scriptDate > group.latestDate) {
          group.latestDate = scriptDate;
          group.latestScriptId = script._id;
          group.adType = script.metadata?.adType as string;
          group.imageUrl = (script.metadata?.imageUrl as string) || 
                          (Array.isArray(script.metadata?.allImageUrls) && script.metadata.allImageUrls.length > 0 
                           ? script.metadata.allImageUrls[0] as string 
                           : undefined);
          group.campaignTheme = script.metadata?.campaign?.theme as string;
          // UGC-specific fields
          group.videoUrl = script.metadata?.videoUrl as string;
          group.thumbnailUrl = script.metadata?.thumbnailUrl as string;
          group.selectedCharacter = script.metadata?.selectedCharacter as string;
        }
      }
    });

    // Convert Map to array and sort by latest date
    const groupsArray = Array.from(groups.values());

    // Sort based on the current sort option
    const sortedArray = [...groupsArray];
    
    setScriptGroups(sortedArray);
  }, [scripts]);

  // Handle storyboard generation button click
  // const handleStoryboardGeneration = (scriptId: string) => {
  //   if (hasStoryboardAccess) {
  //     setSelectedScriptId(scriptId);
  //     setShowStoryboard(true);
  //   } else if (hasStoryboardAccess === false) {
  //     // Redirect to subscription page or show a modal
  //     const confirmUpgrade = window.confirm(
  //       "Storyboard generation requires an Individual or Organization plan. Would you like to upgrade your subscription?"
  //     );

  //     if (confirmUpgrade) {
  //       window.location.href = "/subscription";
  //     }
  //   } else {
  //     // Still checking access
  //     alert("Please wait, checking subscription status...");
  //   }
  // };

  const filteredGroups = scriptGroups.filter(
    (group) =>
      group.brand_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.product.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // No need for a separate fetchBrands function anymore

  // Handle script deletion

  return (
    <div className="flex flex-col md:flex-row h-screen bg-white">
      {/* Mobile Header - Only visible on mobile */}
      <div className="md:hidden bg-white text-black p-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-purple-500">Leepi AI</h1>
        <button
          onClick={() => setShowMobileSidebar((prev) => !prev)}
          className="text-[#474747] focus:outline-none"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Sidebar - Conditionally shown on mobile */}
      <div
        className={`${
          showMobileSidebar ? "block" : "hidden"
        } md:block fixed inset-0 z-40 md:relative md:z-0 md:w-65`}
      >
        {showMobileSidebar && (
          <div
            className="absolute inset-0 bg-black opacity-50 md:hidden"
            onClick={() => setShowMobileSidebar(false)}
          ></div>
        )}
        <div className="relative h-full rounded-2xl border border-gray-300 overflow-hidden z-10 mt-2 mb-2 ml-2">
          <Sidebar
            brandsData={brands}
            brandsLoading={brandsLoading}
            brandsError={brandsError}
            refreshTrigger={sidebarRefreshTrigger}
            onCloseMobile={() => setShowMobileSidebar(false)}
            source="dashboard"
          />
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Regular header - Hidden on mobile */}
        <div className="hidden md:block">
          <Header />
        </div>

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-white p-3 md:p-6">
          {/* Subscription Banner */}
          <SubscriptionBanner />

          {currentUser && (
            <section className="mt-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 rounded-2xl border border-purple-100 bg-gradient-to-r from-purple-600 via-purple-500 to-blue-500 text-white p-6 shadow-md relative overflow-hidden">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-white/70">
                        Available Credits
                      </p>
                      <p className="mt-2 text-4xl font-bold">{formattedBalance}</p>
                      <p className="mt-3 text-xs text-white/80">
                        Last updated: {lastUpdatedDisplay}
                      </p>
                    </div>
                    <div className="hidden md:flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
                      <Coins className="h-9 w-9 text-white" />
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-white/70">Lifetime granted</p>
                      <p className="mt-1 text-lg font-semibold text-white">
                        {formattedLifetimeGranted}
                      </p>
                    </div>
                    <div>
                      <p className="text-white/70">Lifetime spent</p>
                      <p className="mt-1 text-lg font-semibold text-white">
                        {formattedLifetimeSpent}
                      </p>
                    </div>
                  </div>

                  <p className="mt-6 text-xs text-white/75">
                    Need more credits? Your subscription automatically adds fresh credits every billing cycle. Top up anytime from the subscription page.
                  </p>
                </div>

                <div className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-3">Recent activity</p>
                    {recentEvent ? (
                      <div>
                        <p
                          className={`text-2xl font-bold ${
                            (recentEvent.amount ?? 0) < 0
                              ? "text-rose-600"
                              : "text-emerald-600"
                          }`}
                        >
                          {formatEventAmount(recentEvent.amount)}
                        </p>
                        <p className="text-xs uppercase tracking-wide text-gray-400 mt-1">
                          {formatEventLabel(recentEvent.event)}
                        </p>
                        {recentEvent.description && (
                          <p className="mt-2 text-sm text-gray-600">
                            {recentEvent.description}
                          </p>
                        )}
                        {recentEvent.feature && (
                          <p className="mt-1 text-xs text-gray-500">
                            Feature: {recentEvent.feature}
                          </p>
                        )}
                        {recentEventTimestamp && (
                          <p className="mt-2 text-xs text-gray-400">
                            {recentEventTimestamp}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">
                        You haven’t used any credits yet. Generate a script, storyboard, or ad asset to log your first activity.
                      </p>
                    )}
                  </div>

                  <div className="mt-4 space-y-2">
                    <button
                      onClick={() => navigate("/subscription")}
                      className="w-full inline-flex items-center justify-center rounded-lg bg-purple-600 py-2 text-sm font-semibold text-white transition-colors hover:bg-purple-700"
                    >
                      Manage credits
                    </button>
                    <button
                      onClick={handleRefreshCredits}
                      disabled={isRefreshingCredits}
                      className="w-full inline-flex items-center justify-center rounded-lg border border-gray-200 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isRefreshingCredits ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating…
                        </>
                      ) : (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Refresh balance
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </section>
          )}

          {filteredGroups.length !== 0 && (
            <>
              {/* Search bar - Make responsive */}
              <div className="mb-6">
                <div className="flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-4">
                  <div className="relative flex-grow">
                    <input
                      id="search-input"
                      type="text"
                      placeholder="Search scripts..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    />
                    <Search
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => navigate("/ad-type-selector")}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center transition-colors"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      <span className="hidden md:inline">Create Ad</span>
                      <span className="md:hidden">Create Ad</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600">{error}</p>
                </div>
              )}
            </>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
              <span className="ml-2 text-gray-600">Loading campaigns...</span>
            </div>
          )}

          {/* Script Groups Grid */}
          {!isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredGroups.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <div className="w-45 items-center justify-center mx-auto mb-4">
                    <h1 className="text-3xl font-bold text-[#474747] ">
                      Start With Giving Us <br />
                      Your Product Info
                    </h1>
                  </div>

                  <div></div>
                  {!searchTerm && (
                    <Link
                      to="/ad-type-selector"
                      className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purplr-700 hover:to-pink-700 transition-all duration-300"
                    >
                      <FolderPlus className="w-4 h-4 mr-2" />
                      Create New Ad
                    </Link>
                  )}

                  <div className="w-45 h-40 flex flex-col items-center justify-center mx-auto">
                    <h1 className="text-lg font-medium text-[#474747] text-center">
                      One Time Effort,Just Answer A Few Questions
                      <br />
                      About Your Product. Takes Only 15 Minutes
                    </h1>
                  </div>
                </div>
              ) : (
                filteredGroups.map((group) => (
                  <div
                    key={group.key}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
                  >
                    {group.adType === 'image' || group.adType === 'image_campaign_15' ? (
                      // Image Ad Layout - Click to view image ad details
                      <div 
                        className="block p-4 cursor-pointer"
                        onClick={() => navigate(`/image-ads/view/${group.latestScriptId}`)}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {group.brand_name}
                          </h3>
                          <div className="flex items-center gap-2">
                            <div className="bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded-full">
                              {group.adType === 'image_campaign_15' ? '🎯 Complete Campaign' : '🎨 Image Ad'}
                            </div>
                            <div className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-0.5 rounded-full">
                              {group.adType === 'image_campaign_15' 
                                ? '15 Images' 
                                : `${group.scriptCount} ${group.scriptCount === 1 ? "Ad" : "Ads"}`
                              }
                            </div>
                          </div>
                        </div>

                        {/* Product Info */}
                        <div className="mb-3">
                          <p className="text-sm text-blue-600 font-medium">
                            📦 {group.product}
                          </p>
                          {group.campaignTheme && (
                            <p className="text-xs text-gray-500 italic">
                              Theme: {group.campaignTheme}
                            </p>
                          )}
                        </div>

                        {/* Generated Image Display */}
                        <div className="justify-center text-center flex items-center bg-gray-50 rounded-lg p-3 mb-3">
                          {group.imageUrl ? (
                            <img
                              src={group.imageUrl}
                              alt="Generated Ad"
                              className="w-32 h-24 object-cover rounded-md shadow-sm"
                            />
                          ) : (
                            <div className="w-32 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-md flex items-center justify-center">
                              <span className="text-xs text-gray-500">
                                {group.adType === 'image_campaign_15' ? 'Campaign' : 'Image Ad'}
                              </span>
                            </div>
                          )}
                        </div>

                        <p className="text-sm text-gray-500">
                          Updated{" "}
                          {new Date(group.latestDate).toLocaleDateString()}
                        </p>
                      </div>
                    ) : group.adType === 'ugc' ? (
                      // UGC Ad Layout - Click to view UGC ad details
                      <div 
                        className="block p-4 cursor-pointer"
                        onClick={() => {
                          console.log('🎬 UGC card clicked:', {
                            key: group.key,
                            product: group.product,
                            hasVideoUrl: !!group.videoUrl,
                            videoUrl: group.videoUrl,
                            hasImageUrl: !!group.imageUrl,
                            imageUrl: group.imageUrl
                          });
                          navigate(`/ugc-ads/${group.latestScriptId}/video-generation`);
                        }}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {group.brand_name}
                          </h3>
                          <div className="flex items-center gap-2">
                            <div className="bg-orange-100 text-orange-800 text-xs font-medium px-2 py-0.5 rounded-full">
                              🎬 UGC Video
                            </div>
                            <div className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-0.5 rounded-full">
                              {group.scriptCount}{" "}
                              {group.scriptCount === 1 ? "Video" : "Videos"}
                            </div>
                          </div>
                        </div>

                        {/* Product Info */}
                        <div className="mb-3">
                          <p className="text-sm text-blue-600 font-medium">
                            📦 {group.product}
                          </p>
                          {group.selectedCharacter && (
                            <p className="text-xs text-gray-500 italic">
                              Character: {group.selectedCharacter}
                            </p>
                          )}
                        </div>

                        {/* Generated Video/Image Display */}
                        <div className="justify-center text-center flex items-center bg-gray-50 rounded-lg p-3 mb-3">
                          {group.videoUrl ? (
                            <video
                              src={group.videoUrl.startsWith('http') ? group.videoUrl : buildApiUrl(group.videoUrl)}
                              className="w-32 h-24 object-cover rounded-md shadow-sm"
                              controls={false}
                              muted
                              poster={group.thumbnailUrl ? (group.thumbnailUrl.startsWith('http') ? group.thumbnailUrl : buildApiUrl(group.thumbnailUrl)) : undefined}
                            />
                          ) : group.imageUrl ? (
                            <img
                              src={group.imageUrl.startsWith('http') ? group.imageUrl : buildApiUrl(group.imageUrl)}
                              alt="Generated UGC"
                              className="w-32 h-24 object-cover rounded-md shadow-sm"
                            />
                          ) : (
                            <div className="w-32 h-24 bg-gradient-to-br from-orange-100 to-red-100 rounded-md flex items-center justify-center">
                              <span className="text-xs text-gray-500">UGC Video</span>
                            </div>
                          )}
                        </div>

                        <p className="text-sm text-gray-500">
                          Updated{" "}
                          {new Date(group.latestDate).toLocaleDateString()}
                        </p>
                      </div>
                    ) : (
                      // Regular Video Script Layout - Navigate to ScriptGroup
                      <Link
                        to={`/script-group/${encodeURIComponent(
                          group.brand_name
                        )}/${encodeURIComponent(group.product)}/${
                          group.latestScriptId
                        }`}
                        className="block p-4"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {group.brand_name}
                          </h3>
                          <div className="flex items-center gap-2">
                            <div className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full">
                              🎬 Video Script
                            </div>
                            <div className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-0.5 rounded-full">
                              {group.scriptCount}{" "}
                              {group.scriptCount === 1 ? "Script" : "Scripts"}
                            </div>
                          </div>
                        </div>

                        {/* Product Info */}
                        <div className="mb-3">
                          <p className="text-sm text-blue-600 font-medium">
                            📦 {group.product}
                          </p>
                        </div>

                        <div className="justify-center text-center flex items-center bg-white rounded-lg p-3 mb-3">
                          <img
                            src="https://png.pngtree.com/png-vector/20230412/ourmid/pngtree-script-writing-line-icon-vector-png-image_6703231.png"
                            alt="Script Icon"
                            className="w-32 items-center"
                          />
                        </div>

                        <p className="text-sm text-gray-500">
                          Updated{" "}
                          {new Date(group.latestDate).toLocaleDateString()}
                        </p>
                      </Link>
                    )}

                    {/* Action buttons */}
                    {/* <div className="px-4 py-3 border-t border-white flex justify-end space-x-2">
                      <button
                        onClick={() => handleStoryboardGeneration(group.latestScriptId)}
                        className="flex items-center px-3 py-1 text-xs bg-green-100 text-green-700 hover:bg-green-200 rounded-full transition-colors"
                        title="Generate storyboard"
                      >
                        <Video className="w-3 h-3 mr-1" />
                        Storyboard
                      </button>
                      
                    </div> */}
                  </div>
                ))
              )}
            </div>
          )}

          {/* Storyboard Modal */}
          {/* {showStoryboard && selectedScriptId && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center border-b p-4">
                  <h3 className="text-xl font-bold">Generate Storyboard</h3>
                  <button
                    onClick={() => setShowStoryboard(false)}
                    className="p-1 hover:bg-white rounded-full"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <div className="p-4">
                  <StoryboardGenerator scriptId={selectedScriptId} />
                </div>
              </div>
            </div>
          )} */}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
