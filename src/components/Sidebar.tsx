import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FolderPlus, Search, ChevronDown, ChevronRight, Building2, LogOut, Package, X, Settings, ChevronUp } from 'lucide-react';
import { buildApiUrl } from '../config/api';

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

interface SidebarProps {
  campaigns?: Array<{
    id: string;
    name: string;
  }>;
  refreshTrigger?: number;
  onCloseMobile?: () => void; // Add this prop for mobile close functionality
}

// Create a cache outside the component to persist between renders
const companiesCache: {
  data: Company[];
  timestamp: number;
} = {
  data: [],
  timestamp: 0
};

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

const Sidebar: React.FC<SidebarProps> = ({ campaigns = [], refreshTrigger = 0, onCloseMobile }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(false);
  const [expandedBrands, setExpandedBrands] = useState<Record<string, boolean>>({});
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const initialLoadComplete = useRef(false);

  // Toggle brand expansion
  const toggleBrandExpansion = (brandName: string) => {
    setExpandedBrands(prev => ({
      ...prev,
      [brandName]: !prev[brandName]
    }));
  };

  // Fetch companies/brands from scripts with their products
  useEffect(() => {
    const shouldFetchFresh = 
      !initialLoadComplete.current || 
      refreshTrigger > 0 || 
      (Date.now() - companiesCache.timestamp > CACHE_TTL);

    if (shouldFetchFresh) {
      fetchCompanies();
    } else if (companiesCache.data.length > 0) {
      // Use cached data
      setCompanies(companiesCache.data);
      initialLoadComplete.current = true;
    } else {
      fetchCompanies();
    }
  }, [refreshTrigger]);

  const fetchCompanies = async () => {
    try {
      setIsLoadingCompanies(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      // Fetch all scripts to group by brand and product
      const response = await fetch(buildApiUrl('api/scripts'), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        const scripts = result.success ? result.data : result;
        
        // Group scripts by brand_name and then by product
        const brandMap = new Map<string, {
          count: number;
          lastUsed: string;
          products: Map<string, {
            count: number;
            firstScriptId: string;
          }>;
        }>();
        
        scripts.forEach((script: any) => {
          const brandName = script.metadata?.brand_name || script.brand_name || 'Unknown Brand';
          const productName = script.metadata?.product || script.product || 'Unknown Product';
          
          if (!brandMap.has(brandName)) {
            brandMap.set(brandName, {
              count: 1,
              lastUsed: script.createdAt,
              products: new Map([[
                productName, 
                { count: 1, firstScriptId: script._id }
              ]])
            });
          } else {
            const brand = brandMap.get(brandName)!;
            brand.count += 1;
            
            if (new Date(script.createdAt) > new Date(brand.lastUsed)) {
              brand.lastUsed = script.createdAt;
            }
            
            if (!brand.products.has(productName)) {
              brand.products.set(productName, {
                count: 1,
                firstScriptId: script._id
              });
            } else {
              brand.products.get(productName)!.count += 1;
            }
          }
        });

        // Convert the nested maps to arrays
        const companiesData: Company[] = Array.from(brandMap.entries()).map(([brandName, data]) => ({
          brand_name: brandName,
          scriptCount: data.count,
          lastUsed: data.lastUsed,
          products: Array.from(data.products.entries()).map(([productName, productData]) => ({
            name: productName,
            scriptCount: productData.count,
            firstScriptId: productData.firstScriptId
          }))
        }));

        // Sort companies by last used date (most recent first)
        companiesData.sort((a, b) => new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime());
        
        // For each company, sort products by script count (most scripts first)
        companiesData.forEach(company => {
          company.products.sort((a, b) => b.scriptCount - a.scriptCount);
        });
        
        // Update the cache
        companiesCache.data = companiesData;
        companiesCache.timestamp = Date.now();
        
        // Update state
        setCompanies(companiesData);
        initialLoadComplete.current = true;
      }
    } catch (error) {
      console.error('Error fetching companies and products:', error);
    } finally {
      setIsLoadingCompanies(false);
    }
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
      companiesCache.data = []; // Clear cache on logout
      companiesCache.timestamp = 0;
      navigate('/login');
    }
  };

  return (
    <div className="w-full md:w-64 bg-gray-800 h-screen flex flex-col overflow-y-auto">
      {/* Mobile close button - only on mobile */}
      {onCloseMobile && (
        <div className="md:hidden flex justify-end p-2">
          <button 
            onClick={onCloseMobile}
            className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
    
      {/* Logo */}
      <div className="p-4 mb-4 md:mb-6 flex items-center">
        <h1 className="text-2xl font-bold text-purple-500">Leepi AI</h1>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-2 md:px-4 overflow-y-auto">
        {/* Navigation items */}
        <div className="space-y-1">
          <Link
            to="/create-script"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              location.pathname === '/create-script'
                ? 'bg-gray-700 text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            <FolderPlus className="w-5 h-5" />
            <span>Create Script</span>
          </Link>
          
          <Link
            to="/dashboard"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              location.pathname === '/dashboard'
                ? 'bg-gray-700 text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            <Search className="w-5 h-5" />
            <span>Search Script</span>
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
            {isLoadingCompanies ? (
              <div className="px-4 py-2 text-gray-400 text-sm">Loading...</div>
            ) : companies.length > 0 ? (
              companies.map((company) => (
                <div key={company.brand_name} className="mb-2">
                  {/* Brand header - make touch friendly */}
                  <button
                    onClick={() => toggleBrandExpansion(company.brand_name)}
                    className="w-full text-left px-3 py-4 md:py-3 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200 group relative flex items-center justify-between"
                  >
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-xs">
                          {company.brand_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate group-hover:text-white">
                          {company.brand_name}
                        </p>
                        <p className="text-xs text-gray-400 group-hover:text-gray-300 mt-1">
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
                        <FolderPlus className="w-3 h-3 text-gray-300" />
                      </button>
                      
                      {expandedBrands[company.brand_name] ? (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-400" />
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
                          className="w-full text-left px-3 py-3 md:py-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200 flex items-center space-x-2 group"
                        >
                          <Package className="w-3 h-3 text-gray-500 group-hover:text-gray-300" />
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
                <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Building2 className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-gray-400 text-sm mb-2">No brands yet</p>
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
      <div className="p-4 border-t border-gray-700 relative">
        {/* User info */}
        <div className="bg-gray-700 rounded-lg p-3 flex items-center justify-between">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center space-x-3 focus:outline-none flex-grow"
            aria-haspopup="true"
            aria-expanded={isDropdownOpen}
          >
            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-white text-sm font-medium truncate">
                {user?.name || 'User'}
              </p>
              <p className="text-gray-300 text-xs truncate">
                {user?.email || 'user@example.com'}
              </p>
            </div>
            <ChevronUp className="w-4 h-4 text-gray-400" />
          </button>
          
        </div>
        
        {isDropdownOpen && (
          <div className="absolute left-4 right-4 bottom-full mb-2 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
            <div className="p-2 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email || 'user@example.com'}</p>
            </div>
            <div className="py-1">
              <Link
                to="/dashboard"
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setIsDropdownOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                to="/subscription"
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setIsDropdownOpen(false)}
              >
                Subscription
              </Link>
              <Link
                to="/settings"
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
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
                className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
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

export default Sidebar;