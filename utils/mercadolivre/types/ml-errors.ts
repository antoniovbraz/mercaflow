/**
 * Custom Error Classes for Mercado Livre Integration
 */

// ============================================================================
// BASE ML ERROR
// ============================================================================

export class MLError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'MLError';
    Object.setPrototypeOf(this, MLError.prototype);
  }
}

// ============================================================================
// ML API ERRORS
// ============================================================================

export class MLApiError extends MLError {
  constructor(
    message: string,
    public statusCode: number,
    public response?: unknown,
    code?: string
  ) {
    super(message, code, response);
    this.name = 'MLApiError';
    Object.setPrototypeOf(this, MLApiError.prototype);
  }
}

export class MLRateLimitError extends MLApiError {
  constructor(
    message: string = 'ML API rate limit exceeded',
    public retryAfter?: number // seconds
  ) {
    super(message, 429, { retryAfter }, 'RATE_LIMIT');
    this.name = 'MLRateLimitError';
    Object.setPrototypeOf(this, MLRateLimitError.prototype);
  }
}

export class MLNotFoundError extends MLApiError {
  constructor(
    resource: string,
    public resourceId?: string
  ) {
    super(`ML resource not found: ${resource}`, 404, { resource, resourceId }, 'NOT_FOUND');
    this.name = 'MLNotFoundError';
    Object.setPrototypeOf(this, MLNotFoundError.prototype);
  }
}

export class MLUnauthorizedError extends MLApiError {
  constructor(
    message: string = 'ML API unauthorized - invalid or expired token'
  ) {
    super(message, 401, undefined, 'UNAUTHORIZED');
    this.name = 'MLUnauthorizedError';
    Object.setPrototypeOf(this, MLUnauthorizedError.prototype);
  }
}

export class MLForbiddenError extends MLApiError {
  constructor(
    message: string = 'ML API forbidden - insufficient permissions'
  ) {
    super(message, 403, undefined, 'FORBIDDEN');
    this.name = 'MLForbiddenError';
    Object.setPrototypeOf(this, MLForbiddenError.prototype);
  }
}

export class MLBadRequestError extends MLApiError {
  constructor(
    message: string,
    public validationErrors?: unknown
  ) {
    super(message, 400, validationErrors, 'BAD_REQUEST');
    this.name = 'MLBadRequestError';
    Object.setPrototypeOf(this, MLBadRequestError.prototype);
  }
}

// ============================================================================
// ML TOKEN ERRORS
// ============================================================================

export class MLTokenError extends MLError {
  constructor(
    message: string,
    code?: string,
    details?: unknown
  ) {
    super(message, code, details);
    this.name = 'MLTokenError';
    Object.setPrototypeOf(this, MLTokenError.prototype);
  }
}

export class MLTokenExpiredError extends MLTokenError {
  constructor(
    message: string = 'ML access token expired',
    public expiresAt?: string
  ) {
    super(message, 'TOKEN_EXPIRED', { expiresAt });
    this.name = 'MLTokenExpiredError';
    Object.setPrototypeOf(this, MLTokenExpiredError.prototype);
  }
}

export class MLTokenRefreshError extends MLTokenError {
  constructor(
    message: string = 'Failed to refresh ML access token',
    public originalError?: unknown
  ) {
    super(message, 'TOKEN_REFRESH_FAILED', originalError);
    this.name = 'MLTokenRefreshError';
    Object.setPrototypeOf(this, MLTokenRefreshError.prototype);
  }
}

export class MLTokenEncryptionError extends MLTokenError {
  constructor(
    message: string = 'Failed to encrypt/decrypt ML token',
    public operation?: 'encrypt' | 'decrypt'
  ) {
    super(message, 'TOKEN_ENCRYPTION_FAILED', { operation });
    this.name = 'MLTokenEncryptionError';
    Object.setPrototypeOf(this, MLTokenEncryptionError.prototype);
  }
}

// ============================================================================
// ML SYNC ERRORS
// ============================================================================

