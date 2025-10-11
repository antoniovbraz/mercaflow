-- Fix RLS policies affected by SECURITY INVOKER changes
-- Create a SECURITY DEFINER function to check super admin status

-- Function to check if current user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'super_admin'
  );
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.is_super_admin() TO authenticated;

-- Fix policies only for tables that exist
DO $$
BEGIN
    -- Fix ml_sync_logs policies if table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'ml_sync_logs') THEN
        DROP POLICY IF EXISTS "super_admins_full_access_ml_sync_logs" ON public.ml_sync_logs;
        CREATE POLICY "super_admins_full_access_ml_sync_logs" ON public.ml_sync_logs
          FOR ALL
          TO authenticated
          USING (public.is_super_admin())
          WITH CHECK (public.is_super_admin());
    END IF;

    -- Fix ml_integration policies if table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'ml_integration') THEN
        DROP POLICY IF EXISTS "super_admins_full_access_ml_integration" ON public.ml_integration;
        CREATE POLICY "super_admins_full_access_ml_integration" ON public.ml_integration
          FOR ALL
          TO authenticated
          USING (public.is_super_admin())
          WITH CHECK (public.is_super_admin());
    END IF;

    -- Fix ml_questions policies if table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'ml_questions') THEN
        DROP POLICY IF EXISTS "super_admins_full_access_ml_questions" ON public.ml_questions;
        CREATE POLICY "super_admins_full_access_ml_questions" ON public.ml_questions
          FOR ALL
          TO authenticated
          USING (public.is_super_admin())
          WITH CHECK (public.is_super_admin());
    END IF;

    -- Fix ml_messages policies if table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'ml_messages') THEN
        DROP POLICY IF EXISTS "super_admins_full_access_ml_messages" ON public.ml_messages;
        CREATE POLICY "super_admins_full_access_ml_messages" ON public.ml_messages
          FOR ALL
          TO authenticated
          USING (public.is_super_admin())
          WITH CHECK (public.is_super_admin());
    END IF;

    -- Fix ml_orders policies if table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'ml_orders') THEN
        DROP POLICY IF EXISTS "super_admins_full_access_ml_orders" ON public.ml_orders;
        CREATE POLICY "super_admins_full_access_ml_orders" ON public.ml_orders
          FOR ALL
          TO authenticated
          USING (public.is_super_admin())
          WITH CHECK (public.is_super_admin());
    END IF;

    -- Fix ml_products policies if table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'ml_products') THEN
        DROP POLICY IF EXISTS "super_admins_full_access_ml_products" ON public.ml_products;
        CREATE POLICY "super_admins_full_access_ml_products" ON public.ml_products
          FOR ALL
          TO authenticated
          USING (public.is_super_admin())
          WITH CHECK (public.is_super_admin());
    END IF;

    -- Fix webhook_logs policies if table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'ml_webhook_logs') THEN
        DROP POLICY IF EXISTS "super_admins_full_access_webhook_logs" ON public.ml_webhook_logs;
        CREATE POLICY "super_admins_full_access_webhook_logs" ON public.ml_webhook_logs
          FOR ALL
          TO authenticated
          USING (public.is_super_admin())
          WITH CHECK (public.is_super_admin());
    END IF;

    -- Fix tenant policies if table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tenants') THEN
        DROP POLICY IF EXISTS "super_admins_full_access_tenants" ON public.tenants;
        CREATE POLICY "super_admins_full_access_tenants" ON public.tenants
          FOR ALL
          TO authenticated
          USING (public.is_super_admin())
          WITH CHECK (public.is_super_admin());
    END IF;
END $$;

-- Comments for documentation
COMMENT ON FUNCTION public.is_super_admin() IS 'Função SECURITY DEFINER para verificar se usuário atual é super admin, usada em políticas RLS';