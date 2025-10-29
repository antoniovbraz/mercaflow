/**
 * Test endpoint to check ML API access
 */

import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/utils/supabase/server';
import { getMLIntegrationService } from '@/utils/mercadolivre/services';

const integrationService = getMLIntegrationService();

export async function GET() {
  // PROTEÇÃO: Bloquear em produção
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Debug endpoints are disabled in production' },
      { status: 403 }
    );
  }

  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

  // Get integration
  const integration = await integrationService.getActiveTenantIntegration(user.id);

    if (!integration) {
      return NextResponse.json({ error: 'No ML integration found' }, { status: 404 });
    }

    // Test different ML API endpoints
    const tests = [
      {
        name: 'User Info',
        endpoint: `/users/${integration.ml_user_id}`,
      },
      {
        name: 'User Items',
        endpoint: `/users/${integration.ml_user_id}/items`,
      },
      {
        name: 'User Items with search',
        endpoint: `/users/${integration.ml_user_id}/items/search`,
      },
      {
        name: 'Sites',
        endpoint: '/sites/MLB',
      }
    ];

    const results = [];

    for (const test of tests) {
      try {
        console.log(`Testing ${test.name}: ${test.endpoint}`);
  const response = await integrationService.fetch(integration.id, test.endpoint);

        const result: {
          name: string;
          endpoint: string;
          status: number;
          ok: boolean;
          headers: Record<string, string>;
          data?: unknown;
          error?: string;
        } = {
          name: test.name,
          endpoint: test.endpoint,
          status: response.status,
          ok: response.ok,
          headers: Object.fromEntries(response.headers.entries()),
        };

        if (response.ok) {
          const data = await response.json();
          result.data = data;
        } else {
          const errorText = await response.text();
          result.error = errorText;
        }

        results.push(result);
      } catch (error) {
        results.push({
          name: test.name,
          endpoint: test.endpoint,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return NextResponse.json({
      integration: {
        id: integration.id,
        ml_user_id: integration.ml_user_id,
        status: integration.status,
        scopes: integration.scopes,
      },
      tests: results,
    });

  } catch (error) {
    console.error('Test error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
