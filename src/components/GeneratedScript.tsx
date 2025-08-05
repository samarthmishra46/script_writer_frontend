import React, { useState, useEffect } from 'react';
// Import icons and StoryboardGenerator component
import { Copy, Download, RefreshCw, Eye, Edit3, Save, X, Video } from 'lucide-react';
import StoryboardGenerator from './StoryboardGenerator';
import { buildApiUrl } from '../config/api';

interface GeneratedScriptProps {
  script: {
    _id: string;
    scriptId?: string;
    title: string;
    content: string;
    createdAt: string;
    metadata?: {
      brand_name?: string;
      product?: string;
      [key: string]: unknown;
    };
  };
  onRegenerate?: () => void;
  onEdit?: (editedContent: string) => void;
  isRegenerating?: boolean;
}

const GeneratedScript: React.FC<GeneratedScriptProps> = ({
  script,
  onRegenerate,
  onEdit,
  isRegenerating = false
}) => {
  const [copySuccess, setCopySuccess] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(script.content || '');
  const [showFullScript, setShowFullScript] = useState(false);
  const [showStoryboard, setShowStoryboard] = useState(false);
  const [hasStoryboardAccess, setHasStoryboardAccess] = useState<boolean | null>(null);
  const [checkingAccess, setCheckingAccess] = useState(false);
  
  // Check if user has access to storyboard generation
  useEffect(() => {
    const checkStoryboardAccess = async () => {
      setCheckingAccess(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setHasStoryboardAccess(false);
          return;
        }
        
        const response = await fetch(buildApiUrl('api/storyboard/status'), {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          setHasStoryboardAccess(false);
          return;
        }
        
        const data = await response.json();
        setHasStoryboardAccess(data.storyboardAccess || false);
      } catch (error) {
        console.error('Error checking storyboard access:', error);
        setHasStoryboardAccess(false);
      } finally {
        setCheckingAccess(false);
      }
    };
    
    checkStoryboardAccess();
  }, []);

  const handleCopy = async () => {
    try {
      if (!script.content) {
        console.error('No content to copy');
        return;
      }
      await navigator.clipboard.writeText(script.content);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownload = () => {
    if (!script.content) {
      console.error('No content to download');
      return;
    }
    const blob = new Blob([script.content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${script.title || 'script'}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleSaveEdit = () => {
    if (onEdit) {
      onEdit(editedContent);
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedContent(script.content);
    setIsEditing(false);
  };

  const formatContent = (content: string | undefined) => {
    if (!content) return '';
    return content.replace(/\\n/g, '\n');
  };

  const getPreview = (content: string | undefined, maxLength: number = 200) => {
    if (!content) return '';
    const formatted = formatContent(content);
    if (formatted.length <= maxLength) return formatted;
    return formatted.substring(0, maxLength) + '...';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{script.title}</h3>
            <div className="flex items-center space-x-4 mt-1">
              <span className="text-sm text-purple-600 font-medium">
                🏢 {script.metadata?.brand_name || 'Unknown Brand'}
              </span>
              <span className="text-sm text-blue-600">
                📦 {script.metadata?.product || 'Unknown Product'}
              </span>
              <span className="text-sm text-gray-500">
                📅 {new Date(script.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowFullScript(!showFullScript)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title={showFullScript ? "Show preview" : "Show full script"}
            >
              <Eye className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="Edit script"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            
            <button
              onClick={handleCopy}
              className={`p-2 rounded-lg transition-colors ${
                copySuccess 
                  ? 'text-green-600 bg-green-100' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
              title="Copy to clipboard"
            >
              <Copy className="w-4 h-4" />
            </button>
            
            <button
              onClick={handleDownload}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="Download script"
            >
              <Download className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => {
                if (hasStoryboardAccess) {
                  setShowStoryboard(true);
                } else if (hasStoryboardAccess === false) {
                  // Redirect to subscription page or show a modal
                  const confirmUpgrade = window.confirm(
                    'Storyboard generation requires an Individual or Organization plan. Would you like to upgrade your subscription?'
                  );
                  
                  if (confirmUpgrade) {
                    window.location.href = '/subscription';
                  }
                }
              }}
              disabled={checkingAccess || hasStoryboardAccess === null}
              className={`p-2 flex items-center ${
                hasStoryboardAccess 
                  ? 'text-green-600 hover:text-green-700 hover:bg-green-50' 
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
              } rounded-lg transition-colors`}
              title={
                hasStoryboardAccess === null
                  ? 'Checking storyboard access...'
                  : hasStoryboardAccess
                  ? 'Generate storyboard'
                  : 'Upgrade to generate storyboards'
              }
            >
              <Video className="w-4 h-4" />
              <span className="ml-1 text-xs">
                {checkingAccess ? 'Checking...' : 'Storyboard'}
              </span>
            </button>
            
            {onRegenerate && (
              <button
                onClick={onRegenerate}
                disabled={isRegenerating}
                className="p-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors disabled:opacity-50"
                title="Regenerate script"
              >
                <RefreshCw className={`w-4 h-4 ${isRegenerating ? 'animate-spin' : ''}`} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Edit Script Content
              </label>
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                rows={15}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                placeholder="Edit your script content..."
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <X className="w-4 h-4 inline mr-1" />
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Save className="w-4 h-4 inline mr-1" />
                Save Changes
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="bg-gray-50 rounded-lg p-4">
              <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono leading-relaxed">
                {showFullScript ? formatContent(script.content) : getPreview(script.content, 300)}
              </pre>
              
              {!showFullScript && script.content.length > 300 && (
                <button
                  onClick={() => setShowFullScript(true)}
                  className="mt-3 text-purple-600 hover:text-purple-700 text-sm font-medium"
                >
                  Show more...
                </button>
              )}
              
              {showFullScript && (
                <button
                  onClick={() => setShowFullScript(false)}
                  className="mt-3 text-purple-600 hover:text-purple-700 text-sm font-medium"
                >
                  Show less
                </button>
              )}
            </div>
            
            {copySuccess && (
              <div className="mt-3 text-green-600 text-sm font-medium">
                ✓ Copied to clipboard!
              </div>
            )}
          </div>
        )}
      </div>

      {/* Metadata */}
      {script.metadata && Object.keys(script.metadata).length > 0 && (
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
          <details className="cursor-pointer">
            <summary className="text-sm font-medium text-gray-700 hover:text-gray-900">
              Script Details
            </summary>
            <div className="mt-2 space-y-1">
              {Object.entries(script.metadata).map(([key, value]) => (
                <div key={key} className="text-xs text-gray-600">
                  <span className="font-medium capitalize">{key.replace(/_/g, ' ')}:</span>{' '}
                  {String(value)}
                </div>
              ))}
            </div>
          </details>
        </div>
      )}
      
      {/* Storyboard Modal */}
      {showStoryboard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-2 text-right">
              <button 
                onClick={() => setShowStoryboard(false)}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-4 pb-6">
              <StoryboardGenerator 
                scriptId={script._id} 
                onClose={() => setShowStoryboard(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GeneratedScript;
