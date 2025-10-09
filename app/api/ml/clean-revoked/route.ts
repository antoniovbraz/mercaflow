import { NextResponse } from 'next/server';
import { getCurrentUser, createClient } from '@/utils/supabase/server';

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
    
    // Delete any revoked integrations to allow fresh reconnection
    const { data: deletedIntegrations, error } = await supabase
      .from('ml_integrations')
      .delete()
      .eq('tenant_id', tenantId)
      .eq('status', 'revoked')
      .select('id');

    if (error) {
      console.error('Error cleaning revoked integrations:', error);
      return NextResponse.json({ error: 'Failed to clean integrations' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Revoked integrations cleaned',
      deletedCount: deletedIntegrations?.length || 0,
      deletedIds: deletedIntegrations?.map(i => i.id) || []
    });
  } catch (error) {
    console.error('Clean revoked error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}