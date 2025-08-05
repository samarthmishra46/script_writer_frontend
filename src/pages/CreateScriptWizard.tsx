import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { buildApiUrl } from '../config/api';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import GeneratedScript from '../components/GeneratedScript';

interface User {
  id: string;
  name: string;
  email: string;
  subscription?: {
    plan: string;
    status: string;
  };
}

interface StepOneData {
  product: string;
  brand_name: string;
}

interface StepTwoData {
  target_segment: string;
  category: string;
  target_persona: string;
  big_problem: string;
  usp: string;
  tone: string;
  key_facts: string;
  offer: string;
  preferred_formats: string;
  language_pref: string;
  ad_duration: string;
  objective: string;
}

interface ScriptResponse {
  success: boolean;
  script: {
    userId: string;
    title: string;
    content: string;
    brand_name: string;
    product: string;
    metadata: Record<string, unknown>;
    aiGenerated: boolean;
    _id: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
  message: string;
}

const CreateScriptWizard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form data for both steps
  const [stepOneData, setStepOneData] = useState<StepOneData>({
    product: '',
    brand_name: ''
  });
  
  const [stepTwoData, setStepTwoData] = useState<StepTwoData>({
    target_segment: '',
    category: '',
    target_persona: '',
    big_problem: '',
    usp: '',
    tone: '',
    key_facts: '',
    offer: '',
    preferred_formats: '',
    language_pref: 'English',
    ad_duration: '30',
    objective: ''
  });

  const [generatedScript, setGeneratedScript] = useState<ScriptResponse['script'] | null>(null);

  // Load user data
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  // Handle prefilled brand name from sidebar
  useEffect(() => {
    const state = location.state as { prefillBrand?: string };
    if (state?.prefillBrand) {
      setStepOneData(prev => ({
        ...prev,
        brand_name: state.prefillBrand || ''
      }));
    }
  }, [location.state]);

  // Load existing data if regenerating
  useEffect(() => {
    const savedData = localStorage.getItem('createScriptWizardData');
    const existingScript = localStorage.getItem('currentGeneratedScript');
    
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        if (parsedData.stepOne) setStepOneData(parsedData.stepOne);
        if (parsedData.stepTwo) setStepTwoData(parsedData.stepTwo);
      } catch (error) {
        console.error('Error parsing saved data:', error);
      }
    }

