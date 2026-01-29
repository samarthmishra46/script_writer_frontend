import React, { useState, useEffect } from 'react';
import { Crown, Lock, AlertCircle } from 'lucide-react';
import { buildApiUrl } from '../config/api';
import type { User } from '../utils/userTypes';

interface MembershipCheckProps {
  children: React.ReactNode;
  requiredPlan?: 'individual' | 'organization';
  fallback?: React.ReactNode;
}

const MembershipCheck: React.FC<MembershipCheckProps> = ({ 
  children, 
  requiredPlan = 'individual',
  fallback 
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkMembership = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Please log in to access this feature');
          setLoading(false);
          return;
        }

        const response = await fetch(buildApiUrl('api/auth/me'), {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          setError('Please log in to access this feature');
          setLoading(false);
          return;
        }

        const userData = await response.json();
        setUser(userData);
        setLoading(false);
      } catch (error) {
        console.error('Membership verification error:', error);
        setError('Failed to verify membership');
        setLoading(false);
      }
    };

    checkMembership();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-800 mb-2">Access Restricted</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={() => window.location.href = '/login'}
          className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          Go to Login
        </button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <Lock className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">Login Required</h3>
        <p className="text-yellow-600 mb-4">Please log in to access this feature</p>
        <button
          onClick={() => window.location.href = '/login'}
          className="bg-yellow-600 text-white px-6 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
        >
          Login
        </button>
      </div>
    );
  }

  const derivePaidTrialStatus = () => {
    if (user.paidTrialStatus) {
      return user.paidTrialStatus;
    }
    if (user.paidTrial) {
      const { endDate, scriptsRemaining, imagesRemaining, isActive, hasExpired } = user.paidTrial;
      const end = endDate ? new Date(endDate) : undefined;
      const now = new Date();
      const daysRemaining = end ? Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))) : 0;
      return {
        isActive: !!isActive && !hasExpired,
        hasExpired: !!hasExpired,
        daysRemaining,
        usage: {
          scripts: scriptsRemaining ?? 0,
          images: imagesRemaining ?? 0
        }
      };
    }
    return undefined;
  };

  const paidTrialStatus = derivePaidTrialStatus();
  const hasActivePaidTrial = Boolean(paidTrialStatus?.isActive);

  const planHierarchy: Record<string, number> = { unsubscribed: 0, free: 0, individual: 1, organization: 2 };
  const userPlan = user.subscription?.plan || 'unsubscribed';
  let userPlanLevel = planHierarchy[userPlan] ?? 0;
  const requiredPlanLevel = planHierarchy[requiredPlan] || 1;

  if (hasActivePaidTrial) {
    userPlanLevel = Math.max(userPlanLevel, planHierarchy.individual);
  }

  if (userPlanLevel < requiredPlanLevel) {
    return fallback || (
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-8 text-center">
        <Crown className="w-16 h-16 text-purple-500 mx-auto mb-6" />
        <h3 className="text-2xl font-bold text-purple-800 mb-4">
          Upgrade to {requiredPlan.charAt(0).toUpperCase() + requiredPlan.slice(1)} Plan
        </h3>
        <p className="text-purple-600 mb-6 text-lg">
          This feature requires an {requiredPlan} membership or higher.
        </p>
        <div className="space-y-4">
          <div className="bg-white rounded-lg p-4 border border-purple-200">
            <h4 className="font-semibold text-purple-800 mb-2">Current Plan: {userPlan.charAt(0).toUpperCase() + userPlan.slice(1)}</h4>
            <p className="text-gray-600 text-sm">
              {userPlan === 'free' ? 'Limited features available' : 'Some features available'}
            </p>
          </div>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            View Plans
          </button>
        </div>
      </div>
    );
  }

  if (user.subscription?.status !== 'active') {
    if (hasActivePaidTrial) {
      return (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <Crown className="w-12 h-12 text-blue-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-blue-800 mb-2">Paid Trial Active</h3>
          <p className="text-blue-600 mb-4">
            You have temporary premium access while we finish activating your subscription. Remaining trial LiPiCoins will appear below.
          </p>
          <div className="flex justify-center gap-4 text-sm">
            <div className="bg-white rounded-lg px-4 py-3 border border-blue-200">
              <p className="font-semibold text-blue-700">Scripts</p>
              <p className="text-blue-600">{paidTrialStatus?.usage?.scripts ?? user.paidTrial?.scriptsRemaining ?? 0} left</p>
            </div>
            <div className="bg-white rounded-lg px-4 py-3 border border-blue-200">
              <p className="font-semibold text-blue-700">Images</p>
              <p className="text-blue-600">{paidTrialStatus?.usage?.images ?? user.paidTrial?.imagesRemaining ?? 0} left</p>
            </div>
          </div>
        </div>
      );
    }

    // For non-active subscriptions without paid trial, redirect to payment page
    return (
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 text-center">
        <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-orange-800 mb-2">Subscription Required</h3>
        <p className="text-orange-600 mb-4">Your subscription is not active. Subscribe now to access premium features.</p>
        <button
          onClick={() => window.location.href = '/subscription'}
          className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors"
        >
          Subscribe for ₹1,999
        </button>
      </div>
    );
  }
  
  // Calculate remaining days for active subscriptions
  if (user.subscription?.status === 'active' && user.subscription?.endDate) {
    const endDate = new Date(user.subscription.endDate);
    const currentDate = new Date();
    const remainingDays = Math.ceil((endDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (remainingDays > 0) {
      // Show the days left banner for active subscribers
      return (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Crown className="w-5 h-5 text-green-500 mr-3" />
              <div>
                <h3 className="font-medium text-green-800">
                  You are subscribed!
                </h3>
                <p className="text-green-600 text-sm">
                  {remainingDays} days remaining in your subscription
                </p>
              </div>
            </div>
            <div>
              {children}
            </div>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
};

export default MembershipCheck; 