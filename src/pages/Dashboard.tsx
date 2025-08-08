import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, FolderPlus, Loader2, Video, X, Menu, Plus } from 'lucide-react';
import { buildApiUrl } from '../config/api';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import SubscriptionBanner from '../components/SubscriptionBanner';
import StoryboardGenerator from '../components/StoryboardGenerator';

interface Script {
  _id: string;
  title: string;
  createdAt: string;
  metadata?: {
    brand_name?: string;
    product?: string;
    [key: string]: unknown;
  };
  brand_name?: string;
  product?: string;
}

interface ScriptGroup {
  key: string;
  brand_name: string;
  product: string;
  scriptCount: number;
  latestDate: Date;
  preview: string;
  firstScriptId: string;
  latestScriptId: string;
}

const Dashboard: React.FC = () => {
  const [scripts, setScripts] = useState<Script[]>([]);
  const [scriptGroups, setScriptGroups] = useState<ScriptGroup[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedScriptId, setSelectedScriptId] = useState<string | null>(null);
  const [showStoryboard, setShowStoryboard] = useState(false);
  const [hasStoryboardAccess, setHasStoryboardAccess] = useState<boolean | null>(null);
  const [checkingAccess, setCheckingAccess] = useState(false);
  const [sidebarRefreshTrigger, setSidebarRefreshTrigger] = useState(0);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [sortOption, setSortOption] = useState('newest');

  useEffect(() => {
    fetchScripts();
    checkStoryboardAccess();
  }, []);
  
  // Group scripts by brand_name + product
  useEffect(() => {
    if (scripts.length === 0) return;
    
    const groups = new Map<string, ScriptGroup>();
    
    scripts.forEach(script => {
      const brand_name = script.brand_name || script.metadata?.brand_name as string || 'Unknown Brand';
      const product = script.product || script.metadata?.product as string || 'Unknown Product';
      const key = `${brand_name}-${product}`;
      
      const scriptDate = new Date(script.createdAt);
      
      if (!groups.has(key)) {
        // Create new group
        groups.set(key, {
          key,
          brand_name,
          product,
          scriptCount: 1,
          latestDate: scriptDate,
          preview: '/api/placeholder/150/100',
          firstScriptId: script._id,
          latestScriptId: script._id
        });
      } else {
        // Update existing group
        const group = groups.get(key)!;
        group.scriptCount += 1;
        
        // Update latest script if this one is newer
        if (scriptDate > group.latestDate) {
          group.latestDate = scriptDate;
          group.latestScriptId = script._id;
        }
      }
    });
    
    // Convert Map to array and sort by latest date
    const groupsArray = Array.from(groups.values());
    groupsArray.sort((a, b) => b.latestDate.getTime() - a.latestDate.getTime());
    
    setScriptGroups(groupsArray);
  }, [scripts]);
  
  // Check if user has access to storyboard generation
  const checkStoryboardAccess = async () => {
    setCheckingAccess(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setHasStoryboardAccess(false);
        return;
      }
      
      const response = await fetch(buildApiUrl('api/storyboard/status'), {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        setHasStoryboardAccess(false);
        return;
      }
      
      const data = await response.json();
      setHasStoryboardAccess(data.storyboardAccess || false);
    } catch (error) {
      console.error('Error checking storyboard access:', error);
      setHasStoryboardAccess(false);
    } finally {
      setCheckingAccess(false);
    }
  };
  
  // Handle storyboard generation button click
  const handleStoryboardGeneration = (scriptId: string) => {
    if (hasStoryboardAccess) {
      setSelectedScriptId(scriptId);
      setShowStoryboard(true);
    } else if (hasStoryboardAccess === false) {
      // Redirect to subscription page or show a modal
      const confirmUpgrade = window.confirm(
        'Storyboard generation requires an Individual or Organization plan. Would you like to upgrade your subscription?'
      );
      
      if (confirmUpgrade) {
        window.location.href = '/subscription';
      }
    } else {
      // Still checking access
      alert('Please wait, checking subscription status...');
    }
  };

  const fetchScripts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required');
        return;
      }

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
      
      // Sort by creation date (newest first)
      const sortedScripts = [...data].sort((a: Script, b: Script) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      setScripts(sortedScripts || []);
    } catch (error) {
      console.error('Error fetching scripts:', error);
      setError('Failed to load scripts. Please try again.');
      // Fallback to sample data for demo
      const sampleScripts = [
        {
          _id: '1',
          title: 'Ayush Wellness Script',
          createdAt: '2025-07-30',
          metadata: {
            brand_name: 'Ayush Wellness',
            product: 'Herbal Supplement'
          }
        },
        {
          _id: '2',
          title: 'DNA Consulting Script',
          createdAt: '2025-07-29',
          metadata: {
            brand_name: 'DNA Consulting',
            product: 'Business Advisory'
          }
        },
        {
          _id: '3',
          title: 'Pawblaze.in Script',
          createdAt: '2025-07-28',
          metadata: {
            brand_name: 'Pawblaze',
            product: 'Pet Food'
          }
        }
      ];
      setScripts(sampleScripts as Script[]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredGroups = scriptGroups.filter(group =>
    group.brand_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.product.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle script deletion
  const handleDeleteScript = async (scriptId: string) => {
    if (window.confirm('Are you sure you want to delete this script?')) {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Authentication required');
          return;
        }
        
        const response = await fetch(buildApiUrl(`api/scripts/${scriptId}`), {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete script');
        }
        
        // Refresh scripts and groups
        fetchScripts();
        setSidebarRefreshTrigger(prev => prev + 1);
      } catch (error) {
        console.error('Error deleting script:', error);
        setError('Failed to delete script. Please try again.');
      }
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100">
      {/* Mobile Header - Only visible on mobile */}
      <div className="md:hidden bg-gray-800 text-white p-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-purple-500">Leepi AI</h1>
        <button 
          onClick={() => setShowMobileSidebar(prev => !prev)} 
          className="text-white focus:outline-none"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>
      
      {/* Sidebar - Conditionally shown on mobile */}
      <div className={`${showMobileSidebar ? 'block' : 'hidden'} md:block fixed inset-0 z-40 md:relative md:z-0 md:w-64`}>
        {showMobileSidebar && (
          <div 
            className="absolute inset-0 bg-black opacity-50 md:hidden"
            onClick={() => setShowMobileSidebar(false)}
          ></div>
        )}
        <div className="relative h-full z-10">
          <Sidebar refreshTrigger={sidebarRefreshTrigger} onCloseMobile={() => setShowMobileSidebar(false)} />
        </div>
      </div>
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Regular header - Hidden on mobile */}
        <div className="hidden md:block">
          <Header />
        </div>
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-3 md:p-6">
          {/* Subscription Banner */}
          <SubscriptionBanner />


          {filteredGroups.length !== 0 && (
            <>
              {/* Search bar - Make responsive */}
              <div className="mb-6">
                <div className="flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-4">
                  <div className="relative flex-grow">
                    <input
                  type="text"
                  placeholder="Search scripts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              </div>
              
              <div className="flex space-x-2">
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-600 focus:border-transparent bg-white"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="a-z">A-Z</option>
                  <option value="z-a">Z-A</option>
                </select>
                
                <button
                  onClick={() => navigate('/create-script')}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center transition-colors"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  <span className="hidden md:inline">Create Script</span>
                  <span className="md:hidden">New</span>
                </button>
              </div>
            </div>
          </div>
          
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}
</>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
              <span className="ml-2 text-gray-600">Loading campaigns...</span>
            </div>
          )}

          {/* Script Groups Grid */}
          {!isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredGroups.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <div className="w-45 items-center justify-center mx-auto mb-4">
                    <h1 className="text-3xl font-bold text-gray-700 ">
                      Start With Giving Us <br />
                      Your Product Info
                      </h1>
                  </div>

                  <div></div>
                  {!searchTerm && (
                    <Link
                      to="/create-script"
                      className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purplr-700 hover:to-pink-700 transition-all duration-300"
                    >
                      <FolderPlus className="w-4 h-4 mr-2" />
                      Share Product Info
                    </Link>
                  )}

                  <div className="w-45 h-40 flex flex-col items-center justify-center mx-auto">
                    <h1 className="text-lg font-medium text-gray-700 text-center">
                      One Time Effort,Just Answer
                       A Few Questions<br />
                      About Your Product. Takes Only 15 Minutes
                    </h1>
                  </div>
                  
                  
                </div>
              ) : (
                filteredGroups.map((group) => (
                  <div
                    key={group.key}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
                  >
                    <Link
                      to={`/script-group/${encodeURIComponent(group.brand_name)}/${encodeURIComponent(group.product)}/${group.latestScriptId}`}
                      className="block p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-gray-900 truncate">{group.brand_name}</h3>
                        <div className="flex items-center">
                          <div className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-0.5 rounded-full">
                            {group.scriptCount} {group.scriptCount === 1 ? 'Script' : 'Scripts'}
                          </div>
                        </div>
                      </div>
                      
                      {/* Product Info */}
                      <div className="mb-3">
                        <p className="text-sm text-blue-600 font-medium">📦 {group.product}</p>
                      </div>
                      
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
                      
                      <p className="text-sm text-gray-500">
                        Updated {new Date(group.latestDate).toLocaleDateString()}
                      </p>
                    </Link>

                    {/* Action buttons */}
                    <div className="px-4 py-3 border-t border-gray-100 flex justify-end space-x-2">
                      <button
                        onClick={() => handleStoryboardGeneration(group.latestScriptId)}
                        className="flex items-center px-3 py-1 text-xs bg-green-100 text-green-700 hover:bg-green-200 rounded-full transition-colors"
                        title="Generate storyboard"
                      >
                        <Video className="w-3 h-3 mr-1" />
                        Storyboard
                      </button>
                      <button
                        onClick={() => handleDeleteScript(group.latestScriptId)}
                        className="flex items-center px-3 py-1 text-xs bg-red-100 text-red-700 hover:bg-red-200 rounded-full transition-colors"
                        title="Delete script"
                      >
                        <X className="w-3 h-3 mr-1" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
          
          {/* Storyboard Modal */}
          {showStoryboard && selectedScriptId && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center border-b p-4">
                  <h3 className="text-xl font-bold">Generate Storyboard</h3>
                  <button 
                    onClick={() => setShowStoryboard(false)} 
                    className="p-1 hover:bg-gray-100 rounded-full"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <div className="p-4">
                  <StoryboardGenerator scriptId={selectedScriptId} />
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
