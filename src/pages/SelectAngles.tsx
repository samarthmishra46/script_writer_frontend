import React, { useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Heart,
  Minimize2,
  Crown,
  Lightbulb,
  RefreshCw,
  Home,
  Shield,
  Users,
  Sparkles,
  Tag,
  ArrowRight,
  Check
} from 'lucide-react';
import { buildApiUrl } from '../config/api';

interface LocationState {
  brandName: string;
  productName: string;
  category: string;
  adType: string;
}

const ANGLES = [
  {
    id: 'Emotional_Appeal',
    title: 'Emotional Appeal',
    description: 'Evoke deep emotions and personal connections',
    icon: Heart,
    color: 'rose',
  },
  {
    id: 'Minimalist',
    title: 'Minimalist',
    description: 'Clean, simple, focused designs',
    icon: Minimize2,
    color: 'gray',
  },
  {
    id: 'Premium_Luxury',
    title: 'Premium / Luxury',
    description: 'High-end, sophisticated aesthetics',
    icon: Crown,
    color: 'amber',
  },
  {
    id: 'Problem_Solution',
    title: 'Problem–Solution',
    description: 'Address pain points with solutions',
    icon: Lightbulb,
    color: 'yellow',
  },
  {
    id: 'Transformation',
    title: 'Transformation',
    description: 'Before/after and change narratives',
    icon: RefreshCw,
    color: 'emerald',
  },
  {
    id: 'Lifestyle_Aspiration',
    title: 'Lifestyle Aspiration',
    description: 'Aspirational lifestyle imagery',
    icon: Home,
    color: 'sky',
  },
  {
    id: 'Trust_Credibility',
    title: 'Trust & Credibility',
    description: 'Build trust through authenticity',
    icon: Shield,
    color: 'blue',
  },
  {
    id: 'Social_Proof',
    title: 'Social Proof',
    description: 'Testimonials and social validation',
    icon: Users,
    color: 'indigo',
  },
  {
    id: 'Curiosity_Pattern_Break',
    title: 'Curiosity / Pattern Break',
    description: 'Attention-grabbing, unexpected content',
    icon: Sparkles,
    color: 'purple',
  },
  {
    id: 'Value_Offer_Focus',
    title: 'Value & Offer Focus',
    description: 'Highlight deals, discounts, value',
    icon: Tag,
    color: 'orange',
  },
];

const getColorClasses = (color: string) => {
  const colors: Record<string, { bg: string; border: string; icon: string; selectedBg: string }> = {
    rose: { bg: 'bg-rose-50', border: 'border-rose-300', icon: 'text-rose-600', selectedBg: 'bg-rose-100' },
    gray: { bg: 'bg-gray-50', border: 'border-gray-400', icon: 'text-gray-600', selectedBg: 'bg-gray-100' },
    amber: { bg: 'bg-amber-50', border: 'border-amber-300', icon: 'text-amber-600', selectedBg: 'bg-amber-100' },
    yellow: { bg: 'bg-yellow-50', border: 'border-yellow-300', icon: 'text-yellow-600', selectedBg: 'bg-yellow-100' },
    emerald: { bg: 'bg-emerald-50', border: 'border-emerald-300', icon: 'text-emerald-600', selectedBg: 'bg-emerald-100' },
    sky: { bg: 'bg-sky-50', border: 'border-sky-300', icon: 'text-sky-600', selectedBg: 'bg-sky-100' },
    blue: { bg: 'bg-blue-50', border: 'border-blue-300', icon: 'text-blue-600', selectedBg: 'bg-blue-100' },
    indigo: { bg: 'bg-indigo-50', border: 'border-indigo-300', icon: 'text-indigo-600', selectedBg: 'bg-indigo-100' },
    purple: { bg: 'bg-purple-50', border: 'border-purple-300', icon: 'text-purple-600', selectedBg: 'bg-purple-100' },
    orange: { bg: 'bg-orange-50', border: 'border-orange-300', icon: 'text-orange-600', selectedBg: 'bg-orange-100' },
  };
  return colors[color] || colors.purple;
};

