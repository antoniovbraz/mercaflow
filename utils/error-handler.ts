/**
 * Error Handler Utility for ML API Routes
 * 
 * Standardizes error handling across all ML API endpoints following
 * Mercado Livre API documentation and best practices.
 * 
 * Features:
 * - ML-specific error detection (429, 401, 403, 404, 400)
 * - Structured error responses
 * - Sentry integration with ML context
 * - User-friendly error messages
 * - Recovery suggestions
 * 
 * @module utils/error-handler
 */

import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { logger } from '@/utils/logger';
import {
  MLError,
  MLApiError,
  MLRateLimitError,
  MLUnauthorizedError,
  MLForbiddenError,
  MLNotFoundError,
  MLBadRequestError,
  MLTokenError,
  MLIntegrationError,
  MLSyncError,
  MLWebhookError,
  MLValidationError,
} from '@/utils/mercadolivre/types/ml-errors';

// ============================================================================
// TYPES
// ============================================================================

export interface ErrorContext {
  userId?: string;
  tenantId?: string;
  integrationId?: string;
  mlUserId?: string;
  endpoint?: string;
  method?: string;
  [key: string]: unknown;
}

export interface ErrorResponse {
  error: string;
  statusCode?: number;
  retryAfter?: number;
  suggestion?: string;
  code?: string;
  details?: unknown;
}

// ============================================================================
// ERROR HANDLER
// ============================================================================

/**
 * Handle ML API errors with structured logging and Sentry integration
 * 
 * @example
 * try {
 *   // ... ML API call
 * } catch (error) {
 *   return handleMLError(error, { userId: user.id, endpoint: '/api/ml/products' });
 * }
 */
export function handleMLError(
  error: unknown,
  context: ErrorContext = {}
): NextResponse<ErrorResponse> {
  // Log error with context
  logger.error('ML API Error', {
    error,
    context,
    errorType: error instanceof Error ? error.constructor.name : typeof error,
  });

  // ============================================================================
  // ML RATE LIMIT ERROR (429)
  // ============================================================================
  if (error instanceof MLRateLimitError) {
    // Capture in Sentry with ML context
    Sentry.captureException(error, {
      level: 'warning',
      tags: {
        ml_error_type: 'rate_limit',
        ml_status: 429,
      },
      contexts: {
        ml_context: {
          ...context,
          retry_after: error.retryAfter,
        },
      },
    });

    return NextResponse.json<ErrorResponse>(
      {
        error: 'Rate limit exceeded',
        statusCode: 429,
        retryAfter: error.retryAfter || 60,
        suggestion: `Too many requests. Please wait ${error.retryAfter || 60} seconds before retrying.`,
        code: 'RATE_LIMIT',
      },
      { status: 429 }
    );
  }

  // ============================================================================
  // ML UNAUTHORIZED ERROR (401)
  // ============================================================================
  if (error instanceof MLUnauthorizedError || error instanceof MLTokenError) {
    Sentry.captureException(error, {
      level: 'error',
      tags: {
        ml_error_type: 'unauthorized',
        ml_status: 401,
      },
      contexts: {
        ml_context: context,
      },
    });

    return NextResponse.json<ErrorResponse>(
      {
        error: 'Mercado Livre authentication failed',
        statusCode: 401,
        suggestion: 'Your Mercado Livre connection expired. Please reconnect your account in Settings > Integrations.',
        code: 'UNAUTHORIZED',
      },
      { status: 401 }
    );
  }

  // ============================================================================
  // ML FORBIDDEN ERROR (403)
  // ============================================================================
  if (error instanceof MLForbiddenError) {
    Sentry.captureException(error, {
      level: 'error',
      tags: {
        ml_error_type: 'forbidden',
        ml_status: 403,
      },
      contexts: {
        ml_context: context,
      },
    });

    return NextResponse.json<ErrorResponse>(
      {
        error: 'Insufficient permissions',
        statusCode: 403,
        suggestion: 'You don\'t have permission to access this resource. Please check your Mercado Livre account permissions.',
        code: 'FORBIDDEN',
      },
      { status: 403 }
    );
  }

  // ============================================================================
  // ML NOT FOUND ERROR (404)
  // ============================================================================
  if (error instanceof MLNotFoundError) {
    Sentry.captureException(error, {
      level: 'warning',
      tags: {
        ml_error_type: 'not_found',
        ml_status: 404,
      },
      contexts: {
        ml_context: context,
      },
    });

    return NextResponse.json<ErrorResponse>(
      {
        error: 'Resource not found',
        statusCode: 404,
        suggestion: 'The requested resource was not found on Mercado Livre.',
        code: 'NOT_FOUND',
        details: error.response,
      },
      { status: 404 }
    );
  }

  // ============================================================================
  // ML BAD REQUEST ERROR (400)
  // ============================================================================
  if (error instanceof MLBadRequestError) {
    Sentry.captureException(error, {
      level: 'warning',
      tags: {
        ml_error_type: 'bad_request',
        ml_status: 400,
      },
      contexts: {
        ml_context: context,
      },
    });

    return NextResponse.json<ErrorResponse>(
      {
        error: 'Invalid request parameters',
        statusCode: 400,
        suggestion: 'Please check your request parameters and try again.',
        code: 'BAD_REQUEST',
        details: error.response,
      },
      { status: 400 }
    );
  }

  // ============================================================================
  // ML VALIDATION ERROR
  // ============================================================================
  if (error instanceof MLValidationError) {
    Sentry.captureException(error, {
      level: 'warning',
      tags: {
        ml_error_type: 'validation',
      },
      contexts: {
        ml_context: {
          ...context,
          field: error.field,
          value: error.value,
        },
      },
    });

    return NextResponse.json<ErrorResponse>(
      {
        error: error.message,
        statusCode: 400,
        suggestion: 'Please verify your input and try again.',
        code: 'VALIDATION_ERROR',
        details: { field: error.field, value: error.value },
      },
      { status: 400 }
    );
  }

  // ============================================================================
  // ML INTEGRATION ERROR
  // ============================================================================
  if (error instanceof MLIntegrationError) {
    Sentry.captureException(error, {
      level: 'error',
      tags: {
        ml_error_type: 'integration',
      },
      contexts: {
        ml_context: context,
      },
    });

    return NextResponse.json<ErrorResponse>(
      {
        error: 'Mercado Livre integration error',
        statusCode: 400,
        suggestion: 'Please check your Mercado Livre integration settings.',
        code: error.code || 'INTEGRATION_ERROR',
        details: error.details,
      },
      { status: 400 }
    );
  }

  // ============================================================================
  // ML SYNC ERROR
  // ============================================================================
  if (error instanceof MLSyncError) {
    Sentry.captureException(error, {
      level: 'error',
      tags: {
        ml_error_type: 'sync',
        ml_sync_type: error.syncType,
      },
      contexts: {
        ml_context: {
          ...context,
          sync_type: error.syncType,
          failed_items: error.failedItems,
        },
      },
    });

    return NextResponse.json<ErrorResponse>(
      {
        error: 'Synchronization failed',
        statusCode: 500,
        suggestion: 'Please try syncing again. If the problem persists, contact support.',
        code: 'SYNC_ERROR',
        details: error.details,
      },
      { status: 500 }
    );
  }

  // ============================================================================
  // ML WEBHOOK ERROR
  // ============================================================================
  if (error instanceof MLWebhookError) {
    Sentry.captureException(error, {
      level: 'error',
      tags: {
        ml_error_type: 'webhook',
        ml_topic: error.topic,
      },
      contexts: {
        ml_context: {
          ...context,
          topic: error.topic,
          resource: error.resource,
        },
      },
    });

    return NextResponse.json<ErrorResponse>(
      {
        error: 'Webhook processing failed',
        statusCode: 500,
        suggestion: 'Webhook will be retried automatically.',
        code: 'WEBHOOK_ERROR',
      },
      { status: 500 }
    );
  }

  // ============================================================================
  // GENERIC ML API ERROR
  // ============================================================================
  if (error instanceof MLApiError) {
    Sentry.captureException(error, {
      level: 'error',
      tags: {
        ml_error_type: 'api_error',
        ml_status: error.statusCode,
      },
      contexts: {
        ml_context: {
          ...context,
          status_code: error.statusCode,
        },
      },
    });

    return NextResponse.json<ErrorResponse>(
      {
        error: error.message,
        statusCode: error.statusCode,
        suggestion: error.statusCode >= 500
          ? 'Mercado Livre is experiencing issues. Please try again later.'
          : 'Please check your request and try again.',
        code: error.code || 'API_ERROR',
      },
      { status: error.statusCode }
    );
  }

  // ============================================================================
  // GENERIC ML ERROR
  // ============================================================================
  if (error instanceof MLError) {
    Sentry.captureException(error, {
      level: 'error',
      tags: {
        ml_error_type: 'generic_ml_error',
      },
      contexts: {
        ml_context: context,
      },
    });

    return NextResponse.json<ErrorResponse>(
      {
        error: error.message,
        statusCode: 500,
        code: error.code || 'ML_ERROR',
        details: error.details,
      },
      { status: 500 }
    );
  }

  // ============================================================================
  // GENERIC ERROR (Non-ML)
  // ============================================================================
  Sentry.captureException(error, {
    level: 'error',
    tags: {
      ml_error_type: 'unknown',
    },
    contexts: {
      ml_context: context,
    },
  });

  return NextResponse.json<ErrorResponse>(
    {
      error: error instanceof Error ? error.message : 'Internal server error',
      statusCode: 500,
      suggestion: 'An unexpected error occurred. Please try again later.',
      code: 'INTERNAL_ERROR',
    },
    { status: 500 }
  );
}

// ============================================================================
// RESPONSE HELPERS
// ============================================================================

/**
 * Create a success response with consistent structure
 * 
 * @example
 * return createSuccessResponse({ products: data });
 */
export function createSuccessResponse<T>(
  data: T,
  meta?: { page?: number; total?: number; [key: string]: unknown }
): NextResponse<{ success: true; data: T; meta?: typeof meta }> {
  const response: { success: true; data: T; meta?: typeof meta } = {
    success: true,
    data,
  };

  if (meta) {
    response.meta = meta;
  }

  return NextResponse.json(response);
}

/**
 * Create an authentication error response
 */
export function createAuthErrorResponse(
  message: string = 'Authentication required'
): NextResponse<ErrorResponse> {
  return NextResponse.json<ErrorResponse>(
    {
      error: message,
      statusCode: 401,
      suggestion: 'Please sign in to access this resource.',
      code: 'UNAUTHORIZED',
    },
    { status: 401 }
  );
}

/**
 * Create a not found error response
 */
export function createNotFoundResponse(
  resource: string = 'Resource'
): NextResponse<ErrorResponse> {
  return NextResponse.json<ErrorResponse>(
    {
      error: `${resource} not found`,
      statusCode: 404,
      code: 'NOT_FOUND',
    },
    { status: 404 }
  );
}
