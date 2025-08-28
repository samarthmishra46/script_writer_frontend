import React, { useEffect } from "react";

const VimeoPlayer: React.FC = () => {
  useEffect(() => {
    // Dynamically load the Vimeo Player API script
    const script = document.createElement("script");
    script.src = "https://player.vimeo.com/api/player.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div style={{ padding: "56.25% 0 0 0", position: "relative" }}>
      <iframe
        src="https://player.vimeo.com/video/1113796386?badge=0&autopause=0&player_id=0&app_id=58479"
        frameBorder="0"
        allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
        title="leepy ai landscape final"
      ></iframe>
    </div>
  );
};

export default VimeoPlayer;
