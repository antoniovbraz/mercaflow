import { logger } from '@/utils/logger';
import { getCached, buildCacheKey, CachePrefix, CacheTTL } from '@/utils/redis';
/**
 * ML Items API Proxy
 * 
 * Proxies requests to ML Items API with automatic authentication
 * and token refresh. Handles rate limiting and error management.
 * With Redis caching layer for improved performance.
 * 
 * @security Implements Zod validation for query params and ML API responses
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, createClient } from '@/utils/supabase/server';
import { MLTokenManager } from '@/utils/mercadolivre/token-manager';
import { syncProducts, getCachedProducts } from '@/utils/mercadolivre/product-sync';
import {
  MLItemSchema,
  CreateMLItemSchema,
  ItemsSearchQuerySchema,
  validateQueryParams,
  validateRequestBody,
  validateOutput,
  ValidationError,
  MLApiError,
} from '@/utils/validation';

const tokenManager = new MLTokenManager();

/**
 * GET /api/ml/items - List user's items
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Validate query parameters
    try {
      // Validate query params - result not directly used as we forward all params to ML API
      // But validation ensures they're in expected format
      validateQueryParams(ItemsSearchQuerySchema, request.nextUrl.searchParams);
    } catch (error) {
      if (error instanceof ValidationError) {
        return NextResponse.json(
          { error: 'Invalid query parameters', details: error.details },
          { status: 400 }
        );
      }
      throw error;
    }
    
    // Verify authentication
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user profile to find correct tenant_id
    const supabase = await createClient();
    const { data: profile } = await supabase
      .from('profiles')
      .select('tenant_id')
      .eq('id', user.id)
      .single();

    const tenantId = profile?.tenant_id || user.id;
    
    // Get ML integration for this tenant
    const integration = await tokenManager.getIntegrationByTenant(tenantId);
    
    logger.info('ML Items Debug:', {
      userId: user.id,
      tenantId,
      profileTenantId: profile?.tenant_id,
      integrationFound: !!integration,
      integrationId: integration?.id,
      integrationStatus: integration?.status,
      mlUserId: integration?.ml_user_id,
      tokenExpiresAt: integration?.token_expires_at,
      currentTime: new Date().toISOString()
    });
    
    if (!integration) {
      logger.error('No ML integration found for tenant:', tenantId);
      return NextResponse.json(
        { error: 'No active ML integration found. Please connect your Mercado Livre account.' },
        { status: 404 }
      );
    }

    // Parse query parameters
    const url = new URL(request.url);
    const searchParams = new URLSearchParams();
    
    // Extract request parameters
    const status = url.searchParams.get('status');
    const search = url.searchParams.get('search');
    const requestedOffset = parseInt(url.searchParams.get('offset') || '0');
    const requestedLimit = parseInt(url.searchParams.get('limit') || '50');
    
    // Forward allowed parameters
    const allowedParams = ['offset', 'limit', 'status', 'search'];
    for (const param of allowedParams) {
      const value = url.searchParams.get(param);
      if (value) {
        searchParams.set(param, value);
      }
    }

    // Set default limit if not provided
    if (!searchParams.has('limit')) {
      searchParams.set('limit', '50');
    }

    const mlApiUrl = `/users/${integration.ml_user_id}/items/search?${searchParams.toString()}`;
    
    logger.info('Making ML API request:', {
      integrationId: integration.id,
      mlUserId: integration.ml_user_id,
      apiUrl: mlApiUrl,
      searchParams: searchParams.toString()
    });

    // Build Redis cache key including all relevant params
    const cacheKey = buildCacheKey(
      CachePrefix.ML_ITEMS,
      tenantId,
      integration.ml_user_id,
      status || 'all',
      search || 'none',
      requestedOffset.toString(),
      requestedLimit.toString()
    );

    // Try Redis cache first (10 min TTL - longer than Supabase 1h check)
    const cachedResponse = await getCached(
      cacheKey,
      async () => {
        // For immediate response, fetch from local cache first (Supabase backup)
        const supabaseForCache = await createClient();
        const { products: cachedProducts, total: cachedTotal } = await getCachedProducts(supabaseForCache, integration.id, {
          status: status || undefined,
          search: search || undefined,
          limit: requestedLimit,
          offset: requestedOffset
        });

        // If we have cached products and they're recent (< 1 hour), return them
        // But only for small requests (pagination), not for large counts (stats)
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
        const hasRecentCache = cachedProducts.length > 0 &&
                              // eslint-disable-next-line @typescript-eslint/no-explicit-any
                              cachedProducts.some((p: any) => p.last_sync_at > oneHourAgo);

        // For large limits (like stats requests), always fetch fresh data
        // For small limits (pagination), use cache if available
        const shouldUseCache = hasRecentCache && requestedLimit <= 50 && cachedProducts.length >= requestedLimit;

        if (shouldUseCache) {
          logger.info(`Returning cached products: ${cachedProducts.length} items`);
          return {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            results: cachedProducts.map((p: any) => p.ml_data),
            paging: {
              total: cachedTotal,
              offset: requestedOffset,
              limit: requestedLimit,
              primary_results: cachedProducts.length
            }
          };
        }

        // Otherwise, fetch fresh data from ML API with intelligent pagination
    const allItemIds: string[] = [];
    let scrollId: string | null = null;
    const limit = 100; // Max allowed by ML API
    let hasMore = true;
    let totalItems = 0;

    logger.info(`Cache miss or stale, fetching from ML API...`);

    // First request to check total items and determine strategy
    const initialUrl = `/users/${integration.ml_user_id}/items/search?limit=${limit}&offset=0`;
    
    logger.info(`Initial fetch: ${initialUrl}`);
    
    const initialResponse = await tokenManager.makeMLRequest(
      integration.id,
      initialUrl
    );

    if (!initialResponse.ok) {
      const errorText = await initialResponse.text();
      logger.error('ML API Initial Error:', initialResponse.status, errorText);
      return NextResponse.json({ error: 'Failed to fetch from ML API' }, { status: initialResponse.status });
    }

    const initialData = await initialResponse.json();
    totalItems = initialData.paging?.total || 0;
    
    logger.info(`📊 Total items detected: ${totalItems}`);

    if (initialData.results && initialData.results.length > 0) {
      allItemIds.push(...initialData.results);
    }

    // If more than 1000 items, use scroll method
    if (totalItems > 1000) {
      logger.info(`🔄 Using scroll method for ${totalItems} items`);
      
      // Start scan mode
      const scanUrl = `/users/${integration.ml_user_id}/items/search?search_type=scan&limit=${limit}`;
      
      const scanResponse = await tokenManager.makeMLRequest(
        integration.id,
        scanUrl
      );

      if (scanResponse.ok) {
        const scanData = await scanResponse.json();
        scrollId = scanData.scroll_id;
        
        if (scanData.results && scanData.results.length > 0) {
          allItemIds.length = 0; // Clear initial results
          allItemIds.push(...scanData.results);
        }

        // Continue with scroll
        while (scrollId && hasMore && allItemIds.length < totalItems) {
          const scrollUrl = `/users/${integration.ml_user_id}/items/search?search_type=scan&scroll_id=${scrollId}&limit=${limit}`;
          
          logger.info(`Fetching scroll batch: ${allItemIds.length}/${totalItems}`);
          
          const scrollResponse = await tokenManager.makeMLRequest(
            integration.id,
            scrollUrl
          );

          if (!scrollResponse.ok) {
            logger.warn(`Scroll request failed: ${scrollResponse.status}`);
            break;
          }

          const scrollData = await scrollResponse.json();
          
          if (scrollData.results && scrollData.results.length > 0) {
            allItemIds.push(...scrollData.results);
          } else {
            hasMore = false; // No more results
          }

          scrollId = scrollData.scroll_id; // Update scroll_id for next iteration
        }
      } else {
        logger.warn('Scan mode not available, falling back to regular pagination');
      }
    }

    // If not using scroll or scroll failed, use regular pagination up to limit
    if (totalItems <= 1000 || allItemIds.length < Math.min(totalItems, 500)) {
      logger.info(`📄 Using regular pagination for remaining items`);
      
      let offset = allItemIds.length;
      hasMore = offset < totalItems;

      while (hasMore && offset < Math.min(totalItems, 1000)) { // Reasonable safety limit
        const paginatedUrl = `/users/${integration.ml_user_id}/items/search?limit=${limit}&offset=${offset}`;
        
        logger.info(`Fetching batch: ${offset}-${offset + limit}/${totalItems}`);
        
        const batchResponse = await tokenManager.makeMLRequest(
          integration.id,
          paginatedUrl
        );

        if (!batchResponse.ok) {
          const errorText = await batchResponse.text();
          logger.error('ML API Error on batch:', batchResponse.status, errorText);
          break;
        }

        const batchData = await batchResponse.json();
        
        if (batchData.results && batchData.results.length > 0) {
          allItemIds.push(...batchData.results);
        }
        
        // Check if there are more items
        hasMore = (batchData.paging?.offset || 0) + (batchData.paging?.limit || 0) < (batchData.paging?.total || 0);
        offset += limit;
        
        logger.info(`Fetched ${batchData.results?.length || 0} items, total so far: ${allItemIds.length}, hasMore: ${hasMore}`);
      }
    }

    logger.info(`Total item IDs collected: ${allItemIds.length}`);

    // Apply client-side filtering if needed
    const paginatedItemIds = allItemIds.slice(requestedOffset, requestedOffset + requestedLimit);
    
    // Get detailed item data for paginated results
    const itemDetailsPromises = paginatedItemIds.map(async (itemId: string) => {
      try {
        const itemResponse = await tokenManager.makeMLRequest(
          integration.id,
          `/items/${itemId}`
        );
        
        if (itemResponse.ok) {
          return await itemResponse.json();
        } else {
          logger.warn(`Failed to fetch item ${itemId}:`, itemResponse.status);
          return null;
        }
      } catch (error) {
        logger.warn(`Error fetching item ${itemId}:`, error);
        return null;
      }
    });

    const itemDetails = await Promise.all(itemDetailsPromises);
    const validItems = itemDetails.filter(item => item !== null);

    logger.info(`Fetched ${validItems.length} item details out of ${paginatedItemIds.length} requested`);
    
    // Sync products to local database
    const supabaseForSync = await createClient();
    try {
      // Convert ML items to ML products format with defaults for missing fields
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mlProducts = validItems.map((item: any) => ({
        id: item.id,
        title: item.title,
        price: item.price,
        available_quantity: item.available_quantity,
        sold_quantity: item.sold_quantity,
        condition: item.condition,
        permalink: item.permalink,
        thumbnail: item.thumbnail,
        status: item.status,
        category_id: item.category_id || '',
        currency_id: item.currency_id || 'BRL',
        buying_mode: item.buying_mode || 'buy_it_now',
        listing_type_id: item.listing_type_id || 'gold_special',
        start_time: item.start_time || new Date().toISOString(),
        tags: item.tags || [],
        automatic_relist: item.automatic_relist || false,
        date_created: item.date_created || new Date().toISOString(),
        last_updated: item.last_updated || new Date().toISOString(),
        channels: item.channels || []
      }));

      const syncResult = await syncProducts(supabaseForSync, integration.id, mlProducts);
      logger.info('Product sync result:', syncResult);
      
      // Log successful sync
      await tokenManager['logSync'](integration.id, 'products', 'success', {
        action: 'items_synced',
        count: validItems.length,
        total: allItemIds.length,
      });
    } catch (syncError) {
      logger.error('Product sync failed:', syncError);
      // Don't fail the request if sync fails, just log it
      await tokenManager['logSync'](integration.id, 'products', 'error', {
        action: 'items_sync_failed',
        error: syncError instanceof Error ? syncError.message : 'Unknown sync error',
      });
    }

    // Return fetched items
    return {
      results: validItems,
      paging: {
        total: allItemIds.length,
        offset: requestedOffset,
        limit: requestedLimit,
        primary_results: validItems.length
      }
    };
      },
      { ttl: CacheTTL.LONG } // 10 minutes cache
    );

    // Return cached or fresh response
    return NextResponse.json(cachedResponse);

  } catch (error) {
    logger.error('ML Items GET Error:', error);
    
    if (error instanceof Error && error.message.includes('Insufficient role')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (error instanceof Error && error.message.includes('No valid ML token')) {
      return NextResponse.json(
        { error: 'ML token expired. Please reconnect your account.' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/ml/items - Create new item
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Verify authentication
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Get ML integration using user ID as tenant ID
    const integration = await tokenManager.getIntegrationByTenant(user.id);
    
    if (!integration) {
      return NextResponse.json(
        { error: 'No active ML integration found' },
        { status: 404 }
      );
    }

    // Parse and validate request body using Zod
    let itemData;
    try {
      itemData = await validateRequestBody(CreateMLItemSchema, request);
    } catch (error) {
      if (error instanceof ValidationError) {
        return NextResponse.json(
          { 
            error: 'Invalid item data',
            details: error.details,
          },
          { status: 400 }
        );
      }
      throw error;
    }

    // Data is already validated by Zod, can use directly
    const mlItemData = {
      ...itemData,
      // These have defaults in the schema, but ensure they're set
      buying_mode: itemData.buying_mode || 'buy_it_now',
      listing_type_id: itemData.listing_type_id || 'gold_special',
      currency_id: itemData.currency_id || 'BRL',
    };

    // Create item on ML
    const mlResponse = await tokenManager.makeMLRequest(
      integration.id,
      '/items',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mlItemData),
      }
    );

    const responseText = await mlResponse.text();
    
    if (!mlResponse.ok) {
      logger.error('ML Create Item Error:', mlResponse.status, responseText);
      
      // Log failed creation
      await tokenManager['logSync'](integration.id, 'products', 'error', {
        action: 'item_create_failed',
        error: responseText,
        status_code: mlResponse.status,
      });
      
      throw new MLApiError(
        `Failed to create item on Mercado Livre: ${responseText}`,
        mlResponse.status
      );
    }

    const rawCreatedItem = JSON.parse(responseText);
    
    // Validate ML API response
    const createdItem = validateOutput(MLItemSchema, rawCreatedItem);
    
    // Log successful creation
    await tokenManager['logSync'](integration.id, 'products', 'success', {
      action: 'item_created',
      item_id: createdItem.id,
      title: createdItem.title,
    });

    return NextResponse.json(createdItem, { status: 201 });

  } catch (error) {
    logger.error('ML Items POST Error:', error);
    
    // Handle specific error types
    if (error instanceof MLApiError) {
      return NextResponse.json(
        { 
          error: 'Failed to create item on Mercado Livre',
          details: error.message,
        },
        { status: error.statusCode }
      );
    }
    
    if (error instanceof Error && error.message.includes('Insufficient role')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (error instanceof Error && error.message.includes('No valid ML token')) {
      return NextResponse.json(
        { error: 'ML token expired. Please reconnect your account.' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
