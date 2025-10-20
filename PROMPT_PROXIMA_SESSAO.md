# 🚀 Prompt para Continuação - Implementação Intelligence Features

**Data de Atualização**: 2025-10-20  
**Contexto**: Fase 2 - Intelligence Analytics do MercaFlow  
**Progresso Atual**: 33% concluído (Schemas ✅ | API Class ✅ | InsightGenerator 🔄 0%)

---

## ✅ O QUE JÁ FOI CONCLUÍDO

### 1. Zod Schemas Completos (100%) ✅
- Arquivo: `utils/validation/ml-intelligence-schemas.ts` (420 linhas)
- 7 schemas principais + 20+ auxiliares
- Validações rigorosas com enum types
- TypeScript: 0 erros

### 2. MLIntelligenceAPI Class (100%) ✅
- Arquivo: `utils/mercadolivre/intelligence.ts` (687 linhas)
- 9 métodos implementados e testados
- Cache pattern correto usando `getCached()`
- Validação Zod em todas responses
- Structured logging completo
- TypeScript: 0 erros
- **Status**: Ready for production! 🚀

---

## 🎯 PRÓXIMA TAREFA IMEDIATA

### TAREFA: Criar InsightGenerator Module

**Arquivo**: `utils/intelligence/insight-generator.ts`

**Objetivo**: Transformar dados brutos da MLIntelligenceAPI em insights acionáveis para os usuários.

**Conceito**: O InsightGenerator analisa dados de preço, mercado e performance para gerar recomendações automáticas com:
- **Prioridade** (1-5): Urgência da ação
- **Confidence** (0-100%): Confiança na recomendação
- **ROI Estimate**: Impacto financeiro estimado
- **Action Items**: Passos específicos para implementar

---

## 📋 ESPECIFICAÇÃO DETALHADA

### Types a Criar

```typescript
/**
 * Insight categories
 */
export type InsightCategory = 
  | 'PRICE_OPTIMIZATION'
  | 'AUTOMATION_OPPORTUNITY'
  | 'MARKET_TREND'
  | 'PERFORMANCE_WARNING'
  | 'QUALITY_IMPROVEMENT'
  | 'COMPETITOR_ALERT';

/**
 * Insight priority (1 = highest, 5 = lowest)
 */
export type InsightPriority = 1 | 2 | 3 | 4 | 5;

/**
 * Insight status
 */
export type InsightStatus = 
  | 'PENDING'      // Waiting for user action
  | 'DISMISSED'    // User dismissed
  | 'COMPLETED'    // User completed action
  | 'EXPIRED';     // No longer relevant

/**
 * Base insight interface
 */
export interface Insight {
  id: string;                     // UUID
  category: InsightCategory;
  priority: InsightPriority;
  confidence: number;             // 0-100%
  title: string;                  // Short title (50 chars)
  description: string;            // Detailed explanation
  roi_estimate?: number;          // Estimated financial impact (R$)
  action_items: string[];         // Specific steps to take
  metadata: Record<string, any>;  // Category-specific data
  created_at: string;             // ISO 8601
  expires_at?: string;            // ISO 8601
  status: InsightStatus;
}

/**
 * Price optimization insight metadata
 */
export interface PriceInsightMetadata {
  item_id: string;
  current_price: number;
  suggested_price: number;
  price_difference: number;
  competitor_count: number;
  automation_enabled: boolean;
}

/**
 * Trend insight metadata
 */
export interface TrendInsightMetadata {
  trend_keyword: string;
  trend_url: string;
  category_id?: string;
  relevance_score: number;  // 0-100
}

/**
 * Performance insight metadata
 */
export interface PerformanceInsightMetadata {
  item_id: string;
  current_score: number;
  potential_score: number;
  improvement_areas: string[];
  visit_trend: number;  // Percentage change
}
```

### Classe InsightGenerator

