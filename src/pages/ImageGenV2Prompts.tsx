import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  FileText,
  Star,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Check,
  Palette,
  Target,
  Heart,
  Zap,
} from 'lucide-react';
import { buildApiUrl } from '../config/api';

interface LocationState {
  adId: string;
  brandName: string;
  productName: string;
  productImageUrl?: string;
}

interface AdPrompt {
  id: number;
  promptId?: number;
  creativeAngle: string;
  promptTitle: string;
  summary: string;
  fullPrompt: string;
  headline: string;
  subheadline: string;
  callToAction: string;
  visualStyle: string;
  productPlacement: string;
  dominantColors: string[];
  emotionalTone: string;
  targetEmotion: string;
  score: number;
  scoreBreakdown?: {
    clarity: number;
    creativity: number;
    brandRelevance: number;
    emotionalImpact: number;
    conversionPotential: number;
  };
  strengths?: string[];
  improvements?: string[];
  recommendation?: string;
}

const ImageGenV2Prompts: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;

  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prompts, setPrompts] = useState<AdPrompt[]>([]);
  const [selectedPromptIds, setSelectedPromptIds] = useState<Set<number>>(new Set());
  const [showAllPrompts, setShowAllPrompts] = useState(false);
  const [metadata, setMetadata] = useState<{
    totalPrompts: number;
    highScoringCount: number;
    averageScore: number;
  } | null>(null);

  useEffect(() => {
    if (!state?.adId) {
      navigate('/brands');
      return;
    }
    
    generatePrompts();
  }, [state]);

  const generatePrompts = async () => {
    if (!state?.adId) return;
    
    setIsGenerating(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(buildApiUrl(`api/image-gen-v2/${state.adId}/generate-prompts`), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to generate prompts');
      }

      // Sort by score and add promptId if not present
      const sortedPrompts = result.data.allPrompts
        .map((p: AdPrompt, index: number) => ({ ...p, promptId: p.id || index + 1 }))
        .sort((a: AdPrompt, b: AdPrompt) => b.score - a.score);
      
      setPrompts(sortedPrompts);
      setMetadata(result.data.metadata);

      // Auto-select high-scoring prompts (score >= 90)
      const highScoringIds = new Set(
        sortedPrompts
          .filter((p: AdPrompt) => p.score >= 90)
          .map((p: AdPrompt) => p.promptId || p.id)
      );
      setSelectedPromptIds(highScoringIds as Set<number>);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  const togglePromptSelection = (promptId: number) => {
    setSelectedPromptIds(prev => {
      const next = new Set(prev);
      if (next.has(promptId)) {
        next.delete(promptId);
      } else {
        next.add(promptId);
      }
      return next;
    });
  };

  const selectAll = () => {
    const displayedPrompts = showAllPrompts ? prompts : prompts.filter(p => p.score >= 90);
    const ids = new Set(displayedPrompts.map(p => p.promptId || p.id));
    setSelectedPromptIds(ids as Set<number>);
  };

  const deselectAll = () => {
    setSelectedPromptIds(new Set());
  };

  const handleGenerateImages = async () => {
    if (selectedPromptIds.size === 0) {
      setError('Please select at least one prompt');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(buildApiUrl(`api/image-gen-v2/${state?.adId}/generate-images`), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          selectedPromptIds: Array.from(selectedPromptIds),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to generate images');
      }

      // Navigate to swiper
      navigate('/image-gen-v2/swiper', {
        state: {
          adId: state?.adId,
          brandName: state?.brandName,
          productName: state?.productName,
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400 bg-green-500/20 border-green-500/30';
    if (score >= 80) return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
    if (score >= 70) return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
    return 'text-red-400 bg-red-500/20 border-red-500/30';
  };

  const getAngleIcon = (angle: string) => {
    switch (angle.toLowerCase()) {
      case 'emotional_appeal': return Heart;
      case 'problem_solution': return Target;
      case 'premium_luxury': return Star;
      case 'minimalist': return Palette;
      default: return Zap;
    }
  };

  const displayedPrompts = showAllPrompts ? prompts : prompts.filter(p => p.score >= 90);
  const highScoringCount = prompts.filter(p => p.score >= 90).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-gray-900/90 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <span className="text-white font-medium">Ad Copy Prompts</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {['Product Info', 'Competition', 'Ad Copies', 'Generate'].map((step, index) => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                index <= 2 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-700 text-gray-400'
              }`}>
                {index < 2 ? <CheckCircle2 className="w-4 h-4" /> : index + 1}
              </div>
              <span className={`ml-2 text-sm ${
                index === 2 ? 'text-white' : index < 2 ? 'text-purple-400' : 'text-gray-500'
              }`}>
                {step}
              </span>
              {index < 3 && (
                <ArrowRight className="w-4 h-4 text-gray-600 mx-4" />
              )}
            </div>
          ))}
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Select Ad Copy Prompts
          </h1>
          <p className="text-gray-400">
            Choose the prompts you want to generate images for
          </p>
        </div>

        {/* Loading State */}
        {isGenerating && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-purple-600/30 rounded-full"></div>
              <div className="w-20 h-20 border-4 border-purple-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
            </div>
            <p className="text-white text-lg mt-6">Generating creative ad copies...</p>
            <p className="text-gray-400 text-sm mt-2">Creating 25 unique prompts with AI scoring</p>
          </div>
        )}

        {/* Error State */}
        {error && !isGenerating && (
          <div className="max-w-md mx-auto p-6 bg-red-500/20 border border-red-500/50 rounded-2xl text-center mb-6">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={generatePrompts}
              className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Prompts List */}
        {!isGenerating && prompts.length > 0 && (
          <>
            {/* Stats and Controls */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-xl">
                  <Star className="w-5 h-5 text-green-400" />
                  <span className="text-green-400 font-medium">{highScoringCount} High Scoring (90+)</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-700/50 rounded-xl">
                  <FileText className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-400">{prompts.length} Total Prompts</span>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowAllPrompts(!showAllPrompts)}
                  className="px-4 py-2 text-purple-400 hover:text-purple-300 transition-colors"
                >
                  {showAllPrompts ? 'Show High Scoring Only' : 'Show All Prompts'}
                </button>
                <button
                  onClick={selectAll}
                  className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Select All
                </button>
                <button
                  onClick={deselectAll}
                  className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Deselect All
                </button>
              </div>
            </div>

            {/* Selected Count */}
            <div className="mb-4 p-4 bg-purple-500/20 border border-purple-500/30 rounded-xl">
              <p className="text-purple-300">
                <span className="font-semibold">{selectedPromptIds.size}</span> prompts selected for image generation
              </p>
            </div>

            {/* Prompts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {displayedPrompts.map((prompt) => {
                const isSelected = selectedPromptIds.has(prompt.promptId || prompt.id);
                const AngleIcon = getAngleIcon(prompt.creativeAngle);
                
                return (
                  <div
                    key={prompt.promptId || prompt.id}
                    onClick={() => togglePromptSelection(prompt.promptId || prompt.id)}
                    className={`relative bg-gray-800/50 rounded-2xl p-5 border-2 cursor-pointer transition-all hover:bg-gray-800/70 ${
                      isSelected 
                        ? 'border-purple-500 ring-2 ring-purple-500/20' 
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    {/* Selection Indicator */}
                    <div className={`absolute top-4 right-4 w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                      isSelected 
                        ? 'bg-purple-600' 
                        : 'bg-gray-700 border border-gray-600'
                    }`}>
                      {isSelected && <Check className="w-4 h-4 text-white" />}
                    </div>

                    {/* Score Badge */}
                    <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getScoreColor(prompt.score)}`}>
                      <Star className="w-4 h-4" />
                      <span>{prompt.score}</span>
                    </div>

                    {/* Title and Summary */}
                    <h3 className="text-lg font-semibold text-white mt-3 mb-2 pr-8">
                      {prompt.promptTitle}
                    </h3>
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                      {prompt.summary}
                    </p>

                    {/* Meta Info */}
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className="flex items-center gap-1 px-2 py-1 bg-gray-700/50 rounded text-xs text-gray-300">
                        <AngleIcon className="w-3 h-3" />
                        {prompt.creativeAngle.replace(/_/g, ' ')}
                      </span>
                      <span className="px-2 py-1 bg-gray-700/50 rounded text-xs text-gray-300">
                        {prompt.visualStyle}
                      </span>
                      <span className="px-2 py-1 bg-gray-700/50 rounded text-xs text-gray-300">
                        {prompt.emotionalTone}
                      </span>
                    </div>

                    {/* Headline Preview */}
                    <div className="p-3 bg-gray-900/50 rounded-lg border border-gray-700">
                      <p className="text-gray-500 text-xs mb-1">Headline</p>
                      <p className="text-white text-sm font-medium">{prompt.headline}</p>
                      <p className="text-purple-400 text-xs mt-2">CTA: {prompt.callToAction}</p>
                    </div>

                    {/* Score Breakdown (if available) */}
                    {prompt.scoreBreakdown && (
                      <div className="mt-3 grid grid-cols-5 gap-1">
                        {Object.entries(prompt.scoreBreakdown).map(([key, value]) => (
                          <div key={key} className="text-center">
                            <div className="text-xs text-gray-500 truncate">{key.slice(0, 3)}</div>
                            <div className="text-xs text-gray-300">{value}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Generate Button */}
            <div className="sticky bottom-6 flex justify-center">
              <button
                onClick={handleGenerateImages}
                disabled={isLoading || selectedPromptIds.size === 0}
                className="px-12 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl font-medium hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 shadow-2xl shadow-purple-500/25"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Generating Images...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Generate {selectedPromptIds.size} Images</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default ImageGenV2Prompts;
