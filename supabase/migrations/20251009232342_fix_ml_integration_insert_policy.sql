-- Fix ML Integrations RLS Policy for INSERT Operations
-- Problem: Current policy only has USING clause, missing WITH CHECK for INSERT
-- This prevents OAuth callback from saving new integrations

-- Drop existing policies
DROP POLICY IF EXISTS "users_can_manage_own_ml_integrations" ON public.ml_integrations;
DROP POLICY IF EXISTS "super_admins_can_manage_all_ml_integrations" ON public.ml_integrations;

-- Recreate with proper INSERT support using WITH CHECK
-- Policy for regular users - can manage their own integrations
CREATE POLICY "users_can_manage_own_ml_integrations" ON public.ml_integrations
  FOR ALL 
  TO authenticated
  USING (tenant_id = auth.uid())
  WITH CHECK (tenant_id = auth.uid()); -- Required for INSERT/UPDATE operations

-- Policy for super admins - can manage all integrations
CREATE POLICY "super_admins_can_manage_all_ml_integrations" ON public.ml_integrations
  FOR ALL 
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT au.id 
      FROM auth.users au 
      WHERE au.email IN ('peepers.shop@gmail.com', 'antoniovbraz@gmail.com')
    )
  )
  WITH CHECK (
    auth.uid() IN (
      SELECT au.id 
      FROM auth.users au 
      WHERE au.email IN ('peepers.shop@gmail.com', 'antoniovbraz@gmail.com')
    )
  );

-- Document the fix
COMMENT ON POLICY "users_can_manage_own_ml_integrations" ON public.ml_integrations IS 
  'Users can INSERT, SELECT, UPDATE, DELETE their own ML integrations. WITH CHECK clause enables INSERT operations during OAuth callback.';

COMMENT ON POLICY "super_admins_can_manage_all_ml_integrations" ON public.ml_integrations IS 
  'Super admins can INSERT, SELECT, UPDATE, DELETE all ML integrations';
