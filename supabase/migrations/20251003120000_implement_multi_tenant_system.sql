-- =====================================================
-- 🏢 SISTEMA MULTI-TENANT BÁSICO
-- =====================================================
-- Implementa sistema multi-tenant simples com isolamento completo
-- Data: 03/10/2025

-- 🏢 TABELA DE TENANTS
CREATE TABLE IF NOT EXISTS public.tenants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 🔗 TABELA DE USUÁRIOS POR TENANT
CREATE TABLE IF NOT EXISTS public.tenant_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'owner')),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tenant_id, user_id)
);

-- 📊 ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_tenants_slug ON public.tenants(slug);
CREATE INDEX IF NOT EXISTS idx_tenants_status ON public.tenants(status);
CREATE INDEX IF NOT EXISTS idx_tenant_users_tenant ON public.tenant_users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_users_user ON public.tenant_users(user_id);
CREATE INDEX IF NOT EXISTS idx_tenant_users_role ON public.tenant_users(tenant_id, role);

-- 🔒 POLÍTICAS RLS PARA TENANTS
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_users ENABLE ROW LEVEL SECURITY;

-- Usuários podem ver apenas tenants onde estão associados
CREATE POLICY "Users can view their tenants" ON public.tenants
  FOR SELECT USING (
    id IN (
      SELECT tenant_id FROM public.tenant_users 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- Admins e super_admins podem ver todos os tenants
CREATE POLICY "Admins can view all tenants" ON public.tenants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() 
      AND p.role IN ('admin', 'super_admin')
    )
  );

-- Super admins podem gerenciar tenants
CREATE POLICY "Super admins can manage tenants" ON public.tenants
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() 
      AND p.role = 'super_admin'
    )
  );

-- Usuários podem ver suas associações de tenant
CREATE POLICY "Users can view their tenant associations" ON public.tenant_users
  FOR SELECT USING (user_id = auth.uid());

-- Owners podem gerenciar usuários do seu tenant
CREATE POLICY "Tenant owners can manage tenant users" ON public.tenant_users
  FOR ALL USING (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_users 
      WHERE user_id = auth.uid() 
      AND role = 'owner' 
      AND status = 'active'
    )
  );

-- Super admins podem gerenciar todas as associações
CREATE POLICY "Super admins can manage all tenant associations" ON public.tenant_users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() 
      AND p.role = 'super_admin'
    )
  );

-- 🚀 FUNÇÃO PARA CRIAR TENANT AUTOMATICAMENTE APÓS CADASTRO
CREATE OR REPLACE FUNCTION public.create_user_tenant()
RETURNS TRIGGER AS $$
DECLARE
  new_tenant_id UUID;
  tenant_name TEXT;
  tenant_slug TEXT;
BEGIN
  -- Criar nome e slug baseado no email
  tenant_name := COALESCE(NEW.full_name, split_part(NEW.email, '@', 1)) || '''s Workspace';
  tenant_slug := lower(replace(replace(split_part(NEW.email, '@', 1), '.', '-'), '_', '-'));
  
  -- Garantir slug único
  WHILE EXISTS (SELECT 1 FROM public.tenants WHERE slug = tenant_slug) LOOP
    tenant_slug := tenant_slug || '-' || (random() * 1000)::int;
  END LOOP;
  
  -- Criar tenant
  INSERT INTO public.tenants (name, slug)
  VALUES (tenant_name, tenant_slug)
  RETURNING id INTO new_tenant_id;
  
  -- Associar usuário como owner do tenant
  INSERT INTO public.tenant_users (tenant_id, user_id, role, status)
  VALUES (new_tenant_id, NEW.id, 'owner', 'active');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 🎯 TRIGGER PARA CRIAR TENANT AUTOMATICAMENTE
DROP TRIGGER IF EXISTS on_auth_user_created_tenant ON public.profiles;
CREATE TRIGGER on_auth_user_created_tenant
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.create_user_tenant();

-- 📋 ATUALIZAR FUNÇÃO UPDATE_UPDATED_AT PARA TENANTS
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
DROP TRIGGER IF EXISTS update_tenants_updated_at ON public.tenants;
CREATE TRIGGER update_tenants_updated_at 
  BEFORE UPDATE ON public.tenants 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_tenant_users_updated_at ON public.tenant_users;
CREATE TRIGGER update_tenant_users_updated_at 
  BEFORE UPDATE ON public.tenant_users 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 🎉 LOG DE CONCLUSÃO
DO $$
BEGIN
  RAISE NOTICE '✅ Sistema multi-tenant implementado com sucesso!';
  RAISE NOTICE '🏢 Tabelas criadas: tenants, tenant_users';
  RAISE NOTICE '🔒 RLS habilitado com políticas apropriadas';
  RAISE NOTICE '🚀 Trigger para criação automática de tenant configurado';
END $$;