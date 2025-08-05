/**
 * Utility functions for debugging Google OAuth issues
 */

/**
 * Checks if the Google OAuth client is properly configured
 * @returns {boolean} True if configured correctly, false otherwise
 */
export const checkGoogleOAuthConfig = (): { isConfigured: boolean; issues: string[]; clientId: string | null; envVars: Record<string, string> } => {
  // Get all VITE_ env vars (for debugging)
  const envVars: Record<string, string> = {};
  Object.keys(import.meta.env).forEach(key => {
    if (key.startsWith('VITE_')) {
      // Mask sensitive values
      const value = import.meta.env[key];
      envVars[key] = key.includes('KEY') || key.includes('SECRET') || key.includes('ID') 
        ? `${value.substring(0, 5)}...${value.substring(value.length - 5)}` 
        : value;
    }
  });
  
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const issues: string[] = [];
  
  if (!clientId) {
    issues.push('No Google client ID found in environment variables');
  } else if (clientId === 'YOUR_GOOGLE_CLIENT_ID' || clientId.includes('your-client-id')) {
    issues.push('Google client ID has placeholder value and needs to be replaced with actual client ID');
  }
  
  // Check if we're running on a supported origin
  const currentOrigin = window.location.origin;
  console.log(`Current origin: ${currentOrigin}`);
  
  // Common development origins
  const supportedDevOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    'http://127.0.0.1:5175'
  ];
  
  // Log warning if we're on a development origin that might not be configured
  if (
    (currentOrigin.includes('localhost') || currentOrigin.includes('127.0.0.1')) && 
    !supportedDevOrigins.includes(currentOrigin)
  ) {
    issues.push(`Current origin "${currentOrigin}" may not be configured in Google Cloud Console`);
  }
  
  return {
    isConfigured: issues.length === 0,
    issues,
    clientId,
    envVars
  };
};

/**
 * Checks for common browser issues that can affect Google OAuth
 * @returns {object} Object containing potential browser issues
 */
export const checkBrowserIssues = (): { issues: string[] } => {
  const issues: string[] = [];
  
  // Check if third-party cookies are likely blocked
  // This is a heuristic and not 100% reliable
  try {
    const cookieEnabled = navigator.cookieEnabled;
    if (!cookieEnabled) {
      issues.push('Cookies are disabled in the browser');
    }
  } catch (e) {
    console.error('Error checking cookie status:', e);
  }
  
  // Check if we're in an iframe
  if (window !== window.top) {
    issues.push('Application is running in an iframe, which may cause Google OAuth issues');
  }
  
  // Check for incognito mode (not 100% reliable)
  try {
    // Using type assertions for non-standard browser APIs
    const windowWithFS = window as unknown as { 
      RequestFileSystem?: (type: number, size: number, successCallback: () => void, errorCallback: () => void) => void; 
      webkitRequestFileSystem?: (type: number, size: number, successCallback: () => void, errorCallback: () => void) => void;
      TEMPORARY?: number;
    };
    
    const fs = windowWithFS.RequestFileSystem || windowWithFS.webkitRequestFileSystem;
    if (fs && typeof windowWithFS.TEMPORARY === 'number') {
      fs(windowWithFS.TEMPORARY, 100, 
        () => {}, // Not in incognito
        () => {
          issues.push('Browser may be in incognito/private mode, which can affect third-party cookies');
        }
      );
    }
  } catch (e) {
    console.error('Error checking incognito mode:', e);
  }
  
  return { issues };
};

/**
 * Logs debugging information for Google OAuth
 */
export const logGoogleOAuthDebugInfo = (): void => {
  console.group('%c Google OAuth Debug Info', 'color: #4285F4; font-weight: bold;');
  
  // Log environment
  console.log('Environment:', import.meta.env.MODE);
  console.log('Origin:', window.location.origin);
  
  // Check configuration
  const configCheck = checkGoogleOAuthConfig();
  console.log('Configuration check:', configCheck.isConfigured ? '✅ OK' : '❌ Issues found');
  if (configCheck.issues.length > 0) {
    console.log('Configuration issues:', configCheck.issues);
  }
  
  // Check browser issues
  const browserCheck = checkBrowserIssues();
  console.log('Browser check:', browserCheck.issues.length === 0 ? '✅ OK' : '❌ Issues found');
  if (browserCheck.issues.length > 0) {
    console.log('Browser issues:', browserCheck.issues);
  }
  
  console.log('User agent:', navigator.userAgent);
  
  console.groupEnd();
  
  // Return a message to display to users
  if (configCheck.issues.length > 0 || browserCheck.issues.length > 0) {
    return `Potential Google login issues detected. Check browser console for details.`;
  }
  
  return undefined;
};

// Define error type for better type safety
type GoogleLoginError = Error | string | unknown;

// Export a function that can be called when login fails
export const handleGoogleLoginFailure = (error: GoogleLoginError): string => {
  console.error('Google login failure:', error);
  
  // Log detailed debug info
  logGoogleOAuthDebugInfo();
  
  // Match common error messages and provide helpful responses
  if (typeof error === 'string') {
    if (error.includes('origin_mismatch') || error.includes('origin is not allowed')) {
      return 'Login failed: Your current URL is not authorized for Google login. Please contact support.';
    }
    
    if (error.includes('popup_closed_by_user')) {
      return 'Login window was closed before authentication was completed. Please try again.';
    }
    
    if (error.includes('popup_blocked')) {
      return 'Login popup was blocked by your browser. Please enable popups for this site and try again.';
    }
    
    if (error.includes('invalid_client')) {
      return 'Login failed due to invalid client configuration. Please contact support.';
    }
  }
  
  // Generic error message as fallback
  return 'Google login failed. Please try again or use email/password login.';
};

export default {
  checkGoogleOAuthConfig,
  checkBrowserIssues,
  logGoogleOAuthDebugInfo,
  handleGoogleLoginFailure
};
