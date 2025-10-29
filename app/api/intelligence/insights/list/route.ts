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

const STATUS_REQUEST_MAP = {
  PENDING: 'PENDING',
  ACTIVE: 'PENDING',
  DISMISSED: 'DISMISSED',
  COMPLETED: 'COMPLETED',
  EXPIRED: 'EXPIRED',
} as const;

const STATUS_RESPONSE_MAP = {
  PENDING: 'ACTIVE',
  DISMISSED: 'DISMISSED',
  COMPLETED: 'COMPLETED',
  EXPIRED: 'DISMISSED',
} as const;

const VALID_CATEGORIES = [
  'PRICE_OPTIMIZATION',
  'AUTOMATION_OPPORTUNITY',
  'MARKET_TREND',
  'PERFORMANCE_WARNING',
  'QUALITY_IMPROVEMENT',
  'COMPETITOR_ALERT',
];

const SORT_FIELD_MAP = {
  created_at: 'created_at',
  priority: 'priority',
  roi_estimate: 'roi_estimate',
  confidence_score: 'confidence',
} as const;

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
    
    const statusParam = searchParams.get('status');
    const category = searchParams.get('category');
  const priorityStr = searchParams.get('priority');
    const limitStr = searchParams.get('limit');
    const offsetStr = searchParams.get('offset');
    const sortParam = searchParams.get('sort') || DEFAULT_SORT;
    const order = searchParams.get('order') || DEFAULT_ORDER;

    // Validate and parse parameters
    const limit = Math.min(
      parseInt(limitStr || String(DEFAULT_LIMIT), 10),
      MAX_LIMIT
    );
    const offset = parseInt(offsetStr || '0', 10);
  const priority = priorityStr !== null ? parseInt(priorityStr, 10) : null;

    const normalizedStatus = statusParam
      ? (statusParam.toUpperCase() as keyof typeof STATUS_REQUEST_MAP)
      : null;

    const validStatusKeys = Object.keys(STATUS_REQUEST_MAP);

    if (
      normalizedStatus &&
      !Object.prototype.hasOwnProperty.call(STATUS_REQUEST_MAP, normalizedStatus)
    ) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatusKeys.join(', ')}` },
        { status: 400 }
      );
    }

    const dbStatus = normalizedStatus ? STATUS_REQUEST_MAP[normalizedStatus] : null;

    const sortKey = sortParam as keyof typeof SORT_FIELD_MAP;
    if (!Object.prototype.hasOwnProperty.call(SORT_FIELD_MAP, sortKey)) {
      return NextResponse.json(
        { error: `Invalid sort field. Must be one of: ${Object.keys(SORT_FIELD_MAP).join(', ')}` },
        { status: 400 }
      );
    }
    const sortField = SORT_FIELD_MAP[sortKey];

    // Validate category
    if (category && !VALID_CATEGORIES.includes(category)) {
      return NextResponse.json(
        { error: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate priority
    if (priority !== null) {
      if (Number.isNaN(priority) || priority < 1 || priority > 5) {
      return NextResponse.json(
        { error: 'Invalid priority. Must be between 1 and 5' },
        { status: 400 }
      );
      }
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
  filters: { status: statusParam, category, priority },
      pagination: { limit, offset },
  sorting: { sort: sortParam, order },
    });

    // 4. Build query
    const supabase = await createClient();
    let query = supabase
      .from('insights')
      .select('*', { count: 'exact' })
      .eq('tenant_id', tenantId);

    // Apply filters
    if (dbStatus) {
      query = query.eq('status', dbStatus);
    }

    if (category) {
      query = query.eq('category', category);
    }

    if (priority) {
      query = query.eq('priority', priority);
    }

    // Apply sorting
    query = query.order(sortField, { ascending: order === 'asc' });

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

    const toUiPriority = (value?: number) => {
      if (value === null || value === undefined) return 'LOW' as const;
      if (value <= 2) return 'HIGH' as const;
      if (value === 3) return 'MEDIUM' as const;
      return 'LOW' as const;
    };

    const rawInsights = insights ?? [];
    const transformedInsights = rawInsights.map((insight) => {
      const statusKey = (insight.status as keyof typeof STATUS_RESPONSE_MAP) || 'PENDING';
      return {
        ...insight,
        priority_value: insight.priority,
        priority: toUiPriority(insight.priority),
        status: STATUS_RESPONSE_MAP[statusKey] || 'ACTIVE',
        confidence_score: (insight.confidence ?? 0) / 100,
      };
    });

    // 6. Calculate summary statistics
    const summary = {
      total: count || 0,
      returned: transformedInsights.length,
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
        insights: transformedInsights,
        count: summary.total,
        has_more: summary.has_more,
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
