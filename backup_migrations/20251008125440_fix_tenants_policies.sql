-- Fix tenants table policies to ensure handle_new_user function works correctly
-- This migration addresses any RLS issues with the tenants table

-- Ensure the tenants table exists with correct structure
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

-- Ensure RLS is enabled
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

-- Drop and recreate tenant policies to ensure they work correctly
DROP POLICY IF EXISTS "tenants_owner_all" ON tenants;
DROP POLICY IF EXISTS "service_role_bypass_tenants" ON tenants;

-- Users can access their own tenant (as owner or member)
CREATE POLICY "tenants_owner_all" ON tenants
  FOR ALL USING (
    owner_id = auth.uid() OR 
    id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid())
  );

-- Service role can bypass RLS (essential for triggers and functions)
CREATE POLICY "service_role_bypass_tenants" ON tenants
  FOR ALL USING (auth.role() = 'service_role');

-- Ensure updated_at trigger exists for tenants
DROP TRIGGER IF EXISTS update_tenants_updated_at ON tenants;
CREATE TRIGGER update_tenants_updated_at 
  BEFORE UPDATE ON tenants 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_tenants_owner_id ON tenants(owner_id);
CREATE INDEX IF NOT EXISTS idx_tenants_slug ON tenants(slug);

-- Add comment for documentation
COMMENT ON TABLE tenants IS 'Multi-tenant organizations with subscription management';
