"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  TrendingUp,
  AlertTriangle,
  Zap,
  Target,
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  Calendar,
  AlertCircle,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Insight,
  InsightPriority,
  InsightCategory,
  InsightStatus,
} from "./InsightCard";
import { toast } from "sonner";
import { logger } from "@/utils/logger";

interface InsightModalProps {
  insight: Insight | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDismiss?: (id: string) => void;
  onComplete?: (id: string) => void;
  onRefresh?: () => void;
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

export function InsightModal({
  insight,
  open,
  onOpenChange,
  onRefresh,
}: InsightModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  if (!insight) return null;

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

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getCategoryLabel = (category: InsightCategory): string => {
    const labels: Record<InsightCategory, string> = {
      PRICE_OPTIMIZATION: "Otimização de Preço",
      AUTOMATION_OPPORTUNITY: "Oportunidade de Automação",
      PERFORMANCE_WARNING: "Alerta de Performance",
      MARKET_TREND: "Tendência de Mercado",
    };
    return labels[category];
  };

  const getPriorityLabel = (priority: InsightPriority): string => {
    const labels: Record<InsightPriority, string> = {
      HIGH: "Alta Prioridade",
      MEDIUM: "Média Prioridade",
      LOW: "Baixa Prioridade",
    };
    return labels[priority];
  };

  const getStatusLabel = (status: InsightStatus): string => {
    const labels: Record<InsightStatus, string> = {
      ACTIVE: "Ativo",
      DISMISSED: "Descartado",
      COMPLETED: "Concluído",
    };
    return labels[status];
  };

  const handleDismiss = async () => {
    try {
      setIsLoading(true);

      const response = await fetch(
        `/api/intelligence/insights/${insight.id}/dismiss`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        throw new Error("Falha ao descartar insight");
      }

      toast.success("Insight descartado com sucesso");
      onRefresh?.();
      onOpenChange(false);
    } catch (error) {
      logger.error("Error dismissing insight", {
        error,
        insightId: insight.id,
      });
      toast.error("Erro ao descartar insight", {
        description: "Não foi possível descartar o insight. Tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async () => {
    try {
      setIsLoading(true);

      const response = await fetch(
        `/api/intelligence/insights/${insight.id}/complete`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        throw new Error("Falha ao completar insight");
      }

      const data = await response.json();

      toast.success("Insight concluído com sucesso", {
        description: data.data.roi_realized
          ? `ROI realizado: ${formatCurrency(data.data.roi_realized)}`
          : undefined,
      });

      onRefresh?.();
      onOpenChange(false);
    } catch (error) {
      logger.error("Error completing insight", {
        error,
        insightId: insight.id,
      });
      toast.error("Erro ao completar insight", {
        description: "Não foi possível completar o insight. Tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <div
              className={cn("p-3 rounded-lg", categoryColors[insight.category])}
            >
              <CategoryIcon className="h-6 w-6" />
            </div>
            <div className="flex-1 space-y-2">
              <DialogTitle className="text-xl">{insight.title}</DialogTitle>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge
                  variant="outline"
                  className={cn("text-xs", priorityColors[insight.priority])}
                >
                  {getPriorityLabel(insight.priority)}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {getCategoryLabel(insight.category)}
                </Badge>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <StatusIcon className="h-4 w-4" />
                  <span>{getStatusLabel(insight.status)}</span>
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-200px)]">
          <div className="space-y-6 pr-4">
            {/* Descrição */}
            <div>
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Info className="h-4 w-4" />
                Descrição
              </h3>
              <DialogDescription className="text-base">
                {insight.description}
              </DialogDescription>
            </div>

            <Separator />

            {/* Ações Recomendadas */}
            {insight.action_items && insight.action_items.length > 0 && (
              <>
                <div>
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Ações Recomendadas
                  </h3>
                  <ul className="space-y-2">
                    {insight.action_items.map((action, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg"
                      >
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-semibold flex-shrink-0 mt-0.5">
                          {index + 1}
                        </span>
                        <span className="text-sm flex-1">{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Separator />
              </>
            )}

            {/* Impacto Estimado */}
            {insight.estimated_impact && (
              <>
                <div>
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Impacto Estimado
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {insight.estimated_impact.revenue && (
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <DollarSign className="h-5 w-5 text-green-600" />
                          <span className="text-sm font-medium text-green-900">
                            Receita Potencial
                          </span>
                        </div>
                        <p className="text-2xl font-bold text-green-600">
                          {formatCurrency(insight.estimated_impact.revenue)}
                        </p>
                      </div>
                    )}
                    {insight.estimated_impact.conversion_rate && (
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="h-5 w-5 text-blue-600" />
                          <span className="text-sm font-medium text-blue-900">
                            Taxa de Conversão
                          </span>
                        </div>
                        <p className="text-2xl font-bold text-blue-600">
                          {formatPercentage(
                            insight.estimated_impact.conversion_rate
                          )}
                        </p>
                      </div>
                    )}
                    {insight.estimated_impact.time_saved && (
                      <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="h-5 w-5 text-purple-600" />
                          <span className="text-sm font-medium text-purple-900">
                            Tempo Economizado
                          </span>
                        </div>
                        <p className="text-2xl font-bold text-purple-600">
                          {insight.estimated_impact.time_saved}h
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />
              </>
            )}

            {/* Metadados */}
            <div>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Informações Adicionais
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <p className="text-muted-foreground">Confiança</p>
                  <p className="font-semibold">
                    {Math.round(insight.confidence_score * 100)}%
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Item ID</p>
                  <p className="font-semibold font-mono text-xs">
                    {insight.item_id}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Criado em
                  </p>
                  <p className="font-semibold text-xs">
                    {formatDate(insight.created_at)}
                  </p>
                </div>
                {insight.expires_at && (
                  <div className="space-y-1">
                    <p className="text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Expira em
                    </p>
                    <p className="font-semibold text-xs">
                      {formatDate(insight.expires_at)}
                    </p>
                  </div>
                )}
                {insight.completed_at && (
                  <div className="space-y-1">
                    <p className="text-muted-foreground flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Concluído em
                    </p>
                    <p className="font-semibold text-xs">
                      {formatDate(insight.completed_at)}
                    </p>
                  </div>
                )}
                {insight.dismissed_at && (
                  <div className="space-y-1">
                    <p className="text-muted-foreground flex items-center gap-1">
                      <XCircle className="h-3 w-3" />
                      Descartado em
                    </p>
                    <p className="font-semibold text-xs">
                      {formatDate(insight.dismissed_at)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Fechar
          </Button>
          {insight.status === "ACTIVE" && (
            <>
              <Button
                variant="outline"
                onClick={handleDismiss}
                disabled={isLoading}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Descartar
              </Button>
              <Button onClick={handleComplete} disabled={isLoading}>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Marcar como Concluído
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
