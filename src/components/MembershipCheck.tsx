import React, { useState, useEffect } from 'react';
import { Crown, Lock, AlertCircle } from 'lucide-react';
import { buildApiUrl } from '../config/api';

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
  const [user, setUser] = useState<any>(null);
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
      } catch (err) {
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

  const planHierarchy = { free: 0, individual: 1, organization: 2 };
  const userPlan = user.subscription?.plan || 'free';
  const userPlanLevel = planHierarchy[userPlan] || 0;
  const requiredPlanLevel = planHierarchy[requiredPlan] || 1;

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
    return (
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 text-center">
        <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-orange-800 mb-2">Subscription Inactive</h3>
        <p className="text-orange-600 mb-4">Your subscription is not active. Please renew to access this feature.</p>
        <button
          onClick={() => window.location.href = '/dashboard'}
          className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  return <>{children}</>;
};

export default MembershipCheck; 