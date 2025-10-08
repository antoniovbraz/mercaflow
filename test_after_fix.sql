-- TESTE APÓS CORREÇÃO DA RECURSÃO RLS
-- Execute este script no SQL Editor do Supabase

-- 1. VERIFICAR SE AS POLICIES FORAM CRIADAS CORRETAMENTE
SELECT 
  'POLICIES ATIVAS' as secao,
  policyname,
  cmd,
  permissive
FROM pg_policies 
WHERE schemaname = 'public'
  AND tablename = 'profiles'
ORDER BY policyname;

-- 2. TESTAR FUNÇÃO SEGURA
SELECT 
  'TESTE FUNÇÃO SEGURA' as secao,
  get_current_user_role_safe() as role_funcao;

-- 3. TESTAR FUNÇÃO IS_SUPER_ADMIN
SELECT 
  'TESTE IS_SUPER_ADMIN' as secao,
  is_super_admin() as eh_super_admin;

-- 4. VERIFICAR PERFIL DO USUÁRIO
SELECT 
  'PERFIL USUÁRIO' as secao,
  au.email,
  p.role,
  p.updated_at
FROM auth.users au
LEFT JOIN profiles p ON p.id = au.id
WHERE au.email = 'peepers.shop@gmail.com';

-- 5. TESTAR ACESSO DIRETO À TABELA PROFILES
SELECT 
  'TESTE ACESSO PROFILES' as secao,
  COUNT(*) as total_profiles_visiveis,
  COUNT(CASE WHEN role = 'super_admin' THEN 1 END) as super_admins_visiveis
FROM profiles;