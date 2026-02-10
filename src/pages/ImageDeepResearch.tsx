import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Zap,
  TrendingUp,
  Users,
  Target,
  ArrowRight,
  Image as ImageIcon,
  Sparkles,
} from 'lucide-react';
import { buildApiUrl } from '../config/api';

interface LocationState {
  brandName: string;
  productName: string;
  category: string;
}

interface ResearchData {
  productAnalysis: {
    keyFeatures: string[];
    targetDemographics: string;
    positioning: string;
    uniqueValuePropositions: string[];
  };
  directCompetitors: Array<{
    name: string;
    positioning: string;
    keyDifferentiators: string[];
  }>;
  indirectCompetitors: Array<{
    name: string;
    positioning: string;
  }>;
  competitorAdvertising: Array<{
    competitorName: string;
    platforms: string[];
    adFormats: string[];
    messagingThemes: string[];
    visualStyle: string;
    recentCampaigns: Array<{ campaignName: string; focus: string }>;
  }>;
  marketTrends: {
    currentTrends: string[];
    consumerBehavior: string;
  };
  recommendedStrategies: {
    effectiveFormats: string[];
    keyMessagingAngles: string[];
    visualStyle: string;
  };
}

const ImageDeepResearch: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { brandId, productId } = useParams<{ brandId: string; productId: string }>();
  const state = location.state as LocationState | null;

  const [currentStep, setCurrentStep] = useState<'starting' | 'researching' | 'completed' | 'selecting-angles' | 'generating'>('starting');
  const [jobId, setJobId] = useState<string | null>(null);
  const [researchData, setResearchData] = useState<ResearchData | null>(null);
  const [selectedAngles, setSelectedAngles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string>('');

  // Polling interval
  useEffect(() => {
    if (!jobId || currentStep !== 'researching') return;

    const interval = setInterval(async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(buildApiUrl(`api/image-deep-research/status/${jobId}`), {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        const result = await response.json();

        if (result.success) {
          setProgress(result.progress || '');

          if (result.status === 'completed' && result.result) {
            setResearchData(result.result.researchData);
            setCurrentStep('completed');
          } else if (result.status === 'failed') {
            setError(result.error || 'Research failed');
            setCurrentStep('starting');
          }
        }
      } catch (err) {
        console.error('Error polling status:', err);
      }
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(interval);
  }, [jobId, currentStep]);

  const startDeepResearch = async () => {
    if (!brandId || !productId) return;

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(buildApiUrl('api/image-deep-research/start'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          brandId,
          productId,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to start research');
      }

      setJobId(result.jobId);
      setCurrentStep('researching');
      setProgress('Initializing deep research analysis...');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start research');
    } finally {
      setLoading(false);
    }
  };

  const handleAngleToggle = (angle: string) => {
    setSelectedAngles(prev =>
      prev.includes(angle) ? prev.filter(a => a !== angle) : [...prev, angle]
    );
  };

  const startAdGeneration = async () => {
    if (!jobId || selectedAngles.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(buildApiUrl('api/image-deep-research/generate-ads'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobId,
          selectedAngles,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to generate ads');
      }

      // Navigate to generation status page
      navigate(`/brands/${brandId}/products/${productId}/deep-research-generating`, {
        state: {
          generationJobId: result.jobId,
          ...state,
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start ad generation');
    } finally {
      setLoading(false);
    }
  };

  // Starting state
  if (currentStep === 'starting') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-4 py-4 flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-4 py-12">
          {/* Title */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 mb-6">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-3">Image Deep Research</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our AI will research your brand, analyze competitors, and generate 20 optimized image ads based on market insights.
            </p>
          </div>

          {/* Info Cards */}
          <div className="grid md:grid-cols-3 gap-4 mb-12">
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-amber-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Market Research</h3>
              </div>
              <p className="text-sm text-gray-600">Deep analysis of your market, competitors, and trends</p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Competitor Analysis</h3>
              </div>
              <p className="text-sm text-gray-600">Insights into competitor strategies and ad approaches</p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <ImageIcon className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900">20 AI Ads</h3>
              </div>
              <p className="text-sm text-gray-600">Generated with competitor and product insights</p>
            </div>
          </div>

          {/* Time Warning */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-amber-900 mb-1">This may take 10-20 minutes</h3>
                <p className="text-sm text-amber-800">
                  Our AI is performing comprehensive research. You can close this tab and come back later. Your research will continue in the background.
                </p>
              </div>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-700 font-medium">Error</p>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          )}

          {/* Start Button */}
          <div className="flex justify-center">
            <button
              onClick={startDeepResearch}
              disabled={loading}
              className="px-8 py-4 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-xl font-semibold hover:from-amber-700 hover:to-amber-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Start Deep Research (100 credits)
                </>
              )}
            </button>
          </div>
        </main>
      </div>
    );
  }

  // Researching state
  if (currentStep === 'researching') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 mb-8 animate-pulse">
            <Sparkles className="w-10 h-10 text-white" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">Deep Research in Progress</h2>

          <div className="bg-white rounded-xl p-8 border border-gray-200 mb-8">
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="w-3 h-3 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-3 h-3 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-3 h-3 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>

            <p className="text-gray-600 font-medium mb-2">{progress || 'Analyzing your market...'}</p>
            <p className="text-sm text-gray-500">This may take 10-20 minutes</p>
          </div>

          <p className="text-gray-600 text-sm">
            💡 Tip: You can leave this page. Your research will continue in the background.
          </p>
        </div>
      </div>
    );
  }

  // Completed - Angle Selection
  if (currentStep === 'completed' && researchData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-4 py-4 flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-4 py-12">
          {/* Success Message */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-12">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
              <div>
                <h3 className="font-semibold text-green-900">Research Complete!</h3>
                <p className="text-sm text-green-800">Deep research analysis completed. Review the insights below and select ad angles.</p>
              </div>
            </div>
          </div>

          {/* Research Results Section */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Product Analysis */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" />
                Product Analysis
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">Key Features</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {researchData.productAnalysis.keyFeatures.slice(0, 3).map((feature, idx) => (
                      <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">Positioning</p>
                  <p className="text-sm text-gray-700 mt-1">{researchData.productAnalysis.positioning}</p>
                </div>
              </div>
            </div>

            {/* Market Trends */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-amber-600" />
                Market Trends
              </h3>
              <div className="space-y-2">
                {researchData.marketTrends.currentTrends.slice(0, 4).map((trend, idx) => (
                  <p key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                    <span className="text-amber-600 mt-0.5">→</span>
                    {trend}
                  </p>
                ))}
              </div>
            </div>
          </div>

          {/* Competitors Overview */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 mb-12">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              Top Competitors
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {researchData.directCompetitors.slice(0, 3).map((comp, idx) => (
                <div key={idx} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="font-semibold text-gray-900">{comp.name}</p>
                  <p className="text-sm text-gray-600 mt-1">{comp.positioning}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Angle Selection */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 mb-12">
            <h3 className="font-semibold text-gray-900 mb-6">Select Ad Angles for Generation</h3>
            <p className="text-sm text-gray-600 mb-6">Choose the angles you want your ads to focus on:</p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
              {[
                'Emotional_Appeal',
                'Problem_Solution',
                'Social_Proof',
                'Value_Offer_Focus',
                'Transformation',
                'Trust_Credibility',
              ].map(angle => (
                <button
                  key={angle}
                  onClick={() => handleAngleToggle(angle)}
                  className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                    selectedAngles.includes(angle)
                      ? 'border-amber-500 bg-amber-50 text-amber-900'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {angle.replace(/_/g, ' ')}
                </button>
              ))}
            </div>

            <p className="text-xs text-gray-500 mb-6">
              Selected: {selectedAngles.length} angle{selectedAngles.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-3 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors font-medium"
            >
              Back
            </button>
            <button
              onClick={startAdGeneration}
              disabled={loading || selectedAngles.length === 0}
              className="px-8 py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-xl font-semibold hover:from-amber-700 hover:to-amber-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  Generate 20 Ads (200 credits)
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </main>
      </div>
    );
  }

  return null;
};

export default ImageDeepResearch;
