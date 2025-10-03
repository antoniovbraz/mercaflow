-- Análise do schema atual do Supabase
-- Este arquivo será usado para identificar objetos a serem removidos

-- Listar todas as funções
SELECT 
    schemaname,
    functionname,
    arguments
FROM pg_catalog.pg_functions 
WHERE schemaname NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
ORDER BY schemaname, functionname;

-- Listar todas as tabelas
SELECT 
    schemaname,
    tablename
FROM pg_catalog.pg_tables 
WHERE schemaname NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
ORDER BY schemaname, tablename;

-- Listar todas as views
SELECT 
    schemaname,
    viewname
FROM pg_catalog.pg_views 
WHERE schemaname NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
ORDER BY schemaname, viewname;

-- Listar triggers
SELECT 
    trigger_schema,
    trigger_name,
    event_object_table
FROM information_schema.triggers
WHERE trigger_schema NOT IN ('information_schema', 'pg_catalog')
ORDER BY trigger_schema, trigger_name;

-- Listar policies RLS
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd
FROM pg_policies
ORDER BY schemaname, tablename, policyname;