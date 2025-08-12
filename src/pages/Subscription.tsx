import React, { useState, useEffect } from "react";
import axios from "axios";
import { buildApiUrl } from "../config/api";
import { useNavigate } from "react-router-dom";

interface UserData {
  name: string;
  email: string;
  subscription?: {
    status: string;
    plan: string;
    nextBillingDate?: Date;
    remainingDays?: number;
  };
  [key: string]: any;
}
interface ScriptResponse {
  isActive?: boolean;
  plan: string;
  startDate: string | Date;
  endDate: string | Date;
  status?: string;
  message?: string;
}
function getUserFromLocalStorage(): UserData {
  let user: UserData = { name: "", email: "" };

  try {
    const userString = localStorage.getItem("user");
    if (userString) {
      const parsedUser: Partial<UserData> = JSON.parse(userString);
      user = {
        name: parsedUser.name || "",
        email: parsedUser.email || "",
        ...parsedUser,
      };
    }
    console.log("User data loaded:", user);
  } catch (err) {
    console.error("Error parsing user data from localStorage:", err);
  }

  return user;
}

const Subscription: React.FC = () => {
  const user = getUserFromLocalStorage();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscriptionData, setSubscriptionData] = useState<{
    isActive: boolean;
    plan: string;
    remainingDays: number;
    nextBillingDate?: Date;
  }>({
    isActive: false,
    plan: 'free',
    remainingDays: 0
  });

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // Check subscription status
  useEffect(() => {
    const checkSubscription = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          setIsLoading(false);
          return;
        }
        
        const response = await fetch(buildApiUrl('/api/subscription'), {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        });

        const data: ScriptResponse = await response.json();
        console.log("Subscription API response:", data);
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch subscription data');
        }
        
        // Calculate remaining days properly
        let remainingDays = 0;
        if (data.startDate && data.endDate) {
          const end = new Date(data.endDate);
          const now = new Date();
          remainingDays = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          console.log("Remaining days calculation:", { 
            end: end.toISOString(), 
            now: now.toISOString(), 
            remainingDays 
          });
          if (remainingDays < 0) remainingDays = 0;
        }
        
        setSubscriptionData({
          isActive: data.plan === 'individual' || data.plan === 'organization',
          plan: data.plan || 'free',
          remainingDays: remainingDays,
          nextBillingDate: data.endDate ? new Date(data.endDate) : undefined
        });
      } catch (error) {
        console.error('Error checking subscription:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch subscription data');
      } finally {
        setIsLoading(false);
      }
    };

    checkSubscription();
  }, [navigate]);

  const startSubscription = async () => {
    if (!user?.email) return alert("No email found for logged-in user");

    try {
      const { data } = await axios.post(
        buildApiUrl("/api/subscription/create-subscription"),
        { email: user.email }
      );

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        subscription_id: data.id,
        name: "Leepi AI",
        description: "₹1 every 7 days",
        
        handler: (response: Record<string, string>) => {
          console.log("Payment successful:", response);
          // Refresh the page to show updated subscription status
          window.location.reload();
        },
        prefill: {
          email: user.email,
        },
      };

      // @ts-expect-error - Razorpay is loaded externally
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      alert("Unable to start subscription");
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-200 px-4">
        <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#CB6CE6]"></div>
          </div>
          <p className="text-gray-500">Checking your subscription status...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-200 px-4">
        <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="text-red-500 text-5xl">⚠️</div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Subscription Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-[#CB6CE6] to-[#2D65F5] text-white rounded-full px-6 py-3 font-medium transition duration-200 w-full hover:opacity-90 mb-4"
          >
            Try Again
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-gray-200 text-gray-700 rounded-full px-6 py-3 font-medium transition duration-200 w-full hover:bg-gray-300"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // If user has an active subscription
  if (subscriptionData.isActive) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-200 px-4">
        <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="relative inline-block">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-[#CB6CE6] to-[#2D65F5] bg-clip-text text-transparent mb-2 transition-all duration-300 hover:scale-105">
                Leepi AI
              </h1>
            </div>
          </div>

          <div className="bg-green-50 rounded-xl p-4 mb-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-green-500 text-white px-4 py-1 rounded-bl-lg font-medium">
              ACTIVE
            </div>
            <h2 className="text-2xl font-bold text-green-800 mt-4">You're Subscribed!</h2>
            <p className="text-green-600 mt-1">
              {subscriptionData.plan.charAt(0).toUpperCase() + subscriptionData.plan.slice(1)} Plan
            </p>
            
            <div className="mt-6 mb-2">
              <div className="text-5xl font-bold text-green-800">
                {subscriptionData.remainingDays}
                <span className="text-xl font-normal text-green-600 ml-2">days left</span>
              </div>
              {subscriptionData.nextBillingDate && (
                <p className="text-sm text-green-600 mt-1">
                  Next billing: {new Date(subscriptionData.nextBillingDate).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>

          <h3 className="font-semibold text-gray-800 text-xl mb-4">Your Active Benefits</h3>
          
          <ul className="text-gray-700 text-left mb-6 space-y-2">
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Unlimited access to AD Script Generation</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Unlimited access to Story Board Generation</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Priority customer support</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Early feature access</span>
            </li>
          </ul>

          <button
            onClick={() => navigate('/dashboard')}
            className="bg-gradient-to-r from-[#CB6CE6] to-[#2D65F5] text-white rounded-full px-6 py-3 font-medium transition duration-200 w-full hover:opacity-90"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // If user doesn't have an active subscription
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-200 px-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="relative inline-block">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-[#CB6CE6] to-[#2D65F5] bg-clip-text text-transparent mb-2 transition-all duration-300 hover:scale-105">
              Leepi AI
            </h1>
          </div>
        </div>

        <p className="text-gray-500 mb-6">
          Unlock all features for just ₹1 every 7 days
        </p>

        <div className="mb-6">
          <span className="text-4xl font-semibold">₹1</span>
          <span className="text-gray-500"> / 7 days</span>
        </div>

        <ul className="text-gray-700 text-left mb-6 space-y-2">
          <li>✔ Unlimited access to AD Script Generation</li>
          <li>✔ Unlimited access to Story Board Generation</li>
          <li>✔ Priority customer support</li>
          <li>✔ Early feature access</li>
          <li>✔ Secure recurring billing</li>
        </ul>

        <p className="text-xs text-gray-400 mb-4">
          Payments will auto-renew every 7 days until canceled.
        </p>

        <button
          onClick={startSubscription}
          className="bg-black hover:bg-gray-800 text-white rounded-full px-6 py-3 font-medium transition duration-200 w-full"
        >
          Start Subscription
        </button>
      </div>
    </div>
  );
};

export default Subscription;
