import { useState, useEffect } from 'react';
import SubscriptionService from '../utils/subscriptionService';

interface SubscriptionVerificationResponse {
  message: string;
  subscription: {
    plan: string;
    status: string;
    startDate: string;
    endDate: string;
    nextBillingDate?: string;
    isRecurring?: boolean;
  };
}

interface RazorpayCheckoutProps {
  plan: 'individual' | 'organization';
  token: string;
  onSuccess: (data: SubscriptionVerificationResponse) => void;
  onError: (error: Error) => void;
}

const RazorpayCheckout = ({ plan, token, onSuccess, onError }: RazorpayCheckoutProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRazorpayLoaded, setIsRazorpayLoaded] = useState(false);
  
  // Initialize subscription service
  const subscriptionService = new SubscriptionService(token);

  // Load Razorpay script if not already loaded
  useEffect(() => {
    const loadRazorpayScript = () => {
      return new Promise<void>((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => {
          setIsRazorpayLoaded(true);
          resolve();
        };
        document.body.appendChild(script);
      });
    };

    // Check if Razorpay is already defined
    if (typeof window !== 'undefined' && 'Razorpay' in window) {
      setIsRazorpayLoaded(true);
    } else {
      loadRazorpayScript();
    }
  }, []);

  const initiateSubscription = async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Create a subscription plan
      const planResponse = await subscriptionService.createPlan(plan);
      
      // 2. Create a subscription with the plan
      const subscriptionResponse = await subscriptionService.createSubscription(planResponse.planId, plan);

      // 3. If there's a short URL, redirect to it
      if (subscriptionResponse.shortUrl) {
        window.location.href = subscriptionResponse.shortUrl;
        return;
      }

      // 4. Otherwise open Razorpay checkout
      if (!isRazorpayLoaded) {
        throw new Error('Razorpay SDK is not loaded yet. Please try again.');
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        subscription_id: subscriptionResponse.subscriptionId,
        name: 'Script Writer',
        description: `${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan Subscription`,
        theme: {
          color: '#3399cc'
        },
        handler: function (response: { razorpay_payment_id: string; razorpay_subscription_id: string; razorpay_signature: string }) {
          // Handle successful payment
          subscriptionService.verifySubscription({
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_subscription_id: response.razorpay_subscription_id,
            razorpay_signature: response.razorpay_signature,
            plan: plan
          })
            .then(data => {
              onSuccess(data as SubscriptionVerificationResponse);
            })
            .catch(err => {
              onError(err);
              setError('Payment verification failed. Please contact support.');
            });
        },
        prefill: {},
        notes: {
          plan_type: plan
        }
      };

      // Use a type assertion to avoid TypeScript errors
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const RazorpayConstructor = (window as any).Razorpay;
      const razorpay = new RazorpayConstructor(options);
      razorpay.open();
      
    } catch (err) {
      const error = err as Error;
      setError(error.message || 'Failed to initiate subscription');
      onError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="razorpay-checkout">
      {error && <div className="error-message">{error}</div>}
      <button 
        className="subscription-button"
        onClick={initiateSubscription}
        disabled={loading || !isRazorpayLoaded}
      >
        {loading ? 'Processing...' : `Subscribe to ${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan`}
      </button>
      {!isRazorpayLoaded && <div className="loading-message">Loading payment gateway...</div>}
    </div>
  );
};

export default RazorpayCheckout;
