-- Execute este SQL diretamente no Supabase SQL Editor
-- Dashboard -> SQL Editor -> New Query

-- 1. Verificar usuário atual
SELECT 
  au.id,
  au.email,
  au.email_confirmed_at,
  p.role,
  p.created_at as profile_created
FROM auth.users au
LEFT JOIN profiles p ON p.id = au.id
WHERE au.email = 'peepers.shop@gmail.com';

-- 2. Criar ou atualizar profile para super_admin
INSERT INTO profiles (id, role, created_at, updated_at)
SELECT 
  au.id,
  'super_admin',
  COALESCE(p.created_at, NOW()),
  NOW()
FROM auth.users au
LEFT JOIN profiles p ON p.id = au.id
WHERE au.email = 'peepers.shop@gmail.com'
ON CONFLICT (id) 
DO UPDATE SET 
  role = 'super_admin',
  updated_at = NOW();

-- 3. Verificar se a promoção funcionou
SELECT 
  au.email,
  p.role,
  p.created_at,
  p.updated_at
FROM auth.users au
JOIN profiles p ON p.id = au.id
WHERE au.email = 'peepers.shop@gmail.com';