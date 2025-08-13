import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useOrderTimerContext } from "../context/OrderTimerContext";

export function TryButton() {
  const { timeLeft } = useOrderTimerContext();
  const [flash, setFlash] = useState(false);
  const prevTimeLeft = useRef<number | null>(null);

  useEffect(() => {
    if (prevTimeLeft.current !== null && prevTimeLeft.current !== timeLeft) {
      setFlash(true);
      const timeout = setTimeout(() => setFlash(false), 200);
      return () => clearTimeout(timeout);
    }
    prevTimeLeft.current = timeLeft;
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    if (seconds < 0) return "0m 00s";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s.toString().padStart(2, "0")}s`;
  };

  return (
  <div className="relative flex flex-col items-center text-center group mb-6 sm:mb-8 px-3 sm:px-4">
    {/* Countdown Text */}
    <div className="mb-4 text-sm sm:text-base md:text-lg text-gray-700">
      <span className="mr-1">Offer Price ends in</span>
      <span
        className={`font-extrabold text-[#9F6AEA] text-lg sm:text-xl md:text-2xl transition-transform duration-200 ${
          flash ? "scale-110" : ""
        }`}
      >
        {formatTime(timeLeft)}
      </span>
    </div>

    {/* Subscribe Button */}
    <Link
      to="/login"
      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#9F6AEA] to-purple-600 text-white font-semibold rounded-xl text-sm sm:text-base md:text-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
    >
      <span className="flex items-center relative z-10 pointer-events-auto">
        Subscribe For Just Rs{" "}
        <span className="relative inline-block mx-1">
          <span className="text-gray-300 line-through font-normal">5000</span>
        </span>
        <span className="font-bold text-yellow-300">1749/month</span>
        <ChevronRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:translate-x-1" />
      </span>
    </Link>
  </div>
);

}