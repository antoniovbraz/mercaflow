import { logger } from '@/utils/logger';
/**
 * ML Messages API
 * 
 * Handles ML Messages functionality for chat integration between sellers and buyers.
 * Integrates with ML Messages API to fetch conversations, send messages, and manage
 * automated responses using AI-powered templates.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, createClient } from '@/utils/supabase/server';
import { MLTokenManager } from '@/utils/mercadolivre/token-manager';

const tokenManager = new MLTokenManager();

interface SyncResult {
  integration_id: string;
  resource?: string;
  pack_id?: string;
  count: number;
}

interface MessageWithIntegration {
  id: string;
  integration_id: string;
  integration_name: string;
  ml_message_id: string;
  ml_pack_id: string;
  text_content: string;
  created_at: string;
  [key: string]: string | number | boolean | null | undefined;
}

interface MLMessage {
  id: string;
  site_id: string;
  from: {
    user_id: string;
    name?: string;
    email?: string;
  };
  to: {
    user_id: string;
    name?: string;
    email?: string;
  };
  status: 'available' | 'pending' | 'blocked' | 'deleted';
  subject?: string;
  text: string;
  message_date: {
    created: string;
    received?: string;
    available?: string;
    notified?: string;
    read?: string;
  };
  message_moderation: {
    status: 'clean' | 'rejected' | 'pending' | 'non_moderated';
    reason?: string;
    source?: string;
    moderation_date?: string;
  };
  message_attachments?: Array<{
    filename: string;
    original_filename: string;
    type: string;
    size: number;
    potential_security_threat: boolean;
    creation_date: string;
  }>;
  conversation_first_message?: boolean;
}

interface MLConversation {
  paging: {
    limit: number;
    offset: number;
    total: number;
  };
  conversation_status: {
    path: string;
    status: 'active' | 'blocked' | 'closed';
    substatus?: string;
    status_date: string;
    status_update_allowed: boolean;
    claim_id?: string;
    shipping_id?: string;
  };
  messages: MLMessage[];
  seller_max_message_length?: number;
  buyer_max_message_length?: number;
}

/**
 * GET /api/ml/messages
 * 
 * Fetches messages from MercadoLivre and synchronizes with local database.
 * Supports filtering by pack_id, order_id, and unread status.
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    
    const pack_id = searchParams.get('pack_id');
    const order_id = searchParams.get('order_id');
    const unread_only = searchParams.get('unread_only') === 'true';
    const sync = searchParams.get('sync') === 'true';

    // Get user's ML integrations
    const { data: integrations, error: integrationsError } = await supabase
      .from('ml_integrations')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true);

    if (integrationsError) {
      logger.error('❌ Error fetching integrations:', integrationsError);
      return NextResponse.json({ error: 'Failed to fetch integrations' }, { status: 500 });
    }

    if (!integrations?.length) {
      return NextResponse.json({ 
        messages: [], 
        conversations: [], 
        total: 0 
      });
    }

    const allMessages: MessageWithIntegration[] = [];
    const syncResults: SyncResult[] = [];

    for (const integration of integrations) {
      try {
        // Sync messages from ML API if requested
        if (sync) {
          logger.info(`🔄 Syncing messages for integration ${integration.id}...`);
          
          if (unread_only) {
            // Get unread messages count
            const unreadRes = await tokenManager.makeMLRequest(
              integration.id,
              '/messages/unread?role=seller&tag=post_sale'
            );
            
            const unreadResponse = await unreadRes.json();

            if (unreadResponse && unreadResponse.results) {
              logger.info(`📬 Found ${unreadResponse.results.length} unread conversations`);
              
              // Fetch detailed messages for each unread conversation
              for (const result of unreadResponse.results) {
                const resourcePath = result.resource; // e.g., "/packs/123/sellers/456"
                
                try {
                  const messagesRes = await tokenManager.makeMLRequest(
                    integration.id,
                    `/messages${resourcePath}?tag=post_sale&mark_as_read=false`
                  );
                  
                  const messagesResponse = await messagesRes.json();

                  if (messagesResponse?.messages) {
                    await syncMessagesToDatabase(integration.id, messagesResponse, result.resource);
                    syncResults.push({
                      integration_id: integration.id,
                      resource: result.resource,
                      count: messagesResponse.messages.length
                    });
                  }
                } catch (resourceError) {
                  logger.error(`❌ Error fetching messages for ${resourcePath}:`, resourceError);
                }
              }
            }
          } else if (pack_id) {
            // Fetch specific pack messages
            const packRes = await tokenManager.makeMLRequest(
              integration.id,
              `/messages/packs/${pack_id}/sellers/${integration.ml_user_id}?tag=post_sale&mark_as_read=false`
            );
            
            const packResponse = await packRes.json();

            if (packResponse?.messages) {
              await syncMessagesToDatabase(integration.id, packResponse, `/packs/${pack_id}/sellers/${integration.ml_user_id}`);
              syncResults.push({
                integration_id: integration.id,
                pack_id: pack_id,
                count: packResponse.messages.length
              });
            }
          }
        }

        // Fetch messages from local database
        let query = supabase
          .from('ml_messages')
          .select('*')
          .eq('integration_id', integration.id)
          .order('created_at', { ascending: false });

        if (pack_id) {
          query = query.eq('ml_pack_id', pack_id);
        }

        if (order_id) {
          query = query.eq('ml_order_id', order_id);
        }

        if (unread_only) {
          query = query.eq('is_read', false);
        }

        const { data: messages, error: messagesError } = await query.limit(50);

        if (messagesError) {
          logger.error('❌ Error fetching messages from database:', messagesError);
          continue;
        }

        if (messages) {
          allMessages.push(...messages.map(msg => ({
            ...msg,
            integration_name: integration.integration_name
          })));
        }

      } catch (integrationError) {
        logger.error(`❌ Error processing integration ${integration.id}:`, integrationError);
        continue;
      }
    }

    // Sort messages by creation date
    allMessages.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    logger.info(`✅ Successfully fetched ${allMessages.length} messages`);
    
    return NextResponse.json({
      messages: allMessages,
      sync_results: syncResults,
      total: allMessages.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('❌ ML Messages API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/ml/messages
 * 
 * Sends a new message through MercadoLivre API and stores it locally.
 * Supports template-based responses and file attachments.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      integration_id, 
      pack_id, 
      to_user_id, 
      message_text,
      template_id,
      attachments = []
    } = body;

    if (!integration_id || !pack_id || !to_user_id || !message_text) {
      return NextResponse.json({ 
        error: 'Missing required fields: integration_id, pack_id, to_user_id, message_text' 
      }, { status: 400 });
    }

    const supabase = await createClient();

    // Verify integration belongs to user
    const { data: integration, error: integrationError } = await supabase
      .from('ml_integrations')
      .select('*')
      .eq('id', integration_id)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (integrationError || !integration) {
      return NextResponse.json({ error: 'Integration not found' }, { status: 404 });
    }

    // Prepare message payload for ML API
    const messagePayload: Record<string, string | Record<string, string> | string[]> = {
      from: {
        user_id: integration.ml_user_id
      },
      to: {
        user_id: to_user_id
      },
      text: message_text
    };

    // Add attachments if provided
    if (attachments && attachments.length > 0) {
      messagePayload.attachments = attachments;
    }

    logger.info('📤 Sending message to ML API:', { pack_id, to_user_id, text_length: message_text.length });

    // Send message through ML API
    const res = await tokenManager.makeMLRequest(
      integration.id,
      `/messages/packs/${pack_id}/sellers/${integration.ml_user_id}?tag=post_sale`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(messagePayload)
      }
    );

    if (!res.ok) {
      throw new Error(`ML API error: ${res.status} ${res.statusText}`);
    }

    const response = await res.json();
    logger.info('✅ Message sent successfully via ML API');

    // Store message in local database
    const messageData = {
      integration_id: integration.id,
      ml_message_id: response.id || `local_${Date.now()}`,
      ml_pack_id: pack_id,
      ml_order_id: null, // Will be updated when we sync full conversation
      from_user_id: integration.ml_user_id,
      from_user_name: integration.user_name || 'Seller',
      to_user_id: to_user_id,
      text_content: message_text,
      plain_text: message_text,
      status: 'available',
      moderation_status: 'pending',
      is_seller_message: true,
      is_read: true, // Seller messages are considered read
      attachments: attachments.length > 0 ? attachments : null,
      ml_date_created: new Date().toISOString()
    };

    const { data: savedMessage, error: saveError } = await supabase
      .from('ml_messages')
      .insert(messageData)
      .select()
      .single();

    if (saveError) {
      logger.error('❌ Error saving message to database:', saveError);
      // Don't fail the API call since message was sent successfully
    }

    // If template was used, update usage statistics
    if (template_id) {
      await supabase
        .from('ml_message_templates')
        .update({ 
          usage_count: supabase.rpc('increment_usage_count'),
          last_used_at: new Date().toISOString()
        })
        .eq('id', template_id)
        .eq('integration_id', integration.id);
    }

    // Log successful message send
    await tokenManager['logSync'](integration.id, 'messages', 'success', {
      action: 'message_sent',
      pack_id: pack_id,
      to_user_id: to_user_id,
      text_length: message_text.length,
      has_attachments: attachments.length > 0,
      template_used: !!template_id
    });

    logger.info('✅ Successfully sent ML message:', pack_id);
    return NextResponse.json({
      success: true,
      message: savedMessage || messageData,
      ml_response: response
    });

  } catch (error) {
    logger.error('❌ ML Messages Send Error:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}

/**
 * Synchronizes ML messages to the local database
 */
