# REFATORAÇÃO COMPLETA - INTEGRAÇÃO MERCADO LIVRE

**Data**: 2025-10-19  
**Status**: 🔴 **CRÍTICO - APLICAÇÃO NÃO FUNCIONAL**  
**Decisão**: Refazer TUDO do zero

---

## 🔍 DIAGNÓSTICO DO PROBLEMA ATUAL

### Evidências dos Logs (2025-10-19 14:53:42)

```
ML Products fetched: 0 products (page 1/0)
```

**Query ao banco:**

```sql
SELECT status, sold_quantity, last_sync_at
FROM ml_products
WHERE integration_id = '4bf6ccb3-15b1-43f3-9ce0-77c023ea647b'
```

**Resultado**: `[]` (vazio)

**Query de integração:**

```sql
SELECT * FROM ml_integrations
WHERE tenant_id = '103c4689-7097-4026-9857-2c8a2761214d'
AND status = 'active'
```

**Resultado**: `content-range: 0-0/*` (1 registro encontrado, mas não retornou dados)

### Problemas Identificados

1. ❌ **Migration 20251018210135 dropou TODAS as tabelas ML**

   - Perdemos todas as integrações existentes
   - Usuário precisa reconectar conta ML

2. ❌ **Código usa padrão ERRADO da API ML**

   - `/users/{id}/items/search` retorna apenas IDs
   - Código assumia que retornava objetos completos
   - Implementação do multiget estava incorreta

3. ❌ **RLS Policies podem estar bloqueando acesso**

   - Logs mostram query OK (200) mas sem dados
   - Possível problema de permissões

4. ❌ **Falta validação e tratamento de erros robusto**

   - Sem testes automatizados
   - Sem logs estruturados adequados
   - Sem retry logic para APIs

5. ❌ **Arquitetura não segue best practices**
   - Lógica de negócio misturada com API routes
   - Falta camada de serviços
   - Falta tratamento de edge cases

---

## 🎯 OBJETIVOS DA REFATORAÇÃO

### 1. Schema do Banco de Dados ✨ NOVO

**Princípios:**

- ✅ Seguir exatamente a estrutura da API oficial do ML
- ✅ Normalização adequada (3NF mínimo)
- ✅ Indexes otimizados para queries comuns
- ✅ RLS policies testadas e documentadas
- ✅ Constraints para garantir integridade
- ✅ Audit trail completo (created_at, updated_at, deleted_at)

**Tabelas principais:**

