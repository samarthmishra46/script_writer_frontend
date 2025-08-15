import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { User } from "lucide-react";
import Header from "../components/HeaderLanding";
import { Brandcompo } from "../components/BrandWorked";
import { NoCommit } from "../components/Nocommit";
import { TryButton } from "../components/TryButton";
import CompanyGrid from "../components/CompneyGrid";
import StickyFooter from "../components/StickeyFooter";
interface User {
  id: string;
  name: string;
  email: string;
  subscription?: {
    plan: string;
    status: string;
  };
}

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  // const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  // const [ripples, setRipples] = useState<
  //   Array<{ id: number; x: number; y: number; timestamp: number }>
  // >([]);
  const [user, setUser] = useState<User | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  //const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  // Load user data
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }
  }, []);

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        //setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Header */}
      <Header
        user={user}
        getUserFirstName={getUserFirstName}
        handleLogout={handleLogout}
      />

      {/* Hero Section */}
      <section className="relative z-10 py-1 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8 text-center">
            <div className="backdrop-blur  px-12 py-1 rounded-lg">
              <div
                className="absolute -inset-4 rounded-lg opacity-80"
                style={{
                  background:
                    "linear-gradient(to right, #E1E7FB 0%, #F8EBEF 100%, #FAF3ED 100%)",
                  filter: "blur(30px)",
                }}
              ></div>
              <p className="relative font-lato text-lg sm:text-xl md:text-2xl  font-medium tracking-wide">
                Product Of
              </p>
              <img
                src="https://res.cloudinary.com/dvxqb1wge/image/upload/v1754980416/Yuvichaar_Funnels_1_g37b0q.png"
                alt="Yuvichaar Funnels Logo"
                className="relative mx-auto max-w-[210px] sm:max-w-[215px] md:max-w-[275px] h-auto "
              />
              <div className="relative inline-block">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-[#CB6CE6] to-[#2D65F5] bg-clip-text text-transparent mb-2 transition-all duration-300 hover:scale-105">
                  Leepi AI
                </h1>
              </div>
            </div>
          </div>

          <div className="mb-6 mt-9 mx-4">
            <h1 className="text-[clamp(1rem,4vw,2rem)] leading-[clamp(1.25rem,5vw,2.5rem)] font-bold text-gray-900">
              <div className="whitespace-nowrap block">
                Just One Winning Ad On Meta
              </div>
              <div className="whitespace-nowrap block mb-2">
                Can 3x Your Sales & ROAS!
              </div>
              <div className="whitespace-nowrap block">
                <span className="bg-gradient-to-r from-[#CB6CE6] to-[#2D65F5] bg-clip-text text-transparent">
                  Leepi AI
                </span>{" "}
                 Will Write Unlimited Such
              </div>
              
              <div className="whitespace-nowrap block">
                Ads To 3X Your ROAS (Guaranteed)
              </div>
            </h1>
          </div>
          
<div className="relative flex flex-col items-center text-center group mb-6 sm:mb-8 px-3 sm:px-4 ">
  <div className="inline-flex items-center px-6 py-2 bg-black text-white font-semibold rounded-xl text-sm sm:text-base md:text-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"> 
    100% Refund Guarantee

  </div>
 
</div>
          <div className="mb-6 inline-block rounded-lg bg-gradient-to-r from-[#1653F5] via-[#3CA8E3] via-[#BA63D3] via-[#FAAEA5] to-[#1449F9] p-[1px]">
            <div className="bg-white rounded-lg p-4">
              <img
                src="https://res.cloudinary.com/dvxqb1wge/image/upload/v1754980416/landingPage1_fjahft.png"
                alt="Storyboard and Final Ad Example"
                className="rounded-lg"
              />
            </div>
          </div>
          <TryButton />

         
        </div>
      </section>
      <NoCommit />

      {/* NEW: "Is Not Just A ChatGPT Wrapper" Section */}
      <section className="relative z-10 py-1 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-center mb-6">
            <div className="relative inline-block">
              <div className="relative inline-block">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-[#CB6CE6] to-[#2D65F5] bg-clip-text text-transparent  transition-all duration-300 hover:scale-105">
                  Leepi AI
                </h1>
              </div>
              <div className="absolute -inset-2 bg-gradient-to-r from-purple-600/20 to-pink-600/20 blur-xl opacity-0 hover:opacity-100 transition-opacity duration-500 rounded-lg"></div>
            </div>
            <div className="mb-2 mt-2 mx-4">
            <h1 className="text-[clamp(1rem,4vw,2rem)] leading-[clamp(1.25rem,5vw,2.5rem)] font-bold text-gray-900">
              <div className="whitespace-nowrap block">
                Is Not Just A ChatGPT 
              </div>
              <div className="whitespace-nowrap block ">
                Wrapper, Its Trained On 
              </div>
              
              <div className="whitespace-nowrap block">
                Rs.50Cr Of Meta Ad Spend
              </div>
              
            </h1>
          </div>

            <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
              It Understands
            </p>
          </div>

          <div className="space-y-4 mb-9">
            <div className="flex flex-wrap gap-2 justify-center">
              {["Copywriting", "Consumer psychology"].map(
                (tag, index) => (
                  <div
                    key={index}
                    className="p-[1.5px] rounded-full bg-gradient-to-br from-[#1653F5] via-[#3CA8E3] via-[#BA63D3] via-[#FAAEA5] to-[#1449F9]"
                  >
                    <div className="rounded-full px-2 py-2 bg-white text-center text-[10px] sm:text-base md:text-lg lg:text-xl text-[#4B4B4B] font-bold">
                      {tag}
                    </div>
                  </div>
                )
              )}
            </div>

            <div className="flex flex-wrap gap-2 justify-center">
              {["Creative Strategy", "Performance Marketing"].map(
                (tag, index) => (
                  <div
                    key={index}
                    className="p-[1.5px] rounded-full bg-gradient-to-br from-[#1653F5] via-[#3CA8E3] via-[#BA63D3] via-[#FAAEA5] to-[#1449F9]"
                  >
                    <div className="rounded-full px-2 py-2 bg-white text-center text-[10px] sm:text-base md:text-lg lg:text-xl text-[#4B4B4B] font-bold">
                      {tag}
                    </div>
                  </div>
                )
              )}
            </div>

            <div className="flex flex-wrap gap-2 justify-center">
              {["Meta Ads", "Storytelling"].map(
                (tag, index) => (
                  <div
                    key={index}
                    className="p-[1.5px] rounded-full bg-gradient-to-br from-[#1653F5] via-[#3CA8E3] via-[#BA63D3] via-[#FAAEA5] to-[#1449F9]"
                  >
                    <div className="rounded-full px-2 py-2 bg-white text-center text-[10px] sm:text-base md:text-lg lg:text-xl text-[#4B4B4B] font-bold">
                      {tag}
                    </div>
                  </div>
                )
              )}
            </div>

            
          </div>

          <TryButton />

          
        </div>
      </section>
      <NoCommit />

      {/* NEW: "Leepi AI Has Written & Ideated 1000+ Ads" Section */}
      <section class="relative z-10 py-16  px-1 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Title */}
          <div className="relative inline-block">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-[#CB6CE6] to-[#2D65F5] bg-clip-text text-transparent mb-2 transition-all duration-300 hover:scale-105">
              Leepi AI
            </h1>
          </div>

          {/* Subtitle */}
          <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-8 px-4">
            Has Written & Ideated 1000+ Ads For Dozens of Brands
          </h3>

          {/* Image */}
          <CompanyGrid />

          {/* CTA Button */}
          <TryButton />
        </div>
      </section>

      {/* NEW: "Ads Written by Leepi AI" Section */}
      <section className="relative z-10 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold">
              <span className="bg-gradient-to-r from-[#CB6CE6] to-[#2D65F5] bg-clip-text text-transparent">
                Ads Written by Leepi AI
              </span>
              <br />
              <span className="bg-gradient-to-r from-[#CB6CE6] to-[#2D65F5] bg-clip-text text-transparent">
                That Broke Meta Ads
              </span>
            </h2>
          </div>

          <Brandcompo
            brandname="Arabian Aroma"
            videadd="https://drive.google.com/file/d/1K_ekJGfkPtujOE2_9GVHmzVyNk2RI4Ik/preview"
            scriptadd="https://res.cloudinary.com/dvxqb1wge/image/upload/v1754980416/Screenshot_from_2025-08-10_02-32-43_umhnri.png"
            resultadd="https://res.cloudinary.com/dvxqb1wge/image/upload/v1754980416/Screenshot_from_2025-08-10_02-32-43_umhnri.png"
          />
          <br />
          <Brandcompo
            brandname="Arabian Aroma"
            videadd="https://drive.google.com/file/d/1K_ekJGfkPtujOE2_9GVHmzVyNk2RI4Ik/preview"
            scriptadd="https://res.cloudinary.com/dvxqb1wge/image/upload/v1754980416/Screenshot_from_2025-08-10_02-32-43_umhnri.png"
            resultadd="https://res.cloudinary.com/dvxqb1wge/image/upload/v1754980416/Screenshot_from_2025-08-10_02-32-43_umhnri.png"
          />
          <br />
          <Brandcompo
            brandname="Arabian Aroma"
            videadd="https://drive.google.com/file/d/1K_ekJGfkPtujOE2_9GVHmzVyNk2RI4Ik/preview"
            scriptadd="https://res.cloudinary.com/dvxqb1wge/image/upload/v1754980416/Screenshot_from_2025-08-10_02-32-43_umhnri.png"
            resultadd="https://res.cloudinary.com/dvxqb1wge/image/upload/v1754980416/Screenshot_from_2025-08-10_02-32-43_umhnri.png"
          />
        </div>
      </section>
      <NoCommit />
      {/* NEW: How Leepi AI Works */}
      <section className="relative z-10 py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              How Leepi AI Works
            </h3>
          </div>

          <div className="space-y-12">
            {/* Step 1 */}
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

            {/* Step 2 */}
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

            {/* Step 3 */}
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

          <TryButton />
        </div>
      </section>
      <NoCommit />
      {/* NEW: 100% Money Back Guarantee */}
      <section className="relative z-10 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
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

          <TryButton />
          <p className="relative group  text-center text-sm sm:text-sm px-2 leading-relaxed ml-10 mr-10">
            Generate Unlimited Winning Ad Scripts, If at least 3 ad scripts
            don’t work, 100% money back
          </p>
        </div>
      </section>

      <NoCommit />
      <StickyFooter/>
    </div>
  );
};

export default LandingPage;
