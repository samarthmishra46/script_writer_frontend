import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Building2,
  Package,
  Image as ImageIcon,
  Loader2,
  Search,
  MoreVertical,
  Trash2,
  Edit
} from 'lucide-react';
import { buildApiUrl } from '../config/api';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

interface Brand {
  _id: string;
  name: string;
  logo: string | null;
  initials: string;
  productCount: number;
  adCount: number;
  createdAt: string;
  updatedAt: string;
}

const BrandsList: React.FC = () => {
  const navigate = useNavigate();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchBrands = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(buildApiUrl('api/brands'), {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch brands');
      }

      const result = await response.json();
      setBrands(result.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load brands');
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  const handleDeleteBrand = async (brandId: string) => {
    try {
      setIsDeleting(true);
      const token = localStorage.getItem('token');

      const response = await fetch(buildApiUrl(`api/brands/${brandId}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete brand');
      }

      setBrands(prev => prev.filter(b => b._id !== brandId));
      setShowDeleteModal(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete brand');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredBrands = brands.filter(brand =>
    brand.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const BrandCard: React.FC<{ brand: Brand }> = ({ brand }) => {
    const [showMenu, setShowMenu] = useState(false);

    return (
      <div 
        className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all cursor-pointer group relative"
        onClick={() => navigate(`/brands/${brand._id}`)}
      >
        {/* Menu Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <MoreVertical className="w-5 h-5 text-gray-500" />
        </button>

        {/* Dropdown Menu */}
        {showMenu && (
          <div 
            className="absolute top-12 right-4 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => navigate(`/brands/${brand._id}/edit`)}
              className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 w-full text-left"
            >
              <Edit className="w-4 h-4 text-gray-500" />
              <span className="text-gray-700">Edit</span>
            </button>
            <button
              onClick={() => {
                setShowMenu(false);
                setShowDeleteModal(brand._id);
              }}
              className="flex items-center gap-2 px-4 py-2 hover:bg-red-50 w-full text-left text-red-600"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          </div>
        )}

        {/* Brand Icon */}
        <div className="flex items-center gap-4 mb-4">
          {brand.logo ? (
            <img
              src={brand.logo}
              alt={brand.name}
              className="w-16 h-16 rounded-xl object-cover border border-gray-200"
            />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <span className="text-white text-xl font-bold">{brand.initials}</span>
            </div>
          )}
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{brand.name}</h3>
            <p className="text-sm text-gray-500">
              {new Date(brand.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">
              {brand.productCount} {brand.productCount === 1 ? 'Product' : 'Products'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">
              {brand.adCount} {brand.adCount === 1 ? 'Ad' : 'Ads'}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="hidden md:block w-64 border-r border-gray-200">
        <Sidebar 
          brandsData={brands.map(b => ({ name: b.name, products: [], id: b._id }))}
          brandsLoading={isLoading}
          brandsError={error}
          refreshTrigger={0}
          source="other"
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto p-6">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Your Brands</h1>
              <p className="text-gray-600 mt-1">Manage your brands and create new ads</p>
            </div>
            <button
              onClick={() => navigate('/create-campaign')}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Create Campaign
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search brands..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
            />
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 mb-6">
              {error}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && brands.length === 0 && (
            <div className="text-center py-20">
              <div className="w-20 h-20 mx-auto mb-6 bg-purple-100 rounded-full flex items-center justify-center">
                <Building2 className="w-10 h-10 text-purple-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">No brands yet</h2>
              <p className="text-gray-600 mb-6">Create your first brand to start generating ads</p>
              <button
                onClick={() => navigate('/create-campaign')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-blue-700 transition-all"
              >
                <Plus className="w-5 h-5" />
                Create Your First Campaign
              </button>
            </div>
          )}

          {/* Brands Grid */}
          {!isLoading && !error && filteredBrands.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Create New Card */}
              <div
                onClick={() => navigate('/create-campaign')}
                className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-6 border-2 border-dashed border-purple-300 hover:border-purple-400 transition-all cursor-pointer flex flex-col items-center justify-center min-h-[180px] group"
              >
                <div className="w-14 h-14 rounded-full bg-white shadow-md flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Plus className="w-7 h-7 text-purple-600" />
                </div>
                <span className="text-purple-700 font-medium">Create New Campaign</span>
              </div>

              {/* Brand Cards */}
              {filteredBrands.map(brand => (
                <BrandCard key={brand._id} brand={brand} />
              ))}
            </div>
          )}

          {/* No Search Results */}
          {!isLoading && !error && brands.length > 0 && filteredBrands.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600">No brands found matching "{searchTerm}"</p>
            </div>
          )}
        </main>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Brand?</h3>
            <p className="text-gray-600 mb-6">
              This will permanently delete the brand and all associated products and ads. This action cannot be undone.
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
                onClick={() => handleDeleteBrand(showDeleteModal)}
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

export default BrandsList;
