-- TESTE FINAL DO SISTEMA DE ROLES
-- Execute este script no SQL Editor do Supabase para verificar

-- 1. VERIFICAR USUÁRIOS E ROLES
SELECT 
  'USUÁRIOS E ROLES' as secao,
  au.email,
  p.role,
  p.created_at,
  p.updated_at,
  CASE 
    WHEN p.role = 'super_admin' THEN '🔥 SUPER ADMIN'
    WHEN p.role = 'admin' THEN '⚡ ADMIN'  
    WHEN p.role = 'user' THEN '👤 USUÁRIO'
    ELSE '❓ INDEFINIDO'
  END as status_visual
FROM auth.users au
LEFT JOIN profiles p ON p.id = au.id
ORDER BY 
  CASE p.role 
    WHEN 'super_admin' THEN 1
    WHEN 'admin' THEN 2  
    WHEN 'user' THEN 3
    ELSE 4
  END,
  au.email;

-- 2. TESTAR FUNÇÃO DE DEBUG (como usuário específico)
-- Esta função só funcionará quando executada pelo usuário logado
SELECT 'FUNÇÃO DEBUG (execute após login)' as secao;
-- SELECT * FROM debug_current_user_role();

-- 3. VERIFICAR ESTRUTURA DA TABELA
SELECT 
  'ESTRUTURA PROFILES' as secao,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 4. VERIFICAR POLICIES ATIVAS
SELECT 
  'POLICIES RLS' as secao,
  policyname,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'public'
  AND tablename = 'profiles'
ORDER BY policyname;

-- 5. VERIFICAR TRIGGER ATIVO
SELECT 
  'TRIGGER ATIVO' as secao,
  trigger_name,
  event_manipulation,
  action_timing
FROM information_schema.triggers 
WHERE event_object_schema = 'public'
  AND event_object_table = 'users'
  AND trigger_schema = 'public'
ORDER BY trigger_name;