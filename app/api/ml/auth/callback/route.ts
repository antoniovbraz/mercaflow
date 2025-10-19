/**
 * ML OAuth Callback Endpoint - REFACTORED
 * 
 * Handles the OAuth 2.0 callback flow:
 * 1. Validates OAuth state and parameters
 * 2. Exchanges authorization code for tokens
 * 3. Fetches ML user data
 * 4. Saves integration using MLTokenService + MLIntegrationRepository
 * 5. Triggers initial product sync
 * 
 * @refactor Uses MLTokenService for encryption, MLIntegrationRepository for DB operations
 * @security Implements Zod validation for all ML API responses
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { logger } from '@/utils/logger';
import { MLTokenService } from '@/utils/mercadolivre/services/MLTokenService';
import { MLIntegrationRepository } from '@/utils/mercadolivre/repositories/MLIntegrationRepository';
import { 
  MLTokenResponseSchema, 
  MLUserDataSchema,
  validateOutput,
} from '@/utils/validation';
import {
  MLApiError,
  MLOAuthError,
} from '@/utils/mercadolivre/types/ml-errors';

// ============================================================================
// TYPES
// ============================================================================

interface OAuthState {
  id: string;
  user_id: string;
  tenant_id: string;
  state: string;
  code_verifier: string;
  expires_at: string;
}

// ============================================================================
// MAIN HANDLER
// ============================================================================

export async function GET(request: NextRequest): Promise<NextResponse> {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const error = url.searchParams.get('error');
  const errorDescription = url.searchParams.get('error_description');

  // ============================================================================
  // STEP 1: Handle OAuth Errors
  // ============================================================================

  if (error) {
    logger.error('ML OAuth error received', { error, errorDescription });
    return NextResponse.redirect(
      new URL(`/dashboard?ml_error=${encodeURIComponent(error)}`, request.url)
    );
  }

  // ============================================================================
  // STEP 2: Validate Parameters
  // ============================================================================

  if (!code || !state) {
    logger.error('Missing OAuth parameters', { hasCode: !!code, hasState: !!state });
    return NextResponse.redirect(
      new URL('/dashboard?ml_error=missing_parameters', request.url)
    );
  }

  try {
    logger.info('ML OAuth callback started', { 
      codePreview: `${code.substring(0, 10)}...`,
      statePreview: `${state.substring(0, 10)}...`
    });

    // ============================================================================
    // STEP 3: Validate OAuth State
    // ============================================================================

    const supabase = await createClient();

    const { data: stateRecord, error: stateError } = await supabase
      .from('ml_oauth_states')
      .select('*')
      .eq('state', state)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();

    if (stateError || !stateRecord) {
      logger.error('Invalid or expired OAuth state', { error: stateError, state: state.substring(0, 10) });
      return NextResponse.redirect(
        new URL('/dashboard?ml_error=invalid_state', request.url)
      );
    }

    const oauthState = stateRecord as OAuthState;
    logger.info('OAuth state validated', { userId: oauthState.user_id, tenantId: oauthState.tenant_id });

    // ============================================================================
    // STEP 4: Validate Environment Variables
    // ============================================================================

    const clientId = process.env.ML_CLIENT_ID;
    const clientSecret = process.env.ML_CLIENT_SECRET;
    const redirectUri = process.env.ML_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
      throw new MLOAuthError('Missing ML OAuth configuration (ML_CLIENT_ID, ML_CLIENT_SECRET, or ML_REDIRECT_URI)');
    }

    // ============================================================================
    // STEP 5: Exchange Authorization Code for Tokens
    // ============================================================================

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
        code_verifier: oauthState.code_verifier,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      logger.error('Token exchange failed', { status: tokenResponse.status, errorText });
      throw new MLApiError(
        `Token exchange failed: ${errorText}`,
        tokenResponse.status
      );
    }

    const rawTokenData = await tokenResponse.json();
    const tokenData = validateOutput(MLTokenResponseSchema, rawTokenData);
    
    logger.info('Token exchange successful', { 
      mlUserId: tokenData.user_id,
      expiresIn: tokenData.expires_in,
      scopes: tokenData.scope
    });

    // ============================================================================
    // STEP 6: Fetch ML User Data
    // ============================================================================

    logger.info('Fetching ML user data');
    
    const userResponse = await fetch('https://api.mercadolibre.com/users/me', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Accept': 'application/json',
      },
    });

    if (!userResponse.ok) {
      const errorText = await userResponse.text();
      logger.error('Failed to fetch ML user data', { status: userResponse.status, errorText });
      throw new MLApiError(
        `Failed to fetch ML user data: ${errorText}`,
        userResponse.status
      );
    }

    const rawUserData = await userResponse.json();
    const userData = validateOutput(MLUserDataSchema, rawUserData);
    
    logger.info('ML user data validated', { 
      nickname: userData.nickname,
      mlUserId: userData.id,
      siteId: userData.site_id,
      email: userData.email
    });

    // ============================================================================
    // STEP 7: Save Integration (Using Services)
    // ============================================================================

    const tokenService = new MLTokenService();
    const integrationRepo = new MLIntegrationRepository();

    // Calculate token expiration
    const tokenExpiresAt = new Date(Date.now() + tokenData.expires_in * 1000);

    // Encrypt tokens
    const encryptedAccessToken = tokenService.encryptToken(tokenData.access_token);
    const encryptedRefreshToken = tokenService.encryptToken(tokenData.refresh_token);

    // Prepare integration data
    const integrationData = {
      user_id: oauthState.user_id,
      tenant_id: oauthState.tenant_id,
      ml_user_id: tokenData.user_id,
      ml_nickname: userData.nickname,
      ml_email: userData.email,
      ml_site_id: userData.site_id,
      access_token: encryptedAccessToken,
      refresh_token: encryptedRefreshToken,
      token_expires_at: tokenExpiresAt.toISOString(),
      scopes: tokenData.scope.split(' '),
      status: 'active' as const,
      auto_sync_enabled: true,
      sync_frequency_minutes: 60,
    };

    // Check if integration already exists
    const existingIntegration = await integrationRepo.findByUser(
      oauthState.user_id,
      oauthState.tenant_id
    );

    let integration;
    if (existingIntegration) {
      logger.info('Updating existing integration', { integrationId: existingIntegration.id });
      integration = await integrationRepo.update(existingIntegration.id, integrationData);
    } else {
      logger.info('Creating new integration');
      integration = await integrationRepo.create(integrationData);
    }

    logger.info('ML integration saved successfully', { 
      integrationId: integration.id,
      tenantId: oauthState.tenant_id,
      mlUserId: tokenData.user_id,
      nickname: userData.nickname
    });

    // ============================================================================
    // STEP 8: Trigger Initial Product Sync (Non-blocking)
    // ============================================================================

    // Trigger background sync - don't await
    fetch(new URL('/api/ml/products/sync-all', request.url).toString(), {
      method: 'POST',
      headers: {
        'Cookie': request.headers.get('cookie') || '',
      },
    }).catch(error => {
      logger.warn('Failed to trigger initial product sync', { error: error.message });
      // Don't fail OAuth flow if sync fails
    });

    logger.info('Initial product sync triggered in background');

    // ============================================================================
    // STEP 9: Clean Up OAuth State
    // ============================================================================

    await supabase
      .from('ml_oauth_states')
      .delete()
      .eq('state', state);

    logger.info('ML OAuth flow completed successfully', { 
      integrationId: integration.id,
      tenantId: oauthState.tenant_id,
      mlUserId: tokenData.user_id
    });

    // ============================================================================
    // STEP 10: Redirect to Success Page
    // ============================================================================

    return NextResponse.redirect(
      new URL('/dashboard/ml?connected=success', request.url)
    );

  } catch (error) {
    // ============================================================================
    // ERROR HANDLING
    // ============================================================================

    logger.error('ML OAuth callback failed', error instanceof Error ? error : new Error(String(error)), {
      errorType: error?.constructor?.name,
      state: state?.substring(0, 10)
    });
    
    // Handle ML API errors
    if (error instanceof MLApiError) {
      logger.error('ML API error during OAuth', { 
        statusCode: error.statusCode,
        message: error.message
      });
      return NextResponse.redirect(
        new URL(`/dashboard?ml_error=${encodeURIComponent(error.message)}`, request.url)
      );
    }
    
    // Handle OAuth-specific errors
    if (error instanceof MLOAuthError) {
      logger.error('ML OAuth error', { message: error.message });
      return NextResponse.redirect(
        new URL(`/dashboard?ml_error=${encodeURIComponent(error.message)}`, request.url)
      );
    }
    
    // Generic error handling
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.redirect(
      new URL(`/dashboard?ml_error=${encodeURIComponent(errorMessage)}`, request.url)
    );
  }
}

// ============================================================================
// METHOD NOT ALLOWED
// ============================================================================

export async function POST(): Promise<NextResponse> {
  return NextResponse.json(
    { error: 'Method not allowed. OAuth callback must use GET.' },
    { status: 405 }
  );
}
