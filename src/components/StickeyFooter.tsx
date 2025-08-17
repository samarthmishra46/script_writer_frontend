import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useOrderTimerContext } from "../context/OrderTimerContext";

const StickyFooter: React.FC = () => {
  const [showFooter, setShowFooter] = useState(false);
  const { timeLeft } = useOrderTimerContext();
  const prevTimeLeft = useRef<number | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setShowFooter(window.scrollY > 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!showFooter) return null;

  return (
    <div className="fixed bottom-0 left-0 w-full bg-[#241F26] text-white border-t border-gray-800 z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-5 py-6 sm:py-8">
        
        {/* Price + Guarantee */}
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-2">
            <span className="text-gray-400 line-through text-lg sm:text-xl md:text-2xl">
              ₹7999
            </span>
            <span className="text-[#FFD600] font-extrabold text-2xl sm:text-3xl md:text-4xl">
              ₹1999
            </span>
          </div>
          <span className="text-sm sm:text-base md:text-lg text-gray-300 font-medium mt-2">
            100% Money Back Guarantee
          </span>
        </div>

        {/* CTA Button */}
        <Link
          to="/signup"
          className="bg-gradient-to-r from-[#9F6AEA] to-purple-600  text-white font-extrabold 
                     text-lg sm:text-xl md:text-2xl 
                     px-9 py-5 rounded-md
                     hover:bg-yellow-400 transition-all duration-300
                     shadow-lg whitespace-nowrap"
        >
          SIGN UP NOW 
        </Link>
      </div>
    </div>
  );
};

export default StickyFooter;
