import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Upload, 
  Building2, 
  Package, 
  Image as ImageIcon,
  X,
  Loader2,
  CheckCircle2,
  Link as LinkIcon,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { buildApiUrl } from '../config/api';
import { uploadToGCS, uploadUrlToGCS, GCSImage } from '../utils/gcs';

// Categories 
const CATEGORIES = [
  { value: 'Fitness_Wellness', label: 'Fitness & Wellness' },
  { value: 'Health_Nutrition', label: 'Health & Nutrition' },
  { value: 'Beauty_Personal_Care', label: 'Beauty & Personal Care' },
  { value: 'Fashion_Apparel', label: 'Fashion & Apparel' },
  { value: 'Food_Beverages', label: 'Food & Beverages' },
  { value: 'Home_Living', label: 'Home & Living' },
  { value: 'Electronics_Gadgets', label: 'Electronics & Gadgets' },
  { value: 'Software_Technology', label: 'Software & Technology' },
  { value: 'Automotive_Mobility', label: 'Automotive & Mobility' },
  { value: 'Travel_Tourism', label: 'Travel & Tourism' },
  { value: 'Finance_FinTech', label: 'Finance & FinTech' },
  { value: 'Real_Estate_Property', label: 'Real Estate & Property' },
  { value: 'Education_Learning', label: 'Education & Learning' },
  { value: 'Business_Professional_Services', label: 'Business & Professional Services' },
  { value: 'Entertainment_Media', label: 'Entertainment & Media' },
  { value: 'Gaming', label: 'Gaming' },
  { value: 'Digital_Products', label: 'Digital Products' },
  { value: 'Lifestyle_Luxury', label: 'Lifestyle & Luxury' },
  { value: 'Sustainability_Eco-Friendly', label: 'Sustainability & Eco-Friendly' },
  { value: 'Social_Impact_NGOs', label: 'Social Impact & NGOs' },
  { value: 'Spiritual_Cultural_Products', label: 'Spiritual & Cultural Products' },
];

interface FormData {
  brandName: string;
  productName: string;
  productDescription: string;
  category: string;
  targetAudience: string;
  usp: string;
}

