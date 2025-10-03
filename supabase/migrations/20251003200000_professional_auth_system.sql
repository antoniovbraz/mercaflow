-- =====================================================
-- 🏗️ SOLUÇÃO PROFISSIONAL - REDESIGN COMPLETO DO SISTEMA AUTH
-- =====================================================
-- Análise completa e redesign do sistema de autenticação
-- Substitui todas as correções anteriores por uma arquitetura limpa
-- Data: 03/10/2025

-- 📋 ANÁLISE DO PROBLEMA:
-- 1. Múltiplos triggers conflitantes em diferentes tabelas
-- 2. Funções com dependências quebradas (user_roles, raw_user_meta_data)
-- 3. Lógica de negócio espalhada em vários lugares
-- 4. Falta de padronização e documentação

-- 🎯 OBJETIVOS DA SOLUÇÃO PROFISSIONAL:
-- ✅ Sistema único de criação de usuário
-- ✅ Separação clara de responsabilidades
-- ✅ Error handling robusto
-- ✅ Logging estruturado
-- ✅ Fácil manutenção e debug
-- ✅ Compatibilidade com padrões Supabase

-- 🧹 STEP 1: LIMPEZA COMPLETA (Zero-State)
DROP SCHEMA IF EXISTS auth_system CASCADE;
CREATE SCHEMA auth_system;

-- Remover TODOS os triggers relacionados a auth
DO $$
DECLARE
    trigger_record RECORD;
BEGIN
    -- Listar e remover todos os triggers relacionados a auth/user
    FOR trigger_record IN 
        SELECT t.tgname, c.relname, n.nspname
        FROM pg_trigger t
        JOIN pg_class c ON t.tgrelid = c.oid
        JOIN pg_namespace n ON c.relnamespace = n.oid
        WHERE t.tgname LIKE '%auth%' OR t.tgname LIKE '%user%'
        AND n.nspname IN ('public', 'auth')
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS %I ON %I.%I', 
                      trigger_record.tgname, 
                      trigger_record.nspname, 
                      trigger_record.relname);
        RAISE NOTICE 'Removido trigger: %.%', trigger_record.nspname, trigger_record.tgname;
    END LOOP;
END $$;

-- Remover todas as funções relacionadas
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user_registration() CASCADE;
DROP FUNCTION IF EXISTS public.handle_auth_user_created() CASCADE;
DROP FUNCTION IF EXISTS public.create_user_tenant() CASCADE;
DROP FUNCTION IF EXISTS public.auto_create_super_admin() CASCADE;

-- 🏗️ STEP 2: ARQUITETURA PROFISSIONAL

-- 2.1: Enum para status de processamento
CREATE TYPE auth_system.processing_status AS ENUM (
    'pending',
    'processing', 
    'completed',
    'failed'
);

-- 2.2: Tabela de auditoria para debug
CREATE TABLE auth_system.user_creation_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    email TEXT NOT NULL,
    step TEXT NOT NULL,
    status auth_system.processing_status NOT NULL,
    error_message TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.3: Função principal com arquitetura limpa
CREATE OR REPLACE FUNCTION auth_system.process_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public, auth_system
LANGUAGE plpgsql
AS $$
DECLARE
    _user_id UUID := NEW.id;
    _email TEXT := NEW.email;
    _full_name TEXT;
    _user_role app_role := 'user';
    _tenant_id UUID;
    _tenant_name TEXT;
    _tenant_slug TEXT;
    _step TEXT;
    _error_msg TEXT;
