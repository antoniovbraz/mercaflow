/**
 * ML Token Service
 * 
 * Handles OAuth token management with:
 * - AES-256-GCM encryption/decryption
 * - Automatic token refresh when expired
 * - Token expiration checking
 * - Secure storage in database
 * 
 * Based on ML OAuth docs: https://developers.mercadolibre.com.ar/en_us/authentication-and-authorization
 */

import { createClient } from '@/utils/supabase/server';
import crypto from 'crypto';
import { logger } from '@/utils/logger';
import { getMLApiClient } from '../api/MLApiClient';
import {
  MLTokenError,
  MLTokenRefreshError,
  MLTokenEncryptionError,
  MLIntegrationNotFoundError,
  MLIntegrationInactiveError,
} from '../types/ml-errors';
import type {
  MLIntegration,
  UpdateMLIntegrationTokensInput,
} from '../types/ml-db-types';
import type { MLTokenResponse } from '../types/ml-api-types';

// ============================================================================
// CONSTANTS
// ============================================================================

const TOKEN_BUFFER_MINUTES = 5; // Refresh if expires within 5 minutes
const ENCRYPTION_ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

// ============================================================================
// ML TOKEN SERVICE CLASS
// ============================================================================

export class MLTokenService {
  private readonly encryptionKey: Buffer;
  private readonly apiClient = getMLApiClient();

  constructor() {
    // Get encryption key from environment
    const keyString = process.env.ENCRYPTION_KEY || process.env.NEXTAUTH_SECRET || '';
    
    if (!keyString || keyString.length < 32) {
      throw new Error('ENCRYPTION_KEY environment variable must be at least 32 characters');
    }

    // Derive a proper 32-byte key from the string
    this.encryptionKey = crypto.scryptSync(keyString, 'salt', 32);
  }

  // ============================================================================
  // PUBLIC METHODS
  // ============================================================================

  /**
   * Get valid access token for integration
   * Automatically refreshes if expired or expiring soon
   */
  async getValidToken(integrationId: string): Promise<string> {
    logger.info('Getting valid token', { integrationId });

    // Fetch integration from database
    const integration = await this.getIntegration(integrationId);

    // Check if token is expired or expiring soon
    if (this.isTokenExpired(integration.token_expires_at)) {
      logger.info('Token expired or expiring soon, refreshing...', {
        integrationId,
        expiresAt: integration.token_expires_at,
      });

      return await this.refreshToken(integrationId);
    }

    // Decrypt and return current token
    const decryptedToken = this.decryptToken(integration.access_token);
    
    logger.info('Returning valid token', {
      integrationId,
      expiresAt: integration.token_expires_at,
    });

    return decryptedToken;
  }

