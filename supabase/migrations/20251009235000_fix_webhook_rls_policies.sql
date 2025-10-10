-- Fix RLS policies for webhook logs to allow service role operations
-- This addresses the 42501 error when webhooks try to log notifications

-- Drop existing policies that might be causing conflicts
DROP POLICY IF EXISTS "webhook_service_can_insert" ON public.ml_webhook_logs;
DROP POLICY IF EXISTS "users_can_view_own_webhooks" ON public.ml_webhook_logs;
DROP POLICY IF EXISTS "super_admins_can_view_all_webhooks" ON public.ml_webhook_logs;

-- Create more permissive policies for webhook operations
-- Allow all service role operations (webhooks are processed by service role)
CREATE POLICY "service_role_full_access" ON public.ml_webhook_logs
  FOR ALL USING (auth.role() = 'service_role');

-- Allow authenticated users to view their own webhooks
CREATE POLICY "users_can_view_own_webhooks" ON public.ml_webhook_logs
  FOR SELECT USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM public.ml_integrations i
      INNER JOIN public.profiles p ON p.tenant_id = i.tenant_id
      WHERE i.ml_user_id::TEXT = ml_webhook_logs.user_id::TEXT
      AND p.id = auth.uid()
    )
  );

-- Allow super admins to view all webhooks
CREATE POLICY "super_admins_can_view_all_webhooks" ON public.ml_webhook_logs
  FOR SELECT USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role = 'super_admin'
    )
  );

-- Ensure service role has full permissions
GRANT ALL PRIVILEGES ON public.ml_webhook_logs TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;