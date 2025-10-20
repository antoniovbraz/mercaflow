/**
 * ML Webhooks Endpoint
 * 
 * Receives webhook notifications from Mercado Livre
 * and processes them asynchronously for cache invalidation
 * and data synchronization.
 * 
 * @security Uses service role for webhook inserts (ML doesn't send auth)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { logger } from '@/utils/logger';

// Webhook payload type
interface WebhookPayload {
  topic: string;
  resource: string;
  user_id: string;
  application_id: string;
  sent?: string | number | Date;
  received?: string | number | Date;
  [key: string]: unknown;
}

/**
 * POST /api/ml/webhooks - Receive webhook notifications from ML
 * 
 * CRITICAL: Must return HTTP 200 in < 500ms or ML will retry
 * Process webhook asynchronously to meet this requirement
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();
  
  try {
    // Parse webhook payload
    const webhook = await request.json();
    
    // Validate webhook structure
    if (!webhook.resource || !webhook.topic || !webhook.user_id) {
      logger.warn('Invalid webhook payload received', { webhook });
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    // Log webhook receipt
    logger.info('🔔 ML Webhook received', {
      topic: webhook.topic,
      resource: webhook.resource,
      userId: webhook.user_id,
      attempts: webhook.attempts || 1,
    });

    // Return 200 immediately (ML requirement: < 500ms)
    const response = NextResponse.json(
      { received: true, timestamp: new Date().toISOString() },
      { status: 200 }
    );

    // Process webhook asynchronously (don't await)
    processWebhookAsync(webhook).catch(error => {
      logger.error('Webhook async processing failed', error, { webhook });
    });

    const processingTime = Date.now() - startTime;
    logger.debug('Webhook response sent', { processingTime, webhook: webhook.topic });

    return response;

  } catch (error) {
    const processingTime = Date.now() - startTime;
    logger.error('Webhook POST error', error, { processingTime });
    
    // Still return 200 to avoid retry storm
    return NextResponse.json(
      { received: true, error: 'Processing error' },
      { status: 200 }
    );
  }
}

/**
 * Process webhook asynchronously (non-blocking)
 */
async function processWebhookAsync(webhook: WebhookPayload): Promise<void> {
  try {
    // Use service role client for webhook logging (no auth context)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    const supabase = createServiceClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Save webhook to database (matching actual schema)
    const { error: insertError } = await supabase
      .from('ml_webhook_logs')
      .insert({
        topic: webhook.topic,
        resource: webhook.resource,
        user_id: parseInt(webhook.user_id) || 0,
        application_id: parseInt(webhook.application_id) || 0,
        payload: webhook, // Store full webhook as JSONB
        received_at: new Date().toISOString(),
        attempts: (typeof webhook.attempts === 'number' ? webhook.attempts : 1),
        processed: false, // Will be updated after processing
        retry_count: (typeof webhook.attempts === 'number' ? webhook.attempts - 1 : 0),
      });

    if (insertError) {
      logger.error('Failed to save webhook to database', {
        error: insertError.message,
        details: insertError.details,
        hint: insertError.hint,
        code: insertError.code,
        webhook,
      });
    } else {
      logger.info('✅ Webhook saved to database', {
        topic: webhook.topic,
        resource: webhook.resource,
      });
    }

    // TODO: Invalidate cache based on webhook topic
    await invalidateCache(webhook);

  } catch (error) {
    logger.error('Webhook async processing error', error);
    throw error;
  }
}

/**
 * Invalidate cache based on webhook topic
 * TODO: Implement Redis cache invalidation
 */
async function invalidateCache(webhook: WebhookPayload): Promise<void> {
  // Implementation will use Redis commands:
  // - items: del ml:items:{item_id}
  // - orders: del ml:orders:*
  // - questions: del ml:questions:*
  // For now, just log
  logger.debug('Cache invalidation triggered', {
    topic: webhook.topic,
    resource: webhook.resource,
  });
}

/**
 * GET /api/ml/webhooks - List webhook logs (authenticated)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    // Buscar profile e tenant
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('tenant_id')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Profile não encontrado' },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const topic = searchParams.get('topic');
    const status = searchParams.get('status');

    let query = supabase
      .from('ml_webhook_logs')
      .select(`
        id,
        topic,
        resource,
        user_id,
        application_id,
        received_at,
        processed_at,
        status,
        error_message,
        payload,
        retry_count,
        processing_duration_ms,
        created_at
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Filter by topic if specified
    if (topic) {
      query = query.eq('topic', topic);
    }

    // Filter by status if specified
    if (status) {
      query = query.eq('status', status);
    }

    const { data: webhooks, error: webhooksError } = await query;

    if (webhooksError) {
      console.error('Error fetching webhooks:', webhooksError);
      return NextResponse.json(
        { error: 'Erro ao buscar webhooks' },
        { status: 500 }
      );
    }

    // Get count for pagination
    const { count } = await supabase
      .from('ml_webhook_logs')
      .select('*', { count: 'exact', head: true });

    return NextResponse.json({
      webhooks: webhooks || [],
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit
      }
    });

  } catch (error) {
    console.error('Erro na API webhooks:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
