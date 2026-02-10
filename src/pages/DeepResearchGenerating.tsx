import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Image as ImageIcon,
  Download,
  ArrowRight,
} from 'lucide-react';
import { buildApiUrl } from '../config/api';

interface LocationState {
  generationJobId: string;
  brandName: string;
  productName: string;
  category: string;
}

interface GeneratedImage {
  imageUrl: string;
  prompt: string;
  variationType: string;
  variationName: string;
}

const DeepResearchGenerating: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { brandId, productId } = useParams<{ brandId: string; productId: string }>();
  const state = location.state as LocationState | null;

  const [status, setStatus] = useState<'generating' | 'completed' | 'failed'>('generating');
  const [progress, setProgress] = useState<string>('Starting image generation...');
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!state?.generationJobId) {
      navigate(-1);
      return;
    }

    const interval = setInterval(async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(
          buildApiUrl(`api/image-deep-research/gen-status/${state.generationJobId}`),
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );

        const result = await response.json();

        if (result.success) {
          setProgress(result.progress || '');

          if (result.status === 'completed' && result.result) {
            setImages(result.result.images || []);
            setStatus('completed');
          } else if (result.status === 'failed') {
            setError(result.error || 'Generation failed');
            setStatus('failed');
          }
        }
      } catch (err) {
        console.error('Error polling status:', err);
      }
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(interval);
  }, [state, navigate]);

  // Generating state
  if (status === 'generating') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 mb-8 animate-pulse">
            <ImageIcon className="w-10 h-10 text-white" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">Generating Your Ads</h2>

          <div className="bg-white rounded-xl p-8 border border-gray-200 mb-8">
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="w-3 h-3 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-3 h-3 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-3 h-3 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>

            <p className="text-gray-600 font-medium mb-2">{progress}</p>
            <p className="text-sm text-gray-500">Creating 20 optimized image ads...</p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-1" />
              <p className="text-sm text-amber-800">This may take 5-15 minutes. You can close this tab and return later.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Completed state
  if (status === 'completed') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            <span className="text-sm text-gray-600">
              Generated {images.length} ads
            </span>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-12">
          {/* Success Message */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-12">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
              <div>
                <h3 className="font-semibold text-green-900">Ads Generated Successfully!</h3>
                <p className="text-sm text-green-800">
                  {images.length} image ads created based on market research and competitor analysis.
                </p>
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="mb-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Generated Image Ads</h1>
            <p className="text-gray-600">
              Based on deep market research, competitor analysis, and the selected ad angles
            </p>
          </div>

          {/* Images Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {images.map((image, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow"
              >
                {/* Image Container */}
                <div className="relative w-full pt-[100%]">
                  <img
                    src={image.imageUrl}
                    alt={`Ad ${idx + 1}`}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>

                {/* Info */}
                <div className="p-4">
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-2">
                    {image.variationType}
                  </p>
                  <h3 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2">
                    {image.variationName}
                  </h3>
                  <p className="text-xs text-gray-600 mb-4 line-clamp-3">
                    {image.prompt}
                  </p>

                  {/* Actions */}
                  <a
                    href={image.imageUrl}
                    download={`ad-${idx + 1}.png`}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center py-8 border-t border-gray-200">
            <button
              onClick={() => navigate(`/brands/${brandId}/products/${productId}`)}
              className="px-6 py-3 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors font-medium"
            >
              View Product
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all flex items-center gap-2"
            >
              Go to Dashboard
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </main>
      </div>
    );
  }

  // Failed state
  if (status === 'failed') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-red-100 mb-8">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">Generation Failed</h2>

          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
            <p className="text-red-700 text-sm">{error}</p>
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-3 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors font-medium"
            >
              Back
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default DeepResearchGenerating;
