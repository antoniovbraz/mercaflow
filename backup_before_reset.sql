-- BACKUP COMPLETO ANTES DA LIMPEZA
-- Execute este script PRIMEIRO para fazer backup dos dados importantes

-- 1. BACKUP DOS USUÁRIOS AUTENTICADOS
SELECT
  'BACKUP USERS' as tipo_backup,
  au.id,
  au.email,
  au.email_confirmed_at,
  au.created_at,
  au.updated_at,
  au.raw_user_meta_data
FROM auth.users au
ORDER BY au.created_at DESC;

-- 2. BACKUP DOS PERFIS
SELECT
  'BACKUP PROFILES' as tipo_backup,
  p.*
FROM profiles p
ORDER BY p.created_at DESC;

-- 3. BACKUP DAS INTEGRAÇÕES ML (se existirem)
SELECT
  'BACKUP ML_INTEGRATIONS' as tipo_backup,
  mi.*
FROM ml_integrations mi
ORDER BY mi.created_at DESC;

-- 4. BACKUP DOS PRODUTOS ML (se existirem)
SELECT
  'BACKUP ML_PRODUCTS' as tipo_backup,
  mp.*
FROM ml_products mp
ORDER BY mp.created_at DESC;

-- 5. CONTAGEM GERAL
SELECT
  'CONTAGEM TOTAL' as tipo_backup,
  'auth.users' as tabela,
  COUNT(*) as registros
FROM auth.users au

UNION ALL

SELECT
  'CONTAGEM TOTAL' as tabela,
  'profiles' as tabela,
  COUNT(*) as registros
FROM profiles

UNION ALL

SELECT
  'CONTAGEM TOTAL' as tabela,
  'ml_integrations' as tabela,
  COUNT(*) as registros
FROM ml_integrations

UNION ALL

SELECT
  'CONTAGEM TOTAL' as tabela,
  'ml_products' as tabela,
  COUNT(*) as registros
FROM ml_products;