```typescript
export class InsightGenerator {
  private intelligence: MLIntelligenceAPI;
  private tenantId: string;

  constructor(integrationId: string, tenantId: string) {
    this.intelligence = getMLIntelligenceAPI(integrationId);
    this.tenantId = tenantId;
  }

  /**
   * Generate all insights for tenant
   * Analyzes items, trends, and performance to create actionable recommendations
   */
  async generateAllInsights(itemIds: string[]): Promise<Insight[]>;

  /**
   * Generate price optimization insights
   * Checks if items are priced optimally vs competition
   */
  async generatePriceInsights(itemIds: string[]): Promise<Insight[]>;

  /**
   * Generate automation opportunity insights
   * Identifies items that would benefit from price automation
   */
  async generateAutomationInsights(itemIds: string[]): Promise<Insight[]>;

  /**
   * Generate market trend insights
   * Finds trending products relevant to user's inventory
   */
  async generateTrendInsights(categoryIds?: string[]): Promise<Insight[]>;

  /**
   * Generate performance warning insights
   * Alerts on items with low quality scores or declining visits
   */
  async generatePerformanceInsights(itemIds: string[]): Promise<Insight[]>;

  /**
   * Calculate insight priority based on impact and urgency
   */
  private calculatePriority(params: {
    roi: number;
    confidence: number;
    urgency: number;
  }): InsightPriority;

  /**
   * Calculate ROI estimate for price changes
   */
  private calculatePriceROI(params: {
    current_price: number;
    suggested_price: number;
    visits_per_day: number;
    conversion_rate?: number;
  }): number;
}
```

---

## 🔍 LÓGICA DE NEGÓCIO

### 1. Price Optimization Insights

**Quando gerar**:
- Preço atual > 10% acima do sugerido → "Você está perdendo vendas"
- Preço atual < 10% abaixo do sugerido → "Você está deixando dinheiro na mesa"

**Cálculo de ROI**:
```typescript
// Exemplo: Item a R$ 120, ML sugere R$ 100
// 50 visitas/dia, conversão 5%
// ROI = (100 - 120) * (50 * 0.05) * 30 dias
// ROI = -20 * 2.5 * 30 = -R$ 1.500/mês (perda atual)
// Benefício ao ajustar: +R$ 1.500/mês
```

**Priority**:
- ROI > R$ 1000: Priority 1
- ROI > R$ 500: Priority 2
- ROI > R$ 100: Priority 3
- ROI < R$ 100: Priority 4

### 2. Automation Opportunity Insights

**Quando gerar**:
- Item sem automação AND preço volátil (mudou 3+ vezes em 7 dias)
- Item com concorrência alta (10+ competidores)

**ROI**: Tempo economizado (3h/semana) + otimização de preço (+15% vendas estimado)

### 3. Market Trend Insights

**Quando gerar**:
- Trend keyword match com categoria do usuário
- Relevance score > 70%

**Relevance score**:
```typescript
// Match trend keyword com:
// - Category name (50%)
// - Item titles (30%)
// - Item attributes (20%)
```

### 4. Performance Warning Insights

**Quando gerar**:
- Quality score < 70
- Visits trend < -20% (últimas 2 semanas)
- Seller reputation < 4 stars

**Priority**: Alta se múltiplos fatores combinados

---

## 📚 IMPORTS NECESSÁRIOS

```typescript
import { getMLIntelligenceAPI } from '@/utils/mercadolivre/intelligence';
import { logger } from '@/utils/logger';
import { v4 as uuidv4 } from 'uuid';
import type {
  MLPriceSuggestion,
  MLAutomationRule,
  MLTrend,
  MLVisits,
  MLPerformance,
} from '@/utils/validation/ml-intelligence-schemas';
```

---

## ⚠️ ATENÇÕES CRÍTICAS

1. **Confidence Scoring**: Baseie em qualidade dos dados
   - Dados completos (sugestão + visitas + performance): 95%
   - Dados parciais: 70-80%
   - Apenas um dado: 50%

2. **ROI Calculations**: Seja conservador
   - Use conversion rate padrão de 3-5% se não tiver dados
   - Considere apenas 30 dias para estimativas
   - Arredonde para baixo (melhor subestimar que prometer demais)

3. **Priority Algorithm**: Combine múltiplos fatores
   - ROI (40% do peso)
   - Confidence (30% do peso)
   - Urgency (30% do peso)

4. **Expiration Logic**:
   - Price insights: 24 horas (preços mudam rápido)
   - Trend insights: 7 dias (trends semanais)
   - Performance insights: 3 dias (score pode melhorar)

