/**
 * ML Sync Log Repository
 * 
 * Data access layer for ml_sync_logs table
 * Handles CRUD operations for ML sync audit logs
 */

import { createClient } from '@/utils/supabase/server';
import { logger } from '@/utils/logger';
import type { MLSyncLog, CreateMLSyncLogInput } from '../types/ml-db-types';

// ============================================================================
// ML SYNC LOG REPOSITORY CLASS
// ============================================================================

export class MLSyncLogRepository {
  
  /**
   * Create new sync log
   */
  async create(input: CreateMLSyncLogInput): Promise<string> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('ml_sync_logs')
      .insert({
        ...input,
        started_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (error) {
      logger.error('Failed to create sync log', { input, error });
      throw new Error(`Failed to create sync log: ${error.message}`);
    }

    return data.id;
  }

  /**
   * Update sync log
   */
  async update(
    id: string,
    updates: {
      status?: 'started' | 'completed' | 'partial' | 'failed';
      items_fetched?: number;
      items_synced?: number;
      items_failed?: number;
      duration_seconds?: number;
      error_message?: string;
      error_details?: unknown;
    }
  ): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase
      .from('ml_sync_logs')
      .update({
        ...updates,
        completed_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      logger.error('Failed to update sync log', { id, updates, error });
      throw new Error(`Failed to update sync log: ${error.message}`);
    }
  }

  /**
   * Complete sync log with success
   */
  async complete(
    id: string,
    data: {
      items_fetched: number;
      items_synced: number;
      items_failed: number;
      duration_seconds: number;
      error_details?: unknown;
    }
  ): Promise<void> {
    await this.update(id, {
      status: data.items_failed > 0 ? 'partial' : 'completed',
      ...data,
    });
  }

  /**
   * Fail sync log with error
   */
  async fail(id: string, error: unknown): Promise<void> {
    await this.update(id, {
      status: 'failed',
      error_message: error instanceof Error ? error.message : String(error),
      error_details: error,
    });
  }

  /**
   * Find sync log by ID
   */
  async findById(id: string): Promise<MLSyncLog | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('ml_sync_logs')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      logger.error('Failed to find sync log by ID', { id, error });
      throw new Error(`Failed to find sync log: ${error.message}`);
    }

    return data as MLSyncLog | null;
  }

  /**
   * Find sync logs by integration
   */
  async findByIntegration(
    integrationId: string,
    options?: {
      syncType?: 'products' | 'orders' | 'questions';
      status?: 'started' | 'completed' | 'partial' | 'failed';
      limit?: number;
    }
  ): Promise<MLSyncLog[]> {
    const supabase = await createClient();

    let query = supabase
      .from('ml_sync_logs')
      .select('*')
      .eq('integration_id', integrationId)
      .order('started_at', { ascending: false });

    if (options?.syncType) {
      query = query.eq('sync_type', options.syncType);
    }

    if (options?.status) {
      query = query.eq('status', options.status);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) {
      logger.error('Failed to find sync logs by integration', {
        integrationId,
        options,
        error,
      });
      throw new Error(`Failed to find sync logs: ${error.message}`);
    }

    return (data as MLSyncLog[]) || [];
  }

  /**
   * Get latest sync log for integration
   */
  async getLatest(
    integrationId: string,
    syncType?: 'products' | 'orders' | 'questions'
  ): Promise<MLSyncLog | null> {
    const supabase = await createClient();

    let query = supabase
      .from('ml_sync_logs')
      .select('*')
      .eq('integration_id', integrationId)
      .order('started_at', { ascending: false })
      .limit(1);

    if (syncType) {
      query = query.eq('sync_type', syncType);
    }

    const { data, error } = await query.maybeSingle();

    if (error) {
      logger.error('Failed to get latest sync log', {
        integrationId,
        syncType,
        error,
      });
      throw new Error(`Failed to get latest sync log: ${error.message}`);
    }

    return data as MLSyncLog | null;
  }

  /**
   * Delete old sync logs (cleanup)
   */
  async deleteOld(daysToKeep: number = 30): Promise<number> {
    const supabase = await createClient();

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const { error, count } = await supabase
      .from('ml_sync_logs')
      .delete({ count: 'exact' })
      .lt('started_at', cutoffDate.toISOString());

    if (error) {
      logger.error('Failed to delete old sync logs', {
        daysToKeep,
        cutoffDate,
        error,
      });
      throw new Error(`Failed to delete old sync logs: ${error.message}`);
    }

    return count || 0;
  }

  /**
   * Get sync statistics for integration
   */
  async getStatistics(integrationId: string): Promise<{
    totalSyncs: number;
    successful: number;
    partial: number;
    failed: number;
    lastSync?: MLSyncLog;
  }> {
    const supabase = await createClient();

    const [totalResult, successfulResult, partialResult, failedResult, lastSyncResult] =
      await Promise.all([
        supabase
          .from('ml_sync_logs')
          .select('*', { count: 'exact', head: true })
          .eq('integration_id', integrationId),
        supabase
          .from('ml_sync_logs')
          .select('*', { count: 'exact', head: true })
          .eq('integration_id', integrationId)
          .eq('status', 'completed'),
        supabase
          .from('ml_sync_logs')
          .select('*', { count: 'exact', head: true })
          .eq('integration_id', integrationId)
          .eq('status', 'partial'),
        supabase
          .from('ml_sync_logs')
          .select('*', { count: 'exact', head: true })
          .eq('integration_id', integrationId)
          .eq('status', 'failed'),
        supabase
          .from('ml_sync_logs')
          .select('*')
          .eq('integration_id', integrationId)
          .order('started_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

    return {
      totalSyncs: totalResult.count || 0,
      successful: successfulResult.count || 0,
      partial: partialResult.count || 0,
      failed: failedResult.count || 0,
      lastSync: lastSyncResult.data as MLSyncLog | undefined,
    };
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let repositoryInstance: MLSyncLogRepository | null = null;

/**
 * Get singleton instance of MLSyncLogRepository
 */
export function getMLSyncLogRepository(): MLSyncLogRepository {
  if (!repositoryInstance) {
    repositoryInstance = new MLSyncLogRepository();
  }
  return repositoryInstance;
}
