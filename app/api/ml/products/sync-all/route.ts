import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { MLTokenManager } from '@/utils/mercadolivre/token-manager';

/**
 * POST /api/ml/products/sync-all
 * 
 * Sincroniza TODOS os produtos do Mercado Livre (com paginação)
 * Busca todos os anúncios ativos e inativos do usuário
 */
export async function POST() {
  try {
    console.log('🔄 Starting complete product sync from ML...');
    
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user profile for tenant ID
    const { data: profile } = await supabase
      .from('profiles')
      .select('tenant_id')
      .eq('id', user.id)
      .single();

    const tenantId = profile?.tenant_id || user.id;

    // Get active ML integration
    const { data: integration, error: integrationError } = await supabase
      .from('ml_integrations')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('status', 'active')
      .maybeSingle();

    if (integrationError || !integration) {
      console.error('No ML integration found for tenant:', tenantId);
      return NextResponse.json(
        { error: 'No active ML integration found. Please connect your Mercado Livre account.' },
        { status: 404 }
      );
    }

    console.log(`🔍 Syncing products for ML user ${integration.ml_user_id}...`);

    // Initialize token manager for ML API calls
    const tokenManager = new MLTokenManager();
    
    // STEP 1: Fetch ALL product IDs with pagination
    console.log(`📋 STEP 1: Fetching product IDs from ML...`);
    let allProductIds: string[] = [];
    let offset = 0;
    const limit = 50; // ML API max per page
    let hasMore = true;

    while (hasMore) {
      console.log(`📦 Fetching product IDs page: offset=${offset}, limit=${limit}`);
      
      try {
        // ML /users/{id}/items/search returns only IDs, not full objects
        const response = await tokenManager.makeMLRequest(
          integration.id,
          `/users/${integration.ml_user_id}/items/search?offset=${offset}&limit=${limit}`,
          {
            method: 'GET',
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`❌ ML API error: ${response.status} ${response.statusText}`, errorText);
          throw new Error(`ML API error: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const data = await response.json();
        
        // ML returns { results: ["MLB123", "MLB456", ...], paging: {...} }
        // NOTE: results are ITEM IDs (strings), not full product objects!
        const itemIds = data.results || [];
        const paging = data.paging || {};
        
        console.log(`✅ Fetched ${itemIds.length} product IDs (total so far: ${allProductIds.length + itemIds.length} of ${paging.total})`);
        
        allProductIds = [...allProductIds, ...itemIds];
        
        // Check if there are more pages
        const nextOffset = offset + limit;
        hasMore = nextOffset < paging.total;
        
        offset = nextOffset;
        
        // Safety check: prevent infinite loops
        if (offset > 10000) {
          console.warn('⚠️ Reached safety limit of 10k products');
          break;
        }
        
      } catch (error) {
        console.error(`❌ Error fetching product IDs at offset ${offset}:`, error);
        hasMore = false;
      }
    }

    console.log(`📊 Total product IDs fetched: ${allProductIds.length}`);
    
    if (allProductIds.length === 0) {
      console.warn('⚠️ No products found for this seller');
      return NextResponse.json({
        success: true,
        message: 'No products found',
        total_fetched: 0,
        synced: 0,
        errors: 0,
      });
    }

    // STEP 2: Fetch full product details using multiget (20 IDs per request)
    console.log(`📋 STEP 2: Fetching full product details via multiget...`);
    const allProducts: Array<Record<string, unknown>> = [];
    const chunkSize = 20; // ML multiget max
    
    for (let i = 0; i < allProductIds.length; i += chunkSize) {
      const chunk = allProductIds.slice(i, i + chunkSize);
      const idsParam = chunk.join(',');
      
      console.log(`� Fetching product details: ${i + 1}-${Math.min(i + chunkSize, allProductIds.length)} of ${allProductIds.length}`);
      
      try {
        // Multiget: /items?ids=MLB123,MLB456,...
        const response = await tokenManager.makeMLRequest(
          integration.id,
          `/items?ids=${idsParam}&attributes=id,title,price,available_quantity,sold_quantity,status,category_id,permalink,thumbnail,condition,listing_type_id`,
          {
            method: 'GET',
          }
        );

        if (!response.ok) {
          console.error(`❌ Multiget failed for chunk starting at ${i}`);
          continue;
        }

        const multigetData = await response.json();
        
        // Multiget returns: [{ code: 200, body: {...} }, { code: 404, body: {...} }, ...]
        for (const result of multigetData) {
          if (result.code === 200 && result.body) {
            allProducts.push(result.body);
          } else {
            console.warn(`⚠️ Failed to fetch product ${result.body?.id || 'unknown'}: ${result.code}`);
          }
        }
        
      } catch (error) {
        console.error(`❌ Error in multiget for chunk ${i}:`, error);
      }
    }

    console.log(`📊 Total products with full details: ${allProducts.length}`);
    
    // Sort products: active first, then paused, then others
    allProducts.sort((a, b) => {
      const statusOrder = { 'active': 0, 'paused': 1, 'closed': 2 };
      const statusA = statusOrder[a.status as keyof typeof statusOrder] ?? 3;
      const statusB = statusOrder[b.status as keyof typeof statusOrder] ?? 3;
      
      if (statusA !== statusB) {
        return statusA - statusB;
      }
      
      // If same status, sort by title
      return String(a.title || '').localeCompare(String(b.title || ''));
    });
    
    console.log(`📋 Products sorted by status and title`);
    console.log(`📋 Status distribution:`, {
      active: allProducts.filter(p => p.status === 'active').length,
      paused: allProducts.filter(p => p.status === 'paused').length,
      closed: allProducts.filter(p => p.status === 'closed').length,
      other: allProducts.filter(p => !['active', 'paused', 'closed'].includes(p.status as string)).length
    });

    // Now sync all products to database
    let syncedCount = 0;
    let errorCount = 0;

    console.log(`💾 Starting database sync for ${allProducts.length} products...`);

    for (const mlProduct of allProducts) {
      try {
        // Upsert product to database - only fields that exist in schema
        const productData = {
          integration_id: integration.id,
          ml_item_id: String(mlProduct.id),
          title: String(mlProduct.title || 'Untitled'),
          status: String(mlProduct.status || 'unknown'),
          price: typeof mlProduct.price === 'number' ? mlProduct.price : 0,
          available_quantity: typeof mlProduct.available_quantity === 'number' ? mlProduct.available_quantity : 0,
          sold_quantity: typeof mlProduct.sold_quantity === 'number' ? mlProduct.sold_quantity : 0,
          permalink: mlProduct.permalink ? String(mlProduct.permalink) : null,
          category_id: mlProduct.category_id ? String(mlProduct.category_id) : null,
          last_sync_at: new Date().toISOString(), // Fixed: use last_sync_at
          // Store full ML data in ml_data JSONB field for reference
          ml_data: mlProduct,
        };

        console.log(`💾 Upserting product ${mlProduct.id}: ${mlProduct.title}`);

        const { error: upsertError } = await supabase
          .from('ml_products')
          .upsert(productData, {
            onConflict: 'integration_id,ml_item_id',
          });

        if (upsertError) {
          console.error(`❌ Error upserting product ${mlProduct.id}:`, upsertError);
          errorCount++;
        } else {
          syncedCount++;
          console.log(`✅ Successfully upserted product ${mlProduct.id}`);
        }
      } catch (error) {
        console.error(`❌ Error processing product ${mlProduct.id}:`, error);
        errorCount++;
      }
    }

    // Update integration last_sync_at
    await supabase
      .from('ml_integrations')
      .update({ last_sync_at: new Date().toISOString() })
      .eq('id', integration.id);

    console.log(`✅ Sync complete: ${syncedCount} synced, ${errorCount} errors`);

    return NextResponse.json({
      success: true,
      message: 'Products synced successfully',
      total_fetched: allProducts.length,
      synced: syncedCount,
      errors: errorCount,
      integration_id: integration.id,
    });

  } catch (error) {
    console.error('❌ Complete product sync error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to sync products',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
