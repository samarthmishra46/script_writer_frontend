import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  Lightbulb,
  Check,
  RefreshCw
} from 'lucide-react';
import { API_BASE_URL } from '../config/api';

interface LocationState {
  brandName: string;
  productName: string;
  category: string;
  adType: string;
  videoParameters: {
    platform: string;
    ageGroup: string;
    primaryGoal: string;
  };
}

interface VideoIdea {
  ideaNumber: number;
  title: string;
  hook: string;
  body: string;
  cta: string;
  visualDirection: string;
}

const VideoIdeasSelection: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { brandId, productId } = useParams<{ brandId: string; productId: string }>();
  const state = location.state as LocationState | null;

  const [ideas, setIdeas] = useState<VideoIdea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIdea, setSelectedIdea] = useState<number | null>(null);
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    generateIdeas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const generateIdeas = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/video-ads/generate-ideas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          brandId,
          productId,
          platform: state?.videoParameters.platform,
          ageGroup: state?.videoParameters.ageGroup,
          primaryGoal: state?.videoParameters.primaryGoal
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate ideas');
      }

      const data = await response.json();
      setIdeas(data.ideas);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate ideas');
      console.error('Error generating ideas:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = async () => {
    if (selectedIdea === null) return;

    setIsGeneratingScript(true);

    try {
      const selectedIdeaData = ideas.find(idea => idea.ideaNumber === selectedIdea);
      
      // Navigate to video generation page with selected idea
      navigate(`/brands/${brandId}/products/${productId}/video-generation`, {
        state: {
          ...state,
          selectedIdea: selectedIdeaData
        }
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to proceed');
      console.error('Error:', err);
      setIsGeneratingScript(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Generating Video Ideas...</h2>
          <p className="text-gray-600">Our AI is creating 6 unique concepts for your video ad</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          
          <button
            onClick={generateIdeas}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Regenerate Ideas</span>
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* Context Info */}
        {state?.brandName && (
          <div className="text-center mb-4">
            <span className="inline-flex items-center px-4 py-2 bg-white rounded-full border border-gray-200 text-sm text-gray-600">
              Creating video ad for <span className="font-medium text-gray-900 ml-1">{state.brandName}</span>
              {state.productName && (
                <><span className="mx-2">•</span><span className="font-medium text-gray-900">{state.productName}</span></>
              )}
            </span>
          </div>
        )}

        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Select Your Video Concept</h1>
          <p className="text-gray-600 text-lg">Choose the idea that best represents your vision</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Ideas Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {ideas.map((idea) => {
            const isSelected = selectedIdea === idea.ideaNumber;

            return (
              <div
                key={idea.ideaNumber}
                onClick={() => setSelectedIdea(idea.ideaNumber)}
                className={`
                  relative rounded-2xl p-6 border-2 transition-all cursor-pointer
                  ${isSelected
                    ? 'border-purple-500 bg-purple-50 shadow-xl'
                    : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-lg'
                  }
                `}
              >
                {/* Selection Indicator */}
                {isSelected && (
                  <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center shadow-md">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                )}

                {/* Idea Number Badge */}
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4 ${
                  isSelected ? 'bg-purple-200' : 'bg-gray-100'
                }`}>
                  <Lightbulb className={`w-4 h-4 ${isSelected ? 'text-purple-700' : 'text-gray-600'}`} />
                  <span className={`text-sm font-medium ${isSelected ? 'text-purple-700' : 'text-gray-600'}`}>
                    Idea {idea.ideaNumber}
                  </span>
                </div>

                {/* Idea Content */}
                <h3 className="text-xl font-bold text-gray-900 mb-4">{idea.title}</h3>
                
                <div className="space-y-3">
                  <div>
                    <span className="text-xs font-semibold text-purple-600 uppercase tracking-wide">Hook</span>
                    <p className="text-sm text-gray-700 mt-1">{idea.hook}</p>
                  </div>
                  
                  <div>
                    <span className="text-xs font-semibold text-purple-600 uppercase tracking-wide">Body</span>
                    <p className="text-sm text-gray-700 mt-1">{idea.body}</p>
                  </div>
                  
                  <div>
                    <span className="text-xs font-semibold text-purple-600 uppercase tracking-wide">Call to Action</span>
                    <p className="text-sm text-gray-700 mt-1">{idea.cta}</p>
                  </div>
                  
                  {idea.visualDirection && (
                    <div>
                      <span className="text-xs font-semibold text-purple-600 uppercase tracking-wide">Visual Direction</span>
                      <p className="text-sm text-gray-700 mt-1">{idea.visualDirection}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Continue Button */}
        <div className="flex justify-center">
          <button
            onClick={handleContinue}
            disabled={selectedIdea === null || isGeneratingScript}
            className={`
              flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold text-lg transition-all
              ${selectedIdea !== null && !isGeneratingScript
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            {isGeneratingScript ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating Script...
              </>
            ) : (
              <>
                Continue to Script Generation
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </main>
    </div>
  );
};

export default VideoIdeasSelection;
