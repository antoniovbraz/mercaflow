// Test Authenticated APIs using Supabase Client
// Node.js script to login and test protected endpoints
// Run: node test_auth_supabase.js

const { createClient } = require('@supabase/supabase-js');

// Configuração
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://seu-projeto.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sua-anon-key';
const BASE_URL = 'https://mercaflow.vercel.app';

// Credenciais
const EMAIL = 'peepers.shop@gmail.com';
const PASSWORD = 'vGBg9h2axG8Jt4H';

async function testAuthenticatedAPIs() {
  console.log('==========================================');
  console.log('MercaFlow Authenticated E2E Tests (Node.js)');
  console.log('==========================================\n');

  // Step 1: Login via Supabase
  console.log('Step 1: Authenticating via Supabase...');
  console.log(`  Email: ${EMAIL}\n`);

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: EMAIL,
      password: PASSWORD,
    });

    if (error) {
      console.log('  ✗ Login failed:', error.message);
      return;
    }

    if (!data.session) {
      console.log('  ✗ No session returned');
      return;
    }

    console.log('  ✓ Login successful!');
    console.log(`  Access Token: ${data.session.access_token.substring(0, 20)}...`);
    console.log('');

    // Step 2: Test Protected APIs
    console.log('Step 2: Testing Protected APIs...\n');

    const apis = [
      { path: '/api/settings', name: 'User Settings API' },
      { path: '/api/dashboard/kpis', name: 'Dashboard KPIs API' },
      { path: '/api/analytics/elasticity?days=30', name: 'Elasticity API' },
    ];

    for (const api of apis) {
      try {
        const startTime = Date.now();
        
        const response = await fetch(`${BASE_URL}${api.path}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${data.session.access_token}`,
            'Cookie': `sb-access-token=${data.session.access_token}`,
          },
        });

        const elapsed = Date.now() - startTime;

        if (response.ok) {
          const result = await response.json();
          console.log(`  ✓ ${api.name}: ${elapsed}ms`);
          
          if (result.data) {
            const dataType = Array.isArray(result.data) ? 'items' : 'fields';
            const count = Array.isArray(result.data) 
              ? result.data.length 
              : Object.keys(result.data).length;
            console.log(`    → ${count} ${dataType} returned`);
          }
        } else {
          console.log(`  ✗ ${api.name}: Status ${response.status}`);
          const errorText = await response.text();
          console.log(`    → ${errorText}`);
        }
      } catch (error) {
        console.log(`  ✗ ${api.name}: ${error.message}`);
      }
    }

    console.log('\n==========================================');
    console.log('Tests Complete!');
    console.log('==========================================');

    // Logout
    await supabase.auth.signOut();

  } catch (error) {
    console.log('  ✗ Error:', error.message);
  }
}

// Run tests
testAuthenticatedAPIs().catch(console.error);
