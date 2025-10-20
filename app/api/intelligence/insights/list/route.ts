/**
 * GET /api/intelligence/insights/list
 * 
 * List insights for authenticated user's tenant with filtering and pagination.
 * 
 * Query parameters:
 * - status: Filter by status (PENDING, DISMISSED, COMPLETED, EXPIRED)
 * - category: Filter by category
 * - priority: Filter by priority (1-5)
 * - limit: Number of results (default: 50, max: 100)
 * - offset: Pagination offset (default: 0)
 * - sort: Sort field (created_at, priority, roi_estimate)
 * - order: Sort order (asc, desc)
 * 
 * @authentication Required
 * @authorization Requires valid tenant access
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getCurrentUser } from '@/utils/supabase/roles';
import { getCurrentTenantId } from '@/utils/supabase/tenancy';
import { logger } from '@/utils/logger';

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;
const DEFAULT_SORT = 'created_at';
const DEFAULT_ORDER = 'desc';

const VALID_STATUSES = ['PENDING', 'DISMISSED', 'COMPLETED', 'EXPIRED'];
const VALID_CATEGORIES = [
  'PRICE_OPTIMIZATION',
  'AUTOMATION_OPPORTUNITY',
  'MARKET_TREND',
  'PERFORMANCE_WARNING',
  'QUALITY_IMPROVEMENT',
  'COMPETITOR_ALERT',
];
const VALID_SORT_FIELDS = ['created_at', 'priority', 'roi_estimate', 'confidence'];

// ============================================================================
// API ROUTE HANDLER
// ============================================================================

export async function GET(request: NextRequest) {
  const context = {
    endpoint: '/api/intelligence/insights/list',
    method: 'GET',
  };

  try {
    // 1. Authentication check
    const user = await getCurrentUser();
    if (!user) {
      logger.warn('Unauthorized access attempt', context);
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // 2. Get tenant ID
    const tenantId = await getCurrentTenantId();
    if (!tenantId) {
      logger.warn('User has no tenant', { ...context, userId: user.id });
      return NextResponse.json(
        { error: 'No tenant found for user' },
        { status: 403 }
      );
    }

    // 3. Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const priorityStr = searchParams.get('priority');
    const limitStr = searchParams.get('limit');
    const offsetStr = searchParams.get('offset');
    const sort = searchParams.get('sort') || DEFAULT_SORT;
    const order = searchParams.get('order') || DEFAULT_ORDER;

    // Validate and parse parameters
    const limit = Math.min(
      parseInt(limitStr || String(DEFAULT_LIMIT), 10),
      MAX_LIMIT
    );
    const offset = parseInt(offsetStr || '0', 10);
    const priority = priorityStr ? parseInt(priorityStr, 10) : null;

    // Validate status
    if (status && !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate category
    if (category && !VALID_CATEGORIES.includes(category)) {
      return NextResponse.json(
        { error: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate priority
    if (priority && (priority < 1 || priority > 5)) {
      return NextResponse.json(
        { error: 'Invalid priority. Must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Validate sort field
    if (!VALID_SORT_FIELDS.includes(sort)) {
      return NextResponse.json(
        { error: `Invalid sort field. Must be one of: ${VALID_SORT_FIELDS.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate sort order
    if (order !== 'asc' && order !== 'desc') {
      return NextResponse.json(
        { error: 'Invalid order. Must be asc or desc' },
        { status: 400 }
      );
    }

    logger.info('Fetching insights', {
      ...context,
      userId: user.id,
      tenantId,
      filters: { status, category, priority },
      pagination: { limit, offset },
      sorting: { sort, order },
    });

    // 4. Build query
    const supabase = await createClient();
    let query = supabase
      .from('insights')
      .select('*', { count: 'exact' })
      .eq('tenant_id', tenantId);

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }

    if (category) {
      query = query.eq('category', category);
    }

    if (priority) {
      query = query.eq('priority', priority);
    }

    // Apply sorting
    query = query.order(sort, { ascending: order === 'asc' });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    // 5. Execute query
    const { data: insights, error, count } = await query;

    if (error) {
      logger.error('Failed to fetch insights', error, {
        ...context,
        tenantId,
      });
      return NextResponse.json(
        { error: 'Failed to fetch insights' },
        { status: 500 }
      );
    }

    // 6. Calculate summary statistics
    const summary = {
      total: count || 0,
      returned: insights?.length || 0,
      has_more: (count || 0) > offset + limit,
    };

    logger.info('Insights fetched successfully', {
      ...context,
      userId: user.id,
      tenantId,
      summary,
    });

    return NextResponse.json({
      success: true,
      data: {
        insights: insights || [],
        pagination: {
          limit,
          offset,
          total: count || 0,
          has_more: summary.has_more,
        },
        summary,
      },
    });

  } catch (error) {
    logger.error('Unexpected error fetching insights', error instanceof Error ? error : new Error(String(error)), context);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
