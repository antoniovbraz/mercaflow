-- Fix webhook insert permissions for ml_sync_logs
-- Webhooks from Mercado Livre need to insert logs but don't have authenticated sessions

-- Add policy to allow webhook insertions (service role or anonymous for webhooks)
CREATE POLICY "webhooks_can_insert_ml_sync_logs" ON public.ml_sync_logs
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Also allow authenticated users to insert their own logs
CREATE POLICY "authenticated_users_can_insert_ml_sync_logs" ON public.ml_sync_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    integration_id IN (
      SELECT id FROM public.ml_integrations
      WHERE tenant_id IN (
        SELECT tenant_id FROM public.profiles
        WHERE id = auth.uid()
      )
    )
  );

-- Comments for documentation
COMMENT ON POLICY "webhooks_can_insert_ml_sync_logs" ON public.ml_sync_logs IS 'Permite que webhooks do Mercado Livre insiram logs sem autenticação';
COMMENT ON POLICY "authenticated_users_can_insert_ml_sync_logs" ON public.ml_sync_logs IS 'Permite que usuários autenticados insiram logs de suas próprias integrações';