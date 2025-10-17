import React, { useState, useEffect } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { buildApiUrl } from '../config/api';
import { logGoogleOAuthDebugInfo, handleGoogleLoginFailure } from '../utils/googleAuthDebug';
import { User, shouldRedirectToSubscription } from '../utils/userTypes';

interface EnhancedGoogleLoginProps {
  buttonText?: string;
  className?: string;
}

const EnhancedGoogleLogin: React.FC<EnhancedGoogleLoginProps> = ({ 
  buttonText = "Sign in with Google", 
  className = "w-full flex justify-center items-center py-2 px-4 border border-purple-600 rounded-md shadow-sm text-sm font-medium text-gray-600 bg-white hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
}) => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Run debug logging when component mounts
  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    
    // Log environment variables to diagnose the issue
    console.log('Google OAuth client ID check:', {
      clientId: clientId ? `${clientId.substring(0, 10)}...` : 'NOT SET',
      mode: import.meta.env.MODE,
    });
    
    // Show error if client ID is missing
    if (!clientId) {
      setError('Google client ID is not configured. Please check environment variables.');
    }
    
    logGoogleOAuthDebugInfo();
  }, []);

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);
      setError(null);
      
      try {
        console.log('Google login successful, sending token to backend...');
        console.log(tokenResponse.access_token);
        // Send the token to your backend
        const response = await fetch(buildApiUrl('api/auth/google'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token: tokenResponse.access_token // Using access_token from Google response
          })
        });

        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to authenticate with Google');
        }
        
        // Save the token and user data
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Check subscription status and redirect accordingly
        const user = data.user as User;
        const redirectPath = data.redirectTo && typeof data.redirectTo === 'string'
          ? data.redirectTo
          : shouldRedirectToSubscription(user)
            ? '/subscription'
            : '/dashboard';

        console.log(`Google login successful. Redirecting to ${redirectPath}`);
        navigate(redirectPath);
      } catch (err) {
        console.error('Google login error:', err);
        
        // Use our specialized error handler
        const errorMessage = handleGoogleLoginFailure(err);
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    onError: (errorResponse) => {
      console.error('Google login error:', errorResponse);
      
      // Use our specialized error handler
      const errorMessage = handleGoogleLoginFailure(errorResponse);
      setError(errorMessage);
    },
  });

  // Check if client ID is configured
  const clientIdMissing = !import.meta.env.VITE_GOOGLE_CLIENT_ID;

  return (
    <div className="mt-4">
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
          {clientIdMissing && (
            <p className="text-red-600 mt-2 text-sm">
              Missing Google client ID. Please add VITE_GOOGLE_CLIENT_ID to your .env or .env.local file.
            </p>
          )}
        </div>
      )}
      
      <button 
        onClick={() => login()} 
        disabled={isLoading || clientIdMissing}
        className={className}
      >
        {isLoading ? (
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : (
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
            <path fill="none" d="M1 1h22v22H1z" />
          </svg>
        )}
        {buttonText}
      </button>
    </div>
  );
};

export default EnhancedGoogleLogin;
