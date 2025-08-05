import React from 'react';
import { Link } from 'react-router-dom';

interface HeaderProps {
  campaignName?: string;
  onCampaignNameChange?: (name: string) => void;
}

const Header: React.FC<HeaderProps> = () => {
  // Get user data to check subscription status
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const hasActiveSubscription = user?.subscription?.status === 'active';

  return (
    <div className="px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - empty or can be used for breadcrumbs */}
        <div className="flex items-center space-x-6">
          {/* Removed Untitled dropdown as requested */}
        </div>

        {/* Navigation Links */}
        <div className="flex items-center space-x-6">
          {/* Show subscription link only for non-subscribers */}
          {!hasActiveSubscription && (
            <Link
              to="/subscription"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Subscription
            </Link>
          )}
          <Link
            to="/support"
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            Contact Support
          </Link>
          <button className="px-4 py-2 bg-blue-500/20 text-blue-600 rounded-full hover:bg-blue-500/30 transition-colors backdrop-blur-sm">
            Book A Shoot
          </button>
          <button className="px-4 py-2 bg-blue-500/20 text-blue-600 rounded-full hover:bg-blue-500/30 transition-colors backdrop-blur-sm">
            Request Expert Intervention
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header;