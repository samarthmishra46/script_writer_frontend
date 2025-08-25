import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { useEffect } from 'react';
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
import { OrderTimerProvider } from "./context/OrderTimerContext";

// 🔹 Component to listen for route changes and fire Meta Pixel PageView
function PixelRouteTracker() {
  const location = useLocation();

  useEffect(() => {
    ReactPixel.pageView(); // Fire page view event
    console.log("Meta Pixel pageView:", location.pathname);
  }, [location]);

  return null;
}

function App() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  console.log(`Google OAuth Client ID ${googleClientId ? 'is configured' : 'is MISSING'}`);

  // 🔹 Initialize Meta Pixel once
  useEffect(() => {
    ReactPixel.init('1157721002081546'); // Replace with your real Pixel ID
    ReactPixel.pageView(); // Track first load
  }, []);

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <BrandsProvider>
        <OrderTimerProvider>
          <Router>
            <PixelRouteTracker /> {/* Tracks route changes */}
            <div className="App">
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: { background: '#363636', color: '#fff' },
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
                  <ProtectedRoute><Dashboard /></ProtectedRoute>
                } />
                <Route path="/create-script" element={
                  <ProtectedRoute><CreateScriptWizard /></ProtectedRoute>
                } />
                <Route path="/scripts" element={
                  <ProtectedRoute><GeneratedScripts /></ProtectedRoute>
                } />
                <Route path="/script/:scriptId" element={
                  <ProtectedRoute><ScriptView /></ProtectedRoute>
                } />
                <Route path="/subscription" element={
                  <ProtectedRoute><Subscription /></ProtectedRoute>
                } />
                <Route path="/subscription/callback" element={
                  <ProtectedRoute><SubscriptionCallback /></ProtectedRoute>
                } />
                <Route path="/script-group/:brandName/:product/:scriptId" element={
                  <ProtectedRoute><ScriptGroup /></ProtectedRoute>
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
