import React, { useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { ArrowLeft, Upload, Image as ImageIcon, ArrowRight, Check } from 'lucide-react';
import CharacterSelect from '../components/CharacterSelect';

interface LocationState {
  brandName: string;
  productName: string;
  category: string;
  adType: string;
}

const UGCParameters: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { brandId, productId } = useParams<{ brandId: string; productId: string }>();
  const state = location.state as LocationState | null;

  const [selectedCharacter, setSelectedCharacter] = useState<{ id: string; name: string; url: string } | null>(null);
  const [productImage, setProductImage] = useState<File | null>(null);
  const [productImagePreview, setProductImagePreview] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleProductImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProductImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProductImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!selectedCharacter || !productImage) {
      alert('Please select a character and upload a product image.');
      return;
    }

    setIsGenerating(true);

    try {
      const formData = new FormData();
      formData.append('characterImage', selectedCharacter.url);
      formData.append('characterName', selectedCharacter.name);
      formData.append('productImage', productImage);
      formData.append('brandId', brandId || '');
      formData.append('productId', productId || '');
      formData.append('brandName', state?.brandName || '');
      formData.append('productName', state?.productName || '');
      formData.append('category', state?.category || '');

      const response = await fetch('http://localhost:5000/api/ugc-ads/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to generate UGC video');
      }

      const data = await response.json();
      
      // Navigate to result page with video URL
      navigate(`/brands/${brandId}/products/${productId}/ugc-result`, {
        state: {
          videoUrl: data.videoUrl,
          brandName: state?.brandName,
          productName: state?.productName,
        },
      });
    } catch (error) {
      console.error('Error generating UGC video:', error);
      alert('Failed to generate UGC video. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const canGenerate = selectedCharacter && productImage;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* Context Info */}
        {state?.brandName && (
          <div className="text-center mb-4">
            <span className="inline-flex items-center px-4 py-2 bg-white rounded-full border border-gray-200 text-sm text-gray-600">
              Creating UGC ad for <span className="font-medium text-gray-900 ml-1">{state.brandName}</span>
              {state.productName && (
                <><span className="mx-2">•</span><span className="font-medium text-gray-900">{state.productName}</span></>
              )}
            </span>
          </div>
        )}

        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Create UGC Video Ad</h1>
          <p className="text-gray-600 text-lg">Select a character and upload your product image</p>
        </div>

        {/* Step 1: Select Character */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              selectedCharacter ? 'bg-green-500' : 'bg-blue-500'
            } text-white font-semibold`}>
              {selectedCharacter ? <Check className="w-5 h-5" /> : '1'}
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Select a Character</h2>
          </div>
          <CharacterSelect
            onSelect={setSelectedCharacter}
            selectedCharacterId={selectedCharacter?.id}
          />
          {selectedCharacter && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-800">
              Selected: <span className="font-semibold">{selectedCharacter.name}</span>
            </div>
          )}
        </div>

        {/* Step 2: Upload Product Image */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              productImage ? 'bg-green-500' : 'bg-blue-500'
            } text-white font-semibold`}>
              {productImage ? <Check className="w-5 h-5" /> : '2'}
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Upload Product Image</h2>
          </div>

          <div className="flex flex-col items-center">
            {!productImagePreview ? (
              <label className="w-full max-w-md cursor-pointer">
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-blue-500 transition-colors">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">Click to upload product image</p>
                  <p className="text-sm text-gray-400">PNG, JPG up to 10MB</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProductImageUpload}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="relative">
                <img
                  src={productImagePreview}
                  alt="Product preview"
                  className="max-w-md rounded-xl shadow-lg"
                />
                <button
                  onClick={() => {
                    setProductImage(null);
                    setProductImagePreview(null);
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Generate Button */}
        <div className="flex justify-center">
          <button
            onClick={handleGenerate}
            disabled={!canGenerate || isGenerating}
            className={`
              flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold text-lg transition-all
              ${canGenerate && !isGenerating
                ? 'bg-gradient-to-r from-green-600 to-blue-600 text-white hover:from-green-700 hover:to-blue-700 shadow-lg hover:shadow-xl'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Generating Video...
              </>
            ) : (
              <>
                Generate UGC Video
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </main>
    </div>
  );
};

export default UGCParameters;
