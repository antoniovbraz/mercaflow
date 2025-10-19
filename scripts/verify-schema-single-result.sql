-- ============================================================================
-- VERIFICAÇÃO COMPLETA DO SCHEMA - RESULTADO ÚNICO
-- ============================================================================
-- Este script retorna UM ÚNICO RESULTADO consolidado
-- Use este no Supabase SQL Editor que só mostra o último SELECT
-- ============================================================================

-- Cria uma tabela temporária para armazenar todos os resultados
CREATE TEMP TABLE IF NOT EXISTS verificacao_resultados (
  secao TEXT,
  categoria TEXT,
  item TEXT,
  valor TEXT,
  detalhes TEXT,
  ordem INT
);

-- Limpa a tabela se já existir
TRUNCATE TABLE verificacao_resultados;

-- ============================================================================
-- 1. RESUMO GERAL
-- ============================================================================

INSERT INTO verificacao_resultados (secao, categoria, item, valor, ordem)
SELECT 
  '1. RESUMO GERAL' as secao,
  'Estatísticas' as categoria,
  'Total de tabelas (public)' as item,
  COUNT(*)::text as valor,
  1 as ordem
FROM information_schema.tables
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';

INSERT INTO verificacao_resultados (secao, categoria, item, valor, ordem)
SELECT 
  '1. RESUMO GERAL',
  'Estatísticas',
  'Tabelas ML (ml_*)',
  COUNT(*)::text,
  2
FROM information_schema.tables
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
  AND table_name LIKE 'ml_%';

INSERT INTO verificacao_resultados (secao, categoria, item, valor, ordem)
SELECT 
  '1. RESUMO GERAL',
  'Estatísticas',
  'Total de colunas',
  COUNT(*)::text,
  3
FROM information_schema.columns
WHERE table_schema = 'public';

INSERT INTO verificacao_resultados (secao, categoria, item, valor, ordem)
SELECT 
  '1. RESUMO GERAL',
  'Estatísticas',
  'Total de indexes',
  COUNT(*)::text,
  4
FROM pg_indexes
WHERE schemaname = 'public';

INSERT INTO verificacao_resultados (secao, categoria, item, valor, ordem)
SELECT 
  '1. RESUMO GERAL',
  'Estatísticas',
  'Total de constraints',
  COUNT(*)::text,
  5
FROM information_schema.table_constraints
WHERE table_schema = 'public';

INSERT INTO verificacao_resultados (secao, categoria, item, valor, ordem)
SELECT 
  '1. RESUMO GERAL',
  'Estatísticas',
  'Tabelas com RLS',
  COUNT(*)::text,
  6
FROM pg_tables
WHERE schemaname = 'public' AND rowsecurity = true;

-- ============================================================================
-- 2. LISTA DE TODAS AS TABELAS
-- ============================================================================

INSERT INTO verificacao_resultados (secao, categoria, item, valor, detalhes, ordem)
SELECT 
  '2. TODAS AS TABELAS' as secao,
  table_name as categoria,
  'Colunas' as item,
  (SELECT COUNT(*)::text FROM information_schema.columns c 
   WHERE c.table_schema = 'public' AND c.table_name = t.table_name) as valor,
  'RLS: ' || CASE WHEN (SELECT rowsecurity FROM pg_tables WHERE schemaname='public' AND tablename=t.table_name) 
    THEN '✅' ELSE '❌' END as detalhes,
  100 + ROW_NUMBER() OVER (ORDER BY table_name) as ordem
FROM information_schema.tables t
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';

-- ============================================================================
-- 3. TABELAS ML ESPECÍFICAS
-- ============================================================================

INSERT INTO verificacao_resultados (secao, categoria, item, valor, detalhes, ordem)
SELECT 
  '3. TABELAS ML' as secao,
  table_name as categoria,
  'Colunas' as item,
  (SELECT COUNT(*)::text FROM information_schema.columns c 
   WHERE c.table_schema = 'public' AND c.table_name = t.table_name) as valor,
  'Status: ' || CASE 
    WHEN table_name = 'ml_integrations' THEN 
      CASE WHEN EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='ml_integrations' AND column_name='access_token')
        THEN '✅ access_token OK'
        ELSE '❌ access_token FALTANDO'
      END
    ELSE '✅'
  END as detalhes,
  200 + ROW_NUMBER() OVER (ORDER BY table_name) as ordem
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
  AND table_name LIKE 'ml_%';

