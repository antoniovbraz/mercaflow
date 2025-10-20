# 🚨 DEBUG: Erros 400 em Webhooks ML

**Data**: 19/10/2025 22:31  
**Status**: 🔴 **CRÍTICO - 6 erros 400 detectados**

---

## 📊 Logs Analisados

### Erros Identificados

#### 1. ml_webhook_logs (POST 400) - 3 ocorrências

```
22:31:31 - POST /rest/v1/ml_webhook_logs?select=*
22:31:21 - POST /rest/v1/ml_webhook_logs?select=*
22:31:07 - POST /rest/v1/ml_webhook_logs?select=*
```

#### 2. ml_sync_logs (POST 400) - 3 ocorrências

```
22:31:31 - POST /rest/v1/ml_sync_logs
22:31:21 - POST /rest/v1/ml_sync_logs
22:31:07 - POST /rest/v1/ml_sync_logs
```

### Context dos Webhooks

**ML User ID**: 669073070  
**Topics**: orders_v2, invoices  
**Resources**:

- `/orders/2000013448515838`
- `/users/669073070/invoices/4796770362`
- `/users/669073070/invoices/4796770826`

---

## 🔍 Causas Prováveis

### 1. RLS Policies Bloqueando Service Role

**Problema**: Webhook endpoints usam service role, mas RLS pode estar bloqueando

**Verificar**:

```sql
-- Ver policies de ml_webhook_logs
SELECT * FROM pg_policies WHERE tablename = 'ml_webhook_logs';

-- Ver policies de ml_sync_logs
SELECT * FROM pg_policies WHERE tablename = 'ml_sync_logs';
```

**Esperado**: Policies devem permitir INSERT via service role

---

### 2. Campos Obrigatórios Faltando

**ml_webhook_logs** requer:

- `integration_id` (UUID)
- `user_id` (BIGINT)
- `topic` (TEXT)
- `resource` (TEXT)
- `application_id` (BIGINT)
- `attempts` (INTEGER)
- `received_at` (TIMESTAMPTZ)
- `payload` (JSONB)

**ml_sync_logs** requer:

- `integration_id` (UUID)
- `resource_type` (TEXT)
- `status` (TEXT - 'pending', 'success', 'error')
- `started_at` (TIMESTAMPTZ)

---

### 3. Validação de Tipos

**Erro comum**: JSON malformado no campo `payload`

```typescript
// ❌ ERRADO - string ao invés de JSONB
{
  payload: JSON.stringify(data);
}

// ✅ CORRETO - objeto direto
{
  payload: data;
}
```

---

## 🔧 Correções Necessárias

### Correção 1: RLS Policies (CRÍTICO)

**Arquivo**: Nova migration

```sql
-- 📁 supabase/migrations/YYYYMMDDHHMMSS_fix_webhook_rls.sql

-- ml_webhook_logs: Permitir INSERT via service role
DROP POLICY IF EXISTS "Service role can insert webhooks" ON ml_webhook_logs;

CREATE POLICY "Service role can insert webhooks"
  ON ml_webhook_logs
  AS PERMISSIVE
  FOR INSERT
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ml_sync_logs: Permitir INSERT via service role
DROP POLICY IF EXISTS "Service role can insert sync logs" ON ml_sync_logs;

CREATE POLICY "Service role can insert sync logs"
  ON ml_sync_logs
  AS PERMISSIVE
  FOR INSERT
  TO service_role
  USING (true)
  WITH CHECK (true);
```

---

### Correção 2: Webhook Endpoint

**Arquivo**: `app/api/ml/webhooks/route.ts`

**Verificar**:

1. ✅ Usa `createServiceRoleClient()` (não client normal)
2. ✅ Todos os campos obrigatórios estão presentes
3. ✅ `payload` é objeto (não string JSON)
4. ✅ Error handling captura detalhes do 400

**Pattern correto**:

```typescript
import { createClient } from "@supabase/supabase-js";

// Service role client para webhooks
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // Service role key
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Insert webhook log
const { data, error } = await supabaseAdmin
  .from("ml_webhook_logs")
  .insert({
    integration_id: integrationId,
    user_id: notification.user_id,
    topic: notification.topic,
    resource: notification.resource,
    application_id: notification.application_id,
    attempts: notification.attempts || 0,
    received_at: new Date().toISOString(),
    payload: notification, // ✅ Objeto direto, não JSON.stringify()
  })
  .select()
  .single();

if (error) {
  logger.error("Failed to insert webhook log", {
    error,
    details: error.details, // ← IMPORTANTE: detalhes do 400
    hint: error.hint,
    message: error.message,
  });
}
```

---

