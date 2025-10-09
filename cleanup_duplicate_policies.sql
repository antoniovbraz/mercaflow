-- LIMPEZA DE POLÍTICAS RLS DUPLICADAS
-- Execute este script para remover políticas conflitantes

-- 1. REMOVER POLÍTICAS DUPLICADAS/ANTIGAS DOS PROFILES
DROP POLICY IF EXISTS "profiles_own_access" ON public.profiles;
DROP POLICY IF EXISTS "profiles_super_admin_access" ON public.profiles;

-- 2. REMOVER POLÍTICAS ANTIGAS DAS ML_INTEGRATIONS
DROP POLICY IF EXISTS "Users can manage own ML integrations" ON public.ml_integrations;

-- 3. REMOVER POLÍTICAS ANTIGAS DAS ML_PRODUCTS
DROP POLICY IF EXISTS "Users can view own ML products" ON public.ml_products;

-- 4. VERIFICAR POLÍTICAS RESTANTES (DEVEM SER APENAS AS LIMPA)
SELECT
  'POLÍTICAS RLS APÓS LIMPEZA' as status,
  schemaname,
  tablename,
  policyname,
  cmd,
  CASE
    WHEN policyname LIKE '%super_admin%' THEN 'SUPER ADMIN'
    WHEN policyname LIKE '%select%' THEN 'SELECT'
    WHEN policyname LIKE '%insert%' THEN 'INSERT'
    WHEN policyname LIKE '%update%' THEN 'UPDATE'
    WHEN policyname LIKE '%delete%' THEN 'DELETE'
    ELSE 'OUTROS'
  END as tipo
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'ml_integrations', 'ml_products')
ORDER BY tablename, policyname;

-- 5. CONTAR POLÍTICAS POR TABELA
SELECT
  'CONTAGEM DE POLÍTICAS' as status,
  tablename,
  COUNT(*) as total_policies,
  COUNT(CASE WHEN cmd = 'SELECT' THEN 1 END) as select_policies,
  COUNT(CASE WHEN cmd = 'INSERT' THEN 1 END) as insert_policies,
  COUNT(CASE WHEN cmd = 'UPDATE' THEN 1 END) as update_policies,
  COUNT(CASE WHEN cmd = 'DELETE' THEN 1 END) as delete_policies,
  COUNT(CASE WHEN cmd = 'ALL' THEN 1 END) as all_policies
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'ml_integrations', 'ml_products')
GROUP BY tablename
ORDER BY tablename;