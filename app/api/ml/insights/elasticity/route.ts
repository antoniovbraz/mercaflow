/**
 * ML Elasticity Insights API
 *
 * Provides price elasticity analysis using sales and visit data
 * Calculates how sensitive sales are to price changes
 *
 * Endpoint: GET /api/ml/insights/elasticity?item_id=X&period_days=30
 * ML APIs: Items, Metrics (visits), Orders
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, createClient } from '@/utils/supabase/server';
import { getMLIntegrationService } from '@/utils/mercadolivre/services';
import { logger } from '@/utils/logger';
import { SupabaseClient } from '@supabase/supabase-js';

const integrationService = getMLIntegrationService();

interface ElasticityCalculation {
  elasticity_coefficient: number; // Price elasticity of demand
  interpretation: 'highly_elastic' | 'elastic' | 'unit_elastic' | 'inelastic' | 'highly_inelastic';
  confidence_level: 'high' | 'medium' | 'low';
  data_points: number;
  period_days: number;
  price_range: {
    min: number;
    max: number;
    avg: number;
  };
  sales_range: {
    min: number;
    max: number;
    avg: number;
  };
  visits_range?: {
    min: number;
    max: number;
    avg: number;
  };
}

interface ElasticityInsights {
  item_id: string;
  current_price: number;
  elasticity: ElasticityCalculation;
  recommendations: {
    optimal_price_range: {
      min: number;
      max: number;
      reasoning: string;
    };
    price_sensitivity: 'high' | 'medium' | 'low';
    strategy_suggestion: string;
    expected_impact: {
      price_change_10pct: {
        sales_change_pct: number;
        revenue_change_pct: number;
      };
    };
  };
  historical_data: {
    price_changes: Array<{
      date: string;
      old_price: number;
      new_price: number;
      sales_before: number;
      sales_after: number;
      visits_before?: number;
      visits_after?: number;
      elasticity_point: number;
    }>;
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
    const integrationResult = await integrationService
      .getIntegrationWithToken(tenantId)
      .catch(error => {
        logger.warn('Failed to load ML integration for elasticity insights', {
          tenantId,
          error,
        });
        return null;
      });

    if (!integrationResult) {
      return NextResponse.json(
        { error: 'No active ML integration found' },
        { status: 404 }
      );
    }

    const { integration, accessToken } = integrationResult;

    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('item_id');
    const periodDays = parseInt(searchParams.get('period_days') || '90');
    const includeVisits = searchParams.get('include_visits') === 'true';

    if (!itemId) {
      return NextResponse.json(
        { error: 'item_id parameter is required' },
        { status: 400 }
      );
    }

    // Verify the item belongs to this user
    const { data: itemData } = await supabase
      .from('ml_products')
      .select('*')
      .eq('integration_id', integration.id)
      .eq('ml_item_id', itemId)
      .single();

    if (!itemData) {
      return NextResponse.json(
        { error: 'Item not found or access denied' },
        { status: 404 }
      );
    }

    logger.info(`Calculating elasticity insights for item: ${itemId}, period: ${periodDays} days`);

    // Gather historical data
    const historicalData = await gatherHistoricalData(
      itemId,
      integration.id,
      periodDays,
      supabase
    );

    // Calculate elasticity
    const elasticity = calculatePriceElasticity(historicalData);

    // Get visit data if requested
    if (includeVisits) {
  await getVisitData(itemId, accessToken, periodDays);
    }

    // Generate insights and recommendations
    const insights: ElasticityInsights = {
      item_id: itemId,
      current_price: itemData.price,
      elasticity,
      recommendations: generateRecommendations(elasticity, itemData.price),
      historical_data: {
        price_changes: historicalData
      },
      last_updated: new Date().toISOString()
    };

    logger.info(`Elasticity insights calculated: ${elasticity.elasticity_coefficient} (${elasticity.interpretation})`);

    return NextResponse.json(insights);

  } catch (error) {
    logger.error('ML Elasticity Insights GET Error:', error);

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
 * Gather historical price and sales data
 */
