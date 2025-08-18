import React from "react";

export function VideoRunning() {
  const logos = [
    "https://res.cloudinary.com/dvxqb1wge/image/upload/v1755359134/go_wheelo_quqgxp.gif",
    "https://res.cloudinary.com/dvxqb1wge/image/upload/v1755359130/arabian_rogpzs.gif",
    "https://res.cloudinary.com/dvxqb1wge/image/upload/v1755357609/asligems_cx9ntn.gif",
    "https://res.cloudinary.com/dvxqb1wge/image/upload/v1755443775/Binni_d8smwh.gif",
    "https://res.cloudinary.com/dvxqb1wge/image/upload/v1755443771/YHL_thsupk.gif",
    "https://res.cloudinary.com/dvxqb1wge/image/upload/v1755442431/photojewels_aojp4i.gif",
    "https://res.cloudinary.com/dvxqb1wge/image/upload/v1755506027/fictales_rim5pq.gif",
    
  ];

  return (
    <div className="relative w-full overflow-hidden mt-6 sm:w-full md:max-w-4xl lg:max-w-6xl mx-auto mb-3">
      {/* Left Blur */}
      <div className="absolute top-0 left-0 h-full w-20 
                      bg-gradient-to-r from-[#E1E7FB] to-transparent z-10"></div>

      {/* Right Blur */}
      <div className="absolute top-0 right-0 h-full w-20 
                      bg-gradient-to-l from-[#f3f2fa] to-transparent z-10"></div>

      {/* Marquee Wrapper */}
      <div className="flex whitespace-nowrap animate_marquee">
        {[...logos, ...logos].map((src, idx) => (
          <div key={idx} className="flex-shrink-0 w-32 sm:w-40 md:w-48 px-4">
            <img
              src={src}
              alt="logo"
              className="w-full h-auto object-contain rounded-lg"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
