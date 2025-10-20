# 🎯 PLANO DE REFATORAÇÃO COMPLETO - MercaFlow

**Data**: 19 de Outubro de 2025  
**Status**: 📋 EM PLANEJAMENTO  
**Prioridade**: 🔴 CRÍTICO - Alinhamento com conceito oficial  
**Autor**: GitHub Copilot AI Assistant

---

## 📊 ANÁLISE DE GAP (Estado Atual vs Conceito Oficial)

### ❌ PROBLEMAS IDENTIFICADOS

#### 1. Desalinhamento Conceitual nas Páginas Públicas

**O que está ERRADO**:

- ❌ Foco excessivo em "Vitrine Profissional" e "Templates Premium"
- ❌ Mensagens sobre "criar loja virtual personalizada" (parece Linktree/Shopify)
- ❌ Recursos listados como "Editor drag-and-drop", "Domínio personalizado"
- ❌ Pouca ênfase em **inteligência analítica** e **insights acionáveis**
- ❌ IA posicionada como "otimizadora de títulos" (muito limitado)

**O que DEVERIA ser**:

- ✅ **PILAR 1 (70%)**: Inteligência Analítica Ativa
  - Elasticidade-preço da demanda
  - Análise preditiva de vendas
  - Insights acionáveis (não só dados)
  - Detecção de anomalias e oportunidades
  - Análise competitiva inteligente
- ✅ **PILAR 2 (30%)**: Site Automático Sincronizado
  - Criação rápida (< 15 min)
  - Sincronização automática com marketplaces
  - SEO e marca própria
  - Multi-marketplace (roadmap)

#### 2. Features Section Desalinhada

**Atual** (components/sections/FeaturesSection.tsx):

```
1. Vitrine Profissional (🎨 templates, editor, domínio)
2. IA Avançada (otimiza preços/títulos/descrições)
3. Analytics Profissional (dashboards, ROI)
4. Integração Nativa ML (sync automático)
5. Enterprise Security (criptografia)
6. Mobile First (app nativo, PWA)
```

**Deveria ser**:

```
1. 🧠 INTELIGÊNCIA ANALÍTICA ATIVA
   - Elasticidade-preço da demanda
   - Análise preditiva (previsão de vendas)
   - Insights acionáveis (não só gráficos)
   - Detecção de anomalias

2. 💰 PRECIFICAÇÃO CIENTÍFICA
   - Ponto de equilíbrio otimizado
   - Curva de demanda
   - Análise competitiva
   - Sazonalidade e tendências

3. 🔮 ANÁLISE PREDITIVA & ML
   - Previsão de vendas 30/60/90 dias
   - Detecção de tendências
   - Alertas de oportunidades
   - NLP para otimização de conteúdo

4. 🌐 SITE AUTOMÁTICO
   - Setup < 15 minutos
   - Sync automático com marketplaces
   - SEO otimizado
   - Multi-plataforma (roadmap)

5. 📊 DASHBOARDS ATIVOS (não passivos)
   - Sugestões de ações
   - Cards de oportunidades
   - Alertas inteligentes
   - ROI em tempo real

6. 🔗 INTEGRAÇÃO MULTI-MARKETPLACE
   - ML (disponível)
   - Shopee, Amazon, Magalu (roadmap)
   - Webhooks e API
   - Catálogo unificado
```

#### 3. Página de Preços com Valor Incorreto

**Problema**: Plans focam em "templates premium", "vitrine profissional", "editor visual" - parece Wix/Shopify.

**Deveria focar em**: Valor dos insights, economia de tempo, ROI através de decisões melhores.

#### 4. Dashboards Passivos (não ativos)

**Hipótese** (precisa auditoria):

- Dashboard atual provavelmente mostra apenas dados/gráficos
- Falta **insights acionáveis** tipo:
  - "🔥 AÇÃO URGENTE: Aumente preço 8% AGORA"
  - "💡 OPORTUNIDADE: Título do produto fraco"
  - "⚠️ ALERTA: Concorrente baixou preço 18% hoje"

---

## 🎯 PLANO DE AÇÃO ESTRUTURADO

### FASE 1: PÁGINAS PÚBLICAS (REFATORAÇÃO CRÍTICA) 🔴

