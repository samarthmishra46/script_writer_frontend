import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ChevronRight,
  Sparkles,
  Star,
  Zap,
  ChevronDown,
  User,
  LogOut,
  Home,
} from "lucide-react";
import Header from "../components/HeaderLanding";
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
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [ripples, setRipples] = useState<
    Array<{ id: number; x: number; y: number; timestamp: number }>
  >([]);
  const [user, setUser] = useState<User | null>(null);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
        setIsUserDropdownOpen(false);
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

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });

      // Create ripple effect on mouse move
      const newRipple = {
        id: Date.now() + Math.random(),
        x: e.clientX,
        y: e.clientY,
        timestamp: Date.now(),
      };

      setRipples((prev) => [...prev.slice(-5), newRipple]); // Keep only last 5 ripples
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Clean up old ripples
    const cleanup = setInterval(() => {
      setRipples((prev) =>
        prev.filter((ripple) => Date.now() - ripple.timestamp < 2000)
      );
    }, 100);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      clearInterval(cleanup);
    };
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Header */}
      <Header
        user={user}
        getUserFirstName={getUserFirstName}
        handleLogout={handleLogout}
      />

      {/* Hero Section */}
      <section className="relative z-10 py-11 px-4 sm:px-6 lg:px-8" >
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
                src="../../dist/assets/Yuvichar_Funnels_LOGO.png"
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

          <div className="mb-6 mt-9 mr-6 ml-6">
            <span className="block text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
              One Great Ad Can Change Everything
            </span>

            <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
              <span className="font-bold bg-gradient-to-r from-[#CB6CE6] to-[#2D65F5] bg-clip-text text-transparent transition-all duration-300 hover:scale-105 inline-block">
                Leepi AI
              </span>{" "}
              Gives You Unlimited Ad Scripts/ Hooks/ Ideas Trained On 50Cr. Of
              Meta Ad Spend
            </div>
          </div>
          <div>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto mb-8">
              Your Dream ROAS, Dream Revenue Milestone Might Just Be One Winning
              Ad Script Away!
            </p>
          </div>

          <div className="mb-6 inline-block rounded-lg bg-gradient-to-r from-[#1653F5] via-[#3CA8E3] via-[#BA63D3] via-[#FAAEA5] to-[#1449F9] p-[1px]">
            <div className="bg-white rounded-lg p-4">
              <img
                src="../../dist/assets/landingPage1.png"
                alt="Storyboard and Final Ad Example"
                className="rounded-lg"
              />
            </div>
          </div>
          <div className="relative group mb-4 text-base sm:text-lg px-2">
            <Link
              to="/login"
              className="relative inline-flex items-center px-6 py-3 bg-[#9F6AEA] text-white font-semibold rounded-lg text-sm sm:text-base md:text-lg"
            >
              <span className="flex items-center relative z-10 pointer-events-auto">
                Try For 30 Days At Just Rs.1999
                <ChevronRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          </div>

          <p className="relative group  text-base sm:text-lg px-2 leading-relaxed ml-10 mr-10">
            Generate Unlimited Winning Ad Scripts, If at least 3 ad scripts
            don’t work, 100% money back
          </p>
        </div>
      </section>
      <div className="relative overflow-hidden bg-[#E7E8F8] h-8 flex items-center">
        <div className="flex animate-marquee whitespace-nowrap">
          {/* First set */}
          {Array(4)
            .fill("No Commitments · Cancel Anytime")
            .map((text, i) => (
              <span key={`set1-${i}`} className="mx-8 text-xs font-medium">
                {text}
              </span>
            ))}

          {/* Duplicate set for seamless loop */}
          {Array(4)
            .fill("No Commitments · Cancel Anytime")
            .map((text, i) => (
              <span key={`set2-${i}`} className="mx-8 text-xs font-medium">
                {text}
              </span>
            ))}
        </div>
      </div>

      {/* NEW: "Is Not Just A ChatGPT Wrapper" Section */}
      <section className="relative z-10 py-11 px-4 sm:px-6 lg:px-8" >
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-center mb-6">
            <div className="relative inline-block">
              <div className="relative inline-block">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-[#CB6CE6] to-[#2D65F5] bg-clip-text text-transparent mb-2 transition-all duration-300 hover:scale-105">
                  Leepi AI
                </h1>
              </div>
              <div className="absolute -inset-2 bg-gradient-to-r from-purple-600/20 to-pink-600/20 blur-xl opacity-0 hover:opacity-100 transition-opacity duration-500 rounded-lg"></div>
            </div>
            <h3 className="px-2 text-3xl font-bold   text-center leading-snug">
              Is Not Just A ChatGPT Wrapper,
              <br />
              It's Trained On
              <br />
              Rs. 50Cr Of Meta Ad Spend
            </h3>

            <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
              It Understands
            </p>
          </div>

          <div className="space-y-4 mb-9">
            <div className="flex flex-wrap gap-4 justify-center">
              {["Copywriting", "Performance Marketing", "Video Ads"].map(
                (tag, index) => (
                  <div
                    key={index}
                    className="p-[1px] rounded-full bg-gradient-to-br from-[#1653F5] via-[#3CA8E3] via-[#BA63D3] via-[#FAAEA5] to-[#1449F9]"
                  >
                    <div className="rounded-full px-4 py-2 bg-white text-center text-l text-[#4B4B4B] font-medium">
                      {tag}
                    </div>
                  </div>
                )
              )}
            </div>

            <div className="flex flex-wrap gap-4 justify-center">
              {["Conversion Optimization", "Creative Strategy"].map(
                (tag, index) => (
                  <div
                    key={index}
                    className="p-[1px] rounded-full bg-gradient-to-br from-[#1653F5] via-[#3CA8E3] via-[#BA63D3] via-[#FAAEA5] to-[#1449F9]"
                  >
                    <div className="rounded-full px-4 py-2 bg-white text-center text-l text-[#4B4B4B] font-medium">
                      {tag}
                    </div>
                  </div>
                )
              )}
            </div>

            <div className="flex flex-wrap gap-4 justify-center">
              {["Brand Storytelling", "Ad Angles", "Hook Ideas"].map(
                (tag, index) => (
                  <div
                    key={index}
                    className="p-[1px] rounded-full bg-gradient-to-br from-[#1653F5] via-[#3CA8E3] via-[#BA63D3] via-[#FAAEA5] to-[#1449F9]"
                  >
                    <div className="rounded-full px-4 py-2 bg-white text-center text-l text-[#4B4B4B] font-medium">
                      {tag}
                    </div>
                  </div>
                )
              )}
            </div>

            <div className="flex flex-wrap gap-4 justify-center">
              {["Consumer psychology"].map((tag, index) => (
                <div
                  key={index}
                  className="p-[1px] rounded-full bg-gradient-to-br from-[#1653F5] via-[#3CA8E3] via-[#BA63D3] via-[#FAAEA5] to-[#1449F9]"
                >
                  <div className="rounded-full px-4 py-2 bg-white text-center text-l text-[#4B4B4B] font-medium">
                    {tag}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative group mb-4 text-base sm:text-lg px-2">
            <Link
              to="/login"
              className="relative inline-flex items-center px-6 py-3 bg-[#9F6AEA] text-white font-semibold rounded-lg text-sm sm:text-base md:text-lg"
            >
              <span className="flex items-center relative z-10 pointer-events-auto">
                Try For 30 Days At Just Rs.1999
                <ChevronRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          </div>

          <p className="relative group  text-base sm:text-lg px-2 leading-relaxed ml-10 mr-10">
            Generate Unlimited Winning Ad Scripts, If at least 3 ad scripts
            don’t work, 100% money back
          </p>
           
        </div>
      </section>
      <div className="relative overflow-hidden bg-[#E7E8F8] h-8 flex items-center">
        <div className="flex animate-marquee whitespace-nowrap">
          {/* First set */}
          {Array(4)
            .fill("No Commitments · Cancel Anytime")
            .map((text, i) => (
              <span key={`set1-${i}`} className="mx-8 text-xs font-medium">
                {text}
              </span>
            ))}

          {/* Duplicate set for seamless loop */}
          {Array(4)
            .fill("No Commitments · Cancel Anytime")
            .map((text, i) => (
              <span key={`set2-${i}`} className="mx-8 text-xs font-medium">
                {text}
              </span>
            ))}
        </div>
      </div>

      {/* NEW: "Leepi AI Has Written & Ideated 1000+ Ads" Section */}
<section className="relative z-10 py-11 px-4 sm:px-6 lg:px-8">
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
    <div className="flex justify-center mb-8">
      <img
        src="../../dist/assets/image 274 (1).png"
        alt="Leepi AI Ads Example"
        className="w-full max-w-[700px] h-auto"
      />
    </div>

    {/* CTA Button */}
    <div className="relative group mb-4 text-sm sm:text-base px-2">
      <Link
        to="/login"
        className="relative inline-flex items-center px-5 py-2.5 sm:px-6 sm:py-3 bg-[#9F6AEA] text-white font-semibold rounded-lg text-sm sm:text-base md:text-lg"
      >
        <span className="flex items-center relative z-10 pointer-events-auto">
          Try For 30 Days At Just Rs.1999
          <ChevronRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
        </span>
      </Link>
    </div>
    
  </div>
</section>


      {/* NEW: "Ads Written by Leepi AI" Section */}
    <section className="relative z-10 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold">
            <span className="bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
              Ads Written by Leepi AI{" "}
            </span>
            <span className="text-gray-700">That Broke Meta Ads</span>
          </h2>
        </div>

        {/* Card with gradient border */}
        <div className="bg-gradient-to-br from-[#1653F5] via-[#3CA8E3] via-[#BA63D3] via-[#FAAEA5] to-[#1449F9] p-[2px] rounded-xl shadow-lg">
          <div className="bg-white rounded-xl p-6 sm:p-8">
            {/* Brand */}
            <div className="text-center mb-6">
              <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Brand: Arabian Aroma
              </h3>
            </div>

            <div className="flex gap-4 justify-center items-start flex-wrap sm:flex-nowrap">
  {/* Final Ad */}
  <div className="flex flex-col items-center gap-2 w-1/3 max-w-[120px] sm:max-w-[180px] md:max-w-[220px]">
    <h4 className="text-xs sm:text-sm md:text-lg font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent text-center">
      Final Ad
    </h4>
    <iframe
      src="https://drive.google.com/file/d/1K_ekJGfkPtujOE2_9GVHmzVyNk2RI4Ik/preview"
      className="w-full aspect-[3/4] rounded-lg shadow"
      allow="autoplay"
    ></iframe>
  </div>

  {/* Ad Script */}
  <div className="flex flex-col items-center gap-2 w-1/3 max-w-[120px] sm:max-w-[180px] md:max-w-[220px]">
    <h4 className="text-xs sm:text-sm md:text-lg font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent text-center">
      Ad Script
    </h4>
    <img
      src="../../dist/assets/Screenshot from 2025-08-10 02-32-43.png"
      alt="Ad Script"
      className="w-full aspect-[3/4] rounded-lg shadow"
    />
  </div>

  {/* Results */}
  <div className="flex flex-col items-center gap-2 w-1/3 max-w-[120px] sm:max-w-[180px] md:max-w-[220px]">
    <h4 className="text-xs sm:text-sm md:text-lg font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent text-center">
      Results
    </h4>
    <img
      src="../../dist/assets/Screenshot from 2025-08-10 02-32-43.png"
      alt="Results"
      className="w-full aspect-[3/4] rounded-lg shadow"
    />
  </div>
</div>


            {/* Quote */}
            <p className="mt-8 text-center italic text-gray-700 max-w-2xl mx-auto">
              “It knows exactly which hooks work in which industries, what angles to use, what formats convert”
            </p>

            {/* CTA Button */}
            <div className="text-center mt-8">
      <Link
        to="/login"
        className="relative inline-flex items-center px-5 py-2.5 sm:px-6 sm:py-3 bg-[#9F6AEA] text-white font-semibold rounded-lg text-sm sm:text-base md:text-lg"
      >
        <span className="flex items-center relative z-10 pointer-events-auto">
          Try For 30 Days At Just Rs.1999
          <ChevronRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
        </span>
      </Link>
    </div>

            {/* Footer Note */}
            <p className="mt-4 text-center text-sm text-gray-500 max-w-3xl mx-auto">
              Generate Unlimited Winning Ad Scripts. If at least 3 ad scripts don’t work, 100% money back.
            </p>
          </div>
        </div>
      </div>
    </section>
  





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

          <div className="text-center mt-12">
            <Link
              to="/signup"
              className="px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:from-pink-600 hover:to-purple-600 transition-all duration-300 shadow-lg text-lg font-medium"
            >
              Try For 30 Days At Just Rs.1999
            </Link>
          </div>
        </div>
      </section>

      {/* NEW: 100% Money Back Guarantee */}
      <section className="relative z-10 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Our Promise
            </h1>
          </div>
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2">
              <div className="w-40 h-40 bg-yellow-400 rounded-full opacity-20"></div>
            </div>

            <h3 className="text-3xl font-bold text-white mb-6 relative z-10">
              100% Money Back Guarantee
            </h3>

            <div className="mb-8 relative z-10">
              <div className="w-42 h-42 mx-auto  rounded-full flex items-center justify-center ">
                <div className="text-center">
                  <img src="../../dist/assets/image_90.png" alt="" />
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

            <Link
              to="/signup"
              className="px-8 py-3 bg-yellow-500 text-gray-900 rounded-lg hover:bg-yellow-400 transition-all duration-300 shadow-lg text-lg font-bold relative z-10"
            >
              Try For 30 Days
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold mb-4 bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent animate-liquid-flow">
              Why Choose Leepi AI?
            </h3>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our AI-powered platform creates winning ad scripts that convert,
              backed by real data and proven results.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: "🚀",
                title: "Lightning Fast",
                description:
                  "Generate high-converting ad scripts in seconds, not hours",
              },
              {
                icon: "🎯",
                title: "Data-Driven",
                description: "Trained on Rs. 50Cr+ of successful ad spend data",
              },
              {
                icon: "✨",
                title: "Proven Results",
                description: "1000+ winning ads created for leading brands",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="group bg-white/70 backdrop-blur-custom rounded-xl p-8 shadow-lg border border-pink-100 hover:shadow-2xl transition-all duration-700 hover:-translate-y-3 cursor-pointer water-effect hover-lift"
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-pink-100 via-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500 group-hover:animate-glow">
                    <span className="text-3xl">{feature.icon}</span>
                  </div>
                  <h4 className="text-xl font-bold mb-4 text-gray-900 group-hover:bg-gradient-to-r group-hover:from-pink-600 group-hover:via-purple-600 group-hover:to-blue-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-500">
                    {feature.title}
                  </h4>
                  <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative z-10 py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-100 to-pink-100">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl font-bold mb-6 bg-gradient-to-r from-purple-700 to-pink-600 bg-clip-text text-transparent">
            Ready to Create Winning Ad Scripts?
          </h3>
          <p className="text-xl text-gray-700 mb-8">
            Join thousands of marketers who are saving time and getting better
            results with Leepi AI.
          </p>
          <div className="relative inline-block group">
            <Link
              to="/signup"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white text-xl font-semibold rounded-lg hover:from-pink-600 hover:via-purple-600 hover:to-blue-600 transition-all duration-500 shadow-lg hover:shadow-2xl transform hover:scale-105 hover:-translate-y-1 water-effect animate-liquid-flow"
            >
              Get Started
              <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <div className="absolute -inset-3 bg-gradient-to-r from-pink-500/30 via-purple-500/30 to-blue-500/30 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg animate-water-wave"></div>
          </div>
          <p className="mt-4 text-gray-500">
            No credit card required • Free plan available
          </p>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
