import { ShinyButton } from "@/components/magicui/shiny-button";
import { Link } from "react-router-dom";

const StickyFooter: React.FC = () => {
  // const [showFooter, setShowFooter] = useState(false);
 
  // useEffect(() => {
  //   const handleScroll = () => {
  //     setShowFooter(window.scrollY > 100);
  //   };
  //   window.addEventListener("scroll", handleScroll);
  //   return () => window.removeEventListener("scroll", handleScroll);
  // }, []);

  // if (!showFooter) return null;

  return (
    <div className="fixed bottom-0 left-0 w-full bg-[#241F26] text-white border-t border-gray-800 z-50 rounded-xl">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-5 py-6 sm:py-6 md:py-1">
        
        {/* Price + Guarantee */}
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-2">
            <span className="text-gray-400 line-through text-lg sm:text-xl md:text-xl">
              ₹7999
            </span>
            <span className="text-[#FFD600] font-extrabold text-2xl sm:text-3xl md:text-2xl">
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
  className="relative inline-flex items-center justify-center overflow-hidden rounded-lg 
             bg-gradient-to-r from-[#9F6AEA] to-purple-600 
             px-9 py-5 text-lg sm:text-xl md:text-2xl font-extrabold text-white 
             shadow-lg whitespace-nowrap transition-transform duration-300 hover:scale-105"
>
  SIGN UP NOW
  {/* Shiny sweep overlay */}
  <span className="pointer-events-none absolute inset-0 before:absolute before:inset-0 
                   before:-translate-x-full before:animate-shiny 
                   before:bg-gradient-to-r before:from-transparent 
                   before:via-white/40 before:to-transparent before:skew-x-12" />
</Link>

      </div>
    </div>
  );
};

export default StickyFooter;
