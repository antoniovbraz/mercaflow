/**
 * ML Stats API
 *
 * Returns statistics about ML products without pagination limits
 */

import { NextResponse } from 'next/server';
import { getCurrentUser, createClient } from '@/utils/supabase/server';
import { MLTokenManager } from '@/utils/mercadolivre/token-manager';
import { logger } from '@/utils/logger';

const tokenManager = new MLTokenManager();

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

    // Get stats from local database cache (faster and more reliable)
    const { data: products, error } = await supabase
      .from('ml_products')
      .select('status, sold_quantity, last_synced_at')
      .eq('integration_id', integration.id);

    if (error) {
      logger.error('Error fetching products from cache:', error);
      return NextResponse.json(
        { error: 'Failed to fetch product statistics' },
        { status: 500 }
      );
    }

    // Calculate stats
    const stats: MLStats = {
      total: products?.length || 0,
      active: products?.filter(p => p.status === 'active').length || 0,
      paused: products?.filter(p => p.status === 'paused').length || 0,
      sold: products?.reduce((sum, p) => sum + (p.sold_quantity || 0), 0) || 0,
    };

    // Get last sync time
    if (products && products.length > 0) {
      const lastSync = products
        .map(p => new Date(p.last_synced_at))
        .sort((a, b) => b.getTime() - a.getTime())[0];

      stats.lastSync = lastSync?.toISOString();
    }

    logger.info('ML Stats calculated:', stats);

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