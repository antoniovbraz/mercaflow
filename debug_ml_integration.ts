/**
 * Debug script to check ML integration status
 */

import { createClient } from '@/utils/supabase/server';
import { MLTokenManager } from '@/utils/mercadolivre/token-manager';

async function debugMLIntegration() {
  try {
    const supabase = await createClient();
    const tokenManager = new MLTokenManager();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.log('No authenticated user');
      return;
    }

    console.log('User ID:', user.id);

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    console.log('Profile:', profile);

    const tenantId = profile?.tenant_id || user.id;
    console.log('Tenant ID:', tenantId);

    // Check ML integrations
    const { data: integrations } = await supabase
      .from('ml_integrations')
      .select('*')
      .eq('tenant_id', tenantId);

    console.log('ML Integrations:', integrations);

    if (integrations && integrations.length > 0) {
      for (const integration of integrations) {
        console.log('Testing integration:', integration.id);
        try {
          const testIntegration = await tokenManager.getIntegrationByTenant(tenantId);
          console.log('Token manager integration:', testIntegration);
        } catch (error) {
          console.error('Token manager error:', error);
        }
      }
    }

  } catch (error) {
    console.error('Debug error:', error);
  }
}

debugMLIntegration();