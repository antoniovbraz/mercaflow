/**
 * POST /api/intelligence/insights/generate
 * 
 * Generate AI-powered business insights for tenant's items.
 * Analyzes price, performance, and market data to create actionable recommendations.
 * 
 * @authentication Required
 * @authorization Requires valid tenant access
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getCurrentUser } from '@/utils/supabase/roles';
import { getCurrentTenantId } from '@/utils/supabase/tenancy';
import { getInsightGenerator } from '@/utils/intelligence/insight-generator';
import { logger } from '@/utils/logger';
import { z } from 'zod';

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================

const GenerateInsightsRequestSchema = z.object({
  item_ids: z.array(z.string()).min(1).max(100),
  categories: z
    .array(
      z.enum([
        "PRICE_OPTIMIZATION",
        "AUTOMATION_OPPORTUNITY",
        "PERFORMANCE_WARNING",
        "MARKET_TREND",
      ])
    )
    .optional(),
});

// ============================================================================
// API ROUTE HANDLER
// ============================================================================

export async function POST(request: NextRequest) {
  const context = {
    endpoint: '/api/intelligence/insights/generate',
    method: 'POST',
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

    // 3. Parse and validate request body
    const body = await request.json();
    const validationResult = GenerateInsightsRequestSchema.safeParse(body);

    if (!validationResult.success) {
      logger.warn('Invalid request body', {
        ...context,
        errors: validationResult.error.issues,
      });
      return NextResponse.json(
        { 
          error: 'Invalid request body',
          details: validationResult.error.issues 
        },
        { status: 400 }
      );
    }

    const { item_ids, categories } = validationResult.data;

    logger.info('Generating insights', {
      ...context,
      userId: user.id,
      tenantId,
      itemCount: item_ids.length,
      categories,
    });

    // 4. Get ML integration ID for this tenant
    const supabase = await createClient();
    const { data: integration, error: integrationError } = await supabase
      .from('ml_integrations')
      .select('id')
      .eq('tenant_id', tenantId)
      .eq('status', 'active')
      .single();

    if (integrationError || !integration) {
      logger.warn('No active ML integration found', {
        ...context,
        tenantId,
        error: integrationError,
      });
      return NextResponse.json(
        { error: 'No active Mercado Livre integration found' },
        { status: 404 }
      );
    }

    // 5. Generate insights
    const generator = getInsightGenerator(integration.id, tenantId);
    
    let insights;
    if (categories && categories.length > 0) {
      // Generate specific categories
      const insightPromises = categories.map(async (category) => {
        switch (category) {
          case 'PRICE_OPTIMIZATION':
            return generator.generatePriceInsights(item_ids);
          case 'AUTOMATION_OPPORTUNITY':
            return generator.generateAutomationInsights(item_ids);
          case 'PERFORMANCE_WARNING':
            return generator.generatePerformanceInsights(item_ids);
          case 'MARKET_TREND':
            return generator.generateTrendInsights();
          default:
            return [];
        }
      });
      
      const results = await Promise.all(insightPromises);
      insights = results.flat();
    } else {
      // Generate all insights
      insights = await generator.generateAllInsights(item_ids);
    }

    // 6. Save insights to database
    const { error: insertError } = await supabase
      .from('insights')
      .insert(
        insights.map(insight => ({
          ...insight,
          user_id: user.id,
        }))
      );

    if (insertError) {
      logger.error('Failed to save insights', insertError, {
        ...context,
        tenantId,
        insightCount: insights.length,
      });
      return NextResponse.json(
        { error: 'Failed to save insights' },
        { status: 500 }
      );
    }

    logger.info('Insights generated and saved successfully', {
      ...context,
      userId: user.id,
      tenantId,
      insightCount: insights.length,
      byPriority: insights.reduce((acc, i) => {
        acc[i.priority] = (acc[i.priority] || 0) + 1;
        return acc;
      }, {} as Record<number, number>),
    });

    return NextResponse.json({
      success: true,
      data: {
        insights,
        count: insights.length,
        summary: {
          total: insights.length,
          by_category: insights.reduce((acc, i) => {
            acc[i.category] = (acc[i.category] || 0) + 1;
            return acc;
          }, {} as Record<string, number>),
          by_priority: insights.reduce((acc, i) => {
            acc[i.priority] = (acc[i.priority] || 0) + 1;
            return acc;
          }, {} as Record<number, number>),
          total_potential_roi: insights
            .reduce((sum, i) => sum + (i.roi_estimate || 0), 0)
            .toFixed(2),
        },
      },
    });

  } catch (error) {
    logger.error('Unexpected error generating insights', error instanceof Error ? error : new Error(String(error)), context);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
