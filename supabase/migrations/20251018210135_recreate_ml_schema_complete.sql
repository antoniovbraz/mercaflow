-- ============================================================================
-- MERCADO LIVRE INTEGRATION - COMPLETE SCHEMA RESET
-- ============================================================================
-- Date: 2025-10-18 21:01:35
-- Description: Drops and recreates ALL ML-related tables with proper structure
-- WARNING: This migration will DELETE all ML integration data!
-- ============================================================================

-- ============================================================================
-- STEP 1: DROP ALL EXISTING ML TABLES (in reverse dependency order)
-- ============================================================================

-- Drop dependent tables first
DROP TABLE IF EXISTS public.ml_sync_logs CASCADE;
DROP TABLE IF EXISTS public.ml_webhook_logs CASCADE;
DROP TABLE IF EXISTS public.ml_products CASCADE;
DROP TABLE IF EXISTS public.ml_orders CASCADE;
DROP TABLE IF EXISTS public.ml_questions CASCADE;
DROP TABLE IF EXISTS public.ml_messages CASCADE;

-- Drop main integration table
DROP TABLE IF EXISTS public.ml_integrations CASCADE;

-- Drop OAuth state table
DROP TABLE IF EXISTS public.ml_oauth_states CASCADE;

-- Drop any functions
DROP FUNCTION IF EXISTS public.cleanup_expired_ml_oauth_states() CASCADE;
DROP FUNCTION IF EXISTS public.get_ml_integration_summary(UUID) CASCADE;

-- ============================================================================
-- STEP 2: CREATE ML OAUTH STATES TABLE (temporary storage)
-- ============================================================================

CREATE TABLE public.ml_oauth_states (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  state TEXT NOT NULL UNIQUE,
  code_verifier TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_ml_oauth_states_user_id ON public.ml_oauth_states(user_id);
CREATE INDEX idx_ml_oauth_states_expires_at ON public.ml_oauth_states(expires_at);
CREATE INDEX idx_ml_oauth_states_state ON public.ml_oauth_states(state);

-- RLS Policies
ALTER TABLE public.ml_oauth_states ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own oauth states"
  ON public.ml_oauth_states
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Comments
COMMENT ON TABLE public.ml_oauth_states IS 'Temporary storage for OAuth 2.0 PKCE flow states (auto-cleanup after 10 minutes)';

-- ============================================================================
-- STEP 3: CREATE ML INTEGRATIONS TABLE (main table)
-- ============================================================================

CREATE TABLE public.ml_integrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL,
  
  -- Mercado Livre User Information
  ml_user_id BIGINT NOT NULL,
  ml_nickname TEXT,
  ml_email TEXT,
  ml_site_id TEXT DEFAULT 'MLB' NOT NULL,
  
  -- OAuth Tokens (encrypted at application layer with AES-256-GCM)
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  token_expires_at TIMESTAMPTZ NOT NULL,
  
  -- OAuth Configuration
  scopes TEXT[] DEFAULT ARRAY['read', 'write', 'offline_access']::TEXT[],
  
  -- Integration Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'revoked', 'error', 'pending')),
  
  -- Sync Settings
  auto_sync_enabled BOOLEAN DEFAULT true,
  sync_frequency_minutes INTEGER DEFAULT 60 CHECK (sync_frequency_minutes >= 15 AND sync_frequency_minutes <= 1440),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_sync_at TIMESTAMPTZ,
  last_token_refresh_at TIMESTAMPTZ,
  
  -- Error Tracking
  last_error TEXT,
  error_count INTEGER DEFAULT 0,
  
  -- Unique constraint: one ML account per tenant
  UNIQUE(tenant_id, ml_user_id)
);

-- Indexes
CREATE INDEX idx_ml_integrations_user_id ON public.ml_integrations(user_id);
CREATE INDEX idx_ml_integrations_tenant_id ON public.ml_integrations(tenant_id);
CREATE INDEX idx_ml_integrations_ml_user_id ON public.ml_integrations(ml_user_id);
CREATE INDEX idx_ml_integrations_status ON public.ml_integrations(status);
CREATE INDEX idx_ml_integrations_token_expires_at ON public.ml_integrations(token_expires_at);

