/**
 * ML Metrics API - Optimized
 *
 * Provides comprehensive metrics with intelligent caching and aggregation
 * Supports visits, questions, phone views with time-based analysis
 *
 * Endpoint: GET /api/ml/metrics?type=visits&period=30d&aggregate=daily
 * ML APIs: Users visits, Items visits, Contacts questions, Phone views
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, createClient } from '@/utils/supabase/server';
import { MLTokenManager } from '@/utils/mercadolivre/token-manager';
import { getCached, buildCacheKey, CachePrefix, CacheTTL } from '@/utils/redis';
import { logger } from '@/utils/logger';

const tokenManager = new MLTokenManager();

interface MetricsRequest {
  type: 'visits' | 'visits_time_window' | 'questions' | 'questions_time_window' | 'phone_views' | 'phone_views_time_window';
  period?: string; // '7d', '30d', '90d', etc.
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

interface MetricsDataPoint {
  date?: string;
  visits?: number;
  questions?: number;
  phone_views?: number;
  [key: string]: string | number | undefined;
}

interface MetricsData {
  results?: MetricsDataPoint[];
  total_visits?: number;
  total?: number;
  api_url?: string;
  [key: string]: MetricsDataPoint[] | number | string | undefined;
}

interface MetricsResponse {
  type: string;
  period: string;
  aggregate: string;
  data: MetricsData;
  summary: {
    total: number;
    average: number;
    trend: 'up' | 'down' | 'stable';
    trend_percentage: number;
  };
  cache_info: {
    cached: boolean;
    cache_key: string;
    expires_at?: string;
  };
  api_url: string;
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
    const metricsRequest: MetricsRequest = {
      type: (searchParams.get('type') || 'visits') as MetricsRequest['type'],
      period: searchParams.get('period') || '30d',
      aggregate: (searchParams.get('aggregate') || 'daily') as MetricsRequest['aggregate'],
      date_from: searchParams.get('date_from') || undefined,
      date_to: searchParams.get('date_to') || undefined,
      item_ids: searchParams.get('item_ids')?.split(','),
      user_id: searchParams.get('user_id') || undefined
    };

    // Validate metric type
    const validTypes = ['visits', 'visits_time_window', 'questions', 'questions_time_window', 'phone_views', 'phone_views_time_window'];
    if (!validTypes.includes(metricsRequest.type)) {
      return NextResponse.json(
        {
          error: 'Invalid metric type',
          valid_types: validTypes
        },
        { status: 400 }
      );
    }

    logger.info(`Fetching metrics: ${metricsRequest.type} for period: ${metricsRequest.period}`);

    // Check cache first (except for real-time requests)
    const cacheKey = buildCacheKey(
      CachePrefix.ML_USER,
      `${tenantId}_${metricsRequest.type}_${metricsRequest.period}_${metricsRequest.aggregate}`
    );

    let cached = false;
    let cacheExpiry: string | undefined;

    // Use cache for non-real-time requests (older than 1 day)
    const shouldUseCache = !isRealTimeRequest(metricsRequest);
    let metricsData: MetricsData | null = null;

    if (shouldUseCache) {
      try {
        metricsData = await getCached(
          cacheKey,
          async () => fetchMetricsFromML(metricsRequest, integration),
          { ttl: CacheTTL.MEDIUM, context: { tenantId, type: metricsRequest.type } }
        );
        cached = true;
        cacheExpiry = new Date(Date.now() + CacheTTL.MEDIUM * 1000).toISOString();
        logger.info(`Using cached metrics data for key: ${cacheKey}`);
      } catch (cacheError) {
        logger.warn('Cache operation failed, fetching fresh data:', cacheError);
        // Fall back to fresh data
      }
    }

    // Fetch from ML API if not cached
    if (!metricsData) {
      metricsData = await fetchMetricsFromML(metricsRequest, integration);
    }

    // Process and aggregate data
    const processedData = processMetricsData(metricsData, metricsRequest);
    const summary = calculateMetricsSummary(processedData);

    const response: MetricsResponse = {
      type: metricsRequest.type,
      period: metricsRequest.period!,
      aggregate: metricsRequest.aggregate!,
      data: processedData,
      summary,
      cache_info: {
        cached,
        cache_key: cacheKey,
        expires_at: cacheExpiry
      },
      api_url: metricsData.api_url || '',
      last_updated: new Date().toISOString()
    };

    return NextResponse.json(response);

  } catch (error) {
    logger.error('ML Metrics GET Error:', error);

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
 * Determine if this is a real-time request that shouldn't use cache
 */
