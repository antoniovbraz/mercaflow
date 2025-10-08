-- Repair profiles table and ensure it exists with correct structure
-- This migration addresses the "relation profiles does not exist" error

-- First ensure the profiles table exists with the correct structure
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  role TEXT CHECK (role IN ('super_admin', 'admin', 'user')) DEFAULT 'user',
  avatar_url TEXT,
  tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Recreate essential policies with service_role bypass
DROP POLICY IF EXISTS "profiles_self_all" ON profiles;
DROP POLICY IF EXISTS "service_role_bypass_profiles" ON profiles;

-- Users can access their own profile
CREATE POLICY "profiles_self_all" ON profiles
  FOR ALL USING (id = auth.uid());

-- Service role can bypass RLS (essential for triggers and functions)
CREATE POLICY "service_role_bypass_profiles" ON profiles
  FOR ALL USING (auth.role() = 'service_role');

-- Ensure the handle_new_user function exists and is correct
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_tenant_id UUID;
  user_name TEXT;
  tenant_name TEXT;
  tenant_slug TEXT;
BEGIN
  -- Get user name from metadata or email
  user_name := COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1));
  tenant_name := user_name || ' Organization';
  tenant_slug := LOWER(REPLACE(user_name, ' ', '-') || '-' || SUBSTR(NEW.id::TEXT, 1, 8));

  -- Create tenant first
  INSERT INTO tenants (name, slug, owner_id)
  VALUES (
    tenant_name,
    tenant_slug,
    NEW.id
  )
  RETURNING id INTO new_tenant_id;

  -- Create profile
  INSERT INTO profiles (id, full_name, tenant_id, role)
  VALUES (
    NEW.id,
    user_name,
    new_tenant_id,
    CASE 
      WHEN NEW.email IN ('peepers.shop@gmail.com', 'antoniovbraz@gmail.com') THEN 'super_admin'
      ELSE 'user'
    END
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
      user_name,
      'user'
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Ensure updated_at trigger exists for profiles
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create index if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_profiles_tenant_id ON profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Add comment for documentation
COMMENT ON TABLE profiles IS 'User profiles extending auth.users with role-based access and multi-tenancy';
COMMENT ON FUNCTION handle_new_user() IS 'Creates tenant and profile for new users. Handles errors gracefully with fallback profile creation';