**Prioridade**: MÁXIMA  
**Objetivo**: Alinhar todas as páginas públicas ao conceito oficial  
**Prazo estimado**: 2-3 dias de trabalho focado

#### 1.1 Landing Page (app/page.tsx + HeroSection.tsx) ✅ INÍCIO IMEDIATO

**Arquivos**:

- `app/page.tsx`
- `components/sections/HeroSection.tsx`
- `components/sections/StatsSection.tsx`
- `components/sections/TestimonialsSection.tsx`
- `components/sections/CTASection.tsx`

**Mudanças**:

**HeroSection.tsx**:

```tsx
// ❌ REMOVER foco em "criar site/vitrine"
// ❌ REMOVER badges tipo "Templates Premium"

// ✅ ADICIONAR:
- Headline: "Insights Inteligentes + Site Automático"
- Subheadline: Enfatizar economia aplicada, IA, análise preditiva
- Benefícios destacados:
  1. "Precificação científica (elasticidade-preço)"
  2. "IA prevê suas vendas (30/60/90 dias)"
  3. "Insights dizem O QUE fazer (não só dados)"
  4. "Site sincronizado em < 15 min"

- Exemplos visuais de INSIGHTS ATIVOS:
  "🔥 AÇÃO: Aumente preço 8% → +R$ 1.2k/mês"
  "💡 OPORTUNIDADE: Título fraco detectado"
  "📈 PREVISÃO: 234 vendas próximos 30 dias"
```

**Métricas a destacar**:

- ❌ "Produtos sincronizados", "Templates disponíveis"
- ✅ "+40% vendas através de precificação otimizada"
- ✅ "87% precisão nas previsões de demanda"
- ✅ "R$ 15k+ receita adicional média/cliente"

#### 1.2 Features/Recursos Page (app/recursos/page.tsx) ⏱️ APÓS 1.1

**Arquivos**:

- `app/recursos/page.tsx`
- `components/sections/FeaturesSection.tsx`

**Estrutura nova**:

```markdown
### SEÇÃO 1: INTELIGÊNCIA ANALÍTICA (destaque principal)

**Card 1: Elasticidade-Preço da Demanda** 💰

- "Descubra seu preço ótimo baseado em ciência"
- Features:
  - Análise de elasticidade em tempo real
  - Simulador de impacto de preços
  - Ponto de equilíbrio otimizado
  - Curva de demanda personalizada
- Exemplo visual: "Reduzir 5% = +18% vendas"

**Card 2: Análise Preditiva** 🔮

- "IA prevê suas vendas com 87% precisão"
- Features:
  - Previsão de vendas 30/60/90 dias
  - Detecção de tendências e sazonalidade
  - Alertas de anomalias
  - Recomendações de estoque
- Exemplo: "Próximos 30 dias: 234 vendas ±15%"

**Card 3: Insights Acionáveis** 🎯

- "Não mostramos dados, dizemos o que FAZER"
- Features:
  - Dashboard ativo (não passivo)
  - Cards de ações sugeridas
  - Priorização por impacto/ROI
  - Confiança estatística de cada insight
- Exemplo: "🔥 URGENTE: Otimize título → +23% conversão"

**Card 4: Análise Competitiva** 🔍

- "Monitore concorrentes 24/7 automaticamente"
- Features:
  - Benchmarking automático
  - Alertas de mudança de preços
  - Posicionamento relativo
  - Estratégias sugeridas

### SEÇÃO 2: SITE AUTOMÁTICO (complementar)

**Card 5: Criação Rápida** ⚡

- "Site profissional em < 15 minutos"
- Features:
  - Setup guiado passo a passo
  - 5 templates otimizados
  - Zero código necessário
  - Preview em tempo real

**Card 6: Sincronização Automática** 🔄

- "Seus produtos sempre atualizados"
- Features:
  - Sync bidirecional com ML
  - Webhooks em tempo real
  - Preços, estoque, fotos
  - Multi-marketplace (roadmap)

### SEÇÃO 3: FUNDAMENTOS (infraestrutura)

**Card 7: Multi-marketplace** 🌐
**Card 8: Segurança Enterprise** 🔒
**Card 9: API & Integrações** 🔗
```

**Regra de ouro**:

- 60% do conteúdo = Inteligência Analítica
- 20% do conteúdo = Site Automático
- 20% do conteúdo = Infraestrutura/Segurança

