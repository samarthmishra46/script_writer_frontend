import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FolderPlus, Search, ChevronDown, Building2, LogOut } from 'lucide-react';
import { buildApiUrl } from '../config/api';

interface Company {
  brand_name: string;
  scriptCount: number;
  lastUsed: string;
}

interface SidebarProps {
  campaigns?: Array<{
    id: string;
    name: string;
  }>;
}

const Sidebar: React.FC<SidebarProps> = ({ campaigns = [] }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(false);

  // Fetch companies/brands from scripts
  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setIsLoadingCompanies(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      // Use the new dedicated companies endpoint
      const response = await fetch(buildApiUrl('api/scripts/companies'), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        const companies = result.success ? result.data : result;
        setCompanies(companies || []);
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
      // Fallback to old method if new endpoint fails
      try {
        const fallbackResponse = await fetch(buildApiUrl('api/scripts'), {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (fallbackResponse.ok) {
          const result = await fallbackResponse.json();
          const scripts = result.success ? result.data : result;
          
          // Group scripts by brand_name and count them
          const brandMap = new Map<string, { count: number; lastUsed: string }>();
          
          scripts.forEach((script: { _id: string; metadata?: { brand_name?: string; [key: string]: unknown }; createdAt: string; title: string }) => {
            const brandName = script.metadata?.brand_name;
            if (brandName) {
              const existing = brandMap.get(brandName);
              if (existing) {
                brandMap.set(brandName, {
                  count: existing.count + 1,
                  lastUsed: script.createdAt > existing.lastUsed ? script.createdAt : existing.lastUsed
                });
              } else {
                brandMap.set(brandName, {
                  count: 1,
                  lastUsed: script.createdAt
                });
              }
            }
          });

          const companiesData: Company[] = Array.from(brandMap.entries()).map(([brand_name, data]) => ({
            brand_name,
            scriptCount: data.count,
            lastUsed: data.lastUsed
          }));

          // Sort by last used date (most recent first)
          companiesData.sort((a, b) => new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime());
          
          setCompanies(companiesData);
        }
      } catch (fallbackError) {
        console.error('Error with fallback method:', fallbackError);
      }
    } finally {
      setIsLoadingCompanies(false);
    }
  };

  const handleCompanyClick = (brandName: string) => {
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
    <div className="w-64 bg-gray-800 h-screen flex flex-col">
      {/* Logo */}
            <div className="p-4 mb-6">
        <h1 className="text-2xl font-bold text-purple-500">Leepi AI</h1>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-4">
        <div className="space-y-2">
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

        {/* Previous Campaigns */}
        <div className="mt-8">
          <h3 className="text-sm font-medium text-gray-400 px-4 mb-3">
            Previous Campaigns
          </h3>
          <div className="space-y-1">
            {campaigns.map((campaign) => (
              <Link
                key={campaign.id}
                to={`/campaign/${campaign.id}`}
                className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              >
                {campaign.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Companies/Brands - ChatGPT Style */}
        <div className="mt-8">
          <div className="flex items-center justify-between px-4 mb-3">
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
          
          <div className="space-y-1 max-h-80 overflow-y-auto">
            {isLoadingCompanies ? (
              <div className="px-4 py-2 text-gray-400 text-sm">Loading...</div>
            ) : companies.length > 0 ? (
              companies.map((company) => (
                <button
                  key={company.brand_name}
                  onClick={() => handleCompanyClick(company.brand_name)}
                  className="w-full text-left px-3 py-3 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200 group relative"
                >
                  <div className="flex items-start space-x-3">
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
                    
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    </div>
                  </div>
                  
                  {/* Hover effect line */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 to-pink-500 rounded-r opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </button>
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

      {/* Footer */}
      <div className="p-4 border-t border-gray-700">
        {/* User Information */}
        <div className="bg-gray-700 rounded-lg p-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">
                {user?.name || 'User'}
              </p>
              <p className="text-gray-300 text-xs truncate">
                {user?.email || 'user@example.com'}
              </p>
            </div>
            <button 
              onClick={handleLogout} 
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-600 rounded-full transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 