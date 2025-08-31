import ReactPixel from 'react-facebook-pixel';

// Standard Facebook Pixel events
export const trackPixelEvent = (eventName: string, data?: object) => {
  try {
    if (import.meta.env.VITE_META_PIXEL_ID) {
      ReactPixel.track(eventName, data);
      console.log('Pixel event tracked:', eventName, data);
    }
  } catch (error) {
    console.error('Error tracking pixel event:', error);
  }
};

// Custom events for your app
export const trackCTAClick = (buttonName: string, location: string) => {
  trackPixelEvent('Lead', {
    content_name: buttonName,
    content_category: 'CTA Button',
    custom_location: location
  });
};

export const trackTryButtonClick = (location: string) => {
  trackPixelEvent('Lead', {
    content_name: 'Try Button',
    content_category: 'Trial',
    custom_location: location
  });
};

export const trackSubscriptionStart = (plan: string) => {
  trackPixelEvent('InitiateCheckout', {
    content_name: plan,
    content_category: 'Subscription',
    currency: 'INR'
  });
};

export const trackSubscriptionComplete = (plan: string, value: number) => {
  trackPixelEvent('Purchase', {
    content_name: plan,
    content_category: 'Subscription',
    currency: 'INR',
    value: value
  });
};

export const trackSignup = (method: string) => {
  trackPixelEvent('CompleteRegistration', {
    content_name: 'User Signup',
    content_category: 'Registration',
    custom_method: method
  });
};

export const trackLogin = (method: string) => {
  trackPixelEvent('Lead', {
    content_name: 'User Login',
    content_category: 'Authentication',
    custom_method: method
  });
};

export const trackPageView = (pageName: string) => {
  trackPixelEvent('PageView', {
    content_name: pageName
  });
};
