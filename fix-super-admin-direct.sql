-- Execute este SQL diretamente no Supabase Dashboard
-- https://supabase.com/dashboard/project/pnzbnciiokgiadkfgrcn/sql

-- 1. Verificar seu usuário atual
SELECT 
  au.id,
  au.email,
  au.email_confirmed_at,
  p.role,
  p.created_at,
  p.updated_at
FROM auth.users au
LEFT JOIN profiles p ON p.id = au.id
WHERE au.email = 'peepers.shop@gmail.com';

-- 2. Forçar atualização do seu role para super_admin
UPDATE profiles 
SET 
  role = 'super_admin',
  updated_at = NOW()
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'peepers.shop@gmail.com'
);

-- 3. Se não existir profile, criar um
INSERT INTO profiles (id, role, created_at, updated_at)
SELECT 
  au.id,
  'super_admin',
  NOW(),
  NOW()
FROM auth.users au
WHERE au.email = 'peepers.shop@gmail.com'
  AND NOT EXISTS (SELECT 1 FROM profiles p WHERE p.id = au.id);

-- 4. Verificar o resultado
SELECT 
  au.email,
  p.role,
  p.updated_at,
  CASE 
    WHEN p.role = 'super_admin' THEN '✅ SUPER ADMIN ATIVO'
    ELSE '❌ Ainda não funcionou'
  END as status
FROM auth.users au
JOIN profiles p ON p.id = au.id
WHERE au.email = 'peepers.shop@gmail.com';