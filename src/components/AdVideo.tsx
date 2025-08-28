import { useState } from "react";
import Vimeo from "@u-wave/react-vimeo";

export default function VideoLanding() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="relative w-full max-w-3xl mx-auto aspect-video">
      {!isPlaying ? (
        <div className="relative cursor-pointer" onClick={() => setIsPlaying(true)}>
          {/* Custom Thumbnail GIF */}
          <img
            src="https://res.cloudinary.com/dvxqb1wge/image/upload/v1756389496/ezgif.com-video-to-gif-converter_1_yxkorv.gif"
            alt="Video Thumbnail"
            className="w-full h-full object-cover rounded-xl shadow-lg"
          />

          {/* Play Button Overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              className="bg-white/80 rounded-full p-4 shadow-lg hover:scale-110 transition-transform"
              aria-label="Play video"
            >
              ▶
            </button>
          </div>
        </div>
      ) : (
        <div className="relative w-full h-full">
          {/* Vimeo Player */}
          <Vimeo
            video="1113796386"
            autoplay
            responsive
            muted={false}
            onLoaded={() => setIsLoaded(true)} // callback when video iframe is ready
          />

          {/* Loading Overlay (shows until Vimeo loads) */}
          {!isLoaded && !isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-xl">
              <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
