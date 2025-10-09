-- CORREÇÃO DAS POLÍTICAS RLS PARA ML E PERFIS
-- Execute este script APÓS o script fix_missing_profiles.sql

-- 1. DESABILITAR TEMPORARIAMENTE RLS PARA DIAGNÓSTICO
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ml_integrations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ml_products DISABLE ROW LEVEL SECURITY;

-- 2. REMOVER POLÍTICAS ANTIGAS QUE PODEM ESTAR CONFLITANDO
DROP POLICY IF EXISTS "users_can_view_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "users_can_update_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "super_admins_can_manage_all_profiles" ON public.profiles;
DROP POLICY IF EXISTS "users_can_view_own_ml_integrations" ON public.ml_integrations;
DROP POLICY IF EXISTS "users_can_manage_own_ml_integrations" ON public.ml_integrations;
DROP POLICY IF EXISTS "super_admins_can_manage_all_ml_integrations" ON public.ml_integrations;
DROP POLICY IF EXISTS "users_can_view_own_ml_products" ON public.ml_products;
DROP POLICY IF EXISTS "users_can_manage_own_ml_products" ON public.ml_products;
DROP POLICY IF EXISTS "super_admins_can_manage_all_ml_products" ON public.ml_products;

-- 3. RECRIAR POLÍTICAS RLS CORRETAS
-- Para profiles: usuários podem ver/editar seu próprio perfil
CREATE POLICY "profiles_select_policy" ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "profiles_update_policy" ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Super admins podem gerenciar todos os perfis
CREATE POLICY "profiles_super_admin_policy" ON public.profiles
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT au.id
      FROM auth.users au
      WHERE au.email IN ('peepers.shop@gmail.com', 'antoniovbraz@gmail.com')
    )
  );

-- Para ml_integrations: usuários podem gerenciar suas próprias integrações
CREATE POLICY "ml_integrations_select_policy" ON public.ml_integrations
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "ml_integrations_insert_policy" ON public.ml_integrations
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "ml_integrations_update_policy" ON public.ml_integrations
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "ml_integrations_delete_policy" ON public.ml_integrations
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Super admins podem gerenciar todas as integrações
CREATE POLICY "ml_integrations_super_admin_policy" ON public.ml_integrations
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT au.id
      FROM auth.users au
      WHERE au.email IN ('peepers.shop@gmail.com', 'antoniovbraz@gmail.com')
    )
  );

-- Para ml_products: usuários podem ver seus próprios produtos
CREATE POLICY "ml_products_select_policy" ON public.ml_products
  FOR SELECT
  TO authenticated
  USING (
    integration_id IN (
      SELECT id FROM public.ml_integrations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "ml_products_insert_policy" ON public.ml_products
  FOR INSERT
  TO authenticated
  WITH CHECK (
    integration_id IN (
      SELECT id FROM public.ml_integrations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "ml_products_update_policy" ON public.ml_products
  FOR UPDATE
  TO authenticated
  USING (
    integration_id IN (
      SELECT id FROM public.ml_integrations WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    integration_id IN (
      SELECT id FROM public.ml_integrations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "ml_products_delete_policy" ON public.ml_products
  FOR DELETE
  TO authenticated
  USING (
    integration_id IN (
      SELECT id FROM public.ml_integrations WHERE user_id = auth.uid()
    )
  );

-- Super admins podem gerenciar todos os produtos
CREATE POLICY "ml_products_super_admin_policy" ON public.ml_products
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT au.id
      FROM auth.users au
      WHERE au.email IN ('peepers.shop@gmail.com', 'antoniovbraz@gmail.com')
    )
  );

-- 4. REABILITAR RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ml_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ml_products ENABLE ROW LEVEL SECURITY;

-- 5. VERIFICAR POLÍTICAS CRIADAS
SELECT
  'POLÍTICAS RLS CRIADAS' as status,
  schemaname,
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'ml_integrations', 'ml_products')
ORDER BY tablename, policyname;