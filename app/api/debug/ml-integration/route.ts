/**
 * Debug endpoint to check ML integration status
 */

import { NextResponse } from 'next/server';
import { getCurrentUser, createClient } from '@/utils/supabase/server';
import { getMLIntegrationService } from '@/utils/mercadolivre/services';

const integrationService = getMLIntegrationService();

export async function GET() {
  // PROTEÇÃO: Bloquear em produção
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Debug endpoints are disabled in production' },
      { status: 403 }
    );
  }

  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

  const supabase = await createClient();

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    const tenantId = profile?.tenant_id || user.id;

    // Check ML integrations
    const { data: integrations } = await supabase
      .from('ml_integrations')
      .select('*')
      .eq('tenant_id', tenantId);

    // Test integration retrieval via service
    let activeIntegration = null;
    try {
      activeIntegration = await integrationService.getActiveTenantIntegration(tenantId);
    } catch (error) {
      activeIntegration = { error: error instanceof Error ? error.message : 'Unknown error' };
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
      },
      profile,
      tenantId,
      integrations: integrations || [],
  integrationService: activeIntegration,
    });

  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}