-- CORREÇÃO PARA PERFIS FALTANTES E FUNÇÃO HANDLE_NEW_USER
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. VERIFICAR E CORRIGIR A FUNÇÃO HANDLE_NEW_USER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  user_role TEXT := 'user';
BEGIN
  -- Atribuir super_admin para emails específicos
  IF NEW.email = ANY(ARRAY['peepers.shop@gmail.com', 'antoniovbraz@gmail.com']) THEN
    user_role := 'super_admin';
  END IF;

  -- Inserir perfil com tratamento de erro
  BEGIN
    INSERT INTO public.profiles (id, full_name, role)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
      user_role
    );
  EXCEPTION
    WHEN OTHERS THEN
      -- Fallback: tentar inserir apenas com ID e role
      INSERT INTO public.profiles (id, role)
      VALUES (NEW.id, user_role);
  END;

  RETURN NEW;
END;
$$;

-- 2. GARANTIR QUE O TRIGGER ESTEJA ATIVO
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. CRIAR PERFIS PARA USUÁRIOS EXISTENTES QUE NÃO TÊM PERFIL
INSERT INTO public.profiles (id, full_name, role)
SELECT
  au.id,
  COALESCE(au.raw_user_meta_data->>'full_name', au.email) as full_name,
  CASE
    WHEN au.email = ANY(ARRAY['peepers.shop@gmail.com', 'antoniovbraz@gmail.com']) THEN 'super_admin'
    ELSE 'user'
  END as role
FROM auth.users au
LEFT JOIN public.profiles p ON p.id = au.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- 4. VERIFICAR RESULTADO
SELECT
  'PERFIS CRIADOS/CORRIGIDOS' as status,
  COUNT(*) as total_perfis,
  COUNT(CASE WHEN role = 'super_admin' THEN 1 END) as super_admins,
  COUNT(CASE WHEN role = 'user' THEN 1 END) as users
FROM public.profiles;

-- 5. VERIFICAR USUÁRIOS SEM PERFIL (deve ser 0)
SELECT
  'USUÁRIOS SEM PERFIL' as status,
  COUNT(*) as usuarios_sem_perfil
FROM auth.users au
LEFT JOIN public.profiles p ON p.id = au.id
WHERE p.id IS NULL;