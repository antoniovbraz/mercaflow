# 📊 PLANO DE IMPLEMENTAÇÃO - DASHBOARD INTELLIGENCE

**Data**: 20 de Outubro de 2025  
**Objetivo**: Refatorar Dashboards para focar em **Inteligência Analítica Ativa**  
**Alinhamento**: CONCEITO_OFICIAL_MERCAFLOW.md (70% Intelligence, 30% Gestão)

---

## 🎯 ARQUITETURA DO NOVO DASHBOARD

### Filosofia de Design

**❌ Dashboard Passivo (ANTES)**:
- Mostra números: "Você vendeu 127 unidades"
- Gráficos sem contexto
- Dados sem ação sugerida

**✅ Dashboard Ativo com Intelligence (DEPOIS)**:
- Insights acionáveis: "🔥 AÇÃO URGENTE: Aumente preço 8% AGORA"
- ROI estimado sempre visível
- Botões de ação em cada insight
- Confiança do algoritmo (IA + Economia)

---

## 🏗️ ESTRUTURA DE PÁGINAS

### 1. `/dashboard` - Overview Inteligente (PRIORIDADE #1)

**Layout**:
```
┌─────────────────────────────────────────────────────────┐
│ 🧠 INTELLIGENCE CENTER (70% da tela)                    │
├─────────────────────────────────────────────────────────┤
│ [Insights Ativos - Top 5 Priority]                      │
│                                                          │
│ 🔥 URGENTE: Elasticidade favorável detectada            │
│    Aumente preço 8% → +R$ 1.2k/mês sem perder vendas   │
│    Confiança: 87% | ROI: +15% | [Aplicar Agora]       │
│                                                          │
│ 💡 OPORTUNIDADE: 3 produtos com título fraco            │
│    IA sugere otimizações → +23% cliques, +12% conversão│
│    [Ver Sugestões]                                      │
│                                                          │
│ ⚠️ ALERTA: Concorrente baixou preço 18% hoje           │
│    Você: R$ 159 | Concorrente: R$ 129                 │
│    [Analisar Estratégia]                                │
├─────────────────────────────────────────────────────────┤
│ 📊 QUICK METRICS (30% da tela)                          │
│                                                          │
│ Revenue: R$ 15.4k (+12%) | Pedidos: 234 (+8%)          │
│ Conversão: 2.3% | Estoque: 456 un                      │
└─────────────────────────────────────────────────────────┘
```

**Componentes**:
- `<IntelligenceCenter />` - Top 5 priority insights
- `<QuickMetricsBar />` - KPIs compactos
- `<InsightCard />` - Individual insight (já criado)
- `<ActionButton />` - CTAs com tracking

---

### 2. `/dashboard/analytics` - Intelligence Analytics Full

**Seções**:

**A. Elasticidade-Preço** (destaque)
- Chart de curva de demanda
- Ponto de equilíbrio otimizado
- Simulador de cenários
- "Se aumentar 5% → Impacto: +R$ 890/mês"

**B. Análise Preditiva**
- Forecast 30/60/90 dias
- Sazonalidade detectada
- Alertas de ruptura de estoque
- "Próximo pico: 23/11 (Black Friday) - Estoque recomendado: 340 un"

**C. Análise Competitiva**
- Posição vs Top 5 concorrentes
- Alertas de mudança de preço
- Benchmarking de categoria
- "Você está 12% mais caro que média"

**D. Performance Inteligente**
- Produtos com melhor ROI
- Oportunidades de otimização
- Análise de conversão
- Impacto de mudanças recentes

---

### 3. `/dashboard/produtos` - Products with Intelligence

**Por Produto**:
```
┌─────────────────────────────────────────────────────────┐
│ [Produto #142 - Tênis Nike Air Max]                     │
│                                                          │
│ 🎯 INSIGHTS DESTE PRODUTO:                              │
│                                                          │
│ 💡 Título fraco detectado (-23% CTR esperado)           │
│    IA sugere: "Tênis Nike Air Max Branco Tam 40-44..."│
│    [Aplicar Sugestão]                                   │
│                                                          │
│ 📈 Elasticidade favorável                               │
│    Pode aumentar preço 10% sem perder vendas           │
│    [Simular Impacto]                                    │
│                                                          │
│ ⚠️ 3 concorrentes com estoque maior                    │
│    Risco: perder Buy Box                                │
│    [Ver Estratégia]                                     │
│                                                          │
│ 📊 Métricas: Vendas: 45/mês | Conversão: 3.2%          │
└─────────────────────────────────────────────────────────┘
```

---

### 4. `/dashboard/configuracoes` - Settings

**Seções**:
- Integrações ML (OAuth management)
- Preferências de notificações
- Configuração de alertas
- Dashboard customization (widgets)

---

## 🎨 COMPONENTES PRINCIPAIS

### Components Novos a Criar

1. **`<IntelligenceCenter />`** - Hub central de insights
   - Lista top 5-8 insights por prioridade
   - Filtros por categoria (PRICE, PERFORMANCE, AUTOMATION, etc)
   - Real-time updates via polling
   
2. **`<QuickMetricsBar />`** - KPIs compactos
   - Revenue, Orders, Conversion, Stock
   - Sparklines para tendência
   - Comparação com período anterior
   
3. **`<ElasticityChart />`** - Curva de demanda
   - Recharts com pontos de equilíbrio
   - Interativo (hover mostra impacto)
   - Simulador inline
   
4. **`<ForecastChart />`** - Previsão temporal
   - Linha de tendência + confidence interval
   - Marcadores de eventos (Black Friday, etc)
   - Alertas visuais
   
5. **`<CompetitorAnalysis />`** - Benchmarking
   - Table com top 5 competitors
   - Alertas de mudança recente
   - Comparação de features
   
6. **`<ActionableInsightCard />`** - Enhanced InsightCard
   - CTA button com tracking
   - ROI estimate sempre visível
   - Confidence badge
   - Dismiss/Complete actions

---

## 📦 INTEGRAÇÃO COM BACKEND

### APIs Existentes
✅ `/api/intelligence/insights/generate` - Gerar insights  
✅ `/api/intelligence/insights/list` - Listar com filtros  
✅ `/api/intelligence/insights/[id]/dismiss` - Descartar  
✅ `/api/intelligence/insights/[id]/complete` - Completar  

### APIs Novas Necessárias

1. **`/api/dashboard/kpis`** - Quick metrics
   - Revenue, orders, conversion
   - Period comparison
   - Cached (5 min TTL)

2. **`/api/analytics/elasticity`** - Elasticidade data
   - Historical price changes
   - Sales response
   - Optimal price calculation

3. **`/api/analytics/forecast`** - Previsão
   - ML predictions 30/60/90 days
   - Confidence intervals
   - Seasonality factors

4. **`/api/analytics/competitors`** - Competitor data
   - Cached from ML API
   - Price movements
   - Feature comparison

---

## 🗓️ CRONOGRAMA DE IMPLEMENTAÇÃO

### Sprint 1: Dashboard Principal (3-4h)
- [ ] Criar `<IntelligenceCenter />` component
- [ ] Criar `<QuickMetricsBar />` component
- [ ] Refatorar `/dashboard/page.tsx` com novo layout
- [ ] Criar `/api/dashboard/kpis` endpoint
- [ ] Integrar `<InsightsList />` existente
- [ ] Deploy e teste

### Sprint 2: Analytics Dashboard (4-5h)
- [ ] Criar página `/dashboard/analytics/page.tsx`
- [ ] Implementar `<ElasticityChart />` com Recharts
- [ ] Implementar `<ForecastChart />`
- [ ] Criar `/api/analytics/elasticity` endpoint
- [ ] Criar `/api/analytics/forecast` endpoint
- [ ] Deploy e teste

### Sprint 3: Produtos Intelligence (3-4h)
- [ ] Atualizar `/dashboard/produtos/page.tsx`
- [ ] Product-specific insights integration
- [ ] Per-product optimization suggestions
- [ ] Competitor analysis per product
- [ ] Deploy e teste

### Sprint 4: Configurações & Polish (2-3h)
- [ ] Criar `/dashboard/configuracoes/page.tsx`
- [ ] ML integration management UI
- [ ] Notification preferences
- [ ] Dashboard customization options
- [ ] Final polish e testes

---

## 🎯 CRITÉRIOS DE SUCESSO

### Métricas de Qualidade

| Critério | Target | Como Validar |
|----------|--------|--------------|
| **Intelligence First** | ≥70% tela | Visual inspection |
| **Insights Ativos** | ≥5 cards | Dashboard count |
| **ROI Visível** | 100% insights | Code review |
| **CTA Present** | 100% insights | UI inspection |
| **Load Time** | <2s | Chrome DevTools |
| **TypeScript** | 0 errors | `npm run type-check` |
| **Mobile Responsive** | ✅ | Test 375px/768px/1024px |

### Checklist de Alinhamento

- [ ] Dashboard menciona "inteligência" no hero
- [ ] Insights acionáveis são > 60% da tela
- [ ] Todo dado tem contexto/ação associada
- [ ] ROI estimado sempre visível
- [ ] Confiança do algoritmo mostrada
- [ ] CTAs claros em cada insight
- [ ] Zero "dashboards passivos"
- [ ] Português (pt-BR) em toda UI

---

## 🚀 PRÓXIMOS PASSOS IMEDIATOS

1. ✅ Ler toda documentação (COMPLETO)
2. ✅ Criar plano de implementação (ESTE ARQUIVO)
3. 🔄 Começar Sprint 1: Dashboard Principal
   - Criar `components/dashboard/IntelligenceCenter.tsx`
   - Criar `components/dashboard/QuickMetricsBar.tsx`
   - Criar `app/api/dashboard/kpis/route.ts`
   - Refatorar `app/dashboard/page.tsx`

**Começar AGORA**: Sprint 1, Passo 1 - IntelligenceCenter component
