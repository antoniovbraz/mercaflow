-- CORREÇÃO DAS PERMISSÕES DA TABELA USER_ROLES
-- Problema: 403 errors porque authenticated users não podem acessar user_roles

-- 1. HABILITAR RLS na tabela user_roles se não estiver habilitado
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 2. REMOVER POLICIES ANTIGAS RESTRITIVAS
DROP POLICY IF EXISTS "Allow auth admin to read user roles" ON public.user_roles;

-- 3. GARANTIR PERMISSÕES BÁSICAS PARA AUTHENTICATED USERS
GRANT SELECT ON public.user_roles TO authenticated;

-- 4. CRIAR POLICIES PARA USER_ROLES
-- Política 1: Usuários podem ver seus próprios roles
CREATE POLICY "users_can_view_own_roles" ON public.user_roles
  FOR SELECT 
  TO authenticated
  USING (auth.uid() = user_id);

-- Política 2: Super admins podem ver todos os roles (usando emails hardcoded para evitar recursão)
CREATE POLICY "super_admins_can_view_all_roles" ON public.user_roles
  FOR SELECT 
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT au.id 
      FROM auth.users au 
      WHERE au.email IN ('peepers.shop@gmail.com', 'antoniovbraz@gmail.com')
    )
  );

-- Política 3: Super admins podem inserir/atualizar/deletar roles
CREATE POLICY "super_admins_can_manage_roles" ON public.user_roles
  FOR ALL 
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT au.id 
      FROM auth.users au 
      WHERE au.email IN ('peepers.shop@gmail.com', 'antoniovbraz@gmail.com')
    )
  );

-- 5. GARANTIR QUE O SUPER ADMIN TEM ROLE NA TABELA USER_ROLES
INSERT INTO public.user_roles (user_id, role, created_at)
SELECT 
  au.id,
  'super_admin',
  NOW()
FROM auth.users au
WHERE au.email IN ('peepers.shop@gmail.com', 'antoniovbraz@gmail.com')
ON CONFLICT (user_id, role) DO NOTHING;

-- 6. CRIAR FUNÇÃO SEGURA PARA VERIFICAR ROLES
CREATE OR REPLACE FUNCTION public.get_user_role(target_user_id UUID DEFAULT NULL)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id_to_check UUID;
  user_email TEXT;
  user_role TEXT;
BEGIN
  -- Se não foi passado um user_id, usar o usuário atual
  user_id_to_check := COALESCE(target_user_id, auth.uid());
  
  -- Se não há usuário autenticado, retornar null
  IF user_id_to_check IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Buscar email do usuário
  SELECT email INTO user_email
  FROM auth.users
  WHERE id = user_id_to_check;
  
  -- Verificar se é super admin por email (hardcoded para evitar recursão)
  IF user_email IN ('peepers.shop@gmail.com', 'antoniovbraz@gmail.com') THEN
    RETURN 'super_admin';
  END IF;
  
  -- Buscar role na tabela user_roles (pode ter múltiplos roles, pegar o mais alto)
  SELECT role::text INTO user_role
  FROM public.user_roles
  WHERE user_id = user_id_to_check
  ORDER BY 
    CASE role::text
      WHEN 'super_admin' THEN 1
      WHEN 'admin' THEN 2
      WHEN 'user' THEN 3
      ELSE 4
    END
  LIMIT 1;
  
  -- Se não encontrou role, verificar na tabela profiles como fallback
  IF user_role IS NULL THEN
    SELECT role INTO user_role
    FROM public.profiles
    WHERE id = user_id_to_check;
  END IF;
  
  RETURN COALESCE(user_role, 'user');
END;
$$;

-- 7. GRANT EXECUTE NA FUNÇÃO
GRANT EXECUTE ON FUNCTION public.get_user_role(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_role() TO authenticated;

-- 8. COMENTÁRIOS PARA DOCUMENTAÇÃO
COMMENT ON TABLE public.user_roles IS 'Tabela de roles dos usuários com RLS habilitado';
COMMENT ON POLICY "users_can_view_own_roles" ON public.user_roles IS 'Usuários podem ver apenas seus próprios roles';
COMMENT ON POLICY "super_admins_can_view_all_roles" ON public.user_roles IS 'Super admins podem ver todos os roles';
COMMENT ON POLICY "super_admins_can_manage_roles" ON public.user_roles IS 'Super admins podem gerenciar todos os roles';
COMMENT ON FUNCTION public.get_user_role(UUID) IS 'Função segura para obter role do usuário sem causar recursão RLS';