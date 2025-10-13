/**
 * Fix Raw ML Tokens Script
 *
 * This script identifies and properly encrypts any raw ML tokens
 * that may have been stored in the database without encryption.
 *
 * Run this script once to fix existing data, then it can be removed.
 */

import { createClient } from '@/utils/supabase/server';
import { MLTokenManager } from '@/utils/mercadolivre/token-manager';

async function fixRawTokens() {
  console.log('🔧 Starting raw token fix process...');

  try {
    const supabase = await createClient();
    const tokenManager = new MLTokenManager();

    // Get all ML integrations
    const { data: integrations, error } = await supabase
      .from('ml_integrations')
      .select('*');

    if (error) {
      console.error('❌ Failed to fetch integrations:', error);
      return;
    }

    console.log(`📊 Found ${integrations?.length || 0} integrations to check`);

    let fixedCount = 0;

    for (const integration of integrations || []) {
      let needsUpdate = false;
      const updates: { access_token?: string; refresh_token?: string } = {};

      // Check access token
      if (integration.access_token && (integration.access_token.startsWith('TG-') || integration.access_token.startsWith('TG_'))) {
        console.log(`🔐 Found raw access token for integration ${integration.id}, encrypting...`);
        updates.access_token = tokenManager['encryptToken'](integration.access_token);
        needsUpdate = true;
      }

      // Check refresh token
      if (integration.refresh_token && (integration.refresh_token.startsWith('TG-') || integration.refresh_token.startsWith('TG_'))) {
        console.log(`🔐 Found raw refresh token for integration ${integration.id}, encrypting...`);
        updates.refresh_token = tokenManager['encryptToken'](integration.refresh_token);
        needsUpdate = true;
      }

      // Update if needed
      if (needsUpdate) {
        const { error: updateError } = await supabase
          .from('ml_integrations')
          .update(updates)
          .eq('id', integration.id);

        if (updateError) {
          console.error(`❌ Failed to update integration ${integration.id}:`, updateError);
        } else {
          console.log(`✅ Successfully encrypted tokens for integration ${integration.id}`);
          fixedCount++;
        }
      }
    }

    console.log(`🎉 Token fix process completed. Fixed ${fixedCount} integrations.`);

  } catch (error) {
    console.error('❌ Token fix process failed:', error);
  }
}

// Run the fix
fixRawTokens();