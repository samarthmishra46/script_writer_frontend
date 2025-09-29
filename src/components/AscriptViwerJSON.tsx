import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Video, Loader2, Copy, Download } from "lucide-react";

interface Dialogue {
  actor: string;
  text: string;
  style?: string;
  emotion?: string;
  action?: string;
}

interface Scene {
  sceneId: number;
  setting?: {
    background?: string;
    cameraAngle?: string;
    lighting?: string;
  };
  dialogues: Dialogue[];
}

interface PodcastDetails {
  podcastStyle?: string;
  podcastTheme?: string;
  videoFormat?: string;
  videoLanguage?: string;
  productHighlighted?: string;
  notes?: string;
}

interface Script {
  scriptTitle?: string;
  theme?: string;
  podcastDetails?: PodcastDetails;
  scenes?: Scene[];
}

interface ScriptViewerProps {
  script: Script;
  isGeneratingVideo?: boolean;
  onGenerateVideo?: () => void;
  videoUrl?: string;
  metadata?: {
    videoUrl?: string;
    videoGenerated?: boolean;
    videoGeneratedAt?: string;
    [key: string]: unknown;
  };
}

// New interfaces for videoAdScript format (matching ScriptDisplay)
interface VideoCharacter {
  age?: string;
  description?: string;
  looks?: string;
}

interface VideoScene {
  sceneNumber: number;
  setting?: string;
  time?: string;
  visuals?: string;
  action?: string;
  shotDescription?: string[];
  dialogue?: string;
  soundscape?: string;
  superimposedText?: string[];
}

interface VideoMetadata {
  adTitle?: string;
  product?: string;
  duration?: string;
  emotionalTone?: string;
  coreMessage?: string;
  tagline?: string;
  targetAudience?: string;
}

interface VideoTechnicalSpecs {
  aspectRatio?: string;
  colorGrading?: string;
  soundtrack?: string;
}

interface VideoAdScript {
  metadata?: VideoMetadata;
  characters?: Record<string, VideoCharacter>;
  technicalSpecifications?: VideoTechnicalSpecs;
  scenes?: VideoScene[];
}

interface VideoAdScriptData {
  videoAdScript?: VideoAdScript;
}

interface VideoAdScriptViewerProps {
  scriptData: VideoAdScriptData;
  isGeneratingVideo?: boolean;
  onGenerateVideo?: () => void;
  videoUrl?: string;
  metadata?: {
    videoUrl?: string;
    videoGenerated?: boolean;
    videoGeneratedAt?: string;
    [key: string]: unknown;
  };
}

