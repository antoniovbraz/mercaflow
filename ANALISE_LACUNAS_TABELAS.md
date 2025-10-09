# 🔍 ANÁLISE COMPLETA - LACUNAS NAS TABELAS E CONFIGURAÇÕES

## 📊 RESUMO DA ANÁLISE

Após análise detalhada da documentação, especificações técnicas e estruturas atuais do banco de dados, identifiquei várias lacunas críticas que impedem o funcionamento 100% da plataforma MercaFlow.

---

## 🎯 ESTRUTURA ATUAL vs ESPECIFICAÇÃO TÉCNICA

### ✅ **TABELAS EXISTENTES E CORRETAS**
1. **`profiles`** - ✅ Estrutura correta com role system
2. **`user_roles`** - ✅ Sistema RBAC avançado implementado
3. **`ml_integrations`** - ✅ Tabela principal OAuth ML
4. **`ml_products`** - ✅ Cache de produtos sincronizados
5. **`ml_sync_logs`** - ✅ Logs de sincronização
6. **`ml_webhook_logs`** - ✅ Logs de webhooks ML

### ❌ **LACUNAS CRÍTICAS IDENTIFICADAS**

#### 1. **TABELA `tenants` - COMPLETAMENTE AUSENTE**
```sql
-- NECESSÁRIA PELA ESPECIFICAÇÃO TÉCNICA
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  owner_id UUID REFERENCES auth.users(id),
  settings JSONB DEFAULT '{}',
  subscription_plan TEXT DEFAULT 'starter',
  subscription_status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```
**IMPACTO**: Sem esta tabela, o sistema multi-tenant não funciona corretamente.

#### 2. **PROBLEMA: `ml_integrations.tenant_id` REFERENCIA `profiles(id)`**
```sql
-- ATUAL (INCORRETO):
tenant_id UUID NOT NULL REFERENCES public.profiles(id)

-- DEVERIA SER:
tenant_id UUID NOT NULL REFERENCES public.tenants(id)
```
**IMPACTO**: Mistura conceitos de usuário com tenant, causando problemas de isolamento.

#### 3. **FALTA DE TABELAS ML ESSENCIAIS**

**A. TABELA `ml_orders` - AUSENTE**
```sql
-- NECESSÁRIA PARA SINCRONIZAR VENDAS
CREATE TABLE ml_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID REFERENCES ml_integrations(id),
  ml_order_id BIGINT NOT NULL,
  status TEXT NOT NULL,
  status_detail TEXT,
  date_created TIMESTAMPTZ NOT NULL,
  date_closed TIMESTAMPTZ,
  total_amount DECIMAL(15,2),
  currency_id TEXT DEFAULT 'BRL',
  buyer_id BIGINT,
  buyer_nickname TEXT,
  seller_id BIGINT,
  seller_nickname TEXT,
  order_items JSONB,
  payments JSONB,
  shipping JSONB,
  raw_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(integration_id, ml_order_id)
);
```

**B. TABELA `ml_messages` - AUSENTE**
```sql
-- NECESSÁRIA PARA SISTEMA DE MENSAGENS
CREATE TABLE ml_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID REFERENCES ml_integrations(id),
  ml_message_id TEXT NOT NULL,
  from_user_id BIGINT,
  to_user_id BIGINT,
  subject TEXT,
  text TEXT,
  status TEXT,
  date_created TIMESTAMPTZ,
  date_read TIMESTAMPTZ,
  message_type TEXT,
  attachments JSONB,
  raw_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(integration_id, ml_message_id)
);
```

**C. TABELA `ml_categories` - AUSENTE**
```sql
-- NECESSÁRIA PARA CACHE DE CATEGORIAS
CREATE TABLE ml_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ml_category_id TEXT NOT NULL,
  name TEXT NOT NULL,
  path_from_root JSONB,
  children_categories JSONB,
  settings JSONB,
  attribute_types JSONB,
  site_id TEXT DEFAULT 'MLB',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(ml_category_id, site_id)
);
```

#### 4. **COLUNAS AUSENTES EM TABELAS EXISTENTES**

**A. `ml_integrations` - FALTAM COLUNAS CRÍTICAS:**
```sql
-- ADICIONAR:
ALTER TABLE ml_integrations ADD COLUMN ml_site_id TEXT DEFAULT 'MLB';
ALTER TABLE ml_integrations ADD COLUMN account_type TEXT; -- personal, professional
ALTER TABLE ml_integrations ADD COLUMN ml_user_info JSONB; -- cache user data
ALTER TABLE ml_integrations ADD COLUMN webhook_config JSONB; -- webhook settings
ALTER TABLE ml_integrations ADD COLUMN api_limits JSONB; -- rate limit info
```