    if (existingScript) {
      try {
        setGeneratedScript(JSON.parse(existingScript));
      } catch (error) {
        console.error('Error parsing existing script:', error);
      }
    }
  }, []);

  // Save data to localStorage
  const saveDataToStorage = () => {
    const dataToSave = {
      stepOne: stepOneData,
      stepTwo: stepTwoData
    };
    localStorage.setItem('createScriptWizardData', JSON.stringify(dataToSave));
  };

  const handleStepOneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setStepOneData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStepTwoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setStepTwoData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNextStep = () => {
    if (stepOneData.product && stepOneData.brand_name) {
      saveDataToStorage();
      setCurrentStep(2);
    }
  };

  const handlePreviousStep = () => {
    setCurrentStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    setError(null);

    try {
      const combinedData = {
        ...stepOneData,
        ...stepTwoData
      };

      const response = await fetch(buildApiUrl('api/scripts/generate'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(combinedData)
      });

      const data: ScriptResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to generate script');
      }

      if (!data.success || !data.script || !data.script.content) {
        throw new Error('Invalid response from server');
      }

      setGeneratedScript(data.script);
      localStorage.setItem('currentGeneratedScript', JSON.stringify(data.script));
      
      // Clear saved form data after successful generation
      localStorage.removeItem('createScriptWizardData');
      
      // Show success message or redirect to dashboard after a delay
      setTimeout(() => {
        navigate('/dashboard', { 
          state: { 
            message: 'Script generated successfully!',
            newScript: data.script 
          }
        });
      }, 3000);
      
    } catch (error) {
      console.error('Script generation error:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate script');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const combinedData = {
        ...stepOneData,
        ...stepTwoData
      };

      const response = await fetch(buildApiUrl('api/scripts/generate'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(combinedData)
      });

      const data: ScriptResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to regenerate script');
      }

      if (!data.success || !data.script || !data.script.content) {
        throw new Error('Invalid response from server');
      }

      setGeneratedScript(data.script);
      localStorage.setItem('currentGeneratedScript', JSON.stringify(data.script));
      
    } catch (error) {
      console.error('Script regeneration error:', error);
      setError(error instanceof Error ? error.message : 'Failed to regenerate script');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewScript = () => {
    setGeneratedScript(null);
    setStepOneData({ product: '', brand_name: '' });
    setStepTwoData({
      target_segment: '',
      category: '',
      target_persona: '',
      big_problem: '',
      usp: '',
      tone: '',
      key_facts: '',
      offer: '',
      preferred_formats: '',
      language_pref: 'English',
      ad_duration: '30',
      objective: ''
    });
    setCurrentStep(1);
    localStorage.removeItem('createScriptWizardData');
    localStorage.removeItem('currentGeneratedScript');
  };

  const renderStepOne = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
      </div>
      
      <div>
        <label htmlFor="product" className="block text-sm font-medium text-gray-700 mb-2">
          Product/Service Name *
        </label>
        <input
          type="text"
          id="product"
          name="product"
          value={stepOneData.product}
          onChange={handleStepOneChange}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 p-3"
          placeholder="Enter your product or service name"
          required
        />
      </div>

      <div>
        <label htmlFor="brand_name" className="block text-sm font-medium text-gray-700 mb-2">
          Company/Brand Name *
        </label>
        <input
          type="text"
          id="brand_name"
          name="brand_name"
          value={stepOneData.brand_name}
          onChange={handleStepOneChange}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 p-3"
          placeholder="Enter your company or brand name"
          required
        />
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleNextStep}
          disabled={!stepOneData.product || !stepOneData.brand_name}
          className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          Next Step
          <ArrowRight className="ml-2 w-4 h-4" />
        </button>
      </div>
    </div>
  );

  const renderStepTwo = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Detailed Information</h3>
        <button
          type="button"
          onClick={handlePreviousStep}
          className="inline-flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="mr-2 w-4 h-4" />
          Back
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="target_segment" className="block text-sm font-medium text-gray-700 mb-2">
            Target Segment *
          </label>
          <input
            type="text"
            id="target_segment"
            name="target_segment"
            value={stepTwoData.target_segment}
            onChange={handleStepTwoChange}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 p-3"
            placeholder="e.g., Young professionals, Parents, etc."
            required
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
            Category *
          </label>
          <input
            type="text"
            id="category"
            name="category"
            value={stepTwoData.category}
            onChange={handleStepTwoChange}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 p-3"
            placeholder="e.g., Health, Technology, Fashion"
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="target_persona" className="block text-sm font-medium text-gray-700 mb-2">
          Target Persona *
        </label>
        <textarea
          id="target_persona"
          name="target_persona"
          value={stepTwoData.target_persona}
          onChange={handleStepTwoChange}
          rows={3}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 p-3"
          placeholder="Describe your ideal customer in detail"
          required
        />
      </div>

      <div>
        <label htmlFor="big_problem" className="block text-sm font-medium text-gray-700 mb-2">
          Main Problem/Pain Point *
        </label>
        <textarea
          id="big_problem"
          name="big_problem"
          value={stepTwoData.big_problem}
          onChange={handleStepTwoChange}
          rows={3}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 p-3"
          placeholder="What problem does your product solve?"
          required
        />
      </div>

      <div>
        <label htmlFor="usp" className="block text-sm font-medium text-gray-700 mb-2">
          Unique Selling Proposition *
        </label>
        <textarea
          id="usp"
          name="usp"
          value={stepTwoData.usp}
          onChange={handleStepTwoChange}
          rows={3}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 p-3"
          placeholder="What makes your product unique?"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="tone" className="block text-sm font-medium text-gray-700 mb-2">
            Tone of Voice
          </label>
          <select
            id="tone"
            name="tone"
            value={stepTwoData.tone}
            onChange={handleStepTwoChange}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 p-3"
          >
            <option value="">Select tone</option>
            <option value="professional">Professional</option>
            <option value="friendly">Friendly</option>
            <option value="urgent">Urgent</option>
            <option value="emotional">Emotional</option>
            <option value="humorous">Humorous</option>
          </select>
        </div>

        <div>
          <label htmlFor="preferred_formats" className="block text-sm font-medium text-gray-700 mb-2">
            Preferred Format *
          </label>
          <select
            id="preferred_formats"
            name="preferred_formats"
            value={stepTwoData.preferred_formats}
            onChange={handleStepTwoChange}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 p-3"
            required
          >
            <option value="">Select format</option>
            <option value="video">Video Ad</option>
            <option value="image">Image Ad</option>
            <option value="carousel">Carousel Ad</option>
            <option value="story">Story Ad</option>
            <option value="reel">Reel/Short Video</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="language_pref" className="block text-sm font-medium text-gray-700 mb-2">
            Language
          </label>
          <select
            id="language_pref"
            name="language_pref"
            value={stepTwoData.language_pref}
            onChange={handleStepTwoChange}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 p-3"
          >
            <option value="English">English</option>
            <option value="Hindi">Hindi</option>
            <option value="Spanish">Spanish</option>
            <option value="French">French</option>
            <option value="German">German</option>
          </select>
        </div>

        <div>
          <label htmlFor="ad_duration" className="block text-sm font-medium text-gray-700 mb-2">
            Ad Duration (seconds)
          </label>
          <select
            id="ad_duration"
            name="ad_duration"
            value={stepTwoData.ad_duration}
            onChange={handleStepTwoChange}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 p-3"
          >
            <option value="15">15 seconds</option>
            <option value="30">30 seconds</option>
            <option value="60">60 seconds</option>
            <option value="90">90 seconds</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="key_facts" className="block text-sm font-medium text-gray-700 mb-2">
          Key Facts/Features
        </label>
        <textarea
          id="key_facts"
          name="key_facts"
          value={stepTwoData.key_facts}
          onChange={handleStepTwoChange}
          rows={3}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 p-3"
          placeholder="List important facts or features about your product"
        />
      </div>

      <div>
        <label htmlFor="offer" className="block text-sm font-medium text-gray-700 mb-2">
          Special Offer/CTA
        </label>
        <textarea
          id="offer"
          name="offer"
          value={stepTwoData.offer}
          onChange={handleStepTwoChange}
          rows={2}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 p-3"
          placeholder="Any special offers or call-to-action"
        />
      </div>

      <div>
        <label htmlFor="objective" className="block text-sm font-medium text-gray-700 mb-2">
          Campaign Objective *
        </label>
        <textarea
          id="objective"
          name="objective"
          value={stepTwoData.objective}
          onChange={handleStepTwoChange}
          rows={2}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 p-3"
          placeholder="What do you want to achieve with this ad?"
          required
        />
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="submit"
          disabled={isLoading || !stepTwoData.target_segment || !stepTwoData.category || !stepTwoData.objective || !stepTwoData.preferred_formats}
          className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            'Generate Script'
          )}
        </button>
      </div>
    </div>
  );

  const renderGeneratedScript = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Generated Script</h3>
        <div className="space-x-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            View in Dashboard
          </button>
          <button
            onClick={handleRegenerate}
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                Regenerating...
              </>
            ) : (
              'Regenerate'
            )}
          </button>
          <button
            onClick={handleNewScript}
            className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            New Script
          </button>
        </div>
      </div>

      {generatedScript && (
        <GeneratedScript 
          script={generatedScript}
          onEdit={(newContent) => {
            const updatedScript = { ...generatedScript, content: newContent };
            setGeneratedScript(updatedScript);
            localStorage.setItem('currentGeneratedScript', JSON.stringify(updatedScript));
          }}
        />
      )}
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            {generatedScript ? (
              renderGeneratedScript()
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Create New Script</h2>
                  <div className="flex items-center space-x-4">
                    <div className={`flex items-center ${currentStep >= 1 ? 'text-purple-600' : 'text-gray-400'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}>
                        1
                      </div>
                      <span className="ml-2">Basic Info</span>
                    </div>
                    <div className={`w-8 h-1 ${currentStep >= 2 ? 'bg-purple-600' : 'bg-gray-200'}`}></div>
                    <div className={`flex items-center ${currentStep >= 2 ? 'text-purple-600' : 'text-gray-400'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}>
                        2
                      </div>
                      <span className="ml-2">Details</span>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmit}>
                  {currentStep === 1 ? renderStepOne() : renderStepTwo()}
                </form>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default CreateScriptWizard;
