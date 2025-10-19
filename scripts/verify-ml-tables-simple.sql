-- ============================================================================
-- VERIFICAÇÃO SIMPLES - TABELAS ML
-- ============================================================================
-- Script simplificado para verificação rápida
-- Execute no SQL Editor do Supabase Dashboard
-- ============================================================================

-- 1️⃣ LISTA DE TABELAS ML
SELECT 
  table_name as "Tabela",
  (SELECT COUNT(*) FROM information_schema.columns 
   WHERE table_schema = 'public' AND table_name = t.table_name) as "Colunas",
  (SELECT pg_size_pretty(pg_total_relation_size(quote_ident(table_name)::regclass))) as "Tamanho"
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_name LIKE 'ml_%'
ORDER BY table_name;

-- 2️⃣ CONTAGEM DE REGISTROS
SELECT 'ml_oauth_states' as "Tabela", COUNT(*) as "Registros" FROM ml_oauth_states
UNION ALL
SELECT 'ml_integrations', COUNT(*) FROM ml_integrations
UNION ALL
SELECT 'ml_products', COUNT(*) FROM ml_products
UNION ALL
SELECT 'ml_orders', COUNT(*) FROM ml_orders
UNION ALL
SELECT 'ml_questions', COUNT(*) FROM ml_questions
UNION ALL
SELECT 'ml_webhook_logs', COUNT(*) FROM ml_webhook_logs
UNION ALL
SELECT 'ml_sync_logs', COUNT(*) FROM ml_sync_logs;

-- 3️⃣ VERIFICAR COLUNAS DA TABELA PRINCIPAL (ml_integrations)
SELECT 
  column_name as "Coluna",
  data_type as "Tipo",
  CASE WHEN is_nullable = 'YES' THEN '✅' ELSE '❌' END as "Nullable"
FROM information_schema.columns
WHERE table_name = 'ml_integrations'
ORDER BY ordinal_position;

-- 4️⃣ VERIFICAR RLS
SELECT 
  tablename as "Tabela",
  CASE WHEN rowsecurity THEN '✅ Habilitado' ELSE '❌ Desabilitado' END as "RLS"
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename LIKE 'ml_%'
ORDER BY tablename;

-- 5️⃣ VERIFICAÇÃO CRÍTICA: Nomes de colunas de tokens
SELECT 
  '✅ CORRETO: access_token existe' as "Status"
FROM information_schema.columns 
WHERE table_name = 'ml_integrations' 
  AND column_name = 'access_token'
UNION ALL
SELECT 
  CASE 
    WHEN EXISTS(
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'ml_integrations' 
      AND column_name = 'encrypted_access_token'
    )
    THEN '❌ ERRO: encrypted_access_token existe (deveria ser access_token)'
    ELSE '✅ OK: encrypted_access_token não existe (correto)'
  END;
