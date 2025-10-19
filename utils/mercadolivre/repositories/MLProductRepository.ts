/**
 * ML Product Repository
 * 
 * Data access layer for ml_products table
 * Handles CRUD operations for ML product listings
 */

import { createClient } from '@/utils/supabase/server';
import { logger } from '@/utils/logger';
import type {
  MLProduct,
  UpsertMLProductInput,
} from '../types/ml-db-types';

// ============================================================================
// ML PRODUCT REPOSITORY CLASS
// ============================================================================

export class MLProductRepository {
  
  /**
   * Find product by ID
   */
  async findById(id: string): Promise<MLProduct | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('ml_products')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      logger.error('Failed to find product by ID', { id, error });
      throw new Error(`Failed to find product: ${error.message}`);
    }

    return data as MLProduct | null;
  }

  /**
   * Find product by ML item ID and integration ID
   */
  async findByMLItemId(
    integrationId: string,
    mlItemId: string
  ): Promise<MLProduct | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('ml_products')
      .select('*')
      .eq('integration_id', integrationId)
      .eq('ml_item_id', mlItemId)
      .maybeSingle();

    if (error) {
      logger.error('Failed to find product by ML item ID', {
        integrationId,
        mlItemId,
        error,
      });
      throw new Error(`Failed to find product: ${error.message}`);
    }

    return data as MLProduct | null;
  }

  /**
   * Find all products for an integration
   */
  async findByIntegration(
    integrationId: string,
    options?: {
      status?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<MLProduct[]> {
    const supabase = await createClient();

    let query = supabase
      .from('ml_products')
      .select('*')
      .eq('integration_id', integrationId)
      .order('created_at', { ascending: false });

    if (options?.status) {
      query = query.eq('status', options.status);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 50) - 1);
    }

    const { data, error } = await query;

    if (error) {
      logger.error('Failed to find products by integration', {
        integrationId,
        options,
        error,
      });
      throw new Error(`Failed to find products: ${error.message}`);
    }

    return (data as MLProduct[]) || [];
  }

  /**
   * Count products for an integration
   */
  async count(integrationId: string, status?: string): Promise<number> {
    const supabase = await createClient();

    let query = supabase
      .from('ml_products')
      .select('*', { count: 'exact', head: true })
      .eq('integration_id', integrationId);

    if (status) {
      query = query.eq('status', status);
    }

    const { count, error } = await query;

    if (error) {
      logger.error('Failed to count products', { integrationId, status, error });
      throw new Error(`Failed to count products: ${error.message}`);
    }

    return count || 0;
  }

  /**
   * Upsert single product
   */
  async upsert(input: UpsertMLProductInput): Promise<MLProduct> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('ml_products')
      .upsert(input, {
        onConflict: 'integration_id,ml_item_id',
      })
      .select()
      .single();

    if (error) {
      logger.error('Failed to upsert product', { input, error });
      throw new Error(`Failed to upsert product: ${error.message}`);
    }

    return data as MLProduct;
  }

  /**
   * Upsert batch of products
   * Returns count of successful upserts
   */
  async upsertBatch(inputs: UpsertMLProductInput[]): Promise<{
    synced: number;
    failed: number;
    errors: Array<{ item_id: string; error: string }>;
  }> {
    const supabase = await createClient();
    let synced = 0;
    let failed = 0;
    const errors: Array<{ item_id: string; error: string }> = [];

    // Process in batches to avoid overwhelming database
    const BATCH_SIZE = 100;
    
    for (let i = 0; i < inputs.length; i += BATCH_SIZE) {
      const batch = inputs.slice(i, i + BATCH_SIZE);

      try {
        const { data, error } = await supabase
          .from('ml_products')
          .upsert(batch, {
            onConflict: 'integration_id,ml_item_id',
          })
          .select('ml_item_id');

        if (error) {
          logger.error('Failed to upsert batch', { batchSize: batch.length, error });
          failed += batch.length;
          batch.forEach(item => {
            errors.push({ item_id: item.ml_item_id, error: error.message });
          });
        } else {
          synced += data?.length || batch.length;
        }
      } catch (error) {
        logger.error('Exception upserting batch', {
          batchSize: batch.length,
          error: error instanceof Error ? error.message : String(error),
        });
        failed += batch.length;
        batch.forEach(item => {
          errors.push({
            item_id: item.ml_item_id,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        });
      }
    }

    return { synced, failed, errors };
  }

  /**
   * Delete product
   */
  async delete(id: string): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase
      .from('ml_products')
      .delete()
      .eq('id', id);

    if (error) {
      logger.error('Failed to delete product', { id, error });
      throw new Error(`Failed to delete product: ${error.message}`);
    }
  }

  /**
   * Delete all products for an integration
   */
  async deleteByIntegration(integrationId: string): Promise<number> {
    const supabase = await createClient();

    const { error, count } = await supabase
      .from('ml_products')
      .delete({ count: 'exact' })
      .eq('integration_id', integrationId);

    if (error) {
      logger.error('Failed to delete products by integration', {
        integrationId,
        error,
      });
      throw new Error(`Failed to delete products: ${error.message}`);
    }

    return count || 0;
  }

  /**
   * Get products statistics for an integration
   */
  async getStatistics(integrationId: string): Promise<{
    total: number;
    active: number;
    paused: number;
    inactive: number;
  }> {
    const supabase = await createClient();

    const [totalResult, activeResult, pausedResult, inactiveResult] = await Promise.all([
      supabase
        .from('ml_products')
        .select('*', { count: 'exact', head: true })
        .eq('integration_id', integrationId),
      supabase
        .from('ml_products')
        .select('*', { count: 'exact', head: true })
        .eq('integration_id', integrationId)
        .eq('status', 'active'),
      supabase
        .from('ml_products')
        .select('*', { count: 'exact', head: true })
        .eq('integration_id', integrationId)
        .eq('status', 'paused'),
      supabase
        .from('ml_products')
        .select('*', { count: 'exact', head: true })
        .eq('integration_id', integrationId)
        .eq('status', 'inactive'),
    ]);

    return {
      total: totalResult.count || 0,
      active: activeResult.count || 0,
      paused: pausedResult.count || 0,
      inactive: inactiveResult.count || 0,
    };
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let repositoryInstance: MLProductRepository | null = null;

/**
 * Get singleton instance of MLProductRepository
 */
export function getMLProductRepository(): MLProductRepository {
  if (!repositoryInstance) {
    repositoryInstance = new MLProductRepository();
  }
  return repositoryInstance;
}
