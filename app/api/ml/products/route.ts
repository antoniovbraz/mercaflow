/**
 * ML Products API
 *
 * Returns ML products from database with pagination and filtering
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, createClient } from '@/utils/supabase/server';
import { logger } from '@/utils/logger';

interface MLProduct {
  id: string;
  ml_item_id: string;
  title: string;
  status: string;
  price: number;
  available_quantity: number;
  sold_quantity: number;
  permalink: string;
  category_id: string | null;
  last_synced_at: string;
  thumbnail?: string;
  condition?: string;
  listing_type_id?: string;
  ml_data?: Record<string, unknown>;
}

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
    const { data: integration, error: integrationError } = await supabase
      .from('ml_integrations')
      .select('id')
      .eq('tenant_id', tenantId)
      .eq('status', 'active')
      .single();

    if (integrationError || !integration) {
      return NextResponse.json(
        { error: 'No active ML integration found' },
        { status: 404 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100); // Max 100 per page
    const status = searchParams.get('status'); // Filter by status
    const search = searchParams.get('search'); // Search in title

    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from('ml_products')
      .select('*', { count: 'exact' })
      .eq('integration_id', integration.id)
      .order('last_synced_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (search) {
      query = query.ilike('title', `%${search}%`);
    }

    const { data: products, error, count } = await query;

    if (error) {
      logger.error('Error fetching products from database:', error);
      return NextResponse.json(
        { error: 'Failed to fetch products' },
        { status: 500 }
      );
    }

    // Transform products to match expected interface
    const transformedProducts: MLProduct[] = (products || []).map(product => ({
      id: product.id,
      ml_item_id: product.ml_item_id,
      title: product.title,
      status: product.status,
      price: product.price,
      available_quantity: product.available_quantity,
      sold_quantity: product.sold_quantity,
      permalink: product.permalink,
      category_id: product.category_id,
      last_synced_at: product.last_synced_at,
      thumbnail: product.thumbnail,
      condition: product.condition,
      listing_type_id: product.listing_type_id,
      ml_data: product.ml_data,
    }));

    const totalPages = Math.ceil((count || 0) / limit);

    logger.info(`ML Products fetched: ${transformedProducts.length} products (page ${page}/${totalPages})`);

    return NextResponse.json({
      products: transformedProducts,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      filters: {
        status: status || 'all',
        search: search || '',
      },
    });

  } catch (error) {
    logger.error('ML Products GET Error:', error);

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