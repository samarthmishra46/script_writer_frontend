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
  className={`fixed bottom-0 left-0 w-full font-lato  bg-[#241F26] text-white border-t rounded-lg border-gray-700 z-50 transition-transform duration-300 ${
    showFooter ? "translate-y-0" : "translate-y-full"
  }`}
>
  <div className="max-w-6xl mx-auto flex items-center justify-between gap-2 px-4 py-4 sm:py-2 flex-wrap sm:flex-nowrap">
    
    {/* Price & Guarantee */}
    <div className="flex flex-row items-center gap-2 text-sm sm:text-xs flex-shrink">
      <span className="text-white line-through text-base sm:text-sm">₹7999</span>
      <span className="text-yellow-400 font-bold text-lg sm:text-base">
        ₹1999
      </span>
      <span className="text-[11px] sm:text-[10px] md:text-sm text-white font-medium">
        100% Refund Guarantee
      </span>
    </div>

    {/* Button */}
    <Link
  to="/signup"
  className="bg-gradient-to-r from-[#9F6AEA] to-purple-600 
             hover:bg-gradient-to-l hover:from-[#9051e8] hover:to-[#512e82] 
             font-bold 
             text-xl sm:text-lg md:text-base   /* Bigger on small, smaller on big */
             px-6 sm:px-4 md:px-4              /* More padding on small */
             py-3 sm:py-2 md:py-2 
             rounded transition md:w-auto shadow-lg"
>
  {/* Text changes with screen size */}
  <span className="hidden sm:inline">Sign Up Now At Rs. 1999</span>
  <span className="inline sm:hidden">Sign Up Now</span>
</Link>


    
  </div>
</div>

  );
};

export default StickyFooter;
