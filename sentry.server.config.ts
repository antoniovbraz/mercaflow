// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://21e456bf4235ce4074c6210fa6ed6cbe@o4510167006707712.ingest.us.sentry.io/4510167064969216",

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1,

  // Enable logs to be sent to Sentry
  enableLogs: true,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

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
});
