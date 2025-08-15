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
  className="group inline-flex items-center px-3 py-2 bg-gradient-to-r from-[#9F6AEA] to-purple-600 text-white font-bold rounded-lg shadow hover:shadow-md transition-all duration-200 text-xs min-w-0"
>
  <span className="flex items-center whitespace-nowrap truncate text-[10.5px] sm:text-base md:text-lg lg:text-xl">
          Get Unlimited Winning Ad Scripts 
      <span className="flex items-center ml-1.5 px-1.5 py-0.5 rounded">
      <span className="text-gray-300 line-through font-normal text-[0.6rem] sm:text-[0.6rem] md:text-sm lg:text-md mr-0.5">
        ₹7,999
      </span>
      <span className="font-extrabold text-yellow-300 text-[0.7rem] sm:text-[0.7rem] md:text-xl lg:text-lg sm">
        ₹1,999
      </span>
      <ChevronRight className="ml-1 w-3 h-3 transition-transform group-hover:translate-x-0.5" />
    </span>
  </span>
</Link>
    <div className="flex items-center whitespace-nowrap truncate text-[10.5px] sm:text-base md:text-lg lg:text-xl" >
      <span className="font-bold">(30 Days Access)</span>. 100% Refund Guarantee!
    </div>
  </div>
);

}