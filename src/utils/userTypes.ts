import React from 'react';

export interface CreditHistoryEntry {
  event?: string;
  amount?: number;
  balanceAfter?: number;
  reference?: string;
  feature?: string;
  description?: string;
  metadata?: Record<string, unknown>;
  createdAt?: string;
}

export interface UserCreditsSummary {
  balance: number;
  lifetimeGranted: number;
  lifetimeSpent: number;
  lastUpdated?: string;
  mostRecentEvent?: CreditHistoryEntry | null;
}

/**
 * User interface representing the structure of user data
 * This is used throughout the application for consistent typing
 */
export interface User {
  _id: string;
  id?: string; // Some APIs return id instead of _id
  name: string;
  email: string;
  profilePicture?: string;
  company?: string;
  role?: string;
  
  // Subscription related properties
  hasActiveSubscription?: boolean;
  subscriptionStatus?: 'active' | 'inactive' | 'expired' | 'cancelled' | 'trial' | 'created' | 'payment_pending' | 'payment_failed' | 'halted' | 'failed';
  subscriptionExpiry?: string;
  subscriptionTier?: 'free' | 'individual' | 'organization';
  subscription?: {
    plan?: 'unsubscribed' | 'free' | 'individual' | 'organization';
  status?: 'active' | 'inactive' | 'expired' | 'cancelled' | 'created' | 'payment_pending' | 'payment_failed' | 'halted' | 'failed';
    startDate?: string;
    endDate?: string;
    isValid?: boolean;
    message?: string;
    remainingDays?: number;
    razorpayCustomerId?: string;
    razorpaySubscriptionId?: string;
    razorpayPaymentId?: string;
    lastPayment?: {
      orderId: string;
      paymentId: string;
      plan: string;
      amount: number;
      currency: string;
      timestamp: string;
    };
    [key: string]: unknown;
  };
  paidTrial?: {
    isActive?: boolean;
    hasExpired?: boolean;
    startDate?: string;
    endDate?: string;
    durationDays?: number;
    scriptsRemaining?: number;
    imagesRemaining?: number;
    firstPaymentId?: string;
  };
  paidTrialStatus?: {
    isActive: boolean;
    hasExpired: boolean;
    daysRemaining: number;
    endDate?: string;
    usage?: {
      scripts?: number;
      images?: number;
    };
  };
  redirectTo?: string;
  
  // Usage metrics
  usage?: {
    scriptsGenerated?: number;
    scriptsGeneratedThisMonth?: number;
    storyboardsGenerated?: number;
    storyboardsGeneratedThisMonth?: number;
    lastResetDate?: string;
    limit?: number;
    percentage?: number;
    remaining?: number;
    hasExceeded?: boolean;
    [key: string]: unknown;
  };
  
  // User preferences
  preferences?: {
    theme?: 'light' | 'dark' | 'system';
    emailNotifications?: boolean;
    defaultScriptLanguage?: string;
    [key: string]: unknown;
  };
  
  // Free trial information
  freeTrial?: {
    scriptsRemaining?: number;
    storyboardsRemaining?: number;
    videosRemaining?: number;
    imagesRemaining?: number;
    isActive?: boolean;
    startDate?: string;
    endDate?: string;
    durationDays?: number;
    hasExpired?: boolean;
    remindersSent?: number;
  };
  
  // Trial status (computed on backend)
  trialStatus?: {
    isActive: boolean;
    hasExpired: boolean;
    daysRemaining: number;
    endDate: string;
    usage: {
      scripts: number;
      storyboards: number;
      videos: number;
      images: number;
    };
  };
  
  shouldShowUpgradePrompt?: boolean;

  credits?: UserCreditsSummary;
  
  // Authentication info
  authProvider?: 'email' | 'google' | 'github';
  googleId?: string;
  createdAt?: string;
  updatedAt?: string;
  
  // Add index signature for flexibility
  [key: string]: unknown;
}

/**
 * UserContext interface for the React Context
 */
export interface UserContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  isLoading: boolean;
  logout: () => void;
}

/**
 * Helper function to determine if user should be redirected to subscription page
 */
export const shouldRedirectToSubscription = (user: User): boolean => {
  if (!user) {
    return true;
  }

  if (typeof user.redirectTo === 'string') {
    return user.redirectTo === '/subscription';
  }

  const subscriptionPlan = user.subscription?.plan;
  const subscriptionStatus = user.subscription?.status;

  const hasActivePaidSubscription = subscriptionStatus === 'active' &&
    (subscriptionPlan === 'individual' || subscriptionPlan === 'organization');

  if (hasActivePaidSubscription) {
    return false;
  }

  const paidTrialStatus = user.paidTrialStatus ?? (user.paidTrial ? {
    isActive: !!user.paidTrial.isActive && !user.paidTrial.hasExpired,
    hasExpired: !!user.paidTrial.hasExpired
  } : undefined);

  if (paidTrialStatus?.isActive) {
    return false;
  }

  const freeTrialStatus = user.trialStatus;
  if (freeTrialStatus?.isActive) {
    return false;
  }

  return false;
};
