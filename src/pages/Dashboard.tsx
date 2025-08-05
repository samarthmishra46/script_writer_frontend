import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, FolderPlus, Loader2 } from 'lucide-react';
import { buildApiUrl } from '../config/api';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import SubscriptionBanner from '../components/SubscriptionBanner';

interface Campaign {
  id: string;
  name: string;
  date: string;
  preview: string;
  status?: string;
  brand_name?: string;
  product?: string;
}

const Dashboard: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required');
        return;
      }

      // Since campaigns endpoint doesn't exist, fetch scripts instead
      const response = await fetch(buildApiUrl('api/scripts'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch scripts');
      }

      const result = await response.json();
      
      // Check if response is in new format with success flag
      const data = result.success ? result.data : result;
      
      // Transform scripts to campaign format for display
      const scriptCampaigns = data.map((script: { _id: string; title: string; createdAt: string; metadata?: Record<string, unknown>; brand_name?: string; product?: string }) => ({
        id: script._id,
        name: script.title,
        date: new Date(script.createdAt).toLocaleDateString(),
        preview: '/api/placeholder/150/100',
        // Use enhanced fields if available, otherwise fallback to metadata
        brand_name: script.brand_name || (script.metadata?.brand_name as string) || 'Unknown Brand',
        product: script.product || (script.metadata?.product as string) || 'Unknown Product'
      }));
      
      // Sort by creation date (newest first)
      scriptCampaigns.sort((a: Campaign, b: Campaign) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      setCampaigns(scriptCampaigns || []);
    } catch (error) {
      console.error('Error fetching scripts:', error);
      setError('Failed to load scripts. Please try again.');
      // Fallback to sample data for demo
      setCampaigns([
        {
          id: '1',
          name: 'Ayush Wellness Script',
          date: '30 Jul 2025',
          preview: '/api/placeholder/150/100'
        },
        {
          id: '2',
          name: 'DNA Consulting Script',
          date: '29 Jul 2025',
          preview: '/api/placeholder/150/100'
        },
        {
          id: '3',
          name: 'Pawblaze.in Script',
          date: '28 Jul 2025',
          preview: '/api/placeholder/150/100'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCampaigns = campaigns.filter(campaign =>
    campaign.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-6">
          {/* Subscription Banner */}
          <SubscriptionBanner />
          
          {/* Create Script Banner */}
          <div className="mb-8">
            <Link
              to="/create-script"
              className="block w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
            >
              <div className="flex items-center justify-center space-x-3">
                <FolderPlus className="w-6 h-6" />
                <span className="text-xl font-semibold">Create New Script</span>
              </div>
              <p className="text-center mt-2 text-purple-100">
                Generate AI-powered ad scripts for your campaigns
              </p>
            </Link>
          </div>

          {/* Scripts Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Your Scripts</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search Script"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
              <span className="ml-2 text-gray-600">Loading scripts...</span>
            </div>
          )}

          {/* Script Grid */}
          {!isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCampaigns.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FolderPlus className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No scripts found</h3>
                  <p className="text-gray-500 mb-4">
                    {searchTerm ? 'Try adjusting your search terms.' : 'Get started by creating your first script.'}
                  </p>
                  {!searchTerm && (
                    <Link
                      to="/create-script"
                      className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      <FolderPlus className="w-4 h-4 mr-2" />
                      Create Script
                    </Link>
                  )}
                </div>
              ) : (
                filteredCampaigns.map((campaign) => (
                  <Link
                    key={campaign.id}
                    to={`/script/${campaign.id}`}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-gray-900">{campaign.name}</h3>
                        <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                      </div>
                      
                      {/* Brand and Product Info */}
                      {(campaign.brand_name || campaign.product) && (
                        <div className="mb-3 space-y-1">
                          {campaign.brand_name && (
                            <p className="text-xs text-purple-600 font-medium">🏢 {campaign.brand_name}</p>
                          )}
                          {campaign.product && (
                            <p className="text-xs text-blue-600">📦 {campaign.product}</p>
                          )}
                        </div>
                      )}
                      
                      <div className="bg-gray-100 rounded-lg p-3 mb-3">
                        <div className="grid grid-cols-3 gap-1">
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((index) => (
                            <div
                              key={index}
                              className="w-full h-8 bg-gradient-to-br from-purple-100 to-pink-100 rounded"
                            />
                          ))}
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-500">{campaign.date}</p>
                    </div>
                  </Link>
                ))
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