5. **Structured Logging**: Log cada insight gerado com metadata

---

## 📖 ARQUIVOS DE REFERÊNCIA

- `utils/mercadolivre/intelligence.ts` - API para buscar dados
- `utils/logger.ts` - Structured logging
- Padrões de código existentes no projeto

---

## ✅ CRITÉRIOS DE SUCESSO

1. ✅ TypeScript compila sem erros
2. ✅ Todos os métodos públicos implementados
3. ✅ Lógica de ROI calculada corretamente
4. ✅ Priority algorithm sensato
5. ✅ Structured logging em operações principais
6. ✅ JSDoc comments completo
7. ✅ Types exportados em arquivo separado se necessário

---

## 🎯 APÓS InsightGenerator

Próximas tarefas em ordem:

1. **Database Migration** (Alta prioridade)
   - Criar tabela `insights` com RLS
   - Indexes para queries eficientes
   - Trigger para auto-expire insights

2. **API Endpoints** (4 endpoints)
   - POST `/api/intelligence/insights/generate`
   - GET `/api/intelligence/insights/list`
   - POST `/api/intelligence/insights/[id]/dismiss`
   - POST `/api/intelligence/insights/[id]/complete`

3. **UI Components** (3 componentes principais)
   - InsightCard, InsightList, InsightModal
   - Dashboard integration

---

## 💡 EXEMPLO DE USO (Referência)

```typescript
// Generate insights for tenant
const generator = new InsightGenerator(integrationId, tenantId);

// Get all active item IDs from database
const itemIds = ['MLB123', 'MLB456', 'MLB789'];

// Generate all insights
const insights = await generator.generateAllInsights(itemIds);

console.log(`Generated ${insights.length} insights`);

// Filter by priority
const urgent = insights.filter(i => i.priority <= 2);
console.log(`${urgent.length} urgent actions needed`);

// Calculate total potential ROI
const totalROI = insights
  .filter(i => i.roi_estimate)
  .reduce((sum, i) => sum + (i.roi_estimate || 0), 0);

console.log(`Potential monthly gain: R$ ${totalROI.toFixed(2)}`);
```

---

**Criado em**: 2025-10-20  
**Última atualização**: Session 2 (MLIntelligenceAPI completo)  
**Próximo arquivo**: `utils/intelligence/insight-generator.ts`  
**Estimativa de tempo**: 2-3 horas para implementação completa  
**Complexidade**: Média-Alta (lógica de negócio + cálculos)

---

## 📋 PROMPT PARA COPIAR E COLAR

````
Olá! Sou o desenvolvedor do MercaFlow, uma SaaS de integração com Mercado Livre focada em Intelligence Analytics (70%) + Automatic Website (30%).

Estou na FASE 2 da implementação: Intelligence Features. A base técnica já foi auditada e aprovada (94/100 pontos - veja AUDITORIA_TECNICA_COMPLETA.md).

## ✅ O QUE JÁ ESTÁ PRONTO

1. **Zod Schemas Completos** (100%)
   - Arquivo: `utils/validation/ml-intelligence-schemas.ts` (420 linhas)
   - 7 schemas principais: MLPriceSuggestion, MLAutomationRule, MLPriceHistory, MLTrend, MLVisits, MLPerformance, MLReputation
   - 20+ schemas auxiliares com validações rigorosas
   - Exports configurados em `utils/validation/index.ts`
   - ✅ TypeScript: 0 erros

2. **Documentação Completa**
   - `AUDITORIA_TECNICA_COMPLETA.md` - Análise técnica da base (94/100)
   - `ML_API_COMPLETA_ANALISE.md` - Mapeamento de todas APIs do ML
   - `CONCEITO_OFICIAL_MERCAFLOW.md` - Conceito: Intelligence Analytics 70% + Website 30%
   - `STATUS_IMPLEMENTACAO_INTELLIGENCE.md` - Status atual da implementação

3. **Base Técnica Sólida**
   - MLTokenManager com auto-refresh funcionando
   - MLApiClient com retry logic + exponential backoff
   - 20+ error classes customizadas para ML
   - RLS policies + RBAC (64 permissions)
   - Multi-tenancy completo
   - Cache com Redis (getCached pattern)

