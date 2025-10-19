-- Verificar tabelas ML criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE 'ml_%'
ORDER BY table_name;
