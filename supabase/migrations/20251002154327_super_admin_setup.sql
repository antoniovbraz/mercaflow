-- =====================================================
-- SUPER ADMIN SETUP - MERCA FLOW
-- Migration: Super Admin Configuration
-- Email Super Admin: peepers.shop@gmail.com
-- Data: 02/10/2025
-- =====================================================

-- 1. CRIAR TIPOS ENUM
CREATE TYPE user_role AS ENUM (
  'super_admin',     -- Platform owner (você)
  'platform_admin',  -- Technical team members  
  'customer_admin',  -- Client account owners
  'customer_user',   -- Client team members
  'customer_viewer'  -- Read-only client access
);

CREATE TYPE subscription_plan AS ENUM (
  'free',
  'starter', 
  'professional',
  'enterprise'
);

CREATE TYPE tenant_status AS ENUM (
  'active',
  'suspended', 
  'cancelled'
);

-- 2. CRIAR TABELA PLATFORM_OWNERS (Super Admins)
CREATE TABLE platform_owners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  role user_role DEFAULT 'super_admin',
  permissions JSONB DEFAULT '{
    "tenant_management": "*",
    "billing": "*", 
    "system": "*",
    "analytics": "*",
    "support": "*"
  }'::jsonb,
  
  -- Dual role: Super admin + cliente pessoal
  personal_tenant_id UUID,
  personal_tenant_enabled BOOLEAN DEFAULT false,
  
  -- Security & Audit
  two_factor_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP,
  
  -- Metadata
  full_name VARCHAR(255),
  phone VARCHAR(20),
  avatar_url TEXT
);

-- 3. CRIAR TABELA TENANTS (Clientes da plataforma)
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  
  -- Subscription & Billing
  plan subscription_plan DEFAULT 'free',
  status tenant_status DEFAULT 'active',
  billing_status VARCHAR(50) DEFAULT 'active',
  billing_email VARCHAR(255),
  
  -- Ownership
  owner_user_id UUID, -- Referência ao usuário principal do tenant
  created_by UUID REFERENCES platform_owners(id), -- Qual admin criou
  
  -- Platform owner special tenant
  is_platform_owner_tenant BOOLEAN DEFAULT false,
  
  -- Customização
  custom_domain VARCHAR(255),
  logo_url TEXT,
  primary_color VARCHAR(7) DEFAULT '#3B82F6',
  
  -- Settings & Metadata
  settings JSONB DEFAULT '{}'::jsonb,
  ml_integration_enabled BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. CRIAR TABELA TENANT_USERS (Usuários por tenant)
CREATE TABLE tenant_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL, -- Referência ao auth.users do Supabase
  email VARCHAR(255) NOT NULL,
  role user_role DEFAULT 'customer_user',
  
  -- Permissions específicas no tenant
  permissions JSONB DEFAULT '{}'::jsonb,
  
  -- Status
  status VARCHAR(20) DEFAULT 'active',
  invited_at TIMESTAMP,
  joined_at TIMESTAMP,
  last_active TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(tenant_id, user_id),
  UNIQUE(tenant_id, email)
);

-- 5. RECRIAR TABELA ML_USERS com multi-tenancy
CREATE TABLE IF NOT EXISTS ml_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Mercado Livre Data
  ml_user_id BIGINT NOT NULL,
  ml_nickname VARCHAR(255),
  ml_email VARCHAR(255),
  
  -- OAuth Tokens
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_in INTEGER,
  token_expires_at TIMESTAMP,
  
  -- User Info from ML
  user_info JSONB DEFAULT '{}'::jsonb,
  
  -- Status & Sync
  status VARCHAR(20) DEFAULT 'active',
  last_sync TIMESTAMP,
  sync_enabled BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(tenant_id, ml_user_id)
);

-- 6. INSERIR VOCÊ COMO SUPER ADMIN
INSERT INTO platform_owners (
    email,
    role,
    permissions,
    two_factor_enabled,
    full_name,
    created_at
) VALUES (
    'peepers.shop@gmail.com',  -- SEU EMAIL
    'super_admin',
    '{
        "tenant_management": "*",
        "billing": "*",
        "system": "*", 
        "analytics": "*",
        "support": "*",
        "impersonation": true,
        "database_access": true
    }'::jsonb,
    true,
    'Platform Owner', -- Altere para seu nome se desejar
    NOW()
);

