/**
 * ML OAuth Initiate Endpoint
 * 
 * Starts the OAuth 2.0 Authorization Code Flow with PKCE
 * Following ML's official OAuth 2.0 specification
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { requireRole } from '@/utils/supabase/roles';
import crypto from 'crypto';

interface AuthInitiateResponse {
  authUrl: string;
  state: string;
}

export async function POST(): Promise<NextResponse> {
  try {
    // Verify authentication and get user profile
    const profile = await requireRole('user');
    const supabase = await createClient();

    // Generate PKCE parameters
    const code_verifier = crypto.randomBytes(128).toString('base64url');
    const code_challenge = crypto
      .createHash('sha256')
      .update(code_verifier)
      .digest('base64url');

    // Generate unique state for CSRF protection
    const state = crypto.randomBytes(32).toString('hex');

    // Clean up any expired states
    await supabase.rpc('cleanup_expired_ml_oauth_states');

    // Store OAuth state temporarily (10 minutes expiry)
    const { error: stateError } = await supabase
      .from('ml_oauth_states')
      .insert({
        state,
        code_verifier,
        user_id: profile.user_id,
        tenant_id: profile.id,
        expires_at: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      });

    if (stateError) {
      console.error('Failed to store OAuth state:', stateError);
      return NextResponse.json(
        { error: 'Failed to initiate authentication' },
        { status: 500 }
      );
    }

    // Validate required environment variables
    const clientId = process.env.ML_CLIENT_ID;
    const redirectUri = process.env.ML_REDIRECT_URI;

    if (!clientId || !redirectUri) {
      console.error('Missing ML OAuth configuration');
      return NextResponse.json(
        { error: 'OAuth configuration not available' },
        { status: 500 }
      );
    }

    // Build authorization URL with PKCE
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      redirect_uri: redirectUri,
      state,
      code_challenge,
      code_challenge_method: 'S256',
      // Scopes for full integration
      scope: 'read write offline_access',
    });

    const authUrl = `https://auth.mercadolivre.com.br/authorization?${params.toString()}`;

    console.log(`OAuth flow initiated for tenant ${profile.id}`);

    const response: AuthInitiateResponse = {
      authUrl,
      state, // Return state for debugging (remove in production)
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('ML Auth Initiate Error:', error);
    
    if (error instanceof Error && error.message.includes('Insufficient role')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Only POST allowed
export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST.' },
    { status: 405 }
  );
}