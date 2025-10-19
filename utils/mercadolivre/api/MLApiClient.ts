/**
 * Mercado Livre API Client
 * 
 * HTTP client with:
 * - Retry logic with exponential backoff
 * - Timeout handling (30s default)
 * - Rate limiting (429 handling)
 * - Structured error handling
 * - Request/response logging
 * 
 * Based on ML API docs: https://developers.mercadolibre.com.ar/en_us/
 */

import { logger } from '@/utils/logger';
import {
  MLApiError,
  MLRateLimitError,
  MLUnauthorizedError,
  MLForbiddenError,
  MLNotFoundError,
  MLBadRequestError,
  isRetryableError,
} from '../types/ml-errors';

// ============================================================================
// CONSTANTS
// ============================================================================

const ML_API_BASE_URL = 'https://api.mercadolibre.com';
const DEFAULT_TIMEOUT = 30000; // 30 seconds
const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_RETRY_DELAY = 1000; // 1 second

// Exponential backoff multiplier
const RETRY_BACKOFF_MULTIPLIER = 2;

// ============================================================================
// TYPES
// ============================================================================

export interface MLApiClientConfig {
  baseUrl?: string;
  timeout?: number;
  maxRetries?: number;
  retryDelay?: number;
}

export interface MLRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: unknown;
  params?: Record<string, string | number | boolean>;
  accessToken?: string;
  timeout?: number;
  skipRetry?: boolean;
}

export interface MLApiResponse<T = unknown> {
  data: T;
  status: number;
  headers: Headers;
}

// ============================================================================
// ML API CLIENT CLASS
// ============================================================================

export class MLApiClient {
  private baseUrl: string;
  private timeout: number;
  private maxRetries: number;
  private retryDelay: number;

  constructor(config: MLApiClientConfig = {}) {
    this.baseUrl = config.baseUrl || ML_API_BASE_URL;
    this.timeout = config.timeout || DEFAULT_TIMEOUT;
    this.maxRetries = config.maxRetries || DEFAULT_MAX_RETRIES;
    this.retryDelay = config.retryDelay || DEFAULT_RETRY_DELAY;
  }

