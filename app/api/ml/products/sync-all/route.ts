import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/utils/supabase/roles';
import { getCurrentTenantId } from '@/utils/supabase/tenancy';
import { getMLProductService } from '@/utils/mercadolivre/services';
import { getMLIntegrationRepository } from '@/utils/mercadolivre/repositories';
import { logger } from '@/utils/logger';

/**
 * POST /api/ml/products/sync-all
 * 
 * Sincroniza TODOS os produtos do Mercado Livre
 * 
 * REFATORADO (Fase 4):
 * - Usa MLProductService (multiget pattern correto)
 * - Usa MLIntegrationRepository para buscar integração
 * - Logging estruturado via logger
 * - Error handling robusto
 * - Type-safe com novos types
 * 
 * Substituiu 250+ linhas de lógica inline por 80 linhas usando services
 */
export async function POST() {
  const context = { endpoint: '/api/ml/products/sync-all' };
  
  try {
    logger.info('Starting product sync', context);
    
    // STEP 1: Authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get tenant ID from profile
    const tenantId = await getCurrentTenantId();
    if (!tenantId) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      );
    }

    // STEP 2: Get active ML integration
    const integrationRepo = getMLIntegrationRepository();
    const integrations = await integrationRepo.findByTenant(tenantId);
    
    const activeIntegration = integrations.find(i => i.status === 'active');
    
    if (!activeIntegration) {
      logger.warn('No active ML integration found', { ...context, tenantId });
      return NextResponse.json(
        { error: 'No active ML integration found. Please connect your Mercado Livre account.' },
        { status: 404 }
      );
    }

    logger.info('Active integration found', {
      ...context,
      integrationId: activeIntegration.id,
      mlUserId: activeIntegration.ml_user_id,
    });

    // STEP 3: Sync products using service
    const productService = getMLProductService();
    const result = await productService.syncAllProducts(activeIntegration.id);

    logger.info('Product sync completed', {
      ...context,
      integrationId: activeIntegration.id,
      result,
    });

    // STEP 4: Return success response
    return NextResponse.json({
      success: result.success,
      message: `Synced ${result.items_synced} of ${result.items_fetched} products`,
      sync_log_id: result.sync_log_id,
      total_fetched: result.items_fetched,
      synced: result.items_synced,
      failed: result.items_failed,
      duration_seconds: result.duration_seconds,
      errors: result.errors,
    });

  } catch (error) {
    logger.error('Product sync failed', {
      ...context,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
