-- Script para verificar se as migrações RBAC foram executadas
-- Execute este script no SQL Editor do Supabase: https://supabase.com/dashboard/project/uuabdpmzxlllxqzhhrxf/sql

-- 1. Verificar se os tipos existem
SELECT 
    typname as "Tipo Enum",
    string_agg(enumlabel, ', ' ORDER BY enumsortorder) as "Valores"
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid 
WHERE typname IN ('app_role', 'app_permission', 'user_role')
GROUP BY typname, t.oid
ORDER BY typname;

-- 2. Verificar se as tabelas existem
SELECT 
    schemaname,
    tablename,
    tableowner,
    hasindexes,
    hasrules,
    hastriggers,
    rowsecurity
FROM pg_tables 
WHERE tablename IN ('user_roles', 'role_permissions', 'platform_owners', 'tenants', 'tenant_users', 'ml_users')
ORDER BY tablename;

-- 3. Verificar se as funções existem
SELECT 
    routine_name as "Função",
    routine_type as "Tipo",
    specific_name
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('custom_access_token_hook', 'authorize', 'is_super_admin', 'is_admin', 'promote_to_super_admin')
ORDER BY routine_name;

-- 4. Contar registros nas tabelas (se existirem)
DO $$
DECLARE
    rec record;
    sql_text text;
    table_count integer;
BEGIN
    FOR rec IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename IN ('user_roles', 'role_permissions', 'platform_owners', 'tenants', 'tenant_users', 'ml_users')
    LOOP
        sql_text := format('SELECT COUNT(*) FROM %I', rec.tablename);
        EXECUTE sql_text INTO table_count;
        RAISE NOTICE 'Tabela %: % registros', rec.tablename, table_count;
    END LOOP;
END $$;

-- 5. Verificar Auth Hook configurado (se possível)
-- Nota: Esta informação geralmente não é visível via SQL, precisa verificar no Dashboard

-- 6. Se user_roles existir, mostrar usuários com roles
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'user_roles' AND schemaname = 'public') THEN
        RAISE NOTICE '=== USUÁRIOS COM ROLES ===';
        FOR rec IN 
            SELECT 
                ur.role,
                u.email,
                ur.created_at
            FROM user_roles ur
            JOIN auth.users u ON ur.user_id = u.id
            ORDER BY ur.role, u.email
        LOOP
            RAISE NOTICE 'Role: % | Email: % | Criado: %', rec.role, rec.email, rec.created_at;
        END LOOP;
    ELSE
        RAISE NOTICE 'Tabela user_roles não encontrada - RBAC não foi configurado ainda';
    END IF;
END $$;