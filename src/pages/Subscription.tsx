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

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      console.log('Razorpay script loaded successfully');
    };
    script.onerror = () => {
      console.error('Failed to load Razorpay script');
      setError('Failed to load payment system. Please try again later.');
    };
    document.body.appendChild(script);
  }, []);

  const handleSubscribe = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Creating subscription...');
      // Get order ID from backend
      const response = await fetch(buildApiUrl('api/subscription/create-order'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ plan: 'individual' })
      });

      const data = await response.json();
      console.log('Subscription creation response:', data);

      if (!response.ok) {
        throw new Error(data.detail || data.error || 'Failed to create subscription');
      }

      if (!data.orderId) {
        throw new Error('No subscription ID received from server');
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        order_id: data.orderId,
        name: 'ScriptWin',
        description: 'Monthly Subscription',
        image: 'your-logo-url',
        handler: async function (response: any) {
          try {
            console.log('Payment successful, verifying...', response);
            // Handle successful payment
            const verifyResponse = await fetch(buildApiUrl('api/subscription/verify'), {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
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
              const userData = JSON.parse(localStorage.getItem('user') || '{}');
              userData.subscription = { plan: 'premium', status: 'active' };
              localStorage.setItem('user', JSON.stringify(userData));
              
              navigate('/dashboard');
            } else {
              throw new Error(verifyData.detail || verifyData.error || 'Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            setError('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          email: JSON.parse(localStorage.getItem('user') || '{}').email
        },
        theme: {
          color: '#2563EB'
        },
        modal: {
          ondismiss: function() {
            console.log('Checkout form closed');
            setError('Payment cancelled');
          }
        }
      };

      console.log('Opening Razorpay with options:', { ...options, key: '***' });
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
              Upgrade to Premium
            </h2>
            
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600">{error}</p>
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
              </ul>

              <button
                onClick={handleSubscribe}
                disabled={isLoading}
                className={`w-full bg-blue-600 text-white py-3 px-6 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors duration-200 ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
              >
                {isLoading ? 'Processing...' : 'Subscribe Now'}
              </button>

              <p className="text-sm text-gray-500 text-center mt-4">
                Secure payments powered by Razorpay
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subscription;