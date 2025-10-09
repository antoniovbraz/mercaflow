-- LIMPEZA COMPLETA DO BANCO - RESET TOTAL
-- ⚠️ CUIDADO: Este script REMOVE TUDO! Execute apenas se tiver backup!

-- 1. DESABILITAR RLS TEMPORARIAMENTE PARA LIMPEZA
ALTER TABLE IF EXISTS public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.ml_integrations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.ml_products DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.ml_oauth_states DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.ml_sync_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.ml_webhook_logs DISABLE ROW LEVEL SECURITY;

-- 2. REMOVER TODAS AS POLÍTICAS RLS
DROP POLICY IF EXISTS "users_can_read_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "users_can_update_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "super_admins_full_access" ON public.profiles;
DROP POLICY IF EXISTS "users_can_view_own_ml_integrations" ON public.ml_integrations;
DROP POLICY IF EXISTS "users_can_manage_own_ml_integrations" ON public.ml_integrations;
DROP POLICY IF EXISTS "super_admins_can_manage_all_ml_integrations" ON public.ml_integrations;
DROP POLICY IF EXISTS "users_can_view_own_ml_products" ON public.ml_products;
DROP POLICY IF EXISTS "users_can_manage_own_ml_products" ON public.ml_products;
DROP POLICY IF EXISTS "super_admins_can_manage_all_ml_products" ON public.ml_products;

-- 3. REMOVER TRIGGERS (incluindo os que dependem de funções)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS handle_updated_at_profiles ON public.profiles;
DROP TRIGGER IF EXISTS tenants_updated_at ON public.tenants;
DROP TRIGGER IF EXISTS ml_orders_updated_at ON public.ml_orders;
DROP TRIGGER IF EXISTS ml_messages_updated_at ON public.ml_messages;
DROP TRIGGER IF EXISTS ml_categories_updated_at ON public.ml_categories;
DROP TRIGGER IF EXISTS handle_profiles_updated_at ON public.profiles;

-- 4. REMOVER FUNÇÕES (com CASCADE para dependências)
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.handle_updated_at() CASCADE;

-- 5. REMOVER ÍNDICES (exceto os padrão)
DROP INDEX IF EXISTS profiles_role_idx;
DROP INDEX IF EXISTS ml_integrations_tenant_id_idx;
DROP INDEX IF EXISTS ml_integrations_user_id_idx;
DROP INDEX IF EXISTS ml_integrations_ml_user_id_idx;
DROP INDEX IF EXISTS ml_integrations_status_idx;
DROP INDEX IF EXISTS ml_integrations_token_expires_at_idx;
DROP INDEX IF EXISTS ml_products_integration_id_idx;
DROP INDEX IF EXISTS ml_products_ml_item_id_idx;
DROP INDEX IF EXISTS ml_products_status_idx;

-- 6. REMOVER VIEWS PRIMEIRO
DROP VIEW IF EXISTS public.ml_integration_summary CASCADE;

-- 7. REMOVER TABELAS (na ordem correta por dependências)
DROP TABLE IF EXISTS public.ml_webhook_logs CASCADE;
DROP TABLE IF EXISTS public.ml_sync_logs CASCADE;
DROP TABLE IF EXISTS public.ml_products CASCADE;
DROP TABLE IF EXISTS public.ml_oauth_states CASCADE;
DROP TABLE IF EXISTS public.ml_integrations CASCADE;
DROP TABLE IF EXISTS public.ml_orders CASCADE;
DROP TABLE IF EXISTS public.ml_messages CASCADE;
DROP TABLE IF EXISTS public.ml_categories CASCADE;
DROP TABLE IF EXISTS public.tenants CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 8. VERIFICAR QUE TUDO FOI REMOVIDO
SELECT
  'VERIFICAÇÃO APÓS LIMPEZA' as status,
  schemaname,
  tablename,
  tableowner
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename LIKE 'ml_%'
ORDER BY tablename;

-- 9. VERIFICAR FUNÇÕES REMANESCENTES
SELECT
  'FUNÇÕES REMANESCENTES' as status,
  schemaname,
  functionname,
  arguments
FROM pg_catalog.pg_functions
WHERE schemaname = 'public'
ORDER BY functionname;