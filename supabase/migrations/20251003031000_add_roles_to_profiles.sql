-- =====================================================
-- 🎭 ADICIONAR ROLES À TABELA PROFILES (SSR)
-- =====================================================
-- Adiciona sistema de roles diretamente na tabela profiles
-- Seguindo padrão Supabase SSR oficial
-- Data: 03/10/2025

-- 🎭 CRIAR ENUM PARA ROLES (se não existir)
DO $$ BEGIN
  CREATE TYPE app_role AS ENUM (
    'user',         -- Usuário padrão
    'admin',        -- Administrador
    'super_admin'   -- Super administrador
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 🔧 ADICIONAR CAMPO ROLE À TABELA PROFILES
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role app_role DEFAULT 'user' NOT NULL;

-- 📊 ADICIONAR ÍNDICE PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- 🔒 ATUALIZAR POLÍTICAS RLS PARA INCLUIR ROLES
-- Admin pode ver todos os perfis
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() 
      AND p.role IN ('admin', 'super_admin')
    )
  );

-- Super admin pode gerenciar todos os perfis
CREATE POLICY "Super admins can manage all profiles" ON public.profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() 
      AND p.role = 'super_admin'
    )
  );

-- 🔧 ATUALIZAR FUNÇÃO HANDLE_NEW_USER PARA INCLUIR ROLE
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role app_role := 'user';
BEGIN
  -- 👑 Se for super admin, dar role de super_admin
  IF NEW.email IN ('peepers.shop@gmail.com', 'antoniovbraz@gmail.com') THEN
    user_role := 'super_admin';
  END IF;

  -- Inserir perfil com role apropriado
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

-- 🔧 FUNÇÃO AUXILIAR PARA VERIFICAR ROLES
CREATE OR REPLACE FUNCTION public.has_role(required_role app_role)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND (
      role = required_role OR
      (required_role = 'user' AND role IN ('admin', 'super_admin')) OR
      (required_role = 'admin' AND role = 'super_admin')
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 🔧 FUNÇÃO PARA OBTER ROLE DO USUÁRIO ATUAL
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS app_role AS $$
DECLARE
  user_role app_role;
BEGIN
  SELECT role INTO user_role
  FROM public.profiles
  WHERE id = auth.uid();
  
  RETURN COALESCE(user_role, 'user');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ✅ VERIFICAÇÃO E LOG
DO $$
DECLARE
  profiles_with_role INTEGER;
  super_admins INTEGER;
BEGIN
  -- Contar perfis com role
  SELECT COUNT(*) INTO profiles_with_role
  FROM public.profiles
  WHERE role IS NOT NULL;
  
  -- Contar super admins
  SELECT COUNT(*) INTO super_admins
  FROM public.profiles
  WHERE role = 'super_admin';
  
  RAISE NOTICE '🎭 SISTEMA DE ROLES ADICIONADO À PROFILES:';
  RAISE NOTICE '📊 Perfis com role: %', profiles_with_role;
  RAISE NOTICE '👑 Super admins: %', super_admins;
  RAISE NOTICE '✅ Funções auxiliares criadas: has_role(), get_user_role()';
  RAISE NOTICE '🔒 Políticas RLS atualizadas para roles';
  RAISE NOTICE '🚀 Sistema completo: profiles + roles (SSR)!';
END $$;