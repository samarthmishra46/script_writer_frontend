import React, { useState, useEffect } from "react";
import { buildApiUrl } from "../config/api";
import { useNavigate } from "react-router-dom";
import { trackSubscriptionStart, trackSubscriptionComplete } from "../utils/pixelTracking";
import { MailSearch ,Phone} from 'lucide-react';
import { trackEvent } from "@/utils/mixpanel";

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
  prefill?: {
    email?: string;
    contact?: string;
  };
  handler: (response: RazorpayResponse) => void;
  modal?: {
    ondismiss: () => void;
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
  activatedDate: string | null;
  nextBillingDate: string | null;
  status?: string;
  message?: string;
  postTrialBillingDate?: string | null;
  trial?: {
    isActive?: boolean;
    endDate?: string;
  };
  paidTrial?: PaidTrialStatus | null;
  credits?: CreditSummary | null;
  creditConfig?: CreditConfig;
}

interface CreditSummary {
  balance: number;
  lifetimeGranted: number;
  lifetimeSpent: number;
  lastUpdated?: string;
  mostRecentEvent?: {
    event: string;
    amount: number;
    description?: string;
    reference?: string;
    createdAt?: string;
    metadata?: Record<string, unknown>;
  } | null;
}

interface PaidTrialStatus {
  isActive: boolean;
  hasExpired: boolean;
  daysRemaining: number;
  endDate?: string;
  usage?: {
    scripts?: number;
    images?: number;
  };
}

