-- Update webhook topics constraint to include all supported topics
-- Based on the webhook processing code in the application

-- Drop the existing check constraint
ALTER TABLE public.ml_webhook_logs DROP CONSTRAINT IF EXISTS ml_webhook_logs_topic_check;

-- Add the new check constraint with all supported topics
ALTER TABLE public.ml_webhook_logs ADD CONSTRAINT ml_webhook_logs_topic_check
  CHECK (topic IN (
    'orders',
    'orders_v2',
    'orders_feedback',
    'items',
    'price_suggestion',
    'quotations',
    'items_prices',
    'stock_locations',
    'user_products_families',
    'catalog_item_competition',
    'catalog_suggestions',
    'shipments',
    'fbm_stock_operations',
    'flex_handshakes',
    'public_offers',
    'public_candidates',
    'vis_leads',
    'post_purchase',
    'questions',
    'claims',
    'messages',
    'payments',
    'invoices',
    'leads_credits'
  ));

-- Comments for documentation
COMMENT ON CONSTRAINT ml_webhook_logs_topic_check ON public.ml_webhook_logs IS 'Constraint que valida todos os tópicos de webhook suportados pelo Mercado Livre';