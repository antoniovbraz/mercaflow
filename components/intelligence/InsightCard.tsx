"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  AlertTriangle,
  Zap,
  Target,
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type InsightPriority = "HIGH" | "MEDIUM" | "LOW";
export type InsightStatus = "ACTIVE" | "DISMISSED" | "COMPLETED";
export type InsightCategory =
  | "PRICE_OPTIMIZATION"
  | "AUTOMATION_OPPORTUNITY"
  | "PERFORMANCE_WARNING"
  | "MARKET_TREND";

export interface Insight {
  id: string;
  tenant_id: string;
  item_id: string;
  category: InsightCategory;
  priority: InsightPriority;
  title: string;
  description: string;
  action_items: string[];
  estimated_impact?: {
    revenue?: number;
    conversion_rate?: number;
    time_saved?: number;
  };
  confidence_score: number;
  status: InsightStatus;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: Record<string, any>;
  expires_at?: string;
  dismissed_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

interface InsightCardProps {
  insight: Insight;
  onDismiss?: (id: string) => void;
  onComplete?: (id: string) => void;
  onViewDetails?: (insight: Insight) => void;
  isLoading?: boolean;
}

const categoryIcons: Record<InsightCategory, React.ElementType> = {
  PRICE_OPTIMIZATION: TrendingUp,
  AUTOMATION_OPPORTUNITY: Zap,
  PERFORMANCE_WARNING: AlertTriangle,
  MARKET_TREND: Target,
};

const categoryColors: Record<InsightCategory, string> = {
  PRICE_OPTIMIZATION: "text-green-600 bg-green-50",
  AUTOMATION_OPPORTUNITY: "text-blue-600 bg-blue-50",
  PERFORMANCE_WARNING: "text-orange-600 bg-orange-50",
  MARKET_TREND: "text-purple-600 bg-purple-50",
};

const priorityColors: Record<InsightPriority, string> = {
  HIGH: "bg-red-100 text-red-800 border-red-200",
  MEDIUM: "bg-yellow-100 text-yellow-800 border-yellow-200",
  LOW: "bg-gray-100 text-gray-800 border-gray-200",
};

const statusIcons: Record<InsightStatus, React.ElementType> = {
  ACTIVE: Clock,
  DISMISSED: XCircle,
  COMPLETED: CheckCircle2,
};

const statusColors: Record<InsightStatus, string> = {
  ACTIVE: "text-blue-600",
  DISMISSED: "text-gray-400",
  COMPLETED: "text-green-600",
};

export function InsightCard({
  insight,
  onDismiss,
  onComplete,
  onViewDetails,
  isLoading = false,
}: InsightCardProps) {
  const CategoryIcon = categoryIcons[insight.category];
  const StatusIcon = statusIcons[insight.status];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const getCategoryLabel = (category: InsightCategory): string => {
    const labels: Record<InsightCategory, string> = {
      PRICE_OPTIMIZATION: "Otimização de Preço",
      AUTOMATION_OPPORTUNITY: "Automação",
      PERFORMANCE_WARNING: "Alerta de Performance",
      MARKET_TREND: "Tendência de Mercado",
    };
    return labels[category];
  };

  const getPriorityLabel = (priority: InsightPriority): string => {
    const labels: Record<InsightPriority, string> = {
      HIGH: "Alta",
      MEDIUM: "Média",
      LOW: "Baixa",
    };
    return labels[priority];
  };

  return (
    <Card
      className={cn(
        "transition-all hover:shadow-md",
        insight.status === "DISMISSED" && "opacity-60",
        insight.status === "COMPLETED" && "border-green-200 bg-green-50/30"
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1">
            <div
              className={cn(
                "p-2 rounded-lg",
                categoryColors[insight.category]
              )}
            >
              <CategoryIcon className="h-5 w-5" />
            </div>
            <div className="flex-1 space-y-1">
              <CardTitle className="text-base font-semibold leading-tight">
                {insight.title}
              </CardTitle>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge
                  variant="outline"
                  className={cn("text-xs", priorityColors[insight.priority])}
                >
                  Prioridade: {getPriorityLabel(insight.priority)}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {getCategoryLabel(insight.category)}
                </Badge>
                <div
                  className={cn(
                    "flex items-center gap-1 text-xs",
                    statusColors[insight.status]
                  )}
                >
                  <StatusIcon className="h-3 w-3" />
                  <span className="font-medium">
                    {insight.status === "ACTIVE" && "Ativo"}
                    {insight.status === "DISMISSED" && "Descartado"}
                    {insight.status === "COMPLETED" && "Concluído"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{insight.description}</p>

        {insight.action_items && insight.action_items.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-foreground">
              Ações Recomendadas:
            </p>
            <ul className="space-y-1">
              {insight.action_items.slice(0, 2).map((action, index) => (
                <li
                  key={index}
                  className="text-xs text-muted-foreground flex items-start gap-2"
                >
                  <span className="text-primary mt-0.5">•</span>
                  <span className="flex-1">{action}</span>
                </li>
              ))}
              {insight.action_items.length > 2 && (
                <li className="text-xs text-primary">
                  +{insight.action_items.length - 2} ações adicionais
                </li>
              )}
            </ul>
          </div>
        )}

        {insight.estimated_impact && (
          <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
            {insight.estimated_impact.revenue && (
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-xs text-muted-foreground">
                    Impacto Estimado
                  </p>
                  <p className="text-sm font-semibold text-green-600">
                    {formatCurrency(insight.estimated_impact.revenue)}
                  </p>
                </div>
              </div>
            )}
            {insight.estimated_impact.conversion_rate && (
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-xs text-muted-foreground">Conversão</p>
                  <p className="text-sm font-semibold text-blue-600">
                    {formatPercentage(insight.estimated_impact.conversion_rate)}
                  </p>
                </div>
              </div>
            )}
            {insight.estimated_impact.time_saved && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-purple-600" />
                <div>
                  <p className="text-xs text-muted-foreground">Tempo</p>
                  <p className="text-sm font-semibold text-purple-600">
                    {insight.estimated_impact.time_saved}h
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center gap-2 pt-2">
          {insight.status === "ACTIVE" && (
            <>
              <Button
                size="sm"
                onClick={() => onComplete?.(insight.id)}
                disabled={isLoading}
                className="flex-1"
              >
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Marcar Concluído
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onDismiss?.(insight.id)}
                disabled={isLoading}
                className="flex-1"
              >
                <XCircle className="h-4 w-4 mr-1" />
                Descartar
              </Button>
            </>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onViewDetails?.(insight)}
            className={cn(insight.status === "ACTIVE" ? "w-auto" : "flex-1")}
          >
            Ver Detalhes
          </Button>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
          <span>
            Confiança: {Math.round(insight.confidence_score * 100)}%
          </span>
          <span>
            Criado:{" "}
            {new Date(insight.created_at).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "short",
            })}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
