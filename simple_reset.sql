-- RESET SIMPLIFICADO - APENAS O ESSENCIAL
-- Execute este script se o completo falhar

-- 1. REMOVER POLÍTICAS CONFLITANTES
DROP POLICY IF EXISTS "users_can_read_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "users_can_update_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "super_admins_full_access" ON public.profiles;
DROP POLICY IF EXISTS "profiles_access" ON public.profiles;

-- 2. RECRIAR POLÍTICA ÚNICA PARA PERFIS
CREATE POLICY "simple_profile_access" ON public.profiles
  FOR ALL
  TO authenticated
  USING (true);  -- Permite tudo para usuários autenticados

-- 3. FAZER O MESMO PARA ML_INTEGRATIONS
DROP POLICY IF EXISTS "users_can_view_own_ml_integrations" ON public.ml_integrations;
DROP POLICY IF EXISTS "users_can_manage_own_ml_integrations" ON public.ml_integrations;
DROP POLICY IF EXISTS "super_admins_can_manage_all_ml_integrations" ON public.ml_integrations;
DROP POLICY IF EXISTS "ml_integrations_access" ON public.ml_integrations;

CREATE POLICY "simple_ml_integrations_access" ON public.ml_integrations
  FOR ALL
  TO authenticated
  USING (true);  -- Permite tudo para usuários autenticados

-- 4. FAZER O MESMO PARA ML_PRODUCTS
DROP POLICY IF EXISTS "users_can_view_own_ml_products" ON public.ml_products;
DROP POLICY IF EXISTS "users_can_manage_own_ml_products" ON public.ml_products;
DROP POLICY IF EXISTS "super_admins_can_manage_all_ml_products" ON public.ml_products;
DROP POLICY IF EXISTS "ml_products_access" ON public.ml_products;

CREATE POLICY "simple_ml_products_access" ON public.ml_products
  FOR ALL
  TO authenticated
  USING (true);  -- Permite tudo para usuários autenticados

-- 5. VERIFICAR POLÍTICAS ATUAIS
SELECT
  'POLÍTICAS SIMPLIFICADAS' as status,
  schemaname,
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'ml_integrations', 'ml_products')
ORDER BY tablename, policyname;