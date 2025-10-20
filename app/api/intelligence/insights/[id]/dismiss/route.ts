/**
 * POST /api/intelligence/insights/[id]/dismiss
 * 
 * Dismiss an insight (user chose to ignore the recommendation).
 * Updates status to DISMISSED and sets dismissed_at timestamp.
 * 
 * @authentication Required
 * @authorization Requires tenant ownership of insight
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getCurrentUser } from '@/utils/supabase/roles';
import { getCurrentTenantId } from '@/utils/supabase/tenancy';
import { logger } from '@/utils/logger';

// ============================================================================
// API ROUTE HANDLER
// ============================================================================

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const context = {
    endpoint: '/api/intelligence/insights/[id]/dismiss',
    method: 'POST',
    insightId: params.id,
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

    // 3. Validate insight ID format (UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(params.id)) {
      logger.warn('Invalid insight ID format', context);
      return NextResponse.json(
        { error: 'Invalid insight ID format' },
        { status: 400 }
      );
    }

    logger.info('Dismissing insight', {
      ...context,
      userId: user.id,
      tenantId,
    });

    // 4. Check if insight exists and belongs to tenant
    const supabase = await createClient();
    const { data: insight, error: fetchError } = await supabase
      .from('insights')
      .select('id, status, tenant_id')
      .eq('id', params.id)
      .eq('tenant_id', tenantId)
      .single();

    if (fetchError || !insight) {
      logger.warn('Insight not found or access denied', {
        ...context,
        tenantId,
        error: fetchError,
      });
      return NextResponse.json(
        { error: 'Insight not found' },
        { status: 404 }
      );
    }

    // 5. Check if insight is already dismissed or completed
    if (insight.status === 'DISMISSED') {
      logger.info('Insight already dismissed', context);
      return NextResponse.json(
        { 
          success: true,
          message: 'Insight was already dismissed',
          data: { insight }
        }
      );
    }

    if (insight.status === 'COMPLETED') {
      logger.warn('Cannot dismiss completed insight', context);
      return NextResponse.json(
        { error: 'Cannot dismiss a completed insight' },
        { status: 400 }
      );
    }

    // 6. Update insight status
    const { data: updatedInsight, error: updateError } = await supabase
      .from('insights')
      .update({
        status: 'DISMISSED',
        dismissed_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .eq('tenant_id', tenantId)
      .select()
      .single();

    if (updateError) {
      logger.error('Failed to dismiss insight', updateError, context);
      return NextResponse.json(
        { error: 'Failed to dismiss insight' },
        { status: 500 }
      );
    }

    logger.info('Insight dismissed successfully', {
      ...context,
      userId: user.id,
      tenantId,
    });

    return NextResponse.json({
      success: true,
      message: 'Insight dismissed successfully',
      data: { insight: updatedInsight },
    });

  } catch (error) {
    logger.error('Unexpected error dismissing insight', error instanceof Error ? error : new Error(String(error)), context);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
