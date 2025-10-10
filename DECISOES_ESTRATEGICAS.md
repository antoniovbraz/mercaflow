# 🎯 MercaFlow - Decisões Estratégicas e Arquitetura

**Data**: 10 de Outubro de 2025  
**Status**: Definição Final do Produto  
**Objetivo**: Documento de referência para todas as decisões de produto e arquitetura

---

## 📊 VISÃO DO PRODUTO (FINAL)

### O Que É o MercaFlow?
**Plataforma de Inteligência Estratégica + Presença Digital** para vendedores de marketplace brasileiros.

**NÃO somos**: ERP completo, sistema de gestão operacional  
**SOMOS**: Camada de inteligência que faz o vendedor vender **mais** e **melhor**

### Tagline
> "Venda Mais Inteligente. Ganhe Seu Site de Graça."

### Elevator Pitch
> "MercaFlow usa **economia + machine learning** para te dizer QUANDO vender, POR QUANTO vender e COMO se destacar. Monitora seu estoque, prevê rupturas e gera seu **site vitrine profissional** automaticamente. Você vende, seu ERP gerencia, MercaFlow te dá inteligência."

---

## 🔍 DECISÕES ESTRATÉGICAS CRÍTICAS

### 1. ⚠️ ESTOQUE: Monitorar, NUNCA Gerenciar

#### Decisão
**MercaFlow NÃO gerencia estoque operacionalmente.**

#### Razões
1. **Risco de mal uso**: Vendedor muda no MercaFlow mas esquece de atualizar no ERP ou marketplace
2. **Múltiplas fontes de verdade**: ERP (fonte real) ≠ Marketplace (sincronizado) ≠ MercaFlow
3. **Responsabilidade**: Estoque errado = venda sem produto = nota baixa no marketplace
4. **Complexidade**: Sincronização 3-way é bug-prone e custosa
5. **Não é nosso core**: Nosso valor é **inteligência**, não operação

#### O Que MercaFlow FAZ com Estoque

| Operação | Status | Descrição |
|---|---|---|
| ✅ **Monitorar** | Core | Lê estoque via API (sync 1h) |
| ✅ **Alertar** | Core | "3 unidades restantes, histórico mostra 15 vendas/semana" |
| ✅ **Prever ruptura** | Core | "Estoque acaba em 2 dias, próxima entrega em 7 = ⚠️ 5 dias sem vender" |
| ✅ **Sugerir compra** | Core | "Com base em sazonalidade, compre 80 unidades até 15/Nov" |
| ✅ **Analisar giro** | Core | "Produto Y parado há 90 dias, considere promoção" |
| ✅ **Detectar sazonalidade** | Core | "Maio vende +180%, prepare estoque em Abril" |
| ❌ **Atualizar estoque** | Nunca | Cliente atualiza no ERP/Marketplace |
| ❌ **Movimentar estoque** | Nunca | Cliente gerencia entradas/saídas |

#### Arquitetura Técnica

```typescript
// Tabela: inventory_history (read-only)
{
  id: uuid,
  listing_id: uuid,              // FK para listings (anúncios)
  stock_level: integer,          // Snapshot do estoque
  synced_from: enum,             // 'mercado_livre', 'shopee', etc.
  synced_at: timestamp,          // Quando foi lido
  tenant_id: uuid
}

// Tabela: stock_alerts (gerados automaticamente)
{
  id: uuid,
  listing_id: uuid,
  alert_type: enum,              // 'low_stock', 'out_of_stock', 'slow_moving', 'rupture_risk'
  severity: enum,                // 'critical', 'warning', 'info'
  message: string,               // "Estoque crítico: 2 unidades restantes"
  recommendation: string,        // "Compre 50 unidades até 15/Out"
  impact: jsonb,                 // { lost_sales: 2800, lost_revenue: 'R$12k' }
  acknowledged: boolean,         // Vendedor viu o alerta?
  created_at: timestamp
}
```

#### UX de Estoque

