/**
 * ML Pricing Automation API
 *
 * Automates price adjustments based on elasticity analysis
 * Uses historical sales data, visits, and ML suggestions
 *
 * Endpoint: POST /api/ml/pricing/automation
 * ML APIs: Items, Metrics, Price Suggestions
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, createClient } from '@/utils/supabase/server';
import { logger } from '@/utils/logger';
import { SupabaseClient } from '@supabase/supabase-js';
import { getMLIntegrationService, getMLTokenService } from '@/utils/mercadolivre/services';

const integrationService = getMLIntegrationService();
const tokenService = getMLTokenService();

interface AutomationRequest {
  item_id: string;
  strategy: 'elasticity_based' | 'competitor_matching' | 'margin_optimization';
  parameters?: {
    target_margin?: number; // Desired profit margin (0-1)
    max_price_change?: number; // Max % change allowed (e.g., 0.1 for 10%)
    min_sales_threshold?: number; // Min sales to consider reliable
    elasticity_period_days?: number; // Days to analyze for elasticity
  };
  dry_run?: boolean; // If true, only calculate, don't apply changes
}

interface ElasticityData {
  price_changes: Array<{
    old_price: number;
    new_price: number;
    sales_before: number;
    sales_after: number;
    period_days: number;
  }>;
  calculated_elasticity: number;
  confidence_level: 'high' | 'medium' | 'low';
}

interface ItemData {
  ml_item_id: string;
  price: number;
}

interface IntegrationData {
  id: string;
}

interface AutomationParameters {
  target_margin?: number;
  max_price_change?: number;
  min_sales_threshold?: number;
  elasticity_period_days?: number;
}

interface AutomationResult {
  item_id: string;
  current_price: number;
  suggested_price: number;
  price_change_percentage: number;
  reasoning: string;
  elasticity_data?: ElasticityData;
  competitor_data?: {
    item_id: string;
    status: string;
    suggested_price: { amount: number };
    metadata?: { compared_values: number };
  };
  applied: boolean;
  applied_at?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: AutomationRequest = await request.json();
    const { item_id, strategy, parameters = {}, dry_run = false } = body;

    if (!item_id) {
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
    const integration = await integrationService.getActiveTenantIntegration(tenantId);

    if (!integration) {
      return NextResponse.json(
        { error: 'No active ML integration found' },
        { status: 404 }
      );
    }

    // Verify the item belongs to this user
    const { data: itemData } = await supabase
      .from('ml_products')
      .select('*')
      .eq('integration_id', integration.id)
      .eq('ml_item_id', item_id)
      .single();

    if (!itemData) {
      return NextResponse.json(
        { error: 'Item not found or access denied' },
        { status: 404 }
      );
    }

    logger.info(`Running pricing automation for item: ${item_id}, strategy: ${strategy}`);

    let result: AutomationResult;

    switch (strategy) {
      case 'elasticity_based':
        result = await runElasticityBasedAutomation(itemData, integration, parameters, supabase);
        break;

      case 'competitor_matching':
        result = await runCompetitorMatchingAutomation(itemData, integration, parameters);
        break;

      case 'margin_optimization':
        result = await runMarginOptimizationAutomation(itemData, integration, parameters);
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid strategy. Supported: elasticity_based, competitor_matching, margin_optimization' },
          { status: 400 }
        );
    }

    // Apply price change if not dry run and change is significant
    if (!dry_run && Math.abs(result.price_change_percentage) > 0.01) { // >1% change
      try {
        const accessToken = await tokenService.getValidToken(integration.id);
        await applyPriceChange(item_id, result.suggested_price, accessToken);
        result.applied = true;
        result.applied_at = new Date().toISOString();

        // Log the automation action
        await supabase
          .from('ml_pricing_automation_log')
          .insert({
            integration_id: integration.id,
            item_id: item_id,
            strategy: strategy,
            old_price: result.current_price,
            new_price: result.suggested_price,
            reasoning: result.reasoning,
            applied_at: result.applied_at
          });

        logger.info(`Price automation applied: ${item_id} from ${result.current_price} to ${result.suggested_price}`);

      } catch (applyError) {
        logger.error('Failed to apply price change:', applyError);
        result.applied = false;
        result.reasoning += ' (Falha ao aplicar mudança)';
      }
    } else {
      result.applied = false;
    }

    return NextResponse.json(result);

  } catch (error) {
    logger.error('ML Pricing Automation POST Error:', error);

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
 * Estratégia baseada em elasticidade-preço
 */
