import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Target, Lightbulb, CheckCircle, Loader2, TrendingUp, Eye, Zap, RefreshCw } from 'lucide-react';
import { buildApiUrl } from '../config/api';

interface CompetitorInsight {
  competitor_name: string;
  top_hooks: string[];
  top_ctas: string[];
  common_visuals: string[];
  tone_and_style: string;
  extra_thoughts: string;
}

interface StrategySuggestion {
  id: string;
  title: string;
  description: string;
  approach: string;
  visual_direction: string;
  hook_style: string;
  differentiator: string;
  estimated_impact: 'high' | 'medium' | 'low';
}

interface CampaignData {
  product: string;
  brand_name: string;
  selling_what: string;
  target_audience: string;
  call_to_action: string;
  visual_style: string;
  color_scheme: string;
  text_emphasis: string;
  platform: string;
  image_format: string;
  special_offers: string;
  product_image_urls: string[];
  competitor_search_query: string;
  competitor_options?: {
    ad_reached_countries?: string;
    ad_active_status?: string;
    media_type?: string;
    publisher_platforms?: string[];
    ad_delivery_date_min?: string;
    ad_delivery_date_max?: string;
  };
}

const CompetitorStrategy: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [competitorInsights, setCompetitorInsights] = useState<CompetitorInsight | null>(null);
  const [strategies, setStrategies] = useState<StrategySuggestion[]>([]);
  const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null);
  const [campaignData, setCampaignData] = useState<CampaignData | null>(null);
  
  // Load campaign data from navigation state
  useEffect(() => {
    const state = location.state as { campaignData?: CampaignData };
    if (!state?.campaignData) {
      setError('No campaign data found. Please go back and fill in your product details.');
      setIsLoading(false);
      return;
    }
    setCampaignData(state.campaignData);
    fetchCompetitorAnalysis(state.campaignData);
  }, [location.state]);

  const fetchCompetitorAnalysis = async (data: CampaignData) => {
    try {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to continue');
        setIsLoading(false);
        return;
      }

      const response = await fetch(buildApiUrl('api/image-ads/analyze-competitor-strategy'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          competitor_search_query: data.competitor_search_query,
          competitor_options: data.competitor_options,
          product_info: {
            product: data.product,
            brand_name: data.brand_name,
            selling_what: data.selling_what,
            target_audience: data.target_audience,
            call_to_action: data.call_to_action,
          },
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to analyze competitors');
      }

      setCompetitorInsights(result.competitorInsights);
      setStrategies(result.strategies || []);
    } catch (err) {
      console.error('Competitor analysis error:', err);
      setError(err instanceof Error ? err.message : 'Failed to analyze competitors');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshStrategies = async () => {
    if (!campaignData) return;
    await fetchCompetitorAnalysis(campaignData);
  };

  const handleSelectStrategy = (strategyId: string) => {
    setSelectedStrategy(strategyId);
  };

  const handleGenerateCampaign = async () => {
    if (!selectedStrategy || !campaignData) return;

    const selected = strategies.find(s => s.id === selectedStrategy);
    if (!selected) return;

    setIsGenerating(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to continue');
        return;
      }

      // Navigate to a generating page or handle inline
      navigate('/create-image-ads/generating', {
        state: {
          campaignData: {
            ...campaignData,
            selected_strategy: selected,
          },
        },
      });
    } catch (err) {
      console.error('Error starting campaign:', err);
      setError(err instanceof Error ? err.message : 'Failed to start campaign generation');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSkipAndGenerate = () => {
    if (!campaignData) return;
    navigate('/create-image-ads/generating', {
      state: {
        campaignData: {
          ...campaignData,
          selected_strategy: null,
        },
      },
    });
  };

  const getImpactBadge = (impact: 'high' | 'medium' | 'low') => {
    const colors = {
      high: 'bg-green-100 text-green-800 border-green-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    const labels = {
      high: '🔥 High Impact',
      medium: '⚡ Medium Impact',
      low: '📊 Standard',
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${colors[impact]}`}>
        {labels[impact]}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-purple-200 rounded-full animate-pulse mx-auto"></div>
            <Target className="w-10 h-10 text-purple-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-bounce" />
          </div>
          <h2 className="mt-6 text-xl font-semibold text-gray-800">Analyzing Competitor Ads...</h2>
          <p className="mt-2 text-gray-500">Fetching insights from Meta Ads Library</p>
          <div className="mt-4 flex justify-center gap-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Analysis Failed</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate('/create-image-ads')}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Go Back
            </button>
            <button
              onClick={() => campaignData && fetchCompetitorAnalysis(campaignData)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/create-image-ads')}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Campaign Setup
          </button>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
              <Target className="w-8 h-8 text-purple-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Competitor Intelligence</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We analyzed your competitors' ads. Choose a strategy to differentiate your brand and capture the market.
            </p>
          </div>
        </div>

        {/* Competitor Insights Card */}
        {competitorInsights && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Eye className="w-6 h-6 text-purple-600" />
              <h2 className="text-xl font-semibold text-gray-800">
                What "{competitorInsights.competitor_name || campaignData?.competitor_search_query}" is Doing
              </h2>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Top Hooks */}
              <div className="bg-purple-50 rounded-lg p-4">
                <h3 className="font-medium text-purple-800 mb-2 flex items-center gap-2">
                  <Zap className="w-4 h-4" /> Top Hooks They Use
                </h3>
                <ul className="space-y-1">
                  {competitorInsights.top_hooks?.slice(0, 3).map((hook, i) => (
                    <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-purple-500">•</span>
                      <span>{hook}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTAs */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" /> Their Call-to-Actions
                </h3>
                <ul className="space-y-1">
                  {competitorInsights.top_ctas?.slice(0, 3).map((cta, i) => (
                    <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-blue-500">•</span>
                      <span>{cta}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Visual Style */}
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="font-medium text-green-800 mb-2 flex items-center gap-2">
                  <Eye className="w-4 h-4" /> Common Visual Elements
                </h3>
                <ul className="space-y-1">
                  {competitorInsights.common_visuals?.slice(0, 3).map((visual, i) => (
                    <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-green-500">•</span>
                      <span>{visual}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Tone & Style */}
            {competitorInsights.tone_and_style && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-800 mb-1">Overall Tone & Style</h3>
                <p className="text-sm text-gray-600">{competitorInsights.tone_and_style}</p>
              </div>
            )}

            {/* Extra Thoughts */}
            {competitorInsights.extra_thoughts && (
              <div className="mt-4 p-4 border-l-4 border-purple-400 bg-purple-50/50">
                <h3 className="font-medium text-purple-800 mb-1">💡 Key Insight</h3>
                <p className="text-sm text-gray-700">{competitorInsights.extra_thoughts}</p>
              </div>
            )}
          </div>
        )}

        {/* Strategy Suggestions */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Lightbulb className="w-6 h-6 text-yellow-500" />
              <h2 className="text-xl font-semibold text-gray-800">Recommended Strategies for You</h2>
            </div>
            <button
              onClick={handleRefreshStrategies}
              disabled={isLoading}
              className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Get New Ideas
            </button>
          </div>

          <p className="text-gray-500 mb-6">
            Based on competitor analysis, here are unique strategies to make your "{campaignData?.brand_name}" stand out:
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            {strategies.map((strategy) => (
              <div
                key={strategy.id}
                onClick={() => handleSelectStrategy(strategy.id)}
                className={`bg-white rounded-xl p-5 cursor-pointer transition-all duration-200 border-2 ${
                  selectedStrategy === strategy.id
                    ? 'border-purple-500 shadow-lg ring-2 ring-purple-200'
                    : 'border-transparent shadow hover:shadow-md hover:border-purple-200'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 text-lg">{strategy.title}</h3>
                  <div className="flex items-center gap-2">
                    {getImpactBadge(strategy.estimated_impact)}
                    {selectedStrategy === strategy.id && (
                      <CheckCircle className="w-6 h-6 text-purple-600" />
                    )}
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm mb-4">{strategy.description}</p>

                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="font-medium text-gray-700 min-w-[80px]">Approach:</span>
                    <span className="text-gray-600">{strategy.approach}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-medium text-gray-700 min-w-[80px]">Visuals:</span>
                    <span className="text-gray-600">{strategy.visual_direction}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-medium text-gray-700 min-w-[80px]">Hook:</span>
                    <span className="text-gray-600">{strategy.hook_style}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100">
                  <span className="text-xs font-medium text-purple-600">
                    ✨ {strategy.differentiator}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <p className="text-gray-600">
                {selectedStrategy 
                  ? '✅ Strategy selected! Ready to generate your campaign.' 
                  : 'Select a strategy above to get started'}
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleSkipAndGenerate}
                className="px-5 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Skip & Use Default
              </button>
              <button
                onClick={handleGenerateCampaign}
                disabled={!selectedStrategy || isGenerating}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Starting...
                  </>
                ) : (
                  <>
                    🚀 Generate with This Strategy
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompetitorStrategy;