-- 7. CRIAR SEU TENANT PESSOAL
DO $$
DECLARE
    owner_id UUID;
    tenant_id UUID;
BEGIN
    -- Buscar seu ID como super admin
    SELECT id INTO owner_id 
    FROM platform_owners 
    WHERE email = 'peepers.shop@gmail.com' 
    LIMIT 1;
    
    -- Criar seu tenant pessoal
    INSERT INTO tenants (
        name, 
        slug, 
        plan, 
        status, 
        billing_status,
        created_by,
        is_platform_owner_tenant
    ) VALUES (
        'Peepers Shop', -- Nome da sua loja
        'peepers-shop',
        'enterprise', -- Plano premium grátis para você
        'active',
        'exempt', -- Isento de cobrança
        owner_id,
        true -- Flag especial
    ) RETURNING id INTO tenant_id;
    
    -- Associar tenant ao seu profile de super admin
    UPDATE platform_owners 
    SET personal_tenant_id = tenant_id, 
        personal_tenant_enabled = true
    WHERE id = owner_id;
END;
$$;

-- 8. HABILITAR ROW LEVEL SECURITY
ALTER TABLE platform_owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE ml_users ENABLE ROW LEVEL SECURITY;

-- 9. CRIAR POLÍTICAS RLS - SUPER ADMIN BYPASS
CREATE POLICY "super_admin_full_access_platform_owners" ON platform_owners
    FOR ALL USING (
        email = auth.email() OR
        EXISTS (
            SELECT 1 FROM platform_owners 
            WHERE platform_owners.email = auth.email() 
            AND role = 'super_admin'
        )
    );

CREATE POLICY "super_admin_full_access_tenants" ON tenants
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM platform_owners 
            WHERE platform_owners.email = auth.email() 
            AND role = 'super_admin'
        )
        OR
        owner_user_id = auth.uid()
        OR
        id IN (
            SELECT tenant_id FROM tenant_users 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "tenant_isolation_tenant_users" ON tenant_users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM platform_owners 
            WHERE platform_owners.email = auth.email() 
            AND role = 'super_admin'
        )
        OR
        user_id = auth.uid()
        OR
        tenant_id IN (
            SELECT tenant_id FROM tenant_users 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "tenant_isolation_ml_users" ON ml_users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM platform_owners 
            WHERE platform_owners.email = auth.email() 
            AND role = 'super_admin'
        )
        OR
        tenant_id IN (
            SELECT tenant_id FROM tenant_users 
            WHERE user_id = auth.uid()
        )
    );

-- 10. FUNÇÕES HELPER
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM platform_owners 
        WHERE email = auth.email() 
        AND role = 'super_admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_user_context()
RETURNS TABLE(
    role TEXT, 
    tenant_id UUID, 
    is_platform_owner BOOLEAN,
    permissions JSONB
) AS $$
BEGIN
    -- Verificar se é super admin
    IF is_super_admin() THEN
        RETURN QUERY
        SELECT 
            po.role::TEXT,
            po.personal_tenant_id,
            true as is_platform_owner,
            po.permissions
        FROM platform_owners po 
        WHERE po.email = auth.email();
    ELSE
        -- Usuário normal - buscar contexto do tenant
        RETURN QUERY
        SELECT 
            tu.role::TEXT,
            tu.tenant_id,
            false as is_platform_owner,
            tu.permissions
        FROM tenant_users tu 
        WHERE tu.user_id = auth.uid()
        LIMIT 1;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. TRIGGERS PARA UPDATED_AT
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_platform_owners_updated_at 
    BEFORE UPDATE ON platform_owners 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tenants_updated_at 
    BEFORE UPDATE ON tenants 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tenant_users_updated_at 
    BEFORE UPDATE ON tenant_users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ml_users_updated_at 
    BEFORE UPDATE ON ml_users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- CONFIGURAÇÃO CONCLUÍDA!
-- 
-- ✅ Super Admin criado: peepers.shop@gmail.com
-- ✅ Tenant pessoal: "Peepers Shop" 
-- ✅ RLS configurado com bypass para super admin
-- ✅ Funções helper criadas
-- ✅ Multi-tenancy implementado
-- =====================================================