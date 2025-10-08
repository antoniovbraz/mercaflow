/**
 * Mercado Livre Token Manager
 * 
 * Manages ML OAuth tokens with automatic refresh, encryption,
 * and secure storage following ML API best practices.
 */

import { createClient } from '@/utils/supabase/server';
import crypto from 'crypto';

interface MLTokenData {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
  user_id: number;
}

interface MLIntegration {
  id: string;
  user_id: string;
  tenant_id: string;
  ml_user_id: number;
  ml_nickname: string;
  access_token: string;
  refresh_token: string;
  token_expires_at: string;
  scopes: string[];
  status: 'active' | 'expired' | 'revoked' | 'error';
}

interface MLUserData {
  id: number;
  nickname: string;
  email?: string;
  first_name?: string;
  last_name?: string;
}

interface SyncLogData {
  action?: string;
  ml_user_id?: number;
  scopes?: string;
  error?: string;
  status_code?: number;
  expires_in?: number;
  count?: number;
  total?: number;
  item_id?: string;
  title?: string;
}

export class MLTokenManager {
  private readonly ENCRYPTION_KEY: string;
  private readonly ML_API_BASE = 'https://api.mercadolibre.com';
  
  constructor() {
    // Use a strong encryption key from environment
    this.ENCRYPTION_KEY = process.env.ML_TOKEN_ENCRYPTION_KEY || process.env.NEXTAUTH_SECRET || '';
    
    if (!this.ENCRYPTION_KEY || this.ENCRYPTION_KEY.length < 32) {
      throw new Error('ML_TOKEN_ENCRYPTION_KEY must be at least 32 characters');
    }
  }

  /**
   * Get a valid access token for the integration
   * Automatically refreshes if expired
   */
  async getValidToken(integrationId: string): Promise<string | null> {
    const supabase = await createClient();
    
    const { data: integration, error } = await supabase
      .from('ml_integrations')
      .select('*')
      .eq('id', integrationId)
      .eq('status', 'active')
      .single();

    if (error || !integration) {
      console.error('Integration not found or inactive:', error);
      return null;
    }

    // Check if token is expired (with 5min buffer)
    const expiresAt = new Date(integration.token_expires_at);
    const now = new Date();
    const bufferTime = 5 * 60 * 1000; // 5 minutes buffer

    if (now.getTime() + bufferTime >= expiresAt.getTime()) {
      // Token expired or will expire soon, refresh it
      console.log(`Token expires at ${expiresAt}, refreshing...`);
      return await this.refreshToken(integration);
    }

    // Decrypt and return current token
    return this.decryptToken(integration.access_token);
  }

  /**
   * Get ML integration by tenant ID
   */
  async getIntegrationByTenant(tenantId: string): Promise<MLIntegration | null> {
    const supabase = await createClient();
    
    const { data: integration, error } = await supabase
      .from('ml_integrations')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('status', 'active')
      .single();

    if (error || !integration) {
      return null;
    }

    return {
      ...integration,
      access_token: this.decryptToken(integration.access_token),
      refresh_token: this.decryptToken(integration.refresh_token),
    };
  }

