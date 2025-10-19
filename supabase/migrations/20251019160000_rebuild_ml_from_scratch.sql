-- ============================================================================
-- MERCADO LIVRE INTEGRATION - COMPLETE REBUILD FROM SCRATCH
-- ============================================================================
-- Date: 2025-10-19 16:00:00
-- Strategy: DROP TOTAL + Clean Rebuild
-- Approved: User confirmed no important data, full rebuild OK
-- ============================================================================
-- This migration will DELETE ALL ML integration data and recreate schema
-- based 100% on official Mercado Livre API documentation
-- ============================================================================

-- ============================================================================
-- STEP 1: DROP ALL EXISTING ML TABLES (CASCADE for dependencies)
-- ============================================================================

DO $$ 
BEGIN
  -- Drop tables in reverse dependency order
  DROP TABLE IF EXISTS public.ml_sync_logs CASCADE;
  DROP TABLE IF EXISTS public.ml_webhook_logs CASCADE;
  DROP TABLE IF EXISTS public.ml_messages CASCADE;
  DROP TABLE IF EXISTS public.ml_questions CASCADE;
  DROP TABLE IF EXISTS public.ml_orders CASCADE;
  DROP TABLE IF EXISTS public.ml_products CASCADE;
  DROP TABLE IF EXISTS public.ml_integrations CASCADE;
  DROP TABLE IF EXISTS public.ml_oauth_states CASCADE;

  -- Drop any ML-related functions
  DROP FUNCTION IF EXISTS public.cleanup_expired_ml_oauth_states() CASCADE;
  DROP FUNCTION IF EXISTS public.get_ml_integration_summary(UUID) CASCADE;
  
  RAISE NOTICE 'All ML tables dropped successfully';
END $$;

-- ============================================================================
-- STEP 2: CREATE ML OAUTH STATES (temporary OAuth PKCE storage)
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
CREATE INDEX idx_ml_oauth_states_state ON public.ml_oauth_states(state);
CREATE INDEX idx_ml_oauth_states_expires_at ON public.ml_oauth_states(expires_at);

-- RLS Policies
ALTER TABLE public.ml_oauth_states ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own OAuth states"
  ON public.ml_oauth_states
  AS PERMISSIVE
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Comments
COMMENT ON TABLE public.ml_oauth_states IS 'Temporary storage for OAuth 2.0 PKCE flow (auto-cleanup after expiration)';
COMMENT ON COLUMN public.ml_oauth_states.state IS 'Random state parameter for CSRF protection';
COMMENT ON COLUMN public.ml_oauth_states.code_verifier IS 'PKCE code verifier (stored for verification)';

-- ============================================================================
-- STEP 3: CREATE ML INTEGRATIONS (main table - stores OAuth credentials)
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
  
  -- OAuth Tokens (AES-256-GCM encrypted at application layer)
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  token_expires_at TIMESTAMPTZ NOT NULL,
  scopes TEXT[] DEFAULT ARRAY['read', 'write', 'offline_access']::TEXT[],
  
  -- Integration Status
  status TEXT DEFAULT 'active' NOT NULL 
    CHECK (status IN ('active', 'expired', 'revoked', 'error', 'pending')),
  
  -- Auto-sync Configuration
  auto_sync_enabled BOOLEAN DEFAULT true,
  sync_frequency_minutes INTEGER DEFAULT 60 
    CHECK (sync_frequency_minutes >= 15 AND sync_frequency_minutes <= 1440),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  last_sync_at TIMESTAMPTZ,
  last_token_refresh_at TIMESTAMPTZ,
  
  -- Error Tracking
  last_error TEXT,
  error_count INTEGER DEFAULT 0 CHECK (error_count >= 0),
  
  -- Constraints
  UNIQUE(user_id, ml_user_id),
  UNIQUE(tenant_id, ml_user_id)
);

-- Indexes
CREATE INDEX idx_ml_integrations_user_id ON public.ml_integrations(user_id);
CREATE INDEX idx_ml_integrations_tenant_id ON public.ml_integrations(tenant_id);
CREATE INDEX idx_ml_integrations_ml_user_id ON public.ml_integrations(ml_user_id);
CREATE INDEX idx_ml_integrations_status ON public.ml_integrations(status);
CREATE INDEX idx_ml_integrations_token_expires ON public.ml_integrations(token_expires_at);

