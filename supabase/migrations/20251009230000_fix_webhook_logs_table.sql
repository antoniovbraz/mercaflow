-- Fix ML webhook logs table and ensure proper RLS policies
-- This migration addresses the 404 errors in webhook logging

-- Drop and recreate ml_webhook_logs table with proper structure
DROP TABLE IF EXISTS public.ml_webhook_logs CASCADE;

CREATE TABLE public.ml_webhook_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Webhook Notification Data
  notification_id TEXT NOT NULL UNIQUE,
  topic TEXT NOT NULL CHECK (topic IN ('orders', 'orders_v2', 'items', 'questions', 'claims', 'messages', 'shipments')),
  resource TEXT NOT NULL,
  user_id BIGINT NOT NULL,
  application_id BIGINT,
  attempts INTEGER DEFAULT 1,

  -- Timestamps
  sent_at TIMESTAMP WITH TIME ZONE,
  received_at TIMESTAMP WITH TIME ZONE,
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Processing Status
  status TEXT NOT NULL DEFAULT 'success' CHECK (status IN ('success', 'error', 'skipped')),
  error_message TEXT,

  -- Resource Data (optional cached data)
  resource_data JSONB,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX ml_webhook_logs_notification_id_idx ON public.ml_webhook_logs(notification_id);
CREATE INDEX ml_webhook_logs_topic_idx ON public.ml_webhook_logs(topic);
CREATE INDEX ml_webhook_logs_user_id_idx ON public.ml_webhook_logs(user_id);
CREATE INDEX ml_webhook_logs_status_idx ON public.ml_webhook_logs(status);
CREATE INDEX ml_webhook_logs_created_at_idx ON public.ml_webhook_logs(created_at DESC);

-- Enable RLS
ALTER TABLE public.ml_webhook_logs ENABLE ROW LEVEL SECURITY;

-- Create policies that work with the service role (for webhooks)
CREATE POLICY "webhook_service_can_insert" ON public.ml_webhook_logs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "users_can_view_own_webhooks" ON public.ml_webhook_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.ml_integrations i
      INNER JOIN public.profiles p ON p.tenant_id = i.tenant_id
      WHERE i.ml_user_id::TEXT = ml_webhook_logs.user_id::TEXT
      AND p.id = auth.uid()
    )
  );

CREATE POLICY "super_admins_can_view_all_webhooks" ON public.ml_webhook_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role = 'super_admin'
    )
  );

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ml_webhook_logs_updated_at 
  BEFORE UPDATE ON public.ml_webhook_logs 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Grant permissions for service role access
GRANT ALL ON public.ml_webhook_logs TO service_role;
GRANT ALL ON public.ml_webhook_logs TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;