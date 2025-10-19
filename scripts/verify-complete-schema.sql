-- ============================================================================
-- VERIFICAÇÃO COMPLETA DO SCHEMA DO SUPABASE
-- ============================================================================
-- Execute este script no SQL Editor do Supabase Dashboard
-- Verifica TODAS as tabelas, não apenas ML
-- ============================================================================

-- ============================================================================
-- 1. RESUMO GERAL DO BANCO DE DADOS
-- ============================================================================

SELECT 
  '========== RESUMO GERAL DO BANCO ==========' as secao;

SELECT 
  'Total de schemas' as metrica,
  COUNT(DISTINCT table_schema) as valor
FROM information_schema.tables
UNION ALL
SELECT 
  'Total de tabelas (schema public)',
  COUNT(*)
FROM information_schema.tables
WHERE table_schema = 'public'
UNION ALL
SELECT 
  'Total de colunas (schema public)',
  COUNT(*)
FROM information_schema.columns
WHERE table_schema = 'public'
UNION ALL
SELECT 
  'Total de indexes',
  COUNT(*)
FROM pg_indexes
WHERE schemaname = 'public'
UNION ALL
SELECT 
  'Total de constraints',
  COUNT(*)
FROM information_schema.table_constraints
WHERE table_schema = 'public'
UNION ALL
SELECT 
  'Total de triggers',
  COUNT(*)
FROM information_schema.triggers
WHERE event_object_schema = 'public'
UNION ALL
SELECT 
  'Total de functions',
  COUNT(*)
FROM information_schema.routines
WHERE routine_schema = 'public';

-- ============================================================================
-- 2. TODAS AS TABELAS DO SCHEMA PUBLIC
-- ============================================================================

SELECT 
  '========== TODAS AS TABELAS (PUBLIC) ==========' as secao;

SELECT 
  table_name as "Tabela",
  (
    SELECT COUNT(*) 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = t.table_name
  ) as "Colunas",
  (
    SELECT COUNT(*) 
    FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND tablename = t.table_name
  ) as "Indexes",
  (
    SELECT rowsecurity::text
    FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename = t.table_name
  ) as "RLS",
  pg_size_pretty(pg_total_relation_size(quote_ident(t.table_name)::regclass)) as "Tamanho"
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- ============================================================================
-- 3. DETALHES DE CADA TABELA (COLUNAS)
-- ============================================================================

SELECT 
  '========== DETALHES DAS TABELAS ==========' as secao;

-- Para cada tabela, mostrar suas colunas
SELECT 
  t.table_name as "Tabela",
  c.column_name as "Coluna",
  c.data_type as "Tipo",
  CASE 
    WHEN c.character_maximum_length IS NOT NULL THEN 
      c.data_type || '(' || c.character_maximum_length || ')'
    WHEN c.numeric_precision IS NOT NULL THEN
      c.data_type || '(' || c.numeric_precision || ',' || COALESCE(c.numeric_scale, 0) || ')'
    ELSE c.data_type
  END as "Tipo Completo",
  CASE WHEN c.is_nullable = 'YES' THEN '✅' ELSE '❌' END as "Nullable",
  COALESCE(c.column_default, '-') as "Default"
FROM information_schema.tables t
JOIN information_schema.columns c 
  ON t.table_name = c.table_name 
  AND t.table_schema = c.table_schema
WHERE t.table_schema = 'public' 
  AND t.table_type = 'BASE TABLE'
ORDER BY t.table_name, c.ordinal_position;

-- ============================================================================
-- 4. TODOS OS INDEXES
-- ============================================================================

SELECT 
  '========== INDEXES ==========' as secao;

SELECT 
  schemaname as "Schema",
  tablename as "Tabela",
  indexname as "Nome do Index",
  CASE 
    WHEN indexdef LIKE '%UNIQUE%' THEN 'UNIQUE'
    WHEN indexdef LIKE '%PRIMARY KEY%' THEN 'PRIMARY KEY'
    ELSE 'INDEX'
  END as "Tipo",
  indexdef as "Definição"
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- ============================================================================
-- 5. TODAS AS CONSTRAINTS
-- ============================================================================

SELECT 
  '========== CONSTRAINTS ==========' as secao;

SELECT 
  tc.table_name as "Tabela",
  tc.constraint_name as "Nome",
  tc.constraint_type as "Tipo",
  STRING_AGG(kcu.column_name, ', ' ORDER BY kcu.ordinal_position) as "Colunas",
  CASE 
    WHEN tc.constraint_type = 'FOREIGN KEY' THEN
      (SELECT ccu.table_name || '(' || STRING_AGG(ccu.column_name, ', ') || ')'
       FROM information_schema.constraint_column_usage ccu
       WHERE ccu.constraint_name = tc.constraint_name
       AND ccu.table_schema = tc.table_schema)
    ELSE NULL
  END as "Referencia"
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
WHERE tc.table_schema = 'public'
GROUP BY tc.table_name, tc.constraint_name, tc.constraint_type, tc.table_schema
ORDER BY tc.table_name, tc.constraint_type, tc.constraint_name;

-- ============================================================================
-- 6. FOREIGN KEYS (RELACIONAMENTOS)
-- ============================================================================

SELECT 
  '========== FOREIGN KEYS (RELACIONAMENTOS) ==========' as secao;

SELECT 
  tc.table_name as "Tabela Origem",
  kcu.column_name as "Coluna",
  ccu.table_name as "Tabela Destino",
  ccu.column_name as "Coluna Destino",
  tc.constraint_name as "Nome FK",
  rc.update_rule as "On Update",
  rc.delete_rule as "On Delete"
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage ccu
  ON tc.constraint_name = ccu.constraint_name
  AND tc.table_schema = ccu.table_schema
JOIN information_schema.referential_constraints rc
  ON tc.constraint_name = rc.constraint_name
  AND tc.table_schema = rc.constraint_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

-- ============================================================================
-- 7. ROW LEVEL SECURITY (RLS)
-- ============================================================================

SELECT 
  '========== ROW LEVEL SECURITY (RLS) ==========' as secao;

-- Status do RLS por tabela
SELECT 
  tablename as "Tabela",
  CASE WHEN rowsecurity THEN '✅ Habilitado' ELSE '❌ Desabilitado' END as "Status RLS",
  (
    SELECT COUNT(*)
    FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = t.tablename
  ) as "Qtd Policies"
FROM pg_tables t
WHERE schemaname = 'public'
ORDER BY tablename;

-- Todas as policies
SELECT 
  '========== POLÍTICAS RLS DETALHADAS ==========' as secao;

SELECT 
  schemaname as "Schema",
  tablename as "Tabela",
  policyname as "Nome da Policy",
  CASE 
    WHEN permissive = 'PERMISSIVE' THEN '✅ Permissive'
    ELSE '❌ Restrictive'
  END as "Tipo",
  cmd as "Comando",
  CASE 
    WHEN roles = '{public}' THEN 'PUBLIC'
    ELSE array_to_string(roles, ', ')
  END as "Roles",
  qual as "USING (condição)",
  with_check as "WITH CHECK (condição)"
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ============================================================================
-- 8. TRIGGERS
-- ============================================================================

SELECT 
  '========== TRIGGERS ==========' as secao;

SELECT 
  event_object_table as "Tabela",
  trigger_name as "Nome",
  string_agg(event_manipulation, ', ') as "Eventos",
  action_timing as "Timing",
  action_orientation as "Orientação",
  action_statement as "Ação"
FROM information_schema.triggers
WHERE event_object_schema = 'public'
GROUP BY 
  event_object_table,
  trigger_name,
  action_timing,
  action_orientation,
  action_statement
ORDER BY event_object_table, trigger_name;

-- ============================================================================
-- 9. FUNCTIONS/PROCEDURES
-- ============================================================================