-- ============================================================================
-- 4. VERIFICAÇÃO CRÍTICA: ml_integrations
-- ============================================================================

INSERT INTO verificacao_resultados (secao, categoria, item, valor, detalhes, ordem)
VALUES 
  ('4. VERIFICAÇÃO CRÍTICA', 'ml_integrations', 'access_token', 
   CASE WHEN EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='ml_integrations' AND column_name='access_token')
     THEN '✅ Existe' ELSE '❌ NÃO existe' END,
   'Coluna correta para tokens', 300),
  ('4. VERIFICAÇÃO CRÍTICA', 'ml_integrations', 'encrypted_access_token',
   CASE WHEN EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='ml_integrations' AND column_name='encrypted_access_token')
     THEN '❌ Existe (ERRADO!)' ELSE '✅ NÃO existe (correto)' END,
   'Coluna antiga removida', 301);

-- ============================================================================
-- 5. COLUNAS DE ml_integrations
-- ============================================================================

INSERT INTO verificacao_resultados (secao, categoria, item, valor, detalhes, ordem)
SELECT 
  '5. COLUNAS ml_integrations' as secao,
  column_name as categoria,
  data_type as item,
  CASE WHEN is_nullable = 'YES' THEN 'NULL' ELSE 'NOT NULL' END as valor,
  COALESCE(column_default, '-') as detalhes,
  400 + ordinal_position as ordem
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'ml_integrations'
ORDER BY ordinal_position;

-- ============================================================================
-- 6. INDEXES DAS TABELAS ML
-- ============================================================================

INSERT INTO verificacao_resultados (secao, categoria, item, valor, detalhes, ordem)
SELECT 
  '6. INDEXES ML' as secao,
  tablename as categoria,
  indexname as item,
  CASE 
    WHEN indexdef LIKE '%UNIQUE%' THEN 'UNIQUE'
    WHEN indexdef LIKE '%PRIMARY KEY%' THEN 'PRIMARY KEY'
    ELSE 'INDEX'
  END as valor,
  indexdef as detalhes,
  500 + ROW_NUMBER() OVER (ORDER BY tablename, indexname) as ordem
FROM pg_indexes
WHERE schemaname = 'public' 
  AND tablename LIKE 'ml_%';

-- ============================================================================
-- 7. FOREIGN KEYS
-- ============================================================================

INSERT INTO verificacao_resultados (secao, categoria, item, valor, detalhes, ordem)
SELECT 
  '7. FOREIGN KEYS' as secao,
  tc.table_name as categoria,
  kcu.column_name as item,
  ccu.table_name as valor,
  'Para: ' || ccu.table_name || '(' || ccu.column_name || ') | ON DELETE: ' || rc.delete_rule as detalhes,
  600 + ROW_NUMBER() OVER (ORDER BY tc.table_name, kcu.column_name) as ordem
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
  AND tc.table_schema = 'public';

-- ============================================================================
-- 8. RLS POLICIES
-- ============================================================================

INSERT INTO verificacao_resultados (secao, categoria, item, valor, detalhes, ordem)
SELECT 
  '8. RLS POLICIES' as secao,
  tablename as categoria,
  policyname as item,
  cmd as valor,
  'Roles: ' || array_to_string(roles, ', ') || ' | USING: ' || COALESCE(qual::text, 'N/A') as detalhes,
  700 + ROW_NUMBER() OVER (ORDER BY tablename, policyname) as ordem
FROM pg_policies
WHERE schemaname = 'public';

-- ============================================================================
-- 9. TRIGGERS
-- ============================================================================

INSERT INTO verificacao_resultados (secao, categoria, item, valor, detalhes, ordem)
SELECT 
  '9. TRIGGERS' as secao,
  event_object_table as categoria,
  trigger_name as item,
  action_timing as valor,
  'Eventos: ' || string_agg(event_manipulation, ', ') as detalhes,
  800 + ROW_NUMBER() OVER (ORDER BY event_object_table, trigger_name) as ordem
