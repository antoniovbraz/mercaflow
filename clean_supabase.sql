-- Script para limpar TUDO do banco Supabase e começar do zero
-- ⚠️  CUIDADO: Este script vai APAGAR TUDO do banco!

-- 1. Dropar todas as policies RLS
DO $$
DECLARE
    pol record;
BEGIN
    FOR pol IN SELECT schemaname, tablename, policyname 
               FROM pg_policies 
               WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
                      pol.policyname, pol.schemaname, pol.tablename);
    END LOOP;
END $$;

-- 2. Dropar todas as funções do schema public
DO $$
DECLARE
    func record;
BEGIN
    FOR func IN SELECT proname, oidvectortypes(proargtypes) as args
                FROM pg_proc p
                JOIN pg_namespace n ON p.pronamespace = n.oid
                WHERE n.nspname = 'public'
                AND proname NOT LIKE 'pg_%'
    LOOP
        EXECUTE format('DROP FUNCTION IF EXISTS public.%I(%s) CASCADE', 
                      func.proname, func.args);
    END LOOP;
END $$;

-- 3. Dropar todos os triggers
DO $$
DECLARE
    trig record;
BEGIN
    FOR trig IN SELECT trigger_name, event_object_table
                FROM information_schema.triggers
                WHERE trigger_schema = 'public'
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS %I ON public.%I CASCADE', 
                      trig.trigger_name, trig.event_object_table);
    END LOOP;
END $$;

-- 4. Dropar todas as tabelas do schema public
DO $$
DECLARE
    tbl record;
BEGIN
    FOR tbl IN SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP TABLE IF EXISTS public.%I CASCADE', tbl.tablename);
    END LOOP;
END $$;

-- 5. Dropar todas as views
DO $$
DECLARE
    view_rec record;
BEGIN
    FOR view_rec IN SELECT viewname FROM pg_views WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP VIEW IF EXISTS public.%I CASCADE', view_rec.viewname);
    END LOOP;
END $$;

-- 6. Dropar todos os tipos customizados
DO $$
DECLARE
    type_rec record;
BEGIN
    FOR type_rec IN SELECT typname FROM pg_type t
                   JOIN pg_namespace n ON t.typnamespace = n.oid
                   WHERE n.nspname = 'public'
                   AND t.typtype = 'e'  -- enum types
    LOOP
        EXECUTE format('DROP TYPE IF EXISTS public.%I CASCADE', type_rec.typname);
    END LOOP;
END $$;

-- 7. Limpar comentários e extensões desnecessárias (se houver)
-- Nota: Não mexemos com extensões críticas do Supabase

SELECT 'Limpeza completa do banco de dados finalizada!' as status;