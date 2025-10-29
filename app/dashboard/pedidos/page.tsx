import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowUpRight, RefreshCw } from "lucide-react";

import { PageHeader } from "@/components/ui/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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

const REVENUE_STATUSES = new Set([
  "paid",
  "shipped",
  "delivered",
  "closed",
  "partially_paid",
]);
const ON_TIME_SHIPPING_STATUSES = new Set([
  "ready_to_ship",
  "shipped",
  "delivered",
  "to_be_agreed",
]);
const SLA_TARGET = 0.96;

interface OrderMetric {
  label: string;
  value: string;
  helper: string;
  trend: string;
}

interface RecentOrderRow {
  orderId: string;
  title: string;
  buyer: string;
  total: string;
  status: string;
  updatedAt: string;
}

interface OrdersOverview {
  metrics: OrderMetric[];
  recentOrders: RecentOrderRow[];
  hasIntegrations: boolean;
}

type RawOrder = {
  ml_order_id?: string | number;
  status?: string | null;
  total_amount?: string | number | null;
  date_created?: string | null;
  buyer_nickname?: string | null;
  shipping_status?: string | null;
  ml_data?: Record<string, unknown> | null;
  items?: unknown;
};

function toNumber(value: unknown): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("pt-BR").format(value);
}

function formatPercent(value: number, digits = 1): string {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

function formatChange(
  current: number,
  previous: number,
  suffix: string
): string {
  if (!Number.isFinite(previous) || previous <= 0) {
    return "Sem histórico";
  }

  const delta = ((current - previous) / previous) * 100;
  const formatted = formatPercent(Math.abs(delta));
  return `${delta >= 0 ? "+" : "-"}${formatted}% ${suffix}`;
}

function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function extractOrderItems(
  raw: RawOrder
): Array<{ title: string; quantity: number; unitPrice: number }> {
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

        const titleCandidate = [
          data.item_title,
          nestedItem?.title,
          data.title,
        ].find((value) => typeof value === "string" && value.trim().length > 0);

        const title = typeof titleCandidate === "string" ? titleCandidate : "";
        const quantity = toNumber(data.quantity ?? nestedItem?.quantity);
        const unitPrice = toNumber(data.unit_price ?? nestedItem?.unit_price);

        if (!title) return null;

        return {
          title,
          quantity,
          unitPrice,
        };
      })
      .filter(
        (
          item
        ): item is { title: string; quantity: number; unitPrice: number } =>
          Boolean(item)
      );

    if (items.length > 0) {
      return items;
    }
  }

  return [];
}

