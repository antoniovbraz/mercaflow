-- =====================================================
-- QUERY PARA ANÁLISE COMPLETA DO SCHEMA ATUAL
-- =====================================================

-- 1. LISTAR TODAS AS TABELAS NO SCHEMA PUBLIC
SELECT 
    schemaname,
    tablename,
    tableowner,
    tablespace,
    hasindexes,
    hasrules,
    hastriggers,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- 2. LISTAR TODAS AS COLUNAS DE CADA TABELA
SELECT 
    t.table_name,
    c.column_name,
    c.data_type,
    c.character_maximum_length,
    c.is_nullable,
    c.column_default,
    c.ordinal_position
FROM information_schema.tables t
JOIN information_schema.columns c ON c.table_name = t.table_name
WHERE t.table_schema = 'public' 
    AND t.table_type = 'BASE TABLE'
ORDER BY t.table_name, c.ordinal_position;

-- 3. LISTAR CONSTRAINTS E FOREIGN KEYS
SELECT
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
LEFT JOIN information_schema.constraint_column_usage ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_type;

-- 4. LISTAR ÍNDICES
SELECT
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- 5. LISTAR VIEWS
SELECT 
    schemaname,
    viewname,
    definition
FROM pg_views
WHERE schemaname = 'public';

-- 6. LISTAR POLICIES RLS
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
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 7. VERIFICAR STATUS RLS DAS TABELAS
SELECT 
    t.tablename,
    t.rowsecurity as rls_enabled
FROM pg_tables t
WHERE t.schemaname = 'public'
ORDER BY t.tablename;

-- 8. CONTAR REGISTROS EM CADA TABELA
SELECT 
    schemaname,
    tablename,
    n_tup_ins as inserted_rows,
    n_tup_upd as updated_rows,
    n_tup_del as deleted_rows,
    n_live_tup as current_rows
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY tablename;
