import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Package,
  Image as ImageIcon,
  Video,
  FileText,
  Users,
  Loader2,
  MoreVertical,
  Trash2,
  Edit,
  Upload,
  X
} from 'lucide-react';
import { buildApiUrl } from '../config/api';

interface Product {
  _id: string;
  name: string;
  description: string;
  images: string[];
  primaryImage: string | null;
  category: string;
  adCount: number;
  createdAt: string;
}

interface Ad {
  _id: string;
  title: string;
  adType: 'image' | 'video' | 'ugc' | 'script';
  status: string;
  createdAt: string;
  generatedImages?: Array<{ imageUrl: string }>;
  savedImages?: Array<{ imageUrl: string }>;
  thumbnailUrl?: string;
}

interface Brand {
  _id: string;
  name: string;
  logo: string | null;
  initials?: string;
}

const ProductsList: React.FC = () => {
  const navigate = useNavigate();
  const { brandId } = useParams<{ brandId: string }>();
  
  const [brand, setBrand] = useState<Brand | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [ads, setAds] = useState<Ad[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<{ type: 'product' | 'ad'; id: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Edit brand modal state
  const [showEditBrandModal, setShowEditBrandModal] = useState(false);
  const [editBrandName, setEditBrandName] = useState('');
  const [editBrandLogo, setEditBrandLogo] = useState<File | null>(null);
  const [editBrandLogoPreview, setEditBrandLogoPreview] = useState<string | null>(null);
  const [isUpdatingBrand, setIsUpdatingBrand] = useState(false);

  const fetchBrandData = useCallback(async () => {
    if (!brandId) return;

    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');

      if (!token) {
        navigate('/login');
        return;
      }

      // Fetch brand with products
      const brandResponse = await fetch(buildApiUrl(`api/brands/${brandId}`), {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!brandResponse.ok) {
        throw new Error('Failed to fetch brand');
      }

      const brandResult = await brandResponse.json();
      setBrand(brandResult.data);
      setProducts(brandResult.data.products || []);
      setAds(brandResult.data.ads || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load brand data');
    } finally {
      setIsLoading(false);
    }
  }, [brandId, navigate]);

  useEffect(() => {
    fetchBrandData();
  }, [fetchBrandData]);

  const handleDeleteProduct = async (productId: string) => {
    try {
      setIsDeleting(true);
      const token = localStorage.getItem('token');

      const response = await fetch(buildApiUrl(`api/brands/${brandId}/products/${productId}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete product');
      }

      setProducts(prev => prev.filter(p => p._id !== productId));
      setShowDeleteModal(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete product');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteAd = async (adId: string) => {
    try {
      setIsDeleting(true);
      const token = localStorage.getItem('token');

      const response = await fetch(buildApiUrl(`api/ads/${adId}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete ad');
      }

      setAds(prev => prev.filter(a => a._id !== adId));
      setShowDeleteModal(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete ad');
    } finally {
      setIsDeleting(false);
    }
  };

  // Open edit brand modal
  const openEditBrandModal = () => {
    setEditBrandName(brand?.name || '');
    setEditBrandLogoPreview(brand?.logo || null);
    setEditBrandLogo(null);
    setShowEditBrandModal(true);
  };

  // Handle logo file selection
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Image must be less than 5MB');
        return;
      }
      setEditBrandLogo(file);
      setEditBrandLogoPreview(URL.createObjectURL(file));
    }
  };

  // Remove selected logo
  const removeLogoPreview = () => {
    if (editBrandLogoPreview && editBrandLogo) {
      URL.revokeObjectURL(editBrandLogoPreview);
    }
    setEditBrandLogo(null);
    setEditBrandLogoPreview(null);
  };

  // Update brand
  const handleUpdateBrand = async () => {
    if (!editBrandName.trim()) {
      setError('Brand name is required');
      return;
    }

    try {
      setIsUpdatingBrand(true);
      setError(null);
      const token = localStorage.getItem('token');

      const formData = new FormData();
      formData.append('name', editBrandName.trim());
      if (editBrandLogo) {
        formData.append('brandImage', editBrandLogo);
      }

      const response = await fetch(buildApiUrl(`api/brands/${brandId}`), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to update brand');
      }

      const result = await response.json();
      setBrand(result.data);
      setShowEditBrandModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update brand');
    } finally {
      setIsUpdatingBrand(false);
    }
  };

  const getAdTypeIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <ImageIcon className="w-4 h-4" />;
      case 'video':
        return <Video className="w-4 h-4" />;
      case 'ugc':
        return <Users className="w-4 h-4" />;
      case 'script':
        return <FileText className="w-4 h-4" />;
      default:
        return <ImageIcon className="w-4 h-4" />;
    }
  };

  const getAdThumbnail = (ad: Ad) => {
    if (ad.savedImages && ad.savedImages.length > 0) {
      return ad.savedImages[0].imageUrl;
    }
    if (ad.generatedImages && ad.generatedImages.length > 0) {
      return ad.generatedImages[0].imageUrl;
    }
    if (ad.thumbnailUrl) {
      return ad.thumbnailUrl;
    }
    return null;
  };

  const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
    const [showMenu, setShowMenu] = useState(false);

    return (
      <div
        className="bg-white rounded-2xl p-5 border border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all cursor-pointer group relative"
        onClick={() => navigate(`/brands/${brandId}/products/${product._id}`)}
      >
        {/* Menu Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity z-10"
        >
          <MoreVertical className="w-5 h-5 text-gray-500" />
        </button>

        {/* Dropdown Menu */}
        {showMenu && (
          <div
            className="absolute top-12 right-4 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-20"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                setShowMenu(false);
                setShowDeleteModal({ type: 'product', id: product._id });
              }}
              className="flex items-center gap-2 px-4 py-2 hover:bg-red-50 w-full text-left text-red-600"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          </div>
        )}

        {/* Product Image */}
        <div className="aspect-square rounded-xl bg-gray-100 mb-4 overflow-hidden">
          {product.primaryImage || product.images?.[0] ? (
            <img
              src={product.primaryImage || product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-12 h-12 text-gray-300" />
            </div>
          )}
        </div>

        {/* Product Info */}
        <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">{product.name}</h3>
        <p className="text-sm text-gray-500 mb-3 line-clamp-2">
          {product.description || 'No description'}
        </p>

        {/* Stats */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <ImageIcon className="w-4 h-4 text-gray-400" />
          <span>{product.adCount || 0} Ads</span>
        </div>
      </div>
    );
  };

  const AdCard: React.FC<{ ad: Ad }> = ({ ad }) => {
    const [showMenu, setShowMenu] = useState(false);
    const thumbnail = getAdThumbnail(ad);

    return (
      <div
        className="bg-white rounded-2xl p-4 border border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all cursor-pointer group relative"
        onClick={() => navigate(`/ads/${ad._id}`)}
      >
        {/* Menu Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
          className="absolute top-3 right-3 p-2 rounded-lg hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity z-10"
        >
          <MoreVertical className="w-4 h-4 text-gray-500" />
        </button>

        {/* Dropdown Menu */}
        {showMenu && (
          <div
            className="absolute top-10 right-3 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-20"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                setShowMenu(false);
                setShowDeleteModal({ type: 'ad', id: ad._id });
              }}
              className="flex items-center gap-2 px-4 py-2 hover:bg-red-50 w-full text-left text-red-600"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          </div>
        )}

        {/* Thumbnail */}
        <div className="aspect-square rounded-xl bg-gray-100 mb-3 overflow-hidden">
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={ad.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              {getAdTypeIcon(ad.adType)}
            </div>
          )}
        </div>

        {/* Ad Info */}
        <div className="flex items-center gap-2 mb-1">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            ad.adType === 'image' ? 'bg-purple-100 text-purple-700' :
            ad.adType === 'video' ? 'bg-blue-100 text-blue-700' :
            ad.adType === 'ugc' ? 'bg-green-100 text-green-700' :
            'bg-gray-100 text-gray-700'
          }`}>
            {ad.adType.toUpperCase()}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            ad.status === 'completed' ? 'bg-green-100 text-green-700' :
            ad.status === 'generating' ? 'bg-yellow-100 text-yellow-700' :
            ad.status === 'failed' ? 'bg-red-100 text-red-700' :
            'bg-gray-100 text-gray-700'
          }`}>
            {ad.status}
          </span>
        </div>
        <h4 className="text-sm font-medium text-gray-900 truncate">{ad.title}</h4>
        <p className="text-xs text-gray-500">{new Date(ad.createdAt).toLocaleDateString()}</p>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            {/* Brand Info */}
            <div className="flex items-center gap-3">
              {brand?.logo ? (
                <img
                  src={brand.logo}
                  alt={brand.name}
                  className="w-10 h-10 rounded-xl object-cover border border-gray-200"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                  <span className="text-white font-bold">{brand?.initials || brand?.name?.[0]}</span>
                </div>
              )}
              <div>
                <h1 className="text-lg font-semibold text-gray-900">{brand?.name}</h1>
                <p className="text-sm text-gray-500">{products.length} Products • {ads.length} Ads</p>
              </div>
              
              {/* Edit Brand Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openEditBrandModal();
                }}
                className="ml-2 p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-purple-600 transition-colors"
                title="Edit Brand"
              >
                <Edit className="w-4 h-4" />
              </button>
            </div>
          </div>

          <button
            onClick={() => navigate('/create-campaign', { state: { prefillBrand: brand?.name } })}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-blue-700 transition-all"
          >
            <Plus className="w-5 h-5" />
            Add Product
          </button>
        </div>
      </header>

      {/* Edit Brand Modal */}
      {showEditBrandModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Edit Brand</h2>
              <button
                onClick={() => setShowEditBrandModal(false)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Brand Logo */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brand Logo
              </label>
              <div className="flex items-center gap-4">
                {editBrandLogoPreview ? (
                  <div className="relative">
                    <img
                      src={editBrandLogoPreview}
                      alt="Brand logo preview"
                      className="w-20 h-20 rounded-xl object-cover border border-gray-200"
                    />
                    <button
                      onClick={removeLogoPreview}
                      className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-20 h-20 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-all">
                    <Upload className="w-6 h-6 text-gray-400" />
                    <span className="text-xs text-gray-500 mt-1">Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="hidden"
                    />
                  </label>
                )}
                {editBrandLogoPreview && (
                  <label className="px-3 py-2 text-sm text-purple-600 hover:bg-purple-50 rounded-lg cursor-pointer transition-colors">
                    Change
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Brand Name */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brand Name
              </label>
              <input
                type="text"
                value={editBrandName}
                onChange={(e) => setEditBrandName(e.target.value)}
                placeholder="Enter brand name"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowEditBrandModal(false)}
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateBrand}
                disabled={isUpdatingBrand || !editBrandName.trim()}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isUpdatingBrand ? (
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

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Error State */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 mb-6">
            {error}
          </div>
        )}

        {/* Products Section */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Products</h2>

          {products.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No products yet</p>
              <button
                onClick={() => navigate('/create-campaign', { state: { prefillBrand: brand?.name } })}
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add First Product
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {/* Add Product Card */}
              <div
                onClick={() => navigate('/create-campaign', { state: { prefillBrand: brand?.name } })}
                className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-5 border-2 border-dashed border-purple-300 hover:border-purple-400 transition-all cursor-pointer flex flex-col items-center justify-center min-h-[280px] group"
              >
                <div className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Plus className="w-6 h-6 text-purple-600" />
                </div>
                <span className="text-purple-700 font-medium">Add Product</span>
              </div>

              {products.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </section>

        {/* Recent Ads Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Recent Ads</h2>
            {products.length > 0 && (
              <button
                onClick={() => navigate(`/brands/${brand?._id}/products/${products[0]._id}/select-ad-type`, {
                  state: {
                    brandName: brand?.name,
                    productName: products[0].name,
                    category: products[0].category,
                  }
                })}
                className="text-purple-600 hover:text-purple-700 font-medium text-sm"
              >
                Create New Ad
              </button>
            )}
          </div>

          {ads.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
              <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No ads created yet</p>
              {products.length > 0 && (
                <button
                  onClick={() => navigate(`/brands/${brand?._id}/products/${products[0]._id}/select-ad-type`, {
                    state: {
                      brandName: brand?.name,
                      productName: products[0].name,
                      category: products[0].category,
                    }
                  })}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Create First Ad
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {ads.slice(0, 12).map(ad => (
                <AdCard key={ad._id} ad={ad} />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delete {showDeleteModal.type === 'product' ? 'Product' : 'Ad'}?
            </h3>
            <p className="text-gray-600 mb-6">
              {showDeleteModal.type === 'product'
                ? 'This will permanently delete the product and all associated ads. This action cannot be undone.'
                : 'This will permanently delete this ad. This action cannot be undone.'}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(null)}
                className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (showDeleteModal.type === 'product') {
                    handleDeleteProduct(showDeleteModal.id);
                  } else {
                    handleDeleteAd(showDeleteModal.id);
                  }
                }}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors flex items-center gap-2"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsList;
