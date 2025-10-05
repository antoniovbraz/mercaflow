-- Update handle_new_user function to be more robust and simple
-- Remove complex slug generation and focus on basic tenant/profile creation

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

-- Add comment for documentation
COMMENT ON FUNCTION handle_new_user() IS 'Creates tenant and profile for new users. Handles errors gracefully';