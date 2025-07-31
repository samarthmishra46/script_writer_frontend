import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { buildApiUrl } from '../config/api';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const Subscription = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  // Function to load Razorpay script
  const loadRazorpayScript = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Check if already loaded
      if (window.Razorpay) {
        console.log('Razorpay already loaded');
        resolve();
        return;
      }

      // Check if script tag already exists
      const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
      if (existingScript) {
        console.log('Razorpay script tag already exists, waiting for load...');
        // Wait for the existing script to load
        const checkRazorpay = setInterval(() => {
          if (window.Razorpay) {
            clearInterval(checkRazorpay);
            console.log('Razorpay loaded from existing script');
            resolve();
          }
        }, 100);
        
        // Timeout after 10 seconds
        setTimeout(() => {
          clearInterval(checkRazorpay);
          reject(new Error('Timeout waiting for Razorpay to load'));
        }, 10000);
        return;
      }

      // Create and load new script
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      
      script.onload = () => {
        console.log('Razorpay script loaded successfully');
        setRazorpayLoaded(true);
        resolve();
      };
      
      script.onerror = () => {
        console.error('Failed to load Razorpay script');
        reject(new Error('Failed to load Razorpay script'));
      };

      document.head.appendChild(script);
    });
  };

  useEffect(() => {
    // Check if Razorpay key is configured
    if (!import.meta.env.VITE_RAZORPAY_KEY_ID) {
      setError('Payment system not configured. Please contact support.');
      return;
    }

    // Load Razorpay script
    loadRazorpayScript()
      .then(() => {
        console.log('Razorpay is ready');
        setRazorpayLoaded(true);
      })
      .catch((error) => {
        console.error('Failed to load Razorpay:', error);
        setError('Failed to load payment system. Please check your internet connection and try again.');
      });
  }, []);

  const handleSubscribe = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Check if Razorpay is loaded
      if (!window.Razorpay) {
        console.log('Razorpay not loaded, attempting to load...');
        try {
          await loadRazorpayScript();
        } catch (error) {
          setError('Payment system not ready. Please refresh the page and try again.');
          return;
        }
      }

      // Check if user is logged in
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to continue.');
        navigate('/login');
        return;
      }

      // Get user data for email
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      if (!userData.email) {
        setError('User email not found. Please log in again.');
        navigate('/login');
        return;
      }

      console.log('Creating subscription...');
      
      // Get order ID from backend
      const response = await fetch(buildApiUrl('api/subscription/create-order'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ plan: 'individual' })
      });

      const data = await response.json();
      console.log('Subscription creation response:', data);

      if (!response.ok) {
        throw new Error(data.detail || data.error || 'Failed to create subscription');
      }

      if (!data.orderId) {
        throw new Error('No order ID received from server');
      }

      // Verify Razorpay is available before creating options
      if (!window.Razorpay) {
        throw new Error('Razorpay not available');
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        order_id: data.orderId,
        name: 'ScriptWin',
        description: 'Individual Plan - Monthly Subscription',
        image: 'https://via.placeholder.com/150x50/2563EB/FFFFFF?text=ScriptWin',
        currency: 'INR',
        amount: 199900,
        handler: async function (response: any) {
          try {
            console.log('Payment successful, verifying...', response);
            
            // Handle successful payment
            const verifyResponse = await fetch(buildApiUrl('api/subscription/verify'), {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature
              })
            });

            const verifyData = await verifyResponse.json();
            console.log('Payment verification response:', verifyData);
            
            if (verifyResponse.ok) {
              // Update local user data
              const updatedUserData = {
                ...userData,
                subscription: { 
                  plan: 'individual', 
                  status: 'active',
                  updatedAt: new Date().toISOString()
                }
              };
              localStorage.setItem('user', JSON.stringify(updatedUserData));
              
              // Show success message and redirect
              alert('Payment successful! Welcome to Individual Plan!');
              navigate('/dashboard');
            } else {
              throw new Error(verifyData.detail || verifyData.error || 'Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            setError('Payment verification failed. Please contact support with your payment ID.');
          }
        },
        prefill: {
          name: userData.name || '',
          email: userData.email,
          contact: userData.phone || ''
        },
        notes: {
          address: 'ScriptWin Individual Plan Subscription',
          plan: 'individual'
        },
        theme: {
          color: '#2563EB'
        },
        modal: {
          ondismiss: function() {
            console.log('Checkout form closed');
            setError('Payment cancelled. You can try again anytime.');
          }
        }
      };

      console.log('Opening Razorpay with options:', { 
        ...options, 
        key: '***', 
        prefill: { ...options.prefill, email: '***' } 
      });
      
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Subscription error:', error);
      setError(error instanceof Error ? error.message : 'Failed to process subscription. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-lg rounded-2xl">
          <div className="px-6 py-8">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
              Upgrade to Individual Plan
            </h2>
            
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600">{error}</p>
                {error.includes('contact support') && (
                  <p className="text-sm text-red-500 mt-2">
                    If the problem persists, please contact our support team.
                  </p>
                )}
              </div>
            )}
            
            <div className="border-t border-gray-200 pt-6">
              <div className="text-center mb-8">
                <p className="text-5xl font-bold text-gray-900">
                  ₹1,999<span className="text-xl font-normal text-gray-500">/month</span>
                </p>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-green-500" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span className="ml-3 text-gray-700">Unlimited script generation</span>
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-green-500" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span className="ml-3 text-gray-700">Advanced customization options</span>
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-green-500" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span className="ml-3 text-gray-700">Priority support</span>
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-green-500" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span className="ml-3 text-gray-700">Analytics and insights</span>
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-green-500" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span className="ml-3 text-gray-700">Storyboard generation</span>
                </li>
              </ul>

              <button
                onClick={handleSubscribe}
                disabled={isLoading}
                className={`w-full bg-blue-600 text-white py-3 px-6 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors duration-200 ${
                  isLoading ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? 'Processing...' : 'Subscribe Now'}
              </button>

              <p className="text-sm text-gray-500 text-center mt-4">
                Secure payments powered by Razorpay
              </p>
              
              <p className="text-xs text-gray-400 text-center mt-2">
                You can cancel your subscription anytime
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subscription;