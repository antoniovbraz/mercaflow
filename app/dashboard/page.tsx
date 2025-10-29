import { redirect } from "next/navigation";
import Link from "next/link";

import { IntelligenceCenter } from "@/components/dashboard/IntelligenceCenter";
import { QuickMetricsBar } from "@/components/dashboard/QuickMetricsBar";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { TooltipHelp } from "@/components/ui/tooltip-help";
import { getCurrentUser } from "@/utils/supabase/server";
import { getUserRole, type UserRole } from "@/utils/supabase/roles";

const quickAccessCards = (
  role: UserRole
): Array<{
  title: string;
  description: string;
  href: string;
  badge?: string;
}> => {
  const cards = [
    {
      title: "Catálogo de produtos",
      description: "Monitore estoque, sincronizações e recomendações de preço.",
      href: "/dashboard/produtos",
    },
    {
      title: "Pedidos e SLA",
      description:
        "Acompanhe vendas, prazos de entrega e notificações críticas.",
      href: "/dashboard/pedidos",
    },
    {
      title: "Integração Mercado Livre",
      description:
        "Gerencie tokens, webhooks e status da sincronização em tempo real.",
      href: "/dashboard/ml",
      badge: "Integração",
    },
    {
      title: "Configurações do tenant",
      description:
        "Personalize limites, notificações e preferências da equipe.",
      href: "/dashboard/configuracoes",
    },
  ];

  if (role === "super_admin") {
    cards.push({
      title: "Painel administrativo",
      description:
        "Gerencie tenants, usuários e políticas globais com auditoria.",
      href: "/admin",
      badge: "Super admin",
    });
  }

  return cards;
};

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const role = (await getUserRole()) ?? "user";

  return (
    <div className="space-y-12">
      <PageHeader
        title="Visão geral da operação"
        description="Acompanhe métricas críticas, recomendações da IA e próximos passos do tenant."
        helpText="Esta tela reúne KPIs, insights e atalhos para as áreas mais usadas. As métricas refletem o período dos últimos 30 dias."
        breadcrumbs={[{ label: "Dashboard" }]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href="/dashboard/ml">Status das integrações</Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard/produtos">Abrir catálogo</Link>
            </Button>
          </div>
        }
      />

      <section aria-labelledby="dashboard-kpis" className="space-y-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2
              id="dashboard-kpis"
              className="text-lg font-semibold text-text-primary"
            >
              Indicadores rápidos
            </h2>
            <p className="text-sm text-text-secondary">
              Atualizados a cada 5 minutos com base nos dados do Mercado Livre.
            </p>
          </div>
          <TooltipHelp
            label="Como interpretar estes KPIs"
            description="Os valores comparam os últimos 30 dias com o período anterior. Sinais em verde indicam melhoria."
          />
        </div>
        <QuickMetricsBar />
      </section>

      <section aria-labelledby="dashboard-intelligence" className="space-y-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2
              id="dashboard-intelligence"
              className="text-lg font-semibold text-text-primary"
            >
              Recomendações da IA
            </h2>
            <p className="text-sm text-text-secondary">
              Priorize ações de maior impacto sugeridas pelo Intelligence
              Center.
            </p>
          </div>
          <TooltipHelp
            label="Sobre o Intelligence Center"
            description="As recomendações são calculadas com base em elasticidade de preço, performance de anúncios e concorrência."
          />
        </div>
        <IntelligenceCenter compactMode={false} />
      </section>

      <section aria-labelledby="dashboard-atalhos" className="space-y-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2
              id="dashboard-atalhos"
              className="text-lg font-semibold text-text-primary"
            >
              Próximas ações
            </h2>
            <p className="text-sm text-text-secondary">
              Acesse rapidamente as áreas mais usadas do painel.
            </p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {quickAccessCards(role).map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="group flex flex-col gap-3 rounded-lg border border-outline-subtle bg-surface-elevated p-5 transition-colors hover:border-intent-brand hover:bg-intent-brand/5"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-text-primary">
                  {card.title}
                </h3>
                {card.badge ? (
                  <span className="rounded-full bg-intent-brand/10 px-2 py-0.5 text-xs font-semibold text-intent-brand">
                    {card.badge}
                  </span>
                ) : null}
              </div>
              <p className="text-sm text-text-secondary">{card.description}</p>
              <span className="text-sm font-semibold text-intent-brand">
                Acessar
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
