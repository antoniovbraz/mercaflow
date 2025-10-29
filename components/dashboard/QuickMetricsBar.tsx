"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  DollarSign,
  Package,
  Percent,
  RefreshCw,
  type LucideIcon,
} from "lucide-react";
import { logger } from "@/utils/logger";

interface KPIData {
  revenue: {
    current: number;
    previous: number;
    change: number;
  };
  orders: {
    current: number;
    previous: number;
    change: number;
  };
  conversion: {
    current: number;
    previous: number;
    change: number;
  };
  stock: {
    current: number;
    lowStock: number;
  };
}

interface QuickMetricsBarProps {
  refreshInterval?: number; // em segundos
  compactMode?: boolean;
}

interface CompactMetricProps {
  icon: LucideIcon;
  label: string;
  value: string;
  change?: string;
  positive?: boolean;
  helper?: string;
}

function CompactMetric({ icon: Icon, label, value, change, positive, helper }: CompactMetricProps) {
  return (
    <div className="flex min-w-[160px] flex-1 items-start gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-intent-brand/10 text-intent-brand">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
          {label}
        </p>
        <p className="text-lg font-semibold text-text-primary">{value}</p>
        {change ? (
          <p
            className={
              positive === false
                ? "text-xs font-medium text-intent-danger"
                : "text-xs font-medium text-intent-success"
            }
          >
            {change}
          </p>
        ) : null}
        {helper ? <p className="text-xs text-text-muted">{helper}</p> : null}
      </div>
    </div>
  );
}

