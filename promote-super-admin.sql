-- Script para promover usuário para super admin
-- Execute este script direto no SQL Editor do Supabase

-- 1. Verificar o usuário atual
SELECT 
  id, 
  email, 
  created_at,
  email_confirmed_at
FROM auth.users 
WHERE email = 'peepers.shop@gmail.com';

-- 2. Verificar se existe profile
SELECT 
  id,
  role,
  created_at
FROM profiles 
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'peepers.shop@gmail.com'
);

-- 3. Promover para super admin
UPDATE profiles 
SET role = 'super_admin'
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'peepers.shop@gmail.com'
);

-- 4. Criar profile se não existir
INSERT INTO profiles (id, role, created_at, updated_at)
SELECT 
  u.id,
  'super_admin',
  NOW(),
  NOW()
FROM auth.users u
WHERE u.email = 'peepers.shop@gmail.com'
  AND NOT EXISTS (SELECT 1 FROM profiles p WHERE p.id = u.id);

-- 5. Verificar a promoção
SELECT 
  u.email,
  p.role,
  p.created_at as profile_created
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
WHERE u.email = 'peepers.shop@gmail.com';