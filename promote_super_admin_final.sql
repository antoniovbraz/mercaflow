-- Executar via Supabase CLI para promover super admin
-- Comando: npx supabase sql --file promote_super_admin_final.sql

-- 1. Verificar usuário atual
SELECT 'Verificando usuário atual...' as status;

SELECT 
  au.id,
  au.email,
  au.email_confirmed_at,
  p.role as current_role
FROM auth.users au
LEFT JOIN profiles p ON p.id = au.id
WHERE au.email = 'peepers.shop@gmail.com';

-- 2. Atualizar role se profile existe
UPDATE profiles 
SET 
  role = 'super_admin',
  updated_at = NOW()
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'peepers.shop@gmail.com'
);

-- 3. Criar profile se não existir
INSERT INTO profiles (id, role, created_at, updated_at)
SELECT 
  au.id,
  'super_admin',
  NOW(),
  NOW()
FROM auth.users au
WHERE au.email = 'peepers.shop@gmail.com'
  AND NOT EXISTS (SELECT 1 FROM profiles p WHERE p.id = au.id);

-- 4. Também promover antoniovbraz se existir
UPDATE profiles 
SET 
  role = 'super_admin',
  updated_at = NOW()
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'antoniovbraz@gmail.com'
);

INSERT INTO profiles (id, role, created_at, updated_at)
SELECT 
  au.id,
  'super_admin',
  NOW(),
  NOW()
FROM auth.users au
WHERE au.email = 'antoniovbraz@gmail.com'
  AND NOT EXISTS (SELECT 1 FROM profiles p WHERE p.id = au.id);

-- 5. Verificar resultado final
SELECT 'Resultado final:' as status;

SELECT 
  au.email,
  p.role,
  p.updated_at,
  CASE 
    WHEN p.role = 'super_admin' THEN '✅ SUPER ADMIN ATIVO'
    WHEN p.role = 'admin' THEN '⚠️ Admin (não super)'
    WHEN p.role = 'user' THEN '❌ Usuário comum'
    ELSE '❓ Role indefinido'
  END as status_final
FROM auth.users au
JOIN profiles p ON p.id = au.id
WHERE au.email IN ('peepers.shop@gmail.com', 'antoniovbraz@gmail.com')
ORDER BY au.email;