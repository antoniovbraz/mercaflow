# 🎯 Estratégia Completa de Uso da API do Mercado Livre

**Data**: 10 de Outubro de 2025  
**Status**: Documento Estratégico Definitivo  
**Autor**: Tech Lead + Product Owner  
**Versão**: 2.0 (Atualizado com descobertas críticas)

---

## 📋 SUMÁRIO EXECUTIVO

Este documento define **como o MercaFlow utilizará a API do Mercado Livre** para atingir todos os objetivos de negócio. Após análise completa da documentação oficial, identificamos **APIs nativas que viabilizam features críticas** sem necessidade de cálculos externos complexos.

### 🎯 Descoberta Crítica
> **A ML possui APIs prontas para análise de preço competitivo, sugestões automáticas e histórico de preços que eliminam 60-70% do trabalho planejado originalmente.**

---

## 🗺️ MAPA COMPLETO DAS APIS DO MERCADO LIVRE

### ✅ **APIs Essenciais (Implementadas)**

#### 1. **Items API** - Produtos
**Status**: ✅ 100% Implementado  
**Arquivo**: `app/api/ml/items/route.ts`

```typescript
// Endpoints disponíveis:
GET /items/{item_id}                    // Detalhes produto
GET /users/{user_id}/items/search       // Listar produtos
POST /items                             // Criar produto
PUT /items/{item_id}                    // Atualizar produto
```

**Dados críticos disponíveis**:
- `sold_quantity`: Quantidade vendida (ESSENCIAL para elasticidade)
- `price`: Preço atual
- `available_quantity`: Estoque
- `title`, `category_id`, `pictures`: Metadados
- `status`: active/paused/closed
- `listing_type_id`: Tipo anúncio (free/bronze/gold)

**⚠️ Campos só disponíveis com token proprietário**:
```typescript
{
  "sold_quantity": 123,        // ⚠️ Só com seu token
  "channels": ["marketplace"], // ⚠️ Só com seu token
  "historical_start_time": "2021-03-19T19:23:37.000Z" // ⚠️ Só proprietário
}
```

---

#### 2. **Orders API** - Vendas
**Status**: ✅ 100% Implementado  
**Arquivo**: `app/api/ml/orders/route.ts`

```typescript
// Endpoints disponíveis:
GET /orders/{order_id}                              // Detalhes venda
GET /orders/search?seller={user_id}&order.status=paid  // Filtrar vendas
GET /orders/{order_id}/discounts                    // Descontos aplicados
```

**Dados críticos para IA**:
```typescript
{
  "id": "2000003508419013",
  "date_created": "2022-04-08T17:01:30.000-04:00",
  "date_closed": "2022-04-08T17:01:33.000-04:00",
  "order_items": [
    {
      "item": {
        "id": "MLB2608564035",
        "title": "Camiseta Basica"
      },
      "quantity": 1,
      "unit_price": 50,
      "sale_fee": 12           // Comissão ML
    }
  ],
  "payments": [...],
  "shipping": { "id": 41297142475 },
  "status": "paid",
  "tags": ["delivered", "fraud_risk_detected"]
}
```

**Filtros poderosos**:
- `order.date_created.from/to`: Período específico
- `order.date_closed.from/to`: Data fechamento
- `order.status`: paid/cancelled/etc
- `tags`: Filtrar por situações especiais

**Limites**: 
- Histórico de **12 meses** (precisamos armazenar no Supabase para longo prazo)

---

#### 3. **Questions API** - Perguntas
**Status**: ✅ Parcialmente Implementado  
**Arquivo**: `app/api/ml/questions/route.ts`

```typescript
GET /questions/search?seller_id={user_id}&item={item_id}
POST /answers                            // Responder pergunta
```

**Uso no MercaFlow**: Análise de dúvidas recorrentes → insights de produto

---