const SelectAngles: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { brandId, productId } = useParams<{ brandId: string; productId: string }>();
  const state = location.state as LocationState | null;

  const [selectedAngles, setSelectedAngles] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showOutOfCredits, setShowOutOfCredits] = useState(false);

  const storedUser = localStorage.getItem('user');
  let parsedUser: { subscription?: { status?: string; plan?: string } } | null = null;
  try {
    parsedUser = storedUser ? JSON.parse(storedUser) : null;
  } catch {
    parsedUser = null;
  }
  const hasActivePaidSubscription = Boolean(
    parsedUser?.subscription?.status === 'active' &&
      (parsedUser?.subscription?.plan === 'individual' || parsedUser?.subscription?.plan === 'organization')
  );
  const maxAngles = hasActivePaidSubscription ? 5 : 1;

  const toggleAngle = (angleId: string) => {
    setSelectedAngles(prev => {
      if (prev.includes(angleId)) {
        return prev.filter(id => id !== angleId);
      }
      // Limit to 5 angles for subscribers, 1 for trial users
      if (prev.length >= maxAngles) {
        return prev;
      }
      return [...prev, angleId];
    });
  };

  const handleGenerate = async () => {
    if (selectedAngles.length === 0) return;

    setIsGenerating(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Start ad generation
      const response = await fetch(buildApiUrl('api/ads/generate'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          brandId: brandId,
          productId: productId,
          adType: state?.adType || 'image',
          angles: selectedAngles,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 402) {
          setShowOutOfCredits(true);
          setIsGenerating(false);
          return;
        }
        throw new Error(result.message || 'Failed to start generation');
      }

      // Navigate to generation progress page
      navigate(`/generating/${result.data.adId}`, {
        state: {
          adId: result.data.adId,
          brandName: state?.brandName,
          productName: state?.productName,
          angles: selectedAngles,
          adType: state?.adType,
        }
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <div className="text-sm text-gray-500">
            {selectedAngles.length}/{maxAngles} angles selected
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-12">
        {/* Context Info */}
        {state?.brandName && (
          <div className="text-center mb-4">
            <span className="inline-flex items-center px-4 py-2 bg-white rounded-full border border-gray-200 text-sm text-gray-600">
              <span className="font-medium text-gray-900">{state.brandName}</span>
              {state.productName && (
                <><span className="mx-2">•</span><span className="font-medium text-gray-900">{state.productName}</span></>
              )}
              <span className="mx-2">•</span>
              <span className="capitalize font-medium text-purple-600">{state.adType} Ad</span>
            </span>
          </div>
        )}

        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Choose Your Creative Angles</h1>
          <p className="text-gray-600 text-lg">
            {hasActivePaidSubscription
              ? 'Select 1-5 creative angles to generate diverse ad variations'
              : 'Free trial allows only 1 angle. Upgrade to unlock more.'}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-center">
            {error}
          </div>
        )}

        {/* Angles Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {ANGLES.map((angle) => {
            const Icon = angle.icon;
            const isSelected = selectedAngles.includes(angle.id);
            const colorClasses = getColorClasses(angle.color);

            return (
              <div
                key={angle.id}
                onClick={() => toggleAngle(angle.id)}
                className={`
                  relative rounded-2xl p-5 border-2 transition-all cursor-pointer
                  ${isSelected 
                    ? `${colorClasses.selectedBg} ${colorClasses.border} shadow-md` 
                    : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  }
                `}
              >
                {/* Selection Checkbox */}
                <div className={`
                  absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
                  ${isSelected 
                    ? `${colorClasses.border} ${colorClasses.selectedBg}` 
                    : 'border-gray-300'
                  }
                `}>
                  {isSelected && (
                    <Check className={`w-4 h-4 ${colorClasses.icon}`} />
                  )}
                </div>

                {/* Content */}
                <div className="flex items-start gap-4 pr-8">
                  <div className={`p-2.5 rounded-xl ${colorClasses.bg}`}>
                    <Icon className={`w-6 h-6 ${colorClasses.icon}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{angle.title}</h3>
                    <p className="text-sm text-gray-600">{angle.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Summary */}
        {selectedAngles.length > 0 && (
          <div className="bg-white rounded-2xl p-6 border border-gray-200 mb-8">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Selected angles:</h3>
            <div className="flex flex-wrap gap-2">
              {selectedAngles.map(angleId => {
                const angle = ANGLES.find(a => a.id === angleId);
                if (!angle) return null;
                const colorClasses = getColorClasses(angle.color);
                return (
                  <span
                    key={angleId}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${colorClasses.selectedBg} ${colorClasses.icon}`}
                  >
                    {angle.title}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleAngle(angleId);
                      }}
                      className="ml-1 hover:opacity-70"
                    >
                      ×
                    </button>
                  </span>
                );
              })}
            </div>
            <p className="text-sm text-gray-500 mt-3">
              ~{selectedAngles.length * 4} images will be generated ({selectedAngles.length} angles × 4 variations each)
              {!hasActivePaidSubscription && ' • 2 images will be unlocked on trial'}
            </p>
          </div>
        )}

        {/* Generate Button */}
        <div className="flex justify-center">
          <button
            onClick={handleGenerate}
            disabled={selectedAngles.length === 0 || isGenerating}
            className={`
              flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold text-lg transition-all
              ${selectedAngles.length > 0 && !isGenerating
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            {isGenerating ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Starting Generation...
              </>
            ) : (
              <>
                Generate Ads
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
        {showOutOfCredits && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Out of LiPiCoins</h3>
              <p className="text-gray-600 mb-6">
                You’ve used all your trial LiPiCoins. Add more LiPiCoins to generate additional images.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowOutOfCredits(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => navigate('/subscription')}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Manage LiPiCoins
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default SelectAngles;