FROM information_schema.triggers
WHERE event_object_schema = 'public'
GROUP BY 
  event_object_table,
  trigger_name,
  action_timing;

-- ============================================================================
-- 10. CONTAGEM DE REGISTROS
-- ============================================================================

DO $$
DECLARE
  tbl text;
  cnt bigint;
BEGIN
  FOR tbl IN 
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    ORDER BY table_name
  LOOP
    EXECUTE format('SELECT COUNT(*) FROM %I', tbl) INTO cnt;
    INSERT INTO verificacao_resultados (secao, categoria, item, valor, ordem)
    VALUES ('10. CONTAGEM DE REGISTROS', tbl, 'Registros', cnt::text, 900 + (SELECT COUNT(*) FROM verificacao_resultados WHERE secao = '10. CONTAGEM DE REGISTROS'));
  END LOOP;
END $$;

-- ============================================================================
-- 11. TABELAS DE AUTENTICAÇÃO
-- ============================================================================

INSERT INTO verificacao_resultados (secao, categoria, item, valor, detalhes, ordem)
SELECT 
  '11. SISTEMA DE AUTH' as secao,
  table_name as categoria,
  'Colunas' as item,
  (SELECT COUNT(*)::text FROM information_schema.columns c 
   WHERE c.table_schema = 'public' AND c.table_name = t.table_name) as valor,
  'RLS: ' || CASE WHEN (SELECT rowsecurity FROM pg_tables WHERE schemaname='public' AND tablename=t.table_name) 
    THEN '✅ Habilitado' ELSE '❌ Desabilitado' END as detalhes,
  1000 + ROW_NUMBER() OVER (ORDER BY table_name) as ordem
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
  AND (
    table_name IN ('profiles', 'tenants', 'user_roles', 'role_permissions')
    OR table_name LIKE 'auth_%'
  );

-- ============================================================================
-- 12. ENUMS (TIPOS CUSTOMIZADOS)
-- ============================================================================

INSERT INTO verificacao_resultados (secao, categoria, item, valor, detalhes, ordem)
SELECT 
  '12. ENUMS' as secao,
  t.typname as categoria,
  'Valores' as item,
  array_length(array_agg(e.enumlabel), 1)::text as valor,
  array_to_string(array_agg(e.enumlabel ORDER BY e.enumsortorder), ', ') as detalhes,
  1100 + ROW_NUMBER() OVER (ORDER BY t.typname) as ordem
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
JOIN pg_namespace n ON t.typnamespace = n.oid
WHERE n.nspname = 'public'
GROUP BY t.typname;

-- ============================================================================
-- 13. EXTENSIONS INSTALADAS
-- ============================================================================

INSERT INTO verificacao_resultados (secao, categoria, item, valor, ordem)
SELECT 
  '13. EXTENSIONS' as secao,
  extname as categoria,
  'Versão' as item,
  extversion as valor,
  1200 + ROW_NUMBER() OVER (ORDER BY extname) as ordem
FROM pg_extension
ORDER BY extname;

-- ============================================================================
-- 14. ESTATÍSTICAS DE ESPAÇO
-- ============================================================================

INSERT INTO verificacao_resultados (secao, categoria, item, valor, detalhes, ordem)
SELECT 
  '14. ESPAÇO EM DISCO' as secao,
  tablename as categoria,
  'Tamanho Total' as item,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as valor,
  'Tabela: ' || pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) || 
  ' | Indexes: ' || pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) as detalhes,
  1300 + ROW_NUMBER() OVER (ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC) as ordem
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
LIMIT 20;

-- ============================================================================
-- RESULTADO FINAL - TUDO EM UMA ÚNICA TABELA
-- ============================================================================

SELECT 
  secao as "Seção",
  categoria as "Categoria",
  item as "Item",
  valor as "Valor",
  detalhes as "Detalhes"
FROM verificacao_resultados
ORDER BY ordem;
