import React, { useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Image as ImageIcon,
  Video,
  Users,
  FileText,
  ArrowRight,
  Lock
} from 'lucide-react';

interface LocationState {
  brandName: string;
  productName: string;
  category: string;
}

const AD_TYPES = [
  {
    id: 'image',
    title: 'Image Ads',
    description: 'Create stunning static image advertisements optimized for social media',
    icon: ImageIcon,
    available: true,
    color: 'purple',
    gradient: 'from-purple-500 to-purple-600',
    bgGradient: 'from-purple-50 to-purple-100',
  },
  {
    id: 'video',
    title: 'Video Ads',
    description: 'Generate engaging video advertisements with motion graphics',
    icon: Video,
    available: false,
    color: 'blue',
    gradient: 'from-blue-500 to-blue-600',
    bgGradient: 'from-blue-50 to-blue-100',
  },
  {
    id: 'ugc',
    title: 'UGC Video Ads',
    description: 'Create authentic user-generated content style videos with AI avatars',
    icon: Users,
    available: false,
    color: 'green',
    gradient: 'from-green-500 to-green-600',
    bgGradient: 'from-green-50 to-green-100',
  },
  {
    id: 'script',
    title: 'Ad Script',
    description: 'Generate compelling ad copy and scripts for your campaigns',
    icon: FileText,
    available: false,
    color: 'orange',
    gradient: 'from-orange-500 to-orange-600',
    bgGradient: 'from-orange-50 to-orange-100',
  },
];

const SelectAdType: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { brandId, productId } = useParams<{ brandId: string; productId: string }>();
  const state = location.state as LocationState | null;
  
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const handleContinue = () => {
    if (!selectedType) return;

    navigate(`/brands/${brandId}/products/${productId}/select-angles`, {
      state: {
        ...state,
        adType: selectedType,
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Context Info */}
        {state?.brandName && (
          <div className="text-center mb-4">
            <span className="inline-flex items-center px-4 py-2 bg-white rounded-full border border-gray-200 text-sm text-gray-600">
              Creating ad for <span className="font-medium text-gray-900 ml-1">{state.brandName}</span>
              {state.productName && (
                <><span className="mx-2">•</span><span className="font-medium text-gray-900">{state.productName}</span></>
              )}
            </span>
          </div>
        )}

        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Select Ad Type</h1>
          <p className="text-gray-600 text-lg">Choose the type of advertisement you want to create</p>
        </div>

        {/* Ad Type Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {AD_TYPES.map((adType) => {
            const Icon = adType.icon;
            const isSelected = selectedType === adType.id;
            const isAvailable = adType.available;

            return (
              <div
                key={adType.id}
                onClick={() => isAvailable && setSelectedType(adType.id)}
                className={`
                  relative rounded-2xl p-6 border-2 transition-all cursor-pointer
                  ${isAvailable ? 'hover:shadow-lg' : 'opacity-60 cursor-not-allowed'}
                  ${isSelected 
                    ? `border-${adType.color}-500 bg-gradient-to-br ${adType.bgGradient} shadow-lg` 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                  }
                `}
              >
                {/* Coming Soon Badge */}
                {!isAvailable && (
                  <div className="absolute top-4 right-4 flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full">
                    <Lock className="w-3 h-3 text-gray-500" />
                    <span className="text-xs font-medium text-gray-500">Coming Soon</span>
                  </div>
                )}

                {/* Selection Indicator */}
                {isSelected && (
                  <div className={`absolute top-4 right-4 w-6 h-6 rounded-full bg-gradient-to-br ${adType.gradient} flex items-center justify-center`}>
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}

                {/* Content */}
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${adType.gradient} shadow-md`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{adType.title}</h3>
                    <p className="text-gray-600">{adType.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Continue Button */}
        <div className="flex justify-center">
          <button
            onClick={handleContinue}
            disabled={!selectedType}
            className={`
              flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold text-lg transition-all
              ${selectedType
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            Continue
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </main>
    </div>
  );
};

export default SelectAdType;
