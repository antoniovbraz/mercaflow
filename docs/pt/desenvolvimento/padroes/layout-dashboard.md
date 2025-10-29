# Layout unificado do dashboard

O layout das rotas em `/dashboard` agora utiliza uma base compartilhada para garantir consistência visual, acessibilidade e integração com o sistema multi-tenant. Esta nota descreve os componentes obrigatórios e as práticas recomendadas para novas páginas internas.

## Componentes centrais

- `DashboardShell`: fornece a estrutura com navegação lateral, cabeçalho fixo, barra de busca e metadados do tenant. Todas as páginas dentro de `/app/dashboard/*` recebem o shell automaticamente pelo `layout.tsx`.
- `PageHeader`: apresenta título, breadcrumbs, descrição e ações primárias. Inclua `helpText` sempre que houver contexto adicional; o helper utiliza `TooltipHelp`.
- Cartões (`Card`, `CardHeader`, `CardContent`): para métricas rápidas e insights. Aplique `border-outline-subtle` e `bg-surface-elevated` para manter contraste adequado.
- Tabelas (`Table`, `TableHead`, `TableRow`, etc.): exibir amostras ou resumos. Utilize classes `text-text-secondary` nos cabeçalhos e mantenha o caption com link para telas completas.
- `Button` e `Badge`: respeite os variantes padrão. Para estados (ex.: sucesso, alerta) aplique classes utilitárias `bg-intent-*/10` e `text-intent-*`.

## Diretrizes de uso

1. Valide permissão com `requireRole` diretamente na página server-side. O shell já garante sessão, mas regras de RBAC devem ser explícitas.
2. Organize o conteúdo em seções com `aria-labelledby` e títulos (`h2`). Isso facilita navegação por tecnologias assistivas.
3. Inclua `TooltipHelp` para indicadores compostos, explicando cálculos, SLA ou origem dos dados.
4. Links para fluxos completos (`/pedidos`, `/produtos`, etc.) devem usar `Button` ou anchors com `underline-offset-4` conforme o contexto.
5. Prefira grids responsivos (`md:grid-cols-2`, `xl:grid-cols-4`) para métricas. Mantenha `space-y-10` entre blocos principais.

## Integração de dados

- Métricas de `/dashboard/pedidos` e `/dashboard/produtos` agora consultam o Supabase em tempo real, consolidando integrações do tenant em janelas de 24h e 30 dias.
- Utilize sempre o client server-side (`createClient`) dentro das páginas e filtre por `integration_id` obtido via `ml_integrations` (status `active`).
- Quando não houver histórico, mantenha mensagens orientativas nos cards (ex.: "Sem histórico", "Conecte uma integração"). Evite esconder métricas.
- Priorize cálculos determinísticos na própria página ou em utils reutilizáveis. Para agregações pesadas, considere endpoints (`app/api/dashboard/*`) com caching ou materialized views.

## Checklist para novas páginas

- [ ] Breadcrumbs atualizados e coerentes com a hierarquia do dashboard.
- [ ] Pelo menos uma seção de métricas ou status com cartões neutros.
- [ ] Um bloco operacional (tabela, lista, gráfico ou alerta) com caption/CTA para aprofundamento.
- [ ] Tooltips explicando métricas críticas.
- [ ] Ação primária clara no header (link para visão completa, exportação ou sincronização).

## Exemplo mínimo

```tsx
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default async function ExamplePage() {
  return (
    <div className="space-y-10">
      <PageHeader
        title="Exemplo"
        description="Descrição do módulo em poucas palavras."
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Exemplo" },
        ]}
      />

      <section aria-labelledby="example-metrics" className="space-y-4">
        <h2
          id="example-metrics"
          className="text-lg font-semibold text-text-primary"
        >
          Indicadores chave
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-outline-subtle bg-surface-elevated">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-text-secondary">
                Métrica
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 text-2xl font-semibold text-text-primary">
              123
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
```

Manter essas diretrizes garante que o dashboard continue alinhado ao design system, facilite iterações futuras e preserve a experiência consistente entre módulos operacionais, inteligência e configurações.

## Status das rotas (nov/2025)

- `/dashboard/pedidos`: atualizado para usar KPIs reais (Supabase) com comparação de 24h e lista de pedidos recentes.
- `/dashboard/produtos`: métricas de cobertura, giro e alertas alimentadas por vendas/estoque do Supabase.
- `/dashboard/ml`: layout legado com gradientes — requer migração para `DashboardShell` + métricas compatíveis.
- `/dashboard/configuracoes`: ainda utiliza UI antiga (cards brilhantes). Avaliar refactor para os novos padrões.
