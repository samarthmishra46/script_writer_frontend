import React, { useState, useEffect } from 'react';
// Import icons and StoryboardGenerator component
import { Copy, Download, RefreshCw, Edit3, Save, X, Video, Heart } from 'lucide-react';
import StoryboardGenerator from './StoryboardGenerator';
import ScriptViewer from './AscriptViwerJSON';
import { buildApiUrl } from '../config/api';

interface GeneratedScriptProps {
  script: {
    _id: string;
    scriptId?: string;
    title: string;
    content: string;
    createdAt: string;
    liked: boolean;
    metadata?: {
      brand_name?: string;
      product?: string;
      [key: string]: unknown;
    };
  };
  onRegenerate?: () => void;
  onEdit?: (editedContent: string) => void;
  isRegenerating?: boolean;
  onLikeToggle?: (scriptId: string, liked: boolean) => void;
}

const GeneratedScript: React.FC<GeneratedScriptProps> = ({
  script,
  onRegenerate,
  onEdit,
  isRegenerating = false,
  onLikeToggle
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(script.content);
  const [copied, setCopied] = useState(false);
  const [showStoryboard, setShowStoryboard] = useState(false);
  const [hasStoryboardAccess, setHasStoryboardAccess] = useState<boolean | null>(null);
  const [checkingAccess, setCheckingAccess] = useState(false);
  const [liked, setLiked] = useState(script.liked || false);
  const [isLiking, setIsLiking] = useState(false);
  
  useEffect(() => {
    setEditedContent(script.content);
    setLiked(script.liked || false);
  }, [script]);

  // Function to detect and parse JSON content
  const parseScriptContent = (content: string) => {
    if (!content || typeof content !== 'string') {
      console.log('Invalid content provided to parseScriptContent');
      return null;
    }
    
    try {
      // Check if content contains JSON-like structure
      if (content.includes('{') && content.includes('}')) {
        // Extract JSON from markdown code blocks if present
        const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[1]);
          console.log('Successfully parsed JSON from markdown:', parsed);
          return parsed;
        }
        
        // Try to parse directly if it looks like JSON
        if (content.trim().startsWith('{')) {
          const parsed = JSON.parse(content);
          console.log('Successfully parsed direct JSON:', parsed);
          return parsed;
        }
      }
      return null;
    } catch (error) {
      console.log('Content is not valid JSON, displaying as text:', error);
      return null;
    }
  };

  const scriptData = parseScriptContent(script.content);
  const isJsonFormat = scriptData !== null;
  
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

  const handleCopy = () => {
    navigator.clipboard.writeText(script.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([script.content], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${script.title.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleStoryboardClick = async () => {
    // If we haven't checked access yet, check it now
    if (hasStoryboardAccess === null) {
      await checkStoryboardAccess();
      return; // The access check will update state, and user can click again
    }
    
    if (hasStoryboardAccess) {
      setShowStoryboard(true);
    } else {
      // Prompt to upgrade
      const confirmUpgrade = window.confirm(
        'Storyboard generation requires an Individual or Organization plan. Would you like to upgrade your subscription?'
      );
      
      if (confirmUpgrade) {
        window.location.href = '/subscription';
      }
    }
  };

  const handleSaveEdit = () => {
    if (onEdit) {
      onEdit(editedContent);
    }
    setIsEditing(false);
  };
  
  const handleLikeToggle = async () => {
    if (isLiking) return;
    
    try {
      setIsLiking(true);
      
      const token = localStorage.getItem('token');
      if (!token) {
        return;
      }
      
      const response = await fetch(buildApiUrl(`api/scripts/like/${script._id}`), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to toggle like status');
      }
      
      const result = await response.json();
      setLiked(result.liked);
      
      // Notify parent component if callback exists
      if (onLikeToggle) {
        onLikeToggle(script._id, result.liked);
      }
      
    } catch (error) {
      console.error('Error toggling like status:', error);
      // Show error toast or notification here
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg mb-8 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 bg-gray-50 border-b flex justify-between items-center flex-wrap gap-2">
        <h3 className="text-lg font-semibold text-gray-900">{script.title}</h3>
        <div className="flex items-center space-x-2">
          {/* Like button */}
          <button
            onClick={handleLikeToggle}
            className={`
              p-2 rounded-lg flex items-center justify-center transition-colors
              ${liked ? 'text-red-500 bg-red-50 hover:bg-red-100' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}
            `}
            title={liked ? "Unlike script" : "Like script"}
            disabled={isLiking}
          >
            <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
          </button>
          
          <button
            onClick={handleCopy}
            className="p-2 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-600 hover:text-gray-900"
            title="Copy script"
          >
            <Copy className="w-5 h-5" />
            {copied && <span className="ml-1 text-xs text-green-600">Copied!</span>}
          </button>
          
          <button
            onClick={handleDownload}
            className="p-2 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-600 hover:text-gray-900"
            title="Download script"
          >
            <Download className="w-5 h-5" />
          </button>
          
          {onRegenerate && (
            <button
              onClick={onRegenerate}
              className="p-2 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isRegenerating}
              title="Regenerate script"
            >
              <RefreshCw className={`w-5 h-5 ${isRegenerating ? 'animate-spin' : ''}`} />
            </button>
          )}
          
          {onEdit && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="p-2 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-600 hover:text-gray-900"
              title="Edit script"
            >
              <Edit3 className="w-5 h-5" />
            </button>
          )}
          
          <button
            onClick={handleStoryboardClick}
            className={`
              p-2 rounded-lg flex items-center justify-center
              ${checkingAccess ? 'text-gray-400 cursor-wait' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}
            `}
            disabled={checkingAccess}
            title={checkingAccess ? "Checking access..." : "Generate storyboard"}
          >
            <Video className="w-5 h-5" />
            <span className="ml-1 text-sm hidden md:inline">Storyboard</span>
          </button>
        </div>
      </div>
      
      {/* Script content */}
      <div className="p-6">
        {isEditing ? (
          <div className="space-y-4">
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setEditedContent(script.content);
                  setIsEditing(false);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm flex items-center"
              >
                <Save className="w-4 h-4 mr-1" />
                Save
              </button>
            </div>
          </div>
        ) : (
          <>
            {isJsonFormat && scriptData ? (
              <div className="bg-gray-50 rounded-lg p-4">
                <ScriptViewer script={scriptData} />
              </div>
            ) : (
              <div className="whitespace-pre-wrap font-mono text-sm text-gray-800 max-h-96 overflow-y-auto">
                {script.content}
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Storyboard Modal */}
      {showStoryboard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b p-4">
              <h3 className="text-xl font-bold">Generate Storyboard</h3>
              <button 
                onClick={() => setShowStoryboard(false)} 
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-4">
              <StoryboardGenerator scriptId={script._id} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GeneratedScript;