const CreateCampaign: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isScraping, setIsScraping] = useState(false);
  const [isUploadingBrandImage, setIsUploadingBrandImage] = useState(false);
  const [isUploadingProductImages, setIsUploadingProductImages] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scrapeError, setScrapeError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [scrapeSuccess, setScrapeSuccess] = useState(false);
  const [productUrl, setProductUrl] = useState('');
  
  const [formData, setFormData] = useState<FormData>({
    brandName: '',
    productName: '',
    productDescription: '',
    category: '',
    targetAudience: '',
    usp: '',
  });
  
  // Brand image - now stores GCS data
  const [brandImage, setBrandImage] = useState<GCSImage | null>(null);
  const [brandImagePreview, setBrandImagePreview] = useState<string | null>(null);
  
  // Product images - now stores GCS data
  const [productImages, setProductImages] = useState<GCSImage[]>([]);
  const [productImagePreviews, setProductImagePreviews] = useState<string[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(null);
  };

  const handleBrandImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    setIsUploadingBrandImage(true);
    setError(null);
    
    // Show preview immediately
    const previewUrl = URL.createObjectURL(file);
    setBrandImagePreview(previewUrl);

    try {
      // Upload to GCS
      const result = await uploadToGCS(file, 'brands');
      setBrandImage({
        url: result.url,
        objectKey: result.objectKey,
      });
      // Update preview to GCS URL
      URL.revokeObjectURL(previewUrl);
      setBrandImagePreview(result.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload brand image');
      setBrandImagePreview(null);
    } finally {
      setIsUploadingBrandImage(false);
    }
  }, []);

  const handleProductImagesUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const filesToUpload: File[] = [];
    const tempPreviews: string[] = [];

    for (let i = 0; i < files.length; i++) {
      if (productImages.length + filesToUpload.length >= 5) {
        setError('Maximum 5 product images allowed');
        break;
      }

      const file = files[i];
      if (!file.type.startsWith('image/')) continue;
      if (file.size > 5 * 1024 * 1024) continue;

      filesToUpload.push(file);
      tempPreviews.push(URL.createObjectURL(file));
    }

    if (filesToUpload.length === 0) return;

    // Show previews immediately
    setProductImagePreviews(prev => [...prev, ...tempPreviews]);
    setIsUploadingProductImages(true);
    setError(null);

    try {
      // Upload each file to GCS
      const uploadedImages: GCSImage[] = [];
      
      for (const file of filesToUpload) {
        const result = await uploadToGCS(file, 'products');
        uploadedImages.push({
          url: result.url,
          objectKey: result.objectKey,
        });
      }

      // Update state with GCS data
      setProductImages(prev => [...prev, ...uploadedImages]);
      
      // Update previews to GCS URLs
      setProductImagePreviews(prev => {
        const newPreviews = [...prev];
        const startIndex = newPreviews.length - tempPreviews.length;
        uploadedImages.forEach((img, i) => {
          URL.revokeObjectURL(tempPreviews[i]);
          newPreviews[startIndex + i] = img.url;
        });
        return newPreviews;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload product images');
      // Remove failed previews
      setProductImagePreviews(prev => prev.slice(0, prev.length - tempPreviews.length));
      tempPreviews.forEach(url => URL.revokeObjectURL(url));
    } finally {
      setIsUploadingProductImages(false);
    }
  }, [productImages.length]);

  const removeProductImage = (index: number) => {
    setProductImages(prev => prev.filter((_, i) => i !== index));
    setProductImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removeBrandImage = () => {
    setBrandImage(null);
    setBrandImagePreview(null);
  };

  const handleScrapeUrl = async () => {
    if (!productUrl.trim()) {
      setScrapeError('Please enter a product URL');
      return;
    }

    // Basic URL validation
    try {
      new URL(productUrl);
    } catch {
      setScrapeError('Please enter a valid URL (e.g., https://example.com/product)');
      return;
    }

    setIsScraping(true);
    setScrapeError(null);
    setScrapeSuccess(false);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(buildApiUrl('api/scraper/extract'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: productUrl }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to extract product information');
      }

      // Auto-fill form with extracted data
      setFormData(prev => ({
        brandName: result.data.brandName || prev.brandName,
        productName: result.data.productName || prev.productName,
        productDescription: result.data.productDescription || prev.productDescription,
        category: result.data.category || prev.category,
        targetAudience: result.data.targetAudience || prev.targetAudience,
        usp: result.data.usp || prev.usp,
      }));

      // Upload scraped images directly to GCS
      // Brand logo
      if (result.data.brandLogo) {
        setBrandImagePreview(result.data.brandLogo); // Show preview immediately
        try {
          const logoResult = await uploadUrlToGCS(result.data.brandLogo, 'brands');
          setBrandImage({
            url: logoResult.url,
            objectKey: logoResult.objectKey,
          });
          setBrandImagePreview(logoResult.url);
        } catch (err) {
          console.error('Failed to upload brand logo:', err);
          // Keep the original URL as fallback preview
        }
      }
      
      // Product images
      if (result.data.images && result.data.images.length > 0) {
        // Show previews immediately
        setProductImagePreviews(prev => [...prev, ...result.data.images]);
        
        // Upload each to GCS
        const uploadedImages: GCSImage[] = [];
        for (let i = 0; i < result.data.images.length; i++) {
          try {
            const imgResult = await uploadUrlToGCS(result.data.images[i], 'products');
            uploadedImages.push({
              url: imgResult.url,
              objectKey: imgResult.objectKey,
            });
          } catch (err) {
            console.error('Failed to upload product image:', err);
          }
        }
        
        if (uploadedImages.length > 0) {
          setProductImages(prev => [...prev, ...uploadedImages]);
          // Update previews with GCS URLs
          setProductImagePreviews(prev => {
            const existingCount = prev.length - result.data.images.length;
            return [...prev.slice(0, existingCount), ...uploadedImages.map(img => img.url)];
          });
        }
      }

      setScrapeSuccess(true);
      
      // Clear success message after 3 seconds
      setTimeout(() => setScrapeSuccess(false), 3000);

    } catch (err) {
      setScrapeError(err instanceof Error ? err.message : 'Failed to extract data');
    } finally {
      setIsScraping(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.brandName.trim()) {
      setError('Brand name is required');
      return;
    }
    if (!formData.productName.trim()) {
      setError('Product name is required');
      return;
    }
    if (!formData.category) {
      setError('Please select a category');
      return;
    }

    // Check if images are still uploading
    if (isUploadingBrandImage || isUploadingProductImages) {
      setError('Please wait for images to finish uploading');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Send JSON data with GCS URLs
      const submitData = {
        brandName: formData.brandName,
        productName: formData.productName,
        productDescription: formData.productDescription,
        category: formData.category,
        targetAudience: formData.targetAudience,
        usp: formData.usp,
        // Brand image from GCS
        brandLogo: brandImage ? {
          url: brandImage.url,
          objectKey: brandImage.objectKey,
        } : null,
        // Product images from GCS
        productImages: productImages.map(img => ({
          url: img.url,
          objectKey: img.objectKey,
        })),
      };

      const response = await fetch(buildApiUrl('api/brands'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to create brand/product');
      }

      setSuccess(true);
      
      // Navigate to ad type selection with brand and product info
      setTimeout(() => {
        navigate(`/brands/${result.data.brand._id}/products/${result.data.product._id}/select-ad-type`, {
          state: {
            brandId: result.data.brand._id,
            productId: result.data.product._id,
            brandName: result.data.brand.name,
            productName: result.data.product.name,
            category: result.data.product.category,
          }
        });
      }, 1000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Campaign</h1>
          <p className="text-gray-600">Set up your brand and product to start creating ads</p>
        </div>

        {/* Success State */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <span className="text-green-700">Brand and product created successfully! Redirecting...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Auto-Fill from URL Section */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6 border border-purple-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Auto-Fill with AI</h2>
                <p className="text-sm text-gray-600">Paste your product URL and we'll extract the details automatically</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={productUrl}
                  onChange={(e) => {
                    setProductUrl(e.target.value);
                    setScrapeError(null);
                  }}
                  placeholder="https://example.com/your-product-page"
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all bg-white"
                />
              </div>
              <button
                type="button"
                onClick={handleScrapeUrl}
                disabled={isScraping || !productUrl.trim()}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[140px]"
              >
                {isScraping ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Extracting...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Extract Info</span>
                  </>
                )}
              </button>
            </div>

            {/* Scrape Error */}
            {scrapeError && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-red-700">{scrapeError}</span>
              </div>
            )}

            {/* Scrape Success */}
            {scrapeSuccess && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="text-sm text-green-700">Product information extracted successfully! Review and edit below.</span>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 border-t border-gray-200"></div>
            <span className="text-sm text-gray-500">or fill in manually</span>
            <div className="flex-1 border-t border-gray-200"></div>
          </div>

          {/* Brand Section */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Building2 className="w-5 h-5 text-purple-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Brand Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Brand Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="brandName"
                  value={formData.brandName}
                  onChange={handleInputChange}
                  placeholder="e.g., Nike, Apple"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                />
              </div>

              {/* Brand Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand Logo/Icon
                </label>
                {brandImagePreview ? (
                  <div className="relative inline-block">
                    <img
                      src={brandImagePreview}
                      alt="Brand preview"
                      className={`w-20 h-20 object-cover rounded-xl border border-gray-200 ${isUploadingBrandImage ? 'opacity-50' : ''}`}
                    />
                    {isUploadingBrandImage && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                      </div>
                    )}
                    {!isUploadingBrandImage && (
                      <button
                        type="button"
                        onClick={removeBrandImage}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ) : (
                  <label className="flex items-center justify-center w-full h-20 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-all">
                    <div className="flex items-center gap-2 text-gray-500">
                      <Upload className="w-5 h-5" />
                      <span className="text-sm">Upload Logo</span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleBrandImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* Product Section */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Product Information</h2>
            </div>

            <div className="space-y-6">
              {/* Product Name & Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="productName"
                    value={formData.productName}
                    onChange={handleInputChange}
                    placeholder="e.g., Running Shoes, iPhone"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all bg-white"
                  >
                    <option value="">Select a category</option>
                    {CATEGORIES.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Product Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Description
                </label>
                <textarea
                  name="productDescription"
                  value={formData.productDescription}
                  onChange={handleInputChange}
                  placeholder="Describe your product..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all resize-none"
                />
              </div>

              {/* Target Audience & USP */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Audience
                  </label>
                  <input
                    type="text"
                    name="targetAudience"
                    value={formData.targetAudience}
                    onChange={handleInputChange}
                    placeholder="e.g., Young professionals, Fitness enthusiasts"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unique Selling Point
                  </label>
                  <input
                    type="text"
                    name="usp"
                    value={formData.usp}
                    onChange={handleInputChange}
                    placeholder="What makes your product unique?"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Product Images */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Images
                  <span className="text-gray-400 ml-2">(Max 5 images)</span>
                  {isUploadingProductImages && (
                    <span className="text-purple-600 ml-2 inline-flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Uploading...
                    </span>
                  )}
                </label>
                
                <div className="flex flex-wrap gap-4">
                  {/* Preview Images */}
                  {productImagePreviews.map((preview, index) => {
                    const isUploading = isUploadingProductImages && index >= productImages.length;
                    return (
                      <div key={index} className="relative">
                        <img
                          src={preview}
                          alt={`Product ${index + 1}`}
                          className={`w-24 h-24 object-cover rounded-xl border border-gray-200 ${isUploading ? 'opacity-50' : ''}`}
                        />
                        {isUploading && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                          </div>
                        )}
                        {!isUploading && (
                          <button
                            type="button"
                            onClick={() => removeProductImage(index)}
                            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    );
                  })}

                  {/* Upload Button */}
                  {productImages.length < 5 && !isUploadingProductImages && (
                    <label className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-all">
                      <ImageIcon className="w-6 h-6 text-gray-400" />
                      <span className="text-xs text-gray-500 mt-1">Add Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleProductImagesUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  Continue
                  <ArrowLeft className="w-5 h-5 rotate-180" />
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default CreateCampaign;