  /**
   * Save new token data from OAuth flow
   */
  async saveTokenData(
    userId: string,
    tenantId: string,
    tokenData: MLTokenData,
    mlUserData: MLUserData
  ): Promise<MLIntegration> {
    const supabase = await createClient();
    
    const integrationData = {
      user_id: userId,
      tenant_id: tenantId,
      ml_user_id: tokenData.user_id,
      ml_nickname: mlUserData.nickname,
      ml_email: mlUserData.email,
      access_token: this.encryptToken(tokenData.access_token),
      refresh_token: this.encryptToken(tokenData.refresh_token),
      token_expires_at: new Date(Date.now() + tokenData.expires_in * 1000),
      scopes: tokenData.scope.split(' '),
      status: 'active' as const,
      last_sync_at: new Date(),
    };

    const { data: integration, error } = await supabase
      .from('ml_integrations')
      .upsert(integrationData, {
        onConflict: 'tenant_id,ml_user_id'
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to save ML integration: ${error.message}`);
    }

    // Log successful integration
    await this.logSync(integration.id, 'user_info', 'success', {
      action: 'token_saved',
      ml_user_id: tokenData.user_id,
      scopes: tokenData.scope,
    });

    return {
      ...integration,
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
    };
  }

  /**
   * Refresh an expired token
   */
  private async refreshToken(integration: MLIntegration): Promise<string | null> {
    try {
      const supabase = await createClient();
      
      const refreshToken = this.decryptToken(integration.refresh_token);
      
      const response = await fetch(`${this.ML_API_BASE}/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          client_id: process.env.ML_CLIENT_ID!,
          client_secret: process.env.ML_CLIENT_SECRET!,
          refresh_token: refreshToken,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Token refresh failed:', response.status, errorText);
        
        // Mark integration as expired if refresh fails
        await supabase
          .from('ml_integrations')
          .update({ 
            status: 'expired',
            last_error: `Token refresh failed: ${errorText}`,
          })
          .eq('id', integration.id);

        await this.logSync(integration.id, 'user_info', 'error', {
          action: 'token_refresh_failed',
          error: errorText,
          status_code: response.status,
        });
        
        return null;
      }

      const tokenData = await response.json();

      // Update tokens in database
      await supabase
        .from('ml_integrations')
        .update({
          access_token: this.encryptToken(tokenData.access_token),
          refresh_token: this.encryptToken(tokenData.refresh_token),
          token_expires_at: new Date(Date.now() + tokenData.expires_in * 1000),
          status: 'active',
          last_error: null,
          updated_at: new Date(),
        })
        .eq('id', integration.id);

      await this.logSync(integration.id, 'user_info', 'success', {
        action: 'token_refreshed',
        expires_in: tokenData.expires_in,
      });

      return tokenData.access_token;
      
    } catch (error) {
      console.error('Token refresh error:', error);
      
      const supabase = await createClient();
      await supabase
        .from('ml_integrations')
        .update({ 
          status: 'error',
          last_error: `Token refresh exception: ${error}`,
        })
        .eq('id', integration.id);

      await this.logSync(integration.id, 'user_info', 'error', {
        action: 'token_refresh_exception',
        error: String(error),
      });
      
      return null;
    }
  }

  /**
   * Revoke integration and tokens
   */
  async revokeIntegration(integrationId: string): Promise<void> {
    const supabase = await createClient();
    
    // Mark as revoked (we don't delete to maintain audit trail)
    await supabase
      .from('ml_integrations')
      .update({ 
        status: 'revoked',
        updated_at: new Date(),
      })
      .eq('id', integrationId);

    await this.logSync(integrationId, 'user_info', 'success', {
      action: 'integration_revoked',
    });
  }

  /**
   * Make authenticated request to ML API
   */
  async makeMLRequest(
    integrationId: string,
    endpoint: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const token = await this.getValidToken(integrationId);
    
    if (!token) {
      throw new Error('No valid ML token available');
    }

    const url = endpoint.startsWith('http') 
      ? endpoint 
      : `${this.ML_API_BASE}${endpoint}`;

    return fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        ...options.headers,
      },
    });
  }

  /**
   * Encrypt token for database storage
   */
  private encryptToken(token: string): string {
    const algorithm = 'aes-256-gcm';
    const key = crypto.scryptSync(this.ENCRYPTION_KEY, 'salt', 32);
    const iv = crypto.randomBytes(16);
    
    const cipher = crypto.createCipher(algorithm, key);
    cipher.setAAD(Buffer.from('ml_token'));
    
    let encrypted = cipher.update(token, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  }

  /**
   * Decrypt token from database
   */
  private decryptToken(encryptedToken: string): string {
    const [ivHex, authTagHex, encrypted] = encryptedToken.split(':');
    
    if (!ivHex || !authTagHex || !encrypted) {
      throw new Error('Invalid token format');
    }
    
    const algorithm = 'aes-256-gcm';
    const key = crypto.scryptSync(this.ENCRYPTION_KEY, 'salt', 32);
    const authTag = Buffer.from(authTagHex, 'hex');
    
    const decipher = crypto.createDecipher(algorithm, key);
    decipher.setAAD(Buffer.from('ml_token'));
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  /**
   * Log sync operation
   */
  private async logSync(
    integrationId: string,
    syncType: string,
    status: 'success' | 'error' | 'partial',
    data: SyncLogData = {}
  ): Promise<void> {
    try {
      const supabase = await createClient();
      
      await supabase
        .from('ml_sync_logs')
        .insert({
          integration_id: integrationId,
          sync_type: syncType,
          status,
          sync_data: data,
          completed_at: new Date(),
        });
    } catch (error) {
      console.error('Failed to log sync operation:', error);
    }
  }

  /**
   * Check if integration exists for tenant
   */
  async hasIntegration(tenantId: string): Promise<boolean> {
    const supabase = await createClient();
    
    const { count, error } = await supabase
      .from('ml_integrations')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .eq('status', 'active');

    if (error) {
      console.error('Error checking integration:', error);
      return false;
    }

    return (count ?? 0) > 0;
  }
}