/**
 * ML Stats API
 *
 * Returns statistics about ML products without pagination limits
 * 
 * @refactored Uses MLIntegrationRepository instead of MLTokenManager
 */

import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/utils/supabase/server';
import { getCurrentTenantId } from '@/utils/supabase/tenancy';
import { MLIntegrationRepository } from '@/utils/mercadolivre/repositories/MLIntegrationRepository';
import { MLProductRepository } from '@/utils/mercadolivre/repositories/MLProductRepository';
import { logger } from '@/utils/logger';

interface MLStats {
  total: number;
  active: number;
  paused: number;
  sold: number;
  lastSync?: string;
}

export async function GET(): Promise<NextResponse> {
  try {
    // Verify authentication
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get tenant context
    const tenantId = await getCurrentTenantId();
    if (!tenantId) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 400 }
      );
    }

    // Get ML integration for this tenant
    const integrationRepo = new MLIntegrationRepository();
    const integrations = await integrationRepo.findByTenant(tenantId);
    const integration = integrations.find(i => i.status === 'active') || null;

    if (!integration) {
      return NextResponse.json(
        { error: 'No active ML integration found' },
        { status: 404 }
      );
    }

    // Get stats from local database using repository
    const productRepo = new MLProductRepository();
    const products = await productRepo.findByIntegration(integration.id);

    // Calculate stats
    const stats: MLStats = {
      total: products.length,
      active: products.filter((p) => p.status === 'active').length,
      paused: products.filter((p) => p.status === 'paused').length,
      sold: products.reduce((sum, p) => sum + (p.sold_quantity || 0), 0),
    };

    // Get last sync time
    if (products.length > 0) {
      const lastSync = products
        .map((p) => new Date(p.last_sync_at))
        .sort((a, b) => b.getTime() - a.getTime())[0];

      stats.lastSync = lastSync?.toISOString();
    }

    logger.info('ML Stats calculated', { stats, integrationId: integration.id });

    return NextResponse.json(stats);

  } catch (error) {
    logger.error('ML Stats GET Error:', error);

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