#### 1.3 Pricing Page (app/precos/page.tsx) ⏱️ APÓS 1.2

**Mudanças na proposta de valor**:

**Plano Starter**:

- ❌ REMOVER: "Templates premium", "Editor visual"
- ✅ ADICIONAR:
  - "10 insights acionáveis/mês"
  - "Análise de elasticidade básica"
  - "Previsão de vendas (30 dias)"
  - "Site automático (1 marketplace)"

**Plano Business** (mais popular):

- ✅ DESTACAR:
  - "Insights ilimitados + priorização por ROI"
  - "Elasticidade-preço avançada"
  - "Previsão ML (30/60/90 dias)"
  - "Análise competitiva 24/7"
  - "Site automático (3 marketplaces)"
  - "API para integrações"

**Plano Enterprise**:

- ✅ ADICIONAR:
  - "IA treinada no seu nicho"
  - "Modelos preditivos customizados"
  - "Análise competitiva multi-mercado"
  - "White-label + API priority"

**Tabela comparativa**: Focar em "Inteligência" > "Site/Templates"

#### 1.4 About Page (app/sobre/page.tsx) ⏱️ APÓS 1.3

**Reescrever história**:

```markdown
## Por que MercaFlow existe?

Éramos vendedores no Mercado Livre e percebemos 3 problemas:

1. **Dashboards passivos** - mostravam dados mas não diziam o que fazer
2. **Precificação no escuro** - feeling ou copiar concorrente
3. **Site profissional caro** - R$ 15k ou dependência 100% de marketplace

## Nossa solução

Combinamos **3 áreas de conhecimento**:

### 1. Economia Aplicada

- Elasticidade-preço da demanda
- Teoria dos jogos (pricing competitivo)
- Curva de oferta e demanda
- Sazonalidade e ciclos

### 2. Inteligência Artificial & ML

- Modelos preditivos (vendas, demanda)
- Detecção de anomalias
- NLP para otimização
- Clustering de produtos/clientes

### 3. Engenharia de Software

- Automação de site
- Sync multi-marketplace
- Webhooks em tempo real
- Segurança enterprise

## Resultado

Uma plataforma que **não só mostra dados, mas diz EXATAMENTE o que fazer**

- **cria seu site profissional em < 15 minutos**.
```

**Time section**: Adicionar backgrounds em economia/data science, não só "e-commerce".

---

### FASE 2: DASHBOARDS ADMINISTRATIVOS (TRANSFORMAÇÃO ATIVA) 🟡

**Prioridade**: ALTA (após páginas públicas)  
**Objetivo**: Transformar dashboards passivos em ativos  
**Prazo estimado**: 3-5 dias

#### 2.1 Auditoria Inicial ✅ PRIMEIRO PASSO

**Ações**:

1. Mapear todos os dashboards existentes em `app/dashboard/*`
2. Identificar quais mostram apenas dados vs insights
3. Criar lista de gaps de funcionalidade
4. Definir prioridades por impacto

**Entregável**: Documento `AUDITORIA_DASHBOARDS.md`

#### 2.2 Dashboard Principal (Overview) 🎯 PRIORIDADE #1

**Transformações**:

**De (passivo)**:

```
[Card] Vendas este mês: R$ 15.4k
[Card] Total de pedidos: 127
[Card] Taxa de conversão: 2.3%
[Gráfico] Vendas dos últimos 30 dias
```

**Para (ativo)**:

```
[Insight Card - URGENTE] 🔥
Título: "Aumente seu preço em 8% AGORA"
Conteúdo: "Elasticidade favorável detectada"
Impacto: "+R$ 1.2k/mês sem perder vendas"
Confiança: 87%
[Botão: "Aplicar Otimização"]

[Insight Card - OPORTUNIDADE] 💡
Título: "3 produtos com título fraco"
Conteúdo: "IA sugere otimizações"
Impacto esperado: "+23% cliques, +12% conversão"
[Botão: "Ver Sugestões"]

[Insight Card - ALERTA] ⚠️
Título: "Concorrente baixou preço 18% hoje"
Conteúdo: "Você: R$ 159 | Concorrente: R$ 129"
Ação sugerida: "Igualar ou destacar diferencial"
[Botão: "Analisar Estratégia"]

[Previsão Preditiva] 📈
"Próximos 30 dias: 234 vendas (±15%)"
"Estoque mínimo recomendado: 189 unidades"
"Pico esperado: 23/11 (Black Friday)"
```

