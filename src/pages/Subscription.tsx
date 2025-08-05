import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, Check } from 'lucide-react';
import { buildApiUrl } from '../config/api';

declare global {
  interface Window {
    Razorpay: {
      new(options: RazorpayOptions): RazorpayInstance;
    };
  }
}

interface RazorpayOptions {
  key: string;
  order_id?: string;
  subscription_id?: string;
  name: string;
  description: string;
  image: string;
  currency: string;
  amount?: number;
  handler: (response: RazorpayResponse) => void;
  prefill: {
    name: string;
    email: string;
    contact?: string;
  };
  notes: {
    address: string;
    plan: string;
  };
  theme: {
    color: string;
  };
  modal: {
    ondismiss: () => void;
  };
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_subscription_id?: string;
  razorpay_signature: string;
}

interface RazorpayInstance {
  open: () => void;
}

const Subscription: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [subscription, setSubscription] = useState<{
    plan?: string;
    status?: string;
    endDate?: string;
    remainingDays?: number;
  } | null>(null);
  const [isSubscriptionChecked, setIsSubscriptionChecked] = useState(false);

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

  // Check if user already has an active subscription
  useEffect(() => {
    const checkSubscription = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await fetch(buildApiUrl('api/subscription'), {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch subscription info');
        }

        const data = await response.json();
        setSubscription(data.subscription);
        
        // If user has an active subscription, show relevant message
        if (data.subscription.status === 'active' && data.subscription.plan !== 'free') {
          console.log('Active subscription found:', data.subscription);
        }
        
        setIsSubscriptionChecked(true);
      } catch (err) {
        console.error('Error checking subscription:', err);
      }
    };

    checkSubscription();
  }, [navigate]);

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
      .catch((loadError) => {
        console.error('Failed to load Razorpay:', loadError);
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
        } catch (loadError) {
          console.error('Failed to load Razorpay script:', loadError);
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
      
      // Create subscription plan first
      const planResponse = await fetch(buildApiUrl('api/subscription/create-plan'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ plan: 'individual' })
      });

      const planData = await planResponse.json();
      console.log('Plan creation response:', planData);

      if (!planResponse.ok) {
        throw new Error(planData.message || planData.error || 'Failed to create subscription plan');
      }

      if (!planData.planId) {
        throw new Error('No plan ID received from server');
      }

      // Create subscription with the plan ID
      const subscriptionResponse = await fetch(buildApiUrl('api/subscription/create-subscription'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ planId: planData.planId, plan: 'individual' })
      });

      const data = await subscriptionResponse.json();
      console.log('Subscription creation response:', data);

      if (!subscriptionResponse.ok) {
        throw new Error(data.message || data.error || 'Failed to create subscription');
      }

      if (!data.subscriptionId) {
        throw new Error('No subscription ID received from server');
      }

      // Verify Razorpay is available before creating options
      if (!window.Razorpay) {
        throw new Error('Razorpay not available');
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        subscription_id: data.subscriptionId,
        name: 'Leepi AI',
        description: 'Individual Plan - Monthly Subscription',
        image: 'https://via.placeholder.com/150x50/8B5CF6/FFFFFF?text=Leepi+AI',
        currency: 'INR',
        handler: async function (response: RazorpayResponse) {
          try {
            console.log('Payment successful, verifying...', response);
            
            // Handle successful payment
            const verifyResponse = await fetch(buildApiUrl('api/subscription/verify-subscription'), {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_subscription_id: response.razorpay_subscription_id,
                razorpay_signature: response.razorpay_signature,
                plan: 'individual'
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
                  updatedAt: new Date().toISOString(),
                  isRecurring: true,
                  nextBillingDate: verifyData.subscription?.nextBillingDate
                }
              };
              localStorage.setItem('user', JSON.stringify(updatedUserData));
              
              // Show success message and redirect
              alert('Recurring subscription activated successfully!');
              navigate('/dashboard');
            } else {
              throw new Error(verifyData.message || verifyData.error || 'Payment verification failed');
            }
          } catch (verifyError) {
            console.error('Payment verification error:', verifyError);
            setError('Payment verification failed. Please contact support with your payment ID.');
          }
        },
        prefill: {
          name: userData.name || '',
          email: userData.email,
          contact: userData.phone || ''
        },
        notes: {
          address: 'Leepi AI Individual Plan Subscription',
          plan: 'individual'
        },
        theme: {
          color: '#8B5CF6'
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

  const renderSubscriptionContent = () => {
    // If already subscribed, show subscription status
    if (subscription && subscription.status === 'active' && subscription.plan !== 'free') {
      return (
        <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-blue-600 px-8 py-12 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Crown className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">You're Already Subscribed!</h2>
              <p className="text-green-100">
                {subscription.plan ? subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1) : 'Premium'} Plan Active
              </p>
            </div>
            
            <div className="text-center mb-6">
              <p className="text-6xl font-bold text-white">
                {subscription.remainingDays || 30}<span className="text-2xl font-normal text-green-100"> days left</span>
              </p>
            </div>
            
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors"
            >
              Return to Dashboard
            </button>
          </div>
          
          <div className="p-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Your Active Benefits</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Unlimited campaign generation</span>
                </div>
                <div className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Advanced customization options</span>
                </div>
                <div className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Priority support</span>
                </div>
                <div className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Analytics and insights</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Storyboard generation</span>
                </div>
                <div className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Export to multiple formats</span>
                </div>
                <div className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Team collaboration</span>
                </div>
                <div className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-gray-700">API access</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Not subscribed yet - show payment page
    return (
      <>
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Upgrade to Individual Plan
          </h1>
          <p className="text-xl text-gray-600">
            Unlock unlimited campaigns and advanced features
          </p>
        </div>

        <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-12 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Crown className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Individual Plan</h2>
              <p className="text-purple-100">Perfect for growing businesses</p>
            </div>
            
            <div className="text-center">
              <p className="text-6xl font-bold text-white">
                ₹1,999<span className="text-2xl font-normal text-purple-100">/month</span>
              </p>
            </div>
          </div>

          {/* Features */}
          <div className="px-8 py-8">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-4">
                <div className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Unlimited campaign generation</span>
                </div>
                <div className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Advanced customization options</span>
                </div>
                <div className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Priority support</span>
                </div>
                <div className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Analytics and insights</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Storyboard generation</span>
                </div>
                <div className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Export to multiple formats</span>
                </div>
                <div className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Team collaboration</span>
                </div>
                <div className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-gray-700">API access</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleSubscribe}
              disabled={isLoading || !razorpayLoaded}
              className={`w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 px-8 rounded-lg text-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl ${
                (isLoading || !razorpayLoaded) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Processing...' : !razorpayLoaded ? 'Loading Payment System...' : 'Subscribe Now'}
            </button>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Secure payments powered by Razorpay
              </p>
              <p className="text-xs text-gray-400 mt-2">
                You can cancel your subscription anytime
              </p>
            </div>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {renderSubscriptionContent()}

        {/* Back to Dashboard */}
        <div className="text-center mt-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-purple-600 hover:text-purple-700 font-medium"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default Subscription;