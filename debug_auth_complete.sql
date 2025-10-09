-- Debug completo do problema de autenticação
-- Verificar dados do usuário atual e tenant_id

-- 1. Verificar usuários existentes no auth.users
SELECT 
    id,
    email,
    created_at,
    email_confirmed_at,
    last_sign_in_at
FROM auth.users 
ORDER BY created_at DESC
LIMIT 5;

-- 2. Verificar profiles existentes
SELECT 
    id,
    full_name,
    tenant_id,
    role,
    created_at
FROM public.profiles
ORDER BY created_at DESC
LIMIT 5;

-- 3. Verificar tenants existentes
SELECT 
    id,
    name,
    slug,
    owner_id,
    created_at
FROM public.tenants
ORDER BY created_at DESC
LIMIT 5;

-- 4. Verificar ml_integrations e seus tenant_ids
SELECT 
    id,
    tenant_id,
    user_id,
    ml_user_id,
    status,
    created_at
FROM public.ml_integrations
ORDER BY created_at DESC
LIMIT 5;

-- 5. Verificar políticas RLS aplicadas
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    cmd, 
    qual
FROM pg_policies 
WHERE tablename IN ('profiles', 'ml_integrations', 'ml_products', 'tenants')
ORDER BY tablename, policyname;