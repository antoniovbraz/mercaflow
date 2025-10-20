# 🎯 ML Error Handling - Análise Completa para Fase 1.4

**Data**: 19 de Outubro de 2025  
**Objetivo**: Documentar error handling do Mercado Livre para implementação consistente na Fase 1.4  
**Baseado em**: Documentação oficial ML + implementação atual MercaFlow

---

## 📋 Status Current do Error Handling

### ✅ O Que Já Temos Implementado

#### 1. **Classes de Erro Customizadas** (`utils/mercadolivre/types/ml-errors.ts`)

**Hierarquia completa**:

```
MLError (base)
├── MLApiError
│   ├── MLRateLimitError (429)
│   ├── MLUnauthorizedError (401)
│   ├── MLForbiddenError (403)
│   ├── MLNotFoundError (404)
│   └── MLBadRequestError (400)
├── MLOAuthError
│   └── MLOAuthStateError
├── MLTokenError
│   ├── MLTokenExpiredError
│   ├── MLTokenRefreshError
│   └── MLTokenEncryptionError
├── MLSyncError
│   └── MLPartialSyncError
├── MLIntegrationError
│   ├── MLIntegrationNotFoundError
│   └── MLIntegrationInactiveError
├── MLWebhookError
│   └── MLWebhookProcessingError
└── MLValidationError
```

**Funções auxiliares disponíveis**:

- ✅ `toMLError(error: unknown): MLError` - Converte qualquer erro para MLError
- ✅ `isRetryableError(error: unknown): boolean` - Identifica erros temporários (5xx, network, 429)
- ✅ `requiresTokenRefresh(error: unknown): boolean` - Identifica se precisa refresh do token (401, token expired)

#### 2. **MLApiClient** (`utils/mercadolivre/api/MLApiClient.ts`)

**Funcionalidades implementadas**:

- ✅ **Retry com exponential backoff** (default: 3 tentativas)
  - Delay base: 1000ms
  - Multiplicador: 2x (1s → 2s → 4s)
- ✅ **Timeout configurável** (default: 30s)
  - AbortSignal para cancelamento automático
- ✅ **Rate limiting (429)**
  - Captura `Retry-After` header
  - Cria `MLRateLimitError` com tempo de retry
- ✅ **Logging estruturado**
  - Request: método, URL sanitizado, presença de token
  - Response: status, tentativa
  - Error: status, dados de erro, tentativa
- ✅ **Sanitização de logs**
  - Remove `access_token`, `code`, `refresh_token` das URLs

**HTTP Status Mapping**:

```typescript
429 → MLRateLimitError (retryable, usa Retry-After header)
401 → MLUnauthorizedError (requires token refresh)
403 → MLForbiddenError (não retryable)
404 → MLNotFoundError (não retryable)
400 → MLBadRequestError (não retryable)
5xx → MLApiError (retryable)
Timeout → MLApiError code=TIMEOUT (retryable)
Network → MLApiError code=NETWORK_ERROR (retryable)
```

#### 3. **Toast Helper Integration** (`utils/toast-helper.ts`)

**Parsing inteligente de erros ML**:

```typescript
// Já implementado em parseErrorMessage():
if (error.message.includes("429")) {
  return "Limite de requisições atingido. Por favor, aguarde um momento.";
}

if (message.includes("unauthorized") || message.includes("401")) {
  return "Sessão expirada. Por favor, faça login novamente.";
}

if (message.includes("forbidden") || message.includes("403")) {
  return "Você não tem permissão para realizar esta ação.";
}

if (message.includes("404")) {
  return "Recurso não encontrado.";
}

if (message.includes("500") || message.includes("server error")) {
  return "Erro no servidor. Tente novamente mais tarde.";
}
```

---

## 📚 Documentação Oficial do Mercado Livre

### HTTP Status Codes Confirmados

Baseado em **ML_API_AUDIT.md** e **ML_API_ESTRATEGIA_COMPLETA.md**:

| Status  | Significado                            | Ação Recomendada              | Retryable?               |
| ------- | -------------------------------------- | ----------------------------- | ------------------------ |
| **200** | Sucesso                                | Processar resposta            | N/A                      |
| **201** | Criado com sucesso                     | Processar recurso criado      | N/A                      |
| **204** | Sem conteúdo (sucesso)                 | Operação completada           | N/A                      |
| **400** | Bad Request (parâmetros inválidos)     | Validar input, ajustar params | ❌ Não                   |
| **401** | Unauthorized (token expirado/inválido) | Refresh token ou re-autorizar | ❌ Não (mas requer ação) |
| **403** | Forbidden (permissões insuficientes)   | Verificar scopes OAuth        | ❌ Não                   |
| **404** | Not Found (recurso inexistente)        | Verificar ID do recurso       | ❌ Não                   |
| **429** | Rate Limit Exceeded                    | Aguardar Retry-After          | ✅ Sim                   |
| **500** | Internal Server Error (ML)             | Retry com backoff             | ✅ Sim                   |
| **502** | Bad Gateway                            | Retry com backoff             | ✅ Sim                   |
| **503** | Service Unavailable                    | Retry com backoff             | ✅ Sim                   |
| **504** | Gateway Timeout                        | Retry com backoff             | ✅ Sim                   |

### Rate Limiting do ML

**Limites conhecidos** (não documentados oficialmente, mas observados):

- Sem rate limit explícito documentado para APIs gerais
- **429 pode ocorrer** em picos de requisições
- **Retry-After header** deve ser respeitado
- **Sugestão**: Implementar delay de 100ms entre batches (já feito em MLProductService)

**Implementação atual**:

```typescript
// MLProductService.ts
const MULTIGET_DELAY_MS = 100; // Delay between multiget batches to avoid rate limits

// MLApiClient.ts
if (status === 429) {
  const retryAfter = response.headers.get("Retry-After");
  const retryAfterSeconds = retryAfter ? parseInt(retryAfter, 10) : 60;
  throw new MLRateLimitError("ML API rate limit exceeded", retryAfterSeconds);
}
```

### Erros Específicos da API ML

#### 1. Questions API (Erro 400 comum)

**Problema**: "Invalid client parameters"

**Causa confirmada** (ML_API_AUDIT.md):

```diff
- ERRADO: /questions/search?limit=50&status=UNANSWERED&sort=date_desc
+ CORRETO: /my/received_questions/search?limit=50&status=UNANSWERED&api_version=4
```

**Campos problemáticos**:

- ❌ `sort` não é suportado
- ✅ `api_version=4` é obrigatório
- ✅ Endpoint correto: `/my/received_questions/search`

#### 2. Items API (sold_quantity só com token proprietário)

**Comportamento**:

```typescript
// Com SEU token:
GET /items/{item_id}
→ { "sold_quantity": 123 } ✅

// Com token de outra pessoa ou sem token:
GET /items/{item_id}
→ { "sold_quantity": null } ⚠️
```

**Implicação**: Não é erro 403, apenas campo retorna `null`

#### 3. Metrics API (histórico limitado a 12 meses)

**Documentado em ML_API_ESTRATEGIA_COMPLETA.md**:

```typescript
GET / orders / search;
// Histórico: APENAS 12 meses!

// Solução: Armazenar no Supabase para longo prazo
```

---

## 🎯 Padrões de Error Handling Recomendados

### 1. **API Routes Pattern** (Next.js)

**Estrutura padrão para todos os endpoints `/api/ml/*`**:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/utils/supabase/server";
import { getMLApiClient } from "@/utils/mercadolivre/api/MLApiClient";
import {
  MLApiError,
  MLRateLimitError,
  MLUnauthorizedError,
} from "@/utils/mercadolivre/types/ml-errors";
import { logger } from "@/utils/logger";

export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // 2. Get ML integration/token
    const integration = await getMLIntegration(user.id);
    if (!integration) {
      return NextResponse.json(
        { error: "ML integration not found" },
        { status: 404 }
      );
    }

    // 3. Call ML API
    const client = getMLApiClient();
    const response = await client.get("/endpoint", {
      accessToken: integration.access_token,
      params: {
        /* ... */
      },
    });

    // 4. Return success
    return NextResponse.json({
      success: true,
      data: response.data,
    });
  } catch (error) {
    // 5. Handle ML-specific errors
    if (error instanceof MLRateLimitError) {
      logger.warn("ML rate limit", { retryAfter: error.retryAfter });
      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          retryAfter: error.retryAfter,
        },
        { status: 429 }
      );
    }

    if (error instanceof MLUnauthorizedError) {
      logger.error("ML unauthorized", { error, userId: user?.id });
      return NextResponse.json(
        {
          error: "ML token expired",
          suggestion: "Please reconnect your Mercado Livre account",
        },
        { status: 401 }
      );
    }

    if (error instanceof MLApiError) {
      logger.error("ML API error", { error, statusCode: error.statusCode });
      return NextResponse.json(
        {
          error: error.message,
          statusCode: error.statusCode,
        },
        { status: error.statusCode }
      );
    }

    // 6. Generic error
    logger.error("Unexpected error", { error });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

**Checklist para cada API route**:

- ✅ Autenticação de usuário (getCurrentUser)
- ✅ Validação de integração ML
- ✅ Try-catch com logging estruturado
- ✅ Tratamento específico de MLRateLimitError (retryAfter)
- ✅ Tratamento específico de MLUnauthorizedError (sugestão re-auth)
- ✅ Tratamento genérico de MLApiError
- ✅ Resposta JSON consistente: `{ error, statusCode?, retryAfter?, suggestion? }`

### 2. **Client Components Pattern** (React)

**Estrutura padrão para consumo de APIs**:

```typescript
"use client";

import { useState } from "react";
import { showErrorToast, showSuccessToast } from "@/utils/toast-helper";
import { ErrorState } from "@/components/ui/empty-state-variants";

export function MyComponent() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/ml/endpoint");
      const result = await response.json();

      if (!response.ok) {
        // Handle API errors
        if (response.status === 429) {
          const retryAfter = result.retryAfter || 60;
          showErrorToast(new Error(`Rate limit. Try again in ${retryAfter}s`), {
            description: "Too many requests. Please wait.",
          });
          setError(`Rate limit exceeded. Retry in ${retryAfter}s`);
          return;
        }

        if (response.status === 401) {
          showErrorToast(new Error("ML authentication failed"), {
            description: result.suggestion || "Please reconnect your account",
          });
          setError("Authentication failed");
          return;
        }

        throw new Error(result.error || "Request failed");
      }

      setData(result.data);
      showSuccessToast("Data loaded successfully");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      showErrorToast(err);
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <ErrorState
        title="Failed to load data"
        description={error}
        action={{
          label: "Try Again",
          onClick: fetchData,
        }}
      />
    );
  }

  // ... rest of component
}
```

**Checklist para client components**:

- ✅ Estado de loading/error/data separados
- ✅ Toast para feedback imediato
- ✅ ErrorState component para erros persistentes
- ✅ Tratamento de 429 (rate limit) com retryAfter
- ✅ Tratamento de 401 (token expired) com sugestão
- ✅ Ação de retry no ErrorState

### 3. **Token Refresh Pattern**

**Fluxo automático** (já implementado em MLTokenManager):

```typescript
// 1. MLApiClient detecta 401
if (status === 401) {
  throw new MLUnauthorizedError();
}

// 2. MLTokenManager intercepta e tenta refresh
try {
  const newToken = await tokenManager.refreshToken(integrationId);
  // Retry original request com novo token
  return await retryWithNewToken(newToken);
} catch (refreshError) {
  // Refresh falhou → usuário precisa re-autorizar
  throw new MLTokenRefreshError("Token refresh failed");
}
```

**UI deve mostrar**:

```
❌ "Your Mercado Livre connection expired"
ℹ️ "Please reconnect your account to continue"
[Reconnect ML] button → redirect para OAuth flow
```

---

## 🚨 Gaps Identificados (Para Fase 1.4)

### 1. **API Routes sem Error Handling Padronizado**

**Problema**: Alguns endpoints ainda usam:

```typescript
catch (error) {
  console.error(error); // ❌
  return NextResponse.json({ error: "Error" }); // ❌ Genérico demais
}
```

**Solução**: Aplicar pattern documentado acima

### 2. **Falta de Recovery Actions em UI**

**Problema**: Erros apenas mostram mensagem, sem ação

```tsx
{
  error && <div>{error}</div>;
}
{
  /* ❌ Sem recovery */
}
```

**Solução**: Usar ErrorState com actions:

```tsx
<ErrorState
  title="Load failed"
  description={error}
  action={{ label: "Retry", onClick: retry }}
  secondaryAction={{ label: "Refresh Token", onClick: refreshToken }}
/>
```

### 3. **Sem Tracking de Erros ML no Sentry**

**Problema**: Erros ML não têm contexto suficiente

**Solução**: Adicionar tags e context:

```typescript
Sentry.captureException(error, {
  tags: {
    ml_api: "items",
    ml_status: error.statusCode,
    ml_error_type: error.name,
  },
  contexts: {
    ml_integration: {
      user_id: userId,
      integration_id: integrationId,
      token_expires_at: expiresAt,
    },
  },
});
```

### 4. **Falta de Rate Limit Dashboard**

**Problema**: Sem visibilidade de quando 429 ocorre

**Solução**: Dashboard card mostrando:

- Total de requests hoje
- Rate limits atingidos (últimas 24h)
- Próximo retry disponível (se em cooldown)

---

## 📈 Métricas de Sucesso para Fase 1.4

### Técnicas

- ✅ 100% API routes com error handling padronizado
- ✅ 0 erros não tratados (500 genérico)
- ✅ < 1% taxa de retry failures
- ✅ 100% erros ML logados no Sentry com contexto

### UX

- ✅ 100% erros com recovery action
- ✅ 0 mensagens técnicas para usuário ("MLApiError" → "Failed to load")
- ✅ 90% usuários entendem ação a tomar (re-auth, retry, etc.)

### Observabilidade

- ✅ Dashboard de rate limits (se relevante)
- ✅ Alertas Sentry configurados (ex: > 10 401 em 1h)
- ✅ Logs estruturados com context completo

---

## 🎯 Próximos Passos (Fase 1.4)

### Tarefas Prioritárias

1. **Audit de API Routes** (2h)

   - Listar todos os endpoints `/api/ml/*`
   - Identificar quais não seguem pattern
   - Refatorar um por um

2. **ErrorAlert Component** (3h)

   - Criar componente reutilizável para erros inline
   - Suporte a recovery actions
   - Variantes: recoverable, fatal, warning

3. **Sentry Integration** (2h)

   - Adicionar context ML em todos os logs
   - Configurar alerts para erros críticos
   - Testar com erros reais

4. **Documentation** (1h)
   - Atualizar copilot-instructions.md
   - Criar guia rápido de error handling
   - Exemplos de uso

**Tempo total**: ~8h (ajustável para 6h se focarmos apenas no essencial)

---

**Última Atualização**: 19 de Outubro de 2025  
**Baseado em**: Documentação ML oficial + implementação MercaFlow atual  
**Próximo**: Implementar Fase 1.4 seguindo este guia
