-- CORREÇÃO DA RECURSÃO INFINITA NAS POLICIES RLS
-- O problema: policy super_admin tentava consultar profiles dentro de profiles

-- 1. DESABILITAR RLS TEMPORARIAMENTE PARA LIMPEZA
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 2. REMOVER TODAS AS POLICIES PROBLEMÁTICAS
DROP POLICY IF EXISTS "profile_select_own" ON profiles;
DROP POLICY IF EXISTS "profile_update_own" ON profiles;
DROP POLICY IF EXISTS "profile_super_admin_all" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Super admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Super admins can update all profiles" ON profiles;

-- 3. REABILITAR RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 4. CRIAR POLICIES SIMPLES E SEGURAS (SEM RECURSÃO)
-- Política 1: Usuários podem ver e editar seu próprio perfil
CREATE POLICY "profiles_own_access" ON profiles
  FOR ALL USING (auth.uid() = id);

-- Política 2: Super admins têm acesso completo (usando função que não causa recursão)
CREATE POLICY "profiles_super_admin_access" ON profiles
  FOR ALL USING (
    auth.uid() IN (
      SELECT au.id 
      FROM auth.users au 
      WHERE au.email IN ('peepers.shop@gmail.com', 'antoniovbraz@gmail.com')
    )
  );

-- 5. GARANTIR PERMISSÕES CORRETAS
GRANT ALL ON profiles TO authenticated;
GRANT SELECT ON profiles TO anon;

-- 6. CRIAR FUNÇÃO SIMPLES PARA VERIFICAR SE É SUPER ADMIN (sem recursão)
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN auth.uid() IN (
    SELECT au.id 
    FROM auth.users au 
    WHERE au.email IN ('peepers.shop@gmail.com', 'antoniovbraz@gmail.com')
  );
END;
$$;

-- 7. FUNÇÃO PARA OBTER ROLE SEM CAUSAR RECURSÃO
CREATE OR REPLACE FUNCTION public.get_current_user_role_safe()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_email TEXT;
  user_role TEXT;
BEGIN
  -- Buscar email do usuário atual
  SELECT email INTO user_email
  FROM auth.users
  WHERE id = auth.uid();
  
  -- Verificar se é super admin por email
  IF user_email IN ('peepers.shop@gmail.com', 'antoniovbraz@gmail.com') THEN
    RETURN 'super_admin';
  END IF;
  
  -- Para outros usuários, buscar na tabela profiles
  -- Usar query direta sem policies para evitar recursão
  SELECT role INTO user_role
  FROM profiles
  WHERE id = auth.uid();
  
  RETURN COALESCE(user_role, 'user');
END;
$$;

-- 8. ATUALIZAR/CRIAR PROFILE DO SUPER ADMIN
INSERT INTO profiles (id, role, created_at, updated_at, full_name)
SELECT 
  au.id,
  'super_admin',
  NOW(),
  NOW(),
  'Super Admin'
FROM auth.users au
WHERE au.email IN ('peepers.shop@gmail.com', 'antoniovbraz@gmail.com')
ON CONFLICT (id) DO UPDATE SET
  role = 'super_admin',
  updated_at = NOW();

-- 9. GRANT PERMISSIONS PARA AS FUNÇÕES
GRANT EXECUTE ON FUNCTION is_super_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION get_current_user_role_safe() TO authenticated;
