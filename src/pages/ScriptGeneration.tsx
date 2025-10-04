import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Wand2, CheckCircle, FileText, Loader2 } from 'lucide-react';
import { buildApiUrl } from '../config/api';

interface UGCAd {
  _id: string;
  productDetails: {
    name: string;
    description: string;
    category?: string;
    price?: string;
    brand?: string;
  };
  selectedCharacter?: {
    characterId: string;
    characterName: string;
    gender: string;
    imageUrl: string;
  };
  generatedScripts?: Array<{
    _id: string;
    content: string;
    duration: number;
    tone: string;
    focusPoint: string;
    createdAt: string;
  }>;
  status: string;
}

const ScriptGeneration: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [ugcAd, setUgcAd] = useState<UGCAd | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedScript, setSelectedScript] = useState<string | null>(null);

  useEffect(() => {
    const fetchUGCAd = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(buildApiUrl(`api/ugc-ads/${id}`), {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();
        if (data.success) {
          setUgcAd(data.ugcAd);
        } else {
          setError(data.message || 'Failed to fetch UGC ad');
        }
      } catch (err) {
        setError('Failed to fetch UGC ad');
        console.error('Error fetching UGC ad:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUGCAd();
  }, [id]);

  const handleGenerateScripts = async () => {
    if (!ugcAd) return;

    setGenerating(true);
    setError(null);
    console.log('🎬 Starting script generation...');

    try {
      const token = localStorage.getItem('token');
      const startTime = Date.now();
      
      console.log('📡 Calling API:', buildApiUrl(`api/ugc-ads/${id}/generate-scripts`));
      
      const response = await fetch(buildApiUrl(`api/ugc-ads/${id}/generate-scripts`), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      const endTime = Date.now();
      
      console.log(`⏱️ Frontend request took ${endTime - startTime}ms`);
      console.log('📋 API Response:', data);

      if (data.success) {
        console.log(`✅ Received ${data.scripts.length} scripts`);
        // Update the ugcAd with generated scripts
        setUgcAd(prev => prev ? {
          ...prev,
          generatedScripts: data.scripts,
          status: 'scripts_generated'
        } : null);
      } else {
        console.error('❌ Script generation failed:', data.message);
        setError(data.message || 'Failed to generate scripts');
      }
    } catch (err) {
      console.error('❌ Network error:', err);
      setError('An error occurred while generating scripts');
    } finally {
      setGenerating(false);
    }
  };

  const handleSelectScript = async (scriptId: string) => {
    setSelectedScript(scriptId);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(buildApiUrl(`api/ugc-ads/${id}/select-script`), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          scriptId
        })
      });

      const data = await response.json();

      if (data.success) {
        navigate(`/ugc-ads/${id}/video-generation`);
      } else {
        setError(data.message || 'Failed to select script');
        setSelectedScript(null);
      }
    } catch (err) {
      setError('An error occurred while selecting the script');
      setSelectedScript(null);
      console.error('Error selecting script:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading UGC ad...</p>
        </div>
      </div>
    );
  }

  if (!ugcAd) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">UGC ad not found</p>
          <button
            onClick={() => navigate('/ugc-ads')}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(`/ugc-ads/${id}/character-selection`)}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Character Selection</span>
          </button>
          
          <div className="flex items-center space-x-3 mb-4">
            <Wand2 className="h-8 w-8 text-purple-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Generate Scripts</h1>
              <p className="text-gray-600">
                AI-generated scripts for your UGC video with {ugcAd.selectedCharacter?.characterName}
              </p>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm text-gray-600">Product Uploaded</span>
            </div>
            <div className="h-px bg-gray-300 flex-1 max-w-12"></div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm text-gray-600">Character Selected</span>
            </div>
            <div className="h-px bg-gray-300 flex-1 max-w-12"></div>
            <div className="flex items-center space-x-2">
              <div className="h-5 w-5 bg-purple-600 rounded-full flex items-center justify-center">
                <FileText className="h-3 w-3 text-white" />
              </div>
              <span className="text-sm font-medium text-purple-600">Script Generation</span>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Product and Character Summary */}
        <div className="bg-white rounded-lg p-6 shadow-md mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">UGC Video Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Product</h4>
              <p className="text-sm text-gray-600 mb-1"><strong>Name:</strong> {ugcAd.productDetails.name}</p>
              <p className="text-sm text-gray-600 mb-1"><strong>Description:</strong> {ugcAd.productDetails.description}</p>
              {ugcAd.productDetails.category && (
                <p className="text-sm text-gray-600 mb-1"><strong>Category:</strong> {ugcAd.productDetails.category}</p>
              )}
              {ugcAd.productDetails.price && (
                <p className="text-sm text-gray-600"><strong>Price:</strong> {ugcAd.productDetails.price}</p>
              )}
            </div>
            {ugcAd.selectedCharacter && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Selected Character</h4>
                <div className="flex items-center space-x-3">
                  <img
                    src={buildApiUrl(ugcAd.selectedCharacter.imageUrl)}
                    alt={ugcAd.selectedCharacter.characterName}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div>
                    <p className="font-medium text-gray-900">{ugcAd.selectedCharacter.characterName}</p>
                    <p className="text-sm text-gray-600 capitalize">{ugcAd.selectedCharacter.gender}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Script Generation Section */}
        {!ugcAd.generatedScripts || ugcAd.generatedScripts.length === 0 ? (
          <div className="bg-white rounded-lg p-8 shadow-md text-center">
            <Wand2 className="h-16 w-16 text-purple-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Ready to Generate Scripts</h3>
            <p className="text-gray-600 mb-6">
              Our AI will create 5-6 engaging 8-second scripts tailored to your product and character.
            </p>
            <button
              onClick={handleGenerateScripts}
              disabled={generating}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 mx-auto"
            >
              {generating ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Generating Scripts... (30-60s)</span>
                </>
              ) : (
                <>
                  <Wand2 className="h-5 w-5" />
                  <span>Generate AI Scripts</span>
                </>
              )}
            </button>
          </div>
        ) : (
          /* Generated Scripts Display */
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              Generated Scripts ({ugcAd.generatedScripts.length})
            </h3>
            <div className="space-y-4">
              {ugcAd.generatedScripts.map((script, index) => (
                <div
                  key={script._id}
                  className={`bg-white rounded-lg p-6 shadow-md cursor-pointer transition-all duration-200 hover:shadow-lg ${
                    selectedScript === script._id ? 'ring-2 ring-purple-600' : ''
                  }`}
                  onClick={() => handleSelectScript(script._id)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="inline-block bg-purple-100 text-purple-800 text-sm px-3 py-1 rounded-full font-medium">
                        Script {index + 1}
                      </span>
                      <span className="text-sm text-gray-500">
                        {script.duration}s • {script.tone}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                      {script.focusPoint}
                    </span>
                  </div>
                  <p className="text-gray-800 leading-relaxed">{script.content}</p>
                  
                  {selectedScript === script._id && (
                    <div className="mt-4 flex items-center space-x-2 text-purple-600">
                      <CheckCircle className="h-5 w-5" />
                      <span className="text-sm font-medium">Selected for video generation</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-8 flex space-x-4">
              <button
                onClick={handleGenerateScripts}
                disabled={generating}
                className="flex-1 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {generating ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Regenerating...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="h-5 w-5" />
                    <span>Regenerate Scripts</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScriptGeneration;