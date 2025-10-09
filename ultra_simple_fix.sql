-- FIX ULTRA SIMPLES - APENAS LIBERA ACESSO
-- Execute este script se os outros falharem

-- 1. DESABILITAR RLS TEMPORARIAMENTE
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ml_integrations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ml_products DISABLE ROW LEVEL SECURITY;

-- 2. REMOVER TODAS AS POLÍTICAS EXISTENTES
DO $$
DECLARE
    pol record;
BEGIN
    FOR pol IN
        SELECT schemaname, tablename, policyname
        FROM pg_policies
        WHERE schemaname = 'public'
        AND tablename IN ('profiles', 'ml_integrations', 'ml_products')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I',
                      pol.policyname, pol.schemaname, pol.tablename);
    END LOOP;
END $$;

-- 3. HABILITAR RLS NOVAMENTE
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ml_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ml_products ENABLE ROW LEVEL SECURITY;

-- 4. CRIAR POLÍTICA ÚNICA PARA CADA TABELA
CREATE POLICY "allow_all_authenticated" ON public.profiles
  FOR ALL TO authenticated USING (true);

CREATE POLICY "allow_all_authenticated" ON public.ml_integrations
  FOR ALL TO authenticated USING (true);

CREATE POLICY "allow_all_authenticated" ON public.ml_products
  FOR ALL TO authenticated USING (true);

-- 5. VERIFICAR RESULTADO
SELECT
  'POLÍTICAS ULTRA SIMPLES' as status,
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'ml_integrations', 'ml_products')
ORDER BY tablename;