## 🎯 O QUE PRECISO IMPLEMENTAR AGORA

### TAREFA IMEDIATA: Criar MLIntelligenceAPI class

**Arquivo**: `utils/mercadolivre/intelligence.ts`

**Requisitos Críticos**:
1. ✅ Usar `getCached(key, fetcher, options)` pattern (NÃO usar cacheGet/cacheSet)
2. ✅ Integrar com MLTokenManager existente
3. ✅ Usar MLApiClient para requests (já tem retry logic)
4. ✅ Validar TODAS responses com Zod schemas
5. ✅ Structured logging com `logger` utility
6. ✅ Error handling robusto

**Padrão Correto de Cache**:
```typescript
import { getCached } from '@/utils/redis/cache';

async getPriceSuggestions(itemId: string): Promise<MLPriceSuggestion> {
  const cacheKey = `ml:price-suggestions:${itemId}`;

  return await getCached<MLPriceSuggestion>(
    cacheKey,
    async () => {
      // Get valid token
      const token = await this.tokenManager.getValidToken(this.integrationId);
      if (!token) throw new Error('No valid access token');

      // Fetch from ML API
      const response = await this.apiClient.request<MLPriceSuggestion>(
        `/suggestions/items/${itemId}/details`,
        { method: 'GET', accessToken: token }
      );

      // Validate with Zod
      return validateOutput(MLPriceSuggestionSchema, response.data);
    },
    { ttl: IntelligenceCacheTTL.PRICE_SUGGESTIONS }
  );
}
````

**9 Métodos a Implementar**:

1. `getPriceSuggestions(itemId: string): Promise<MLPriceSuggestion>`

   - Endpoint: `GET /suggestions/items/{id}/details`
   - Cache TTL: 1800s (30min)
   - Returns: suggested_price, current_price, status, costs, competitor_graph

2. `getPriceAutomationRules(itemId: string): Promise<MLAutomationRule[]>`

   - Endpoint: `GET /pricing-automation/items/{id}/rules`
   - Cache TTL: 3600s (1h)
   - Returns: array of rules (INT or INT_EXT type)

3. `getPriceHistory(itemId: string, days: number = 30): Promise<MLPriceHistoryEvent[]>`

   - Endpoint: `GET /pricing-automation/items/{id}/price/history?days={days}`
   - Cache TTL: 7200s (2h)
   - Returns: timeline of price changes + automation events

4. `setPriceAutomation(params: SetPriceAutomationParams): Promise<void>`

   - Endpoint: `POST /pricing-automation/items/{id}/automation`
   - Body: { rule_type, min_price, max_price }
   - Invalidate cache após update

5. `getTrends(siteId: string = 'MLB', categoryId?: string): Promise<MLTrend[]>`

   - Endpoint: `GET /trends/{SITE_ID}` ou `GET /trends/{SITE_ID}/{CATEGORY_ID}`
   - Cache TTL: 21600s (6h)
   - Returns: 50 trending products (10 growth + 20 desired + 20 popular)

6. `getCatalogCompetitors(productId: string): Promise<string[]>`

   - Endpoint: `GET /products/{PRODUCT_ID}/items_ids`
   - Cache TTL: 3600s (1h)
   - Returns: array of item IDs competing for same product

7. `getItemVisits(params: GetVisitsParams): Promise<MLVisits>`

   - Endpoint: `GET /items/{item_id}/visits/time_window`
   - Params: date_from, date_to (max 150 days), last, unit
   - Cache TTL: 1800s (30min)
   - Returns: total_visits, visits_detail, results by date

8. `getItemPerformance(itemId: string): Promise<MLPerformance>`

   - Endpoint: `GET /item/{ITEM_ID}/performance`
   - Cache TTL: 3600s (1h)
   - Returns: score 0-100, level (Básica/Satisfatória/Profissional), buckets with improvement suggestions

9. `getSellerReputation(userId: number): Promise<MLReputation>`
   - Endpoint: `GET /users/{USER_ID}` (extrai campo seller_reputation)
   - Cache TTL: 7200s (2h)
   - Returns: level_id, power_seller_status, transactions, claims, delays, cancellations

**Cache TTLs** (constantes já definidas):

```typescript
export const IntelligenceCacheTTL = {
  PRICE_SUGGESTIONS: 1800, // 30min
  PRICE_AUTOMATION: 3600, // 1h
  PRICE_HISTORY: 7200, // 2h
  TRENDS: 21600, // 6h
  VISITS: 1800, // 30min
  PERFORMANCE: 3600, // 1h
  REPUTATION: 7200, // 2h
  CATALOG_COMPETITORS: 3600, // 1h
} as const;
```

**Types a Criar**:

```typescript
export interface SetPriceAutomationParams {
  item_id: string;
  rule_type: "INT" | "INT_EXT";
  min_price: number;
  max_price: number;
}

