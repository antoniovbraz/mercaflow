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

    // Generate OAuth URL for re-authorization
    const clientId = process.env.ML_CLIENT_ID;
    const redirectUri = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/ml/oauth/callback`;

    if (!clientId) {
      return NextResponse.json(
        { error: 'ML_CLIENT_ID not configured' },
        { status: 500 }
      );
    }

    // Generate state parameter for security
    const state = crypto.randomUUID();

    // Store state in database
    await supabase
      .from('ml_oauth_states')
      .insert({
        state,
        user_id: user.id,
        tenant_id: tenantId,
        expires_at: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      });

    // Build Mercado Livre OAuth URL
    const scopes = 'read write offline_access';
    const oauthUrl = `https://auth.mercadolivre.com.br/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}&state=${state}`;

    return NextResponse.json({
      success: true,
      message: 'Redirecionando para re-autorização do Mercado Livre',
      oauth_url: oauthUrl,
      redirect_required: true
    });

  } catch (error) {
    console.error('Re-auth error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}