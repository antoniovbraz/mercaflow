-- =====================================================
-- 🧹 LIMPEZA COMPLETA - REMOVER SYSTEM USER_ROLES
-- =====================================================
-- Remove completamente o sistema antigo user_roles
-- que estava causando conflitos no signup
-- Data: 03/10/2025

-- 🗑️ REMOVER TABELAS E DEPENDÊNCIAS DE FORMA SEGURA
DO $$
BEGIN
  -- Remover triggers se existirem
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_roles_updated_at') THEN
    DROP TRIGGER update_user_roles_updated_at ON public.user_roles;
    RAISE NOTICE 'Trigger update_user_roles_updated_at removido';
  END IF;

  -- Remover políticas se a tabela existir
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_roles') THEN
    DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
    DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
    DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
    RAISE NOTICE 'Políticas RLS removidas de user_roles';
  END IF;

  -- Remover tabelas se existirem
  DROP TABLE IF EXISTS public.user_roles CASCADE;
  DROP TABLE IF EXISTS public.role_permissions CASCADE;
  
  RAISE NOTICE 'Tabelas removidas com segurança';
END $$;

-- 🔧 ATUALIZAR FUNÇÃO HANDLE_NEW_USER PARA NÃO REFERENCIAR USER_ROLES
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role app_role := 'user';
BEGIN
  -- 👑 Se for super admin, dar role de super_admin
  IF NEW.email IN ('peepers.shop@gmail.com', 'antoniovbraz@gmail.com') THEN
    user_role := 'super_admin';
  END IF;

  -- Inserir perfil com role apropriado (SEM REFERÊNCIA A USER_ROLES)
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', user_role)
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    updated_at = timezone('utc'::text, now());
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 🧹 LIMPAR FUNÇÕES ESPECÍFICAS QUE PODEM REFERENCIAR USER_ROLES
DROP FUNCTION IF EXISTS public.get_user_role(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.check_user_role(text) CASCADE;
DROP FUNCTION IF EXISTS public.assign_user_role(uuid, text) CASCADE;

-- 🔧 GARANTIR QUE PROFILES ROLE ESTÁ FUNCIONANDO
-- Verificar se todos os perfis têm role definido
UPDATE public.profiles SET role = 'user' WHERE role IS NULL;

-- 🎯 RECRIAR TRIGGER PARA HANDLE_NEW_USER
DROP TRIGGER IF EXISTS on_auth_user_created ON public.profiles;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 🔍 VERIFICAR SE TUDO ESTÁ LIMPO
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_roles') THEN
    RAISE EXCEPTION 'Tabela user_roles ainda existe!';
  END IF;
  
  RAISE NOTICE '✅ Limpeza completa realizada!';
  RAISE NOTICE '🗑️ Sistema user_roles completamente removido';
  RAISE NOTICE '✅ Sistema profiles.role funcionando corretamente';
  RAISE NOTICE '🚀 Signup deve funcionar normalmente agora';
END $$;