// VideoAdScript viewer component (matching ScriptDisplay layout)
const VideoAdScriptViewer: React.FC<VideoAdScriptViewerProps> = ({
  scriptData,
  isGeneratingVideo = false,
  onGenerateVideo,
  videoUrl,
  metadata
}) => {
  const [isCopied, setIsCopied] = useState(false);
  const videoScript = scriptData.videoAdScript;
  
  if (!videoScript) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <p className="text-red-600 mb-4">Error: Invalid script format</p>
        </div>
      </div>
    );
  }

  const handleCopy = () => {
    const scriptText = formatScriptAsText(videoScript);
    navigator.clipboard.writeText(scriptText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownload = () => {
    const scriptText = formatScriptAsText(videoScript);
    const blob = new Blob([scriptText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${videoScript.metadata?.adTitle || 'script'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatScriptAsText = (script: VideoAdScript): string => {
    let text = '';
    
    if (script.metadata) {
      text += `${script.metadata.adTitle || 'Ad Script'}\n`;
      text += '='.repeat((script.metadata.adTitle || 'Ad Script').length) + '\n\n';
      
      if (script.metadata.product) text += `Product: ${script.metadata.product}\n`;
      if (script.metadata.duration) text += `Duration: ${script.metadata.duration}\n`;
      if (script.metadata.emotionalTone) text += `Tone: ${script.metadata.emotionalTone}\n`;
      if (script.metadata.tagline) text += `Tagline: "${script.metadata.tagline}"\n`;
      text += '\n';
    }
    
    if (script.characters) {
      text += 'CHARACTERS\n---------\n\n';
      Object.entries(script.characters).forEach(([name, char]) => {
        text += `${name}:\n`;
        if (char.age) text += `  Age: ${char.age}\n`;
        if (char.description) text += `  Description: ${char.description}\n`;
        if (char.looks) text += `  Looks: ${char.looks}\n`;
        text += '\n';
      });
    }
    
    if (script.scenes) {
      text += 'SCENES\n------\n\n';
      script.scenes.forEach((scene) => {
        text += `SCENE ${scene.sceneNumber}\n`;
        if (scene.setting) text += `Setting: ${scene.setting}\n`;
        if (scene.time) text += `Time: ${scene.time}\n`;
        if (scene.visuals) text += `Visuals: ${scene.visuals}\n`;
        if (scene.action) text += `Action: ${scene.action}\n`;
        if (scene.dialogue) text += `Dialogue: ${scene.dialogue}\n`;
        if (scene.soundscape) text += `Sound: ${scene.soundscape}\n`;
        text += '\n';
      });
    }
    
    return text;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Script Content */}
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white shadow-xl rounded-lg overflow-hidden" style={{ fontFamily: 'Courier New, monospace' }}>
          
          {/* Action Bar */}
          <div className="bg-gray-100 border-b border-gray-200 p-4">
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={handleCopy}
                className={`flex items-center px-4 py-2 rounded-lg border transition-all ${
                  isCopied 
                    ? 'bg-green-50 border-green-200 text-green-700' 
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Copy className="w-4 h-4 mr-2" />
                {isCopied ? 'Copied!' : 'Copy Script'}
              </button>
              
              <button
                onClick={handleDownload}
                className="flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </button>
            </div>
          </div>

          {/* Title Page */}
          <div className="border-b-2 border-black p-12 text-center bg-white">
            <h1 className="text-4xl font-bold mb-4 uppercase tracking-wider">
              {videoScript.metadata?.adTitle || 'Video Ad Script'}
            </h1>
            <div className="h-1 bg-black w-32 mx-auto mb-6"></div>
            
            {videoScript.metadata && (
              <div className="space-y-2 text-lg">
                {videoScript.metadata.product && (
                  <p><strong>PRODUCT:</strong> {videoScript.metadata.product}</p>
                )}
                {videoScript.metadata.duration && (
                  <p><strong>DURATION:</strong> {videoScript.metadata.duration}</p>
                )}
                {videoScript.metadata.emotionalTone && (
                  <p><strong>TONE:</strong> {videoScript.metadata.emotionalTone}</p>
                )}
              </div>
            )}
            
            {videoScript.metadata?.tagline && (
              <div className="mt-8 p-4 border-2 border-black">
                <p className="text-xl italic font-medium">
                  "{videoScript.metadata.tagline}"
                </p>
              </div>
            )}
            
            {videoScript.metadata?.coreMessage && (
              <div className="mt-6">
                <p className="text-lg font-semibold mb-2">CORE MESSAGE:</p>
                <p className="text-gray-700 italic">{videoScript.metadata.coreMessage}</p>
              </div>
            )}
          </div>

          {/* Characters */}
          {videoScript.characters && Object.keys(videoScript.characters).length > 0 && (
            <div className="p-8 border-b border-gray-300">
              <h2 className="text-2xl font-bold mb-6 uppercase tracking-wide">Cast of Characters</h2>
              <div className="space-y-6">
                {Object.entries(videoScript.characters).map(([name, character]) => (
                  <div key={name} className="border-l-4 border-black pl-6">
                    <h3 className="text-xl font-bold mb-2">{name}</h3>
                    <div className="space-y-2 text-sm">
                      {character.age && (
                        <p><strong>AGE:</strong> {character.age}</p>
                      )}
                      {character.description && (
                        <p><strong>DESCRIPTION:</strong> {character.description}</p>
                      )}
                      {character.looks && (
                        <p><strong>APPEARANCE:</strong> {character.looks}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Scenes */}
          {videoScript.scenes && (
            <div className="p-8">
              <h2 className="text-2xl font-bold mb-6 uppercase tracking-wide">Script</h2>
              <div className="space-y-8">
                {videoScript.scenes.map((scene) => (
                  <div key={scene.sceneNumber} className="border border-gray-300 rounded-lg p-6">
                    <div className="bg-black text-white p-3 rounded-t-lg -mx-6 -mt-6 mb-6">
                      <h3 className="text-lg font-bold">SCENE {scene.sceneNumber}</h3>
                    </div>
                    
                    <div className="space-y-4">
                      {scene.setting && (
                        <div>
                          <p className="font-bold text-sm uppercase tracking-wide mb-1">Setting:</p>
                          <p className="text-sm pl-4 border-l-2 border-gray-300">{scene.setting}</p>
                        </div>
                      )}
                      
                      {scene.time && (
                        <div>
                          <p className="font-bold text-sm uppercase tracking-wide mb-1">Time:</p>
                          <p className="text-sm pl-4 border-l-2 border-gray-300">{scene.time}</p>
                        </div>
                      )}
                      
                      {scene.visuals && (
                        <div>
                          <p className="font-bold text-sm uppercase tracking-wide mb-1">Visuals:</p>
                          <p className="text-sm pl-4 border-l-2 border-blue-300">{scene.visuals}</p>
                        </div>
                      )}
                      
                      {scene.action && (
                        <div>
                          <p className="font-bold text-sm uppercase tracking-wide mb-1">Action:</p>
                          <p className="text-sm pl-4 border-l-2 border-green-300">{scene.action}</p>
                        </div>
                      )}
                      
                      {scene.shotDescription && scene.shotDescription.length > 0 && (
                        <div>
                          <p className="font-bold text-sm uppercase tracking-wide mb-1">Shot Description:</p>
                          <div className="pl-4 border-l-2 border-purple-300">
                            {scene.shotDescription.map((shot, index) => (
                              <p key={index} className="text-sm mb-2">{shot}</p>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {scene.dialogue && (
                        <div>
                          <p className="font-bold text-sm uppercase tracking-wide mb-1">Dialogue:</p>
                          <p className="text-sm pl-4 border-l-2 border-red-300 italic font-medium">{scene.dialogue}</p>
                        </div>
                      )}
                      
                      {scene.soundscape && (
                        <div>
                          <p className="font-bold text-sm uppercase tracking-wide mb-1">Sound:</p>
                          <p className="text-sm pl-4 border-l-2 border-yellow-300">{scene.soundscape}</p>
                        </div>
                      )}
                      
                      {scene.superimposedText && scene.superimposedText.length > 0 && (
                        <div>
                          <p className="font-bold text-sm uppercase tracking-wide mb-1">Text Overlay:</p>
                          <div className="pl-4 border-l-2 border-indigo-300">
                            {scene.superimposedText.map((text, index) => (
                              <p key={index} className="text-sm mb-1 font-semibold">"{text}"</p>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Generated Video or Generate Video Section */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 text-center border-t border-gray-200">
            {/* Show generated video if it exists */}
            {(videoUrl || metadata?.videoUrl) ? (
              <div className="space-y-4">
                <div className="bg-white rounded-lg border-2 border-green-200 p-6">
                  <div className="flex items-center justify-center mb-4">
                    <Video className="w-8 h-8 text-green-600 mr-3" />
                    <h3 className="text-lg font-semibold text-green-800">✅ Video Generated Successfully!</h3>
                  </div>
                  
                  <div className="bg-gray-100 rounded-lg overflow-hidden">
                    <video 
                      controls 
                      className="w-full max-w-4xl mx-auto" 
                      style={{ maxHeight: '60vh' }}
                      preload="metadata"
                    >
                      <source src={videoUrl || metadata?.videoUrl} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                  
                  <div className="mt-4 flex justify-center space-x-4">
                    <a 
                      href={videoUrl || metadata?.videoUrl}
                      download
                      className="inline-flex items-center px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Video
                    </a>
                    
                    {onGenerateVideo && (
                      <button
                        onClick={onGenerateVideo}
                        disabled={isGeneratingVideo}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                      >
                        {isGeneratingVideo ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Regenerating...
                          </>
                        ) : (
                          <>
                            <Video className="w-4 h-4 mr-2" />
                            Regenerate Video
                          </>
                        )}
                      </button>
                    )}
                  </div>
                  
                  {metadata?.videoGeneratedAt && (
                    <p className="text-sm text-gray-600 mt-2">
                      Generated on {new Date(metadata.videoGeneratedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              /* Show generate button if no video exists */
              onGenerateVideo && (
                <div className="space-y-4">
                  <button
                    onClick={onGenerateVideo}
                    disabled={isGeneratingVideo}
                    className={`inline-flex items-center px-8 py-4 font-semibold rounded-lg transition-all duration-200 shadow-lg ${
                      isGeneratingVideo
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 transform hover:scale-105 hover:shadow-xl'
                    }`}
                  >
                    {isGeneratingVideo ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                        Generating Video...
                      </>
                    ) : (
                      <>
                        <Video className="w-5 h-5 mr-3" />
                        Generate Video for this Script
                      </>
                    )}
                  </button>
                  {isGeneratingVideo && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                      <p className="text-blue-800 text-sm font-medium mb-2">🎬 Video Generation in Progress</p>
                      <p className="text-blue-700 text-xs">
                        This process may take 5-10 minutes. We're creating images for each scene and generating videos using AI.
                        Please keep this tab open.
                      </p>
                    </div>
                  )}
                </div>
              )
            )}
          </div>

          {/* Footer */}
          <div className="bg-black text-white p-6 text-center">
            <p className="text-sm uppercase tracking-wider">End of Script</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const ScriptViewer: React.FC<ScriptViewerProps> = ({ 
  script, 
  isGeneratingVideo = false, 
  onGenerateVideo,
  videoUrl,
  metadata 
}) => {
  // Safety check - if script is null/undefined, show a fallback
  console.log(script)
  if (!script) {
    return (
      <div className="max-w-5xl mx-auto space-y-6 p-6 font-serif">
        <p className="text-center text-gray-500">No script data available</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 p-6 font-serif">
      {/* Title */}
      {script?.scriptTitle && (
        <h1 className="text-3xl font-bold text-center text-purple-900 tracking-wide">
          🎬 {script.scriptTitle}
        </h1>
      )}

      {/* Theme */}
      {script?.theme && (
        <p className="text-lg text-center italic text-gray-700">
          Theme: {script.theme}
        </p>
      )}

      {/* Podcast Details */}
      {script?.podcastDetails && (
        <Card className="bg-gradient-to-br from-purple-50 to-white border border-purple-200 shadow-md rounded-2xl">
          <CardContent className="p-4 space-y-2">
            <h2 className="text-xl font-semibold text-purple-800">
              Podcast Details
            </h2>
            <ul className="list-disc list-inside text-gray-700 text-base space-y-1">
              {Object.entries(script.podcastDetails).map(([key, value]) =>
                value ? (
                  <li key={key}>
                    <span className="font-medium capitalize">
                      {key.replace(/([A-Z])/g, " $1")}:
                    </span>{" "}
                    {value}
                  </li>
                ) : null
              )}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Scenes */}
      <div className="space-y-6">
        {script.scenes?.map((scene) => (
          <Card
            key={scene.sceneId}
            className="border border-gray-200 shadow-md rounded-2xl"
          >
            <CardContent className="p-5 space-y-4">
              <h3 className="text-lg font-bold text-gray-800">
                Scene {scene.sceneId}
              </h3>

              {/* Scene Setting */}
              {scene.setting && (
                <div className="bg-gray-50 p-3 rounded-lg border text-sm text-gray-600 space-y-1">
                  {scene.setting.background && (
                    <p>
                      <span className="font-medium">Background:</span>{" "}
                      {scene.setting.background}
                    </p>
                  )}
                  {scene.setting.cameraAngle && (
                    <p>
                      <span className="font-medium">Camera:</span>{" "}
                      {scene.setting.cameraAngle}
                    </p>
                  )}
                  {scene.setting.lighting && (
                    <p>
                      <span className="font-medium">Lighting:</span>{" "}
                      {scene.setting.lighting}
                    </p>
                  )}
                </div>
              )}

              {/* Dialogues */}
              <div className="space-y-3">
                {scene.dialogues?.map((d, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-white border border-gray-100 shadow-sm"
                  >
                    <p className="text-purple-900 font-semibold">
                      🎭 {d?.actor || 'Unknown Actor'}
                    </p>
                    <p className={`mt-1 text-gray-800 ${d?.style || ""}`}>
                      {d?.text || ''}
                    </p>
                    {d?.emotion && (
                      <p className="text-sm italic text-gray-600">
                        Emotion: {d.emotion}
                      </p>
                    )}
                    {d?.action && (
                      <p className="text-sm text-blue-700">
                        Action: {d.action}
                      </p>
                    )}
                  </div>
                )) || <p className="text-gray-500">No dialogues available</p>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Separator />
      
      {/* Generated Video or Generate Video Section */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 text-center rounded-lg border border-purple-100 my-6">
        {/* Show generated video if it exists */}
        {(videoUrl || metadata?.videoUrl) ? (
          <div className="space-y-4">
            <div className="bg-white rounded-lg border-2 border-green-200 p-6">
              <div className="flex items-center justify-center mb-4">
                <Video className="w-8 h-8 text-green-600 mr-3" />
                <h3 className="text-lg font-semibold text-green-800">✅ Video Generated Successfully!</h3>
              </div>
              
              <div className="bg-gray-100 rounded-lg overflow-hidden">
                <video 
                  controls 
                  className="w-full max-w-4xl mx-auto" 
                  style={{ maxHeight: '60vh' }}
                  preload="metadata"
                >
                  <source src={videoUrl || metadata?.videoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
              
              <div className="mt-4 flex justify-center space-x-4">
                <a 
                  href={videoUrl || metadata?.videoUrl}
                  download
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Video
                </a>
                
                {onGenerateVideo && (
                  <button
                    onClick={onGenerateVideo}
                    disabled={isGeneratingVideo}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                  >
                    {isGeneratingVideo ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Regenerating...
                      </>
                    ) : (
                      <>
                        <Video className="w-4 h-4 mr-2" />
                        Regenerate Video
                      </>
                    )}
                  </button>
                )}
              </div>
              
              {metadata?.videoGeneratedAt && (
                <p className="text-sm text-gray-600 mt-2">
                  Generated on {new Date(metadata.videoGeneratedAt).toLocaleString()}
                </p>
              )}
            </div>
          </div>
        ) : (
          /* Show generate button if no video exists */
          <div className="space-y-4">
            <button
              onClick={onGenerateVideo || (() => {
                console.log('Generate video for script:', script);
                alert('Video generation feature coming soon! This will create a video based on your script.');
              })}
              disabled={isGeneratingVideo}
              className={`inline-flex items-center px-8 py-4 font-semibold rounded-lg transition-all duration-200 shadow-lg ${
                isGeneratingVideo
                  ? 'bg-gray-400 cursor-not-allowed text-white'
                  : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 transform hover:scale-105 hover:shadow-xl'
              }`}
            >
              {isGeneratingVideo ? (
                <>
                  <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                  Generating Video...
                </>
              ) : (
                <>
                  <Video className="w-5 h-5 mr-3" />
                  Generate Video for this Script
                </>
              )}
            </button>
            {isGeneratingVideo && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                <p className="text-blue-800 text-sm font-medium mb-2">🎬 Video Generation in Progress</p>
                <p className="text-blue-700 text-xs">
                  This process may take 5-10 minutes. We're creating images for each scene and generating videos using AI.
                  Please keep this tab open.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
      
      <p className="text-center text-sm text-gray-500 italic">
        ✨ Script generated dynamically from AI ✨
      </p>
    </div>
  );
};

// Wrapper component to handle scripts from ScriptGroup
interface ScriptGroupScript {
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
  brand_name?: string;
  product?: string;
  formattedDate?: string;
}

interface AdScriptViewerProps {
  script: ScriptGroupScript;
  isGeneratingVideo?: boolean;
  onGenerateVideo?: () => void;
  videoUrl?: string;
  metadata?: {
    videoUrl?: string;
    videoGenerated?: boolean;
    videoGeneratedAt?: string;
    [key: string]: unknown;
  };
}

const AdScriptViewer: React.FC<AdScriptViewerProps> = ({ 
  script, 
  isGeneratingVideo = false, 
  onGenerateVideo,
  videoUrl,
  metadata 
}) => {
  // Function to detect and parse JSON content (same as ScriptDisplay)
  const parseScriptContent = (content: string) => {
    try {
      let scriptContent = content;
      
      // Check if the content is wrapped in markdown code blocks
      if (scriptContent.includes('```json')) {
        // Extract JSON from markdown code blocks
        const jsonMatch = scriptContent.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          scriptContent = jsonMatch[1].trim();
        }
      } else if (scriptContent.includes('```')) {
        // Handle generic code blocks
        const codeMatch = scriptContent.match(/```\s*([\s\S]*?)\s*```/);
        if (codeMatch) {
          scriptContent = codeMatch[1].trim();
        }
      }
      
      const parsed = JSON.parse(scriptContent);
      
      // Check if it's the new videoAdScript format
      if (parsed.videoAdScript) {
        return parsed;
      }
      
      // Check if it's the old format that ScriptViewer expects
      if (parsed.scriptTitle || parsed.scenes || Array.isArray(parsed)) {
        return parsed;
      }
      
      return null;
    } catch {
      console.log('Content is not valid JSON, displaying as text');
      return null;
    }
  };

  const scriptData = parseScriptContent(script.content);

  // If it's the new videoAdScript format, render it like ScriptDisplay
  if (scriptData && scriptData.videoAdScript) {
    return (
      <VideoAdScriptViewer 
        scriptData={scriptData}
        isGeneratingVideo={isGeneratingVideo}
        onGenerateVideo={onGenerateVideo}
        videoUrl={videoUrl || script.metadata?.videoUrl}
        metadata={metadata || script.metadata}
      />
    );
  }

  // If it's the old JSON format, use the existing ScriptViewer
  if (scriptData) {
    return (
      <ScriptViewer 
        script={scriptData} 
        isGeneratingVideo={isGeneratingVideo}
        onGenerateVideo={onGenerateVideo}
        videoUrl={videoUrl || script.metadata?.videoUrl}
        metadata={metadata || script.metadata}
      />
    );
  }

  // Fallback to plain text display
  return (
    <div className="max-w-5xl mx-auto space-y-6 p-6 font-serif">
      <div className="whitespace-pre-wrap text-gray-800">
        {script.content}
      </div>
      
      {/* Generated Video or Generate Video Section */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 text-center rounded-lg border border-purple-100 my-6">
        {/* Show generated video if it exists */}
        {(videoUrl || metadata?.videoUrl || script.metadata?.videoUrl) ? (
          <div className="space-y-4">
            <div className="bg-white rounded-lg border-2 border-green-200 p-6">
              <div className="flex items-center justify-center mb-4">
                <Video className="w-8 h-8 text-green-600 mr-3" />
                <h3 className="text-lg font-semibold text-green-800">✅ Video Generated Successfully!</h3>
              </div>
              
              <div className="bg-gray-100 rounded-lg overflow-hidden">
                <video 
                  controls 
                  className="w-full max-w-4xl mx-auto" 
                  style={{ maxHeight: '60vh' }}
                  preload="metadata"
                >
                  <source src={videoUrl || metadata?.videoUrl || script.metadata?.videoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
              
              <div className="mt-4 flex justify-center space-x-4">
                <a 
                  href={videoUrl || metadata?.videoUrl || script.metadata?.videoUrl}
                  download
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Video
                </a>
                
                {onGenerateVideo && (
                  <button
                    onClick={onGenerateVideo}
                    disabled={isGeneratingVideo}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                  >
                    {isGeneratingVideo ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Regenerating...
                      </>
                    ) : (
                      <>
                        <Video className="w-4 h-4 mr-2" />
                        Regenerate Video
                      </>
                    )}
                  </button>
                )}
              </div>
              
              {(metadata?.videoGeneratedAt || script.metadata?.videoGeneratedAt) && (
                <p className="text-sm text-gray-600 mt-2">
                  Generated on {new Date(metadata?.videoGeneratedAt || script.metadata?.videoGeneratedAt).toLocaleString()}
                </p>
              )}
            </div>
          </div>
        ) : (
          /* Show generate button if no video exists */
          <div className="space-y-4">
            <button
              onClick={onGenerateVideo || (() => {
                console.log('Generate video for script:', script);
                alert('Video generation feature coming soon! This will create a video based on your script.');
              })}
              disabled={isGeneratingVideo}
              className={`inline-flex items-center px-8 py-4 font-semibold rounded-lg transition-all duration-200 shadow-lg ${
                isGeneratingVideo
                  ? 'bg-gray-400 cursor-not-allowed text-white'
                  : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 transform hover:scale-105 hover:shadow-xl'
              }`}
            >
              {isGeneratingVideo ? (
                <>
                  <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                  Generating Video...
                </>
              ) : (
                <>
                  <Video className="w-5 h-5 mr-3" />
                  Generate Video for this Script
                </>
              )}
            </button>
            {isGeneratingVideo && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                <p className="text-blue-800 text-sm font-medium mb-2">🎬 Video Generation in Progress</p>
                <p className="text-blue-700 text-xs">
                  This process may take 5-10 minutes. We're creating images for each scene and generating videos using AI.
                  Please keep this tab open.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ScriptViewer;
export { AdScriptViewer };