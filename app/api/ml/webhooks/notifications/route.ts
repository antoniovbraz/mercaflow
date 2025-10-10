import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { MLTokenManager } from '@/utils/mercadolivre/token-manager';
import { syncProducts } from '@/utils/mercadolivre/product-sync';
import { headers } from 'next/headers';
import { 
  MLWebhookNotificationSchema,
  MLWebhookNotification,
  validateRequestBody,
  ValidationError,
  type MLWebhookTopic,
  type MLWebhookAction,
} from '@/utils/validation';

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
    
    // Validate and parse the notification using Zod
    let notification: MLWebhookNotification;
    
    try {
      notification = await validateRequestBody(MLWebhookNotificationSchema, request);
      console.log('✅ Webhook notification validated successfully');
    } catch (error) {
      if (error instanceof ValidationError) {
        console.error('❌ Webhook validation failed:', error.details);
        
        // Check if it's just an unknown topic/action - if so, log warning but accept
        const errorString = JSON.stringify(error.details);
        if (errorString.includes('Invalid option') || errorString.includes('topic') || errorString.includes('actions')) {
          console.warn('⚠️ Unknown webhook topic or action, accepting with fallback');
          
          // Get raw body to log the unknown values
          const requestClone = request.clone();
          const rawBody = await requestClone.json();
          console.warn('Original topic:', rawBody.topic);
          console.warn('Original actions:', rawBody.actions);
          
          // Use rawBody with type casting and fallback to 'items' topic
          notification = {
            ...rawBody,
            topic: 'items' as MLWebhookTopic, // Fallback to valid topic
            actions: undefined, // Clear invalid actions
          } as MLWebhookNotification;
        } else {
          // Other validation errors - reject
          return NextResponse.json(
            { 
              error: 'Invalid notification format',
              details: error.details,
            },
            { status: 400 }
          );
        }
      } else {
        throw error;
      }
    }
    
    console.log('📝 Notification details:', {
      id: notification._id || notification.id,
      topic: notification.topic,
      resource: notification.resource,
      user_id: notification.user_id,
      attempts: notification.attempts,
    });

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
    // ML can send either _id or id depending on the webhook type
    const notificationId = notification._id || notification.id;
    const { data: existingNotification } = await supabase
      .from('ml_webhook_logs')
      .select('id')
      .eq('notification_id', notificationId)
      .maybeSingle(); // Use maybeSingle() to allow 0 or 1 results (fixes 406 error)

    if (existingNotification) {
      console.log('⚠️ Notification already processed:', notificationId);
      return NextResponse.json({ status: 'already_processed' });
    }

    // Process the notification based on topic
    const processedNotification = await processNotification(notification, supabase);

    // Log the webhook to database for audit
    await logWebhookNotification(processedNotification);

    console.log('✅ Webhook processed successfully');
    
    // ML expects a 200 response to confirm receipt
    return NextResponse.json({ 
      status: 'success',
      processed_at: new Date().toISOString(),
      notification_id: notificationId
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
      // Orders & Sales
      case 'orders':
      case 'orders_v2':
        await processOrderNotification(resourceId, notification, supabase);
        break;
      case 'orders_feedback':
        await processOrdersFeedbackNotification(resourceId, notification, supabase);
        break;
        
      // Messages & Communication (structured with actions)
      case 'messages':
        await processMessagesNotification(resourceId, notification, supabase);
        break;
        
      // Items & Catalog
      case 'items':
        await processItemNotification(resourceId, notification, supabase);
        break;
      case 'price_suggestion':
        await processPriceSuggestionNotification(resourceId, notification, supabase);
        break;
      case 'quotations':
        await processQuotationsNotification(resourceId, notification, supabase);
        break;
      case 'items_prices':
        await processItemsPricesNotification(resourceId, notification, supabase);
        break;
      case 'stock_locations':
        await processStockLocationsNotification(resourceId, notification, supabase);
        break;
      case 'user_products_families':
        await processUserProductsFamiliesNotification(resourceId, notification, supabase);
        break;
      case 'catalog_item_competition':
        await processCatalogCompetitionNotification(resourceId, notification, supabase);
        break;
      case 'catalog_suggestions':
        await processCatalogSuggestionsNotification(resourceId, notification, supabase);
        break;
        
      // Shipments & Logistics
      case 'shipments':
        await processShipmentsNotification(resourceId, notification, supabase);
        break;
      case 'fbm_stock_operations':
        await processFbmStockNotification(resourceId, notification, supabase);
        break;
      case 'flex_handshakes':
        await processFlexHandshakesNotification(resourceId, notification, supabase);
        break;
        
      // Promotions
      case 'public_offers':
        await processPublicOffersNotification(resourceId, notification, supabase);
        break;
      case 'public_candidates':
        await processPublicCandidatesNotification(resourceId, notification, supabase);
        break;
        
      // VIS Leads (Real Estate/Motors) - structured with actions
      case 'vis_leads':
        await processVisLeadsNotification(resourceId, notification, supabase);
        break;
        
      // Post Purchase - structured with actions  
      case 'post_purchase':
        await processPostPurchaseNotification(resourceId, notification, supabase);
        break;
        
      // Questions & Claims
      case 'questions':
        await processQuestionNotification(resourceId, notification, supabase);
        break;
      case 'claims':
        await processClaimNotification(resourceId, notification, supabase);
        break;
        
      // Payments & Finance
      case 'payments':
        await processPaymentsNotification(resourceId, notification, supabase);
        break;
      case 'invoices':
        await processInvoicesNotification(resourceId, notification, supabase);
        break;
      case 'leads_credits':
        await processLeadsCreditsNotification(resourceId, notification, supabase);
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

  try {
    // Find the integration for this user
    const { data: integration } = await supabase
      .from('ml_integrations')
      .select('id, tenant_id')
      .eq('ml_user_id', notification.user_id.toString())
      .eq('status', 'active')
      .maybeSingle(); // Use maybeSingle() to allow 0 results without 406 error

    if (!integration) {
      console.log(`⚠️ No active integration found for ML user ${notification.user_id}`);
      return;
    }

    // Fetch updated item data from ML
    const tokenManager = new MLTokenManager();
    const mlResponse = await tokenManager.makeMLRequest(
      integration.id,
      `/items/${itemId}`
    );

    if (!mlResponse.ok) {
      console.error(`❌ Failed to fetch item ${itemId} from ML:`, mlResponse.status);
      return;
    }

    const itemData = await mlResponse.json();

    // Convert to product format and sync
    const mlProducts = [{
      id: itemData.id,
      title: itemData.title,
      price: itemData.price,
      available_quantity: itemData.available_quantity,
      sold_quantity: itemData.sold_quantity,
      condition: itemData.condition,
      permalink: itemData.permalink,
      thumbnail: itemData.thumbnail,
      status: itemData.status,
      category_id: itemData.category_id || '',
      currency_id: itemData.currency_id || 'BRL',
      buying_mode: itemData.buying_mode || 'buy_it_now',
      listing_type_id: itemData.listing_type_id || 'gold_special',
      start_time: itemData.start_time || new Date().toISOString(),
      tags: itemData.tags || [],
      automatic_relist: itemData.automatic_relist || false,
      date_created: itemData.date_created || new Date().toISOString(),
      last_updated: itemData.last_updated || new Date().toISOString(),
      channels: itemData.channels || []
    }];

    const syncResult = await syncProducts(supabase, integration.id, mlProducts);
    console.log(`✅ Item ${itemId} synced via webhook:`, syncResult);

    // Log the webhook processing
    await supabase
      .from('ml_sync_logs')
      .insert({
        operation: 'webhook_item_sync',
        resource_id: itemId,
        user_id: notification.user_id.toString(),
        success: syncResult.failed === 0,
        details: {
          webhook_id: notification._id,
          resource: notification.resource,
          attempts: notification.attempts,
          synced: syncResult.synced,
          failed: syncResult.failed,
        },
      });

  } catch (error) {
    console.error(`❌ Error syncing item ${itemId} via webhook:`, error);

    // Still log the webhook even if sync failed
    await supabase
      .from('ml_sync_logs')
      .insert({
        operation: 'webhook_item_sync_failed',
        resource_id: itemId,
        user_id: notification.user_id.toString(),
        success: false,
        details: {
          webhook_id: notification._id,
          resource: notification.resource,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
  }
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
  notification: ProcessedNotification
) {
  // For webhook logging, always use service role since webhooks are external requests
  return await logWithServiceRole(notification);
}

async function logWithServiceRole(notification: ProcessedNotification) {
  try {
    const { createServiceClient } = await import('@/utils/supabase/server');
    
    // Create service role client for webhook logging
    const serviceSupabase = await createServiceClient();
    
    const { data, error } = await serviceSupabase
      .from('ml_webhook_logs')
      .insert({
        notification_id: notification._id || notification.id,
        topic: notification.topic,
        resource: notification.resource,
        user_id: notification.user_id,
        application_id: notification.application_id || null,
        attempts: notification.attempts,
        sent_at: notification.sent || new Date().toISOString(),
        received_at: notification.received || new Date().toISOString(),
        processed_at: notification.processed_at,
        status: notification.status,
        error_message: notification.error_message || null,
        resource_data: notification.resource_data || null,
        actions: notification.actions || null,
        priority: determinePriority(notification.topic, notification.actions),
        subtopic: determineSubtopic(notification.topic, notification.actions),
      })
      .select();

    if (error) {
      console.error('❌ Service role webhook logging failed:', error);
      return null;
    }

    console.log('📊 Webhook logged with service role');
    return data;
  } catch (error) {
    console.error('❌ Service role logging error:', error);
    return null;
  }
}

function extractResourceId(resource: string): string {
  // Extract ID from resource URLs like "/orders/123456789" or "/items/MLB123456789"
  const matches = resource.match(/\/([^\/]+)\/([^\/]+)$/);
  return matches ? matches[2] : resource;
}

function determinePriority(topic: MLWebhookTopic, actions?: MLWebhookAction[]): string {
  // High priority webhooks that require immediate attention
  const highPriorityTopics = [
    'payments', 'orders_v2', 'claims', 'post_purchase', 
    'shipments', 'invoices'
  ];
  
  const criticalActions = [
    'claims_actions', 'contact_request', 'reservation', 'visit_request'
  ];
  
  if (highPriorityTopics.includes(topic)) {
    return 'high';
  }
  
  if (actions && actions.some(action => criticalActions.includes(action))) {
    return 'critical';
  }
  
  // Medium priority - business relevant but not urgent
  const mediumPriorityTopics = [
    'questions', 'messages', 'items', 'price_suggestion', 'public_offers'
  ];
  
  if (mediumPriorityTopics.includes(topic)) {
    return 'normal';
  }
  
  return 'low'; // Analytics, catalog suggestions, etc.
}

function determineSubtopic(topic: MLWebhookTopic, actions?: MLWebhookAction[]): string | null {
  if (!actions || actions.length === 0) {
    return null;
  }
  
  // For structured webhooks, use the first action as subtopic
  const action = actions[0];
  
  switch (topic) {
    case 'messages':
      return `message_${action}`; // message_created, message_read
    case 'vis_leads':
      return `lead_${action}`; // lead_whatsapp, lead_call, lead_question, etc.
    case 'post_purchase':
      return `purchase_${action}`; // purchase_claims, purchase_claims_actions
    default:
      return action;
  }
}

// ===== Additional Webhook Processors =====

async function processOrdersFeedbackNotification(
  resourceId: string,
  notification: MLWebhookNotification,
  supabase: Awaited<ReturnType<typeof createClient>>
) {
  console.log(`⭐ Processing orders feedback notification: ${resourceId}`);
  
  await supabase
    .from('ml_sync_logs')
    .insert({
      operation: 'webhook_orders_feedback',
      resource_id: resourceId,
      user_id: notification.user_id.toString(),
      success: true,
      details: {
        webhook_id: notification._id || notification.id,
        resource: notification.resource,
        attempts: notification.attempts,
      },
    });
}

async function processMessagesNotification(
  resourceId: string,
  notification: MLWebhookNotification,
  supabase: Awaited<ReturnType<typeof createClient>>
) {
  const action = notification.actions?.[0] || 'unknown';
  console.log(`💬 Processing messages notification: ${resourceId}, action: ${action}`);
  
  await supabase
    .from('ml_sync_logs')
    .insert({
      operation: `webhook_message_${action}`,
      resource_id: resourceId,
      user_id: notification.user_id.toString(),
      success: true,
      details: {
        webhook_id: notification._id || notification.id,
        resource: notification.resource,
        attempts: notification.attempts,
        actions: notification.actions,
      },
    });
}

async function processPriceSuggestionNotification(
  resourceId: string,
  notification: MLWebhookNotification,
  supabase: Awaited<ReturnType<typeof createClient>>
) {
  console.log(`💰 Processing price suggestion notification: ${resourceId}`);
  
  await supabase
    .from('ml_sync_logs')
    .insert({
      operation: 'webhook_price_suggestion',
      resource_id: resourceId,
      user_id: notification.user_id.toString(),
      success: true,
      details: {
        webhook_id: notification._id || notification.id,
        resource: notification.resource,
        attempts: notification.attempts,
      },
    });
}

async function processQuotationsNotification(
  resourceId: string,
  notification: MLWebhookNotification,
  supabase: Awaited<ReturnType<typeof createClient>>
) {
  console.log(`🏠 Processing quotations notification: ${resourceId}`);
  
  await supabase
    .from('ml_sync_logs')
    .insert({
      operation: 'webhook_quotations',
      resource_id: resourceId,
      user_id: notification.user_id.toString(),
      success: true,
      details: {
        webhook_id: notification._id || notification.id,
        resource: notification.resource,
        attempts: notification.attempts,
      },
    });
}

async function processItemsPricesNotification(
  resourceId: string,
  notification: MLWebhookNotification,
  supabase: Awaited<ReturnType<typeof createClient>>
) {
  console.log(`🏷️ Processing items prices notification: ${resourceId}`);
  
  await supabase
    .from('ml_sync_logs')
    .insert({
      operation: 'webhook_items_prices',
      resource_id: resourceId,
      user_id: notification.user_id.toString(),
      success: true,
      details: {
        webhook_id: notification._id || notification.id,
        resource: notification.resource,
        attempts: notification.attempts,
      },
    });
}

async function processStockLocationsNotification(
  resourceId: string,
  notification: MLWebhookNotification,
  supabase: Awaited<ReturnType<typeof createClient>>
) {
  console.log(`📦 Processing stock locations notification: ${resourceId}`);
  
  await supabase
    .from('ml_sync_logs')
    .insert({
      operation: 'webhook_stock_locations',
      resource_id: resourceId,
      user_id: notification.user_id.toString(),
      success: true,
      details: {
        webhook_id: notification._id || notification.id,
        resource: notification.resource,
        attempts: notification.attempts,
      },
    });
}

async function processUserProductsFamiliesNotification(
  resourceId: string,
  notification: MLWebhookNotification,
  supabase: Awaited<ReturnType<typeof createClient>>
) {
  console.log(`👪 Processing user products families notification: ${resourceId}`);
  
  await supabase
    .from('ml_sync_logs')
    .insert({
      operation: 'webhook_user_products_families',
      resource_id: resourceId,
      user_id: notification.user_id.toString(),
      success: true,
      details: {
        webhook_id: notification._id || notification.id,
        resource: notification.resource,
        attempts: notification.attempts,
      },
    });
}

async function processCatalogCompetitionNotification(
  resourceId: string,
  notification: MLWebhookNotification,
  supabase: Awaited<ReturnType<typeof createClient>>
) {
  console.log(`🏆 Processing catalog competition notification: ${resourceId}`);
  
  await supabase
    .from('ml_sync_logs')
    .insert({
      operation: 'webhook_catalog_competition',
      resource_id: resourceId,
      user_id: notification.user_id.toString(),
      success: true,
      details: {
        webhook_id: notification._id || notification.id,
        resource: notification.resource,
        attempts: notification.attempts,
      },
    });
}

async function processCatalogSuggestionsNotification(
  resourceId: string,
  notification: MLWebhookNotification,
  supabase: Awaited<ReturnType<typeof createClient>>
) {
  console.log(`💡 Processing catalog suggestions notification: ${resourceId}`);
  
  await supabase
    .from('ml_sync_logs')
    .insert({
      operation: 'webhook_catalog_suggestions',
      resource_id: resourceId,
      user_id: notification.user_id.toString(),
      success: true,
      details: {
        webhook_id: notification._id || notification.id,
        resource: notification.resource,
        attempts: notification.attempts,
      },
    });
}

async function processShipmentsNotification(
  resourceId: string,
  notification: MLWebhookNotification,
  supabase: Awaited<ReturnType<typeof createClient>>
) {
  console.log(`🚚 Processing shipments notification: ${resourceId}`);
  
  await supabase
    .from('ml_sync_logs')
    .insert({
      operation: 'webhook_shipments',
      resource_id: resourceId,
      user_id: notification.user_id.toString(),
      success: true,
      details: {
        webhook_id: notification._id || notification.id,
        resource: notification.resource,
        attempts: notification.attempts,
      },
    });
}

async function processFbmStockNotification(
  resourceId: string,
  notification: MLWebhookNotification,
  supabase: Awaited<ReturnType<typeof createClient>>
) {
  console.log(`📋 Processing FBM stock operations notification: ${resourceId}`);
  
  await supabase
    .from('ml_sync_logs')
    .insert({
      operation: 'webhook_fbm_stock_operations',
      resource_id: resourceId,
      user_id: notification.user_id.toString(),
      success: true,
      details: {
        webhook_id: notification._id || notification.id,
        resource: notification.resource,
        attempts: notification.attempts,
      },
    });
}

async function processFlexHandshakesNotification(
  resourceId: string,
  notification: MLWebhookNotification,
  supabase: Awaited<ReturnType<typeof createClient>>
) {
  console.log(`🤝 Processing flex handshakes notification: ${resourceId}`);
  
  await supabase
    .from('ml_sync_logs')
    .insert({
      operation: 'webhook_flex_handshakes',
      resource_id: resourceId,
      user_id: notification.user_id.toString(),
      success: true,
      details: {
        webhook_id: notification._id || notification.id,
        resource: notification.resource,
        attempts: notification.attempts,
      },
    });
}

async function processPublicOffersNotification(
  resourceId: string,
  notification: MLWebhookNotification,
  supabase: Awaited<ReturnType<typeof createClient>>
) {
  console.log(`🎯 Processing public offers notification: ${resourceId}`);
  
  await supabase
    .from('ml_sync_logs')
    .insert({
      operation: 'webhook_public_offers',
      resource_id: resourceId,
      user_id: notification.user_id.toString(),
      success: true,
      details: {
        webhook_id: notification._id || notification.id,
        resource: notification.resource,
        attempts: notification.attempts,
      },
    });
}

async function processPublicCandidatesNotification(
  resourceId: string,
  notification: MLWebhookNotification,
  supabase: Awaited<ReturnType<typeof createClient>>
) {
  console.log(`🎪 Processing public candidates notification: ${resourceId}`);
  
  await supabase
    .from('ml_sync_logs')
    .insert({
      operation: 'webhook_public_candidates',
      resource_id: resourceId,
      user_id: notification.user_id.toString(),
      success: true,
      details: {
        webhook_id: notification._id || notification.id,
        resource: notification.resource,
        attempts: notification.attempts,
      },
    });
}

async function processVisLeadsNotification(
  resourceId: string,
  notification: MLWebhookNotification,
  supabase: Awaited<ReturnType<typeof createClient>>
) {
  const action = notification.actions?.[0] || 'unknown';
  console.log(`🏢 Processing VIS leads notification: ${resourceId}, action: ${action}`);
  
  await supabase
    .from('ml_sync_logs')
    .insert({
      operation: `webhook_vis_leads_${action}`,
      resource_id: resourceId,
      user_id: notification.user_id.toString(),
      success: true,
      details: {
        webhook_id: notification._id || notification.id,
        resource: notification.resource,
        attempts: notification.attempts,
        actions: notification.actions,
        priority: ['contact_request', 'reservation', 'visit_request'].includes(action) ? 'high' : 'normal',
      },
    });
}

async function processPostPurchaseNotification(
  resourceId: string,
  notification: MLWebhookNotification,
  supabase: Awaited<ReturnType<typeof createClient>>
) {
  const action = notification.actions?.[0] || 'unknown';
  console.log(`📦 Processing post purchase notification: ${resourceId}, action: ${action}`);
  
  await supabase
    .from('ml_sync_logs')
    .insert({
      operation: `webhook_post_purchase_${action}`,
      resource_id: resourceId,
      user_id: notification.user_id.toString(),
      success: true,
      details: {
        webhook_id: notification._id || notification.id,
        resource: notification.resource,
        attempts: notification.attempts,
        actions: notification.actions,
        priority: 'high', // Post-purchase issues are high priority
      },
    });
}

async function processPaymentsNotification(
  resourceId: string,
  notification: MLWebhookNotification,
  supabase: Awaited<ReturnType<typeof createClient>>
) {
  console.log(`💳 Processing payments notification: ${resourceId}`);
  
  await supabase
    .from('ml_sync_logs')
    .insert({
      operation: 'webhook_payments',
      resource_id: resourceId,
      user_id: notification.user_id.toString(),
      success: true,
      details: {
        webhook_id: notification._id || notification.id,
        resource: notification.resource,
        attempts: notification.attempts,
        priority: 'high', // Payment events are high priority
      },
    });
}

async function processInvoicesNotification(
  resourceId: string,
  notification: MLWebhookNotification,
  supabase: Awaited<ReturnType<typeof createClient>>
) {
  console.log(`📄 Processing invoices notification: ${resourceId}`);
  
  await supabase
    .from('ml_sync_logs')
    .insert({
      operation: 'webhook_invoices',
      resource_id: resourceId,
      user_id: notification.user_id.toString(),
      success: true,
      details: {
        webhook_id: notification._id || notification.id,
        resource: notification.resource,
        attempts: notification.attempts,
      },
    });
}

async function processLeadsCreditsNotification(
  resourceId: string,
  notification: MLWebhookNotification,
  supabase: Awaited<ReturnType<typeof createClient>>
) {
  console.log(`💰 Processing leads credits notification: ${resourceId}`);
  
  await supabase
    .from('ml_sync_logs')
    .insert({
      operation: 'webhook_leads_credits',
      resource_id: resourceId,
      user_id: notification.user_id.toString(),
      success: true,
      details: {
        webhook_id: notification._id || notification.id,
        resource: notification.resource,
        attempts: notification.attempts,
      },
    });
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
    supported_topics: [
      // Orders & Sales
      'orders', 'orders_v2', 'orders_feedback',
      // Messages & Communication
      'messages', 
      // Items & Catalog
      'items', 'price_suggestion', 'quotations', 'items_prices', 
      'stock_locations', 'user_products_families', 'catalog_item_competition', 'catalog_suggestions',
      // Shipments & Logistics  
      'shipments', 'fbm_stock_operations', 'flex_handshakes',
      // Promotions
      'public_offers', 'public_candidates',
      // VIS Leads
      'vis_leads',
      // Post Purchase
      'post_purchase', 
      // Questions & Claims
      'questions', 'claims',
      // Payments & Finance
      'payments', 'invoices', 'leads_credits'
    ],
  });
}