-- DIAGNÓSTICO COMPLETO DAS TABELAS ML E PERFIS
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. VERIFICAR TABELAS EXISTENTES
SELECT
  'TABELAS ML EXISTENTES' as secao,
  schemaname,
  tablename,
  tableowner
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename LIKE 'ml_%'
ORDER BY tablename;

-- 2. ESTRUTURA DA TABELA PROFILES
SELECT 'ESTRUTURA PROFILES' as secao;
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 3. ESTRUTURA DA TABELA ML_INTEGRATIONS
SELECT 'ESTRUTURA ML_INTEGRATIONS' as secao;
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'ml_integrations'
ORDER BY ordinal_position;

-- 4. VERIFICAR USUÁRIOS E PERFIS
SELECT 'USUÁRIOS E PERFIS' as secao;
SELECT
  au.id,
  au.email,
  au.email_confirmed_at IS NOT NULL as email_confirmed,
  p.id as profile_id,
  p.role,
  p.created_at as profile_created,
  CASE
    WHEN p.id IS NULL THEN '❌ PERFIL NÃO EXISTE'
    WHEN p.role IS NULL THEN '⚠️ ROLE NÃO DEFINIDA'
    ELSE '✅ OK'
  END as status
FROM auth.users au
LEFT JOIN profiles p ON p.id = au.id
ORDER BY au.created_at DESC;

-- 5. VERIFICAR INTEGRAÇÕES ML EXISTENTES
SELECT 'INTEGRAÇÕES ML' as secao;
SELECT
  mi.id,
  mi.user_id,
  mi.tenant_id,
  mi.ml_user_id,
  mi.status,
  mi.created_at,
  p.role as user_role,
  CASE
    WHEN mi.tenant_id != mi.user_id THEN '⚠️ TENANT_ID DIFERENTE DE USER_ID'
    ELSE '✅ OK'
  END as tenant_check
FROM ml_integrations mi
LEFT JOIN profiles p ON p.id = mi.user_id
ORDER BY mi.created_at DESC;

-- 6. VERIFICAR POLÍTICAS RLS
SELECT 'POLÍTICAS RLS' as secao;
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'ml_integrations', 'ml_products')
ORDER BY tablename, policyname;

-- 7. VERIFICAR SE RLS ESTÁ ATIVADO
SELECT 'RLS STATUS' as secao;
SELECT
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'ml_integrations', 'ml_products', 'ml_oauth_states', 'ml_sync_logs', 'ml_webhook_logs')
ORDER BY tablename;