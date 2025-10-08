/**
 * ML Items API Proxy
 * 
 * Proxies requests to ML Items API with automatic authentication
 * and token refresh. Handles rate limiting and error management.
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/utils/supabase/roles';
import { MLTokenManager } from '@/utils/mercadolivre/token-manager';

const tokenManager = new MLTokenManager();

interface MLItemsResponse {
  results: MLItem[];
  paging: {
    total: number;
    offset: number;
    limit: number;
    primary_results: number;
  };
}

interface MLItem {
  id: string;
  title: string;
  price: number;
  available_quantity: number;
  sold_quantity: number;
  condition: string;
  permalink: string;
  thumbnail: string;
  status: string;
}

interface CreateItemRequest {
  title: string;
  category_id: string;
  price: number;
  currency_id: string;
  available_quantity: number;
  buying_mode: string;
  condition: string;
  listing_type_id: string;
  description?: string;
  pictures?: Array<{ source: string }>;
  attributes?: Array<{
    id: string;
    value_name?: string;
    value_id?: string;
  }>;
  sale_terms?: Array<{
    id: string;
    value_name: string;
  }>;
}

/**
 * GET /api/ml/items - List user's items
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
    
    // Forward allowed parameters
    const allowedParams = ['offset', 'limit', 'status', 'search'];
    for (const param of allowedParams) {
      const value = url.searchParams.get(param);
      if (value) {
        searchParams.set(param, value);
      }
    }

    // Set default limit if not provided
    if (!searchParams.has('limit')) {
      searchParams.set('limit', '50');
    }

    // Make authenticated request to ML API
    const mlResponse = await tokenManager.makeMLRequest(
      integration.id,
      `/users/${integration.ml_user_id}/items?${searchParams.toString()}`
    );

    if (!mlResponse.ok) {
      const errorText = await mlResponse.text();
      console.error('ML API Error:', mlResponse.status, errorText);
      
      return NextResponse.json(
        { 
          error: 'Failed to fetch items from Mercado Livre',
          details: errorText,
          status: mlResponse.status,
        },
        { status: mlResponse.status }
      );
    }

    const data: MLItemsResponse = await mlResponse.json();
    
    // Log successful sync
    await tokenManager['logSync'](integration.id, 'products', 'success', {
      action: 'items_fetched',
      count: data.results?.length || 0,
      total: data.paging?.total || 0,
    });

    return NextResponse.json(data);

  } catch (error) {
    console.error('ML Items GET Error:', error);
    
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

/**
 * POST /api/ml/items - Create new item
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Verify authentication
    const profile = await requireRole('user');
    
    // Get ML integration
    const integration = await tokenManager.getIntegrationByTenant(profile.id);
    
    if (!integration) {
      return NextResponse.json(
        { error: 'No active ML integration found' },
        { status: 404 }
      );
    }

    // Parse and validate request body
    let itemData: CreateItemRequest;
    try {
      itemData = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    // Basic validation
    const requiredFields = ['title', 'category_id', 'price', 'currency_id', 'available_quantity', 'condition'];
    const missingFields = requiredFields.filter(field => !itemData[field as keyof CreateItemRequest]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          error: 'Missing required fields',
          missing: missingFields,
        },
        { status: 400 }
      );
    }

    // Set defaults for required ML fields
    const mlItemData = {
      ...itemData,
      buying_mode: itemData.buying_mode || 'buy_it_now',
      listing_type_id: itemData.listing_type_id || 'gold_special',
      currency_id: itemData.currency_id || 'BRL',
    };

    // Create item on ML
    const mlResponse = await tokenManager.makeMLRequest(
      integration.id,
      '/items',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mlItemData),
      }
    );

    const responseText = await mlResponse.text();
    
    if (!mlResponse.ok) {
      console.error('ML Create Item Error:', mlResponse.status, responseText);
      
      // Log failed creation
      await tokenManager['logSync'](integration.id, 'products', 'error', {
        action: 'item_create_failed',
        error: responseText,
        status_code: mlResponse.status,
      });
      
      return NextResponse.json(
        { 
          error: 'Failed to create item on Mercado Livre',
          details: responseText,
        },
        { status: mlResponse.status }
      );
    }

    const createdItem = JSON.parse(responseText);
    
    // Log successful creation
    await tokenManager['logSync'](integration.id, 'products', 'success', {
      action: 'item_created',
      item_id: createdItem.id,
      title: createdItem.title,
    });

    return NextResponse.json(createdItem, { status: 201 });

  } catch (error) {
    console.error('ML Items POST Error:', error);
    
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