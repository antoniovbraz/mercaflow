-- =====================================================
-- 🧹 MERCA FLOW - CLEAN BROKEN RECORDS
-- =====================================================
-- Remove registros quebrados para permitir novo cadastro

-- 🗑️ Remove registros problemáticos se existirem
DELETE FROM platform_owners WHERE email IN ('peepers.shop@gmail.com', 'antoniovbraz@gmail.com');

-- 📊 Mostra registros restantes
SELECT 'Cleaned broken super admin records!' AS status;
SELECT COUNT(*) as remaining_platform_owners FROM platform_owners;
SELECT COUNT(*) as total_auth_users FROM auth.users;