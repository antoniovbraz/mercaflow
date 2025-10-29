import { redirect } from "next/navigation";
import Link from "next/link";

import { ElasticityChart } from "@/components/analytics/ElasticityChart";
import { ForecastChart } from "@/components/analytics/ForecastChart";
import { CompetitorAnalysis } from "@/components/analytics/CompetitorAnalysis";
import { PageHeader } from "@/components/ui/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TooltipHelp } from "@/components/ui/tooltip-help";
import { getCurrentUser } from "@/utils/supabase/server";

const HIGHLIGHTS = [
  {
    title: "Elasticidade média",
    value: "-1,2",
    helper: "Demanda elástica detectada",
  },
  {
    title: "Precisão do forecast",
    value: "87%",
    helper: "Últimos 30 dias",
  },
  {
    title: "Posição competitiva",
    value: "2º",
    helper: "Entre 15 vendedores",
  },
  {
    title: "ROI potencial",
    value: "R$ 8,5 mil",
    helper: "Com base em recomendações da IA",
  },
];

export default async function AnalyticsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="space-y-10">
      <PageHeader
        title="Analytics Intelligence"
        description="Modelos de elasticidade, previsão e competitividade para orientar decisões de preço e estoque."
        helpText="Os gráficos consideram os últimos 90 dias, com atualização automática a cada sincronização completa do Mercado Livre."
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Analytics" },
        ]}
        actions={
          <Badge variant="secondary" className="uppercase">
            Em tempo real
          </Badge>
        }
      />

      <section aria-labelledby="analytics-overview" className="space-y-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2
              id="analytics-overview"
              className="text-lg font-semibold text-text-primary"
            >
              Indicadores avançados
            </h2>
            <p className="text-sm text-text-secondary">
              Valores comparados com o período anterior e atualizados na última
              sincronização.
            </p>
          </div>
          <TooltipHelp
            label="Sobre os indicadores"
            description="Elasticidade inferior a -1 indica demanda elástica. A posição competitiva acompanha o ranking da categoria monitorada."
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {HIGHLIGHTS.map((item) => (
            <Card
              key={item.title}
              className="border-outline-subtle bg-surface-elevated"
            >
              <CardHeader className="space-y-1 pb-3">
                <CardTitle className="text-sm font-semibold text-text-secondary">
                  {item.title}
                </CardTitle>
                <p className="text-2xl font-semibold text-text-primary">
                  {item.value}
                </p>
              </CardHeader>
              <CardContent className="pt-0 text-sm text-text-muted">
                {item.helper}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section aria-labelledby="analytics-models" className="space-y-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2
              id="analytics-models"
              className="text-lg font-semibold text-text-primary"
            >
              Modelos e previsões
            </h2>
            <p className="text-sm text-text-secondary">
              Explore relações de preço-demanda, projeções de vendas e benchmark
              com concorrência.
            </p>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <Card className="border-outline-subtle bg-surface-elevated">
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div>
                <CardTitle className="text-xl text-text-primary">
                  Elasticidade de preços
                </CardTitle>
                <CardDescription className="text-text-secondary">
                  Curva preço-demanda e pontos ideais de ajuste.
                </CardDescription>
              </div>
              <TooltipHelp
                label="Como interpretar"
                description="A elasticidade indica o quanto a demanda varia conforme ajustes de preço. Valores menores que -1 indicam alta sensibilidade."
              />
            </CardHeader>
            <CardContent className="pt-0">
              <ElasticityChart compactMode={false} />
            </CardContent>
          </Card>

          <Card className="border-outline-subtle bg-surface-elevated">
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div>
                <CardTitle className="text-xl text-text-primary">
                  Forecast de vendas
                </CardTitle>
                <CardDescription className="text-text-secondary">
                  Projeções de 30, 60 e 90 dias com intervalo de confiança.
                </CardDescription>
              </div>
              <TooltipHelp
                label="Sobre o forecast"
                description="Os modelos combinam séries temporais e variáveis externas (preço, sazonalidade, estoque) para estimar demanda futura."
              />
            </CardHeader>
            <CardContent className="pt-0">
              <ForecastChart compactMode={false} />
            </CardContent>
          </Card>

          <Card className="border-outline-subtle bg-surface-elevated xl:col-span-2">
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div>
                <CardTitle className="text-xl text-text-primary">
                  Análise competitiva
                </CardTitle>
                <CardDescription className="text-text-secondary">
                  Benchmarking com os principais concorrentes acompanhados.
                </CardDescription>
              </div>
              <TooltipHelp
                label="Origem dos dados"
                description="Comparação baseada em scraping autorizado do Mercado Livre, considerando preço, reputação e SLA de envio."
              />
            </CardHeader>
            <CardContent className="pt-0">
              <CompetitorAnalysis category="Eletrônicos" />
            </CardContent>
          </Card>
        </div>
      </section>

      <section aria-labelledby="analytics-insights" className="space-y-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2
              id="analytics-insights"
              className="text-lg font-semibold text-text-primary"
            >
              Insights rápidos
            </h2>
            <p className="text-sm text-text-secondary">
              Sugestões geradas automaticamente a partir dos dados mais
              recentes.
            </p>
          </div>
        </div>

        <Card className="border-outline-subtle bg-surface-elevated">
          <CardContent className="grid gap-4 p-6 md:grid-cols-3">
            <div className="rounded-lg border border-outline-subtle bg-surface p-4">
              <p className="text-sm font-semibold text-text-primary">
                Melhor janela para ajustes
              </p>
              <p className="mt-1 text-sm text-text-secondary">
                Terça-feira, 10h às 12h concentra 28% das visualizações.
              </p>
            </div>
            <div className="rounded-lg border border-outline-subtle bg-surface p-4">
              <p className="text-sm font-semibold text-text-primary">
                Categoria em alta
              </p>
              <p className="mt-1 text-sm text-text-secondary">
                Eletrônicos cresceram 32% na última semana vs. base histórica.
              </p>
            </div>
            <div className="rounded-lg border border-outline-subtle bg-surface p-4">
              <p className="text-sm font-semibold text-text-primary">
                Produtos com margem ociosa
              </p>
              <p className="mt-1 text-sm text-text-secondary">
                3 itens estão 15% abaixo do preço ideal estimado pela IA.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-right">
          <Link
            href="/dashboard/analytics?export=csv"
            className="text-sm font-semibold text-intent-brand underline-offset-4 hover:underline"
          >
            Exportar dados detalhados
          </Link>
        </div>
      </section>
    </div>
  );
}
