-- =====================================================
-- 🔧 MERCA FLOW - FIX SUPER ADMIN TRIGGER
-- =====================================================
-- Corrige o trigger para evitar conflitos e erros 500

-- 🗑️ Remove o trigger anterior se existir
DROP TRIGGER IF EXISTS trigger_auto_super_admin ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user_registration();

-- 🔧 Nova função mais segura que verifica duplicatas
CREATE OR REPLACE FUNCTION handle_new_user_registration()
RETURNS TRIGGER AS $$
DECLARE
    is_super_admin_email BOOLEAN := FALSE;
    existing_record_count INTEGER := 0;
BEGIN
    -- 🎯 Verifica se o email é um dos super admins
    IF NEW.email IN ('peepers.shop@gmail.com', 'antoniovbraz@gmail.com') THEN
        is_super_admin_email := TRUE;
        
        -- 🔍 Verifica se já existe um registro
        SELECT COUNT(*) INTO existing_record_count 
        FROM platform_owners 
        WHERE id = NEW.id OR email = NEW.email;
        
        -- 👑 Se for super admin E não existir registro, cria
        IF existing_record_count = 0 THEN
            INSERT INTO platform_owners (
                id,
                email,
                full_name,
                role,
                personal_tenant_enabled,
                created_at,
                updated_at
            ) VALUES (
                NEW.id,
                NEW.email,
                COALESCE(NEW.raw_user_meta_data->>'full_name', 'Super Admin'),
                'super_admin',
                true,
                NOW(),
                NOW()
            );
            
            -- 📝 Log para debug
            RAISE NOTICE 'Super admin created: % (ID: %)', NEW.email, NEW.id;
        ELSE
            -- 📝 Log se já existe
            RAISE NOTICE 'Super admin already exists: % (ID: %)', NEW.email, NEW.id;
        END IF;
    END IF;

    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- 🚨 Log erro mas não falha a inserção do usuário
        RAISE WARNING 'Error creating super admin record for %: %', NEW.email, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 🎬 Cria o trigger que executa APÓS inserção na auth.users
CREATE TRIGGER trigger_auto_super_admin
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user_registration();

-- 📊 Comentários para documentação
COMMENT ON FUNCTION handle_new_user_registration() IS 'Safely creates super admin records with duplicate checking';

-- ✅ Sucesso!
SELECT 'Fixed Super Admin Trigger configured successfully!' AS status;