import React, { useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Monitor,
  Smartphone,
  Tv,
  Globe,
  Loader2
} from 'lucide-react';

interface LocationState {
  brandName: string;
  productName: string;
  category: string;
  adType: string;
}

interface VideoParameters {
  platform: string;
  ageGroup: string;
  primaryGoal: string;
}

const PLATFORMS = [
  {
    value: 'instagram_reels',
    label: 'Instagram Reels / YouTube Shorts',
    icon: Smartphone,
    description: '15-30 sec, Mobile optimized (9:16)',
    duration: '15-30',
    format: 'mobile'
  },
  {
    value: 'youtube_long',
    label: 'YouTube Long Form',
    icon: Monitor,
    description: '30-60 sec, Desktop friendly (16:9)',
    duration: '30-60',
    format: 'desktop'
  },
  {
    value: 'tv',
    label: 'TV Commercial',
    icon: Tv,
    description: '30-45 sec, TV format (16:9)',
    duration: '30-45',
    format: 'desktop'
  },
  {
    value: 'website_hero',
    label: 'Website Hero',
    icon: Globe,
    description: '30-45 sec, Web optimized (16:9)',
    duration: '30-45',
    format: 'desktop'
  }
];

const AGE_GROUPS = [
  { value: 'children', label: 'Children (Below 12)', icon: '👶', description: 'Fun, colorful, simple messaging' },
  { value: 'teen', label: 'Teenagers (13-19)', icon: '👦', description: 'Trendy, energetic, social' },
  { value: 'adult', label: 'Adults (20-39)', icon: '👨', description: 'Professional, aspirational' },
  { value: 'mature', label: 'Mature Adults (40+)', icon: '👴', description: 'Sophisticated, trustworthy' }
];

const PRIMARY_GOALS = [
  { value: 'awareness', label: 'Awareness', icon: '👁️', description: 'Build brand recognition' },
  { value: 'click', label: 'Click / Engagement', icon: '👆', description: 'Drive clicks and interactions' },
  { value: 'app_install', label: 'App Install', icon: '📱', description: 'Increase app downloads' },
  { value: 'sales', label: 'Sales / Conversion', icon: '💰', description: 'Drive purchases and revenue' },
  { value: 'trust', label: 'Trust Building', icon: '🤝', description: 'Build credibility and trust' },
  { value: 'emotion', label: 'Emotional Connection', icon: '❤️', description: 'Create emotional bond' }
];

const VideoAdParameters: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { brandId, productId } = useParams<{ brandId: string; productId: string }>();
  const state = location.state as LocationState | null;

  const [parameters, setParameters] = useState<VideoParameters>({
    platform: '',
    ageGroup: '',
    primaryGoal: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isFormComplete = parameters.platform && parameters.ageGroup && parameters.primaryGoal;

  const handleContinue = async () => {
    if (!isFormComplete) return;

    setIsSubmitting(true);
    
    // Navigate to idea selection page with all the data
    navigate(`/brands/${brandId}/products/${productId}/video-ideas`, {
      state: {
        ...state,
        videoParameters: parameters
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
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
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Video Ad Configuration</h1>
          <p className="text-gray-600 text-lg">Help us create the perfect video ad for your audience</p>
        </div>

        {/* Platform Selection */}
        <div className="mb-10">
          <label className="block text-lg font-semibold text-gray-900 mb-4">
            1. Select Platform
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PLATFORMS.map((platform) => {
              const Icon = platform.icon;
              const isSelected = parameters.platform === platform.value;

              return (
                <div
                  key={platform.value}
                  onClick={() => setParameters({ ...parameters, platform: platform.value })}
                  className={`
                    relative rounded-xl p-5 border-2 transition-all cursor-pointer
                    ${isSelected
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                    }
                  `}
                >
                  {isSelected && (
                    <div className="absolute top-4 right-4 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${isSelected ? 'bg-blue-500' : 'bg-gray-100'}`}>
                      <Icon className={`w-6 h-6 ${isSelected ? 'text-white' : 'text-gray-600'}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{platform.label}</h3>
                      <p className="text-sm text-gray-600">{platform.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Age Group Selection */}
        <div className="mb-10">
          <label className="block text-lg font-semibold text-gray-900 mb-4">
            2. Select Target Age Group
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {AGE_GROUPS.map((ageGroup) => {
              const isSelected = parameters.ageGroup === ageGroup.value;

              return (
                <div
                  key={ageGroup.value}
                  onClick={() => setParameters({ ...parameters, ageGroup: ageGroup.value })}
                  className={`
                    relative rounded-xl p-5 border-2 transition-all cursor-pointer
                    ${isSelected
                      ? 'border-purple-500 bg-purple-50 shadow-md'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                    }
                  `}
                >
                  {isSelected && (
                    <div className="absolute top-4 right-4 w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <div className="text-3xl">{ageGroup.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{ageGroup.label}</h3>
                      <p className="text-sm text-gray-600">{ageGroup.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Primary Goal Selection */}
        <div className="mb-12">
          <label className="block text-lg font-semibold text-gray-900 mb-4">
            3. Select Primary Goal
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {PRIMARY_GOALS.map((goal) => {
              const isSelected = parameters.primaryGoal === goal.value;

              return (
                <div
                  key={goal.value}
                  onClick={() => setParameters({ ...parameters, primaryGoal: goal.value })}
                  className={`
                    relative rounded-xl p-5 border-2 transition-all cursor-pointer
                    ${isSelected
                      ? 'border-green-500 bg-green-50 shadow-md'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                    }
                  `}
                >
                  {isSelected && (
                    <div className="absolute top-4 right-4 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}

                  <div className="text-center">
                    <div className="text-3xl mb-2">{goal.icon}</div>
                    <h3 className="font-semibold text-gray-900 mb-1">{goal.label}</h3>
                    <p className="text-xs text-gray-600">{goal.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Continue Button */}
        <div className="flex justify-center">
          <button
            onClick={handleContinue}
            disabled={!isFormComplete || isSubmitting}
            className={`
              flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold text-lg transition-all
              ${isFormComplete && !isSubmitting
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Generate Video Ideas
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </main>
    </div>
  );
};

export default VideoAdParameters;
