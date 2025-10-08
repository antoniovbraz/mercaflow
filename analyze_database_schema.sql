-- ANÁLISE COMPLETA DO ESQUEMA DO BANCO DE DADOS
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. VERIFICAR TABELAS EXISTENTES
SELECT 
  'TABELAS EXISTENTES' as secao,
  schemaname,
  tablename,
  tableowner
FROM pg_tables 
WHERE schemaname IN ('public', 'auth')
  AND tablename IN ('profiles', 'user_roles', 'tenants', 'users')
ORDER BY schemaname, tablename;

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

-- 3. DADOS DA TABELA PROFILES
SELECT 'DADOS PROFILES' as secao;
SELECT 
  p.id,
  p.role,
  p.created_at,
  p.updated_at,
  au.email,
  au.email_confirmed_at IS NOT NULL as email_confirmed
FROM profiles p
JOIN auth.users au ON au.id = p.id
ORDER BY p.created_at DESC;

-- 4. VERIFICAR TABELA USER_ROLES (se existir)
SELECT 'ESTRUTURA USER_ROLES' as secao;
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'user_roles'
ORDER BY ordinal_position;

-- 5. DADOS DA TABELA USER_ROLES (se existir)
SELECT 'DADOS USER_ROLES' as secao;
SELECT * FROM user_roles 
WHERE EXISTS (
  SELECT 1 FROM information_schema.tables 
  WHERE table_schema = 'public' AND table_name = 'user_roles'
);

-- 6. VERIFICAR ENUMS CRIADOS
SELECT 'ENUMS CRIADOS' as secao;
SELECT 
  t.typname as enum_name,
  e.enumlabel as enum_value,
  e.enumsortorder as sort_order
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid 
WHERE t.typname IN ('app_role', 'app_permission')
ORDER BY t.typname, e.enumsortorder;

-- 7. VERIFICAR FUNCTIONS/TRIGGERS
SELECT 'FUNCTIONS EXISTENTES' as secao;
SELECT 
  routine_name,
  routine_type,
  specific_name
FROM information_schema.routines 
WHERE routine_schema = 'public'
  AND routine_name IN (
    'handle_new_user',
    'promote_to_super_admin',
    'custom_access_token_hook',
    'authorize'
  )
ORDER BY routine_name;

-- 8. VERIFICAR POLICIES RLS
SELECT 'POLICIES RLS' as secao;
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
  AND tablename IN ('profiles', 'user_roles', 'tenants')
ORDER BY tablename, policyname;

-- 9. VERIFICAR TRIGGERS
SELECT 'TRIGGERS ATIVOS' as secao;
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
  AND event_object_table IN ('profiles', 'user_roles')
ORDER BY event_object_table, trigger_name;

-- 10. ÚLTIMO TESTE: BUSCAR USUÁRIO ESPECÍFICO
SELECT 'USUÁRIO ESPECÍFICO' as secao;
SELECT 
  au.id,
  au.email,
  au.created_at as user_created,
  au.email_confirmed_at,
  p.role as profile_role,
  p.created_at as profile_created,
  p.updated_at as profile_updated,
  ur.role as user_roles_role
FROM auth.users au
LEFT JOIN profiles p ON p.id = au.id
LEFT JOIN user_roles ur ON ur.user_id = au.id
WHERE au.email = 'peepers.shop@gmail.com';