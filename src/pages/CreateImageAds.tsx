import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Image, Loader2, Upload, Search, Target, ChevronDown, ChevronUp } from 'lucide-react';
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
  competitor_search_query?: string; // Competitor search term
  meta_access_token?: string; // Optional Meta access token
  // Competitor analysis options
  competitor_countries?: string; // 'ALL' or comma-separated ISO codes
  competitor_ad_status?: 'ACTIVE' | 'INACTIVE' | 'ALL';
  competitor_media_type?: 'ALL' | 'IMAGE' | 'VIDEO';
  competitor_platforms?: string[]; // Publisher platforms
  competitor_date_range?: '7d' | '30d' | '90d' | '180d' | 'all';
}

interface AutofillResponseData {
  brand_name?: string;
  product?: string;
  selling_what?: string;
  target_audience?: string;
  call_to_action?: string;
  visual_style?: string;
  color_scheme?: string;
  text_emphasis?: string;
  platform?: string;
  image_format?: string;
  special_offers?: string;
  insights?: string[];
  product_image_urls?: string[];
  suggested_competitors?: string[];
}

interface AutofillMeta {
  title?: string | null;
  description?: string | null;
  image?: string | null;
  url?: string;
  charactersAnalyzed?: number;
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
  const [productUrl, setProductUrl] = useState('');
  const [isAutofilling, setIsAutofilling] = useState(false);
  const [autofillNotice, setAutofillNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [autofillMeta, setAutofillMeta] = useState<AutofillMeta | null>(null);
  const [autofillInsights, setAutofillInsights] = useState<string[]>([]);
  const [suggestedCompetitors, setSuggestedCompetitors] = useState<string[]>([]);
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
    product_image_urls: [], // New: Array of uploaded URLs
    competitor_search_query: '', // Competitor search term
    // Sensible defaults for competitor analysis
    competitor_countries: 'ALL',
    competitor_ad_status: 'ACTIVE',
    competitor_media_type: 'ALL',
    competitor_platforms: ['FACEBOOK', 'INSTAGRAM'],
    competitor_date_range: '90d',
  });

  // State to show/hide advanced competitor settings
  const [showAdvancedCompetitor, setShowAdvancedCompetitor] = useState(false);

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

  const mergeAutofillIntoForm = (autofill: AutofillResponseData) => {
    setFormData(prev => {
      const next = { ...prev };
      const assignIfPresent = (key: keyof ImageAdFormData, value?: string) => {
        if (typeof value === 'string' && value.trim().length > 0) {
          (next as any)[key] = value;
        }
      };

      assignIfPresent('brand_name', autofill.brand_name);
      assignIfPresent('product', autofill.product);
      assignIfPresent('selling_what', autofill.selling_what);
      assignIfPresent('target_audience', autofill.target_audience);
      assignIfPresent('call_to_action', autofill.call_to_action);
      assignIfPresent('visual_style', autofill.visual_style);
      assignIfPresent('color_scheme', autofill.color_scheme);
      assignIfPresent('text_emphasis', autofill.text_emphasis);
      assignIfPresent('platform', autofill.platform);
      assignIfPresent('image_format', autofill.image_format);
      assignIfPresent('special_offers', autofill.special_offers);

      if (Array.isArray(autofill.product_image_urls) && autofill.product_image_urls.length > 0) {
        next.product_image_urls = autofill.product_image_urls;
        next.product_image_url = autofill.product_image_urls[0];
        next.product_images = [];
      }

      return next;
    });
  };

  const handleAutofillFromUrl = async () => {
    if (!productUrl.trim()) {
      setAutofillNotice({ type: 'error', message: 'Please enter a valid product URL to autofill.' });
      return;
    }

    try {
      new URL(productUrl.trim());
    } catch {
      setAutofillNotice({ type: 'error', message: 'Enter a valid URL including https://.' });
      return;
    }

    try {
      setIsAutofilling(true);
      setAutofillNotice(null);
      setAutofillMeta(null);
      setAutofillInsights([]);

      const token = localStorage.getItem('token');
      if (!token) {
        setAutofillNotice({ type: 'error', message: 'Please login to autofill product details.' });
        return;
      }

      const response = await fetch(buildApiUrl('api/image-ads/autofill-from-url'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ productUrl: productUrl.trim() })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Unable to fetch product details.');
      }

      const autofillData: AutofillResponseData = data.autofill || {};
      mergeAutofillIntoForm(autofillData);

      if (Array.isArray(autofillData.insights)) {
        setAutofillInsights(autofillData.insights.filter(Boolean));
      }

      // Set suggested competitors and auto-fill first one into competitor search
      if (Array.isArray(autofillData.suggested_competitors)) {
        const competitors = autofillData.suggested_competitors.filter(Boolean);
        setSuggestedCompetitors(competitors);
        // Auto-fill first competitor into the search field
        if (competitors.length > 0) {
          setFormData(prev => ({
            ...prev,
            competitor_search_query: competitors[0]
          }));
        }
      }

      const meta: AutofillMeta | undefined = data.meta;
      if (meta) {
        setAutofillMeta(meta);
      }

      setAutofillNotice({
        type: 'success',
        message: 'Product page details imported. Review and fine-tune before generating your campaign.'
      });
    } catch (autofillError) {
      console.error('Autofill error:', autofillError);
      setAutofillNotice({
        type: 'error',
        message: autofillError instanceof Error ? autofillError.message : 'Failed to fetch details from that URL.'
      });
    } finally {
      setIsAutofilling(false);
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
        setIsLoading(false);
        return;
      }

      console.log('🚀 Starting campaign generation with data:', formData);

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
          console.log('✅ Product images uploaded:', productImageUrls.length, 'images', uploadData.imageUrls);
          
          // Update form data with the Google Cloud Storage URLs for future reference
          setFormData(prev => ({
            ...prev,
            product_image_urls: productImageUrls
          }));
        }
      }

      // Use productImageUrls from upload, or fall back to existing URLs in state
      if (productImageUrls.length === 0 && formData.product_image_urls && formData.product_image_urls.length > 0) {
        productImageUrls = [...formData.product_image_urls];
        console.log('ℹ️ Using existing product_image_urls from form data:', productImageUrls);
      }
      
      // Calculate date range for competitor analysis
      const getDateRange = () => {
        if (!formData.competitor_date_range || formData.competitor_date_range === 'all') {
          return {};
        }
        const days = parseInt(formData.competitor_date_range.replace('d', ''), 10);
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        return {
          ad_delivery_date_min: startDate.toISOString().split('T')[0],
          ad_delivery_date_max: endDate.toISOString().split('T')[0],
        };
      };

      // Prepare campaign data
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
        product_image_urls: productImageUrls,
        competitor_search_query: formData.competitor_search_query || '',
        competitor_options: formData.competitor_search_query ? {
          ad_reached_countries: formData.competitor_countries || 'ALL',
          ad_active_status: formData.competitor_ad_status || 'ACTIVE',
          media_type: formData.competitor_media_type || 'ALL',
          publisher_platforms: formData.competitor_platforms?.length ? formData.competitor_platforms : ['FACEBOOK', 'INSTAGRAM'],
          ...getDateRange(),
        } : undefined,
      };

      // If competitor search query is provided, go to strategy selection page
      if (formData.competitor_search_query && formData.competitor_search_query.trim()) {
        console.log('🎯 Competitor query provided, redirecting to strategy selection...');
        setIsLoading(false);
        navigate('/create-image-ads/competitor-strategy', {
          state: { campaignData }
        });
        return;
      }

      // No competitor query - go directly to generating page
      console.log('🚀 No competitor query, going directly to generation...');
      setIsLoading(false);
      navigate('/create-image-ads/generating', {
        state: { campaignData }
      });

    } catch (error) {
      console.error('Campaign setup error:', error);
      setError(error instanceof Error ? error.message : 'Failed to start campaign generation');
      setIsLoading(false);
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
    setProductUrl('');
    setAutofillNotice(null);
    setAutofillMeta(null);
    setAutofillInsights([]);
    setSuggestedCompetitors([]);
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
      product_image_url: '',
      product_images: [],
      product_image_urls: []
    });
    setProductUrl('');
    setAutofillNotice(null);
    setAutofillMeta(null);
    setAutofillInsights([]);
    setSuggestedCompetitors([]);
  };

  const uploadedImageCount = formData.product_images?.length ?? 0;
  const urlImageCount = formData.product_image_urls?.length ?? 0;
  const totalImageCount = Math.max(uploadedImageCount, urlImageCount);
  const hasAnyImages = totalImageCount > 0;

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
      
      {/* Loading Overlay - only for image upload and navigation */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md mx-4 text-center">
            <div className="mb-4">
              <Loader2 className="h-12 w-12 text-purple-600 animate-spin mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Preparing Your Campaign</h3>
            <p className="text-gray-600">Uploading images and preparing data...</p>
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

              <div className="md:col-span-2">
                <label htmlFor="product_url" className="block text-sm font-medium text-gray-700 mb-2">
                  Product URL
                </label>
                <div className="flex flex-col md:flex-row gap-3">
                  <input
                    type="url"
                    id="product_url"
                    name="product_url"
                    value={productUrl}
                    onChange={(event) => setProductUrl(event.target.value)}
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 p-3"
                    placeholder="https://yourproduct.com/page"
                  />
                  <button
                    type="button"
                    onClick={handleAutofillFromUrl}
                    disabled={isAutofilling}
                    className="inline-flex items-center justify-center px-4 py-3 rounded-md border border-green-600 text-green-600 hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isAutofilling ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Fetching...
                      </>
                    ) : (
                      <>
                        🔎 Autofill from URL
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  We’ll scrape the page, extract product details with AI, and pre-fill the fields. Everything stays editable.
                </p>

                {autofillNotice && (
                  <div
                    className={`mt-3 rounded-lg border p-3 text-sm ${
                      autofillNotice.type === 'success'
                        ? 'border-green-200 bg-green-50 text-green-700'
                        : 'border-red-200 bg-red-50 text-red-700'
                    }`}
                  >
                    {autofillNotice.message}
                  </div>
                )}

                {(autofillInsights.length > 0 || (autofillMeta?.title || autofillMeta?.description)) && (
                  <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
                    {autofillMeta?.title && (
                      <p className="text-sm font-semibold text-gray-800">{autofillMeta.title}</p>
                    )}
                    {autofillMeta?.description && (
                      <p className="text-xs text-gray-600 mt-1">{autofillMeta.description}</p>
                    )}
                    {autofillInsights.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">AI Highlights</p>
                        <ul className="mt-1 space-y-1 text-xs text-gray-600 list-disc list-inside">
                          {autofillInsights.map((insight, index) => (
                            <li key={index}>{insight}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {autofillMeta?.url && (
                      <p className="mt-3 text-xs text-gray-500">
                        Source: <span className="break-all">{autofillMeta.url}</span>
                      </p>
                    )}
                  </div>
                )}
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
                  {hasAnyImages && (
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
                        {uploadedImageCount > 0
                          ? `${uploadedImageCount}/5 images selected`
                          : `${totalImageCount} image${totalImageCount === 1 ? '' : 's'} available`}
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
                  Call to Action * <span className="text-xs text-gray-500 font-normal">(Shown on ad image)</span>
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
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="text-xs text-gray-500">Quick select:</span>
                  {['Shop Now', 'Learn More', 'Get Started', 'Subscribe Now', 'Buy Now', 'Try Free', 'Book Now', 'Sign Up'].map((cta) => (
                    <button
                      key={cta}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, call_to_action: cta }))}
                      className={`text-xs px-2 py-1 rounded-full transition-colors ${
                        formData.call_to_action === cta
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {cta}
                    </button>
                  ))}
                </div>
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

              {/* Competitor Analysis Section */}
              <div className="md:col-span-2 mt-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <Target className="h-6 w-6 text-purple-600" />
                  Competitor Intelligence (Optional)
                </h2>
                <p className="text-sm text-gray-500 mb-4">
                  Enter a competitor brand or product name to analyze their Meta ads and create differentiated creatives.
                </p>
              </div>

              <div className="md:col-span-2">
                <label htmlFor="competitor_search_query" className="block text-sm font-medium text-gray-700 mb-2">
                  <Search className="inline h-4 w-4 mr-1" />
                  Competitor Search Query
                </label>
                <input
                  type="text"
                  id="competitor_search_query"
                  name="competitor_search_query"
                  value={formData.competitor_search_query || ''}
                  onChange={handleInputChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 p-3"
                  placeholder="e.g., 'Nike running shoes' or 'Glossier skincare'"
                />
                
                {/* Suggested Competitors from Autofill */}
                {suggestedCompetitors.length > 0 && (
                  <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <p className="text-xs font-semibold text-purple-700 mb-2">
                      🎯 Suggested Competitors (click to select):
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {suggestedCompetitors.map((competitor, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, competitor_search_query: competitor }))}
                          className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                            formData.competitor_search_query === competitor
                              ? 'bg-purple-600 text-white'
                              : 'bg-white text-purple-700 border border-purple-300 hover:bg-purple-100'
                          }`}
                        >
                          {competitor}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                <p className="mt-1 text-xs text-gray-400">
                  Leave empty to skip competitor analysis and use standard creative generation.
                </p>
              </div>

              {/* Advanced Competitor Settings - Collapsible */}
              {formData.competitor_search_query && (
                <div className="md:col-span-2">
                  <button
                    type="button"
                    onClick={() => setShowAdvancedCompetitor(!showAdvancedCompetitor)}
                    className="flex items-center text-sm text-purple-600 hover:text-purple-700 font-medium mb-3"
                  >
                    {showAdvancedCompetitor ? (
                      <ChevronUp className="h-4 w-4 mr-1" />
                    ) : (
                      <ChevronDown className="h-4 w-4 mr-1" />
                    )}
                    {showAdvancedCompetitor ? 'Hide' : 'Show'} Advanced Filters
                  </button>

                  {showAdvancedCompetitor && (
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 space-y-4">
                      <p className="text-xs text-purple-600 mb-3">
                        Fine-tune your competitor search. These defaults work well for most cases.
                      </p>

                      <div className="grid md:grid-cols-2 gap-4">
                        {/* Countries */}
                        <div>
                          <label htmlFor="competitor_countries" className="block text-sm font-medium text-gray-700 mb-1">
                            Target Countries
                          </label>
                          <select
                            id="competitor_countries"
                            name="competitor_countries"
                            value={formData.competitor_countries || 'ALL'}
                            onChange={handleInputChange}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 p-2 text-sm"
                          >
                            <option value="ALL">All Countries</option>
                            <option value="US">United States</option>
                            <option value="GB">United Kingdom</option>
                            <option value="IN">India</option>
                            <option value="CA">Canada</option>
                            <option value="AU">Australia</option>
                            <option value="DE">Germany</option>
                            <option value="FR">France</option>
                            <option value="BR">Brazil</option>
                            <option value="US,GB,CA,AU">English-speaking (US, UK, CA, AU)</option>
                            <option value="US,CA">North America</option>
                            <option value="DE,FR,IT,ES">Western Europe</option>
                          </select>
                          <p className="text-xs text-gray-400 mt-1">Where ads were shown</p>
                        </div>

                        {/* Ad Status */}
                        <div>
                          <label htmlFor="competitor_ad_status" className="block text-sm font-medium text-gray-700 mb-1">
                            Ad Status
                          </label>
                          <select
                            id="competitor_ad_status"
                            name="competitor_ad_status"
                            value={formData.competitor_ad_status || 'ACTIVE'}
                            onChange={handleInputChange}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 p-2 text-sm"
                          >
                            <option value="ACTIVE">Active Only (Recommended)</option>
                            <option value="ALL">All Ads</option>
                            <option value="INACTIVE">Inactive Only</option>
                          </select>
                          <p className="text-xs text-gray-400 mt-1">Active ads show current strategies</p>
                        </div>

                        {/* Media Type */}
                        <div>
                          <label htmlFor="competitor_media_type" className="block text-sm font-medium text-gray-700 mb-1">
                            Media Type
                          </label>
                          <select
                            id="competitor_media_type"
                            name="competitor_media_type"
                            value={formData.competitor_media_type || 'ALL'}
                            onChange={handleInputChange}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 p-2 text-sm"
                          >
                            <option value="ALL">All Media Types</option>
                            <option value="IMAGE">Images Only</option>
                            <option value="VIDEO">Videos Only</option>
                          </select>
                          <p className="text-xs text-gray-400 mt-1">Filter by creative format</p>
                        </div>

                        {/* Date Range */}
                        <div>
                          <label htmlFor="competitor_date_range" className="block text-sm font-medium text-gray-700 mb-1">
                            Date Range
                          </label>
                          <select
                            id="competitor_date_range"
                            name="competitor_date_range"
                            value={formData.competitor_date_range || '90d'}
                            onChange={handleInputChange}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 p-2 text-sm"
                          >
                            <option value="7d">Last 7 days</option>
                            <option value="30d">Last 30 days</option>
                            <option value="90d">Last 90 days (Recommended)</option>
                            <option value="180d">Last 6 months</option>
                            <option value="all">All time</option>
                          </select>
                          <p className="text-xs text-gray-400 mt-1">Recent ads = current trends</p>
                        </div>
                      </div>

                      {/* Platform Checkboxes */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Platforms to Search
                        </label>
                        <div className="flex flex-wrap gap-3">
                          {[
                            { value: 'FACEBOOK', label: 'Facebook' },
                            { value: 'INSTAGRAM', label: 'Instagram' },
                            { value: 'MESSENGER', label: 'Messenger' },
                            { value: 'AUDIENCE_NETWORK', label: 'Audience Network' },
                          ].map((platform) => (
                            <label key={platform.value} className="inline-flex items-center">
                              <input
                                type="checkbox"
                                checked={formData.competitor_platforms?.includes(platform.value) || false}
                                onChange={(e) => {
                                  const current = formData.competitor_platforms || [];
                                  const updated = e.target.checked
                                    ? [...current, platform.value]
                                    : current.filter((p) => p !== platform.value);
                                  setFormData((prev) => ({ ...prev, competitor_platforms: updated }));
                                }}
                                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                              />
                              <span className="ml-2 text-sm text-gray-700">{platform.label}</span>
                            </label>
                          ))}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">Facebook & Instagram selected by default</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

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