#### 4. **Webhooks** - Notificações em Tempo Real
**Status**: ✅ Implementado  
**Arquivo**: `app/api/ml/webhooks/route.ts`

```typescript
// Eventos disponíveis:
- items: Produto criado/atualizado/pausado
- orders: Nova venda/cancelamento
- questions: Nova pergunta/resposta
- messages: Nova mensagem pós-venda
```

**Uso atual**: Cache invalidation  
**Uso futuro**: Trigger recalcular elasticidade quando preço mudar

---

### 🚨 **APIs CRÍTICAS (NÃO IMPLEMENTADAS - PRIORIDADE P0)**

#### 5. **Metrics API** ⭐ **IMPLEMENTAR URGENTE**
**Status**: ❌ NÃO IMPLEMENTADO  
**Prioridade**: 🔴 P0 - CRÍTICO para elasticidade

```typescript
// Endpoints disponíveis:
GET /users/{user_id}/items_visits?date_from=X&date_to=Y
// Retorna: Visitas por item em período

GET /users/{user_id}/items_visits/time_window?last=30&unit=day
// Retorna: Visitas agrupadas por dia/hora

GET /items/{item_id}/visits/time_window?last=90&unit=day
// Retorna: Visitas de item específico

GET /users/{user_id}/contacts/questions?date_from=X&date_to=Y
// Retorna: Total de perguntas por período
```

**Por que é CRÍTICO**:
```typescript
// Elasticidade-Preço depende de VISITAS, não só vendas!
elasticidade = (ΔVendas / Vendas) / (ΔPreço / Preço)

// Mas precisamos também:
conversao = vendas / visitas  // Métrica chave!

// Se preço sobe:
// - Visitas mantêm? (elasticidade baixa, produto único)
// - Visitas caem? (elasticidade alta, produto commodity)
```

**Resposta típica**:
```typescript
{
  "user_id": 52366166,
  "date_from": "2024-10-01T00:00:00Z",
  "date_to": "2024-10-10T00:00:00Z",
  "total_visits": 4520,
  "visits_detail": [
    {
      "item_id": "MLB2608564035",
      "total": 1250,
      "details": [
        { "date": "2024-10-01", "visits": 120 },
        { "date": "2024-10-02", "visits": 135 }
      ]
    }
  ]
}
```

**Implementação necessária**:
```bash
1. Criar endpoint: app/api/ml/metrics/visits/route.ts
2. Criar tabela Supabase: ml_visits (item_id, date, visits, user_id)
3. Cronjob diário: sync últimos 90 dias
4. Usar em: cálculo elasticidade + conversão
```

**Tempo estimado**: 2-3 dias  
**Impacto**: Viabiliza 70% da inteligência econômica

---

#### 6. **Price Suggestions API** ⭐ **GAME CHANGER**
**Status**: ❌ NÃO IMPLEMENTADO  
**Prioridade**: 🟡 P1 - ALTO valor, mas não bloqueia MVP

```typescript
// Endpoint principal:
GET /suggestions/items/{item_id}/details
```

**O que retorna** (INCRÍVEL):
```typescript
{
  "item_id": "MLB2077308861",
  "status": "with_benchmark_highest",  // Posição vs concorrentes
  
  "current_price": {
    "amount": 150  // Seu preço atual
  },
  
  "suggested_price": {
    "amount": 127  // 🎯 PREÇO SUGERIDO PELA ML!
  },
  
  "lowest_price": {
    "amount": 120  // Menor preço concorrentes
  },
  
  "costs": {
    "selling_fees": 15.2,  // Comissão ML
    "shipping_fees": 8.5   // Frete estimado
  },
  
  "percent_difference": 18,  // % acima do sugerido
  
  "metadata": {
    "graph": [  // 🔥 DADOS DOS CONCORRENTES!
      {
        "price": { "amount": 120 },
        "info": {
          "title": "Produto Concorrente A",
          "sold_quantity": 450  // 🔥 Vendas do concorrente!
        }
      },
      {
        "price": { "amount": 127 },
        "info": {
          "title": "Produto Concorrente B",
          "sold_quantity": 380
        }
      }
      // ... até 15-20 concorrentes
    ],
    "compared_values": 18  // Quantos produtos analisou
  },
  
  "last_updated": "10-10-2024 15:30:00"
}
```