```
Dashboard - Aba "Estoque Inteligente"

📊 Status Geral
  ✅ 45 produtos com estoque saudável
  ⚠️ 8 produtos em alerta de baixo estoque
  🔴 2 produtos em risco de ruptura

🔔 Alertas Ativos (10)
  
  🔴 CRÍTICO - Nike Air Max (SKU-001)
     Estoque: 2 unidades
     Média vendas: 12 un/semana
     Ruptura prevista: 18/Out (2 dias)
     Impacto: -R$2.8k em vendas perdidas
     
     💡 Recomendação:
        Compre 50 unidades até 15/Out
        Custo: R$2.5k | ROI: R$9.8k
     
     [Ver Histórico] [Marcar como Visto]
  
  ⚠️ AVISO - Tênis Adidas (SKU-012)
     Estoque: 8 unidades
     Média vendas: 5 un/semana
     Ruptura prevista: 25/Out (8 dias)
     
     💡 Recomendação:
        Compre 30 unidades até 20/Out
     
     [Ver Detalhes]

📈 Sazonalidade
  Novembro é pico de vendas (+180% vs. média)
  Black Friday: 24/Nov
  
  Produtos para reforçar estoque:
  - SKU-001: Compre 150 un (vs. 50 usual)
  - SKU-003: Compre 200 un (vs. 80 usual)
  
  Investimento total: R$28k
  ROI esperado: R$94k (Black Friday)
```

#### Filosofia
> "Seu ERP/Marketplace gerencia o estoque. MercaFlow te avisa ANTES de ter problema."

---

### 2. 📦 PRODUTO vs. ANÚNCIO: Modelagem Correta

#### Conceitos

**Produto (SKU interno)**:
- Item físico único que o vendedor vende
- Tem custo, categoria, nome interno
- É a "fonte de verdade" do negócio

**Anúncio (Listing)**:
- Publicação de um produto em marketplace específico
- Tem título (marketing), preço, fotos, descrição
- 1 produto pode ter N anúncios (ML, Shopee, Amazon)

#### Relação
```
1 Produto → N Anúncios
1 Anúncio → 1 Produto (sempre)

Exemplo:
  Produto: Nike Air Max (SKU-001)
    ├─ Anúncio ML: "Tênis Nike Air Max Preto Original" (R$450)
    ├─ Anúncio Shopee: "Nike Air Max Masculino Confortável" (R$430)
    └─ Anúncio Amazon: "Nike Air Max Original Importado USA" (R$470)
```

#### Arquitetura Técnica

```typescript
// Tabela: products (fonte de verdade)
{
  id: uuid,
  tenant_id: uuid,
  
  // Identificação interna
  sku: string,                   // SKU único do vendedor
  name: string,                  // Nome interno
  description: text,             // Descrição interna
  
  // Financeiro
  cost: decimal,                 // Custo de aquisição
  target_margin: decimal,        // Margem desejada (%)
  
  // Categorização
  category: string,              // Categoria interna
  brand: string,                 // Marca
  tags: string[],                // Tags para busca
  
  // Físico
  weight: decimal,               // Peso (kg)
  dimensions: jsonb,             // { length, width, height } cm
  
  // Controle
  active: boolean,               // Ativo no catálogo?
  created_at: timestamp,
  updated_at: timestamp
}

// Tabela: listings (anúncios em marketplaces)
{
  id: uuid,
  tenant_id: uuid,
  product_id: uuid,              // FK -> products
  
  // Marketplace
  marketplace: enum,             // 'mercado_livre', 'shopee', 'amazon'
  marketplace_listing_id: string, // ID no marketplace (ex: MLB123456)
  
  // Conteúdo do anúncio
  title: string,                 // Título público
  description: text,             // Descrição pública
  images: string[],              // URLs das fotos
  permalink: string,             // URL pública
  
  // Precificação
  price: decimal,                // Preço de venda
  original_price: decimal,       // Preço original (para promoções)
  
  // Estoque (read-only, sync da API)
  stock: integer,                // Unidades disponíveis
  sold_quantity: integer,        // Total vendido
  
  // Status
  status: enum,                  // 'active', 'paused', 'closed', 'under_review'
  health: enum,                  // 'good', 'warning', 'poor' (qualidade do anúncio)
  
  // Métricas
  views: integer,                // Visualizações
  visits: integer,               // Visitas (cliques)
  conversion_rate: decimal,      // Taxa de conversão
  
  // Sync
  sync_status: enum,             // 'synced', 'pending', 'error'
  last_sync_at: timestamp,
  sync_error: text,
  raw_data: jsonb,               // Dados completos da API
  
  created_at: timestamp,
  updated_at: timestamp
}

// Índices importantes
CREATE INDEX idx_listings_product ON listings(product_id);
CREATE INDEX idx_listings_marketplace ON listings(marketplace, marketplace_listing_id);
CREATE INDEX idx_listings_tenant ON listings(tenant_id, status);
```

