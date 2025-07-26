import React, { useState, useEffect } from 'react';
import { ChevronRight, Play } from 'lucide-react';

const VideoCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Sample video data - in real app, this would come from an API
  const videos = [
    {
      id: 1,
      title: "E-commerce Ad Script",
      thumbnail: "https://images.pexels.com/photos/3184295/pexels-photo-3184295.jpeg?auto=compress&cs=tinysrgb&w=400",
      duration: "0:45",
      category: "E-commerce"
    },
    {
      id: 2,
      title: "Tech Product Launch",
      thumbnail: "https://images.pexels.com/photos/3184317/pexels-photo-3184317.jpeg?auto=compress&cs=tinysrgb&w=400",
      duration: "1:20",
      category: "Technology"
    },
    {
      id: 3,
      title: "Fashion Brand Campaign",
      thumbnail: "https://images.pexels.com/photos/3184336/pexels-photo-3184336.jpeg?auto=compress&cs=tinysrgb&w=400",
      duration: "0:30",
      category: "Fashion"
    },
    {
      id: 4,
      title: "Food & Beverage Ad",
      thumbnail: "https://images.pexels.com/photos/3184398/pexels-photo-3184398.jpeg?auto=compress&cs=tinysrgb&w=400",
      duration: "0:55",
      category: "Food"
    },
    {
      id: 5,
      title: "Fitness App Promotion",
      thumbnail: "https://images.pexels.com/photos/3184299/pexels-photo-3184299.jpeg?auto=compress&cs=tinysrgb&w=400",
      duration: "1:10",
      category: "Fitness"
    },
    {
      id: 6,
      title: "Travel Campaign",
      thumbnail: "https://images.pexels.com/photos/3184307/pexels-photo-3184307.jpeg?auto=compress&cs=tinysrgb&w=400",
      duration: "0:40",
      category: "Travel"
    }
  ];

  const visibleVideos = 4;

  const loadMoreVideos = () => {
    setCurrentIndex((prev) => {
      const nextIndex = prev + 1;
      return nextIndex >= videos.length ? 0 : nextIndex;
    });
  };

  const getVisibleVideos = () => {
    const result = [];
    for (let i = 0; i < visibleVideos; i++) {
      const index = (currentIndex + i) % videos.length;
      result.push(videos[index]);
    }
    return result;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % videos.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [videos.length]);

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Winning Ad Scripts in Action
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            See how our AI-generated scripts perform across different industries and platforms
          </p>
        </div>

        <div className="relative">
          <div className="flex gap-6 overflow-hidden">
            {getVisibleVideos().map((video, index) => (
              <div
                key={`${video.id}-${currentIndex}`}
                className={`relative flex-shrink-0 transition-all duration-500 ease-in-out cursor-pointer ${
                  hoveredIndex === index 
                    ? 'transform scale-110 z-10' 
                    : 'transform scale-100'
                }`}
                style={{ width: '280px' }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div className="relative rounded-xl overflow-hidden shadow-lg bg-white">
                  <div className="aspect-video relative">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                      <Play className="w-12 h-12 text-white" />
                    </div>
                    <div className="absolute top-3 right-3 bg-black/70 text-white px-2 py-1 rounded text-sm">
                      {video.duration}
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="text-sm text-blue-600 font-medium mb-1">
                      {video.category}
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {video.title}
                    </h3>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Load More Button */}
            <div className="flex-shrink-0 w-20 flex items-center justify-center">
              <button
                onClick={loadMoreVideos}
                className="w-12 h-12 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VideoCarousel;