async function loadOrdersOverview(tenantId: string): Promise<OrdersOverview> {
  const supabase = await createClient();

  const { data: integrations, error: integrationsError } = await supabase
    .from("ml_integrations")
    .select("id")
    .eq("tenant_id", tenantId)
    .eq("status", "active");

  if (integrationsError) {
    logger.error("Erro ao carregar integrações para métricas de pedidos", {
      error: integrationsError,
    });
    return {
      metrics: getEmptyMetrics(false),
      recentOrders: [],
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
      recentOrders: [],
      hasIntegrations: false,
    };
  }

  const now = new Date();
  const nowIso = now.toISOString();
  const last24Iso = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
  const previous24StartIso = new Date(
    now.getTime() - 48 * 60 * 60 * 1000
  ).toISOString();
  const last30Iso = new Date(
    now.getTime() - 30 * 24 * 60 * 60 * 1000
  ).toISOString();

  const ordersNowQuery = supabase
    .from("ml_orders")
    .select("total_amount,status,ml_data,items")
    .gte("date_created", last24Iso)
    .lte("date_created", nowIso);

  const ordersPrevQuery = supabase
    .from("ml_orders")
    .select("total_amount,status")
    .gte("date_created", previous24StartIso)
    .lt("date_created", last24Iso);

  const pendingQuery = supabase
    .from("ml_orders")
    .select("date_created")
    .eq("status", "pending");

  const shippingQuery = supabase
    .from("ml_orders")
    .select("shipping_status")
    .gte("date_created", last30Iso);

  const latestQuery = supabase
    .from("ml_orders")
    .select(
      "ml_order_id,status,total_amount,buyer_nickname,shipping_status,date_created,ml_data,items"
    )
    .order("date_created", { ascending: false })
    .limit(6);

  if (integrationIds.length === 1) {
    const [integrationId] = integrationIds;
    ordersNowQuery.eq("integration_id", integrationId);
    ordersPrevQuery.eq("integration_id", integrationId);
    pendingQuery.eq("integration_id", integrationId);
    shippingQuery.eq("integration_id", integrationId);
    latestQuery.eq("integration_id", integrationId);
  } else {
    ordersNowQuery.in("integration_id", integrationIds);
    ordersPrevQuery.in("integration_id", integrationIds);
    pendingQuery.in("integration_id", integrationIds);
    shippingQuery.in("integration_id", integrationIds);
    latestQuery.in("integration_id", integrationIds);
  }

  const [
    ordersNowResult,
    ordersPrevResult,
    pendingResult,
    shippingResult,
    latestResult,
  ] = await Promise.all([
    ordersNowQuery,
    ordersPrevQuery,
    pendingQuery,
    shippingQuery,
    latestQuery,
  ]);

  const ordersNow = (ordersNowResult.data ?? []) as RawOrder[];
  const ordersPrev = (ordersPrevResult.data ?? []) as RawOrder[];
  const pendingOrders = (pendingResult.data ?? []) as Array<{
    date_created: string | null;
  }>;
  const shippingOrders = (shippingResult.data ?? []) as Array<{
    shipping_status: string | null;
  }>;
  const latestOrdersRaw = (latestResult.data ?? []) as RawOrder[];

  if (ordersNowResult.error) {
    logger.error("Erro ao carregar pedidos recentes para métricas", {
      error: ordersNowResult.error,
    });
  }
  if (ordersPrevResult.error) {
    logger.error("Erro ao carregar histórico para comparação de pedidos", {
      error: ordersPrevResult.error,
    });
  }
  if (pendingResult.error) {
    logger.error("Erro ao carregar pedidos pendentes", {
      error: pendingResult.error,
    });
  }
  if (shippingResult.error) {
    logger.error("Erro ao carregar dados de envio para SLA", {
      error: shippingResult.error,
    });
  }
  if (latestResult.error) {
    logger.error("Erro ao carregar lista de pedidos recentes", {
      error: latestResult.error,
    });
  }

  const ordersNowCount = ordersNow.length;
  const ordersPrevCount = ordersPrev.length;

  const revenueNow = ordersNow.reduce(
    (sum, order) =>
      REVENUE_STATUSES.has((order.status ?? "").toLowerCase())
        ? sum + toNumber(order.total_amount)
        : sum,
    0
  );
  const revenuePrev = ordersPrev.reduce(
    (sum, order) =>
      REVENUE_STATUSES.has((order.status ?? "").toLowerCase())
        ? sum + toNumber(order.total_amount)
        : sum,
    0
  );

  const pendingCritical = pendingOrders.filter((order) => {
    if (!order?.date_created) return false;
    const createdAt = new Date(order.date_created);
    if (Number.isNaN(createdAt.getTime())) return false;
    const hoursOpen = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
    return hoursOpen >= 48;
  }).length;

  const shippingTotal = shippingOrders.length;
  const shippingOnTime = shippingOrders.filter((order) =>
    ON_TIME_SHIPPING_STATUSES.has((order.shipping_status ?? "").toLowerCase())
  ).length;
  const shippingRate = shippingTotal > 0 ? shippingOnTime / shippingTotal : 0;

  const metrics: OrderMetric[] = [
    {
      label: "Pedidos sincronizados",
      value: formatNumber(ordersNowCount),
      helper: "Últimas 24h",
      trend: formatChange(
        ordersNowCount,
        ordersPrevCount,
        "vs. 24h anteriores"
      ),
    },
    {
      label: "Receita confirmada",
      value: formatCurrency(revenueNow),
      helper: "Pedidos pagos ou enviados",
      trend: formatChange(revenueNow, revenuePrev, "na comparação diária"),
    },
    {
      label: "Pedidos pendentes",
      value: formatNumber(pendingOrders.length),
      helper: "Aguardam pagamento",
      trend:
        pendingCritical > 0
          ? `${pendingCritical} com mais de 48h`
          : "Todos dentro do SLA",
    },
    {
      label: "SLA de envio",
      value: `${formatPercent(shippingRate * 100, 0)}%`,
      helper: "Pedidos dentro do prazo de envio",
      trend:
        shippingRate >= SLA_TARGET
          ? "Meta interna atingida"
          : `Faltam ${formatPercent(
              Math.max(SLA_TARGET * 100 - shippingRate * 100, 0),
              1
            )} pp`,
    },
  ];

  const recentOrders: RecentOrderRow[] = latestOrdersRaw.map((order) => {
    const items = extractOrderItems(order);
    const firstItemTitle = items[0]?.title ?? "Itens sincronizados";

    return {
      orderId: `#${String(order.ml_order_id ?? "").padStart(10, "0")}`,
      title: firstItemTitle,
      buyer: order.buyer_nickname ?? "Cliente",
      total: formatCurrency(toNumber(order.total_amount)),
      status: (order.status ?? "pending").toLowerCase(),
      updatedAt: formatDateTime(order.date_created),
    };
  });

  return {
    metrics,
    recentOrders,
    hasIntegrations: true,
  };
}

