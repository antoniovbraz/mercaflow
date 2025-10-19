# 🔍 AUDITORIA COMPLETA: Schema SQL vs Código TypeScript

**Data**: 2025-10-19  
**Objetivo**: Identificar TODAS as inconsistências entre migration SQL e código TypeScript  
**Motivo**: Correção dos erros 500 em produção revelou falha na auditoria anterior

---

## 📋 METODOLOGIA DA AUDITORIA

### Etapa 1: Extrair Schema Real do SQL
- ✅ Ler `supabase/migrations/20251018210135_recreate_ml_schema_complete.sql`
- ✅ Documentar estrutura EXATA de cada tabela (colunas, tipos, constraints)

### Etapa 2: Escanear Todo Código TypeScript
- ✅ `grep` recursivo em `app/**/*.ts` procurando queries Supabase
- ✅ Identificar cada `.from()`, `.select()`, `.insert()`, `.update()`
- ✅ Validar nomes de tabelas, colunas, e estrutura de payloads

### Etapa 3: Cross-Reference e Relatório
- ✅ Comparar schema SQL com cada uso no código
- ✅ Listar discrepâncias com arquivo, linha, e correção sugerida

---

## 📊 SCHEMA REAL DAS TABELAS (Source of Truth)

### Tabela: `ml_integrations`
```sql
CREATE TABLE public.ml_integrations (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  ml_user_id BIGINT NOT NULL,
  ml_nickname TEXT,
  ml_email TEXT,
  ml_site_id TEXT DEFAULT 'MLB',
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  token_expires_at TIMESTAMPTZ NOT NULL,
  scopes TEXT[],
  status TEXT DEFAULT 'active',
  auto_sync_enabled BOOLEAN DEFAULT true,
  sync_frequency_minutes INTEGER DEFAULT 60,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_sync_at TIMESTAMPTZ,              -- ⚠️ ATENÇÃO: last_sync_at
  last_token_refresh_at TIMESTAMPTZ,
  last_error TEXT,
  error_count INTEGER DEFAULT 0
);
```

### Tabela: `ml_products`
```sql
CREATE TABLE public.ml_products (
  id UUID PRIMARY KEY,
  integration_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  ml_item_id TEXT NOT NULL,
  ml_user_id BIGINT NOT NULL,
  title TEXT NOT NULL,
  price DECIMAL(15,2),
  available_quantity INTEGER DEFAULT 0,
  sold_quantity INTEGER DEFAULT 0,
  status TEXT,
  category_id TEXT,
  listing_type_id TEXT,
  condition TEXT,
  permalink TEXT,
  thumbnail TEXT,
  ml_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_sync_at TIMESTAMPTZ DEFAULT NOW(), -- ⚠️ ATENÇÃO: last_sync_at (NÃO last_synced_at)
  UNIQUE(integration_id, ml_item_id)
);
```

### Tabela: `ml_webhook_logs`
```sql
CREATE TABLE public.ml_webhook_logs (
  id UUID PRIMARY KEY,
  integration_id UUID,
  tenant_id UUID,
  topic TEXT NOT NULL,                    -- ⚠️ CHECK constraint
  resource TEXT NOT NULL,
  application_id BIGINT,
  user_id BIGINT,                         -- ⚠️ BIGINT, não TEXT
  status TEXT DEFAULT 'pending',          -- ⚠️ CHECK constraint
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,          -- ⚠️ retry_count (NÃO attempts)
  payload JSONB NOT NULL,                 -- ⚠️ payload (NÃO resource_data)
  received_at TIMESTAMPTZ DEFAULT NOW(),  -- ⚠️ received_at existe
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processing_duration_ms INTEGER
  -- ⚠️ NÃO TEM: notification_id, sent_at, attempts
);
```

### Tabela: `ml_sync_logs`
```sql
CREATE TABLE public.ml_sync_logs (
  id UUID PRIMARY KEY,
  integration_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  sync_type TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  items_processed INTEGER DEFAULT 0,
  items_created INTEGER DEFAULT 0,
  items_updated INTEGER DEFAULT 0,
  items_failed INTEGER DEFAULT 0,
  error_message TEXT,
  sync_data JSONB,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### View/Function: `ml_integration_summary`
```sql
-- ⚠️ CRÍTICO: VIEW NÃO EXISTE!
-- Foi removida na migration 20251018210135
-- Código que usa esta view VAI FALHAR!
```

---

## 🐛 BUGS IDENTIFICADOS E CORRIGIDOS

### ✅ Bug #1: `last_synced_at` vs `last_sync_at`
**Arquivo**: `app/api/ml/products/route.ts`  
**Linha**: 123  
**Status**: ✅ CORRIGIDO no commit 6e69eef

```typescript
// ❌ ANTES
.order('last_synced_at', { ascending: false })

