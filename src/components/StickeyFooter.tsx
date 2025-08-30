import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { useEffect } from "react";
import ReactPixel from "react-facebook-pixel"; // ✅ Added Pixel import

interface User {
  id?: string;
  name?: string;
  email?: string;
  subscription?: {
    plan: string;
    status: string;
  };
}

interface StickyFooterProps {
  user: User | null;
}

const StickyFooter: React.FC<StickyFooterProps> = ({ user }) => {
  const hasActiveSubscription = user?.subscription?.plan === "individual";
  useEffect(()=>{
  console.log(user)

  },[])
  // ✅ If subscribed, don't render the footer
  if (hasActiveSubscription) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 w-full z-50 bg-gradient-to-r from-[#1e1b22] to-[#241F26] border-t border-gray-700 shadow-lg">
      <div className="flex flex-col items-center text-center px-4 py-4 sm:py-6">
        
        {/* Subscribe Button */}
        <Link
          to={ "/subscription"}
           onClick={() => {
                      ReactPixel.track("Lead", {
                        source: "stickey_footer",
                        action: "subscribe_redirect",
                        price: 1999,
                        currency: "INR",
                      });
                      console.log("META PIXEL LEAD")
                       }}
          className="group relative inline-flex items-center justify-center 
                     overflow-hidden rounded-2xl
                     bg-gradient-to-r from-[#9F6AEA] to-purple-600 
                     text-white font-bold shadow-md hover:shadow-xl 
                     hover:scale-[1.02] transition-all duration-300 
                     min-h-[50px] min-w-[280px] sm:min-w-[300px] md:min-w-[420px]"
        >
          <span className="flex items-center whitespace-nowrap truncate 
                           text-[13px] sm:text-[15px] md:text-lg lg:text-xl px-3 leading-none">
                            
            {user ? (
              <>
                <span>Unlock</span>{" "}
              </>
            ) : <>
             <span>Get</span>
             </>}
             <span className="mr-1"> </span>
             Unlimited Winning Ad Scripts
            <span className="flex items-center ml-3 px-2 py-1 rounded-lg bg-black/20">
              <span className="text-gray-300 line-through font-normal 
                               text-[0.7rem] sm:text-sm md:text-base mr-2">
                ₹7,999
              </span>
              <span className="font-extrabold text-yellow-300 
                               text-[0.95rem] sm:text-lg md:text-xl">
                ₹1,999
              </span>
              <ChevronRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
            </span>
          </span>

          {/* Shiny sweep effect */}
          <span className="pointer-events-none absolute inset-0 
                           before:absolute before:inset-0 
                           before:-translate-x-full before:animate-shiny 
                           before:bg-gradient-to-r before:from-transparent 
                           before:via-white/40 before:to-transparent 
                           before:skew-x-12" />
        </Link>

        {/* Guarantee Text */}
        <div className="mt-3 text-gray-300 text-sm sm:text-lg md:text-xl lg:text-2xl font-semibold">
          (30 Days Access) · <span className="text-green-400">100% Refund Guarantee!</span>
        </div>
      </div>
    </div>
  );
};

export default StickyFooter;
