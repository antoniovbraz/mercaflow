-- Fix security issues identified by Supabase linter
-- 1. Change views from SECURITY DEFINER to SECURITY INVOKER
-- 2. Enable RLS on role_permissions table

-- Fix ml_integration_summary view - change from SECURITY DEFINER to SECURITY INVOKER
ALTER VIEW public.ml_integration_summary SET (security_invoker = on);

-- Fix ml_webhook_stats view - change from SECURITY DEFINER to SECURITY INVOKER
-- First check if it exists and recreate with proper security settings
DROP VIEW IF EXISTS public.ml_webhook_stats;
CREATE OR REPLACE VIEW public.ml_webhook_stats
WITH (security_invoker = on) AS
SELECT
  topic,
  status,
  priority,
  COUNT(*) as total_webhooks,
  COUNT(DISTINCT user_id) as unique_users,
  AVG(attempts) as avg_attempts,
  DATE_TRUNC('hour', created_at) as hour_bucket
FROM ml_webhook_logs
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY topic, status, priority, DATE_TRUNC('hour', created_at)
ORDER BY hour_bucket DESC, total_webhooks DESC;

-- Grant appropriate permissions
GRANT SELECT ON public.ml_webhook_stats TO authenticated;

-- Enable RLS on role_permissions table
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for role_permissions
-- Only super admins can read all permissions
CREATE POLICY "super_admins_can_read_all_permissions" ON public.role_permissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

-- Only super admins can modify permissions
CREATE POLICY "super_admins_can_modify_permissions" ON public.role_permissions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

-- Comments for documentation
COMMENT ON VIEW public.ml_integration_summary IS 'View com dados agregados das integrações ML. Usa SECURITY INVOKER para respeitar RLS.';
COMMENT ON VIEW public.ml_webhook_stats IS 'View com estatísticas de webhooks. Usa SECURITY INVOKER para respeitar RLS.';
COMMENT ON TABLE public.role_permissions IS 'Tabela de permissões por role com RLS habilitado - apenas super admins podem acessar.';