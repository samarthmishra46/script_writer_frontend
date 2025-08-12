import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Copy, Download, Share2, Edit3 } from 'lucide-react';
import { buildApiUrl } from '../config/api';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

interface Brand {
  name: string;
  products: string[];
  id: string;
}

interface Campaign {
  id: string;
  name: string;
  category: string;
  description: string;
  targetAudience: string;
  budget: string;
  goals: string;
  createdAt: string;
  status: string;
  scripts?: Array<{
    id: string;
    title: string;
    content: string;
    type: string;
    status: string;
  }>;
  storyboards?: Array<{
    id: string;
    title: string;
    scenes: Array<{
      scene_number: string;
      visual_description: string;
      camera_angle: string;
      duration: string;
    }>;
  }>;
}

const CampaignDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'scripts' | 'storyboards'>('overview');
  const [brands, setBrands] = useState<Brand[]>([]);
  const [brandsLoading, setBrandsLoading] = useState(false);
  const [brandsError, setBrandsError] = useState<string | null>(null);

  // Helper function to extract brand and product information from a script
  const extractBrandsFromScript = (scriptData: {
    _id: string;
    title: string;
    content: string;
    createdAt: string;
    brand_name?: string;
    product?: string;
    metadata?: {
      brand_name?: string;
      product?: string;
      category?: string;
      target_persona?: string;
      [key: string]: unknown;
    };
  }) => {
    setBrandsLoading(true);
    try {
      // Create a brand from the script data
      const brandName = scriptData.brand_name || scriptData.metadata?.brand_name as string || 'Unknown Brand';
      const product = scriptData.product || scriptData.metadata?.product as string || 'Unknown Product';
      
      // Create a single brand with this product
      const brand: Brand = {
        name: brandName,
        products: [product],
        id: brandName.toLowerCase().replace(/\s+/g, '-')
      };
      
      setBrands([brand]);
      setBrandsError(null);
    } catch (error) {
      console.error('Error extracting brands from script:', error);
      setBrandsError('Failed to process brand information');
    } finally {
      setBrandsLoading(false);
    }
  };

  useEffect(() => {
    const fetchCampaignDetails = async (campaignId: string) => {
      try {
        setIsLoading(true);
        setError(null);

        const token = localStorage.getItem('token');
        if (!token) {
          setError('Authentication required');
          navigate('/login');
          return;
        }

        // Since campaigns endpoint doesn't exist, try to fetch script by ID
        const response = await fetch(buildApiUrl(`api/scripts/${campaignId}`), {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch script details');
        }

        const data = await response.json();
        // Extract brand information from script data
        extractBrandsFromScript(data);
        
        // Transform script data to campaign format for display
        setCampaign({
          id: data._id,
          name: data.title,
          category: data.metadata?.category || 'General',
          description: data.content.substring(0, 200) + '...',
          targetAudience: data.metadata?.target_persona || 'General audience',
          budget: 'medium',
          goals: 'brand_awareness',
          createdAt: data.createdAt,
          status: 'active',
          scripts: [{
            id: data._id,
            title: data.title,
            content: data.content,
            type: 'Generated Script',
            status: 'completed'
          }]
        });
      } catch (error) {
        console.error('Error fetching script details:', error);
        setError('Failed to load script details. Please try again.');
        // Fallback to sample data for demo
        const sampleData = {
          id: campaignId,
          name: 'Sample Script',
          category: 'Healthcare',
          description: 'Premium wellness products for holistic health',
          targetAudience: 'Health-conscious adults aged 25-45',
          budget: 'medium',
          goals: 'brand_awareness',
          createdAt: '2025-07-30T10:00:00Z',
          status: 'active',
          scripts: [
            {
              id: '1',
              title: 'Main TVC Script',
              content: 'Scene 1: A busy professional...',
              type: 'TVC',
              status: 'completed'
            },
            {
              id: '2',
              title: 'Social Media Ad',
              content: 'Hook: Are you tired of...',
              type: 'Social',
              status: 'draft'
            }
          ]
        };
        
        setCampaign(sampleData);
        
        // Create sample brand data
        setBrands([{
          name: 'Healthcare',
          products: ['Premium Wellness'],
          id: 'healthcare'
        }]);
      } finally {
        setIsLoading(false);
      }
    };

    // Fetch campaign details (brands will be extracted from campaign data)
    if (id) {
      fetchCampaignDetails(id);
    }
  }, [id, navigate]);


  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar brandsData={brands} brandsLoading={brandsLoading} brandsError={brandsError} source="other" />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-6">
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
              <span className="ml-2 text-gray-600">Loading campaign details...</span>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar brandsData={brands} brandsLoading={brandsLoading} brandsError={brandsError} source="other" />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-6">
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Campaign Not Found</h2>
              <p className="text-gray-600 mb-6">{error || 'The campaign you are looking for does not exist.'}</p>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar brandsData={brands} brandsLoading={brandsLoading} brandsError={brandsError} source="other" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{campaign.name}</h1>
                  <p className="text-gray-600">Campaign Details</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <button className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors">
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit
                </button>
                <button className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-8">
              <nav className="flex space-x-8">
                {[
                  { id: 'overview', label: 'Overview' },
                  { id: 'scripts', label: 'Scripts' },
                  { id: 'storyboards', label: 'Storyboards' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as 'overview' | 'scripts' | 'storyboards')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-purple-500 text-purple-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Campaign Info */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaign Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Category</label>
                      <p className="mt-1 text-sm text-gray-900">{campaign.category}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Description</label>
                      <p className="mt-1 text-sm text-gray-900">{campaign.description}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Target Audience</label>
                      <p className="mt-1 text-sm text-gray-900">{campaign.targetAudience}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Budget Range</label>
                      <p className="mt-1 text-sm text-gray-900">{campaign.budget}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Campaign Goals</label>
                      <p className="mt-1 text-sm text-gray-900">{campaign.goals}</p>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaign Stats</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {campaign.scripts?.length || 0}
                      </div>
                      <div className="text-sm text-gray-600">Scripts</div>
                    </div>
                    <div className="text-center p-4 bg-pink-50 rounded-lg">
                      <div className="text-2xl font-bold text-pink-600">
                        {campaign.storyboards?.length || 0}
                      </div>
                      <div className="text-sm text-gray-600">Storyboards</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'scripts' && (
              <div className="space-y-6">
                {campaign.scripts && campaign.scripts.length > 0 ? (
                  campaign.scripts.map((script) => (
                    <div key={script.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">{script.title}</h3>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            script.status === 'completed' ? 'bg-green-100 text-green-800' :
                            script.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {script.status}
                          </span>
                          <button
                            onClick={() => handleCopyToClipboard(script.content)}
                            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{script.content}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No scripts yet</h3>
                    <p className="text-gray-600">Scripts will appear here once generated.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'storyboards' && (
              <div className="space-y-6">
                {campaign.storyboards && campaign.storyboards.length > 0 ? (
                  campaign.storyboards.map((storyboard) => (
                    <div key={storyboard.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">{storyboard.title}</h3>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleCopyToClipboard(JSON.stringify(storyboard, null, 2))}
                            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {storyboard.scenes.map((scene, index) => (
                          <div key={index} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-900">Scene {scene.scene_number}</span>
                              <span className="text-xs text-gray-500">{scene.duration}</span>
                            </div>
                            <p className="text-sm text-gray-700 mb-2">{scene.visual_description}</p>
                            <p className="text-xs text-gray-500">Camera: {scene.camera_angle}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No storyboards yet</h3>
                    <p className="text-gray-600">Storyboards will appear here once generated.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default CampaignDetails; 