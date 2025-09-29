import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Image, Video, UserCircle, Sparkles, Clock, TrendingUp } from 'lucide-react';

interface AdType {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  features: string[];
  isAvailable: boolean;
  comingSoon?: boolean;
  bgGradient: string;
  iconColor: string;
}

const AdTypeSelector: React.FC = () => {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<string>('');

  const adTypes: AdType[] = [
    {
      id: 'video',
      title: 'Video Ads',
      description: 'Create stunning video advertisements with AI-generated scenes and characters',
      icon: Video,
      features: [
        'AI-generated characters',
        'Scene-by-scene composition',
        'Professional cinematography',
        '8-second video scenes',
        'Character consistency',
        'Automatic stitching'
      ],
      isAvailable: true,
      bgGradient: 'from-purple-500 to-blue-600',
      iconColor: 'text-purple-600'
    },
    {
      id: 'image',
      title: 'Image Ads',
      description: 'Generate compelling static image advertisements for social media and digital platforms',
      icon: Image,
      features: [
        'AI-generated visuals',
        'Brand-focused composition',
        'Multiple style options',
        'High-resolution outputs',
        'Social media ready',
        'Professional design'
      ],
      isAvailable: true,
      bgGradient: 'from-green-500 to-teal-600',
      iconColor: 'text-green-600'
    },
    {
      id: 'ugc',
      title: 'AI Avatar UGC Ads',
      description: 'Create user-generated content style ads with AI avatars and authentic storytelling',
      icon: UserCircle,
      features: [
        'Realistic AI avatars',
        'UGC-style content',
        'Authentic testimonials',
        'Multiple avatar options',
        'Natural speech patterns',
        'Social proof focus'
      ],
      isAvailable: false,
      comingSoon: true,
      bgGradient: 'from-orange-500 to-red-600',
      iconColor: 'text-orange-600'
    }
  ];

  const handleTypeSelect = (typeId: string) => {
    const selectedAdType = adTypes.find(type => type.id === typeId);
    
    if (!selectedAdType?.isAvailable) {
      return; // Don't allow selection of unavailable types
    }

    setSelectedType(typeId);
  };

  const handleContinue = () => {
    if (!selectedType) return;

    const selectedAdType = adTypes.find(type => type.id === selectedType);
    
    if (!selectedAdType?.isAvailable) {
      return;
    }

    // Navigate to appropriate page based on selection
    switch (selectedType) {
      case 'video':
        navigate('/create-script-wizard');
        break;
      case 'image':
        navigate('/create-image-ads');
        break;
      case 'ugc':
        // Handle UGC navigation when available
        break;
      default:
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="p-3 bg-purple-100 rounded-full">
              <Sparkles className="h-8 w-8 text-purple-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Ad Type
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Select the type of advertisement you want to create. Each option is optimized for different marketing goals and platforms.
          </p>
        </div>

        {/* Ad Type Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
          {adTypes.map((adType) => (
            <div
              key={adType.id}
              className={`relative group cursor-pointer transition-all duration-300 ${
                selectedType === adType.id
                  ? 'transform scale-105 shadow-2xl'
                  : 'hover:transform hover:scale-102 hover:shadow-xl'
              } ${
                !adType.isAvailable
                  ? 'opacity-60 cursor-not-allowed'
                  : ''
              }`}
              onClick={() => handleTypeSelect(adType.id)}
            >
              {/* Selection Border */}
              <div
                className={`absolute inset-0 rounded-2xl border-4 transition-all duration-300 ${
                  selectedType === adType.id
                    ? 'border-purple-500 shadow-lg'
                    : 'border-transparent'
                }`}
              />
              
              {/* Card Content */}
              <div className="relative bg-white rounded-2xl p-8 h-full border border-gray-200">
                {/* Coming Soon Badge */}
                {adType.comingSoon && (
                  <div className="absolute top-4 right-4">
                    <div className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      Coming Soon
                    </div>
                  </div>
                )}

                {/* Icon */}
                <div className={`w-16 h-16 bg-gradient-to-br ${adType.bgGradient} rounded-2xl flex items-center justify-center mb-6 group-hover:shadow-lg transition-shadow duration-300`}>
                  <adType.icon className="h-8 w-8 text-white" />
                </div>

                {/* Title and Description */}
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {adType.title}
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {adType.description}
                </p>

                {/* Features */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    Key Features
                  </h4>
                  <ul className="space-y-2">
                    {adType.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-600">
                        <div className={`w-1.5 h-1.5 rounded-full ${adType.iconColor.replace('text-', 'bg-')} mr-3 flex-shrink-0`} />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Selection Indicator */}
                {selectedType === adType.id && adType.isAvailable && (
                  <div className="absolute bottom-4 right-4">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                      <ArrowRight className="h-4 w-4 text-white" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Continue Button */}
        {selectedType && (
          <div className="text-center">
            <button
              onClick={handleContinue}
              className={`inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-xl text-white transition-all duration-300 ${
                adTypes.find(type => type.id === selectedType)?.isAvailable
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transform hover:scale-105'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
              disabled={!adTypes.find(type => type.id === selectedType)?.isAvailable}
            >
              <span>Continue with {adTypes.find(type => type.id === selectedType)?.title}</span>
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </div>
        )}

        {/* Stats Section */}
        <div className="mt-16 grid md:grid-cols-3 gap-8 max-w-4xl mx-auto text-center">
          <div className="p-6">
            <div className="flex items-center justify-center mb-4">
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">98%</h3>
            <p className="text-gray-600">Customer Satisfaction</p>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-center mb-4">
              <Sparkles className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">10K+</h3>
            <p className="text-gray-600">Ads Generated</p>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-center mb-4">
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">2 min</h3>
            <p className="text-gray-600">Average Creation Time</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdTypeSelector;