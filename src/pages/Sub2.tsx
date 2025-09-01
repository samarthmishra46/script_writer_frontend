import React, { useState, useEffect } from "react";
import { buildApiUrl } from "../config/api";
import { useNavigate } from "react-router-dom";
import { trackSubscriptionStart, trackSubscriptionComplete } from "../utils/pixelTracking";

// Add Razorpay type to window
declare global {
  interface Window {
    Razorpay: unknown;
  }
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_subscription_id?: string;
  razorpay_signature: string;
}

interface RazorpayError {
  error: {
    description: string;
  };
}

interface RazorpayInstance {
  open(): void;
  on(event: string, callback: (response: RazorpayError) => void): void;
}

interface RazorpayOptions {
  key: string;
  amount?: number;
  currency?: string;
  name?: string;
  description?: string;
  order_id?: string;
  subscription_id?: string;
  customer_id?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  handler: (response: RazorpayResponse) => void;
  modal?: {
    ondismiss: () => void;
  };
  theme?: {
    color: string;
  };
}

interface RazorpayConstructor {
  new (options: RazorpayOptions): RazorpayInstance;
}

interface UserData {
  name: string;
  email: string;
  subscription?: {
    status: string;
    plan: string;
    nextBillingDate?: Date;
    remainingDays?: number;
  };
}

interface ScriptResponse {
  isActive?: boolean;
  plan: string;
  activatedDate: Date;
  nextBillingDate: Date;
  status?: string;
  message?: string;
}

interface GuestSubscriptionData {
  email: string;
  mobile: string;
  selectedPlan?: string;
}

interface GuestFormErrors {
  email?: string;
  mobile?: string;
}

function getUserFromLocalStorage(): UserData | null {
  try {
    const userString = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    
    if (userString && token) {
      const parsedUser: Partial<UserData> = JSON.parse(userString);
      
      // Check if we have valid user data (name and email)
      if (parsedUser.name && parsedUser.email) {
        return {
          name: parsedUser.name,
          email: parsedUser.email,
          subscription: parsedUser.subscription,
          ...parsedUser,
        };
      }
    }
  } catch (err) {
    console.error("Error parsing user data from localStorage:", err);
  }

  return null;
}