function getEmptyMetrics(hasIntegrations: boolean): OrderMetric[] {
  return [
    {
      label: "Pedidos sincronizados",
      value: "0",
      helper: hasIntegrations
        ? "Sem registros recentes"
        : "Conecte uma integração para começar",
      trend: "Sem histórico",
    },
    {
      label: "Receita confirmada",
      value: formatCurrency(0),
      helper: "Pedidos pagos ou enviados",
      trend: "Sem histórico",
    },
    {
      label: "Pedidos pendentes",
      value: "0",
      helper: "Aguardam pagamento",
      trend: "Sem histórico",
    },
    {
      label: "SLA de envio",
      value: "0%",
      helper: "Pedidos dentro do prazo de envio",
      trend: "Sem histórico",
    },
  ];
}

const STATUS_LABEL: Record<string, string> = {
  paid: "Pago",
  shipped: "Enviado",
  pending: "Pendente",
  delivered: "Entregue",
  closed: "Concluído",
  cancelled: "Cancelado",
};

const STATUS_STYLE: Record<string, string> = {
  paid: "bg-intent-success/10 text-intent-success border-transparent",
  shipped: "bg-intent-info/10 text-intent-info border-transparent",
  pending: "bg-intent-warning/10 text-intent-warning border-transparent",
  delivered: "bg-intent-brand/10 text-intent-brand border-transparent",
  closed: "bg-intent-brand/10 text-intent-brand border-transparent",
  cancelled: "bg-intent-danger/10 text-intent-danger border-transparent",
};

