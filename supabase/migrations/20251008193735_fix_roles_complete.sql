-- CORREÇÃO COMPLETA DO SISTEMA DE ROLES
-- Esta migração força a correção de todos os problemas identificados

-- 1. GARANTIR QUE A COLUNA ROLE EXISTE E ESTÁ CORRETA
ALTER TABLE profiles 
ALTER COLUMN role SET DEFAULT 'user';

-- 2. ATUALIZAR TODOS OS PERFIS EXISTENTES QUE PODEM ESTAR NULL
UPDATE profiles 
SET role = 'user' 
WHERE role IS NULL;

-- 3. FORÇAR ATUALIZAÇÃO DOS SUPER ADMINS ESPECÍFICOS
UPDATE profiles 
SET 
  role = 'super_admin',
  updated_at = NOW()
WHERE id IN (
  SELECT id FROM auth.users 
  WHERE email IN ('peepers.shop@gmail.com', 'antoniovbraz@gmail.com')
);

-- 4. CRIAR PERFIL SE NÃO EXISTIR PARA OS SUPER ADMINS
INSERT INTO profiles (id, role, created_at, updated_at)
SELECT 
  au.id,
  'super_admin',
  NOW(),
  NOW()
FROM auth.users au
WHERE au.email IN ('peepers.shop@gmail.com', 'antoniovbraz@gmail.com')
  AND NOT EXISTS (SELECT 1 FROM profiles p WHERE p.id = au.id)
ON CONFLICT (id) DO UPDATE SET
  role = 'super_admin',
  updated_at = NOW();

-- 5. RECRIAR FUNÇÃO handle_new_user SEM DEPENDÊNCIAS EXTERNAS
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  user_role TEXT := 'user';
BEGIN
  -- Check if user email is super admin
  IF NEW.email = 'peepers.shop@gmail.com' OR 
     NEW.email = 'antoniovbraz@gmail.com' THEN
    user_role := 'super_admin';
  END IF;

  INSERT INTO public.profiles (id, full_name, role, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    user_role,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    role = EXCLUDED.role,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    updated_at = NOW();
    
  RETURN NEW;
END;
$$;

-- 6. GARANTIR QUE O TRIGGER ESTÁ ATIVO
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. FUNÇÃO PARA DEBUG - OBTER ROLE DO USUÁRIO ATUAL
CREATE OR REPLACE FUNCTION public.debug_current_user_role()
RETURNS TABLE(
  user_id UUID,
  user_email TEXT,
  profile_role TEXT,
  has_profile BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    au.id as user_id,
    au.email as user_email,
    COALESCE(p.role, 'NO_PROFILE') as profile_role,
    (p.id IS NOT NULL) as has_profile
  FROM auth.users au
  LEFT JOIN profiles p ON p.id = au.id
  WHERE au.id = auth.uid();
END;
$$;

-- 8. RECRIAR RLS POLICIES LIMPAS
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles; 
DROP POLICY IF EXISTS "Super admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Super admins can update all profiles" ON profiles;

-- Políticas simples e funcionais
CREATE POLICY "profile_select_own" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profile_update_own" ON profiles  
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profile_super_admin_all" ON profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- 9. GRANT PERMISSIONS EXPLÍCITAS
GRANT ALL ON profiles TO authenticated;
GRANT EXECUTE ON FUNCTION debug_current_user_role() TO authenticated;

-- 10. LOG FINAL - VERIFICAR ESTADO
-- Este não executa, mas mostra o que verificar:
-- SELECT * FROM debug_current_user_role();
-- SELECT email, role FROM auth.users au JOIN profiles p ON p.id = au.id;
