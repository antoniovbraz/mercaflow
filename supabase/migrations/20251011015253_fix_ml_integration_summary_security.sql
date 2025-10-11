-- Fix ml_integration_summary view security
-- Recreate with SECURITY DEFINER to allow access to underlying tables

DROP VIEW IF EXISTS public.ml_integration_summary;

CREATE VIEW public.ml_integration_summary AS
SELECT
  i.id,
  i.tenant_id,
  i.ml_user_id,
  i.ml_nickname,
  i.ml_email,
  i.status,
  i.token_expires_at,
  i.last_sync_at,
  i.scopes,
  i.auto_sync_enabled,
  COALESCE(p.product_count, 0) as product_count,
  COALESCE(l.error_count, 0) as error_count,
  l.last_log_at
FROM public.ml_integrations i
LEFT JOIN (
  SELECT integration_id, COUNT(*) as product_count
  FROM public.ml_products
  GROUP BY integration_id
) p ON p.integration_id = i.id
LEFT JOIN (
  SELECT
    integration_id,
    COUNT(*) FILTER (WHERE status = 'error') as error_count,
    MAX(created_at) as last_log_at
  FROM public.ml_sync_logs
  GROUP BY integration_id
) l ON l.integration_id = i.id;

-- Set security to DEFINER
ALTER VIEW public.ml_integration_summary SET (security_invoker = off);

-- Grant permissions
GRANT SELECT ON public.ml_integration_summary TO authenticated;

-- Note: RLS policies cannot be applied to views, access is controlled by base table policies
-- and the SECURITY DEFINER setting allows the view to bypass RLS on base tables

-- Comments for documentation
COMMENT ON VIEW public.ml_integration_summary IS 'View com dados agregados das integrações ML. Usa SECURITY DEFINER para acessar tabelas base e contornar RLS.';