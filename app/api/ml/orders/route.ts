/**
 * ML Orders API Proxy
 * 
 * Proxies requests to ML Orders API with automatic authentication.
 * Handles order listing, details, and basic management operations.
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/utils/supabase/roles';
import { MLTokenManager } from '@/utils/mercadolivre/token-manager';

const tokenManager = new MLTokenManager();

interface MLOrdersResponse {
  results: MLOrder[];
  paging: {
    total: number;
    offset: number;
    limit: number;
  };
}

interface MLOrder {
  id: number;
  status: string;
  status_detail: string;
  date_created: string;
  date_closed?: string;
  order_items: Array<{
    item: {
      id: string;
      title: string;
    };
    quantity: number;
    unit_price: number;
  }>;
  total_amount: number;
  currency_id: string;
  buyer: {
    id: number;
    nickname: string;
  };
  seller: {
    id: number;
    nickname: string;
  };
  payments: Array<{
    id: number;
    status: string;
    transaction_amount: number;
  }>;
  shipping: {
    id: number;
    status: string;
  };
}

/**
 * GET /api/ml/orders - List user's orders
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Verify authentication
    const profile = await requireRole('user');
    
    // Get ML integration
    const integration = await tokenManager.getIntegrationByTenant(profile.id);
    
    if (!integration) {
      return NextResponse.json(
        { error: 'No active ML integration found. Please connect your Mercado Livre account.' },
        { status: 404 }
      );
    }

    // Parse query parameters
    const url = new URL(request.url);
    const searchParams = new URLSearchParams();
    
    // Forward allowed parameters for orders search
    const allowedParams = [
      'seller', 'buyer', 'status', 'offset', 'limit', 
      'sort', 'order.date_created.from', 'order.date_created.to'
    ];
    
    for (const param of allowedParams) {
      const value = url.searchParams.get(param);
      if (value) {
        searchParams.set(param, value);
      }
    }

    // Set seller to current user if not specified
    if (!searchParams.has('seller')) {
      searchParams.set('seller', integration.ml_user_id.toString());
    }

    // Set default limit if not provided
    if (!searchParams.has('limit')) {
      searchParams.set('limit', '50');
    }

    // Set default sort (newest first)
    if (!searchParams.has('sort')) {
      searchParams.set('sort', 'date_desc');
    }

    // Make authenticated request to ML Orders API
    const mlResponse = await tokenManager.makeMLRequest(
      integration.id,
      `/orders/search?${searchParams.toString()}`
    );

    if (!mlResponse.ok) {
      const errorText = await mlResponse.text();
      console.error('ML Orders API Error:', mlResponse.status, errorText);
      
      // Log error
      await tokenManager['logSync'](integration.id, 'orders', 'error', {
        action: 'orders_fetch_failed',
        error: errorText,
        status_code: mlResponse.status,
      });
      
      return NextResponse.json(
        { 
          error: 'Failed to fetch orders from Mercado Livre',
          details: errorText,
          status: mlResponse.status,
        },
        { status: mlResponse.status }
      );
    }

    const data: MLOrdersResponse = await mlResponse.json();
    
    // Log successful sync
    await tokenManager['logSync'](integration.id, 'orders', 'success', {
      action: 'orders_fetched',
      count: data.results?.length || 0,
      total: data.paging?.total || 0,
    });

    return NextResponse.json(data);

  } catch (error) {
    console.error('ML Orders GET Error:', error);
    
    if (error instanceof Error && error.message.includes('Insufficient role')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (error instanceof Error && error.message.includes('No valid ML token')) {
      return NextResponse.json(
        { error: 'ML token expired. Please reconnect your account.' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}