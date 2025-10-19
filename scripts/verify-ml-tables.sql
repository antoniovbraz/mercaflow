-- ============================================================================
-- SCRIPT DE VERIFICAÇÃO DAS TABELAS ML
-- ============================================================================
-- Execute este script no SQL Editor do Supabase Dashboard
-- URL: https://supabase.com/dashboard/project/YOUR_PROJECT/sql/new
-- ============================================================================

-- ============================================================================
-- 1. VERIFICAR TODAS AS TABELAS ML EXISTENTES
-- ============================================================================

SELECT 
  'TABELAS ML EXISTENTES' as verificacao,
  table_name as nome_tabela,
  (
    SELECT COUNT(*) 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = t.table_name
  ) as total_colunas
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_name LIKE 'ml_%'
ORDER BY table_name;

-- ============================================================================
-- 2. DETALHES DAS COLUNAS DE CADA TABELA
-- ============================================================================

-- ml_oauth_states
SELECT 
  '1. ml_oauth_states' as tabela,
  column_name as coluna,
  data_type as tipo,
  is_nullable as permite_null,
  column_default as valor_padrao
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'ml_oauth_states'
ORDER BY ordinal_position;

-- ml_integrations
SELECT 
  '2. ml_integrations' as tabela,
  column_name as coluna,
  data_type as tipo,
  is_nullable as permite_null,
  column_default as valor_padrao
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'ml_integrations'
ORDER BY ordinal_position;

-- ml_products
SELECT 
  '3. ml_products' as tabela,
  column_name as coluna,
  data_type as tipo,
  is_nullable as permite_null,
  column_default as valor_padrao
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'ml_products'
ORDER BY ordinal_position;

-- ml_orders
SELECT 
  '4. ml_orders' as tabela,
  column_name as coluna,
  data_type as tipo,
  is_nullable as permite_null,
  column_default as valor_padrao
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'ml_orders'
ORDER BY ordinal_position;

-- ml_questions
SELECT 
  '5. ml_questions' as tabela,
  column_name as coluna,
  data_type as tipo,
  is_nullable as permite_null,
  column_default as valor_padrao
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'ml_questions'
ORDER BY ordinal_position;

-- ml_webhook_logs
SELECT 
  '6. ml_webhook_logs' as tabela,
  column_name as coluna,
  data_type as tipo,
  is_nullable as permite_null,
  column_default as valor_padrao
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'ml_webhook_logs'
ORDER BY ordinal_position;

-- ml_sync_logs
SELECT 
  '7. ml_sync_logs' as tabela,
  column_name as coluna,
  data_type as tipo,
  is_nullable as permite_null,
  column_default as valor_padrao
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'ml_sync_logs'
ORDER BY ordinal_position;

-- ============================================================================
-- 3. VERIFICAR INDEXES
-- ============================================================================

SELECT 
  'INDEXES ML' as verificacao,
  schemaname as schema,
  tablename as tabela,
  indexname as nome_index,
  indexdef as definicao
FROM pg_indexes
WHERE schemaname = 'public' 
  AND tablename LIKE 'ml_%'
ORDER BY tablename, indexname;

-- ============================================================================
-- 4. VERIFICAR CONSTRAINTS (PK, FK, UNIQUE, CHECK)
-- ============================================================================

SELECT 
  'CONSTRAINTS ML' as verificacao,
  tc.table_name as tabela,
  tc.constraint_name as nome_constraint,
  tc.constraint_type as tipo,
  kcu.column_name as coluna,
  CASE 
    WHEN tc.constraint_type = 'FOREIGN KEY' THEN
      ccu.table_name || '(' || ccu.column_name || ')'
    ELSE NULL
  END as referencia
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
LEFT JOIN information_schema.constraint_column_usage ccu
  ON tc.constraint_name = ccu.constraint_name
  AND tc.table_schema = ccu.table_schema
WHERE tc.table_schema = 'public'
  AND tc.table_name LIKE 'ml_%'
ORDER BY tc.table_name, tc.constraint_type, tc.constraint_name;

-- ============================================================================
-- 5. VERIFICAR RLS (ROW LEVEL SECURITY)
-- ============================================================================

SELECT 
  'RLS STATUS' as verificacao,
  schemaname as schema,
  tablename as tabela,
  rowsecurity as rls_habilitado
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename LIKE 'ml_%'
ORDER BY tablename;

