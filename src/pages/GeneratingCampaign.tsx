port React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Loader2, CheckCircle, Image, Sparkles, AlertCircle } from 'lucide-react';
import { buildApiUrl } from '../config/api';
import ImageAdViewer from '../components/ImageAdViewer';

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
  competitor_search_query?: string;
  selected_strategy?: StrategySuggestion | null;
}

interface ImageVariation {
  styleKey: string;
  styleName: string;
  imageUrl: string;
  originalUrl: string;
  prompt: string;
}

interface GeneratedImageAd {
  _id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  metadata: {
    brand_name: string;
    product: string;
    adType: string;
    [key: string]: unknown;
  };
  brand_name: string;
  product: string;
  imageUrl?: string;
  videoUrl?: string;
  imageVariations?: ImageVariation[];
  allImageUrls?: string[];
  totalImagesGenerated?: number;
  totalImagesFailed?: number;
  successRate?: string;
  hasProductReference?: boolean;
  isCompleteCampaign?: boolean;
  totalGenerated?: number;
}

const GeneratingCampaign: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const topRef = useRef<HTMLDivElement>(null);
  
  const [campaignData, setCampaignData] = useState<CampaignData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [generatedAd, setGeneratedAd] = useState<GeneratedImageAd | null>(null);
  
  // Progress state
  const [currentStep, setCurrentStep] = useState<'preparing' | 'scripts' | 'images' | 'complete'>('preparing');
  const [imagesCompleted, setImagesCompleted] = useState(0);
  const [currentImageName, setCurrentImageName] = useState('');

  useEffect(() => {
    const state = location.state as { campaignData?: CampaignData };
    if (!state?.campaignData) {
      setError('No campaign data found. Please go back and try again.');
      return;
    }
    
    // Validate that a strategy was selected
    if (!state.campaignData.selected_strategy) {
      setError('No strategy selected. Please go back and select a strategy.');
      return;
    }
    
    setCampaignData(state.campaignData);
    startGeneration(state.campaignData);
  }, [location.state]);

  const startGeneration = async (data: CampaignData) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to continue');
        return;
      }

      // Prepare campaign data with strategy info
      const requestData = {
        product: data.product,
        brand_name: data.brand_name,
        selling_what: data.selling_what,
        target_audience: data.target_audience,
        call_to_action: data.call_to_action,
        visual_style: data.visual_style,
        color_scheme: data.color_scheme,
        text_emphasis: data.text_emphasis,
        platform: data.platform,
        image_format: data.image_format,
        special_offers: data.special_offers,
        product_image_urls: data.product_image_urls || [],
        competitor_search_query: data.competitor_search_query || '',
        // Include selected strategy for enhanced generation
        selected_strategy: data.selected_strategy || null,
      };

      // Pre-check credits (only 1 image now)
      try {
        const creditCheckResponse = await fetch(buildApiUrl('api/image-ads/check-credits'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ estimateFor: 1 })
        });

        if (!creditCheckResponse.ok) {
          const creditError = await creditCheckResponse.json();
          if (creditCheckResponse.status === 402) {
            setError(creditError.message || 'Insufficient LiPiCoins. Please top up.');
            return;
          }
        }
      } catch {
        // Continue anyway - streaming endpoint will also check
      }

      // Start streaming generation
      const params = new URLSearchParams();
      params.append('data', JSON.stringify(requestData));
      params.append('token', token);
      
      const eventSource = new EventSource(
        buildApiUrl(`api/image-ads/generate-complete-campaign-stream?${params.toString()}`)
      );

      eventSource.addEventListener('start', () => {
        setCurrentStep('preparing');
      });

      eventSource.addEventListener('scripts_start', () => {
        setCurrentStep('scripts');
      });

      eventSource.addEventListener('scripts_complete', () => {
        setCurrentStep('images');
      });

      eventSource.addEventListener('images_start', () => {
        setCurrentStep('images');
      });

      eventSource.addEventListener('image_start', (e) => {
        const eventData = JSON.parse(e.data);
        setCurrentImageName(eventData.scriptName || `Image ${eventData.scriptNumber}`);
      });

      eventSource.addEventListener('image_complete', (e) => {
        const eventData = JSON.parse(e.data);
        setImagesCompleted(eventData.progress?.completed || 0);
      });

      eventSource.addEventListener('campaign_complete', () => {
        setCurrentStep('complete');
      });

      eventSource.addEventListener('complete', (e) => {
        const eventData = JSON.parse(e.data);
        if (eventData.imageAd) {
          setGeneratedAd(eventData.imageAd);
        }
        eventSource.close();
      });

      eventSource.addEventListener('error', (e: Event) => {
        const messageEvent = e as MessageEvent;
        if (messageEvent.data) {
          try {
            const errorData = JSON.parse(messageEvent.data);
            setError(errorData.message || 'Generation failed');
          } catch {
            setError('Connection lost. Please try again.');
          }
        } else {
          setError('Connection lost. Please try again.');
        }
        eventSource.close();
      });

    } catch (err) {
      console.error('Generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate campaign');
    }
  };

  const handleNewAd = () => {
    navigate('/create-image-ads');
  };

  // Show result viewer when complete
  if (generatedAd) {
    return (
      <ImageAdViewer 
        imageAd={generatedAd}
        onNewAd={handleNewAd}
        backButtonPath="/create-image-ads"
        backButtonText="Create New Campaign"
        headerTitle="Your Complete Campaign"
      />
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Generation Failed</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate('/create-image-ads')}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Go Back
            </button>
            <button
              onClick={() => campaignData && startGeneration(campaignData)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Generation progress view
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div ref={topRef} />
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
              {currentStep === 'complete' ? (
                <CheckCircle className="w-10 h-10 text-green-500" />
              ) : currentStep === 'images' ? (
                <Image className="w-10 h-10 text-purple-600" />
              ) : (
                <Sparkles className="w-10 h-10 text-purple-600 animate-pulse" />
              )}
            </div>
            {currentStep !== 'complete' && (
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                <Loader2 className="w-4 h-4 text-white animate-spin" />
              </div>
            )}
          </div>
          
          <h2 className="mt-4 text-2xl font-bold text-gray-800">
            {currentStep === 'preparing' && 'Preparing Your Campaign...'}
            {currentStep === 'scripts' && 'Creating Ad Scripts...'}
            {currentStep === 'images' && 'Generating Images...'}
            {currentStep === 'complete' && 'Campaign Complete!'}
          </h2>
          
          {campaignData?.selected_strategy && (
            <p className="mt-2 text-purple-600 font-medium">
              Using: {campaignData.selected_strategy.title}
            </p>
          )}
        </div>

        {/* Progress Steps */}
        <div className="space-y-4 mb-8">
          {/* Step 1: Preparing */}
          <div className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
            currentStep === 'preparing' ? 'bg-purple-50' : 'bg-gray-50'
          }`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              currentStep === 'preparing' ? 'bg-purple-500 text-white' : 
              ['scripts', 'images', 'complete'].includes(currentStep) ? 'bg-green-500 text-white' : 'bg-gray-200'
            }`}>
              {['scripts', 'images', 'complete'].includes(currentStep) ? (
                <CheckCircle className="w-5 h-5" />
              ) : currentStep === 'preparing' ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : '1'}
            </div>
            <div>
              <p className="font-medium text-gray-800">Preparing</p>
              <p className="text-sm text-gray-500">Setting up your campaign</p>
            </div>
          </div>

          {/* Step 2: Scripts */}
          <div className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
            currentStep === 'scripts' ? 'bg-purple-50' : 'bg-gray-50'
          }`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              currentStep === 'scripts' ? 'bg-purple-500 text-white' : 
              ['images', 'complete'].includes(currentStep) ? 'bg-green-500 text-white' : 'bg-gray-200'
            }`}>
              {['images', 'complete'].includes(currentStep) ? (
                <CheckCircle className="w-5 h-5" />
              ) : currentStep === 'scripts' ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : '2'}
            </div>
            <div>
              <p className="font-medium text-gray-800">Creating Script</p>
              <p className="text-sm text-gray-500">Crafting your custom ad concept</p>
            </div>
          </div>

          {/* Step 3: Images */}
          <div className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
            currentStep === 'images' ? 'bg-purple-50' : 'bg-gray-50'
          }`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              currentStep === 'images' ? 'bg-purple-500 text-white' : 
              currentStep === 'complete' ? 'bg-green-500 text-white' : 'bg-gray-200'
            }`}>
              {currentStep === 'complete' ? (
                <CheckCircle className="w-5 h-5" />
              ) : currentStep === 'images' ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : '3'}
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-800">Generating Image</p>
              {currentStep === 'images' && (
                <>
                  <p className="text-sm text-gray-500">{currentImageName || 'Creating your ad...'}</p>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full transition-all duration-500 animate-pulse"
                      style={{ width: imagesCompleted > 0 ? '100%' : '60%' }}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Strategy Info */}
        {campaignData?.selected_strategy && (
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
            <h3 className="font-medium text-purple-800 mb-2">Strategy Applied</h3>
            <p className="text-sm text-gray-600 mb-2">{campaignData.selected_strategy.description}</p>
            <div className="text-xs text-purple-600">
              <span className="font-medium">Visual Direction:</span> {campaignData.selected_strategy.visual_direction}
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="mt-6 text-center text-sm text-gray-400">
          <p>💡 This usually takes about 30 seconds</p>
          <p className="mt-1">Don't close this page</p>
        </div>
      </div>
    </div>
  );
};

export default GeneratingCampaign;
