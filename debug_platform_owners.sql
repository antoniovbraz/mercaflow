-- =====================================================
-- 🔍 MERCA FLOW - DEBUG PLATFORM OWNERS
-- =====================================================
-- Verificar se o registro existe e RLS está funcionando

-- 📊 Verificar se o registro existe
SELECT 
    'DIRECT COUNT CHECK' as check_type,
    COUNT(*) as total_records
FROM platform_owners;

-- 📊 Verificar registro específico
SELECT 
    'SPECIFIC RECORD CHECK' as check_type,
    id,
    email,
    role,
    personal_tenant_enabled,
    created_at
FROM platform_owners 
WHERE email = 'peepers.shop@gmail.com' OR id = '2d605dce-b4a4-4ddc-91b3-71b3be0c6d6c';

-- 📊 Verificar todos os registros
SELECT 
    'ALL RECORDS' as check_type,
    id,
    email,
    role,
    personal_tenant_enabled
FROM platform_owners;

-- 🔒 Verificar RLS policies
SELECT 
    'RLS POLICIES' as check_type,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'platform_owners';