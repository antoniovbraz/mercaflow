-- =====================================================
-- 🔒 FASE 3: RLS POLICIES WORLD-CLASS (VERSÃO CORRIGIDA)
-- =====================================================
-- Atualizar todas as políticas RLS para usar sistema de autorização avançado
-- com estrutura correta: tenant_users em vez de profiles

-- 🧹 REMOVER POLÍTICAS ANTIGAS DA TABELA ml_users
DROP POLICY IF EXISTS "Users can see ml users from their tenants" ON ml_users;
DROP POLICY IF EXISTS "Users can create ml users in their tenants" ON ml_users;
DROP POLICY IF EXISTS "Users can update ml users in their tenants" ON ml_users;
DROP POLICY IF EXISTS "Users can delete ml users in their tenants" ON ml_users;

-- 🛡️ NOVAS POLÍTICAS WORLD-CLASS PARA ml_users

-- 👀 VISUALIZAÇÃO: Users com permissão ml_users.read
CREATE POLICY "Authorized users can view ml_users" ON ml_users
  FOR SELECT 
  USING (
    authorize('ml_users.read'::app_permission) AND
    tenant_id IN (
      SELECT tu.tenant_id 
      FROM tenant_users tu
      WHERE tu.user_id = auth.uid()
    )
  );

-- ➕ CRIAÇÃO: Users com permissão ml_users.create
CREATE POLICY "Authorized users can create ml_users" ON ml_users
  FOR INSERT 
  WITH CHECK (
    authorize('ml_users.create'::app_permission) AND
    tenant_id IN (
      SELECT tu.tenant_id 
      FROM tenant_users tu
      WHERE tu.user_id = auth.uid()
    )
  );

-- ✏️ ATUALIZAÇÃO: Users com permissão ml_users.update
CREATE POLICY "Authorized users can update ml_users" ON ml_users
  FOR UPDATE 
  USING (
    authorize('ml_users.update'::app_permission) AND
    tenant_id IN (
      SELECT tu.tenant_id 
      FROM tenant_users tu
      WHERE tu.user_id = auth.uid()
    )
  )
  WITH CHECK (
    authorize('ml_users.update'::app_permission) AND
    tenant_id IN (
      SELECT tu.tenant_id 
      FROM tenant_users tu
      WHERE tu.user_id = auth.uid()
    )
  );

-- 🗑️ EXCLUSÃO: Users com permissão ml_users.delete
CREATE POLICY "Authorized users can delete ml_users" ON ml_users
  FOR DELETE 
  USING (
    authorize('ml_users.delete'::app_permission) AND
    tenant_id IN (
      SELECT tu.tenant_id 
      FROM tenant_users tu
      WHERE tu.user_id = auth.uid()
    )
  );

-- 🔒 POLÍTICAS PARA TABELA tenant_users

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Users can see their own profile" ON tenant_users;
DROP POLICY IF EXISTS "Users can update their own profile" ON tenant_users;

-- 👤 VISUALIZAÇÃO DE USUÁRIOS DO TENANT
CREATE POLICY "Users can view tenant_users in their tenant" ON tenant_users
  FOR SELECT 
  USING (
    -- Pode ver próprio registro sempre
    user_id = auth.uid() OR
    -- Ou pode ver outros usuários se tem permissão users.read e mesmo tenant
    (
      authorize('users.read'::app_permission) AND
      tenant_id IN (
        SELECT tu.tenant_id 
        FROM tenant_users tu
        WHERE tu.user_id = auth.uid()
      )
    )
  );

-- ✏️ ATUALIZAÇÃO DE USUÁRIOS DO TENANT
CREATE POLICY "Users can update tenant_users with permission" ON tenant_users
  FOR UPDATE 
  USING (
    -- Pode atualizar próprio registro sempre
    user_id = auth.uid() OR
    -- Ou pode atualizar outros se tem permissão users.update
    authorize('users.update'::app_permission)
  )
  WITH CHECK (
    -- Pode atualizar próprio registro sempre
    user_id = auth.uid() OR
    -- Ou pode atualizar outros se tem permissão users.update
    authorize('users.update'::app_permission)
  );

-- ➕ CRIAÇÃO DE USUÁRIOS DO TENANT (para admins convidarem usuários)
CREATE POLICY "Authorized users can create tenant_users" ON tenant_users
  FOR INSERT 
  WITH CHECK (
    authorize('users.create'::app_permission) OR
    user_id = auth.uid() -- Para auto-criação no primeiro login
  );

-- 🗑️ EXCLUSÃO DE USUÁRIOS DO TENANT
CREATE POLICY "Authorized users can delete tenant_users" ON tenant_users
  FOR DELETE 
  USING (
    authorize('users.delete'::app_permission) AND
    user_id != auth.uid() -- Não pode deletar próprio registro
  );

-- 🔒 POLÍTICAS PARA TABELA tenants

-- 👀 VISUALIZAÇÃO DE TENANTS
CREATE POLICY "Users can view their tenants" ON tenants
  FOR SELECT 
  USING (
    -- Super admins veem todos
    authorize('system.manage'::app_permission) OR
    -- Usuários veem apenas seus tenants
    id IN (
      SELECT tu.tenant_id 
      FROM tenant_users tu
      WHERE tu.user_id = auth.uid()
    )
  );

-- ✏️ ATUALIZAÇÃO DE TENANTS
CREATE POLICY "Authorized users can update tenants" ON tenants
  FOR UPDATE 
  USING (
    authorize('tenants.update'::app_permission)
  )
  WITH CHECK (
    authorize('tenants.update'::app_permission)
  );

-- ➕ CRIAÇÃO DE TENANTS (apenas super admins)
CREATE POLICY "Super admins can create tenants" ON tenants
  FOR INSERT 
  WITH CHECK (
    authorize('tenants.create'::app_permission)
  );

-- 🗑️ EXCLUSÃO DE TENANTS (apenas super admins)
CREATE POLICY "Super admins can delete tenants" ON tenants
  FOR DELETE 
  USING (
    authorize('tenants.delete'::app_permission)
  );

-- 📊 VERIFICAÇÃO DAS POLÍTICAS
DO $$
DECLARE
  ml_users_policies INT;
  tenant_users_policies INT;
  tenants_policies INT;
BEGIN
  -- Contar políticas de ml_users
  SELECT COUNT(*) INTO ml_users_policies
  FROM pg_policies 
  WHERE tablename = 'ml_users' AND schemaname = 'public';
  
  -- Contar políticas de tenant_users
  SELECT COUNT(*) INTO tenant_users_policies
  FROM pg_policies 
  WHERE tablename = 'tenant_users' AND schemaname = 'public';
  
  -- Contar políticas de tenants
  SELECT COUNT(*) INTO tenants_policies
  FROM pg_policies 
  WHERE tablename = 'tenants' AND schemaname = 'public';
  
  RAISE NOTICE '🔒 RLS POLICIES WORLD-CLASS DEPLOYED!';
  RAISE NOTICE '📊 ml_users policies: %', ml_users_policies;
  RAISE NOTICE '👤 tenant_users policies: %', tenant_users_policies;
  RAISE NOTICE '🏢 tenants policies: %', tenants_policies;
  RAISE NOTICE '✅ Sistema de autorização granular multi-tenant ativo!';
END $$;