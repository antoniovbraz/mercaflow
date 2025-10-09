/**
 * ML Integration Status Endpoint
 * 
 * Returns the current status of ML integration for the authenticated user
 */

import { NextResponse } from 'next/server';
import { createClient, getCurrentUser } from '@/utils/supabase/server';

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
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const supabase = await createClient();
    
    // Get user profile to determine correct tenant_id
    const { data: profile } = await supabase
      .from('profiles')
      .select('tenant_id')
      .eq('id', user.id)
      .single();
      
    const tenantId = profile?.tenant_id || user.id;
    
    // Get integration with summary data (only active ones)
    const { data: integration, error } = await supabase
      .from('ml_integration_summary')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('status', 'active') // Only fetch active integrations
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
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const supabase = await createClient();
    
    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    // Use consistent tenant_id logic (same as GET method)
    const tenantId = profile.tenant_id || user.id;
    
    // Find and revoke integration
    const { data: integration, error: findError } = await supabase
      .from('ml_integrations')
      .select('id')
      .eq('tenant_id', tenantId)
      .eq('status', 'active')
      .single();

    if (findError || !integration) {
      return NextResponse.json(
        { error: 'No active integration found' },
        { status: 404 }
      );
    }

    // Delete the integration completely (safer than just revoking)
    const { error: deleteError } = await supabase
      .from('ml_integrations')
      .delete()
      .eq('id', integration.id);

    if (deleteError) {
      console.error('Error deleting integration:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete integration' },
        { status: 500 }
      );
    }

    // Log the deletion
    await supabase
      .from('ml_sync_logs')
      .insert({
        integration_id: integration.id,
        sync_type: 'user_info',
        status: 'success',
        sync_data: { action: 'integration_deleted_by_user' },
        completed_at: new Date().toISOString(),
      });

    return NextResponse.json({ 
      success: true, 
      message: 'Integration deleted successfully' 
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