async function syncMessagesToDatabase(
  integrationId: string, 
  conversationData: MLConversation, 
  resourcePath: string
): Promise<void> {
  const supabase = await createClient();
  
  const packId = extractPackId(resourcePath);
  const messages = conversationData.messages || [];

  logger.info(`🔄 Syncing ${messages.length} messages for pack ${packId}`);

  for (const message of messages) {
    try {
      const messageData = {
        integration_id: integrationId,
        ml_message_id: message.id,
        ml_pack_id: packId,
        ml_order_id: null, // Extract from resource if available
        from_user_id: message.from.user_id,
        from_user_name: message.from.name || null,
        from_user_email: message.from.email || null,
        to_user_id: message.to.user_id,
        to_user_name: message.to.name || null,
        to_user_email: message.to.email || null,
        subject: message.subject || null,
        text_content: message.text,
        plain_text: message.text,
        status: message.status,
        moderation_status: message.message_moderation?.status || 'clean',
        moderation_reason: message.message_moderation?.reason || null,
        attachments: message.message_attachments ? JSON.stringify(message.message_attachments) : null,
        ml_date_created: message.message_date.created,
        ml_date_received: message.message_date.received || null,
        ml_date_available: message.message_date.available || null,
        ml_date_notified: message.message_date.notified || null,
        ml_date_read: message.message_date.read || null,
        is_read: !!message.message_date.read,
        is_seller_message: false, // Will be determined by comparing user IDs
        conversation_first_message: message.conversation_first_message || false
      };

      // Use upsert to handle duplicates
      const { error: upsertError } = await supabase
        .from('ml_messages')
        .upsert(messageData, {
          onConflict: 'integration_id,ml_message_id'
        });

      if (upsertError) {
        logger.error('❌ Error upserting message:', upsertError);
      }

    } catch (msgError) {
      logger.error('❌ Error processing message:', message.id, msgError);
    }
  }
}

/**
 * Extracts pack ID from resource path
 */
function extractPackId(resourcePath: string): string {
  const match = resourcePath.match(/\/packs\/(\d+)/);
  return match ? match[1] : resourcePath;
}

