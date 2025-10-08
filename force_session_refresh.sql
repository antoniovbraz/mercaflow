-- FORÇAR REFRESH DE SESSÃO E ROLES
-- Execute este no SQL Editor para invalidar caches

-- 1. Verificar se função debug existe e funciona
SELECT 
  'TESTE FUNÇÃO DEBUG' as status,
  routine_name,
  routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public'
  AND routine_name = 'debug_current_user_role';

-- 2. Se a função existe, você pode testá-la após fazer login na app
-- (Esta query só funciona quando executada por um usuário autenticado via app)

-- 3. Verificar JWT hooks (se existem)
SELECT 
  'JWT HOOKS' as status,
  routine_name,
  routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public'
  AND routine_name LIKE '%token%'
  OR routine_name LIKE '%jwt%'
  OR routine_name LIKE '%claims%';

-- 4. Verificar se há configuração de custom claims
SELECT 
  'CONFIGURAÇÃO AUTH' as status,
  name,
  value
FROM pg_settings 
WHERE name LIKE '%jwt%' 
  OR name LIKE '%auth%'
  OR name LIKE '%supabase%'
ORDER BY name;

-- 5. Forçar update com timestamp para invalidar cache
UPDATE profiles 
SET 
  updated_at = NOW() + INTERVAL '1 second'
WHERE id = (SELECT id FROM auth.users WHERE email = 'peepers.shop@gmail.com');

-- 6. Verificação final
SELECT 
  'VERIFICAÇÃO FINAL' as status,
  au.email,
  p.role,
  p.updated_at,
  'CACHE INVALIDADO - FAÇA LOGOUT/LOGIN' as instrucao
FROM auth.users au
JOIN profiles p ON p.id = au.id
WHERE au.email = 'peepers.shop@gmail.com';