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
import { logger } from '@/utils/logger';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const error = url.searchParams.get('error');
  const errorDescription = url.searchParams.get('error_description');

  // Handle OAuth errors
  if (error) {
    logger.error('ML OAuth Error', new Error(error), { error, errorDescription });
    return NextResponse.redirect(
      new URL(`/dashboard?ml_error=${encodeURIComponent(error)}`, request.url)
    );
  }

  if (!code || !state) {
    logger.error('Missing required OAuth parameters', undefined, { hasCode: !!code, hasState: !!state });
    return NextResponse.redirect(
      new URL('/dashboard?ml_error=missing_parameters', request.url)
    );
  }

  try {
    logger.info('ML OAuth callback started', { 
      codePreview: code ? `${code.substring(0, 10)}...` : 'N/A',
      statePreview: state ? `${state.substring(0, 10)}...` : 'N/A'
    });
    
    const supabase = await createClient();

    // Validate and retrieve OAuth state
    const { data: stateRecord, error: stateError } = await supabase
      .from('ml_oauth_states')
      .select('*')
      .eq('state', state)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (stateError || !stateRecord) {
      logger.error('Invalid or expired OAuth state', stateError, { state: state?.substring(0, 10) });
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
    logger.info('Exchanging authorization code for access token');
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

    logger.debug('Token exchange response received', { 
      status: tokenResponse.status, 
      ok: tokenResponse.ok 
    });
    
    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      logger.error('ML token exchange failed', undefined, { 
        status: tokenResponse.status, 
        errorText 
      });
      throw new MLApiError(
        `Token exchange failed: ${errorText}`,
        tokenResponse.status
      );
    }

    const rawTokenData = await tokenResponse.json();
    
    // Validate token response using Zod
    logger.info('ML token exchange successful', { userId: rawTokenData.user_id });
    const tokenData = validateOutput(MLTokenResponseSchema, rawTokenData);
    
    logger.debug('Token validated successfully', { userId: tokenData.user_id });

    // Fetch ML user data
    logger.info('Fetching ML user data');
    const userResponse = await fetch('https://api.mercadolibre.com/users/me', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Accept': 'application/json',
      },
    });

    if (!userResponse.ok) {
      const errorText = await userResponse.text();
      logger.error('Failed to fetch ML user data', undefined, { 
        status: userResponse.status, 
        errorText 
      });
      throw new MLApiError(
        `Failed to fetch ML user data: ${errorText}`,
        userResponse.status
      );
    }

    const rawUserData = await userResponse.json();
    
    // Validate user data using Zod
    logger.debug('ML user data received', { nickname: rawUserData.nickname, id: rawUserData.id });
    const userData = validateOutput(MLUserDataSchema, rawUserData);
    
    logger.info('ML user data validated', { nickname: userData.nickname, userId: userData.id });

    // Save integration using token manager
    const tokenManager = new MLTokenManager();
    
    await tokenManager.saveTokenData(
      stateRecord.user_id,
      stateRecord.tenant_id,
      tokenData,
      userData // Pass the complete validated user data object
    );

    logger.info('ML integration saved successfully', { 
      tenantId: stateRecord.tenant_id,
      mlUserId: userData.id,
      nickname: userData.nickname
    });

    // Trigger initial product sync in background (non-blocking)
    // Don't await - let it run asynchronously
    fetch(new URL('/api/ml/products/sync-all', request.url).toString(), {
      method: 'POST',
      headers: {
        'Cookie': request.headers.get('cookie') || '',
      },
    }).catch(error => {
      logger.warn('Failed to trigger initial product sync', { error: error.message });
      // Don't fail the OAuth flow if sync fails
    });

    logger.info('Initial product sync triggered in background');

    // Clean up used OAuth state
    await supabase
      .from('ml_oauth_states')
      .delete()
      .eq('state', state);

    logger.info('ML OAuth flow completed successfully', { 
      tenantId: stateRecord.tenant_id,
      mlUserId: userData.id
    });

    // Redirect to ML dashboard with success message
    return NextResponse.redirect(
      new URL('/dashboard/ml?connected=success', request.url)
    );

  } catch (error) {
    logger.error('ML OAuth callback failed', error instanceof Error ? error : new Error(String(error)), {
      errorType: error?.constructor?.name,
      state: state?.substring(0, 10)
    });
    
    // Handle specific error types with appropriate responses
    if (error instanceof MLApiError) {
      // ML API errors - log details and redirect with specific error
      logger.error('ML API Error in OAuth flow', error, {
        statusCode: error.statusCode,
        mlError: error.mlError,
      });
      return NextResponse.redirect(
        new URL(`/dashboard?ml_error=${encodeURIComponent(error.message)}`, request.url)
      );
    }
    
    // Validation errors or general errors
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
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