function isRealTimeRequest(request: MetricsRequest): boolean {
  // Real-time if requesting data from the last 24 hours
  if (request.date_to) {
    const dateTo = new Date(request.date_to);
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return dateTo > oneDayAgo;
  }

  // Real-time if period is very short (1d or 7d)
  return request.period === '1d' || request.period === '7d';
}

/**
 * Fetch metrics from ML API based on type
 */
async function fetchMetricsFromML(request: MetricsRequest, integration: MLIntegration): Promise<MetricsData> {
  const { type, period, date_from, date_to, item_ids, user_id } = request;
  const mlUserId = user_id || integration.ml_user_id;

  let apiUrl = '';
  const baseUrl = 'https://api.mercadolibre.com';

  // Parse period (e.g., '30d' -> last: 30, unit: day)
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

  // Fetch from ML API
  const response = await fetch(apiUrl, {
    headers: {
      'Authorization': `Bearer ${integration.access_token}`,
      'Accept': 'application/json'
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    logger.error(`ML Metrics API error: ${response.status} - ${errorText}`);
    throw new Error(`ML API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();

  return {
    ...data,
    api_url: apiUrl
  };
}

/**
 * Process and aggregate metrics data
 */
function processMetricsData(data: MetricsData, request: MetricsRequest): MetricsData {
  const { aggregate } = request;

  // If no aggregation needed, return as-is
  if (!aggregate || aggregate === 'daily') {
    return data;
  }

  // Implement aggregation logic based on type
  if (data && typeof data === 'object') {
    // For time window data, aggregate by week/month
    if (aggregate === 'weekly' && data.results) {
      return {
        ...data,
        results: aggregateTimeSeries(data.results, 'weekly')
      };
    } else if (aggregate === 'monthly' && data.results) {
      return {
        ...data,
        results: aggregateTimeSeries(data.results, 'monthly')
      };
    }
  }

  return data;
}

/**
 * Aggregate time series data
 */
function aggregateTimeSeries(data: MetricsDataPoint[], period: 'weekly' | 'monthly'): MetricsDataPoint[] {
  if (!Array.isArray(data)) return data;

  const aggregated: { [key: string]: MetricsDataPoint[] } = {};

  data.forEach(item => {
    if (item.date) {
      const date = new Date(item.date);
      let key: string;

      if (period === 'weekly') {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay()); // Start of week
        key = weekStart.toISOString().split('T')[0];
      } else { // monthly
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }

      if (!aggregated[key]) {
        aggregated[key] = [];
      }
      aggregated[key].push(item);
    }
  });

  // Calculate averages for each period
  return Object.entries(aggregated).map(([periodKey, items]) => {
    const totals = items.reduce((acc: Record<string, number>, item: MetricsDataPoint) => {
      Object.keys(item).forEach(key => {
        if (typeof item[key] === 'number') {
          acc[key] = (acc[key] || 0) + item[key];
        }
      });
      return acc;
    }, {} as Record<string, number>);

    const averages: Record<string, number> = {};
    Object.keys(totals).forEach(key => {
      averages[key] = Math.round((totals[key] / items.length) * 100) / 100;
    });

    return {
      date: periodKey,
      ...averages,
      sample_size: items.length
    };
  });
}

/**
 * Calculate metrics summary with trend analysis
 */
function calculateMetricsSummary(data: MetricsData): MetricsResponse['summary'] {
  let total = 0;
  let average = 0;
  let trend: 'up' | 'down' | 'stable' = 'stable';
  let trendPercentage = 0;

  try {
    if (data && typeof data === 'object') {
      // Extract numeric values
      const values: number[] = [];

      if (Array.isArray(data)) {
        // Time series data
        data.forEach((item: MetricsDataPoint) => {
          if (typeof item === 'object') {
            Object.values(item).forEach(val => {
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
        // Visits summary
        total = data.total_visits;
        values.push(total);
      } else if (data.total !== undefined) {
        // Questions/Phone views summary
        total = data.total;
        values.push(total);
      }

      if (values.length > 0) {
        average = total / values.length;

        // Calculate trend (compare first half vs second half)
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