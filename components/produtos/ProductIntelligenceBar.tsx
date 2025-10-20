"use client";

import { TrendingUp, AlertTriangle, Sparkles, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ProductStats {
  total: number;
  active: number;
  paused: number;
  closed: number;
  totalStock: number;
  totalSold: number;
  averagePrice: number;
}

interface TopInsight {
  type: "roi" | "critical" | "opportunity";
  title: string;
  description: string;
  value: string;
  productId?: string;
  priority: "high" | "medium" | "low";
}

interface ProductIntelligenceBarProps {
  stats: ProductStats;
  onSync?: () => void;
  isLoading?: boolean;
}

export default function ProductIntelligenceBar({
  stats,
  onSync,
  isLoading = false,
}: ProductIntelligenceBarProps) {
  // Calculate top insights from stats
  const insights = calculateTopInsights(stats);

  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-b border-purple-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Intelligence por Produto
            </h2>
            <p className="text-sm text-gray-600">
              Top 3 insights acionáveis do seu catálogo
            </p>
          </div>
          <Button
            onClick={onSync}
            disabled={isLoading}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
            {isLoading ? "Sincronizando..." : "Atualizar"}
          </Button>
        </div>

        {/* Top 3 Insights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {insights.map((insight, index) => (
            <Card
              key={index}
              className={`p-4 ${getInsightBackground(insight.type)} border-l-4 ${getInsightBorder(insight.type)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${getIconBackground(insight.type)}`}
                  >
                    {getInsightIcon(insight.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-gray-900">
                        {insight.title}
                      </h3>
                      <Badge
                        variant={
                          insight.priority === "high"
                            ? "destructive"
                            : insight.priority === "medium"
                              ? "default"
                              : "secondary"
                        }
                        className="text-xs"
                      >
                        {insight.priority === "high"
                          ? "Alta"
                          : insight.priority === "medium"
                            ? "Média"
                            : "Baixa"}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">
                      {insight.description}
                    </p>
                    <p
                      className={`text-lg font-bold ${getValueColor(insight.type)}`}
                    >
                      {insight.value}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Quick Stats Bar */}
        <div className="mt-4 flex items-center justify-between text-sm text-gray-600 bg-white/60 backdrop-blur-sm rounded-lg px-4 py-2">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <span>
                <strong>{stats.active}</strong> ativos
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
              <span>
                <strong>{stats.paused}</strong> pausados
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-blue-500"></div>
              <span>
                Estoque total: <strong>{stats.totalStock}</strong> unidades
              </span>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            Última atualização: {new Date().toLocaleTimeString("pt-BR")}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Functions
function calculateTopInsights(stats: ProductStats): TopInsight[] {
  const insights: TopInsight[] = [];

  // Insight 1: ROI Opportunity (se preço médio > R$100, chance de otimização)
  if (stats.averagePrice > 100) {
    const potentialRevenue = stats.active * (stats.averagePrice * 0.15); // 15% potential increase
    insights.push({
      type: "roi",
      title: "Maior Oportunidade ROI",
      description: "Produtos com potencial de otimização de preço",
      value: `R$ ${potentialRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      priority: potentialRevenue > 5000 ? "high" : "medium",
    });
  } else {
    // Alternativa: mostrar oportunidade de volume
    insights.push({
      type: "roi",
      title: "Oportunidade de Volume",
      description: "Aumente vendas com preços competitivos",
      value: `${stats.active} produtos`,
      priority: "medium",
    });
  }

  // Insight 2: Critical (estoque baixo ou pausados)
  if (stats.paused > 0 || stats.totalStock < stats.active * 5) {
    const criticalCount = stats.paused > 0 ? stats.paused : Math.floor(stats.active * 0.2);
    insights.push({
      type: "critical",
      title: "Produtos Críticos",
      description:
        stats.paused > 0
          ? "Produtos pausados perdendo vendas"
          : "Estoque baixo em múltiplos produtos",
      value: `${criticalCount} ${criticalCount === 1 ? "produto" : "produtos"}`,
      priority: "high",
    });
  } else {
    insights.push({
      type: "critical",
      title: "Status Saudável",
      description: "Todos produtos com estoque adequado",
      value: "✓ 100%",
      priority: "low",
    });
  }

  // Insight 3: Opportunity (produtos com bom sold_quantity)
  const avgSold = stats.totalSold / Math.max(stats.active, 1);
  if (avgSold > 10) {
    insights.push({
      type: "opportunity",
      title: "Alta Performance",
      description: "Produtos best-sellers com margem para crescer",
      value: `${Math.round(avgSold)} vendas/produto`,
      priority: "medium",
    });
  } else {
    insights.push({
      type: "opportunity",
      title: "Potencial de Melhoria",
      description: "Otimize títulos e preços para aumentar conversão",
      value: `${stats.active} produtos`,
      priority: "medium",
    });
  }

  return insights;
}

function getInsightIcon(type: TopInsight["type"]) {
  switch (type) {
    case "roi":
      return <TrendingUp className="h-5 w-5 text-green-600" />;
    case "critical":
      return <AlertTriangle className="h-5 w-5 text-red-600" />;
    case "opportunity":
      return <Sparkles className="h-5 w-5 text-blue-600" />;
  }
}

function getInsightBackground(type: TopInsight["type"]) {
  switch (type) {
    case "roi":
      return "bg-green-50/80";
    case "critical":
      return "bg-red-50/80";
    case "opportunity":
      return "bg-blue-50/80";
  }
}

function getInsightBorder(type: TopInsight["type"]) {
  switch (type) {
    case "roi":
      return "border-green-500";
    case "critical":
      return "border-red-500";
    case "opportunity":
      return "border-blue-500";
  }
}

function getIconBackground(type: TopInsight["type"]) {
  switch (type) {
    case "roi":
      return "bg-green-100";
    case "critical":
      return "bg-red-100";
    case "opportunity":
      return "bg-blue-100";
  }
}

function getValueColor(type: TopInsight["type"]) {
  switch (type) {
    case "roi":
      return "text-green-700";
    case "critical":
      return "text-red-700";
    case "opportunity":
      return "text-blue-700";
  }
}
