/**
 * POST /api/intelligence/insights/[id]/complete
 * 
 * Mark an insight as completed (user acted on the recommendation).
 * Updates status to COMPLETED and sets completed_at timestamp.
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
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const context = {
    endpoint: '/api/intelligence/insights/[id]/complete',
    method: 'POST',
    insightId: id,
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
    if (!uuidRegex.test(id)) {
      logger.warn('Invalid insight ID format', context);
      return NextResponse.json(
        { error: 'Invalid insight ID format' },
        { status: 400 }
      );
    }

    logger.info('Completing insight', {
      ...context,
      userId: user.id,
      tenantId,
    });

    // 4. Check if insight exists and belongs to tenant
    const supabase = await createClient();
    const { data: insight, error: fetchError } = await supabase
      .from('insights')
      .select('id, status, tenant_id, category, roi_estimate')
      .eq('id', id)
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

    // 5. Check if insight is already completed
    if (insight.status === 'COMPLETED') {
      logger.info('Insight already completed', context);
      return NextResponse.json(
        { 
          success: true,
          message: 'Insight was already marked as completed',
          data: { insight }
        }
      );
    }

    // 6. Cannot complete a dismissed insight (optional business rule)
    if (insight.status === 'DISMISSED') {
      logger.warn('Cannot complete dismissed insight', context);
      return NextResponse.json(
        { error: 'Cannot complete a dismissed insight' },
        { status: 400 }
      );
    }

    // 7. Update insight status
    const { data: updatedInsight, error: updateError } = await supabase
      .from('insights')
      .update({
        status: 'COMPLETED',
        completed_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select()
      .single();

    if (updateError) {
      logger.error('Failed to complete insight', updateError, context);
      return NextResponse.json(
        { error: 'Failed to complete insight' },
        { status: 500 }
      );
    }

    logger.info('Insight completed successfully', {
      ...context,
      userId: user.id,
      tenantId,
      category: insight.category,
      roi_estimate: insight.roi_estimate,
    });

    return NextResponse.json({
      success: true,
      message: 'Insight marked as completed successfully',
      data: { 
        insight: updatedInsight,
        roi_realized: insight.roi_estimate, // Potential ROI that will be tracked
      },
    });

  } catch (error) {
    logger.error('Unexpected error completing insight', error instanceof Error ? error : new Error(String(error)), context);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
