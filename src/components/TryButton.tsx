import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
export function TryButton(){
    return (
        <>
        <div className="relative items-center text-center group mb-4 text-base sm:text-lg px-2">
                    <Link
                      to="/login"
                      className="relative inline-flex items-center px-6 py-3 bg-[#9F6AEA] text-white font-semibold rounded-lg text-sm sm:text-base md:text-lg"
                    >
                      <span className="flex items-center relative z-10 pointer-events-auto">
                        Try For 30 Days At Just Rs.1999
                        <ChevronRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </Link>
                  </div></>
    )
}