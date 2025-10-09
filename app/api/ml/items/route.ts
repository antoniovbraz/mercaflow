/**
 * ML Items API Proxy
 * 
 * Proxies requests to ML Items API with automatic authentication
 * and token refresh. Handles rate limiting and error management.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, createClient } from '@/utils/supabase/server';
import { MLTokenManager } from '@/utils/mercadolivre/token-manager';
import { syncProducts, getCachedProducts } from '@/utils/mercadolivre/product-sync';

const tokenManager = new MLTokenManager();

interface CreateItemRequest {
  title: string;
  category_id: string;
  price: number;
  currency_id: string;
  available_quantity: number;
  buying_mode: string;
  condition: string;
  listing_type_id: string;
  description?: string;
  pictures?: Array<{ source: string }>;
  attributes?: Array<{
    id: string;
    value_name?: string;
    value_id?: string;
  }>;
  sale_terms?: Array<{
    id: string;
    value_name: string;
  }>;
}

/**
 * GET /api/ml/items - List user's items
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
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
    
    console.log('ML Items Debug:', {
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
      console.error('No ML integration found for tenant:', tenantId);
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
    
    console.log('Making ML API request:', {
      integrationId: integration.id,
      mlUserId: integration.ml_user_id,
      apiUrl: mlApiUrl,
      searchParams: searchParams.toString()
    });

    // For immediate response, fetch from local cache first
    const supabaseForCache = await createClient();
    const { products: cachedProducts, total: cachedTotal } = await getCachedProducts(supabaseForCache, integration.id, {
      status: status || undefined,
      search: search || undefined,
      limit: requestedLimit,
      offset: requestedOffset
    });

    // If we have cached products and they're recent (< 1 hour), return them
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const hasRecentCache = cachedProducts.length > 0 && 
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          cachedProducts.some((p: any) => p.last_synced_at > oneHourAgo);

    if (hasRecentCache && cachedProducts.length >= requestedLimit) {
      console.log(`Returning cached products: ${cachedProducts.length} items`);
      return NextResponse.json({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        results: cachedProducts.map((p: any) => p.ml_data),
        paging: {
          total: cachedTotal,
          offset: requestedOffset,
          limit: requestedLimit,
          primary_results: cachedProducts.length
        }
      });
    }

    // Otherwise, fetch fresh data from ML API with intelligent pagination
    const allItemIds: string[] = [];
    let offset = 0;
    const limit = 100; // Max allowed by ML API
    let hasMore = true;

    console.log(`Cache miss or stale, fetching from ML API...`);

    // Fetch all item IDs with pagination
    while (hasMore && allItemIds.length < 1000) { // Safety limit
      const paginatedUrl = `/users/${integration.ml_user_id}/items/search?limit=${limit}&offset=${offset}`;
      
      console.log(`Fetching batch: ${paginatedUrl}`);
      
      const batchResponse = await tokenManager.makeMLRequest(
        integration.id,
        paginatedUrl
      );

      if (!batchResponse.ok) {
        const errorText = await batchResponse.text();
        console.error('ML API Error on batch:', batchResponse.status, errorText);
        break;
      }

      const batchData = await batchResponse.json();
      
      if (batchData.results && batchData.results.length > 0) {
        allItemIds.push(...batchData.results);
        
        // Check if there are more items
        hasMore = (batchData.paging?.offset || 0) + (batchData.paging?.limit || 0) < (batchData.paging?.total || 0);
        offset += limit;
        
        console.log(`Fetched ${batchData.results.length} items, total so far: ${allItemIds.length}, hasMore: ${hasMore}`);
      } else {
        hasMore = false;
      }
    }

    console.log(`Total item IDs collected: ${allItemIds.length}`);

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
          console.warn(`Failed to fetch item ${itemId}:`, itemResponse.status);
          return null;
        }
      } catch (error) {
        console.warn(`Error fetching item ${itemId}:`, error);
        return null;
      }
    });

    const itemDetails = await Promise.all(itemDetailsPromises);
    const validItems = itemDetails.filter(item => item !== null);

    console.log(`Fetched ${validItems.length} item details out of ${paginatedItemIds.length} requested`);
    
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
      console.log('Product sync result:', syncResult);
      
      // Log successful sync
      await tokenManager['logSync'](integration.id, 'products', 'success', {
        action: 'items_synced',
        count: validItems.length,
        total: allItemIds.length,
      });
    } catch (syncError) {
      console.error('Product sync failed:', syncError);
      // Don't fail the request if sync fails, just log it
      await tokenManager['logSync'](integration.id, 'products', 'error', {
        action: 'items_sync_failed',
        error: syncError instanceof Error ? syncError.message : 'Unknown sync error',
      });
    }

    return NextResponse.json({
      results: validItems,
      paging: {
        total: allItemIds.length,
        offset: requestedOffset,
        limit: requestedLimit,
        primary_results: validItems.length
      }
    });

  } catch (error) {
    console.error('ML Items GET Error:', error);
    
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

    // Parse and validate request body
    let itemData: CreateItemRequest;
    try {
      itemData = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    // Basic validation
    const requiredFields = ['title', 'category_id', 'price', 'currency_id', 'available_quantity', 'condition'];
    const missingFields = requiredFields.filter(field => !itemData[field as keyof CreateItemRequest]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          error: 'Missing required fields',
          missing: missingFields,
        },
        { status: 400 }
      );
    }

    // Set defaults for required ML fields
    const mlItemData = {
      ...itemData,
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
      console.error('ML Create Item Error:', mlResponse.status, responseText);
      
      // Log failed creation
      await tokenManager['logSync'](integration.id, 'products', 'error', {
        action: 'item_create_failed',
        error: responseText,
        status_code: mlResponse.status,
      });
      
      return NextResponse.json(
        { 
          error: 'Failed to create item on Mercado Livre',
          details: responseText,
        },
        { status: mlResponse.status }
      );
    }

    const createdItem = JSON.parse(responseText);
    
    // Log successful creation
    await tokenManager['logSync'](integration.id, 'products', 'success', {
      action: 'item_created',
      item_id: createdItem.id,
      title: createdItem.title,
    });

    return NextResponse.json(createdItem, { status: 201 });

  } catch (error) {
    console.error('ML Items POST Error:', error);
    
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