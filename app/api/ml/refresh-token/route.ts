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

    // First, try to get a fresh token using the existing refresh token
    let newToken: string | null = null;
    
    try {
      newToken = await tokenManager['refreshToken'](integration);
      console.log('✅ Token refreshed successfully via refresh token');
    } catch (refreshError) {
      console.error('❌ Refresh token failed:', refreshError);
      
      // If refresh token is corrupted, try to get a new access token using stored credentials
      console.log('🔄 Attempting to get new access token...');
      
      try {
        // Try to make a request that will trigger token refresh automatically
        const testResponse = await tokenManager.makeMLRequest(
          integration.id,
          '/users/me'
        );
        
        if (testResponse.ok) {
          console.log('✅ Token was refreshed automatically by makeMLRequest');
          newToken = 'refreshed_via_request';
        } else {
          console.error('❌ Automatic token refresh also failed');
        }
      } catch (autoRefreshError) {
        console.error('❌ Automatic token refresh failed:', autoRefreshError);
      }
    }

    if (newToken) {
      return NextResponse.json({
        success: true,
        message: 'Token refreshed successfully',
        integration_id: integration.id,
        method: newToken === 'refreshed_via_request' ? 'automatic' : 'manual'
      });
    } else {
      // If all methods fail, suggest re-authorization
      return NextResponse.json({
        success: false,
        error: 'Token refresh failed. Please re-authorize your Mercado Livre account.',
        suggestion: 'Go to Settings > Integrations and reconnect your ML account',
        integration_id: integration.id
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}