-- Migration: Mercado Livre Integration Tables
-- Date: 2025-01-08 17:03:52
-- Description: Creates tables for ML OAuth integration and sync management

-- ==========================================
-- 1. ML OAuth States (temporary storage)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.ml_oauth_states (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  state TEXT NOT NULL UNIQUE,
  code_verifier TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for cleanup job
CREATE INDEX IF NOT EXISTS ml_oauth_states_expires_at_idx 
  ON public.ml_oauth_states(expires_at);

-- RLS
ALTER TABLE public.ml_oauth_states ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own oauth states" ON public.ml_oauth_states
  FOR ALL USING (user_id = auth.uid());

-- ==========================================
-- 2. ML Integrations (main table)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.ml_integrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- ML User Info
  ml_user_id BIGINT NOT NULL,
  ml_nickname TEXT,
  ml_email TEXT,
  ml_site_id TEXT DEFAULT 'MLB',
  
  -- OAuth Tokens (encrypted in application layer)
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  token_expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- Configuration
  scopes TEXT[] NOT NULL DEFAULT '{read,write,offline_access}',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'revoked', 'error')),
  
  -- Sync Configuration
  auto_sync_enabled BOOLEAN DEFAULT true,
  sync_frequency_minutes INTEGER DEFAULT 60 CHECK (sync_frequency_minutes >= 15),
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_sync_at TIMESTAMP WITH TIME ZONE,
  last_error TEXT,
  
  -- Constraints
  UNIQUE(tenant_id, ml_user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS ml_integrations_tenant_id_idx 
  ON public.ml_integrations(tenant_id);
CREATE INDEX IF NOT EXISTS ml_integrations_ml_user_id_idx 
  ON public.ml_integrations(ml_user_id);
CREATE INDEX IF NOT EXISTS ml_integrations_status_idx 
  ON public.ml_integrations(status);
CREATE INDEX IF NOT EXISTS ml_integrations_token_expires_at_idx 
  ON public.ml_integrations(token_expires_at);

-- RLS
ALTER TABLE public.ml_integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own ML integrations" ON public.ml_integrations
  FOR ALL USING (
    tenant_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

-- ==========================================
-- 3. ML Sync Logs
-- ==========================================
CREATE TABLE IF NOT EXISTS public.ml_sync_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  integration_id UUID NOT NULL REFERENCES public.ml_integrations(id) ON DELETE CASCADE,
  
  -- Sync Details
  sync_type TEXT NOT NULL CHECK (sync_type IN ('products', 'orders', 'questions', 'webhooks', 'user_info')),
  status TEXT NOT NULL CHECK (status IN ('success', 'error', 'partial', 'running')),
  
  -- Statistics
  records_processed INTEGER DEFAULT 0,
  records_success INTEGER DEFAULT 0,
  records_error INTEGER DEFAULT 0,
  
  -- Data
  error_details JSONB,
  sync_data JSONB,
  
  -- Timing
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS ml_sync_logs_integration_id_idx 
  ON public.ml_sync_logs(integration_id);
CREATE INDEX IF NOT EXISTS ml_sync_logs_sync_type_idx 
  ON public.ml_sync_logs(sync_type);
CREATE INDEX IF NOT EXISTS ml_sync_logs_status_idx 
  ON public.ml_sync_logs(status);
CREATE INDEX IF NOT EXISTS ml_sync_logs_created_at_idx 
  ON public.ml_sync_logs(created_at DESC);

-- RLS
ALTER TABLE public.ml_sync_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own ML sync logs" ON public.ml_sync_logs
  FOR SELECT USING (
    integration_id IN (
      SELECT id FROM public.ml_integrations 
      WHERE tenant_id IN (
        SELECT id FROM public.profiles WHERE user_id = auth.uid()
      )
    )
  );

-- ==========================================
-- 4. ML Products Cache (optional)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.ml_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  integration_id UUID NOT NULL REFERENCES public.ml_integrations(id) ON DELETE CASCADE,
  
  -- ML Product Data
  ml_item_id TEXT NOT NULL,
  title TEXT NOT NULL,
  category_id TEXT,
  price DECIMAL(15,2),
  available_quantity INTEGER,
  sold_quantity INTEGER,
  status TEXT,
  permalink TEXT,
  
  -- Full ML data (cached)
  ml_data JSONB,
  
  -- Metadata
  last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(integration_id, ml_item_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS ml_products_integration_id_idx 
  ON public.ml_products(integration_id);
CREATE INDEX IF NOT EXISTS ml_products_ml_item_id_idx 
  ON public.ml_products(ml_item_id);
CREATE INDEX IF NOT EXISTS ml_products_status_idx 
  ON public.ml_products(status);

-- RLS
ALTER TABLE public.ml_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own ML products" ON public.ml_products
  FOR ALL USING (
    integration_id IN (
      SELECT id FROM public.ml_integrations 
      WHERE tenant_id IN (
        SELECT id FROM public.profiles WHERE user_id = auth.uid()
      )
    )
  );

-- ==========================================
-- 5. ML Webhook Logs
-- ==========================================
CREATE TABLE IF NOT EXISTS public.ml_webhook_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Webhook Notification Data
  notification_id TEXT NOT NULL UNIQUE,
  topic TEXT NOT NULL,
  resource TEXT NOT NULL,
  user_id BIGINT NOT NULL,
  application_id BIGINT NOT NULL,
  attempts INTEGER DEFAULT 1,
  
  -- Timestamps
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL,
  received_at TIMESTAMP WITH TIME ZONE NOT NULL,
  processed_at TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- Processing Status
  status TEXT NOT NULL CHECK (status IN ('success', 'error', 'skipped')),
  error_message TEXT,
  
  -- Resource Data (optional cached data)
  resource_data JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS ml_webhook_logs_notification_id_idx 
  ON public.ml_webhook_logs(notification_id);
CREATE INDEX IF NOT EXISTS ml_webhook_logs_topic_idx 
  ON public.ml_webhook_logs(topic);
CREATE INDEX IF NOT EXISTS ml_webhook_logs_user_id_idx 
  ON public.ml_webhook_logs(user_id);
CREATE INDEX IF NOT EXISTS ml_webhook_logs_status_idx 
  ON public.ml_webhook_logs(status);
CREATE INDEX IF NOT EXISTS ml_webhook_logs_created_at_idx 
  ON public.ml_webhook_logs(created_at DESC);

-- RLS
ALTER TABLE public.ml_webhook_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own ML webhook logs" ON public.ml_webhook_logs
  FOR SELECT USING (
    user_id::TEXT IN (
      SELECT i.ml_user_id::TEXT FROM public.ml_integrations i 
      WHERE i.tenant_id IN (
        SELECT id FROM public.profiles WHERE user_id = auth.uid()
      )
    )
  );

-- ==========================================
-- 6. Updated At Triggers
-- ==========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
DROP TRIGGER IF EXISTS update_ml_integrations_updated_at ON public.ml_integrations;
CREATE TRIGGER update_ml_integrations_updated_at
  BEFORE UPDATE ON public.ml_integrations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_ml_products_updated_at ON public.ml_products;
CREATE TRIGGER update_ml_products_updated_at
  BEFORE UPDATE ON public.ml_products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- 6. Cleanup Function (for expired states)
-- ==========================================
CREATE OR REPLACE FUNCTION cleanup_expired_ml_oauth_states()
RETURNS void AS $$
BEGIN
  DELETE FROM public.ml_oauth_states 
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- 7. Helper Views
-- ==========================================
CREATE OR REPLACE VIEW ml_integration_summary AS
SELECT 
  i.id,
  i.tenant_id,
  i.ml_user_id,
  i.ml_nickname,
  i.status,
  i.token_expires_at,
  i.last_sync_at,
  i.auto_sync_enabled,
  COUNT(p.id) as product_count,
  COUNT(l.id) FILTER (WHERE l.status = 'error') as error_count,
  MAX(l.created_at) as last_log_at
FROM public.ml_integrations i
LEFT JOIN public.ml_products p ON p.integration_id = i.id
LEFT JOIN public.ml_sync_logs l ON l.integration_id = i.id
GROUP BY i.id, i.tenant_id, i.ml_user_id, i.ml_nickname, 
         i.status, i.token_expires_at, i.last_sync_at, i.auto_sync_enabled;

-- Grant permissions on view
GRANT SELECT ON ml_integration_summary TO authenticated;

-- RLS for view
ALTER VIEW ml_integration_summary SET (security_invoker = on);

-- ==========================================
-- 8. Comments for documentation
-- ==========================================
COMMENT ON TABLE public.ml_oauth_states IS 'Temporary storage for OAuth 2.0 PKCE flow states';
COMMENT ON TABLE public.ml_integrations IS 'Main table for Mercado Livre user integrations';
COMMENT ON TABLE public.ml_sync_logs IS 'Audit log for ML synchronization operations';
COMMENT ON TABLE public.ml_products IS 'Cached ML products for faster access';
COMMENT ON VIEW ml_integration_summary IS 'Summary view of ML integrations with statistics';

COMMENT ON COLUMN public.ml_integrations.access_token IS 'Encrypted ML access token';
COMMENT ON COLUMN public.ml_integrations.refresh_token IS 'Encrypted ML refresh token';
COMMENT ON COLUMN public.ml_integrations.sync_frequency_minutes IS 'Auto-sync interval in minutes (min 15)';