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
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [productUrl, setProductUrl] = useState('');
  const [isAutofilling, setIsAutofilling] = useState(false);
  const [autofillNotice, setAutofillNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [autofillMeta, setAutofillMeta] = useState<AutofillMeta | null>(null);
  const [autofillInsights, setAutofillInsights] = useState<string[]>([]);
  const topRef = useRef<HTMLDivElement>(null);
  
  // Progressive loading state
  const [loadingStep, setLoadingStep] = useState<'scripts' | 'images'>('scripts');
  const [imagesCompleted, setImagesCompleted] = useState(0);
  const [totalImages, setTotalImages] = useState(15);

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
          console.log('✅ Product images uploaded:', productImageUrls.length, 'images', uploadData.imageUrls);
          
          // Update form data with the Google Cloud Storage URLs for future reference
          // Note: Don't rely on this state update for the current submission since it's async
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
      
      // Final validation before sending to backend
      console.log('🔍 Final product_image_urls to send:', productImageUrls);

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

      console.log('🎯 Complete campaignData object:', campaignData);
      console.log('🎯 campaignData.product_image_urls specifically:', campaignData.product_image_urls);

      // Reset progress state
      setLoadingStep('scripts');
      setImagesCompleted(0);
      setTotalImages(12);

      // Pre-check credits before starting EventSource
      console.log('💰 Checking credits availability...');
      try {
        const creditCheckResponse = await fetch(buildApiUrl('api/image-ads/check-credits'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ estimateFor: 12 }) // 12 images
        });

        if (!creditCheckResponse.ok) {
          const creditError = await creditCheckResponse.json();
          if (creditCheckResponse.status === 402) {
            // Insufficient credits
            setError(creditError.message || 'You don\'t have enough credits. Please top up your balance.');
            setIsLoading(false);
            return;
          }
        }
      } catch (creditCheckError) {
        console.error('Credit check failed:', creditCheckError);
        // Continue anyway - the streaming endpoint will also check
      }

      // Use EventSource for streaming updates
      console.log('📡 Opening EventSource connection for streaming updates');
      const params = new URLSearchParams();
      params.append('data', JSON.stringify(campaignData));
      params.append('token', token);
      
      const eventSource = new EventSource(
        buildApiUrl(`api/image-ads/generate-complete-campaign-stream?${params.toString()}`)
      );

      eventSource.addEventListener('start', (e) => {
        const data = JSON.parse(e.data);
        console.log('🎬 Stream started:', data);
      });

      eventSource.addEventListener('scripts_start', (e) => {
        const data = JSON.parse(e.data);
        console.log('📝 Scripts generation started:', data);
        setLoadingStep('scripts');
      });

      eventSource.addEventListener('scripts_complete', (e) => {
        const data = JSON.parse(e.data);
        console.log('✅ Scripts complete:', data);
        setLoadingStep('images');
        setTotalImages(data.totalScripts || 15);
      });

      eventSource.addEventListener('images_start', (e) => {
        const data = JSON.parse(e.data);
        console.log('🎨 Image generation started:', data);
        setLoadingStep('images');
      });

      eventSource.addEventListener('image_start', (e) => {
        const data = JSON.parse(e.data);
        console.log(`🖼️ Generating image ${data.scriptNumber}/${data.totalScripts}:`, data.scriptName);
      });

      eventSource.addEventListener('image_complete', (e) => {
        const data = JSON.parse(e.data);
        console.log(`✅ Image ${data.scriptNumber} complete:`, data.scriptName);
        setImagesCompleted(data.progress.completed);
      });

      eventSource.addEventListener('campaign_complete', (e) => {
        const data = JSON.parse(e.data);
        console.log('🎉 Campaign complete!', data);
        setLoadingStep('images');
      });

      eventSource.addEventListener('complete', (e) => {
        const data = JSON.parse(e.data);
        console.log('🏁 Stream complete:', data);
        
        // Set the generated ad and switch to result view
        if (data.imageAd) {
          setGeneratedAd(data.imageAd);
          setCurrentView('result');
        }
        
        eventSource.close();
        setIsLoading(false);
      });

      eventSource.addEventListener('error', (e: Event) => {
        console.error('❌ EventSource error:', e);
        const messageEvent = e as MessageEvent;
        if (messageEvent.data) {
          try {
            const errorData = JSON.parse(messageEvent.data);
            // Check if it's a credit error
            if (errorData.needsTopUp || errorData.requiredCredits) {
              setError('You don\'t have enough credits. Please top up your balance to continue.');
            } else {
              setError(errorData.message || 'Stream error occurred');
            }
          } catch {
            setError('Connection error occurred. Please try again.');
          }
        } else {
          setError('Connection to server lost. Please check your internet connection and try again.');
        }
        eventSource.close();
        setIsLoading(false);
      });

      // Don't set isLoading to false here - EventSource handlers will manage it

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
                {loadingStep === 'scripts' ? (
                  <>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">📝 Generating Ad Scripts</h3>
                    <p className="text-gray-600">AI is creating 15 diverse ad copy variations...</p>
                    <p className="text-sm text-gray-500 mt-2">This will take a moment</p>
                  </>
                ) : (
                  <>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      🎨 Generating Images {imagesCompleted}/{totalImages}
                    </h3>
                    <p className="text-gray-600">Creating high-quality ad images with AI...</p>
                    <div className="mt-4">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-purple-600 h-2.5 rounded-full transition-all duration-500"
                          style={{ width: `${(imagesCompleted / totalImages) * 100}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        {Math.round((imagesCompleted / totalImages) * 100)}% complete
                      </p>
                    </div>
                  </>
                )}
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