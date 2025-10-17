import React from 'react';
import { Clock, AlertTriangle, Star } from 'lucide-react';
import { User } from '../utils/userTypes';

interface TrialStatusProps {
  user: User;
  onUpgrade?: () => void;
  showDetailed?: boolean;
}

const TrialStatus: React.FC<TrialStatusProps> = ({ 
  user, 
  onUpgrade, 
  showDetailed = false 
}) => {
  const subscription = user.subscription || {};
  const derivePaidTrialStatus = () => {
    if (user.paidTrialStatus) {
      return user.paidTrialStatus;
    }

    const paidTrial = user.paidTrial;
    if (!paidTrial) {
      return undefined;
    }

    const endDateString = paidTrial.endDate;
    const endDate = endDateString ? new Date(endDateString) : undefined;
    const now = new Date();
    const daysRemaining = endDate
      ? Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
      : 0;

    return {
      isActive: !!paidTrial.isActive && !paidTrial.hasExpired,
      hasExpired: !!paidTrial.hasExpired,
      daysRemaining,
      endDate: endDateString,
      usage: {
        scripts: paidTrial.scriptsRemaining ?? 0,
        images: paidTrial.imagesRemaining ?? 0
      }
    };
  };

  const paidTrialStatus = derivePaidTrialStatus();
  const freeTrialStatus = user.trialStatus;

  const hasActivePaidPlan = subscription.status === 'active' &&
    (subscription.plan === 'individual' || subscription.plan === 'organization');

  const isPaidTrialActive = Boolean(paidTrialStatus?.isActive);

  // If user has an active paid subscription and is not in a paid trial window, hide the banner
  if (hasActivePaidPlan && !isPaidTrialActive) {
    return null;
  }

  if (isPaidTrialActive) {
    const daysRemaining = paidTrialStatus?.daysRemaining ?? 0;
    const usage = paidTrialStatus?.usage ?? {};
    const scriptsRemaining = usage.scripts ?? user.paidTrial?.scriptsRemaining ?? 0;
    const imagesRemaining = usage.images ?? user.paidTrial?.imagesRemaining ?? 0;

    return (
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4 mb-4">
        <div className="flex items-start space-x-3">
          <Star className="h-5 w-5 text-purple-500 mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-sm font-semibold text-purple-800">
                3-Day Paid Trial Active
              </h3>
              <span className="text-xs px-2 py-1 rounded-full bg-white text-purple-700 font-medium border border-purple-100">
                {daysRemaining} day{daysRemaining !== 1 ? 's' : ''} left
              </span>
            </div>
            <p className="text-xs text-purple-700 mt-2">
              Enjoy premium access while we complete your first billing cycle. Full credits unlock automatically after this trial.
            </p>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-white/60 rounded-lg p-3 border border-purple-100">
                <p className="text-xs text-purple-600 uppercase tracking-wide">Scripts</p>
                <p className="text-lg font-semibold text-purple-900">{scriptsRemaining}</p>
                <p className="text-xs text-purple-500">trial credits remaining</p>
              </div>
              <div className="bg-white/60 rounded-lg p-3 border border-purple-100">
                <p className="text-xs text-purple-600 uppercase tracking-wide">Images</p>
                <p className="text-lg font-semibold text-purple-900">{imagesRemaining}</p>
                <p className="text-xs text-purple-500">trial credits remaining</p>
              </div>
            </div>
            <div className="mt-3 text-xs text-purple-600">
              We’ll transition you to full plan credits automatically after the trial window completes.
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!freeTrialStatus) {
    return null;
  }

  const { isActive, hasExpired, daysRemaining, usage } = freeTrialStatus;

  if (hasExpired) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-red-800">
              Free Trial Expired
            </h3>
            <p className="text-sm text-red-600 mt-1">
              Your 7-day free trial has ended. Upgrade to continue using all features.
            </p>
          </div>
          {onUpgrade && (
            <button
              onClick={onUpgrade}
              className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
            >
              Upgrade Now
            </button>
          )}
        </div>
      </div>
    );
  }

  if (isActive) {
    const isUrgent = daysRemaining <= 2;
    const bgColor = isUrgent ? 'bg-yellow-50 border-yellow-200' : 'bg-blue-50 border-blue-200';
    const textColor = isUrgent ? 'text-yellow-800' : 'text-blue-800';
    const iconColor = isUrgent ? 'text-yellow-500' : 'text-blue-500';

    return (
      <div className={`${bgColor} border rounded-lg p-4 mb-4`}>
        <div className="flex items-start space-x-3">
          <Clock className={`h-5 w-5 ${iconColor} mt-0.5`} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className={`text-sm font-medium ${textColor}`}>
                Free Trial Active
              </h3>
              <span className={`text-xs px-2 py-1 rounded-full bg-white ${textColor} font-medium`}>
                {daysRemaining} day{daysRemaining !== 1 ? 's' : ''} left
              </span>
            </div>
            
            {showDetailed && (
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>Scripts</span>
                    <span className="font-medium">{usage.scripts} left</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Storyboards</span>
                    <span className="font-medium">{usage.storyboards} left</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>Videos</span>
                    <span className="font-medium">{usage.videos} left</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Images</span>
                    <span className="font-medium">{usage.images} left</span>
                  </div>
                </div>
              </div>
            )}
            
            <div className="mt-3 flex items-center justify-between">
              <p className={`text-xs ${textColor.replace('800', '600')}`}>
                {isUrgent 
                  ? "Trial ending soon! Upgrade to keep full access."
                  : "Enjoying the trial? Upgrade for unlimited access."
                }
              </p>
              {onUpgrade && (
                <button
                  onClick={onUpgrade}
                  className="flex items-center space-x-1 text-xs bg-purple-600 text-white px-3 py-1.5 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Star className="h-3 w-3" />
                  <span>Upgrade</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default TrialStatus;