**Status possíveis**:
- `with_benchmark_highest`: 🔴 Você está MUITO CARO (perdendo vendas!)
- `with_benchmark_high`: 🟡 Você está CARO
- `no_benchmark_ok`: 🟢 Preço COMPETITIVO
- `no_benchmark_lowest`: 🔵 Você está BARATO (perdendo margem?)

**Como usar no MercaFlow**:
```typescript
// 1. Análise de Concorrência PRONTA
GET /suggestions/items/{item_id}/details
→ metadata.graph[] = Lista de 15-20 concorrentes com preços + vendas

// Insight automático:
"Você está R$23 acima dos 3 principais concorrentes:
 - Produto A: R$120 (450 vendas)
 - Produto B: R$127 (380 vendas)
 - Produto C: R$135 (210 vendas)"

// 2. Recomendação Inteligente
preço_mercaflow = combinar(
  ml_suggested_price,    // Benchmark mercado (ML calculou)
  nossa_elasticidade,    // Histórico próprio
  margem_minima         // Custo + lucro
)

// 3. Alertas Automáticos
if (status === 'with_benchmark_highest') {
  notificar("Preço 18% acima mercado. Risco de perder vendas!")
}
```

**Implementação necessária**:
```bash
1. Criar endpoint: app/api/ml/price-suggestions/[itemId]/route.ts
2. Criar tabela: ml_price_suggestions (histórico sugestões)
3. Dashboard card: "Análise de Competitividade"
4. Integrar com: recomendações de preço
```

**Tempo estimado**: 2-3 dias  
**Impacto**: Elimina necessidade de scraping de concorrentes!

---

#### 7. **Pricing Automation API** ⭐ **AUTOMAÇÃO TOTAL**
**Status**: ❌ NÃO IMPLEMENTADO  
**Prioridade**: 🟢 P2 - Feature premium futura

```typescript
// Consultar regras disponíveis:
GET /pricing-automation/items/{item_id}/rules

// Ativar automatização:
POST /pricing-automation/items/{item_id}/automation
{
  "rule_id": "INT_EXT",  // Concorrência interna + externa
  "min_price": 100,      // Nunca vender abaixo
  "max_price": 200       // Nunca vender acima
}

// Histórico de mudanças:
GET /pricing-automation/items/{item_id}/price/history?days=30
```

**Regras disponíveis**:
- `INT`: Melhor preço dentro do ML
- `INT_EXT`: Melhor preço dentro E FORA do ML (analisa toda internet!)

**Resposta histórico**:
```typescript
{
  "result": {
    "content": [
      {
        "date_time": "2024-10-08T15:26:15Z",
        "price": 127,
        "percent_change": -8,        // Caiu 8%
        "event": "PriceAdjusted",    // Ajuste automático
        "strategy_type": "automation_competitive"
      }
    ],
    "total_elements": 89  // 89 mudanças rastreadas!
  }
}
```

**Uso no MercaFlow** (Feature Premium):
```typescript
// Usuário ativa:
1. Define min_price e max_price
2. ML ajusta automaticamente para competir
3. MercaFlow monitora e alerta sobre mudanças

// Alertas:
"ML ajustou seu preço de R$150 → R$127 (-15%) para competir.
 Margem mantida em 23%. Vendas projetadas: +40%."
```

**Tempo estimado**: 3-4 dias  
**Impacto**: Feature diferenciada para plano Pro

---

### ❌ **APIs Não Disponíveis (Workarounds Necessários)**

#### 8. **Histórico de Preços Próprio**
**Problema**: ML não guarda histórico de mudanças de preço  
**Solução**: Rastrear via webhook + Supabase

