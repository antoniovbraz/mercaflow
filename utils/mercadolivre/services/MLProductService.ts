/**
 * ML Product Service
 * 
 * Handles product/item operations with Mercado Livre API:
 * - Sync all products using CORRECT multiget pattern
 * - Fetch individual product details
 * - Handle product CRUD operations
 * 
 * CRITICAL: Uses proper ML API pattern:
 * 1. /users/{user_id}/items/search → returns ONLY IDs (strings)
 * 2. Batch IDs into groups of 20
 * 3. /items?ids=ID1,ID2,... → multiget returns full objects
 * 
 * Based on ML docs: https://developers.mercadolibre.com.ar/en_us/items-and-searches
 */

import { logger } from '@/utils/logger';
import { getMLApiClient } from '../api/MLApiClient';
import { getMLTokenService } from './MLTokenService';
import {
  getMLIntegrationRepository,
  getMLProductRepository,
  getMLSyncLogRepository,
} from '../repositories';
import {
  MLSyncError,
  MLIntegrationNotFoundError,
} from '../types/ml-errors';
import type {
  MLItemSearchResponse,
  MLMultiGetResponse,
  MLItem,
} from '../types/ml-api-types';
import type {
  UpsertMLProductInput,
  SyncResult,
} from '../types/ml-db-types';

// ============================================================================
// CONSTANTS
// ============================================================================

const ITEMS_SEARCH_LIMIT = 50; // ML API max per page
const MULTIGET_BATCH_SIZE = 20; // ML API max IDs per multiget request
const MULTIGET_DELAY_MS = 100; // Delay between multiget batches to avoid rate limits

// ============================================================================
// ML PRODUCT SERVICE CLASS
// ============================================================================

export class MLProductService {
  private readonly apiClient = getMLApiClient();
  private readonly tokenService = getMLTokenService();
  private readonly integrationRepo = getMLIntegrationRepository();
  private readonly productRepo = getMLProductRepository();
  private readonly syncLogRepo = getMLSyncLogRepository();

  // ============================================================================
  // PUBLIC METHODS
  // ============================================================================

  /**
   * Sync ALL products from ML to database using correct multiget pattern
   * 
   * CRITICAL FLOW:
   * 1. Fetch integration and get valid token
   * 2. Fetch ALL product IDs with pagination (/users/{id}/items/search)
   * 3. Batch IDs into groups of 20
   * 4. Multiget full product details (/items?ids=...)
   * 5. Upsert to database
   */
  async syncAllProducts(integrationId: string): Promise<SyncResult> {
    const context = { integrationId, service: 'MLProductService.syncAllProducts' };
    logger.info('Starting product sync', context);

    const startTime = Date.now();
    let syncLogId: string | undefined;

    try {
      // Step 1: Get integration and validate
      const integration = await this.integrationRepo.findById(integrationId);
      if (!integration) {
        throw new MLIntegrationNotFoundError(integrationId);
      }
      
      // Step 2: Create sync log
      syncLogId = await this.syncLogRepo.create({
        integration_id: integrationId,
        sync_type: 'products',
        status: 'started',
      });

      // Step 3: Get valid access token
      const accessToken = await this.tokenService.getValidToken(integrationId);

      // Step 4: Fetch ALL product IDs with pagination
      logger.info('Fetching product IDs', context);
      const productIds = await this.fetchAllProductIds(
        integration.ml_user_id,
        accessToken
      );

      logger.info('Product IDs fetched', {
        ...context,
        totalIds: productIds.length,
      });

      if (productIds.length === 0) {
        const durationSeconds = Math.floor((Date.now() - startTime) / 1000);
        
        await this.syncLogRepo.complete(syncLogId, {
          items_fetched: 0,
          items_synced: 0,
          items_failed: 0,
          duration_seconds: durationSeconds,
        });

        return {
          success: true,
          sync_log_id: syncLogId,
          items_fetched: 0,
          items_synced: 0,
          items_failed: 0,
          duration_seconds: durationSeconds,
        };
      }

      // Step 5: Fetch full product details using multiget (batches of 20)
      logger.info('Fetching full product details via multiget', context);
      const products = await this.fetchProductDetailsBatch(
        productIds,
        accessToken
      );

      logger.info('Product details fetched', {
        ...context,
        totalProducts: products.length,
      });

      // Step 6: Upsert products to database
      logger.info('Upserting products to database', context);
      const { synced, failed, errors } = await this.upsertProducts(
        integrationId,
        products
      );

      // Step 7: Update integration last_sync_at
      await this.integrationRepo.updateLastSync(integrationId);

      // Step 8: Complete sync log
      const durationSeconds = Math.floor((Date.now() - startTime) / 1000);
      
      await this.syncLogRepo.complete(syncLogId, {
        items_fetched: productIds.length,
        items_synced: synced,
        items_failed: failed,
        duration_seconds: durationSeconds,
        error_details: errors.length > 0 ? { errors } : undefined,
      });

      logger.info('Product sync completed', {
        ...context,
        fetched: productIds.length,
        synced,
        failed,
        durationSeconds,
      });

      // Throw if all failed
      if (failed > 0 && synced === 0) {
        throw new MLSyncError(
          'All products failed to sync',
          'products',
          failed,
          { errors }
        );
      }

      // Return result
      return {
        success: true,
        sync_log_id: syncLogId,
        items_fetched: productIds.length,
        items_synced: synced,
        items_failed: failed,
        duration_seconds: durationSeconds,
        errors: errors.length > 0 ? errors : undefined,
      };

    } catch (error) {
      logger.error('Product sync failed', {
        ...context,
        error: error instanceof Error ? error.message : String(error),
      });

      // Update sync log with error
      if (syncLogId) {
        await this.syncLogRepo.fail(syncLogId, error);
      }

      throw error;
    }
  }

