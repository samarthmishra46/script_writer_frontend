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
  Building2,
  Package,
  Image as ImageIcon,
  ChevronRight,
  Trash2,
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

interface SidebarBrand {
  name: string;
  products: string[];
  id: string;
}

// Brand from API
interface ApiBrand {
  _id: string;
  name: string;
  logo: string | null;
  initials: string;
  productCount: number;
  adCount: number;
  products: ApiProduct[];
  createdAt: string;
  updatedAt: string;
}

interface ApiProduct {
  _id: string;
  name: string;
  description: string;
  images: string[];
  primaryImage: string | null;
  category: string;
  targetAudience: string;
  usp: string;
}

const Dashboard: React.FC = () => {
  const [scripts, setScripts] = useState<Script[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);
  //const [selectedScriptId, setSelectedScriptId] = useState<string | null>(null);
  //const [showStoryboard, setShowStoryboard] = useState(false);
  // const [hasStoryboardAccess, setHasStoryboardAccess] = useState<
  //   boolean | null
  // >(null);
  //const [checkingAccess, setCheckingAccess] = useState(false);
  const [sidebarBrands, setSidebarBrands] = useState<SidebarBrand[]>([]);
  const [apiBrands, setApiBrands] = useState<ApiBrand[]>([]);
  const [brandsLoading, setBrandsLoading] = useState(false);
  const [brandsError, setBrandsError] = useState<string | null>(null);
  const [sidebarRefreshTrigger, setSidebarRefreshTrigger] = useState(0);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isRefreshingCredits, setIsRefreshingCredits] = useState(false);
  const [deletingBrandId, setDeletingBrandId] = useState<string | null>(null);
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

  // Fetch brands from /api/brands
  const fetchBrands = useCallback(async () => {
    setBrandsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return;
      }

      const response = await fetch(buildApiUrl("api/brands"), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch brands");
      }

      const result = await response.json();
      const brandsData = result.data || [];
      setApiBrands(brandsData);

      // Also update sidebar brands format
      const sidebarData = brandsData.map((b: ApiBrand) => ({
        name: b.name,
        products: b.products?.map((p: ApiProduct) => p.name) || [],
        id: b._id,
        logo: b.logo,
        productCount: b.productCount,
        adCount: b.adCount,
      }));
      setSidebarBrands(sidebarData);

      // Update context
      if (JSON.stringify(sidebarData) !== JSON.stringify(brandsContext.brands)) {
        brandsContext.updateBrands(sidebarData);
      }

      setBrandsError(null);
    } catch (error) {
      console.error("Error fetching brands:", error);
      setBrandsError("Failed to load brands");
    } finally {
      setBrandsLoading(false);
    }
  }, [brandsContext]);

  // Delete brand handler
  const handleDeleteBrand = useCallback(async (brandId: string, brandName: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation to brand page
    
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${brandName}"? This will also delete all associated products and ads. This action cannot be undone.`
    );
    
    if (!confirmDelete) return;
    
    setDeletingBrandId(brandId);
    
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication required");
        return;
      }
      
      const response = await fetch(buildApiUrl(`api/brands/${brandId}`), {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || "Failed to delete brand");
      }
      
      // Remove from local state
      setApiBrands(prev => prev.filter(b => b._id !== brandId));
      setSidebarBrands(prev => prev.filter(b => b.id !== brandId));
      
      // Update context
      brandsContext.updateBrands(sidebarBrands.filter(b => b.id !== brandId));
      
      // Trigger sidebar refresh
      setSidebarRefreshTrigger(prev => prev + 1);
      
    } catch (error) {
      console.error("Error deleting brand:", error);
      setError(error instanceof Error ? error.message : "Failed to delete brand");
    } finally {
      setDeletingBrandId(null);
    }
  }, [brandsContext, sidebarBrands]);

  // Helper function to extract brand and product information from scripts
  const extractBrandsFromScripts = useCallback(
    (scripts: Script[]) => {
      try {
        const brandsMap = new Map<string, SidebarBrand>();

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

        // Convert map to array - only used if API brands are empty
        const brandsArray = Array.from(brandsMap.values());
        
        // Only update if we don't have API brands
        if (apiBrands.length === 0) {
          setSidebarBrands(brandsArray);
          if (JSON.stringify(brandsArray) !== JSON.stringify(brandsContext.brands)) {
            brandsContext.updateBrands(brandsArray);
          }
        }
      } catch (error) {
        console.error("Error extracting brands from scripts:", error);
      }
    },
    [brandsContext, apiBrands.length]
  );

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

  // Fetch scripts and brands on component mount
  useEffect(() => {
   
    fetchBrands();
  }, [ fetchBrands]);

  // Extract brands from scripts when scripts change (fallback if API brands empty)
  useEffect(() => {
    if (scripts.length > 0 && apiBrands.length === 0) {
      extractBrandsFromScripts(scripts);
    }
  }, [scripts, apiBrands.length, extractBrandsFromScripts]);


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


  // Filter brands based on search term
  const filteredBrands = apiBrands.filter(
    (brand) =>
      brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      brand.products?.some((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
            brandsData={sidebarBrands}
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

          {/* Search bar - Make responsive */}
          <div className="mb-6">
            <div className="flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-4">
              <div className="relative flex-grow">
                <input
                  id="search-input"
                  type="text"
                  placeholder="Search brands..."
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
                  onClick={() => navigate("/create-campaign")}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 flex items-center transition-all duration-300"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  <span className="hidden md:inline">Create Campaign</span>
                  <span className="md:hidden">New</span>
                </button>
                <button
                  onClick={() => navigate("/brands")}
                  className="px-4 py-2 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 flex items-center transition-colors"
                >
                  <FolderPlus className="w-4 h-4 mr-1" />
                  <span className="hidden md:inline">My Brands</span>
                  <span className="md:hidden">Brands</span>
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

          {/* Loading State */}
          {(brandsLoading) && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
              <span className="ml-2 text-gray-600">Loading brands...</span>
            </div>
          )}

          {/* Brands Grid */}
          {!brandsLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredBrands.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <div className="w-20 h-20 mx-auto mb-6 bg-purple-100 rounded-full flex items-center justify-center">
                    <Building2 className="w-10 h-10 text-purple-600" />
                  </div>
                  <div className="w-45 items-center justify-center mx-auto mb-4">
                    <h1 className="text-3xl font-bold text-[#474747] ">
                      Start With Giving Us <br />
                      Your Product Info
                    </h1>
                  </div>

                  <div></div>
                  {!searchTerm && (
                    <Link
                      to="/create-campaign"
                      className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
                    >
                      <FolderPlus className="w-4 h-4 mr-2" />
                      Create New Campaign
                    </Link>
                  )}

                  <div className="w-45 h-40 flex flex-col items-center justify-center mx-auto">
                    <h1 className="text-lg font-medium text-[#474747] text-center">
                      One Time Effort, Just Answer A Few Questions
                      <br />
                      About Your Product. Takes Only 15 Minutes
                    </h1>
                  </div>
                </div>
              ) : (
                filteredBrands.map((brand) => (
                  <div
                    key={brand._id}
                    className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all cursor-pointer group relative"
                    onClick={() => navigate(`/brands/${brand._id}`)}
                  >
                    {/* Delete Button - Shows on hover */}
                    <button
                      onClick={(e) => handleDeleteBrand(brand._id, brand.name, e)}
                      disabled={deletingBrandId === brand._id}
                      className="absolute top-3 right-3 p-2 bg-red-50 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-100 hover:text-red-600 transition-all duration-200 z-10 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Delete brand"
                    >
                      {deletingBrandId === brand._id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>

                    {/* Brand Header */}
                    <div className="flex items-center gap-4 mb-4">
                      {brand.logo ? (
                        <img
                          src={brand.logo}
                          alt={brand.name}
                          className="w-14 h-14 rounded-xl object-contain border border-gray-200"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                          <span className="text-white text-lg font-bold">{brand.initials}</span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">{brand.name}</h3>
                        <p className="text-sm text-gray-500">
                          {new Date(brand.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-500 transition-colors" />
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 rounded-lg">
                        <Package className="w-4 h-4 text-purple-500" />
                        <span className="text-sm font-medium text-purple-700">
                          {brand.productCount} {brand.productCount === 1 ? 'Product' : 'Products'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg">
                        <ImageIcon className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-medium text-blue-700">
                          {brand.adCount} {brand.adCount === 1 ? 'Ad' : 'Ads'}
                        </span>
                      </div>
                    </div>

                    {/* Products Preview */}
                    {brand.products && brand.products.length > 0 && (
                      <div className="border-t border-gray-100 pt-3">
                        <p className="text-xs text-gray-500 mb-2">Products:</p>
                        <div className="flex flex-wrap gap-1">
                          {brand.products.slice(0, 3).map((product) => (
                            <span 
                              key={product._id} 
                              className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full"
                            >
                              {product.name}
                            </span>
                          ))}
                          {brand.products.length > 3 && (
                            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-500 rounded-full">
                              +{brand.products.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
