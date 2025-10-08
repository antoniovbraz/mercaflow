-- Fix RLS policies to prevent infinite recursion
-- Drop all existing policies first
DROP POLICY IF EXISTS "Users can view own tenant" ON tenants;
DROP POLICY IF EXISTS "Users can update own tenant" ON tenants;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Service role can manage profiles" ON profiles;
DROP POLICY IF EXISTS "ML users tenant access" ON ml_users;
DROP POLICY IF EXISTS "ML items tenant access" ON ml_items;
DROP POLICY IF EXISTS "ML webhooks tenant access" ON ml_webhooks;
DROP POLICY IF EXISTS "Activity logs tenant access" ON activity_logs;
DROP POLICY IF EXISTS "Error logs access" ON error_logs;

-- Tenants: Simple policies based on ownership
CREATE POLICY "Users can view own tenant" ON tenants
  FOR SELECT USING (owner_id = auth.uid());

CREATE POLICY "Users can update own tenant" ON tenants
  FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Users can insert own tenant" ON tenants
  FOR INSERT WITH CHECK (owner_id = auth.uid());

-- Profiles: Allow users to manage their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (id = auth.uid());

-- Allow service role full access (for triggers and admin operations)
CREATE POLICY "Service role full access" ON profiles
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access tenants" ON tenants
  FOR ALL USING (auth.role() = 'service_role');

-- For other tables, allow access based on tenant ownership
-- ML Users
CREATE POLICY "ML users access" ON ml_users
  FOR ALL USING (
    tenant_id IN (SELECT id FROM tenants WHERE owner_id = auth.uid())
  );

-- ML Items
CREATE POLICY "ML items access" ON ml_items
  FOR ALL USING (
    tenant_id IN (SELECT id FROM tenants WHERE owner_id = auth.uid())
  );

-- ML Webhooks
CREATE POLICY "ML webhooks access" ON ml_webhooks
  FOR ALL USING (
    tenant_id IN (SELECT id FROM tenants WHERE owner_id = auth.uid())
  );

-- Activity Logs
CREATE POLICY "Activity logs access" ON activity_logs
  FOR ALL USING (
    tenant_id IN (SELECT id FROM tenants WHERE owner_id = auth.uid())
  );

-- Error Logs
CREATE POLICY "Error logs access" ON error_logs
  FOR SELECT USING (
    user_id = auth.uid() OR
    tenant_id IN (SELECT id FROM tenants WHERE owner_id = auth.uid())
  );