#### UX Multi-Canal

```
Dashboard - Produtos

┌─────────────────────────────────────────────────┐
│ 📦 Nike Air Max (SKU-001)                       │
│ Custo: R$250 | Margem alvo: 40%                 │
│                                                  │
│ Anúncios Ativos (3):                            │
│                                                  │
│ 📢 Mercado Livre                                │
│    "Tênis Nike Air Max Preto Original"          │
│    💰 R$450 | 📦 12 un | 👁️ 450 views/sem       │
│    📊 Conversão: 3.8% | Vendas: 45/mês          │
│    [Ver no ML] [Analytics]                      │
│                                                  │
│ 📢 Shopee                                        │
│    "Nike Air Max Masculino Confortável"         │
│    💰 R$430 | 📦 8 un | 👁️ 280 views/sem        │
│    📊 Conversão: 2.9% | Vendas: 28/mês          │
│    [Ver na Shopee] [Analytics]                  │
│                                                  │
│ 📢 Amazon BR                                     │
│    "Nike Air Max Original Importado"            │
│    💰 R$470 | 📦 5 un | 👁️ 120 views/sem        │
│    📊 Conversão: 4.2% | Vendas: 12/mês          │
│    [Ver na Amazon] [Analytics]                  │
│                                                  │
│ 📊 Performance Consolidada                      │
│    Total vendas: 85 un/mês (R$38.2k)           │
│    Estoque total: 25 un (todos canais)         │
│    Margem média: 42% (acima da meta)           │
│    Melhor canal: ML (conversão + volume)       │
│                                                  │
│ 💡 Insights                                      │
│    • Amazon cobra mais caro mas converte melhor │
│    • Shopee tem preço baixo, aumente para R$445│
│    • ML é dominante, foque marketing lá         │
│                                                  │
└─────────────────────────────────────────────────┘
```

#### Análise Cross-Channel

```typescript
// Endpoint: /api/products/{id}/cross-channel-analysis
{
  product: {
    id: "uuid",
    sku: "SKU-001",
    name: "Nike Air Max",
    cost: 250,
    target_margin: 0.40
  },
  
  listings: [
    {
      marketplace: "mercado_livre",
      price: 450,
      stock: 12,
      monthly_sales: 45,
      conversion_rate: 0.038,
      revenue: 20250,
      margin: 0.44,
      marketplace_fee: 0.16,
      net_profit: 8100
    },
    {
      marketplace: "shopee",
      price: 430,
      stock: 8,
      monthly_sales: 28,
      conversion_rate: 0.029,
      revenue: 12040,
      margin: 0.42,
      marketplace_fee: 0.12,
      net_profit: 5800
    },
    {
      marketplace: "amazon",
      price: 470,
      stock: 5,
      monthly_sales: 12,
      conversion_rate: 0.042,
      revenue: 5640,
      margin: 0.47,
      marketplace_fee: 0.15,
      net_profit: 2650
    }
  ],
  
  insights: [
    {
      type: "pricing_opportunity",
      message: "Shopee está 4.4% abaixo da média. Aumente para R$445.",
      impact: "+R$420/mês sem perder vendas"
    },
    {
      type: "channel_focus",
      message: "Mercado Livre domina (53% do volume). Foque ads lá.",
      impact: "ROI de ads 3.2x maior que outros canais"
    },
    {
      type: "stock_allocation",
      message: "Amazon converte melhor mas tem menos estoque. Rebalance.",
      impact: "+R$1.2k/mês movendo 5 un de Shopee para Amazon"
    }
  ],
  
  recommendations: [
    "Uniformize preços em torno de R$450 (otimiza margem global)",
    "Aumente estoque Amazon para 10 un (melhor conversão)",
    "Reduza preço ML para R$440 na Black Friday (elasticidade -1.8)"
  ]
}
```

#### Benefícios da Modelagem

1. **Visão Consolidada**: Ver performance do produto em todos canais
2. **Arbitragem de Preço**: Identificar oportunidades entre marketplaces
3. **Alocação de Estoque**: Onde colocar unidades para maximizar lucro
4. **Analytics Precisos**: Elasticidade, margem, conversão por canal
5. **Escalabilidade**: Adicionar novos marketplaces sem refatoração

