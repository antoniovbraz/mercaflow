-- Update handle_new_user function to remove hardcoded super admin logic
-- The super admin logic will be handled by the application layer

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
  
  -- Create profile with default 'user' role
  -- Super admin promotion will be handled by the application layer
  INSERT INTO profiles (id, full_name, tenant_id, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
    new_tenant_id,
    'user'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment for documentation
COMMENT ON FUNCTION handle_new_user() IS 'Creates tenant and profile for new users. Role promotion handled by application layer';