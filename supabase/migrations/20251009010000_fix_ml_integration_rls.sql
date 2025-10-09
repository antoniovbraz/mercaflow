-- CORREÇÃO DAS RLS POLICIES PARA TABELAS ML INTEGRATION
-- Problema: RLS policies usando campos incorretos e causando 403 errors

-- 1. CORRIGIR POLICY DA TABELA ML_INTEGRATIONS
DROP POLICY IF EXISTS "Users can manage own ML integrations" ON public.ml_integrations;

-- Nova policy usando tenant_id diretamente (user.id é o tenant_id)
CREATE POLICY "users_can_manage_own_ml_integrations" ON public.ml_integrations
  FOR ALL 
  TO authenticated
  USING (tenant_id = auth.uid());

-- Policy para super admins verem tudo
CREATE POLICY "super_admins_can_manage_all_ml_integrations" ON public.ml_integrations
  FOR ALL 
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT au.id 
      FROM auth.users au 
      WHERE au.email IN ('peepers.shop@gmail.com', 'antoniovbraz@gmail.com')
    )
  );

-- 2. CORRIGIR POLICY DA TABELA ML_PRODUCTS
DROP POLICY IF EXISTS "Users can manage own ML products" ON public.ml_products;

CREATE POLICY "users_can_manage_own_ml_products" ON public.ml_products
  FOR ALL 
  TO authenticated
  USING (
    integration_id IN (
      SELECT id FROM public.ml_integrations 
      WHERE tenant_id = auth.uid()
    )
  );

-- Policy para super admins
CREATE POLICY "super_admins_can_manage_all_ml_products" ON public.ml_products
  FOR ALL 
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT au.id 
      FROM auth.users au 
      WHERE au.email IN ('peepers.shop@gmail.com', 'antoniovbraz@gmail.com')
    )
  );

-- 3. CORRIGIR POLICY DA TABELA ML_SYNC_LOGS  
DROP POLICY IF EXISTS "Users can view own ML sync logs" ON public.ml_sync_logs;

CREATE POLICY "users_can_view_own_ml_sync_logs" ON public.ml_sync_logs
  FOR SELECT 
  TO authenticated
  USING (
    integration_id IN (
      SELECT id FROM public.ml_integrations 
      WHERE tenant_id = auth.uid()
    )
  );

-- Policy para super admins
CREATE POLICY "super_admins_can_view_all_ml_sync_logs" ON public.ml_sync_logs
  FOR ALL 
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT au.id 
      FROM auth.users au 
      WHERE au.email IN ('peepers.shop@gmail.com', 'antoniovbraz@gmail.com')
    )
  );

-- 4. CORRIGIR POLICY DA TABELA ML_WEBHOOK_LOGS (se existir)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ml_webhook_logs') THEN
    DROP POLICY IF EXISTS "Webhooks can create logs" ON public.ml_webhook_logs;
    DROP POLICY IF EXISTS "Users can view own webhook logs" ON public.ml_webhook_logs;

    -- Policy para criar logs (public access para webhooks do ML)
    CREATE POLICY "public_can_create_webhook_logs" ON public.ml_webhook_logs
      FOR INSERT 
      TO anon, authenticated
      WITH CHECK (true);

    -- Policy para usuários verem próprios logs
    CREATE POLICY "users_can_view_own_webhook_logs" ON public.ml_webhook_logs
      FOR SELECT 
      TO authenticated
      USING (
        ml_user_id IN (
          SELECT i.ml_user_id::TEXT FROM public.ml_integrations i 
          WHERE i.tenant_id = auth.uid()
        )
      );

    -- Policy para super admins
    CREATE POLICY "super_admins_can_manage_all_webhook_logs" ON public.ml_webhook_logs
      FOR ALL 
      TO authenticated
      USING (
        auth.uid() IN (
          SELECT au.id 
          FROM auth.users au 
          WHERE au.email IN ('peepers.shop@gmail.com', 'antoniovbraz@gmail.com')
        )
      );
  END IF;
END $$;

-- 5. RECRIAR A VIEW ML_INTEGRATION_SUMMARY PARA USAR SECURITY DEFINER
DROP VIEW IF EXISTS public.ml_integration_summary;

-- View com security definer para evitar problemas de RLS
CREATE VIEW public.ml_integration_summary 
WITH (security_invoker = off) AS
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

-- Garantir permissões na view
GRANT SELECT ON public.ml_integration_summary TO authenticated;

-- RLS na view usando security definer pattern
ALTER VIEW public.ml_integration_summary SET (security_invoker = off);

-- 6. CRIAR POLICY PARA A VIEW (usando base table security)
CREATE POLICY "users_can_view_own_ml_integration_summary" ON public.ml_integration_summary
  FOR SELECT 
  TO authenticated
  USING (tenant_id = auth.uid());

CREATE POLICY "super_admins_can_view_all_ml_integration_summary" ON public.ml_integration_summary
  FOR SELECT 
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT au.id 
      FROM auth.users au 
      WHERE au.email IN ('peepers.shop@gmail.com', 'antoniovbraz@gmail.com')
    )
  );

-- 7. HABILITAR RLS NA VIEW
ALTER VIEW public.ml_integration_summary ENABLE ROW LEVEL SECURITY;

-- 8. COMENTÁRIOS PARA DOCUMENTAÇÃO
COMMENT ON POLICY "users_can_manage_own_ml_integrations" ON public.ml_integrations IS 'Usuários podem gerenciar apenas suas próprias integrações ML';
COMMENT ON POLICY "super_admins_can_manage_all_ml_integrations" ON public.ml_integrations IS 'Super admins podem gerenciar todas as integrações ML';
COMMENT ON POLICY "users_can_manage_own_ml_products" ON public.ml_products IS 'Usuários podem gerenciar produtos de suas próprias integrações';
COMMENT ON POLICY "users_can_view_own_ml_sync_logs" ON public.ml_sync_logs IS 'Usuários podem ver logs de suas próprias integrações';
COMMENT ON POLICY "users_can_view_own_webhook_logs" ON public.ml_webhook_logs IS 'Usuários podem ver webhook logs de suas integrações';
COMMENT ON VIEW public.ml_integration_summary IS 'View resumo das integrações ML com contadores e informações agregadas';