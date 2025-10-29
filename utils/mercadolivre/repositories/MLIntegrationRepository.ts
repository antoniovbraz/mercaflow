/**
 * ML Integration Repository
 * 
 * Data access layer for ml_integrations table
 * Handles CRUD operations for ML OAuth integrations
 */

import { createClient } from '@/utils/supabase/server';
import { logger } from '@/utils/logger';
import type {
  MLIntegration,
  CreateMLIntegrationInput,
  UpdateMLIntegrationInput,
} from '../types/ml-db-types';

// ============================================================================
// ML INTEGRATION REPOSITORY CLASS
// ============================================================================

export class MLIntegrationRepository {
  
  /**
   * Find integration by ID
   */
  async findById(id: string): Promise<MLIntegration | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('ml_integrations')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      logger.error('Failed to find integration by ID', { id, error });
      throw new Error(`Failed to find integration: ${error.message}`);
    }

    return data as MLIntegration | null;
  }

  /**
   * Find integration by user ID and tenant ID
   */
  async findByUser(userId: string, tenantId: string): Promise<MLIntegration | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('ml_integrations')
      .select('*')
      .eq('user_id', userId)
      .eq('tenant_id', tenantId)
      .maybeSingle();

    if (error) {
      logger.error('Failed to find integration by user', { userId, tenantId, error });
      throw new Error(`Failed to find integration: ${error.message}`);
    }

    return data as MLIntegration | null;
  }

  /**
   * Find all integrations for a tenant
   */
  async findByTenant(tenantId: string): Promise<MLIntegration[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('ml_integrations')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Failed to find integrations by tenant', { tenantId, error });
      throw new Error(`Failed to find integrations: ${error.message}`);
    }

    return (data as MLIntegration[]) || [];
  }

  /**
   * Find most recently updated active integration for tenant
   */
  async findActiveByTenant(tenantId: string): Promise<MLIntegration | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('ml_integrations')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('status', 'active')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      logger.error('Failed to find active integration by tenant', {
        tenantId,
        error,
      });
      throw new Error(`Failed to find active integration: ${error.message}`);
    }

    return data as MLIntegration | null;
  }

  /**
   * Create new integration
   */
  async create(input: CreateMLIntegrationInput): Promise<MLIntegration> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('ml_integrations')
      .insert(input)
      .select()
      .single();

    if (error) {
      logger.error('Failed to create integration', { input, error });
      throw new Error(`Failed to create integration: ${error.message}`);
    }

    return data as MLIntegration;
  }

  /**
   * Update integration
   */
  async update(id: string, input: UpdateMLIntegrationInput): Promise<MLIntegration> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('ml_integrations')
      .update(input)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      logger.error('Failed to update integration', { id, input, error });
      throw new Error(`Failed to update integration: ${error.message}`);
    }

    return data as MLIntegration;
  }

  /**
   * Delete integration
   */
  async delete(id: string): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase
      .from('ml_integrations')
      .delete()
      .eq('id', id);

    if (error) {
      logger.error('Failed to delete integration', { id, error });
      throw new Error(`Failed to delete integration: ${error.message}`);
    }
  }

  /**
   * Update integration tokens
   */
  async updateTokens(
    id: string,
    accessToken: string,
    refreshToken: string,
    expiresAt: string
  ): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase
      .from('ml_integrations')
      .update({
        access_token: accessToken, // FIXED: Migration uses 'access_token', not 'encrypted_access_token'
        refresh_token: refreshToken, // FIXED: Migration uses 'refresh_token', not 'encrypted_refresh_token'
        token_expires_at: expiresAt,
        status: 'active',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      logger.error('Failed to update integration tokens', { id, error });
      throw new Error(`Failed to update tokens: ${error.message}`);
    }
  }

  /**
   * Update integration status
   */
  async updateStatus(id: string, status: 'active' | 'expired' | 'revoked'): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase
      .from('ml_integrations')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      logger.error('Failed to update integration status', { id, status, error });
      throw new Error(`Failed to update status: ${error.message}`);
    }
  }

  /**
   * Update last sync timestamp
   */
  async updateLastSync(id: string): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase
      .from('ml_integrations')
      .update({
        last_sync_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      logger.error('Failed to update last sync', { id, error });
      throw new Error(`Failed to update last sync: ${error.message}`);
    }
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let repositoryInstance: MLIntegrationRepository | null = null;

/**
 * Get singleton instance of MLIntegrationRepository
 */
export function getMLIntegrationRepository(): MLIntegrationRepository {
  if (!repositoryInstance) {
    repositoryInstance = new MLIntegrationRepository();
  }
  return repositoryInstance;
}
