import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Loader2, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
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

// Step 1: Basic Brand Info
interface StepOneData {
  product: string;
  brand_name: string;
}

// Step 2: The Offer
interface StepTwoData {
  selling_what: string; // What exactly are you selling?
  target_audience: string; // Who is it meant for?
  price_point: string; // What's the price point?
  desired_action: string; // What action do you want the viewer to take?
}

// Step 3: The Core Value
interface StepThreeData {
  main_problem: string; // What's the #1 problem this solves?
  emotional_desire: string; // What does your customer really want?
  transformation: string; // What transformation does your product offer?
}

// Step 4: The Proof
interface StepFourData {
  credibility_proof: string; // Why should people believe your product works?
  main_reason_to_buy: string; // Single most undeniable reason to buy
  guarantees: string; // Do you offer any guarantees or risk-reversal?
  social_proof: string; // Awards, media appearances, funding
}

// Step 5: Inside Customer's Head
interface StepFiveData {
  objections: string; // What doubts or objections do customers have?
  testimonials: string; // What do your best customers say?
  myths_misconceptions: string; // What myths exist that your product crushes?
  alternatives: string; // What are they currently using instead?
}

// Step 6: Competition & Context
interface StepSixData {
  competitors: string; // Who are your 2 biggest competitors?
  competitor_ads: string; // What kind of ads do they run?
  unique_advantage: string; // What's the one thing you do better?
}

// Step 7: Product Experience
interface StepSevenData {
  user_experience: string; // What's the unboxing or user experience like?
  media_links: string; // Links to videos, demos, testimonials
}

// Step 8: Founder's Mind
interface StepEightData {
  creation_story: string; // Why did you create this product?
  founder_belief: string; // What makes you deeply believe in it?
  key_insight: string; // "If my ideal customer understood this one thing..."
}

// Step 9: Performance & Branding
interface StepNineData {
  previous_ads: string; // Have you run ads before?
  audience_type: string; // Cold audience, warm retargeting, or both?
  admired_brand: string; // One brand you admire in your space
  brand_tone: string; // Three adjectives to describe your brand tone
  forbidden_words: string; // Any words or claims we must NOT use
  ad_format: string; // Preferred format
  ad_duration: string; // Ad duration
  language: string; // Language preference
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
  const totalSteps = 9;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({
    'offer': true,
    'core': true,
    'proof': true,
    'customer': true,
    'competition': true,
    'product': true,
    'founder': true,
    'performance': true,
    'branding': true
  });
  
  // Form data for all steps
  const [stepOneData, setStepOneData] = useState<StepOneData>({
    product: '',
    brand_name: ''
  });
  
  const [stepTwoData, setStepTwoData] = useState<StepTwoData>({
    selling_what: '',
    target_audience: '',
    price_point: '',
    desired_action: ''
  });

  const [stepThreeData, setStepThreeData] = useState<StepThreeData>({
    main_problem: '',
    emotional_desire: '',
    transformation: ''
  });

  const [stepFourData, setStepFourData] = useState<StepFourData>({
    credibility_proof: '',
    main_reason_to_buy: '',
    guarantees: '',
    social_proof: ''
  });

  const [stepFiveData, setStepFiveData] = useState<StepFiveData>({
    objections: '',
    testimonials: '',
    myths_misconceptions: '',
    alternatives: ''
  });

  const [stepSixData, setStepSixData] = useState<StepSixData>({
    competitors: '',
    competitor_ads: '',
    unique_advantage: ''
  });

  const [stepSevenData, setStepSevenData] = useState<StepSevenData>({
    user_experience: '',
    media_links: ''
  });

  const [stepEightData, setStepEightData] = useState<StepEightData>({
    creation_story: '',
    founder_belief: '',
    key_insight: ''
  });

  const [stepNineData, setStepNineData] = useState<StepNineData>({
    previous_ads: '',
    audience_type: '',
    admired_brand: '',
    brand_tone: '',
    forbidden_words: '',
    ad_format: 'video',
    ad_duration: '30',
    language: 'English'
  });

  const [generatedScript, setGeneratedScript] = useState<ScriptResponse['script'] | null>(null);
  const topRef = useRef<HTMLDivElement>(null);

  // Toggle section expansion
  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

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

  // Scroll to top when changing steps
  useEffect(() => {
    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentStep]);

  // Load existing data if regenerating
  useEffect(() => {
    const savedData = localStorage.getItem('createScriptWizardData');
    const existingScript = localStorage.getItem('currentGeneratedScript');
    
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        if (parsedData.stepOne) setStepOneData(parsedData.stepOne);
        if (parsedData.stepTwo) setStepTwoData(parsedData.stepTwo);
        if (parsedData.stepThree) setStepThreeData(parsedData.stepThree);
        if (parsedData.stepFour) setStepFourData(parsedData.stepFour);
        if (parsedData.stepFive) setStepFiveData(parsedData.stepFive);
        if (parsedData.stepSix) setStepSixData(parsedData.stepSix);
        if (parsedData.stepSeven) setStepSevenData(parsedData.stepSeven);
        if (parsedData.stepEight) setStepEightData(parsedData.stepEight);
        if (parsedData.stepNine) setStepNineData(parsedData.stepNine);
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
      stepTwo: stepTwoData,
      stepThree: stepThreeData,
      stepFour: stepFourData,
      stepFive: stepFiveData,
      stepSix: stepSixData,
      stepSeven: stepSevenData,
      stepEight: stepEightData,
      stepNine: stepNineData
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

  const handleStepThreeChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setStepThreeData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStepFourChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setStepFourData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStepFiveChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setStepFiveData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStepSixChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setStepSixData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStepSevenChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setStepSevenData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStepEightChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setStepEightData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStepNineChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setStepNineData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNextStep = () => {
    if (currentStep < totalSteps) {
      saveDataToStorage();
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    setError(null);

    try {
      const combinedData = {
        ...stepOneData,
        ...stepTwoData,
        ...stepThreeData,
        ...stepFourData,
        ...stepFiveData,
        ...stepSixData,
        ...stepSevenData,
        ...stepEightData,
        ...stepNineData
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
      
      navigate(`/script-group/${data.script.brand_name}/${data.script.product}/${data.script._id}`);
      handleNewScript();
      
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
        ...stepTwoData,
        ...stepThreeData,
        ...stepFourData,
        ...stepFiveData,
        ...stepSixData,
        ...stepSevenData,
        ...stepEightData,
        ...stepNineData
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
      selling_what: '',
      target_audience: '',
      price_point: '',
      desired_action: ''
    });
    setStepThreeData({
      main_problem: '',
      emotional_desire: '',
      transformation: ''
    });
    setStepFourData({
      credibility_proof: '',
      main_reason_to_buy: '',
      guarantees: '',
      social_proof: ''
    });
    setStepFiveData({
      objections: '',
      testimonials: '',
      myths_misconceptions: '',
      alternatives: ''
    });
    setStepSixData({
      competitors: '',
      competitor_ads: '',
      unique_advantage: ''
    });
    setStepSevenData({
      user_experience: '',
      media_links: ''
    });
    setStepEightData({
      creation_story: '',
      founder_belief: '',
      key_insight: ''
    });
    setStepNineData({
      previous_ads: '',
      audience_type: '',
      admired_brand: '',
      brand_tone: '',
      forbidden_words: '',
      ad_format: 'video',
      ad_duration: '30',
      language: 'English'
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

      <div className="text-center py-4">
        <p className="text-md italic text-gray-600">
          "Don't tell us what the ad should sound like. Just tell us the truth about your product. We'll take it from there."
        </p>
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
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-medium text-gray-900">1. 🧱 THE OFFER</h3>
          <button 
            onClick={() => toggleSection('offer')}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            {expandedSections.offer ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
        <button
          type="button"
          onClick={handlePreviousStep}
          className="inline-flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="mr-2 w-4 h-4" />
          Back
        </button>
      </div>

      {expandedSections.offer && (
        <>
          <div className="space-y-6">
            <div>
              <label htmlFor="selling_what" className="block text-sm font-medium text-gray-700 mb-2">
                What exactly are you selling? *
              </label>
              <input
                type="text"
                id="selling_what"
                name="selling_what"
                value={stepTwoData.selling_what}
                onChange={handleStepTwoChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 p-3"
                placeholder="e.g., Hydrating Face Serum, GMAT Prep Course, All-in-one CRM Tool"
                required
              />
              <p className="mt-1 text-xs text-gray-500">Name, product type, category</p>
            </div>

            <div>
              <label htmlFor="target_audience" className="block text-sm font-medium text-gray-700 mb-2">
                Who is it meant for? *
              </label>
              <textarea
                id="target_audience"
                name="target_audience"
                value={stepTwoData.target_audience}
                onChange={handleStepTwoChange}
                rows={3}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 p-3"
                placeholder="e.g., Women 28-45 with dry, sensitive skin who are concerned about anti-aging but prefer natural ingredients. They're somewhat knowledgeable about skincare and willing to invest in quality products."
                required
              />
              <p className="mt-1 text-xs text-gray-500">Age, gender, role, lifestyle, stage of awareness — go deep</p>
            </div>

            <div>
              <label htmlFor="price_point" className="block text-sm font-medium text-gray-700 mb-2">
                What's the price point? *
              </label>
              <input
                type="text"
                id="price_point"
                name="price_point"
                value={stepTwoData.price_point}
                onChange={handleStepTwoChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 p-3"
                placeholder="e.g., $49.99 one-time, $19.99/month subscription, $5-10 per usage"
                required
              />
              <p className="mt-1 text-xs text-gray-500">One-time / subscription / pay-per-use</p>
            </div>

            <div>
              <label htmlFor="desired_action" className="block text-sm font-medium text-gray-700 mb-2">
                What action do you want the viewer to take after seeing the ad? *
              </label>
              <input
                type="text"
                id="desired_action"
                name="desired_action"
                value={stepTwoData.desired_action}
                onChange={handleStepTwoChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 p-3"
                placeholder="e.g., Purchase directly from our website, Book a free consultation call, Sign up for 7-day trial"
                required
              />
              <p className="mt-1 text-xs text-gray-500">Buy now / Book a call / Sign up / Download / DM us / WhatsApp us</p>
            </div>
          </div>
        </>
      )}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleNextStep}
          disabled={!stepTwoData.selling_what || !stepTwoData.target_audience || !stepTwoData.price_point || !stepTwoData.desired_action}
          className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          Next Step
          <ArrowRight className="ml-2 w-4 h-4" />
        </button>
      </div>
    </div>
  );

  const renderStepThree = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-medium text-gray-900">2. 💡 THE CORE VALUE</h3>
          <button 
            onClick={() => toggleSection('core')}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            {expandedSections.core ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
        <button
          type="button"
          onClick={handlePreviousStep}
          className="inline-flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="mr-2 w-4 h-4" />
          Back
        </button>
      </div>

      {expandedSections.core && (
        <div className="space-y-6">
          <div>
            <label htmlFor="main_problem" className="block text-sm font-medium text-gray-700 mb-2">
              What's the #1 problem this solves for your ideal customer? *
            </label>
            <textarea
              id="main_problem"
              name="main_problem"
              value={stepThreeData.main_problem}
              onChange={handleStepThreeChange}
              rows={3}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 p-3"
              placeholder="e.g., Most moisturizers either don't hydrate dry skin deeply enough or they cause breakouts and irritation for sensitive skin types."
              required
            />
          </div>

          <div>
            <label htmlFor="emotional_desire" className="block text-sm font-medium text-gray-700 mb-2">
              What does your customer really want? (Emotionally, not just functionally.) *
            </label>
            <textarea
              id="emotional_desire"
              name="emotional_desire"
              value={stepThreeData.emotional_desire}
              onChange={handleStepThreeChange}
              rows={3}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 p-3"
              placeholder="e.g., They want to feel confident going makeup-free, receiving compliments on their skin, and knowing they're preventing aging without harsh chemicals."
              required
            />
          </div>

          <div>
            <label htmlFor="transformation" className="block text-sm font-medium text-gray-700 mb-2">
              In one sentence, what transformation does your product offer? *
            </label>
            <textarea
              id="transformation"
              name="transformation"
              value={stepThreeData.transformation}
              onChange={handleStepThreeChange}
              rows={2}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 p-3"
              placeholder="e.g., From dry, irritated skin that needs constant reapplication of moisturizers → To naturally radiant skin that stays hydrated all day without any irritation."
              required
            />
            <p className="mt-1 text-xs text-gray-500">Before → After</p>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleNextStep}
          disabled={!stepThreeData.main_problem || !stepThreeData.emotional_desire || !stepThreeData.transformation}
          className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          Next Step
          <ArrowRight className="ml-2 w-4 h-4" />
        </button>
      </div>
    </div>
  );

  const renderStepFour = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-medium text-gray-900">3. 🔨 THE PROOF</h3>
          <button 
            onClick={() => toggleSection('proof')}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            {expandedSections.proof ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
        <button
          type="button"
          onClick={handlePreviousStep}
          className="inline-flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="mr-2 w-4 h-4" />
          Back
        </button>
      </div>

      {expandedSections.proof && (
        <div className="space-y-6">
          <div>
            <label htmlFor="credibility_proof" className="block text-sm font-medium text-gray-700 mb-2">
              Why should people believe your product works? *
            </label>
            <textarea
              id="credibility_proof"
              name="credibility_proof"
              value={stepFourData.credibility_proof}
              onChange={handleStepFourChange}
              rows={3}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 p-3"
              placeholder="e.g., Our serum contains clinically-proven 3% hyaluronic acid, organic aloe vera, and our patented HydraLock™ technology which binds moisture to skin cells for 24+ hours."
              required
            />
            <p className="mt-1 text-xs text-gray-500">List ingredients, features, frameworks, tech, or methods that make it credible</p>
          </div>

          <div>
            <label htmlFor="main_reason_to_buy" className="block text-sm font-medium text-gray-700 mb-2">
              What's the single most undeniable reason someone should buy this? *
            </label>
            <textarea
              id="main_reason_to_buy"
              name="main_reason_to_buy"
              value={stepFourData.main_reason_to_buy}
              onChange={handleStepFourChange}
              rows={2}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 p-3"
              placeholder="e.g., It's the only serum clinically proven to provide 24-hour hydration without any irritation for sensitive skin types."
              required
            />
          </div>

          <div>
            <label htmlFor="guarantees" className="block text-sm font-medium text-gray-700 mb-2">
              Do you offer any guarantees or risk-reversal mechanisms?
            </label>
            <textarea
              id="guarantees"
              name="guarantees"
              value={stepFourData.guarantees}
              onChange={handleStepFourChange}
              rows={2}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 p-3"
              placeholder="e.g., 60-day empty bottle money-back guarantee, 14-day free trial, Free consultation before purchase"
            />
            <p className="mt-1 text-xs text-gray-500">Refunds, trials, etc.</p>
          </div>

          <div>
            <label htmlFor="social_proof" className="block text-sm font-medium text-gray-700 mb-2">
              Have you won awards, appeared on media, or been funded?
            </label>
            <textarea
              id="social_proof"
              name="social_proof"
              value={stepFourData.social_proof}
              onChange={handleStepFourChange}
              rows={2}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 p-3"
              placeholder="e.g., Featured in Vogue's 'Best Skincare 2023', 'Best New Beauty Product' at Cosmetic Innovation Awards, Backed by Y Combinator"
            />
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleNextStep}
          disabled={!stepFourData.credibility_proof || !stepFourData.main_reason_to_buy}
          className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          Next Step
          <ArrowRight className="ml-2 w-4 h-4" />
        </button>
      </div>
    </div>
  );

  const renderStepFive = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-medium text-gray-900">4. 🧠 INSIDE THE CUSTOMER'S HEAD</h3>
          <button 
            onClick={() => toggleSection('customer')}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            {expandedSections.customer ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
        <button
          type="button"
          onClick={handlePreviousStep}
          className="inline-flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="mr-2 w-4 h-4" />
          Back
        </button>
      </div>

      {expandedSections.customer && (
        <div className="space-y-6">
          <div>
            <label htmlFor="objections" className="block text-sm font-medium text-gray-700 mb-2">
              What doubts or objections do customers usually have before buying? *
            </label>
            <textarea
              id="objections"
              name="objections"
              value={stepFiveData.objections}
              onChange={handleStepFiveChange}
              rows={3}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 p-3"
              placeholder="e.g., 'It's too expensive for such a small bottle', 'Natural products don't work as well as chemical ones', 'I've tried other serums that claimed the same thing'"
              required
            />
            <p className="mt-1 text-xs text-gray-500">List all objections</p>
          </div>

          <div>
            <label htmlFor="testimonials" className="block text-sm font-medium text-gray-700 mb-2">
              What do your best customers say about you?
            </label>
            <textarea
              id="testimonials"
              name="testimonials"
              value={stepFiveData.testimonials}
              onChange={handleStepFiveChange}
              rows={3}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 p-3"
              placeholder="e.g., 'I've struggled with dry, sensitive skin for years and this is the ONLY product that's worked without causing irritation.' - Sarah K."
            />
            <p className="mt-1 text-xs text-gray-500">Paste actual reviews if possible</p>
          </div>

          <div>
            <label htmlFor="myths_misconceptions" className="block text-sm font-medium text-gray-700 mb-2">
              What myths or misconceptions exist in your market that your product crushes?
            </label>
            <textarea
              id="myths_misconceptions"
              name="myths_misconceptions"
              value={stepFiveData.myths_misconceptions}
              onChange={handleStepFiveChange}
              rows={3}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 p-3"
              placeholder="e.g., 'Natural skincare can't be as effective as products with lab-created ingredients', 'You need different products for hydration and anti-aging'"
            />
          </div>

          <div>
            <label htmlFor="alternatives" className="block text-sm font-medium text-gray-700 mb-2">
              What are they currently using instead? *
            </label>
            <textarea
              id="alternatives"
              name="alternatives"
              value={stepFiveData.alternatives}
              onChange={handleStepFiveChange}
              rows={2}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 p-3"
              placeholder="e.g., Department store moisturizers, Drugstore creams, DIY olive oil + honey masks, CeraVe and La Roche Posay products"
              required
            />
            <p className="mt-1 text-xs text-gray-500">Alternative products, DIY methods, etc.</p>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleNextStep}
          disabled={!stepFiveData.objections || !stepFiveData.alternatives}
          className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          Next Step
          <ArrowRight className="ml-2 w-4 h-4" />
        </button>
      </div>
    </div>
  );

  const renderStepSix = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-medium text-gray-900">5. 🔍 COMPETITION & CONTEXT</h3>
          <button 
            onClick={() => toggleSection('competition')}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            {expandedSections.competition ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
        <button
          type="button"
          onClick={handlePreviousStep}
          className="inline-flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="mr-2 w-4 h-4" />
          Back
        </button>
      </div>

      {expandedSections.competition && (
        <div className="space-y-6">
          <div>
            <label htmlFor="competitors" className="block text-sm font-medium text-gray-700 mb-2">
              Who are your 2 biggest competitors? *
            </label>
            <textarea
              id="competitors"
              name="competitors"
              value={stepSixData.competitors}
              onChange={handleStepSixChange}
              rows={2}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 p-3"
              placeholder="e.g., Drunk Elephant and The Ordinary"
              required
            />
          </div>

          <div>
            <label htmlFor="competitor_ads" className="block text-sm font-medium text-gray-700 mb-2">
              What kind of ads do they run?
            </label>
            <textarea
              id="competitor_ads"
              name="competitor_ads"
              value={stepSixData.competitor_ads}
              onChange={handleStepSixChange}
              rows={3}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 p-3"
              placeholder="e.g., Before and after transformations, Ingredient-focused educational content, Minimalist aesthetic with scientific claims"
            />
            <p className="mt-1 text-xs text-gray-500">If you don't know, you can skip this</p>
          </div>

          <div>
            <label htmlFor="unique_advantage" className="block text-sm font-medium text-gray-700 mb-2">
              What's the one thing you do better than anyone else? *
            </label>
            <textarea
              id="unique_advantage"
              name="unique_advantage"
              value={stepSixData.unique_advantage}
              onChange={handleStepSixChange}
              rows={2}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 p-3"
              placeholder="e.g., Our unique HydraLock™ technology keeps skin hydrated twice as long as competitors without causing any irritation"
              required
            />
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleNextStep}
          disabled={!stepSixData.competitors || !stepSixData.unique_advantage}
          className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          Next Step
          <ArrowRight className="ml-2 w-4 h-4" />
        </button>
      </div>
    </div>
  );

  const renderStepSeven = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-medium text-gray-900">6. 📦 PRODUCT EXPERIENCE</h3>
          <button 
            onClick={() => toggleSection('product')}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            {expandedSections.product ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
        <button
          type="button"
          onClick={handlePreviousStep}
          className="inline-flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="mr-2 w-4 h-4" />
          Back
        </button>
      </div>

      {expandedSections.product && (
        <div className="space-y-6">
          <div>
            <p className="text-sm text-gray-500 mb-2">
              Upload product images (or packaging shots if physical)
            </p>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <p className="text-gray-500">
                In the full version, you would upload images here. For now, please provide links or descriptions.
              </p>
            </div>
          </div>

          <div>
            <label htmlFor="user_experience" className="block text-sm font-medium text-gray-700 mb-2">
              What's the unboxing or user experience like? *
            </label>
            <textarea
              id="user_experience"
              name="user_experience"
              value={stepSevenData.user_experience}
              onChange={handleStepSevenChange}
              rows={3}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 p-3"
              placeholder="e.g., Elegant frosted glass bottle with a premium pump that dispenses the perfect amount. Serum absorbs quickly without stickiness. First results visible in 3-7 days."
              required
            />
            <p className="mt-1 text-xs text-gray-500">Any wow moments?</p>
          </div>

          <div>
            <label htmlFor="media_links" className="block text-sm font-medium text-gray-700 mb-2">
              Do you have video footage, demos, or testimonials we can use?
            </label>
            <textarea
              id="media_links"
              name="media_links"
              value={stepSevenData.media_links}
              onChange={handleStepSevenChange}
              rows={3}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 p-3"
              placeholder="e.g., Link to product demonstration video, Before/after photos, Video testimonials from customers"
            />
            <p className="mt-1 text-xs text-gray-500">Optional but powerful</p>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleNextStep}
          disabled={!stepSevenData.user_experience}
          className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          Next Step
          <ArrowRight className="ml-2 w-4 h-4" />
        </button>
      </div>
    </div>
  );

  const renderStepEight = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-medium text-gray-900">7. 📖 FOUNDER'S MIND</h3>
          <button 
            onClick={() => toggleSection('founder')}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            {expandedSections.founder ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
        <button
          type="button"
          onClick={handlePreviousStep}
          className="inline-flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="mr-2 w-4 h-4" />
          Back
        </button>
      </div>

      {expandedSections.founder && (
        <div className="space-y-6">
          <div>
            <label htmlFor="creation_story" className="block text-sm font-medium text-gray-700 mb-2">
              Why did you create this product or offer in the first place? *
            </label>
            <textarea
              id="creation_story"
              name="creation_story"
              value={stepEightData.creation_story}
              onChange={handleStepEightChange}
              rows={3}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 p-3"
              placeholder="e.g., After struggling with severe skin sensitivity myself and trying everything on the market, I worked with a cosmetic chemist for 18 months to develop something that actually worked for sensitive skin."
              required
            />
          </div>

          <div>
            <label htmlFor="founder_belief" className="block text-sm font-medium text-gray-700 mb-2">
              What makes you deeply believe in it? *
            </label>
            <textarea
              id="founder_belief"
              name="founder_belief"
              value={stepEightData.founder_belief}
              onChange={handleStepEightChange}
              rows={3}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 p-3"
              placeholder="e.g., I've seen thousands of customers transform not just their skin but their confidence after using our product. The letters we receive about how it's changed people's lives keep me going even during tough times."
              required
            />
            <p className="mt-1 text-xs text-gray-500">Tell us your why</p>
          </div>

          <div>
            <label htmlFor="key_insight" className="block text-sm font-medium text-gray-700 mb-2">
              Finish this sentence: "If my ideal customer just understood this one thing, they'd buy instantly." *
            </label>
            <textarea
              id="key_insight"
              name="key_insight"
              value={stepEightData.key_insight}
              onChange={handleStepEightChange}
              rows={2}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 p-3"
              placeholder="e.g., If they understood that our formula solves both dryness AND sensitivity simultaneously, unlike 99% of products that only address one or the other."
              required
            />
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleNextStep}
          disabled={!stepEightData.creation_story || !stepEightData.founder_belief || !stepEightData.key_insight}
          className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          Next Step
          <ArrowRight className="ml-2 w-4 h-4" />
        </button>
      </div>
    </div>
  );

  const renderStepNine = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-medium text-gray-900">8. 📈 PERFORMANCE & 🔥 BRANDING</h3>
            <button 
              onClick={() => toggleSection('performance')}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              {expandedSections.performance ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-1">Final details about your ad preferences</p>
        </div>
        <button
          type="button"
          onClick={handlePreviousStep}
          className="inline-flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="mr-2 w-4 h-4" />
          Back
        </button>
      </div>

      {expandedSections.performance && (
        <>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 mb-4">
            <h4 className="font-medium text-gray-900 mb-3">📈 PERFORMANCE CONTEXT (Optional)</h4>
            <div className="space-y-4">
              <div>
                <label htmlFor="previous_ads" className="block text-sm font-medium text-gray-700 mb-2">
                  Have you run ads before? If yes, what worked and what flopped?
                </label>
                <textarea
                  id="previous_ads"
                  name="previous_ads"
                  value={stepNineData.previous_ads}
                  onChange={handleStepNineChange}
                  rows={3}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 p-3"
                  placeholder="e.g., We've tested testimonial-based ads which performed okay. Scientific explanation videos flopped. Before/after images with minimal text worked best."
                />
              </div>

              <div>
                <label htmlFor="audience_type" className="block text-sm font-medium text-gray-700 mb-2">
                  Do you want these ads to be cold audience, warm retargeting, or both?
                </label>
                <select
                  id="audience_type"
                  name="audience_type"
                  value={stepNineData.audience_type}
                  onChange={handleStepNineChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 p-3"
                >
                  <option value="">Select audience type</option>
                  <option value="cold">Cold audience (new customers)</option>
                  <option value="warm">Warm retargeting (people who know you)</option>
                  <option value="both">Both cold and warm audiences</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 mb-4">
            <h4 className="font-medium text-gray-900 mb-3">🔥 BRANDING STYLE</h4>
            <div className="space-y-4">
              <div>
                <label htmlFor="admired_brand" className="block text-sm font-medium text-gray-700 mb-2">
                  One brand you admire in your space?
                </label>
                <input
                  type="text"
                  id="admired_brand"
                  name="admired_brand"
                  value={stepNineData.admired_brand}
                  onChange={handleStepNineChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 p-3"
                  placeholder="e.g., Glossier, HubSpot, Away Luggage"
                />
              </div>

              <div>
                <label htmlFor="brand_tone" className="block text-sm font-medium text-gray-700 mb-2">
                  Three adjectives to describe your brand tone?
                </label>
                <input
                  type="text"
                  id="brand_tone"
                  name="brand_tone"
                  value={stepNineData.brand_tone}
                  onChange={handleStepNineChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 p-3"
                  placeholder="e.g., trustworthy, cheeky, premium"
                />
                <p className="mt-1 text-xs text-gray-500">e.g., trustworthy, cheeky, premium — or skip</p>
              </div>

              <div>
                <label htmlFor="forbidden_words" className="block text-sm font-medium text-gray-700 mb-2">
                  Any words or claims we must NOT use?
                </label>
                <textarea
                  id="forbidden_words"
                  name="forbidden_words"
                  value={stepNineData.forbidden_words}
                  onChange={handleStepNineChange}
                  rows={2}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 p-3"
                  placeholder="e.g., 'miracle', 'cure', 'guaranteed results', 'best in the world'"
                />
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
            <h4 className="font-medium text-gray-900 mb-3">AD FORMAT PREFERENCES</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="ad_format" className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Format *
                </label>
                <select
                  id="ad_format"
                  name="ad_format"
                  value={stepNineData.ad_format}
                  onChange={handleStepNineChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 p-3"
                  required
                >
                  <option value="video">Video Ad</option>
                  <option value="image">Image Ad</option>
                  <option value="carousel">Carousel Ad</option>
                  <option value="story">Story Ad</option>
                  <option value="reel">Reel/Short Video</option>
                </select>
              </div>

              <div>
                <label htmlFor="ad_duration" className="block text-sm font-medium text-gray-700 mb-2">
                  Ad Duration (seconds)
                </label>
                <select
                  id="ad_duration"
                  name="ad_duration"
                  value={stepNineData.ad_duration}
                  onChange={handleStepNineChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 p-3"
                >
                  <option value="15">15 seconds</option>
                  <option value="30">30 seconds</option>
                  <option value="60">60 seconds</option>
                  <option value="90">90 seconds</option>
                </select>
              </div>

              <div>
                <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-2">
                  Language
                </label>
                <select
                  id="language"
                  name="language"
                  value={stepNineData.language}
                  onChange={handleStepNineChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 p-3"
                >
                  <option value="English">English</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Spanish">Spanish</option>
                  <option value="French">French</option>
                  <option value="German">German</option>
                </select>
              </div>
            </div>
          </div>
        </>
      )}

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex">
        <AlertCircle className="text-blue-500 w-5 h-5 mr-2 flex-shrink-0" />
        <div>
          <p className="text-blue-800 text-sm font-medium">Ready to generate your script?</p>
          <p className="text-blue-600 text-xs mt-1">
            Review your information before submitting. You can come back to any section to make changes.
          </p>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
        <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm z-[60] flex flex-col items-center justify-center">
          <div className="relative w-32 h-32">
            {/* Circular animation similar to Siri */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-28 h-28 rounded-full border-t-4 border-b-4 border-purple-500 animate-spin"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 rounded-full border-l-4 border-r-4 border-blue-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full border-t-4 border-pink-500 animate-spin" style={{ animationDuration: '2s' }}></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 opacity-80 animate-pulse"></div>
            </div>
          </div>
          <p className="mt-6 text-white text-lg font-medium">Generating new script...</p>
          <p className="mt-2 text-gray-300 text-sm max-w-md text-center">
            AI is working to create Ad Winning Script.
          </p>
        </div>
      ):('Generate Script')}
          
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
                  {currentStep === 1 ? renderStepOne() : currentStep === 2 ? renderStepTwo() : currentStep === 3 ? renderStepThree() : currentStep === 4 ? renderStepFour() : currentStep === 5 ? renderStepFive() : currentStep === 6 ? renderStepSix() : currentStep === 7 ? renderStepSeven() : currentStep === 8 ? renderStepEight() : renderStepNine()}
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
