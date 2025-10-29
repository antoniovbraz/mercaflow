/**
 * ML Price Suggestions API
 *
 * Provides price suggestions and competitor analysis for ML items
 * Based on Mercado Livre's official Price Suggestions API
 *
 * Endpoint: GET /api/ml/price-suggestions/[itemId]
 * ML API: GET /suggestions/items/{item_id}/details
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, createClient } from '@/utils/supabase/server';
import { getMLIntegrationService } from '@/utils/mercadolivre/services';
import { logger } from '@/utils/logger';

const integrationService = getMLIntegrationService();

interface PriceSuggestionResponse {
  item_id: string;
  status: 'with_benchmark_highest' | 'with_benchmark_high' | 'no_benchmark_ok' | 'no_benchmark_lowest';
  current_price: {
    amount: number;
    currency_id: string;
  };
  suggested_price: {
    amount: number;
    currency_id: string;
  };
  lowest_price: {
    amount: number;
    currency_id: string;
  };
  costs: {
    selling_fees: number;
    shipping_fees: number;
  };
  percent_difference: number;
  metadata: {
    graph: Array<{
      price: { amount: number; currency_id: string };
      info: {
        title: string;
        sold_quantity: number;
        item_id: string;
      };
    }>;
    compared_values: number;
  };
  last_updated: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
): Promise<NextResponse> {
  try {
    const { itemId } = await params;

    if (!itemId) {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 }
      );
    }

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
        logger.warn('Failed to resolve active integration for tenant', {
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

    // Verify the item belongs to this user
    const { data: itemCheck } = await supabase
      .from('ml_products')
      .select('id')
      .eq('integration_id', integration.id)
      .eq('ml_item_id', itemId)
      .single();

    if (!itemCheck) {
      return NextResponse.json(
        { error: 'Item not found or access denied' },
        { status: 404 }
      );
    }

    // Call ML Price Suggestions API
    const mlApiUrl = `https://api.mercadolibre.com/suggestions/items/${itemId}/details`;

    logger.info(`Fetching price suggestions for item: ${itemId}`);

    const response = await fetch(mlApiUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error(`ML Price Suggestions API error: ${response.status} - ${errorText}`);

      // Handle specific ML API errors
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Price suggestions not available for this item' },
          { status: 404 }
        );
      }

      if (response.status === 429) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again later.' },
          { status: 429 }
        );
      }

      return NextResponse.json(
        { error: 'Failed to fetch price suggestions from ML API' },
        { status: response.status }
      );
    }

    const suggestionsData: PriceSuggestionResponse = await response.json();

    // Store suggestions in database for historical tracking
    try {
      await supabase
        .from('ml_price_suggestions')
        .insert({
          integration_id: integration.id,
          item_id: itemId,
          suggestions_data: suggestionsData,
          created_at: new Date().toISOString()
        });
    } catch (dbError) {
      logger.warn('Failed to store price suggestions in database:', dbError);
      // Don't fail the request if DB storage fails
    }

    // Enhance response with additional insights
    const enhancedResponse = {
      ...suggestionsData,
      insights: {
        competitiveness_status: getCompetitivenessStatus(suggestionsData.status),
        price_gap_analysis: calculatePriceGap(suggestionsData),
        competitor_summary: summarizeCompetitors(suggestionsData.metadata.graph),
        recommendation: generateRecommendation(suggestionsData)
      }
    };

    logger.info(`Price suggestions fetched successfully for item: ${itemId}`);

    return NextResponse.json(enhancedResponse);

  } catch (error) {
    logger.error('ML Price Suggestions GET Error:', error);

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
 * Helper functions for insights
 */

function getCompetitivenessStatus(status: string): {
  level: 'excellent' | 'good' | 'warning' | 'critical';
  message: string;
  color: string;
} {
  switch (status) {
    case 'no_benchmark_lowest':
      return {
        level: 'excellent',
        message: 'Preço muito competitivo - você está entre os mais baratos!',
        color: 'green'
      };
    case 'no_benchmark_ok':
      return {
        level: 'good',
        message: 'Preço competitivo no mercado',
        color: 'blue'
      };
    case 'with_benchmark_high':
      return {
        level: 'warning',
        message: 'Preço um pouco acima do mercado',
        color: 'yellow'
      };
    case 'with_benchmark_highest':
      return {
        level: 'critical',
        message: 'Preço muito acima do mercado - risco de perder vendas!',
        color: 'red'
      };
    default:
      return {
        level: 'good',
        message: 'Status não identificado',
        color: 'gray'
      };
  }
}

function calculatePriceGap(data: PriceSuggestionResponse): {
  gap_amount: number;
  gap_percentage: number;
  position: 'above' | 'below' | 'at_market';
} {
  const current = data.current_price.amount;
  const suggested = data.suggested_price.amount;
  const gap = current - suggested;
  const percentage = suggested > 0 ? (gap / suggested) * 100 : 0;

  return {
    gap_amount: gap,
    gap_percentage: Math.round(percentage * 100) / 100,
    position: gap > 5 ? 'above' : gap < -5 ? 'below' : 'at_market'
  };
}

function summarizeCompetitors(competitors: PriceSuggestionResponse['metadata']['graph']): {
  total_competitors: number;
  avg_price: number;
  price_range: { min: number; max: number };
  top_performers: Array<{ item_id: string; price: number; sales: number }>;
} {
  if (!competitors || competitors.length === 0) {
    return {
      total_competitors: 0,
      avg_price: 0,
      price_range: { min: 0, max: 0 },
      top_performers: []
    };
  }

  const prices = competitors.map(c => c.price.amount);
  const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;

  const topPerformers = competitors
    .filter(c => c.info.sold_quantity > 0)
    .sort((a, b) => b.info.sold_quantity - a.info.sold_quantity)
    .slice(0, 3)
    .map(c => ({
      item_id: c.info.item_id,
      price: c.price.amount,
      sales: c.info.sold_quantity
    }));

  return {
    total_competitors: competitors.length,
    avg_price: Math.round(avgPrice * 100) / 100,
    price_range: {
      min: Math.min(...prices),
      max: Math.max(...prices)
    },
    top_performers: topPerformers
  };
}

function generateRecommendation(data: PriceSuggestionResponse): {
  action: 'maintain' | 'increase' | 'decrease' | 'monitor';
  suggested_price: number;
  reasoning: string;
  urgency: 'low' | 'medium' | 'high';
} {
  const gap = calculatePriceGap(data);
  const status = getCompetitivenessStatus(data.status);

  if (status.level === 'critical') {
    return {
      action: 'decrease',
      suggested_price: data.suggested_price.amount,
      reasoning: `Preço ${gap.gap_percentage}% acima do mercado sugerido. Reduza para aumentar vendas.`,
      urgency: 'high'
    };
  }

  if (status.level === 'warning') {
    return {
      action: 'decrease',
      suggested_price: data.suggested_price.amount,
      reasoning: `Preço um pouco acima do mercado. Considere ajustar para manter competitividade.`,
      urgency: 'medium'
    };
  }

  if (status.level === 'excellent') {
    return {
      action: 'monitor',
      suggested_price: data.current_price.amount,
      reasoning: 'Preço muito competitivo. Monitore performance e margem de lucro.',
      urgency: 'low'
    };
  }

  return {
    action: 'maintain',
    suggested_price: data.current_price.amount,
    reasoning: 'Preço está alinhado com o mercado. Mantenha e monitore vendas.',
    urgency: 'low'
  };
}
