/**
 * ML Products API - List products from database
 * 
 * GET /api/ml/products - Returns paginated list of ML products
 * 
 * Features:
 * - Pagination (page, limit)
 * - Filtering (status, search)
 * - Diagnostic mode (integration status)
 * - Full tenant isolation via RLS
 * 
 * @refactored Uses MLProductRepository + MLIntegrationRepository
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/utils/supabase/server';
import { getCurrentTenantId } from '@/utils/supabase/tenancy';
import { logger } from '@/utils/logger';
import { MLProductRepository } from '@/utils/mercadolivre/repositories/MLProductRepository';
import { MLIntegrationRepository } from '@/utils/mercadolivre/repositories/MLIntegrationRepository';
import { MLSyncLogRepository } from '@/utils/mercadolivre/repositories/MLSyncLogRepository';

/**
 * GET /api/ml/products
 * 
 * Query params:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 20, max: 100)
 * - status: Filter by status (active, paused, closed, etc.)
 * - search: Search in title (case-insensitive)
 * - diagnostic: Return diagnostic info (true/false)
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // 1. Authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // 2. Get tenant context
    const tenantId = await getCurrentTenantId();
    if (!tenantId) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 400 }
      );
    }

    // 3. Initialize repositories
    const integrationRepo = new MLIntegrationRepository();
    const productRepo = new MLProductRepository();
    const syncLogRepo = new MLSyncLogRepository();

    // 4. Get active integrations
    const integrations = await integrationRepo.findByTenant(tenantId);
    const integration = integrations.find(i => i.status === 'active') || null;
    
    // 5. Check for diagnostic mode
    const url = new URL(request.url);
    const isDiagnostic = url.searchParams.get('diagnostic') === 'true';

    if (isDiagnostic) {
      // Return diagnostic information
      if (!integration) {
        return NextResponse.json({
          diagnostic: {
            userId: user.id,
            tenantId,
            integration: null,
            error: 'No active ML integration found',
            productCount: 0,
            recentSyncLogs: []
          }
        });
      }

      const productCount = await productRepo.count(integration.id);
      const recentSyncLogs = await syncLogRepo.findByIntegration(integration.id, { limit: 3 });

      return NextResponse.json({
        diagnostic: {
          userId: user.id,
          tenantId,
          integration: {
            id: integration.id,
            ml_user_id: integration.ml_user_id,
            status: integration.status,
            last_sync_at: integration.last_sync_at,
            auto_sync_enabled: integration.auto_sync_enabled,
            sync_frequency_minutes: integration.sync_frequency_minutes
          },
          productCount,
          recentSyncLogs: recentSyncLogs.slice(0, 3).map((log) => ({
            id: log.id,
            sync_type: log.sync_type,
            status: log.status,
            created_at: log.created_at,
            completed_at: log.completed_at,
            error_message: log.error_message
          }))
        }
      });
    }

    // 6. Require integration for normal listing
    if (!integration) {
      return NextResponse.json(
        { error: 'No active ML integration found. Please connect your Mercado Livre account.' },
        { status: 404 }
      );
    }

    // 7. Parse query parameters
    const { searchParams } = url;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100); // Max 100
    const statusFilter = searchParams.get('status');
    const searchFilter = searchParams.get('search');

    const offset = (page - 1) * limit;

    // 8. Build repository options
    const options: { status?: string; limit?: number; offset?: number } = {
      limit,
      offset
    };
    
    if (statusFilter && statusFilter !== 'all') {
      options.status = statusFilter;
    }

    // 9. Fetch products from repository
    const products = await productRepo.findByIntegration(
      integration.id,
      options
    );

    // 10. Apply search filter if needed (manual filter since repo doesn't support search)
    let filteredProducts = products;
    if (searchFilter) {
      filteredProducts = products.filter(p => 
        p.title.toLowerCase().includes(searchFilter.toLowerCase())
      );
    }

    // 11. Get total count
    const total = await productRepo.count(
      integration.id,
      statusFilter && statusFilter !== 'all' ? statusFilter : undefined
    );

    // 12. Calculate pagination
    const totalPages = Math.ceil(total / limit);

    logger.info('ML Products fetched', {
      integrationId: integration.id,
      tenantId,
      count: filteredProducts.length,
      total,
      page,
      totalPages
    });

    // 13. Return response
    return NextResponse.json({
      products: filteredProducts.map((p) => ({
        id: p.id,
        ml_item_id: p.ml_item_id,
        title: p.title,
        status: p.status,
        price: p.price,
        available_quantity: p.available_quantity,
        sold_quantity: p.sold_quantity,
        permalink: p.permalink,
        category_id: p.category_id,
        last_sync_at: p.last_sync_at,
        thumbnail: p.thumbnail,
        condition: p.condition,
        listing_type_id: p.listing_type_id,
        ml_data: p.ml_data,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      filters: {
        status: statusFilter || 'all',
        search: searchFilter || '',
      },
    });

  } catch (error) {
    logger.error('ML Products GET Error', { error });

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
