import React from 'react';
import { AlertCircle, Zap, Star } from 'lucide-react';
import { User } from '../utils/userTypes';

interface UsageWarningProps {
  user: User;
  featureType: 'scripts' | 'storyboards' | 'videos' | 'images';
  onUpgrade?: () => void;
}

const UsageWarning: React.FC<UsageWarningProps> = ({ 
  user, 
  featureType, 
  onUpgrade 
}) => {
  const subscription = user.subscription || {};
  const derivePaidTrialStatus = () => {
    if (user.paidTrialStatus) {
      return user.paidTrialStatus;
    }

    if (!user.paidTrial) {
      return undefined;
    }

    const { endDate, scriptsRemaining, imagesRemaining, isActive, hasExpired } = user.paidTrial;
    const end = endDate ? new Date(endDate) : undefined;
    const now = new Date();
    const daysRemaining = end ? Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))) : 0;

    return {
      isActive: !!isActive && !hasExpired,
      hasExpired: !!hasExpired,
      daysRemaining,
      endDate,
      usage: {
        scripts: scriptsRemaining ?? 0,
        images: imagesRemaining ?? 0
      }
    };
  };

  const paidTrialStatus = derivePaidTrialStatus();
  const freeTrialStatus = user.trialStatus;

  const hasActivePaidSubscription = subscription.status === 'active' && (subscription.plan === 'individual' || subscription.plan === 'organization');
  const isPaidTrialActive = Boolean(paidTrialStatus?.isActive);

  if (hasActivePaidSubscription && !isPaidTrialActive) {
    return null;
  }

  const activeTrial = isPaidTrialActive ? paidTrialStatus : freeTrialStatus;

  if (!activeTrial || activeTrial.hasExpired) {
    return null;
  }

  const usage = (activeTrial.usage || {}) as Record<string, number | undefined>;
  const remainingValue = usage[featureType];

  if (typeof remainingValue !== 'number') {
    return null;
  }

  const remaining = remainingValue;
  const daysRemaining = activeTrial.daysRemaining ?? 0;
  const trialLabel = isPaidTrialActive ? 'paid trial' : 'trial';
  const featureDisplayName = featureType.charAt(0).toUpperCase() + featureType.slice(1);

  // Show warning if user has low credits
  if (remaining <= 1) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-yellow-800">
              {remaining === 0 
                ? `No ${featureDisplayName} Credits Left`
                : `Last ${featureDisplayName} Credit`
              }
            </h3>
            <p className="text-sm text-yellow-700 mt-1">
              {remaining === 0 
                ? `You've used all your ${trialLabel} ${featureType} credits. Upgrade to continue creating.`
                : `You have ${remaining} ${featureType} credit left in your ${trialLabel}. Upgrade for unlimited access.`
              }
            </p>
            {onUpgrade && (
              <div className="mt-3 flex items-center space-x-2">
                <button
                  onClick={onUpgrade}
                  className="inline-flex items-center space-x-1 bg-purple-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
                >
                  <Star className="h-4 w-4" />
                  <span>Upgrade Now</span>
                </button>
                <span className="text-xs text-yellow-600">
                  Get unlimited {featureType} + all features
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Show info banner if user has some credits but trial is ending soon
  if (daysRemaining <= 2 && remaining > 0) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
        <div className="flex items-center space-x-2">
          <Zap className="h-4 w-4 text-blue-500" />
          <div className="flex-1">
            <p className="text-sm text-blue-800">
              <span className="font-medium">{remaining} {featureType}</span> credits left • 
              <span className="font-medium"> {daysRemaining} days</span> of {trialLabel} remaining
            </p>
          </div>
          {onUpgrade && (
            <button
              onClick={onUpgrade}
              className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition-colors"
            >
              Upgrade
            </button>
          )}
        </div>
      </div>
    );
  }

  return null;
};

export default UsageWarning;