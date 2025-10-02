-- =====================================================
-- 🚀 SUPABASE AUTH PROFISSIONAL - TABELAS BÁSICAS
-- =====================================================
-- Seguindo exatamente os padrões oficiais do Supabase
-- Baseado em: https://supabase.com/docs/guides/auth/server-side/nextjs
-- Data: 02/10/2025

-- 📋 TABELA DE PERFIS (PADRÃO SUPABASE OFICIAL)
-- Esta é a estrutura recomendada pela documentação oficial
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 🔒 HABILITAR RLS (OBRIGATÓRIO PARA SEGURANÇA)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 📋 POLÍTICAS RLS SEGUINDO PADRÕES OFICIAIS
-- Usuários podem ver apenas seu próprio perfil
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Usuários podem atualizar apenas seu próprio perfil
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Usuários podem inserir apenas seu próprio perfil
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 📋 TABELA DE EXEMPLO: NOTAS/POSTS
-- Exemplo de tabela com relação ao usuário
CREATE TABLE IF NOT EXISTS public.notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 🔒 HABILITAR RLS PARA NOTAS
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- 📋 POLÍTICAS RLS PARA NOTAS
-- Usuários podem ver apenas suas próprias notas
CREATE POLICY "Users can view own notes" ON public.notes
  FOR SELECT USING (auth.uid() = user_id);

-- Usuários podem criar suas próprias notas
CREATE POLICY "Users can create own notes" ON public.notes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Usuários podem atualizar apenas suas próprias notas
CREATE POLICY "Users can update own notes" ON public.notes
  FOR UPDATE USING (auth.uid() = user_id);

-- Usuários podem deletar apenas suas próprias notas
CREATE POLICY "Users can delete own notes" ON public.notes
  FOR DELETE USING (auth.uid() = user_id);

-- 🔄 FUNÇÃO PARA ATUALIZAR UPDATED_AT AUTOMATICAMENTE
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 🔄 TRIGGERS PARA UPDATED_AT
CREATE TRIGGER handle_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_notes_updated_at
  BEFORE UPDATE ON public.notes
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 🔄 FUNÇÃO PARA CRIAR PERFIL AUTOMATICAMENTE
-- Esta função é chamada sempre que um novo usuário se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 🔄 TRIGGER PARA CRIAR PERFIL AUTOMATICAMENTE
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ✅ VERIFICAÇÃO DO SETUP
DO $$
DECLARE
  tables_count INT;
  policies_count INT;
  functions_count INT;
BEGIN
  -- Contar tabelas criadas
  SELECT COUNT(*) INTO tables_count
  FROM pg_tables 
  WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'notes');
  
  -- Contar políticas RLS
  SELECT COUNT(*) INTO policies_count
  FROM pg_policies 
  WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'notes');
  
  -- Contar funções
  SELECT COUNT(*) INTO functions_count
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public'
  AND p.proname IN ('handle_updated_at', 'handle_new_user');
  
  RAISE NOTICE '🚀 SUPABASE AUTH PROFISSIONAL CONFIGURADO:';
  RAISE NOTICE '📊 Tabelas criadas: %', tables_count;
  RAISE NOTICE '🔒 Políticas RLS: %', policies_count;
  RAISE NOTICE '⚙️ Funções: %', functions_count;
  RAISE NOTICE '✅ Sistema de autenticação profissional pronto!';
  RAISE NOTICE '📝 Acesse /private para testar';
END $$;