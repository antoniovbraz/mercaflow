-- =====================================================
-- 🧹 LIMPEZA DEFINITIVA - APENAS PROFILES (SSR)
-- =====================================================
-- Remove TODOS os triggers antigos que podem estar referenciando user_roles
-- Mantém apenas o sistema profiles seguindo padrão Supabase SSR
-- Data: 03/10/2025

-- 🚨 DROPAR TODOS OS TRIGGERS ANTIGOS
DROP TRIGGER IF EXISTS trigger_auto_super_admin ON auth.users CASCADE;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP TRIGGER IF EXISTS trigger_assign_user_role ON auth.users CASCADE;

-- 🚨 DROPAR TODAS AS FUNÇÕES ANTIGAS
DROP FUNCTION IF EXISTS handle_new_user_registration() CASCADE;
DROP FUNCTION IF EXISTS handle_new_user_role() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- 🚨 GARANTIR QUE NÃO EXISTE TABELA user_roles
DROP TABLE IF EXISTS public.user_roles CASCADE;

-- ✅ RECRIAR APENAS A FUNÇÃO PROFILES (PADRÃO SSR)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Inserir apenas em profiles seguindo padrão Supabase SSR
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ✅ RECRIAR APENAS O TRIGGER PROFILES (PADRÃO SSR)
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 📊 VERIFICAÇÃO FINAL
DO $$
DECLARE
  triggers_count INTEGER;
  functions_count INTEGER;
BEGIN
  -- Contar triggers ativos
  SELECT COUNT(*) INTO triggers_count
  FROM pg_trigger t
  JOIN pg_class c ON t.tgrelid = c.oid
  JOIN pg_namespace n ON c.relnamespace = n.oid
  WHERE n.nspname = 'auth' AND c.relname = 'users';
  
  -- Contar funções relacionadas
  SELECT COUNT(*) INTO functions_count
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public'
  AND p.proname LIKE '%handle_new_user%';
  
  RAISE NOTICE '🧹 LIMPEZA DEFINITIVA CONCLUÍDA:';
  RAISE NOTICE '⚡ Triggers ativos: %', triggers_count;
  RAISE NOTICE '🔧 Funções handle_new_user: %', functions_count;
  RAISE NOTICE '✅ Apenas sistema PROFILES (SSR) ativo!';
  RAISE NOTICE '🚫 Todas as referências a user_roles removidas!';
END $$;