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
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    // Get integrations
    const { data: integrations, error: integrationsError } = await supabase
      .from('ml_integrations')
      .select('*')
      .eq('tenant_id', profile?.tenant_id || user.id);

  // Try with integration service
  const integration = await integrationService.getActiveTenantIntegration(profile?.tenant_id || user.id);

    return NextResponse.json({
      debug: {
        userId: user.id,
        userEmail: user.email,
        profile: profile || 'Profile not found',
        profileError: profileError?.message,
        tenantId: profile?.tenant_id || user.id,
        integrations: integrations || [],
        integrationsError: integrationsError?.message,
        activeIntegration: integration ? {
          id: integration.id,
          ml_user_id: integration.ml_user_id,
          ml_nickname: integration.ml_nickname,
          status: integration.status
        } : 'No integration found'
      }
    });
  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json({
      error: 'Debug error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
