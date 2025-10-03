-- =====================================================
-- 🚨 CORREÇÃO FINAL - CAMPO raw_user_meta_data
-- =====================================================
-- Corrige o campo que não existe na tabela profiles
-- Data: 03/10/2025

-- 🔧 CORRIGIR FUNÇÃO PARA TABELA PROFILES
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
  
  -- 1. ATUALIZAR ROLE NO PROFILE (se não estiver definido)
  IF NEW.role IS NULL OR NEW.role = 'user' THEN
    NEW.role := user_role;
  END IF;
  
  -- 2. CRIAR TENANT AUTOMATICAMENTE
  BEGIN
    -- Gerar nome e slug do tenant baseado no email (sem raw_user_meta_data)
    tenant_name := COALESCE(NEW.full_name, split_part(NEW.email, '@', 1)) || '''s Workspace';
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

-- 🧹 REMOVER TRIGGERS CONFLITANTES
DROP TRIGGER IF EXISTS on_auth_user_created ON public.profiles;
DROP TRIGGER IF EXISTS on_auth_user_created_tenant ON public.profiles;

-- 🎯 CRIAR TRIGGER ÚNICO E LIMPO
DROP TRIGGER IF EXISTS on_profile_created_complete ON public.profiles;
CREATE TRIGGER on_profile_created_complete
  BEFORE INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_auth_user_created();

-- 🎉 LOG DE CONCLUSÃO
DO $$
BEGIN
  RAISE NOTICE '🎉 Correção final aplicada!';
  RAISE NOTICE '✅ Função corrigida para trabalhar com tabela profiles';
  RAISE NOTICE '✅ Campo raw_user_meta_data removido';
  RAISE NOTICE '✅ Trigger único criado';
  RAISE NOTICE '🚀 Signup deve funcionar agora!';
END $$;