async function gatherHistoricalData(
  itemId: string,
  integrationId: string,
  periodDays: number,
  supabase: SupabaseClient
): Promise<Array<{
  date: string;
  old_price: number;
  new_price: number;
  sales_before: number;
  sales_after: number;
  visits_before?: number;
  visits_after?: number;
  elasticity_point: number;
}>> {
  // Get price history
  const { data: priceHistory } = await supabase
    .from('ml_price_history')
    .select('*')
    .eq('item_id', itemId)
    .gte('created_at', new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000).toISOString())
    .order('created_at', { ascending: true });

  // Get sales data
  const { data: salesData } = await supabase
    .from('ml_orders')
    .select('total_amount, created_at, order_items')
    .eq('integration_id', integrationId)
    .gte('created_at', new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000).toISOString())
    .order('created_at', { ascending: true });

  if (!priceHistory || priceHistory.length < 2) {
    return [];
  }

  const historicalData = [];

  // Analyze each price change
  for (let i = 1; i < priceHistory.length; i++) {
    const currentPrice = priceHistory[i];
    const previousPrice = priceHistory[i - 1];

    const priceChange = (currentPrice.price - previousPrice.price) / previousPrice.price;

    if (Math.abs(priceChange) > 0.01) { // Only significant changes (>1%)
      const changeDate = new Date(currentPrice.created_at);
      const beforeDate = new Date(previousPrice.created_at);

      // Count sales before and after price change
      const salesBefore = salesData?.filter((s: {
        created_at: string;
        order_items: Array<{ item?: { id: string } }>;
      }) =>
        new Date(s.created_at) >= beforeDate &&
        new Date(s.created_at) < changeDate &&
        s.order_items?.some((item: { item?: { id: string } }) =>
          item.item?.id === itemId
        )
      ).length || 0;

      const salesAfter = salesData?.filter((s: {
        created_at: string;
        order_items: Array<{ item?: { id: string } }>;
      }) =>
        new Date(s.created_at) >= changeDate &&
        s.order_items?.some((item: { item?: { id: string } }) =>
          item.item?.id === itemId
        )
      ).length || 0;

      if (salesBefore > 0 || salesAfter > 0) {
        const salesChange = salesAfter > 0 && salesBefore > 0 ?
          (salesAfter - salesBefore) / salesBefore : 0;

        const elasticityPoint = salesChange / priceChange;

        historicalData.push({
          date: currentPrice.created_at,
          old_price: previousPrice.price,
          new_price: currentPrice.price,
          sales_before: salesBefore,
          sales_after: salesAfter,
          elasticity_point: isFinite(elasticityPoint) ? elasticityPoint : 0
        });
      }
    }
  }

  return historicalData;
}

/**
 * Calculate price elasticity of demand
 */
