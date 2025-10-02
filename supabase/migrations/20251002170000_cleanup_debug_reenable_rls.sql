-- =====================================================
-- 🧹 MERCA FLOW - CLEANUP AFTER DEBUG SUCCESS
-- =====================================================
-- Reabilita RLS e limpa configurações de debug

-- 🔒 Reabilitar RLS na tabela platform_owners
ALTER TABLE platform_owners ENABLE ROW LEVEL SECURITY;

-- 📊 Verificar se reabilitou
SELECT 
    'RLS RE-ENABLED' as status,
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'platform_owners';

-- ✅ Sucesso!
SELECT 'Super Admin system working - RLS re-enabled, debug complete!' AS final_status;