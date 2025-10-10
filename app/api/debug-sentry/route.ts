/**
 * Debug Sentry Endpoint
 * 
 * Teste a integração do Sentry forçando um erro controlado
 * Acesse: /api/debug-sentry
 */

import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Log info about the test
    console.log('🧪 Testing Sentry integration...');

    // Capture a message
    Sentry.captureMessage('Sentry test endpoint called', 'info');

    // Throw an error to test error tracking
    throw new Error('🧪 This is a test error from /api/debug-sentry to validate Sentry integration');
  } catch (error) {
    // Capture the error explicitly
    Sentry.captureException(error, {
      tags: {
        endpoint: '/api/debug-sentry',
        test: true,
      },
      extra: {
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
      },
    });

    // Return error info
    return NextResponse.json({
      error: 'Test error captured by Sentry',
      message: error instanceof Error ? error.message : 'Unknown error',
      sentryConfigured: true,
      instructions: [
        '✅ Check your Sentry dashboard at sentry.io',
        '✅ Look for the error with tag: test=true',
        '✅ You should see source maps and full stack trace',
      ],
    }, { status: 500 });
  }
}