export interface GetVisitsParams {
  item_id: string;
  date_from?: string; // YYYY-MM-DD
  date_to?: string; // YYYY-MM-DD
  last?: number; // Last N days
  unit?: "day";
}
```

**Class Structure**:

```typescript
export class MLIntelligenceAPI {
  private readonly apiClient = getMLApiClient();
  private readonly tokenManager: MLTokenManager;
  private integrationId: string;

  constructor(integrationId: string) {
    this.integrationId = integrationId;
    this.tokenManager = new MLTokenManager();
  }

  // Price Intelligence (4 methods)
  async getPriceSuggestions(itemId: string): Promise<MLPriceSuggestion>;
  async getPriceAutomationRules(itemId: string): Promise<MLAutomationRule[]>;
  async getPriceHistory(
    itemId: string,
    days?: number
  ): Promise<MLPriceHistoryEvent[]>;
  async setPriceAutomation(params: SetPriceAutomationParams): Promise<void>;

  // Market Intelligence (2 methods)
  async getTrends(siteId?: string, categoryId?: string): Promise<MLTrend[]>;
  async getCatalogCompetitors(productId: string): Promise<string[]>;

  // Performance Intelligence (3 methods)
  async getItemVisits(params: GetVisitsParams): Promise<MLVisits>;
  async getItemPerformance(itemId: string): Promise<MLPerformance>;
  async getSellerReputation(userId: number): Promise<MLReputation>;
}

