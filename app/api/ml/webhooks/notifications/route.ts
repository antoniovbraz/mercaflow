import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { headers } from 'next/headers';
import type { SupabaseClient } from '@supabase/supabase-js';

// Webhook notification types from Mercado Livre
interface MLWebhookNotification {
  _id: string;
  resource: string; // e.g., "/orders/123456789", "/items/MLB123456789"
  user_id: number;
  topic: 'orders' | 'items' | 'questions' | 'claims' | 'messages' | 'shipments';
  application_id: number;
  attempts: number;
  sent: string; // ISO date
  received: string; // ISO date
}

// Enhanced notification data when we fetch from the resource URL
interface ProcessedNotification extends MLWebhookNotification {
  resource_data?: Record<string, unknown>;
  processed_at: string;
  status: 'success' | 'error' | 'skipped';
  error_message?: string;
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔔 ML Webhook received');
    
    // Parse the notification
    const notification: MLWebhookNotification = await request.json();
    
    console.log('📝 Notification details:', {
      id: notification._id,
      topic: notification.topic,
      resource: notification.resource,
      user_id: notification.user_id,
      attempts: notification.attempts,
    });

    // Validate required fields
    if (!notification._id || !notification.resource || !notification.topic) {
      console.error('❌ Invalid notification format');
      return NextResponse.json(
        { error: 'Invalid notification format' },
        { status: 400 }
      );
    }

    // Get headers for potential validation
    const headersList = await headers();
    const userAgent = headersList.get('user-agent');
    
    // Log webhook source for debugging
    console.log('🌐 Webhook headers:', {
      userAgent,
      contentType: headersList.get('content-type'),
    });

    // Initialize Supabase client
    const supabase = await createClient();

    // Check if we already processed this notification (idempotency)
    const { data: existingNotification } = await supabase
      .from('ml_webhook_logs')
      .select('id')
      .eq('notification_id', notification._id)
      .single();

    if (existingNotification) {
      console.log('⚠️ Notification already processed:', notification._id);
      return NextResponse.json({ status: 'already_processed' });
    }

    // Process the notification based on topic
    const processedNotification = await processNotification(notification, supabase);

    // Log the webhook to database for audit
    await logWebhookNotification(processedNotification, supabase);

    console.log('✅ Webhook processed successfully');
    
    // ML expects a 200 response to confirm receipt
    return NextResponse.json({ 
      status: 'success',
      processed_at: new Date().toISOString(),
      notification_id: notification._id
    });

  } catch (error) {
    console.error('💥 Webhook processing error:', error);
    
    // Still return 200 to avoid ML retries for unrecoverable errors
    return NextResponse.json(
      { 
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 200 } // Return 200 to prevent ML retries
    );
  }
}

