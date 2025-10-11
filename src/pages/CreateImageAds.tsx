import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Image, Download, Copy, Loader2, CheckCircle, Video, Upload, X } from 'lucide-react';
import { buildApiUrl } from '../config/api';



interface ImageAdFormData {
  product: string;
  brand_name: string;
  selling_what: string;
  target_audience: string;
  call_to_action: string;
  visual_style: string;
  color_scheme: string;
  text_emphasis: string;
  platform: string;
  image_format: string;
  special_offers: string;
  product_image?: File | null;
  product_image_url?: string;
}

interface ImageVariation {
  styleKey: string;
  styleName: string;
  imageUrl: string;
  originalUrl: string;
  prompt: string;
}

interface GeneratedImageAd {
  _id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  metadata: {
    brand_name: string;
    product: string;
    adType: string;
    [key: string]: unknown;
  };
  brand_name: string;
  product: string;
  imageUrl?: string;
  videoUrl?: string;
  imageVariations?: ImageVariation[];
  allImageUrls?: string[];
  totalImagesGenerated?: number;
  totalImagesFailed?: number;
  successRate?: string;
  hasProductReference?: boolean;
  isCompleteCampaign?: boolean;
  totalGenerated?: number;
}

const CreateImageAds: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedAd, setGeneratedAd] = useState<GeneratedImageAd | null>(null);
  const [currentView, setCurrentView] = useState<'form' | 'result'>('form');
  const topRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState<ImageAdFormData>({
    product: '',
    brand_name: '',
    selling_what: '',
    target_audience: '',
    call_to_action: '',
    visual_style: 'modern',
    color_scheme: 'brand-colors',
    text_emphasis: 'moderate',
    platform: 'instagram',
    image_format: 'square',
    special_offers: '',
    product_image: null,
    product_image_url: ''
  });

  const [copied, setCopied] = useState(false);

  // Handle prefilled brand name from previous pages
  useEffect(() => {
    const state = location.state as { prefillBrand?: string };
    if (state?.prefillBrand) {
      setFormData(prev => ({
        ...prev,
        brand_name: state.prefillBrand || ''
      }));
    }
  }, [location.state]);

  // Scroll to top when changing views
  useEffect(() => {
    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentView]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image file size must be less than 5MB');
      return;
    }

    try {
      // Create a local URL for preview
      const imageUrl = URL.createObjectURL(file);
      
      setFormData(prev => ({
        ...prev,
        product_image: file,
        product_image_url: imageUrl
      }));
      
      setError(null);
    } catch (error) {
      console.error('Error handling file upload:', error);
      setError('Failed to process image file');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to continue');
        return;
      }

      console.log('🚀 Starting complete 15-image campaign generation with data:', formData);

      // If product image is provided, upload it first
      let productImageUrl: string | null = null;
      if (formData.product_image) {
        console.log('📸 Uploading product image...');
        
        const uploadFormData = new FormData();
        uploadFormData.append('product_image', formData.product_image);
        
        const uploadResponse = await fetch(buildApiUrl('api/image-ads/upload-product-image'), {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: uploadFormData
        });

        const uploadData = await uploadResponse.json();
        
        if (!uploadResponse.ok) {
          throw new Error(uploadData.message || 'Failed to upload product image');
        }

        if (uploadData.success) {
          productImageUrl = uploadData.imageUrl;
          console.log('✅ Product image uploaded:', productImageUrl);
          
          // Update form data with the Google Cloud Storage URL
          setFormData(prev => ({
            ...prev,
            product_image_url: productImageUrl || ''
          }));
        }
      }

      // Prepare complete campaign generation data
      const campaignData = {
        product: formData.product,
        brand_name: formData.brand_name,
        selling_what: formData.selling_what,
        target_audience: formData.target_audience,
        call_to_action: formData.call_to_action,
        visual_style: formData.visual_style,
        color_scheme: formData.color_scheme,
        text_emphasis: formData.text_emphasis,
        platform: formData.platform,
        image_format: formData.image_format,
        special_offers: formData.special_offers,
        product_image_url: productImageUrl // Pass the uploaded URL
      };

      // Generate complete 15-image campaign directly
      const response = await fetch(buildApiUrl('api/image-ads/generate-complete-campaign'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(campaignData)
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle upgrade required case
        if (data.upgrade && data.freeTrial) {
          throw new Error(`${data.message} You have ${data.remaining} credits remaining.`);
        }
        throw new Error(data.message || 'Failed to generate complete campaign');
      }

      if (!data.success || !data.imageAd) {
        throw new Error('Invalid response from server');
      }

      console.log('✅ Complete 15-image campaign generated successfully:', data.imageAd);
      
      setGeneratedAd(data.imageAd);
      setCurrentView('result');
      
    } catch (error) {
      console.error('Complete campaign generation error:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate complete campaign');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateVideo = async () => {
    if (!generatedAd) return;
    
    try {
      setIsGeneratingVideo(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to continue');
        return;
      }

      console.log('Generating video from image ad:', generatedAd._id);

      const response = await fetch(buildApiUrl('api/image-ads/generate-video'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ adId: generatedAd._id })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to generate video');
      }

      if (data.success && data.videoUrl) {
        setGeneratedAd(prev => prev ? { ...prev, videoUrl: data.videoUrl } : null);
        
        // Show success message with video info
        alert(`🎬 Video generated successfully!
        
Processed: ${data.processedScenes}/${data.totalScenes} scenes
Video URL: ${data.videoUrl}

You can now view your video below or download it.`);
      } else {
        throw new Error('No video URL returned');
      }

    } catch (error) {
      console.error('Video generation error:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate video');
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  const handleCopyContent = async () => {
    if (!generatedAd?.content) return;
    
    try {
      await navigator.clipboard.writeText(generatedAd.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy content:', error);
    }
  };

  const handleDownloadImage = () => {
    if (!generatedAd?.imageUrl) return;
    
    const link = document.createElement('a');
    link.href = generatedAd.imageUrl;
    link.download = `${generatedAd.brand_name}-${generatedAd.product}-ad.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleNewAd = () => {
    setCurrentView('form');
    setGeneratedAd(null);
    setFormData({
      product: '',
      brand_name: '',
      selling_what: '',
      target_audience: '',
      call_to_action: '',
      visual_style: 'modern',
      color_scheme: 'brand-colors',
      text_emphasis: 'moderate',
      platform: 'instagram',
      image_format: 'square',
      special_offers: '',
      product_image: null,
      product_image_url: ''
    });
    setError(null);
  };

  const handleAutoFill = () => {
    setFormData({
      product: 'Wireless Gaming Headset Pro',
      brand_name: 'TechSound',
      selling_what: 'Premium wireless gaming headset with 7.1 surround sound and RGB lighting for serious gamers',
      target_audience: 'Gamers aged 18-35 who value quality audio equipment and competitive gaming performance',
      call_to_action: 'Shop Now - Free Shipping',
      visual_style: 'gaming',
      color_scheme: 'dark-neon',
      text_emphasis: 'strong',
      platform: 'instagram',
      image_format: 'square',
      special_offers: '30% off launch price + 2-year warranty included',
      product_image: null,
      product_image_url: ''
    });
  };

  if (currentView === 'result' && generatedAd) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <div ref={topRef} />
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => navigate('/ad-type-selector')}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Ad Types
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Your Complete Campaign</h1>
            <button
              onClick={handleNewAd}
              className="px-4 py-2 text-purple-600 border border-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
            >
              Create New Campaign
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Ad Result */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Ad Content */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Ad Copy</h2>
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
              
              <div className="prose prose-lg max-w-none">
                <div className="bg-gray-50 rounded-lg p-6 whitespace-pre-wrap font-mono text-sm">
                  {generatedAd.content}
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Brand:</span> {generatedAd.brand_name}
                </div>
                <div>
                  <span className="font-medium">Product:</span> {generatedAd.product}
                </div>
                <div>
                  <span className="font-medium">Created:</span> {new Date(generatedAd.createdAt).toLocaleDateString()}
                </div>
                <div>
                  <span className="font-medium">Format:</span> {formData.image_format}
                </div>
              </div>
            </div>

            {/* Image Generation */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Visual Design</h2>
                {generatedAd.imageUrl && (
                  <button
                    onClick={handleDownloadImage}
                    className="flex items-center px-4 py-2 text-purple-600 border border-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </button>
                )}
              </div>

              <div className="space-y-6">
                {(() => {
                  // Check for new 15-image campaign format first
                  if (generatedAd.imageVariations && generatedAd.imageVariations.length > 0) {
                    return (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {generatedAd.imageVariations.map((variation, index) => (
                            <div key={variation.styleKey || `image-${index}`} className="group cursor-pointer transform transition-all duration-300 hover:scale-105">
                              <div className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-transparent hover:border-purple-500 transition-all">
                                <div className="aspect-square bg-gray-100 overflow-hidden relative">
                                  <img 
                                    src={variation.imageUrl} 
                                    alt={`${generatedAd.brand_name} ${generatedAd.product} - ${variation.styleName || `Image ${index + 1}`}`}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                    onLoad={() => console.log(`Image ${index + 1} loaded successfully`)}
                                    onError={(e) => console.error(`Image ${index + 1} failed to load:`, e)}
                                  />
                                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-center text-white">
                                      <Image className="h-6 w-6 mx-auto mb-1" />
                                      <p className="text-xs font-medium">View Full Size</p>
                                    </div>
                                  </div>
                                  <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                                    <CheckCircle className="h-3 w-3" />
                                    #{index + 1}
                                  </div>
                                  {/* Download button for each image */}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const link = document.createElement('a');
                                      link.href = variation.imageUrl;
                                      link.download = `${generatedAd.brand_name}_${generatedAd.product}_image_${index + 1}.png`;
                                      document.body.appendChild(link);
                                      link.click();
                                      document.body.removeChild(link);
                                    }}
                                    className="absolute top-2 left-2 bg-white bg-opacity-90 text-gray-700 p-1.5 rounded-full hover:bg-white transition-all opacity-0 group-hover:opacity-100"
                                    title="Download Image"
                                  >
                                    <Download className="h-3 w-3" />
                                  </button>
                                </div>
                                <div className="p-4">
                                  <h3 className="font-semibold text-gray-900 mb-1">
                                    {variation.styleName || `Image ${index + 1}`}
                                  </h3>
                                  <p className="text-sm text-gray-600 line-clamp-2">
                                    {variation.prompt || 'AI-generated image variation'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="text-center">
                          <p className="text-green-600 font-medium mb-2">
                            🎉 Your complete campaign is ready! 
                            {generatedAd.totalImagesGenerated && generatedAd.totalImagesGenerated > 0 
                              ? ` ${generatedAd.totalImagesGenerated} images generated successfully` 
                              : ` ${generatedAd.imageVariations.length} images available`}
                            {generatedAd.successRate && ` (${generatedAd.successRate} success rate)`}
                          </p>
                          {generatedAd.hasProductReference && (
                            <p className="text-blue-600 text-sm mb-2">✨ Enhanced with your product image reference</p>
                          )}
                          <p className="text-gray-600 text-sm">
                            {generatedAd.isCompleteCampaign 
                              ? 'This complete campaign includes 15 diverse advertising approaches. Click any image to download it individually.'
                              : 'Each image uses a different advertising approach. Click any image to download it individually.'
                            }
                          </p>
                        </div>
                      </>
                    );
                  }
                  
                  // Fallback: Check for allImageUrls array (backup format)
                  if (generatedAd.allImageUrls && generatedAd.allImageUrls.length > 0) {
                    return (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {generatedAd.allImageUrls.map((imageUrl, index) => (
                            <div key={`image-${index}`} className="group cursor-pointer">
                              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative">
                                <img 
                                  src={imageUrl} 
                                  alt={`${generatedAd.brand_name} ${generatedAd.product} ad ${index + 1}`}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                  onLoad={() => console.log(`Image ${index + 1} loaded successfully`)}
                                  onError={(e) => console.error(`Image ${index + 1} failed to load:`, e)}
                                />
                                <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                                  <CheckCircle className="h-3 w-3" />
                                  #{index + 1}
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const link = document.createElement('a');
                                    link.href = imageUrl;
                                    link.download = `${generatedAd.brand_name}_${generatedAd.product}_image_${index + 1}.png`;
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                  }}
                                  className="absolute top-2 left-2 bg-white bg-opacity-90 text-gray-700 p-1.5 rounded-full hover:bg-white transition-all opacity-0 group-hover:opacity-100"
                                  title="Download Image"
                                >
                                  <Download className="h-3 w-3" />
                                </button>
                              </div>
                              <div className="mt-2 text-center">
                                <p className="text-sm font-medium text-gray-900">Image {index + 1}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="text-center">
                          <p className="text-green-600 font-medium mb-4">🎉 Your {generatedAd.allImageUrls.length} image variations are ready!</p>
                          <p className="text-gray-600 text-sm">Click any image to download it individually, or use the download button above to get the first image.</p>
                        </div>
                      </>
                    );
                  }
                  
                  // Fallback: Check if single imageUrl exists and handle comma-separated URLs
                  if (generatedAd.imageUrl) {
                    const imageUrls = generatedAd.imageUrl.split(',').map(url => url.trim()).filter(url => url.length > 0);
                    
                    if (imageUrls.length > 1) {
                      // Multiple URLs in comma-separated format - display as grid
                      return (
                        <>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {imageUrls.map((imageUrl, index) => (
                              <div key={`image-${index}`} className="group cursor-pointer">
                                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative">
                                  <img 
                                    src={imageUrl} 
                                    alt={`${generatedAd.brand_name} ${generatedAd.product} ad ${index + 1}`}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                    onLoad={() => console.log(`Image ${index + 1} loaded successfully`)}
                                    onError={(e) => console.error(`Image ${index + 1} failed to load:`, e)}
                                  />
                                  <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                                    <CheckCircle className="h-3 w-3" />
                                    #{index + 1}
                                  </div>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const link = document.createElement('a');
                                      link.href = imageUrl;
                                      link.download = `${generatedAd.brand_name}_${generatedAd.product}_image_${index + 1}.png`;
                                      document.body.appendChild(link);
                                      link.click();
                                      document.body.removeChild(link);
                                    }}
                                    className="absolute top-2 left-2 bg-white bg-opacity-90 text-gray-700 p-1.5 rounded-full hover:bg-white transition-all opacity-0 group-hover:opacity-100"
                                    title="Download Image"
                                  >
                                    <Download className="h-3 w-3" />
                                  </button>
                                </div>
                                <div className="mt-2 text-center">
                                  <p className="text-sm font-medium text-gray-900">Image {index + 1}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="text-center">
                            <p className="text-green-600 font-medium mb-4">🎉 Your {imageUrls.length} image variations are ready!</p>
                            <p className="text-gray-600 text-sm">Click any image to download it individually, or use the download button above to get the first image.</p>
                          </div>
                        </>
                      );
                    } else {
                      // Single image URL - display as before
                      return (
                        <>
                          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative">
                            <img 
                              src={imageUrls[0]} 
                              alt={`${generatedAd.brand_name} ${generatedAd.product} ad`}
                              className="w-full h-full object-cover"
                              onLoad={() => console.log('Image loaded successfully')}
                              onError={(e) => console.error('Image failed to load:', e)}
                            />
                            <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" />
                              Generated
                            </div>
                          </div>
                          <div className="text-center">
                            <p className="text-green-600 font-medium mb-4">🎉 Your image ad is ready!</p>
                          </div>
                        </>
                      );
                    }
                  } else {
                    // No image generated yet - shouldn't happen with new flow
                    return (
                      <>
                        <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 relative">
                          <div className="text-center">
                            <Image className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600 mb-2">No images available</p>
                            <p className="text-gray-500 text-sm">Something went wrong with image generation</p>
                          </div>
                        </div>
                      </>
                    );
                  }
                })()}
              </div>
            </div>

            {/* Video Generation Section */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Video Ad</h2>
                {generatedAd.videoUrl && (
                  <a
                    href={generatedAd.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center px-4 py-2 text-purple-600 border border-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Video
                  </a>
                )}
              </div>

              <div className="space-y-6">
                {generatedAd.videoUrl ? (
                  // Video successfully generated and available
                  <>
                    <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
                      <video 
                        src={generatedAd.videoUrl}
                        controls
                        className="w-full h-full object-contain"
                        onLoadedData={() => console.log('Video loaded successfully')}
                        onError={(e) => console.error('Video failed to load:', e)}
                      >
                        Your browser does not support the video tag.
                      </video>
                      <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Generated
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-green-600 font-medium mb-4">🎬 Your video ad is ready!</p>
                      <p className="text-gray-600 text-sm mb-4">
                        Your campaign has been adapted into a professional video advertisement.
                      </p>
                    </div>
                  </>
                ) : (
                  // Video not generated yet
                  <>
                    <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 relative">
                      <div className="text-center">
                        {isGeneratingVideo ? (
                          // Video generating state
                          <>
                            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto mb-4"></div>
                            <p className="text-gray-600 mb-2 font-medium">Generating Video...</p>
                            <p className="text-gray-500 text-sm">Converting your campaign to video format</p>
                            <p className="text-gray-400 text-xs mt-2">This may take 2-3 minutes</p>
                          </>
                        ) : (
                          // Video not generated
                          <>
                            <Video className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600 mb-2">Generate Video from Your Campaign</p>
                            <p className="text-gray-500 text-sm">Create a dynamic video ad using your selected campaign</p>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-center">
                      <button
                        onClick={handleGenerateVideo}
                        disabled={isGeneratingVideo}
                        className="flex items-center justify-center px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:scale-105 mx-auto"
                      >
                        {isGeneratingVideo ? (
                          <>
                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                            Generating Video...
                          </>
                        ) : (
                          <>
                            <Video className="h-5 w-5 mr-2" />
                            Generate Video Ad
                          </>
                        )}
                      </button>
                      <p className="text-gray-500 text-sm mt-3">
                        Transform your image campaign into an engaging video advertisement
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div ref={topRef} />
      
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md mx-4 text-center">
            <div className="mb-4">
              <Loader2 className="h-12 w-12 text-purple-600 animate-spin mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Creating Your Complete Campaign</h3>
            <p className="text-gray-600">AI is generating 15 diverse images and comprehensive ad copy...</p>
            <p className="text-sm text-gray-500 mt-2">This may take 2-3 minutes</p>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={() => navigate('/ad-type-selector')}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-6"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Ad Types
          </button>
          <div className="flex items-center justify-center mb-6">
            <div className="p-3 bg-green-100 rounded-full">
              <Image className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Create Image Ad</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Tell us about your product and we'll create a complete campaign with 15 diverse images and comprehensive ad copy instantly.
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 max-w-4xl mx-auto">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="md:col-span-2">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Basic Information</h2>
              </div>

              <div>
                <label htmlFor="brand_name" className="block text-sm font-medium text-gray-700 mb-2">
                  Brand Name *
                </label>
                <input
                  type="text"
                  id="brand_name"
                  name="brand_name"
                  value={formData.brand_name}
                  onChange={handleInputChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 p-3"
                  placeholder="Enter your brand name"
                  required
                />
              </div>

              <div>
                <label htmlFor="product" className="block text-sm font-medium text-gray-700 mb-2">
                  Product/Service *
                </label>
                <input
                  type="text"
                  id="product"
                  name="product"
                  value={formData.product}
                  onChange={handleInputChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 p-3"
                  placeholder="What are you advertising?"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="product_image" className="block text-sm font-medium text-gray-700 mb-2">
                  Product Image (Optional)
                </label>
                <div className="mt-2">
                  {formData.product_image_url ? (
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <img
                          src={formData.product_image_url}
                          alt="Product preview"
                          className="h-20 w-20 object-cover rounded-lg border-2 border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, product_image: null, product_image_url: '' }))}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{formData.product_image?.name}</p>
                        <p className="text-xs text-gray-500">This image will be used to enhance AI generation</p>
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <div className="text-sm">
                        <label htmlFor="product_image" className="cursor-pointer font-medium text-green-600 hover:text-green-500">
                          Upload product image
                        </label>
                        <input
                          id="product_image"
                          name="product_image"
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={handleFileUpload}
                        />
                        <p className="text-gray-500">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">PNG, JPG, GIF up to 5MB</p>
                      <p className="text-xs text-green-600 mt-1">🎯 Helps AI generate more accurate visuals</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="md:col-span-2">
                <label htmlFor="selling_what" className="block text-sm font-medium text-gray-700 mb-2">
                  What exactly are you selling? *
                </label>
                <textarea
                  id="selling_what"
                  name="selling_what"
                  value={formData.selling_what}
                  onChange={handleInputChange}
                  rows={3}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 p-3"
                  placeholder="Describe your product or service in detail..."
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="target_audience" className="block text-sm font-medium text-gray-700 mb-2">
                  Target Audience *
                </label>
                <textarea
                  id="target_audience"
                  name="target_audience"
                  value={formData.target_audience}
                  onChange={handleInputChange}
                  rows={3}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 p-3"
                  placeholder="Who is this ad for? Describe your ideal customer..."
                  required
                />
              </div>

              {/* Message & Content */}
              <div className="md:col-span-2 mt-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Message & Content</h2>
              </div>



              <div>
                <label htmlFor="call_to_action" className="block text-sm font-medium text-gray-700 mb-2">
                  Call to Action *
                </label>
                <input
                  type="text"
                  id="call_to_action"
                  name="call_to_action"
                  value={formData.call_to_action}
                  onChange={handleInputChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 p-3"
                  placeholder="e.g., Shop Now, Learn More, Get Started"
                  required
                />
              </div>

              <div>
                <label htmlFor="special_offers" className="block text-sm font-medium text-gray-700 mb-2">
                  Special Offers
                </label>
                <input
                  type="text"
                  id="special_offers"
                  name="special_offers"
                  value={formData.special_offers}
                  onChange={handleInputChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 p-3"
                  placeholder="Any discounts, bonuses, or limited-time offers?"
                />
              </div>

              {/* Visual Style */}
              <div className="md:col-span-2 mt-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Visual Style & Format</h2>
              </div>

              <div>
                <label htmlFor="visual_style" className="block text-sm font-medium text-gray-700 mb-2">
                  Visual Style
                </label>
                <select
                  id="visual_style"
                  name="visual_style"
                  value={formData.visual_style}
                  onChange={handleInputChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 p-3"
                >
                  <option value="modern">Modern & Clean</option>
                  <option value="luxury">Luxury & Premium</option>
                  <option value="playful">Playful & Fun</option>
                  <option value="professional">Professional & Corporate</option>
                  <option value="minimalist">Minimalist</option>
                  <option value="vintage">Vintage & Retro</option>
                  <option value="gaming">Gaming & Tech</option>
                </select>
              </div>

              <div>
                <label htmlFor="color_scheme" className="block text-sm font-medium text-gray-700 mb-2">
                  Color Scheme
                </label>
                <select
                  id="color_scheme"
                  name="color_scheme"
                  value={formData.color_scheme}
                  onChange={handleInputChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 p-3"
                >
                  <option value="brand-colors">Brand Colors</option>
                  <option value="bright-vibrant">Bright & Vibrant</option>
                  <option value="dark-bold">Dark & Bold</option>
                  <option value="soft-pastel">Soft & Pastel</option>
                  <option value="monochrome">Monochrome</option>
                  <option value="warm-tones">Warm Tones</option>
                  <option value="cool-tones">Cool Tones</option>
                  <option value="dark-neon">Dark with Neon Accents</option>
                </select>
              </div>

              <div>
                <label htmlFor="platform" className="block text-sm font-medium text-gray-700 mb-2">
                  Platform
                </label>
                <select
                  id="platform"
                  name="platform"
                  value={formData.platform}
                  onChange={handleInputChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 p-3"
                >
                  <option value="instagram">Instagram</option>
                  <option value="facebook">Facebook</option>
                  <option value="twitter">Twitter/X</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="google-ads">Google Ads</option>
                  <option value="pinterest">Pinterest</option>
                  <option value="tiktok">TikTok</option>
                </select>
              </div>

              <div>
                <label htmlFor="image_format" className="block text-sm font-medium text-gray-700 mb-2">
                  Image Format
                </label>
                <select
                  id="image_format"
                  name="image_format"
                  value={formData.image_format}
                  onChange={handleInputChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 p-3"
                >
                  <option value="square">Square (1:1) - Instagram Posts</option>
                  <option value="landscape">Landscape (16:9) - Facebook Ads</option>
                  <option value="portrait">Portrait (4:5) - Instagram Stories</option>
                  <option value="banner">Banner (728x90) - Web Banners</option>
                </select>
              </div>

              <div>
                <label htmlFor="text_emphasis" className="block text-sm font-medium text-gray-700 mb-2">
                  Text Emphasis
                </label>
                <select
                  id="text_emphasis"
                  name="text_emphasis"
                  value={formData.text_emphasis}
                  onChange={handleInputChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 p-3"
                >
                  <option value="minimal">Minimal Text</option>
                  <option value="moderate">Moderate Text</option>
                  <option value="strong">Strong Text Focus</option>
                  <option value="text-heavy">Text-Heavy</option>
                </select>
              </div>
            </div>

            {/* Auto-fill and Submit */}
            <div className="mt-8 space-y-4">
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleAutoFill}
                  className="text-green-600 hover:text-green-700 font-medium"
                >
                  🎯 Auto-fill with example data
                </button>
              </div>
              
              <div className="flex justify-center">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-xl text-white bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Creating Complete Campaign...
                    </>
                  ) : (
                    <>
                      <span>Generate Complete Campaign</span>
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateImageAds;