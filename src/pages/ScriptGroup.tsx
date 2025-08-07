import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, ChevronLeft, Copy, Download, Video, X, Heart, RefreshCw, Send } from 'lucide-react';
import { buildApiUrl } from '../config/api';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import StoryboardGenerator from '../components/StoryboardGenerator';

interface Script {
  _id: string;
  scriptId?: string;
  title: string;
  content: string;
  createdAt: string;
  liked: boolean;
  metadata?: {
    brand_name?: string;
    product?: string;
    [key: string]: unknown;
  };
  brand_name?: string;
  product?: string;
  formattedDate?: string;
}

const ScriptGroup: React.FC = () => {
  const { brandName, product, scriptId } = useParams<{
    brandName: string;
    product: string;
    scriptId: string;
  }>();
  const navigate = useNavigate();
  
  const [scripts, setScripts] = useState<Script[]>([]);
  const [selectedScript, setSelectedScript] = useState<Script | null>(null);
  const [showStoryboard, setShowStoryboard] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [sidebarRefreshTrigger, setSidebarRefreshTrigger] = useState(0);

  // Add new state for regeneration
  const [showRegenerateModal, setShowRegenerateModal] = useState(false);
  const [regenerationPrompt, setRegenerationPrompt] = useState('');
  const [isRegenerating, setIsRegenerating] = useState(false);

  // Fetch scripts for this brand + product
  useEffect(() => {
    if (!brandName || !product) {
      setError('Invalid parameters');
      return;
    }
    
    fetchScripts();
  }, [brandName, product]);
  
  // Set the selected script based on URL parameter
  useEffect(() => {
    if (scripts.length === 0) return;
    
    // Find the script by ID from the URL parameter
    const script = scripts.find(s => s._id === scriptId);
    if (script) {
      setSelectedScript(script);
    } else {
      // If script not found, select the first one
      setSelectedScript(scripts[0]);
    }
  }, [scripts, scriptId]);

  const fetchScripts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Fetch all scripts
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
      const data = result.success ? result.data : result;
      
      // Filter scripts by brand_name and product
      const decodedBrandName = decodeURIComponent(brandName || '');
      const decodedProduct = decodeURIComponent(product || '');
      
      const filteredScripts = data.filter((script: Script) => {
        const scriptBrandName = script.brand_name || script.metadata?.brand_name as string || '';
        const scriptProduct = script.product || script.metadata?.product as string || '';
        
        return (
          scriptBrandName.toLowerCase() === decodedBrandName.toLowerCase() && 
          scriptProduct.toLowerCase() === decodedProduct.toLowerCase()
        );
      });
      
      // Sort by creation date (newest first)
      filteredScripts.sort((a: Script, b: Script) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      // Add formatted dates and script numbers
      filteredScripts.forEach((script: Script, index: number) => {
        script.formattedDate = new Date(script.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      });
      
      setScripts(filteredScripts);
    } catch (error) {
      console.error('Error fetching scripts:', error);
      setError('Failed to load scripts. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle script regeneration
  const handleRegenerate = async () => {
    if (!selectedScript || !regenerationPrompt.trim()) return;
    
    try {
      setIsRegenerating(true);
      
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      
      // Call the API to regenerate the script
      const response = await fetch(buildApiUrl(`api/scripts/${selectedScript._id}/regenerate`), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          instructions: regenerationPrompt
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to regenerate script');
      }
      
      const result = await response.json();
      const newScript = result.script || result.data || result;
      
      // After successful regeneration, refresh the sidebar
      setSidebarRefreshTrigger(prev => prev + 1);
      
      // Close the regenerate modal
      setShowRegenerateModal(false);
      setRegenerationPrompt('');
      
      // Navigate to the new script
      if (newScript._id) {
        navigate(`/script-group/${encodeURIComponent(brandName || '')}/${encodeURIComponent(product || '')}/${newScript._id}`);
        
        // Force a refresh of scripts to include the new one
        setTimeout(() => {
          fetchScripts();
        }, 500);
      }
    } catch (error) {
      console.error('Error regenerating script:', error);
      setError(error instanceof Error ? error.message : 'Failed to regenerate script');
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleCopyScript = () => {
    if (!selectedScript) return;
    
    navigator.clipboard.writeText(selectedScript.content);
    setIsCopied(true);
    
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };
  
  const handleDownloadScript = () => {
    if (!selectedScript) return;
    
    const element = document.createElement('a');
    const file = new Blob([selectedScript.content], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${selectedScript.title.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };
  
  const toggleLike = async (script: Script) => {
    if (isLiking) return;
    
    try {
      setIsLiking(true);
      
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      
      const response = await fetch(buildApiUrl(`api/scripts/like/${script._id}`), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to toggle like status');
      }
      
      const result = await response.json();
      
      // Update the script in our state
      const updatedScripts = scripts.map(s => {
        if (s._id === script._id) {
          return { ...s, liked: result.liked };
        }
        return s;
      });
      
      setScripts(updatedScripts);
      
      // Update selected script if it's the one we just liked
      if (selectedScript && selectedScript._id === script._id) {
        setSelectedScript({ ...selectedScript, liked: result.liked });
      }
      
      setSidebarRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error toggling like status:', error);
      // Show error toast or notification here
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar refreshTrigger={sidebarRefreshTrigger} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-6">
          {/* Back Button */}
          <div className="mb-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              Back to Dashboard
            </button>
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

          {!isLoading && scripts.length > 0 && (
            <div className="flex flex-col md:flex-row gap-6">
              {/* Script Selector Column */}
              <div className="md:w-64 flex-shrink-0">
                <div className="bg-white rounded-lg shadow p-4">
                  <h2 className="font-bold text-lg text-gray-900 mb-4">
                    {decodeURIComponent(brandName || '')} - {decodeURIComponent(product || '')}
                  </h2>
                  
                  <div className="space-y-2">
                    {scripts.map((script, index) => (
                      <div
                        key={script._id}
                        onClick={() => {
                          setSelectedScript(script);
                          // Update URL without reloading
                          navigate(`/script-group/${encodeURIComponent(brandName || '')}/${encodeURIComponent(product || '')}/${script._id}`, { replace: true });
                        }}
                        className={`
                          p-3 rounded-lg cursor-pointer transition-colors flex justify-between items-center
                          ${selectedScript?._id === script._id ? 
                            'bg-purple-100 border border-purple-200' : 
                            'hover:bg-gray-100'
                          }
                        `}
                      >
                        <div>
                          <p className="font-medium">Script {scripts.length - index}</p>
                          <p className="text-xs text-gray-500">{script.formattedDate}</p>
                        </div>
                        
                        {/* Like button for each script in sidebar */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent selecting the script when clicking like
                            toggleLike(script);
                          }}
                          className={`
                            p-1 rounded-full transition-colors
                            ${script.liked ? 'text-red-500 hover:bg-red-50' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-700'}
                          `}
                          title={script.liked ? "Unlike script" : "Like script"}
                          disabled={isLiking}
                        >
                          <Heart className={`w-4 h-4 ${script.liked ? 'fill-current' : ''}`} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Script Content Column */}
              <div className="flex-1">
                {selectedScript ? (
                  <div className="bg-white rounded-lg shadow">
                    <div className="border-b border-gray-200 p-4 flex justify-between items-center flex-wrap gap-2">
                      <div>
                        <h3 className="font-bold text-lg">
                          {selectedScript.title}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Created on {selectedScript.formattedDate}
                        </p>
                      </div>
                      
                      <div className="flex space-x-2 flex-wrap">
                        {/* Add Regenerate button */}
                        <button
                          onClick={() => setShowRegenerateModal(true)}
                          className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 flex items-center transition-colors"
                        >
                          <RefreshCw className="w-4 h-4 mr-1" />
                          <span className="text-sm">Regenerate</span>
                        </button>
                        
                        {/* Like button in the main view */}
                        <button
                          onClick={() => toggleLike(selectedScript)}
                          className={`
                            p-2 rounded-lg flex items-center justify-center transition-colors
                            ${selectedScript.liked ? 'text-red-500 bg-red-50 hover:bg-red-100' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}
                          `}
                          title={selectedScript.liked ? "Unlike script" : "Like script"}
                          disabled={isLiking}
                        >
                          <Heart className={`w-5 h-5 ${selectedScript.liked ? 'fill-current' : ''}`} />
                        </button>
                        
                        <button
                          onClick={handleCopyScript}
                          className="p-2 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-600 hover:text-gray-900"
                          title="Copy script"
                        >
                          <Copy className="w-5 h-5" />
                          {isCopied && <span className="ml-1 text-xs text-green-600">Copied!</span>}
                        </button>
                        
                        <button
                          onClick={handleDownloadScript}
                          className="p-2 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-600 hover:text-gray-900"
                          title="Download script"
                        >
                          <Download className="w-5 h-5" />
                        </button>
                        
                        <button
                          onClick={() => setShowStoryboard(true)}
                          className="p-2 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-600 hover:text-gray-900"
                          title="Generate storyboard"
                        >
                          <Video className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="p-4 whitespace-pre-wrap font-mono text-sm bg-gray-50 rounded-b-lg min-h-[60vh]">
                      {selectedScript.content}
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow p-8 text-center">
                    <p className="text-gray-500">Select a script to view its content</p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Storyboard Modal */}
          {showStoryboard && selectedScript && (
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
                  <StoryboardGenerator scriptId={selectedScript._id} />
                </div>
              </div>
            </div>
          )}
          
          {/* Regenerate Script Modal */}
          {showRegenerateModal && selectedScript && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg w-full max-w-xl">
                <div className="flex justify-between items-center border-b p-4">
                  <h3 className="text-xl font-bold">Regenerate Script</h3>
                  <button 
                    onClick={() => setShowRegenerateModal(false)}
                    disabled={isRegenerating}
                    className="p-1 hover:bg-gray-100 rounded-full"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <div className="p-6">
                  <p className="text-gray-600 mb-4">
                    Enter instructions for how you'd like to modify this script. Be specific about tone, content, structure, or any other changes you'd like to see.
                  </p>
                  
                  <textarea
                    value={regenerationPrompt}
                    onChange={(e) => setRegenerationPrompt(e.target.value)}
                    placeholder="Make the script more persuasive with a stronger call to action..."
                    className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-800 text-sm resize-none mb-4"
                    disabled={isRegenerating}
                  />
                  
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setShowRegenerateModal(false)}
                      disabled={isRegenerating}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleRegenerate}
                      disabled={isRegenerating || !regenerationPrompt.trim()}
                      className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg flex items-center hover:from-blue-600 hover:to-purple-700 transition-colors"
                    >
                      {isRegenerating ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4 mr-2" />
                      )}
                      {isRegenerating ? 'Regenerating...' : 'Regenerate Script'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Regeneration Loading Overlay with Siri-like animation */}
          {isRegenerating && (
            <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm z-[60] flex flex-col items-center justify-center">
              <div className="relative w-32 h-32">
                {/* Circular animation similar to Siri */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-28 h-28 rounded-full border-t-4 border-b-4 border-purple-500 animate-spin"></div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full border-l-4 border-r-4 border-blue-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full border-t-4 border-pink-500 animate-spin" style={{ animationDuration: '2s' }}></div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 opacity-80 animate-pulse"></div>
                </div>
              </div>
              <p className="mt-6 text-white text-lg font-medium">Generating new script...</p>
              <p className="mt-2 text-gray-300 text-sm max-w-md text-center">
                AI is working on your instructions to create a new version of this script.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ScriptGroup;