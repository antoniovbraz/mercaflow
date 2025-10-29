/**
 * Products API - Local cached products
 *
 * Returns products from local database cache with filtering and pagination
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, createClient } from '@/utils/supabase/server';
import { getCachedProducts, getProductStats } from '@/utils/mercadolivre/product-sync';
import { getMLIntegrationService } from '@/utils/mercadolivre/services';

const integrationService = getMLIntegrationService();

/**
 * GET /api/products - Get cached products with filtering
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
    const integration = await integrationService.getActiveTenantIntegration(tenantId);

    if (!integration) {
      return NextResponse.json(
        { error: 'No active ML integration found. Please connect your Mercado Livre account.' },
        { status: 404 }
      );
    }

    // Parse query parameters
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const search = url.searchParams.get('search');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const stats = url.searchParams.get('stats') === 'true';

    // Get products from cache
    const { products, total } = await getCachedProducts(supabase, integration.id, {
      status: status || undefined,
      search: search || undefined,
      limit,
      offset
    });

    const response: {
      products: unknown[];
      pagination: {
        total: number;
        limit: number;
        offset: number;
        hasMore: boolean;
      };
      stats?: unknown;
    } = {
      products,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    };

    // Include stats if requested
    if (stats) {
      const productStats = await getProductStats(supabase, integration.id);
      response.stats = productStats;
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('Products API Error:', error);

    if (error instanceof Error && error.message.includes('Insufficient role')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
