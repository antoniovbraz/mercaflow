-- ============================================================================
-- DIAGNÓSTICO COMPLETO DO BANCO DE DADOS
-- ============================================================================
-- Data: 2025-10-19
-- Objetivo: Entender estado atual antes de refatoração completa
-- ============================================================================

-- 1. VERIFICAR TABELAS ML EXISTENTES
-- ============================================================================
SELECT 
  schemaname,
  tablename,
  tableowner
FROM pg_catalog.pg_tables 
WHERE tablename LIKE 'ml_%'
ORDER BY tablename;

-- 2. VERIFICAR COLUNAS DE CADA TABELA ML
-- ============================================================================
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name LIKE 'ml_%'
ORDER BY table_name, ordinal_position;

-- 3. CONTAR REGISTROS EM CADA TABELA
-- ============================================================================
-- ml_integrations
SELECT 'ml_integrations' as table_name, COUNT(*) as total_rows FROM ml_integrations
UNION ALL
SELECT 'ml_products', COUNT(*) FROM ml_products
UNION ALL
SELECT 'ml_orders', COUNT(*) FROM ml_orders
UNION ALL
SELECT 'ml_questions', COUNT(*) FROM ml_questions
UNION ALL
SELECT 'ml_messages', COUNT(*) FROM ml_messages
UNION ALL
SELECT 'ml_webhook_logs', COUNT(*) FROM ml_webhook_logs
UNION ALL
SELECT 'ml_sync_logs', COUNT(*) FROM ml_sync_logs
UNION ALL
SELECT 'ml_oauth_states', COUNT(*) FROM ml_oauth_states;

-- 4. VERIFICAR INTEGRAÇÕES ATIVAS
-- ============================================================================
SELECT 
  id,
  user_id,
  tenant_id,
  ml_user_id,
  ml_nickname,
  status,
  auto_sync_enabled,
  created_at,
  last_sync_at,
  token_expires_at,
  last_error
FROM ml_integrations
ORDER BY created_at DESC;

-- 5. VERIFICAR PRODUTOS (se houver)
-- ============================================================================
SELECT 
  COUNT(*) as total_products,
  COUNT(DISTINCT integration_id) as integrations_with_products,
  COUNT(CASE WHEN status = 'active' THEN 1 END) as active_products,
  COUNT(CASE WHEN status = 'paused' THEN 1 END) as paused_products,
  COUNT(CASE WHEN status = 'closed' THEN 1 END) as closed_products
FROM ml_products;

-- 6. VERIFICAR RLS POLICIES
-- ============================================================================
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
WHERE tablename LIKE 'ml_%'
ORDER BY tablename, policyname;

-- 7. VERIFICAR INDEXES
-- ============================================================================
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename LIKE 'ml_%'
ORDER BY tablename, indexname;

-- 8. VERIFICAR CONSTRAINTS
-- ============================================================================
SELECT
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
LEFT JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.table_name LIKE 'ml_%'
ORDER BY tc.table_name, tc.constraint_type, tc.constraint_name;

-- 9. VERIFICAR FUNÇÕES ML
-- ============================================================================
SELECT 
  n.nspname as schema,
  p.proname as function_name,
  pg_get_function_arguments(p.oid) as arguments,
  pg_get_functiondef(p.oid) as definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname LIKE 'ml_%' OR p.proname LIKE '%ml%'
ORDER BY p.proname;

-- 10. VERIFICAR TRIGGERS
-- ============================================================================
SELECT 
  event_object_table AS table_name,
  trigger_name,
  event_manipulation AS event,
  action_statement,
  action_timing
FROM information_schema.triggers
WHERE event_object_table LIKE 'ml_%'
ORDER BY event_object_table, trigger_name;

-- 11. SAMPLE DATA - ML INTEGRATIONS (se houver)
-- ============================================================================
SELECT 
  id,
  user_id,
  tenant_id,
  ml_user_id,
  ml_nickname,
  ml_site_id,
  status,
  auto_sync_enabled,
  sync_frequency_minutes,
  LEFT(access_token, 20) || '...' as access_token_preview,
  token_expires_at,
  created_at,
  last_sync_at,
  error_count,
  LEFT(last_error, 100) as last_error_preview
FROM ml_integrations
LIMIT 5;

-- 12. SAMPLE DATA - ML PRODUCTS (se houver)
-- ============================================================================
SELECT 
  id,
  integration_id,
  ml_item_id,
  title,
  status,
  price,
  available_quantity,
  sold_quantity,
  created_at,
  last_sync_at
FROM ml_products
LIMIT 10;

-- 13. VERIFICAR ORPHANED DATA
-- ============================================================================
-- Produtos sem integração
SELECT 
  'orphaned_products' as issue,
  COUNT(*) as count
FROM ml_products p
LEFT JOIN ml_integrations i ON p.integration_id = i.id
WHERE i.id IS NULL

UNION ALL

-- Orders sem integração
SELECT 
  'orphaned_orders',
  COUNT(*)
FROM ml_orders o
LEFT JOIN ml_integrations i ON o.integration_id = i.id
WHERE i.id IS NULL

UNION ALL

-- Questions sem integração
SELECT 
  'orphaned_questions',
  COUNT(*)
FROM ml_questions q
LEFT JOIN ml_integrations i ON q.integration_id = i.id
WHERE i.id IS NULL;

-- 14. VERIFICAR TAMANHO DAS TABELAS
-- ============================================================================
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
  pg_total_relation_size(schemaname||'.'||tablename) AS size_bytes
FROM pg_catalog.pg_tables
WHERE tablename LIKE 'ml_%'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- ============================================================================
-- FIM DO DIAGNÓSTICO
-- ============================================================================
