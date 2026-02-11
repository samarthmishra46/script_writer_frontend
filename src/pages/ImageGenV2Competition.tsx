import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Users,
  TrendingUp,
  Target,
  Lightbulb,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { buildApiUrl } from '../config/api';

interface LocationState {
  adId: string;
  brandName: string;
  productName: string;
  productImageUrl?: string;
}

interface Competitor {
  name: string;
  productType: string;
  marketPosition?: string;
  whyTheyCompete?: string;
  imageAdStrategy: {
    visualStyle: string;
    colorPalette?: string[];
    messagingTone?: string;
    commonCTAs?: string[];
    emotionalHooks?: string[];
    productPlacement?: string;
    strengthPoints?: string[];
    weaknesses?: string[];
    targetingOverlap?: string;
    messagingApproach?: string;
  };
}

interface CompetitionAnalysis {
  workflow?: string;
  directCompetitors: Competitor[];
  indirectCompetitors: Competitor[];
  categoryTrends: {
    dominantVisualStyles: string[];
    commonThemes: string[];
    effectiveCTAs: string[];
    emergingPatterns: string[];
    seasonalConsiderations: string[];
  };
  differentiationOpportunities: Array<{
    opportunity: string;
    howToLeverage: string;
    visualRecommendation: string;
    riskLevel: string;
  }>;
  strategicRecommendations: {
    positioningStatement: string;
    keyDifferentiators: string[];
    suggestedVisualApproach: string;
    emotionalTerritory: string;
    avoidPatterns: string[];
  };
  // GPT analysis specific fields
  recommendedHooks?: string[];
  recommendedCTAs?: string[];
  topCreatives?: Array<{
    brandName: string;
    adId: string;
    adSnapshotUrl: string;
    analysis: {
      effectivenessScore: number;
      primaryHook: string;
      keyTakeaways: string[];
    };
  }>;
}