**Regra**: Todo dado numérico deve ter um insight ou ação sugerida.

#### 2.3 Dashboard de Produtos 📦

**Adicionar por produto**:

- Análise de elasticidade-preço
- Sugestões de otimização de título (NLP)
- Benchmarking competitivo
- Previsão de demanda individual

**Layout sugerido**:

```
[Tabela de Produtos]
Colunas:
- Nome
- Preço Atual
- Elasticidade [Medidor visual]
- Ação Sugerida [Badge: "↑ Aumentar 8%", "→ Otimizar título"]
- ROI Esperado ["+R$ 340/mês"]
- Prioridade [Alto/Médio/Baixo]
```

#### 2.4 Dashboard de Pricing 💰

**Features**:

- Simulador de elasticidade-preço
- Curva de demanda visual
- Análise competitiva multi-produto
- Histórico de otimizações aplicadas
- ROI de mudanças de preço

**Componentes principais**:

```tsx
<PriceElasticityChart />
<DemandCurveSimulator />
<CompetitorPriceMonitor />
<PriceOptimizationSuggestions />
<ROICalculator />
```

#### 2.5 Dashboard de Previsões 🔮

**Análises**:

- Previsão de vendas (30/60/90 dias)
- Detecção de sazonalidade
- Tendências de categoria
- Alertas de anomalias
- Recomendações de estoque

**Visualizações**:

- Gráfico de séries temporais com previsão
- Intervalos de confiança
- Comparação com período anterior
- Impacto de eventos (feriados, Black Friday)

---

### FASE 3: FEATURES DE INTELIGÊNCIA (CORE FEATURES) 🟢

**Prioridade**: MÉDIA-ALTA (paralelo com Fase 2)  
**Objetivo**: Implementar backend de inteligência analítica  
**Prazo estimado**: 5-7 dias

#### 3.1 Módulo de Elasticidade-Preço 💰

**Arquivos a criar**:

```
utils/intelligence/
  ├── elasticity/
  │   ├── calculator.ts          # Cálculo de elasticidade
  │   ├── demand-curve.ts         # Curva de demanda
  │   ├── equilibrium.ts          # Ponto de equilíbrio
  │   └── simulator.ts            # Simulador de impacto
  ├── prediction/
  │   ├── sales-forecast.ts       # Previsão de vendas
  │   ├── trend-detection.ts      # Detecção de tendências
  │   ├── seasonality.ts          # Análise sazonal
  │   └── anomaly-detection.ts    # Detecção de anomalias
  ├── competitive/
  │   ├── benchmarking.ts         # Comparação competitiva
  │   ├── price-monitor.ts        # Monitor de preços
  │   └── market-positioning.ts   # Posicionamento
  └── insights/
      ├── generator.ts            # Gerador de insights
      ├── prioritizer.ts          # Priorização por ROI
      └── confidence.ts           # Cálculo de confiança
```

**Tecnologias**:

- Análise estatística: Simple Statistics lib
- ML básico: TensorFlow.js (opcional)
- Séries temporais: Prophet.js (opcional)
- NLP: OpenAI API (opcional)

#### 3.2 Sistema de Insights Acionáveis 🎯

**Estrutura**:

```typescript
interface ActionableInsight {
  id: string;
  type: "urgent" | "opportunity" | "warning" | "info";
  title: string;
  description: string;
  impact: {
    revenue?: number;
    conversion?: number;
    sales?: number;
    timeframe: string;
  };
  confidence: number; // 0-100%
  action: {
    label: string;
    endpoint: string;
    params?: Record<string, any>;
  };
  priority: "high" | "medium" | "low";
  createdAt: Date;
  expiresAt?: Date;
  status: "active" | "applied" | "dismissed";
}
```

**API Endpoints**:

```
GET  /api/insights                    # Lista insights ativos
GET  /api/insights/:id                # Detalhes de insight
POST /api/insights/:id/apply          # Aplicar ação sugerida
POST /api/insights/:id/dismiss        # Descartar insight
GET  /api/insights/history            # Histórico
```

#### 3.3 Análise Preditiva 🔮

**Funcionalidades**:

