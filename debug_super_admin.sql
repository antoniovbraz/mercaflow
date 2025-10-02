-- =====================================================
-- 🔍 MERCA FLOW - DEBUG SUPER ADMIN STATUS
-- =====================================================
-- Verifica se o super admin foi criado corretamente

-- 📊 Verificar registros na auth.users
SELECT 
    'AUTH USERS' as table_name,
    id,
    email,
    created_at,
    raw_user_meta_data->>'full_name' as full_name
FROM auth.users 
WHERE email = 'peepers.shop@gmail.com';

-- 📊 Verificar registros na platform_owners  
SELECT 
    'PLATFORM OWNERS' as table_name,
    id,
    email,
    full_name,
    role,
    personal_tenant_enabled,
    created_at
FROM platform_owners 
WHERE email = 'peepers.shop@gmail.com';

-- 📊 Contar todos os registros
SELECT 
    (SELECT COUNT(*) FROM auth.users) as total_auth_users,
    (SELECT COUNT(*) FROM platform_owners) as total_platform_owners,
    (SELECT COUNT(*) FROM platform_owners WHERE role = 'super_admin') as super_admins;

-- 📊 Verificar se função helper funciona
SELECT is_super_admin('peepers.shop@gmail.com') as is_super_admin_function;