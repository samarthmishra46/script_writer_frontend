import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, AlertCircle } from 'lucide-react';
import { buildApiUrl } from '../config/api';

interface LocationState {
  adId: string;
  brandName: string;
  productName: string;
  angles: string[];
  adType: string;
}

interface GenerationStatus {
  adId: string;
  status: 'pending' | 'generating' | 'completed' | 'failed' | 'partial';
  generatedCount: number;
  totalGenerated: number;
  totalFailed: number;
  errors: Array<{ angle: string; message: string }>;
}

const GenerationProgress: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;

  const [status, setStatus] = useState<GenerationStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progressMessages, setProgressMessages] = useState<string[]>([
    'Initializing creative engine...',
  ]);

  const pollStatus = useCallback(async () => {
    if (!state?.adId) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(buildApiUrl(`api/ads/${state.adId}/status`), {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch status');
      }

      const result = await response.json();
      setStatus(result.data);

      // Update progress messages based on status
      if (result.data.status === 'generating') {
        const messages = [
          'Analyzing brand identity...',
          'Crafting visual narratives...',
          'Generating creative variations...',
          'Applying artistic styles...',
          'Optimizing for engagement...',
          'Fine-tuning compositions...',
          'Almost there...',
        ];
        const messageIndex = Math.min(result.data.generatedCount, messages.length - 1);
        setProgressMessages(prev => {
          if (!prev.includes(messages[messageIndex])) {
            return [...prev, messages[messageIndex]];
          }
          return prev;
        });
      }

      // Navigate to swiper when complete
      if (result.data.status === 'completed' || result.data.status === 'partial') {
        setTimeout(() => {
          navigate(`/swipe-images/${state.adId}`, {
            state: {
              adId: state.adId,
              brandName: state.brandName,
              productName: state.productName,
            }
          });
        }, 1500);
      }

      if (result.data.status === 'failed') {
        setError('Generation failed. Please try again.');
      }
    } catch (err) {
      console.error('Status poll error:', err);
    }
  }, [state, navigate]);

  useEffect(() => {
    if (!state?.adId) {
      navigate('/dashboard');
      return;
    }

    // Initial poll
    pollStatus();

    // Poll every 3 seconds
    const interval = setInterval(pollStatus, 3000);

    return () => clearInterval(interval);
  }, [state, pollStatus, navigate]);

  const totalExpected = (state?.angles?.length || 1) * 4;
  const progress = status ? (status.generatedCount / totalExpected) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 text-center max-w-lg mx-auto">
        {/* Animated Progress Circle */}
        <div className="relative w-64 h-64 mx-auto mb-12">
          {/* Outer Glow */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 opacity-20 blur-xl animate-pulse" />
          
          {/* Main Circle Container */}
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            {/* Background Circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="2"
            />
            
            {/* Animated Background Ring */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="url(#progressGradient)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="283"
              strokeDashoffset={283 - (283 * progress) / 100}
              className="transition-all duration-1000 ease-out"
            />
            
            {/* Sparkle Effects - Multiple rotating dots */}
            {[0, 60, 120, 180, 240, 300].map((rotation, i) => (
              <circle
                key={i}
                cx="50"
                cy="5"
                r="1.5"
                fill={i % 2 === 0 ? '#a855f7' : '#3b82f6'}
                className="origin-center"
                style={{
                  transform: `rotate(${rotation}deg)`,
                  animation: `orbit ${3 + i * 0.5}s linear infinite`,
                  transformOrigin: '50px 50px',
                }}
              />
            ))}
            
            {/* Gradient Definition */}
            <defs>
              <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#a855f7">
                  <animate attributeName="stop-color" values="#a855f7;#3b82f6;#a855f7" dur="3s" repeatCount="indefinite" />
                </stop>
                <stop offset="50%" stopColor="#6366f1">
                  <animate attributeName="stop-color" values="#6366f1;#a855f7;#6366f1" dur="3s" repeatCount="indefinite" />
                </stop>
                <stop offset="100%" stopColor="#3b82f6">
                  <animate attributeName="stop-color" values="#3b82f6;#a855f7;#3b82f6" dur="3s" repeatCount="indefinite" />
                </stop>
              </linearGradient>
            </defs>
          </svg>

          {/* Center Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Sparkles className="w-12 h-12 text-white mb-2 animate-pulse" />
            <span className="text-4xl font-bold text-white">
              {Math.round(progress)}%
            </span>
            <span className="text-sm text-white/60">
              {status?.generatedCount || 0} / {totalExpected}
            </span>
          </div>
        </div>

        {/* Status Text */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">
            {status?.status === 'completed' ? 'Generation Complete!' : 
             status?.status === 'failed' ? 'Generation Failed' :
             'Creating Your Ads'}
          </h1>
          <p className="text-white/70">
            {state?.brandName && state?.productName 
              ? `${state.brandName} • ${state.productName}`
              : 'Please wait while we generate your ads'}
          </p>
        </div>

        {/* Progress Messages */}
        <div className="space-y-2 max-h-32 overflow-hidden">
          {progressMessages.slice(-4).map((message, index) => (
            <p 
              key={index}
              className={`text-sm transition-all duration-500 ${
                index === progressMessages.slice(-4).length - 1 
                  ? 'text-white/90' 
                  : 'text-white/40'
              }`}
            >
              {message}
            </p>
          ))}
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-8 p-4 bg-red-500/20 border border-red-500/30 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="text-red-200">{error}</span>
          </div>
        )}

        {/* Angles Being Generated */}
        {state?.angles && state.angles.length > 0 && (
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {state.angles.map((angle, index) => (
              <span
                key={angle}
                className="px-3 py-1 bg-white/10 rounded-full text-xs text-white/70"
                style={{
                  animationDelay: `${index * 0.1}s`,
                }}
              >
                {angle.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* CSS Animation Keyframes */}
      <style>{`
        @keyframes orbit {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default GenerationProgress;
