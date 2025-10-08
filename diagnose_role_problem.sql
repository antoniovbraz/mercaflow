-- DIAGNÓSTICO COMPLETO DO PROBLEMA DE ROLES
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. FORÇAR ATUALIZAÇÃO DO USUÁRIO ESPECÍFICO
UPDATE profiles 
SET role = 'super_admin', updated_at = NOW()
WHERE id = (SELECT id FROM auth.users WHERE email = 'peepers.shop@gmail.com');

-- 2. VERIFICAR SE A ATUALIZAÇÃO FUNCIONOU
SELECT 
  'VERIFICAÇÃO PÓS UPDATE' as status,
  au.email,
  p.role,
  p.updated_at
FROM auth.users au
JOIN profiles p ON p.id = au.id
WHERE au.email = 'peepers.shop@gmail.com';

-- 3. TESTAR FUNÇÃO get_user_role() COM O USUÁRIO
SELECT 
  'TESTE FUNÇÃO get_user_role()' as status,
  public.get_user_role() as role_function_result;

-- 4. VERIFICAR CLAIMS JWT (se existirem)
SELECT 
  'CLAIMS JWT' as status,
  au.id,
  au.email,
  au.app_metadata,
  au.user_metadata
FROM auth.users au
WHERE au.email = 'peepers.shop@gmail.com';

-- 5. TESTAR POLÍTICAS RLS
SELECT 
  'TESTE RLS POLICIES' as status,
  tablename,
  policyname,
  cmd,
  roles,
  qual
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'profiles'
ORDER BY policyname;

-- 6. VERIFICAR PERMISSÕES DA TABELA
SELECT 
  'PERMISSÕES TABELA' as status,
  grantee,
  privilege_type,
  is_grantable
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
ORDER BY grantee, privilege_type;

-- 7. VERIFICAR SE HÁ CONFLITOS DE TRIGGER
SELECT 
  'TRIGGERS NA TABELA PROFILES' as status,
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers 
WHERE event_object_schema = 'public'
  AND event_object_table = 'profiles'
ORDER BY trigger_name;

-- 8. DIAGNÓSTICO FINAL: SIMULAR LOGIN
-- Esta query simula o que a aplicação faz
WITH user_data AS (
  SELECT id FROM auth.users WHERE email = 'peepers.shop@gmail.com'
)
SELECT 
  'SIMULAÇÃO LOGIN' as status,
  p.id,
  p.role,
  CASE 
    WHEN p.role = 'super_admin' THEN 'SUPER ADMIN ✅'
    WHEN p.role = 'admin' THEN 'ADMIN ⚡'
    WHEN p.role = 'user' THEN 'USUÁRIO 👤'
    ELSE 'INDEFINIDO ❓'
  END as role_display,
  p.created_at,
  p.updated_at
FROM profiles p
JOIN user_data ud ON ud.id = p.id;