async function processNotification(
  notification: MLWebhookNotification,
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<ProcessedNotification> {
  const processed: ProcessedNotification = {
    ...notification,
    processed_at: new Date().toISOString(),
    status: 'success',
  };

  try {
    // Extract resource ID from the resource URL
    const resourceId = extractResourceId(notification.resource);
    
    console.log(`🔍 Processing ${notification.topic} notification for resource: ${resourceId}`);

    switch (notification.topic) {
      case 'orders':
        await processOrderNotification(resourceId, notification, supabase);
        break;
        
      case 'items':
        await processItemNotification(resourceId, notification, supabase);
        break;
        
      case 'questions':
        await processQuestionNotification(resourceId, notification, supabase);
        break;
        
      case 'claims':
        await processClaimNotification(resourceId, notification, supabase);
        break;
        
      default:
        console.log(`ℹ️ Unhandled topic: ${notification.topic}`);
        processed.status = 'skipped';
        processed.error_message = `Unhandled topic: ${notification.topic}`;
    }

  } catch (error) {
    console.error(`❌ Error processing ${notification.topic}:`, error);
    processed.status = 'error';
    processed.error_message = error instanceof Error ? error.message : 'Processing error';
  }

  return processed;
}

async function processOrderNotification(
  orderId: string,
  notification: MLWebhookNotification,
  supabase: Awaited<ReturnType<typeof createClient>>
) {
  console.log(`📦 Processing order notification: ${orderId}`);
  
  // Here you would typically:
  // 1. Fetch the updated order data from ML API
  // 2. Update local cache/database
  // 3. Trigger any business logic (emails, status updates, etc.)
  
  // For now, just log the event
  await supabase
    .from('ml_sync_logs')
    .insert({
      operation: 'webhook_order_update',
      resource_id: orderId,
      user_id: notification.user_id.toString(),
      success: true,
      details: {
        webhook_id: notification._id,
        resource: notification.resource,
        attempts: notification.attempts,
      },
    });
    
  console.log(`✅ Order ${orderId} webhook logged`);
}

async function processItemNotification(
  itemId: string,
  notification: MLWebhookNotification,
  supabase: Awaited<ReturnType<typeof createClient>>
) {
  console.log(`📋 Processing item notification: ${itemId}`);
  
  // Update item cache or trigger sync
  await supabase
    .from('ml_sync_logs')
    .insert({
      operation: 'webhook_item_update',
      resource_id: itemId,
      user_id: notification.user_id.toString(),
      success: true,
      details: {
        webhook_id: notification._id,
        resource: notification.resource,
        attempts: notification.attempts,
      },
    });
    
  console.log(`✅ Item ${itemId} webhook logged`);
}

async function processQuestionNotification(
  questionId: string,
  notification: MLWebhookNotification,
  supabase: Awaited<ReturnType<typeof createClient>>
) {
  console.log(`❓ Processing question notification: ${questionId}`);
  
  // Handle new questions - could trigger notifications to seller
  await supabase
    .from('ml_sync_logs')
    .insert({
      operation: 'webhook_question_received',
      resource_id: questionId,
      user_id: notification.user_id.toString(),
      success: true,
      details: {
        webhook_id: notification._id,
        resource: notification.resource,
        attempts: notification.attempts,
      },
    });
    
  console.log(`✅ Question ${questionId} webhook logged`);
}

async function processClaimNotification(
  claimId: string,
  notification: MLWebhookNotification,
  supabase: Awaited<ReturnType<typeof createClient>>
) {
  console.log(`⚠️ Processing claim notification: ${claimId}`);
  
  // Handle claims/disputes - high priority notifications
  await supabase
    .from('ml_sync_logs')
    .insert({
      operation: 'webhook_claim_update',
      resource_id: claimId,
      user_id: notification.user_id.toString(),
      success: true,
      details: {
        webhook_id: notification._id,
        resource: notification.resource,
        attempts: notification.attempts,
        priority: 'high', // Claims are high priority
      },
    });
    
  console.log(`✅ Claim ${claimId} webhook logged`);
}

async function logWebhookNotification(
  notification: ProcessedNotification,
  supabase: Awaited<ReturnType<typeof createClient>>
) {
  try {
    // Store webhook log for debugging and analytics
    await supabase
      .from('ml_webhook_logs')
      .insert({
        notification_id: notification._id,
        topic: notification.topic,
        resource: notification.resource,
        user_id: notification.user_id,
        application_id: notification.application_id,
        attempts: notification.attempts,
        sent_at: notification.sent,
        received_at: notification.received,
        processed_at: notification.processed_at,
        status: notification.status,
        error_message: notification.error_message,
        resource_data: notification.resource_data,
      });
      
    console.log('📊 Webhook logged to database');
  } catch (error) {
    console.error('❌ Failed to log webhook:', error);
    // Don't throw - logging failure shouldn't break webhook processing
  }
}

function extractResourceId(resource: string): string {
  // Extract ID from resource URLs like "/orders/123456789" or "/items/MLB123456789"
  const matches = resource.match(/\/([^\/]+)\/([^\/]+)$/);
  return matches ? matches[2] : resource;
}

// GET endpoint for webhook verification (if ML requires it)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const challenge = searchParams.get('hub.challenge');
  
  if (challenge) {
    console.log('🔍 Webhook verification challenge received');
    return new NextResponse(challenge, { status: 200 });
  }
  
  return NextResponse.json({
    status: 'ML Webhooks endpoint active',
    timestamp: new Date().toISOString(),
    supported_topics: ['orders', 'items', 'questions', 'claims'],
  });
}