```sql
-- 1. ml_integrations
-- Armazena credenciais OAuth e configurações
CREATE TABLE ml_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL,

  -- ML User Info
  ml_user_id BIGINT NOT NULL UNIQUE,
  ml_nickname TEXT,
  ml_email TEXT,
  ml_site_id TEXT DEFAULT 'MLB',

  -- OAuth (encrypted tokens)
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  token_expires_at TIMESTAMPTZ NOT NULL,
  scopes TEXT[],

  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'revoked', 'error')),

  -- Config
  auto_sync_enabled BOOLEAN DEFAULT true,
  sync_frequency_minutes INTEGER DEFAULT 60,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_sync_at TIMESTAMPTZ,
  last_token_refresh_at TIMESTAMPTZ,

  -- Error tracking
  last_error TEXT,
  error_count INTEGER DEFAULT 0,

  -- Indexes
  UNIQUE(user_id, ml_user_id),
  INDEX idx_ml_integrations_tenant_id (tenant_id),
  INDEX idx_ml_integrations_status (status),
  INDEX idx_ml_integrations_token_expires (token_expires_at)
);

-- 2. ml_products
-- Sincronização de anúncios do ML
CREATE TABLE ml_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID NOT NULL REFERENCES ml_integrations(id) ON DELETE CASCADE,

  -- ML Item Info (seguindo API oficial)
  ml_item_id TEXT NOT NULL,
  title TEXT NOT NULL,
  category_id TEXT,
  price NUMERIC(12,2),
  available_quantity INTEGER DEFAULT 0,
  sold_quantity INTEGER DEFAULT 0,

  -- Status e tipo
  status TEXT CHECK (status IN ('active', 'paused', 'closed', 'under_review')),
  listing_type_id TEXT, -- gold_special, gold_pro, free, etc
  condition TEXT CHECK (condition IN ('new', 'used', 'not_specified')),

  -- URLs
  permalink TEXT,
  thumbnail TEXT,

  -- Full ML data (JSONB para flexibilidade)
  ml_data JSONB,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_sync_at TIMESTAMPTZ,

  -- Constraints
  UNIQUE(integration_id, ml_item_id),
  INDEX idx_ml_products_integration (integration_id),
  INDEX idx_ml_products_status (status),
  INDEX idx_ml_products_ml_item_id (ml_item_id)
);

-- 3. ml_orders
-- Pedidos do ML
CREATE TABLE ml_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID NOT NULL REFERENCES ml_integrations(id) ON DELETE CASCADE,

  -- ML Order Info
  ml_order_id BIGINT NOT NULL,
  status TEXT NOT NULL,
  status_detail TEXT,

  -- Buyer info
  buyer_id BIGINT,
  buyer_nickname TEXT,

  -- Financeiro
  total_amount NUMERIC(12,2),
  currency_id TEXT DEFAULT 'BRL',

  -- Datas importantes
  date_created TIMESTAMPTZ,
  date_closed TIMESTAMPTZ,

  -- Full order data (JSONB)
  ml_data JSONB NOT NULL,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_sync_at TIMESTAMPTZ,

  -- Constraints
  UNIQUE(integration_id, ml_order_id),
  INDEX idx_ml_orders_integration (integration_id),
  INDEX idx_ml_orders_status (status),
  INDEX idx_ml_orders_ml_order_id (ml_order_id),
  INDEX idx_ml_orders_date_created (date_created)
);

-- 4. ml_questions
-- Perguntas de compradores
CREATE TABLE ml_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID NOT NULL REFERENCES ml_integrations(id) ON DELETE CASCADE,

  -- ML Question Info
  ml_question_id BIGINT NOT NULL,
  ml_item_id TEXT NOT NULL,

  -- Status
  status TEXT CHECK (status IN ('UNANSWERED', 'ANSWERED', 'CLOSED_UNANSWERED', 'UNDER_REVIEW', 'BANNED', 'DELETED')),

  -- Conteúdo
  text TEXT NOT NULL,
  answer_text TEXT,

  -- Datas
  date_created TIMESTAMPTZ,
  date_answered TIMESTAMPTZ,

  -- Buyer info
  from_user_id BIGINT,

  -- Full data
  ml_data JSONB,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  UNIQUE(integration_id, ml_question_id),
  INDEX idx_ml_questions_integration (integration_id),
  INDEX idx_ml_questions_status (status),
  INDEX idx_ml_questions_item_id (ml_item_id)
);

-- 5. ml_webhook_logs
-- Log de webhooks recebidos do ML
CREATE TABLE ml_webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Webhook Info
  topic TEXT NOT NULL,
  resource TEXT NOT NULL,
  user_id BIGINT NOT NULL,
  application_id BIGINT NOT NULL,

  -- Payload
  payload JSONB NOT NULL,

  -- Processing
  processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMPTZ,
  error TEXT,
  retry_count INTEGER DEFAULT 0,

  -- Timestamps
  received_at TIMESTAMPTZ DEFAULT NOW(),

  -- Indexes
  INDEX idx_ml_webhook_logs_topic (topic),
  INDEX idx_ml_webhook_logs_processed (processed),
  INDEX idx_ml_webhook_logs_user_id (user_id)
);

-- 6. ml_sync_logs
-- Histórico de sincronizações
CREATE TABLE ml_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID NOT NULL REFERENCES ml_integrations(id) ON DELETE CASCADE,

  -- Sync Info
  sync_type TEXT NOT NULL CHECK (sync_type IN ('products', 'orders', 'questions', 'messages', 'full')),
  status TEXT NOT NULL CHECK (status IN ('started', 'completed', 'failed', 'partial')),

  -- Stats
  items_fetched INTEGER DEFAULT 0,
  items_synced INTEGER DEFAULT 0,
  items_failed INTEGER DEFAULT 0,

  -- Timing
  started_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  duration_seconds INTEGER,

  -- Error tracking
  error_message TEXT,
  error_details JSONB,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Indexes
  INDEX idx_ml_sync_logs_integration (integration_id),
  INDEX idx_ml_sync_logs_started_at (started_at),
  INDEX idx_ml_sync_logs_status (status)
);
```

### 2. Camada de Serviços ✨ NOVO

**Estrutura:**