// ✅ DEPOIS
.order('last_sync_at', { ascending: false })
```

### ✅ Bug #2: View `ml_integration_summary` não existe
**Arquivo**: `app/api/ml/integration/status/route.ts`  
**Linha**: 53  
**Status**: ✅ CORRIGIDO no commit 6e69eef

```typescript
// ❌ ANTES
.from('ml_integration_summary') // View não existe!

// ✅ DEPOIS
.from('ml_integrations') // Tabela real
// + Queries manuais para product_count e error_count
```

### ✅ Bug #3: Campos incompatíveis em `ml_webhook_logs`
**Arquivo**: `app/api/ml/webhooks/route.ts`  
**Linha**: 100-112  
**Status**: ✅ CORRIGIDO no commit 6e69eef

```typescript
// ❌ ANTES
.insert({
  notification_id: webhook._id,  // ⚠️ Campo não existe
  attempts: webhook.attempts,    // ⚠️ Campo não existe
  sent_at: webhook.sent,         // ⚠️ Campo não existe
  resource_data: webhook         // ⚠️ Nome errado (payload)
})

// ✅ DEPOIS
.insert({
  topic: webhook.topic,
  resource: webhook.resource,
  user_id: parseInt(webhook.user_id) || null,
  application_id: parseInt(webhook.application_id) || null,
  status: 'success',
  payload: webhook,              // ✅ Nome correto
  retry_count: ...               // ✅ Nome correto
})
```

---

## 🔎 AUDITORIA ADICIONAL: Arquivos Restantes

### Arquivo: `app/api/ml/webhooks/notifications/route.ts`
**Status**: ⚠️ PRECISA VERIFICAÇÃO

Este arquivo também faz queries às tabelas ML. Vou verificar:

```typescript
// Localizações para verificar:
// - Linha 100: .from('ml_webhook_logs')
// - Linha 269: .from('ml_integrations')
// - Linha 291+: Múltiplos .from('ml_sync_logs')
```

**Ação necessária**: Validar estrutura de inserts/updates neste arquivo

---

## 📝 LIÇÕES APRENDIDAS

### ❌ O que EU fiz errado na auditoria anterior:

1. **Foco em documentação, não em validação**
   - Criei 6 arquivos .md explicando a migration
   - MAS não cruzei com código TypeScript real

2. **Assumi que código estava correto**
   - Li a migration SQL
   - Li alguns arquivos TypeScript
   - MAS não fiz diff sistemático

3. **Não executei grep abrangente**
   - Deveria ter buscado TODOS os `.from('ml_` no código
   - Deveria ter listado TODAS as colunas usadas
   - Deveria ter comparado linha por linha

### ✅ Como deveria ser feita auditoria correta:

```bash
# 1. Extrair schema do SQL
cat supabase/migrations/20251018210135*.sql | grep "CREATE TABLE" -A 30

# 2. Buscar TODAS as queries no código
grep -rn "\.from\('ml_" app/

# 3. Para cada query, validar:
#    - Nome da tabela existe?
#    - Colunas no .select() existem?
#    - Campos no .insert() batem com schema?
#    - .order() usa coluna válida?

# 4. Criar checklist e marcar item por item
```

---

## ✅ PRÓXIMOS PASSOS

1. ⏳ **Aguardar deploy Vercel** (commit 6e69eef)
2. 🧪 **Testar endpoints em produção**
3. 🔍 **Auditar `app/api/ml/webhooks/notifications/route.ts`**
4. 📊 **Criar script automatizado** de validação schema vs código

---

## 💡 RECOMENDAÇÃO: Script de Validação

Criar `scripts/validate-schema.ts` que:
- Lê migration SQL
- Parse estrutura de tabelas
- Escaneia todos arquivos TypeScript
- Valida queries automaticamente
- Gera relatório de discrepâncias

**Evitaria**: Erros silenciosos em produção  
**Garantiria**: Código sempre sincronizado com banco

---

**Responsabilidade**: Minha como AI assistant  
**Impacto**: Erros 500 em produção que afetaram usuário  
**Compromisso**: Nunca mais fazer auditoria superficial
