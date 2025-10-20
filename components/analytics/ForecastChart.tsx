"use client";

import { useState, useEffect } from "react";
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  ComposedChart,
  Legend,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, Calendar, AlertCircle, RefreshCw } from "lucide-react";
import { logger } from "@/utils/logger";

interface ForecastDataPoint {
  date: string;
  dateLabel: string;
  actual?: number;
  forecast: number;
  lowerBound: number;
  upperBound: number;
  confidence: number;
}

interface ForecastChartProps {
  productId?: string;
  compactMode?: boolean;
}

type ForecastPeriod = 30 | 60 | 90;

export function ForecastChart({
  productId,
  compactMode = false,
}: ForecastChartProps) {
  const [data, setData] = useState<ForecastDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<ForecastPeriod>(30);
  const [accuracy, setAccuracy] = useState<number>(0);
  const [trend, setTrend] = useState<"up" | "down" | "stable">("stable");

  useEffect(() => {
    const fetchForecastData = async () => {
      try {
        setIsLoading(true);

        // TODO: Substituir com API real /api/analytics/forecast
        // const response = await fetch(`/api/analytics/forecast?period=${selectedPeriod}${productId ? `&productId=${productId}` : ''}`);
        // const result = await response.json();

        // Mock data - histórico + previsão realista
        const mockData: ForecastDataPoint[] = [];
        const baseValue = 1000;
        const growthRate = 0.05; // 5% crescimento mensal

        // Histórico (últimos 30 dias)
        for (let i = -30; i <= 0; i++) {
          const date = new Date();
          date.setDate(date.getDate() + i);
          const randomVariation = (Math.random() - 0.5) * 200;
          const value = baseValue + randomVariation;

          mockData.push({
            date: date.toISOString(),
            dateLabel: date.toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "short",
            }),
            actual: value,
            forecast: value,
            lowerBound: value - 100,
            upperBound: value + 100,
            confidence: 100,
          });
        }

        // Previsão (próximos dias)
        for (let i = 1; i <= selectedPeriod; i++) {
          const date = new Date();
          date.setDate(date.getDate() + i);

          // Cálculo de previsão com crescimento
          const daysFromNow = i;
          const growthFactor = 1 + (growthRate * daysFromNow) / 30;
          const forecast = baseValue * growthFactor;

          // Intervalo de confiança aumenta com o tempo
          const confidenceDecay = Math.max(50, 100 - daysFromNow * 0.5);
          const intervalWidth = (100 - confidenceDecay) * 10;

          mockData.push({
            date: date.toISOString(),
            dateLabel: date.toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "short",
            }),
            forecast: forecast,
            lowerBound: forecast - intervalWidth,
            upperBound: forecast + intervalWidth,
            confidence: confidenceDecay,
          });
        }

        setData(mockData);

        // Calcular accuracy (mock)
        setAccuracy(87);

        // Detectar trend
        const lastActual = mockData.find((d) => d.actual)?.actual || 0;
        const lastForecast =
          mockData[mockData.length - 1]?.forecast || lastActual;
        const change = ((lastForecast - lastActual) / lastActual) * 100;

        if (change > 5) setTrend("up");
        else if (change < -5) setTrend("down");
        else setTrend("stable");

        logger.info("Forecast data loaded", {
          points: mockData.length,
          period: selectedPeriod,
          accuracy,
        });
      } catch (error) {
        logger.error("Failed to fetch forecast data", { error });
      } finally {
        setIsLoading(false);
      }
    };

    fetchForecastData();
  }, [productId, selectedPeriod, accuracy]);

  if (isLoading) {
    return (
      <div className="h-80 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-sm text-gray-600">Calculando previsões...</p>
        </div>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getTrendIcon = () => {
    if (trend === "up")
      return <TrendingUp className="w-5 h-5 text-green-500" />;
    if (trend === "down")
      return <TrendingUp className="w-5 h-5 text-red-500 rotate-180" />;
    return <div className="w-5 h-5 text-gray-500">→</div>;
  };

  const getTrendText = () => {
    if (trend === "up") return "Crescimento previsto";
    if (trend === "down") return "Queda prevista";
    return "Estabilidade prevista";
  };

  const lastActualValue =
    data.find((d) => d.actual !== undefined)?.actual || 0;
  const lastForecastValue = data[data.length - 1]?.forecast || 0;
  const forecastChange =
    ((lastForecastValue - lastActualValue) / lastActualValue) * 100;

  return (
    <div className="space-y-4">
      {/* Period Selector + Stats */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        {/* Period Buttons */}
        <div className="flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-gray-400" />
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            {[30, 60, 90].map((period) => (
              <Button
                key={period}
                variant={selectedPeriod === period ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedPeriod(period as ForecastPeriod)}
                className={`px-3 py-1 text-xs ${
                  selectedPeriod === period
                    ? "bg-purple-600 text-white hover:bg-purple-700"
                    : "hover:bg-gray-200"
                }`}
              >
                {period} dias
              </Button>
            ))}
          </div>
        </div>

        {/* Accuracy Badge */}
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-green-50 text-green-700">
            Precisão: {accuracy}%
          </Badge>
          <Button variant="ghost" size="icon" className="w-8 h-8">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Tendência */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">
                Tendência
              </span>
              {getTrendIcon()}
            </div>
            <p className="text-lg font-bold text-gray-900">{getTrendText()}</p>
            <p className="text-xs text-gray-500 mt-2">
              {forecastChange > 0 ? "+" : ""}
              {forecastChange.toFixed(1)}% em {selectedPeriod} dias
            </p>
          </CardContent>
        </Card>

        {/* Valor Atual */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">
                Valor Atual
              </span>
              <AlertCircle className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-lg font-bold text-gray-900">
              {formatCurrency(lastActualValue)}
            </p>
            <p className="text-xs text-gray-500 mt-2">Média últimos 7 dias</p>
          </CardContent>
        </Card>

        {/* Previsão Final */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">
                Previsão ({selectedPeriod}d)
              </span>
              <TrendingUp className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-lg font-bold text-gray-900">
              {formatCurrency(lastForecastValue)}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Confiança: {data[data.length - 1]?.confidence.toFixed(0)}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Forecast Chart */}
      <Card>
        <CardContent className="pt-6">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">
              Previsão de Vendas - {selectedPeriod} Dias
            </h3>
            <p className="text-xs text-gray-600">
              Linha azul: histórico | Linha roxa: previsão | Área sombreada:
              intervalo de confiança
            </p>
          </div>

          <ResponsiveContainer width="100%" height={compactMode ? 250 : 350}>
            <ComposedChart
              data={data}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <defs>
                <linearGradient
                  id="colorConfidence"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#A855F7" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#A855F7" stopOpacity={0.05} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />

              <XAxis
                dataKey="dateLabel"
                stroke="#6B7280"
                tick={{ fontSize: 11 }}
                interval="preserveStartEnd"
                minTickGap={30}
              />

              <YAxis
                stroke="#6B7280"
                tick={{ fontSize: 11 }}
                tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
              />

              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                        <p className="font-semibold text-gray-900 mb-2">
                          {new Date(data.date).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "long",
                          })}
                        </p>
                        <div className="space-y-1 text-sm">
                          {data.actual !== undefined ? (
                            <p className="text-blue-600">
                              Real: {formatCurrency(data.actual)}
                            </p>
                          ) : (
                            <>
                              <p className="text-purple-600">
                                Previsão: {formatCurrency(data.forecast)}
                              </p>
                              <p className="text-gray-600 text-xs">
                                Intervalo: {formatCurrency(data.lowerBound)} -{" "}
                                {formatCurrency(data.upperBound)}
                              </p>
                              <p className="text-gray-500 text-xs">
                                Confiança: {data.confidence.toFixed(0)}%
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              <Legend
                wrapperStyle={{ fontSize: "12px" }}
                iconType="line"
                verticalAlign="top"
                height={36}
              />

              {/* Área de confiança (somente para previsão) */}
              <Area
                type="monotone"
                dataKey="upperBound"
                stroke="none"
                fill="url(#colorConfidence)"
                fillOpacity={1}
                name="Intervalo Superior"
                connectNulls
              />
              <Area
                type="monotone"
                dataKey="lowerBound"
                stroke="none"
                fill="url(#colorConfidence)"
                fillOpacity={1}
                name="Intervalo Inferior"
                connectNulls
              />

              {/* Linha de valores reais (histórico) */}
              <Line
                type="monotone"
                dataKey="actual"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={false}
                name="Histórico Real"
                connectNulls
              />

              {/* Linha de previsão */}
              <Line
                type="monotone"
                dataKey="forecast"
                stroke="#A855F7"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                name="Previsão"
                connectNulls
              />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Insights & Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Insight Card */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-purple-900 mb-2 flex items-center">
            <AlertCircle className="w-4 h-4 mr-2" />
            💡 Insight Principal
          </h4>
          <p className="text-xs text-purple-800">
            {trend === "up"
              ? `Crescimento de ${Math.abs(forecastChange).toFixed(1)}% previsto. Considere aumentar estoque em ${Math.ceil(Math.abs(forecastChange) / 2)}% para atender demanda.`
              : trend === "down"
              ? `Queda de ${Math.abs(forecastChange).toFixed(1)}% prevista. Avalie promoções ou ajustes de preço para estimular vendas.`
              : "Vendas estáveis. Mantenha estratégia atual e monitore concorrência."}
          </p>
        </div>

        {/* Accuracy Explanation */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-green-900 mb-2 flex items-center">
            <TrendingUp className="w-4 h-4 mr-2" />
            📊 Precisão do Modelo
          </h4>
          <p className="text-xs text-green-800">
            Nosso modelo alcança {accuracy}% de precisão comparando previsões
            dos últimos 30 dias com valores reais. Intervalo de confiança
            aumenta quanto mais distante a previsão.
          </p>
        </div>
      </div>
    </div>
  );
}