const ImageGenV2Competition: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<CompetitionAnalysis | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['direct', 'trends', 'recommendations', 'hooks']));
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  useEffect(() => {
    if (!state?.adId) {
      navigate('/brands');
      return;
    }
    
    // Prevent duplicate API calls (React StrictMode issue)
    if (hasAnalyzed || isAnalyzing || analysis) {
      return;
    }
    
    // Start analysis automatically
    setHasAnalyzed(true);
    analyzeCompetition();
  }, [state, hasAnalyzed, isAnalyzing, analysis, navigate]);

  const analyzeCompetition = async () => {
    if (!state?.adId || isAnalyzing) return;
    
    setIsAnalyzing(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(buildApiUrl(`api/image-gen-v2/${state.adId}/analyze-competition`), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to analyze competition');
      }

      setAnalysis(result.data.competitionAnalysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setHasAnalyzed(false); // Allow retry on error
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  const handleContinue = () => {
    navigate('/image-gen-v2/prompts', {
      state: {
        adId: state?.adId,
        brandName: state?.brandName,
        productName: state?.productName,
        productImageUrl: state?.productImageUrl,
      },
    });
  };

  const getRiskColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'low': return 'text-green-400 bg-green-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'high': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

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
            <span className="text-white font-medium">Competition Analysis</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {['Product Info', 'Competition', 'Ad Copies', 'Generate'].map((step, index) => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                index <= 1 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-700 text-gray-400'
              }`}>
                {index < 1 ? <CheckCircle2 className="w-4 h-4" /> : index + 1}
              </div>
              <span className={`ml-2 text-sm ${
                index === 1 ? 'text-white' : index < 1 ? 'text-purple-400' : 'text-gray-500'
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
            Your Competition Strategy
          </h1>
          <p className="text-gray-400">
            AI-powered analysis of your competitors' image ad strategies
          </p>
        </div>

        {/* Loading State */}
        {isAnalyzing && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-purple-600/30 rounded-full"></div>
              <div className="w-20 h-20 border-4 border-purple-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
            </div>
            <p className="text-white text-lg mt-6">Analyzing your competition...</p>
            <p className="text-gray-400 text-sm mt-2">This may take a minute</p>
          </div>
        )}

        {/* Error State */}
        {error && !isAnalyzing && (
          <div className="max-w-md mx-auto p-6 bg-red-500/20 border border-red-500/50 rounded-2xl text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={analyzeCompetition}
              className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Analysis Results */}
        {analysis && !isAnalyzing && (
          <div className="space-y-6">
            {/* Direct Competitors */}
            <div className="bg-gray-800/50 rounded-2xl border border-gray-700 overflow-hidden">
              <button
                onClick={() => toggleSection('direct')}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-700/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Users className="w-6 h-6 text-blue-400" />
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-white">Direct Competitors</h3>
                    <p className="text-gray-400 text-sm">{analysis.directCompetitors?.length || 0} competitors analyzed</p>
                  </div>
                </div>
                {expandedSections.has('direct') ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>
              
              {expandedSections.has('direct') && (
                <div className="px-6 pb-6 space-y-4">
                  {analysis.directCompetitors?.map((competitor, index) => (
                    <div key={index} className="bg-gray-900/50 rounded-xl p-4 border border-gray-700">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-white font-medium">{competitor.name}</h4>
                        <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs">
                          {competitor.marketPosition}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm mb-3">{competitor.productType}</p>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500 mb-1">Visual Style</p>
                          <p className="text-gray-300">{competitor.imageAdStrategy?.visualStyle}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 mb-1">Messaging Tone</p>
                          <p className="text-gray-300">{competitor.imageAdStrategy?.messagingTone}</p>
                        </div>
                      </div>
                      
                      {competitor.imageAdStrategy?.commonCTAs && (
                        <div className="mt-3">
                          <p className="text-gray-500 text-sm mb-2">Common CTAs</p>
                          <div className="flex flex-wrap gap-2">
                            {competitor.imageAdStrategy.commonCTAs.map((cta, i) => (
                              <span key={i} className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs">
                                {cta}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {competitor.imageAdStrategy?.strengthPoints && (
                        <div className="mt-3 grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-green-400 text-sm mb-2">Strengths</p>
                            <ul className="text-gray-300 text-xs space-y-1">
                              {competitor.imageAdStrategy.strengthPoints.slice(0, 3).map((s, i) => (
                                <li key={i}>• {s}</li>
                              ))}
                            </ul>
                          </div>
                          {competitor.imageAdStrategy?.weaknesses && (
                            <div>
                              <p className="text-red-400 text-sm mb-2">Weaknesses</p>
                              <ul className="text-gray-300 text-xs space-y-1">
                                {competitor.imageAdStrategy.weaknesses.slice(0, 3).map((w, i) => (
                                  <li key={i}>• {w}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Category Trends */}
            <div className="bg-gray-800/50 rounded-2xl border border-gray-700 overflow-hidden">
              <button
                onClick={() => toggleSection('trends')}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-700/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-6 h-6 text-green-400" />
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-white">Category Trends</h3>
                    <p className="text-gray-400 text-sm">What's working in your industry</p>
                  </div>
                </div>
                {expandedSections.has('trends') ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>
              
              {expandedSections.has('trends') && (
                <div className="px-6 pb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700">
                    <p className="text-gray-400 text-sm mb-3">Dominant Visual Styles</p>
                    <div className="flex flex-wrap gap-2">
                      {analysis.categoryTrends?.dominantVisualStyles?.map((style, i) => (
                        <span key={i} className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">
                          {style}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700">
                    <p className="text-gray-400 text-sm mb-3">Effective CTAs</p>
                    <div className="flex flex-wrap gap-2">
                      {analysis.categoryTrends?.effectiveCTAs?.map((cta, i) => (
                        <span key={i} className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                          {cta}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700">
                    <p className="text-gray-400 text-sm mb-3">Common Themes</p>
                    <ul className="text-gray-300 text-sm space-y-1">
                      {analysis.categoryTrends?.commonThemes?.map((theme, i) => (
                        <li key={i}>• {theme}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700">
                    <p className="text-gray-400 text-sm mb-3">Emerging Patterns</p>
                    <ul className="text-gray-300 text-sm space-y-1">
                      {analysis.categoryTrends?.emergingPatterns?.map((pattern, i) => (
                        <li key={i}>• {pattern}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Differentiation Opportunities */}
            <div className="bg-gray-800/50 rounded-2xl border border-gray-700 overflow-hidden">
              <button
                onClick={() => toggleSection('opportunities')}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-700/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Target className="w-6 h-6 text-yellow-400" />
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-white">Differentiation Opportunities</h3>
                    <p className="text-gray-400 text-sm">How to stand out from competition</p>
                  </div>
                </div>
                {expandedSections.has('opportunities') ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>
              
              {expandedSections.has('opportunities') && (
                <div className="px-6 pb-6 space-y-3">
                  {analysis.differentiationOpportunities?.map((opp, index) => (
                    <div key={index} className="bg-gray-900/50 rounded-xl p-4 border border-gray-700">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-white font-medium">{opp.opportunity}</h4>
                        <span className={`px-2 py-1 rounded text-xs ${getRiskColor(opp.riskLevel)}`}>
                          {opp.riskLevel} risk
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm mb-2">{opp.howToLeverage}</p>
                      <p className="text-purple-400 text-sm">
                        <span className="text-gray-500">Visual:</span> {opp.visualRecommendation}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Strategic Recommendations */}
            <div className="bg-gray-800/50 rounded-2xl border border-gray-700 overflow-hidden">
              <button
                onClick={() => toggleSection('recommendations')}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-700/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Lightbulb className="w-6 h-6 text-purple-400" />
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-white">Strategic Recommendations</h3>
                    <p className="text-gray-400 text-sm">AI-powered suggestions for your ads</p>
                  </div>
                </div>
                {expandedSections.has('recommendations') ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>
              
              {expandedSections.has('recommendations') && (
                <div className="px-6 pb-6">
                  <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-xl p-4 border border-purple-500/30 mb-4">
                    <p className="text-gray-400 text-sm mb-2">Positioning Statement</p>
                    <p className="text-white font-medium">{analysis.strategicRecommendations?.positioningStatement}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700">
                      <p className="text-gray-400 text-sm mb-3">Key Differentiators</p>
                      <ul className="text-gray-300 text-sm space-y-1">
                        {analysis.strategicRecommendations?.keyDifferentiators?.map((diff, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-400" />
                            {diff}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700">
                      <p className="text-gray-400 text-sm mb-3">Avoid These Patterns</p>
                      <ul className="text-gray-300 text-sm space-y-1">
                        {analysis.strategicRecommendations?.avoidPatterns?.map((pattern, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-red-400" />
                            {pattern}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700">
                      <p className="text-gray-400 text-sm mb-2">Suggested Visual Approach</p>
                      <p className="text-gray-300">{analysis.strategicRecommendations?.suggestedVisualApproach}</p>
                    </div>
                    
                    <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700">
                      <p className="text-gray-400 text-sm mb-2">Emotional Territory</p>
                      <p className="text-gray-300">{analysis.strategicRecommendations?.emotionalTerritory}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Recommended Hooks & CTAs (GPT Workflow) */}
            {(analysis.recommendedHooks?.length || analysis.recommendedCTAs?.length) && (
              <div className="bg-gray-800/50 rounded-2xl border border-gray-700 overflow-hidden">
                <button
                  onClick={() => toggleSection('hooks')}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-700/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-6 h-6 text-pink-400" />
                    <div className="text-left">
                      <h3 className="text-lg font-semibold text-white">Recommended Hooks & CTAs</h3>
                      <p className="text-gray-400 text-sm">Top performing approaches for your brand</p>
                    </div>
                  </div>
                  {expandedSections.has('hooks') ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                
                {expandedSections.has('hooks') && (
                  <div className="px-6 pb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {analysis.recommendedHooks && analysis.recommendedHooks.length > 0 && (
                      <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700">
                        <p className="text-gray-400 text-sm mb-3">Top Hooks for Your Ads</p>
                        <div className="space-y-2">
                          {analysis.recommendedHooks.map((hook, i) => (
                            <div key={i} className="flex items-start gap-2 p-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
                              <span className="text-purple-400 font-bold text-sm">{i + 1}.</span>
                              <p className="text-gray-300 text-sm">{hook}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {analysis.recommendedCTAs && analysis.recommendedCTAs.length > 0 && (
                      <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700">
                        <p className="text-gray-400 text-sm mb-3">Recommended Call-to-Actions</p>
                        <div className="flex flex-wrap gap-2">
                          {analysis.recommendedCTAs.map((cta, i) => (
                            <span key={i} className="px-4 py-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 rounded-lg text-sm font-medium border border-green-500/30">
                              {cta}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Continue Button */}
            <div className="flex justify-end pt-4">
              <button
                onClick={handleContinue}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-blue-700 transition-all flex items-center gap-2"
              >
                <span>Generate Ad Copies</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ImageGenV2Competition;
