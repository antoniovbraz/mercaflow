-- =====================================================
-- 🔧 MERCA FLOW - TEMPORARY DISABLE RLS FOR DEBUG
-- =====================================================
-- Temporariamente desabilita RLS para testar super admin

-- 🔓 Desabilitar RLS temporariamente
ALTER TABLE platform_owners DISABLE ROW LEVEL SECURITY;

-- 📊 Verificar se desabilitou
SELECT 
    'RLS STATUS' as check_type,
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'platform_owners';

-- ✅ Sucesso!
SELECT 'RLS disabled temporarily for platform_owners debugging' AS status;