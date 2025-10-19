# Script para Aplicar Migration do Mercado Livre
# Execute este arquivo no Supabase SQL Editor ou via psql

## INSTRUÇÕES DE USO:

### Opção 1: Via Supabase Dashboard (RECOMENDADO)
1. Acesse: https://supabase.com/dashboard/project/YOUR_PROJECT_ID/sql
2. Cole o conteúdo do arquivo: `supabase/migrations/20251018210135_recreate_ml_schema_complete.sql`
3. Clique em "Run" para executar

### Opção 2: Via CLI (se tiver o projeto linkado)
```bash
# Link o projeto primeiro (uma vez)
npx supabase link --project-ref YOUR_PROJECT_REF

# Depois aplique as migrations
npx supabase db push
```

### Opção 3: Via psql direto
```bash
# Obtenha a connection string do Supabase Dashboard
# Em Settings > Database > Connection string (Direct connection)

psql "postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres" -f supabase/migrations/20251018210135_recreate_ml_schema_complete.sql
```

### Opção 4: Via PowerShell com Invoke-RestMethod (API)
```powershell
# Configure estas variáveis
$SUPABASE_URL = "https://[PROJECT-REF].supabase.co"
$SUPABASE_SERVICE_ROLE_KEY = "your-service-role-key"

# Leia o arquivo SQL
$sqlContent = Get-Content -Path "supabase/migrations/20251018210135_recreate_ml_schema_complete.sql" -Raw

# Execute via API
$headers = @{
    "apikey" = $SUPABASE_SERVICE_ROLE_KEY
    "Authorization" = "Bearer $SUPABASE_SERVICE_ROLE_KEY"
    "Content-Type" = "application/json"
}

$body = @{
    query = $sqlContent
} | ConvertTo-Json

Invoke-RestMethod -Uri "$SUPABASE_URL/rest/v1/rpc/exec_sql" -Method Post -Headers $headers -Body $body
```

## O QUE ESTA MIGRATION FAZ:

✅ **Remove TODAS as tabelas antigas** do Mercado Livre (incluindo dados!)
✅ **Recria schema completo** com estrutura otimizada
✅ **Cria 8 tabelas principais**:
   - ml_oauth_states (OAuth PKCE flow)
   - ml_integrations (conexões ML)
   - ml_products (produtos sincronizados)
   - ml_orders (pedidos)
   - ml_questions (perguntas)
   - ml_messages (mensagens pós-venda)
   - ml_webhook_logs (logs de webhooks)
   - ml_sync_logs (logs de sincronização)

✅ **Configura RLS policies** para segurança
✅ **Cria funções auxiliares**:
   - cleanup_expired_ml_oauth_states()
   - get_ml_integration_summary()

✅ **Adiciona índices** para performance
✅ **Triggers** para updated_at automático

## IMPORTANTE:

⚠️ **ESTA MIGRATION APAGA TODOS OS DADOS DO MERCADO LIVRE!**
⚠️ Se você tem dados em produção, faça backup antes!
⚠️ Execute apenas uma vez!

## VERIFICAÇÃO PÓS-MIGRATION:

Após executar, verifique se as tabelas foram criadas:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE 'ml_%'
ORDER BY table_name;
```

Resultado esperado:
- ml_integrations
- ml_messages
- ml_oauth_states
- ml_orders
- ml_products
- ml_questions
- ml_sync_logs
- ml_webhook_logs

## PRÓXIMOS PASSOS:

Após aplicar a migration:
1. Reinicie o servidor Next.js: `npm run dev`
2. Teste o fluxo OAuth: http://localhost:3000/dashboard/ml
3. Verifique os logs: `tail -f .next/trace` ou console do browser

## SUPORTE:

Se encontrar erro "table not found", a migration não foi aplicada corretamente.
Tente novamente via Supabase Dashboard (Opção 1) que é a mais confiável.
