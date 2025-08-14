import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FolderPlus, LayoutDashboard,Search , Wallet, ChevronDown, ChevronRight, Building2, LogOut, Package, X, Settings, ChevronUp } from 'lucide-react';
import { useBrands } from '../context/useBrands';

// Define user interface to fix TypeScript errors
interface UserData {
  name?: string;
  email?: string;
  [key: string]: any;
}

interface Product {
  name: string;
  scriptCount: number;
  firstScriptId: string;
}

interface Company {
  brand_name: string;
  scriptCount: number;
  lastUsed: string;
  products: Product[];
}

// Define the structure for the brand data passed from parent components
interface Brand {
  name: string;
  products: string[];
  id: string;
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
  const [expandedBrands, setExpandedBrands] = useState<Record<string, boolean>>({});
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

  // Convert brandsData to the format used by the component
  const companies: Company[] = (effectiveBrandsData || []).map(brand => {
    if (!brand) return null;
    
    return {
      brand_name: brand.name || "Unknown Brand",
      scriptCount: brand.products ? brand.products.length : 0,
      lastUsed: new Date().toISOString(), // This data isn't provided in brandsData
      products: (brand.products || []).map(product => ({
        name: product || "Unknown Product",
        scriptCount: 1, // We don't have this information from brandsData
        firstScriptId: brand.id || "" // Using brand ID as fallback
      }))
    };
  }).filter(Boolean) as Company[];

  // Toggle brand expansion
  const toggleBrandExpansion = (brandName: string) => {
    setExpandedBrands(prev => ({
      ...prev,
      [brandName]: !prev[brandName]
    }));
  };

  const handleProductClick = (brandName: string, productName: string, firstScriptId: string) => {
    // Navigate to script group for this brand and product
    navigate(`/script-group/${encodeURIComponent(brandName)}/${encodeURIComponent(productName)}/${firstScriptId}`);
  };

  const handleCreateForBrand = (e: React.MouseEvent, brandName: string) => {
    e.stopPropagation(); // Prevent toggling expansion
    // Navigate to create script with pre-filled brand name
    navigate('/create-script', { state: { prefillBrand: brandName } });
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
    <div className="w-full md:w-65 sm:py-2 bg-[#F4F4F4] border h-screen flex flex-col overflow-hidden">
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
            to="/create-script"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              location.pathname === '/create-script'
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

        {/* Companies/Brands with expandable product lists */}
        <div className="mt-6 md:mt-8">
          <div className="flex items-center justify-between px-2 md:px-4 mb-2 md:mb-3">
            <h3 className="text-sm font-medium text-gray-400">
              Your Brands
            </h3>
            <Link
              to="/create-script"
              className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
            >
              + New
            </Link>
          </div>
          
          {/* Brand list - ensure touch friendly sizes */}
          <div className="space-y-1 max-h-96 overflow-y-auto pr-2">
            {effectiveBrandsLoading ? (
              <div className="px-4 py-2 text-gray-400 text-sm">Loading...</div>
            ) : companies.length > 0 ? (
              companies.map((company) => (
                <div key={company.brand_name} className="mb-2">
                  {/* Brand header - make touch friendly */}
                  <button
                    onClick={() => toggleBrandExpansion(company.brand_name)}
                    className="w-full text-left px-3 py-4 md:py-3 text-[#272727]  hover:bg-[#a8adb5] rounded-lg transition-all duration-200 group relative flex items-center justify-between"
                  >
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-xs">
                          {company.brand_name && company.brand_name.length > 0 
                            ? company.brand_name.charAt(0).toUpperCase() 
                            : "?"}
                        </span>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate group-hover:text-black">
                          {company.brand_name || "Unknown Brand"}
                        </p>
                        <p className="text-xs text-gray-400 group-hover:text-[#272727] mt-1">
                          {company.scriptCount} script{company.scriptCount !== 1 ? 's' : ''} • {' '}
                          {new Date(company.lastUsed).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={(e) => handleCreateForBrand(e, company.brand_name)}
                        className="w-6 h-6 rounded-full hover:bg-gray-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        title={`Create script for ${company.brand_name}`}
                      >
                        <FolderPlus className="w-3 h-3 text-[#272727] hover:text-white" />
                      </button>
                      
                      {expandedBrands[company.brand_name] ? (
                        <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-black" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-black" />
                      )}
                    </div>
                    
                    {/* Hover effect line */}
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 to-pink-500 rounded-r opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </button>
                  
                  {/* Product list - make touch friendly */}
                  {expandedBrands[company.brand_name] && company.products.length > 0 && (
                    <div className="ml-8 md:ml-10 mt-1 space-y-1">
                      {company.products.map((product) => (
                        <button
                          key={`${company.brand_name}-${product.name}`}
                          onClick={() => handleProductClick(company.brand_name, product.name, product.firstScriptId)}
                          className="w-full text-left px-3 py-3 md:py-2 text-gray-400 hover:text-white hover:bg-[#474747] rounded-lg transition-all duration-200 flex items-center space-x-2 group"
                        >
                          <Package className="w-3 h-3 text-gray-500 group-hover:text-[#272727]" />
                          <div>
                            <p className="text-xs truncate group-hover:text-white">{product.name}</p>
                            <p className="text-xs text-gray-500">
                              {product.scriptCount} script{product.scriptCount !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))
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
                  to="/create-script"
                  className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
                >
                  Create your first script
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