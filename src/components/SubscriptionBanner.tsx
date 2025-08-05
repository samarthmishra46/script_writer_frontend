import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, Clock } from 'lucide-react';
import { buildApiUrl } from '../config/api';

interface SubscriptionInfo {
  plan: string;
  status: string;
  endDate?: string;
  isValid?: boolean;
  remainingDays?: number;
}

const SubscriptionBanner: React.FC = () => {
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
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
      } catch (err) {
        console.error('Error fetching subscription:', err);
        setError('Failed to load subscription information');
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, []);

  if (loading) {
    return <div className="h-1 w-full bg-gray-200 animate-pulse"></div>;
  }

  if (error || !subscription) {
    return null;
  }

  // Free plan - show upgrade banner
  if (subscription.plan === 'free') {
    return (
      <div className="mb-6 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-4">
              <Crown className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-medium text-purple-800">
                Upgrade to Premium
              </h3>
              <p className="text-purple-600 text-sm">
                Get unlimited scripts and premium features for just ₹1,999/month
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/subscription')}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-300"
          >
            Upgrade Now
          </button>
        </div>
      </div>
    );
  }

  // Expired subscription - show renewal banner
  if (subscription.status === 'expired') {
    return (
      <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-4">
              <Clock className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="font-medium text-red-800">
                Subscription Expired
              </h3>
              <p className="text-red-600 text-sm">
                Your premium features are no longer available. Renew now for ₹1,999/month
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/subscription')}
            className="bg-gradient-to-r from-red-600 to-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-red-700 hover:to-orange-700 transition-all duration-300"
          >
            Renew Now
          </button>
        </div>
      </div>
    );
  }

  // Active subscription - show days remaining
  if (subscription.status === 'active' && subscription.remainingDays !== undefined) {
    return (
      <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-4">
              <Crown className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-medium text-green-800">
                You are subscribed to {subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)} plan
              </h3>
              <p className="text-green-600 text-sm">
                {subscription.remainingDays} days remaining in your subscription
              </p>
            </div>
          </div>
          <div className="flex items-center text-green-600">
            <Clock className="w-4 h-4 mr-1" />
            <span className="text-sm font-medium">Active</span>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default SubscriptionBanner;
