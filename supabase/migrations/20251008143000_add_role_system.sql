-- Add role system to existing profiles table
-- This migration adds the role field and super admin detection

-- Add role column to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role TEXT CHECK (role IN ('super_admin', 'admin', 'user')) DEFAULT 'user';

-- Create index on role for performance
CREATE INDEX IF NOT EXISTS profiles_role_idx ON public.profiles (role);

-- Update the handle_new_user function to assign super admin role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  user_role TEXT := 'user';
  super_admin_emails TEXT[] := string_to_array(
    coalesce(current_setting('app.super_admin_emails', true), ''), 
    ','
  );
BEGIN
  -- Check if user email is in super admin list from environment
  IF NEW.email = ANY(super_admin_emails) OR 
     NEW.email = 'peepers.shop@gmail.com' OR 
     NEW.email = 'antoniovbraz@gmail.com' THEN
    user_role := 'super_admin';
  END IF;

  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    user_role
  );
  RETURN NEW;
END;
$$;

-- Function to promote user to super admin
CREATE OR REPLACE FUNCTION public.promote_to_super_admin(user_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_user_id UUID;
BEGIN
  -- Find user by email
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = user_email;

  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', user_email;
  END IF;

  -- Create or update profile with super_admin role
  INSERT INTO public.profiles (id, role, created_at, updated_at)
  VALUES (target_user_id, 'super_admin', NOW(), NOW())
  ON CONFLICT (id) 
  DO UPDATE SET 
    role = 'super_admin',
    updated_at = NOW();

  RETURN TRUE;
END;
$$;

-- Promote the main super admin immediately (only existing users)
DO $$
BEGIN
  -- Only promote if user exists
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'peepers.shop@gmail.com') THEN
    PERFORM public.promote_to_super_admin('peepers.shop@gmail.com');
  END IF;
  
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'antoniovbraz@gmail.com') THEN
    PERFORM public.promote_to_super_admin('antoniovbraz@gmail.com');
  END IF;
END $$;

-- Update RLS policies to work with roles
DROP POLICY IF EXISTS "Users can view own profile." ON profiles;
DROP POLICY IF EXISTS "Users can update own profile." ON profiles;

-- New RLS policies with role support
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Super admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

CREATE POLICY "Super admins can update all profiles" ON profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Function to get current user role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM profiles
  WHERE id = auth.uid();
  
  RETURN COALESCE(user_role, 'user');
END;
$$;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.profiles TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.promote_to_super_admin(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_role() TO anon, authenticated;