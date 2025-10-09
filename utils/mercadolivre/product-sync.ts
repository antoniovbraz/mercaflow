/**
 * Product Synchronization Utilities
 *
 * Handles synchronization of Mercado Livre products to local database cache
 */

import { SupabaseClient } from '@supabase/supabase-js';

export interface MLProduct {
  id: string;
  title: string;
  price: number;
  available_quantity: number;
  sold_quantity: number;
  condition: string;
  permalink: string;
  thumbnail: string;
  status: string;
  category_id: string;
  currency_id: string;
  buying_mode: string;
  listing_type_id: string;
  start_time: string;
  stop_time?: string;
  end_time?: string;
  tags: string[];
  warranty?: string;
  catalog_product_id?: string;
  domain_id?: string;
  parent_item_id?: string;
  differential_pricing?: Record<string, unknown>;
  deal_ids?: string[];
  automatic_relist: boolean;
  date_created: string;
  last_updated: string;
  health?: number;
  catalog_listing?: boolean;
  channels?: string[];
}

export interface ProductSyncResult {
  success: boolean;
  synced: number;
  failed: number;
  errors: string[];
  total: number;
}

/**
 * Sync products from ML API to local database
 */
export async function syncProducts(
  supabase: SupabaseClient,
  integrationId: string,
  mlProducts: MLProduct[]
): Promise<ProductSyncResult> {
  const result: ProductSyncResult = {
    success: true,
    synced: 0,
    failed: 0,
    errors: [],
    total: mlProducts.length
  };

  for (const mlProduct of mlProducts) {
    try {
      // Check if product already exists
      const { data: existingProduct } = await supabase
        .from('ml_products')
        .select('id, updated_at')
        .eq('integration_id', integrationId)
        .eq('ml_item_id', mlProduct.id)
        .single();

      const productData = {
        integration_id: integrationId,
        ml_item_id: mlProduct.id,
        title: mlProduct.title,
        category_id: mlProduct.category_id,
        price: mlProduct.price,
        available_quantity: mlProduct.available_quantity,
        sold_quantity: mlProduct.sold_quantity,
        status: mlProduct.status,
        permalink: mlProduct.permalink,
        ml_data: mlProduct,
        last_synced_at: new Date().toISOString()
      };

      if (existingProduct) {
        // Update existing product
        const { error } = await supabase
          .from('ml_products')
          .update(productData)
          .eq('id', existingProduct.id);

        if (error) throw error;
      } else {
        // Insert new product
        const { error } = await supabase
          .from('ml_products')
          .insert(productData);

        if (error) throw error;
      }

      result.synced++;
    } catch (error) {
      console.error(`Failed to sync product ${mlProduct.id}:`, error);
      result.failed++;
      result.errors.push(`Product ${mlProduct.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  return result;
}

/**
 * Get cached products for an integration
 */
export async function getCachedProducts(
  supabase: SupabaseClient,
  integrationId: string,
  options: {
    status?: string;
    limit?: number;
    offset?: number;
    search?: string;
  } = {}
) {
  let query = supabase
    .from('ml_products')
    .select('*', { count: 'exact' })
    .eq('integration_id', integrationId)
    .order('last_synced_at', { ascending: false });

  if (options.status) {
    query = query.eq('status', options.status);
  }

  if (options.search) {
    query = query.ilike('title', `%${options.search}%`);
  }

  if (options.limit) {
    query = query.limit(options.limit);
  }

  if (options.offset) {
    query = query.range(options.offset, (options.offset + (options.limit || 50)) - 1);
  }

  const { data, error, count } = await query;

  if (error) throw error;

  return {
    products: data || [],
    total: count || 0
  };
}

/**
 * Get product statistics for dashboard
 */
export async function getProductStats(
  supabase: SupabaseClient,
  integrationId: string
) {
  const { data, error } = await supabase
    .from('ml_products')
    .select('status, available_quantity, sold_quantity, price')
    .eq('integration_id', integrationId);

  if (error) throw error;

  const stats = {
    total: data.length,
    active: data.filter(p => p.status === 'active').length,
    paused: data.filter(p => p.status === 'paused').length,
    closed: data.filter(p => p.status === 'closed').length,
    totalStock: data.reduce((sum, p) => sum + (p.available_quantity || 0), 0),
    totalSold: data.reduce((sum, p) => sum + (p.sold_quantity || 0), 0),
    averagePrice: data.length > 0
      ? data.reduce((sum, p) => sum + (p.price || 0), 0) / data.length
      : 0
  };

  return stats;
}