export function QuickMetricsBar({
  refreshInterval = 300, // 5 minutos
  compactMode = false,
}: QuickMetricsBarProps) {
  const [data, setData] = useState<KPIData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    const fetchKPIs = async () => {
      try {
        const response = await fetch("/api/dashboard/kpis");

        if (!response.ok) {
          throw new Error("Falha ao carregar KPIs");
        }

        const result = await response.json();
        setData(result.data);
        setLastUpdate(new Date());
      } catch (error) {
        logger.error("Error fetching KPIs", { error });
      } finally {
        setIsLoading(false);
      }
    };

    fetchKPIs();

    // Auto-refresh
    const interval = setInterval(fetchKPIs, refreshInterval * 1000);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    const formatted = Math.abs(value).toFixed(1);
    return value >= 0 ? `+${formatted}%` : `-${formatted}%`;
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading || !data) {
    return (
      <Card className="border-outline-subtle bg-surface-elevated" aria-live="polite">
        <CardContent className="py-6">
          <div className="flex flex-col items-center justify-center gap-3 text-text-secondary">
            <RefreshCw className="h-5 w-5 animate-spin" aria-hidden="true" />
            <span className="text-sm font-medium">Atualizando indicadores...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (compactMode) {
    return (
      <Card className="border-outline-subtle bg-surface-elevated" aria-live="polite">
        <CardContent className="py-4">
          <div className="flex flex-wrap items-center gap-4">
            <CompactMetric
              icon={DollarSign}
              label="Receita (30d)"
              value={formatCurrency(data.revenue.current)}
              change={formatPercentage(data.revenue.change)}
              positive={data.revenue.change >= 0}
            />
            <CompactMetric
              icon={ShoppingCart}
              label="Pedidos (30d)"
              value={`${data.orders.current}`}
              change={formatPercentage(data.orders.change)}
              positive={data.orders.change >= 0}
            />
            <CompactMetric
              icon={Percent}
              label="Conversão"
              value={`${data.conversion.current.toFixed(1)}%`}
            />
            <CompactMetric
              icon={Package}
              label="Estoque"
              value={`${data.stock.current} un`}
              helper={
                data.stock.lowStock > 0
                  ? `${data.stock.lowStock} itens com estoque baixo`
                  : "Estoque saudável"
              }
              positive={data.stock.lowStock === 0}
            />
            <span className="ml-auto text-xs text-text-muted">
              Atualizado às {formatTime(lastUpdate)}
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <Card className="border-outline-subtle bg-surface-elevated" aria-live="polite">
        <CardContent className="space-y-6 p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                Receita (30d)
              </p>
              <p className="text-2xl font-semibold text-text-primary">
                {formatCurrency(data.revenue.current)}
              </p>
              <div className="flex items-center gap-2 text-sm font-medium">
                {data.revenue.change >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-intent-success" aria-hidden="true" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-intent-danger" aria-hidden="true" />
                )}
                <span
                  className={
                    data.revenue.change >= 0
                      ? "text-intent-success"
                      : "text-intent-danger"
                  }
                >
                  {formatPercentage(data.revenue.change)} vs. período anterior
                </span>
              </div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-intent-brand/10 text-intent-brand">
              <DollarSign className="h-5 w-5" aria-hidden="true" />
            </div>
          </div>
          <p className="text-xs text-text-muted">
            Último período: {formatCurrency(data.revenue.previous)}
          </p>
        </CardContent>
      </Card>

      <Card className="border-outline-subtle bg-surface-elevated" aria-live="polite">
        <CardContent className="space-y-6 p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                Pedidos (30d)
              </p>
              <p className="text-2xl font-semibold text-text-primary">
                {data.orders.current}
              </p>
              <div className="flex items-center gap-2 text-sm font-medium">
                {data.orders.change >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-intent-success" aria-hidden="true" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-intent-danger" aria-hidden="true" />
                )}
                <span
                  className={
                    data.orders.change >= 0
                      ? "text-intent-success"
                      : "text-intent-danger"
                  }
                >
                  {formatPercentage(data.orders.change)} vs. período anterior
                </span>
              </div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-intent-brand/10 text-intent-brand">
              <ShoppingCart className="h-5 w-5" aria-hidden="true" />
            </div>
          </div>
          <p className="text-xs text-text-muted">
            Último período: {data.orders.previous} pedidos
          </p>
        </CardContent>
      </Card>

      <Card className="border-outline-subtle bg-surface-elevated" aria-live="polite">
        <CardContent className="space-y-6 p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                Taxa de conversão
              </p>
              <p className="text-2xl font-semibold text-text-primary">
                {data.conversion.current.toFixed(1)}%
              </p>
              <div className="flex items-center gap-2 text-sm font-medium">
                {data.conversion.change >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-intent-success" aria-hidden="true" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-intent-danger" aria-hidden="true" />
                )}
                <span
                  className={
                    data.conversion.change >= 0
                      ? "text-intent-success"
                      : "text-intent-danger"
                  }
                >
                  {formatPercentage(data.conversion.change)} na última comparação
                </span>
              </div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-intent-brand/10 text-intent-brand">
              <Percent className="h-5 w-5" aria-hidden="true" />
            </div>
          </div>
          <p className="text-xs text-text-muted">
            Último período: {data.conversion.previous.toFixed(1)}%
          </p>
        </CardContent>
      </Card>

      <Card className="border-outline-subtle bg-surface-elevated" aria-live="polite">
        <CardContent className="space-y-6 p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                Estoque total
              </p>
              <p className="text-2xl font-semibold text-text-primary">
                {data.stock.current} <span className="text-base font-medium text-text-secondary">un</span>
              </p>
              {data.stock.lowStock > 0 ? (
                <p className="text-sm font-medium text-intent-warning">
                  {data.stock.lowStock} itens precisam de reposição
                </p>
              ) : (
                <p className="text-sm font-medium text-intent-success">
                  Estoque saudável em todos os produtos
                </p>
              )}
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-intent-brand/10 text-intent-brand">
              <Package className="h-5 w-5" aria-hidden="true" />
            </div>
          </div>
          <p className="text-xs text-text-muted">
            Atualizado às {formatTime(lastUpdate)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
