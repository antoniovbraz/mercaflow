# Sprint 3 - Produtos Intelligence

## 📋 Objetivo

Refatorar `/produtos` page para integrar **Intelligence por produto** seguindo filosofia 70% Intelligence, 30% Management.

## 🎯 Estratégia de Implementação

### Análise da Página Atual (612 linhas)

**Estrutura existente:**

- ✅ Stats cards (total, ativos, estoque, preço médio)
- ✅ Filtros (search, status)
- ✅ Lista de produtos com paginação
- ✅ Sincronização com ML API

**Oportunidades de Intelligence:**

1. **Por produto**: Insights específicos (preço ótimo, qualidade título, concorrência)
2. **Agregado**: Top oportunidades, produtos críticos, ações recomendadas
3. **Preditivo**: Forecast de vendas por SKU, risco de ruptura

### Novo Layout (70/30 Split)

```
┌─────────────────────────────────────────────────────┐
│ 🎯 Intelligence Bar (30%) - Horizontal              │
│ Top 3 Insights: ROI, Crítico, Oportunidade          │
└─────────────────────────────────────────────────────┘
┌──────────────────┬──────────────────────────────────┐
│ 📊 Stats (40%)   │ 🔍 Filtros + Ações (30%)        │
│ 4 cards          │ Search, Status, Quick Actions    │
└──────────────────┴──────────────────────────────────┘
┌─────────────────────────────────────────────────────┐
│ 📦 Produtos Intelligence List (70%)                 │
│ ┌────────────────────────────────────────────────┐  │
│ │ Produto 1                                      │  │
│ │ ├─ Info básica (img, nome, preço, estoque)    │  │
│ │ └─ Intelligence Cards (3 por produto):        │  │
│ │    • Preço (ótimo vs atual, elasticidade)     │  │
│ │    • Título (score qualidade, sugestões)      │  │
│ │    • Competição (rank, oportunidades)         │  │
│ └────────────────────────────────────────────────┘  │
│ ┌────────────────────────────────────────────────┐  │
│ │ Produto 2 (expandido mostrando insights)      │  │
│ └────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

## 🧩 Componentes Necessários

### 1. ProductIntelligenceBar (Header 30%)

**Arquivo:** `components/produtos/ProductIntelligenceBar.tsx`
**Props:** `{ totalProducts: number, stats: ProductStats }`
**Features:**

- Top 3 insights globais (maior ROI, mais crítico, melhor oportunidade)
- Quick actions (sync, bulk edit, export insights)
- Auto-refresh indicator

### 2. ProductPriceInsight (Por produto)

**Arquivo:** `components/produtos/ProductPriceInsight.tsx`
**Props:** `{ product: Product, compactMode?: boolean }`
**Features:**

- Preço ótimo calculado (elasticidade -1.2 mock)
- Comparação vs preço atual (% diferença)
- ROI estimado se ajustar
- Badge (crítico/oportunidade/ótimo)

### 3. ProductTitleQuality (Por produto)

**Arquivo:** `components/produtos/ProductTitleQuality.tsx`
**Props:** `{ product: Product }`
**Features:**

- Score 0-100 (chars, keywords, termos proibidos)
- Breakdown: comprimento (max 60), keywords (min 3), proibidos (0)
- Sugestões específicas por produto
- Badge color-coded (excelente/bom/melhorar/crítico)

### 4. ProductCompetitorPosition (Por produto)

**Arquivo:** `components/produtos/ProductCompetitorPosition.tsx`
**Props:** `{ product: Product }`
**Features:**

- Ranking simulado (posição X de Y)
- Preço vs média concorrentes
- Rating vs média
- Badge (vantagem/neutro/desvantagem)

### 5. ProductIntelligenceRow (Wrapper)

**Arquivo:** `components/produtos/ProductIntelligenceRow.tsx`
**Props:** `{ product: Product, expanded?: boolean, onToggle: () => void }`
**Features:**

- Layout responsivo (grid 3 cols em desktop)
- Expansão/colapso insights
- Compact view (só badges) vs Full view (cards completos)

## 📊 Dados Mock (Sprint 3)

### Elasticidade por Produto

```typescript
const elasticityMap = {
  MLB123456: -1.8, // Muito elástico (oportunidade baixar preço)
  MLB789012: -0.4, // Inelástico (pode subir preço)
  MLB345678: -1.2, // Moderado
  default: -1.0,
};
```

### Score Título

```typescript
function calculateTitleScore(title: string): {
  score: number;
  breakdown: { length: number; keywords: number; forbidden: number };
  suggestions: string[];
} {
  const length = title.length;
  const lengthScore =
    length >= 40 && length <= 60 ? 35 : Math.max(0, 35 - Math.abs(50 - length));

  // Keywords mock (top 5 ML keywords: "original", "novo", "garantia", "frete grátis", "promoção")
  const keywords = ["original", "novo", "garantia"].filter((k) =>
    title.toLowerCase().includes(k)
  ).length;
  const keywordScore = Math.min(35, keywords * 12);

  // Forbidden terms (superlatives, fake urgency)
  const forbidden = [
    "barato",
    "imperdível",
    "última unidade",
    "oferta relâmpago",
  ].filter((f) => title.toLowerCase().includes(f)).length;
  const forbiddenPenalty = forbidden * 15;

  const finalScore = Math.max(
    0,
    Math.min(100, lengthScore + keywordScore - forbiddenPenalty)
  );

  return {
    score: finalScore,
    breakdown: {
      length: lengthScore,
      keywords: keywordScore,
      forbidden: forbiddenPenalty,
    },
    suggestions: [
      length < 40 ? "Adicione mais detalhes (mínimo 40 caracteres)" : null,
      keywords < 2
        ? "Inclua palavras-chave: 'original', 'garantia', 'novo'"
        : null,
      forbidden > 0
        ? `Remova termos proibidos: ${forbidden} encontrados`
        : null,
    ].filter(Boolean) as string[],
  };
}
```

### Posição Competitiva

```typescript
const competitorPositions = {
  MLB123456: { rank: 2, total: 15, avgPrice: 950, avgRating: 4.2 },
  MLB789012: { rank: 8, total: 12, avgPrice: 120, avgRating: 4.5 },
  default: { rank: 5, total: 10, avgPrice: 0, avgRating: 4.0 },
};
```

## 🔄 Sequência de Implementação

### Fase 1: Components (1-2h)

1. ✅ ProductIntelligenceBar.tsx (header insights)
2. ✅ ProductPriceInsight.tsx (preço ótimo)
3. ✅ ProductTitleQuality.tsx (score título)
4. ✅ ProductCompetitorPosition.tsx (ranking)
5. ✅ ProductIntelligenceRow.tsx (wrapper expansível)

### Fase 2: Integration (30min-1h)

6. ✅ Refatorar /produtos/page.tsx:
   - Adicionar ProductIntelligenceBar no topo
   - Substituir ProductList items por ProductIntelligenceRow
   - State management para expansão (useState com array de IDs expandidos)
   - Manter filtros e paginação existentes

### Fase 3: Polish (30min)

7. ✅ TypeScript validation (0 errors)
8. ✅ Responsive design (mobile collapse insights)
9. ✅ Commit + Push
10. ✅ Update TODO list

## 📈 Métricas de Sucesso

- ✅ Todos produtos mostram 3 insights (preço, título, competição)
- ✅ Expansão/colapso funcional
- ✅ Mock data realista (elasticidade -2.0 a -0.4, scores 0-100, ranks 1-15)
- ✅ TypeScript 0 errors
- ✅ ~500-600 linhas de novos components
- ✅ Portuguese locale (pt-BR)

## 🎨 Design Principles

- **Compact by default**: Mostrar badges resumidos, expandir para detalhes
- **Action-oriented**: Cada insight tem recomendação clara ("Reduza 10%" vs "Preço -10%")
- **Color-coded**: Verde (ótimo), Amarelo (atenção), Vermelho (crítico), Azul (oportunidade)
- **Progressive disclosure**: Informação básica sempre visível, detalhes sob demanda

## 📝 Notas de Implementação

- Manter API `/api/products` intacta (não modificar backend neste sprint)
- Mock data inline nos components (facilita demo)
- Future: criar `/api/products/insights/[id]` para dados reais
- Considerar virtualization se lista > 100 produtos (react-window)
