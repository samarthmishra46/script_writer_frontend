import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FolderPlus, LayoutDashboard,Search , Wallet, ChevronRight, Building2, LogOut, X, Settings, ChevronUp } from 'lucide-react';
import { useBrands } from '../context/useBrands';

// Define user interface to fix TypeScript errors
interface UserData {
  name?: string;
  email?: string;
  [key: string]: any;
}

// Define the structure for the brand data passed from parent components
interface Brand {
  name: string;
  products: string[];
  id: string;
  logo?: string | null;
  productCount?: number;
  adCount?: number;
}

interface SidebarProps {
  refreshTrigger?: number;
  onCloseMobile?: () => void;
  brandsData?: Brand[];
  brandsLoading?: boolean;
  brandsError?: string | null;
  // Add a source prop to identify which component is rendering the sidebar
  source?: 'dashboard' | 'scriptGroup' | 'other';
}

const Sidebar: React.FC<SidebarProps> = ({
  onCloseMobile,
  brandsData = [],
  brandsLoading = false,
  brandsError = null,
  source = 'other'
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  // Add a try-catch block to handle potential JSON parsing errors
  let user: UserData = { name: '', email: '' };
  try {
    const userString = localStorage.getItem('user');
    if (userString) {
      const parsedUser = JSON.parse(userString);
      user = {
        name: parsedUser.name || '',
        email: parsedUser.email || '',
        ...parsedUser
      };
    }
  
  } catch (err) {
    console.error("Error parsing user data from localStorage:", err);
  }
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Use shared context when available
  const brandsContext = useBrands();
  
  // Use context data if available, otherwise use props
  const effectiveBrandsData = brandsContext.brands && brandsContext.brands.length > 0 ? brandsContext.brands : brandsData;
  const effectiveBrandsLoading = source === 'dashboard' ? brandsLoading : brandsContext.loading;
  const effectiveBrandsError = source === 'dashboard' ? brandsError : brandsContext.error;
  
  // Debug logs for brands data
 
  
  // Save brands data from dashboard to context
  useEffect(() => {
    // Only update if source is dashboard, there is data, and it's different from what's in context
    if (source === 'dashboard' && 
        brandsData && 
        brandsData.length > 0 && 
        !brandsLoading && 
        JSON.stringify(brandsData) !== JSON.stringify(brandsContext.brands)) {
      
      brandsContext.updateBrands(brandsData);
    }
  }, [source, brandsData, brandsLoading, brandsContext.brands, brandsContext.updateBrands]);

  const handleBrandClick = (brandId: string) => {
    if (brandId) {
      navigate(`/brands/${brandId}`);
    }
  };

  const handleCreateForBrand = (e: React.MouseEvent, brandName: string) => {
    e.stopPropagation();
    navigate('/create-campaign', { state: { prefillBrand: brandName } });
  };

  const handleLogout = () => {
    // Show confirmation prompt
    const confirmLogout = window.confirm("Would you like to log out?");
    if (confirmLogout) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  return (
    <div className="w-full  md:w-65 sm:py-2 bg-[#F4F4F4] border h-[95vh] sm:h-screen flex flex-col overflow-hidden">
      {/* Mobile close button - only on mobile */}
      {onCloseMobile && (
        <div className="md:hidden flex justify-end p-2">
          <button 
            onClick={onCloseMobile}
            className="p-2 text-black hover:text-white rounded-full hover:bg-[#474747]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
    
      {/* Logo */}
      <div className="p-4 mb-4 md:mb-6 flex items-center">
        <Link to="/">
          <h1 className="text-2xl font-bold text-purple-500">Leepi AI</h1>
        </Link>
        
      </div>

      {/* Navigation */}
      <div className="flex-1 px-2 md:px-4 rounded-lg overflow-y-auto">
        {/* Navigation items */}
        <div className="space-y-1">

          <Link
            to="/create-campaign"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              location.pathname === '/create-campaign'
                ? 'bg-[#474747] text-white'
                : 'text-[#272727] hover:bg-[#474747] hover:text-white'
            }`}
          >
            <FolderPlus className="w-5 h-5" />
            <span>Create Campaign</span>
          </Link>
          <Link
            to="/dashboard#search-input"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              location.pathname === '/dashboard'
                ? 'bg-[#474747] text-white'
                : 'text-[#272727] hover:bg-[#474747] hover:text-white'
            }`}
          >
            <Search className="w-5 h-5" />
            <span>Search Campaign</span>
          </Link>
          
          
          
        </div>

        {/* Brands list */}
        <div className="mt-6 md:mt-8">
          <div className="flex items-center justify-between px-2 md:px-4 mb-2 md:mb-3">
            <h3 className="text-sm font-medium text-gray-400">
              Your Brands
            </h3>
            <Link
              to="/create-campaign"
              className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
            >
              + New
            </Link>
          </div>
          
          {/* Brand list - ensure touch friendly sizes */}
          <div className="space-y-1 max-h overflow-y-auto pr-2">
            {effectiveBrandsLoading ? (
              <div className="px-4 py-2 text-gray-400 text-sm">Loading...</div>
            ) : (effectiveBrandsData || []).length > 0 ? (
              (effectiveBrandsData || []).map((brand) => {
                if (!brand) return null;
                const productCount = brand.productCount ?? brand.products?.length ?? 0;
                const adCount = brand.adCount ?? 0;

                return (
                  <button
                    key={brand.id}
                    onClick={() => handleBrandClick(brand.id)}
                    className="w-full text-left px-3 py-3 md:py-3 bg-white hover:bg-[#a8adb5] rounded-lg transition-all duration-200 group flex items-center gap-3 border border-transparent hover:border-gray-200"
                  >
                    {brand.logo ? (
                      <img
                        src={brand.logo}
                        alt={brand.name}
                        className="w-10 h-10 rounded-lg object-contain border border-gray-200 bg-white p-1"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <span className="text-white font-bold text-xs">
                          {brand.name?.charAt(0)?.toUpperCase() || "?"}
                        </span>
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate text-[#272727] group-hover:text-black">
                        {brand.name || "Unknown Brand"}
                      </p>
                      <div className="mt-1 flex items-center gap-2 text-xs text-gray-400 group-hover:text-[#272727]">
                        <span>{productCount} {productCount === 1 ? 'Product' : 'Products'}</span>
                        <span>•</span>
                        <span>{adCount} {adCount === 1 ? 'Ad' : 'Ads'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => handleCreateForBrand(e, brand.name)}
                        className="w-7 h-7 rounded-full hover:bg-gray-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        title={`Create campaign for ${brand.name}`}
                      >
                        <FolderPlus className="w-3.5 h-3.5 text-[#272727] hover:text-white" />
                      </button>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-black" />
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="px-4 py-8 text-center">
                <div className="w-12 h-12 bg-[#474747] rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Building2 className="w-6 h-6 text-gray-400" />
                </div>
                {effectiveBrandsError ? (
                  <p className="text-red-400 text-sm mb-2">{effectiveBrandsError}</p>
                ) : (
                  <p className="text-gray-400 text-sm mb-2">No brands yet</p>
                )}
                <Link
                  to="/ad-type-selector"
                  className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
                >
                  Create your first ad
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>




      {/* Footer - User information */}
      <div className="p-4 border-t border-[#474747] relative">
        {/* User info */}
        <div className="bg-[#474747] rounded-lg p-3 flex items-center justify-between">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center space-x-3 focus:outline-none flex-grow"
            aria-haspopup="true"
            aria-expanded={isDropdownOpen}
          >
            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {user && user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-white text-sm font-medium truncate">
                {user && user.name ? user.name : 'User'}
              </p>
              <p className="text-white text-xs truncate">
                {user && user.email ? user.email : 'user@example.com'}
              </p>
            </div>
            <ChevronUp className="w-4 h-4 text-gray-400" />
          </button>
          
        </div>
        
        {isDropdownOpen && (
          <div className="absolute left-4 right-4 bottom-full mb-2 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
            <div className="p-2 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900 truncate">{user && user.name ? user.name : 'User'}</p>
              <p className="text-xs text-gray-500 truncate">{user && user.email ? user.email : 'user@example.com'}</p>
            </div>
            <div className="py-1">
              <Link
                to="/dashboard"
                className="flex items-center px-4 py-2 text-sm text-[#474747] hover:bg-gray-100"
                onClick={() => setIsDropdownOpen(false)}
              >
                 <LayoutDashboard className="w-4 h-4 mr-2" />
                Dashboard
              </Link>
              <Link
                to="/subscription"
                className="flex items-center px-4 py-2 text-sm text-[#474747] hover:bg-gray-100"
                onClick={() => setIsDropdownOpen(false)}
              >
                 <Wallet className="w-4 h-4 mr-2"  />
                Subscription
              </Link>
              <Link
                to="/settings"
                className="flex items-center px-4 py-2 text-sm text-[#474747] hover:bg-gray-100"
                onClick={() => setIsDropdownOpen(false)}
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  setIsDropdownOpen(false);
                }}
                className="flex items-center w-full text-left px-4 py-2 text-sm text-[#474747] hover:bg-gray-100"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Wrap with React.memo and implement custom comparison
export default React.memo(Sidebar, (prevProps, nextProps) => {
  // Always re-render if coming from Dashboard or ScriptGroup
  if (nextProps.source === 'dashboard' || nextProps.source === 'scriptGroup') {
    return false; // Don't prevent re-render
  }
  
  // For other components, only re-render if specific props change
  const brandsChanged = 
    prevProps.brandsData?.length !== nextProps.brandsData?.length ||
    JSON.stringify(prevProps.brandsData) !== JSON.stringify(nextProps.brandsData);
    
  const loadingChanged = prevProps.brandsLoading !== nextProps.brandsLoading;
  const errorChanged = prevProps.brandsError !== nextProps.brandsError;
  const triggerChanged = prevProps.refreshTrigger !== nextProps.refreshTrigger;
  
  // Return true to prevent re-render, false to allow it
  // If anything changed, we want to re-render, so return false
  return !(brandsChanged || loadingChanged || errorChanged || triggerChanged);
});