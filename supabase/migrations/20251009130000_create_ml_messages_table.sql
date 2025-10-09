-- Create ML Messages tables for chat functionality
-- 
-- This migration creates the necessary database structure for the MercadoLivre Messages API integration,
-- enabling sellers to manage conversations with buyers through a centralized chat system.

-- Create ml_messages table for storing message conversations
CREATE TABLE IF NOT EXISTS ml_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    integration_id UUID NOT NULL REFERENCES ml_integrations(id) ON DELETE CASCADE,
    
    -- ML API message data
    ml_message_id TEXT NOT NULL,
    ml_pack_id TEXT NOT NULL,
    ml_order_id TEXT,
    
    -- Message participants
    from_user_id TEXT NOT NULL,
    from_user_name TEXT,
    from_user_email TEXT,
    to_user_id TEXT NOT NULL,
    to_user_name TEXT,
    to_user_email TEXT,
    
    -- Message content
    subject TEXT,
    text_content TEXT NOT NULL,
    plain_text TEXT,
    
    -- Message status and moderation
    status TEXT NOT NULL DEFAULT 'pending',
    moderation_status TEXT DEFAULT 'clean',
    moderation_reason TEXT,
    
    -- Message attachments (JSON array of attachment info)
    attachments JSONB,
    
    -- Timestamps from ML API
    ml_date_created TIMESTAMP WITH TIME ZONE,
    ml_date_received TIMESTAMP WITH TIME ZONE,
    ml_date_available TIMESTAMP WITH TIME ZONE,
    ml_date_notified TIMESTAMP WITH TIME ZONE,
    ml_date_read TIMESTAMP WITH TIME ZONE,
    
    -- Local management
    is_read BOOLEAN DEFAULT FALSE,
    is_seller_message BOOLEAN DEFAULT FALSE,
    conversation_first_message BOOLEAN DEFAULT FALSE,
    
    -- Standard fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    -- Ensure unique ML message per integration
    UNIQUE(integration_id, ml_message_id)
);

-- Create ml_message_templates table for automated responses
CREATE TABLE IF NOT EXISTS ml_message_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    integration_id UUID NOT NULL REFERENCES ml_integrations(id) ON DELETE CASCADE,
    
    -- Template information
    name TEXT NOT NULL,
    content TEXT NOT NULL,
    
    -- Auto-response triggers
    keywords TEXT[] DEFAULT '{}',
    trigger_conditions JSONB DEFAULT '{}',
    
    -- Usage tracking
    usage_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMP WITH TIME ZONE,
    
    -- Template settings
    is_active BOOLEAN DEFAULT TRUE,
    priority INTEGER DEFAULT 1,
    
    -- Standard fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    -- Ensure unique template name per integration
    UNIQUE(integration_id, name)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_ml_messages_integration_id ON ml_messages(integration_id);
CREATE INDEX IF NOT EXISTS idx_ml_messages_pack_id ON ml_messages(ml_pack_id);
CREATE INDEX IF NOT EXISTS idx_ml_messages_order_id ON ml_messages(ml_order_id);
CREATE INDEX IF NOT EXISTS idx_ml_messages_status ON ml_messages(status);
CREATE INDEX IF NOT EXISTS idx_ml_messages_is_read ON ml_messages(is_read);
CREATE INDEX IF NOT EXISTS idx_ml_messages_created_at ON ml_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_ml_messages_from_user ON ml_messages(from_user_id);
CREATE INDEX IF NOT EXISTS idx_ml_messages_to_user ON ml_messages(to_user_id);

CREATE INDEX IF NOT EXISTS idx_ml_message_templates_integration_id ON ml_message_templates(integration_id);
CREATE INDEX IF NOT EXISTS idx_ml_message_templates_is_active ON ml_message_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_ml_message_templates_keywords ON ml_message_templates USING GIN(keywords);

-- Enable RLS (Row Level Security)
ALTER TABLE ml_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ml_message_templates ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for ml_messages
CREATE POLICY "Users can view messages from their integrations"
    ON ml_messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM ml_integrations mi
            WHERE mi.id = ml_messages.integration_id
            AND mi.user_id = (auth.jwt() ->> 'sub')::uuid
        )
    );

CREATE POLICY "Users can insert messages to their integrations"
    ON ml_messages FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM ml_integrations mi
            WHERE mi.id = ml_messages.integration_id
            AND mi.user_id = (auth.jwt() ->> 'sub')::uuid
        )
    );

CREATE POLICY "Users can update messages in their integrations"
    ON ml_messages FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM ml_integrations mi
            WHERE mi.id = ml_messages.integration_id
            AND mi.user_id = (auth.jwt() ->> 'sub')::uuid
        )
    );

CREATE POLICY "Users can delete messages from their integrations"
    ON ml_messages FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM ml_integrations mi
            WHERE mi.id = ml_messages.integration_id
            AND mi.user_id = (auth.jwt() ->> 'sub')::uuid
        )
    );

-- Create RLS policies for ml_message_templates
CREATE POLICY "Users can view templates from their integrations"
    ON ml_message_templates FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM ml_integrations mi
            WHERE mi.id = ml_message_templates.integration_id
            AND mi.user_id = (auth.jwt() ->> 'sub')::uuid
        )
    );

CREATE POLICY "Users can insert templates to their integrations"
    ON ml_message_templates FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM ml_integrations mi
            WHERE mi.id = ml_message_templates.integration_id
            AND mi.user_id = (auth.jwt() ->> 'sub')::uuid
        )
    );

CREATE POLICY "Users can update templates in their integrations"
    ON ml_message_templates FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM ml_integrations mi
            WHERE mi.id = ml_message_templates.integration_id
            AND mi.user_id = (auth.jwt() ->> 'sub')::uuid
        )
    );

CREATE POLICY "Users can delete templates from their integrations"
    ON ml_message_templates FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM ml_integrations mi
            WHERE mi.id = ml_message_templates.integration_id
            AND mi.user_id = (auth.jwt() ->> 'sub')::uuid
        )
    );

-- Add comments for documentation
COMMENT ON TABLE ml_messages IS 'Stores MercadoLivre message conversations between sellers and buyers with full conversation tracking';
COMMENT ON TABLE ml_message_templates IS 'Stores automated response templates for ML messages with keyword triggering support';

COMMENT ON COLUMN ml_messages.ml_message_id IS 'MercadoLivre message ID from the API';
COMMENT ON COLUMN ml_messages.ml_pack_id IS 'MercadoLivre pack ID that groups related order messages';
COMMENT ON COLUMN ml_messages.ml_order_id IS 'MercadoLivre order ID associated with the conversation';
COMMENT ON COLUMN ml_messages.status IS 'Message status: pending, available, blocked, etc.';
COMMENT ON COLUMN ml_messages.moderation_status IS 'ML moderation status: clean, rejected, pending, non_moderated';
COMMENT ON COLUMN ml_messages.attachments IS 'JSON array containing attachment information (files, images, documents)';
COMMENT ON COLUMN ml_messages.is_seller_message IS 'True if message was sent by seller, false if by buyer';

COMMENT ON COLUMN ml_message_templates.keywords IS 'Array of keywords that trigger this template';
COMMENT ON COLUMN ml_message_templates.trigger_conditions IS 'JSON object with conditions for template activation';
COMMENT ON COLUMN ml_message_templates.priority IS 'Template priority for matching (higher numbers = higher priority)';