async function runElasticityBasedAutomation(
  itemData: ItemData,
  integration: IntegrationData,
  parameters: AutomationParameters,
  supabase: SupabaseClient
): Promise<AutomationResult> {
  const periodDays = parameters.elasticity_period_days || 30;
  const maxChange = parameters.max_price_change || 0.1; // 10%

  // Buscar histórico de preços e vendas
  const { data: priceHistory } = await supabase
    .from('ml_price_history')
    .select('*')
    .eq('item_id', itemData.ml_item_id)
    .gte('created_at', new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000).toISOString())
    .order('created_at', { ascending: true });

  // Buscar vendas no período
  const { data: salesData } = await supabase
    .from('ml_orders')
    .select('total_amount, created_at, order_items')
    .eq('integration_id', integration.id)
    .gte('created_at', new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000).toISOString());

  // Calcular elasticidade
  const elasticityData = calculateElasticity(priceHistory || [], salesData || []);

  let suggestedPrice = itemData.price;
  let reasoning = '';

  if (elasticityData.confidence_level === 'high') {
    const elasticity = elasticityData.calculated_elasticity;

    if (elasticity < -1) {
      // Produto elástico - reduzir preço pode aumentar receita
      const priceReduction = Math.min(maxChange, 0.05); // Máximo 5%
      suggestedPrice = itemData.price * (1 - priceReduction);
      reasoning = `Produto elástico (elasticidade: ${elasticity.toFixed(2)}). Reduzindo preço em ${priceReduction * 100}% para aumentar vendas.`;
    } else if (elasticity > -0.5) {
      // Produto inelástico - pode aumentar preço
      const priceIncrease = Math.min(maxChange, 0.03); // Máximo 3%
      suggestedPrice = itemData.price * (1 + priceIncrease);
      reasoning = `Produto inelástico (elasticidade: ${elasticity.toFixed(2)}). Aumentando preço em ${priceIncrease * 100}% para melhorar margem.`;
    } else {
      reasoning = `Elasticidade neutra (${elasticity.toFixed(2)}). Mantendo preço atual.`;
    }
  } else {
    reasoning = `Dados insuficientes para calcular elasticidade (${elasticityData.confidence_level} confidence). Mantendo preço atual.`;
  }

  return {
    item_id: itemData.ml_item_id,
    current_price: itemData.price,
    suggested_price: Math.round(suggestedPrice * 100) / 100,
    price_change_percentage: ((suggestedPrice - itemData.price) / itemData.price) * 100,
    reasoning,
    elasticity_data: elasticityData,
    applied: false
  };
}

/**
 * Estratégia baseada em matching de concorrentes
 */
async function runCompetitorMatchingAutomation(
  itemData: ItemData,
  integration: IntegrationData,
  parameters: AutomationParameters
): Promise<AutomationResult> {
  try {
    // Buscar sugestões de preço do ML
    const accessToken = await tokenService.getValidToken(integration.id);

    const suggestionsResponse = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/ml/price-suggestions/${itemData.ml_item_id}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!suggestionsResponse.ok) {
      throw new Error('Failed to fetch price suggestions');
    }

    const suggestions = await suggestionsResponse.json();

    const suggestedPrice = suggestions.suggested_price?.amount || itemData.price;
    const maxChange = parameters.max_price_change || 0.15; // 15%
    const priceChange = (suggestedPrice - itemData.price) / itemData.price;

    let finalPrice = itemData.price;
    let reasoning = '';

    if (Math.abs(priceChange) <= maxChange) {
      finalPrice = suggestedPrice;
      reasoning = `Preço ajustado para ${suggestedPrice} baseado em análise de ${suggestions.metadata?.compared_values || 0} concorrentes.`;
    } else {
      const direction = priceChange > 0 ? 'aumento' : 'redução';
      reasoning = `Sugestão de ${direction} de ${Math.abs(priceChange * 100).toFixed(1)}% excede limite de ${maxChange * 100}%. Mantendo preço atual.`;
    }

    return {
      item_id: itemData.ml_item_id,
      current_price: itemData.price,
      suggested_price: Math.round(finalPrice * 100) / 100,
      price_change_percentage: ((finalPrice - itemData.price) / itemData.price) * 100,
      reasoning,
      competitor_data: suggestions,
      applied: false
    };

  } catch (error) {
    logger.error('Competitor matching automation failed:', error);
    return {
      item_id: itemData.ml_item_id,
      current_price: itemData.price,
      suggested_price: itemData.price,
      price_change_percentage: 0,
      reasoning: 'Erro ao analisar concorrentes. Mantendo preço atual.',
      applied: false
    };
  }
}

/**
 * Estratégia baseada em otimização de margem
 */
