-- 🧹 MERCA FLOW - Remoção Específica das Funções Restantes
-- Execute este script no SQL Editor do Supabase Dashboard

-- Remover as 3 funções específicas que restaram
DROP FUNCTION IF EXISTS public.auto_assign_super_admin() CASCADE;
DROP FUNCTION IF EXISTS public.handle_updated_at() CASCADE; 
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

-- Verificar se foram removidas com sucesso
SELECT 
    'Funções removidas com sucesso!' as status,
    COUNT(*) as funcoes_restantes
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND proname NOT LIKE 'pg_%';

-- Verificar se o banco está completamente limpo
SELECT 
    'VERIFICAÇÃO FINAL:' as tipo,
    'Tabelas restantes: ' || COUNT(*) as resultado
FROM pg_tables 
WHERE schemaname = 'public'

UNION ALL

SELECT 
    'VERIFICAÇÃO FINAL:',
    'Funções restantes: ' || COUNT(*)
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND proname NOT LIKE 'pg_%'

UNION ALL

SELECT 
    'VERIFICAÇÃO FINAL:',
    'Policies restantes: ' || COUNT(*)
FROM pg_policies 
WHERE schemaname = 'public'

UNION ALL

SELECT 
    'VERIFICAÇÃO FINAL:',
    'Triggers restantes: ' || COUNT(*)
FROM information_schema.triggers
WHERE trigger_schema = 'public';

SELECT '🎉 Banco Supabase completamente limpo e pronto para o Merca Flow!' as resultado;