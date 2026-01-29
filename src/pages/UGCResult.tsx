import React from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { ArrowLeft, Download, CheckCircle, Play } from 'lucide-react';

interface LocationState {
  videoUrl: string;
  brandName: string;
  productName: string;
}

const UGCResult: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { brandId, productId } = useParams<{ brandId: string; productId: string }>();
  const state = location.state as LocationState | null;

  const handleDownload = () => {
    if (state?.videoUrl) {
      window.open(state.videoUrl, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(`/brands/${brandId}/products/${productId}`)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Product</span>
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Success Message */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">UGC Video Generated!</h1>
          <p className="text-gray-600 text-lg">Your UGC video ad is ready</p>
          {state?.brandName && (
            <div className="mt-4">
              <span className="inline-flex items-center px-4 py-2 bg-white rounded-full border border-gray-200 text-sm text-gray-600">
                <span className="font-medium text-gray-900">{state.brandName}</span>
                {state.productName && (
                  <><span className="mx-2">•</span><span className="font-medium text-gray-900">{state.productName}</span></>
                )}
              </span>
            </div>
          )}
        </div>

        {/* Video Player */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
          <div className="aspect-video bg-black rounded-xl overflow-hidden mb-6">
            {state?.videoUrl ? (
              <video
                controls
                className="w-full h-full"
                src={state.videoUrl}
              >
                Your browser does not support the video tag.
              </video>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white">
                <Play className="w-16 h-16 opacity-50" />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-4 justify-center">
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-blue-700 transition-all shadow-lg"
            >
              <Download className="w-5 h-5" />
              Download Video
            </button>
            <button
              onClick={() => navigate(`/brands/${brandId}/products/${productId}/select-ad-type`)}
              className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
            >
              Create Another Ad
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UGCResult;
