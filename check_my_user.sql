-- VERIFICAÇÃO ESPECÍFICA DO SEU USUÁRIO
-- Execute este script no SQL Editor do Supabase

-- 1. VERIFICAR ESPECIFICAMENTE O SEU USUÁRIO
SELECT 
  'MEU USUÁRIO' as status,
  au.id,
  au.email,
  p.role,
  p.created_at,
  p.updated_at,
  CASE 
    WHEN p.role = 'super_admin' THEN '🔥 SUPER ADMIN CONFIRMADO!'
    WHEN p.role = 'admin' THEN '⚡ ADMIN'  
    WHEN p.role = 'user' THEN '👤 USUÁRIO COMUM'
    ELSE '❌ SEM ROLE DEFINIDO'
  END as status_final
FROM auth.users au
LEFT JOIN profiles p ON p.id = au.id
WHERE au.email = 'peepers.shop@gmail.com';

-- 2. SE NÃO APARECER SUPER_ADMIN, FORÇAR NOVAMENTE
UPDATE profiles 
SET 
  role = 'super_admin',
  updated_at = NOW()
WHERE id = (SELECT id FROM auth.users WHERE email = 'peepers.shop@gmail.com');

-- 3. VERIFICAR NOVAMENTE APÓS UPDATE
SELECT 
  'APÓS FORÇAR UPDATE' as status,
  au.email,
  p.role,
  p.updated_at,
  'AGORA DEVE ESTAR CORRETO!' as observacao
FROM auth.users au
JOIN profiles p ON p.id = au.id
WHERE au.email = 'peepers.shop@gmail.com';

-- 4. CONTAR QUANTOS PROFILES EXISTEM
SELECT 
  'TOTAL DE USUÁRIOS' as status,
  COUNT(*) as total_usuarios,
  COUNT(CASE WHEN role = 'super_admin' THEN 1 END) as super_admins,
  COUNT(CASE WHEN role = 'admin' THEN 1 END) as admins,
  COUNT(CASE WHEN role = 'user' THEN 1 END) as usuarios
FROM profiles;

-- 5. LISTAR TODOS OS USUÁRIOS E SUAS ROLES
SELECT 
  'TODOS OS USUÁRIOS' as status,
  au.email,
  COALESCE(p.role, 'SEM_PROFILE') as role,
  CASE 
    WHEN p.role = 'super_admin' THEN '🔥'
    WHEN p.role = 'admin' THEN '⚡'  
    WHEN p.role = 'user' THEN '👤'
    ELSE '❓'
  END as emoji
FROM auth.users au
LEFT JOIN profiles p ON p.id = au.id
ORDER BY au.email;