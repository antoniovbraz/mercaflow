-- =====================================================
-- 🌟 MERCA FLOW - WORLD-CLASS RBAC SYSTEM
-- =====================================================
-- Implementação completa de RBAC seguindo padrões oficiais do Supabase
-- Versão: World-Class Standards
-- Data: 2025-01-02

-- 🧹 LIMPEZA PRÉVIA
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS role_permissions CASCADE;
DROP TYPE IF EXISTS app_permission CASCADE;
DROP TYPE IF EXISTS app_role CASCADE;
DROP TRIGGER IF EXISTS trigger_auto_super_admin ON auth.users CASCADE;
DROP FUNCTION IF EXISTS custom_access_token_hook() CASCADE;
DROP FUNCTION IF EXISTS authorize() CASCADE;

-- 🎭 DEFINIR ROLES DO SISTEMA
CREATE TYPE app_role AS ENUM (
  'super_admin',  -- Acesso total ao sistema
  'admin',        -- Administrador da empresa
  'manager',      -- Gerente de departamento
  'user',         -- Usuário padrão
  'viewer'        -- Visualização apenas
);

-- 🔐 DEFINIR PERMISSÕES GRANULARES
CREATE TYPE app_permission AS ENUM (
  -- Sistema
  'system.manage',
  'system.view',
  
  -- Usuários
  'users.create',
  'users.read',
  'users.update',
  'users.delete',
  'users.invite',
  
  -- Empresas/Tenants
  'tenants.create',
  'tenants.read',
  'tenants.update',
  'tenants.delete',
  'tenants.manage',
  
  -- ML Usuários
  'ml_users.create',
  'ml_users.read',
  'ml_users.update',
  'ml_users.delete',
  'ml_users.export',
  
  -- Configurações
  'settings.read',
  'settings.update',
  
  -- Relatórios
  'reports.read',
  'reports.create',
  'reports.export'
);

