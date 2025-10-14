import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { buildApiUrl } from '../config/api';
import ImageAdViewer from '../components/ImageAdViewer';

interface ImageVariation {
  styleKey: string;
  styleName: string;
  imageUrl: string;
  originalUrl: string;
  prompt: string;
}

interface ViewImageAdData {
  _id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  metadata: {
    brand_name: string;
    product: string;
    adType: string;
  };
  brand_name: string;
  product: string;
  campaign?: {
    theme: string;
    headline: string;
    body_copy: string;
    call_to_action: string;
    image_description: string;
    message_to_the_world: string;
  };
  imageUrl?: string;
  videoUrl?: string;
  imageVariations?: ImageVariation[];
  totalGenerated?: number;
  hasProductImages?: boolean;
  hasImage?: boolean;
  hasVideo?: boolean;
  platform?: string;
  visual_style?: string;
  color_scheme?: string;
  image_format?: string;
}

const ViewImageAd: React.FC = () => {
  const { adId } = useParams<{ adId: string }>();
  const navigate = useNavigate();
  const [imageAd, setImageAd] = useState<ViewImageAdData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchImageAd = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(buildApiUrl(`api/image-ads/view/${adId}`));
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch image ad');
        }

        if (!data.success || !data.imageAd) {
          throw new Error('Invalid response from server');
        }

        setImageAd(data.imageAd);
        
        // Debug: Log styleKeys to check for duplicates
        if (data.imageAd.imageVariations) {
          console.log('🔍 Image variations styleKeys:', data.imageAd.imageVariations.map((v: ImageVariation) => v.styleKey));
          const styleKeys = data.imageAd.imageVariations.map((v: ImageVariation) => v.styleKey);
          const uniqueStyleKeys = [...new Set(styleKeys)];
          if (styleKeys.length !== uniqueStyleKeys.length) {
            console.warn('⚠️ DUPLICATE STYLE KEYS DETECTED!', { original: styleKeys, unique: uniqueStyleKeys });
          }
        }
      } catch (error) {
        console.error('Error fetching image ad:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch image ad');
      } finally {
        setLoading(false);
      }
    };

    if (!adId) {
      setError('Image ad ID is required');
      setLoading(false);
      return;
    }

    fetchImageAd();
  }, [adId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading image ad...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-700 font-medium mb-4">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!imageAd) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg">Image ad not found</p>
        </div>
      </div>
    );
  }

  return <ImageAdViewer imageAd={imageAd} />;
};

export default ViewImageAd;