**B. `ml_products` - FALTAM CAMPOS IMPORTANTES:**
```sql
-- ADICIONAR:
ALTER TABLE ml_products ADD COLUMN condition TEXT; -- new, used, not_specified
ALTER TABLE ml_products ADD COLUMN listing_type_id TEXT; -- gold_special, gold_pro, etc
ALTER TABLE ml_products ADD COLUMN currency_id TEXT DEFAULT 'BRL';
ALTER TABLE ml_products ADD COLUMN warranty TEXT;
ALTER TABLE ml_products ADD COLUMN pictures JSONB;
ALTER TABLE ml_products ADD COLUMN attributes JSONB;
ALTER TABLE ml_products ADD COLUMN variations JSONB; -- for products with variants
ALTER TABLE ml_products ADD COLUMN shipping JSONB; -- shipping config
ALTER TABLE ml_products ADD COLUMN sale_terms JSONB;
```

#### 5. **PROBLEMAS DE RLS (ROW LEVEL SECURITY)**

**A. POLÍTICAS INCORRETAS EM `ml_oauth_states`:**
```sql
-- ATUAL (INCORRETO):
tenant_id UUID NOT NULL REFERENCES public.profiles(id)

-- DEVERIA REFERENCIAR TABELA TENANTS
-- Mas como não existe tenants, usar user_id diretamente
```

**B. FALTA DE POLÍTICAS PARA SUPER ADMINS:**
- Nenhuma tabela ML tem política para super admins visualizarem tudo
- Necessário para debug e suporte

#### 6. **ÍNDICES DE PERFORMANCE AUSENTES**
```sql
-- ÍNDICES CRÍTICOS PARA PERFORMANCE
CREATE INDEX ml_orders_date_created_idx ON ml_orders(date_created DESC);
CREATE INDEX ml_orders_status_idx ON ml_orders(status);
CREATE INDEX ml_orders_buyer_id_idx ON ml_orders(buyer_id);
CREATE INDEX ml_orders_total_amount_idx ON ml_orders(total_amount);

CREATE INDEX ml_messages_date_created_idx ON ml_messages(date_created DESC);
CREATE INDEX ml_messages_status_idx ON ml_messages(status);
CREATE INDEX ml_messages_from_user_idx ON ml_messages(from_user_id);

CREATE INDEX ml_products_price_idx ON ml_products(price);
CREATE INDEX ml_products_condition_idx ON ml_products(condition);
CREATE INDEX ml_products_listing_type_idx ON ml_products(listing_type_id);
```

#### 7. **FUNÇÕES E TRIGGERS AUSENTES**

**A. FUNÇÃO PARA AUTO-REFRESH DE TOKENS:**
```sql
-- FUNÇÃO PARA RENOVAR TOKENS EXPIRADOS
CREATE OR REPLACE FUNCTION refresh_expired_ml_tokens()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Lógica para renovar tokens próximos do vencimento
END;
$$;
```

**B. TRIGGERS DE UPDATED_AT:**
```sql
-- TRIGGERS AUSENTES
CREATE TRIGGER ml_orders_updated_at 
  BEFORE UPDATE ON ml_orders 
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER ml_messages_updated_at 
  BEFORE UPDATE ON ml_messages 
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
```

---

## 🚨 **PROBLEMAS CRÍTICOS DE CONFIGURAÇÃO**

### 1. **WEBHOOK ENDPOINTS NÃO CONFIGURADOS**
- ML API precisa de endpoints específicos para cada tipo de notificação
- Faltam handlers para: orders_v2, items, messages, catalog_items

### 2. **RATE LIMITING NÃO IMPLEMENTADO**
- ML API tem limites rigorosos (1000 req/h por usuário)
- Necessário sistema de queue e throttling

### 3. **ENCRYPTION DE TOKENS AUSENTE**
- Tokens são armazenados em plain text
- Necessário encryption para compliance

---

## 🎯 **PRIORIDADE DE CORREÇÕES**

### 🔴 **CRÍTICO (IMEDIATO)**
1. Criar tabela `tenants` e migrar dados
2. Corrigir referências `tenant_id` em todas as tabelas ML
3. Adicionar tabelas `ml_orders` e `ml_messages`
4. Corrigir RLS policies com referências corretas

### 🟡 **ALTO (PRÓXIMOS DIAS)**
1. Adicionar colunas ausentes em `ml_products`
2. Implementar tabela `ml_categories`
3. Criar índices de performance
4. Adicionar políticas RLS para super admins

### 🟢 **MÉDIO (PRÓXIMAS SEMANAS)**
1. Sistema de encryption para tokens
2. Rate limiting e queue system
3. Webhook handlers específicos
4. Funções de auto-refresh tokens

---

## 📋 **CHECKLIST DE VALIDAÇÃO**

- [ ] Tabela `tenants` criada e populada
- [ ] Todas as referências `tenant_id` corrigidas
- [ ] Tabelas ML essenciais criadas (orders, messages, categories)
- [ ] RLS policies funcionando 100%
- [ ] APIs ML retornando dados corretos
- [ ] Sistema multi-tenant isolando dados
- [ ] Webhook processing funcionando
- [ ] Rate limiting implementado
- [ ] Encryption de tokens ativa
- [ ] Performance otimizada com índices

---

**CONCLUSÃO**: O sistema tem uma base sólida mas precisa de correções estruturais significativas para funcionar 100%. As lacunas identificadas explicam os erros 403/404/500 que estamos vendo nos logs.