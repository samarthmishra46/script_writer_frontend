import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Crown, Copy, Download } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { buildApiUrl } from '../config/api';

interface ScriptMetadata {
  format?: string;
  language?: string;
  duration?: string;
  tone?: string;
}

interface ScriptResponse {
  success: boolean;
  script: {
    userId: string;
    title: string;
    content: string;
    metadata: ScriptMetadata;
    aiGenerated: boolean;
    _id: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
  message: string;
}

interface FormData {
  target_segment: string;
  brand_name: string;
  category: string;
  product: string;
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

interface User {
  id: string;
  name: string;
  email: string;
  subscription?: {
    plan: string;
    status: string;
  };
}

const CreateScript = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scriptCount, setScriptCount] = useState(0);
  const [generatedScript, setGeneratedScript] = useState<ScriptResponse['script'] | null>(null);
  const [copySuccess, setCopySuccess] = useState<string | false>(false);
  const [formData, setFormData] = useState<FormData>({
    target_segment: '',
    brand_name: '',
    category: '',
    product: '',
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
  const [additionalRequirements, setAdditionalRequirements] = useState('');
  const [isRegenerating, setIsRegenerating] = useState(false);

  // Add ref for the top of the page
  const topRef = React.useRef<HTMLDivElement>(null);

  const scrollToTop = () => {
    topRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  // Add more detailed debugging
  useEffect(() => {
    if (generatedScript) {
      console.log('Generated Script Data:', {
        hasScript: !!generatedScript,
        hasContent: !!generatedScript.content,
        contentType: typeof generatedScript.content,
        contentLength: generatedScript.content?.length,
        fullScript: generatedScript,
      });
    }
  }, [generatedScript]);

  // Function to process script content
  const processScriptContent = (content: string | undefined | null): string => {
    if (!content) return '';
    // Replace \n with actual newlines if they're escaped
    return content.replace(/\\n/g, '\n');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Function to format the script content for copying
  const getFormattedContent = (content: string) => {
    // Remove any HTML tags that might be present
    return content.replace(/<[^>]*>/g, '');
  };

  const handleCopyScript = async (scriptId: string, content: string) => {
    try {
      await navigator.clipboard.writeText(getFormattedContent(content));
      setCopySuccess(scriptId);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleDownloadScript = (script: ScriptResponse['script']) => {
    if (script.content) {
      const formattedContent = getFormattedContent(script.content);
      const blob = new Blob([formattedContent], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `script_${script.title}_${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!checkScriptLimit()) {
      setError('You have reached your free tier limit. Please upgrade to continue.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedScript(null);

    try {
      const response = await fetch(buildApiUrl('api/scripts/generate'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      const data: ScriptResponse = await response.json();
      console.log('API Response:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to generate script');
      }

      // Validate the response data
      if (!data.success || !data.script || !data.script.content) {
        console.error('Invalid API response:', data);
        throw new Error('Invalid response from server');
      }

      // Set the generated script
      setGeneratedScript(data.script);
      setScriptCount(prev => prev + 1);
      
      // Scroll to top after script is generated
      scrollToTop();
      
    } catch (error) {
      console.error('Script generation error:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate script');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = async () => {
    if (!generatedScript) return;

    setIsRegenerating(true);
    setError(null);

    try {
      const response = await fetch(buildApiUrl('api/scripts/generate'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...formData,
          additional_requirements: additionalRequirements
        })
      });

      const data: ScriptResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to regenerate script');
      }

      if (!data.success || !data.script || !data.script.content) {
        throw new Error('Invalid response from server');
      }

      setGeneratedScript(data.script);
      setAdditionalRequirements('');
      
      // Scroll to top after script is regenerated
      scrollToTop();
      
    } catch (error) {
      console.error('Script regeneration error:', error);
      setError(error instanceof Error ? error.message : 'Failed to regenerate script');
    } finally {
      setIsRegenerating(false);
    }
  };

  const checkScriptLimit = () => {
    if (!user?.subscription || user.subscription.plan === 'free') {
      if (scriptCount >= 3) {
        return false;
      }
    }
    return true;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div ref={topRef} /> {/* Add ref at the top */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Subscription Status Banner */}
        {(!user?.subscription || user.subscription.plan === 'free') && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-blue-100 rounded-full p-2">
                  <Crown className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Free Plan</h3>
                  <p className="text-sm text-gray-600">
                    {3 - scriptCount} scripts remaining this month
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate('/subscription')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Upgrade to Premium
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
              <div>
                <p className="text-red-700">{error}</p>
                {error.includes('limit') && (
                  <button
                    onClick={() => navigate('/subscription')}
                    className="mt-2 text-red-600 hover:text-red-700 font-medium underline"
                  >
                    Upgrade to Premium
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Generated Script Display */}
        {generatedScript && generatedScript.content && (
          <div id="generated-script" className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Generated Script</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Generated on {new Date(generatedScript.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleCopyScript(generatedScript._id, generatedScript.content)}
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  {copySuccess === generatedScript._id ? 'Copied!' : 'Copy'}
                </button>
                <button
                  onClick={() => handleDownloadScript(generatedScript)}
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </button>
              </div>
            </div>

            {/* Script Content */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6 prose prose-sm max-w-none">
              {generatedScript.content ? (
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    // Customize heading styles
                    h1: ({...props}) => <h1 className="text-2xl font-bold mb-4 text-gray-900" {...props} />,
                    h2: ({...props}) => <h2 className="text-xl font-bold mb-3 text-gray-900" {...props} />,
                    h3: ({...props}) => <h3 className="text-lg font-bold mb-2 text-gray-900" {...props} />,
                    // Style paragraphs with proper spacing
                    p: ({...props}) => <p className="mb-4 text-gray-800 leading-relaxed" {...props} />,
                    // Style lists
                    ul: ({...props}) => <ul className="list-disc pl-6 mb-4 space-y-2" {...props} />,
                    ol: ({...props}) => <ol className="list-decimal pl-6 mb-4 space-y-2" {...props} />,
                    // Style list items
                    li: ({...props}) => <li className="text-gray-800" {...props} />,
                    // Style bold text
                    strong: ({...props}) => <strong className="font-bold text-gray-900" {...props} />,
                    // Style italic text
                    em: ({...props}) => <em className="italic text-gray-800" {...props} />,
                    // Style code blocks
                    code: ({...props}) => <code className="bg-gray-100 rounded px-1 py-0.5" {...props} />,
                    // Style blockquotes
                    blockquote: ({...props}) => (
                      <blockquote className="border-l-4 border-blue-500 pl-4 italic my-4 text-gray-700" {...props} />
                    ),
                    // Preserve line breaks with proper spacing
                    br: ({...props}) => <br className="mb-4" {...props} />,
                  }}
                >
                  {processScriptContent(generatedScript.content)}
                </ReactMarkdown>
              ) : (
                <p className="text-gray-500 text-center">No content available</p>
              )}
            </div>

            {/* Script Metadata */}
            {generatedScript.metadata && Object.keys(generatedScript.metadata).length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-sm">
                {generatedScript.metadata.format && (
                  <div>
                    <span className="font-medium text-gray-700">Format:</span>
                    <span className="ml-2 text-gray-600">{generatedScript.metadata.format}</span>
                  </div>
                )}
                {generatedScript.metadata.language && (
                  <div>
                    <span className="font-medium text-gray-700">Language:</span>
                    <span className="ml-2 text-gray-600">{generatedScript.metadata.language}</span>
                  </div>
                )}
                {generatedScript.metadata.duration && (
                  <div>
                    <span className="font-medium text-gray-700">Duration:</span>
                    <span className="ml-2 text-gray-600">{generatedScript.metadata.duration}</span>
                  </div>
                )}
                {generatedScript.metadata.tone && (
                  <div>
                    <span className="font-medium text-gray-700">Tone:</span>
                    <span className="ml-2 text-gray-600">{generatedScript.metadata.tone}</span>
                  </div>
                )}
              </div>
            )}

            {/* Regenerate with Additional Requirements */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Regenerate with Additional Requirements
              </h3>
              <div className="space-y-4">
                <textarea
                  value={additionalRequirements}
                  onChange={(e) => setAdditionalRequirements(e.target.value)}
                  placeholder="Add more specific requirements or modifications you'd like to see in the regenerated script..."
                  className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  onClick={handleRegenerate}
                  disabled={isRegenerating || !additionalRequirements.trim()}
                  className={`w-full bg-blue-600 text-white py-3 px-6 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors duration-200 ${
                    (isRegenerating || !additionalRequirements.trim()) ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isRegenerating ? 'Regenerating Script...' : 'Regenerate Script'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Script Generation Form */}
        <form onSubmit={handleSubmit} className="bg-white shadow-sm rounded-lg p-6 space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Ad Script</h2>

          {/* Brand Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Brand Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Brand Name</label>
                <input
                  type="text"
                  name="brand_name"
                  value={formData.brand_name}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Product Description</label>
              <textarea
                name="product"
                value={formData.product}
                onChange={handleChange}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Target Audience */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Target Audience</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700">Target Segment</label>
              <textarea
                name="target_segment"
                value={formData.target_segment}
                onChange={handleChange}
                rows={2}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Target Persona</label>
              <textarea
                name="target_persona"
                value={formData.target_persona}
                onChange={handleChange}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Value Proposition */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Value Proposition</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700">Main Problem to Solve</label>
              <textarea
                name="big_problem"
                value={formData.big_problem}
                onChange={handleChange}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Unique Selling Proposition</label>
              <textarea
                name="usp"
                value={formData.usp}
                onChange={handleChange}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Key Facts/Features</label>
              <textarea
                name="key_facts"
                value={formData.key_facts}
                onChange={handleChange}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Offer</label>
              <textarea
                name="offer"
                value={formData.offer}
                onChange={handleChange}
                rows={2}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Ad Preferences */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Ad Preferences</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Tone of Voice</label>
                <select
                  name="tone"
                  value={formData.tone}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                >
                  <option value="">Select tone</option>
                  <option value="professional">Professional</option>
                  <option value="friendly">Friendly</option>
                  <option value="casual">Casual</option>
                  <option value="humorous">Humorous</option>
                  <option value="formal">Formal</option>
                  <option value="inspirational">Inspirational</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Preferred Format</label>
                <select
                  name="preferred_formats"
                  value={formData.preferred_formats}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                >
                  <option value="">Select format</option>
                  <option value="video">Video Ad</option>
                  <option value="social">Social Media Post</option>
                  <option value="display">Display Ad</option>
                  <option value="radio">Radio Script</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Language</label>
                <select
                  name="language_pref"
                  value={formData.language_pref}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                >
                  <option value="English">English</option>
                  <option value="Spanish">Hindi</option>
                  <option value="French">Hinglish</option>
                  <option value="German">German</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Ad Duration (seconds)</label>
                <select
                  name="ad_duration"
                  value={formData.ad_duration}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                >
                  <option value="15">15 seconds</option>
                  <option value="30">30 seconds</option>
                  <option value="60">60 seconds</option>
                </select>
              </div>
            </div>
          </div>

          {/* Campaign Objective */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Campaign Objective</label>
            <textarea
              name="objective"
              value={formData.objective}
              onChange={handleChange}
              rows={2}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
              placeholder="What do you want to achieve with this ad?"
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-blue-600 text-white py-3 px-6 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors duration-200 ${
                isLoading ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Generating Script...' : 'Generate Script'}
            </button>
          </div>
        </form>

        {/* Feature comparison for free users */}
        {(!user?.subscription || user.subscription.plan === 'free') && (
          <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Premium Features Available
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center text-gray-600">
                <Crown className="w-5 h-5 text-blue-500 mr-2" />
                Unlimited script generation
              </li>
              <li className="flex items-center text-gray-600">
                <Crown className="w-5 h-5 text-blue-500 mr-2" />
                Advanced customization options
              </li>
              <li className="flex items-center text-gray-600">
                <Crown className="w-5 h-5 text-blue-500 mr-2" />
                Priority support
              </li>
              <li className="flex items-center text-gray-600">
                <Crown className="w-5 h-5 text-blue-500 mr-2" />
                Analytics and insights
              </li>
            </ul>
            <button
              onClick={() => navigate('/subscription')}
              className="mt-6 w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
            >
              Upgrade Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateScript; 