```typescript
// Webhook items → detectar mudança de preço
webhook_handler() {
  if (old_price !== new_price) {
    supabase.from('ml_price_history').insert({
      item_id,
      old_price,
      new_price,
      changed_at: new Date()
    })
  }
}
```

**Tabela necessária**:
```sql
CREATE TABLE ml_price_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  item_id TEXT NOT NULL,
  old_price DECIMAL(10,2),
  new_price DECIMAL(10,2),
  changed_at TIMESTAMPTZ DEFAULT NOW(),
  change_reason TEXT  -- manual/automation/suggestion
);
```

**Tempo estimado**: 1 dia  
**Prioridade**: 🔴 P0 - Essencial para elasticidade

---

#### 9. **Trends API Pública**
**Problema**: Endpoint de tendências não funcional/restrito  
**Solução**: Análise interna dos nossos sellers

```typescript
// Agregação própria:
SELECT 
  category_id,
  AVG(sold_quantity) as avg_sales,
  STDDEV(sold_quantity) as volatility,
  DATE_TRUNC('month', date) as period
FROM ml_items
GROUP BY category_id, period
ORDER BY avg_sales DESC
```

**Insights gerados**:
- Categorias em crescimento
- Produtos trending
- Sazonalidade por categoria

**Tempo estimado**: 2-3 dias (Fase 3)  
**Prioridade**: 🟢 P3 - Nice to have

---

## 🎯 ESTRATÉGIA DE IMPLEMENTAÇÃO

### 📅 **Fase 1: Fundação (Semanas 1-2)** ✅ COMPLETO
- ✅ Items API
- ✅ Orders API
- ✅ Questions API (básico)
- ✅ Webhooks
- ✅ OAuth 2.0 + Token Management

---

### 📅 **Fase 2: Inteligência Econômica (Semanas 3-5)** 

#### **Semana 3: Metrics API + Histórico Preços** 🔴 CRÍTICO
```bash
Day 1-2: Implementar Metrics API
  - Endpoint: /api/ml/metrics/visits
  - Tabela: ml_visits
  - Sync diário últimos 90 dias

Day 3: Implementar rastreamento de preços
  - Webhook handler para mudança preço
  - Tabela: ml_price_history
  - Validar 100% capturas

Day 4-5: Dashboard Métricas
  - Card "Visitas vs Vendas"
  - Gráfico conversão
  - Tendências 7/30/90 dias
```

#### **Semana 4: Price Suggestions API** 🟡 ALTO VALOR
```bash
Day 1-2: Integrar Suggestions API
  - Endpoint: /api/ml/price-suggestions/[itemId]
  - Tabela: ml_price_suggestions (histórico)
  - Cache 1 hora (sugestões mudam pouco)

Day 3-4: Dashboard Competitividade
  - Card "Análise de Preço"
  - Status vs concorrentes
  - Top 5 concorrentes (preço + vendas)
  - Alertas automáticos (preço alto/baixo)

Day 5: Integração com Recomendações
  - Combinar: ML suggestion + nossa elasticidade
  - Algoritmo híbrido de precificação
```

#### **Semana 5: Elasticidade-Preço COMPLETA** 🔴 CORE VALUE
```bash
Day 1-2: Algoritmo Elasticidade
  - Input: ml_price_history + orders + visits
  - Cálculo: ΔQ% / ΔP% (com visitas!)
  - Classificação: elástico/unitário/inelástico

Day 3-4: UI/UX Elasticidade
  - Gráfico: Preço × Vendas × Visitas
  - Curva de demanda
  - Simulador: "E se preço = R$X?"
  - Recomendação clara com impacto

Day 5: Validação com sellers
  - 3-5 sellers testando
  - Validar acurácia vs expectativa
  - Ajustar algoritmo se necessário
```

