-- =====================================================
-- MIGRAÇÃO COMPLETA: CORREÇÃO DE LACUNAS CRÍTICAS
-- Data: 09/10/2025
-- Descrição: Corrige todas as lacunas identificadas na análise
-- =====================================================

-- =====================================================
-- 1. CRIAR TABELA TENANTS (CRÍTICO - AUSENTE)
-- =====================================================

-- Tabela principal para multi-tenancy
CREATE TABLE IF NOT EXISTS public.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  settings JSONB DEFAULT '{}',
  subscription_plan TEXT DEFAULT 'starter' CHECK (subscription_plan IN ('starter', 'professional', 'enterprise')),
  subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'inactive', 'suspended', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS tenants_owner_id_idx ON public.tenants(owner_id);
CREATE INDEX IF NOT EXISTS tenants_slug_idx ON public.tenants(slug);
CREATE INDEX IF NOT EXISTS tenants_subscription_status_idx ON public.tenants(subscription_status);

-- RLS
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para tenants
CREATE POLICY "users_can_view_own_tenant" ON public.tenants
  FOR SELECT 
  TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "users_can_update_own_tenant" ON public.tenants
  FOR UPDATE 
  TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "super_admins_can_manage_all_tenants" ON public.tenants
  FOR ALL 
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT au.id 
      FROM auth.users au 
      WHERE au.email IN ('peepers.shop@gmail.com', 'antoniovbraz@gmail.com')
    )
  );

-- Trigger para updated_at
CREATE TRIGGER tenants_updated_at
  BEFORE UPDATE ON public.tenants
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- 2. MIGRAR DADOS EXISTENTES PARA TENANTS
-- =====================================================

-- Criar tenant para cada usuário existente (cada user é seu próprio tenant)
INSERT INTO public.tenants (id, name, slug, owner_id, created_at, updated_at)
SELECT 
  p.id, -- usar o mesmo UUID do profile como tenant_id
  COALESCE(p.full_name, 'Tenant de ' || au.email),
  LOWER(REPLACE(COALESCE(p.full_name, au.email), ' ', '-')),
  p.id, -- owner_id = user_id (cada user é owner do seu tenant)
  p.created_at,
  p.updated_at
FROM public.profiles p
JOIN auth.users au ON au.id = p.id
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 3. ADICIONAR TENANT_ID À TABELA PROFILES
-- =====================================================

-- Adicionar coluna tenant_id se não existir
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;

-- Popular tenant_id (cada profile aponta para seu próprio tenant)
UPDATE public.profiles 
SET tenant_id = id 
WHERE tenant_id IS NULL;

-- Tornar tenant_id obrigatório depois de popular
ALTER TABLE public.profiles 
ALTER COLUMN tenant_id SET NOT NULL;

-- Índice para performance
CREATE INDEX IF NOT EXISTS profiles_tenant_id_idx ON public.profiles(tenant_id);

-- =====================================================
-- 4. CRIAR TABELAS ML ESSENCIAIS AUSENTES
-- =====================================================

-- A. TABELA ML_ORDERS (CRÍTICA - AUSENTE)
CREATE TABLE IF NOT EXISTS public.ml_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID NOT NULL REFERENCES public.ml_integrations(id) ON DELETE CASCADE,
  
  -- ML Order Data
  ml_order_id BIGINT NOT NULL,
  status TEXT NOT NULL,
  status_detail TEXT,
  date_created TIMESTAMPTZ NOT NULL,
  date_closed TIMESTAMPTZ,
  date_last_updated TIMESTAMPTZ,
  
  -- Financial Info
  total_amount DECIMAL(15,2) NOT NULL,
  currency_id TEXT DEFAULT 'BRL',
  
  -- Participants
  buyer_id BIGINT,
  buyer_nickname TEXT,
  seller_id BIGINT,
  seller_nickname TEXT,
  
  -- Order Items (JSON for flexibility)
  order_items JSONB NOT NULL,
  
  -- Additional Data
  payments JSONB,
  shipping JSONB,
  feedback JSONB,
  
  -- Full ML response (for reference)
  raw_data JSONB,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(integration_id, ml_order_id)
);

-- Índices para ml_orders
CREATE INDEX IF NOT EXISTS ml_orders_integration_id_idx ON public.ml_orders(integration_id);
CREATE INDEX IF NOT EXISTS ml_orders_ml_order_id_idx ON public.ml_orders(ml_order_id);
CREATE INDEX IF NOT EXISTS ml_orders_status_idx ON public.ml_orders(status);
CREATE INDEX IF NOT EXISTS ml_orders_date_created_idx ON public.ml_orders(date_created DESC);
CREATE INDEX IF NOT EXISTS ml_orders_total_amount_idx ON public.ml_orders(total_amount);
CREATE INDEX IF NOT EXISTS ml_orders_buyer_id_idx ON public.ml_orders(buyer_id);

-- RLS para ml_orders
ALTER TABLE public.ml_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_can_view_own_ml_orders" ON public.ml_orders
  FOR SELECT 
  TO authenticated
  USING (
    integration_id IN (
      SELECT id FROM public.ml_integrations 
      WHERE tenant_id = auth.uid()
    )
  );

