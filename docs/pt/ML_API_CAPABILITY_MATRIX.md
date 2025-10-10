# 🎯 Matriz de Capacidades: MercaFlow Features × ML APIs

**Data**: 10 de Outubro de 2025  
**Status**: Documento de Referência Técnica  
**Versão**: 1.0

---

## 📊 MATRIZ COMPLETA

| # | Feature MercaFlow | ML API Necessária | Dados Disponíveis | Status Implementação | Prioridade | Tempo Estimado | Semana Roadmap |
|---|---|---|---|---|---|---|---|
| 1 | **Listar Produtos** | Items API | id, title, price, sold_quantity | ✅ Implementado | P0 | - | ✅ Completo |
| 2 | **Histórico Vendas (12m)** | Orders API | order_items, date, price, fee | ✅ Implementado | P0 | - | ✅ Completo |
| 3 | **Responder Perguntas** | Questions API | question, answer, item_id | ✅ Parcial | P1 | 1d | Semana 7 |
| 4 | **Webhooks Real-time** | Webhooks API | items, orders, questions | ✅ Implementado | P0 | - | ✅ Completo |
| 5 | **Visitas por Produto** | Metrics API | visits/day, total_visits | ❌ Não implementado | 🔴 P0 | 2d | Semana 2 (Day 8-9) |
| 6 | **Rastreamento Preços** | Webhook + Storage | old_price, new_price, date | ❌ Não implementado | 🔴 P0 | 0.5d | Semana 2 (Day 13) |
| 7 | **Taxa de Conversão** | Metrics + Orders | visits, sales | ❌ Aguarda #5 | 🔴 P0 | 1d | Semana 3 (Day 15) |
| 8 | **Análise Concorrência** | Suggestions API | competitor prices, sold_qty | ❌ Não implementado | 🟡 P1 | 3d | Semana 3 (Day 14.5) |
| 9 | **Sugestão Preço ML** | Suggestions API | suggested_price, status | ❌ Não implementado | 🟡 P1 | 2d | Semana 3 (Day 14.5) |
| 10 | **Elasticidade-Preço** | Metrics + Orders + Price History | Correlação ΔP × ΔQ × ΔVisitas | ❌ Aguarda #5, #6, #9 | 🔴 P0 | 5d | Semana 3 (Day 15-21) |
| 11 | **Recomendação Preço Híbrida** | Suggestions + Elasticidade | ML baseline + nossa análise | ❌ Aguarda #9, #10 | 🔴 P0 | 2d | Semana 3 (Day 19-20) |
| 12 | **Margem Ótima** | Orders (sale_fee) + Custo | lucro = preço - custo - fee | ❌ Aguarda #10 | 🟡 P1 | 3d | Semana 4 (Day 22-24) |
| 13 | **Break-Even Point** | Orders + Custo Fixo | custos fixos / margem unit | ❌ Aguarda #12 | 🟡 P1 | 2d | Semana 4 (Day 25-26) |
| 14 | **Previsão Demanda** | Orders (histórico 6-12m) | Prophet ML model | ❌ Aguarda dados | 🟡 P1 | 7d | Semana 5 (Day 29-35) |
| 15 | **Detecção Anomalias** | Orders + Metrics | Z-score, baseline | ❌ Aguarda #5 | 🟢 P2 | 5d | Semana 6 (Day 36-40) |
| 16 | **Sistema Alertas** | Todas APIs | Regras + triggers | ❌ Aguarda features | 🟢 P2 | 7d | Semana 6 (Day 36-42) |
| 17 | **Website Auto-Gen** | Items API | title, pics, description | ❌ Não implementado | 🟢 P2 | 11d | Semana 7-9 (Day 46-56) |
| 18 | **Sazonalidade BR** | Orders (histórico próprio) | Análise agregada sellers | ❌ Aguarda volume | 🟢 P2 | 10d | Semana 8-9 (Day 57-66) |
| 19 | **Pricing Automation** | Automation API | rules, min/max price | ❌ Não implementado | 🔵 P3 | 4d | Semana 12+ (Premium) |
| 20 | **Histórico Preços ML (90d)** | Automation API history | price_changes, events | ❌ Opcional | 🔵 P3 | 2d | Semana 12+ (Premium) |

---

## 🔥 DEPENDÊNCIAS CRÍTICAS

### Bloqueia Múltiplas Features

#### **1. Metrics API** (Visitas) — URGENTE 🔴
**Bloqueia**:
- #7 Taxa de Conversão
- #10 Elasticidade-Preço
- #15 Detecção de Anomalias
- #16 Sistema de Alertas

**Tempo**: 2 dias  
**Impacto**: 70% das features de inteligência dependem disso!

---

#### **2. Rastreamento de Preços** (Webhook + Storage) — URGENTE 🔴
**Bloqueia**:
- #10 Elasticidade-Preço (precisa correlacionar ΔP × ΔQ)
- #11 Recomendação Híbrida

**Tempo**: 0.5 dia  
**Impacto**: Sem histórico de preço, elasticidade é impossível

---

#### **3. Suggestions API** (Análise Competitiva) — IMPORTANTE 🟡
**Bloqueia**:
- #8 Análise de Concorrência (dados prontos de 15-20 concorrentes)
- #9 Sugestão de Preço ML (baseline mercado)
- #11 Recomendação Híbrida (combinar ML + nossa análise)

**Tempo**: 3 dias  
**Impacto**: Diferencial competitivo (mostramos concorrentes + IA própria)

---

### Cadeia de Dependências (Ordem de Implementação)

```
Semana 2 (Day 8-9):
  ┌─> Metrics API (#5) ────┐
  │                         │
  └─> Rastreamento (#6) ───┤
                            │
Semana 3 (Day 14.5):        ▼
  ┌─> Suggestions API (#8, #9)
  │                         │
  │                         ▼
Semana 3 (Day 15-21):       │
  └──> Elasticidade (#10) <─┘
           │
           ▼
       Recomendação Híbrida (#11)
           │
           ├──> Margem Ótima (#12)
           │
           └──> Break-Even (#13)
                    │
                    ├──> Previsão Demanda (#14)
                    │
                    └──> Alertas (#16)
```

---

## 📈 PRIORIZAÇÃO DETALHADA

### 🔴 P0 - CRÍTICO (MVP Core)
Features **obrigatórias** para valor mínimo viável:

| Feature | Por que é P0? | Impacto Usuário |
|---|---|---|
| **#5 Visitas** | Sem visitas, não tem conversão nem elasticidade | 🔥 ALTO - Base para 70% das features |
| **#6 Rastreamento Preços** | Elasticidade precisa de histórico ΔP | 🔥 ALTO - Sem isso, não tem IA de preço |
| **#10 Elasticidade** | **Core value** do produto | 🔥 CRÍTICO - Principal diferencial |
| **#11 Recomendação Híbrida** | Combinação ML + nossa IA | 🔥 CRÍTICO - USP (Unique Selling Proposition) |

**Tempo total P0**: ~10 dias (Semana 2-3)

---

### 🟡 P1 - ALTO VALOR (Diferenciação)
Features que **diferenciam** de concorrentes:

| Feature | Por que é P1? | Impacto Usuário |
|---|---|---|
| **#8 Análise Concorrência** | Mostra top 5 concorrentes (preço + vendas) | 🟡 MÉDIO - Facilita decisão de preço |
| **#9 Sugestão ML** | Baseline do mercado (ML calculou) | 🟡 MÉDIO - Validação externa |
| **#12 Margem Ótima** | Responde: "Qual preço maximiza lucro?" | 🟡 ALTO - Aumenta margem 10-15% |
| **#13 Break-Even** | "Preciso vender X unidades/mês" | 🟡 MÉDIO - Planejamento financeiro |
| **#14 Previsão Demanda** | Antecipa vendas 30/60/90 dias | 🟡 ALTO - Gestão de estoque |

**Tempo total P1**: ~17 dias (Semana 4-5)

---

### 🟢 P2 - IMPORTANTE (Crescimento)
Features para **escala** e **retenção**:

| Feature | Por que é P2? | Impacto Usuário |
|---|---|---|
| **#15 Detecção Anomalias** | Alertas proativos (vendas caíram!) | 🟢 MÉDIO - Previne problemas |
| **#16 Sistema Alertas** | Notificações inteligentes | 🟢 ALTO - Engajamento diário |
| **#17 Website Auto-Gen** | USP único (30s site profissional) | 🟢 MUITO ALTO - Diferencial único |
| **#18 Sazonalidade BR** | Calendário eventos Brasil | 🟢 MÉDIO - Planejamento sazonal |

**Tempo total P2**: ~33 dias (Semana 6-10)

---

### 🔵 P3 - PREMIUM (Monetização)
Features para **plano Pro**:

| Feature | Por que é P3? | Impacto Usuário |
|---|---|---|
| **#19 Pricing Automation** | ML ajusta preço automaticamente | 🔵 ALTO - Mas exige confiança do usuário |
| **#20 Histórico ML (90d)** | Rastreamento oficial ML | 🔵 BAIXO - Nosso tracking suficiente |

**Tempo total P3**: ~6 dias (Semana 12+)

---

## 🎯 ROADMAP DE IMPLEMENTAÇÃO (Resumo)

### Fase 1: Fundação (Semanas 1-2) ✅
- ✅ Items, Orders, Questions, Webhooks
- ✅ OAuth 2.0 + Token Management
- ✅ Cache (Redis Upstash)

### Fase 2: Inteligência Core (Semanas 2-4) 🔴 EM ANDAMENTO
- **Semana 2**: Metrics API + Rastreamento Preços
- **Semana 3**: Suggestions API + Elasticidade
- **Semana 4**: Margem + Break-Even

### Fase 3: ML Avançado (Semanas 5-6) 🟡
- **Semana 5**: Previsão de Demanda
- **Semana 6**: Alertas Inteligentes

### Fase 4: Escala (Semanas 7-10) 🟢
- **Semanas 7-9**: Website Builder
- **Semana 10**: Sazonalidade BR

### Fase 5: Premium (Semanas 12+) 🔵
- Pricing Automation (Plano Pro)

---

## 📊 MÉTRICAS DE SUCESSO POR FEATURE

| Feature | KPI Técnico | KPI Negócio | Meta |
|---|---|---|---|
| **Visitas** | < 2s latência | 90% sellers verificam semanalmente | 80%+ uso |
| **Elasticidade** | ± 10% precisão | 60% sellers mudam preço baseado nisso | 50%+ confiança |
| **Recomendação Híbrida** | < 1s cálculo | 70% seguem recomendação | 65%+ aceitação |
| **Análise Concorrência** | Cache 1h | 80% verificam antes de mudar preço | 75%+ uso |
| **Previsão Demanda** | ± 15% acurácia | 40% planejam estoque com isso | 35%+ confiança |
| **Website Auto-Gen** | < 30s deploy | 25% sellers criam site | 20%+ conversão |
| **Alertas** | < 1min delay | 5+ alertas/semana por seller | 90%+ taxa abertura |

---

## 🚨 RISCOS E MITIGAÇÕES

### Risco 1: Metrics API pode ter limites de rate
**Impacto**: Alto (bloqueia elasticidade)  
**Probabilidade**: Média  
**Mitigação**:
- Cache agressivo (5min TTL)
- Sync diário em batch (não real-time)
- Armazenar histórico local (Supabase)

### Risco 2: Suggestions API pode não ter dados para todos produtos
**Impacto**: Médio (afeta recomendação híbrida)  
**Probabilidade**: Alta (produtos nicho)  
**Mitigação**:
- Fallback: usar apenas nossa elasticidade
- UI: "ML não tem benchmark, usando análise própria"
- Validar disponibilidade antes de mostrar

### Risco 3: Histórico curto de vendas (< 3 meses)
**Impacto**: Médio (elasticidade menos precisa)  
**Probabilidade**: Alta (sellers novos)  
**Mitigação**:
- Mostrar intervalo de confiança
- Alertar: "Com mais dados (6m), precisão melhora"
- Usar dados agregados de categoria

---

## 📚 REFERÊNCIAS

### Documentação
- [ML_API_ESTRATEGIA_COMPLETA.md](ML_API_ESTRATEGIA_COMPLETA.md) - Estratégia completa de uso
- [ROADMAP_EXECUTIVO_90DIAS.md](../../ROADMAP_EXECUTIVO_90DIAS.md) - Roadmap detalhado
- [VISAO_PRODUTO_CORRETA.md](../../VISAO_PRODUTO_CORRETA.md) - Visão de produto

### APIs ML
- [Metrics API](https://developers.mercadolivre.com.br/pt_br/metricas)
- [Price Suggestions API](https://developers.mercadolivre.com.br/pt_br/referencias-de-precos)
- [Pricing Automation API](https://developers.mercadolivre.com.br/pt_br/automatizacoes-de-precos)

---

**Última Atualização**: 10 de Outubro de 2025  
**Status**: Documento vivo (atualizar após cada sprint)  
**Próxima Revisão**: Após Semana 3 (elasticidade implementada)