BEGIN
    -- Log início do processamento
    INSERT INTO auth_system.user_creation_log (user_id, email, step, status)
    VALUES (_user_id, _email, 'started', 'processing');
    
    -- STEP 1: Determinar dados do usuário
    _step := 'determine_user_data';
    BEGIN
        -- Extrair nome do metadata (se disponível) ou do email
        _full_name := COALESCE(
            NEW.raw_user_meta_data->>'full_name',
            NEW.raw_user_meta_data->>'name', 
            split_part(_email, '@', 1)
        );
        
        -- Determinar role baseado em regras de negócio
        IF _email = ANY(ARRAY['antoniovbraz@gmail.com', 'admin@mercaflow.com']) THEN
            _user_role := 'super_admin';
        END IF;
        
        INSERT INTO auth_system.user_creation_log (user_id, email, step, status, metadata)
        VALUES (_user_id, _email, _step, 'completed', 
                jsonb_build_object('full_name', _full_name, 'role', _user_role));
        
    EXCEPTION WHEN OTHERS THEN
        _error_msg := SQLERRM;
        INSERT INTO auth_system.user_creation_log (user_id, email, step, status, error_message)
        VALUES (_user_id, _email, _step, 'failed', _error_msg);
        RAISE WARNING 'Erro em %: %', _step, _error_msg;
    END;
    
    -- STEP 2: Criar/atualizar profile
    _step := 'create_profile';
    BEGIN
        INSERT INTO public.profiles (id, email, full_name, role, created_at, updated_at)
        VALUES (_user_id, _email, _full_name, _user_role, NOW(), NOW())
        ON CONFLICT (id) DO UPDATE SET
            email = EXCLUDED.email,
            full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
            role = EXCLUDED.role,
            updated_at = NOW();
            
        INSERT INTO auth_system.user_creation_log (user_id, email, step, status)
        VALUES (_user_id, _email, _step, 'completed');
        
    EXCEPTION WHEN OTHERS THEN
        _error_msg := SQLERRM;
        INSERT INTO auth_system.user_creation_log (user_id, email, step, status, error_message)
        VALUES (_user_id, _email, _step, 'failed', _error_msg);
        RAISE WARNING 'Erro em %: %', _step, _error_msg;
        -- Profile é crítico - não continuar se falhar
        RETURN NEW;
    END;
    
    -- STEP 3: Criar tenant (não crítico)
    _step := 'create_tenant';
    BEGIN
        -- Gerar nome e slug únicos
        _tenant_name := _full_name || '''s Workspace';
        _tenant_slug := lower(regexp_replace(_full_name, '[^a-zA-Z0-9]', '-', 'g'));
        
        -- Garantir unicidade do slug
        WHILE EXISTS (SELECT 1 FROM public.tenants WHERE slug = _tenant_slug) LOOP
            _tenant_slug := _tenant_slug || '-' || (random() * 1000)::int;
        END LOOP;
        
        -- Criar tenant
        INSERT INTO public.tenants (name, slug, status, created_at, updated_at)
        VALUES (_tenant_name, _tenant_slug, 'active', NOW(), NOW())
        RETURNING id INTO _tenant_id;
        
        -- Associar usuário como owner
        INSERT INTO public.tenant_users (tenant_id, user_id, role, status, created_at, updated_at)
        VALUES (_tenant_id, _user_id, 'owner', 'active', NOW(), NOW());
        
        INSERT INTO auth_system.user_creation_log (user_id, email, step, status, metadata)
        VALUES (_user_id, _email, _step, 'completed',
                jsonb_build_object('tenant_id', _tenant_id, 'tenant_slug', _tenant_slug));
        
    EXCEPTION WHEN OTHERS THEN
        _error_msg := SQLERRM;
        INSERT INTO auth_system.user_creation_log (user_id, email, step, status, error_message)
        VALUES (_user_id, _email, _step, 'failed', _error_msg);
        RAISE WARNING 'Erro em %: %', _step, _error_msg;
        -- Tenant não é crítico - continuar mesmo se falhar
    END;
    
    -- STEP 4: Finalizar processamento
    INSERT INTO auth_system.user_creation_log (user_id, email, step, status)
    VALUES (_user_id, _email, 'completed', 'completed');
    
    RETURN NEW;
    
EXCEPTION WHEN OTHERS THEN
    -- Error handler global
    INSERT INTO auth_system.user_creation_log (user_id, email, step, status, error_message)
    VALUES (_user_id, _email, COALESCE(_step, 'unknown'), 'failed', SQLERRM);
    
    RAISE WARNING 'Erro crítico no processamento do usuário %: %', _email, SQLERRM;
    RETURN NEW; -- Não bloquear signup mesmo com erro
END;
$$;

-- 🎯 STEP 3: Trigger único e bem definido
CREATE TRIGGER on_auth_user_created_professional
    AFTER INSERT ON auth.users
    FOR EACH ROW 
    EXECUTE FUNCTION auth_system.process_new_user();

-- 🔒 STEP 4: Permissões e segurança
GRANT USAGE ON SCHEMA auth_system TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA auth_system TO service_role;
GRANT EXECUTE ON FUNCTION auth_system.process_new_user() TO service_role;

-- 📊 STEP 5: Views para monitoramento
CREATE VIEW auth_system.user_creation_status AS
SELECT 
    user_id,
    email,
    COUNT(*) as total_steps,
    COUNT(*) FILTER (WHERE status = 'completed') as completed_steps,
    COUNT(*) FILTER (WHERE status = 'failed') as failed_steps,
    MAX(created_at) as last_activity,
    CASE 
        WHEN COUNT(*) FILTER (WHERE status = 'failed') > 0 THEN 'failed'
        WHEN COUNT(*) FILTER (WHERE step = 'completed') > 0 THEN 'completed'
        ELSE 'processing'
    END as overall_status
FROM auth_system.user_creation_log
GROUP BY user_id, email
ORDER BY last_activity DESC;

-- 🎉 FINALIZAÇÃO
DO $$
BEGIN
    RAISE NOTICE '🏗️  SOLUÇÃO PROFISSIONAL IMPLEMENTADA';
    RAISE NOTICE '✅ Sistema de auth redesenhado completamente';
    RAISE NOTICE '✅ Logging estruturado implementado';
    RAISE NOTICE '✅ Error handling robusto';
    RAISE NOTICE '✅ Monitoramento via views';
    RAISE NOTICE '✅ Trigger único na tabela correta (auth.users)';
    RAISE NOTICE '📊 Use: SELECT * FROM auth_system.user_creation_status;';
END $$;