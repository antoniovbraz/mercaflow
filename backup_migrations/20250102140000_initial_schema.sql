-- Create initial schema for MercaFlow
-- This migration sets up the foundation for multi-tenancy and RBAC

-- Create tenants table
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

-- Create profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  role TEXT CHECK (role IN ('super_admin', 'admin', 'manager', 'user', 'viewer')) DEFAULT 'user',
  avatar_url TEXT,
  tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create ML users table (Mercado Livre integrations)
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

-- Create ML items table (synchronized products)
CREATE TABLE IF NOT EXISTS ml_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ml_user_id UUID REFERENCES ml_users(id) ON DELETE CASCADE NOT NULL,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  ml_item_id TEXT NOT NULL,
  title TEXT NOT NULL,
  category_id TEXT,
  price DECIMAL(12,2),
  available_quantity INTEGER,
  condition TEXT,
  listing_type_id TEXT,
  permalink TEXT,
  thumbnail TEXT,
  status TEXT CHECK (status IN ('active', 'paused', 'closed')),
  sync_status TEXT DEFAULT 'pending' CHECK (sync_status IN ('pending', 'synced', 'error')),
  raw_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, ml_item_id)
);

-- Create ML webhooks table (event logging)
CREATE TABLE IF NOT EXISTS ml_webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  ml_user_id UUID REFERENCES ml_users(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  resource TEXT NOT NULL,
  application_id BIGINT NOT NULL,
  attempts INTEGER DEFAULT 1,
  payload JSONB NOT NULL,
  processed BOOLEAN DEFAULT FALSE,
  processed_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create activity logs table (audit trail)
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  metadata JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create error logs table (system errors)
CREATE TABLE IF NOT EXISTS error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
  error_type TEXT NOT NULL,
  error_message TEXT NOT NULL,
  stack_trace TEXT,
  context JSONB DEFAULT '{}',
  resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ml_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE ml_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE ml_webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_tenant_id ON profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_ml_users_tenant_id ON ml_users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_ml_users_ml_user_id ON ml_users(ml_user_id);
CREATE INDEX IF NOT EXISTS idx_ml_users_token_expires ON ml_users(token_expires_at);
CREATE INDEX IF NOT EXISTS idx_ml_items_tenant_id ON ml_items(tenant_id);
CREATE INDEX IF NOT EXISTS idx_ml_items_ml_user_id ON ml_items(ml_user_id);
CREATE INDEX IF NOT EXISTS idx_ml_items_status ON ml_items(status);
CREATE INDEX IF NOT EXISTS idx_ml_items_sync_status ON ml_items(sync_status);
CREATE INDEX IF NOT EXISTS idx_ml_webhooks_tenant_id ON ml_webhooks(tenant_id);
CREATE INDEX IF NOT EXISTS idx_ml_webhooks_processed ON ml_webhooks(processed, created_at);
CREATE INDEX IF NOT EXISTS idx_ml_webhooks_topic ON ml_webhooks(topic);
CREATE INDEX IF NOT EXISTS idx_activity_logs_tenant_id ON activity_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_error_logs_resolved ON error_logs(resolved, created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ml_users_updated_at BEFORE UPDATE ON ml_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ml_items_updated_at BEFORE UPDATE ON ml_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to automatically create profile and tenant on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_tenant_id UUID;
  tenant_slug TEXT;
BEGIN
  -- Generate a unique tenant slug from email
  tenant_slug := LOWER(REPLACE(SPLIT_PART(NEW.email, '@', 1), '.', '-'));
  
  -- Ensure slug is unique by adding random suffix if needed
  WHILE EXISTS (SELECT 1 FROM tenants WHERE slug = tenant_slug) LOOP
    tenant_slug := tenant_slug || '-' || SUBSTR(gen_random_uuid()::TEXT, 1, 4);
  END LOOP;
  
  -- Create tenant first
  INSERT INTO tenants (name, slug, owner_id)
  VALUES (
    COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
    tenant_slug,
    NEW.id
  )
  RETURNING id INTO new_tenant_id;
  
  -- Create profile
  INSERT INTO profiles (id, full_name, tenant_id, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
    new_tenant_id,
    CASE 
      WHEN NEW.email IN ('peepers.shop@gmail.com', 'antoniovbraz@gmail.com') THEN 'super_admin'
      ELSE 'user'
    END
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create basic RLS policies

-- Tenants: Users can see their own tenant
CREATE POLICY "Users can view own tenant" ON tenants
  FOR SELECT USING (
    owner_id = auth.uid() OR 
    id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can update own tenant" ON tenants
  FOR UPDATE USING (
    owner_id = auth.uid() OR 
    id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- Profiles: Users can view profiles from same tenant
CREATE POLICY "Users can view profiles from same tenant" ON profiles
  FOR SELECT USING (
    id = auth.uid() OR 
    tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (id = auth.uid());

-- ML Users: Tenant isolation
CREATE POLICY "ML users tenant isolation" ON ml_users
  FOR ALL USING (
    tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid())
  );

-- ML Items: Tenant isolation
CREATE POLICY "ML items tenant isolation" ON ml_items
  FOR ALL USING (
    tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid())
  );

-- ML Webhooks: Tenant isolation
CREATE POLICY "ML webhooks tenant isolation" ON ml_webhooks
  FOR ALL USING (
    tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid())
  );

-- Activity Logs: Tenant isolation
CREATE POLICY "Activity logs tenant isolation" ON activity_logs
  FOR ALL USING (
    tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid())
  );

-- Error Logs: Admin only or own errors
CREATE POLICY "Error logs access" ON error_logs
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );