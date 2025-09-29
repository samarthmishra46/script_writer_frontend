import React, { useState, useEffect } from 'react';
import { Video, Loader2, AlertCircle, Play, Download, CheckCircle, ArrowLeft } from 'lucide-react';
import { buildApiUrl } from '../config/api';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../components/Header';

interface StoryboardScene {
  scene_number: string;
  visual_description: string;
  camera_angle: string;
  camera_movement: string;
  lighting: string;
  props: string[];
  set: string;
  actor_actions: string;
  actor_expressions: string;
  duration: string;
  special_effects: string;
  audio_notes: string;
  image_url: string;
}

interface StoryboardData {
  title: string;
  total_scenes: number;
  estimated_duration: string;
  scenes: StoryboardScene[];
}

interface SceneVideo {
  sceneNumber: number;
  url: string;
}

interface VideoResponse {
  success: boolean;
  sceneVideos: SceneVideo[];
  finalVideo: string;
  message?: string;
}

interface UserSubscription {
  isActive: boolean;
  plan: string;
  remainingDays?: number;
}

const VideoGeneratorPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const storyboard = location.state?.storyboard as StoryboardData;
  const scriptId = location.state?.scriptId as string;

  const [isGenerating, setIsGenerating] = useState(false);
  const [isCheckingSubscription, setIsCheckingSubscription] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [sceneVideos, setSceneVideos] = useState<SceneVideo[]>([]);
  const [finalVideo, setFinalVideo] = useState<string | null>(null);
  const [generationStep, setGenerationStep] = useState<string>('');

  // Redirect if no storyboard data
  useEffect(() => {
    if (!storyboard) {
      navigate('/dashboard');
    }
  }, [storyboard, navigate]);

  // Check subscription status on component mount
  useEffect(() => {
    checkSubscriptionStatus();
  }, []);

  const checkSubscriptionStatus = async () => {
    try {
      setIsCheckingSubscription(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Please login to generate videos');
        setIsCheckingSubscription(false);
        return;
      }

      const response = await fetch(buildApiUrl('/api/subscription'), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to check subscription status');
      }

      // Calculate remaining days
      let remainingDays = 0;
      if (data.nextBillingDate && data.activatedDate) {
        const currentDate = new Date();
        const nextDate = new Date(data.nextBillingDate);
        const diffMs = nextDate.getTime() - currentDate.getTime();
        remainingDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      }

      const isActive = data.plan === "individual" || data.plan === "organization";
      
      setSubscription({
        isActive,
        plan: data.plan || "free",
        remainingDays
      });

      if (!isActive) {
        setError('Video generation requires an active subscription. Please upgrade to continue.');
      }

    } catch (error) {
      console.error('Subscription check error:', error);
      setError(error instanceof Error ? error.message : 'Failed to check subscription');
    } finally {
      setIsCheckingSubscription(false);
    }
  };

  const generateVideo = async () => {
    if (!subscription?.isActive) {
      setError('Active subscription required for video generation');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGenerationStep('Preparing video generation...');

    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      if (!token || !user.id) {
        throw new Error('Authentication required');
      }

      setGenerationStep('Processing storyboard scenes...');

      const requestBody = {
        storyboard: {
          scenes: storyboard.scenes
        },
        userId: user.id,
        adId: scriptId || `ad_${Date.now()}`
      };

      const response = await fetch(buildApiUrl('/api/genrate-video'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });

      const data: VideoResponse = await response.json();

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Subscription required for video generation. Please upgrade your plan.');
        }
        throw new Error(data.message || 'Failed to generate video');
      }

      if (!data.success) {
        throw new Error(data.message || 'Video generation failed');
      }

      setGenerationStep('Video generation completed!');
      setSceneVideos(data.sceneVideos || []);
      setFinalVideo(data.finalVideo || null);

    } catch (error) {
      console.error('Video generation error:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate video');
    } finally {
      setIsGenerating(false);
      setGenerationStep('');
    }
  };

  const downloadVideo = (url: string, filename: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Loading state for subscription check
  if (isCheckingSubscription) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600">Checking subscription status...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!storyboard) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-1" />
                Back
              </button>
              <div className="bg-purple-100 rounded-full p-2">
                <Video className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Video Generator</h1>
                <p className="text-sm text-gray-600">
                  Generate AI-powered videos from your storyboard
                </p>
              </div>
            </div>
          </div>

          {/* Subscription Status */}
          {subscription && (
            <div className={`rounded-lg p-4 mb-6 ${
              subscription.isActive 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-yellow-50 border border-yellow-200'
            }`}>
              <div className="flex items-center">
                {subscription.isActive ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                    <div>
                      <p className="text-green-800 font-semibold">
                        Active Subscription - {subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)} Plan
                      </p>
                      {subscription.remainingDays && (
                        <p className="text-green-600 text-sm">
                          {subscription.remainingDays} days remaining
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-5 h-5 text-yellow-600 mr-3" />
                    <div>
                      <p className="text-yellow-800 font-semibold">Subscription Required</p>
                      <p className="text-yellow-600 text-sm">Video generation requires an active subscription</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
                <div>
                  <p className="text-red-700">{error}</p>
                  {error.includes('subscription') && !subscription?.isActive && (
                    <button
                      onClick={() => window.location.href = '/subscription'}
                      className="mt-2 text-red-600 hover:text-red-700 font-medium underline"
                    >
                      Upgrade Now
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Storyboard Preview */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Storyboard: {storyboard.title}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600">
              <div>
                <span className="font-medium">Scenes:</span> {storyboard.total_scenes}
              </div>
              <div>
                <span className="font-medium">Duration:</span> {storyboard.estimated_duration}s
              </div>
              <div>
                <span className="font-medium">Format:</span> MP4
              </div>
              <div>
                <span className="font-medium">Quality:</span> HD
              </div>
            </div>
          </div>

          {/* Generation Button */}
          {!finalVideo && !sceneVideos.length && (
            <div className="text-center py-8">
              <div className="mb-4">
                <Play className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Generate Video
                </h3>
                <p className="text-gray-600 mb-6">
                  Transform your storyboard into an AI-generated video with smooth transitions and effects.
                </p>
              </div>
              
              {subscription?.isActive ? (
                <button
                  onClick={generateVideo}
                  disabled={isGenerating}
                  className={`bg-purple-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-purple-700 transition-colors duration-200 flex items-center mx-auto ${
                    isGenerating ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Generating Video...
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 mr-2" />
                      Generate Video
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={() => window.location.href = '/subscription'}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors duration-200 flex items-center mx-auto"
                >
                  <Video className="w-5 h-5 mr-2" />
                  Upgrade to Generate Videos
                </button>
              )}
            </div>
          )}

          {/* Generation Progress */}
          {isGenerating && generationStep && (
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <Loader2 className="w-5 h-5 animate-spin text-blue-600 mr-3" />
                <p className="text-blue-800">{generationStep}</p>
              </div>
            </div>
          )}

          {/* Generated Videos */}
          {(finalVideo || sceneVideos.length > 0) && (
            <div className="space-y-6">
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Generated Videos</h3>
                
                {/* Final Video */}
                {finalVideo && (
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 mb-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xl font-bold text-gray-900">Final Stitched Video</h4>
                        <p className="text-sm text-gray-600 mt-1">Complete video with all scenes</p>
                      </div>
                      <div className="flex space-x-3">
                        <a
                          href={finalVideo}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Play Video
                        </a>
                        <button
                          onClick={() => downloadVideo(finalVideo, `${storyboard.title}_final.mp4`)}
                          className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Individual Scene Videos */}
                {sceneVideos.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Individual Scene Videos</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {sceneVideos.map((sceneVideo) => (
                        <div key={sceneVideo.sceneNumber} className="border border-gray-200 rounded-lg p-4">
                          <h5 className="font-medium text-gray-900 mb-2">
                            Scene {sceneVideo.sceneNumber}
                          </h5>
                          <div className="flex space-x-2">
                            <a
                              href={sceneVideo.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                            >
                              <Play className="w-3 h-3 mr-1" />
                              Play
                            </a>
                            <button
                              onClick={() => downloadVideo(sceneVideo.url, `scene_${sceneVideo.sceneNumber}.mp4`)}
                              className="flex items-center px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors"
                            >
                              <Download className="w-3 h-3 mr-1" />
                              Download
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Regenerate Button */}
              <div className="text-center pt-6 border-t border-gray-200">
                <button
                  onClick={generateVideo}
                  disabled={isGenerating}
                  className={`bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 ${
                    isGenerating ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin inline" />
                      Regenerating...
                    </>
                  ) : (
                    'Regenerate Video'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoGeneratorPage;