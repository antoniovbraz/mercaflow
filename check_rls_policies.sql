-- Verificar políticas RLS das tabelas problemáticas
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('profiles', 'ml_integrations', 'ml_integration_summary')
ORDER BY tablename, policyname;

-- Verificar se RLS está habilitado nas tabelas
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename IN ('profiles', 'ml_integrations')
AND schemaname = 'public';

-- Verificar se a view ml_integration_summary existe
SELECT 
    schemaname,
    viewname,
    definition
FROM pg_views 
WHERE viewname = 'ml_integration_summary'
AND schemaname = 'public';