---

### 3. 🎯 ESTRATÉGIA DE MARKETPLACES: Foco Gradual

#### Filosofia
> "Specialist first, generalist later. Mercado Livre perfeito > 3 marketplaces medíocres."

#### Roadmap de Integração

##### **MVP: Mercado Livre APENAS** (Mês 1-3)

**Por quê ML primeiro?**
- 🥇 Maior marketplace do Brasil (60%+ market share e-commerce)
- 📚 API madura e bem documentada
- 👥 Base de vendedores estabelecida
- 💰 Ticket médio mais alto
- 🔒 Menos fraudes que outros marketplaces

**Features no MVP**:
- ✅ OAuth 2.0 completo
- ✅ Sync de produtos/pedidos
- ✅ Webhooks (23 topics)
- ✅ Analytics de produtos
- ✅ Inteligência de preços (elasticidade, margem)
- ✅ Site vitrine auto-gerado
- ✅ Monitoramento de estoque
- ✅ Previsão de demanda

**Critérios para Fase 2**:
- ✅ 100+ usuários pagos ativos
- ✅ Churn < 5%/mês
- ✅ NPS > 50
- ✅ MRR > R$20k/mês

---

##### **Fase 2: Shopee** (Mês 4-6)

**Por quê Shopee em segundo?**
- 🚀 Crescimento rápido no Brasil (2º maior)
- 💸 Taxas menores (bom para vendedores iniciantes)
- 🎯 Público diferente (classe C/D)
- 🔄 Muitos vendedores começam lá e migram para ML

**Features adicionais**:
- ✅ Integração Shopee API
- ✅ Dashboard multi-canal (produto em ML + Shopee)
- ✅ Análise cross-channel
- ✅ Arbitragem de preços
- ✅ Alocação inteligente de estoque

**Critérios para Fase 3**:
- ✅ 500+ usuários pagos ativos
- ✅ 30%+ dos usuários usam 2+ marketplaces
- ✅ MRR > R$100k/mês

---

##### **Fase 3: Amazon BR** (Mês 7+ - Se houver demanda)

**Por quê Amazon por último?**
- 🏢 Foco em marcas/produtos importados
- 💰 Taxas mais altas
- 🔒 Critérios de entrada mais rigorosos
- 📉 Menor adoção entre vendedores brasileiros pequenos/médios

**Avaliar antes de implementar**:
- Quantos % dos clientes pedem Amazon?
- Perfil dos clientes que vendem lá
- ROI de desenvolvimento vs. demanda real

---

##### **Fase 4: Outros** (Só se tracionar MUITO)

Possíveis:
- Magalu (Marketplace do Magazine Luiza)
- Via (antigo B2W - Americanas, Submarino)
- Shopify (loja própria)

**Critério**: Demanda real de 20%+ da base de clientes

---

#### Arquitetura Preparada

```typescript
// Enum já preparado para expansão
enum Marketplace {
  MERCADO_LIVRE = 'mercado_livre',  // MVP
  SHOPEE = 'shopee',                 // Fase 2
  AMAZON_BR = 'amazon',              // Fase 3 (se tracionar)
  MAGALU = 'magalu',                 // Futuro
  VIA = 'via',                       // Futuro
  SHOPIFY = 'shopify'                // Futuro (loja própria)
}

// Tabela listings já aceita qualquer marketplace
// Adicionar novo = apenas implementar API adapter
```

#### Vantagens da Estratégia Gradual

1. **Foco**: Aperfeiçoar ML antes de escalar
2. **Validação**: Aprender com usuários reais
3. **Marketing**: "Melhor para Mercado Livre" (posicionamento claro)
4. **Eficiência**: Evita trabalho desnecessário
5. **Financeiro**: ROI mais rápido (1 API bem feita > 3 medíocres)
6. **Flexibilidade**: Pode pivotar se ML não tracionar

---

## 📊 ROADMAP REVISADO (Com Decisões Aplicadas)

### Sprint 1-2 (Semanas 1-2): Fundação
- [ ] Limpar debug endpoints
- [ ] Logging estruturado
- [ ] Error handling global
- [ ] Cache de dashboard
- [ ] Limpar arquivos SQL

---

