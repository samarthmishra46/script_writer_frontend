import React, { useState, useEffect } from 'react';
import { Video, Loader2, AlertCircle, Download, Copy, Eye, EyeOff } from 'lucide-react';
import { buildApiUrl } from '../config/api';

interface StoryboardScene {
  scene_number: string;
  visual_description: string;
  camera_angle: string;
  camera_movement: string;
  lighting: string;
  props: string[];
  set: string;
  actor_actions: string;
  actor_expressions: string;
  duration: string;
  special_effects: string;
  audio_notes: string;
  image_url:string;
}

interface StoryboardData {
  title: string;
  total_scenes: number;
  estimated_duration: string;
  scenes: StoryboardScene[];
}

interface StoryboardResponse {
  success: boolean;
  storyboard: StoryboardData;
  scriptId: string;
  scriptTitle: string;
  message: string;
}

interface StoryboardGeneratorProps {
  scriptId?: string;
  scriptContent?: string;
  onClose?: () => void;
}

const StoryboardGenerator: React.FC<StoryboardGeneratorProps> = ({
  scriptId,
  scriptContent,
  onClose
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [storyboard, setStoryboard] = useState<StoryboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showFullDescription, setShowFullDescription] = useState<{ [key: string]: boolean }>({});
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  const generateStoryboard = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const endpoint = scriptId 
        ? `api/storyboard/${scriptId}` 
        : 'api/storyboard';
      
      const response = await fetch(buildApiUrl(endpoint), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data: StoryboardResponse = await response.json();

      if (!response.ok) {
        if (data.upgrade) {
          throw new Error('Upgrade to an individual plan to generate storyboards.');
        }
        throw new Error(data.message || 'Failed to generate storyboard');
      }

      if (!data.success || !data.storyboard) {
        throw new Error('Invalid response from server');
      }

      setStoryboard(data.storyboard);
      
    } catch (error) {
      console.error('Storyboard generation error:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate storyboard');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyScene = async (sceneNumber: string, sceneData: StoryboardScene) => {
    try {
      const sceneText = `
Scene ${sceneNumber}

Visual Description: ${sceneData.visual_description}
Camera: ${sceneData.camera_angle} - ${sceneData.camera_movement}
Lighting: ${sceneData.lighting}
Set: ${sceneData.set}
Actor Actions: ${sceneData.actor_actions}
Actor Expressions: ${sceneData.actor_expressions}
Duration: ${sceneData.duration} seconds
Props: ${sceneData.props.join(', ')}
Special Effects: ${sceneData.special_effects}
Audio Notes: ${sceneData.audio_notes}
Image: ${sceneData.image_url}
      `.trim();

      await navigator.clipboard.writeText(sceneText);
      setCopySuccess(sceneNumber);
      setTimeout(() => setCopySuccess(null), 2000);
    } catch (err) {
      console.error('Failed to copy scene:', err);
    }
  };

  const handleDownloadStoryboard = () => {
    if (!storyboard) return;

    const storyboardText = `
${storyboard.title}
Total Scenes: ${storyboard.total_scenes}
Estimated Duration: ${storyboard.estimated_duration} seconds

${storyboard.scenes.map((scene, index) => `
Scene ${index + 1}

Visual Description: ${scene.visual_description}
Camera: ${scene.camera_angle} - ${scene.camera_movement}
Lighting: ${scene.lighting}
Set: ${scene.set}
Actor Actions: ${scene.actor_actions}
Actor Expressions: ${scene.actor_expressions}
Duration: ${scene.duration} seconds
Props: ${scene.props.join(', ')}
Special Effects: ${scene.special_effects}
Audio Notes: ${scene.audio_notes}
Image: ${scene.image_url}
`).join('\n')}
    `.trim();

    const blob = new Blob([storyboardText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `storyboard_${storyboard.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const toggleDescription = (sceneNumber: string) => {
    setShowFullDescription(prev => ({
      ...prev,
      [sceneNumber]: !prev[sceneNumber]
    }));
  };

  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-green-100 rounded-full p-2">
            <Video className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Storyboard Generator</h2>
            <p className="text-sm text-gray-600">
              {scriptId ? 'Generate storyboard for specific script' : 'Generate storyboard for last script'}
            </p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
            <div>
              <p className="text-red-700">{error}</p>
              {error.includes('Upgrade') && (
                <button
                  onClick={() => window.location.href = '/subscription'}
                  className="mt-2 text-red-600 hover:text-red-700 font-medium underline"
                >
                  Upgrade Now
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Generate Button */}
      {!storyboard && (
        <div className="text-center py-8">
          <div className="mb-4">
            <Video className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Generate Storyboard
            </h3>
            <p className="text-gray-600 mb-6">
              Create a detailed storyboard with scene breakdown, camera angles, lighting, and production details.
            </p>
          </div>
          <button
            onClick={generateStoryboard}
            disabled={isGenerating}
            className={`bg-green-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-green-700 transition-colors duration-200 flex items-center mx-auto ${
              isGenerating ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Generating Storyboard...
              </>
            ) : (
              <>
                <Video className="w-5 h-5 mr-2" />
                Generate Storyboard
              </>
            )}
          </button>
        </div>
      )}

      {/* Storyboard Display */}
      {storyboard && (
        <div className="space-y-6">
          {/* Storyboard Header */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{storyboard.title}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {storyboard.total_scenes} scenes • {storyboard.estimated_duration} seconds total
                </p>
              </div>
              <button
                onClick={handleDownloadStoryboard}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Storyboard
              </button>
            </div>
          </div>

          {/* Scenes */}
          <div className="space-y-6">
            {storyboard.scenes.map((scene, index) => (
              <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                {/* Scene Header */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="bg-green-100 rounded-full px-3 py-1">
                        <span className="text-sm font-semibold text-green-800">
                          Scene {index + 1}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {scene.duration}
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopyScene(scene.scene_number, scene)}
                      className="flex items-center text-sm text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      <Copy className="w-4 h-4 mr-1" />
                      {copySuccess === scene.scene_number ? 'Copied!' : 'Copy Scene'}
                    </button>
                  </div>
                </div>

                {/* Scene Content */}
                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column - Visual Details */}
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Visual Description</h4>
                        <div className="relative">
                          <p className="text-gray-700 text-sm leading-relaxed">
                            {showFullDescription[scene.scene_number] 
                              ? scene.visual_description 
                              : truncateText(scene.visual_description, 150)
                            }
                          </p>
                          {scene.visual_description.length > 150 && (
                            <button
                              onClick={() => toggleDescription(scene.scene_number)}
                              className="text-green-600 hover:text-green-700 text-sm font-medium mt-1 flex items-center"
                            >
                              {showFullDescription[scene.scene_number] ? (
                                <>
                                  <EyeOff className="w-4 h-4 mr-1" />
                                  Show Less
                                </>
                              ) : (
                                <>
                                  <Eye className="w-4 h-4 mr-1" />
                                  Show More
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Camera & Lighting</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">Camera:</span>
                            <p className="text-gray-600">{scene.camera_angle} - {scene.camera_movement}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Lighting:</span>
                            <p className="text-gray-600">{scene.lighting}</p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Set & Location</h4>
                        <p className="text-gray-700 text-sm">{scene.set}</p>
                      </div>
                    </div>

                    {/* Right Column - Production Details */}
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Actor Details</h4>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">Actions:</span>
                            <p className="text-gray-600">{scene.actor_actions}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Expressions:</span>
                            <p className="text-gray-600">{scene.actor_expressions}</p>
                          </div>
                          <div>
  <span className="font-medium text-gray-700">Scene Image:</span>
  <img
    src={scene.image_url}  // comes from backend JSON
    alt={`Storyboard ${scene.scene_number}`}
    className="mt-2 rounded-lg shadow-md w-full max-w-md"
  />
</div>

                        </div>
                      </div>

                      {scene.props.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Props & Equipment</h4>
                          <div className="flex flex-wrap gap-2">
                            {scene.props.map((prop, propIndex) => (
                              <span key={propIndex} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                {prop}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {scene.special_effects && scene.special_effects !== 'None' && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Special Effects</h4>
                          <p className="text-gray-700 text-sm">{scene.special_effects}</p>
                        </div>
                      )}

                      {scene.audio_notes && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Audio Notes</h4>
                          <p className="text-gray-700 text-sm">{scene.audio_notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Regenerate Button */}
          <div className="text-center pt-6 border-t border-gray-200">
            <button
              onClick={generateStoryboard}
              disabled={isGenerating}
              className={`bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 ${
                isGenerating ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin inline" />
                  Regenerating...
                </>
              ) : (
                'Regenerate Storyboard'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoryboardGenerator; 