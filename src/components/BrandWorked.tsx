
import { TryButton } from "./TryButton";
interface BrandProps {
  videadd: string;
  scriptadd: string;
  resultadd: string;
  brandname: string;
}
function convertDriveUrl(url: string): string {  
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)\//);
  if (!match) {
    throw new Error("Invalid Google Drive URL");
  }
  
  const fileId = match[1];
  return `https://drive.google.com/file/d/${fileId}/preview?autoplay=1&loop=1&playlist=${fileId}&mute=1`;
}

export function Brandcompo({brandname,videadd,scriptadd,resultadd}:BrandProps){
    return (
        <>
        {/* Card with gradient border */}
          <div className="bg-gradient-to-br from-[#1653F5] via-[#3CA8E3] via-[#BA63D3] via-[#FAAEA5] to-[#1449F9] p-[2px] rounded-xl shadow-lg">
            <div className="bg-white rounded-xl p-6 sm:p-8">
              {/* Brand */}
              <div className="text-center mb-6">
                <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-black">
                  Brand: {brandname}
                </h3>
              </div>

              <div className="flex gap-4 justify-center items-start flex-wrap sm:flex-nowrap">
                {/* Final Ad */}
                <div className="flex flex-col items-center gap-2 w-1/3 max-w-[120px] sm:max-w-[180px] md:max-w-[220px]">
                  <h4 className="text-xs sm:text-sm md:text-lg font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-black text-center">
                    Final Ad
                  </h4>
                  <iframe
                    src={convertDriveUrl(videadd)}
                    className="w-full aspect-[3/4] rounded-lg shadow"
                    allow="autoplay"
                  ></iframe>
                </div>

                {/* Ad Script */}
                <div className="flex flex-col items-center gap-2 w-1/3 max-w-[120px] sm:max-w-[180px] md:max-w-[220px]">
                  <h4 className="text-xs sm:text-sm md:text-lg font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-black text-center">
                    Ad Script
                  </h4>
                  <img
                    src={scriptadd}
                    alt="Ad Script"
                    className="w-full aspect-[3/4] rounded-lg shadow"
                  />
                </div>

                {/* Results */}
                <div className="flex flex-col items-center gap-2 w-1/3 max-w-[120px] sm:max-w-[180px] md:max-w-[220px]">
                  <h4 className="text-xs sm:text-sm md:text-lg font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-black text-center">
                    Results
                  </h4>
                  <img
                    src={resultadd}
                    alt="Results"
                    className="w-full aspect-[3/4] rounded-lg shadow"
                  />
                </div>
              </div>

              {/* Quote */}
              <p className="mt-8 text-center italic text-gray-700 max-w-2xl mx-auto">
                “It knows exactly which hooks work in which industries, what
                angles to use, what formats convert”
              </p>

              {/* CTA Button */}
              <TryButton/>

              {/* Footer Note */}
              <p className="mt-4 text-center text-sm text-gray-500 max-w-3xl mx-auto">
                Generate Unlimited Winning Ad Scripts. If at least 3 ad scripts
                don’t work, 100% money back.
              </p>
            </div>
          </div></>
    )
}