### Sprint 3-5 (Semanas 3-5): Inteligência Econômica
- [ ] **Elasticidade-preço** (algoritmo + UI)
- [ ] **Margem ótima** calculator
- [ ] **Sazonalidade brasileira** (feriados, eventos)
- [ ] **Ponto de equilíbrio** (break-even analysis)

---

### Sprint 6-8 (Semanas 6-8): Machine Learning
- [ ] **Previsão de demanda** (Prophet/ARIMA)
- [ ] **Detecção de anomalias** (Isolation Forest)
- [ ] **Recomendação dinâmica de preço** (MAB)
- [ ] **Alertas inteligentes** (Slack/Email/WhatsApp)

---

### Sprint 9-11 (Semanas 9-11): Estoque Inteligente
- [ ] **Monitoramento de estoque** (leitura via API)
- [ ] **Alertas de ruptura** (previsão + impacto)
- [ ] **Sugestão de compra por sazonalidade**
- [ ] **Análise de produtos parados** (slow-moving)
- [ ] **Dashboard de estoque** (visualização + insights)

---

### Sprint 12-15 (Semanas 12-15): Site Vitrine
- [ ] **Geração automática** (3 templates profissionais)
- [ ] **SEO otimizado** (meta tags, sitemap, rich snippets)
- [ ] **Analytics integrado** (Google Analytics + Pixel)
- [ ] **Domínio personalizado** (integração fácil)
- [ ] **Performance** (Lighthouse 85+)

---

### Sprint 16-18 (Semanas 16-18): Multi-Produto (Produto vs. Anúncio)
- [ ] **Modelagem**: Tabelas `products` + `listings`
- [ ] **Dashboard consolidado**: Ver produto em todos marketplaces
- [ ] **Análise cross-channel**: Comparar performance por canal
- [ ] **Arbitragem de preços**: Detectar oportunidades
- [ ] **Alocação de estoque**: Sugerir onde colocar unidades

---

### Sprint 19+ (Mês 5+): Shopee Integration
**Só se tracionar com ML (100+ usuários pagos)**

- [ ] OAuth Shopee
- [ ] Sync produtos/pedidos Shopee
- [ ] Multi-canal: ML + Shopee simultâneo
- [ ] Insights cross-channel

---

## 🎯 DECISÕES DE PRODUTO (Checklist)

### O Que NÃO Fazer (Nunca)
- ❌ **Gerenciar estoque** (atualizar, movimentar)
- ❌ **Emitir nota fiscal** (deixar para ERP)
- ❌ **Processar pagamentos** (marketplace faz isso)
- ❌ **Responder perguntas** (operacional demais)
- ❌ **Gestão de pedidos completa** (ERP faz melhor)
- ❌ **Virar ERP** (competir com Bling/Tiny)

### O Que Fazer (Core Value)
- ✅ **Inteligência econômica** (elasticidade, margem, sazonalidade)
- ✅ **Machine Learning** (previsão, anomalias, recomendações)
- ✅ **Monitorar estoque** (ler + alertar + prever)
- ✅ **Site vitrine** (auto-gerado, SEO, conversão)
- ✅ **Análise multi-canal** (produto em vários marketplaces)
- ✅ **Insights acionáveis** (sempre com ação + impacto financeiro)

---

## 🚀 PRÓXIMA AÇÃO

**Esta Semana**:
1. Limpar código (debug endpoints, logs, SQL files)
2. Implementar logging estruturado
3. Criar error handling global

**Próximas 2 Semanas**:
1. Implementar elasticidade-preço (primeira feature de IA)
2. Validar com 5 vendedores beta
3. Iterar baseado em feedback

**Mês 2**:
1. Machine Learning (previsão + anomalias)
2. Estoque inteligente (monitoramento + alertas)
3. Beta com 20 vendedores

**Mês 3**:
1. Site vitrine (MVP)
2. Multi-produto (produto vs. anúncio)
3. Lançamento público (100 vendedores)

---

## ✅ APROVAÇÃO

Este documento reflete as **decisões finais** do produto MercaFlow.

**Definições aprovadas**:
- ✅ Não gerenciar estoque (apenas monitorar)
- ✅ Modelagem produto vs. anúncio
- ✅ MVP: Mercado Livre apenas
- ✅ Fase 2: Shopee (se tracionar)
- ✅ Foco em inteligência, não operação

**Qualquer mudança nessas decisões deve ser documentada aqui.**

---

**Quer que eu comece a implementar algo específico agora?**