  /**
   * Make HTTP request to ML API
   */
  async request<T = unknown>(
    endpoint: string,
    options: MLRequestOptions = {}
  ): Promise<MLApiResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      body,
      params,
      accessToken,
      timeout = this.timeout,
      skipRetry = false,
    } = options;

    // Build URL with query params
    const url = this.buildUrl(endpoint, params);

    // Build headers
    const requestHeaders = this.buildHeaders(headers, accessToken);

    // Build fetch options
    const fetchOptions: RequestInit = {
      method,
      headers: requestHeaders,
      signal: AbortSignal.timeout(timeout),
    };

    // Add body for POST/PUT/PATCH
    if (body && ['POST', 'PUT', 'PATCH'].includes(method)) {
      fetchOptions.body = JSON.stringify(body);
    }

    // Log request
    logger.info('ML API Request', {
      method,
      url: this.sanitizeUrl(url),
      hasAccessToken: !!accessToken,
    });

    // Execute request with retry logic
    let lastError: Error | undefined;
    const maxAttempts = skipRetry ? 1 : this.maxRetries + 1;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const response = await fetch(url, fetchOptions);

        // Log response
        logger.info('ML API Response', {
          method,
          url: this.sanitizeUrl(url),
          status: response.status,
          attempt,
        });

        // Handle error responses
        if (!response.ok) {
          await this.handleErrorResponse(response, attempt, maxAttempts);
        }

        // Parse successful response
        const data = await response.json() as T;

        return {
          data,
          status: response.status,
          headers: response.headers,
        };

      } catch (error) {
        lastError = error as Error;

        // If it's our custom error, check if retryable
        if (error instanceof MLApiError) {
          if (attempt < maxAttempts && isRetryableError(error)) {
            const delay = this.calculateRetryDelay(attempt);
            logger.warn('ML API request failed, retrying...', {
              attempt,
              maxAttempts,
              delay,
              error: error.message,
            });
            await this.sleep(delay);
            continue;
          }
          throw error;
        }

        // Handle timeout errors
        if (error instanceof Error && error.name === 'TimeoutError') {
          if (attempt < maxAttempts) {
            const delay = this.calculateRetryDelay(attempt);
            logger.warn('ML API request timeout, retrying...', {
              attempt,
              maxAttempts,
              delay,
            });
            await this.sleep(delay);
            continue;
          }
          throw new MLApiError(
            `Request timeout after ${timeout}ms`,
            408,
            undefined,
            'TIMEOUT'
          );
        }

        // Handle network errors
        if (attempt < maxAttempts) {
          const delay = this.calculateRetryDelay(attempt);
          logger.warn('ML API network error, retrying...', {
            attempt,
            maxAttempts,
            delay,
            error: error instanceof Error ? error.message : String(error),
          });
          await this.sleep(delay);
          continue;
        }

        // Max retries exceeded
        throw new MLApiError(
          `Network error: ${error instanceof Error ? error.message : String(error)}`,
          0,
          error,
          'NETWORK_ERROR'
        );
      }
    }

    // Should never reach here, but TypeScript needs it
    throw lastError || new MLApiError('Unknown error', 0);
  }

  /**
   * GET request helper
   */
  async get<T = unknown>(
    endpoint: string,
    options: Omit<MLRequestOptions, 'method'> = {}
  ): Promise<MLApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  /**
   * POST request helper
   */
  async post<T = unknown>(
    endpoint: string,
    body: unknown,
    options: Omit<MLRequestOptions, 'method' | 'body'> = {}
  ): Promise<MLApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'POST', body });
  }

  /**
   * PUT request helper
   */
  async put<T = unknown>(
    endpoint: string,
    body: unknown,
    options: Omit<MLRequestOptions, 'method' | 'body'> = {}
  ): Promise<MLApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'PUT', body });
  }

  /**
   * DELETE request helper
   */
  async delete<T = unknown>(
    endpoint: string,
    options: Omit<MLRequestOptions, 'method'> = {}
  ): Promise<MLApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  // ============================================================================
  // PRIVATE HELPERS
  // ============================================================================

  /**
   * Build full URL with query params
   */
  private buildUrl(endpoint: string, params?: Record<string, string | number | boolean>): string {
    // Remove leading slash if present
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    
    let url = `${this.baseUrl}${cleanEndpoint}`;

    if (params && Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        searchParams.append(key, String(value));
      }
      url += `?${searchParams.toString()}`;
    }

    return url;
  }

  /**
   * Build request headers
   */
  private buildHeaders(
    customHeaders: Record<string, string>,
    accessToken?: string
  ): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...customHeaders,
    };

    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    return headers;
  }

  /**
   * Sanitize URL for logging (remove sensitive params)
   */
  private sanitizeUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      
      // Remove sensitive query params
      const sensitiveParams = ['access_token', 'code', 'refresh_token'];
      sensitiveParams.forEach(param => {
        if (urlObj.searchParams.has(param)) {
          urlObj.searchParams.set(param, '***');
        }
      });

      return urlObj.toString();
    } catch {
      return url;
    }
  }

  /**
   * Handle error responses from ML API
   */
  private async handleErrorResponse(
    response: Response,
    attempt: number,
    maxAttempts: number
  ): Promise<never> {
    const status = response.status;
    let errorData: unknown;

    try {
      errorData = await response.json();
    } catch {
      errorData = await response.text();
    }

    // Log error
    logger.error('ML API Error Response', {
      status,
      attempt,
      maxAttempts,
      errorData,
    });

    // 429 - Rate Limit (with retry-after header)
    if (status === 429) {
      const retryAfter = response.headers.get('Retry-After');
      const retryAfterSeconds = retryAfter ? parseInt(retryAfter, 10) : 60;
      
      throw new MLRateLimitError(
        'ML API rate limit exceeded',
        retryAfterSeconds
      );
    }

    // 401 - Unauthorized (token expired or invalid)
    if (status === 401) {
      throw new MLUnauthorizedError(
        typeof errorData === 'object' && errorData && 'message' in errorData
          ? String(errorData.message)
          : 'Unauthorized - token may be expired'
      );
    }

    // 403 - Forbidden (insufficient permissions)
    if (status === 403) {
      throw new MLForbiddenError(
        typeof errorData === 'object' && errorData && 'message' in errorData
          ? String(errorData.message)
          : 'Forbidden - insufficient permissions'
      );
    }

    // 404 - Not Found
    if (status === 404) {
      throw new MLNotFoundError(
        'Resource not found',
        typeof errorData === 'object' && errorData && 'message' in errorData
          ? String(errorData.message)
          : undefined
      );
    }

    // 400 - Bad Request
    if (status === 400) {
      throw new MLBadRequestError(
        typeof errorData === 'object' && errorData && 'message' in errorData
          ? String(errorData.message)
          : 'Bad request',
        errorData
      );
    }

    // Generic API error
    throw new MLApiError(
      typeof errorData === 'object' && errorData && 'message' in errorData
        ? String(errorData.message)
        : `ML API error: ${status}`,
      status,
      errorData
    );
  }

  /**
   * Calculate retry delay with exponential backoff
   */
  private calculateRetryDelay(attempt: number): number {
    return this.retryDelay * Math.pow(RETRY_BACKOFF_MULTIPLIER, attempt - 1);
  }

  /**
   * Sleep helper for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let apiClientInstance: MLApiClient | null = null;

/**
 * Get singleton instance of MLApiClient
 */
export function getMLApiClient(config?: MLApiClientConfig): MLApiClient {
  if (!apiClientInstance || config) {
    apiClientInstance = new MLApiClient(config);
  }
  return apiClientInstance;
}