-- RLS Policies
ALTER TABLE public.ml_integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own integrations"
  ON public.ml_integrations
  AS PERMISSIVE
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can insert their own integrations"
  ON public.ml_integrations
  AS PERMISSIVE
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own integrations"
  ON public.ml_integrations
  AS PERMISSIVE
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own integrations"
  ON public.ml_integrations
  AS PERMISSIVE
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Comments
COMMENT ON TABLE public.ml_integrations IS 'Mercado Livre OAuth integrations - one per user/account';
COMMENT ON COLUMN public.ml_integrations.access_token IS 'Encrypted OAuth access token (AES-256-GCM)';
COMMENT ON COLUMN public.ml_integrations.refresh_token IS 'Encrypted OAuth refresh token (AES-256-GCM)';

-- ============================================================================
-- STEP 4: CREATE ML PRODUCTS (synced item listings)
-- ============================================================================

CREATE TABLE public.ml_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  integration_id UUID NOT NULL REFERENCES public.ml_integrations(id) ON DELETE CASCADE,
  
  -- ML Item Info (from official API: https://developers.mercadolibre.com.ar/en_us/items-and-searches)
  ml_item_id TEXT NOT NULL,
  title TEXT NOT NULL,
  category_id TEXT,
  
  -- Pricing
  price NUMERIC(12,2),
  currency_id TEXT DEFAULT 'BRL',
  
  -- Inventory
  available_quantity INTEGER DEFAULT 0 CHECK (available_quantity >= 0),
  sold_quantity INTEGER DEFAULT 0 CHECK (sold_quantity >= 0),
  
  -- Status and Type
  status TEXT CHECK (status IN ('active', 'paused', 'closed', 'under_review', 'inactive')),
  listing_type_id TEXT, -- gold_special, gold_pro, free, etc
  condition TEXT CHECK (condition IN ('new', 'used', 'not_specified')),
  
  -- Media
  permalink TEXT,
  thumbnail TEXT,
  
  -- Full ML API response (JSONB for flexibility and future fields)
  ml_data JSONB NOT NULL DEFAULT '{}'::JSONB,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  last_sync_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  UNIQUE(integration_id, ml_item_id)
);

-- Indexes
CREATE INDEX idx_ml_products_integration_id ON public.ml_products(integration_id);
CREATE INDEX idx_ml_products_ml_item_id ON public.ml_products(ml_item_id);
CREATE INDEX idx_ml_products_status ON public.ml_products(status);
CREATE INDEX idx_ml_products_title ON public.ml_products USING gin(to_tsvector('portuguese', title));
CREATE INDEX idx_ml_products_last_sync_at ON public.ml_products(last_sync_at);
CREATE INDEX idx_ml_products_ml_data ON public.ml_products USING gin(ml_data);

-- RLS Policies (via integration → tenant)
ALTER TABLE public.ml_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view products from their integrations"
  ON public.ml_products
  AS PERMISSIVE
  FOR SELECT
  TO authenticated
  USING (
    integration_id IN (
      SELECT id FROM ml_integrations 
      WHERE user_id = auth.uid() 
         OR tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    )
  );

