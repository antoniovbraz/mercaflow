-- Ensure all required tables exist
-- This migration checks and creates tables if they don't exist

-- Create tenants table if it doesn't exist
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  settings JSONB DEFAULT '{}',
  subscription_plan TEXT DEFAULT 'starter' CHECK (subscription_plan IN ('starter', 'business', 'enterprise')),
  subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'inactive', 'cancelled', 'past_due')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  role TEXT CHECK (role IN ('super_admin', 'admin', 'user')) DEFAULT 'user',
  avatar_url TEXT,
  tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create ML users table if it doesn't exist
CREATE TABLE IF NOT EXISTS ml_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  ml_user_id BIGINT NOT NULL,
  nickname TEXT NOT NULL,
  email TEXT,
  site_id TEXT NOT NULL, -- MLA, MLB, MLM, etc.
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  token_expires_at TIMESTAMPTZ NOT NULL,
  scope TEXT[] DEFAULT ARRAY['read', 'write', 'offline_access'],
  account_type TEXT, -- personal, professional
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, ml_user_id)
);

-- Create ML items table if it doesn't exist
CREATE TABLE IF NOT EXISTS ml_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ml_user_id UUID REFERENCES ml_users(id) ON DELETE CASCADE NOT NULL,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  ml_item_id BIGINT NOT NULL,
  title TEXT NOT NULL,
  price DECIMAL(10,2),
  currency TEXT DEFAULT 'BRL',
  available_quantity INTEGER,
  sold_quantity INTEGER DEFAULT 0,
  status TEXT CHECK (status IN ('active', 'paused', 'closed')) DEFAULT 'active',
  sync_status TEXT CHECK (sync_status IN ('synced', 'pending', 'error')) DEFAULT 'pending',
  last_sync TIMESTAMPTZ,
  category_id TEXT,
  permalink TEXT,
  thumbnail TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, ml_item_id)
);

-- Create ML webhooks table if it doesn't exist
CREATE TABLE IF NOT EXISTS ml_webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  webhook_id TEXT NOT NULL,
  topic TEXT NOT NULL,
  resource TEXT,
  user_id TEXT,
  application_id TEXT,
  attempts INTEGER DEFAULT 0,
  status TEXT CHECK (status IN ('active', 'inactive')) DEFAULT 'active',
  processed BOOLEAN DEFAULT FALSE,
  received_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create activity logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create error logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  error_type TEXT NOT NULL,
  error_message TEXT NOT NULL,
  stack_trace TEXT,
  context JSONB DEFAULT '{}',
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ml_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE ml_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE ml_webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

-- Create or replace the handle_new_user function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_tenant_id UUID;
  user_name TEXT;
  tenant_name TEXT;
BEGIN
  -- Get user name from metadata or email
  user_name := COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1));
  tenant_name := user_name || ' Organization';

  -- Create tenant with simple name (no complex slug logic)
  INSERT INTO tenants (name, slug, owner_id)
  VALUES (
    tenant_name,
    LOWER(REPLACE(user_name, ' ', '-') || '-' || SUBSTR(NEW.id::TEXT, 1, 8)),
    NEW.id
  )
  RETURNING id INTO new_tenant_id;

  -- Create profile with default 'user' role
  INSERT INTO profiles (id, full_name, tenant_id, role)
  VALUES (
    NEW.id,
    user_name,
    new_tenant_id,
    'user'
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the user creation
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    -- Still create a basic profile without tenant if tenant creation fails
    INSERT INTO profiles (id, full_name, role)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
      'user'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup (drop if exists first)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create basic RLS policies (drop if exist first)
DROP POLICY IF EXISTS "Users can view own tenant" ON tenants;
DROP POLICY IF EXISTS "Users can update own tenant" ON tenants;
DROP POLICY IF EXISTS "Users can view profiles from same tenant" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "ML users tenant isolation" ON ml_users;
DROP POLICY IF EXISTS "ML items tenant isolation" ON ml_items;
DROP POLICY IF EXISTS "ML webhooks tenant isolation" ON ml_webhooks;
DROP POLICY IF EXISTS "Activity logs tenant isolation" ON activity_logs;
DROP POLICY IF EXISTS "Error logs access" ON error_logs;

-- Tenants: Users can see their own tenant
CREATE POLICY "Users can view own tenant" ON tenants
  FOR SELECT USING (owner_id = auth.uid());

CREATE POLICY "Users can update own tenant" ON tenants
  FOR UPDATE USING (owner_id = auth.uid());

-- Profiles: Users can view their own profile and profiles from tenants they own
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (id = auth.uid());

-- Allow service role to manage all profiles (for triggers)
CREATE POLICY "Service role can manage profiles" ON profiles
  FOR ALL USING (auth.role() = 'service_role');

-- ML Users: Users can access their own tenant's data
CREATE POLICY "ML users tenant access" ON ml_users
  FOR ALL USING (
    tenant_id IN (
      SELECT id FROM tenants WHERE owner_id = auth.uid()
    )
  );

-- ML Items: Users can access their own tenant's data
CREATE POLICY "ML items tenant access" ON ml_items
  FOR ALL USING (
    tenant_id IN (
      SELECT id FROM tenants WHERE owner_id = auth.uid()
    )
  );

-- ML Webhooks: Users can access their own tenant's data
CREATE POLICY "ML webhooks tenant access" ON ml_webhooks
  FOR ALL USING (
    tenant_id IN (
      SELECT id FROM tenants WHERE owner_id = auth.uid()
    )
  );

-- Activity Logs: Users can access their own tenant's data
CREATE POLICY "Activity logs tenant access" ON activity_logs
  FOR ALL USING (
    tenant_id IN (
      SELECT id FROM tenants WHERE owner_id = auth.uid()
    )
  );

-- Error Logs: Users can see their own errors and admins can see all
CREATE POLICY "Error logs access" ON error_logs
  FOR SELECT USING (
    user_id = auth.uid() OR
    tenant_id IN (
      SELECT id FROM tenants WHERE owner_id = auth.uid()
    )
  );