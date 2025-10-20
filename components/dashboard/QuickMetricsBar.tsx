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
      <Card>
        <CardContent className="py-6">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span className="text-sm">Carregando métricas...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (compactMode) {
    return (
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardContent className="py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Revenue */}
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {formatCurrency(data.revenue.current)}
                </p>
                <p
                  className={`text-xs font-medium ${
                    data.revenue.change >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {formatPercentage(data.revenue.change)}
                </p>
              </div>
            </div>

            {/* Orders */}
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {data.orders.current} pedidos
                </p>
                <p
                  className={`text-xs font-medium ${
                    data.orders.change >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {formatPercentage(data.orders.change)}
                </p>
              </div>
            </div>

            {/* Conversion */}
            <div className="flex items-center gap-2">
              <Percent className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {data.conversion.current.toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground">Conversão</p>
              </div>
            </div>

            {/* Stock */}
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {data.stock.current} un
                </p>
                {data.stock.lowStock > 0 && (
                  <p className="text-xs text-orange-600">
                    {data.stock.lowStock} baixo
                  </p>
                )}
              </div>
            </div>

            {/* Last Update */}
            <div className="text-xs text-muted-foreground ml-auto">
              {formatTime(lastUpdate)}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Revenue Card */}
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            {data.revenue.change >= 0 ? (
              <TrendingUp className="h-5 w-5 text-green-600" />
            ) : (
              <TrendingDown className="h-5 w-5 text-red-600" />
            )}
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(data.revenue.current)}
          </p>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-muted-foreground">Receita (30d)</p>
            <p
              className={`text-sm font-semibold ${
                data.revenue.change >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {formatPercentage(data.revenue.change)}
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-green-200">
            <p className="text-xs text-muted-foreground">
              vs. período anterior: {formatCurrency(data.revenue.previous)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Orders Card */}
      <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ShoppingCart className="h-5 w-5 text-blue-600" />
            </div>
            {data.orders.change >= 0 ? (
              <TrendingUp className="h-5 w-5 text-blue-600" />
            ) : (
              <TrendingDown className="h-5 w-5 text-red-600" />
            )}
          </div>
          <p className="text-2xl font-bold text-gray-900">{data.orders.current}</p>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-muted-foreground">Pedidos (30d)</p>
            <p
              className={`text-sm font-semibold ${
                data.orders.change >= 0 ? "text-blue-600" : "text-red-600"
              }`}
            >
              {formatPercentage(data.orders.change)}
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-blue-200">
            <p className="text-xs text-muted-foreground">
              vs. período anterior: {data.orders.previous} pedidos
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Conversion Card */}
      <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Percent className="h-5 w-5 text-purple-600" />
            </div>
            {data.conversion.change >= 0 ? (
              <TrendingUp className="h-5 w-5 text-purple-600" />
            ) : (
              <TrendingDown className="h-5 w-5 text-red-600" />
            )}
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {data.conversion.current.toFixed(1)}%
          </p>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-muted-foreground">Taxa de Conversão</p>
            <p
              className={`text-sm font-semibold ${
                data.conversion.change >= 0 ? "text-purple-600" : "text-red-600"
              }`}
            >
              {formatPercentage(data.conversion.change)}
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-purple-200">
            <p className="text-xs text-muted-foreground">
              vs. período anterior: {data.conversion.previous.toFixed(1)}%
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Stock Card */}
      <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Package className="h-5 w-5 text-orange-600" />
            </div>
            {data.stock.lowStock > 0 && (
              <div className="p-1 bg-orange-200 rounded-full">
                <span className="text-xs font-bold text-orange-700">
                  !
                </span>
              </div>
            )}
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {data.stock.current} <span className="text-lg text-muted-foreground">un</span>
          </p>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-muted-foreground">Estoque Total</p>
            {data.stock.lowStock > 0 && (
              <p className="text-sm font-semibold text-orange-600">
                {data.stock.lowStock} baixo
              </p>
            )}
          </div>
          <div className="mt-3 pt-3 border-t border-orange-200">
            {data.stock.lowStock > 0 ? (
              <p className="text-xs text-orange-600 font-medium">
                ⚠️ {data.stock.lowStock} produtos com estoque baixo
              </p>
            ) : (
              <p className="text-xs text-green-600 font-medium">
                ✓ Estoque saudável em todos os produtos
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
