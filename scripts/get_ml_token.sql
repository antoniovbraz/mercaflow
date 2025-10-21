-- MercaFlow - Get ML Access Token
-- Execute this query in Supabase SQL Editor to get your ML token

-- Get ML integration details for specific user
SELECT 
  id as integration_id,
  user_id,
  ml_user_id,
  access_token,
  refresh_token,
  token_expires_at,
  created_at,
  updated_at,
  CASE 
    WHEN token_expires_at > NOW() THEN '✓ Token válido'
    ELSE '✗ Token expirado'
  END as status
FROM ml_integrations
WHERE user_id = (
  SELECT id 
  FROM auth.users 
  WHERE email = 'peepers.shop@gmail.com'
)
ORDER BY created_at DESC
LIMIT 1;

-- Alternative: Get all ML integrations for current tenant
-- Uncomment if you want to see all integrations

/*
SELECT 
  mi.id as integration_id,
  u.email,
  mi.ml_user_id,
  LEFT(mi.access_token, 20) || '...' as token_preview,
  mi.token_expires_at,
  CASE 
    WHEN mi.token_expires_at > NOW() THEN '✓ Válido'
    ELSE '✗ Expirado'
  END as status
FROM ml_integrations mi
JOIN auth.users u ON mi.user_id = u.id
WHERE mi.tenant_id = (
  SELECT tenant_id 
  FROM profiles 
  WHERE user_id = (SELECT id FROM auth.users WHERE email = 'peepers.shop@gmail.com')
)
ORDER BY mi.created_at DESC;
*/