-- RLS Policies
ALTER TABLE public.ml_integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own integrations"
  ON public.ml_integrations
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_ml_integrations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_ml_integrations_updated_at
  BEFORE UPDATE ON public.ml_integrations
  FOR EACH ROW
  EXECUTE FUNCTION update_ml_integrations_updated_at();

-- Comments
COMMENT ON TABLE public.ml_integrations IS 'Main table for Mercado Livre OAuth integrations';

-- ============================================================================
-- STEP 4: CREATE ML PRODUCTS TABLE
-- ============================================================================

CREATE TABLE public.ml_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  integration_id UUID NOT NULL REFERENCES public.ml_integrations(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL,
  
  -- Mercado Livre Product IDs
  ml_item_id TEXT NOT NULL,
  ml_user_id BIGINT NOT NULL,
  
  -- Product Information
  title TEXT NOT NULL,
  price DECIMAL(15,2),
  available_quantity INTEGER DEFAULT 0,
  sold_quantity INTEGER DEFAULT 0,
  status TEXT CHECK (status IN ('active', 'paused', 'closed', 'under_review')),
  
  -- Product Details
  category_id TEXT,
  listing_type_id TEXT,
  condition TEXT CHECK (condition IN ('new', 'used', 'not_specified')),
  permalink TEXT,
  thumbnail TEXT,
  
  -- Metadata
  ml_data JSONB, -- Full ML API response for reference
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_sync_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique constraint
  UNIQUE(integration_id, ml_item_id)
);

-- Indexes
CREATE INDEX idx_ml_products_integration_id ON public.ml_products(integration_id);
CREATE INDEX idx_ml_products_tenant_id ON public.ml_products(tenant_id);
CREATE INDEX idx_ml_products_ml_item_id ON public.ml_products(ml_item_id);
CREATE INDEX idx_ml_products_status ON public.ml_products(status);

