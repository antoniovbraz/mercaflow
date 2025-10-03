-- =====================================================
-- RESET COMPLETO - MERCA FLOW
-- Migration: Complete Reset and Rebuild
-- Data: 02/10/2025
-- =====================================================

-- 1. DROPAR TUDO (se existir)
DROP TABLE IF EXISTS ml_users CASCADE;
DROP TABLE IF EXISTS tenant_users CASCADE;
DROP TABLE IF EXISTS tenants CASCADE;
DROP TABLE IF EXISTS platform_owners CASCADE;

-- Dropar tipos
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS tenant_status CASCADE;

-- Dropar funções
DROP FUNCTION IF EXISTS is_super_admin() CASCADE;
DROP FUNCTION IF EXISTS get_user_context() CASCADE;

-- 2. RECRIAR TIPOS ENUM
CREATE TYPE user_role AS ENUM (
  'super_admin',     -- Platform owner (você)
  'platform_admin',  -- Technical team members
  'customer_admin',  -- Client account owners
  'customer_user',   -- Client team members
  'customer_viewer'  -- Read-only client access
);

CREATE TYPE tenant_status AS ENUM (
  'active',
  'suspended',
  'pending',
  'cancelled'
);

-- 3. TABELA PLATFORM OWNERS (Super Admins)
CREATE TABLE platform_owners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  role user_role NOT NULL DEFAULT 'super_admin',
  personal_tenant_enabled BOOLEAN DEFAULT true,
  personal_tenant_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABELA TENANTS (Clientes/Organizações)
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  status tenant_status DEFAULT 'active',
  owner_email TEXT,
  plan TEXT DEFAULT 'free',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABELA TENANT USERS (Usuários dos Clientes)
CREATE TABLE tenant_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL, -- Referência ao auth.users
  email TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'customer_user',
  is_owner BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, user_id)
);

-- 6. TABELA ML USERS (Integração Mercado Livre)
CREATE TABLE ml_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL, -- Referência ao auth.users
  ml_user_id BIGINT UNIQUE NOT NULL,
  ml_nickname TEXT,
  ml_email TEXT,
  access_token TEXT,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. ÍNDICES PARA PERFORMANCE
CREATE INDEX idx_tenant_users_tenant_id ON tenant_users(tenant_id);
CREATE INDEX idx_tenant_users_user_id ON tenant_users(user_id);
CREATE INDEX idx_ml_users_tenant_id ON ml_users(tenant_id);
CREATE INDEX idx_ml_users_user_id ON ml_users(user_id);

-- 8. RLS (Row Level Security)
ALTER TABLE platform_owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE ml_users ENABLE ROW LEVEL SECURITY;

-- 9. POLÍTICAS RLS

-- Platform owners: Super admins podem ver tudo
CREATE POLICY "Super admins can do everything on platform_owners" ON platform_owners
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM platform_owners po 
      WHERE po.email = auth.jwt() ->> 'email' 
      AND po.role = 'super_admin'
    )
  );

-- Tenants: Super admins veem tudo, usuários veem apenas seus tenants
CREATE POLICY "Super admins can see all tenants" ON tenants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM platform_owners po 
      WHERE po.email = auth.jwt() ->> 'email' 
      AND po.role = 'super_admin'
    )
  );

CREATE POLICY "Users can see their tenants" ON tenants
  FOR SELECT USING (
    id IN (
      SELECT tenant_id FROM tenant_users 
      WHERE user_id = auth.uid()
    )
  );

-- Tenant users: Super admins veem tudo, usuários veem apenas de seus tenants
CREATE POLICY "Super admins can manage all tenant users" ON tenant_users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM platform_owners po 
      WHERE po.email = auth.jwt() ->> 'email' 
      AND po.role = 'super_admin'
    )
  );

CREATE POLICY "Users can see tenant users from their tenants" ON tenant_users
  FOR SELECT USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_users tu
      WHERE tu.user_id = auth.uid()
    )
  );

-- ML users: Mesma lógica
CREATE POLICY "Super admins can manage all ml users" ON ml_users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM platform_owners po 
      WHERE po.email = auth.jwt() ->> 'email' 
      AND po.role = 'super_admin'
    )
  );

CREATE POLICY "Users can see ml users from their tenants" ON ml_users
  FOR SELECT USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_users tu
      WHERE tu.user_id = auth.uid()
    )
  );

-- 10. FUNÇÕES AUXILIARES

-- Função para verificar se é super admin
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM platform_owners 
    WHERE email = auth.jwt() ->> 'email' 
    AND role = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para obter contexto do usuário
CREATE OR REPLACE FUNCTION get_user_context()
RETURNS TABLE (
  is_super_admin BOOLEAN,
  tenant_ids UUID[],
  current_tenant_id UUID
) AS $$
BEGIN
  -- Verificar se é super admin
  IF is_super_admin() THEN
    RETURN QUERY SELECT 
      true as is_super_admin,
      ARRAY(SELECT id FROM tenants) as tenant_ids,
      NULL::UUID as current_tenant_id;
  ELSE
    -- Usuário normal
    RETURN QUERY SELECT 
      false as is_super_admin,
      ARRAY(SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid()) as tenant_ids,
      (SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid() LIMIT 1) as current_tenant_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. INSERIR DADOS INICIAIS

-- Inserir super admin
INSERT INTO platform_owners (email, role, personal_tenant_enabled) VALUES 
('peepers.shop@gmail.com', 'super_admin', true);

-- Inserir super admin adicional (seu email atual)
INSERT INTO platform_owners (email, role, personal_tenant_enabled) VALUES 
('antoniovbraz@gmail.com', 'super_admin', true);

-- Criar tenant exemplo
INSERT INTO tenants (name, slug, owner_email, plan) VALUES 
('Merca Flow Admin', 'mercaflow-admin', 'peepers.shop@gmail.com', 'enterprise');

-- 12. VERIFICAÇÕES FINAIS
SELECT 'platform_owners' as table_name, count(*) as records FROM platform_owners
UNION ALL
SELECT 'tenants' as table_name, count(*) as records FROM tenants;

-- Mostrar super admins criados
SELECT email, role, personal_tenant_enabled FROM platform_owners;