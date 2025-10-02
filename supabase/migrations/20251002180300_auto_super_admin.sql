-- =====================================================
-- 🔧 AUTO SUPER ADMIN DETECTION
-- =====================================================
-- Função para detectar e criar super admins automaticamente

-- 🎯 FUNÇÃO PARA AUTO-DETECTAR SUPER ADMINS
CREATE OR REPLACE FUNCTION auto_assign_super_admin()
RETURNS TRIGGER AS $$
BEGIN
  -- Verificar se é um dos emails de super admin
  IF NEW.email IN ('peepers.shop@gmail.com', 'antoniovbraz@gmail.com') THEN
    -- Inserir role de super admin
    INSERT INTO user_roles (user_id, role)
    VALUES (NEW.id, 'super_admin')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    RAISE NOTICE '👑 Super admin created for: %', NEW.email;
  ELSE
    -- Usuários normais começam como 'user'
    INSERT INTO user_roles (user_id, role)
    VALUES (NEW.id, 'user')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    RAISE NOTICE '👤 User role assigned to: %', NEW.email;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 🔗 TRIGGER PARA AUTO-ASSIGNMENT
CREATE TRIGGER trigger_auto_assign_roles
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION auto_assign_super_admin();

-- ✅ Sistema de auto-detecção ativo!