export class MLSyncError extends MLError {
  constructor(
    message: string,
    public syncType?: string,
    public failedItems?: number,
    details?: unknown
  ) {
    super(message, 'SYNC_ERROR', details);
    this.name = 'MLSyncError';
    Object.setPrototypeOf(this, MLSyncError.prototype);
  }
}

export class MLPartialSyncError extends MLSyncError {
  constructor(
    syncType: string,
    public syncedItems: number,
    public failedItems: number,
    public errors: Array<{ item_id?: string; error: string }>
  ) {
    super(
      `Partial sync failure: ${syncedItems} synced, ${failedItems} failed`,
      syncType,
      failedItems,
      { syncedItems, errors }
    );
    this.name = 'MLPartialSyncError';
    Object.setPrototypeOf(this, MLPartialSyncError.prototype);
  }
}

// ============================================================================
// ML INTEGRATION ERRORS
// ============================================================================

export class MLIntegrationError extends MLError {
  constructor(
    message: string,
    code?: string,
    details?: unknown
  ) {
    super(message, code, details);
    this.name = 'MLIntegrationError';
    Object.setPrototypeOf(this, MLIntegrationError.prototype);
  }
}

export class MLIntegrationNotFoundError extends MLIntegrationError {
  constructor(
    public integrationId?: string
  ) {
    super(
      'ML integration not found',
      'INTEGRATION_NOT_FOUND',
      { integrationId }
    );
    this.name = 'MLIntegrationNotFoundError';
    Object.setPrototypeOf(this, MLIntegrationNotFoundError.prototype);
  }
}

export class MLIntegrationInactiveError extends MLIntegrationError {
  constructor(
    public integrationId: string,
    public status: string
  ) {
    super(
      `ML integration is not active: ${status}`,
      'INTEGRATION_INACTIVE',
      { integrationId, status }
    );
    this.name = 'MLIntegrationInactiveError';
    Object.setPrototypeOf(this, MLIntegrationInactiveError.prototype);
  }
}

// ============================================================================
// ML WEBHOOK ERRORS
// ============================================================================

export class MLWebhookError extends MLError {
  constructor(
    message: string,
    public topic?: string,
    public resource?: string,
    details?: unknown
  ) {
    super(message, 'WEBHOOK_ERROR', details);
    this.name = 'MLWebhookError';
    Object.setPrototypeOf(this, MLWebhookError.prototype);
  }
}

export class MLWebhookProcessingError extends MLWebhookError {
  constructor(
    message: string,
    topic: string,
    resource: string,
    public originalError?: unknown
  ) {
    super(message, topic, resource, originalError);
    this.name = 'MLWebhookProcessingError';
    Object.setPrototypeOf(this, MLWebhookProcessingError.prototype);
  }
}

// ============================================================================
// ML VALIDATION ERRORS
// ============================================================================

export class MLValidationError extends MLError {
  constructor(
    message: string,
    public field?: string,
    public value?: unknown
  ) {
    super(message, 'VALIDATION_ERROR', { field, value });
    this.name = 'MLValidationError';
    Object.setPrototypeOf(this, MLValidationError.prototype);
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Convert unknown error to MLError
 */
export function toMLError(error: unknown): MLError {
  if (error instanceof MLError) {
    return error;
  }
  
  if (error instanceof Error) {
    return new MLError(error.message, undefined, error);
  }
  
  return new MLError(String(error));
}

/**
 * Check if error is retryable (temporary failure)
 */
export function isRetryableError(error: unknown): boolean {
  if (error instanceof MLRateLimitError) {
    return true;
  }
  
  if (error instanceof MLApiError) {
    // Retry on 5xx errors (server errors)
    return error.statusCode >= 500 && error.statusCode < 600;
  }
  
  // Retry on network errors
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes('network') ||
      message.includes('timeout') ||
      message.includes('econnrefused') ||
      message.includes('enotfound')
    );
  }
  
  return false;
}

/**
 * Check if error requires token refresh
 */
export function requiresTokenRefresh(error: unknown): boolean {
  return (
    error instanceof MLUnauthorizedError ||
    error instanceof MLTokenExpiredError
  );
}