**✅ Resultado Fase 2**: Inteligência econômica funcional baseada em dados reais ML!

---

### 📅 **Fase 3: ML Avançado (Semanas 6-8)**

#### **Semana 6: Previsão de Demanda**
```bash
Algoritmo:
- Input: orders + visits (últimos 6-12 meses)
- Modelo: Prophet (Facebook) ou ARIMA
- Output: Previsão 30/60/90 dias + intervalo confiança

UI:
- Gráfico temporal com previsão
- Alertas: "Demanda vai cair 30% em novembro"
```

#### **Semana 7: Detecção de Anomalias**
```bash
Algoritmo:
- Baseline: Média móvel 7/30 dias
- Z-score: Desvios padrão
- Triggers: |Z| > 2 = anomalia

Alertas:
"Vendas caíram 40% vs média 7 dias.
 Possíveis causas:
 - Concorrente baixou preço (verificar Suggestions API)
 - Estoque acabou
 - Foto/título mudou"
```

#### **Semana 8: Sistema de Alertas Inteligente**
```bash
Regras:
1. Preço fora do mercado (Suggestions API)
2. Vendas anormais (Anomaly Detection)
3. Estoque baixo (< 5 unidades)
4. Nova pergunta/pedido (real-time)
5. Oportunidade preço (elasticidade favorável)

Canais:
- In-app (central notificações)
- Email (Resend.com)
- WhatsApp (Twilio - opcional)
```

**✅ Resultado Fase 3**: ML predictions operacional

---

### 📅 **Fase 4: Features Premium (Semanas 9-12)**

#### **Semana 9-10: Website Builder**
```bash
Auto-geração de site:
- Input: Items API (produtos ML)
- Templates: 3 opções (clean/moderno/vibrante)
- SEO: Meta tags automáticas
- Deploy: Vercel API (30 segundos)
- Sync: Webhook items → rebuild incremental
```

#### **Semana 11: Sazonalidade Brasileira**
```bash
Calendário eventos:
- Janeiro: Volta às aulas
- Fevereiro: Carnaval
- Maio: Dia das Mães (+180%)
- Junho: Dia dos Namorados
- Novembro: Black Friday (+220%)
- Dezembro: Natal

Recomendações:
"Dia das Mães em 4 semanas.
 Ações: Aumentar estoque 180%, subir preço 8%."
```

#### **Semana 12: Pricing Automation (Premium)**
```bash
Feature Plano Pro:
- Integração Pricing Automation API
- Usuário define min/max price
- ML ajusta automaticamente
- MercaFlow monitora + alerta mudanças
```

**✅ Resultado Fase 4**: Plano Pro diferenciado

---

## 📊 MATRIZ DE CAPACIDADES: ML API vs MercaFlow Features

| Feature MercaFlow | ML API Necessária | Status API | Status Implementação | Prioridade | Tempo |
|---|---|---|---|---|---|
| **Listar Produtos** | Items API | ✅ Disponível | ✅ Implementado | P0 | - |
| **Histórico Vendas** | Orders API | ✅ Disponível | ✅ Implementado | P0 | - |
| **Visitas por Produto** | Metrics API | ✅ Disponível | ❌ Não implementado | P0 | 2d |
| **Histórico Preços** | Webhook + Storage | ⚠️ Workaround | ❌ Não implementado | P0 | 1d |
| **Elasticidade-Preço** | Metrics + Orders + História | ✅ Viável | ❌ Aguarda Metrics | P0 | 5d |
| **Análise Concorrência** | Suggestions API | ✅ Disponível | ❌ Não implementado | P1 | 3d |
| **Sugestão Preço** | Suggestions API | ✅ Disponível | ❌ Não implementado | P1 | 2d |
| **Margem Ótima** | Orders + Custo (input) | ✅ Viável | ❌ Aguarda Orders | P1 | 3d |
| **Previsão Demanda** | Orders + Metrics (histórico) | ✅ Viável | ❌ Aguarda dados | P1 | 7d |
| **Detecção Anomalias** | Orders + Metrics | ✅ Viável | ❌ Aguarda dados | P2 | 5d |
| **Alertas Inteligentes** | Todas acima | ✅ Viável | ❌ Aguarda features | P2 | 7d |
| **Website Auto-Gen** | Items API | ✅ Disponível | ❌ Não implementado | P2 | 11d |
| **Sazonalidade BR** | Orders (histórico próprio) | ✅ Viável | ❌ Não implementado | P2 | 10d |
| **Pricing Automation** | Automation API | ✅ Disponível | ❌ Não implementado | P3 | 4d |