export default async function PedidosPage() {
  try {
    await requireRole("user");
  } catch {
    redirect("/login");
  }

  const tenantId = await getCurrentTenantId();

  if (!tenantId) {
    redirect("/onboarding");
  }

  const overview = await loadOrdersOverview(tenantId);
  const hasRecentOrders = overview.recentOrders.length > 0;

  return (
    <div className="space-y-10">
      <PageHeader
        title="Pedidos"
        description="Acompanhe a performance dos pedidos sincronizados com o Mercado Livre, incluindo volume diário, receita confirmada e status logístico."
        helpText="Os indicadores consideram as últimas 24 horas em comparação com a janela anterior, respeitando o tenant e as integrações ativas."
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Pedidos" },
        ]}
        actions={
          <Button asChild size="sm">
            <Link href="/pedidos" className="inline-flex items-center">
              Abrir lista completa
              <ArrowUpRight className="ml-1 h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        }
      />

      <section aria-labelledby="orders-metrics" className="space-y-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2
              id="orders-metrics"
              className="text-lg font-semibold text-text-primary"
            >
              Indicadores operacionais
            </h2>
            <p className="text-sm text-text-secondary">
              KPIs atualizados com base nos pedidos sincronizados em tempo real
              com o Mercado Livre.
            </p>
          </div>
          <TooltipHelp
            label="Como ler os indicadores"
            description="Os totais comparam as últimas 24 horas com a janela anterior. O SLA considera pedidos expedidos nos últimos 30 dias, com meta interna de 96%."
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
                  {metric.trend}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section aria-labelledby="orders-sync" className="space-y-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2
              id="orders-sync"
              className="text-lg font-semibold text-text-primary"
            >
              Sincronização com Mercado Livre
            </h2>
            <p className="text-sm text-text-secondary">
              Os pedidos são atualizados automaticamente a cada 15 minutos.
              Utilize a lista completa para forçar uma nova captura quando
              necessário.
            </p>
          </div>
          <Button variant="outline" size="sm" className="gap-2" asChild>
            <Link href="/pedidos?sync=1">
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Abrir sincronização
            </Link>
          </Button>
        </div>

        <Card className="border-outline-subtle bg-surface-elevated">
          <CardHeader className="pb-4">
            <div className="flex flex-col gap-1">
              <CardTitle className="text-xl text-text-primary">
                Pedidos recentes
              </CardTitle>
              <CardDescription className="text-text-secondary">
                Lista dos pedidos mais recentes para validar totais e status
                antes de abrir a visão detalhada.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <Table>
              <TableHeader>
                <TableRow className="border-outline-subtle">
                  <TableHead className="text-xs uppercase tracking-wide text-text-secondary">
                    Pedido
                  </TableHead>
                  <TableHead className="text-xs uppercase tracking-wide text-text-secondary">
                    Item
                  </TableHead>
                  <TableHead className="text-xs uppercase tracking-wide text-text-secondary">
                    Comprador
                  </TableHead>
                  <TableHead className="text-xs uppercase tracking-wide text-text-secondary text-right">
                    Total
                  </TableHead>
                  <TableHead className="text-xs uppercase tracking-wide text-text-secondary text-center">
                    Status
                  </TableHead>
                  <TableHead className="text-xs uppercase tracking-wide text-text-secondary text-right">
                    Atualizado em
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {hasRecentOrders ? (
                  overview.recentOrders.map((order) => (
                    <TableRow
                      key={`${order.orderId}-${order.updatedAt}`}
                      className="border-outline-subtle/80"
                    >
                      <TableCell className="font-semibold text-text-primary">
                        {order.orderId}
                      </TableCell>
                      <TableCell className="max-w-[240px] truncate text-text-secondary">
                        {order.title}
                      </TableCell>
                      <TableCell className="text-text-secondary">
                        {order.buyer}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-text-primary">
                        {order.total}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          className={
                            STATUS_STYLE[order.status] ??
                            "bg-surface text-text-secondary border-outline-subtle"
                          }
                        >
                          {STATUS_LABEL[order.status] ?? order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-text-secondary">
                        {order.updatedAt}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-10 text-center text-sm text-text-muted"
                    >
                      Nenhum pedido recente disponível. Conecte uma integração
                      ou sincronize manualmente para ver atualizações aqui.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
              <TableCaption className="text-left">
                Acesse a lista completa em{" "}
                <Link
                  href="/pedidos"
                  className="font-semibold text-intent-brand underline-offset-4 hover:underline"
                >
                  Pedidos &gt; Lista
                </Link>{" "}
                para filtros, exportações e ações em massa.
              </TableCaption>
            </Table>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
