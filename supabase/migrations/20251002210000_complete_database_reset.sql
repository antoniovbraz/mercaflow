-- =====================================================
-- 🧹 RESET COMPLETO DO BANCO DE DADOS
-- =====================================================
-- Remove todas as tabelas customizadas e tipos para começar limpo
-- Baseado na documentação oficial do Supabase
-- Data: 02/10/2025

-- 🗑️ DROPAR TODAS AS TABELAS CUSTOMIZADAS
DROP TABLE IF EXISTS ml_users CASCADE;
DROP TABLE IF EXISTS tenant_users CASCADE;
DROP TABLE IF EXISTS tenants CASCADE;
DROP TABLE IF EXISTS platform_owners CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS role_permissions CASCADE;

-- 🗑️ DROPAR TODOS OS TIPOS CUSTOMIZADOS
DROP TYPE IF EXISTS app_permission CASCADE;
DROP TYPE IF EXISTS app_role CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS subscription_plan CASCADE;
DROP TYPE IF EXISTS tenant_status CASCADE;

-- 🗑️ DROPAR TODAS AS FUNÇÕES CUSTOMIZADAS
DROP FUNCTION IF EXISTS custom_access_token_hook(jsonb) CASCADE;
DROP FUNCTION IF EXISTS authorize(app_permission) CASCADE;
DROP FUNCTION IF EXISTS is_super_admin() CASCADE;
DROP FUNCTION IF EXISTS is_admin() CASCADE;
DROP FUNCTION IF EXISTS current_user_role() CASCADE;
DROP FUNCTION IF EXISTS promote_to_super_admin(text) CASCADE;
DROP FUNCTION IF EXISTS get_user_context() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- 🗑️ DROPAR TRIGGERS (se existirem)
DO $$ 
BEGIN
    DROP TRIGGER IF EXISTS trigger_auto_super_admin ON auth.users CASCADE;
EXCEPTION WHEN OTHERS THEN 
    NULL;
END $$;

DO $$ 
BEGIN
    DROP TRIGGER IF EXISTS update_user_roles_updated_at ON user_roles CASCADE;
EXCEPTION WHEN OTHERS THEN 
    NULL;
END $$;

-- 🗑️ REVOGAR PERMISSÕES
REVOKE ALL ON SCHEMA public FROM supabase_auth_admin;
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM supabase_auth_admin;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM supabase_auth_admin;

-- ✅ VERIFICAR SE LIMPEZA FOI BEM-SUCEDIDA
DO $$
DECLARE
    custom_tables INTEGER;
    custom_types INTEGER;
    custom_functions INTEGER;
BEGIN
    -- Contar tabelas customizadas restantes
    SELECT COUNT(*) INTO custom_tables
    FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename NOT IN ('migrations', 'schema_migrations');
    
    -- Contar tipos customizados restantes
    SELECT COUNT(*) INTO custom_types
    FROM pg_type 
    WHERE typname IN ('app_permission', 'app_role', 'user_role', 'subscription_plan', 'tenant_status');
    
    -- Contar funções customizadas restantes
    SELECT COUNT(*) INTO custom_functions
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
    AND p.proname IN ('custom_access_token_hook', 'authorize', 'is_super_admin', 'is_admin', 'current_user_role', 'promote_to_super_admin', 'get_user_context');
    
    RAISE NOTICE '🧹 LIMPEZA COMPLETA REALIZADA:';
    RAISE NOTICE '📊 Tabelas customizadas restantes: %', custom_tables;
    RAISE NOTICE '🏷️ Tipos customizados restantes: %', custom_types;
    RAISE NOTICE '⚙️ Funções customizadas restantes: %', custom_functions;
    
    IF custom_tables = 0 AND custom_types = 0 AND custom_functions = 0 THEN
        RAISE NOTICE '✅ Banco de dados completamente limpo! Pronto para auth profissional.';
    ELSE
        RAISE NOTICE '⚠️ Alguns elementos não foram removidos. Verifique manualmente.';
    END IF;
END $$;