-- Fix ml_sync_logs schema and RLS policies
-- This migration:
-- 1. Adds missing fields used by webhook handlers
-- 2. Adds INSERT policy for authenticated users
-- 3. Makes fields more flexible for different use cases

-- Add missing fields to ml_sync_logs
ALTER TABLE public.ml_sync_logs 
  ADD COLUMN IF NOT EXISTS operation TEXT,
  ADD COLUMN IF NOT EXISTS resource_id TEXT,
  ADD COLUMN IF NOT EXISTS user_id TEXT,
  ADD COLUMN IF NOT EXISTS success BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS details JSONB;

-- Make sync_type more flexible (allow custom types)
ALTER TABLE public.ml_sync_logs 
  DROP CONSTRAINT IF EXISTS ml_sync_logs_sync_type_check;

-- Make status more flexible
ALTER TABLE public.ml_sync_logs 
  DROP CONSTRAINT IF EXISTS ml_sync_logs_status_check;

-- Add new constraints with more options
ALTER TABLE public.ml_sync_logs 
  ADD CONSTRAINT ml_sync_logs_sync_type_check 
  CHECK (sync_type IN ('products', 'orders', 'questions', 'webhooks', 'user_info', 'webhook_order_update', 'webhook_item_sync', 'webhook_item_sync_failed', 'webhook_question_answered'));

ALTER TABLE public.ml_sync_logs 
  ADD CONSTRAINT ml_sync_logs_status_check 
  CHECK (status IN ('success', 'error', 'partial', 'running'));

-- Drop old policies
DROP POLICY IF EXISTS "users_can_view_own_ml_sync_logs" ON public.ml_sync_logs;
DROP POLICY IF EXISTS "super_admins_can_view_all_ml_sync_logs" ON public.ml_sync_logs;
DROP POLICY IF EXISTS "Users can view own ML sync logs" ON public.ml_sync_logs;

-- Create new comprehensive policies
-- 1. Allow authenticated users to INSERT their own logs
CREATE POLICY "users_can_insert_ml_sync_logs" ON public.ml_sync_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    integration_id IN (
      SELECT id FROM public.ml_integrations 
      WHERE tenant_id IN (
        SELECT id FROM public.profiles WHERE user_id = auth.uid()
      )
    )
  );

-- 2. Allow authenticated users to SELECT their own logs
CREATE POLICY "users_can_select_ml_sync_logs" ON public.ml_sync_logs
  FOR SELECT
  TO authenticated
  USING (
    integration_id IN (
      SELECT id FROM public.ml_integrations 
      WHERE tenant_id IN (
        SELECT id FROM public.profiles WHERE user_id = auth.uid()
      )
    )
  );

-- 3. Allow super admins full access
CREATE POLICY "super_admins_full_access_ml_sync_logs" ON public.ml_sync_logs
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

-- Add indexes for new fields
CREATE INDEX IF NOT EXISTS ml_sync_logs_operation_idx ON public.ml_sync_logs(operation);
CREATE INDEX IF NOT EXISTS ml_sync_logs_resource_id_idx ON public.ml_sync_logs(resource_id);
CREATE INDEX IF NOT EXISTS ml_sync_logs_success_idx ON public.ml_sync_logs(success);
