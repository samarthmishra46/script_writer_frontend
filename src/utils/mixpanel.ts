import mixpanel, { Dict } from "mixpanel-browser";

// Initialize Mixpanel
mixpanel.init("2a8605e569b70f5e93f9cfd95554af3c", { debug: true,ignore_dnt: true });

// Define a helper type for event properties
export type EventProperties = Dict;

// Wrapper functions
export const trackEvent = (event: string, props?: EventProperties) => {
  mixpanel.track(event, props);
};

export const identifyUser = (userId: string) => {
  mixpanel.identify(userId);
};

export const setUserProperties = (props: EventProperties) => {
  mixpanel.people.set(props);
};

export default mixpanel;