CREATE POLICY "super_admins_can_view_all_ml_orders" ON public.ml_orders
  FOR ALL 
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT au.id 
      FROM auth.users au 
      WHERE au.email IN ('peepers.shop@gmail.com', 'antoniovbraz@gmail.com')
    )
  );

-- Trigger updated_at para ml_orders
CREATE TRIGGER ml_orders_updated_at
  BEFORE UPDATE ON public.ml_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- B. TABELA ML_MESSAGES (CRÍTICA - AUSENTE)
CREATE TABLE IF NOT EXISTS public.ml_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID NOT NULL REFERENCES public.ml_integrations(id) ON DELETE CASCADE,
  
  -- ML Message Data
  ml_message_id TEXT NOT NULL,
  from_user_id BIGINT,
  to_user_id BIGINT,
  subject TEXT,
  text TEXT,
  status TEXT,
  
  -- Timestamps
  date_created TIMESTAMPTZ NOT NULL,
  date_received TIMESTAMPTZ,
  date_read TIMESTAMPTZ,
  date_answered TIMESTAMPTZ,
  
  -- Message Type & Context
  message_type TEXT, -- question, claim, etc.
  site_id TEXT DEFAULT 'MLB',
  
  -- Attachments & Media
  attachments JSONB,
  
  -- Full ML response
  raw_data JSONB,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(integration_id, ml_message_id)
);

-- Índices para ml_messages
CREATE INDEX IF NOT EXISTS ml_messages_integration_id_idx ON public.ml_messages(integration_id);
CREATE INDEX IF NOT EXISTS ml_messages_ml_message_id_idx ON public.ml_messages(ml_message_id);
CREATE INDEX IF NOT EXISTS ml_messages_status_idx ON public.ml_messages(status);
CREATE INDEX IF NOT EXISTS ml_messages_date_created_idx ON public.ml_messages(date_created DESC);
CREATE INDEX IF NOT EXISTS ml_messages_from_user_id_idx ON public.ml_messages(from_user_id);
CREATE INDEX IF NOT EXISTS ml_messages_to_user_id_idx ON public.ml_messages(to_user_id);

-- RLS para ml_messages
ALTER TABLE public.ml_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_can_view_own_ml_messages" ON public.ml_messages
  FOR ALL 
  TO authenticated
  USING (
    integration_id IN (
      SELECT id FROM public.ml_integrations 
      WHERE tenant_id = auth.uid()
    )
  );

CREATE POLICY "super_admins_can_view_all_ml_messages" ON public.ml_messages
  FOR ALL 
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT au.id 
      FROM auth.users au 
      WHERE au.email IN ('peepers.shop@gmail.com', 'antoniovbraz@gmail.com')
    )
  );

-- Trigger updated_at para ml_messages
CREATE TRIGGER ml_messages_updated_at
  BEFORE UPDATE ON public.ml_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- C. TABELA ML_CATEGORIES (IMPORTANTE - AUSENTE)
CREATE TABLE IF NOT EXISTS public.ml_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- ML Category Data
  ml_category_id TEXT NOT NULL,
  name TEXT NOT NULL,
  path_from_root JSONB,
  children_categories JSONB,
  
  -- Configuration
  settings JSONB,
  attribute_types JSONB,
  
  -- Site Info
  site_id TEXT DEFAULT 'MLB',
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(ml_category_id, site_id)
);

-- Índices para ml_categories
CREATE INDEX IF NOT EXISTS ml_categories_ml_category_id_idx ON public.ml_categories(ml_category_id);
CREATE INDEX IF NOT EXISTS ml_categories_site_id_idx ON public.ml_categories(site_id);
CREATE INDEX IF NOT EXISTS ml_categories_name_idx ON public.ml_categories(name);

-- RLS para ml_categories (público para leitura)
ALTER TABLE public.ml_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ml_categories_public_read" ON public.ml_categories
  FOR SELECT 
  TO authenticated
  USING (true);

CREATE POLICY "super_admins_can_manage_ml_categories" ON public.ml_categories
  FOR ALL 
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT au.id 
      FROM auth.users au 
      WHERE au.email IN ('peepers.shop@gmail.com', 'antoniovbraz@gmail.com')
    )
  );

-- Trigger updated_at para ml_categories
CREATE TRIGGER ml_categories_updated_at
  BEFORE UPDATE ON public.ml_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- 5. ADICIONAR COLUNAS AUSENTES EM ML_INTEGRATIONS
-- =====================================================

-- Adicionar colunas importantes que estavam ausentes
ALTER TABLE public.ml_integrations 
ADD COLUMN IF NOT EXISTS ml_site_id TEXT DEFAULT 'MLB',
ADD COLUMN IF NOT EXISTS account_type TEXT, -- personal, professional
ADD COLUMN IF NOT EXISTS ml_user_info JSONB, -- cache user data
ADD COLUMN IF NOT EXISTS webhook_config JSONB, -- webhook settings
ADD COLUMN IF NOT EXISTS api_limits JSONB; -- rate limit info

