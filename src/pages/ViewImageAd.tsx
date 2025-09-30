import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Image, CheckCircle, Copy, Loader2 } from 'lucide-react';
import { buildApiUrl } from '../config/api';

interface ImageVariation {
  styleKey: string;
  styleName: string;
  imageUrl: string;
  originalUrl: string;
  prompt: string;
}

interface ViewImageAdData {
  _id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  metadata: {
    brand_name: string;
    product: string;
    adType: string;
  };
  brand_name: string;
  product: string;
  campaign?: {
    theme: string;
    headline: string;
    body_copy: string;
    call_to_action: string;
    image_description: string;
    message_to_the_world: string;
  };
  imageUrl?: string;
  videoUrl?: string;
  imageVariations?: ImageVariation[];
  totalGenerated?: number;
  hasProductImages?: boolean;
  hasImage?: boolean;
  hasVideo?: boolean;
  platform?: string;
  visual_style?: string;
  color_scheme?: string;
  image_format?: string;
}

const ViewImageAd: React.FC = () => {
  const { adId } = useParams<{ adId: string }>();
  const navigate = useNavigate();
  const [imageAd, setImageAd] = useState<ViewImageAdData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageModal, setSelectedImageModal] = useState<ImageVariation | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchImageAd = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(buildApiUrl(`api/image-ads/view/${adId}`));
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch image ad');
        }

        if (!data.success || !data.imageAd) {
          throw new Error('Invalid response from server');
        }

        setImageAd(data.imageAd);
      } catch (error) {
        console.error('Error fetching image ad:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch image ad');
      } finally {
        setLoading(false);
      }
    };

    if (!adId) {
      setError('Image ad ID is required');
      setLoading(false);
      return;
    }

    fetchImageAd();
  }, [adId]);

  const handleCopyContent = async () => {
    if (!imageAd) return;

    try {
      await navigator.clipboard.writeText(imageAd.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy content:', error);
    }
  };

  const handleDownloadImage = (imageVariation: ImageVariation) => {
    const link = document.createElement('a');
    link.href = imageVariation.imageUrl;
    link.download = `${imageAd?.brand_name}-${imageAd?.product}-${imageVariation.styleName}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenImageModal = (imageVariation: ImageVariation) => {
    setSelectedImageModal(imageVariation);
  };

  const handleCloseImageModal = () => {
    setSelectedImageModal(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading image ad...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-700 font-medium mb-4">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!imageAd) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg">Image ad not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Home
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Image Ad Viewer</h1>
          <div className="w-24" /> {/* Spacer for alignment */}
        </div>

        {/* Ad Content Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Ad Information */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Ad Details</h2>
              <button
                onClick={handleCopyContent}
                className="flex items-center px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {copied ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </>
                )}
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{imageAd.title}</h3>
                <div className="prose prose-sm max-w-none">
                  <div className="bg-gray-50 rounded-lg p-4 whitespace-pre-wrap font-mono text-sm">
                    {imageAd.content}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Brand:</span> {imageAd.brand_name}
                </div>
                <div>
                  <span className="font-medium">Product:</span> {imageAd.product}
                </div>
                <div>
                  <span className="font-medium">Created:</span> {new Date(imageAd.createdAt).toLocaleDateString()}
                </div>
                <div>
                  <span className="font-medium">Platform:</span> {imageAd.platform || 'instagram'}
                </div>
              </div>

              {imageAd.campaign && (
                <div className="mt-6 p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-semibold text-purple-900 mb-2">Campaign Theme: {imageAd.campaign.theme}</h4>
                  <p className="text-purple-700 text-sm">{imageAd.campaign.headline}</p>
                </div>
              )}
            </div>
          </div>

          {/* Image Display */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Generated Images</h2>
                <p className="text-gray-600 mt-1">
                  {imageAd.imageVariations && imageAd.imageVariations.length > 0 ? 
                    `${imageAd.imageVariations.length} creative variations` :
                    imageAd.imageUrl ? '1 generated image' : 'No images available'
                  }
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {imageAd.imageVariations && imageAd.imageVariations.length > 0 ? (
                // Multiple image variations
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {imageAd.imageVariations.map((variation) => (
                    <div 
                      key={variation.styleKey}
                      className="group cursor-pointer transform transition-all duration-300 hover:scale-105"
                      onClick={() => handleOpenImageModal(variation)}
                    >
                      <div className="bg-white rounded-lg shadow-md overflow-hidden border-2 border-transparent hover:border-purple-500 transition-all">
                        <div className="aspect-square bg-gray-100 overflow-hidden relative">
                          <img 
                            src={variation.imageUrl} 
                            alt={`${imageAd.brand_name} ${imageAd.product} - ${variation.styleName}`}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-center text-white">
                              <Image className="h-6 w-6 mx-auto mb-1" />
                              <p className="text-xs font-medium">View Full Size</p>
                            </div>
                          </div>
                        </div>
                        <div className="p-3">
                          <h3 className="font-medium text-gray-900 text-sm">{variation.styleName}</h3>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : imageAd.imageUrl ? (
                // Single legacy image
                <div className="max-w-md mx-auto">
                  <div 
                    className="group cursor-pointer transform transition-all duration-300 hover:scale-105"
                    onClick={() => handleOpenImageModal({
                      styleKey: 'legacy',
                      styleName: 'Generated Image',
                      imageUrl: imageAd.imageUrl!,
                      originalUrl: imageAd.imageUrl!,
                      prompt: 'Legacy generated image'
                    })}
                  >
                    <div className="bg-white rounded-lg shadow-md overflow-hidden border-2 border-transparent hover:border-purple-500 transition-all">
                      <div className="aspect-square bg-gray-100 overflow-hidden relative">
                        <img 
                          src={imageAd.imageUrl} 
                          alt={`${imageAd.brand_name} ${imageAd.product} - Generated Image`}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-center text-white">
                            <Image className="h-8 w-8 mx-auto mb-2" />
                            <p className="text-sm font-medium">View Full Size</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium text-gray-900">Generated Image</h3>
                        <p className="text-sm text-gray-600">Click to view full size</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // No images
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <Image className="h-16 w-16 mx-auto" />
                  </div>
                  <p className="text-gray-600">No images available for this ad</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {selectedImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            <img 
              src={selectedImageModal.imageUrl}
              alt={selectedImageModal.styleName}
              className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
            />
            
            {/* Modal Controls */}
            <div className="absolute top-4 right-4 flex space-x-2">
              <button
                onClick={() => handleDownloadImage(selectedImageModal)}
                className="bg-white bg-opacity-90 backdrop-blur-sm text-gray-700 p-3 rounded-full hover:bg-white transition-all shadow-lg"
                title="Download Image"
              >
                <Download className="h-5 w-5" />
              </button>
              <button
                onClick={handleCloseImageModal}
                className="bg-white bg-opacity-90 backdrop-blur-sm text-gray-700 p-3 rounded-full hover:bg-white transition-all shadow-lg"
                title="Close"
              >
                ✕
              </button>
            </div>

            {/* Image Info */}
            <div className="absolute bottom-4 left-4 right-4 bg-white bg-opacity-90 backdrop-blur-sm rounded-lg p-4">
              <h3 className="font-semibold text-gray-900">{selectedImageModal.styleName}</h3>
              <p className="text-sm text-gray-600 mt-1">
                {imageAd.brand_name} - {imageAd.product}
              </p>
            </div>
          </div>
          
          {/* Click outside to close */}
          <div 
            className="absolute inset-0 -z-10" 
            onClick={handleCloseImageModal}
          />
        </div>
      )}
    </div>
  );
};

export default ViewImageAd;