1. **Previsão de Vendas**:

   - Algoritmo: Exponential Smoothing ou ARIMA
   - Inputs: Histórico de vendas, sazonalidade, tendências
   - Output: Previsão 30/60/90 dias com intervalos de confiança

2. **Detecção de Tendências**:

   - Moving averages
   - Regression analysis
   - Pattern recognition

3. **Alertas de Anomalias**:
   - Z-score analysis
   - Detecção de outliers
   - Mudanças significativas vs baseline

**Tabelas necessárias** (Supabase):

```sql
-- Histórico de métricas para análise
CREATE TABLE analytics_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  product_id UUID REFERENCES ml_products(id),
  date DATE NOT NULL,
  metric_type TEXT NOT NULL, -- 'sales', 'revenue', 'conversion', etc
  value NUMERIC NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insights gerados
CREATE TABLE insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  impact JSONB,
  confidence NUMERIC,
  action JSONB,
  priority TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  applied_at TIMESTAMPTZ,
  dismissed_at TIMESTAMPTZ
);

-- Previsões
CREATE TABLE forecasts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  product_id UUID REFERENCES ml_products(id),
  forecast_type TEXT NOT NULL, -- 'sales', 'demand', etc
  timeframe TEXT NOT NULL, -- '30d', '60d', '90d'
  predicted_value NUMERIC,
  confidence_lower NUMERIC,
  confidence_upper NUMERIC,
  confidence_level NUMERIC,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  for_date DATE NOT NULL
);
```

#### 3.4 Monitor Competitivo 🔍

**Features**:

- Scraping de preços concorrentes (respeitando robots.txt)
- Alertas de mudanças de preço
- Benchmarking automático
- Sugestões de posicionamento

**Considerações éticas/legais**:

- Usar apenas dados públicos da API do ML
- Respeitar rate limits
- Não fazer scraping agressivo
- Focar em análise agregada, não individual

---

### FASE 4: SITE AUTOMÁTICO (FEATURE SECUNDÁRIA) 🔵

**Prioridade**: MÉDIA (após Fases 1-3)  
**Objetivo**: Implementar criação/sync de sites  
**Prazo estimado**: 7-10 dias

#### 4.1 Arquitetura do Site Automático

**Opções de implementação**:

**Opção A: Sites estáticos (Next.js SSG)** ⭐ RECOMENDADO

- Gerar site estático por tenant
- Deploy em Vercel/Netlify
- Domínio personalizado por tenant
- Build on-demand (webhook do ML → rebuild site)

**Opção B: Rotas dinâmicas (Next.js SSR)**

- `app/sites/[tenantSlug]/...`
- Renderização server-side por request
- Mais flexível mas menos performático

**Opção C: Headless CMS externo**

- Integrar com Contentful/Strapi
- Mais complexo de manter

**Recomendação**: Opção A (SSG) para MVP

#### 4.2 Features do Site Generator

**Setup wizard**:

```tsx
// app/dashboard/site-setup/page.tsx

<SetupWizard>
  <Step1SelectTemplate />
  // 5 templates otimizados // Preview visual de cada um
  <Step2BasicInfo />
  // Nome da loja // Logo (upload ou gerado por IA) // Cores principais (ou auto-detect
  do ML)
  <Step3DomainSetup />
  // Subdomínio gratuito: {slug}.mercaflow.site // Domínio customizado (DNS setup
  guide)
  <Step4ProductSync />
  // Selecionar produtos do ML para exibir // Ordem, categorias
  <Step5Preview />
  // Preview do site em tempo real // Edições básicas (textos, cores)
  <Step6Publish />
  // Deploy do site // Status: "Publicando... ✅ Site no ar!"
</SetupWizard>
```

**Sincronização**:

- Webhook do ML → atualiza produtos
- Cron job diário (backup)
- Manual trigger (botão "Sync Now")

#### 4.3 Templates

**Template 1: Minimalista**

- Clean, focado em produtos
- Grid de produtos com fotos grandes
- CTA direto para ML

**Template 2: Storytelling**

- Hero section com história da marca
- Seções: Sobre, Produtos, Depoimentos
- Foco em brand building

**Template 3: Catálogo**

- Lista densa de produtos
- Filtros por categoria
- Ideal para muitos SKUs

**Template 4: Produto Único**

- Hero do produto principal
- Seções: Features, Specs, Reviews
- Upsell de produtos relacionados

