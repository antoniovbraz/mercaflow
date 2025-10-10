/**
 * ML OAuth Callback Endpoint
 * 
 * Handles the OAuth 2.0 callback, exchanges code for tokens,
 * and stores the integration data securely
 * 
 * @security Implements Zod validation for all ML API responses
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { MLTokenManager } from '@/utils/mercadolivre/token-manager';
import { 
  MLTokenResponseSchema, 
  MLUserDataSchema,
  validateOutput,
  MLApiError,
} from '@/utils/validation';

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
    console.log('🚀 OAuth callback started');
    console.log('Code:', code ? `${code.substring(0, 10)}...` : 'N/A');
    console.log('State:', state ? `${state.substring(0, 10)}...` : 'N/A');
    
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

    console.log('Token exchange request sent, waiting for response...');
    console.log('Response status:', tokenResponse.status);
    console.log('Response ok:', tokenResponse.ok);
    
    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('❌ Token exchange failed:', tokenResponse.status, errorText);
      throw new MLApiError(
        `Token exchange failed: ${errorText}`,
        tokenResponse.status
      );
    }

    const rawTokenData = await tokenResponse.json();
    
    // Validate token response using Zod
    console.log('✅ Token exchange successful! Raw token data from ML:', JSON.stringify(rawTokenData, null, 2));
    const tokenData = validateOutput(MLTokenResponseSchema, rawTokenData);
    
    console.log('Token received and validated successfully for user:', tokenData.user_id);

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
      throw new MLApiError(
        `Failed to fetch ML user data: ${errorText}`,
        userResponse.status
      );
    }

    const rawUserData = await userResponse.json();
    
    // Validate user data using Zod
    console.log('Raw user data from ML:', JSON.stringify(rawUserData, null, 2));
    const userData = validateOutput(MLUserDataSchema, rawUserData);
    
    console.log('ML user data received and validated:', userData.nickname);

    // Save integration using token manager
    const tokenManager = new MLTokenManager();
    
    await tokenManager.saveTokenData(
      stateRecord.user_id,
      stateRecord.tenant_id,
      tokenData,
      userData // Pass the complete validated user data object
    );

    console.log('Integration saved successfully for tenant:', stateRecord.tenant_id);

    // Trigger initial product sync in background (non-blocking)
    // Don't await - let it run asynchronously
    fetch(new URL('/api/ml/products/sync-all', request.url).toString(), {
      method: 'POST',
      headers: {
        'Cookie': request.headers.get('cookie') || '',
      },
    }).catch(error => {
      console.error('Failed to trigger initial product sync:', error);
      // Don't fail the OAuth flow if sync fails
    });

    console.log('Initial product sync triggered in background');

    // Clean up used OAuth state
    await supabase
      .from('ml_oauth_states')
      .delete()
      .eq('state', state);

    console.log(`ML integration completed for tenant ${stateRecord.tenant_id}`);

    // Redirect to ML dashboard with success message
    return NextResponse.redirect(
      new URL('/dashboard/ml?connected=success', request.url)
    );

  } catch (error) {
    console.error('❌ ML Auth Callback Error - Full details:', error);
    console.error('Error type:', error?.constructor?.name);
    console.error('Error message:', error instanceof Error ? error.message : String(error));
    
    // Handle specific error types with appropriate responses
    if (error instanceof MLApiError) {
      // ML API errors - log details and redirect with specific error
      console.error('ML API Error details:', {
        message: error.message,
        statusCode: error.statusCode,
        mlError: error.mlError,
      });
      return NextResponse.redirect(
        new URL(`/dashboard?ml_error=${encodeURIComponent(error.message)}`, request.url)
      );
    }
    
    // Validation errors or general errors
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Generic error details:', errorMessage);
    
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