-- 👥 TABELA DE ROLES DOS USUÁRIOS
CREATE TABLE user_roles (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- 🛡️ TABELA DE PERMISSÕES POR ROLE
CREATE TABLE role_permissions (
  id SERIAL PRIMARY KEY,
  role app_role NOT NULL,
  permission app_permission NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(role, permission)
);

-- 🔒 RLS PARA TABELAS
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

-- 📋 POPULAR PERMISSÕES POR ROLE

-- SUPER ADMIN: Tudo
INSERT INTO role_permissions (role, permission) 
SELECT 'super_admin', unnest(enum_range(NULL::app_permission));

-- ADMIN: Quase tudo (sem system.manage)
INSERT INTO role_permissions (role, permission) VALUES
  ('admin', 'system.view'),
  ('admin', 'users.create'),
  ('admin', 'users.read'),
  ('admin', 'users.update'),
  ('admin', 'users.delete'),
  ('admin', 'users.invite'),
  ('admin', 'tenants.read'),
  ('admin', 'tenants.update'),
  ('admin', 'tenants.manage'),
  ('admin', 'ml_users.create'),
  ('admin', 'ml_users.read'),
  ('admin', 'ml_users.update'),
  ('admin', 'ml_users.delete'),
  ('admin', 'ml_users.export'),
  ('admin', 'settings.read'),
  ('admin', 'settings.update'),
  ('admin', 'reports.read'),
  ('admin', 'reports.create'),
  ('admin', 'reports.export');

-- MANAGER: Gestão departamental
INSERT INTO role_permissions (role, permission) VALUES
  ('manager', 'users.read'),
  ('manager', 'users.update'),
  ('manager', 'users.invite'),
  ('manager', 'tenants.read'),
  ('manager', 'ml_users.create'),
  ('manager', 'ml_users.read'),
  ('manager', 'ml_users.update'),
  ('manager', 'ml_users.delete'),
  ('manager', 'ml_users.export'),
  ('manager', 'settings.read'),
  ('manager', 'reports.read'),
  ('manager', 'reports.create'),
  ('manager', 'reports.export');

-- USER: Operações básicas
INSERT INTO role_permissions (role, permission) VALUES
  ('user', 'tenants.read'),
  ('user', 'ml_users.create'),
  ('user', 'ml_users.read'),
  ('user', 'ml_users.update'),
  ('user', 'settings.read'),
  ('user', 'reports.read');

-- VIEWER: Apenas visualização
INSERT INTO role_permissions (role, permission) VALUES
  ('viewer', 'tenants.read'),
  ('viewer', 'ml_users.read'),
  ('viewer', 'settings.read'),
  ('viewer', 'reports.read');

-- 🎯 FUNÇÃO DE AUTORIZAÇÃO
CREATE OR REPLACE FUNCTION authorize(
  requested_permission app_permission
)
RETURNS boolean AS $$
DECLARE
  user_role app_role;
BEGIN
  -- Pegar role do usuário atual
  SELECT role INTO user_role
  FROM user_roles
  WHERE user_id = auth.uid()
  LIMIT 1;

  -- Se não tem role, negado
  IF user_role IS NULL THEN
    RETURN false;
  END IF;

  -- Verificar se tem a permissão
  RETURN EXISTS (
    SELECT 1 FROM role_permissions
    WHERE role = user_role
    AND permission = requested_permission
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 🪝 CUSTOM ACCESS TOKEN HOOK
CREATE OR REPLACE FUNCTION custom_access_token_hook(event jsonb)
RETURNS jsonb AS $$
DECLARE
  claims jsonb;
  user_role app_role;
BEGIN
  -- Buscar role do usuário
  SELECT role INTO user_role
  FROM user_roles
  WHERE user_id = (event->>'user_id')::uuid
  LIMIT 1;

  -- Adicionar claims customizados
  claims := event->'claims';
  
  IF user_role IS NOT NULL THEN
    claims := jsonb_set(claims, '{app_role}', to_jsonb(user_role::text));
  END IF;

  -- Retornar evento modificado
  RETURN jsonb_set(event, '{claims}', claims);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 🔗 HOOK SERÁ CONFIGURADO VIA DASHBOARD
-- Custom Access Token Hook deve ser configurado manualmente no Supabase Dashboard

-- 👑 INSERIR SUPER ADMINS (APENAS SE EXISTIREM)
INSERT INTO user_roles (user_id, role) 
SELECT id, 'super_admin'::app_role
FROM auth.users 
WHERE email IN ('peepers.shop@gmail.com', 'antoniovbraz@gmail.com')
ON CONFLICT (user_id, role) DO NOTHING;

-- 🔄 TRIGGERS PARA UPDATED_AT
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_roles_updated_at
  BEFORE UPDATE ON user_roles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 📊 POLÍTICAS RLS

-- user_roles: Usuários podem ver seus próprios roles, admins veem tudo
CREATE POLICY "Users can view own roles" ON user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles" ON user_roles
  FOR SELECT USING (authorize('users.read'));

CREATE POLICY "Admins can manage roles" ON user_roles
  FOR ALL USING (authorize('users.update'));

-- role_permissions: Todos podem ler (para verificação de permissões)
CREATE POLICY "Anyone can read permissions" ON role_permissions
  FOR SELECT USING (true);

CREATE POLICY "Only super admins can manage permissions" ON role_permissions
  FOR ALL USING (authorize('system.manage'));

-- ✅ VERIFICAÇÃO FINAL
DO $$
DECLARE
  total_permissions INT;
  total_roles INT;
  super_admins INT;
BEGIN
  SELECT COUNT(*) INTO total_permissions FROM role_permissions;
  SELECT COUNT(DISTINCT role) INTO total_roles FROM role_permissions;
  SELECT COUNT(*) INTO super_admins FROM user_roles WHERE role = 'super_admin';
  
  RAISE NOTICE '🌟 WORLD-CLASS RBAC SYSTEM DEPLOYED!';
  RAISE NOTICE '📊 Total Permissions: %', total_permissions;
  RAISE NOTICE '🎭 Total Roles: %', total_roles;
  RAISE NOTICE '👑 Super Admins: %', super_admins;
  RAISE NOTICE '✅ Sistema pronto para Custom Claims!';
END $$;