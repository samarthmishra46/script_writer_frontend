import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Target,
  Trophy,
  Lightbulb,
  Package,
  Plus,
  X,
  Loader2,
} from 'lucide-react';
import { buildApiUrl } from '../config/api';

interface LocationState {
  brandId: string;
  productId: string;
  brandName: string;
  productName: string;
  category: string;
  productDescription?: string;
  targetAudience?: string;
  productImageUrl?: string;
}

const ImageGenV2ProductInfo: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form fields
  const [usps, setUsps] = useState<string[]>(['']);
  const [proofOfResults, setProofOfResults] = useState<string[]>(['']);
  const [keyBenefits, setKeyBenefits] = useState<string[]>(['']);
  const [pricePoint, setPricePoint] = useState('');
  const [competitiveAdvantage, setCompetitiveAdvantage] = useState('');
  const [productImageUrl, setProductImageUrl] = useState(state?.productImageUrl || '');

  useEffect(() => {
    if (!state?.brandName || !state?.productName) {
      navigate('/brands');
    }
  }, [state, navigate]);

  const addField = (setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(prev => [...prev, '']);
  };

  const removeField = (index: number, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(prev => prev.filter((_, i) => i !== index));
  };

  const updateField = (index: number, value: string, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(prev => prev.map((item, i) => i === index ? value : item));
  };

  const handleSubmit = async () => {
    if (!productImageUrl.trim()) {
      setError('Product image URL is required for AI image generation');
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(buildApiUrl('api/image-gen-v2/create'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          brandId: state?.brandId,
          productId: state?.productId,
          brandName: state?.brandName,
          productName: state?.productName,
          productDescription: state?.productDescription,
          category: state?.category,
          targetAudience: state?.targetAudience,
          productImageUrl: productImageUrl,
          usps: usps.filter(u => u.trim()),
          proofOfResults: proofOfResults.filter(p => p.trim()),
          keyBenefits: keyBenefits.filter(k => k.trim()),
          pricePoint,
          competitiveAdvantage,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to create ad');
      }

      // Navigate to competition analysis step
      navigate('/image-gen-v2/competition', {
        state: {
          adId: result.data.adId,
          brandName: state?.brandName,
          productName: state?.productName,
          productImageUrl: productImageUrl,
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-gray-900/90 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <span className="text-white font-medium">Image Gen V2</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {['Product Info', 'Competition', 'Ad Copies', 'Generate'].map((step, index) => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                index === 0 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-700 text-gray-400'
              }`}>
                {index + 1}
              </div>
              <span className={`ml-2 text-sm ${
                index === 0 ? 'text-white' : 'text-gray-500'
              }`}>
                {step}
              </span>
              {index < 3 && (
                <ArrowRight className="w-4 h-4 text-gray-600 mx-4" />
              )}
            </div>
          ))}
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Tell Us More About Your Product
          </h1>
          <p className="text-gray-400">
            This helps us create more targeted and effective ad copies
          </p>
        </div>

        {/* Product Info Card */}
        <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700 mb-6">
          <div className="flex items-center gap-4">
            <Package className="w-8 h-8 text-purple-400" />
            <div>
              <h3 className="text-lg font-semibold text-white">{state?.productName}</h3>
              <p className="text-gray-400 text-sm">{state?.brandName} • {state?.category}</p>
            </div>
          </div>
        </div>

        {/* Product Image URL */}
        <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Package className="w-6 h-6 text-orange-400" />
            <div>
              <h3 className="text-lg font-semibold text-white">Product Image URL <span className="text-red-400">*</span></h3>
              <p className="text-gray-400 text-sm">Provide a URL to your product image for AI image generation</p>
            </div>
          </div>
          <input
            type="url"
            value={productImageUrl}
            onChange={(e) => setProductImageUrl(e.target.value)}
            placeholder="https://example.com/your-product-image.jpg"
            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none"
          />
          {productImageUrl && (
            <div className="mt-4">
              <p className="text-sm text-gray-400 mb-2">Preview:</p>
              <img 
                src={productImageUrl} 
                alt="Product preview" 
                className="max-h-32 rounded-lg border border-gray-700"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Form */}
        <div className="space-y-6">
          {/* USPs */}
          <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <Target className="w-6 h-6 text-blue-400" />
              <div>
                <h3 className="text-lg font-semibold text-white">Unique Selling Points (USPs)</h3>
                <p className="text-gray-400 text-sm">What makes your product stand out?</p>
              </div>
            </div>
            <div className="space-y-3">
              {usps.map((usp, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={usp}
                    onChange={(e) => updateField(index, e.target.value, setUsps)}
                    placeholder={`USP ${index + 1}: e.g., "100% Organic Ingredients"`}
                    className="flex-1 px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none"
                  />
                  {usps.length > 1 && (
                    <button
                      onClick={() => removeField(index, setUsps)}
                      className="p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 hover:bg-red-500/30 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() => addField(setUsps)}
                className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add another USP</span>
              </button>
            </div>
          </div>

          {/* Proof of Results */}
          <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <Trophy className="w-6 h-6 text-yellow-400" />
              <div>
                <h3 className="text-lg font-semibold text-white">Proof of Results</h3>
                <p className="text-gray-400 text-sm">Share testimonials, stats, or achievements</p>
              </div>
            </div>
            <div className="space-y-3">
              {proofOfResults.map((proof, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={proof}
                    onChange={(e) => updateField(index, e.target.value, setProofOfResults)}
                    placeholder={`e.g., "10,000+ happy customers", "95% satisfaction rate"`}
                    className="flex-1 px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none"
                  />
                  {proofOfResults.length > 1 && (
                    <button
                      onClick={() => removeField(index, setProofOfResults)}
                      className="p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 hover:bg-red-500/30 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() => addField(setProofOfResults)}
                className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add more proof</span>
              </button>
            </div>
          </div>

          {/* Key Benefits */}
          <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <Lightbulb className="w-6 h-6 text-green-400" />
              <div>
                <h3 className="text-lg font-semibold text-white">Key Benefits</h3>
                <p className="text-gray-400 text-sm">What will customers gain from your product?</p>
              </div>
            </div>
            <div className="space-y-3">
              {keyBenefits.map((benefit, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={benefit}
                    onChange={(e) => updateField(index, e.target.value, setKeyBenefits)}
                    placeholder={`e.g., "Save 2 hours every day", "Look 10 years younger"`}
                    className="flex-1 px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none"
                  />
                  {keyBenefits.length > 1 && (
                    <button
                      onClick={() => removeField(index, setKeyBenefits)}
                      className="p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 hover:bg-red-500/30 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() => addField(setKeyBenefits)}
                className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add more benefits</span>
              </button>
            </div>
          </div>

          {/* Additional Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Price Point
              </label>
              <input
                type="text"
                value={pricePoint}
                onChange={(e) => setPricePoint(e.target.value)}
                placeholder="e.g., $49.99, Premium, Budget-friendly"
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none"
              />
            </div>

            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Competitive Advantage
              </label>
              <input
                type="text"
                value={competitiveAdvantage}
                onChange={(e) => setCompetitiveAdvantage(e.target.value)}
                placeholder="e.g., Patent-pending technology, Exclusive formula"
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <span>Analyze Competition</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ImageGenV2ProductInfo;