```
utils/mercadolivre/
├── services/
│   ├── MLAuthService.ts          # OAuth 2.0 + PKCE flow
│   ├── MLTokenService.ts         # Token management + refresh
│   ├── MLProductService.ts       # Product CRUD operations
│   ├── MLOrderService.ts         # Order operations
│   ├── MLQuestionService.ts      # Questions + Answers
│   ├── MLWebhookService.ts       # Webhook processing
│   └── MLSyncService.ts          # Orchestration de syncs
├── repositories/
│   ├── MLIntegrationRepository.ts  # DB operations
│   ├── MLProductRepository.ts
│   ├── MLOrderRepository.ts
│   └── MLQuestionRepository.ts
├── api/
│   └── MLApiClient.ts            # HTTP client com retry logic
└── types/
    ├── ml-api-types.ts           # Types da API oficial
    └── ml-db-types.ts            # Types do banco
```

**Padrões de implementação:**

```typescript
// Example: MLProductService.ts
export class MLProductService {
  constructor(
    private apiClient: MLApiClient,
    private productRepo: MLProductRepository,
    private tokenService: MLTokenService
  ) {}

  /**
   * Sync all products from ML using correct multiget pattern
   * @throws MLApiError, MLTokenError
   */
  async syncAllProducts(integrationId: string): Promise<SyncResult> {
    const logger = this.getLogger("syncAllProducts");

    try {
      // Step 1: Get valid access token
      const accessToken = await this.tokenService.getValidToken(integrationId);

      // Step 2: Fetch all product IDs with pagination
      const productIds = await this.fetchAllProductIds(accessToken);
      logger.info(`Fetched ${productIds.length} product IDs`);

      // Step 3: Batch fetch full product details (20 per request)
      const products = await this.fetchProductDetailsBatch(
        accessToken,
        productIds
      );
      logger.info(`Fetched ${products.length} full product objects`);

      // Step 4: Upsert to database
      const syncResult = await this.productRepo.upsertBatch(
        integrationId,
        products
      );

      // Step 5: Log sync
      await this.logSync(integrationId, syncResult);

      return syncResult;
    } catch (error) {
      logger.error("Sync failed", { error });
      throw this.handleError(error);
    }
  }

  private async fetchAllProductIds(accessToken: string): Promise<string[]> {
    const allIds: string[] = [];
    let offset = 0;
    const limit = 50;
    let hasMore = true;

    while (hasMore) {
      const response = await this.apiClient.get<MLItemSearchResponse>(
        `/users/me/items/search`,
        { params: { offset, limit }, accessToken }
      );

      allIds.push(...response.results);
      hasMore = offset + limit < response.paging.total;
      offset += limit;

      // Safety limit
      if (offset > 10000) break;
    }

    return allIds;
  }

  private async fetchProductDetailsBatch(
    accessToken: string,
    productIds: string[]
  ): Promise<MLItem[]> {
    const products: MLItem[] = [];
    const chunkSize = 20;

    for (let i = 0; i < productIds.length; i += chunkSize) {
      const chunk = productIds.slice(i, i + chunkSize);
      const idsParam = chunk.join(",");

      const response = await this.apiClient.get<MLMultiGetResponse>(`/items`, {
        params: {
          ids: idsParam,
          attributes:
            "id,title,price,available_quantity,sold_quantity,status,category_id,permalink,thumbnail,condition,listing_type_id",
        },
        accessToken,
      });

      // Extract successful responses
      for (const result of response) {
        if (result.code === 200 && result.body) {
          products.push(result.body);
        }
      }

      // Rate limiting: sleep 100ms between batches
      await sleep(100);
    }

    return products;
  }
}
```

### 3. API Routes Refatoradas ✨ NOVO

**Estrutura:**

```
app/api/ml/
├── auth/
│   ├── login/route.ts           # Inicia OAuth flow
│   └── callback/route.ts        # OAuth callback handler
├── products/
│   ├── route.ts                 # GET (list) + POST (create)
│   ├── [id]/route.ts            # GET (detail) + PUT + DELETE
│   └── sync/route.ts            # POST - trigger sync
├── orders/
│   ├── route.ts                 # GET (list)
│   ├── [id]/route.ts            # GET (detail)
│   └── sync/route.ts            # POST - trigger sync
├── questions/
│   ├── route.ts                 # GET (list)
│   ├── [id]/
│   │   ├── route.ts             # GET (detail)
│   │   └── answer/route.ts      # POST (answer question)
│   └── sync/route.ts            # POST - trigger sync
└── webhooks/
    └── route.ts                 # POST - receive ML webhooks
```

**Padrão de implementação:**

```typescript
// app/api/ml/products/sync/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/utils/supabase/roles";
import { MLProductService } from "@/utils/mercadolivre/services/MLProductService";
import { logger } from "@/utils/logger";

export async function POST(request: NextRequest) {
  const context = { endpoint: "/api/ml/products/sync" };

  try {
    // 1. Authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // 2. Get integration
    const integration = await getActiveIntegration(user.id);
    if (!integration) {
      return NextResponse.json(
        { error: "No active ML integration found" },
        { status: 404 }
      );
    }

    // 3. Execute sync via service layer
    const productService = new MLProductService();
    const result = await productService.syncAllProducts(integration.id);

    // 4. Return result
    logger.info("Product sync completed", { ...context, result });

    return NextResponse.json({
      success: true,
      message: `Synced ${result.synced} products`,
      data: result,
    });
  } catch (error) {
    logger.error("Product sync failed", { ...context, error });

    return NextResponse.json(
      {
        error: "Failed to sync products",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
```

### 4. Testes Automatizados ✨ NOVO

**Estrutura:**

```
__tests__/
├── unit/
│   ├── services/
│   │   ├── MLTokenService.test.ts
│   │   ├── MLProductService.test.ts
│   │   └── MLOrderService.test.ts
│   └── repositories/
│       └── MLProductRepository.test.ts
├── integration/
│   ├── ml-oauth-flow.test.ts
│   ├── ml-product-sync.test.ts
│   └── ml-webhook-processing.test.ts
└── e2e/
    └── ml-complete-flow.test.ts
```

**Exemplo de teste:**

```typescript
// __tests__/unit/services/MLProductService.test.ts
import { describe, it, expect, vi } from "vitest";
import { MLProductService } from "@/utils/mercadolivre/services/MLProductService";

describe("MLProductService", () => {
  describe("syncAllProducts", () => {
    it("should correctly fetch product IDs and then multiget details", async () => {
      // Arrange
      const mockApiClient = {
        get: vi
          .fn()
          // First call: /users/me/items/search
          .mockResolvedValueOnce({
            results: ["MLB123", "MLB456"],
            paging: { total: 2, offset: 0, limit: 50 },
          })
          // Second call: /items multiget
          .mockResolvedValueOnce([
            {
              code: 200,
              body: { id: "MLB123", title: "Product 1", price: 100 },
            },
            {
              code: 200,
              body: { id: "MLB456", title: "Product 2", price: 200 },
            },
          ]),
      };

      const service = new MLProductService(
        mockApiClient,
        mockRepo,
        mockTokenService
      );

      // Act
      const result = await service.syncAllProducts("integration-id");

      // Assert
      expect(mockApiClient.get).toHaveBeenCalledTimes(2);
      expect(mockApiClient.get).toHaveBeenNthCalledWith(
        1,
        "/users/me/items/search",
        expect.objectContaining({ params: { offset: 0, limit: 50 } })
      );
      expect(mockApiClient.get).toHaveBeenNthCalledWith(
        2,
        "/items",
        expect.objectContaining({ params: { ids: "MLB123,MLB456" } })
      );
      expect(result.synced).toBe(2);
    });

    it("should handle ML API errors gracefully", async () => {
      // Test error handling
    });

    it("should handle partial failures in multiget", async () => {
      // Test when some products return 404
    });
  });
});
```

---

## 📋 PLANO DE EXECUÇÃO

### Fase 1: Preparação (1-2 horas)

- [x] Criar este documento de planejamento
- [ ] Analisar schema atual no Supabase Dashboard
- [ ] Documentar todos os endpoints da API ML necessários
- [ ] Criar backup do banco (caso tenha dados importantes)

### Fase 2: Schema & Migrations (2-3 horas)

- [ ] Criar migration nova: `20251019_rebuild_ml_integration_complete.sql`
- [ ] Implementar todas as tabelas com RLS policies
- [ ] Testar RLS policies localmente
- [ ] Aplicar em produção

### Fase 3: Camada de Serviços (4-6 horas)

- [ ] Implementar MLApiClient com retry logic
- [ ] Implementar MLTokenService (refresh automático)
- [ ] Implementar MLProductService (multiget correto)
- [ ] Implementar MLOrderService
- [ ] Implementar MLQuestionService
- [ ] Implementar MLWebhookService
- [ ] Implementar MLSyncService (orchestrator)

### Fase 4: API Routes (2-3 horas)

