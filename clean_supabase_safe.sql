-- 🧹 MERCA FLOW - Limpeza Completa do Banco Supabase
-- Execute este script no SQL Editor do Supabase Dashboard
-- ⚠️  ATENÇÃO: Este script vai APAGAR TUDO do schema public!

-- Passo 1: Listar o que será removido (execute primeiro para conferir)
SELECT 'FUNÇÕES QUE SERÃO REMOVIDAS:' as tipo, proname as nome, '' as detalhes
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND proname NOT LIKE 'pg_%'

UNION ALL

SELECT 'TABELAS QUE SERÃO REMOVIDAS:', tablename, ''
FROM pg_tables 
WHERE schemaname = 'public'

UNION ALL

SELECT 'POLICIES QUE SERÃO REMOVIDAS:', policyname, tablename
FROM pg_policies 
WHERE schemaname = 'public'

UNION ALL

SELECT 'TRIGGERS QUE SERÃO REMOVIDOS:', trigger_name, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public'

ORDER BY tipo, nome;

-- =======================================================================
-- ⚠️  DESCOMENTE AS LINHAS ABAIXO APENAS QUANDO QUISER EXECUTAR A LIMPEZA
-- =======================================================================

/*
-- Passo 2: Executar limpeza completa

-- 2.1. Remover todas as policies RLS
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
        RAISE NOTICE 'Removida policy: %.% on %', pol.schemaname, pol.policyname, pol.tablename;
    END LOOP;
END $$;

-- 2.2. Remover todos os triggers
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
        RAISE NOTICE 'Removido trigger: % on %', trig.trigger_name, trig.event_object_table;
    END LOOP;
END $$;

-- 2.3. Remover todas as funções
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
        RAISE NOTICE 'Removida função: %(%)', func.proname, func.args;
    END LOOP;
END $$;

-- 2.4. Remover todas as tabelas
DO $$
DECLARE
    tbl record;
BEGIN
    FOR tbl IN SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP TABLE IF EXISTS public.%I CASCADE', tbl.tablename);
        RAISE NOTICE 'Removida tabela: %', tbl.tablename;
    END LOOP;
END $$;

-- 2.5. Remover todas as views
DO $$
DECLARE
    view_rec record;
BEGIN
    FOR view_rec IN SELECT viewname FROM pg_views WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP VIEW IF EXISTS public.%I CASCADE', view_rec.viewname);
        RAISE NOTICE 'Removida view: %', view_rec.viewname;
    END LOOP;
END $$;

-- 2.6. Remover tipos customizados
DO $$
DECLARE
    type_rec record;
BEGIN
    FOR type_rec IN SELECT typname FROM pg_type t
                   JOIN pg_namespace n ON t.typnamespace = n.oid
                   WHERE n.nspname = 'public'
                   AND t.typtype = 'e'
    LOOP
        EXECUTE format('DROP TYPE IF EXISTS public.%I CASCADE', type_rec.typname);
        RAISE NOTICE 'Removido tipo: %', type_rec.typname;
    END LOOP;
END $$;

-- Confirmar limpeza
SELECT 
    'Limpeza completa finalizada! Banco pronto para o Merca Flow!' as status,
    current_timestamp as executed_at;
*/