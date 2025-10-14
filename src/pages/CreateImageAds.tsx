import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Image, Loader2, Upload } from 'lucide-react';
import { buildApiUrl } from '../config/api';
import ImageAdViewer from '../components/ImageAdViewer';

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
  product_image?: File | null; // Keep for backward compatibility
  product_image_url?: string; // Keep for backward compatibility
  product_images?: File[]; // New: Support multiple images
  product_image_urls?: string[]; // New: Support multiple image URLs
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
  const [error, setError] = useState<string | null>(null);
  const [generatedAd, setGeneratedAd] = useState<GeneratedImageAd | null>(null);
  const [currentView, setCurrentView] = useState<'form' | 'result'>('form');
  const [isRedirecting, setIsRedirecting] = useState(false);
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
    product_image_url: '',
    product_images: [], // New: Array of selected files
    product_image_urls: [] // New: Array of uploaded URLs
  });

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
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Convert FileList to Array
    const fileArray = Array.from(files);

    // Validate each file
    const validFiles: File[] = [];
    const newImageUrls: string[] = [];

    for (const file of fileArray) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError(`File ${file.name} is not a valid image file`);
        continue;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError(`File ${file.name} is too large. Maximum size is 5MB`);
        continue;
      }

      // Check total files limit (max 5 images)
      if ((formData.product_images?.length || 0) + validFiles.length >= 5) {
        setError('Maximum 5 images allowed');
        break;
      }

      validFiles.push(file);
      // Create local URL for preview
      newImageUrls.push(URL.createObjectURL(file));
    }

    if (validFiles.length === 0) {
      setError('No valid images selected');
      return;
    }

    try {
      setFormData(prev => ({
        ...prev,
        // Add new files to existing array
        product_images: [...(prev.product_images || []), ...validFiles],
        product_image_urls: [...(prev.product_image_urls || []), ...newImageUrls],
        // Keep single image for backward compatibility (use first image)
        product_image: validFiles[0],
        product_image_url: newImageUrls[0]
      }));
      
      setError(null);
      console.log(`✅ Added ${validFiles.length} images. Total: ${(formData.product_images?.length || 0) + validFiles.length}`);
    } catch (error) {
      console.error('Error handling file upload:', error);
      setError('Failed to process image files');
    }
  };

  // New function to remove individual images
  const removeImage = (index: number) => {
    setFormData(prev => {
      const newImages = [...(prev.product_images || [])];
      const newUrls = [...(prev.product_image_urls || [])];
      
      // Revoke the object URL to free memory
      if (newUrls[index]) {
        URL.revokeObjectURL(newUrls[index]);
      }
      
      newImages.splice(index, 1);
      newUrls.splice(index, 1);
      
      return {
        ...prev,
        product_images: newImages,
        product_image_urls: newUrls,
        // Update single image fields for backward compatibility
        product_image: newImages[0] || null,
        product_image_url: newUrls[0] || ''
      };
    });
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

      // If product images are provided, upload them first
      let productImageUrls: string[] = [];
      if (formData.product_images && formData.product_images.length > 0) {
        console.log('📸 Uploading product images...', formData.product_images.length, 'images');
        
        const uploadFormData = new FormData();
        formData.product_images.forEach((file) => {
          uploadFormData.append(`product_images`, file);
        });
        
        const uploadResponse = await fetch(buildApiUrl('api/image-ads/upload-product-images'), {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: uploadFormData
        });

        const uploadData = await uploadResponse.json();
        
        if (!uploadResponse.ok) {
          throw new Error(uploadData.message || 'Failed to upload product images');
        }

        if (uploadData.success && uploadData.imageUrls) {
          productImageUrls = uploadData.imageUrls;
          console.log('✅ Product images uploaded:', productImageUrls.length, 'images');
          
          // Update form data with the Google Cloud Storage URLs
          setFormData(prev => ({
            ...prev,
            product_image_urls: productImageUrls
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
        product_image_urls: productImageUrls // Pass the uploaded URLs array
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
      
      // Set the generated ad and switch to result view
      setGeneratedAd(data.imageAd);
      setCurrentView('result');
      
    } catch (error) {
      console.error('Complete campaign generation error:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate complete campaign');
    } finally {
      setIsLoading(false);
      setIsRedirecting(false);
    }
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
      product_image_url: '',
      product_images: [],
      product_image_urls: []
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

  // Use ImageAdViewer for result view
  if (currentView === 'result' && generatedAd) {
    return (
      <ImageAdViewer 
        imageAd={generatedAd}
        onNewAd={handleNewAd}
        backButtonPath="/ad-type-selector"
        backButtonText="Back to Ad Types"
        headerTitle="Your Complete Campaign"
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div ref={topRef} />
      
      {/* Loading Overlay */}
      {(isLoading || isRedirecting) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md mx-4 text-center">
            <div className="mb-4">
              {isRedirecting ? (
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              ) : (
                <Loader2 className="h-12 w-12 text-purple-600 animate-spin mx-auto" />
              )}
            </div>
            {isRedirecting ? (
              <>
                <h3 className="text-xl font-semibold text-green-700 mb-2">🎉 Campaign Generated Successfully!</h3>
                <p className="text-gray-600">Loading your new image campaign...</p>
                <p className="text-sm text-gray-500 mt-2">You'll see all {generatedAd?.totalImagesGenerated || 15} generated images</p>
              </>
            ) : (
              <>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Creating Your Complete Campaign</h3>
                <p className="text-gray-600">AI is generating 15 diverse images and comprehensive ad copy...</p>
                <p className="text-sm text-gray-500 mt-2">This may take 2-3 minutes</p>
              </>
            )}
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
                <label htmlFor="product_images" className="block text-sm font-medium text-gray-700 mb-2">
                  Product Images (Optional) - Up to 5 images
                </label>
                <div className="mt-2">
                  {/* Show selected images */}
                  {formData.product_images && formData.product_images.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-3">
                        {formData.product_image_urls?.map((url, index) => (
                          <div key={index} className="relative">
                            <img
                              src={url}
                              alt={`Product ${index + 1}`}
                              className="w-20 h-20 object-cover rounded border"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-gray-600 mt-2">
                        {formData.product_images.length}/5 images selected
                      </p>
                    </div>
                  )}
                  
                  {/* Upload area - show if less than 5 images */}
                  {(!formData.product_images || formData.product_images.length < 5) && (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <input
                        type="file"
                        id="product_images"
                        multiple
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <label
                        htmlFor="product_images"
                        className="cursor-pointer inline-block"
                      >
                        <span className="text-gray-600">
                          Choose images or drag and drop
                        </span>
                        <br />
                        <span className="text-xs text-gray-500">
                          PNG, JPG up to 5MB each
                        </span>
                      </label>
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
                      🚀 Generate Complete Campaign
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