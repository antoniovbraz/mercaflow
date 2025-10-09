-- Análise detalhada das colunas das principais tabelas ML

-- 1. TENANTS TABLE
SELECT 'TENANTS' as table_name, column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'tenants'
ORDER BY ordinal_position;

-- 2. ML_INTEGRATIONS TABLE  
SELECT 'ML_INTEGRATIONS' as table_name, column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'ml_integrations'
ORDER BY ordinal_position;

-- 3. ML_PRODUCTS TABLE
SELECT 'ML_PRODUCTS' as table_name, column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'ml_products'
ORDER BY ordinal_position;

-- 4. ML_ORDERS TABLE
SELECT 'ML_ORDERS' as table_name, column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'ml_orders'
ORDER BY ordinal_position;

-- 5. ML_MESSAGES TABLE
SELECT 'ML_MESSAGES' as table_name, column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'ml_messages'
ORDER BY ordinal_position;