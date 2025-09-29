import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Share2, RefreshCw, Video, Loader2 } from 'lucide-react';
import { buildApiUrl } from '../config/api';
import Header from '../components/Header';

interface ImageAd {
  _id: string;
  title: string;
  brand_name: string;
  product: string;
  content: string;
  createdAt: string;
  metadata: {
    imageUrl?: string;
    videoUrl?: string;
    campaign?: {
      theme: string;
      headline: string;
      body_copy: string;
      call_to_action: string;
      image_description: string;
    };
    adType: string;
    platform?: string;
    visual_style?: string;
    [key: string]: any;
  };
}

const ViewImageAds: React.FC = () => {
  const { adId } = useParams<{ adId: string }>();
  const navigate = useNavigate();
  const [imageAd, setImageAd] = useState<ImageAd | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);

  useEffect(() => {
    if (!adId) {
      setError('Invalid ad ID');
      setIsLoading(false);
      return;
    }

    fetchImageAd();
  }, [adId]);

  const fetchImageAd = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Please login to view ads');
        navigate('/auth');
        return;
      }

      console.log('Fetching image ad with ID:', adId);
      
      const response = await fetch(buildApiUrl(`api/image-ads/${adId}`), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch image ad');
      }

      if (data.success && data.ad) {
        // Transform the API response to match our interface
        const transformedAd: ImageAd = {
          _id: data.ad._id,
          title: data.ad.title,
          brand_name: data.ad.brand_name,
          product: data.ad.product,
          content: data.ad.content,
          createdAt: data.ad.createdAt,
          metadata: {
            imageUrl: data.ad.imageUrl,
            videoUrl: data.ad.videoUrl,
            campaign: data.ad.campaign,
            adType: 'image',
            platform: data.ad.platform,
            visual_style: data.ad.visual_style,
            color_scheme: data.ad.color_scheme,
            image_format: data.ad.image_format,
            imageGenerated: data.ad.imageGenerated,
            videoGenerated: data.ad.videoGenerated,
            hasImage: data.ad.hasImage,
            hasVideo: data.ad.hasVideo
          }
        };
        setImageAd(transformedAd);
        console.log('Image ad loaded successfully:', transformedAd);
      } else {
        throw new Error('Image ad not found');
      }
    } catch (error) {
      console.error('Error fetching image ad:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch image ad');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateVideo = async () => {
    if (!imageAd) return;

    try {
      setIsGeneratingVideo(true);
      const token = localStorage.getItem('token');

      if (!token) {
        alert('Please login to generate video');
        return;
      }

      const response = await fetch(buildApiUrl('api/image-ads/generate-video'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ imageAdId: imageAd._id })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to generate video');
      }

      if (data.success && data.videoUrl) {
        // Update the imageAd with the new video URL
        setImageAd(prev => prev ? {
          ...prev,
          metadata: {
            ...prev.metadata,
            videoUrl: data.videoUrl
          }
        } : null);
        
        alert('Video generated successfully!');
      }
    } catch (error) {
      console.error('Video generation error:', error);
      alert(error instanceof Error ? error.message : 'Failed to generate video');
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  const handleDownloadImage = () => {
    if (imageAd?.metadata?.imageUrl) {
      const link = document.createElement('a');
      link.href = imageAd.metadata.imageUrl;
      link.download = `${imageAd.brand_name}-${imageAd.product}-ad.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleShare = async () => {
    if (navigator.share && imageAd?.metadata?.imageUrl) {
      try {
        await navigator.share({
          title: `${imageAd.brand_name} - ${imageAd.product} Ad`,
          url: imageAd.metadata.imageUrl
        });
      } catch (error) {
        // Fallback to copying URL
        navigator.clipboard.writeText(imageAd.metadata.imageUrl);
        alert('Image URL copied to clipboard!');
      }
    } else if (imageAd?.metadata?.imageUrl) {
      navigator.clipboard.writeText(imageAd.metadata.imageUrl);
      alert('Image URL copied to clipboard!');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading image ad...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !imageAd) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-600 text-2xl">⚠️</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Ad Not Found</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </button>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
            <button
              onClick={handleDownloadImage}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Display */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="mb-4">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {imageAd.brand_name} - {imageAd.product}
              </h1>
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
                  🎨 Image Ad
                </span>
                {imageAd.metadata.campaign?.theme && (
                  <span className="bg-purple-100 text-purple-800 text-sm font-medium px-3 py-1 rounded-full">
                    {imageAd.metadata.campaign.theme} Theme
                  </span>
                )}
              </div>
            </div>

            {imageAd.metadata.imageUrl ? (
              <div className="relative">
                <img
                  src={imageAd.metadata.imageUrl}
                  alt={`${imageAd.brand_name} Ad`}
                  className="w-full h-auto rounded-lg shadow-lg"
                />
              </div>
            ) : (
              <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-gray-500">Image not available</span>
              </div>
            )}

            {/* Video Section */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Video className="w-5 h-5" />
                Video Version
              </h3>
              {imageAd.metadata.videoUrl ? (
                <div className="space-y-3">
                  <p className="text-sm text-green-600">✅ Video generated successfully</p>
                  <video
                    controls
                    className="w-full h-auto rounded-md"
                    src={imageAd.metadata.videoUrl}
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-3">
                    Convert this image ad to a video advertisement
                  </p>
                  <button
                    onClick={handleGenerateVideo}
                    disabled={isGeneratingVideo}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mx-auto"
                  >
                    {isGeneratingVideo ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating Video...
                      </>
                    ) : (
                      <>
                        <Video className="w-4 h-4" />
                        Generate Video Ad
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Campaign Details */}
          <div className="space-y-6">
            {imageAd.metadata.campaign && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Campaign Details</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-700">Headline</h3>
                    <p className="text-gray-600">{imageAd.metadata.campaign.headline}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-700">Body Copy</h3>
                    <p className="text-gray-600">{imageAd.metadata.campaign.body_copy}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-700">Call to Action</h3>
                    <p className="text-gray-600">{imageAd.metadata.campaign.call_to_action}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-700">Visual Description</h3>
                    <p className="text-gray-600">{imageAd.metadata.campaign.image_description}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Technical Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Technical Specifications</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Platform:</span>
                  <span className="font-medium">{imageAd.metadata.platform || 'Not specified'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Visual Style:</span>
                  <span className="font-medium">{imageAd.metadata.visual_style || 'Not specified'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Created:</span>
                  <span className="font-medium">{new Date(imageAd.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/create-image-ads')}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Create New Image Ad
                </button>
                <button
                  onClick={() => navigate(`/script-group/${encodeURIComponent(imageAd.brand_name)}/${encodeURIComponent(imageAd.product)}/${imageAd._id}`)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  View All {imageAd.brand_name} Campaigns
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewImageAds;