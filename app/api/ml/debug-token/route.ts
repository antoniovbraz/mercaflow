/**
 * MercaFlow - ML Debug Token Endpoint
 * 
 * Returns decrypted ML access token for testing purposes
 * ONLY use in development/testing - DO NOT expose in production
 * 
 * Usage:
 * GET /api/ml/debug-token?integration_id=xxx
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { requireRole } from '@/utils/supabase/roles';
import { logger } from '@/utils/logger';
import { getMLTokenService } from '@/utils/mercadolivre/services';

const tokenService = getMLTokenService();

export async function GET(request: NextRequest) {
  try {
    // Require super_admin role for security
    const profile = await requireRole('super_admin');
    
    const { searchParams } = new URL(request.url);
    const integrationId = searchParams.get('integration_id');
    
    if (!integrationId) {
      // If no integration_id, return user's first integration
      const supabase = await createClient();
      const { data: integration, error } = await supabase
        .from('ml_integrations')
        .select('id, ml_user_id, created_at, updated_at, token_expires_at')
        .eq('user_id', profile.user_id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) {
        logger.error('Failed to fetch ML integration', { error, userId: profile.user_id });
        return NextResponse.json(
          { error: 'Failed to fetch ML integration' },
          { status: 500 }
        );
      }
      
      if (!integration) {
        return NextResponse.json(
          { 
            error: 'No ML integration found',
            message: 'Connect with Mercado Livre first at /ml/auth'
          },
          { status: 404 }
        );
      }
      
      // Get decrypted token
      const accessToken = await tokenService.getValidToken(integration.id);
      
      if (!accessToken) {
        return NextResponse.json(
          { error: 'Failed to decrypt token' },
          { status: 500 }
        );
      }
      
      // Check if token is expired
      const expiresAt = new Date(integration.token_expires_at);
      const now = new Date();
      const isExpired = expiresAt < now;
      const expiresInMinutes = Math.floor((expiresAt.getTime() - now.getTime()) / 60000);
      
      return NextResponse.json({
        success: true,
        integration: {
          id: integration.id,
          ml_user_id: integration.ml_user_id,
          created_at: integration.created_at,
          updated_at: integration.updated_at,
          expires_at: integration.token_expires_at,
          is_expired: isExpired,
          expires_in_minutes: expiresInMinutes > 0 ? expiresInMinutes : 0,
        },
        token: {
          access_token: accessToken,
          token_type: 'Bearer',
          length: accessToken.length,
          preview: `${accessToken.substring(0, 20)}...${accessToken.substring(accessToken.length - 10)}`,
        },
        usage: {
          curl_example: `curl -X GET 'https://api.mercadolibre.com/users/me' -H 'Authorization: Bearer ${accessToken}'`,
          powershell_example: `Invoke-RestMethod -Uri 'https://api.mercadolibre.com/users/me' -Headers @{Authorization='Bearer ${accessToken}'}`,
        },
      });
    }
    
    // Get specific integration
    const accessToken = await tokenService.getValidToken(integrationId);
    
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Failed to decrypt token' },
        { status: 500 }
      );
    }
    
    const supabase = await createClient();
    const { data: integration, error } = await supabase
      .from('ml_integrations')
      .select('id, ml_user_id, created_at, updated_at, token_expires_at')
      .eq('id', integrationId)
      .eq('user_id', profile.user_id)
      .single();
    
    if (error || !integration) {
      logger.error('Failed to fetch ML integration', { error, integrationId });
      return NextResponse.json(
        { error: 'ML integration not found or access denied' },
        { status: 404 }
      );
    }
    
    // Check if token is expired
    const expiresAt = new Date(integration.token_expires_at);
    const now = new Date();
    const isExpired = expiresAt < now;
    const expiresInMinutes = Math.floor((expiresAt.getTime() - now.getTime()) / 60000);
    
    return NextResponse.json({
      success: true,
      integration: {
        id: integration.id,
        ml_user_id: integration.ml_user_id,
        created_at: integration.created_at,
        updated_at: integration.updated_at,
        expires_at: integration.token_expires_at,
        is_expired: isExpired,
        expires_in_minutes: expiresInMinutes > 0 ? expiresInMinutes : 0,
      },
      token: {
        access_token: accessToken,
        token_type: 'Bearer',
        length: accessToken.length,
        preview: `${accessToken.substring(0, 20)}...${accessToken.substring(accessToken.length - 10)}`,
      },
      usage: {
        curl_example: `curl -X GET 'https://api.mercadolibre.com/users/me' -H 'Authorization: Bearer ${accessToken}'`,
        powershell_example: `Invoke-RestMethod -Uri 'https://api.mercadolibre.com/users/me' -Headers @{Authorization='Bearer ${accessToken}'}`,
      },
    });
    
  } catch (error) {
    logger.error('ML debug token endpoint error', { error });
    
    if (error instanceof Error && error.message.includes('Insufficient permissions')) {
      return NextResponse.json(
        { error: 'Super admin access required' },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to get ML token',
        details: 'Check server logs for more information'
      },
      { status: 500 }
    );
  }
}
