/**
 * ML OAuth Callback Endpoint
 * 
 * Handles the OAuth 2.0 callback, exchanges code for tokens,
 * and stores the integration data securely
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { MLTokenManager } from '@/utils/mercadolivre/token-manager';

interface MLTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  user_id: number;
  refresh_token: string;
}

interface MLUserResponse {
  id: number;
  nickname: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  country_id: string;
  address?: {
    state?: string;
    city?: string;
  };
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const error = url.searchParams.get('error');
  const errorDescription = url.searchParams.get('error_description');

  // Handle OAuth errors
  if (error) {
    console.error('ML OAuth Error:', error, errorDescription);
    return NextResponse.redirect(
      new URL(`/dashboard?ml_error=${encodeURIComponent(error)}`, request.url)
    );
  }

  if (!code || !state) {
    console.error('Missing required parameters:', { code: !!code, state: !!state });
    return NextResponse.redirect(
      new URL('/dashboard?ml_error=missing_parameters', request.url)
    );
  }

  try {
    const supabase = await createClient();

    // Validate and retrieve OAuth state
    const { data: stateRecord, error: stateError } = await supabase
      .from('ml_oauth_states')
      .select('*')
      .eq('state', state)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (stateError || !stateRecord) {
      console.error('Invalid or expired state:', stateError);
      return NextResponse.redirect(
        new URL('/dashboard?ml_error=invalid_state', request.url)
      );
    }

    // Validate environment variables
    const clientId = process.env.ML_CLIENT_ID;
    const clientSecret = process.env.ML_CLIENT_SECRET;
    const redirectUri = process.env.ML_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
      throw new Error('Missing ML OAuth configuration');
    }

    // Exchange authorization code for access token
    console.log('Exchanging code for token...');
    const tokenResponse = await fetch('https://api.mercadolibre.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
        code_verifier: stateRecord.code_verifier,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token exchange failed:', tokenResponse.status, errorText);
      throw new Error(`Token exchange failed: ${errorText}`);
    }

    const tokenData: MLTokenResponse = await tokenResponse.json();
    console.log('Token received successfully for user:', tokenData.user_id);

    // Fetch ML user data
    console.log('Fetching ML user data...');
    const userResponse = await fetch('https://api.mercadolibre.com/users/me', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Accept': 'application/json',
      },
    });

    if (!userResponse.ok) {
      const errorText = await userResponse.text();
      console.error('Failed to fetch ML user data:', userResponse.status, errorText);
      throw new Error(`Failed to fetch ML user data: ${errorText}`);
    }

    const userData: MLUserResponse = await userResponse.json();
    console.log('ML user data received:', userData.nickname);

    // Save integration using token manager
    const tokenManager = new MLTokenManager();
    
    await tokenManager.saveTokenData(
      stateRecord.user_id,
      stateRecord.tenant_id,
      tokenData,
      {
        id: userData.id,
        nickname: userData.nickname,
        email: userData.email,
        first_name: userData.first_name,
        last_name: userData.last_name,
      }
    );

    // Clean up used OAuth state
    await supabase
      .from('ml_oauth_states')
      .delete()
      .eq('state', state);

    console.log(`ML integration completed for tenant ${stateRecord.tenant_id}`);

    // Redirect to success page
    return NextResponse.redirect(
      new URL('/dashboard?ml_connected=true', request.url)
    );

  } catch (error) {
    console.error('ML Auth Callback Error:', error);
    
    // Log error details for debugging
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.redirect(
      new URL(`/dashboard?ml_error=${encodeURIComponent(errorMessage)}`, request.url)
    );
  }
}

// Only GET allowed for OAuth callback
export async function POST(): Promise<NextResponse> {
  return NextResponse.json(
    { error: 'Method not allowed. OAuth callback must use GET.' },
    { status: 405 }
  );
}