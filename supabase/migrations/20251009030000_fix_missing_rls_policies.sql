-- Migração para corrigir políticas RLS faltantes
-- Data: 2025-10-09
-- Autor: Sistema de Análise MercaFlow

-- =====================================================
-- CORRIGIR POLÍTICAS RLS PARA PROFILES E ML_INTEGRATIONS
-- =====================================================

-- 1. PROFILES - Adicionar políticas RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Política para usuários verem/editarem apenas seu próprio perfil
CREATE POLICY "users_can_view_own_profile" ON public.profiles
  FOR SELECT 
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "users_can_update_own_profile" ON public.profiles
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Política para super admins gerenciarem todos os perfis
CREATE POLICY "super_admins_can_manage_all_profiles" ON public.profiles
  FOR ALL 
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT au.id 
      FROM auth.users au 
      WHERE au.email IN ('peepers.shop@gmail.com', 'antoniovbraz@gmail.com')
    )
  );

-- 2. ML_INTEGRATIONS - Adicionar políticas RLS
ALTER TABLE public.ml_integrations ENABLE ROW LEVEL SECURITY;

-- Política para usuários verem apenas suas próprias integrações (via tenant_id)
CREATE POLICY "users_can_view_own_ml_integrations" ON public.ml_integrations
  FOR SELECT 
  TO authenticated
  USING (tenant_id = auth.uid());

-- Política para usuários gerenciarem suas próprias integrações
CREATE POLICY "users_can_manage_own_ml_integrations" ON public.ml_integrations
  FOR ALL 
  TO authenticated
  USING (tenant_id = auth.uid())
  WITH CHECK (tenant_id = auth.uid());

-- Política para super admins gerenciarem todas as integrações
CREATE POLICY "super_admins_can_manage_all_ml_integrations" ON public.ml_integrations
  FOR ALL 
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT au.id 
      FROM auth.users au 
      WHERE au.email IN ('peepers.shop@gmail.com', 'antoniovbraz@gmail.com')
    )
  );

-- 3. VERIFICAR SE ML_PRODUCTS TEM TENANT_ID E POLÍTICAS RLS
-- Adicionar tenant_id se não existir
ALTER TABLE public.ml_products 
ADD COLUMN IF NOT EXISTS tenant_id UUID;

-- Popular tenant_id baseado na integração
UPDATE public.ml_products 
SET tenant_id = (
  SELECT mi.tenant_id 
  FROM public.ml_integrations mi 
  WHERE mi.id = ml_products.integration_id
)
WHERE tenant_id IS NULL AND integration_id IS NOT NULL;

-- Tornar tenant_id obrigatório
ALTER TABLE public.ml_products 
ALTER COLUMN tenant_id SET NOT NULL;

-- Adicionar referência para tenant
ALTER TABLE public.ml_products 
ADD CONSTRAINT ml_products_tenant_id_fkey 
FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;

-- Índice para performance
CREATE INDEX IF NOT EXISTS ml_products_tenant_id_idx ON public.ml_products(tenant_id);

-- Políticas RLS para ml_products
ALTER TABLE public.ml_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_can_view_own_ml_products" ON public.ml_products
  FOR SELECT 
  TO authenticated
  USING (tenant_id = auth.uid());

CREATE POLICY "users_can_manage_own_ml_products" ON public.ml_products
  FOR ALL 
  TO authenticated
  USING (tenant_id = auth.uid())
  WITH CHECK (tenant_id = auth.uid());

CREATE POLICY "super_admins_can_manage_all_ml_products" ON public.ml_products
  FOR ALL 
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT au.id 
      FROM auth.users au 
      WHERE au.email IN ('peepers.shop@gmail.com', 'antoniovbraz@gmail.com')
    )
  );

-- 4. GARANTIR QUE A VIEW ML_INTEGRATION_SUMMARY TENHA ACESSO ADEQUADO
-- A view já deve herdar as permissões das tabelas base através das políticas RLS

-- Comentário para documentação
COMMENT ON TABLE public.profiles IS 'Perfis dos usuários com isolamento por tenant via RLS';
COMMENT ON TABLE public.ml_integrations IS 'Integrações ML com isolamento por tenant via RLS';
COMMENT ON TABLE public.ml_products IS 'Produtos ML com isolamento por tenant via RLS';