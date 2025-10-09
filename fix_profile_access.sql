-- CORREÇÃO DEFINITIVA DAS POLÍTICAS RLS PARA PERFIS
-- Execute este script para corrigir o acesso aos perfis

-- 1. REMOVER TODAS AS POLÍTICAS ATUAIS
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_super_admin_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_own_access" ON public.profiles;
DROP POLICY IF EXISTS "profiles_super_admin_access" ON public.profiles;

-- 2. CRIAR POLÍTICAS MAIS SIMPLES E DIRETAS
-- Política básica: usuários podem ver seus próprios perfis
CREATE POLICY "users_can_read_own_profile" ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Política básica: usuários podem atualizar seus próprios perfis
CREATE POLICY "users_can_update_own_profile" ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Política para super admins: podem fazer tudo
CREATE POLICY "super_admins_full_access" ON public.profiles
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users
      WHERE email IN ('peepers.shop@gmail.com', 'antoniovbraz@gmail.com')
    )
  );

-- 3. VERIFICAR POLÍTICAS CRIADAS
SELECT
  'POLÍTICAS CORRIGIDAS' as status,
  schemaname,
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'profiles'
ORDER BY policyname;

-- 4. TESTE DE ACESSO SIMULADO
-- Este teste simula o que acontece quando o usuário tenta acessar seu perfil
SELECT
  'TESTE DE ACESSO SIMULADO' as status,
  'Usuário autenticado pode acessar seu perfil' as explicacao,
  CASE
    WHEN EXISTS (
      SELECT 1 FROM profiles
      WHERE id = '103c4689-7097-4026-9857-2c8a2761214d'
    ) THEN '✅ PERFIL EXISTE'
    ELSE '❌ PERFIL NÃO EXISTE'
  END as perfil_existe,
  CASE
    WHEN '103c4689-7097-4026-9857-2c8a2761214d' IN (
      SELECT id FROM auth.users
      WHERE email IN ('peepers.shop@gmail.com', 'antoniovbraz@gmail.com')
    ) THEN '✅ SUPER ADMIN - ACESSO TOTAL'
    ELSE '👤 USUÁRIO NORMAL - ACESSO PRÓPRIO'
  END as tipo_acesso;