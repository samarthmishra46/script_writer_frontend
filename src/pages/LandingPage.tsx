import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/HeaderLanding";
import { Brandcompo } from "../components/BrandWorked";
import { NoCommit } from "../components/Nocommit";
import { TryButton } from "../components/TryButton";
import CompanyGrid from "../components/CompneyGrid";
import StickyFooter from "../components/StickeyFooter";
import { VideoRunning } from "../components/RunningVideoLtoR";

interface UserData {
  name: string;
  email: string;
  
}

interface ScriptResponse {
  isActive?: boolean;
  plan: string;
  activatedDate: Date;
  nextBillingDate: Date;
  status?: string;
  message?: string;
}

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Function to get user from localStorage
  const getUserFromLocalStorage = (): UserData | null => {
    try {
      const userString = localStorage.getItem("user");
      const token = localStorage.getItem("token");
      
      if (userString && token) {
        const parsedUser: Partial<UserData> = JSON.parse(userString);
        
        // Check if we have valid user data (name and email)
        if (parsedUser.name && parsedUser.email) {
          return {
            name: parsedUser.name,
            email: parsedUser.email,
            ...parsedUser,
          };
        }
      }
    } catch (err) {
      console.error("Error parsing user data from localStorage:", err);
      // Clear invalid user data
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    }
    
    // Return null if no valid user data found
    return null;
  };

  // Effect to check user and subscription status on every load
  useEffect(() => {
    // Function to check subscription status
    const checkSubscription = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setIsLoading(false);
          return;
        }
        
        const response = await fetch('/api/subscription', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        });

        const data: ScriptResponse = await response.json();
        
        if (response.ok) {
          // Check if user has active individual or organization plan
          const hasActiveSubscription = (data.plan === 'individual' || data.plan === 'organization') && data.isActive;
          
          if (hasActiveSubscription) {
            navigate('/dashboard');
            return; // Exit early since we're redirecting
          }
        }
      } catch (error) {
        console.error('Error checking subscription:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const loadData = async () => {
      // First get user data
      const userData = getUserFromLocalStorage();
      setUser(userData);

      // Then check subscription
      await checkSubscription();
    };

    loadData();

    // Add storage event listener to handle changes from other tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token' || e.key === 'user') {
        loadData();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  const getUserFirstName = () => {
    if (user?.name) {
      return user.name.split(" ")[0];
    }
    return "User";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <span>
        <Header
          user={user}
          getUserFirstName={getUserFirstName}
          handleLogout={handleLogout}
        />
      </span>
      <section className="relative z-10 py-1 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8 text-center">
            <div className="backdrop-blur-sm  px-12 py-1 rounded-lg ">
              <p className="relative font-lato text-xs sm:text-xs md:text-md lg:text-lg font-semibold tracking-wide text-gray-800 m-0 leading-none">
                Product Of
              </p>
              <img
                src="https://yuvichaarfunnels.com/wp-content/uploads/2025/03/yuvichar-logo.svg"
                alt="Yuvichaar Funnels Logo"
                className="relative mx-auto max-w-[140px] sm:max-w-[215px] md:max-w-[275px] block m-0 leading-none mb-2"
              />

              <div className="relative inline-block">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#CB6CE6] to-[#2D65F5] bg-clip-text text-transparent transition-all duration-300 hover:scale-105">
                  Leepi AI
                </h1>
              </div>
            </div>
          </div>

          <div className="block max-[599px]:block min-[600px]:hidden mb-6 mt-9 mx-auto w-full max-w-[clamp(270px,90vw,600px)] px-2">
            <h1 className="text-[clamp(1.25rem,5vw,2.5rem)] leading-[clamp(1.5rem,5.5vw,3rem)] font-bold text-gray-900 text-center">
              <span className="whitespace-nowrap inline-block mx-auto">Just One Winning Ad</span>{" "}
              <span className="whitespace-nowrap inline-block mx-auto">On Meta</span>
              <span className="whitespace-nowrap inline-block mx-auto">Can 3x Your Sales & ROAS!</span>
              <span className="whitespace-nowrap inline-block mx-auto">
                <span className="bg-gradient-to-r from-[#CB6CE6] to-[#2D65F5] bg-clip-text text-transparent">Leepi AI</span>{" "}
                Will Write Unlimited Such
              </span>
              <span className="whitespace-nowrap inline-block mx-auto">Ads To 3X Your ROAS (Guaranteed)</span>
            </h1>
          </div>

          <div className="hidden min-[600px]:block mb-6 mt-9 mx-auto w-full px-2">
            <h1 className="text-[clamp(1.1rem,5vw,2.5rem)] leading-[clamp(1.4rem,5.5vw,3rem)] font-bold text-gray-900 text-center">
              <span className="whitespace-nowrap block">Just One Winning Ad On Meta</span>
              <span className="whitespace-nowrap block mb-2">Can 3x Your Sales & ROAS!</span>
              <span className="whitespace-nowrap block">
                <span className="bg-gradient-to-r from-[#CB6CE6] to-[#2D65F5] bg-clip-text text-transparent">Leepi AI</span>{" "}
                Will Write Unlimited Such
              </span>
              <span className="whitespace-nowrap block">Ads To 3X Your ROAS (Guaranteed)</span>
            </h1>
          </div>

          <div className="relative flex flex-col items-center text-center group mb-6 sm:mb-8 px-3 sm:px-4">
            <div className="inline-flex items-center min-w-[320px] justify-center  bg-black text-white font-semibold rounded-xl text-sm sm:text-base md:text-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
              100% Refund Guarantee
            </div>
          </div>

          <div className="mb-6 mx-auto scale-[1.01] 
                      w-full 
                      max-w-[700px] 
                      rounded-lg bg-gradient-to-r from-[#1653F5] via-[#3CA8E3] via-[#BA63D3] via-[#FAAEA5] to-[#1449F9] 
                      p-[1px] flex items-center justify-center">
            <div className="bg-white rounded-lg w-full h-auto">
              <img
                src="https://res.cloudinary.com/dvxqb1wge/image/upload/v1754980416/landingPage1_fjahft.png"
                alt="Storyboard and Final Ad Example"
                className="rounded-lg w-full h-auto object-contain"
              />
            </div>
          </div>

          <TryButton
          user={user} />
        </div>
      </section>
      <NoCommit />

      <section className="relative z-10 py-1 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-center mb-4">
            <div className="relative inline-block">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#CB6CE6] to-[#2D65F5] bg-clip-text text-transparent transition-all duration-300 hover:scale-105">
                Leepi AI
              </h1>
              <div className="absolute -inset-2 bg-gradient-to-r from-purple-600/20 to-pink-600/20 blur-xl opacity-0 hover:opacity-100 transition-opacity duration-500 rounded-lg"></div>
            </div>

            <div className="mb-2 mt-2 mx-auto w-full max-w-[clamp(270px,80vw,500px)] px-2">
              <h1 className="text-[clamp(1.25rem,5vw,2.5rem)] leading-[clamp(1.5rem,5.5vw,3rem)] font-bold text-gray-900 text-center">
                <div className="block">Is Not Just A ChatGPT</div>
                <div className="block">Wrapper, Its Trained On</div>
                <div className="block">Rs.50Cr Of Meta Ad Spend</div>
              </h1>
            </div>

            <p className="text-center text-[12px] sm:text-base md:text-xl font-medium text-gray-800">
              It Understands
            </p>
          </div>

          <div className="space-y-2 ">
            <div className="flex flex-wrap gap-2 justify-center">
              {["Copywriting", "Consumer psychology"].map((tag, index) => (
                <div
                  key={index}
                  className="p-[1px] rounded-full bg-gradient-to-br from-[#1653F5] via-[#3CA8E3] via-[#BA63D3] via-[#FAAEA5] to-[#1449F9]"
                >
                  <div className="rounded-full px-2 py-2 bg-white text-center text-[10px] sm:text-base md:text-lg lg:text-xl text-[#4B4B4B] font-medium">
                    {tag}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 justify-center">
              {["Creative Strategy", "Performance Marketing"].map(
                (tag, index) => (
                  <div
                    key={index}
                    className="p-[1px] rounded-full bg-gradient-to-br from-[#1653F5] via-[#3CA8E3] via-[#BA63D3] via-[#FAAEA5] to-[#1449F9]"
                  >
                    <div className="rounded-full px-2 py-2 bg-white text-center text-[10px] sm:text-base md:text-lg lg:text-xl text-[#4B4B4B] font-medium">
                      {tag}
                    </div>
                  </div>
                )
              )}
            </div>

            <div className="flex flex-wrap gap-2 justify-center">
              {["Meta Ads", "Storytelling"].map((tag, index) => (
                <div
                  key={index}
                  className="p-[1px] rounded-full bg-gradient-to-br from-[#1653F5] via-[#3CA8E3] via-[#BA63D3] via-[#FAAEA5] to-[#1449F9]"
                >
                  <div className="rounded-full px-2 py-2 bg-white text-center text-[10px] sm:text-base md:text-lg lg:text-xl text-[#4B4B4B] font-medium">
                    {tag}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p className="text-center text-[12px] sm:text-base md:text-xl font-medium text-gray-800 mt-4 mb-9">
            So That You Don't Have To!
          </p>

          <TryButton
          user={user} />
        </div>
      </section>
      <NoCommit />

      <section className="relative z-10 mt-4 py-4  px-1 lg:px-7">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative inline-block">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#CB6CE6] to-[#2D65F5] bg-clip-text text-transparent transition-all duration-300 hover:scale-105">
              Leepi AI
            </h1>
          </div>

          <div className="mb-2 mt-2 mx-auto w-full max-w-[clamp(270px,80vw,500px)] px-2">
            <h1 className="text-[clamp(1.25rem,5vw,2.5rem)] leading-[clamp(1.5rem,5.5vw,3rem)] font-bold text-gray-900 text-center">
              <span className="block">Has Written & Ideated 1000+</span>
              <span className="block">Ads For Dozens of Brands</span>
            </h1>
          </div>

          <p className="text-center text-[12px] sm:text-base md:text-xl font-medium text-gray-800 mt-4 ">
            Including VC Backed & Shark Tank Funded Companies
          </p>

          <CompanyGrid />

          <VideoRunning/>
          <br />
          <TryButton
          user={user} />
          
        </div>
      </section>
      <NoCommit />
              <div className="mb-10"></div>

      <section className="relative z-10  px-1 sm:px-4 md:px-8 lg:px-9">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#CB6CE6] to-[#2D65F5] bg-clip-text text-transparent">
              <span className="bg-gradient-to-r from-[#CB6CE6] to-[#2D65F5] bg-clip-text text-transparent">
                Ads Written by Leepi AI
              </span>
              <br />
              <span className="bg-gradient-to-r from-[#CB6CE6] to-[#2D65F5] bg-clip-text text-transparent">
                That Broke Meta Ads 
              </span>
            </h1>
            <span className="bg-yellow text-2xl md:text-4xl">👇🤯💸</span>
          </div>
          
          <Brandcompo
            brandname="Photojewels"
            videadd="https://res.cloudinary.com/dvxqb1wge/image/upload/v1755442431/photojewels_aojp4i.gif"
            scriptadd="https://res.cloudinary.com/dvxqb1wge/image/upload/v1755361770/Screenshot_from_2025-08-16_21-59-07_b0g8tl.png"
            resultadd="https://res.cloudinary.com/dvxqb1wge/image/upload/v1754980416/Screenshot_from_2025-08-10_02-32-43_umhnri.png"
          />
          
          <p className="mt-8 text-[15px] sm:text-base md:text-lg font-bold text-center italic text-gray-700 max-w-xl mx-auto">
            "It knows exactly which hooks work in which 
            <br />industries, what angles
            to use, what formats convert"
          </p>
          <br />
          <Brandcompo
            brandname="Fictales"
            videadd="https://res.cloudinary.com/dvxqb1wge/image/upload/v1755506027/fictales_rim5pq.gif"
            scriptadd="https://res.cloudinary.com/dvxqb1wge/image/upload/v1755362138/Screenshot_from_2025-08-16_22-05-18_kinkiv.png"
            resultadd="https://res.cloudinary.com/dvxqb1wge/image/upload/v1754980416/Screenshot_from_2025-08-10_02-32-43_umhnri.png"
          />
          <p className="mt-8 text-[15px] sm:text-base md:text-lg font-bold text-center italic text-gray-700 max-w-xl mx-auto">
            "This tool doesn't just write ad scripts. It reverse-engineers what makes ads perform"
          </p>
          <br />
          <Brandcompo
            brandname="Arabian Aroma"
            videadd="https://res.cloudinary.com/dvxqb1wge/image/upload/v1755359130/arabian_rogpzs.gif"
            scriptadd="https://res.cloudinary.com/dvxqb1wge/image/upload/v1754980416/Screenshot_from_2025-08-10_02-32-43_umhnri.png"
            resultadd="https://res.cloudinary.com/dvxqb1wge/image/upload/v1754980416/Screenshot_from_2025-08-10_02-32-43_umhnri.png"
          />
          <p className="mt-8 text-[15px] sm:text-base md:text-lg font-bold text-center italic text-gray-700 max-w-xl mx-auto">
            "Every script felt engineered to sell. My ROAS shot through the roof"
          </p>
          <br />
        </div>
        <TryButton 
        user={user}/>
      </section>

      <NoCommit />
      <section className="relative z-10 py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              How Leepi AI Works
            </h3>
          </div>

          <div className="space-y-12">
            <div className="flex flex-col md:flex-row items-start bg-white rounded-xl shadow-lg p-6 border border-purple-100">
              <div className="md:w-1/4 mb-4 md:mb-0">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-xl">
                  1
                </div>
              </div>
              <div className="md:w-3/4">
                <h4 className="text-xl font-semibold mb-2">
                  Step 1: Tell us about your product or offer
                </h4>
                <p className="text-gray-600 mb-4">
                  Provide details about your product, service, or offer. The
                  more details you provide, the better the results.
                </p>
                <div className="bg-gray-100 rounded-lg p-4">
                  <div className="h-12 bg-gray-200 rounded mb-2"></div>
                  <div className="h-8 w-20 bg-purple-500 rounded"></div>
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-start bg-white rounded-xl shadow-lg p-6 border border-purple-100">
              <div className="md:w-1/4 mb-4 md:mb-0">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-xl">
                  2
                </div>
              </div>
              <div className="md:w-3/4">
                <h4 className="text-xl font-semibold mb-2">
                  Step 2: That's it, simply wait for your ad scripts
                </h4>
                <p className="text-gray-600 mb-4">
                  Our AI generates high-converting ad scripts based on your
                  input and our database of successful ads.
                </p>
                <div className="grid grid-cols-4 gap-2">
                  <div className="h-6 bg-gray-200 rounded"></div>
                  <div className="h-6 bg-gray-200 rounded"></div>
                  <div className="h-6 bg-gray-200 rounded"></div>
                  <div className="h-6 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-start bg-white rounded-xl shadow-lg p-6 border border-purple-100">
              <div className="md:w-1/4 mb-4 md:mb-0">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-xl">
                  3
                </div>
              </div>
              <div className="md:w-3/4">
                <h4 className="text-xl font-semibold mb-2">
                  Step 3: Use the scripts in your ad campaigns
                </h4>
                <p className="text-gray-600 mb-4">
                  Copy the generated scripts directly into your Facebook or
                  Instagram ad campaigns and watch your conversions grow.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-24 bg-gray-100 rounded-lg"></div>
                  <div className="h-24 bg-gray-100 rounded-lg"></div>
                </div>
              </div>
            </div>
          </div>

          <TryButton 
          user={user}/>
        </div>
      </section>
      <NoCommit />
      
      <section className="relative z-10 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[#CB6CE6] to-[#2D65F5] bg-clip-text text-transparent">
              <span className="text-[#474747]">The</span> Promise
            </h1>
          </div>
          <div className="bg-[#3D353F] rounded-2xl shadow-2xl p-8 text-center relative overflow-hidden mb-6">
            <div className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2"></div>

            <h3 className="text-3xl font-bold text-white mb-6 relative z-10">
              100% Money Back Guarantee
            </h3>

            <div className="mb-8 relative z-10">
              <div className="w-42 h-42 mx-auto  rounded-full flex items-center justify-center ">
                <div className="text-center">
                  <img
                    src="https://res.cloudinary.com/dvxqb1wge/image/upload/v1754980416/image_90_ngk8ls.png"
                    alt=""
                  />
                </div>
              </div>
            </div>

            <p className="text-white text-lg mb-8 max-w-xl mx-auto relative z-10">
              "At least 3 of those scripts will be winners. Or you get your
              money back. No questions asked. Use the ideas with your in-house
              team, give them to a freelancer, or shoot it yourself. You now
              have a plug-and-play creative strategy that can change your
              business."
            </p>
          </div>

          <TryButton 
          user={user}/>
        </div>
      </section>
      
      <NoCommit/>
      <br />
      
      <section className="relative z-10 py-2 mb-20 px-1 lg:px-8">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <div className="relative inline-block">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#CB6CE6] to-[#2D65F5] bg-clip-text text-transparent transition-all duration-300 hover:scale-105">
              Leepi AI
            </h1>
          </div>

          <div className="mb-2 mt-2 mx-auto w-full max-w-[clamp(270px,80vw,500px)] px-2">
            <h1 className="text-[clamp(1.25rem,5vw,2.5rem)] leading-[clamp(1.5rem,5.5vw,3rem)] font-bold text-gray-900 text-center">
              <span className="block">Starting Today, You'll Never</span>
              <span className="block">Have To Worry About Meta</span>
              <span className="block">Ads Ever Again!</span>
            </h1>
          </div>
        </div>
        <TryButton 
        user={user}/>
         <p className="mt-4  text-[12px] sm:text-base md:text-lg font-bold text-center  text-gray-500 px-8 max-w-2xl mx-auto">
            Generate Unlimited Winning Ad Scripts. If at least 3 ad scripts
            don't work, 100% money back.
          </p>
      </section>

      <NoCommit />
      <StickyFooter 
      user={user}/>
    </div>
  );
};

export default LandingPage;