  /**
   * Refresh OAuth access token using refresh token
   */
  async refreshToken(integrationId: string): Promise<string> {
    logger.info('Refreshing token', { integrationId });

    try {
      // Fetch integration
      const integration = await this.getIntegration(integrationId);

      // Decrypt refresh token
      const decryptedRefreshToken = this.decryptToken(integration.refresh_token);

      // Get OAuth credentials from env
      const clientId = process.env.ML_CLIENT_ID;
      const clientSecret = process.env.ML_CLIENT_SECRET;

      if (!clientId || !clientSecret) {
        throw new MLTokenRefreshError('ML_CLIENT_ID or ML_CLIENT_SECRET not configured');
      }

      // Call ML token refresh endpoint
      const response = await this.apiClient.post<MLTokenResponse>(
        '/oauth/token',
        {
          grant_type: 'refresh_token',
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: decryptedRefreshToken,
        },
        {
          skipRetry: true, // Don't retry token refresh
        }
      );

      const tokenData = response.data;

      // Calculate expiration time
      const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000);

      // Encrypt new tokens
      const encryptedAccessToken = this.encryptToken(tokenData.access_token);
      const encryptedRefreshToken = this.encryptToken(tokenData.refresh_token);

      // Update tokens in database
      await this.updateTokens(integrationId, {
        access_token: encryptedAccessToken,
        refresh_token: encryptedRefreshToken,
        token_expires_at: expiresAt.toISOString(),
        last_token_refresh_at: new Date().toISOString(),
      });

      logger.info('Token refreshed successfully', {
        integrationId,
        expiresAt: expiresAt.toISOString(),
      });

      return tokenData.access_token;

    } catch (error) {
      logger.error('Token refresh failed', {
        integrationId,
        error: error instanceof Error ? error.message : String(error),
      });

      // Mark integration as expired
      await this.markIntegrationExpired(integrationId, error);

      throw new MLTokenRefreshError(
        'Failed to refresh ML access token',
        error
      );
    }
  }

  /**
   * Encrypt token using AES-256-GCM
   */
  encryptToken(token: string): string {
    try {
      // Generate random IV (Initialization Vector)
      const iv = crypto.randomBytes(IV_LENGTH);

      // Create cipher
      const cipher = crypto.createCipheriv(
        ENCRYPTION_ALGORITHM,
        this.encryptionKey,
        iv
      );

      // Encrypt
      let encrypted = cipher.update(token, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      // Get auth tag
      const authTag = cipher.getAuthTag();

      // Combine IV + authTag + encrypted data
      const combined = Buffer.concat([
        iv,
        authTag,
        Buffer.from(encrypted, 'hex')
      ]);

      // Return as base64
      return combined.toString('base64');

    } catch (error) {
      logger.error('Token encryption failed', { error });
      throw new MLTokenEncryptionError(
        'Failed to encrypt token',
        'encrypt'
      );
    }
  }

  /**
   * Decrypt token using AES-256-GCM
   */
  decryptToken(encryptedToken: string): string {
    try {
      // Decode from base64
      const combined = Buffer.from(encryptedToken, 'base64');

      // Extract components
      const iv = combined.subarray(0, IV_LENGTH);
      const authTag = combined.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
      const encrypted = combined.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

      // Create decipher
      const decipher = crypto.createDecipheriv(
        ENCRYPTION_ALGORITHM,
        this.encryptionKey,
        iv
      );

      // Set auth tag
      decipher.setAuthTag(authTag);

      // Decrypt
      let decrypted = decipher.update(encrypted.toString('hex'), 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;

    } catch (error) {
      logger.error('Token decryption failed', { error });
      throw new MLTokenEncryptionError(
        'Failed to decrypt token',
        'decrypt'
      );
    }
  }

  /**
   * Check if token is expired or expiring soon
   */
  isTokenExpired(tokenExpiresAt: string): boolean {
    const expiresAt = new Date(tokenExpiresAt);
    const now = new Date();
    const bufferMs = TOKEN_BUFFER_MINUTES * 60 * 1000;

    return now.getTime() + bufferMs >= expiresAt.getTime();
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  /**
   * Fetch integration from database
   */
  private async getIntegration(integrationId: string): Promise<MLIntegration> {
    const supabase = await createClient();

    const { data: integration, error } = await supabase
      .from('ml_integrations')
      .select('*')
      .eq('id', integrationId)
      .maybeSingle();

    if (error) {
      logger.error('Failed to fetch integration', { integrationId, error });
      throw new MLTokenError('Failed to fetch integration', 'DB_ERROR', error);
    }

    if (!integration) {
      throw new MLIntegrationNotFoundError(integrationId);
    }

    if (integration.status !== 'active') {
      throw new MLIntegrationInactiveError(integrationId, integration.status);
    }

    return integration as MLIntegration;
  }

  /**
   * Update tokens in database
   */
  private async updateTokens(
    integrationId: string,
    tokensData: UpdateMLIntegrationTokensInput
  ): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase
      .from('ml_integrations')
      .update(tokensData)
      .eq('id', integrationId);

    if (error) {
      logger.error('Failed to update tokens', { integrationId, error });
      throw new MLTokenError('Failed to update tokens in database', 'DB_ERROR', error);
    }
  }

  /**
   * Mark integration as expired after failed refresh
   */
  private async markIntegrationExpired(
    integrationId: string,
    error: unknown
  ): Promise<void> {
    const supabase = await createClient();

    await supabase
      .from('ml_integrations')
      .update({
        status: 'expired',
        last_error: error instanceof Error ? error.message : String(error),
        error_count: supabase.rpc('increment', { x: 1 }) as unknown as number, // Increment error count
      })
      .eq('id', integrationId);

    logger.warn('Integration marked as expired', { integrationId });
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let tokenServiceInstance: MLTokenService | null = null;

/**
 * Get singleton instance of MLTokenService
 */
export function getMLTokenService(): MLTokenService {
  if (!tokenServiceInstance) {
    tokenServiceInstance = new MLTokenService();
  }
  return tokenServiceInstance;
}