const Sub2: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contactData, setContactData] = useState<GuestSubscriptionData>({
    email: "",
    mobile: "",
  });
  const [contactFormErrors, setContactFormErrors] = useState<GuestFormErrors>({});
  const [subscriptionData, setSubscriptionData] = useState<{
    isActive: boolean;
    plan: string;
    activatedDate: Date;
    nextBillingDate: Date;
    remainingDays?: number;
  }>({
    isActive: false,
    plan: "free",
    activatedDate: new Date(),
    nextBillingDate: new Date(),
  });

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // Initialize page state without auto-redirect
  useEffect(() => {
    const initializePage = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Get user from localStorage
        const userData = getUserFromLocalStorage();
        
        if (userData) {
          // For logged-in users, check subscription status first
          const token = localStorage.getItem("token");
          if (token) {
            const response = await fetch(buildApiUrl("/api/subscription"), {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            });

            const data: ScriptResponse = await response.json();

            if (response.ok) {
              // Calculate remaining days properly
              let remainingDays = 0;
              if (data.nextBillingDate && data.activatedDate) {
                const currentDate = new Date();
                const nextDate = new Date(data.nextBillingDate);
                const diffMs = nextDate.getTime() - currentDate.getTime();
                remainingDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
              }

              const isActive = data.plan === "individual" || data.plan === "organization";
              
              if (isActive) {
                // User already has active subscription
                setSubscriptionData({
                  isActive: true,
                  plan: data.plan,
                  activatedDate: data.activatedDate,
                  nextBillingDate: data.nextBillingDate,
                  remainingDays: remainingDays,
                });
                setIsLoading(false);
                return;
              }
            }
          }
        }
        
        // Show checkout form for both guest and logged-in users without active subscription
        setIsLoading(false);
      } catch (error) {
        console.error("Error initializing page:", error);
        setIsLoading(false);
      }
    };

    initializePage();
  }, []);

  // Validate contact form data
  const validateContactForm = (): boolean => {
    const errors: GuestFormErrors = {};
    
    if (!contactData.email) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(contactData.email)) {
      errors.email = "Please enter a valid email address";
    }
    
    if (!contactData.mobile) {
      errors.mobile = "Mobile number is required";
    } else if (!/^\+?[\d\s-()]{10,}$/.test(contactData.mobile)) {
      errors.mobile = "Please enter a valid mobile number";
    }
    
    setContactFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle contact form input changes
  const handleContactInputChange = (field: 'email' | 'mobile', value: string) => {
    setContactData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (contactFormErrors[field]) {
      setContactFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Handle guest subscription with form data
  const handleGuestSubscription = async () => {
    if (!validateContactForm()) {
      return;
    }

    try {
      setIsLoading(true);
      // Track subscription start
      trackSubscriptionStart('individual');

      // Create subscription using existing backend endpoint
      const response = await fetch(buildApiUrl("/api/subscription/create-guest"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plan: 'individual',
          email: contactData.email,
          mobile: contactData.mobile,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to create subscription order");
      }

      // Initialize Razorpay checkout for subscription - NO PREFILLING
      const options: RazorpayOptions = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        subscription_id: data.subscriptionId,
        customer_id: data.customerId,
        name: "Leepi AI",
        description: "₹1999 every month - Individual Plan",
        // NO prefill - let Razorpay collect everything fresh
        handler: async (response: RazorpayResponse) => {
          await handleGuestPaymentSuccess(response, 'individual', contactData.email, contactData.mobile);
        },
        modal: {
          ondismiss: () => {
            setIsLoading(false);
          },
        },
        theme: { color: "#CB6CE6" },
      };

      const razorpay = new (window as unknown as { Razorpay: RazorpayConstructor }).Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Payment error:", error);
      setError("Payment failed: " + (error instanceof Error ? error.message : "Unknown error"));
      setIsLoading(false);
    }
  };

  // Handle successful guest payment - use pre-collected email and mobile
  const handleGuestPaymentSuccess = async (
    paymentResponse: RazorpayResponse, 
    plan: string, 
    email: string,
    mobile: string
  ) => {
    try {
      // Verify payment using existing backend endpoint with collected email/mobile
      const response = await fetch(buildApiUrl("/api/subscription/verify-guest-payment"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...paymentResponse,
          plan,
          email, // Use pre-collected email
          mobile, // Use pre-collected mobile
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Payment verification failed");
      }

      // Track successful subscription purchase
      trackSubscriptionComplete(plan, 1999);

      // Show success message
      alert("Subscription activated successfully! Login credentials have been sent to your email.");
      
      // Redirect to login page
      window.location.href = "/login";
    } catch (error) {
      console.error("Payment verification error:", error);
      alert("Payment verification failed: " + (error instanceof Error ? error.message : "Unknown error"));
      navigate("/dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state - show minimal loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-200 px-4">
        <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#CB6CE6]"></div>
          </div>
          <p className="text-gray-500">Initializing payment...</p>
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
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Payment Error
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="bg-gray-200 text-gray-700 rounded-full px-6 py-3 font-medium transition duration-200 w-full hover:bg-gray-300"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }


  // Checkout form for collecting user details
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-200 px-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#CB6CE6] to-[#2D65F5] bg-clip-text text-transparent mb-2">
            Leepi AI
          </h1>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Complete Your Subscription
          </h2>
          <p className="text-gray-600 text-sm">
            ₹1999/month - Individual Plan
          </p>
        </div>

        {/* Contact Form */}
        <div className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              value={contactData.email}
              onChange={(e) => handleContactInputChange('email', e.target.value)}
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#CB6CE6] transition duration-200 ${
                contactFormErrors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your email address"
            />
            {contactFormErrors.email && (
              <p className="text-red-500 text-sm mt-1">{contactFormErrors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-2">
              Mobile Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              id="mobile"
              value={contactData.mobile}
              onChange={(e) => handleContactInputChange('mobile', e.target.value)}
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#CB6CE6] transition duration-200 ${
                contactFormErrors.mobile ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your mobile number"
            />
            {contactFormErrors.mobile && (
              <p className="text-red-500 text-sm mt-1">{contactFormErrors.mobile}</p>
            )}
          </div>

          {/* Features List */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="font-semibold text-gray-800 text-sm mb-3">
              What you'll get:
            </h3>
            <ul className="text-gray-700 text-sm space-y-1">
              <li className="flex items-start">
                <span className="text-green-500 mr-2 text-xs">✓</span>
                <span>Unlimited AD Script Generation</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2 text-xs">✓</span>
                <span>Unlimited Story Board Generation</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2 text-xs">✓</span>
                <span>Priority Support</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2 text-xs">✓</span>
                <span>Early Feature Access</span>
              </li>
            </ul>
          </div>

          {/* Checkout Button */}
          <button
            onClick={handleGuestSubscription}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-[#CB6CE6] to-[#2D65F5] text-white rounded-xl px-6 py-4 font-semibold text-lg transition duration-200 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                Processing...
              </div>
            ) : (
              'Proceed to Payment'
            )}
          </button>

          {/* Back Button */}
          <button
            onClick={() => navigate("/dashboard")}
            className="w-full bg-gray-200 text-gray-700 rounded-xl px-6 py-3 font-medium transition duration-200 hover:bg-gray-300"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sub2;
