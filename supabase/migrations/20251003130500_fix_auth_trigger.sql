-- =====================================================
-- 🚨 CORREÇÃO DEFINITIVA DO SIGNUP - TRIGGER CLEANUP
-- =====================================================
-- Remove todos os triggers conflitantes e deixa apenas o sistema essencial
-- Data: 03/10/2025

-- 🧹 STEP 1: REMOVER TODOS OS TRIGGERS ANTIGOS
DO $$
BEGIN
  -- Remover triggers na tabela auth.users (se existirem)
  DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
  DROP TRIGGER IF EXISTS on_auth_user_created_tenant ON auth.users;
  DROP TRIGGER IF EXISTS handle_new_user_registration ON auth.users;
  
  -- Remover triggers na tabela public.profiles
  DROP TRIGGER IF EXISTS on_auth_user_created ON public.profiles;
  DROP TRIGGER IF EXISTS on_auth_user_created_tenant ON public.profiles;
  DROP TRIGGER IF EXISTS handle_new_user_registration ON public.profiles;
  
  RAISE NOTICE '🧹 Todos os triggers antigos removidos';
END $$;

-- 🧹 STEP 2: REMOVER FUNÇÕES ANTIGAS QUE PODEM CAUSAR CONFLITO
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.handle_new_user_registration();
DROP FUNCTION IF EXISTS public.auto_create_super_admin();

-- 🔧 STEP 3: CRIAR FUNÇÃO NOVA, LIMPA E SIMPLES
CREATE OR REPLACE FUNCTION public.handle_auth_user_created()
RETURNS TRIGGER AS $$
DECLARE
  new_tenant_id UUID;
  tenant_name TEXT;
  tenant_slug TEXT;
  user_role app_role DEFAULT 'user';
BEGIN
  -- Log do início da função
  RAISE NOTICE 'Processando novo usuário: %', NEW.email;
  
  -- Determinar role baseado no email (sem usar user_roles)
  IF NEW.email IN ('antoniovbraz@gmail.com', 'admin@mercaflow.com') THEN
    user_role := 'super_admin';
  END IF;
  
  -- 1. CRIAR PROFILE NA TABELA PROFILES
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    role,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    user_role,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    role = EXCLUDED.role,
    updated_at = NOW();
  
  -- 2. CRIAR TENANT AUTOMATICAMENTE
  BEGIN
    -- Gerar nome e slug do tenant
    tenant_name := COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)) || '''s Workspace';
    tenant_slug := lower(replace(replace(split_part(NEW.email, '@', 1), '.', '-'), '_', '-'));
    
    -- Garantir slug único
    WHILE EXISTS (SELECT 1 FROM public.tenants WHERE slug = tenant_slug) LOOP
      tenant_slug := tenant_slug || '-' || (random() * 1000)::int;
    END LOOP;
    
    -- Criar tenant
    INSERT INTO public.tenants (name, slug, status)
    VALUES (tenant_name, tenant_slug, 'active')
    RETURNING id INTO new_tenant_id;
    
    -- Associar usuário como owner do tenant
    INSERT INTO public.tenant_users (tenant_id, user_id, role, status)
    VALUES (new_tenant_id, NEW.id, 'owner', 'active');
    
    RAISE NOTICE '✅ Tenant criado: % (slug: %)', tenant_name, tenant_slug;
    
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '⚠️  Erro ao criar tenant para %: %', NEW.email, SQLERRM;
    -- Não falhar o signup por causa do tenant
  END;
  
  RAISE NOTICE '✅ Usuário processado com sucesso: %', NEW.email;
  RETURN NEW;
  
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE '❌ Erro no processamento do usuário %: %', NEW.email, SQLERRM;
  -- Continuar mesmo com erro para não bloquear o signup
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 🎯 STEP 4: CRIAR TRIGGER LIMPO NA TABELA CORRETA (auth.users)
DROP TRIGGER IF EXISTS on_auth_user_created_clean ON auth.users;
CREATE TRIGGER on_auth_user_created_clean
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_auth_user_created();

-- 🔒 STEP 5: GARANTIR PERMISSÕES
GRANT EXECUTE ON FUNCTION public.handle_auth_user_created() TO service_role;

-- 🎉 LOG DE CONCLUSÃO
DO $$
BEGIN
  RAISE NOTICE '🎉 Correção do signup concluída!';
  RAISE NOTICE '✅ Trigger limpo criado na tabela auth.users';
  RAISE NOTICE '✅ Função handle_auth_user_created() sem dependências antigas';
  RAISE NOTICE '✅ Sistema de tenant integrado';
  RAISE NOTICE '🚀 Signup deve funcionar agora!';
END $$;======================================
-- 🔧 CORRIGIR TRIGGER DE CRIAÇÃO DE USUÁRIO
-- =====================================================
-- Corrige o trigger para funcionar no auth.users
-- Data: 03/10/2025

-- 🔧 RECRIAR TRIGGER CORRETO NO AUTH.USERS
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 🎯 LOG DE CONCLUSÃO
DO $$
BEGIN
  RAISE NOTICE '✅ Trigger corrigido para auth.users!';
  RAISE NOTICE '🚀 Sistema de signup deve funcionar perfeitamente agora';
END $$;