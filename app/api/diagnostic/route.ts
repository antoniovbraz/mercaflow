import { NextResponse } from 'next/server';
import { getCurrentUser, createClient } from '@/utils/supabase/server';

export async function GET() {
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
    const { data: integration, error: integrationError } = await supabase
      .from('ml_integrations')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('status', 'active')
      .single();

    // Count products for this integration
    const { count: productCount, error: countError } = await supabase
      .from('ml_products')
      .select('*', { count: 'exact', head: true })
      .eq('integration_id', integration?.id || 'none');

    // Get recent sync logs
    const { data: syncLogs, error: logsError } = await supabase
      .from('ml_sync_logs')
      .select('*')
      .eq('integration_id', integration?.id || 'none')
      .order('created_at', { ascending: false })
      .limit(5);

    return NextResponse.json({
      diagnostic: {
        userId: user.id,
        tenantId,
        integration: integration ? {
          id: integration.id,
          ml_user_id: integration.ml_user_id,
          status: integration.status,
          last_sync_at: integration.last_sync_at
        } : null,
        integrationError: integrationError?.message,
        productCount,
        countError: countError?.message,
        recentSyncLogs: syncLogs || [],
        logsError: logsError?.message
      }
    });

  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}