-- RECRIAÇÃO COMPLETA DAS TABELAS ESSENCIAIS
-- Execute este script APÓS a limpeza completa

-- 1. RECRIAR TABELA PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  role TEXT CHECK (role IN ('super_admin', 'admin', 'user')) DEFAULT 'user',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. RECRIAR ÍNDICES PARA PROFILES
CREATE INDEX IF NOT EXISTS profiles_role_idx ON public.profiles (role);

-- 3. RECRIAR TABELA ML_INTEGRATIONS
CREATE TABLE IF NOT EXISTS public.ml_integrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ml_user_id BIGINT NOT NULL,
  ml_nickname TEXT,
  ml_email TEXT,
  ml_site_id TEXT DEFAULT 'MLB',
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  token_expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  scopes TEXT[] NOT NULL DEFAULT '{read,write,offline_access}',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'revoked', 'error')),
  auto_sync_enabled BOOLEAN DEFAULT true,
  sync_frequency_minutes INTEGER DEFAULT 60 CHECK (sync_frequency_minutes >= 15),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_sync_at TIMESTAMP WITH TIME ZONE,
  last_error TEXT,
  UNIQUE(user_id, ml_user_id)
);

-- 4. RECRIAR ÍNDICES PARA ML_INTEGRATIONS
CREATE INDEX IF NOT EXISTS ml_integrations_user_id_idx ON public.ml_integrations(user_id);
CREATE INDEX IF NOT EXISTS ml_integrations_ml_user_id_idx ON public.ml_integrations(ml_user_id);
CREATE INDEX IF NOT EXISTS ml_integrations_status_idx ON public.ml_integrations(status);
CREATE INDEX IF NOT EXISTS ml_integrations_token_expires_at_idx ON public.ml_integrations(token_expires_at);

-- 5. RECRIAR TABELA ML_PRODUCTS
CREATE TABLE IF NOT EXISTS public.ml_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  integration_id UUID NOT NULL REFERENCES public.ml_integrations(id) ON DELETE CASCADE,
  ml_item_id TEXT NOT NULL,
  title TEXT NOT NULL,
  category_id TEXT,
  price DECIMAL(15,2),
  available_quantity INTEGER,
  sold_quantity INTEGER,
  status TEXT,
  permalink TEXT,
  ml_data JSONB,
  last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(integration_id, ml_item_id)
);

-- 6. RECRIAR ÍNDICES PARA ML_PRODUCTS
CREATE INDEX IF NOT EXISTS ml_products_integration_id_idx ON public.ml_products(integration_id);
CREATE INDEX IF NOT EXISTS ml_products_ml_item_id_idx ON public.ml_products(ml_item_id);
CREATE INDEX IF NOT EXISTS ml_products_status_idx ON public.ml_products(status);

-- 7. RECRIAR FUNÇÕES
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

  -- Inserir perfil
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    user_role
  );

  RETURN NEW;
END;
$$;

-- 8. RECRIAR TRIGGER
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 9. HABILITAR RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ml_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ml_products ENABLE ROW LEVEL SECURITY;

-- 10. CRIAR POLÍTICAS RLS SIMPLES
-- Perfis
CREATE POLICY "profiles_access" ON public.profiles
  FOR ALL
  TO authenticated
  USING (auth.uid() = id OR auth.uid() IN (
    SELECT id FROM auth.users WHERE email IN ('peepers.shop@gmail.com', 'antoniovbraz@gmail.com')
  ));

-- ML Integrations
CREATE POLICY "ml_integrations_access" ON public.ml_integrations
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid() OR auth.uid() IN (
    SELECT id FROM auth.users WHERE email IN ('peepers.shop@gmail.com', 'antoniovbraz@gmail.com')
  ));

-- ML Products
CREATE POLICY "ml_products_access" ON public.ml_products
  FOR ALL
  TO authenticated
  USING (
    integration_id IN (
      SELECT id FROM public.ml_integrations WHERE user_id = auth.uid()
    ) OR auth.uid() IN (
      SELECT id FROM auth.users WHERE email IN ('peepers.shop@gmail.com', 'antoniovbraz@gmail.com')
    )
  );

-- 11. VERIFICAR TABELAS CRIADAS
SELECT
  'TABELAS RECRIADAS' as status,
  schemaname,
  tablename,
  tableowner
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'ml_integrations', 'ml_products')
ORDER BY tablename;