import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const StickyFooter: React.FC = () => {
  const [showFooter, setShowFooter] = useState(false);

  // Show footer only after scrolling down a bit
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setShowFooter(true);
      } else {
        setShowFooter(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={`fixed bottom-0 left-0 w-full bg-[#241F26] text-white border-t rounded-lg border-gray-700 z-50 transition-transform duration-300 ${
        showFooter ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-2 px-3 py-2 sm:py-4 flex-wrap sm:flex-nowrap">
        
        {/* Price & Guarantee */}
        <div className="flex flex-row items-center gap-2 text-xs sm:text-sm flex-shrink">
          <span className="text-white line-through">₹7999</span>
          <span className="text-yellow-400 font-bold text-sm sm:text-lg">
            ₹1999
          </span>
          <span className="text-[9px] sm:text-[10px] md:text-sm text-white sm:inline font-medium">
            100% Refund Guarantee
          </span>
        </div>

        {/* Button */}
        <Link
          to="/signup"
          className="bg-gradient-to-r from-[#9F6AEA] to-purple-600 hover:bg-gradient-to-l hover:from-[#9051e8] hover:to-[#512e82] font-bold text-xs sm:text-base px-3 sm:px-6 py-1 sm:py-2 rounded transition w-auto"
        >
          <span className="hidden sm:inline">SIGN UP NOW AT Rs. 1999</span>
          <span className="inline sm:hidden">Signup Now</span>
        </Link>
        
      </div>
    </div>
  );
};

export default StickyFooter;
