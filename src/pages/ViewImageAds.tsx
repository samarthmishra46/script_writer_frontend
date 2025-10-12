import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Share2, RefreshCw, Video, Loader2 } from 'lucide-react';
import { buildApiUrl } from '../config/api';
import Header from '../components/Header';

interface ImageVariation {
  styleKey: string;
  styleName: string;
  imageUrl: string;
  originalUrl: string;
  prompt: string;
}

interface ImageAd {
  _id: string;
  title: string;
  brand_name: string;
  product: string;
  content: string;
  createdAt: string;
  metadata: {
    imageUrl?: string;
    videoUrl?: string;
    campaign?: {
      theme: string;
      headline: string;
      body_copy: string;
      call_to_action: string;
      image_description: string;
    };
    adType: string;
    platform?: string;
    visual_style?: string;
    // New 15-image campaign fields
    imageVariations?: ImageVariation[];
    allImageUrls?: string[];
    totalImagesGenerated?: number;
    totalImagesFailed?: number;
    successRate?: string;
    hasProductReference?: boolean;
    isCompleteCampaign?: boolean;
    [key: string]: unknown;
  };
}

const ViewImageAds: React.FC = () => {
  const { adId } = useParams<{ adId: string }>();
  const navigate = useNavigate();
  const [imageAd, setImageAd] = useState<ImageAd | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  
  // Regeneration state
  const [regenerationPrompts, setRegenerationPrompts] = useState<Record<string, string>>({});
  const [regeneratingImages, setRegeneratingImages] = useState<Record<string, boolean>>({});
  const [showRegenerationUI, setShowRegenerationUI] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!adId) {
      setError('Invalid ad ID');
      setIsLoading(false);
      return;
    }

    const fetchImageAd = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const token = localStorage.getItem('token');
        
        if (!token) {
          setError('Please login to view ads');
          navigate('/auth');
          return;
        }

        console.log('Fetching image ad with ID:', adId);
        
        const response = await fetch(buildApiUrl(`api/image-ads/${adId}`), {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch image ad');
        }

        if (data.success && data.ad) {
          // Transform the API response to match our interface
          const transformedAd: ImageAd = {
            _id: data.ad._id,
            title: data.ad.title,
            brand_name: data.ad.brand_name,
            product: data.ad.product,
            content: data.ad.content,
            createdAt: data.ad.createdAt,
            metadata: {
              imageUrl: data.ad.imageUrl,
              videoUrl: data.ad.videoUrl,
              campaign: data.ad.campaign,
              adType: data.ad.adType || 'image',
              platform: data.ad.platform,
              visual_style: data.ad.visual_style,
              color_scheme: data.ad.color_scheme,
              image_format: data.ad.image_format,
              imageGenerated: data.ad.imageGenerated,
              videoGenerated: data.ad.videoGenerated,
              hasImage: data.ad.hasImage,
              hasVideo: data.ad.hasVideo,
              // New 15-image campaign fields
              imageVariations: data.ad.imageVariations || [],
              allImageUrls: data.ad.allImageUrls || [],
              totalImagesGenerated: data.ad.totalImagesGenerated || 0,
              totalImagesFailed: data.ad.totalImagesFailed || 0,
              successRate: data.ad.successRate || '0%',
              hasProductReference: data.ad.hasProductReference || false,
              isCompleteCampaign: data.ad.isCompleteCampaign || false
            }
          };
          setImageAd(transformedAd);
          console.log('Image ad loaded successfully:', transformedAd);
        } else {
          throw new Error('Image ad not found');
        }
      } catch (error) {
        console.error('Error fetching image ad:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch image ad');
      } finally {
        setIsLoading(false);
      }
    };

    fetchImageAd();
  }, [adId, navigate]);

  const handleGenerateVideo = async () => {
    if (!imageAd) return;

    try {
      setIsGeneratingVideo(true);
      const token = localStorage.getItem('token');

      if (!token) {
        alert('Please login to generate video');
        return;
      }

      const response = await fetch(buildApiUrl('api/image-ads/generate-video'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ imageAdId: imageAd._id })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to generate video');
      }

      if (data.success && data.videoUrl) {
        // Update the imageAd with the new video URL
        setImageAd(prev => prev ? {
          ...prev,
          metadata: {
            ...prev.metadata,
            videoUrl: data.videoUrl
          }
        } : null);
        
        alert('Video generated successfully!');
      }
    } catch (error) {
      console.error('Video generation error:', error);
      alert(error instanceof Error ? error.message : 'Failed to generate video');
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  // Helper functions for regeneration
  const getImageKey = (imageUrl: string, index: number) => {
    return `${imageUrl}-${index}`;
  };

  const updateRegenerationPrompt = (imageKey: string, prompt: string) => {
    setRegenerationPrompts(prev => ({
      ...prev,
      [imageKey]: prompt
    }));
  };

  const toggleRegenerationUI = (imageKey: string) => {
    setShowRegenerationUI(prev => ({
      ...prev,
      [imageKey]: !prev[imageKey]
    }));
  };

  const handleRegenerateImage = async (originalImageUrl: string, imageKey: string) => {
    const prompt = regenerationPrompts[imageKey];
    if (!prompt || !prompt.trim()) {
      alert('Please enter a regeneration prompt');
      return;
    }

    if (!imageAd) return;

    try {
      setRegeneratingImages(prev => ({
        ...prev,
        [imageKey]: true
      }));

      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to regenerate images');
        return;
      }

      console.log('🎨 Regenerating image with prompt:', prompt);

      const response = await fetch(buildApiUrl('api/image-ads/regenerate-image'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          adId: imageAd._id,
          originalImageUrl: originalImageUrl,
          customPrompt: prompt
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to regenerate image');
      }

      if (data.success && data.newImageUrl) {
        // Add the new image to the imageAd state
        setImageAd(prev => {
          if (!prev) return prev;
          
          const newImageVariation = {
            styleKey: `regenerated-${Date.now()}`,
            styleName: `Regenerated: ${prompt.substring(0, 30)}...`,
            imageUrl: data.newImageUrl,
            originalUrl: originalImageUrl,
            prompt: prompt
          };

          return {
            ...prev,
            metadata: {
              ...prev.metadata,
              imageVariations: [...(prev.metadata.imageVariations || []), newImageVariation],
              allImageUrls: [...(prev.metadata.allImageUrls || []), data.newImageUrl],
              totalImagesGenerated: (prev.metadata.totalImagesGenerated || 0) + 1
            }
          };
        });

        // Clear the prompt and hide UI
        setRegenerationPrompts(prev => ({
          ...prev,
          [imageKey]: ''
        }));
        setShowRegenerationUI(prev => ({
          ...prev,
          [imageKey]: false
        }));

        alert('🎉 Image regenerated successfully!');
      } else {
        throw new Error('No new image URL returned');
      }
    } catch (error) {
      console.error('Image regeneration error:', error);
      alert(error instanceof Error ? error.message : 'Failed to regenerate image');
    } finally {
      setRegeneratingImages(prev => ({
        ...prev,
        [imageKey]: false
      }));
    }
  };

  const handleDownloadImage = () => {
    if (imageAd?.metadata?.imageUrl) {
      const link = document.createElement('a');
      link.href = imageAd.metadata.imageUrl;
      link.download = `${imageAd.brand_name}-${imageAd.product}-ad.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleShare = async () => {
    if (navigator.share && imageAd?.metadata?.imageUrl) {
      try {
        await navigator.share({
          title: `${imageAd.brand_name} - ${imageAd.product} Ad`,
          url: imageAd.metadata.imageUrl
        });
      } catch {
        // Fallback to copying URL
        if (imageAd?.metadata?.imageUrl) {
          navigator.clipboard.writeText(imageAd.metadata.imageUrl);
          alert('Image URL copied to clipboard!');
        }
      }
    } else if (imageAd?.metadata?.imageUrl) {
      navigator.clipboard.writeText(imageAd.metadata.imageUrl);
      alert('Image URL copied to clipboard!');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading image ad...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !imageAd) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-600 text-2xl">⚠️</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Ad Not Found</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </button>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
            <button
              onClick={handleDownloadImage}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Display */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="mb-4">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {imageAd.brand_name} - {imageAd.product}
              </h1>
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
                  🎨 Image Ad
                </span>
                {imageAd.metadata.campaign?.theme && (
                  <span className="bg-purple-100 text-purple-800 text-sm font-medium px-3 py-1 rounded-full">
                    {imageAd.metadata.campaign.theme} Theme
                  </span>
                )}
              </div>
            </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Display */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="mb-4">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {imageAd.brand_name} - {imageAd.product}
              </h1>
              <div className="flex items-center gap-2 mb-4">
                {imageAd.metadata.adType === 'image_campaign_15' ? (
                  <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                    🎨 Complete Campaign ({imageAd.metadata.totalImagesGenerated || 0} images)
                  </span>
                ) : (
                  <span className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
                    🎨 Image Ad
                  </span>
                )}
                {imageAd.metadata.campaign?.theme && (
                  <span className="bg-purple-100 text-purple-800 text-sm font-medium px-3 py-1 rounded-full">
                    {imageAd.metadata.campaign.theme} Theme
                  </span>
                )}
                {imageAd.metadata.hasProductReference && (
                  <span className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
                    ✨ Product Enhanced
                  </span>
                )}
              </div>
            </div>

            {(() => {
              // Check for new 15-image campaign format first
              if (imageAd.metadata.imageVariations && imageAd.metadata.imageVariations.length > 0) {
                return (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      {imageAd.metadata.imageVariations.map((variation, index) => {
                        const imageKey = getImageKey(variation.imageUrl, index);
                        return (
                          <div key={variation.styleKey || `image-${index}`} className="group">
                            <div className="bg-gray-50 rounded-xl overflow-hidden border-2 border-transparent hover:border-purple-500 transition-all">
                              <div className="aspect-square bg-gray-100 overflow-hidden relative">
                                <img 
                                  src={variation.imageUrl} 
                                  alt={`${imageAd.brand_name} ${imageAd.product} - ${variation.styleName || `Image ${index + 1}`}`}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  onLoad={() => console.log(`Image ${index + 1} loaded successfully`)}
                                  onError={(e) => console.error(`Image ${index + 1} failed to load:`, e)}
                                />
                                <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                                  <span>#{index + 1}</span>
                                </div>
                                {/* Download button for each image */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const link = document.createElement('a');
                                    link.href = variation.imageUrl;
                                    link.download = `${imageAd.brand_name}_${imageAd.product}_image_${index + 1}.png`;
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                  }}
                                  className="absolute top-2 left-2 bg-white bg-opacity-90 text-gray-700 p-1.5 rounded-full hover:bg-white transition-all opacity-0 group-hover:opacity-100"
                                  title="Download Image"
                                >
                                  <Download className="h-3 w-3" />
                                </button>
                                {/* Regeneration button */}
                                <button
                                  onClick={() => toggleRegenerationUI(imageKey)}
                                  className="absolute bottom-2 right-2 bg-purple-600 text-white p-1.5 rounded-full hover:bg-purple-700 transition-all opacity-0 group-hover:opacity-100"
                                  title="Regenerate Image"
                                >
                                  <RefreshCw className="h-3 w-3" />
                                </button>
                              </div>
                              <div className="p-3">
                                <h3 className="font-semibold text-gray-900 text-sm mb-1">
                                  {variation.styleName || `Image ${index + 1}`}
                                </h3>
                                <p className="text-xs text-gray-600 line-clamp-2">
                                  {variation.prompt || 'AI-generated image variation'}
                                </p>
                              </div>
                              
                              {/* Regeneration UI */}
                              {showRegenerationUI[imageKey] && (
                                <div className="p-3 border-t border-gray-200 bg-gray-50">
                                  <h4 className="text-sm font-medium text-gray-900 mb-2">Regenerate Image</h4>
                                  <textarea
                                    value={regenerationPrompts[imageKey] || ''}
                                    onChange={(e) => updateRegenerationPrompt(imageKey, e.target.value)}
                                    placeholder="Describe how you want to modify this image..."
                                    className="w-full p-2 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                    rows={3}
                                  />
                                  <div className="flex gap-2 mt-2">
                                    <button
                                      onClick={() => handleRegenerateImage(variation.imageUrl, imageKey)}
                                      disabled={regeneratingImages[imageKey] || !regenerationPrompts[imageKey]?.trim()}
                                      className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      {regeneratingImages[imageKey] ? (
                                        <>
                                          <Loader2 className="h-3 w-3 animate-spin" />
                                          Generating...
                                        </>
                                      ) : (
                                        <>
                                          <RefreshCw className="h-3 w-3" />
                                          Generate
                                        </>
                                      )}
                                    </button>
                                    <button
                                      onClick={() => toggleRegenerationUI(imageKey)}
                                      className="px-3 py-1.5 text-gray-600 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="text-center mb-6">
                      <p className="text-green-600 font-medium mb-2">
                        🎉 Campaign with {imageAd.metadata.imageVariations.length} images
                        {imageAd.metadata.successRate && ` (${imageAd.metadata.successRate} success rate)`}
                      </p>
                      <p className="text-gray-600 text-sm">
                        Click any image to download it individually, or use the regenerate button to create variations.
                      </p>
                    </div>
                  </>
                );
              }
              
              // Fallback: Check for allImageUrls array (backup format)
              if (imageAd.metadata.allImageUrls && imageAd.metadata.allImageUrls.length > 0) {
                return (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      {imageAd.metadata.allImageUrls.map((imageUrl, index) => {
                        const imageKey = getImageKey(imageUrl, index);
                        return (
                          <div key={`image-${index}`} className="group">
                            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative">
                              <img 
                                src={imageUrl} 
                                alt={`${imageAd.brand_name} ${imageAd.product} ad ${index + 1}`}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                              />
                              <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                                #{index + 1}
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const link = document.createElement('a');
                                  link.href = imageUrl;
                                  link.download = `${imageAd.brand_name}_${imageAd.product}_image_${index + 1}.png`;
                                  document.body.appendChild(link);
                                  link.click();
                                  document.body.removeChild(link);
                                }}
                                className="absolute top-2 left-2 bg-white bg-opacity-90 text-gray-700 p-1.5 rounded-full hover:bg-white transition-all opacity-0 group-hover:opacity-100"
                                title="Download Image"
                              >
                                <Download className="h-3 w-3" />
                              </button>
                              <button
                                onClick={() => toggleRegenerationUI(imageKey)}
                                className="absolute bottom-2 right-2 bg-purple-600 text-white p-1.5 rounded-full hover:bg-purple-700 transition-all opacity-0 group-hover:opacity-100"
                                title="Regenerate Image"
                              >
                                <RefreshCw className="h-3 w-3" />
                              </button>
                            </div>
                            
                            {/* Regeneration UI */}
                            {showRegenerationUI[imageKey] && (
                              <div className="mt-3 p-3 border border-gray-200 rounded-lg bg-gray-50">
                                <h4 className="text-sm font-medium text-gray-900 mb-2">Regenerate Image</h4>
                                <textarea
                                  value={regenerationPrompts[imageKey] || ''}
                                  onChange={(e) => updateRegenerationPrompt(imageKey, e.target.value)}
                                  placeholder="Describe how you want to modify this image..."
                                  className="w-full p-2 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                  rows={3}
                                />
                                <div className="flex gap-2 mt-2">
                                  <button
                                    onClick={() => handleRegenerateImage(imageUrl, imageKey)}
                                    disabled={regeneratingImages[imageKey] || !regenerationPrompts[imageKey]?.trim()}
                                    className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    {regeneratingImages[imageKey] ? (
                                      <>
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                        Generating...
                                      </>
                                    ) : (
                                      <>
                                        <RefreshCw className="h-3 w-3" />
                                        Generate
                                      </>
                                    )}
                                  </button>
                                  <button
                                    onClick={() => toggleRegenerationUI(imageKey)}
                                    className="px-3 py-1.5 text-gray-600 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </>
                );
              }
              
              // Fallback: Single image display
              if (imageAd.metadata.imageUrl) {
                const imageKey = getImageKey(imageAd.metadata.imageUrl, 0);
                return (
                  <>
                    <div className="relative mb-6">
                      <img
                        src={imageAd.metadata.imageUrl}
                        alt={`${imageAd.brand_name} Ad`}
                        className="w-full h-auto rounded-lg shadow-lg"
                      />
                      <button
                        onClick={() => toggleRegenerationUI(imageKey)}
                        className="absolute bottom-4 right-4 bg-purple-600 text-white p-2 rounded-full hover:bg-purple-700 transition-all shadow-lg"
                        title="Regenerate Image"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </button>
                    </div>
                    
                    {/* Regeneration UI */}
                    {showRegenerationUI[imageKey] && (
                      <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                        <h4 className="text-sm font-medium text-gray-900 mb-3">Regenerate Image</h4>
                        <textarea
                          value={regenerationPrompts[imageKey] || ''}
                          onChange={(e) => updateRegenerationPrompt(imageKey, e.target.value)}
                          placeholder="Describe how you want to modify this image..."
                          className="w-full p-3 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          rows={4}
                        />
                        <div className="flex gap-3 mt-3">
                          <button
                            onClick={() => handleRegenerateImage(imageAd.metadata.imageUrl!, imageKey)}
                            disabled={regeneratingImages[imageKey] || !regenerationPrompts[imageKey]?.trim()}
                            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {regeneratingImages[imageKey] ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Generating...
                              </>
                            ) : (
                              <>
                                <RefreshCw className="h-4 w-4" />
                                Generate New Version
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => toggleRegenerationUI(imageKey)}
                            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                );
              } else {
                return (
                  <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                    <span className="text-gray-500">Image not available</span>
                  </div>
                );
              }
            })()}

            {/* Video Section */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Video className="w-5 h-5" />
                Video Version
              </h3>
              {imageAd.metadata.videoUrl ? (
                <div className="space-y-3">
                  <p className="text-sm text-green-600">✅ Video generated successfully</p>
                  <video
                    controls
                    className="w-full h-auto rounded-md"
                    src={imageAd.metadata.videoUrl}
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-3">
                    Convert this image ad to a video advertisement
                  </p>
                  <button
                    onClick={handleGenerateVideo}
                    disabled={isGeneratingVideo}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mx-auto"
                  >
                    {isGeneratingVideo ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating Video...
                      </>
                    ) : (
                      <>
                        <Video className="w-4 h-4" />
                        Generate Video Ad
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

            {/* Video Section */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Video className="w-5 h-5" />
                Video Version
              </h3>
              {imageAd.metadata.videoUrl ? (
                <div className="space-y-3">
                  <p className="text-sm text-green-600">✅ Video generated successfully</p>
                  <video
                    controls
                    className="w-full h-auto rounded-md"
                    src={imageAd.metadata.videoUrl}
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-3">
                    Convert this image ad to a video advertisement
                  </p>
                  <button
                    onClick={handleGenerateVideo}
                    disabled={isGeneratingVideo}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mx-auto"
                  >
                    {isGeneratingVideo ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating Video...
                      </>
                    ) : (
                      <>
                        <Video className="w-4 h-4" />
                        Generate Video Ad
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Campaign Details */}
          <div className="space-y-6">
            {imageAd.metadata.campaign && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Campaign Details</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-700">Headline</h3>
                    <p className="text-gray-600">{imageAd.metadata.campaign.headline}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-700">Body Copy</h3>
                    <p className="text-gray-600">{imageAd.metadata.campaign.body_copy}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-700">Call to Action</h3>
                    <p className="text-gray-600">{imageAd.metadata.campaign.call_to_action}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-700">Visual Description</h3>
                    <p className="text-gray-600">{imageAd.metadata.campaign.image_description}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Technical Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Technical Specifications</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Platform:</span>
                  <span className="font-medium">{imageAd.metadata.platform || 'Not specified'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Visual Style:</span>
                  <span className="font-medium">{imageAd.metadata.visual_style || 'Not specified'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Created:</span>
                  <span className="font-medium">{new Date(imageAd.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/create-image-ads')}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Create New Image Ad
                </button>
                <button
                  onClick={() => navigate(`/script-group/${encodeURIComponent(imageAd.brand_name)}/${encodeURIComponent(imageAd.product)}/${imageAd._id}`)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  View All {imageAd.brand_name} Campaigns
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default ViewImageAds;