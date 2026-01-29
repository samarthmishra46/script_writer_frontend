import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Image as ImageIcon,
  Loader2,
  Heart,
  Trash2,
  Download,
  Eye,
  X,
  Sparkles,
  Edit,
  Upload,
  Video,
} from 'lucide-react';
import { buildApiUrl } from '../config/api';

interface IndividualImage {
  _id: string;
  imageUrl: string;
  prompt: string;
  angle: string;
  status: 'saved' | 'generated' | 'pending' | 'regenerating';
  userAction: string;
  createdAt: string;
  adId: string;
  adType: string;
  category: string;
  brandName: string;
  brandLogo: string | null;
}

interface ProductVideo {
  _id: string;
  url: string;
  platform: string;
  ageGroup: string;
  primaryGoal: string;
  ideaTitle: string;
  createdAt: string;
}

interface Product {
  _id: string;
  name: string;
  description: string;
  images: string[];
  primaryImage: string | null;
  category: string;
  targetAudience?: string;
  usp?: string;
  videos?: ProductVideo[];
}

interface Brand {
  _id: string;
  name: string;
  logo: string | null;
}

const ProductAds: React.FC = () => {
  const navigate = useNavigate();
  const { brandId, productId } = useParams<{ brandId: string; productId: string }>();

  const [brand, setBrand] = useState<Brand | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [images, setImages] = useState<IndividualImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<IndividualImage | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'saved' | 'generated'>('all');
  const [stats, setStats] = useState({ total: 0, saved: 0, generated: 0 });

  const storedUser = localStorage.getItem('user');
  let parsedUser: { subscription?: { status?: string; plan?: string } } | null = null;
  try {
    parsedUser = storedUser ? JSON.parse(storedUser) : null;
  } catch {
    parsedUser = null;
  }
  const hasActivePaidSubscription = Boolean(
    parsedUser?.subscription?.status === 'active' &&
      (parsedUser?.subscription?.plan === 'individual' || parsedUser?.subscription?.plan === 'organization')
  );

  // Edit product modal state
  const [showEditProductModal, setShowEditProductModal] = useState(false);
  const [editProductName, setEditProductName] = useState('');
  const [editProductDescription, setEditProductDescription] = useState('');
  const [editProductImages, setEditProductImages] = useState<string[]>([]);
  const [newProductImages, setNewProductImages] = useState<File[]>([]);
  const [newProductImagePreviews, setNewProductImagePreviews] = useState<string[]>([]);
  const [isUpdatingProduct, setIsUpdatingProduct] = useState(false);
  const [editProductCategory, setEditProductCategory] = useState('');
  const [editProductTargetAudience, setEditProductTargetAudience] = useState('');
  const [editProductUsp, setEditProductUsp] = useState('');

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Fetch brand details
      const brandRes = await fetch(buildApiUrl(`api/brands/${brandId}`), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (brandRes.ok) {
        const brandData = await brandRes.json();
        setBrand(brandData.data);
        
        // Find the product
        const foundProduct = brandData.data.products?.find((p: Product) => p._id === productId);
        setProduct(foundProduct || null);
      }

      // Fetch individual images for this product
      const imagesRes = await fetch(buildApiUrl(`api/ads/images/all?productId=${productId}&brandId=${brandId}`), {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (imagesRes.ok) {
        const imagesData = await imagesRes.json();
        setImages(imagesData.data || []);
        setStats({
          total: imagesData.total || 0,
          saved: imagesData.savedCount || 0,
          generated: imagesData.generatedCount || 0,
        });
      }

    } catch (err) {
      setError('Failed to load data');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [brandId, productId, navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDeleteImage = async () => {
    if (!imageToDelete) return;

    try {
      const token = localStorage.getItem('token');
      // Find the image to get the adId
      const imageToRemove = images.find(img => img._id === imageToDelete);
      if (!imageToRemove) return;

      // Delete the specific image from the ad
      await fetch(buildApiUrl(`api/ads/${imageToRemove.adId}/images/${imageToDelete}`), {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setImages(prev => prev.filter(img => img._id !== imageToDelete));
      setShowDeleteModal(false);
      setImageToDelete(null);
    } catch (err) {
      console.error('Failed to delete image:', err);
    }
  };

  const handleDownload = async (imageUrl: string, imageName: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${imageName}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Failed to download:', err);
    }
  };

  // Open edit product modal
  const openEditProductModal = () => {
    if (product) {
      setEditProductName(product.name);
      setEditProductDescription(product.description || '');
      setEditProductImages(product.images || []);
      setEditProductCategory(product.category || '');
      setEditProductTargetAudience(product.targetAudience || '');
      setEditProductUsp(product.usp || '');
      setNewProductImages([]);
      setNewProductImagePreviews([]);
      setShowEditProductModal(true);
    }
  };

  // Handle new product images
  const handleNewProductImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles: File[] = [];
    const newPreviews: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;
      if (file.size > 5 * 1024 * 1024) continue;
      if (editProductImages.length + newProductImages.length + newFiles.length >= 5) break;

      newFiles.push(file);
      newPreviews.push(URL.createObjectURL(file));
    }

    setNewProductImages(prev => [...prev, ...newFiles]);
    setNewProductImagePreviews(prev => [...prev, ...newPreviews]);
  };

  // Remove existing product image
  const removeExistingImage = (imageUrl: string) => {
    setEditProductImages(prev => prev.filter(img => img !== imageUrl));
  };

  // Remove new product image
  const removeNewImage = (index: number) => {
    URL.revokeObjectURL(newProductImagePreviews[index]);
    setNewProductImages(prev => prev.filter((_, i) => i !== index));
    setNewProductImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Update product
  const handleUpdateProduct = async () => {
    if (!editProductName.trim()) {
      setError('Product name is required');
      return;
    }

    try {
      setIsUpdatingProduct(true);
      setError(null);
      const token = localStorage.getItem('token');

      const formData = new FormData();
      formData.append('name', editProductName.trim());
      formData.append('description', editProductDescription);
      formData.append('category', editProductCategory);
      formData.append('targetAudience', editProductTargetAudience);
      formData.append('usp', editProductUsp);
      formData.append('existingImages', JSON.stringify(editProductImages));

      // Add new images
      newProductImages.forEach((file) => {
        formData.append('productImages', file);
      });

      const response = await fetch(buildApiUrl(`api/brands/${brandId}/products/${productId}`), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to update product');
      }

      const result = await response.json();
      setProduct(result.data);
      setShowEditProductModal(false);
      
      // Clean up previews
      newProductImagePreviews.forEach(url => URL.revokeObjectURL(url));
      setNewProductImages([]);
      setNewProductImagePreviews([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update product');
    } finally {
      setIsUpdatingProduct(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatAngle = (angle: string) => {
    return angle?.replace(/_/g, ' ') || 'Unknown';
  };

  // Filter images based on selected filter
  const filteredImages = images.filter(img => {
    if (filter === 'all') return true;
    if (filter === 'saved') return img.status === 'saved';
    if (filter === 'generated') return img.status === 'generated';
    return true;
  });

  const lockedImageIds = useMemo(() => {
    if (hasActivePaidSubscription) {
      return new Set<string>();
    }

    const grouped = new Map<string, IndividualImage[]>();
    images.forEach((img) => {
      if (img.status !== 'generated') return;
      if (!grouped.has(img.adId)) {
        grouped.set(img.adId, []);
      }
      grouped.get(img.adId)?.push(img);
    });

    const locked = new Set<string>();
    grouped.forEach((list) => {
      const sorted = [...list].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      sorted.slice(2).forEach((img) => locked.add(img._id));
    });
    return locked;
  }, [images, hasActivePaidSubscription]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(`/brands/${brandId}`)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Products</span>
            </button>
          </div>
          
          {/* Product Info */}
          <div className="flex items-center gap-3">
            {product?.primaryImage ? (
              <img
                src={product.primaryImage}
                alt={product.name}
                className="w-10 h-10 rounded-lg object-contain"
              />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <ImageIcon className="w-5 h-5 text-purple-600" />
              </div>
            )}
            <div>
              <h1 className="font-semibold text-gray-900">{product?.name}</h1>
              <p className="text-sm text-gray-500">{brand?.name}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Title & Stats */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Generated Ads</h2>
            <p className="text-gray-600 mt-1">
              {stats.total} image{stats.total !== 1 ? 's' : ''} • {stats.saved} saved • {stats.generated} pending review
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={openEditProductModal}
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all"
            >
              <Edit className="w-4 h-4" />
              Edit Product Info
            </button>
            
            <button
              onClick={() => navigate(`/brands/${brandId}/products/${productId}/select-ad-type`, {
                state: {
                  brandName: brand?.name,
                  productName: product?.name,
                  category: product?.category,
                }
              })}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all"
            >
              <Sparkles className="w-5 h-5" />
              Generate New Ads
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all' 
                ? 'bg-purple-100 text-purple-700' 
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            All ({stats.total})
          </button>
          <button
            onClick={() => setFilter('saved')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
              filter === 'saved' 
                ? 'bg-pink-100 text-pink-700' 
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Heart className="w-4 h-4" />
            Saved ({stats.saved})
          </button>
          <button
            onClick={() => setFilter('generated')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'generated' 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Pending Review ({stats.generated})
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
            {error}
          </div>
        )}

        {/* Videos Section */}
        {product?.videos && product.videos.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Video className="w-5 h-5 text-purple-600" />
                Generated Videos ({product.videos.length})
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {product.videos.map((video) => (
                <div
                  key={video._id}
                  className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg transition-all group"
                >
                  {/* Video Player */}
                  <div className="aspect-video relative bg-black">
                    <video
                      src={video.url}
                      className="w-full h-full object-contain"
                      controls
                      poster={product.primaryImage || undefined}
                    />
                  </div>

                  {/* Card Footer */}
                  <div className="p-4">
                    <p className="text-sm font-medium text-gray-900 truncate mb-2">
                      {video.ideaTitle || 'Video Ad'}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {video.platform && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-600 capitalize">
                          {video.platform.replace('_', ' ')}
                        </span>
                      )}
                      {video.primaryGoal && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-600 capitalize">
                          {video.primaryGoal.replace('_', ' ')}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {video.createdAt ? new Date(video.createdAt).toLocaleDateString() : 'Recently'}
                      </span>
                      <a
                        href={video.url}
                        download
                        className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-700"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Download className="w-3 h-3" />
                        Download
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Image Ads Section Title */}
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-4">
          <ImageIcon className="w-5 h-5 text-purple-600" />
          Image Ads
        </h3>

        {/* Images Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredImages.map((image) => {
            const isLocked = lockedImageIds.has(image._id);
            return (
            <div
              key={image._id}
              className={`bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg transition-all group cursor-pointer ${isLocked ? 'cursor-not-allowed' : ''}`}
              onClick={() => {
                if (isLocked) {
                  navigate('/subscription');
                  return;
                }
                setSelectedImage(image);
              }}
            >
              {/* Image */}
              <div className="aspect-square relative">
                <img
                  src={image.imageUrl}
                  alt={image.angle}
                  className={`w-full h-full object-contain ${isLocked ? 'blur-md' : ''}`}
                />
                {isLocked && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <button
                      className="px-3 py-1.5 bg-white text-gray-900 rounded-lg text-xs font-semibold"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/subscription');
                      }}
                    >
                      Unlock with LiPiCoins
                    </button>
                  </div>
                )}
                
                {/* Overlay on hover */}
                <div className={`absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 ${isLocked ? 'pointer-events-none' : ''}`}>
                  <button 
                    className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImage(image);
                    }}
                  >
                    <Eye className="w-5 h-5 text-gray-700" />
                  </button>
                  <button 
                    className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(image.imageUrl, `ad-${image._id}`);
                    }}
                  >
                    <Download className="w-5 h-5 text-gray-700" />
                  </button>
                </div>

                {/* Status Badge */}
                {image.status === 'saved' && (
                  <div className="absolute top-2 right-2 p-1.5 bg-pink-500 rounded-full">
                    <Heart className="w-3 h-3 text-white fill-current" />
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="p-3">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {formatAngle(image.angle)}
                </p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-gray-500">{formatDate(image.createdAt)}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    image.status === 'saved' 
                      ? 'bg-pink-100 text-pink-600' 
                      : 'bg-blue-100 text-blue-600'
                  }`}>
                    {image.status === 'saved' ? 'Saved' : 'Review'}
                  </span>
                </div>
              </div>
            </div>
          );
          })}
        </div>

        {/* Empty State */}
        {filteredImages.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
            <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {filter === 'all' ? 'No ads yet' : filter === 'saved' ? 'No saved ads' : 'No pending ads'}
            </h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all' 
                ? `Create your first ad campaign for ${product?.name}` 
                : 'Try a different filter'}
            </p>
            {filter === 'all' && (
              <button
                onClick={() => navigate(`/brands/${brandId}/products/${productId}/select-ad-type`, {
                  state: {
                    brandName: brand?.name,
                    productName: product?.name,
                    category: product?.category,
                  }
                })}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all"
              >
                <Plus className="w-5 h-5" />
                Create First Ad
              </button>
            )}
          </div>
        )}
      </main>

      {/* Image Preview Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col">
            {/* Close button */}
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 p-2 text-white hover:text-gray-300 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            
            {/* Image */}
            <div className="flex-1 flex items-center justify-center">
              <img
                src={selectedImage.imageUrl}
                alt={selectedImage.angle}
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
              />
            </div>

            {/* Image Info */}
            <div className="mt-4 bg-white rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{formatAngle(selectedImage.angle)}</h3>
                  <p className="text-sm text-gray-500">{selectedImage.category?.replace(/_/g, ' ')} • {formatDate(selectedImage.createdAt)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownload(selectedImage.imageUrl, `ad-${selectedImage._id}`)}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                  <button
                    onClick={() => {
                      setImageToDelete(selectedImage._id);
                      setShowDeleteModal(true);
                    }}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              {selectedImage.prompt && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Prompt used:</p>
                  <p className="text-sm text-gray-700">{selectedImage.prompt}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Image?</h3>
            <p className="text-gray-600 mb-6">
              This will permanently delete this image. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setImageToDelete(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteImage}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditProductModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl my-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Edit Product Info</h2>
              <button
                onClick={() => setShowEditProductModal(false)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-2">
              {/* Product Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editProductName}
                  onChange={(e) => setEditProductName(e.target.value)}
                  placeholder="Enter product name"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                />
              </div>

              {/* Product Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={editProductDescription}
                  onChange={(e) => setEditProductDescription(e.target.value)}
                  placeholder="Describe your product..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all resize-none"
                />
              </div>

              {/* Target Audience */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Audience
                </label>
                <input
                  type="text"
                  value={editProductTargetAudience}
                  onChange={(e) => setEditProductTargetAudience(e.target.value)}
                  placeholder="e.g., Young professionals, Fitness enthusiasts"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                />
              </div>

              {/* USP */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unique Selling Point
                </label>
                <input
                  type="text"
                  value={editProductUsp}
                  onChange={(e) => setEditProductUsp(e.target.value)}
                  placeholder="What makes your product unique?"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                />
              </div>

              {/* Product Images */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Images <span className="text-gray-400">(Max 5)</span>
                </label>
                
                <div className="flex flex-wrap gap-3">
                  {/* Existing Images */}
                  {editProductImages.map((imageUrl, index) => (
                    <div key={`existing-${index}`} className="relative group">
                      <img
                        src={imageUrl}
                        alt={`Product ${index + 1}`}
                        className="w-24 h-24 object-cover rounded-xl border border-gray-200"
                      />
                      <button
                        onClick={() => removeExistingImage(imageUrl)}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}

                  {/* New Images */}
                  {newProductImagePreviews.map((preview, index) => (
                    <div key={`new-${index}`} className="relative group">
                      <img
                        src={preview}
                        alt={`New ${index + 1}`}
                        className="w-24 h-24 object-cover rounded-xl border-2 border-purple-300"
                      />
                      <div className="absolute top-1 left-1 bg-purple-600 text-white text-xs px-1.5 py-0.5 rounded">
                        New
                      </div>
                      <button
                        onClick={() => removeNewImage(index)}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}

                  {/* Upload Button */}
                  {editProductImages.length + newProductImages.length < 5 && (
                    <label className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-all">
                      <Upload className="w-6 h-6 text-gray-400" />
                      <span className="text-xs text-gray-500 mt-1">Add</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleNewProductImages}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                
                {editProductImages.length + newProductImages.length === 0 && (
                  <p className="text-sm text-gray-500 mt-2">No images added yet</p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
              <button
                onClick={() => setShowEditProductModal(false)}
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateProduct}
                disabled={isUpdatingProduct || !editProductName.trim()}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isUpdatingProduct ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductAds;
