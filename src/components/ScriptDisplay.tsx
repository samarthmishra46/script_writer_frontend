import React, { useState } from 'react';
import { Copy, Download, Eye, EyeOff, CheckCircle, FileText, Video, User, Lightbulb, Camera } from 'lucide-react';

interface ScriptDisplayProps {
  script: string;
  productName?: string;
}

const ScriptDisplay: React.FC<ScriptDisplayProps> = ({ script, productName }) => {
  const [copied, setCopied] = useState(false);
  const [showRaw, setShowRaw] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(script);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const downloadScript = () => {
    const element = document.createElement('a');
    const file = new Blob([script], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${productName || 'ad-script'}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const formatScript = (scriptText: string) => {
    // Split the script into sections
    const sections = scriptText.split('\n\n').filter(section => section.trim());
    
    return sections.map((section, index) => {
      const trimmedSection = section.trim();
      
      // Check for different section types and format accordingly
      if (trimmedSection.startsWith('**') && trimmedSection.includes('**')) {
        // Header section (e.g., "**Ad Script for PRODUCT**")
        return (
          <div key={index} className="mb-6">
            <h1 className="text-2xl font-bold text-black mb-4 border-b-2 border-gray-300 pb-2 text-center">
              {trimmedSection.replace(/\*\*/g, '')}
            </h1>
          </div>
        );
      } else if (trimmedSection.startsWith('**Visual:') || trimmedSection.startsWith('**Narrator:') || trimmedSection.startsWith('**Actor:')) {
        // Visual/Narrator/Actor sections
        const [type, ...content] = trimmedSection.split(':');
        const typeText = type.replace(/\*\*/g, '');
        const contentText = content.join(':').trim();
        
        let icon = <Video className="w-5 h-5" />;
        let bgColor = 'bg-blue-50';
        let borderColor = 'border-blue-200';
        let textColor = 'text-blue-800';
        
        if (typeText === 'Visual') {
          icon = <Camera className="w-5 h-5" />;
          bgColor = 'bg-green-50';
          borderColor = 'border-green-200';
          textColor = 'text-green-800';
        } else if (typeText === 'Narrator') {
          icon = <User className="w-5 h-5" />;
          bgColor = 'bg-purple-50';
          borderColor = 'border-purple-200';
          textColor = 'text-purple-800';
        } else if (typeText === 'Actor') {
          icon = <User className="w-5 h-5" />;
          bgColor = 'bg-orange-50';
          borderColor = 'border-orange-200';
          textColor = 'text-orange-800';
        }
        
        return (
          <div key={index} className={`mb-4 p-4 rounded-lg border-l-4 ${borderColor} ${bgColor}`}>
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-full ${bgColor} ${textColor} flex-shrink-0`}>
                {icon}
              </div>
              <div className="flex-1">
                <h3 className={`font-bold text-black mb-2 text-center`}>{typeText}</h3>
                <p className="text-gray-700 leading-relaxed italic">{contentText}</p>
              </div>
            </div>
          </div>
        );
      } else if (trimmedSection.includes('**Type of actor:') || trimmedSection.includes('**Angle:')) {
        // Technical details section
        const [key, ...value] = trimmedSection.split(':');
        const keyText = key.replace(/\*\*/g, '').trim();
        const valueText = value.join(':').trim();
        
        return (
          <div key={index} className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-gray-100 text-gray-600 flex-shrink-0">
                <Lightbulb className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-black mb-1 text-center">{keyText}</h3>
                <p className="text-gray-700 italic">{valueText}</p>
              </div>
            </div>
          </div>
        );
      } else {
        // Regular text section
        return (
          <div key={index} className="mb-4">
            <p className="text-gray-700 leading-relaxed italic">{trimmedSection}</p>
          </div>
        );
      }
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-white" />
            <h2 className="text-xl font-bold text-white">Generated Ad Script</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowRaw(!showRaw)}
              className="flex items-center gap-2 px-3 py-1.5 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors text-sm"
            >
              {showRaw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showRaw ? 'Formatted' : 'Raw'}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {showRaw ? (
          // Raw text view
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <pre className="whitespace-pre-wrap text-gray-800 font-mono text-sm leading-relaxed">
              {script}
            </pre>
          </div>
        ) : (
          // Formatted view
          <div className="space-y-4">
            {formatScript(script)}
          </div>
        )}

        {/* Action buttons */}
        <div className="mt-6 flex flex-wrap gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy Script'}
          </button>
          
          <button
            onClick={downloadScript}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScriptDisplay; 