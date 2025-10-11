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
    
    // Fetch ALL products with pagination
    let allProducts: Array<Record<string, unknown>> = [];
    let offset = 0;
    const limit = 50; // ML API max per page
    let hasMore = true;
    let totalFetched = 0;

    while (hasMore) {
      console.log(`📦 Fetching products page: offset=${offset}, limit=${limit}`);
      
      try {
        // Make ML API request with pagination
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
        
        // Log API response details for debugging
        console.log(`🔍 ML API response:`, {
          hasResults: !!data.results,
          resultsCount: data.results?.length || 0,
          paging: data.paging,
          totalInPaging: data.paging?.total || 0
        });
        
        // ML returns { results: [...], paging: {...} }
        const products = data.results || [];
        const paging = data.paging || {};
        
        console.log(`✅ Fetched ${products.length} products (total so far: ${totalFetched + products.length})`);
        
        allProducts = [...allProducts, ...products];
        totalFetched += products.length;
        
        // Check if there are more pages
        hasMore = paging.offset + paging.limit < paging.total;
        offset += limit;
        
        // Safety check: prevent infinite loops
        if (offset > 10000) {
          console.warn('⚠️ Reached safety limit of 10k products');
          break;
        }
        
      } catch (error) {
        console.error(`❌ Error fetching products at offset ${offset}:`, error);
        // Continue with what we have
        hasMore = false;
      }
    }

    console.log(`📊 Total products fetched from ML: ${allProducts.length}`);
    
    // Log sample of fetched products
    if (allProducts.length > 0) {
      console.log(`📋 Sample products:`, allProducts.slice(0, 2).map(p => ({
        id: p.id,
        title: p.title,
        status: p.status,
        price: p.price
      })));
    } else {
      console.log(`⚠️ No products fetched from ML API`);
    }

    // Now sync all products to database
    let syncedCount = 0;
    let errorCount = 0;

    console.log(`💾 Starting database sync for ${allProducts.length} products...`);

    for (const mlProduct of allProducts) {
      try {
        // Upsert product to database
        const productData = {
          integration_id: integration.id,
          ml_item_id: mlProduct.id,
          title: mlProduct.title,
          status: mlProduct.status,
          price: mlProduct.price,
          available_quantity: mlProduct.available_quantity || 0,
          sold_quantity: mlProduct.sold_quantity || 0,
          condition: mlProduct.condition,
          listing_type_id: mlProduct.listing_type_id,
          permalink: mlProduct.permalink,
          thumbnail: mlProduct.thumbnail,
          category_id: mlProduct.category_id,
          last_synced_at: new Date().toISOString(),
        };

        console.log(`💾 Upserting product ${mlProduct.id}: ${mlProduct.title}`);

        const { error: upsertError } = await supabase
          .from('ml_products')
          .upsert(productData, {
            onConflict: 'ml_item_id,integration_id',
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