**Template 5: Multi-marketplace**

- Mostra produtos de várias plataformas
- Comparação de preços
- Links para melhor oferta

**Tecnologia**: Tailwind CSS + shadcn/ui components

#### 4.4 SEO & Performance

**SEO**:

- Sitemap.xml automático
- Meta tags por produto
- Schema.org (Product, Offer)
- Open Graph tags
- URLs amigáveis: `/produtos/{slug}`

**Performance**:

- Imagens otimizadas (Next.js Image)
- Lazy loading
- CDN (Vercel Edge)
- Cache agressivo

---

### FASE 5: REFINAMENTO & FEATURES AVANÇADAS 🟣

**Prioridade**: BAIXA (features nice-to-have)  
**Objetivo**: Polimento e features avançadas  
**Prazo estimado**: 10+ dias

#### 5.1 Análise Competitiva Avançada

- Gráficos de posicionamento
- Matriz BCG (produtos estrela, vaca leiteira, etc)
- Análise de share of voice
- Benchmarking multi-dimensional

#### 5.2 IA Generativa (Opcional)

- Geração de descrições de produtos
- Otimização de títulos por NLP
- Sugestões de categorias
- Análise de sentiment de reviews

**API**: OpenAI GPT-4 (caro, usar com parcimônia)

#### 5.3 Integrações Externas

- **Shopee** (API similar ao ML)
- **Amazon BR** (API mais complexa)
- **Magazine Luiza** (verificar disponibilidade)
- **Google Analytics** (eventos customizados)
- **Meta Pixel** (tracking de conversão)

#### 5.4 Mobile App (React Native)

- Dashboard móvel
- Push notifications para insights urgentes
- Gestão rápida de produtos/pedidos
- Apenas se houver demanda real

---

## 📐 ARQUITETURA TÉCNICA PROPOSTA

### Novos Diretórios

```
utils/
  ├── intelligence/              # 🆕 Módulo de inteligência
  │   ├── elasticity/
  │   ├── prediction/
  │   ├── competitive/
  │   └── insights/
  ├── site-generator/            # 🆕 Gerador de sites
  │   ├── templates/
  │   ├── builder/
  │   └── sync/
  └── analytics/                 # 🆕 Analytics avançado
      ├── tracking.ts
      ├── metrics.ts
      └── reports.ts

components/
  ├── intelligence/              # 🆕 Componentes de insights
  │   ├── InsightCard.tsx
  │   ├── ElasticityChart.tsx
  │   ├── ForecastChart.tsx
  │   └── CompetitorMonitor.tsx
  ├── site-builder/              # 🆕 Site builder UI
  │   ├── SetupWizard.tsx
  │   ├── TemplateSelector.tsx
  │   └── SitePreview.tsx
  └── dashboard/                 # Refatorar existente
      ├── ActiveDashboard.tsx    # 🆕 Dashboard ativo
      ├── InsightsPanel.tsx      # 🆕 Painel de insights
      └── ActionableCards.tsx    # 🆕 Cards de ação

app/
  ├── dashboard/
  │   ├── insights/              # 🆕 Página de insights
  │   ├── pricing/               # 🆕 Análise de pricing
  │   ├── forecasts/             # 🆕 Previsões
  │   └── site-builder/          # 🆕 Construtor de site
  └── api/
      ├── intelligence/          # 🆕 API de inteligência
      │   ├── elasticity/
      │   ├── forecast/
      │   └── insights/
      └── site/                  # 🆕 API do site
          ├── generate/
          ├── sync/
          └── publish/
```

### Novas Tabelas Supabase

Ver seção 3.3 para DDL completo.

**Resumo**:

- `analytics_history` - Histórico de métricas
- `insights` - Insights gerados
- `forecasts` - Previsões
- `competitor_data` - Dados de concorrentes
- `site_configs` - Configurações de sites
- `site_templates` - Templates disponíveis

### Migrações Necessárias

```bash
# Criar nova migration
npm run db:migration create_intelligence_tables

# Aplicar
npm run db:push
```

---

## 🎯 CRITÉRIOS DE SUCESSO

### Fase 1: Páginas Públicas

✅ **Landing page** reflete os 2 pilares (70% inteligência, 30% site)  
✅ **Features** focam em insights acionáveis > templates  
✅ **Pricing** vende valor de inteligência, não "vitrine bonita"  
✅ **About** conta história de economia + IA + engenharia  
✅ **Checklist de alinhamento** 100% aprovado (ver conceito oficial)

### Fase 2: Dashboards

✅ **Dashboard principal** tem ≥5 insights acionáveis ativos  
✅ **Produtos** mostram elasticidade e sugestões por item  
✅ **Zero dados** sem contexto/insight associado  
✅ **Usuário sabe exatamente** o que fazer ao ver dashboard

### Fase 3: Inteligência

✅ **Elasticidade-preço** funcionando para ≥1 produto  
✅ **Previsão de vendas** com ≥70% precisão (validar com histórico)  
✅ **Insights gerados** automaticamente daily  
✅ **API de inteligência** documentada e testada

### Fase 4: Site Automático

✅ **Setup wizard** completo em <15 minutos  
✅ **≥3 templates** disponíveis e funcionais  
✅ **Sync automático** com webhook do ML  
✅ **Site publicado** acessível publicamente

---

## 📊 MÉTRICAS DE VALIDAÇÃO

### Métricas Qualitativas

**Teste do "O que fazer?"**:

- Mostrar dashboard para 5 usuários de teste
- Perguntar: "O que você deveria fazer agora?"
- ✅ Sucesso: ≥80% respondem com ações concretas (não "ver dados")

**Teste de Posicionamento**:

- Mostrar landing page por 30s
- Perguntar: "O que este produto faz?"
- ✅ Sucesso: ≥80% mencionam "insights/inteligência/IA"
- ❌ Falha: Mencionam "criar site/vitrine/templates"

### Métricas Quantitativas

**Conversão**:

- Taxa de conversão visitante → trial signup
- Meta: ≥3% (baseline atual: ?)

**Engajamento**:

- % usuários que aplicam ≥1 insight sugerido
- Meta: ≥40% nos primeiros 7 dias

**Retenção**:

- % usuários ativos após 30 dias
- Meta: ≥60% (se entregamos valor real)

---

## ⏰ CRONOGRAMA ESTIMADO

### Sprint 1 (Semana 1): Páginas Públicas

- **Dia 1-2**: HeroSection + Landing page
- **Dia 3-4**: Features + Recursos
- **Dia 5**: Pricing + About
- **Dia 6**: Testes e ajustes
- **Dia 7**: Deploy e validação

### Sprint 2 (Semana 2): Auditoria e Planejamento Backend

- **Dia 1-3**: Auditoria completa de dashboards
- **Dia 4-5**: Design de APIs de inteligência
- **Dia 6-7**: Setup de tabelas e migrations

### Sprint 3-4 (Semanas 3-4): Inteligência Core

- **Semana 3**: Elasticidade + Previsões básicas
- **Semana 4**: Insights generator + Dashboard ativo

### Sprint 5 (Semana 5): Dashboard Refactor

- **Dia 1-3**: Dashboard principal + Produtos
- **Dia 4-5**: Pricing + Forecasts
- **Dia 6-7**: Testes E2E

### Sprint 6-7 (Semanas 6-7): Site Automático

- **Semana 6**: Setup wizard + Templates
- **Semana 7**: Sync engine + Deploy

### Sprint 8+ (Semana 8+): Refinamento

- Features avançadas conforme feedback
- Integrações adicionais
- Performance optimization

**Total estimado**: 8-10 semanas para versão completa alinhada com conceito oficial.

---

## 🚧 RISCOS E MITIGAÇÕES

### Risco 1: Complexidade da Inteligência

**Problema**: Algoritmos de elasticidade/previsão podem ser complexos.

**Mitigação**:

- Começar com versões simplificadas (heurísticas)
- Iterar baseado em feedback
- Considerar libs prontas (Prophet.js, TensorFlow.js)
- Validar com economista/data scientist (consultoria pontual)

### Risco 2: Dados Insuficientes

**Problema**: Novos usuários não têm histórico para previsões.

**Mitigação**:

- Usar dados agregados de outros usuários (anônimos)
- Insights genéricos para novos usuários
- "Cold start problem" - esperar 30 dias de dados mínimos
- Mostrar exemplos/demos de como funcionará

### Risco 3: Acurácia das Previsões

**Problema**: Previsões erradas podem prejudicar confiança.

**Mitigação**:

- Sempre mostrar intervalos de confiança
- "87% de confiança" visível
- Disclaimers: "Previsão baseada em dados históricos"
- Tracking de acurácia e melhoria contínua
- Permitir feedback do usuário

### Risco 4: Scope Creep

**Problema**: Tentar fazer tudo ao mesmo tempo.

**Mitigação**:

- **Priorizar Fase 1 e 2** (páginas + dashboards ativos)
- Inteligência avançada = iterativa
- Site automático = nice-to-have (pode ser V2)
- MVP: Insights básicos funcionando > 100 features

---

## 📝 PRÓXIMOS PASSOS IMEDIATOS

### 🔴 AÇÃO IMEDIATA (hoje/amanhã)

1. ✅ **Criar este documento** (PLANO_REFATORACAO_COMPLETO.md)
2. 🔄 **Começar refatoração da HeroSection.tsx**
   - Remover foco em "vitrine/templates"
   - Adicionar mensagens de inteligência analítica
   - Incluir exemplos visuais de insights ativos
3. 🔄 **Atualizar FeaturesSection.tsx**
   - Reordenar: Inteligência primeiro, site depois
   - Reescrever descrições focando em ROI/impacto

### 🟡 CURTO PRAZO (esta semana)

4. Refatorar todas as páginas públicas (Fase 1 completa)
5. Criar `AUDITORIA_DASHBOARDS.md` (mapear estado atual)
6. Design inicial das APIs de inteligência
7. Criar primeiras tabelas (insights, analytics_history)

### 🟢 MÉDIO PRAZO (próximas 2 semanas)

8. Implementar gerador de insights básico
9. Refatorar dashboard principal (ativo vs passivo)
10. MVP de elasticidade-preço

### 🔵 LONGO PRAZO (próximo mês)

11. Previsões preditivas completas
12. Site automático MVP
13. Testes E2E e validação com usuários reais

---

## 📚 DOCUMENTAÇÃO DE APOIO

### Documentos para consultar:

- `CONCEITO_OFICIAL_MERCAFLOW.md` - **Referência master**
- `CORRECAO_POSICIONAMENTO_COMPLETA.md` - Correções anteriores
- `.github/copilot-instructions.md` - Padrões técnicos
- `docs/pt/guias/visao-geral-projeto.md` - Visão do produto

### Novos documentos a criar:

- `AUDITORIA_DASHBOARDS.md` - Análise de gaps
- `API_INTELLIGENCE.md` - Specs das APIs de inteligência
- `SITE_GENERATOR_SPEC.md` - Specs do gerador de sites
- `CHECKLIST_VALIDACAO.md` - Checklist de alinhamento

---

## ✅ CHECKLIST DE ALINHAMENTO (usar após cada fase)

### Páginas Públicas:

- [ ] Landing page menciona "inteligência analítica" no hero?
- [ ] Elasticidade-preço está destacada nas features?
- [ ] "Insights acionáveis" aparece >3 vezes na página?
- [ ] "Templates/vitrine" são secundários na mensagem?
- [ ] Exemplos visuais mostram INSIGHTS (não só gráficos)?
- [ ] Pricing vende valor de inteligência > design de site?

### Dashboards:

- [ ] Todo dado numérico tem um insight associado?
- [ ] Existem ≥3 cards de "ações sugeridas" ativos?
- [ ] Dashboard responde "O QUE fazer?" (não só "O que aconteceu?")
- [ ] Insights mostram impacto/ROI estimado?
- [ ] Confiança estatística é visível?
- [ ] Ações são priorizadas (alta/média/baixa)?

### Inteligência Backend:

- [ ] Elasticidade-preço implementada?
- [ ] Previsões de vendas funcionando?
- [ ] Insights gerados automaticamente?
- [ ] APIs documentadas e testadas?
- [ ] Tabelas criadas com RLS policies?
- [ ] Dados históricos sendo coletados?

---

**Status**: 📋 PLANO APROVADO - PRONTO PARA EXECUÇÃO  
**Próximo passo**: Iniciar Fase 1.1 (Landing Page Refactor)  
**Owner**: @antoniovbraz (validação) + GitHub Copilot (execução)

---

_Este documento é um plano vivo e será atualizado conforme progresso e aprendizados._