function calculatePriceElasticity(historicalData: Array<{
  date: string;
  old_price: number;
  new_price: number;
  sales_before: number;
  sales_after: number;
  elasticity_point: number;
}>): ElasticityCalculation {
  if (historicalData.length === 0) {
    return {
      elasticity_coefficient: 0,
      interpretation: 'unit_elastic',
      confidence_level: 'low',
      data_points: 0,
      period_days: 0,
      price_range: { min: 0, max: 0, avg: 0 },
      sales_range: { min: 0, max: 0, avg: 0 }
    };
  }

  // Calculate average elasticity
  const validPoints = historicalData.filter(d => isFinite(d.elasticity_point) && d.elasticity_point !== 0);
  const avgElasticity = validPoints.length > 0 ?
    validPoints.reduce((sum, d) => sum + d.elasticity_point, 0) / validPoints.length : 0;

  // Determine interpretation
  let interpretation: ElasticityCalculation['interpretation'];
  if (Math.abs(avgElasticity) > 2) {
    interpretation = 'highly_elastic';
  } else if (Math.abs(avgElasticity) > 1) {
    interpretation = 'elastic';
  } else if (Math.abs(avgElasticity) === 1) {
    interpretation = 'unit_elastic';
  } else if (Math.abs(avgElasticity) > 0.5) {
    interpretation = 'inelastic';
  } else {
    interpretation = 'highly_inelastic';
  }

  // Calculate ranges
  const prices = historicalData.flatMap(d => [d.old_price, d.new_price]);
  const sales = historicalData.flatMap(d => [d.sales_before, d.sales_after]);

  const priceRange = {
    min: Math.min(...prices),
    max: Math.max(...prices),
    avg: prices.reduce((sum, p) => sum + p, 0) / prices.length
  };

  const salesRange = {
    min: Math.min(...sales),
    max: Math.max(...sales),
    avg: sales.reduce((sum, s) => sum + s, 0) / sales.length
  };

  // Determine confidence level
  let confidence: 'high' | 'medium' | 'low';
  if (validPoints.length >= 5) {
    confidence = 'high';
  } else if (validPoints.length >= 3) {
    confidence = 'medium';
  } else {
    confidence = 'low';
  }

  return {
    elasticity_coefficient: Math.round(avgElasticity * 100) / 100,
    interpretation,
    confidence_level: confidence,
    data_points: validPoints.length,
    period_days: historicalData.length > 0 ?
      Math.max(...historicalData.map(d =>
        Math.ceil((new Date(d.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      )) : 0,
    price_range: priceRange,
    sales_range: salesRange
  };
}

/**
 * Get visit data from ML Metrics API
 */
async function getVisitData(itemId: string, accessToken: string, periodDays: number): Promise<{
  min: number;
  max: number;
  avg: number;
} | null> {
  try {
    const endDate = new Date();

    const response = await fetch(
      `https://api.mercadolibre.com/items/visits/time_window?ids=${itemId}&last=${periodDays}&unit=day&ending=${endDate.toISOString().split('T')[0]}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        }
      }
    );

    if (!response.ok) {
      return null;
    }

    const visitData = await response.json();
    const visits = Object.values(visitData[itemId] || {}) as number[];

    if (visits.length === 0) return null;

    return {
      min: Math.min(...visits),
      max: Math.max(...visits),
      avg: visits.reduce((sum, v) => sum + v, 0) / visits.length
    };

  } catch (error) {
    logger.warn('Failed to fetch visit data:', error);
    return null;
  }
}

/**
 * Generate recommendations based on elasticity analysis
 */
function generateRecommendations(
  elasticity: ElasticityCalculation,
  currentPrice: number
): ElasticityInsights['recommendations'] {
  const { elasticity_coefficient, interpretation } = elasticity;

  // Calculate optimal price range based on elasticity
  let optimalMin = currentPrice;
  let optimalMax = currentPrice;
  let reasoning = '';

  switch (interpretation) {
    case 'highly_elastic':
      // Very sensitive to price changes - small adjustments
      optimalMin = currentPrice * 0.95;
      optimalMax = currentPrice * 1.05;
      reasoning = 'Produto muito sensível a mudanças de preço. Faça ajustes pequenos e monitore impacto.';
      break;

    case 'elastic':
      // Sensitive to price changes - can adjust more
      optimalMin = currentPrice * 0.90;
      optimalMax = currentPrice * 1.10;
      reasoning = 'Produto sensível a preço. Possível reduzir preço para aumentar vendas.';
      break;

    case 'unit_elastic':
      // Balanced - price changes have proportional sales impact
      optimalMin = currentPrice * 0.92;
      optimalMax = currentPrice * 1.08;
      reasoning = 'Elasticidade unitária. Mudanças de preço têm impacto proporcional nas vendas.';
      break;

    case 'inelastic':
      // Not very sensitive - can increase price
      optimalMin = currentPrice * 0.95;
      optimalMax = currentPrice * 1.15;
      reasoning = 'Produto inelástico. Possível aumentar preço sem grande perda de vendas.';
      break;

    case 'highly_inelastic':
      // Very insensitive - can significantly increase price
      optimalMin = currentPrice * 0.98;
      optimalMax = currentPrice * 1.25;
      reasoning = 'Produto pouco sensível a preço. Ótimo para aumentar margem de lucro.';
      break;
  }

  // Determine price sensitivity
  let priceSensitivity: 'high' | 'medium' | 'low';
  if (Math.abs(elasticity_coefficient) > 1.5) {
    priceSensitivity = 'high';
  } else if (Math.abs(elasticity_coefficient) > 0.8) {
    priceSensitivity = 'medium';
  } else {
    priceSensitivity = 'low';
  }

  // Strategy suggestion
  let strategySuggestion = '';
  if (elasticity_coefficient < -1) {
    strategySuggestion = 'Considere reduzir preço para aumentar volume de vendas e receita total.';
  } else if (elasticity_coefficient > -0.5) {
    strategySuggestion = 'Produto permite aumento de preço para melhorar margem de lucro.';
  } else {
    strategySuggestion = 'Mantenha preço atual e foque em outros fatores de venda.';
  }

  // Expected impact of 10% price change
  const expectedSalesChange = elasticity_coefficient * 0.1; // 10% price change
  const expectedRevenueChange = expectedSalesChange + 0.1; // Price effect + volume effect

  return {
    optimal_price_range: {
      min: Math.round(optimalMin * 100) / 100,
      max: Math.round(optimalMax * 100) / 100,
      reasoning
    },
    price_sensitivity: priceSensitivity,
    strategy_suggestion: strategySuggestion,
    expected_impact: {
      price_change_10pct: {
        sales_change_pct: Math.round(expectedSalesChange * 10000) / 100, // Convert to percentage
        revenue_change_pct: Math.round(expectedRevenueChange * 10000) / 100
      }
    }
  };
}