-- ============================================================================
-- 6. VERIFICAR POLICIES RLS
-- ============================================================================

SELECT 
  'RLS POLICIES' as verificacao,
  schemaname as schema,
  tablename as tabela,
  policyname as nome_policy,
  permissive as permissive,
  roles as roles,
  cmd as comando,
  qual as condicao_using,
  with_check as condicao_with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename LIKE 'ml_%'
ORDER BY tablename, policyname;

-- ============================================================================
-- 7. CONTAR REGISTROS EM CADA TABELA
-- ============================================================================

SELECT 
  'CONTAGEM DE REGISTROS' as verificacao,
  'ml_oauth_states' as tabela,
  COUNT(*) as total_registros
FROM ml_oauth_states
UNION ALL
SELECT 
  'CONTAGEM DE REGISTROS',
  'ml_integrations',
  COUNT(*)
FROM ml_integrations
UNION ALL
SELECT 
  'CONTAGEM DE REGISTROS',
  'ml_products',
  COUNT(*)
FROM ml_products
UNION ALL
SELECT 
  'CONTAGEM DE REGISTROS',
  'ml_orders',
  COUNT(*)
FROM ml_orders
UNION ALL
SELECT 
  'CONTAGEM DE REGISTROS',
  'ml_questions',
  COUNT(*)
FROM ml_questions
UNION ALL
SELECT 
  'CONTAGEM DE REGISTROS',
  'ml_webhook_logs',
  COUNT(*)
FROM ml_webhook_logs
UNION ALL
SELECT 
  'CONTAGEM DE REGISTROS',
  'ml_sync_logs',
  COUNT(*)
FROM ml_sync_logs
ORDER BY tabela;

-- ============================================================================
-- 8. VERIFICAR TRIGGERS
-- ============================================================================

SELECT 
  'TRIGGERS ML' as verificacao,
  event_object_table as tabela,
  trigger_name as nome_trigger,
  event_manipulation as evento,
  action_timing as quando,
  action_statement as acao
FROM information_schema.triggers
WHERE event_object_schema = 'public'
  AND event_object_table LIKE 'ml_%'
ORDER BY event_object_table, trigger_name;

-- ============================================================================
-- 9. VERIFICAÇÃO ESPECÍFICA: COLUNAS CRÍTICAS
-- ============================================================================

-- Verificar se ml_integrations tem as colunas corretas (access_token, não encrypted_access_token)
SELECT 
  'VERIFICAÇÃO: ml_integrations token columns' as verificacao,
  EXISTS(
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ml_integrations' 
    AND column_name = 'access_token'
  ) as tem_access_token,
  EXISTS(
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ml_integrations' 
    AND column_name = 'encrypted_access_token'
  ) as tem_encrypted_access_token_ERRADO,
  EXISTS(
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ml_integrations' 
    AND column_name = 'refresh_token'
  ) as tem_refresh_token;

-- ============================================================================
-- 10. RESUMO FINAL
-- ============================================================================

SELECT 
  '========== RESUMO FINAL ==========' as resumo;

SELECT 
  'Total de tabelas ML' as metrica,
  COUNT(*) as valor
FROM information_schema.tables
WHERE table_schema = 'public' 
  AND table_name LIKE 'ml_%'
UNION ALL
SELECT 
  'Total de indexes ML',
  COUNT(*)
FROM pg_indexes
WHERE schemaname = 'public' 
  AND tablename LIKE 'ml_%'
UNION ALL
SELECT 
  'Total de constraints ML',
  COUNT(*)
FROM information_schema.table_constraints
WHERE table_schema = 'public'
  AND table_name LIKE 'ml_%'
UNION ALL
SELECT 
  'Tabelas com RLS habilitado',
  COUNT(*)
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename LIKE 'ml_%'
  AND rowsecurity = true
UNION ALL
SELECT 
  'Total de RLS policies',
  COUNT(*)
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename LIKE 'ml_%';

-- ============================================================================
-- FIM DA VERIFICAÇÃO
-- ============================================================================

SELECT 
  '✅ Script de verificação concluído!' as status,
  'Revise os resultados acima para confirmar que todas as tabelas ML foram criadas corretamente.' as proximos_passos;
