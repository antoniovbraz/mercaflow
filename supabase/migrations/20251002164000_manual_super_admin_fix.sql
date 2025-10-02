-- =====================================================
-- 🔧 MERCA FLOW - MANUAL SUPER ADMIN CREATION
-- =====================================================
-- Cria manualmente o registro do super admin que o trigger deveria ter criado

-- 👑 Inserir manualmente o super admin
INSERT INTO platform_owners (
    id,
    email,
    role,
    personal_tenant_enabled,
    created_at,
    updated_at
) VALUES (
    '2d605dce-b4a4-4ddc-91b3-71b3be0c6d6c',
    'peepers.shop@gmail.com',
    'super_admin',
    true,
    NOW(),
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    personal_tenant_enabled = EXCLUDED.personal_tenant_enabled,
    updated_at = NOW();

-- 📊 Verificar se foi criado
SELECT 
    'MANUAL SUPER ADMIN CREATED' as status,
    id,
    email,
    role,
    personal_tenant_enabled
FROM platform_owners 
WHERE email = 'peepers.shop@gmail.com';

-- ✅ Correção manual concluída!