### Correção 3: Validação de Entrada

**Adicionar** Zod validation no webhook endpoint:

```typescript
import { z } from "zod";

const MLWebhookNotificationSchema = z.object({
  _id: z.string(),
  topic: z.string(),
  resource: z.string(),
  user_id: z.number(),
  application_id: z.number(),
  attempts: z.number().optional().default(0),
  sent: z.string().datetime(),
  received: z.string().datetime(),
});

// No handler
try {
  const notification = MLWebhookNotificationSchema.parse(req.body);
  // ... processar
} catch (error) {
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      { error: "Invalid webhook payload", details: error.errors },
      { status: 400 }
    );
  }
}
```

---

## 🧪 Como Testar

### 1. Verificar RLS Policies

```sql
-- Via Supabase SQL Editor
SELECT
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename IN ('ml_webhook_logs', 'ml_sync_logs')
ORDER BY tablename, policyname;
```

**Esperado**: Ver policy para `service_role` com INSERT

---

### 2. Testar Insert Manual

```sql
-- Testar insert direto (via service role)
INSERT INTO ml_webhook_logs (
  integration_id,
  user_id,
  topic,
  resource,
  application_id,
  attempts,
  received_at,
  payload
) VALUES (
  '15046cf6-ccee-48e3-89d0-38d98adebd79', -- UUID válido
  669073070,
  'orders_v2',
  '/orders/test',
  123456,
  1,
  NOW(),
  '{"test": true}'::jsonb
);
```

**Se falhar**: Erro mostrará causa exata

---

### 3. Logs Detalhados no Webhook

**Adicionar** no webhook endpoint:

```typescript
logger.info("Webhook received", {
  topic: notification.topic,
  resource: notification.resource,
  userId: notification.user_id,
  integrationId: integrationId,
});

// Após insert
if (error) {
  logger.error("Webhook insert failed", {
    error: error.message,
    details: error.details, // ← Detalhes do Postgres
    hint: error.hint,
    code: error.code,
    payload: notification, // Ver o que foi enviado
  });
}
```

---

## 🚀 Ações Imediatas

### 1. Criar Migration RLS (5 min)

```bash
cd supabase/migrations
# Criar arquivo: YYYYMMDDHHMMSS_fix_webhook_rls.sql
# Copiar SQL da Correção 1 acima
npx supabase db push
```

### 2. Verificar Webhook Endpoint (10 min)

- [ ] Usa service role client?
- [ ] Todos os campos obrigatórios presentes?
- [ ] `payload` é objeto (não string)?
- [ ] Error logging com `.details`?

### 3. Testar Localmente (5 min)

```bash
# Simular webhook ML
curl -X POST http://localhost:3000/api/ml/webhooks \
  -H "Content-Type: application/json" \
  -d '{
    "_id": "test123",
    "topic": "orders_v2",
    "resource": "/orders/test",
    "user_id": 669073070,
    "application_id": 123456,
    "attempts": 1,
    "sent": "2025-10-19T22:31:31Z",
    "received": "2025-10-19T22:31:31Z"
  }'
```

**Esperado**: 200 OK (ou erro detalhado)

---

## 📋 Checklist de Validação

### RLS Policies

- [ ] `ml_webhook_logs` tem policy para service_role INSERT
- [ ] `ml_sync_logs` tem policy para service_role INSERT
- [ ] Policies testadas com insert manual

### Webhook Endpoint

- [ ] Service role client configurado
- [ ] Todos os campos obrigatórios mapeados
- [ ] `payload` não usa JSON.stringify()
- [ ] Error logging com `.details`
- [ ] Zod validation implementada

### Monitoramento

- [ ] Sentry captura erros de webhook
- [ ] Logs estruturados com contexto
- [ ] Dashboard mostra webhooks recebidos

---

## 🎯 Resultado Esperado

Após correções:

- ✅ Webhooks ML inseridos com sucesso (200 OK)
- ✅ `ml_webhook_logs` populada corretamente
- ✅ `ml_sync_logs` populada corretamente
- ✅ Sem erros 400 nos logs Supabase
- ✅ NotificationsWidget mostra dados reais

---

## 📞 Próximos Passos

1. **Aplicar correção RLS** (migration)
2. **Verificar webhook endpoint** (service role)
3. **Testar com webhook real** (ML dashboard)
4. **Monitorar logs** (Supabase + Sentry)

**Prioridade**: 🔴 **CRÍTICA** - Webhooks não funcionam = dados desatualizados

---

**Última atualização**: 19/10/2025 22:35  
**Status**: Aguardando correções  
**Impacto**: NotificationsWidget pode mostrar dados desatualizados
