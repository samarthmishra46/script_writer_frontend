import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Users, FileText, Video, Check, Clock, AlertCircle } from 'lucide-react';
import { buildApiUrl } from '../config/api';

interface UGCAd {
  _id: string;
  productDetails: {
    name: string;
    description: string;
    price?: string;
    brand?: string;
    category?: string;
  };
  productImage: {
    originalUrl: string;
  };
  selectedCharacter?: {
    characterName: string;
    gender: string;
    imageUrl: string;
  };
  generatedScripts?: Array<{
    scriptId: string;
    content: string;
    tone: string;
    focusPoint: string;
  }>;
  selectedScript?: {
    content: string;
  };
  generatedVideo?: {
    videoUrl?: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
  };
  status: string;
  completionPercentage: number;
  createdAt: string;
}

const UGCDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [ugcAds, setUgcAds] = useState<UGCAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUGCAds();
  }, []);

  const fetchUGCAds = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(buildApiUrl('api/ugc-ads'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setUgcAds(data.ugcAds);
      } else {
        setError(data.message || 'Failed to fetch UGC ads');
      }
    } catch (err) {
      setError('Failed to fetch UGC ads');
      console.error('Error fetching UGC ads:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'product_uploaded':
        return <Upload className="h-5 w-5 text-blue-500" />;
      case 'character_selected':
        return <Users className="h-5 w-5 text-purple-500" />;
      case 'scripts_generated':
        return <FileText className="h-5 w-5 text-green-500" />;
      case 'script_selected':
        return <Check className="h-5 w-5 text-emerald-500" />;
      case 'video_generated':
      case 'completed':
        return <Video className="h-5 w-5 text-indigo-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'product_uploaded':
        return 'Product Uploaded';
      case 'character_selected':
        return 'Character Selected';
      case 'scripts_generated':
        return 'Scripts Generated';
      case 'script_selected':
        return 'Script Selected';
      case 'video_generated':
        return 'Video Processing';
      case 'completed':
        return 'Completed';
      default:
        return 'Unknown';
    }
  };

  const handleCreateNew = () => {
    navigate('/ugc-ads/create');
  };

  const handleContinue = (ugcAd: UGCAd) => {
    switch (ugcAd.status) {
      case 'product_uploaded':
        navigate(`/ugc-ads/${ugcAd._id}/character-selection`);
        break;
      case 'character_selected':
        navigate(`/ugc-ads/${ugcAd._id}/script-generation`);
        break;
      case 'scripts_generated':
        navigate(`/ugc-ads/${ugcAd._id}/script-selection`);
        break;
      case 'script_selected':
        navigate(`/ugc-ads/${ugcAd._id}/video-generation`);
        break;
      case 'completed':
        navigate(`/ugc-ads/${ugcAd._id}/result`);
        break;
      default:
        navigate(`/ugc-ads/${ugcAd._id}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your UGC ads...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">UGC Video Ads</h1>
              <p className="text-gray-600 mt-2">
                Create authentic user-generated content videos for your products
              </p>
            </div>
            <button
              onClick={handleCreateNew}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200 flex items-center space-x-2"
            >
              <Upload className="h-5 w-5" />
              <span>Create New UGC Ad</span>
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* UGC Ads Grid */}
        {ugcAds.length === 0 ? (
          <div className="text-center py-12">
            <Video className="h-24 w-24 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No UGC ads yet</h3>
            <p className="text-gray-600 mb-6">
              Create your first UGC video ad to get started
            </p>
            <button
              onClick={handleCreateNew}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
            >
              Create Your First UGC Ad
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ugcAds.map((ugcAd) => (
              <div
                key={ugcAd._id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden"
              >
                {/* Product Image */}
                <div className="aspect-video bg-gray-100 relative">
                  <img
                    src={buildApiUrl(ugcAd.productImage.originalUrl)}
                    alt={ugcAd.productDetails.name}
                    className="w-full h-full object-cover"
                  />
                  {ugcAd.generatedVideo?.status === 'completed' && ugcAd.generatedVideo.videoUrl && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <Video className="h-12 w-12 text-white" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {ugcAd.productDetails.name}
                    </h3>
                    {getStatusIcon(ugcAd.status)}
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {ugcAd.productDetails.description}
                  </p>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        {getStatusText(ugcAd.status)}
                      </span>
                      <span className="text-sm text-gray-500">
                        {ugcAd.completionPercentage}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${ugcAd.completionPercentage}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Character Info */}
                  {ugcAd.selectedCharacter && (
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                        <img
                          src={ugcAd.selectedCharacter.imageUrl}
                          alt={ugcAd.selectedCharacter.characterName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-sm text-gray-600">
                        {ugcAd.selectedCharacter.characterName}
                      </span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleContinue(ugcAd)}
                      className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
                    >
                      {ugcAd.status === 'completed' ? 'View Result' : 'Continue'}
                    </button>
                    {ugcAd.generatedVideo?.status === 'processing' && (
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <div className="animate-spin h-3 w-3 border border-gray-300 border-t-purple-600 rounded-full"></div>
                        <span>Processing</span>
                      </div>
                    )}
                  </div>

                  {/* Timestamp */}
                  <p className="text-xs text-gray-400 mt-3">
                    Created {new Date(ugcAd.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UGCDashboard;