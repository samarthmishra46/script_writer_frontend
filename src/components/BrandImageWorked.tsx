interface FourImageBrandProps {
  brandname: string;
  img1: string;
  img2: string;
  img3: string;
  img4: string;
  resultadd: string;
}

export function BrandFourCompo({
  brandname,
  img1,
  img2,
  img3,
  img4,
  resultadd
}: FourImageBrandProps) {
  return (
    <div className="bg-gradient-to-br from-[#1653F5] via-[#3CA8E3] via-[#BA63D3] via-[#FAAEA5] to-[#1449F9] p-[2px] rounded-xl shadow-lg mb-8">
      <div className="bg-white rounded-xl pb-4 pt-4">
        
        {/* Brand Name */}
        <div className="text-center mb-6">
          <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-black">
            Brand: {brandname}
          </h3>
        </div>

        {/* Container */}
        <div className="flex justify-between items-start w-full px-2 gap-2">
          
          {/* 4 Images (2 x 2 Grid) */}
          <div className="flex flex-col items-center gap-3 flex-[2]">
            <h4 className="text-xs sm:text-sm md:text-lg font-bold text-black text-center">
              Reference Images
            </h4>

            <div className="grid grid-cols-2 gap-2 w-full">
              {[img1, img2, img3, img4].map((src, index) => (
                <div key={index} className="relative w-full pb-[100%] rounded-lg shadow overflow-hidden">
                  <img
                    src={src}
                    className="absolute top-0 left-0 w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Results Section */}
          <div className="flex flex-col items-center gap-2 flex-1">
            <h4 className="text-xs sm:text-sm md:text-lg font-bold text-black text-center">
              Results
            </h4>

            <div className="relative w-full pb-[177.78%] rounded-lg shadow overflow-hidden">
              <img
                src={resultadd}
                className="absolute top-0 left-0 w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
