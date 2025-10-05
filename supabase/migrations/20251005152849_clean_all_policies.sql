-- Complete cleanup of all RLS policies and start fresh

-- Disable RLS on all tables first
ALTER TABLE tenants DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE ml_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE ml_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE ml_webhooks DISABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE error_logs DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies (using a more comprehensive approach)
DO $$
DECLARE
    pol record;
BEGIN
    FOR pol IN
        SELECT schemaname, tablename, policyname
        FROM pg_policies
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I',
                      pol.policyname, pol.schemaname, pol.tablename);
    END LOOP;
END $$;

-- Re-enable RLS
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ml_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE ml_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE ml_webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

-- Create minimal, non-recursive policies

-- Tenants: Owner can do everything
CREATE POLICY "tenants_owner_all" ON tenants
  FOR ALL USING (owner_id = auth.uid());

-- Profiles: Users can only access their own profile
CREATE POLICY "profiles_self_all" ON profiles
  FOR ALL USING (id = auth.uid());

-- Service role bypass for all tables (critical for triggers)
CREATE POLICY "service_role_bypass_profiles" ON profiles
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_role_bypass_tenants" ON tenants
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_role_bypass_ml_users" ON ml_users
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_role_bypass_ml_items" ON ml_items
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_role_bypass_ml_webhooks" ON ml_webhooks
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_role_bypass_activity_logs" ON activity_logs
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_role_bypass_error_logs" ON error_logs
  FOR ALL USING (auth.role() = 'service_role');