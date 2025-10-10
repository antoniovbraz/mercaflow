/**
 * Sentry Client Configuration
 * Tracks errors and performance in the browser
 */

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  // Get your DSN from https://sentry.io/settings/projects/YOUR_PROJECT/keys/
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
  // We recommend adjusting this value in production to reduce costs
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // Capture Replay for Sessions
  replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
  replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.

  integrations: [
    Sentry.replayIntegration({
      // Additional Replay configuration goes in here, for example:
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  // Filter out specific errors
  beforeSend(event, hint) {
    // Filter out non-error console logs
    if (event.level === 'info' || event.level === 'warning') {
      return null;
    }

    // Filter out specific errors you don't want to track
    const error = hint.originalException;
    if (error && typeof error === 'object' && 'message' in error) {
      const message = String(error.message);
      
      // Filter out common browser errors
      if (
        message.includes('ResizeObserver loop') ||
        message.includes('cancelled') ||
        message.includes('Failed to fetch')
      ) {
        return null;
      }
    }

    return event;
  },

  // Add custom tags
  initialScope: {
    tags: {
      app: 'mercaflow',
      environment: process.env.NODE_ENV || 'development',
    },
  },
});
