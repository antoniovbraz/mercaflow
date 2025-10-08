-- Re-enable RLS with fixed policies that don't cause recursion

-- First, drop all existing policies to start clean
DROP POLICY IF EXISTS "Users can view own tenant" ON tenants;
DROP POLICY IF EXISTS "Users can update own tenant" ON tenants;
DROP POLICY IF EXISTS "Users can insert own tenant" ON tenants;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Service role full access" ON profiles;
DROP POLICY IF EXISTS "Service role full access tenants" ON tenants;
DROP POLICY IF EXISTS "ML users access" ON ml_users;
DROP POLICY IF EXISTS "ML items access" ON ml_items;
DROP POLICY IF EXISTS "ML webhooks access" ON ml_webhooks;
DROP POLICY IF EXISTS "Activity logs access" ON activity_logs;
DROP POLICY IF EXISTS "Error logs access" ON error_logs;

-- Re-enable RLS on tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ml_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE ml_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE ml_webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

-- Tenants: Simple ownership-based policies
CREATE POLICY "tenants_owner_access" ON tenants
  FOR ALL USING (owner_id = auth.uid());

-- Profiles: Users can only access their own profile
CREATE POLICY "profiles_own_access" ON profiles
  FOR ALL USING (id = auth.uid());

-- Service role can bypass RLS for all operations (important for triggers)
CREATE POLICY "profiles_service_role" ON profiles
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "tenants_service_role" ON tenants
  FOR ALL USING (auth.role() = 'service_role');

-- For other tables, we'll use a simpler approach
-- Since the handle_new_user function creates tenant-profile relationships,
-- and users should only access data from their own tenant,
-- we'll allow access based on whether they have a profile that links to the tenant

-- ML Users: Allow access if user owns the tenant
CREATE POLICY "ml_users_tenant_owner" ON ml_users
  FOR ALL USING (
    tenant_id IN (
      SELECT t.id FROM tenants t WHERE t.owner_id = auth.uid()
    )
  );

-- ML Items: Allow access if user owns the tenant
CREATE POLICY "ml_items_tenant_owner" ON ml_items
  FOR ALL USING (
    tenant_id IN (
      SELECT t.id FROM tenants t WHERE t.owner_id = auth.uid()
    )
  );

-- ML Webhooks: Allow access if user owns the tenant
CREATE POLICY "ml_webhooks_tenant_owner" ON ml_webhooks
  FOR ALL USING (
    tenant_id IN (
      SELECT t.id FROM tenants t WHERE t.owner_id = auth.uid()
    )
  );

-- Activity Logs: Allow access if user owns the tenant
CREATE POLICY "activity_logs_tenant_owner" ON activity_logs
  FOR ALL USING (
    tenant_id IN (
      SELECT t.id FROM tenants t WHERE t.owner_id = auth.uid()
    )
  );

-- Error Logs: Allow access to own errors or if user owns the tenant
CREATE POLICY "error_logs_access" ON error_logs
  FOR SELECT USING (
    user_id = auth.uid() OR
    tenant_id IN (
      SELECT t.id FROM tenants t WHERE t.owner_id = auth.uid()
    )
  );