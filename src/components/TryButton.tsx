import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useOrderTimerContext } from "../context/OrderTimerContext";
import { trackTryButtonClick } from "../utils/pixelTracking";

interface User {
  id?: string;
  name?: string;
  email?: string;
  subscription?: {
    plan: string;
    status: string;
  };
}

interface TryButtonProps {
  user: User | null;
}

export function TryButton({ user }: TryButtonProps) {
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

  const isLoggedIn = !!user;
  const hasActiveSubscription = user?.subscription?.status === "active";

  return (
    <div className="relative flex flex-col items-center text-center group mb-6 sm:mb-8 px- sm:px-4">
      {/* Countdown Text (hide if already subscribed) */}
      {!hasActiveSubscription && (
        <div className="mb-4 text-xs sm:text-sm md:text-base text-gray-700">
          <span className="mr-1 font-semibold">Offer Ends In</span>
          <span
            className={`font-extrabold text-[#9F6AEA] text-lg sm:text-xl md:text-2xl transition-transform duration-200 ${
              flash ? "scale-110" : ""
            }`}
          >
            {formatTime(timeLeft)}
          </span>
        </div>
      )}

      {/* CTA Button */}
      {!isLoggedIn && (
        <Link
          to="/subscription"
          onClick={() => {
            trackTryButtonClick("hero_section");
          }}
          className="group relative inline-flex items-center justify-center 
                     overflow-hidden rounded-lg 
                     bg-gradient-to-r from-[#9F6AEA] to-purple-600 
                     text-white font-bold shadow hover:shadow-lg 
                     transition-all duration-300 
                     min-h-[45px] min-w-[320px]"
        >
          <span className="flex items-center whitespace-nowrap truncate 
                           text-[15px] sm:text-base md:text-md lg:text-lg px-3 leading-none">
            Get Unlimited Winning Ad Scripts
            <span className="flex items-center ml-2 px-1.5 py-0.5 rounded">
              <span className="text-gray-300 line-through font-normal 
                               text-[0.65rem] sm:text-[0.75rem] md:text-sm lg:text-md mr-1">
                ₹999
              </span>
              <span className="font-extrabold text-yellow-300 
                               text-[0.85rem] sm:text-[0.95rem] md:text-xl lg:text-lg">
                ₹399 / Week
              </span>
              <ChevronRight className="ml-1 w-3 h-3 transition-transform group-hover:translate-x-0.5" />
            </span>
          </span>
        </Link>
      )}

      {isLoggedIn && !hasActiveSubscription && (
        <Link
          to="/subscription"
          onClick={() => {
            trackTryButtonClick("logged_in_section");
          }}
          className="group relative inline-flex items-center justify-center 
                     overflow-hidden rounded-lg 
                     bg-gradient-to-r from-[#9F6AEA] to-purple-600 
                     text-white font-bold shadow hover:shadow-lg 
                     transition-all duration-300 
                     min-h-[45px] min-w-[320px]"
        >
          <span className="flex items-center whitespace-nowrap truncate 
                           text-[15px] sm:text-base md:text-md lg:text-lg px-3 leading-none">
            Unlock Unlimited Winning Ad Scripts
            <span className="flex items-center ml-2 px-1.5 py-0.5 rounded">
              <span className="text-gray-300 line-through font-normal 
                               text-[0.65rem] sm:text-[0.75rem] md:text-sm lg:text-md mr-1">
                ₹7,999
              </span>
              <span className="font-extrabold text-yellow-300 
                               text-[0.85rem] sm:text-[0.95rem] md:text-xl lg:text-lg">
                ₹1,999
              </span>
              <ChevronRight className="ml-1 w-3 h-3 transition-transform group-hover:translate-x-0.5" />
            </span>
          </span>
        </Link>
      )}

      {isLoggedIn && hasActiveSubscription && (
        <Link
          to="/dashboard"
          className="group relative inline-flex items-center justify-center 
                     overflow-hidden rounded-lg 
                     bg-green-600 
                     text-white font-bold shadow hover:shadow-lg 
                     transition-all duration-300 
                     min-h-[45px] min-w-[320px]"
        >
          <span className="flex items-center whitespace-nowrap truncate 
                           text-[15px] sm:text-base md:text-md lg:text-lg px-3 leading-none">
            Go to Dashboard
          </span>
        </Link>
      )}

      {/* Guarantee text (hide if already subscribed) */}
      {!hasActiveSubscription && (
        <div className="flex items-center whitespace-nowrap truncate text-sm sm:text-lg md:text-xl lg:text-2xl mt-2">
          <span className="font-bold">(30 Days Access)</span>. 100% Refund Guarantee!
        </div>
      )}
    </div>
  );
}
