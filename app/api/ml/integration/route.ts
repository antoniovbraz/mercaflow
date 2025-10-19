/**
 * ML Integration Management Endpoint - REFACTORED
 * 
 * Handles CRUD operations for ML integrations:
 * - GET: Retrieve current integration for authenticated user
 * - DELETE: Remove integration and all associated data
 * 
 * @refactor Uses getCurrentUser, getCurrentTenantId, MLIntegrationRepository
 * @security RLS policies enforce tenant isolation
 */

import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/utils/supabase/server';
import { getCurrentTenantId } from '@/utils/supabase/tenancy';
import { MLIntegrationRepository } from '@/utils/mercadolivre/repositories/MLIntegrationRepository';
import { logger } from '@/utils/logger';
import { MLIntegrationNotFoundError } from '@/utils/mercadolivre/types/ml-errors';

// ============================================================================
// GET - Retrieve Integration
// ============================================================================

/**
 * Get active ML integration for current user/tenant
 * Returns null if no integration exists (not an error)
 */
export async function GET() {
  try {
    // ============================================================================
    // STEP 1: Authenticate User
    // ============================================================================

    const user = await getCurrentUser();
    if (!user) {
      logger.warn('Unauthenticated request to ML integration endpoint');
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    logger.info('Fetching ML integration', { userId: user.id });

    // ============================================================================
    // STEP 2: Get Tenant Context
    // ============================================================================

    const tenantId = await getCurrentTenantId();
    if (!tenantId) {
      logger.error('User has no tenant', { userId: user.id });
      return NextResponse.json(
        { error: 'Tenant não encontrado' },
        { status: 404 }
      );
    }

    // ============================================================================
    // STEP 3: Fetch Integration via Repository
    // ============================================================================

    const integrationRepo = new MLIntegrationRepository();
    const integration = await integrationRepo.findByUser(user.id, tenantId);

    // No integration is not an error - return null
    if (!integration) {
      logger.info('No ML integration found', { userId: user.id, tenantId });
      return NextResponse.json({ 
        integration: null,
        connected: false 
      });
    }

    // Only return active integrations
    if (integration.status !== 'active') {
      logger.info('ML integration exists but not active', { 
        userId: user.id, 
        tenantId,
        status: integration.status 
      });
      return NextResponse.json({ 
        integration: null,
        connected: false 
      });
    }

    // ============================================================================
    // STEP 4: Return Safe Integration Data (No Tokens!)
    // ============================================================================

    logger.info('ML integration found', { 
      integrationId: integration.id,
      mlUserId: integration.ml_user_id,
      status: integration.status
    });

    // Return only safe, non-sensitive data
    return NextResponse.json({
      integration: {
        id: integration.id,
        ml_user_id: integration.ml_user_id,
        ml_nickname: integration.ml_nickname,
        ml_email: integration.ml_email,
        ml_site_id: integration.ml_site_id,
        status: integration.status,
        token_expires_at: integration.token_expires_at,
        last_sync_at: integration.last_sync_at,
        last_token_refresh_at: integration.last_token_refresh_at,
        auto_sync_enabled: integration.auto_sync_enabled,
        sync_frequency_minutes: integration.sync_frequency_minutes,
        created_at: integration.created_at,
        updated_at: integration.updated_at,
      },
      connected: true
    });

  } catch (error) {
    logger.error('Error fetching ML integration', error instanceof Error ? error : new Error(String(error)));
    
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// DELETE - Remove Integration
// ============================================================================

/**
 * Delete ML integration and all associated data
 * Cascades to products, orders, questions, sync logs via FK constraints
 */
export async function DELETE() {
  try {
    // ============================================================================
    // STEP 1: Authenticate User
    // ============================================================================

    const user = await getCurrentUser();
    if (!user) {
      logger.warn('Unauthenticated request to delete ML integration');
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    logger.info('Deleting ML integration', { userId: user.id });

    // ============================================================================
    // STEP 2: Get Tenant Context
    // ============================================================================

    const tenantId = await getCurrentTenantId();
    if (!tenantId) {
      logger.error('User has no tenant', { userId: user.id });
      return NextResponse.json(
        { error: 'Tenant não encontrado' },
        { status: 404 }
      );
    }

    // ============================================================================
    // STEP 3: Find Integration to Delete
    // ============================================================================

    const integrationRepo = new MLIntegrationRepository();
    const integration = await integrationRepo.findByUser(user.id, tenantId);

    if (!integration) {
      logger.warn('No ML integration to delete', { userId: user.id, tenantId });
      throw new MLIntegrationNotFoundError();
    }

    logger.info('Found integration to delete', { 
      integrationId: integration.id,
      mlUserId: integration.ml_user_id
    });

    // ============================================================================
    // STEP 4: Delete Integration (Cascades via FK)
    // ============================================================================

    await integrationRepo.delete(integration.id);

    logger.info('ML integration deleted successfully', { 
      integrationId: integration.id,
      userId: user.id,
      tenantId,
      mlUserId: integration.ml_user_id
    });

    // ============================================================================
    // STEP 5: Return Success
    // ============================================================================

    return NextResponse.json({
      success: true,
      message: 'Integração removida com sucesso',
      deletedIntegration: {
        id: integration.id,
        ml_user_id: integration.ml_user_id,
        ml_nickname: integration.ml_nickname
      }
    });

  } catch (error) {
    // Handle specific integration not found error
    if (error instanceof MLIntegrationNotFoundError) {
      logger.warn('Attempted to delete non-existent integration');
      return NextResponse.json(
        { error: 'Integração não encontrada' },
        { status: 404 }
      );
    }

    // Generic error handling
    logger.error('Error deleting ML integration', error instanceof Error ? error : new Error(String(error)));
    
    return NextResponse.json(
      { 
        error: 'Erro ao remover integração',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST/PUT - Not Implemented
// ============================================================================

/**
 * Integration creation happens via OAuth callback
 * Use /api/ml/auth/authorize to start OAuth flow
 */
export async function POST() {
  return NextResponse.json(
    { 
      error: 'Method not allowed',
      message: 'To create an integration, use the OAuth flow via /api/ml/auth/authorize'
    },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { 
      error: 'Method not allowed',
      message: 'Integration updates happen automatically during token refresh'
    },
    { status: 405 }
  );
}