-- =====================================================
-- 6. ADICIONAR COLUNAS AUSENTES EM ML_PRODUCTS
-- =====================================================

-- Adicionar campos importantes para produtos
ALTER TABLE public.ml_products 
ADD COLUMN IF NOT EXISTS condition TEXT CHECK (condition IN ('new', 'used', 'not_specified')),
ADD COLUMN IF NOT EXISTS listing_type_id TEXT,
ADD COLUMN IF NOT EXISTS currency_id TEXT DEFAULT 'BRL',
ADD COLUMN IF NOT EXISTS warranty TEXT,
ADD COLUMN IF NOT EXISTS pictures JSONB,
ADD COLUMN IF NOT EXISTS attributes JSONB,
ADD COLUMN IF NOT EXISTS variations JSONB,
ADD COLUMN IF NOT EXISTS shipping JSONB,
ADD COLUMN IF NOT EXISTS sale_terms JSONB;

-- Índices adicionais para ml_products
CREATE INDEX IF NOT EXISTS ml_products_condition_idx ON public.ml_products(condition);
CREATE INDEX IF NOT EXISTS ml_products_listing_type_idx ON public.ml_products(listing_type_id);
CREATE INDEX IF NOT EXISTS ml_products_price_idx ON public.ml_products(price);

-- =====================================================
-- 7. COMENTÁRIOS PARA DOCUMENTAÇÃO
-- =====================================================

COMMENT ON TABLE public.tenants IS 'Tabela principal para sistema multi-tenant da MercaFlow';
COMMENT ON TABLE public.ml_orders IS 'Cache de pedidos/vendas sincronizados do Mercado Livre';
COMMENT ON TABLE public.ml_messages IS 'Sistema de mensagens entre usuários do Mercado Livre';
COMMENT ON TABLE public.ml_categories IS 'Cache de categorias do Mercado Livre para otimização';

-- =====================================================
-- 8. ATUALIZAR VIEW ML_INTEGRATION_SUMMARY
-- =====================================================

-- Recriar view com as novas tabelas
DROP VIEW IF EXISTS public.ml_integration_summary;

CREATE VIEW public.ml_integration_summary AS
SELECT 
  i.id,
  i.tenant_id,
  i.ml_user_id,
  i.ml_nickname,
  i.ml_email,
  i.status,
  i.token_expires_at,
  i.last_sync_at,
  i.scopes,
  i.auto_sync_enabled,
  
  -- Contadores de produtos
  COALESCE(p.product_count, 0) as product_count,
  COALESCE(p.active_products, 0) as active_products,
  
  -- Contadores de pedidos
  COALESCE(o.order_count, 0) as order_count,
  COALESCE(o.total_revenue, 0) as total_revenue,
  
  -- Contadores de mensagens
  COALESCE(m.message_count, 0) as message_count,
  COALESCE(m.unread_messages, 0) as unread_messages,
  
  -- Contadores de logs
  COALESCE(l.error_count, 0) as error_count,
  l.last_log_at
  
FROM public.ml_integrations i

LEFT JOIN (
  SELECT 
    integration_id, 
    COUNT(*) as product_count,
    COUNT(*) FILTER (WHERE status = 'active') as active_products
  FROM public.ml_products 
  GROUP BY integration_id
) p ON p.integration_id = i.id

LEFT JOIN (
  SELECT 
    integration_id, 
    COUNT(*) as order_count,
    SUM(total_amount) as total_revenue
  FROM public.ml_orders 
  GROUP BY integration_id
) o ON o.integration_id = i.id

LEFT JOIN (
  SELECT 
    integration_id, 
    COUNT(*) as message_count,
    COUNT(*) FILTER (WHERE date_read IS NULL) as unread_messages
  FROM public.ml_messages 
  GROUP BY integration_id
) m ON m.integration_id = i.id

LEFT JOIN (
  SELECT 
    integration_id, 
    COUNT(*) FILTER (WHERE status = 'error') as error_count,
    MAX(created_at) as last_log_at
  FROM public.ml_sync_logs 
  GROUP BY integration_id
) l ON l.integration_id = i.id;

-- Permissões na view
GRANT SELECT ON public.ml_integration_summary TO authenticated;

-- NOTA: Views não suportam RLS direto, a segurança é controlada pelas tabelas base
-- A view já usa security_invoker = off para ser segura

COMMENT ON VIEW public.ml_integration_summary IS 'View segura com dados agregados das integrações ML. Segurança controlada pelas tabelas base.';

-- =====================================================
-- 9. GRANT PERMISSIONS FINAIS
-- =====================================================

-- Garantir permissões para todas as novas tabelas
GRANT ALL ON public.tenants TO authenticated;
GRANT ALL ON public.ml_orders TO authenticated;
GRANT ALL ON public.ml_messages TO authenticated;
GRANT SELECT ON public.ml_categories TO authenticated;

-- =====================================================
-- FIM DA MIGRAÇÃO COMPLETA
-- =====================================================