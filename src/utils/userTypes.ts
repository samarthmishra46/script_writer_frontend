import React from 'react';

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
  subscriptionStatus?: 'active' | 'inactive' | 'expired' | 'cancelled' | 'trial';
  subscriptionExpiry?: string;
  subscriptionTier?: 'free' | 'individual' | 'organization';
  subscription?: {
    plan?: 'free' | 'individual' | 'organization';
    status?: 'active' | 'inactive' | 'expired' | 'cancelled';
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
  // Check if hasActiveSubscription flag exists and is set to false
  if (user.hasActiveSubscription === false) {
    return true;
  }
  
  // Check if subscription status is expired or inactive
  if (
    user.subscriptionStatus === 'expired' || 
    user.subscriptionStatus === 'inactive' ||
    user.subscription?.status === 'expired' ||
    user.subscription?.status === 'inactive'
  ) {
    return true;
  }
  
  // Check if subscription has expired based on date
  const expiryDateStr = user.subscriptionExpiry || user.subscription?.endDate;
  if (typeof expiryDateStr === 'string') {
    const expiryDate = new Date(expiryDateStr);
    const currentDate = new Date();
    if (expiryDate < currentDate) {
      return true;
    }
  }
  
  // Default behavior if none of the above conditions are met:
  // - If user has active subscription flag, don't redirect
  // - If subscription status is active, don't redirect
  // - If subscription.isValid is explicitly set to true, don't redirect
  // - If no subscription info available, redirect to subscription page
  return !(
    user.hasActiveSubscription === true || 
    user.subscriptionStatus === 'active' ||
    user.subscription?.status === 'active' ||
    user.subscription?.isValid === true
  );
};
