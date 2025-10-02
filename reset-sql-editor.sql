-- RESET SIMPLES PARA EXECUTAR NO SQL EDITOR DO SUPABASE
-- Execute este script diretamente no SQL Editor: https://supabase.com/dashboard/project/pnzbnciiokgiadkfgrcn/sql

-- Dropar tabelas em ordem segura
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS role_permissions CASCADE;
DROP TABLE IF EXISTS ml_users CASCADE;
DROP TABLE IF EXISTS tenant_users CASCADE;
DROP TABLE IF EXISTS tenants CASCADE;
DROP TABLE IF EXISTS platform_owners CASCADE;

-- Dropar tipos
DROP TYPE IF EXISTS app_permission CASCADE;
DROP TYPE IF EXISTS app_role CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS subscription_plan CASCADE;
DROP TYPE IF EXISTS tenant_status CASCADE;

-- Dropar funções
DROP FUNCTION IF EXISTS custom_access_token_hook(jsonb) CASCADE;
DROP FUNCTION IF EXISTS authorize(app_permission) CASCADE;
DROP FUNCTION IF EXISTS is_super_admin() CASCADE;
DROP FUNCTION IF EXISTS is_admin() CASCADE;
DROP FUNCTION IF EXISTS current_user_role() CASCADE;
DROP FUNCTION IF EXISTS promote_to_super_admin(text) CASCADE;
DROP FUNCTION IF EXISTS get_user_context() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Verificar limpeza
SELECT 'Reset completado - banco limpo!' as status;