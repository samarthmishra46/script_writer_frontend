import { TryButton } from "./TryButton";
interface BrandProps {
  videadd: string;
  scriptadd: string;
  resultadd: string;
  brandname: string;
}
// function convertDriveUrl(url: string): string {
//   const match = url.match(/\/d\/([a-zA-Z0-9_-]+)\//);
//   if (!match) {
//     throw new Error("Invalid Google Drive URL");
//   }

//   const fileId = match[1];
//   return `https://drive.google.com/file/d/${fileId}/preview?autoplay=1&loop=1&playlist=${fileId}&mute=1`;
// }

export function Brandcompo({
  brandname,
  videadd,
  scriptadd,
 
}: BrandProps) {
  return (
    <>
      {/* Card with gradient border */}
      <div className="bg-gradient-to-br from-[#1653F5] via-[#3CA8E3] via-[#BA63D3] via-[#FAAEA5] to-[#1449F9] p-[2px] rounded-xl shadow-lg mb-8 ">
  <div className="bg-white rounded-xl pb-4 pt-4">
    {/* Brand */}
    <div className="text-center mb-6">
      <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-black">
        Brand: {brandname}
      </h3>
    </div>

    {/* Flex container full width */}
    <div className="flex justify-between items-start w-full px-2 gap-2">
      {/* Final Ad */}
      <div className="flex flex-col items-center gap-2 flex-1">
        <h4 className="text-xs sm:text-sm md:text-lg font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-black text-center">
          Final Ad
        </h4>
        <div className="relative w-full pb-[177.78%] rounded-lg shadow overflow-hidden">
  <img
    src={videadd}
    className="absolute top-0 left-0 w-full h-full "
   
  ></img>
</div>

      </div>

      {/* Ad Script */}
      <div className="flex flex-col items-center gap-2 flex-1">
        <h4 className="text-xs sm:text-sm md:text-lg font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-black text-center">
          Ad Script
        </h4>
         <div className="relative w-full pb-[177.78%] rounded-lg shadow overflow-hidden">
        <img
          src={scriptadd}
          alt="Ad Script"
          className="absolute top-0 left-0 w-full h-full"
        />
        </div>
      </div>

      {/* Results */}
      <div className="flex flex-col items-center gap-2 flex-1">
        <h4 className="text-xs sm:text-sm md:text-lg font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-black text-center">
          Results
        </h4>
         <div className="relative w-full pb-[177.78%] rounded-lg shadow overflow-hidden">
        <img
          src={scriptadd}
          alt="Ad Script"
          className="absolute top-0 left-0 w-full h-full"
        />
        </div>
      </div>
    </div>
  </div>
  
</div>

      {/* Quote */}
          

          {/* CTA Button */}
         
          {/* Footer Note */}
         
    </>
  );
}
