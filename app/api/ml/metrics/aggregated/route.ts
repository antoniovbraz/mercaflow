/**
 * ML Aggregated Metrics API
 *
 * Provides aggregated metrics across multiple types in a single request
 * Useful for dashboard views and comprehensive analytics
 *
 * Endpoint: GET /api/ml/metrics/aggregated?types=visits,questions&period=30d&aggregate=weekly
 * ML APIs: Multiple metrics endpoints combined
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, createClient } from '@/utils/supabase/server';
import { MLTokenManager } from '@/utils/mercadolivre/token-manager';
import { getCached, buildCacheKey, CachePrefix, CacheTTL } from '@/utils/redis';
import { logger } from '@/utils/logger';

const tokenManager = new MLTokenManager();

interface AggregatedMetricsRequest {
  types: string[]; // Array of metric types to aggregate
  period?: string;
  aggregate?: 'daily' | 'weekly' | 'monthly';
  date_from?: string;
  date_to?: string;
  item_ids?: string[];
  user_id?: string;
}

interface MLIntegration {
  access_token: string;
  ml_user_id: string | number;
  tenant_id: string;
}

interface MetricResult {
  data: Record<string, unknown>;
  summary: {
    total: number;
    average: number;
    trend: 'up' | 'down' | 'stable';
    trend_percentage: number;
  };
  api_url: string;
  error?: string;
}

interface AggregatedMetricsResponse {
  types: string[];
  period: string;
  aggregate: string;
  metrics: Record<string, {
    data: Record<string, unknown>;
    summary: {
      total: number;
      average: number;
      trend: 'up' | 'down' | 'stable';
      trend_percentage: number;
    };
    api_url: string;
    error?: string;
  }>;
  overall_summary: {
    total_metrics: number;
    successful_requests: number;
    failed_requests: number;
    average_trend: 'up' | 'down' | 'stable';
  };
  cache_info: {
    cached: boolean;
    cache_key: string;
    expires_at?: string;
  };
  last_updated: string;
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
    const integration = await tokenManager.getIntegrationByTenant(tenantId);

    if (!integration) {
      return NextResponse.json(
        { error: 'No active ML integration found' },
        { status: 404 }
      );
    }

    // Parse request parameters
    const { searchParams } = new URL(request.url);
    const typesParam = searchParams.get('types');

    if (!typesParam) {
      return NextResponse.json(
        {
          error: 'types parameter is required',
          example: 'types=visits,questions,phone_views'
        },
        { status: 400 }
      );
    }

    const requestData: AggregatedMetricsRequest = {
      types: typesParam.split(',').map(t => t.trim()),
      period: searchParams.get('period') || '30d',
      aggregate: (searchParams.get('aggregate') || 'daily') as AggregatedMetricsRequest['aggregate'],
      date_from: searchParams.get('date_from') || undefined,
      date_to: searchParams.get('date_to') || undefined,
      item_ids: searchParams.get('item_ids')?.split(','),
      user_id: searchParams.get('user_id') || undefined
    };

    // Validate metric types
    const validTypes = ['visits', 'visits_time_window', 'questions', 'questions_time_window', 'phone_views', 'phone_views_time_window'];
    const invalidTypes = requestData.types.filter(type => !validTypes.includes(type));

    if (invalidTypes.length > 0) {
      return NextResponse.json(
        {
          error: 'Invalid metric types',
          invalid_types: invalidTypes,
          valid_types: validTypes
        },
        { status: 400 }
      );
    }

    logger.info(`Fetching aggregated metrics: ${requestData.types.join(', ')} for period: ${requestData.period}`);

    // Check cache first
    const cacheKey = buildCacheKey(
      CachePrefix.ML_USER,
      `aggregated_${tenantId}_${requestData.types.sort().join('_')}_${requestData.period}_${requestData.aggregate}`
    );

    let cached = false;
    let cacheExpiry: string | undefined;

    // Use cache for non-real-time requests
    const shouldUseCache = !isRealTimeRequest(requestData);

    let aggregatedData: Record<string, any> | null = null;

    if (shouldUseCache) {
      try {
        aggregatedData = await getCached(
          cacheKey,
          async () => fetchAggregatedMetrics(requestData, integration),
          { ttl: CacheTTL.MEDIUM, context: { tenantId, types: requestData.types } }
        );
        cached = true;
        cacheExpiry = new Date(Date.now() + CacheTTL.MEDIUM * 1000).toISOString();
        logger.info(`Using cached aggregated metrics data for key: ${cacheKey}`);
      } catch (cacheError) {
        logger.warn('Cache operation failed, fetching fresh data:', cacheError);
      }
    }

    // Fetch from ML API if not cached
    if (!aggregatedData) {
      aggregatedData = await fetchAggregatedMetrics(requestData, integration);
    }

    // Calculate overall summary
    const overallSummary = calculateOverallSummary(aggregatedData);

    const response: AggregatedMetricsResponse = {
      types: requestData.types,
      period: requestData.period!,
      aggregate: requestData.aggregate!,
      metrics: aggregatedData,
      overall_summary: overallSummary,
      cache_info: {
        cached,
        cache_key: cacheKey,
        expires_at: cacheExpiry
      },
      last_updated: new Date().toISOString()
    };

    return NextResponse.json(response);

  } catch (error) {
    logger.error('ML Aggregated Metrics GET Error:', error);

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

/**
 * Determine if this is a real-time request
 */
