import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

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

 const ScriptViewer: React.FC<{ script: Script }> = ({ script }) => {
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

const AdScriptViewer: React.FC<{ script: ScriptGroupScript }> = ({ script }) => {
  // Function to detect and parse JSON content
  const parseScriptContent = (content: string) => {
    try {
      // Check if content contains JSON-like structure
      if (content.includes('{') && content.includes('}')) {
        // Extract JSON from markdown code blocks if present
        const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[1]);
        }
        
        // Try to parse directly if it looks like JSON
        if (content.trim().startsWith('{')) {
          return JSON.parse(content);
        }
      }
      return null;
    } catch {
      console.log('Content is not valid JSON, displaying as text');
      return null;
    }
  };

  const scriptData = parseScriptContent(script.content);
  const isJsonFormat = scriptData !== null;

  if (isJsonFormat && scriptData) {
    return <ScriptViewer script={scriptData} />;
  }

  // Fallback to plain text display
  return (
    <div className="max-w-5xl mx-auto space-y-6 p-6 font-serif">
      <div className="whitespace-pre-wrap text-gray-800">
        {script.content}
      </div>
    </div>
  );
};

export default ScriptViewer;
export { AdScriptViewer };