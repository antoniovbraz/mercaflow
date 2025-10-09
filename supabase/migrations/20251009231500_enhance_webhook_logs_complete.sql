-- Atualização da tabela ml_webhook_logs para suportar todos os tipos de webhooks do ML
-- Adicionado suporte para webhooks com subtópicos (actions) e metadados expandidos

-- Adicionar nova coluna para actions (webhooks estruturados)
ALTER TABLE ml_webhook_logs 
ADD COLUMN IF NOT EXISTS actions jsonb;

-- Adicionar coluna para prioridade de webhooks
ALTER TABLE ml_webhook_logs 
ADD COLUMN IF NOT EXISTS priority text DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'critical'));

-- Adicionar coluna para subtipo/categoria de webhook
ALTER TABLE ml_webhook_logs 
ADD COLUMN IF NOT EXISTS subtopic text;

-- Adicionar índices para melhorar performance de consultas
CREATE INDEX IF NOT EXISTS idx_ml_webhook_logs_topic_actions ON ml_webhook_logs (topic, actions);
CREATE INDEX IF NOT EXISTS idx_ml_webhook_logs_priority ON ml_webhook_logs (priority);
CREATE INDEX IF NOT EXISTS idx_ml_webhook_logs_user_topic ON ml_webhook_logs (user_id, topic);
CREATE INDEX IF NOT EXISTS idx_ml_webhook_logs_created_at_desc ON ml_webhook_logs (created_at DESC);

-- Atualizar comentários da tabela
COMMENT ON COLUMN ml_webhook_logs.actions IS 'Array de ações para webhooks estruturados (ex: messages: [created, read], vis_leads: [whatsapp, call, question])';
COMMENT ON COLUMN ml_webhook_logs.priority IS 'Prioridade do webhook: low, normal, high, critical';
COMMENT ON COLUMN ml_webhook_logs.subtopic IS 'Subtópico ou categoria específica do webhook';

-- Criar view para estatísticas de webhooks
CREATE OR REPLACE VIEW ml_webhook_stats AS
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

-- Criar função para obter resumo de webhooks por usuário
CREATE OR REPLACE FUNCTION get_user_webhook_summary(p_user_id text, p_days integer DEFAULT 7)
RETURNS TABLE (
  topic text,
  total_count bigint,
  success_count bigint,
  error_count bigint,
  last_received_at timestamptz
) 
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT 
    w.topic,
    COUNT(*) as total_count,
    COUNT(*) FILTER (WHERE w.status = 'success') as success_count,
    COUNT(*) FILTER (WHERE w.status = 'error') as error_count,
    MAX(w.received_at) as last_received_at
  FROM ml_webhook_logs w
  WHERE w.user_id = p_user_id::integer
    AND w.created_at >= NOW() - (p_days || ' days')::interval
  GROUP BY w.topic
  ORDER BY total_count DESC;
$$;

-- RLS policies para webhook logs (manter consistência com tenant isolation)
ALTER TABLE ml_webhook_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own webhook logs" ON ml_webhook_logs;
DROP POLICY IF EXISTS "Service role can insert webhook logs" ON ml_webhook_logs;

-- Policy simplificada para super admins verem todos os webhooks
CREATE POLICY "Super admins can view all webhook logs" ON ml_webhook_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'super_admin'
    )
  );

-- Policy para inserção (service role e authenticated)
CREATE POLICY "Service role can insert webhook logs" ON ml_webhook_logs
  FOR INSERT
  WITH CHECK (true);

-- Comentário na tabela
COMMENT ON TABLE ml_webhook_logs IS 'Log completo de webhooks do Mercado Livre com suporte a todos os 25+ tipos de webhooks oficiais';