function isRealTimeRequest(request: AggregatedMetricsRequest): boolean {
  if (request.date_to) {
    const dateTo = new Date(request.date_to);
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return dateTo > oneDayAgo;
  }
  return request.period === '1d' || request.period === '7d';
}

/**
 * Fetch aggregated metrics from multiple ML API endpoints
 */
async function fetchAggregatedMetrics(request: AggregatedMetricsRequest, integration: MLIntegration): Promise<Record<string, any>> {
  const results: Record<string, any> = {};

  // Fetch each metric type concurrently
  const promises = request.types.map(async (type) => {
    try {
      const metricsRequest = {
        type: type as any,
        period: request.period,
        aggregate: request.aggregate,
        date_from: request.date_from,
        date_to: request.date_to,
        item_ids: request.item_ids,
        user_id: request.user_id
      };

      const data = await fetchMetricsFromML(metricsRequest, integration);

      // Calculate summary for this metric
      const summary = calculateMetricsSummary(data);

      results[type] = {
        data,
        summary,
        api_url: data.api_url || ''
      };
    } catch (error) {
      logger.warn(`Failed to fetch ${type} metrics:`, error);
      results[type] = {
        data: null,
        summary: {
          total: 0,
          average: 0,
          trend: 'stable' as const,
          trend_percentage: 0
        },
        api_url: '',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  });

  await Promise.all(promises);
  return results;
}

/**
 * Fetch metrics from ML API (simplified version for aggregation)
 */
async function fetchMetricsFromML(request: any, integration: MLIntegration): Promise<any> {
  const { type, period, date_from, date_to, item_ids, user_id } = request;
  const mlUserId = user_id || integration.ml_user_id;

  let apiUrl = '';
  const baseUrl = 'https://api.mercadolibre.com';

  // Parse period
  const periodMatch = period?.match(/^(\d+)([dwMy])$/);
  const last = periodMatch ? parseInt(periodMatch[1]) : 30;
  const unit = periodMatch ? periodMatch[2].replace('d', 'day').replace('w', 'week').replace('M', 'month').replace('y', 'year') : 'day';

  switch (type) {
    case 'visits':
      if (item_ids && item_ids.length > 0) {
        const idsParam = item_ids.join(',');
        apiUrl = `${baseUrl}/items/visits?ids=${idsParam}`;
        if (date_from) apiUrl += `&date_from=${encodeURIComponent(date_from)}`;
        if (date_to) apiUrl += `&date_to=${encodeURIComponent(date_to)}`;
      } else {
        apiUrl = `${baseUrl}/users/${mlUserId}/items_visits`;
        if (date_from) apiUrl += `?date_from=${encodeURIComponent(date_from)}`;
        if (date_to) apiUrl += `${date_from ? '&' : '?'}date_to=${encodeURIComponent(date_to)}`;
      }
      break;

    case 'visits_time_window':
      if (item_ids && item_ids.length > 0) {
        const idsParam = item_ids.join(',');
        apiUrl = `${baseUrl}/items/visits/time_window?ids=${idsParam}&last=${last}&unit=${unit}`;
      } else {
        apiUrl = `${baseUrl}/users/${mlUserId}/items_visits/time_window?last=${last}&unit=${unit}`;
      }
      break;

    case 'questions':
      apiUrl = `${baseUrl}/users/${mlUserId}/contacts/questions`;
      if (date_from) apiUrl += `?date_from=${encodeURIComponent(date_from)}`;
      if (date_to) apiUrl += `${date_from ? '&' : '?'}date_to=${encodeURIComponent(date_to)}`;
      break;

    case 'questions_time_window':
      apiUrl = `${baseUrl}/users/${mlUserId}/contacts/questions/time_window?last=${last}&unit=${unit}`;
      break;

    case 'phone_views':
      apiUrl = `${baseUrl}/users/${mlUserId}/contacts/phone_views`;
      if (date_from) apiUrl += `?date_from=${encodeURIComponent(date_from)}`;
      if (date_to) apiUrl += `${date_from ? '&' : '?'}date_to=${encodeURIComponent(date_to)}`;
      break;

    case 'phone_views_time_window':
      if (item_ids && item_ids.length > 0) {
        const idsParam = item_ids.join(',');
        apiUrl = `${baseUrl}/items/contacts/phone_views/time_window?ids=${idsParam}&last=${last}&unit=${unit}`;
      } else {
        apiUrl = `${baseUrl}/users/${mlUserId}/contacts/phone_views/time_window?last=${last}&unit=${unit}`;
      }
      break;

    default:
      throw new Error(`Unsupported metric type: ${type}`);
  }

  const response = await fetch(apiUrl, {
    headers: {
      'Authorization': `Bearer ${integration.access_token}`,
      'Accept': 'application/json'
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`ML API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return {
    ...data,
    api_url: apiUrl
  };
}

/**
 * Calculate metrics summary (simplified version)
 */
function calculateMetricsSummary(data: any): { total: number; average: number; trend: 'up' | 'down' | 'stable'; trend_percentage: number } {
  let total = 0;
  let average = 0;
  let trend: 'up' | 'down' | 'stable' = 'stable';
  let trendPercentage = 0;

  try {
    if (data && typeof data === 'object') {
      const values: number[] = [];

      if (Array.isArray(data)) {
        data.forEach((item: any) => {
          if (typeof item === 'object') {
            Object.values(item).forEach((val: any) => {
              if (typeof val === 'number') {
                values.push(val);
                total += val;
              }
            });
          } else if (typeof item === 'number') {
            values.push(item);
            total += item;
          }
        });
      } else if (data.total_visits !== undefined) {
        total = data.total_visits;
        values.push(total);
      } else if (data.total !== undefined) {
        total = data.total;
        values.push(total);
      }

      if (values.length > 0) {
        average = total / values.length;

        const midPoint = Math.floor(values.length / 2);
        const firstHalf = values.slice(0, midPoint);
        const secondHalf = values.slice(midPoint);

        if (firstHalf.length > 0 && secondHalf.length > 0) {
          const firstHalfAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
          const secondHalfAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;

          if (secondHalfAvg > firstHalfAvg * 1.05) {
            trend = 'up';
            trendPercentage = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;
          } else if (secondHalfAvg < firstHalfAvg * 0.95) {
            trend = 'down';
            trendPercentage = ((firstHalfAvg - secondHalfAvg) / firstHalfAvg) * 100;
          }
        }
      }
    }
  } catch (error) {
    logger.warn('Error calculating metrics summary:', error);
  }

  return {
    total: Math.round(total * 100) / 100,
    average: Math.round(average * 100) / 100,
    trend,
    trend_percentage: Math.round(trendPercentage * 100) / 100
  };
}

/**
 * Calculate overall summary across all metrics
 */
function calculateOverallSummary(metrics: Record<string, any>): AggregatedMetricsResponse['overall_summary'] {
  const types = Object.keys(metrics);
  let successfulRequests = 0;
  let failedRequests = 0;
  const trends: ('up' | 'down' | 'stable')[] = [];

  types.forEach(type => {
    const metric = metrics[type];
    if (metric.error) {
      failedRequests++;
    } else {
      successfulRequests++;
      trends.push(metric.summary.trend);
    }
  });

  // Calculate average trend
  let averageTrend: 'up' | 'down' | 'stable' = 'stable';
  if (trends.length > 0) {
    const upCount = trends.filter(t => t === 'up').length;
    const downCount = trends.filter(t => t === 'down').length;

    if (upCount > downCount) {
      averageTrend = 'up';
    } else if (downCount > upCount) {
      averageTrend = 'down';
    }
  }

  return {
    total_metrics: types.length,
    successful_requests: successfulRequests,
    failed_requests: failedRequests,
    average_trend: averageTrend
  };
}