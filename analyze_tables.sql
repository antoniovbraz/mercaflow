-- Análise completa das tabelas atuais
SELECT 
    'TABELAS CRIADAS:' as info,
    tablename,
    schemaname,
    hasindexes,
    hastriggers,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;