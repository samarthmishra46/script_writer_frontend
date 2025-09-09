import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { GoogleOAuthProvider } from '@react-oauth/google';
import ReactPixel from 'react-facebook-pixel';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import CreateScriptWizard from './pages/CreateScriptWizard';
import GeneratedScripts from './pages/GeneratedScripts';
import ScriptView from './pages/ScriptView';
import NotFound from './pages/NotFound';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Subscription from './pages/Subscription';
import SubscriptionCallback from './pages/SubscriptionCallback';
import Pricing from './pages/Pricing';
import ContactUs from './pages/ContactUs';
import AboutUs from './pages/AboutUs';
import GoogleAuthTestPage from './pages/GoogleAuthTestPage';
import ProtectedRoute from './components/ProtectedRoute';
import ScriptGroup from './pages/ScriptGroup';
import Settings from './pages/Settings';
import { BrandsProvider } from './context/BrandsContext';
import { OrderTimerProvider } from "./context/OrderTimerContext"; // <-- 1. IMPORT



function App() {

  //Import Mixpanel SDK

// Near entry of your product, init Mixpanel

  // Use environment variable for client ID
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  // Meta Pixel ID from env
  const pixelId = import.meta.env.VITE_META_PIXEL_ID || '';

  useEffect(() => {
    if (pixelId) {
      const options = {
        autoConfig: true, // set pixel's autoConfig
        debug: import.meta.env.DEV, // enable logs in development mode
      };
      ReactPixel.init(pixelId, undefined, options);
      setTimeout(() => {
    if (typeof window.fbq === "function") {
      console.log("✅ fbq loaded, firing pageView");
      ReactPixel.pageView();
    } else {
      console.error("❌ fbq not available");
    }
  }, 1000);

      console.log('Meta Pixel initialized with ID:', pixelId);
    } else {
      console.warn('Meta Pixel ID is missing. Set VITE_META_PIXEL_ID in .env file.');
    }
  }, [pixelId]);

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <BrandsProvider>
        <OrderTimerProvider>
          <Router>
            <div className="App">
              <Toaster 
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                  },
                }}
              />
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/contact" element={<ContactUs />} />
                <Route path="/about" element={<AboutUs />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/google-auth-test" element={<GoogleAuthTestPage />} />
                <Route path="*" element={<NotFound />} />

                {/* Protected Routes */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/create-script" element={
                  <ProtectedRoute>
                    <CreateScriptWizard />
                  </ProtectedRoute>
                } />
                <Route path="/scripts" element={
                  <ProtectedRoute>
                    <GeneratedScripts />
                  </ProtectedRoute>
                } />
                <Route path="/script/:scriptId" element={
                  <ProtectedRoute>
                    <ScriptView />
                  </ProtectedRoute>
                } />
                <Route path="/subscription" element={<Subscription />} />
                <Route path="/subscription/callback" element={
                  <ProtectedRoute>
                    <SubscriptionCallback />
                  </ProtectedRoute>
                } />
                <Route path="/script-group/:brandName/:product/:scriptId" element={
                  <ProtectedRoute>
                    <ScriptGroup />
                  </ProtectedRoute>
                } />
                <Route path="/settings" element={<Settings />} />

                {/* Redirect unknown routes to dashboard */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </div>
          </Router>
        </OrderTimerProvider>
      </BrandsProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
