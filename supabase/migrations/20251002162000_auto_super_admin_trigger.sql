-- =====================================================
-- 🚀 MERCA FLOW - AUTO SUPER ADMIN TRIGGER
-- =====================================================
-- Cria trigger automático para detectar e promover super admins
-- Emails: peepers.shop@gmail.com & antoniovbraz@gmail.com

-- 🔧 Função que será executada após inserção na auth.users
CREATE OR REPLACE FUNCTION handle_new_user_registration()
RETURNS TRIGGER AS $$
DECLARE
    is_super_admin_email BOOLEAN := FALSE;
BEGIN
    -- 🎯 Verifica se o email é um dos super admins
    IF NEW.email IN ('peepers.shop@gmail.com', 'antoniovbraz@gmail.com') THEN
        is_super_admin_email := TRUE;
    END IF;

    -- 👑 Se for super admin, cria automaticamente o registro
    IF is_super_admin_email THEN
        INSERT INTO platform_owners (
            id,
            email,
            full_name,
            created_at,
            updated_at
        ) VALUES (
            NEW.id,
            NEW.email,
            COALESCE(NEW.raw_user_meta_data->>'full_name', 'Super Admin'),
            NOW(),
            NOW()
        );
        
        -- 📝 Log para debug
        RAISE NOTICE 'Super admin created: % (ID: %)', NEW.email, NEW.id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 🎬 Cria o trigger que executa APÓS inserção na auth.users
CREATE OR REPLACE TRIGGER trigger_auto_super_admin
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user_registration();

-- 📊 Comentários para documentação
COMMENT ON FUNCTION handle_new_user_registration() IS 'Automaticamente promove emails específicos a super admin';

-- ✅ Sucesso!
SELECT 'Trigger de Super Admin configurado com sucesso!' AS status;