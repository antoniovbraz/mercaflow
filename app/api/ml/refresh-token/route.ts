import { NextResponse } from 'next/server';
import { getCurrentUser, createClient } from '@/utils/supabase/server';
import { getMLTokenService } from '@/utils/mercadolivre/services';
import { getMLIntegrationRepository } from '@/utils/mercadolivre/repositories';
import { MLTokenRefreshError } from '@/utils/mercadolivre/types/ml-errors';

export async function POST() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const supabase = await createClient();

    const { data: profile } = await supabase
      .from('profiles')
      .select('tenant_id')
      .eq('id', user.id)
      .single();

    const tenantId = profile?.tenant_id || user.id;

    const integrationRepo = getMLIntegrationRepository();
    const integrations = await integrationRepo.findByTenant(tenantId);
    const integration = integrations.find((item) => item.status === 'active');

    if (!integration) {
      return NextResponse.json(
        { error: 'No ML integration found' },
        { status: 404 }
      );
    }

    const tokenService = getMLTokenService();

    console.log('🔄 Forcing token refresh for integration:', integration.id);

    try {
      await tokenService.refreshToken(integration.id);

      return NextResponse.json({
        success: true,
        message: 'Token refreshed successfully',
        integration_id: integration.id,
        method: 'manual',
      });
    } catch (refreshError) {
      console.error('❌ Refresh token failed:', refreshError);

      try {
        await tokenService.getValidToken(integration.id);

        return NextResponse.json({
          success: true,
          message: 'Token refreshed successfully',
          integration_id: integration.id,
          method: 'automatic',
        });
      } catch (autoError) {
        console.error('❌ Automatic token refresh failed:', autoError);

        const errorMessage =
          autoError instanceof MLTokenRefreshError || refreshError instanceof MLTokenRefreshError
            ? 'Token refresh failed. Please re-authorize your Mercado Livre account.'
            : 'Unable to refresh Mercado Livre token.';

        return NextResponse.json(
          {
            success: false,
            error: errorMessage,
            suggestion: 'Go to Settings > Integrations and reconnect your ML account',
            integration_id: integration.id,
          },
          { status: 500 }
        );
      }
    }

  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
