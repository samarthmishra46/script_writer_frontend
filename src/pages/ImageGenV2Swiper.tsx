import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import TinderCard from 'react-tinder-card';
import {
  ArrowLeft,
  Heart,
  X,
  Download,
  Check,
  Loader2,
  ImageIcon,
  CheckCircle2,
  Star,
  Sparkles,
} from 'lucide-react';
import { buildApiUrl } from '../config/api';

type Direction = 'left' | 'right' | 'up' | 'down';
type API = { swipe: (dir?: Direction) => Promise<void>; restoreCard: () => Promise<void> };

interface LocationState {
  adId: string;
  brandName: string;
  productName: string;
}

interface GeneratedImage {
  _id: string;
  promptId: number;
  promptTitle: string;
  summary: string;
  headline: string;
  callToAction: string;
  creativeAngle: string;
  visualStyle: string;
  score: number;
  imageUrl: string;
  originalUrl: string;
  status: string;
  userAction: string;
  generatedAt: string;
}

interface AdV2 {
  _id: string;
  generatedImages: GeneratedImage[];
  savedImages: GeneratedImage[];
  rejectedImages: GeneratedImage[];
  status: string;
  productInfo: {
    brandName: string;
    productName: string;
  };
}

const ImageGenV2Swiper: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;

  const [ad, setAd] = useState<AdV2 | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSavedModal, setShowSavedModal] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<string | null>(null);

  // Create refs for each card
  const childRefs = useMemo<React.RefObject<API>[]>(
    () =>
      Array(ad?.generatedImages.length || 0)
        .fill(0)
        .map(() => React.createRef<API>()),
    [ad?.generatedImages.length]
  );

  const fetchAd = useCallback(async () => {
    if (!state?.adId) return;

    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(buildApiUrl(`api/image-gen-v2/${state.adId}`), {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch ad');
      }

      const result = await response.json();
      setAd(result.data);
      setCurrentIndex((result.data.generatedImages?.length || 0) - 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load images');
    } finally {
      setIsLoading(false);
    }
  }, [state?.adId]);

  useEffect(() => {
    if (!state?.adId) {
      navigate('/brands');
      return;
    }
    fetchAd();
  }, [state, fetchAd, navigate]);

  const currentImage = ad?.generatedImages?.[currentIndex] || null;
  const canSwipe = currentIndex >= 0;

  const handleSwipe = async (image: GeneratedImage, direction: 'left' | 'right') => {
    try {
      const token = localStorage.getItem('token');
      
      await fetch(buildApiUrl(`api/image-gen-v2/${state?.adId}/swipe`), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageId: image._id,
          action: direction,
        }),
      });

      // Update local state
      setAd(prev => {
        if (!prev) return prev;
        
        const newGeneratedImages = prev.generatedImages.filter(img => img._id !== image._id);
        
        return {
          ...prev,
          generatedImages: newGeneratedImages,
          savedImages: direction === 'right' 
            ? [...prev.savedImages, image] 
            : prev.savedImages,
          rejectedImages: direction === 'left'
            ? [...prev.rejectedImages, image]
            : prev.rejectedImages,
        };
      });

    } catch (err) {
      console.error('Swipe error:', err);
    }
  };

  const swiped = (direction: string, image: GeneratedImage) => {
    setSwipeDirection(null);
    if (direction === 'left' || direction === 'right') {
      handleSwipe(image, direction as 'left' | 'right');
    }
  };

  const outOfFrame = (name: string, idx: number) => {
    console.log(`${name} (${idx}) left the screen!`);
    if (currentIndex >= idx) {
      setCurrentIndex(idx - 1);
    }
  };

  const swipe = async (dir: Direction) => {
    if (canSwipe && currentIndex < (ad?.generatedImages.length || 0)) {
      await childRefs[currentIndex]?.current?.swipe(dir);
    }
  };

  const onSwipeRequirementFulfilled = (dir: string) => {
    setSwipeDirection(dir);
  };

  const onSwipeRequirementUnfulfilled = () => {
    setSwipeDirection(null);
  };

  const downloadImage = async (imageUrl: string, filename: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  const remainingCount = ad?.generatedImages.length || 0;
  const savedCount = ad?.savedImages.length || 0;
  const rejectedCount = ad?.rejectedImages.length || 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => navigate('/brands')}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg"
          >
            Back to Brands
          </button>
        </div>
      </div>
    );
  }

  // All images swiped
  if (remainingCount === 0 && (savedCount > 0 || rejectedCount > 0)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-purple-900 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <Check className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">All Done!</h1>
          <p className="text-gray-300 mb-8">
            You've reviewed all {savedCount + rejectedCount} images.
            <br />
            <span className="text-purple-400 font-semibold">{savedCount} images saved</span> to your collection.
          </p>
          
          <div className="flex flex-col gap-4">
            <button
              onClick={() => setShowSavedModal(true)}
              className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 transition-all"
            >
              View Saved Images ({savedCount})
            </button>
            <button
              onClick={() => navigate('/brands')}
              className="w-full px-6 py-3 bg-gray-800 text-white rounded-xl font-medium hover:bg-gray-700 transition-all"
            >
              Back to Brands
            </button>
          </div>
        </div>

        {/* Saved Images Modal for completion screen */}
        {showSavedModal && (
          <SavedImagesModal
            savedImages={ad?.savedImages || []}
            onClose={() => setShowSavedModal(false)}
            onDownload={downloadImage}
            brandName={state?.brandName || ''}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/30 to-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-gray-900/90 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/brands')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Back</span>
          </button>
          
          <div className="text-center flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <div>
              <p className="text-white font-medium">{state?.brandName}</p>
              <p className="text-gray-400 text-sm">{state?.productName}</p>
            </div>
          </div>

          <button
            onClick={() => setShowSavedModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-full text-purple-400 hover:text-purple-300 transition-colors"
          >
            <Heart className="w-4 h-4 fill-current" />
            <span className="font-medium">{savedCount}</span>
          </button>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2 text-gray-400">
            <ImageIcon className="w-4 h-4" />
            <span>{remainingCount} to review</span>
          </div>
          <div className="flex items-center gap-2 text-green-400">
            <Heart className="w-4 h-4 fill-current" />
            <span>{savedCount} saved</span>
          </div>
          <div className="flex items-center gap-2 text-red-400">
            <X className="w-4 h-4" />
            <span>{rejectedCount} rejected</span>
          </div>
        </div>
      </div>

      {/* Tinder Card Stack */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-6">
        <div className="relative w-full max-w-sm h-[550px]">
          {ad?.generatedImages.map((image, index) => (
            <TinderCard
              ref={childRefs[index]}
              key={image._id}
              onSwipe={(dir) => swiped(dir, image)}
              onCardLeftScreen={() => outOfFrame(image.promptTitle, index)}
              preventSwipe={['up', 'down']}
              swipeRequirementType="position"
              swipeThreshold={100}
              onSwipeRequirementFulfilled={onSwipeRequirementFulfilled}
              onSwipeRequirementUnfulfilled={onSwipeRequirementUnfulfilled}
              className="absolute w-full h-full"
            >
              <div 
                className="relative w-full h-full bg-gray-800 rounded-3xl overflow-hidden shadow-2xl cursor-grab active:cursor-grabbing"
                style={{ touchAction: 'none' }}
              >
                {/* Image */}
                <img
                  src={image.imageUrl}
                  alt={image.promptTitle}
                  className="w-full h-full object-cover"
                  draggable={false}
                />

                {/* Score Badge */}
                <div className="absolute top-4 left-4 flex items-center gap-1 px-3 py-1 bg-black/60 backdrop-blur-sm rounded-full">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-white font-medium">{image.score}</span>
                </div>

                {/* Swipe Indicators */}
                <div 
                  className={`absolute top-8 left-8 px-6 py-3 border-4 border-green-500 rounded-xl transform -rotate-12 transition-opacity duration-200 ${
                    swipeDirection === 'right' && index === currentIndex ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <span className="text-green-500 text-3xl font-bold">SAVE</span>
                </div>
                <div 
                  className={`absolute top-8 right-8 px-6 py-3 border-4 border-red-500 rounded-xl transform rotate-12 transition-opacity duration-200 ${
                    swipeDirection === 'left' && index === currentIndex ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <span className="text-red-500 text-3xl font-bold">NOPE</span>
                </div>

                {/* Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-6">
                  <h3 className="text-white text-xl font-bold mb-1">{image.promptTitle}</h3>
                  <p className="text-gray-300 text-sm mb-2">{image.summary}</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-purple-500/30 text-purple-300 rounded text-xs">
                      {image.creativeAngle?.replace(/_/g, ' ')}
                    </span>
                    <span className="px-2 py-1 bg-blue-500/30 text-blue-300 rounded text-xs">
                      {image.visualStyle}
                    </span>
                  </div>
                  <div className="mt-3 p-2 bg-white/10 rounded-lg">
                    <p className="text-white text-sm font-medium">{image.headline}</p>
                    <p className="text-purple-400 text-xs mt-1">CTA: {image.callToAction}</p>
                  </div>
                </div>
              </div>
            </TinderCard>
          ))}

          {remainingCount === 0 && savedCount === 0 && rejectedCount === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <ImageIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">No images generated yet</p>
              </div>
            </div>
          )}
        </div>

        {/* Swipe Buttons */}
        {remainingCount > 0 && (
          <div className="flex items-center justify-center gap-8 mt-8">
            <button
              onClick={() => swipe('left')}
              disabled={!canSwipe}
              className="w-16 h-16 bg-gray-800 border-2 border-red-500/50 rounded-full flex items-center justify-center hover:bg-red-500/20 hover:scale-110 transition-all disabled:opacity-50 disabled:hover:scale-100"
            >
              <X className="w-8 h-8 text-red-500" />
            </button>
            <button
              onClick={() => swipe('right')}
              disabled={!canSwipe}
              className="w-16 h-16 bg-gray-800 border-2 border-green-500/50 rounded-full flex items-center justify-center hover:bg-green-500/20 hover:scale-110 transition-all disabled:opacity-50 disabled:hover:scale-100"
            >
              <Heart className="w-8 h-8 text-green-500" />
            </button>
          </div>
        )}

        {/* Instructions */}
        {remainingCount > 0 && (
          <p className="text-gray-500 text-sm mt-6 text-center">
            Swipe right to save • Swipe left to reject • Or use the buttons below
          </p>
        )}
      </main>

      {/* Saved Images Modal */}
      {showSavedModal && (
        <SavedImagesModal
          savedImages={ad?.savedImages || []}
          onClose={() => setShowSavedModal(false)}
          onDownload={downloadImage}
          brandName={state?.brandName || ''}
        />
      )}
    </div>
  );
};

// Saved Images Modal Component
interface SavedImagesModalProps {
  savedImages: GeneratedImage[];
  onClose: () => void;
  onDownload: (url: string, filename: string) => void;
  brandName: string;
}

const SavedImagesModal: React.FC<SavedImagesModalProps> = ({ savedImages, onClose, onDownload, brandName }) => {
  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Saved Images</h2>
              <p className="text-gray-400 text-sm">{savedImages.length} images in your collection</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {savedImages.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No images saved yet</p>
              <p className="text-gray-500 text-sm mt-2">
                Swipe right on images you like to save them
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {savedImages.map((image) => (
                <div key={image._id} className="relative group rounded-xl overflow-hidden bg-gray-800">
                  <img
                    src={image.imageUrl}
                    alt={image.promptTitle}
                    className="w-full aspect-square object-cover"
                  />
                  {/* Score Badge */}
                  <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-full">
                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                    <span className="text-white text-xs font-medium">{image.score}</span>
                  </div>
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                    <button
                      onClick={() => onDownload(image.imageUrl, `${brandName}-${image.promptTitle}.png`)}
                      className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors flex items-center gap-2"
                    >
                      <Download className="w-4 h-4 text-white" />
                      <span className="text-white text-sm">Download</span>
                    </button>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                    <p className="text-white text-sm font-medium truncate">{image.promptTitle}</p>
                    <p className="text-gray-400 text-xs capitalize truncate">
                      {image.creativeAngle?.replace(/_/g, ' ')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {savedImages.length > 0 && (
          <div className="p-4 border-t border-white/10 flex justify-end">
            <button
              onClick={() => {
                savedImages.forEach((img, i) => {
                  setTimeout(() => {
                    onDownload(img.imageUrl, `${brandName}-${img.promptTitle}-${i + 1}.png`);
                  }, i * 500);
                });
              }}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download All ({savedImages.length})
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageGenV2Swiper;
