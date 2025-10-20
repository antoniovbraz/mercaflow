"use client";

import { useState, useEffect } from "react";
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  ComposedChart,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingDown, TrendingUp, AlertCircle } from "lucide-react";
import { logger } from "@/utils/logger";

interface ElasticityDataPoint {
  price: number;
  demand: number;
  revenue: number;
  elasticity: number;
}

interface ElasticityChartProps {
  productId?: string;
  compactMode?: boolean;
}

export function ElasticityChart({
  productId,
  compactMode = false,
}: ElasticityChartProps) {
  const [data, setData] = useState<ElasticityDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [optimalPrice, setOptimalPrice] = useState<number>(0);
  const [currentPrice, setCurrentPrice] = useState<number>(0);

  useEffect(() => {
    const fetchElasticityData = async () => {
      try {
        setIsLoading(true);

        // TODO: Substituir com API real /api/analytics/elasticity
        // const response = await fetch(`/api/analytics/elasticity${productId ? `?productId=${productId}` : ''}`);
        // const result = await response.json();

        // Mock data - curva de elasticidade realista
        const mockData: ElasticityDataPoint[] = [
          { price: 50, demand: 180, revenue: 9000, elasticity: -2.1 },
          { price: 60, demand: 150, revenue: 9000, elasticity: -1.8 },
          { price: 70, demand: 125, revenue: 8750, elasticity: -1.5 },
          { price: 80, demand: 105, revenue: 8400, elasticity: -1.3 },
          { price: 90, demand: 90, revenue: 8100, elasticity: -1.2 },
          { price: 100, demand: 80, revenue: 8000, elasticity: -1.1 },
          { price: 110, demand: 70, revenue: 7700, elasticity: -1.0 },
          { price: 120, demand: 62, revenue: 7440, elasticity: -0.9 },
          { price: 130, demand: 55, revenue: 7150, elasticity: -0.8 },
          { price: 140, demand: 48, revenue: 6720, elasticity: -0.7 },
          { price: 150, demand: 42, revenue: 6300, elasticity: -0.6 },
        ];

        setData(mockData);

        // Encontrar preço ótimo (maior revenue)
        const optimal = mockData.reduce((max, point) =>
          point.revenue > max.revenue ? point : max
        );
        setOptimalPrice(optimal.price);
        setCurrentPrice(100); // Mock - preço atual

        logger.info("Elasticity data loaded", {
          points: mockData.length,
          optimalPrice: optimal.price,
        });
      } catch (error) {
        logger.error("Failed to fetch elasticity data", { error });
      } finally {
        setIsLoading(false);
      }
    };

    fetchElasticityData();
  }, [productId]);

  if (isLoading) {
    return (
      <div className="h-80 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-sm text-gray-600">Calculando elasticidade...</p>
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

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("pt-BR").format(value);
  };

  const elasticityType =
    data.find((d) => d.price === currentPrice)?.elasticity || -1.2;
  const isElastic = Math.abs(elasticityType) > 1;

  const priceChange = ((optimalPrice - currentPrice) / currentPrice) * 100;
  const shouldIncrease = priceChange > 0;

  return (
    <div className="space-y-4">
      {/* Insights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Elasticidade Atual */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">
                Elasticidade
              </span>
              {isElastic ? (
                <TrendingDown className="w-5 h-5 text-red-500" />
              ) : (
                <TrendingUp className="w-5 h-5 text-green-500" />
              )}
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {elasticityType.toFixed(2)}
            </p>
            <Badge
              variant={isElastic ? "destructive" : "default"}
              className="mt-2"
            >
              {isElastic ? "Elástica" : "Inelástica"}
            </Badge>
          </CardContent>
        </Card>

        {/* Preço Ótimo */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">
                Preço Ótimo
              </span>
              <AlertCircle className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(optimalPrice)}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Atual: {formatCurrency(currentPrice)}
            </p>
          </CardContent>
        </Card>

        {/* Recomendação */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">
                Recomendação
              </span>
              {shouldIncrease ? (
                <TrendingUp className="w-5 h-5 text-green-500" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-500" />
              )}
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {shouldIncrease ? "+" : ""}
              {priceChange.toFixed(1)}%
            </p>
            <p className="text-xs text-gray-500 mt-2">
              {shouldIncrease ? "Aumentar preço" : "Reduzir preço"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Elasticidade - Curva Dupla (Demanda + Revenue) */}
      <Card>
        <CardContent className="pt-6">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">
              Curva de Elasticidade Preço-Demanda
            </h3>
            <p className="text-xs text-gray-600">
              Relação entre preço, demanda e receita total
            </p>
          </div>

          <ResponsiveContainer width="100%" height={compactMode ? 250 : 350}>
            <ComposedChart
              data={data}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="price"
                label={{
                  value: "Preço (R$)",
                  position: "insideBottom",
                  offset: -5,
                }}
                stroke="#6B7280"
              />
              <YAxis
                yAxisId="left"
                label={{
                  value: "Demanda",
                  angle: -90,
                  position: "insideLeft",
                }}
                stroke="#6B7280"
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                label={{
                  value: "Receita (R$)",
                  angle: 90,
                  position: "insideRight",
                }}
                stroke="#6B7280"
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                        <p className="font-semibold text-gray-900 mb-2">
                          Preço: {formatCurrency(data.price)}
                        </p>
                        <div className="space-y-1 text-sm">
                          <p className="text-blue-600">
                            Demanda: {formatNumber(data.demand)} unidades
                          </p>
                          <p className="text-green-600">
                            Receita: {formatCurrency(data.revenue)}
                          </p>
                          <p className="text-gray-600">
                            Elasticidade: {data.elasticity.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              {/* Área de demanda */}
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="demand"
                fill="#DBEAFE"
                stroke="none"
                fillOpacity={0.3}
              />

              {/* Linha de demanda */}
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="demand"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={{ fill: "#3B82F6", r: 4 }}
                activeDot={{ r: 6 }}
              />

              {/* Linha de receita */}
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="revenue"
                stroke="#10B981"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: "#10B981", r: 4 }}
                activeDot={{ r: 6 }}
              />

              {/* Linha vertical no preço atual */}
              <ReferenceLine
                x={currentPrice}
                yAxisId="left"
                stroke="#F59E0B"
                strokeWidth={2}
                strokeDasharray="3 3"
                label={{
                  value: "Atual",
                  position: "top",
                  fill: "#F59E0B",
                  fontSize: 12,
                }}
              />

              {/* Linha vertical no preço ótimo */}
              <ReferenceLine
                x={optimalPrice}
                yAxisId="left"
                stroke="#EF4444"
                strokeWidth={2}
                strokeDasharray="3 3"
                label={{
                  value: "Ótimo",
                  position: "top",
                  fill: "#EF4444",
                  fontSize: 12,
                }}
              />
            </ComposedChart>
          </ResponsiveContainer>

          {/* Legenda */}
          <div className="flex items-center justify-center space-x-6 mt-4 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-gray-600">Demanda</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-0.5 bg-green-500"></div>
              <span className="text-gray-600">Receita</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-0.5 bg-orange-500"></div>
              <span className="text-gray-600">Preço Atual</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-0.5 bg-red-500"></div>
              <span className="text-gray-600">Preço Ótimo</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Explicação da Elasticidade */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-900 mb-2 flex items-center">
          <AlertCircle className="w-4 h-4 mr-2" />
          Como Interpretar
        </h4>
        <div className="text-xs text-blue-800 space-y-1">
          <p>
            <strong>Elasticidade {elasticityType.toFixed(2)}:</strong>{" "}
            {isElastic
              ? "Demanda muito sensível ao preço. Pequenas mudanças causam grande impacto nas vendas."
              : "Demanda pouco sensível ao preço. Você pode ajustar preços com mais liberdade."}
          </p>
          <p>
            <strong>Preço Ótimo:</strong> Ponto que maximiza receita total
            considerando o trade-off entre preço e volume.
          </p>
          <p>
            <strong>Recomendação:</strong>{" "}
            {shouldIncrease
              ? `Aumentar preço em ${Math.abs(priceChange).toFixed(
                  1
                )}% pode aumentar receita.`
              : `Reduzir preço em ${Math.abs(priceChange).toFixed(
                  1
                )}% pode aumentar receita.`}
          </p>
        </div>
      </div>
    </div>
  );
}