async function runMarginOptimizationAutomation(
  itemData: ItemData,
  integration: IntegrationData,
  parameters: AutomationParameters
): Promise<AutomationResult> {
  const targetMargin = parameters.target_margin || 0.2; // 20%
  const maxChange = parameters.max_price_change || 0.1; // 10%

  // Calcular custos (simplificado - em produção precisaria de dados reais)
  const estimatedCosts = itemData.price * 0.15; // Estimativa: 15% de custos
  const currentMargin = (itemData.price - estimatedCosts) / itemData.price;

  let suggestedPrice = itemData.price;
  let reasoning = '';

  if (currentMargin < targetMargin) {
    // Margem baixa - tentar aumentar preço
    const neededIncrease = (targetMargin * itemData.price - (itemData.price - estimatedCosts)) / (1 - targetMargin);
    const priceIncrease = Math.min(neededIncrease / itemData.price, maxChange);

    if (priceIncrease > 0.01) { // >1%
      suggestedPrice = itemData.price * (1 + priceIncrease);
      reasoning = `Margem atual ${Math.round(currentMargin * 100)}% abaixo da meta ${Math.round(targetMargin * 100)}%. Aumentando preço em ${Math.round(priceIncrease * 100)}%.`;
    } else {
      reasoning = `Margem atual ${Math.round(currentMargin * 100)}% próxima da meta ${Math.round(targetMargin * 100)}%. Mantendo preço.`;
    }
  } else {
    reasoning = `Margem atual ${Math.round(currentMargin * 100)}% atende meta de ${Math.round(targetMargin * 100)}%. Mantendo preço.`;
  }

  return {
    item_id: itemData.ml_item_id,
    current_price: itemData.price,
    suggested_price: Math.round(suggestedPrice * 100) / 100,
    price_change_percentage: ((suggestedPrice - itemData.price) / itemData.price) * 100,
    reasoning,
    applied: false
  };
}

/**
 * Calcula elasticidade-preço baseada em dados históricos
 */
function calculateElasticity(
  priceHistory: Array<{
    price: number;
    created_at: string;
    item_id: string;
  }>,
  salesData: Array<{
    total_amount: number;
    created_at: string;
    order_items: Array<{
      item?: { id: string };
      quantity: number;
      unit_price: number;
    }>;
  }>
): ElasticityData {
  if (priceHistory.length < 2 || salesData.length < 10) {
    return {
      price_changes: [],
      calculated_elasticity: 0,
      confidence_level: 'low'
    };
  }

  // Agrupar vendas por período de preço
  const priceChanges: ElasticityData['price_changes'] = [];

  for (let i = 1; i < priceHistory.length; i++) {
    const currentPrice = priceHistory[i];
    const previousPrice = priceHistory[i - 1];

    const priceChange = (currentPrice.price - previousPrice.price) / previousPrice.price;

    if (Math.abs(priceChange) > 0.01) { // Mudança >1%
      // Contar vendas antes e depois da mudança
      const beforeDate = new Date(previousPrice.created_at);
      const afterDate = new Date(currentPrice.created_at);

      const salesBefore = salesData.filter(s =>
        new Date(s.created_at) < beforeDate &&
        s.order_items?.some((item: { item?: { id: string } }) => item.item?.id === currentPrice.item_id)
      ).length;

      const salesAfter = salesData.filter(s =>
        new Date(s.created_at) >= afterDate &&
        s.order_items?.some((item: { item?: { id: string } }) => item.item?.id === currentPrice.item_id)
      ).length;

      if (salesBefore > 0 && salesAfter > 0) {
        priceChanges.push({
          old_price: previousPrice.price,
          new_price: currentPrice.price,
          sales_before: salesBefore,
          sales_after: salesAfter,
          period_days: Math.ceil((afterDate.getTime() - beforeDate.getTime()) / (1000 * 60 * 60 * 24))
        });
      }
    }
  }

  if (priceChanges.length === 0) {
    return {
      price_changes: [],
      calculated_elasticity: 0,
      confidence_level: 'low'
    };
  }

  // Calcular elasticidade média
  const elasticities = priceChanges.map(change => {
    const salesChange = (change.sales_after - change.sales_before) / change.sales_before;
    const priceChange = (change.new_price - change.old_price) / change.old_price;
    return salesChange / priceChange;
  });

  const avgElasticity = elasticities.reduce((sum, e) => sum + e, 0) / elasticities.length;

  // Determinar nível de confiança
  const confidence = priceChanges.length >= 3 ? 'high' :
                    priceChanges.length >= 2 ? 'medium' : 'low';

  return {
    price_changes: priceChanges,
    calculated_elasticity: Math.round(avgElasticity * 100) / 100,
    confidence_level: confidence as 'high' | 'medium' | 'low'
  };
}

/**
 * Aplica mudança de preço via ML API
 */
async function applyPriceChange(itemId: string, newPrice: number, accessToken: string): Promise<void> {
  const mlApiUrl = `https://api.mercadolibre.com/items/${itemId}`;

  const response = await fetch(mlApiUrl, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      price: newPrice
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`ML API error: ${response.status} - ${errorText}`);
  }
}
