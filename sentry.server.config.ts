/**
 * Sentry Server Configuration
 * Tracks errors and performance on the server
 */

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  // Get your DSN from https://sentry.io/settings/projects/YOUR_PROJECT/keys/
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // Capture unhandled promise rejections
  integrations: [
    Sentry.captureConsoleIntegration({
      levels: ['error'],
    }),
  ],

  // Filter sensitive data
  beforeSend(event) {
    // Remove sensitive headers
    if (event.request?.headers) {
      delete event.request.headers['authorization'];
      delete event.request.headers['cookie'];
    }

    // Remove sensitive query params
    if (event.request?.query_string) {
      const query = new URLSearchParams(event.request.query_string);
      if (query.has('access_token')) {
        query.delete('access_token');
        event.request.query_string = query.toString();
      }
    }

    return event;
  },

  // Add custom tags
  initialScope: {
    tags: {
      app: 'mercaflow',
      environment: process.env.NODE_ENV || 'development',
      runtime: 'node',
    },
  },
});