  // ============================================================================
  // PRIVATE METHODS - ML API CALLS
  // ============================================================================

  /**
   * Fetch ALL product IDs with pagination
   * 
   * IMPORTANT: /users/{user_id}/items/search returns ONLY IDs, not full objects!
   * Response format: { results: ["MLB123", "MLB456", ...], paging: {...} }
   */
  private async fetchAllProductIds(
    mlUserId: number,
    accessToken: string
  ): Promise<string[]> {
    const allIds: string[] = [];
    let offset = 0;
    let hasMore = true;

    while (hasMore) {
      try {
        const response = await this.apiClient.get<MLItemSearchResponse>(
          `/users/${mlUserId}/items/search`,
          {
            params: {
              offset,
              limit: ITEMS_SEARCH_LIMIT,
            },
            accessToken,
          }
        );

        const { results, paging } = response.data;

        // CRITICAL: results is array of ID strings, NOT objects!
        allIds.push(...results);

        logger.info('Fetched product IDs page', {
          offset,
          limit: ITEMS_SEARCH_LIMIT,
          idsInPage: results.length,
          totalSoFar: allIds.length,
          totalAvailable: paging.total,
        });

        // Check if there are more pages
        offset += ITEMS_SEARCH_LIMIT;
        hasMore = offset < paging.total;

        // Safety limit to prevent infinite loops
        if (offset > 10000) {
          logger.warn('Reached safety limit of 10k products');
          break;
        }

      } catch (error) {
        logger.error('Failed to fetch product IDs page', {
          offset,
          error: error instanceof Error ? error.message : String(error),
        });
        
        // Stop pagination on error
        hasMore = false;
      }
    }

    return allIds;
  }

  /**
   * Fetch full product details using multiget (batches of 20)
   * 
   * ML API: /items?ids=MLB123,MLB456,MLB789,...
   * Max 20 IDs per request
   * 
   * Response format: [
   *   { code: 200, body: {id, title, price, ...} },
   *   { code: 404, body: {error: "not found"} }
   * ]
   */
  private async fetchProductDetailsBatch(
    productIds: string[],
    accessToken: string
  ): Promise<MLItem[]> {
    const allProducts: MLItem[] = [];
    
    // Split IDs into batches of 20
    for (let i = 0; i < productIds.length; i += MULTIGET_BATCH_SIZE) {
      const batch = productIds.slice(i, i + MULTIGET_BATCH_SIZE);
      const idsParam = batch.join(',');

      try {
        logger.info('Fetching product details batch', {
          batchStart: i + 1,
          batchEnd: Math.min(i + MULTIGET_BATCH_SIZE, productIds.length),
          totalProducts: productIds.length,
        });

        const response = await this.apiClient.get<MLMultiGetResponse>(
          '/items',
          {
            params: {
              ids: idsParam,
              attributes: [
                'id',
                'title',
                'price',
                'available_quantity',
                'sold_quantity',
                'status',
                'category_id',
                'permalink',
                'thumbnail',
                'condition',
                'listing_type_id',
                'currency_id',
              ].join(','),
            },
            accessToken,
          }
        );

        // Extract successful responses (code 200)
        for (const result of response.data) {
          if (result.code === 200 && result.body && 'id' in result.body) {
            allProducts.push(result.body as MLItem);
          } else {
            logger.warn('Product not found or error in multiget', {
              code: result.code,
              body: result.body,
            });
          }
        }

        // Rate limiting: small delay between batches
        if (i + MULTIGET_BATCH_SIZE < productIds.length) {
          await this.sleep(MULTIGET_DELAY_MS);
        }

      } catch (error) {
        logger.error('Failed to fetch product details batch', {
          batchStart: i,
          batchSize: batch.length,
          error: error instanceof Error ? error.message : String(error),
        });
        
        // Continue with remaining batches even if one fails
      }
    }

    return allProducts;
  }

  // ============================================================================
  // PRIVATE METHODS - DATABASE OPERATIONS
  // ============================================================================

  /**
   * Upsert products to database using repository
   */
  private async upsertProducts(
    integrationId: string,
    products: MLItem[]
  ): Promise<{
    synced: number;
    failed: number;
    errors: Array<{ item_id: string; error: string }>;
  }> {
    // Transform ML API products to database input format
    const productInputs: UpsertMLProductInput[] = products.map(mlProduct => ({
      integration_id: integrationId,
      ml_item_id: mlProduct.id,
      title: mlProduct.title,
      category_id: mlProduct.category_id || null,
      price: mlProduct.price || null,
      currency_id: mlProduct.currency_id || 'BRL',
      available_quantity: mlProduct.available_quantity || 0,
      sold_quantity: mlProduct.sold_quantity || 0,
      status: mlProduct.status,
      listing_type_id: mlProduct.listing_type_id || null,
      condition: mlProduct.condition,
      permalink: mlProduct.permalink || null,
      thumbnail: mlProduct.thumbnail || null,
      ml_data: mlProduct as unknown as Record<string, unknown>,
    }));

    // Use repository batch upsert
    return await this.productRepo.upsertBatch(productInputs);
  }

  // ============================================================================
  // HELPERS
  // ============================================================================

  /**
   * Sleep helper for rate limiting
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let productServiceInstance: MLProductService | null = null;

/**
 * Get singleton instance of MLProductService
 */
export function getMLProductService(): MLProductService {
  if (!productServiceInstance) {
    productServiceInstance = new MLProductService();
  }
  return productServiceInstance;
}