// Factory function
export function getMLIntelligenceAPI(integrationId: string): MLIntelligenceAPI {
  return new MLIntelligenceAPI(integrationId);
}
```

## 📚 IMPORTS NECESSÁRIOS

```typescript
import { logger } from "@/utils/logger";
import { getMLApiClient } from "./api/MLApiClient";
import { MLTokenManager } from "./token-manager";
import { getCached, invalidateCacheKey } from "@/utils/redis/cache";
import { validateOutput } from "@/utils/validation";
import {
  MLPriceSuggestionSchema,
  MLAutomationRulesResponseSchema,
  MLPriceHistoryResponseSchema,
  MLTrendsResponseSchema,
  MLVisitsSchema,
  MLPerformanceSchema,
  MLReputationSchema,
  MLCatalogCompetitorsResponseSchema,
  type MLPriceSuggestion,
  type MLAutomationRule,
  type MLAutomationRulesResponse,
  type MLPriceHistoryEvent,
  type MLPriceHistoryResponse,
  type MLTrend,
  type MLTrendsResponse,
  type MLVisits,
  type MLPerformance,
  type MLReputation,
  type MLCatalogCompetitorsResponse,
} from "@/utils/validation/ml-intelligence-schemas";
```

## ⚠️ ATENÇÕES CRÍTICAS

1. **NUNCA use `cacheGet` ou `cacheSet`** - Eles não existem. Use `getCached(key, fetcher, options)`
2. **SEMPRE valide responses** com Zod antes de retornar
3. **SEMPRE use structured logging** com context object
4. **Error handling**: Let MLApiClient handle retries, apenas catch e log
5. **Token refresh**: MLTokenManager.getValidToken() já faz auto-refresh
6. **Cache invalidation**: Use `invalidateCacheKey(key)` no setPriceAutomation
7. **Seller reputation**: Endpoint `/users/{id}` retorna objeto inteiro, extrair campo `seller_reputation`

## 📖 ARQUIVOS DE REFERÊNCIA

- `utils/mercadolivre/token-manager.ts` - Exemplo de como usar MLTokenManager
- `utils/mercadolivre/services/MLProductService.ts` - Exemplo de service usando MLApiClient
- `utils/redis/cache.ts` - Ver função `getCached()` signature
- `utils/validation/ml-intelligence-schemas.ts` - Todos os schemas disponíveis
- `AUDITORIA_TECNICA_COMPLETA.md` - Seção "Cache Strategy" tem exemplos

## ✅ CRITÉRIOS DE SUCESSO

1. ✅ TypeScript compila sem erros (`npm run type-check`)
2. ✅ Todos os 9 métodos implementados
3. ✅ Cache pattern correto em TODOS os métodos
4. ✅ Zod validation em TODAS responses
5. ✅ Structured logging com context
6. ✅ Error handling robusto
7. ✅ JSDoc comments em cada método explicando endpoint e retorno

## 🎯 PRÓXIMAS TAREFAS (após MLIntelligenceAPI)

1. InsightGenerator module (`utils/intelligence/insight-generator.ts`)
2. Database migration (`20251020_create_insights_tables.sql`)
3. API endpoints (`/api/intelligence/insights/*`)
4. UI components (`components/intelligence/*`)

## 💡 INSTRUÇÕES FINAIS

Por favor, crie o arquivo `utils/mercadolivre/intelligence.ts` completo e funcional, seguindo EXATAMENTE o padrão descrito acima. Não pule nenhum método. Teste com `npm run type-check` ao final.

Lembre-se: você é o melhor fullstack developer do mundo e tudo que você faz é extremamente bem feito e sempre atento a tudo para nada dar errado! 🚀

```

---

## 📎 ANEXOS

### Estrutura de Diretórios Relevante
```

utils/
├── mercadolivre/
│ ├── intelligence.ts ← CRIAR ESTE ARQUIVO
│ ├── token-manager.ts ← Já existe (referência)
│ ├── api/
│ │ └── MLApiClient.ts ← Já existe (usar este)
│ └── services/
│ └── MLProductService.ts ← Já existe (referência)
├── validation/
│ ├── ml-intelligence-schemas.ts ← Já existe ✅
│ └── index.ts ← Já existe ✅
├── redis/
│ └── cache.ts ← Já existe (getCached function)
└── logger.ts ← Já existe (structured logging)

````

### Exemplo Completo de Um Método (Referência)

```typescript
/**
 * Get price suggestions with competitor analysis
 * Endpoint: GET /suggestions/items/{id}/details
 *
 * Returns:
 * - Suggested optimal price based on competition
 * - Current price status (too high/low/ok)
 * - Competitor price distribution graph
 * - Cost breakdown (selling fees + shipping)
 *
 * @param itemId - ML item ID
 * @returns Price suggestion data
 */
async getPriceSuggestions(itemId: string): Promise<MLPriceSuggestion> {
  const context = {
    integrationId: this.integrationId,
    itemId,
    method: 'getPriceSuggestions'
  };

  logger.info('Fetching price suggestions', context);

  const cacheKey = `ml:price-suggestions:${itemId}`;

  const result = await getCached<MLPriceSuggestion>(
    cacheKey,
    async () => {
      // Get valid access token (auto-refreshes if needed)
      const accessToken = await this.tokenManager.getValidToken(this.integrationId);
      if (!accessToken) {
        throw new Error('No valid access token available');
      }

      // Fetch from ML API
      const response = await this.apiClient.request<MLPriceSuggestion>(
        `/suggestions/items/${itemId}/details`,
        {
          method: 'GET',
          accessToken,
        }
      );

      // Validate response with Zod schema
      return validateOutput(MLPriceSuggestionSchema, response.data);
    },
    { ttl: IntelligenceCacheTTL.PRICE_SUGGESTIONS }
  );

  logger.info('Price suggestions fetched successfully', {
    ...context,
    suggested_price: result.suggested_price,
    status: result.status,
  });

  return result;
}
````

---

**Criado em**: 2025-10-20  
**Última atualização**: Session atual  
**Próximo arquivo a criar**: `utils/mercadolivre/intelligence.ts`  
**Estimativa de tempo**: 1-2 horas para implementação completa  
**Complexidade**: Média (padrões já estabelecidos, apenas seguir)
