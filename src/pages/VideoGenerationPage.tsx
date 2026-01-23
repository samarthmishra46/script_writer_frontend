import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Loader2,
  Film,
  CheckCircle,
  PlayCircle,
  Download
} from 'lucide-react';
import { API_BASE_URL } from '../config/api';

interface LocationState {
  brandName: string;
  productName: string;
  category: string;
  adType: string;
  videoParameters: {
    platform: string;
    ageGroup: string;
    primaryGoal: string;
  };
  selectedIdea: {
    ideaNumber: number;
    title: string;
    hook: string;
    body: string;
    cta: string;
    visualDirection: string;
  };
}

interface ScriptSection {
  section: number;
  duration: number;
  description: string;
  visualPrompt: string;
}

interface GenerationProgress {
  stage: 'script' | 'video-generation' | 'completed';
  currentSection: number;
  totalSections: number;
  message: string;
}

const VideoGenerationPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { brandId, productId } = useParams<{ brandId: string; productId: string }>();
  const state = location.state as LocationState | null;

  const [progress, setProgress] = useState<GenerationProgress>({
    stage: 'script',
    currentSection: 0,
    totalSections: 0,
    message: 'Generating video script...'
  });
  const [script, setScript] = useState<ScriptSection[]>([]);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    generateVideo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const generateVideo = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Step 1: Generate script
      setProgress({
        stage: 'script',
        currentSection: 0,
        totalSections: 0,
        message: 'Creating detailed video script...'
      });

      const scriptResponse = await fetch(`${API_BASE_URL}/api/video-ads/generate-script`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          brandId,
          productId,
          idea: state?.selectedIdea,
          platform: state?.videoParameters.platform,
          ageGroup: state?.videoParameters.ageGroup,
          primaryGoal: state?.videoParameters.primaryGoal
        })
      });

      if (!scriptResponse.ok) {
        throw new Error('Failed to generate script');
      }

      const scriptData = await scriptResponse.json();
      setScript(scriptData.script);

      // Step 2: Generate video
      setProgress({
        stage: 'video-generation',
        currentSection: 0,
        totalSections: scriptData.script.length,
        message: 'Starting video generation...'
      });

      const videoResponse = await fetch(`${API_BASE_URL}/api/video-ads/generate-video`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          brandId,
          productId,
          script: scriptData.script,
          platform: state?.videoParameters.platform
        })
      });

      if (!videoResponse.ok) {
        throw new Error('Failed to generate video');
      }

      const videoData = await videoResponse.json();
      
      // Save the video to the product
      await saveVideoToProduct(videoData.videoUrl);

      setVideoUrl(videoData.videoUrl);
      setProgress({
        stage: 'completed',
        currentSection: scriptData.script.length,
        totalSections: scriptData.script.length,
        message: 'Video generation completed!'
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate video');
      console.error('Error generating video:', err);
    }
  };

  const saveVideoToProduct = async (url: string) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE_URL}/api/video-ads/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          brandId,
          productId,
          videoUrl: url,
          platform: state?.videoParameters.platform,
          ageGroup: state?.videoParameters.ageGroup,
          primaryGoal: state?.videoParameters.primaryGoal,
          ideaTitle: state?.selectedIdea.title
        })
      });
    } catch (err) {
      console.error('Error saving video:', err);
    }
  };

  const handleViewProduct = () => {
    navigate(`/brands/${brandId}/products/${productId}`);
  };

  const getProgressPercentage = () => {
    if (progress.stage === 'script') return 10;
    if (progress.stage === 'video-generation') {
      return 10 + (progress.currentSection / progress.totalSections) * 80;
    }
    return 100;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center">
          <button
            onClick={() => navigate(`/brands/${brandId}/products/${productId}`)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            disabled={progress.stage !== 'completed'}
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Product</span>
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Context Info */}
        {state?.brandName && (
          <div className="text-center mb-4">
            <span className="inline-flex items-center px-4 py-2 bg-white rounded-full border border-gray-200 text-sm text-gray-600">
              Creating video for <span className="font-medium text-gray-900 ml-1">{state.brandName}</span>
              {state.productName && (
                <><span className="mx-2">•</span><span className="font-medium text-gray-900">{state.productName}</span></>
              )}
            </span>
          </div>
        )}

        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            {progress.stage === 'completed' ? 'Video Ready!' : 'Generating Your Video'}
          </h1>
          <p className="text-gray-600 text-lg">{progress.message}</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => navigate(-1)}
              className="mt-2 text-red-700 underline"
            >
              Go back and try again
            </button>
          </div>
        )}

        {/* Progress Section */}
        {!error && progress.stage !== 'completed' && (
          <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <Loader2 className="w-16 h-16 text-purple-600 animate-spin" />
                <Film className="w-8 h-8 text-purple-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>{progress.stage === 'script' ? 'Creating Script' : `Generating Section ${progress.currentSection}/${progress.totalSections}`}</span>
                <span>{Math.round(getProgressPercentage())}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-purple-600 to-blue-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${getProgressPercentage()}%` }}
                />
              </div>
            </div>

            {/* Script Sections */}
            {script.length > 0 && (
              <div className="mt-6 space-y-3">
                <h3 className="font-semibold text-gray-900 mb-3">Video Script</h3>
                {script.map((section) => (
                  <div
                    key={section.section}
                    className={`p-4 rounded-lg border ${
                      section.section <= progress.currentSection
                        ? 'bg-green-50 border-green-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {section.section <= progress.currentSection ? (
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 mb-1">
                          Section {section.section} ({section.duration}s)
                        </p>
                        <p className="text-sm text-gray-600">{section.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Completed Section */}
        {progress.stage === 'completed' && videoUrl && (
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="flex items-center justify-center mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">
              Your Video is Ready!
            </h2>

            {/* Video Player */}
            <div className="mb-6 rounded-xl overflow-hidden bg-black">
              <video
                src={videoUrl}
                controls
                className="w-full"
                poster="/api/placeholder/800/450"
              >
                Your browser does not support the video tag.
              </video>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center">
              <button
                onClick={handleViewProduct}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg"
              >
                <PlayCircle className="w-5 h-5" />
                View in Product Gallery
              </button>
              
              <a
                href={videoUrl}
                download
                className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
              >
                <Download className="w-5 h-5" />
                Download Video
              </a>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default VideoGenerationPage;
