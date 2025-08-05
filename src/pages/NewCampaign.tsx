import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Loader2 } from 'lucide-react';
import { buildApiUrl } from '../config/api';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

interface ProductInfo {
  title: string;
  category: string;
  description: string;
  targetAudience: string;
  budget: string;
  goals: string;
}

const NewCampaign: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [productInfo, setProductInfo] = useState<ProductInfo>({
    title: '',
    category: '',
    description: '',
    targetAudience: '',
    budget: '',
    goals: ''
  });

  const handleNext = async () => {
    if (step === 1) {
      if (!productInfo.title || !productInfo.category) {
        setError('Please fill in all required fields');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      await createCampaign();
    }
  };

  const createCampaign = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required');
        navigate('/login');
        return;
      }

      // For now, redirect to create script page with campaign info
      // Since backend doesn't have campaigns endpoint, we'll use script generation
      const scriptData = {
        target_segment: productInfo.targetAudience,
        brand_name: productInfo.title,
        category: productInfo.category,
        product: productInfo.title,
        target_persona: productInfo.targetAudience,
        big_problem: 'Generic problem solved by ' + productInfo.title,
        usp: productInfo.description,
        tone: 'Professional',
        key_facts: productInfo.description,
        offer: 'Special offer for ' + productInfo.title,
        preferred_formats: 'Video Ad',
        language_pref: 'English',
        ad_duration: '30',
        objective: productInfo.goals
      };

      const response = await fetch(buildApiUrl('api/scripts/generate'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(scriptData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create script');
      }

      // Navigate to generated scripts page
      navigate('/scripts');
    } catch (error) {
      console.error('Script creation error:', error);
      setError(error instanceof Error ? error.message : 'Failed to create script');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof ProductInfo, value: string) => {
    setProductInfo(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            {step === 1 && (
              <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">
                  Start With Giving Us Your Product Info
                </h1>
                
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600">{error}</p>
                  </div>
                )}
                
                <div className="bg-gray-800 rounded-lg p-8 mb-8">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Product/Service/HVCO Title*
                      </label>
                      <input
                        type="text"
                        value={productInfo.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Enter your product title"
                        maxLength={100}
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        The name of the product/service/HVCO you are promoting.
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {100 - productInfo.title.length} chars left
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Product/Service Category*
                      </label>
                      <input
                        type="text"
                        value={productInfo.category}
                        onChange={(e) => handleInputChange('category', e.target.value)}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="e.g. Dentures, Cosmetics, Property Investments, Digital Marketing"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Product Description
                      </label>
                      <textarea
                        value={productInfo.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Describe your product or service in detail"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Target Audience
                      </label>
                      <textarea
                        value={productInfo.targetAudience}
                        onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                        rows={2}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Who is your ideal customer?"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Budget Range
                        </label>
                        <select
                          value={productInfo.budget}
                          onChange={(e) => handleInputChange('budget', e.target.value)}
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="">Select budget range</option>
                          <option value="low">₹10K - ₹50K</option>
                          <option value="medium">₹50K - ₹2L</option>
                          <option value="high">₹2L - ₹10L</option>
                          <option value="enterprise">₹10L+</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Campaign Goals
                        </label>
                        <select
                          value={productInfo.goals}
                          onChange={(e) => handleInputChange('goals', e.target.value)}
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="">Select primary goal</option>
                          <option value="awareness">Brand Awareness</option>
                          <option value="leads">Lead Generation</option>
                          <option value="sales">Direct Sales</option>
                          <option value="engagement">Engagement</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={handleNext}
                  disabled={!productInfo.title || !productInfo.category}
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xl font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight className="ml-2 w-5 h-5 inline" />
                </button>
                
                <p className="mt-4 text-sm text-gray-600">
                  One Time Effort. Just Answer A Few Questions About Your Product. Takes Only 15 Minutes
                </p>
              </div>
            )}

            {step === 2 && (
              <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">
                  Generating Campaign
                </h1>
                <p className="text-xl text-gray-600 mb-8">
                  Million Dollar Ad Ideas, Angles, Hooks, Scripts, Storyboards.
                </p>
                
                <div className="flex items-center justify-center mb-8">
                  <div className="w-32 h-32 bg-gradient-to-r from-purple-400 via-pink-500 to-blue-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
                </div>

                <button
                  onClick={createCampaign}
                  disabled={isLoading}
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xl font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin inline" />
                      Creating Campaign...
                    </>
                  ) : (
                    'Generate Campaign'
                  )}
                </button>

                <button
                  onClick={() => setStep(1)}
                  className="block mx-auto mt-4 text-purple-600 hover:text-purple-700 font-medium"
                >
                  ← Go Back
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default NewCampaign;