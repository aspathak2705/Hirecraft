/**
 * analytics.js
 * Analytics abstraction layer. Easily connects to PostHog, GA4, Mixpanel in future.
 */

export function trackEvent(eventName, eventProperties = {}) {
  const payload = {
    event: eventName,
    properties: {
      ...eventProperties,
      timestamp: new Date().toISOString()
    }
  };

  // Log in development / console telemetry
  if (import.meta.env.DEV || true) {
    console.log(`[Telemetry Event]: ${eventName}`, payload.properties);
  }

  // Window analytics hooks if integrated
  if (typeof window !== 'undefined') {
    if (window.gtag) {
      window.gtag('event', eventName, eventProperties);
    }
    if (window.posthog) {
      window.posthog.capture(eventName, eventProperties);
    }
  }
}
