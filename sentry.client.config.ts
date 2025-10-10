/**
 * Sentry Client Configuration - DISABLED
 * This file is disabled to avoid duplicate Sentry initialization.
 * Client-side Sentry is now configured in instrumentation-client.ts
 * to avoid "Multiple Sentry Session Replay instances" error
 */

// import * as Sentry from "@sentry/nextjs";

// DISABLED: All Sentry client initialization moved to instrumentation-client.ts
// This prevents the "Multiple Sentry Session Replay instances" error

// Sentry.init({
//   dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
//   tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
//   debug: false,
//   replaysOnErrorSampleRate: 1.0,
//   replaysSessionSampleRate: 0.1,
//   integrations: [
//     Sentry.replayIntegration({
//       maskAllText: true,
//       blockAllMedia: true,
//     }),
//   ],
//   beforeSend(event, hint) {
//     if (event.level === 'info' || event.level === 'warning') {
//       return null;
//     }
//
//     const error = hint.originalException;
//     if (error && typeof error === 'object' && 'message' in error) {
//       const message = String(error.message);
//
//       if (
//         message.includes('ResizeObserver loop') ||
//         message.includes('cancelled') ||
//         message.includes('Failed to fetch')
//       ) {
//         return null;
//       }
//     }
//
//     return event;
//   },
//   initialScope: {
//     tags: {
//       app: 'mercaflow',
//       environment: process.env.NODE_ENV || 'development',
//     },
//   },
// });