SELECT 
  '========== FUNCTIONS/PROCEDURES ==========' as secao;

SELECT 
  routine_name as "Nome",
  routine_type as "Tipo",
  data_type as "Retorno",
  CASE 
    WHEN security_type = 'DEFINER' THEN 'SECURITY DEFINER'
    ELSE 'SECURITY INVOKER'
  END as "Security",
  external_language as "Linguagem"
FROM information_schema.routines
WHERE routine_schema = 'public'
ORDER BY routine_type, routine_name;

-- ============================================================================
-- 10. ENUMS (TIPOS CUSTOMIZADOS)
-- ============================================================================

SELECT 
  '========== ENUMS (TIPOS CUSTOMIZADOS) ==========' as secao;

SELECT 
  t.typname as "Nome do Enum",
  array_agg(e.enumlabel ORDER BY e.enumsortorder) as "Valores"
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
JOIN pg_namespace n ON t.typnamespace = n.oid
WHERE n.nspname = 'public'
GROUP BY t.typname
ORDER BY t.typname;

-- ============================================================================
-- 11. CONTAGEM DE REGISTROS EM TODAS AS TABELAS
-- ============================================================================

SELECT 
  '========== CONTAGEM DE REGISTROS ==========' as secao;

-- Gerar dinamicamente para todas as tabelas
DO $$
DECLARE
  table_name text;
  row_count bigint;
  result_text text := '';
BEGIN
  FOR table_name IN 
    SELECT t.table_name 
    FROM information_schema.tables t
    WHERE t.table_schema = 'public' 
    AND t.table_type = 'BASE TABLE'
    ORDER BY t.table_name
  LOOP
    EXECUTE format('SELECT COUNT(*) FROM %I', table_name) INTO row_count;
    RAISE NOTICE '% : % registros', table_name, row_count;
  END LOOP;
END $$;

-- Query estática para resultados tabulares
SELECT 
  table_name as "Tabela",
  'Execute o bloco DO acima para ver contagens' as "Registros"
FROM information_schema.tables
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- ============================================================================
-- 12. VERIFICAÇÕES ESPECÍFICAS - TABELAS ML
-- ============================================================================

SELECT 
  '========== VERIFICAÇÕES ESPECÍFICAS: TABELAS ML ==========' as secao;

-- Tabelas ML existentes
SELECT 
  'Tabelas ML' as "Categoria",
  table_name as "Nome",
  (
    SELECT COUNT(*) 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = t.table_name
  ) as "Colunas"
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_name LIKE 'ml_%'
ORDER BY table_name;

-- Verificação crítica: ml_integrations deve ter access_token, não encrypted_access_token
SELECT 
  'Verificação: ml_integrations' as "Tabela",
  CASE 
    WHEN EXISTS(
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'ml_integrations' 
      AND column_name = 'access_token'
    ) THEN '✅ access_token existe'
    ELSE '❌ access_token NÃO existe'
  END as "Status access_token",
  CASE 
    WHEN EXISTS(
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'ml_integrations' 
      AND column_name = 'encrypted_access_token'
    ) THEN '❌ encrypted_access_token existe (ERRADO!)'
    ELSE '✅ encrypted_access_token NÃO existe (correto)'
  END as "Status encrypted_access_token";

-- ============================================================================
-- 13. VERIFICAÇÕES ESPECÍFICAS - SISTEMA DE AUTENTICAÇÃO
-- ============================================================================

SELECT 
  '========== VERIFICAÇÕES: SISTEMA DE AUTENTICAÇÃO ==========' as secao;

-- Tabelas de autenticação
SELECT 
  table_name as "Tabela",
  (
    SELECT COUNT(*) 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = t.table_name
  ) as "Colunas",
  (
    SELECT rowsecurity::text
    FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename = t.table_name
  ) as "RLS"
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND (
    table_name IN ('profiles', 'tenants', 'user_roles', 'role_permissions')
    OR table_name LIKE 'auth_%'
  )
ORDER BY table_name;

-- ============================================================================
-- 14. ESTATÍSTICAS DE ESPAÇO
-- ============================================================================

SELECT 
  '========== ESTATÍSTICAS DE ESPAÇO ==========' as secao;

SELECT 
  schemaname as "Schema",
  tablename as "Tabela",
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as "Tamanho Total",
  pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as "Tamanho Tabela",
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) as "Tamanho Indexes"
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- ============================================================================
-- 15. DEPENDÊNCIAS ENTRE TABELAS (GRAFO)
-- ============================================================================

SELECT 
  '========== GRAFO DE DEPENDÊNCIAS (FOREIGN KEYS) ==========' as secao;

SELECT 
  tc.table_name as "De (Tabela)",
  STRING_AGG(DISTINCT ccu.table_name, ', ') as "Para (Tabelas)",
  COUNT(*) as "Qtd FKs"
FROM information_schema.table_constraints tc
JOIN information_schema.constraint_column_usage ccu
  ON tc.constraint_name = ccu.constraint_name
  AND tc.table_schema = ccu.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
GROUP BY tc.table_name
ORDER BY COUNT(*) DESC, tc.table_name;

-- ============================================================================
-- 16. SCHEMAS E EXTENSIONS
-- ============================================================================

SELECT 
  '========== SCHEMAS ==========' as secao;

SELECT 
  schema_name as "Schema",
  schema_owner as "Owner"
FROM information_schema.schemata
WHERE schema_name NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
ORDER BY schema_name;

SELECT 
  '========== EXTENSIONS ==========' as secao;

SELECT 
  extname as "Extension",
  extversion as "Versão"
FROM pg_extension
ORDER BY extname;

-- ============================================================================
-- 17. RESUMO FINAL
-- ============================================================================

SELECT 
  '========== RESUMO FINAL ==========' as secao;

WITH table_stats AS (
  SELECT 
    COUNT(*) FILTER (WHERE table_name LIKE 'ml_%') as ml_tables,
    COUNT(*) FILTER (WHERE table_name IN ('profiles', 'tenants', 'user_roles', 'role_permissions')) as auth_tables,
    COUNT(*) as total_tables
  FROM information_schema.tables
  WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
),
rls_stats AS (
  SELECT 
    COUNT(*) FILTER (WHERE rowsecurity = true) as tables_with_rls,
    COUNT(*) as total_tables
  FROM pg_tables
  WHERE schemaname = 'public'
)
SELECT 
  'Total de tabelas (public)' as "Métrica",
  ts.total_tables::text as "Valor"
FROM table_stats ts
UNION ALL
SELECT 
  'Tabelas ML (ml_*)',
  ts.ml_tables::text
FROM table_stats ts
UNION ALL
SELECT 
  'Tabelas de Auth',
  ts.auth_tables::text
FROM table_stats ts
UNION ALL
SELECT 
  'Tabelas com RLS',
  rs.tables_with_rls::text || ' de ' || rs.total_tables::text
FROM rls_stats rs
UNION ALL
SELECT 
  'Total de indexes',
  COUNT(*)::text
FROM pg_indexes
WHERE schemaname = 'public'
UNION ALL
SELECT 
  'Total de constraints',
  COUNT(*)::text
FROM information_schema.table_constraints
WHERE table_schema = 'public'
UNION ALL
SELECT 
  'Total de triggers',
  COUNT(*)::text
FROM information_schema.triggers
WHERE event_object_schema = 'public'
UNION ALL
SELECT 
  'Total de functions',
  COUNT(*)::text
FROM information_schema.routines
WHERE routine_schema = 'public';

-- ============================================================================
-- FIM DA VERIFICAÇÃO COMPLETA
-- ============================================================================

SELECT 
  '✅ Verificação completa do schema concluída!' as "Status",
  'Revise TODOS os resultados acima para ter uma visão completa do banco de dados.' as "Próximos Passos";
