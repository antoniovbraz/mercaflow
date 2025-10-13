import { NextResponse } from 'next/server';
import { getCurrentUser, createClient } from '@/utils/supabase/server';
import { MLTokenManager } from '@/utils/mercadolivre/token-manager';

export async function POST() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const supabase = await createClient();

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('tenant_id')
      .eq('id', user.id)
      .single();

    const tenantId = profile?.tenant_id || user.id;

    // Get ML integration
    const tokenManager = new MLTokenManager();
    const integration = await tokenManager.getIntegrationByTenant(tenantId);

    if (!integration) {
      return NextResponse.json(
        { error: 'No ML integration found' },
        { status: 404 }
      );
    }

    // Force token refresh
    console.log('🔄 Forcing token refresh for integration:', integration.id);

    const newToken = await tokenManager['refreshToken'](integration);

    if (newToken) {
      return NextResponse.json({
        success: true,
        message: 'Token refreshed successfully',
        integration_id: integration.id,
        token_expires_at: integration.token_expires_at
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to refresh token' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}