CREATE POLICY "Users can manage products from their integrations"
  ON public.ml_products
  AS PERMISSIVE
  FOR ALL
  TO authenticated
  USING (
    integration_id IN (
      SELECT id FROM ml_integrations WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    integration_id IN (
      SELECT id FROM ml_integrations WHERE user_id = auth.uid()
    )
  );

-- Comments
COMMENT ON TABLE public.ml_products IS 'Synced product listings from Mercado Livre';
COMMENT ON COLUMN public.ml_products.ml_item_id IS 'Mercado Livre item ID (e.g., MLB123456789)';
COMMENT ON COLUMN public.ml_products.ml_data IS 'Full ML API response in JSONB format';

-- ============================================================================
-- STEP 5: CREATE ML ORDERS (synced orders/sales)
-- ============================================================================

CREATE TABLE public.ml_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  integration_id UUID NOT NULL REFERENCES public.ml_integrations(id) ON DELETE CASCADE,
  
  -- ML Order Info (from official API: https://developers.mercadolibre.com.ar/en_us/orders-management)
  ml_order_id BIGINT NOT NULL,
  status TEXT NOT NULL,
  status_detail TEXT,
  
  -- Buyer Information
  buyer_id BIGINT,
  buyer_nickname TEXT,
  
  -- Financial
  total_amount NUMERIC(12,2) NOT NULL,
  paid_amount NUMERIC(12,2) DEFAULT 0,
  currency_id TEXT DEFAULT 'BRL',
  
  -- Important Dates
  date_created TIMESTAMPTZ NOT NULL,
  date_closed TIMESTAMPTZ,
  date_last_updated TIMESTAMPTZ,
  
  -- Fulfillment
  shipping_status TEXT,
  
  -- Full ML API response (JSONB)
  ml_data JSONB NOT NULL DEFAULT '{}'::JSONB,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  last_sync_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  UNIQUE(integration_id, ml_order_id)
);

-- Indexes
CREATE INDEX idx_ml_orders_integration_id ON public.ml_orders(integration_id);
CREATE INDEX idx_ml_orders_ml_order_id ON public.ml_orders(ml_order_id);
CREATE INDEX idx_ml_orders_status ON public.ml_orders(status);
CREATE INDEX idx_ml_orders_buyer_id ON public.ml_orders(buyer_id);
CREATE INDEX idx_ml_orders_date_created ON public.ml_orders(date_created DESC);
CREATE INDEX idx_ml_orders_ml_data ON public.ml_orders USING gin(ml_data);

-- RLS Policies (via integration → tenant)
ALTER TABLE public.ml_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view orders from their integrations"
  ON public.ml_orders
  AS PERMISSIVE
  FOR SELECT
  TO authenticated
  USING (
    integration_id IN (
      SELECT id FROM ml_integrations 
      WHERE user_id = auth.uid() 
         OR tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    )
  );

CREATE POLICY "Users can manage orders from their integrations"
  ON public.ml_orders
  AS PERMISSIVE
  FOR ALL
  TO authenticated
  USING (
    integration_id IN (
      SELECT id FROM ml_integrations WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    integration_id IN (
      SELECT id FROM ml_integrations WHERE user_id = auth.uid()
    )
  );

-- Comments
COMMENT ON TABLE public.ml_orders IS 'Synced orders/sales from Mercado Livre';
COMMENT ON COLUMN public.ml_orders.ml_order_id IS 'Mercado Livre order ID';

-- ============================================================================
-- STEP 6: CREATE ML QUESTIONS (buyer questions on listings)
-- ============================================================================

CREATE TABLE public.ml_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  integration_id UUID NOT NULL REFERENCES public.ml_integrations(id) ON DELETE CASCADE,
  
  -- ML Question Info (from official API: https://developers.mercadolibre.com.ar/en_us/questions)
  ml_question_id BIGINT NOT NULL,
  ml_item_id TEXT NOT NULL,
  
  -- Status
  status TEXT NOT NULL 
    CHECK (status IN ('UNANSWERED', 'ANSWERED', 'CLOSED_UNANSWERED', 'UNDER_REVIEW', 'BANNED', 'DELETED')),
  
  -- Content
  text TEXT NOT NULL,
  answer_text TEXT,
  
  -- Dates
  date_created TIMESTAMPTZ NOT NULL,
  date_answered TIMESTAMPTZ,
  
  -- Buyer Info
  from_user_id BIGINT,
  from_user_nickname TEXT,
  
  -- Full ML API response
  ml_data JSONB NOT NULL DEFAULT '{}'::JSONB,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  last_sync_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  UNIQUE(integration_id, ml_question_id)
);

-- Indexes
CREATE INDEX idx_ml_questions_integration_id ON public.ml_questions(integration_id);
CREATE INDEX idx_ml_questions_ml_question_id ON public.ml_questions(ml_question_id);
CREATE INDEX idx_ml_questions_ml_item_id ON public.ml_questions(ml_item_id);
CREATE INDEX idx_ml_questions_status ON public.ml_questions(status);
CREATE INDEX idx_ml_questions_date_created ON public.ml_questions(date_created DESC);
CREATE INDEX idx_ml_questions_unanswered ON public.ml_questions(status) WHERE status = 'UNANSWERED';

-- RLS Policies (via integration → tenant)
ALTER TABLE public.ml_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view questions from their integrations"
  ON public.ml_questions
  AS PERMISSIVE
  FOR SELECT
  TO authenticated
  USING (
    integration_id IN (
      SELECT id FROM ml_integrations 
      WHERE user_id = auth.uid() 
         OR tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    )
  );

CREATE POLICY "Users can manage questions from their integrations"
  ON public.ml_questions
  AS PERMISSIVE
  FOR ALL
  TO authenticated
  USING (
    integration_id IN (
      SELECT id FROM ml_integrations WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    integration_id IN (
      SELECT id FROM ml_integrations WHERE user_id = auth.uid()
    )
  );

-- Comments
COMMENT ON TABLE public.ml_questions IS 'Buyer questions on product listings';
COMMENT ON COLUMN public.ml_questions.status IS 'UNANSWERED = needs response, ANSWERED = has answer';

-- ============================================================================
-- STEP 7: CREATE ML WEBHOOK LOGS (notifications received from ML)
-- ============================================================================

CREATE TABLE public.ml_webhook_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Webhook Metadata
  topic TEXT NOT NULL,
  resource TEXT NOT NULL,
  user_id BIGINT NOT NULL,
  application_id BIGINT NOT NULL,
  
  -- Payload
  payload JSONB NOT NULL DEFAULT '{}'::JSONB,
  
  -- Processing Status
  processed BOOLEAN DEFAULT false NOT NULL,
  processed_at TIMESTAMPTZ,
  processing_error TEXT,
  retry_count INTEGER DEFAULT 0 CHECK (retry_count >= 0),
  
  -- Timestamps
  received_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- For deduplication
  attempts INTEGER DEFAULT 1 CHECK (attempts >= 0)
);

-- Indexes
CREATE INDEX idx_ml_webhook_logs_topic ON public.ml_webhook_logs(topic);
CREATE INDEX idx_ml_webhook_logs_resource ON public.ml_webhook_logs(resource);
CREATE INDEX idx_ml_webhook_logs_user_id ON public.ml_webhook_logs(user_id);
CREATE INDEX idx_ml_webhook_logs_processed ON public.ml_webhook_logs(processed, received_at);
CREATE INDEX idx_ml_webhook_logs_received_at ON public.ml_webhook_logs(received_at DESC);

-- RLS Policies (service role can insert, users can view their own)
ALTER TABLE public.ml_webhook_logs ENABLE ROW LEVEL SECURITY;

-- Service role can insert (for webhook endpoint)
CREATE POLICY "Service role can insert webhooks"
  ON public.ml_webhook_logs
  AS PERMISSIVE
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Authenticated users can view webhooks for their ML user_id
CREATE POLICY "Users can view their webhook logs"
  ON public.ml_webhook_logs
  AS PERMISSIVE
  FOR SELECT
  TO authenticated
  USING (
    user_id IN (
      SELECT ml_user_id FROM ml_integrations WHERE user_id = auth.uid()
    )
  );

-- Comments
COMMENT ON TABLE public.ml_webhook_logs IS 'Webhook notifications received from Mercado Livre';
COMMENT ON COLUMN public.ml_webhook_logs.topic IS 'Webhook topic (e.g., orders, items, questions)';
COMMENT ON COLUMN public.ml_webhook_logs.resource IS 'Resource URL (e.g., /orders/123456)';

-- ============================================================================
-- STEP 8: CREATE ML SYNC LOGS (sync history/audit trail)
-- ============================================================================

CREATE TABLE public.ml_sync_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  integration_id UUID NOT NULL REFERENCES public.ml_integrations(id) ON DELETE CASCADE,
  
  -- Sync Metadata
  sync_type TEXT NOT NULL 
    CHECK (sync_type IN ('products', 'orders', 'questions', 'messages', 'full')),
  status TEXT NOT NULL 
    CHECK (status IN ('started', 'in_progress', 'completed', 'failed', 'partial')),
  
  -- Statistics
  items_fetched INTEGER DEFAULT 0 CHECK (items_fetched >= 0),
  items_synced INTEGER DEFAULT 0 CHECK (items_synced >= 0),
  items_failed INTEGER DEFAULT 0 CHECK (items_failed >= 0),
  
  -- Timing
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  
  -- Error Tracking
  error_message TEXT,
  error_details JSONB,
  
  -- Additional metadata
  metadata JSONB DEFAULT '{}'::JSONB,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_ml_sync_logs_integration_id ON public.ml_sync_logs(integration_id);
CREATE INDEX idx_ml_sync_logs_sync_type ON public.ml_sync_logs(sync_type);
CREATE INDEX idx_ml_sync_logs_status ON public.ml_sync_logs(status);
CREATE INDEX idx_ml_sync_logs_started_at ON public.ml_sync_logs(started_at DESC);

-- RLS Policies (via integration → tenant)
ALTER TABLE public.ml_sync_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view sync logs from their integrations"
  ON public.ml_sync_logs
  AS PERMISSIVE
  FOR SELECT
  TO authenticated
  USING (
    integration_id IN (
      SELECT id FROM ml_integrations 
      WHERE user_id = auth.uid() 
         OR tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    )
  );

CREATE POLICY "System can insert sync logs"
  ON public.ml_sync_logs
  AS PERMISSIVE
  FOR INSERT
  TO authenticated
  WITH CHECK (
    integration_id IN (
      SELECT id FROM ml_integrations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "System can update sync logs"
  ON public.ml_sync_logs
  AS PERMISSIVE
  FOR UPDATE
  TO authenticated
  USING (
    integration_id IN (
      SELECT id FROM ml_integrations WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    integration_id IN (
      SELECT id FROM ml_integrations WHERE user_id = auth.uid()
    )
  );

-- Comments
COMMENT ON TABLE public.ml_sync_logs IS 'Audit trail of sync operations';
COMMENT ON COLUMN public.ml_sync_logs.sync_type IS 'Type of sync: products, orders, questions, or full';

-- ============================================================================
-- STEP 9: CREATE HELPER FUNCTIONS
-- ============================================================================

-- Function to auto-cleanup expired OAuth states
CREATE OR REPLACE FUNCTION public.cleanup_expired_ml_oauth_states()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.ml_oauth_states
  WHERE expires_at < NOW();
END;
$$;

COMMENT ON FUNCTION public.cleanup_expired_ml_oauth_states IS 'Removes expired OAuth states (run via cron)';

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_ml_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ============================================================================
-- STEP 10: CREATE TRIGGERS
-- ============================================================================

-- Auto-update updated_at on ml_integrations
CREATE TRIGGER update_ml_integrations_updated_at
  BEFORE UPDATE ON public.ml_integrations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_ml_updated_at();

-- Auto-update updated_at on ml_products
CREATE TRIGGER update_ml_products_updated_at
  BEFORE UPDATE ON public.ml_products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_ml_updated_at();

-- Auto-update updated_at on ml_orders
CREATE TRIGGER update_ml_orders_updated_at
  BEFORE UPDATE ON public.ml_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_ml_updated_at();

-- Auto-update updated_at on ml_questions
CREATE TRIGGER update_ml_questions_updated_at
  BEFORE UPDATE ON public.ml_questions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_ml_updated_at();

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

DO $$ 
BEGIN
  RAISE NOTICE '===========================================';
  RAISE NOTICE 'ML Integration Schema Rebuilt Successfully';
  RAISE NOTICE '===========================================';
  RAISE NOTICE 'Tables created:';
  RAISE NOTICE '  - ml_oauth_states (OAuth PKCE temporary)';
  RAISE NOTICE '  - ml_integrations (OAuth credentials)';
  RAISE NOTICE '  - ml_products (item listings)';
  RAISE NOTICE '  - ml_orders (sales/orders)';
  RAISE NOTICE '  - ml_questions (buyer questions)';
  RAISE NOTICE '  - ml_webhook_logs (webhook notifications)';
  RAISE NOTICE '  - ml_sync_logs (sync audit trail)';
  RAISE NOTICE '';
  RAISE NOTICE 'RLS Policies: ENABLED on all tables';
  RAISE NOTICE 'Indexes: Optimized for common queries';
  RAISE NOTICE 'Triggers: Auto-update timestamps';
  RAISE NOTICE '';
  RAISE NOTICE 'Next Step: Reconnect Mercado Livre account';
  RAISE NOTICE '===========================================';
END $$;
