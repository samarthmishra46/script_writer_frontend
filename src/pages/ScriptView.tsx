import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, MessageSquare } from 'lucide-react';
import { buildApiUrl } from '../config/api';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import GeneratedScript from '../components/GeneratedScript';

interface Script {
  _id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  version?: number;
  scriptId?: string;
  regenerationPrompt?: string; // Added for tracking regeneration instructions
  metadata?: {
    brand_name?: string;
    product?: string;
    [key: string]: unknown;
  };
}

interface RegenerationRequest {
  id: string;
  content: string;
  timestamp: string;
  changes?: string;
}

const ScriptView: React.FC = () => {
  const { scriptId } = useParams<{ scriptId: string }>();
  const navigate = useNavigate();
  const [currentScript, setCurrentScript] = useState<Script | null>(null);
  const [scriptVersions, setScriptVersions] = useState<Script[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [regenerationRequests, setRegenerationRequests] = useState<RegenerationRequest[]>([]);
  const [newRequest, setNewRequest] = useState('');
  const [isRegenerating, setIsRegenerating] = useState(false);

  useEffect(() => {
    const fetchScript = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Authentication required');
          return;
        }

        const response = await fetch(buildApiUrl(`api/scripts/${scriptId}`), {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch script');
        }

        const result = await response.json();
        
        // Check if the API returns data within a data field (common pattern)
        const script = result.data || result;
        
        // Validate that script has required fields
        if (!script || !script.content) {
          throw new Error('Invalid script data received from server');
        }
        
        // Set the current script to the latest version
        setCurrentScript(script);
        
        // If the API returns versions, use those, otherwise just use the single script as a version
        let versions: Script[] = [];
        if (result.versions && Array.isArray(result.versions) && result.versions.length > 0) {
          versions = result.versions.map((version: Script, index: number) => ({
            ...version,
            version: index + 1
          }));
          console.log(`Found ${versions.length} script versions`);
        } else {
          versions = [{
            ...script,
            version: 1
          }];
          console.log('No versions found, using single script as version 1');
        }
        
        setScriptVersions(versions);
      } catch (error) {
        console.error('Error fetching script:', error);
        setError('Failed to load script. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    if (scriptId) {
      fetchScript();
    }
  }, [scriptId]);

  const handleRegenerate = async () => {
    if (!newRequest.trim() || !currentScript) return;

    setIsRegenerating(true);
    
    try {
      // Add the request to the list
      const request: RegenerationRequest = {
        id: Date.now().toString(),
        content: newRequest,
        timestamp: new Date().toISOString()
      };
      
      setRegenerationRequests(prev => [...prev, request]);
      setNewRequest('');
      
      // Make actual API call to regenerate script
      const token = localStorage.getItem('token');
      if (token && scriptId && currentScript) {
        // Call API to regenerate script with user's instructions
        const response = await fetch(buildApiUrl(`api/scripts/${scriptId}/regenerate`), {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            instructions: newRequest
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to regenerate script');
        }
        
        const result = await response.json();
        const newScript = result.script || result.data || result;
        
        // After successfully regenerating, fetch all versions again to get the updated list
        const scriptResponse = await fetch(buildApiUrl(`api/scripts/${scriptId}`), {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!scriptResponse.ok) {
          throw new Error('Failed to fetch updated script versions');
        }

        const scriptResult = await scriptResponse.json();
        
        // If the API returns versions, use those
        if (scriptResult.versions && Array.isArray(scriptResult.versions) && scriptResult.versions.length > 0) {
          const versions = scriptResult.versions.map((version: Script, index: number) => ({
            ...version,
            version: index + 1
          }));
          setScriptVersions(versions);
          console.log(`Updated to ${versions.length} script versions`);
          
          // Set the current script to be the newest version
          setCurrentScript(versions[versions.length - 1]);
        } else {
          // If no versions returned, just add the new script as a new version
          const newVersion = {
            ...newScript,
            version: scriptVersions.length + 1,
            regenerationPrompt: newRequest,
            createdAt: new Date().toISOString()
          };
          
          // Add the new version to the versions list
          setScriptVersions(prevVersions => [...prevVersions, newVersion]);
          
          // Update the current script to the newest version
          setCurrentScript(newScript);
        }
      }
      
    } catch (error) {
      console.error('Error regenerating script:', error);
      setError(error instanceof Error ? error.message : 'Failed to regenerate script. Please try again.');
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleEditScript = async (editedContent: string) => {
    if (!currentScript) return;
    
    try {
      // Here you would call your script update API
      console.log('Editing script:', currentScript._id, editedContent);
      
      // Update the script in the local state
      setCurrentScript(prev => prev ? { ...prev, content: editedContent } : null);
    } catch (error) {
      console.error('Error editing script:', error);
      setError('Failed to update script. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading script...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error && !currentScript) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Script</h3>
              <p className="text-gray-500 mb-4">{error}</p>
              <button
                onClick={() => navigate('/dashboard')}
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
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
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-hidden">
          <div className="h-full flex">
            {/* Script Details */}
            <div className="flex-1 bg-white flex flex-col">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Dashboard
                  </button>
                  <button
                    onClick={() => navigate('/create-script', { 
                      state: { prefillBrand: currentScript?.metadata?.brand_name } 
                    })}
                    className="flex items-center px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    New Script
                  </button>
                </div>
                
                {currentScript && (
                  <div className="mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">{currentScript.title}</h2>
                    <p className="text-sm text-gray-600">
                      {currentScript.metadata?.brand_name || 'Unknown Brand'} • {new Date(currentScript.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {currentScript ? (
                  <div className="space-y-8">
                    {/* Show all script versions - newest first */}
                    {[...scriptVersions].reverse().map((scriptVersion, index) => {
                      const versionNumber = scriptVersions.length - index;
                      const isNewest = index === 0;
                      const isOriginal = index === scriptVersions.length - 1;
                      
                      return (
                        <div key={index} className={`border-l-4 ${isNewest ? 'border-purple-600' : 'border-purple-300'} pl-4`}>
                          <div className="mb-3 flex items-center justify-between">
                            <div>
                              <h3 className="text-md font-semibold text-gray-800">
                                Version {versionNumber} {isOriginal && "(Original)"}
                                {isNewest && " (Latest)"}
                              </h3>
                              <p className="text-xs text-gray-500">
                                {new Date(scriptVersion.createdAt).toLocaleString()}
                              </p>
                            </div>
                            {scriptVersion.regenerationPrompt && (
                              <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full truncate max-w-xs">
                                "{scriptVersion.regenerationPrompt}"
                              </span>
                            )}
                          </div>
                          <GeneratedScript 
                            script={scriptVersion}
                            onEdit={isNewest ? handleEditScript : undefined}
                          />
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MessageSquare className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Script not found</h3>
                      <p className="text-gray-500 mb-4">
                        The script you're looking for doesn't exist or has been deleted.
                      </p>
                      <button
                        onClick={() => navigate('/dashboard')}
                        className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Dashboard
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Regeneration Panel */}
              {currentScript && (
                <div className="border-t border-gray-200 p-6 bg-gray-50">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Generate New Version
                    </h3>
                    <span className="text-sm text-gray-500">
                      {scriptVersions.length} version{scriptVersions.length !== 1 ? 's' : ''} created
                    </span>
                  </div>
                  
                  <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
                    <p className="text-sm text-gray-700 mb-2">
                      Describe the changes you'd like to see in the next version of the script.
                      Be specific about tone, structure, or content adjustments.
                    </p>
                    
                    <div className="flex space-x-3">
                      <input
                        type="text"
                        value={newRequest}
                        onChange={(e) => setNewRequest(e.target.value)}
                        placeholder="e.g., Make it more persuasive and add a stronger call to action"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleRegenerate()}
                      />
                      <button
                        onClick={handleRegenerate}
                        disabled={isRegenerating || !newRequest.trim()}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 transition-colors flex items-center"
                      >
                        {isRegenerating ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Generating...
                          </>
                        ) : (
                          'Generate New Version'
                        )}
                      </button>
                    </div>
                  </div>
                  
                  {regenerationRequests.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Previous Requests:</h4>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {regenerationRequests.map((request) => (
                          <div key={request.id} className="text-xs bg-white p-2 rounded border flex justify-between">
                            <p className="text-gray-700">{request.content}</p>
                            <p className="text-gray-500 ml-2">
                              {new Date(request.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ScriptView;
