-- DIAGNÓSTICO ESPECÍFICO DO PROBLEMA DE ACESSO
-- Execute este script para entender por que o usuário não consegue acessar seu perfil

-- 1. VERIFICAR SE O PERFIL EXISTE PARA O USUÁRIO ESPECÍFICO
SELECT
  'PERFIL DO USUÁRIO PROBLEMÁTICO' as diagnostico,
  au.id as user_id,
  au.email,
  p.id as profile_id,
  p.role,
  CASE
    WHEN p.id IS NOT NULL THEN '✅ PERFIL EXISTE'
    ELSE '❌ PERFIL NÃO EXISTE'
  END as status_perfil
FROM auth.users au
LEFT JOIN profiles p ON p.id = au.id
WHERE au.id = '103c4689-7097-4026-9857-2c8a2761214d';

-- 2. TESTAR AS POLÍTICAS RLS MANUALMENTE
-- Simular o que a política faz
SELECT
  'TESTE MANUAL DE POLÍTICAS' as diagnostico,
  '103c4689-7097-4026-9857-2c8a2761214d' as auth_uid,
  p.id,
  p.role,
  CASE
    WHEN '103c4689-7097-4026-9857-2c8a2761214d' = p.id THEN '✅ POLÍTICA SELECT DEVE PERMITIR'
    ELSE '❌ POLÍTICA SELECT BLOQUEIA'
  END as politica_select,
  CASE
    WHEN '103c4689-7097-4026-9857-2c8a2761214d' IN (
      SELECT au2.id
      FROM auth.users au2
      WHERE au2.email IN ('peepers.shop@gmail.com', 'antoniovbraz@gmail.com')
    ) THEN '✅ SUPER ADMIN'
    ELSE '👤 USUÁRIO NORMAL'
  END as super_admin_check
FROM profiles p
WHERE p.id = '103c4689-7097-4026-9857-2c8a2761214d';

-- 3. VERIFICAR POLÍTICAS ATUAIS DETALHADAMENTE
SELECT
  'POLÍTICAS RLS DETALHADAS' as diagnostico,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'profiles'
ORDER BY policyname;

-- 4. TESTAR ACESSO DIRETO (SEM RLS TEMPORARIAMENTE)
-- DESABILITAR RLS TEMPORARIAMENTE PARA TESTE
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

SELECT
  'TESTE SEM RLS' as diagnostico,
  COUNT(*) as perfis_visiveis
FROM profiles;

-- REABILITAR RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 5. VERIFICAR SE O USUÁRIO É SUPER ADMIN
SELECT
  'VERIFICAÇÃO SUPER ADMIN' as diagnostico,
  au.id,
  au.email,
  CASE
    WHEN au.email IN ('peepers.shop@gmail.com', 'antoniovbraz@gmail.com') THEN '✅ É SUPER ADMIN'
    ELSE '❌ NÃO É SUPER ADMIN'
  END as status_super_admin
FROM auth.users au
WHERE au.id = '103c4689-7097-4026-9857-2c8a2761214d';