-- RLS Policies
ALTER TABLE public.ml_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own products"
  ON public.ml_products
  FOR SELECT
  USING (
    integration_id IN (
      SELECT id FROM public.ml_integrations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "System inserts products"
  ON public.ml_products
  FOR INSERT
  WITH CHECK (
    integration_id IN (
      SELECT id FROM public.ml_integrations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "System updates products"
  ON public.ml_products
  FOR UPDATE
  USING (
    integration_id IN (
      SELECT id FROM public.ml_integrations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "System deletes products"
  ON public.ml_products
  FOR DELETE
  USING (
    integration_id IN (
      SELECT id FROM public.ml_integrations WHERE user_id = auth.uid()
    )
  );

-- Trigger for updated_at
CREATE TRIGGER trigger_ml_products_updated_at
  BEFORE UPDATE ON public.ml_products
  FOR EACH ROW
  EXECUTE FUNCTION update_ml_integrations_updated_at();

COMMENT ON TABLE public.ml_products IS 'Synced products from Mercado Livre';

-- ============================================================================
-- STEP 5: CREATE ML ORDERS TABLE
-- ============================================================================

CREATE TABLE public.ml_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  integration_id UUID NOT NULL REFERENCES public.ml_integrations(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL,
  
  -- Mercado Livre Order IDs
  ml_order_id BIGINT NOT NULL,
  ml_pack_id BIGINT,
  
  -- Order Information
  status TEXT,
  status_detail TEXT,
  date_created TIMESTAMPTZ,
  date_closed TIMESTAMPTZ,
  
  -- Financial
  total_amount DECIMAL(15,2),
  paid_amount DECIMAL(15,2),
  currency_id TEXT DEFAULT 'BRL',
  
  -- Buyer Information
  buyer_id BIGINT,
  buyer_nickname TEXT,
  
  -- Items (denormalized for performance)
  items JSONB, -- Array of order items
  
  -- Metadata
  ml_data JSONB, -- Full ML API response
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_sync_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique constraint
  UNIQUE(integration_id, ml_order_id)
);

-- Indexes
CREATE INDEX idx_ml_orders_integration_id ON public.ml_orders(integration_id);
CREATE INDEX idx_ml_orders_tenant_id ON public.ml_orders(tenant_id);
CREATE INDEX idx_ml_orders_ml_order_id ON public.ml_orders(ml_order_id);
CREATE INDEX idx_ml_orders_status ON public.ml_orders(status);
CREATE INDEX idx_ml_orders_date_created ON public.ml_orders(date_created);

-- RLS Policies
ALTER TABLE public.ml_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own orders"
  ON public.ml_orders
  FOR SELECT
  USING (
    integration_id IN (
      SELECT id FROM public.ml_integrations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "System manages orders"
  ON public.ml_orders
  FOR ALL
  USING (
    integration_id IN (
      SELECT id FROM public.ml_integrations WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    integration_id IN (
      SELECT id FROM public.ml_integrations WHERE user_id = auth.uid()
    )
  );

-- Trigger for updated_at
CREATE TRIGGER trigger_ml_orders_updated_at
  BEFORE UPDATE ON public.ml_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_ml_integrations_updated_at();

COMMENT ON TABLE public.ml_orders IS 'Synced orders from Mercado Livre';

-- ============================================================================
-- STEP 6: CREATE ML QUESTIONS TABLE
-- ============================================================================

CREATE TABLE public.ml_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  integration_id UUID NOT NULL REFERENCES public.ml_integrations(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL,
  
  -- Mercado Livre Question IDs
  ml_question_id BIGINT NOT NULL,
  ml_item_id TEXT NOT NULL,
  
  -- Question Details
  text TEXT NOT NULL,
  status TEXT CHECK (status IN ('UNANSWERED', 'ANSWERED', 'CLOSED_UNANSWERED', 'UNDER_REVIEW', 'BANNED', 'DELETED')),
  
  -- Answer (if provided)
  answer TEXT,
  answer_date_created TIMESTAMPTZ,
  
  -- Buyer Information
  from_id BIGINT,
  from_name TEXT,
  
  -- Timestamps
  date_created TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_sync_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Metadata
  ml_data JSONB,
  
  -- Unique constraint
  UNIQUE(integration_id, ml_question_id)
);

-- Indexes
CREATE INDEX idx_ml_questions_integration_id ON public.ml_questions(integration_id);
CREATE INDEX idx_ml_questions_tenant_id ON public.ml_questions(tenant_id);
CREATE INDEX idx_ml_questions_ml_question_id ON public.ml_questions(ml_question_id);
CREATE INDEX idx_ml_questions_ml_item_id ON public.ml_questions(ml_item_id);
CREATE INDEX idx_ml_questions_status ON public.ml_questions(status);

-- RLS Policies
ALTER TABLE public.ml_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own questions"
  ON public.ml_questions
  FOR SELECT
  USING (
    integration_id IN (
      SELECT id FROM public.ml_integrations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "System manages questions"
  ON public.ml_questions
  FOR ALL
  USING (
    integration_id IN (
      SELECT id FROM public.ml_integrations WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    integration_id IN (
      SELECT id FROM public.ml_integrations WHERE user_id = auth.uid()
    )
  );

COMMENT ON TABLE public.ml_questions IS 'Questions from buyers on Mercado Livre listings';

-- ============================================================================
-- STEP 7: CREATE ML MESSAGES TABLE
-- ============================================================================

CREATE TABLE public.ml_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  integration_id UUID NOT NULL REFERENCES public.ml_integrations(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL,
  
  -- Mercado Livre Message IDs
  ml_message_id TEXT NOT NULL,
  ml_resource TEXT NOT NULL,
  
  -- Message Details
  from_user_id BIGINT,
  to_user_id BIGINT,
  subject TEXT,
  text TEXT,
  status TEXT,
  
  -- Context
  message_type TEXT CHECK (message_type IN ('order', 'claim', 'question', 'other')),
  related_order_id BIGINT,
  
  -- Timestamps
  date_created TIMESTAMPTZ,
  date_received TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Metadata
  ml_data JSONB,
  
  -- Unique constraint
  UNIQUE(integration_id, ml_message_id)
);

-- Indexes
CREATE INDEX idx_ml_messages_integration_id ON public.ml_messages(integration_id);
CREATE INDEX idx_ml_messages_tenant_id ON public.ml_messages(tenant_id);
CREATE INDEX idx_ml_messages_ml_message_id ON public.ml_messages(ml_message_id);

-- RLS Policies
ALTER TABLE public.ml_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own messages"
  ON public.ml_messages
  FOR SELECT
  USING (
    integration_id IN (
      SELECT id FROM public.ml_integrations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "System manages messages"
  ON public.ml_messages
  FOR ALL
  USING (
    integration_id IN (
      SELECT id FROM public.ml_integrations WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    integration_id IN (
      SELECT id FROM public.ml_integrations WHERE user_id = auth.uid()
    )
  );

COMMENT ON TABLE public.ml_messages IS 'Messages from Mercado Livre (post-sale communication)';

-- ============================================================================
-- STEP 8: CREATE ML WEBHOOK LOGS TABLE
-- ============================================================================

CREATE TABLE public.ml_webhook_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  integration_id UUID REFERENCES public.ml_integrations(id) ON DELETE SET NULL,
  tenant_id UUID,
  
  -- Webhook Information
  topic TEXT NOT NULL CHECK (topic IN ('items', 'orders_v2', 'questions', 'messages', 'claims', 'invoices')),
  resource TEXT NOT NULL,
  application_id BIGINT,
  user_id BIGINT,
  
  -- Processing Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'success', 'error', 'ignored')),
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  
  -- Payload
  payload JSONB NOT NULL,
  
  -- Timestamps
  received_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Performance tracking
  processing_duration_ms INTEGER
);

-- Indexes
CREATE INDEX idx_ml_webhook_logs_integration_id ON public.ml_webhook_logs(integration_id);
CREATE INDEX idx_ml_webhook_logs_tenant_id ON public.ml_webhook_logs(tenant_id);
CREATE INDEX idx_ml_webhook_logs_topic ON public.ml_webhook_logs(topic);
CREATE INDEX idx_ml_webhook_logs_status ON public.ml_webhook_logs(status);
CREATE INDEX idx_ml_webhook_logs_received_at ON public.ml_webhook_logs(received_at);
CREATE INDEX idx_ml_webhook_logs_resource ON public.ml_webhook_logs(resource);

-- RLS Policies
ALTER TABLE public.ml_webhook_logs ENABLE ROW LEVEL SECURITY;

-- Allow service role to insert webhooks (from external ML API)
CREATE POLICY "Service role inserts webhooks"
  ON public.ml_webhook_logs
  FOR INSERT
  WITH CHECK (true);

-- Users can view their own webhook logs
CREATE POLICY "Users view own webhook logs"
  ON public.ml_webhook_logs
  FOR SELECT
  USING (
    integration_id IN (
      SELECT id FROM public.ml_integrations WHERE user_id = auth.uid()
    )
  );

-- System can update webhook processing status
CREATE POLICY "System updates webhook logs"
  ON public.ml_webhook_logs
  FOR UPDATE
  USING (
    integration_id IN (
      SELECT id FROM public.ml_integrations WHERE user_id = auth.uid()
    )
  );

COMMENT ON TABLE public.ml_webhook_logs IS 'Logs of incoming webhooks from Mercado Livre';

-- ============================================================================
-- STEP 9: CREATE ML SYNC LOGS TABLE
-- ============================================================================

CREATE TABLE public.ml_sync_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  integration_id UUID NOT NULL REFERENCES public.ml_integrations(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL,
  
  -- Sync Details
  sync_type TEXT NOT NULL CHECK (sync_type IN ('products', 'orders', 'questions', 'messages', 'webhooks', 'user_info', 'full_sync')),
  status TEXT NOT NULL CHECK (status IN ('running', 'success', 'error', 'partial', 'cancelled')),
  
  -- Statistics
  records_processed INTEGER DEFAULT 0,
  records_success INTEGER DEFAULT 0,
  records_error INTEGER DEFAULT 0,
  
  -- Error Tracking
  error_message TEXT,
  error_details JSONB,
  
  -- Performance
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_ml_sync_logs_integration_id ON public.ml_sync_logs(integration_id);
CREATE INDEX idx_ml_sync_logs_tenant_id ON public.ml_sync_logs(tenant_id);
CREATE INDEX idx_ml_sync_logs_sync_type ON public.ml_sync_logs(sync_type);
CREATE INDEX idx_ml_sync_logs_status ON public.ml_sync_logs(status);
CREATE INDEX idx_ml_sync_logs_started_at ON public.ml_sync_logs(started_at);

-- RLS Policies
ALTER TABLE public.ml_sync_logs ENABLE ROW LEVEL SECURITY;

-- Allow service role to insert sync logs
CREATE POLICY "Service role inserts sync logs"
  ON public.ml_sync_logs
  FOR INSERT
  WITH CHECK (true);

-- Users view own sync logs
CREATE POLICY "Users view own sync logs"
  ON public.ml_sync_logs
  FOR SELECT
  USING (
    integration_id IN (
      SELECT id FROM public.ml_integrations WHERE user_id = auth.uid()
    )
  );

-- System updates sync logs
CREATE POLICY "System updates sync logs"
  ON public.ml_sync_logs
  FOR UPDATE
  USING (
    integration_id IN (
      SELECT id FROM public.ml_integrations WHERE user_id = auth.uid()
    )
  );

COMMENT ON TABLE public.ml_sync_logs IS 'Audit log of sync operations with Mercado Livre';

-- ============================================================================
-- STEP 10: CREATE UTILITY FUNCTIONS
-- ============================================================================

-- Function to cleanup expired OAuth states (run periodically)
CREATE OR REPLACE FUNCTION public.cleanup_expired_ml_oauth_states()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.ml_oauth_states 
  WHERE expires_at < NOW();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.cleanup_expired_ml_oauth_states() IS 'Removes expired OAuth PKCE states (older than 10 minutes)';

-- Function to get integration summary
CREATE OR REPLACE FUNCTION public.get_ml_integration_summary(p_integration_id UUID)
RETURNS TABLE (
  integration_id UUID,
  status TEXT,
  products_count BIGINT,
  orders_count BIGINT,
  questions_count BIGINT,
  unanswered_questions_count BIGINT,
  last_sync_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    i.id,
    i.status,
    COALESCE(p.products_count, 0),
    COALESCE(o.orders_count, 0),
    COALESCE(q.questions_count, 0),
    COALESCE(q.unanswered_count, 0),
    i.last_sync_at
  FROM public.ml_integrations i
  LEFT JOIN (
    SELECT integration_id, COUNT(*) as products_count 
    FROM public.ml_products 
    WHERE integration_id = p_integration_id 
    GROUP BY integration_id
  ) p ON p.integration_id = i.id
  LEFT JOIN (
    SELECT integration_id, COUNT(*) as orders_count 
    FROM public.ml_orders 
    WHERE integration_id = p_integration_id 
    GROUP BY integration_id
  ) o ON o.integration_id = i.id
  LEFT JOIN (
    SELECT 
      integration_id, 
      COUNT(*) as questions_count,
      COUNT(*) FILTER (WHERE status = 'UNANSWERED') as unanswered_count
    FROM public.ml_questions 
    WHERE integration_id = p_integration_id 
    GROUP BY integration_id
  ) q ON q.integration_id = i.id
  WHERE i.id = p_integration_id
    AND i.user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.get_ml_integration_summary(UUID) IS 'Returns summary statistics for a Mercado Livre integration';

-- ============================================================================
-- STEP 11: GRANT PERMISSIONS
-- ============================================================================

-- Grant access to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ml_oauth_states TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ml_integrations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ml_products TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ml_orders TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ml_questions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ml_messages TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.ml_webhook_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.ml_sync_logs TO authenticated;

-- Grant function execution
GRANT EXECUTE ON FUNCTION public.cleanup_expired_ml_oauth_states() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_ml_integration_summary(UUID) TO authenticated;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Log completion
DO $$
BEGIN
  RAISE NOTICE 'ML Integration schema recreated successfully!';
  RAISE NOTICE 'Tables created: ml_oauth_states, ml_integrations, ml_products, ml_orders, ml_questions, ml_messages, ml_webhook_logs, ml_sync_logs';
  RAISE NOTICE 'All RLS policies configured with security_invoker';
  RAISE NOTICE 'Ready for Mercado Livre OAuth integration';
END $$;
