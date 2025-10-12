import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Image, CheckCircle, Copy, Loader2, Edit3, Send, X } from 'lucide-react';
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
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [regenerationPrompt, setRegenerationPrompt] = useState('');
  const [showRegenerationModal, setShowRegenerationModal] = useState(false);
  const [currentRegeneratingImage, setCurrentRegeneratingImage] = useState<ImageVariation | null>(null);

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
        
        // Debug: Log styleKeys to check for duplicates
        if (data.imageAd.imageVariations) {
          console.log('🔍 Image variations styleKeys:', data.imageAd.imageVariations.map(v => v.styleKey));
          const styleKeys = data.imageAd.imageVariations.map(v => v.styleKey);
          const uniqueStyleKeys = [...new Set(styleKeys)];
          if (styleKeys.length !== uniqueStyleKeys.length) {
            console.warn('⚠️ DUPLICATE STYLE KEYS DETECTED!', { original: styleKeys, unique: uniqueStyleKeys });
          }
        }
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

  const handleRegenerateImage = async () => {
    if (!currentRegeneratingImage) return;
    
    if (!regenerationPrompt.trim()) {
      alert('Please enter a regeneration prompt');
      return;
    }

    try {
      setIsRegenerating(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to regenerate images');
        return;
      }

      console.log('🔄 Starting image regeneration...', {
        adId: imageAd?._id,
        originalImage: currentRegeneratingImage.imageUrl,
        prompt: regenerationPrompt
      });

      const response = await fetch(buildApiUrl('api/image-ads/regenerate-image'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          adId: imageAd?._id,
          original_image_url: currentRegeneratingImage.imageUrl,
          custom_prompt: regenerationPrompt,
          original_style_key: currentRegeneratingImage.styleKey
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to regenerate image');
      }

      if (data.success && data.regenerated_image) {
        // Add the new image to the current imageVariations
        const newImageVariation: ImageVariation = {
          styleKey: data.regenerated_image.styleKey,
          styleName: data.regenerated_image.styleName,
          imageUrl: data.regenerated_image.imageUrl,
          originalUrl: data.regenerated_image.originalUrl,
          prompt: data.regenerated_image.customPrompt
        };

        // Update the imageAd state to include the new image
        setImageAd(prev => {
          if (!prev) return prev;
          
          const updatedVariations = prev.imageVariations 
            ? [...prev.imageVariations, newImageVariation]
            : [newImageVariation];

          return {
            ...prev,
            imageVariations: updatedVariations,
            totalGenerated: data.total_images
          };
        });

        // Close the modal and clear form
        setShowRegenerationModal(false);
        setRegenerationPrompt('');
        setCurrentRegeneratingImage(null);

        alert('🎉 Image regenerated successfully! The new image has been added to your collection.');
      } else {
        throw new Error('No regenerated image returned');
      }

    } catch (error) {
      console.error('Image regeneration error:', error);
      setError(error instanceof Error ? error.message : 'Failed to regenerate image');
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleShowRegenerationForm = (imageVariation: ImageVariation) => {
    console.log('🔧 Showing regeneration modal for:', imageVariation.styleName);
    setCurrentRegeneratingImage(imageVariation);
    setRegenerationPrompt('');
    setShowRegenerationModal(true);
  };

  const handleCloseRegenerationModal = () => {
    setShowRegenerationModal(false);
    setCurrentRegeneratingImage(null);
    setRegenerationPrompt('');
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
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Dashboard
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {imageAd.imageVariations.map((variation) => (
                    <div 
                      key={variation.styleKey}
                      className="bg-white rounded-lg shadow-md overflow-hidden border-2 border-transparent hover:border-purple-500 transition-all relative"
                    >
                      {/* Image Container */}
                      <div className="relative group">
                        <div 
                          className="aspect-square bg-gray-100 overflow-hidden relative cursor-pointer"
                          onClick={() => handleOpenImageModal(variation)}
                        >
                          <img 
                            src={variation.imageUrl} 
                            alt={`${imageAd.brand_name} ${imageAd.product} - ${variation.styleName}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          
                          {/* Hover overlay for full-size view */}
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-center text-white">
                              <Image className="h-6 w-6 mx-auto mb-1" />
                              <p className="text-xs font-medium">View Full Size</p>
                            </div>
                          </div>
                        </div>

                        {/* Action Icons at bottom of image */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                          <div className="flex justify-between items-center">
                            <button
                              onClick={() => handleDownloadImage(variation)}
                              className="bg-white/90 backdrop-blur-sm text-gray-700 p-2 rounded-full hover:bg-white transition-all shadow-lg"
                              title="Download Image"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                            
                            <button
                              onClick={() => {
                                console.log('🖱️ Regenerate button clicked for:', variation.styleName);
                                handleShowRegenerationForm(variation);
                              }}
                              className="bg-white/90 backdrop-blur-sm text-gray-700 p-2 rounded-full hover:bg-white transition-all shadow-lg"
                              title="Regenerate with Custom Prompt"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Image Info */}
                      <div className="p-4">
                        <h3 className="font-medium text-gray-900 text-base mb-1">{variation.styleName}</h3>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {variation.prompt || 'Original generated image'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : imageAd.imageUrl ? (
                // Single legacy image
                <div className="max-w-md mx-auto">
                  <div className="bg-white rounded-lg shadow-md overflow-hidden border-2 border-transparent hover:border-purple-500 transition-all relative">
                    <div className="relative group">
                      <div 
                        className="aspect-square bg-gray-100 overflow-hidden relative cursor-pointer"
                        onClick={() => handleOpenImageModal({
                          styleKey: 'legacy',
                          styleName: 'Generated Image',
                          imageUrl: imageAd.imageUrl!,
                          originalUrl: imageAd.imageUrl!,
                          prompt: 'Legacy generated image'
                        })}
                      >
                        <img 
                          src={imageAd.imageUrl} 
                          alt={`${imageAd.brand_name} ${imageAd.product} - Generated Image`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        
                        {/* Hover overlay for full-size view */}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-center text-white">
                            <Image className="h-8 w-8 mx-auto mb-2" />
                            <p className="text-sm font-medium">View Full Size</p>
                          </div>
                        </div>
                      </div>

                      {/* Action Icons at bottom of image */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                        <div className="flex justify-between items-center">
                          <button
                            onClick={() => handleDownloadImage({
                              styleKey: 'legacy',
                              styleName: 'Generated Image',
                              imageUrl: imageAd.imageUrl!,
                              originalUrl: imageAd.imageUrl!,
                              prompt: 'Legacy generated image'
                            })}
                            className="bg-white/90 backdrop-blur-sm text-gray-700 p-2 rounded-full hover:bg-white transition-all shadow-lg"
                            title="Download Image"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                          
                          <button
                            onClick={() => handleShowRegenerationForm({
                              styleKey: 'legacy',
                              styleName: 'Generated Image',
                              imageUrl: imageAd.imageUrl!,
                              originalUrl: imageAd.imageUrl!,
                              prompt: 'Legacy generated image'
                            })}
                            className="bg-white/90 backdrop-blur-sm text-gray-700 p-2 rounded-full hover:bg-white transition-all shadow-lg"
                            title="Regenerate with Custom Prompt"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Image Info */}
                    <div className="p-4">
                      <h3 className="font-medium text-gray-900">Generated Image</h3>
                      <p className="text-sm text-gray-600">Click to view full size</p>
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

      {/* Regeneration Modal */}
      {showRegenerationModal && currentRegeneratingImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Regenerate Image</h3>
                <button
                  onClick={handleCloseRegenerationModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              {/* Current Image Preview */}
              <div className="mb-6">
                <div className="relative rounded-lg overflow-hidden bg-gray-100">
                  <img 
                    src={currentRegeneratingImage.imageUrl}
                    alt={currentRegeneratingImage.styleName}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end">
                    <div className="p-4 text-white w-full">
                      <h4 className="font-medium">{currentRegeneratingImage.styleName}</h4>
                      <p className="text-sm opacity-90">{imageAd.brand_name} - {imageAd.product}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Regeneration Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Describe your changes
                  </label>
                  <textarea
                    value={regenerationPrompt}
                    onChange={(e) => setRegenerationPrompt(e.target.value)}
                    placeholder="e.g., Make the background blue, add more lighting, change the mood to cheerful, add sunglasses..."
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-sm"
                    rows={4}
                    autoFocus
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleRegenerateImage}
                    disabled={isRegenerating || !regenerationPrompt.trim()}
                    className="flex-1 flex items-center justify-center px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    {isRegenerating ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5 mr-2" />
                        Generate New Image
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleCloseRegenerationModal}
                    disabled={isRegenerating}
                    className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Click outside to close (only when not regenerating) */}
          {!isRegenerating && (
            <div 
              className="absolute inset-0 -z-10" 
              onClick={handleCloseRegenerationModal}
            />
          )}
        </div>
      )}

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