-- Promover usuário específico para super_admin
-- Este script garante que o usuário peepers.shop@gmail.com seja super_admin

-- 1. Atualizar role se profile já existe
UPDATE profiles 
SET 
  role = 'super_admin',
  updated_at = NOW()
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'peepers.shop@gmail.com'
) AND EXISTS (
  SELECT 1 FROM profiles WHERE id = profiles.id
);

-- 2. Criar profile se não existir com role super_admin
INSERT INTO profiles (id, role, created_at, updated_at)
SELECT 
  au.id,
  'super_admin',
  NOW(),
  NOW()
FROM auth.users au
WHERE au.email = 'peepers.shop@gmail.com'
  AND NOT EXISTS (SELECT 1 FROM profiles p WHERE p.id = au.id);

-- 3. Também promover antoniovbraz@gmail.com se existir
UPDATE profiles 
SET 
  role = 'super_admin',
  updated_at = NOW()
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'antoniovbraz@gmail.com'
) AND EXISTS (
  SELECT 1 FROM profiles WHERE id = profiles.id
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