"use client";

import { useState, useEffect } from "react";
import { InsightList } from "@/components/intelligence/InsightList";
import { Insight } from "@/components/intelligence/InsightCard";
import { InsightModal } from "@/components/intelligence/InsightModal";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  TrendingUp,
  Zap,
  AlertTriangle,
  RefreshCw,
  ChevronRight,
} from "lucide-react";
import { logger } from "@/utils/logger";

interface IntelligenceCenterProps {
  limit?: number;
  compactMode?: boolean;
}

export function IntelligenceCenter({
  limit = 5,
  compactMode = false,
}: IntelligenceCenterProps) {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [selectedInsight, setSelectedInsight] = useState<Insight | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Stats calculados
  const urgentCount = insights.filter(
    (i) => i.priority === "HIGH" && i.status === "ACTIVE"
  ).length;
  const opportunityCount = insights.filter(
    (i) => i.category === "PRICE_OPTIMIZATION" && i.status === "ACTIVE"
  ).length;
  const totalPotentialROI = insights
    .filter((i) => i.status === "ACTIVE")
    .reduce((sum, i) => sum + (i.estimated_impact?.revenue || 0), 0);

  const fetchTopInsights = async () => {
    try {
      setIsLoading(true);

      const params = new URLSearchParams({
        status: "ACTIVE",
        limit: limit.toString(),
        sort: "priority",
        order: "desc",
      });

      const response = await fetch(`/api/intelligence/insights/list?${params}`);

      if (!response.ok) {
        throw new Error("Falha ao carregar insights");
      }

      const data = await response.json();
      setInsights(data.data.insights);
    } catch (error) {
      logger.error("Error fetching top insights", { error });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTopInsights();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limit]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchTopInsights();
  };

  const handleViewDetails = (insight: Insight) => {
    setSelectedInsight(insight);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (compactMode) {
    return (
      <Card className="border-outline-subtle bg-surface-elevated">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-intent-brand/10 text-intent-brand">
                <Brain className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <CardTitle className="text-lg text-text-primary">
                  Intelligence Center
                </CardTitle>
                <CardDescription className="text-xs text-text-muted">
                  Insights ativos priorizados
                </CardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw
                className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg border border-outline-subtle bg-surface p-3 text-center">
              <div className="mb-1 flex items-center justify-center gap-1">
                <AlertTriangle className="h-4 w-4 text-intent-danger" aria-hidden="true" />
                <span className="text-2xl font-bold text-intent-danger">
                  {urgentCount}
                </span>
              </div>
              <p className="text-xs text-text-muted">Urgentes</p>
            </div>
            <div className="rounded-lg border border-outline-subtle bg-surface p-3 text-center">
              <div className="mb-1 flex items-center justify-center gap-1">
                <TrendingUp className="h-4 w-4 text-intent-success" aria-hidden="true" />
                <span className="text-2xl font-bold text-intent-success">
                  {opportunityCount}
                </span>
              </div>
              <p className="text-xs text-text-muted">Oportunidades</p>
            </div>
            <div className="rounded-lg border border-outline-subtle bg-surface p-3 text-center">
              <div className="mb-1 flex items-center justify-center gap-1">
                <Zap className="h-4 w-4 text-intent-brand" aria-hidden="true" />
                <span className="text-lg font-bold text-intent-brand">
                  {formatCurrency(totalPotentialROI)}
                </span>
              </div>
              <p className="text-xs text-text-muted">ROI Potencial</p>
            </div>
          </div>

          {/* Top Insights Preview */}
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Carregando insights...
            </div>
          ) : insights.length === 0 ? (
            <div className="text-center py-8">
              <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-2 opacity-50" />
              <p className="text-sm text-muted-foreground">
                Nenhum insight ativo no momento
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {insights.slice(0, 3).map((insight) => (
                <div
                  key={insight.id}
                  className="cursor-pointer rounded-lg border border-outline-subtle bg-surface p-3 transition-colors hover:border-intent-brand hover:bg-intent-brand/5"
                  onClick={() => handleViewDetails(insight)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge
                          variant={
                            insight.priority === "HIGH"
                              ? "destructive"
                              : "secondary"
                          }
                          className="text-xs"
                        >
                          {insight.priority}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {Math.round(insight.confidence_score * 100)}%
                          confiança
                        </span>
                      </div>
                      <p className="text-sm font-semibold line-clamp-2">
                        {insight.title}
                      </p>
                      {insight.estimated_impact?.revenue && (
                        <p className="text-xs text-green-600 mt-1">
                          ROI:{" "}
                          {formatCurrency(insight.estimated_impact.revenue)}
                        </p>
                      )}
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* View All Button */}
          {insights.length > 3 && (
            <Button variant="outline" className="w-full" asChild>
              <a href="/dashboard/insights">
                Ver todos os {insights.length} insights
                <ChevronRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          )}
        </CardContent>

        {/* Insight Modal */}
        <InsightModal
          insight={selectedInsight}
          open={!!selectedInsight}
          onOpenChange={(open) => !open && setSelectedInsight(null)}
          onRefresh={fetchTopInsights}
        />
      </Card>
    );
  }

  // Full mode - integração com InsightList
  return (
    <div className="space-y-6">
      {/* Header com Stats */}
      <Card className="border-outline-subtle bg-surface-elevated">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-intent-brand/10 text-intent-brand">
                <Brain className="h-7 w-7" aria-hidden="true" />
              </div>
              <div>
                <CardTitle className="text-2xl text-text-primary">
                  Intelligence Center
                </CardTitle>
                <CardDescription className="text-text-muted">
                  Insights acionáveis baseados em economia aplicada e IA
                </CardDescription>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
              />
              Atualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-outline-subtle bg-surface p-6">
              <div className="mb-2 flex items-center gap-3">
                <AlertTriangle className="h-6 w-6 text-intent-danger" aria-hidden="true" />
                <span className="text-3xl font-bold text-intent-danger">
                  {urgentCount}
                </span>
              </div>
              <p className="text-sm font-semibold text-text-primary">
                Ações urgentes
              </p>
              <p className="mt-1 text-xs text-text-muted">
                Alta prioridade - ação imediata recomendada
              </p>
            </div>

            <div className="rounded-lg border border-outline-subtle bg-surface p-6">
              <div className="mb-2 flex items-center gap-3">
                <TrendingUp className="h-6 w-6 text-intent-success" aria-hidden="true" />
                <span className="text-3xl font-bold text-intent-success">
                  {opportunityCount}
                </span>
              </div>
              <p className="text-sm font-semibold text-text-primary">
                Oportunidades de preço
              </p>
              <p className="mt-1 text-xs text-text-muted">
                Otimizações detectadas pela IA
              </p>
            </div>

            <div className="rounded-lg border border-outline-subtle bg-surface p-6">
              <div className="mb-2 flex items-center gap-3">
                <Zap className="h-6 w-6 text-intent-brand" aria-hidden="true" />
                <span className="text-2xl font-bold text-intent-brand">
                  {formatCurrency(totalPotentialROI)}
                </span>
              </div>
              <p className="text-sm font-semibold text-text-primary">
                ROI potencial total
              </p>
              <p className="mt-1 text-xs text-text-muted">
                Impacto estimado de todos os insights ativos
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Insights List Integration */}
      <InsightList
        onViewDetails={handleViewDetails}
        initialFilters={{ status: "ACTIVE" }}
      />

      {/* Insight Modal */}
      <InsightModal
        insight={selectedInsight}
        open={!!selectedInsight}
        onOpenChange={(open) => !open && setSelectedInsight(null)}
        onRefresh={fetchTopInsights}
      />
    </div>
  );
}
