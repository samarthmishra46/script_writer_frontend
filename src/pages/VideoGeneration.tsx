import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Video, CheckCircle, Play, Download, Clock } from 'lucide-react';
import { buildApiUrl } from '../config/api';

interface UGCAd {
  _id: string;
  productDetails: {
    name: string;
    description: string;
    category?: string;
    price?: string;
    brand?: string;
  };
  selectedCharacter?: {
    characterId: string;
    characterName: string;
    gender: string;
    imageUrl: string;
  };
  selectedScript?: {
    scriptId: string;
    content: string;
    duration: number;
    tone: string;
    focusPoint: string;
  };
  generatedVideo?: {
    videoUrl?: string;
    thumbnailUrl?: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    processingTime?: number;
    errorMessage?: string;
  };
  generatedImage?: {
    imageUrl?: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    processingTime?: number;
    errorMessage?: string;
  };
  status: string;
}

const VideoGeneration: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [ugcAd, setUgcAd] = useState<UGCAd | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const fetchUGCAd = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(buildApiUrl(`api/ugc-ads/${id}`), {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();
        if (data.success) {
          setUgcAd(data.ugcAd);
        } else {
          setError(data.message || 'Failed to fetch UGC ad');
        }
      } catch (err) {
        setError('Failed to fetch UGC ad');
        console.error('Error fetching UGC ad:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUGCAd();
  }, [id]);

  const handleGenerateVideo = async () => {
    if (!ugcAd) return;

    setGenerating(true);
    setError(null);
    setProgress(0);

    try {
      const token = localStorage.getItem('token');
      console.log('🎥 Starting video generation...');

      const response = await fetch(buildApiUrl(`api/ugc-ads/${id}/generate-video`), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        console.log('✅ Video generation started');
        // Update status to processing
        setUgcAd(prev => prev ? {
          ...prev,
          generatedVideo: {
            ...prev.generatedVideo,
            status: 'processing'
          },
          status: 'video_processing'
        } : null);

        // Start polling for video status
        pollVideoStatus();
      } else {
        setError(data.message || 'Failed to start video generation');
      }
    } catch (err) {
      setError('An error occurred while generating video');
      console.error('Error generating video:', err);
    } finally {
      setGenerating(false);
    }
  };

  const pollVideoStatus = async () => {
    const pollInterval = setInterval(async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(buildApiUrl(`api/ugc-ads/${id}/status`), {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();
        
        console.log('📊 Polling video status:', {
          videoStatus: data.videoStatus,
          completionPercentage: data.completionPercentage,
          hasVideoUrl: !!data.generatedVideo?.videoUrl,
          generatedVideo: data.generatedVideo
        });
        
        if (data.success) {
          setProgress(data.completionPercentage || 0);
          
          if (data.videoStatus === 'completed') {
            console.log('✅ Video completed! Updating state with:', data.generatedVideo);
            setUgcAd(prev => prev ? {
              ...prev,
              generatedVideo: data.generatedVideo,
              status: 'completed'
            } : null);
            clearInterval(pollInterval);
          } else if (data.videoStatus === 'failed') {
            setError(data.generatedVideo?.errorMessage || 'Video generation failed');
            clearInterval(pollInterval);
          }
        }
      } catch (err) {
        console.error('Error polling video status:', err);
      }
    }, 3000); // Poll every 3 seconds

    // Stop polling after 10 minutes
    setTimeout(() => {
      clearInterval(pollInterval);
    }, 600000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading video generation...</p>
        </div>
      </div>
    );
  }

  if (!ugcAd) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">UGC ad not found</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const isVideoCompleted = ugcAd.generatedVideo?.status === 'completed';
  const isVideoProcessing = ugcAd.generatedVideo?.status === 'processing';
  const isVideoFailed = ugcAd.generatedVideo?.status === 'failed';
  const isImageCompleted = ugcAd.generatedImage?.status === 'completed';
  const isImageProcessing = ugcAd.generatedImage?.status === 'processing';
  // Show video when video generation is completed, regardless of image status
  const isPipelineCompleted = isVideoCompleted;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Dashboard</span>
          </button>
          
          <div className="flex items-center space-x-3 mb-4">
            <Video className="h-8 w-8 text-purple-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Generate Video</h1>
              <p className="text-gray-600">
                Create your UGC video with AI-powered video generation
              </p>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm text-gray-600">Product Uploaded</span>
            </div>
            <div className="h-px bg-gray-300 flex-1 max-w-12"></div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm text-gray-600">Character Selected</span>
            </div>
            <div className="h-px bg-gray-300 flex-1 max-w-12"></div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm text-gray-600">Script Generated</span>
            </div>
            <div className="h-px bg-gray-300 flex-1 max-w-12"></div>
            <div className="flex items-center space-x-2">
              <div className="h-5 w-5 bg-purple-600 rounded-full flex items-center justify-center">
                <Video className="h-3 w-3 text-white" />
              </div>
              <span className="text-sm font-medium text-purple-600">Video Generation</span>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Summary */}
        <div className="bg-white rounded-lg p-6 shadow-md mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Video Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Product</h4>
              <p className="text-sm text-gray-600">{ugcAd.productDetails.name}</p>
            </div>
            {ugcAd.selectedCharacter && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Character</h4>
                <div className="flex items-center space-x-2">
                  <img
                    src={buildApiUrl(ugcAd.selectedCharacter.imageUrl)}
                    alt={ugcAd.selectedCharacter.characterName}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span className="text-sm text-gray-600">{ugcAd.selectedCharacter.characterName}</span>
                </div>
              </div>
            )}
            {ugcAd.selectedScript && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Script</h4>
                <p className="text-xs text-gray-500">{ugcAd.selectedScript.tone} • {ugcAd.selectedScript.duration}s</p>
              </div>
            )}
          </div>
          
          {ugcAd.selectedScript && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h5 className="font-medium text-gray-900 mb-2">Selected Script:</h5>
              <p className="text-sm text-gray-700 italic">"{ugcAd.selectedScript.content}"</p>
            </div>
          )}
        </div>

        {/* Video Generation Section */}
        {isPipelineCompleted ? (
          /* Completed Video */
          <div className="bg-white rounded-lg p-8 shadow-md">
            <div className="text-center mb-6">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Video Generated Successfully!</h3>
              <p className="text-gray-600">Your UGC video is ready to download and use.</p>
            </div>

            {/* Generated Image Preview */}
            {ugcAd.generatedImage?.imageUrl && (
              <div className="mb-6">
                <h4 className="text-lg font-medium text-gray-900 mb-3 text-center">Generated Composite Image</h4>
                <div className="flex justify-center mb-3">
                  <img
                    src={ugcAd.generatedImage.imageUrl.startsWith('http') ? ugcAd.generatedImage.imageUrl : buildApiUrl(ugcAd.generatedImage.imageUrl)}
                    alt="Generated composite image"
                    className="max-w-sm rounded-lg shadow-lg border border-gray-200"
                  />
                </div>
                <div className="flex justify-center">
                  <button
                    onClick={() => {
                      if (ugcAd.generatedImage?.imageUrl) {
                        const link = document.createElement('a');
                        link.href = ugcAd.generatedImage.imageUrl.startsWith('http') ? ugcAd.generatedImage.imageUrl : buildApiUrl(ugcAd.generatedImage.imageUrl);
                        link.download = `${ugcAd.productDetails.name}_composite_image.png`;
                        link.target = '_blank';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }
                    }}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download Image</span>
                  </button>
                </div>
              </div>
            )}

            {ugcAd.generatedVideo?.videoUrl && (
              <div className="mb-6">
                <h4 className="text-lg font-medium text-gray-900 mb-3 text-center">Generated Video</h4>
                <video
                  controls
                  className="w-full max-w-md mx-auto rounded-lg shadow-lg"
                  poster={ugcAd.generatedVideo.thumbnailUrl}
                >
                  <source src={ugcAd.generatedVideo.videoUrl.startsWith('http') ? ugcAd.generatedVideo.videoUrl : buildApiUrl(ugcAd.generatedVideo.videoUrl)} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div> 
            )}

            <div className="flex justify-center space-x-4">
              <button 
                onClick={() => {
                  if (ugcAd.generatedVideo?.videoUrl) {
                    const link = document.createElement('a');
                    link.href = ugcAd.generatedVideo.videoUrl.startsWith('http') ? ugcAd.generatedVideo.videoUrl : buildApiUrl(ugcAd.generatedVideo.videoUrl);
                    link.download = `${ugcAd.productDetails.name}_UGC_video.mp4`;
                    link.target = '_blank';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }
                }}
                className="flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="h-5 w-5" />
                <span>Download Video</span>
              </button>
              <button 
                onClick={() => navigate('/dashboard')}
                className="flex items-center space-x-2 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span>Back to Dashboard</span>
              </button>
            </div>
          </div>
        ) : isVideoProcessing || isImageProcessing ? (
          /* Processing Pipeline */
          <div className="bg-white rounded-lg p-8 shadow-md text-center">
            <div className="animate-pulse">
              <Video className="h-16 w-16 text-purple-600 mx-auto mb-4" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Generating Your UGC Content...</h3>
            <p className="text-gray-600 mb-6">
              {isImageProcessing && !isImageCompleted ? 
                'Creating composite image of character holding your product...' :
                'Generating your video using the composite image...'
              }
            </p>
            
            <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
              <div 
                className="bg-purple-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-500">{progress}% complete</p>

            <div className="mt-6 flex items-center justify-center space-x-2 text-gray-500">
              <Clock className="h-4 w-4" />
              <span className="text-sm">
                Estimated time remaining: {Math.max(0, Math.ceil((100 - progress) * 3 / 100))} minutes
                <br />
                <span className="text-xs">Pipeline includes image generation + video creation</span>
              </span>
            </div>
          </div>
        ) : isVideoFailed ? (
          /* Failed Video */
          <div className="bg-white rounded-lg p-8 shadow-md text-center">
            <div className="text-red-500 mb-4">
              <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Video Generation Failed</h3>
            <p className="text-gray-600 mb-6">{ugcAd.generatedVideo?.errorMessage || 'An error occurred during video generation.'}</p>
            
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleGenerateVideo}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Try Again
              </button>
              <button 
                onClick={() => navigate('/dashboard')}
                className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        ) : (
          /* Ready to Generate */
          <div className="bg-white rounded-lg p-8 shadow-md text-center">
            <Video className="h-16 w-16 text-purple-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Ready to Generate Video</h3>
            <p className="text-gray-600 mb-6">
              Create a personalized UGC video using AI. The video will feature your selected character delivering the chosen script.
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-2">
                <svg className="h-5 w-5 text-blue-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-left">
                  <p className="text-sm text-blue-800 font-medium">Video Generation Info:</p>
                  <ul className="text-sm text-blue-700 mt-1 space-y-1">
                    <li>• Duration: ~8 seconds</li>
                    <li>• Generation time: 2-3 minutes</li>
                    <li>• High-quality AI video output</li>
                    <li>• Ready for social media use</li>
                  </ul>
                </div>
              </div>
            </div>

            <button
              onClick={handleGenerateVideo}
              disabled={generating}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 mx-auto"
            >
              {generating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Starting Generation...</span>
                </>
              ) : (
                <>
                  <Play className="h-5 w-5" />
                  <span>Generate Video</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoGeneration;