/**
 * ML Competitors Analysis API
 *
 * Provides comprehensive competitor analysis using ML data
 * Analyzes pricing, sales performance, and market positioning
 *
 * Endpoint: GET /api/ml/insights/competitors?item_id=X&include_market_data=true
 * ML APIs: Price Suggestions, Items, Metrics
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, createClient } from '@/utils/supabase/server';
import { MLTokenManager } from '@/utils/mercadolivre/token-manager';
import { logger } from '@/utils/logger';

const tokenManager = new MLTokenManager();

interface CompetitorData {
  item_id: string;
  title: string;
  price: number;
  sold_quantity: number;
  available_quantity: number;
  status: string;
  permalink: string;
  thumbnail: string;
  seller_info?: {
    seller_id: string;
    seller_reputation?: {
      level_id: string;
      power_seller_status?: string;
      transactions?: {
        total: number;
        completed: number;
      };
    };
  };
  performance_score: number; // Calculated score based on sales/price ratio
  price_position: 'below' | 'at' | 'above'; // Relative to our item
}

interface MarketAnalysis {
  total_competitors: number;
  price_distribution: {
    min: number;
    max: number;
    avg: number;
    median: number;
    percentiles: {
      p25: number;
      p75: number;
      p90: number;
    };
  };
  sales_distribution: {
    total_sales: number;
    avg_sales: number;
    top_performer_sales: number;
  };
  market_segments: {
    budget: CompetitorData[]; // Bottom 25% prices
    mainstream: CompetitorData[]; // Middle 50% prices
    premium: CompetitorData[]; // Top 25% prices
  };
}

interface CompetitorsAnalysis {
  item_id: string;
  your_position: {
    price: number;
    percentile: number; // 0-100, where you rank
    segment: 'budget' | 'mainstream' | 'premium';
    competitiveness_score: number; // 0-100
  };
  market_analysis: MarketAnalysis;
  top_competitors: CompetitorData[];
  recommendations: {
    pricing_strategy: string;
    suggested_price_range: {
      min: number;
      max: number;
      optimal: number;
    };
    competitive_advantages: string[];
    risks: string[];
    opportunities: string[];
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

    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('item_id');
    const includeMarketData = searchParams.get('include_market_data') === 'true';
    const maxCompetitors = parseInt(searchParams.get('max_competitors') || '20');

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

    logger.info(`Analyzing competitors for item: ${itemId}`);

    // Get competitor data from ML Price Suggestions API
    const competitorsData = await getCompetitorsFromPriceSuggestions(
      itemId,
      integration.access_token,
      maxCompetitors
    );

    if (!competitorsData || competitorsData.length === 0) {
      return NextResponse.json(
        { error: 'No competitor data available for this item' },
        { status: 404 }
      );
    }

    // Enrich competitor data with additional ML API calls if requested
    let enrichedCompetitors = competitorsData;
    if (includeMarketData) {
      enrichedCompetitors = await enrichCompetitorData(
        competitorsData,
        integration.access_token
      );
    }

    // Analyze market positioning
    const marketAnalysis = analyzeMarket(enrichedCompetitors);
    const yourPosition = calculateYourPosition(itemData.price, marketAnalysis);

    // Generate recommendations
    const recommendations = generateCompetitorRecommendations(
      itemData,
      yourPosition,
      marketAnalysis,
      enrichedCompetitors
    );

    const analysis: CompetitorsAnalysis = {
      item_id: itemId,
      your_position: yourPosition,
      market_analysis: marketAnalysis,
      top_competitors: enrichedCompetitors.slice(0, 10), // Top 10 competitors
      recommendations,
      last_updated: new Date().toISOString()
    };

    logger.info(`Competitor analysis completed for item: ${itemId}, found ${enrichedCompetitors.length} competitors`);

    return NextResponse.json(analysis);

  } catch (error) {
    logger.error('ML Competitors Analysis GET Error:', error);

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
 * Get competitor data from ML Price Suggestions API
 */
async function getCompetitorsFromPriceSuggestions(
  itemId: string,
  accessToken: string,
  maxCompetitors: number
): Promise<CompetitorData[]> {
  try {
    const response = await fetch(
      `https://api.mercadolibre.com/suggestions/items/${itemId}/details`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        }
      }
    );

    if (!response.ok) {
      logger.warn(`Price suggestions API failed: ${response.status}`);
      return [];
    }

    const suggestions = await response.json();

    if (!suggestions.metadata?.graph || !Array.isArray(suggestions.metadata.graph)) {
      return [];
    }

    // Convert ML competitor data to our format
    const competitors: CompetitorData[] = suggestions.metadata.graph
      .slice(0, maxCompetitors)
      .map((comp: {
        price?: { amount: number };
        info?: { item_id: string; title: string; sold_quantity: number };
      }) => ({
        item_id: comp.info?.item_id || '',
        title: comp.info?.title || 'Produto sem título',
        price: comp.price?.amount || 0,
        sold_quantity: comp.info?.sold_quantity || 0,
        available_quantity: 0, // Not available in suggestions API
        status: 'active', // Assume active
        permalink: '', // Not available
        thumbnail: '', // Not available
        performance_score: calculatePerformanceScore(comp.price?.amount || 0, comp.info?.sold_quantity || 0),
        price_position: 'at' as const // Will be calculated later
      }))
      .filter((comp: CompetitorData) => comp.item_id && comp.price > 0);

    return competitors;

  } catch (error) {
    logger.error('Failed to get competitors from price suggestions:', error);
    return [];
  }
}

/**
 * Enrich competitor data with additional ML API calls
 */
async function enrichCompetitorData(
  competitors: CompetitorData[],
  accessToken: string
): Promise<CompetitorData[]> {
  const enriched: CompetitorData[] = [];

  // Process in batches to avoid rate limits
  const batchSize = 5;
  for (let i = 0; i < competitors.length; i += batchSize) {
    const batch = competitors.slice(i, i + batchSize);

    const promises = batch.map(async (comp) => {
      try {
        // Get detailed item info
        const response = await fetch(
          `https://api.mercadolibre.com/items/${comp.item_id}`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Accept': 'application/json'
            }
          }
        );

        if (response.ok) {
          const itemDetails = await response.json();
          return {
            ...comp,
            available_quantity: itemDetails.available_quantity || 0,
            status: itemDetails.status || 'active',
            permalink: itemDetails.permalink || '',
            thumbnail: itemDetails.thumbnail || '',
            seller_info: {
              seller_id: itemDetails.seller_id?.toString() || ''
            }
          };
        }

        return comp; // Return original if API call fails

      } catch (error) {
        logger.warn(`Failed to enrich competitor ${comp.item_id}:`, error);
        return comp;
      }
    });

    const batchResults = await Promise.all(promises);
    enriched.push(...batchResults);

    // Small delay to respect rate limits
    if (i + batchSize < competitors.length) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }

  return enriched;
}

/**
 * Calculate performance score based on sales efficiency
 */
function calculatePerformanceScore(price: number, soldQuantity: number): number {
  if (price <= 0) return 0;

  // Simple score: sales per price unit (higher is better)
  // This gives an idea of how well the product sells relative to its price
  const efficiency = soldQuantity / price;

  // Normalize to 0-100 scale (arbitrary scaling)
  return Math.min(100, Math.max(0, efficiency * 1000));
}

/**
 * Analyze market data and create market analysis
 */
function analyzeMarket(competitors: CompetitorData[]): MarketAnalysis {
  if (competitors.length === 0) {
    return {
      total_competitors: 0,
      price_distribution: {
        min: 0, max: 0, avg: 0, median: 0,
        percentiles: { p25: 0, p75: 0, p90: 0 }
      },
      sales_distribution: {
        total_sales: 0, avg_sales: 0, top_performer_sales: 0
      },
      market_segments: {
        budget: [], mainstream: [], premium: []
      }
    };
  }

  const prices = competitors.map(c => c.price).sort((a, b) => a - b);
  const sales = competitors.map(c => c.sold_quantity);

  // Price distribution
  const avgPrice = prices.reduce((sum, p) => sum + p, 0) / prices.length;
  const medianPrice = prices[Math.floor(prices.length / 2)];

  // Percentiles
  const p25Index = Math.floor(prices.length * 0.25);
  const p75Index = Math.floor(prices.length * 0.75);
  const p90Index = Math.floor(prices.length * 0.90);

  // Sales distribution
  const totalSales = sales.reduce((sum, s) => sum + s, 0);
  const avgSales = totalSales / sales.length;
  const topPerformerSales = Math.max(...sales);

  // Market segments
  const p25Price = prices[p25Index];
  const p75Price = prices[p75Index];

  const marketSegments = {
    budget: competitors.filter(c => c.price <= p25Price),
    mainstream: competitors.filter(c => c.price > p25Price && c.price <= p75Price),
    premium: competitors.filter(c => c.price > p75Price)
  };

  return {
    total_competitors: competitors.length,
    price_distribution: {
      min: prices[0],
      max: prices[prices.length - 1],
      avg: Math.round(avgPrice * 100) / 100,
      median: Math.round(medianPrice * 100) / 100,
      percentiles: {
        p25: Math.round(prices[p25Index] * 100) / 100,
        p75: Math.round(prices[p75Index] * 100) / 100,
        p90: Math.round((prices[p90Index] || prices[prices.length - 1]) * 100) / 100
      }
    },
    sales_distribution: {
      total_sales: totalSales,
      avg_sales: Math.round(avgSales * 100) / 100,
      top_performer_sales: topPerformerSales
    },
    market_segments: marketSegments
  };
}

/**
 * Calculate your position in the market
 */
function calculateYourPosition(
  yourPrice: number,
  marketAnalysis: MarketAnalysis
): CompetitorsAnalysis['your_position'] {
  const { price_distribution } = marketAnalysis;

  // Calculate percentile (0-100)
  let percentile = 0;
  if (yourPrice <= price_distribution.min) {
    percentile = 0;
  } else if (yourPrice >= price_distribution.max) {
    percentile = 100;
  } else {
    // Linear interpolation
    const range = price_distribution.max - price_distribution.min;
    percentile = ((yourPrice - price_distribution.min) / range) * 100;
  }

  // Determine segment
  let segment: 'budget' | 'mainstream' | 'premium';
  if (percentile <= 25) {
    segment = 'budget';
  } else if (percentile <= 75) {
    segment = 'mainstream';
  } else {
    segment = 'premium';
  }

  // Calculate competitiveness score (0-100)
  // Higher percentile = more expensive = potentially less competitive
  // But being in premium segment can be good for margins
  let competitivenessScore = 100 - percentile; // Invert percentile

  // Adjust based on segment strategy
  if (segment === 'premium') {
    competitivenessScore += 20; // Premium positioning can be competitive
  } else if (segment === 'budget') {
    competitivenessScore -= 10; // Budget might indicate lower quality perception
  }

  competitivenessScore = Math.max(0, Math.min(100, competitivenessScore));

  return {
    price: yourPrice,
    percentile: Math.round(percentile),
    segment,
    competitiveness_score: Math.round(competitivenessScore)
  };
}

/**
 * Generate competitor-based recommendations
 */
function generateCompetitorRecommendations(
  yourItem: { price: number; sold_quantity: number },
  yourPosition: CompetitorsAnalysis['your_position'],
  marketAnalysis: MarketAnalysis,
  competitors: CompetitorData[]
): CompetitorsAnalysis['recommendations'] {
  const { segment, percentile, competitiveness_score } = yourPosition;
  const { price_distribution } = marketAnalysis;

  let pricingStrategy = '';
  let suggestedPriceRange = {
    min: yourItem.price,
    max: yourItem.price,
    optimal: yourItem.price
  };

  // Pricing strategy based on position
  if (segment === 'budget') {
    if (competitiveness_score > 70) {
      pricingStrategy = 'Você está bem posicionado no segmento budget. Considere manter preço ou aumentar ligeiramente para melhorar margem.';
      suggestedPriceRange = {
        min: price_distribution.min,
        max: price_distribution.percentiles.p25,
        optimal: price_distribution.percentiles.p25 * 0.95
      };
    } else {
      pricingStrategy = 'Seu preço está muito baixo. Considere aumentar para o meio do segmento budget.';
      suggestedPriceRange = {
        min: price_distribution.min * 1.1,
        max: price_distribution.percentiles.p25,
        optimal: (price_distribution.min + price_distribution.percentiles.p25) / 2
      };
    }
  } else if (segment === 'mainstream') {
    pricingStrategy = 'Você está no segmento mainstream. Posicionamento equilibrado entre preço e percepção de valor.';
    suggestedPriceRange = {
      min: price_distribution.percentiles.p25,
      max: price_distribution.percentiles.p75,
      optimal: price_distribution.avg
    };
  } else { // premium
    if (competitiveness_score > 60) {
      pricingStrategy = 'Você está no segmento premium com boa competitividade. Pode manter ou ajustar ligeiramente.';
      suggestedPriceRange = {
        min: price_distribution.percentiles.p75,
        max: price_distribution.max,
        optimal: price_distribution.percentiles.p90
      };
    } else {
      pricingStrategy = 'Seu preço premium pode estar muito alto. Considere reduzir para o topo do mainstream.';
      suggestedPriceRange = {
        min: price_distribution.percentiles.p75,
        max: price_distribution.max * 0.9,
        optimal: price_distribution.percentiles.p75 * 1.1
      };
    }
  }

  // Find competitive advantages
  const competitiveAdvantages = [];
  const topCompetitors = competitors
    .filter(c => c.sold_quantity > yourItem.sold_quantity)
    .sort((a, b) => b.sold_quantity - a.sold_quantity);

  if (topCompetitors.length === 0) {
    competitiveAdvantages.push('Você é um dos produtos mais vendidos no mercado');
  } else {
    competitiveAdvantages.push('Analise os top performers para identificar oportunidades de melhoria');
  }

  // Calculate risks and opportunities
  const risks = [];
  const opportunities = [];

  if (percentile > 80) {
    risks.push('Preço muito alto pode reduzir vendas');
    opportunities.push('Diferenciação premium pode aumentar margem');
  } else if (percentile < 20) {
    risks.push('Preço muito baixo pode indicar baixa qualidade percebida');
    opportunities.push('Aumentar preço pode melhorar percepção de valor');
  }

  if (competitiveness_score < 50) {
    risks.push('Baixa competitividade no mercado atual');
    opportunities.push('Reavaliar estratégia de preço e posicionamento');
  }

  return {
    pricing_strategy: pricingStrategy,
    suggested_price_range: {
      min: Math.round(suggestedPriceRange.min * 100) / 100,
      max: Math.round(suggestedPriceRange.max * 100) / 100,
      optimal: Math.round(suggestedPriceRange.optimal * 100) / 100
    },
    competitive_advantages: competitiveAdvantages,
    risks,
    opportunities
  };
}