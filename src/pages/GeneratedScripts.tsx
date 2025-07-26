import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Copy, Download, Search, Filter, Clock, ThumbsUp, Eye } from 'lucide-react';
import { buildApiUrl } from '../config/api';

interface ScriptMetadata {
  format: string;
  language: string;
  duration: string;
  tone: string;
}

interface GenerationParams {
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

interface Script {
  userId: string;
  title: string;
  content: string;
  metadata: ScriptMetadata;
  aiGenerated: boolean;
  generationParams: GenerationParams;
  liked: boolean;
  isPublic: boolean;
  views: number;
  _id: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

const GeneratedScripts = () => {
  const navigate = useNavigate();
  const [scripts, setScripts] = useState<Script[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, liked, public
  const [sortBy, setSortBy] = useState('date'); // date, likes, views
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchScripts();
  }, [filter, sortBy]);

  const fetchScripts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(buildApiUrl(`api/scripts?filter=${filter}&sort=${sortBy}`), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch scripts');
      }

      const data = await response.json();
      setScripts(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch scripts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyScript = async (scriptId: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopySuccess(scriptId);
      setTimeout(() => setCopySuccess(null), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleDownloadScript = (script: Script) => {
    const blob = new Blob([script.content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `script_${script.title}_${new Date(script.createdAt).toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const filteredScripts = scripts.filter(script => 
    script.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    script.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    script.generationParams.brand_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Generated Scripts</h1>
            
            {/* Search Bar */}
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search scripts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-4">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Scripts</option>
                <option value="liked">Liked</option>
                <option value="public">Public</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="date">Latest</option>
                <option value="likes">Most Liked</option>
                <option value="views">Most Viewed</option>
              </select>
            </div>
          </div>

          {error ? (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
              <p className="text-red-700">{error}</p>
            </div>
          ) : filteredScripts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No scripts found</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredScripts.map((script) => (
                <div key={script._id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{script.title}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {new Date(script.createdAt).toLocaleDateString()}
                        </span>
                        <span className="flex items-center">
                          <ThumbsUp className="w-4 h-4 mr-1" />
                          {script.liked ? 'Liked' : 'Not Liked'}
                        </span>
                        <span className="flex items-center">
                          <Eye className="w-4 h-4 mr-1" />
                          {script.views} views
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleCopyScript(script._id, script.content)}
                        className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        {copySuccess === script._id ? 'Copied!' : 'Copy'}
                      </button>
                      <button
                        onClick={() => handleDownloadScript(script)}
                        className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </button>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 mb-4 whitespace-pre-wrap font-mono text-sm">
                    {script.content}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Format:</span>
                      <span className="ml-2 text-gray-600">{script.metadata.format}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Language:</span>
                      <span className="ml-2 text-gray-600">{script.metadata.language}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Duration:</span>
                      <span className="ml-2 text-gray-600">{script.metadata.duration}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Tone:</span>
                      <span className="ml-2 text-gray-600">{script.metadata.tone}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GeneratedScripts; 