**Legenda**:
- 🔴 P0: Crítico para MVP (bloqueia features core)
- 🟡 P1: Alto valor (diferencial competitivo)
- 🟢 P2: Importante (crescimento)
- 🔵 P3: Premium (monetização)

---

## ⚡ PRÓXIMAS AÇÕES IMEDIATAS

### 🔴 Esta Semana (Crítico)
1. ✅ **Documentar estratégia completa** (este documento)
2. 🔄 **Implementar Metrics API** (2 dias)
   - Endpoint `/api/ml/metrics/visits`
   - Tabela `ml_visits`
   - Sync diário
3. 🔄 **Implementar rastreamento preços** (1 dia)
   - Webhook handler
   - Tabela `ml_price_history`

### 🟡 Próxima Semana
4. **Implementar Suggestions API** (3 dias)
   - Endpoint `/api/ml/price-suggestions/[itemId]`
   - Dashboard competitividade
5. **Algoritmo Elasticidade COMPLETO** (5 dias)
   - Integrar: preços + vendas + visitas
   - UI com simulador

### 🟢 Próximas 2 Semanas
6. **Previsão de Demanda** (7 dias)
7. **Sistema de Alertas** (7 dias)

---

## 🎯 KPIs DE SUCESSO

### Técnicos
- ✅ 100% APIs críticas integradas (Items, Orders, Metrics, Suggestions)
- ✅ < 2s response time médio
- ✅ 99% uptime
- ✅ Zero erros de sincronização

### Negócio
- 🎯 70% sellers usam elasticidade semanalmente
- 🎯 85% sellers acham recomendações úteis
- 🎯 40% sellers mudam preço baseado em sugestões
- 🎯 NPS > 50 na feature de inteligência de preço

### Impacto no Seller
- 📈 +15% vendas (em média) após ajuste de preço
- 📈 +10% margem (otimização baseada em elasticidade)
- ⏱️ -80% tempo gasto em análise manual
- 🎯 95% confiança nas recomendações

---

## 📚 REFERÊNCIAS

### Documentação Oficial ML
- [Items API](https://developers.mercadolivre.com.br/pt_br/publicacao-de-produtos)
- [Orders API](https://developers.mercadolivre.com.br/pt_br/gerenciamento-de-vendas)
- [Metrics API](https://developers.mercadolivre.com.br/pt_br/metricas)
- [Price Suggestions API](https://developers.mercadolivre.com.br/pt_br/referencias-de-precos)
- [Pricing Automation API](https://developers.mercadolivre.com.br/pt_br/automatizacoes-de-precos)
- [Webhooks](https://developers.mercadolivre.com.br/pt_br/produto-receba-notificacoes)

### Documentação Interna
- [VISAO_PRODUTO_CORRETA.md](../../VISAO_PRODUTO_CORRETA.md)
- [ROADMAP_EXECUTIVO_90DIAS.md](../../ROADMAP_EXECUTIVO_90DIAS.md)
- [INTEGRACAO_ML_COMPLETA.md](../../INTEGRACAO_ML_COMPLETA.md)

---

**Última Atualização**: 10 de Outubro de 2025  
**Revisão**: Tech Lead + PO  
**Próxima Revisão**: Após Semana 3 (validar Metrics API)