interface CreditConfig {
  trial?: number;
  monthly?: number;
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

const Subscription: React.FC = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscriptionData, setSubscriptionData] = useState<{
    isActive: boolean;
    plan: string;
    activatedDate: Date | null;
    nextBillingDate: Date | null;
    postTrialBillingDate?: Date | null;
    remainingDays?: number;
    trialEndDate?: Date | null;
    trialDaysRemaining?: number | null;
  }>({
    isActive: false,
    plan: "free",
    activatedDate: null,
    nextBillingDate: null,
    postTrialBillingDate: null,
    trialEndDate: null,
    trialDaysRemaining: null,
  });
  const [paidTrialStatus, setPaidTrialStatus] = useState<PaidTrialStatus | null>(null);
  const [creditSummary, setCreditSummary] = useState<CreditSummary | null>(null);
  const [creditConfig, setCreditConfig] = useState<CreditConfig>({});
  const trialCreditAmount = creditConfig.trial ?? 50;
  const monthlyCreditAmount = creditConfig.monthly ?? 300;

  const formatDate = (date: Date | null | undefined) =>
    date
      ? date.toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "—";

  const renderCreditsSummary = () => {
    if (!creditSummary) {
      return null;
    }

    return (
      <div className="mt-6">
        <div className="bg-white border border-purple-200 rounded-2xl p-5 text-left shadow-sm">
          <h4 className="text-lg font-semibold text-purple-700 mb-3">
            Credit Wallet
          </h4>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm text-gray-500">Available balance</p>
              <p className="text-3xl font-bold text-purple-700">
                {creditSummary.balance ?? 0}
              </p>
            </div>
            <div className="text-xs text-gray-500 text-right">
              <p>Granted in total: {creditSummary.lifetimeGranted ?? 0}</p>
              <p>Spent so far: {creditSummary.lifetimeSpent ?? 0}</p>
            </div>
          </div>

          {paidTrialStatus?.isActive ? (
            <p className="text-xs text-gray-600 bg-purple-50 border border-purple-100 rounded-lg px-3 py-2">
              Trial includes {trialCreditAmount} credits. Use them before your trial ends on {formatDate(subscriptionData.trialEndDate)}.
            </p>
          ) : (
            <p className="text-xs text-gray-600 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
              Each monthly renewal adds {monthlyCreditAmount} credits to your balance automatically.
            </p>
          )}

          {creditSummary.mostRecentEvent && (
            <div className="mt-4 text-xs text-gray-500">
              <p className="font-medium text-gray-600 mb-1">Last credit event</p>
              <p>
                {creditSummary.mostRecentEvent.amount > 0 ? "+" : ""}
                {creditSummary.mostRecentEvent.amount} ({creditSummary.mostRecentEvent.event})
              </p>
              {creditSummary.mostRecentEvent.description && (
                <p>{creditSummary.mostRecentEvent.description}</p>
              )}
              {creditSummary.mostRecentEvent.createdAt && (
                <p>{
                  new Date(creditSummary.mostRecentEvent.createdAt).toLocaleString()
                }</p>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  // User contact data state (for both guest and logged-in users)
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [contactData, setContactData] = useState<GuestSubscriptionData>({
    email: "",
    mobile: "",
  });
  const [contactFormErrors, setContactFormErrors] = useState<GuestFormErrors>({});

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

  // Check if user is logged in and has subscription
  useEffect(() => {
    const checkUserAndSubscription = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Get user from localStorage
        const userData = getUserFromLocalStorage();
        setUser(userData);
        
        // Prefill contact data if user is logged in
        if (userData) {
          setContactData({
            email: userData.email || "",
            mobile: "", // Will be filled by user
          });
        }
        
        if (!userData) {
          setShowGuestForm(true);
          setIsLoading(false);
          return;
        }

        const token = localStorage.getItem("token");
        if (!token) {
          setShowGuestForm(true);
          setIsLoading(false);
          return;
        }

        const response = await fetch(buildApiUrl("/api/subscription"), {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data: ScriptResponse = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch subscription data");
        }

        const now = new Date();
        const activatedDate = data.activatedDate ? new Date(data.activatedDate) : null;
        const nextBillingDate = data.nextBillingDate ? new Date(data.nextBillingDate) : null;
        const postTrialBillingDate = data.postTrialBillingDate ? new Date(data.postTrialBillingDate) : null;
        const paidTrial = data.paidTrial ?? null;
        const trialEndDate = paidTrial?.endDate ? new Date(paidTrial.endDate) : null;

        setPaidTrialStatus(paidTrial);
        setCreditSummary(
          data.credits ?? {
            balance: 0,
            lifetimeGranted: 0,
            lifetimeSpent: 0,
          }
        );
        setCreditConfig(data.creditConfig ?? {});

        let remainingDays: number | undefined;
        let trialDaysRemaining: number | null = null;

        if (paidTrial?.isActive && trialEndDate) {
          const diffMs = trialEndDate.getTime() - now.getTime();
          trialDaysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
          remainingDays = trialDaysRemaining;
        } else if (nextBillingDate) {
          const diffMs = nextBillingDate.getTime() - now.getTime();
          remainingDays = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
        }

        setSubscriptionData({
          isActive: data.plan === "individual" || data.plan === "organization",
          plan: data.plan || "free",
          remainingDays,
          activatedDate,
          nextBillingDate,
          postTrialBillingDate,
          trialEndDate,
          trialDaysRemaining,
        });
      } catch (error) {
        console.error("Error checking subscription:", error);
        setError(
          error instanceof Error
            ? error.message
            : "Failed to fetch subscription data"
        );
      } finally {
        setIsLoading(false);
      }
    };

    checkUserAndSubscription();
  }, []); // Empty dependency array to run only once on mount

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

  // Check if email exists in database
  const checkEmailExists = async (email: string): Promise<boolean> => {
    try {
      const response = await fetch(buildApiUrl("/api/auth/check-email"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      return data.exists || false;
    } catch (error) {
      console.error("Error checking email:", error);
      return false;
    }
  };

  // Handle contact form input changes
  const handleContactInputChange = async (field: 'email' | 'mobile', value: string) => {
    setContactData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (contactFormErrors[field]) {
      setContactFormErrors(prev => ({ ...prev, [field]: undefined }));
    }

    // If email field is being changed and it's a valid email, check if it exists
    if (field === 'email' && value && /\S+@\S+\.\S+/.test(value)) {
      const emailExists = await checkEmailExists(value);
      if (emailExists) {
        setContactFormErrors(prev => ({ 
          ...prev, 
          email: "This email is already registered. Please login instead." 
        }));
        
        // Show confirmation dialog to redirect to login
        const shouldRedirect = window.confirm(
          "This email is already registered. Would you like to go to the login page?"
        );
        
        if (shouldRedirect) {
          navigate("/login");
        }
      }
    }
  };

  // Handle guest subscription flow
  const handleGuestSubscription = async (plan: string) => {
    if (!validateContactForm()) {
      return;
    }
    
    // Track subscription start
    trackSubscriptionStart(plan);
    
    // Check if email already exists in the database
    const emailExists = await checkEmailExists(contactData.email);
    if (emailExists) {
      setContactFormErrors(prev => ({ 
        ...prev, 
        email: "This email is already registered. Please login instead." 
      }));
      
      // Show confirmation dialog to redirect to login
      const shouldRedirect = window.confirm(
        "This email is already registered. Would you like to go to the login page?"
      );
      
      if (shouldRedirect) {
        navigate("/login");
      }
      return;
    }
    
    setContactData(prev => ({ ...prev, selectedPlan: plan }));
    // Proceed with Razorpay checkout for guest
    handleGuestPayment(plan);
  };

  // Modified payment handler for guest users
  const handleGuestPayment = async (plan: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // Create subscription order for guest
      const response = await fetch(buildApiUrl("/api/subscription/create-guest"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plan,
          email: contactData.email,
          mobile: contactData.mobile,
        }),
      });

      const data = await response.json();
      console.log(data);
      if (!response.ok) {
        throw new Error(data.message || "Failed to create subscription order");
      }

      // Initialize Razorpay checkout for subscription
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        subscription_id: data.subscriptionId, // Use subscription_id instead of order_id
         // Include customer ID
        name: "Leepi AI",
        description: `₹399 every Week - ${plan} Plan`,
        prefill: {
          name: contactData.email.split('@')[0], // Use email prefix as name
          email: contactData.email,
          contact: contactData.mobile,
        },
        handler: async (response: RazorpayResponse) => {
          // Handle successful payment
          await handleGuestPaymentSuccess(response, plan);
        },
        modal: {
          ondismiss: () => {
            setIsLoading(false);
          },
        },
        theme: { color: "#002fffff" },
      };

      const razorpay = new (window as unknown as { Razorpay: RazorpayConstructor }).Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Payment error:", error);
      setError(
        error instanceof Error ? error.message : "Payment failed"
      );
      setIsLoading(false);
    }
  };

  // Handle successful guest payment
  const handleGuestPaymentSuccess = async (paymentResponse: RazorpayResponse, plan: string) => {
    try {
      // Verify payment and create user account
      const response = await fetch(buildApiUrl("/api/subscription/verify-guest-payment"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...paymentResponse,
          plan,
          email: contactData.email,
          mobile: contactData.mobile,
           // Include customer ID in the verification request
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Payment verification failed");
      }

      // Track successful subscription purchase
      trackSubscriptionComplete(plan, plan === 'individual' ? 1999 : 1999);

      // Show success message
      alert("Subscription activated successfully! Login credentials have been sent to your email.");
         
      // Redirect to login page
      window.location.href = "/login";
    } catch (error) {
      console.error("Payment verification error:", error);
      setError(
        error instanceof Error ? error.message : "Payment verification failed"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const startSubscription = async () => {
    console.log("startSubscription called"); // Add this
    // Validate contact information before proceeding
    if (!validateContactForm()) {
      return;
    }

    if (!user?.email) return alert("No email found for logged-in user");
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    // Track subscription start
    trackSubscriptionStart('individual');

    // If the user is changing their email (different from their logged-in email), check if the new email exists
    if (contactData.email !== user.email) {
      const emailExists = await checkEmailExists(contactData.email);
      if (emailExists) {
        setContactFormErrors(prev => ({ 
          ...prev, 
          email: "This email is already registered. Please use a different email or login with this email." 
        }));
        return;
      }
    }

    setIsLoading(true);
    try {
      // 1. Create subscription from backend
      const response = await fetch(
        buildApiUrl("/api/subscription/create-subscription"),
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: contactData.email || user.email }),
        }
      );
      const data = await response.json();
      console.log("API response:", data); // Add this
      const subscriptionId = data.id;
      console.log("Created subscription:", subscriptionId); // Already present

      // 2. Configure Razorpay options
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        subscription_id: subscriptionId,
         // Include customer ID
        name: "Leepi AI",
        description: "₹1999 every month",
        handler: async function (response: RazorpayResponse) {
          console.log("Razorpay Response:", response);

          // Extract values from Razorpay response
          const {
            razorpay_payment_id,
            razorpay_subscription_id,
            razorpay_signature,
          } = response;

          // 3. Verify payment with backend
          try {
            const verificationRes = await fetch(
              buildApiUrl("/api/subscription/verify"),
              {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  razorpay_payment_id,
                  razorpay_subscription_id,
                  razorpay_signature,
                }),
              }
            );

            const verificationData = await verificationRes.json();
            if (verificationData.success) {
              // Track successful subscription purchase
              trackSubscriptionComplete('individual', 1999);
              alert("Subscription activated successfully!");
            } else {
              alert("Payment verification failed.");
            }
          } catch (err) {
            console.error("Verification error:", err);
            alert("Could not verify payment.");
          }
        },
        prefill: {
          //We recommend using the prefill parameter to auto-fill customer's contact information, especially their phone number
          name: user.name, //your customer's name
          email: contactData.email || user.email,
          contact: contactData.mobile, // Use the mobile number from the form
          //Provide the customer's phone number for better conversion rates
        },
        theme: { color: "#002fffff" },
        method: {
          upi: true,
        },
      };

      // 4. Open Razorpay Checkout
      const rzp = new (window as { Razorpay: RazorpayConstructor }).Razorpay(
        options
      );
      rzp.on("payment.failed", function (response: RazorpayError) {
        console.error("Payment failed:", response.error);
        alert("Payment failed: " + response.error.description);
      });
      rzp.open();
    } catch (error) {
      console.error("Error starting subscription:", error);
      alert("Failed to create subscription");
    } finally {
      setIsLoading(false);
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
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Subscription Error
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-[#CB6CE6] to-[#2D65F5] text-white rounded-full px-6 py-3 font-medium transition duration-200 w-full hover:opacity-90 mb-4"
          >
            Try Again
          </button>
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

  // If user is in the paid trial window
  if (paidTrialStatus?.isActive) {
    const trialDaysLeft =
      subscriptionData.trialDaysRemaining ?? paidTrialStatus.daysRemaining ?? 0;
    const nextChargeDate =
      subscriptionData.postTrialBillingDate || subscriptionData.nextBillingDate;

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

          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 mb-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-yellow-500 text-white px-4 py-1 rounded-bl-lg font-medium uppercase text-xs tracking-wide">
              Trial Active
            </div>
            <h2 className="text-2xl font-bold text-yellow-900 mt-4">
              Enjoy your 3-day premium trial
            </h2>
            <p className="text-yellow-700 mt-1 text-sm">
              Explore all features before billing begins.
            </p>

            <div className="mt-6 mb-3">
              <div className="text-5xl font-bold text-yellow-900">
                {trialDaysLeft}
                <span className="text-xl font-normal text-yellow-700 ml-2">
                  day{trialDaysLeft === 1 ? "" : "s"} left
                </span>
              </div>
              <p className="text-sm text-yellow-700 mt-2">
                Trial ends on {formatDate(subscriptionData.trialEndDate)}
              </p>
              <p className="text-xs text-yellow-600 mt-1">
                Monthly plan (₹1,999) will start afterwards and renew every 30 days.
              </p>
            </div>

            <div className="bg-white rounded-lg p-4 border border-yellow-100 text-left text-sm text-yellow-700">
              <p className="font-semibold">Upcoming charge</p>
              <p className="mt-1">
                Scheduled for {formatDate(nextChargeDate)} · Includes {monthlyCreditAmount} monthly credits.
              </p>
            </div>
          </div>

          {renderCreditsSummary()}

          <button
            onClick={() => navigate("/dashboard")}
            className="mt-6 bg-gradient-to-r from-[#CB6CE6] to-[#2D65F5] text-white rounded-full px-6 py-3 font-medium transition duration-200 w-full hover:opacity-90"
          >
            Start creating in the dashboard
          </button>

          <p className="text-xs text-gray-500 mt-4">
            You can cancel anytime before your trial ends. After the trial, billing switches to a 30-day cycle with automatic credit renewals.
          </p>
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
            <h2 className="text-2xl font-bold text-green-800 mt-4">
              You're Subscribed!
            </h2>
            <p className="text-green-600 mt-1">
              {subscriptionData.plan.charAt(0).toUpperCase() +
                subscriptionData.plan.slice(1)}{" "}
              Plan
            </p>

            <div className="mt-6 mb-2">
              <div className="text-5xl font-bold text-green-800">
                {subscriptionData.remainingDays || 0}
                <span className="text-xl font-normal text-green-600 ml-2">
                  days left
                </span>
              </div>
              {subscriptionData.nextBillingDate && (
                <p className="text-sm text-green-600 mt-1">
                  Next billing: {formatDate(subscriptionData.nextBillingDate)}
                </p>
              )}
              {!subscriptionData.nextBillingDate && subscriptionData.postTrialBillingDate && (
                <p className="text-sm text-green-600 mt-1">
                  Next billing: {formatDate(subscriptionData.postTrialBillingDate)}
                </p>
              )}
            </div>
          </div>

          <h3 className="font-semibold text-gray-800 text-xl mb-4">
            Your Active Benefits
          </h3>

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

          {renderCreditsSummary()}

          <button
            onClick={() => navigate("/dashboard")}
            className="bg-gradient-to-r from-[#CB6CE6] to-[#2D65F5] text-white rounded-full px-6 py-3 font-medium transition duration-200 w-full hover:opacity-90"
          >
            Return to Dashboard
          </button>

          <p className="text-xs text-gray-500 mt-4">
            Each renewal keeps your access active for 30 days and refreshes {monthlyCreditAmount} credits automatically.
          </p>
        </div>
      </div>
    );
  }

  // If user doesn't have an active subscription or is guest
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-200 px-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-4 text-center">
        <div className="flex justify-center mb-6">
          <div className="relative inline-block">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#CB6CE6] to-[#2D65F5] bg-clip-text text-transparent mb-2 transition-all duration-300 hover:scale-105">
              Leepi AI
            </h1>
          </div>
        </div>

        {showGuestForm && !user ? (
          // Guest form for collecting email and mobile (elegant version)
          <div className="relative bg-white rounded-2xl shadow-lg p-2 border border-gray-200 max-w-sm mx-auto">
  {/* Headline */}
  <h2 className="text-center text-lg font-semibold text-gray-800 mb-2">
    Try <span className="text-purple-600 font-bold">Leepi AI</span> For 7 Days
  </h2>
  <p className="text-center text-sm text-gray-500 mb-3">
    Boost ROAS (Guaranteed) Or 100% Refund
  </p>

  {/* Pricing */}
  <div className="text-center mb-4">
    <span className="text-purple-600 line-through text-lg mr-2">Rs.999</span>
    <span className=" font-bold text-xl">Rs.399</span>
    <span className="text-sm text-gray-600"> / Week</span>
  </div>

  {/* Form */}
  <div className="space-y-3 mb-4">
    
   <div className="relative">
  <MailSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
  <input
    type="email"
    placeholder="Email Address"
    value={contactData.email}
    onChange={(e) => handleContactInputChange("email", e.target.value)}
    className="w-full border rounded-lg pl-10 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-400"
  />
</div>

    {contactFormErrors.email && (
      <p className="text-red-500 text-xs ml-1">{contactFormErrors.email}</p>
    )}
<div className="relative">
  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
  <input
    type="tel"
    placeholder="Mobile Number"
    value={contactData.mobile}
    onChange={(e) => handleContactInputChange("mobile", e.target.value)}
    className="w-full border rounded-lg pl-10 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-400"
  />
</div>

    {contactFormErrors.mobile && (
      <p className="text-red-500 text-xs ml-1">{contactFormErrors.mobile}</p>
    )}
  </div>

  {/* Button */}
  <button
    onClick={() => {handleGuestSubscription("individual");
   trackEvent("Subscription Initiated", { plan: "Individual", location: "Subscription Page" });
    }
    }
    
    
    disabled={isLoading}
    className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-lg py-2 font-semibold text-sm transition disabled:opacity-50"
  >
    {isLoading ? "Processing..." : "Subscribe Now"}
  </button>

  <p className="text-xs text-gray-700 font-semibold text-center mt-2">
    No Commitments Cancel Anytime
  </p>

  {/* Features */}
  <ul className="text-gray-700 text-sm mt-4 space-y-2">
    <li className="flex items-start gap-2">
      <span className="text-green-500">✔</span>
      <span>Unlimited Ad Scripts → <span className="text-gray-400">Never run out of proven hooks & CTAs that sell.</span></span>
    </li>
    <li className="flex items-start gap-2">
      <span className="text-green-500">✔</span>
      <span>Unlimited Storyboards → <span className="text-gray-400">Scroll-stopping creatives for higher CTR.</span></span>
    </li>
    <li className="flex items-start gap-2">
      <span className="text-green-500">✔</span>
      <span>Trained on ₹50Cr+ Ad Spend Data → <span className="text-gray-400">Tested angles, not guesswork.</span></span>
    </li>
    <li className="flex items-start gap-2">
      <span className="text-green-500">✔</span>
      <span>100% Money-Back Guarantee → <span className="text-gray-400">If 3 ads don’t perform, you get a full refund.</span></span>
    </li>
  </ul>

  {/* Auto account note */}
  <p className="text-xs text-gray-400 bg-gray-100 rounded px-3 py-2 mt-4 text-center">
    A user account will be created automatically. Login credentials will be sent to your email.
  </p>

  {/* Sign-in link */}
  <p className="text-xs text-gray-500 text-center mt-3">
    Already have an account?{" "}
    <button
      onClick={() => navigate("/login")}
      className="text-purple-600 hover:underline font-semibold"
    >
      Sign In
    </button>
  </p>
</div>


        ) : (
          // Regular subscription form for logged-in users
          <div>
            <p className="text-gray-500 mb-6">
              Unlock all features for just ₹1999 every month
            </p>

            {/* Contact information form for all users */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="Email address"
                  value={contactData.email}
                  onChange={(e) => handleContactInputChange('email', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    contactFormErrors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {contactFormErrors.email && (
                  <p className="text-red-500 text-sm mt-1">{contactFormErrors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  placeholder="Mobile number"
                  value={contactData.mobile}
                  onChange={(e) => handleContactInputChange('mobile', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    contactFormErrors.mobile ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {contactFormErrors.mobile && (
                  <p className="text-red-500 text-sm mt-1">{contactFormErrors.mobile}</p>
                )}
              </div>
            </div>

            <div className="mb-6">
              <span className="text-4xl font-semibold">₹1999</span>
              <span className="text-gray-500"> / month</span>
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
              disabled={isLoading}
              className="bg-black hover:bg-gray-800 text-white rounded-full px-6 py-3 font-medium transition duration-200 w-full disabled:opacity-50"
            >
              {isLoading ? "Processing..." : "Start Subscription"}
            </button>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default Subscription;
