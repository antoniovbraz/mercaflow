-- Fix webhook logging by allowing service role inserts
-- Webhooks are processed by external services and need to log without user authentication

-- Ensure RLS is enabled
ALTER TABLE ml_webhook_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies that may conflict
DROP POLICY IF EXISTS "service_role_full_access" ON ml_webhook_logs;
DROP POLICY IF EXISTS "Service role can insert webhook logs" ON ml_webhook_logs;
DROP POLICY IF EXISTS "Super admins can view all webhook logs" ON ml_webhook_logs;
DROP POLICY IF EXISTS "users_can_view_own_webhooks" ON ml_webhook_logs;
DROP POLICY IF EXISTS "super_admins_can_view_all_webhooks" ON ml_webhook_logs;

-- Allow service role to do all operations on webhook logs
CREATE POLICY "service_role_webhook_access" ON ml_webhook_logs
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Allow super admins to view all webhook logs
CREATE POLICY "super_admins_view_webhooks" ON ml_webhook_logs
  FOR SELECT
  USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'super_admin'
    )
  );

-- Allow users to view webhooks related to their integrations
CREATE POLICY "users_view_own_webhooks" ON ml_webhook_logs
  FOR SELECT
  USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM ml_integrations i
      INNER JOIN profiles p ON p.tenant_id = i.tenant_id
      WHERE i.ml_user_id::TEXT = ml_webhook_logs.user_id::TEXT
      AND p.id = auth.uid()
    )
  );