- [ ] Refatorar /api/ml/auth/\*
- [ ] Refatorar /api/ml/products/\*
- [ ] Refatorar /api/ml/orders/\*
- [ ] Refatorar /api/ml/questions/\*
- [ ] Refatorar /api/ml/webhooks/\*

### Fase 5: Frontend (2-3 horas)

- [ ] Atualizar componentes de produtos
- [ ] Atualizar componentes de pedidos
- [ ] Atualizar componentes de perguntas
- [ ] Implementar loading states adequados
- [ ] Implementar error handling visual

### Fase 6: Testes (3-4 horas)

- [ ] Testes unitários de serviços
- [ ] Testes de integração (API routes)
- [ ] Testes E2E (fluxo completo)
- [ ] Validar RLS policies

### Fase 7: Documentação (1-2 horas)

- [ ] Documentar arquitetura
- [ ] Documentar fluxos de dados
- [ ] Guia de troubleshooting
- [ ] README atualizado

### Fase 8: Deploy & Validação (1-2 horas)

- [ ] Deploy em produção
- [ ] Reconectar conta ML
- [ ] Testar sync de 90+ produtos
- [ ] Monitorar logs por 24h

**TOTAL ESTIMADO: 16-26 horas de trabalho focado**

---

## 🚨 DECISÕES ARQUITETURAIS

### 1. Por que refazer do zero?

- ✅ Código atual tem problemas fundamentais de design
- ✅ Mais rápido refazer corretamente do que "arrumar gambiarras"
- ✅ Aplicação em desenvolvimento, sem usuários reais
- ✅ Oportunidade de implementar best practices desde o início

### 2. Tecnologias e Padrões

- ✅ **TypeScript strict mode**: Type safety máxima
- ✅ **Repository Pattern**: Separação de concerns
- ✅ **Service Layer**: Lógica de negócio isolada
- ✅ **Dependency Injection**: Facilita testes
- ✅ **Structured Logging**: Sentry + custom logger
- ✅ **Error Handling**: Custom error classes
- ✅ **Validation**: Zod schemas em todas as fronteiras

### 3. API do Mercado Livre

- ✅ Seguir EXATAMENTE a documentação oficial
- ✅ Implementar rate limiting adequado
- ✅ Retry logic com exponential backoff
- ✅ Timeout em todas as requests (30s padrão)
- ✅ Validação de responses com Zod

### 4. Database

- ✅ PostgreSQL com RLS habilitado
- ✅ JSONB para dados flexíveis (ml_data)
- ✅ Indexes otimizados para queries comuns
- ✅ Soft deletes (deleted_at) quando aplicável
- ✅ Audit trail completo

### 5. Segurança

- ✅ Tokens ML criptografados com AES-256-GCM
- ✅ RLS policies em TODAS as tabelas
- ✅ Validação de inputs com Zod
- ✅ CORS configurado corretamente
- ✅ Rate limiting em API routes

---

## 📚 RECURSOS DE REFERÊNCIA

### Documentação Oficial ML

- [Items and Searches](https://developers.mercadolibre.com.ar/en_us/items-and-searches)
- [Orders](https://developers.mercadolibre.com.ar/en_us/orders-management)
- [Questions](https://developers.mercadolibre.com.ar/en_us/questions)
- [OAuth 2.0](https://developers.mercadolibre.com.ar/en_us/authentication-and-authorization)
- [Notifications (Webhooks)](https://developers.mercadolibre.com.ar/en_us/notifications)

### Best Practices

- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Next.js App Router Best Practices](https://nextjs.org/docs/app/building-your-application)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

---

## ✅ CRITÉRIOS DE SUCESSO

### Funcional

- [x] 90+ produtos sincronizando corretamente
- [ ] Pedidos sendo buscados e exibidos
- [ ] Perguntas sendo sincronizadas
- [ ] Webhooks processando em tempo real
- [ ] Token refresh automático funcionando

### Técnico

- [ ] Cobertura de testes > 80%
- [ ] TypeScript sem erros
- [ ] Logs estruturados em todas as operações
- [ ] Tempo de sync < 30s para 100 produtos
- [ ] Zero erros em produção após 24h

### Documentação

- [ ] README completo e atualizado
- [ ] Arquitetura documentada com diagramas
- [ ] Troubleshooting guide criado
- [ ] Comentários em código complexo

---

**PRÓXIMO PASSO**: Começar Fase 1 - Análise do banco de dados atual
