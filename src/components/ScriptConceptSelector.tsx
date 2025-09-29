import React from 'react';
import { Clock, Heart, Zap, Trophy, Smile, ArrowLeft } from 'lucide-react';

interface AdConcept {
  id: number;
  title: string;
  emotionalTone: string;
  coreMessage: string;
  scriptSummary: string;
  featureTieIn: string;
  tagline: string;
  format: string;
}

interface ConceptData {
  adCampaign: string;
  ads: AdConcept[];
}

interface ScriptConceptSelectorProps {
  concepts: ConceptData;
  onSelectConcept: (concept: AdConcept) => void;
  onBack?: () => void;
  isGenerating?: boolean;
}

const getEmotionIcon = (emotionalTone: string) => {
  const tone = emotionalTone.toLowerCase();
  if (tone.includes('nostalgic') || tone.includes('heartwarming')) return <Heart className="w-5 h-5" />;
  if (tone.includes('energetic') || tone.includes('fun')) return <Zap className="w-5 h-5" />;
  if (tone.includes('confident') || tone.includes('aspirational')) return <Trophy className="w-5 h-5" />;
  if (tone.includes('hopeful') || tone.includes('romantic')) return <Heart className="w-5 h-5" />;
  if (tone.includes('relaxing') || tone.includes('serene')) return <Smile className="w-5 h-5" />;
  return <Smile className="w-5 h-5" />;
};

const getEmotionColor = (emotionalTone: string) => {
  const tone = emotionalTone.toLowerCase();
  if (tone.includes('nostalgic') || tone.includes('heartwarming')) return 'bg-amber-50 border-amber-200 text-amber-700';
  if (tone.includes('energetic') || tone.includes('fun')) return 'bg-orange-50 border-orange-200 text-orange-700';
  if (tone.includes('confident') || tone.includes('aspirational')) return 'bg-blue-50 border-blue-200 text-blue-700';
  if (tone.includes('hopeful') || tone.includes('romantic')) return 'bg-pink-50 border-pink-200 text-pink-700';
  if (tone.includes('relaxing') || tone.includes('serene')) return 'bg-green-50 border-green-200 text-green-700';
  return 'bg-purple-50 border-purple-200 text-purple-700';
};

const ScriptConceptSelector: React.FC<ScriptConceptSelectorProps> = ({
  concepts,
  onSelectConcept,
  onBack,
  isGenerating = false
}) => {
  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        {onBack && (
          <button
            onClick={onBack}
            className="mb-4 flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Form</span>
          </button>
        )}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Choose Your Ad Concept</h1>
          <p className="text-lg text-gray-600 mb-2">{concepts.adCampaign}</p>
          <p className="text-sm text-gray-500">Select the concept that best fits your vision to generate the full script</p>
        </div>
      </div>

      {/* Concept Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {concepts.ads.map((concept) => (
          <div
            key={concept.id}
            className={`bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105 ${
              isGenerating ? 'opacity-50 pointer-events-none' : ''
            }`}
            onClick={() => !isGenerating && onSelectConcept(concept)}
          >
            {/* Card Header */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className={`p-2 rounded-full ${getEmotionColor(concept.emotionalTone)}`}>
                    {getEmotionIcon(concept.emotionalTone)}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{concept.title}</h3>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getEmotionColor(concept.emotionalTone)}`}>
                      {concept.emotionalTone}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center text-sm text-gray-600 mb-3">
                <Clock className="w-4 h-4 mr-1" />
                {concept.format}
              </div>
              
              <p className="text-sm font-medium text-gray-800 italic">"{concept.coreMessage}"</p>
            </div>

            {/* Card Body */}
            <div className="p-6">
              {/* Script Summary */}
              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">Story Overview</h4>
                <p className="text-sm text-gray-700 leading-relaxed line-clamp-4">
                  {concept.scriptSummary}
                </p>
              </div>

              {/* Feature Tie-in */}
              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">Product Integration</h4>
                <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
                  {concept.featureTieIn}
                </p>
              </div>

              {/* Tagline */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-3 rounded-lg border border-purple-100">
                <h4 className="font-semibold text-gray-900 mb-1 text-xs uppercase tracking-wide">Tagline</h4>
                <p className="text-purple-800 font-medium italic">"{concept.tagline}"</p>
              </div>
            </div>

            {/* Card Footer */}
            <div className="px-6 pb-6">
              <button 
                className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                  isGenerating
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-md hover:shadow-lg'
                }`}
                disabled={isGenerating}
              >
                {isGenerating ? 'Generating...' : 'Generate Full Script'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Loading State */}
      {isGenerating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-xl shadow-2xl text-center max-w-md">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Generating Your Script</h3>
            <p className="text-gray-600">Creating your personalized ad script based on the selected concept...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScriptConceptSelector;