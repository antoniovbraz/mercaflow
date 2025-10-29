import Link from "next/link";
import { redirect } from "next/navigation";
import { Boxes, Sparkles } from "lucide-react";

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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption,
} from "@/components/ui/table";
import { requireRole } from "@/utils/supabase/roles";
import { createClient } from "@/utils/supabase/server";
import { getCurrentTenantId } from "@/utils/supabase/tenancy";
import { logger } from "@/utils/logger";

const LOW_STOCK_THRESHOLD = 5;
const ATTENTION_THRESHOLD = 12;
const RECENT_UPDATE_WINDOW_DAYS = 7;
const SELL_THROUGH_WINDOW_DAYS = 30;
const COVERAGE_TARGET_DAYS = 21;
const PRICE_REFRESH_TARGET = 0.7;

interface ProductMetric {
  label: string;
  value: string;
  helper: string;
  badge: string;
}

interface TopSkuRow {
  sku: string;
  name: string;
  conversion: string;
  price: string;
  stockStatus: keyof typeof STOCK_STYLE;
  position: string;
}

interface InventoryAlert {
  sku: string;
  name: string;
  daysLeft: string;
  action: string;
  status: "Reposição urgente" | "Ajuste recomendado" | "Monitorar";
}

interface ProductsOverview {
  metrics: ProductMetric[];
  topSkus: TopSkuRow[];
  alerts: InventoryAlert[];
  hasIntegrations: boolean;
}

type RawProduct = {
  ml_item_id?: string | null;
  title?: string | null;
  price?: string | number | null;
  available_quantity?: string | number | null;
  sold_quantity?: string | number | null;
  listing_type_id?: string | null;
  category_id?: string | null;
  updated_at?: string | null;
  created_at?: string | null;
  status?: string | null;
  ml_data?: Record<string, unknown> | null;
};

type RawOrder = {
  ml_data?: Record<string, unknown> | null;
  items?: unknown;
};

type SoldSkuMetrics = {
  quantity: number;
  revenue: number;
};

const STOCK_STYLE: Record<string, string> = {
  healthy: "bg-intent-success/10 text-intent-success border-transparent",
  attention: "bg-intent-warning/10 text-intent-warning border-transparent",
  warning: "bg-intent-danger/10 text-intent-danger border-transparent",
  monitor: "bg-surface text-text-secondary border-outline-subtle",
};

const STOCK_LABEL: Record<string, string> = {
  healthy: "Estável",
  attention: "Atenção",
  warning: "Reposição",
  monitor: "Monitorar",
};

const ALERT_BADGE_STYLE: Record<InventoryAlert["status"], string> = {
  "Reposição urgente":
    "border-transparent bg-intent-danger/10 text-intent-danger",
  "Ajuste recomendado":
    "border-transparent bg-intent-warning/10 text-intent-warning",
  Monitorar: "border-outline-subtle bg-surface text-text-secondary",
};

function toNumber(value: unknown): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("pt-BR").format(value);
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercent(value: number, digits = 1): string {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

function formatDays(value: number): string {
  const rounded = Math.round(value);
  if (rounded <= 0) return "< 1 dia";
  return `${rounded} dia${rounded > 1 ? "s" : ""}`;
}

function extractOrderItems(
  raw: RawOrder
): Array<{ id: string; quantity: number; unitPrice: number }> {
  const sources = [raw.items, raw.ml_data?.order_items];

  for (const source of sources) {
    if (!Array.isArray(source)) continue;

    const items = source
      .map((entry) => {
        if (!entry || typeof entry !== "object") return null;
        const data = entry as Record<string, unknown>;
        const nestedItem =
          typeof data.item === "object" && data.item !== null
            ? (data.item as Record<string, unknown>)
            : undefined;

        const idCandidate = [data.item_id, nestedItem?.id, data.id].find(
          (value) => typeof value === "string" && value.trim().length > 0
        );

        const sku = typeof idCandidate === "string" ? idCandidate : "";
        if (!sku) return null;

        const quantity = toNumber(data.quantity ?? nestedItem?.quantity);
        const unitPrice = toNumber(data.unit_price ?? nestedItem?.unit_price);

        return {
          id: sku,
          quantity,
          unitPrice,
        };
      })
      .filter(
        (item): item is { id: string; quantity: number; unitPrice: number } =>
          Boolean(item)
      );

    if (items.length > 0) {
      return items;
    }
  }

  return [];
}

function buildSoldMap(orders: RawOrder[]): Map<string, SoldSkuMetrics> {
  const soldMap = new Map<string, SoldSkuMetrics>();

  for (const order of orders) {
    const items = extractOrderItems(order);

    for (const item of items) {
      if (!soldMap.has(item.id)) {
        soldMap.set(item.id, { quantity: 0, revenue: 0 });
      }
      const entry = soldMap.get(item.id);
      if (!entry) continue;
      entry.quantity += item.quantity;
      entry.revenue += item.quantity * item.unitPrice;
    }
  }

  return soldMap;
}

function derivePosition(product: RawProduct): string {
  const category =
    typeof product.category_id === "string" &&
    product.category_id.trim().length > 0
      ? product.category_id
      : null;
  const listing =
    typeof product.listing_type_id === "string" &&
    product.listing_type_id.trim().length > 0
      ? product.listing_type_id
      : null;

  if (category) return `Categoria ${category}`;
  if (listing) return `Formato ${listing}`;
  return "Sem categoria";
}

function computeStockStatus(available: number): keyof typeof STOCK_STYLE {
  if (available <= LOW_STOCK_THRESHOLD) return "warning";
  if (available <= ATTENTION_THRESHOLD) return "attention";
  if (available > 0) return "healthy";
  return "monitor";
}

function buildAlerts(
  products: RawProduct[],
  soldMap: Map<string, SoldSkuMetrics>
): InventoryAlert[] {
  const candidates = products
    .filter(
      (product) => toNumber(product.available_quantity) <= ATTENTION_THRESHOLD
    )
    .sort(
      (a, b) => toNumber(a.available_quantity) - toNumber(b.available_quantity)
    )
    .slice(0, 3);

  return candidates.map((product) => {
    const sku = product.ml_item_id ?? "—";
    const available = Math.max(toNumber(product.available_quantity), 0);
    const sold = soldMap.get(sku)?.quantity ?? 0;
    const dailyVelocity = sold / SELL_THROUGH_WINDOW_DAYS;
    const daysLeft = dailyVelocity > 0 ? available / dailyVelocity : null;

    const status: InventoryAlert["status"] =
      available <= LOW_STOCK_THRESHOLD
        ? "Reposição urgente"
        : sold > 0
        ? "Ajuste recomendado"
        : "Monitorar";
    const action =
      dailyVelocity > 0
        ? `Solicitar ${Math.max(
            Math.round(dailyVelocity * 7),
            1
          )} un. para manter o giro semanal`
        : "Ativar promoção ou revisar preço para gerar giro";

    return {
      sku,
      name: product.title ?? "Produto sem título",
      daysLeft:
        daysLeft !== null && Number.isFinite(daysLeft)
          ? formatDays(daysLeft)
          : "Sem histórico",
      action,
      status,
    };
  });
}

async function loadProductsOverview(
  tenantId: string
): Promise<ProductsOverview> {
  const supabase = await createClient();

  const { data: integrations, error: integrationsError } = await supabase
    .from("ml_integrations")
    .select("id")
    .eq("tenant_id", tenantId)
    .eq("status", "active");

  if (integrationsError) {
    logger.error("Erro ao carregar integrações para métricas de produtos", {
      error: integrationsError,
    });
    return {
      metrics: getEmptyMetrics(false),
      topSkus: [],
      alerts: [],
      hasIntegrations: false,
    };
  }

  const integrationIds = (integrations ?? [])
    .map((integration) => integration.id)
    .filter(Boolean);
  const hasIntegrations = integrationIds.length > 0;

  if (!hasIntegrations) {
    return {
      metrics: getEmptyMetrics(false),
      topSkus: [],
      alerts: [],
      hasIntegrations: false,
    };
  }

  const now = new Date();
  const last30Iso = new Date(
    now.getTime() - SELL_THROUGH_WINDOW_DAYS * 24 * 60 * 60 * 1000
  ).toISOString();
  const recentUpdateThreshold = new Date(
    now.getTime() - RECENT_UPDATE_WINDOW_DAYS * 24 * 60 * 60 * 1000
  );
  const newSkuThreshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const productsQuery = supabase
    .from("ml_products")
    .select(
      "ml_item_id,title,price,available_quantity,sold_quantity,listing_type_id,category_id,updated_at,created_at,status,ml_data"
    )
    .eq("status", "active");

  const ordersQuery = supabase
    .from("ml_orders")
    .select("ml_data,items")
    .gte("date_created", last30Iso);

  if (integrationIds.length === 1) {
    const [integrationId] = integrationIds;
    productsQuery.eq("integration_id", integrationId);
    ordersQuery.eq("integration_id", integrationId);
  } else {
    productsQuery.in("integration_id", integrationIds);
    ordersQuery.in("integration_id", integrationIds);
  }

  const [productsResult, ordersResult] = await Promise.all([
    productsQuery,
    ordersQuery,
  ]);

  if (productsResult.error) {
    logger.error("Erro ao carregar produtos para métricas", {
      error: productsResult.error,
    });
  }
  if (ordersResult.error) {
    logger.error(
      "Erro ao carregar pedidos para consolidar métricas de produtos",
      {
        error: ordersResult.error,
      }
    );
  }

  const products = (productsResult.data ?? []) as RawProduct[];
  const orders = (ordersResult.data ?? []) as RawOrder[];
  const soldMap = buildSoldMap(orders);

  const totalInventory = products.reduce(
    (sum, product) => sum + Math.max(toNumber(product.available_quantity), 0),
    0
  );
  const totalSoldLast30 = Array.from(soldMap.values()).reduce(
    (sum, entry) => sum + entry.quantity,
    0
  );
  const dailyVelocity = totalSoldLast30 / SELL_THROUGH_WINDOW_DAYS;
  const coverageDays =
    dailyVelocity > 0 ? totalInventory / dailyVelocity : null;

  const activeSkus = products.length;
  const newSkus = products.filter((product) => {
    if (!product.created_at) return false;
    const created = new Date(product.created_at);
    return !Number.isNaN(created.getTime()) && created >= newSkuThreshold;
  }).length;

  const recentlyUpdated = products.filter((product) => {
    if (!product.updated_at) return false;
    const updated = new Date(product.updated_at);
    return !Number.isNaN(updated.getTime()) && updated >= recentUpdateThreshold;
  }).length;

  const alertCandidatesCount = products.filter(
    (product) => toNumber(product.available_quantity) <= ATTENTION_THRESHOLD
  ).length;
  const criticalAlertsCount = products.filter(
    (product) => toNumber(product.available_quantity) <= LOW_STOCK_THRESHOLD
  ).length;

  const priceRefreshRatio = activeSkus > 0 ? recentlyUpdated / activeSkus : 0;
  const priceRefreshBadge =
    priceRefreshRatio >= PRICE_REFRESH_TARGET
      ? "Meta atingida"
      : activeSkus > 0
      ? `Atualizar ${Math.max(
          Math.round((PRICE_REFRESH_TARGET - priceRefreshRatio) * activeSkus),
          1
        )} SKU(s)`
      : "Sem SKUs ativos";

  const metrics: ProductMetric[] = [
    {
      label: "SKUs ativos",
      value: formatNumber(activeSkus),
      helper:
        activeSkus > 0 ? "Produtos sincronizados" : "Sem produtos disponíveis",
      badge:
        newSkus > 0
          ? `+${formatNumber(newSkus)} novos nesta semana`
          : "Nenhum SKU novo",
    },
    {
      label: "Cobertura de estoque",
      value: coverageDays !== null ? formatDays(coverageDays) : "Sem histórico",
      helper: "Projeção média baseada no giro dos últimos 30 dias",
      badge:
        coverageDays !== null
          ? coverageDays >= COVERAGE_TARGET_DAYS
            ? "Meta mínima: 21 dias"
            : `Faltam ${formatDays(
                Math.max(COVERAGE_TARGET_DAYS - coverageDays, 0)
              )}`
          : "Aguardando histórico de vendas",
    },
    {
      label: "Itens com alerta",
      value: formatNumber(alertCandidatesCount),
      helper: "Baixo estoque ou margem crítica",
      badge:
        alertCandidatesCount > 0
          ? `${formatNumber(criticalAlertsCount)} em estado crítico`
          : "Tudo dentro do esperado",
    },
    {
      label: "Preço atualizado",
      value: `${formatPercent(priceRefreshRatio * 100, 0)}%`,
      helper: "Produtos revisados nos últimos 7 dias",
      badge: priceRefreshBadge,
    },
  ];

  const topSkus = products
    .map((product) => {
      const sku = product.ml_item_id ?? "";
      const available = Math.max(toNumber(product.available_quantity), 0);
      const sold =
        soldMap.get(sku)?.quantity ??
        Math.max(toNumber(product.sold_quantity), 0);
      const price = toNumber(product.price);
      const total = available + sold;
      const sellThrough = total > 0 ? Math.min((sold / total) * 100, 100) : 0;

      return {
        sold,
        row: {
          sku: sku || "Sem SKU",
          name: product.title ?? "Produto sem título",
          conversion: sold > 0 ? `${formatPercent(sellThrough, 1)}%` : "—",
          price: price > 0 ? formatCurrency(price) : "—",
          stockStatus: computeStockStatus(available),
          position: derivePosition(product),
        },
      };
    })
    .sort((a, b) => b.sold - a.sold)
    .slice(0, 3)
    .map((entry) => entry.row);

  const alerts = buildAlerts(products, soldMap);

  return {
    metrics,
    topSkus,
    alerts,
    hasIntegrations: true,
  };
}

function getEmptyMetrics(hasIntegrations: boolean): ProductMetric[] {
  return [
    {
      label: "SKUs ativos",
      value: "0",
      helper: hasIntegrations
        ? "Sem produtos sincronizados"
        : "Conecte uma integração",
      badge: "Nenhum SKU novo",
    },
    {
      label: "Cobertura de estoque",
      value: "Sem histórico",
      helper: "Projeção média baseada em giro",
      badge: "Aguardando histórico de vendas",
    },
    {
      label: "Itens com alerta",
      value: "0",
      helper: "Baixo estoque ou margem crítica",
      badge: "Sem alertas",
    },
    {
      label: "Preço atualizado",
      value: "0%",
      helper: "Produtos revisados nos últimos 7 dias",
      badge: hasIntegrations ? "Revisão necessária" : "Conecte o ML",
    },
  ];
}

export default async function ProdutosPage() {
  try {
    await requireRole("user");
  } catch {
    redirect("/login");
  }

  const tenantId = await getCurrentTenantId();

  if (!tenantId) {
    redirect("/onboarding");
  }

  const overview = await loadProductsOverview(tenantId);
  const hasTopSkus = overview.topSkus.length > 0;
  const hasAlerts = overview.alerts.length > 0;

  return (
    <div className="space-y-10">
      <PageHeader
        title="Produtos"
        description="Monitore cobertura de estoque, desempenho de SKUs e recomendações de preço usando dados sincronizados do Mercado Livre."
        helpText="Os KPIs utilizam o giro dos últimos 30 dias, considerando apenas integrações ativas do tenant. Atualize o catálogo para refinar as projeções."
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Produtos" },
        ]}
        actions={[
          {
            href: "/produtos",
            label: "Gerenciar catálogo completo",
            variant: "default",
          },
        ]}
      />

      <section aria-labelledby="products-metrics" className="space-y-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2
              id="products-metrics"
              className="text-lg font-semibold text-text-primary"
            >
              Indicadores de catálogo
            </h2>
            <p className="text-sm text-text-secondary">
              Acompanhe saúde de estoque e atualização de preços para priorizar
              ações no marketplace.
            </p>
          </div>
          <TooltipHelp
            label="Como calculamos"
            description="Cobertura considera o giro dos últimos 30 dias. O indicador de preço avalia quantos SKUs foram atualizados na última semana."
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {overview.metrics.map((metric) => (
            <Card
              key={metric.label}
              className="border-outline-subtle bg-surface-elevated"
            >
              <CardHeader className="space-y-1 pb-3">
                <CardTitle className="text-sm font-semibold text-text-secondary">
                  {metric.label}
                </CardTitle>
                <p className="text-2xl font-semibold text-text-primary">
                  {metric.value}
                </p>
              </CardHeader>
              <CardContent className="flex items-center justify-between gap-2 pt-0 text-sm text-text-muted">
                <span>{metric.helper}</span>
                <Badge className="border-transparent bg-surface text-text-secondary">
                  {metric.badge}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section aria-labelledby="products-performance" className="space-y-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2
              id="products-performance"
              className="text-lg font-semibold text-text-primary"
            >
              SKUs com melhor desempenho
            </h2>
            <p className="text-sm text-text-secondary">
              Utilize esta visão para manter estoque saudável nos itens que mais
              convertem nas últimas semanas.
            </p>
          </div>
        </div>

        <Card className="border-outline-subtle bg-surface-elevated">
          <CardHeader className="pb-4">
            <div className="flex flex-col gap-1">
              <CardTitle className="text-xl text-text-primary">
                Top SKUs por giro (30 dias)
              </CardTitle>
              <CardDescription className="text-text-secondary">
                Ranking baseado em volume vendido e estoque disponível para
                evitar ruptura nos produtos líderes.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <Table>
              <TableHeader>
                <TableRow className="border-outline-subtle">
                  <TableHead className="text-xs uppercase tracking-wide text-text-secondary">
                    SKU
                  </TableHead>
                  <TableHead className="text-xs uppercase tracking-wide text-text-secondary">
                    Produto
                  </TableHead>
                  <TableHead className="text-xs uppercase tracking-wide text-text-secondary text-center">
                    Giro
                  </TableHead>
                  <TableHead className="text-xs uppercase tracking-wide text-text-secondary text-right">
                    Preço
                  </TableHead>
                  <TableHead className="text-xs uppercase tracking-wide text-text-secondary text-center">
                    Estoque
                  </TableHead>
                  <TableHead className="text-xs uppercase tracking-wide text-text-secondary">
                    Contexto
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {hasTopSkus ? (
                  overview.topSkus.map((sku) => (
                    <TableRow
                      key={sku.sku}
                      className="border-outline-subtle/80"
                    >
                      <TableCell className="font-semibold text-text-primary">
                        {sku.sku}
                      </TableCell>
                      <TableCell className="max-w-[260px] truncate text-text-secondary">
                        {sku.name}
                      </TableCell>
                      <TableCell className="text-center font-semibold text-text-primary">
                        {sku.conversion}
                      </TableCell>
                      <TableCell className="text-right text-text-primary">
                        {sku.price}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          className={
                            STOCK_STYLE[sku.stockStatus] ?? STOCK_STYLE.monitor
                          }
                        >
                          {STOCK_LABEL[sku.stockStatus] ?? STOCK_LABEL.monitor}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-text-secondary">
                        {sku.position}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-10 text-center text-sm text-text-muted"
                    >
                      Nenhum SKU com vendas nos últimos 30 dias. Sincronize o
                      catálogo para gerar histórico e liberar esta visão.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
              <TableCaption className="text-left">
                Em{" "}
                <Link
                  href="/produtos"
                  className="font-semibold text-intent-brand underline-offset-4 hover:underline"
                >
                  Produtos &gt; Lista
                </Link>{" "}
                é possível ajustar preços, variações e campanhas individuais.
              </TableCaption>
            </Table>
          </CardContent>
        </Card>
      </section>

      <section aria-labelledby="inventory-alerts" className="space-y-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2
              id="inventory-alerts"
              className="text-lg font-semibold text-text-primary"
            >
              Alertas prioritários
            </h2>
            <p className="text-sm text-text-secondary">
              Liste ações recomendadas com base em estoque crítico, giro recente
              e risco de ruptura.
            </p>
          </div>
          <TooltipHelp
            label="Critérios dos alertas"
            description="Identificamos produtos com estoque abaixo de 12 unidades e cruzamos com o giro de 30 dias para sugerir reposição ou ajustes."
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {hasAlerts ? (
            overview.alerts.map((alert) => (
              <Card
                key={alert.sku}
                className="border-outline-subtle bg-surface-elevated"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <CardTitle className="text-base font-semibold text-text-primary">
                        {alert.name}
                      </CardTitle>
                      <CardDescription className="text-xs font-mono text-text-secondary">
                        SKU {alert.sku}
                      </CardDescription>
                    </div>
                    <Badge className={ALERT_BADGE_STYLE[alert.status]}>
                      {alert.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-text-secondary">
                  <div className="flex items-center gap-2 text-text-primary">
                    <Boxes className="h-4 w-4" aria-hidden="true" />
                    <span>Estoque estimado: {alert.daysLeft}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Sparkles
                      className="mt-0.5 h-4 w-4 text-intent-brand"
                      aria-hidden="true"
                    />
                    <span>{alert.action}</span>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="border-outline-subtle bg-surface-elevated">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-text-primary">
                  Sem alertas críticos no momento
                </CardTitle>
                <CardDescription className="text-text-secondary">
                  Mantenha o giro monitorado diariamente para antecipar
                  reposições e evitar ruptura nas campanhas ativas.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-text-secondary">
                Ajuste metas de estoque mínimo no catálogo para receber alertas
                mais cedo ou sincronize novos pedidos para atualizar o giro.
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </div>
  );
}
