/**
 * ML Integration Status Endpoint
 * 
 * Returns the current status of ML integration for the authenticated user
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { requireRole } from '@/utils/supabase/roles';

interface IntegrationStatus {
  hasIntegration: boolean;
  integration?: {
    id: string;
    ml_user_id: number;
    ml_nickname: string;
    ml_email?: string;
    status: string;
    token_expires_at: string;
    last_sync_at?: string;
    scopes: string[];
    auto_sync_enabled: boolean;
    product_count?: number;
    error_count?: number;
    last_log_at?: string;
  };
}

export async function GET(): Promise<NextResponse> {
  try {
    // Verify authentication
    const profile = await requireRole('user');
    const supabase = await createClient();

    // Get integration with summary data
    const { data: integration, error } = await supabase
      .from('ml_integration_summary')
      .select('*')
      .eq('tenant_id', profile.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Error fetching ML integration:', error);
      return NextResponse.json(
        { error: 'Failed to fetch integration status' },
        { status: 500 }
      );
    }

    if (!integration) {
      const response: IntegrationStatus = {
        hasIntegration: false,
      };
      return NextResponse.json(response);
    }

    // Check if token is close to expiry (within 1 hour)
    const expiresAt = new Date(integration.token_expires_at);
    const now = new Date();
    const oneHour = 60 * 60 * 1000;
    const isExpiringSoon = (expiresAt.getTime() - now.getTime()) < oneHour;

    const response: IntegrationStatus = {
      hasIntegration: true,
      integration: {
        id: integration.id,
        ml_user_id: integration.ml_user_id,
        ml_nickname: integration.ml_nickname,
        ml_email: integration.ml_email,
        status: isExpiringSoon ? 'expiring_soon' : integration.status,
        token_expires_at: integration.token_expires_at,
        last_sync_at: integration.last_sync_at,
        scopes: integration.scopes,
        auto_sync_enabled: integration.auto_sync_enabled,
        product_count: integration.product_count || 0,
        error_count: integration.error_count || 0,
        last_log_at: integration.last_log_at,
      },
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('ML Integration Status Error:', error);
    
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

// Disconnect/revoke integration
export async function DELETE(): Promise<NextResponse> {
  try {
    const profile = await requireRole('user');
    const supabase = await createClient();

    // Find and revoke integration
    const { data: integration, error: findError } = await supabase
      .from('ml_integrations')
      .select('id')
      .eq('tenant_id', profile.id)
      .eq('status', 'active')
      .single();

    if (findError || !integration) {
      return NextResponse.json(
        { error: 'No active integration found' },
        { status: 404 }
      );
    }

    // Revoke the integration
    const { error: updateError } = await supabase
      .from('ml_integrations')
      .update({
        status: 'revoked',
        updated_at: new Date().toISOString(),
      })
      .eq('id', integration.id);

    if (updateError) {
      console.error('Error revoking integration:', updateError);
      return NextResponse.json(
        { error: 'Failed to revoke integration' },
        { status: 500 }
      );
    }

    // Log the revocation
    await supabase
      .from('ml_sync_logs')
      .insert({
        integration_id: integration.id,
        sync_type: 'user_info',
        status: 'success',
        sync_data: { action: 'integration_revoked_by_user' },
        completed_at: new Date().toISOString(),
      });

    return NextResponse.json({ 
      success: true, 
      message: 'Integration revoked successfully' 
    });

  } catch (error) {
    console.error('ML Integration Revoke Error:', error);
    
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