/**
 * Product Sync API - Manual synchronization endpoint
 *
 * Allows manual triggering of product synchronization from ML
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, createClient } from '@/utils/supabase/server';
import { MLTokenManager } from '@/utils/mercadolivre/token-manager';
import { syncProducts } from '@/utils/mercadolivre/product-sync';

const tokenManager = new MLTokenManager();

/**
 * POST /api/products/sync - Trigger manual product synchronization
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

    if (!integration) {
      return NextResponse.json(
        { error: 'No active ML integration found. Please connect your Mercado Livre account.' },
        { status: 404 }
      );
    }

    // Parse request body for sync options
    let syncOptions: { fullSync?: boolean; itemId?: string } = {};
    try {
      const body = await request.json();
      syncOptions = body;
    } catch {
      // No body provided, do full sync
    }

    let syncResult;

    if (syncOptions.itemId) {
      // Sync specific item
      console.log(`🔄 Syncing specific item: ${syncOptions.itemId}`);

      const mlResponse = await tokenManager.makeMLRequest(
        integration.id,
        `/items/${syncOptions.itemId}`
      );

      if (!mlResponse.ok) {
        throw new Error(`Failed to fetch item ${syncOptions.itemId} from ML`);
      }

      const itemData = await mlResponse.json();

      // Convert single item to array and sync
      const mlProducts = [{
        id: itemData.id,
        title: itemData.title,
        price: itemData.price,
        available_quantity: itemData.available_quantity,
        sold_quantity: itemData.sold_quantity,
        condition: itemData.condition,
        permalink: itemData.permalink,
        thumbnail: itemData.thumbnail,
        status: itemData.status,
        category_id: itemData.category_id || '',
        currency_id: itemData.currency_id || 'BRL',
        buying_mode: itemData.buying_mode || 'buy_it_now',
        listing_type_id: itemData.listing_type_id || 'gold_special',
        start_time: itemData.start_time || new Date().toISOString(),
        tags: itemData.tags || [],
        automatic_relist: itemData.automatic_relist || false,
        date_created: itemData.date_created || new Date().toISOString(),
        last_updated: itemData.last_updated || new Date().toISOString(),
        channels: itemData.channels || []
      }];

      syncResult = await syncProducts(supabase, integration.id, mlProducts);

    } else {
      // Full sync - fetch all items from ML
      console.log('🔄 Starting full product sync');

      // Debug: Log integration details
      console.log('🔍 Integration details:', {
        id: integration.id,
        ml_user_id: integration.ml_user_id,
        token_expires_at: integration.token_expires_at,
        status: integration.status,
        current_time: new Date().toISOString()
      });

      const mlResponse = await tokenManager.makeMLRequest(
        integration.id,
        `/users/${integration.ml_user_id}/items/search?limit=50`
      );

      // Debug: Log response details
      console.log('📡 ML API Response:', {
        status: mlResponse.status,
        statusText: mlResponse.statusText,
        headers: Object.fromEntries(mlResponse.headers.entries()),
        url: mlResponse.url
      });

      if (!mlResponse.ok) {
        // Try to get error details from response
        let errorDetails = 'Unknown error';
        try {
          const errorData = await mlResponse.text();
          console.error('❌ ML API Error Response:', errorData);
          errorDetails = errorData;
        } catch (e) {
          console.error('❌ Could not read error response:', e);
        }

        throw new Error(`Failed to fetch items from ML: ${mlResponse.status} ${mlResponse.statusText} - ${errorDetails}`);
      }

      const data = await mlResponse.json();

      // Convert items and sync
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mlProducts = data.results.map((item: any) => ({
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

      syncResult = await syncProducts(supabase, integration.id, mlProducts);
    }

    // Log the sync operation
    await tokenManager['logSync'](integration.id, 'products', 'success', {
      action: syncOptions.itemId ? 'manual_item_sync' : 'manual_full_sync',
      count: syncResult.total,
      total: syncResult.total,
    });

    return NextResponse.json({
      success: true,
      synced: syncResult.synced,
      failed: syncResult.failed,
      total: syncResult.total,
      message: syncOptions.itemId
        ? `Produto ${syncOptions.itemId} sincronizado com sucesso`
        : `${syncResult.synced} produtos sincronizados, ${syncResult.failed} falharam`
    });

  } catch (error) {
    console.error('Product sync error:', error);

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
      {
        error: 'Sync failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}