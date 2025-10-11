-- Add 'invoices' topic to allowed webhook topics
-- The Mercado Livre API sends webhooks with topic 'invoices' but the constraint doesn't allow it

-- Drop the existing check constraint
ALTER TABLE public.ml_webhook_logs DROP CONSTRAINT IF EXISTS ml_webhook_logs_topic_check;

-- Add the new check constraint with 'invoices' included
ALTER TABLE public.ml_webhook_logs ADD CONSTRAINT ml_webhook_logs_topic_check
  CHECK (topic IN ('orders', 'orders_v2', 'items', 'questions', 'claims', 'messages', 'shipments', 'invoices'));

-- Comments for documentation
COMMENT ON CONSTRAINT ml_webhook_logs_topic_check ON public.ml_webhook_logs IS 'Constraint que valida os tópicos permitidos nos webhooks do Mercado Livre, incluindo invoices';