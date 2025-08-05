import React, { useEffect, useState } from 'react';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// Define type for Google user data
interface GoogleUserData {
  sub: string;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  email: string;
  email_verified: boolean;
  locale: string;
}

const GoogleAuthTester: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [userData, setUserData] = useState<GoogleUserData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const login = useGoogleLogin({
    onSuccess: async (response) => {
      setError(null);
      setToken(response.access_token);
      setLoading(true);

      try {
        const userInfoResponse = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo`, {
          headers: {
            Authorization: `Bearer ${response.access_token}`,
          },
        });

        if (!userInfoResponse.ok) {
          throw new Error('Failed to fetch user data from Google');
        }

        const userData = await userInfoResponse.json();
        setUserData(userData);
      } catch (err: unknown) {
        // Handle the error with type safety
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred');
        }
      } finally {
        setLoading(false);
      }
    },
    onError: (error) => {
      setError(`Google login failed: ${error}`);
    }
  });

  useEffect(() => {
    // Check if client ID is configured
    if (!clientId) {
      setError('Google Client ID is not configured. Check your .env.local file.');
    } else if (clientId.includes('your-client-id')) {
      setError('You need to replace the placeholder with your actual Google Client ID');
    }
  }, []);

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white rounded-lg border border-gray-200 shadow-md mt-10">
      <h1 className="text-2xl font-bold mb-6">Google OAuth Test Tool</h1>

      {error && (
        <div className="p-4 mb-6 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Configuration</h2>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p><span className="font-medium">Client ID:</span> {clientId ? 
            <span className="font-mono text-sm">
              {clientId.substring(0, 12)}...{clientId.substring(clientId.length - 25)}
            </span> : 
            <span className="text-red-500 font-bold">NOT SET</span>}
          </p>
          
          <details className="mt-2">
            <summary className="text-sm text-gray-500 cursor-pointer">Show full Client ID</summary>
            <div className="mt-2 p-2 bg-gray-100 rounded font-mono text-xs break-all">
              {clientId || 'Not configured'}
            </div>
          </details>
          
          <p className="mt-3"><span className="font-medium">Environment:</span> {import.meta.env.MODE}</p>
          <p><span className="font-medium">Current Origin:</span> {window.location.origin}</p>
          
          <div className="mt-4 border-t border-gray-200 pt-3">
            <p className="font-medium text-sm">Environment Variables:</p>
            {Object.entries(import.meta.env).filter(([key]) => key.startsWith('VITE_')).map(([key, value]) => (
              <div key={key} className="text-xs mt-1">
                <span className="font-mono">{key}:</span> {
                  typeof value === 'string' && key.includes('CLIENT_ID') ? 
                    `${String(value).substring(0, 8)}...${String(value).substring(String(value).length - 15)}` : 
                    key.includes('KEY') || key.includes('SECRET') ? '[masked]' : String(value)
                }
              </div>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={() => login()}
        disabled={loading}
        className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center"
      >
        {loading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Testing...
          </>
        ) : (
          <>
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="#ffffff"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#ffffff"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#ffffff"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#ffffff"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
              <path fill="none" d="M1 1h22v22H1z" />
            </svg>
            Test Google Login
          </>
        )}
      </button>

      {token && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">Access Token</h2>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm font-mono break-all">{token}</p>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            This token can be used for testing with the backend test-google-auth.js script.
          </p>
        </div>
      )}

      {userData && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">User Data</h2>
          <div className="bg-gray-50 p-4 rounded-lg flex">
            <img 
              src={userData.picture} 
              alt="Profile" 
              className="w-16 h-16 rounded-full mr-4" 
            />
            <div>
              <p><span className="font-medium">Name:</span> {userData.name}</p>
              <p><span className="font-medium">Email:</span> {userData.email}</p>
              <p><span className="font-medium">Google ID:</span> {userData.sub}</p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-2">Troubleshooting Tips</h3>
        <ul className="list-disc list-inside space-y-2 text-sm text-blue-800">
          <li><strong>OAuth client was not found (Error 401: invalid_client):</strong>
            <ul className="list-circle ml-6 mt-1">
              <li>Verify your Client ID exactly matches what's in Google Cloud Console</li>
              <li>Make sure the OAuth Client is enabled in Google Cloud Console</li>
              <li>Check that you're using the correct project</li>
            </ul>
          </li>
          <li><strong>Origin mismatch errors:</strong>
            <ul className="list-circle ml-6 mt-1">
              <li>Add <code className="bg-blue-100 px-1">{window.location.origin}</code> to Authorized JavaScript Origins in Google Cloud Console</li>
              <li>For local development, also add: <code className="bg-blue-100 px-1">http://localhost:5173</code>, <code className="bg-blue-100 px-1">http://localhost:3000</code></li>
            </ul>
          </li>
          <li><strong>Other common issues:</strong>
            <ul className="list-circle ml-6 mt-1">
              <li>Clear browser cookies and cache</li>
              <li>Try a different browser</li>
              <li>Make sure third-party cookies are enabled</li>
              <li>If using multiple .env files, check which one has precedence</li>
            </ul>
          </li>
        </ul>
        
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-100 rounded">
          <p className="text-sm font-medium text-yellow-800">
            Important: If you're seeing <strong>"OAuth client was not found"</strong>, you need to:
          </p>
          <ol className="list-decimal ml-6 mt-2 text-sm text-yellow-800">
            <li>Verify the Client ID in the Google Cloud Console</li>
            <li>Make sure you're using the same Google account that created the OAuth client</li>
            <li>Ensure the OAuth client is in an active project</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

const GoogleAuthTestPage: React.FC = () => {
  return (
    <GoogleOAuthProvider clientId={clientId || ''}>
      <GoogleAuthTester />
    </GoogleOAuthProvider>
  );
};

export default GoogleAuthTestPage;
