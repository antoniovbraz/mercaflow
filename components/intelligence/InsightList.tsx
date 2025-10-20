"use client";

import { useState, useEffect } from "react";
import { InsightCard, Insight, InsightPriority, InsightStatus, InsightCategory } from "./InsightCard";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Loader2, RefreshCw, Search, Filter } from "lucide-react";
import { toast } from "sonner";
import { logger } from "@/utils/logger";

interface InsightListProps {
  onViewDetails?: (insight: Insight) => void;
  initialFilters?: {
    status?: InsightStatus;
    category?: InsightCategory;
    priority?: InsightPriority;
  };
}

export function InsightList({ onViewDetails, initialFilters }: InsightListProps) {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Filtros
  const [statusFilter, setStatusFilter] = useState<InsightStatus | "ALL">(
    initialFilters?.status || "ALL"
  );
  const [categoryFilter, setCategoryFilter] = useState<InsightCategory | "ALL">(
    initialFilters?.category || "ALL"
  );
  const [priorityFilter, setPriorityFilter] = useState<InsightPriority | "ALL">(
    initialFilters?.priority || "ALL"
  );
  const [searchQuery, setSearchQuery] = useState("");

  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const itemsPerPage = 20;

  // Ordenação
  const [sortBy, setSortBy] = useState<"created_at" | "priority" | "confidence_score">("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const fetchInsights = async () => {
    try {
      setIsLoading(true);

      const params = new URLSearchParams({
        limit: itemsPerPage.toString(),
        offset: ((currentPage - 1) * itemsPerPage).toString(),
        sort: sortBy,
        order: sortOrder,
      });

      if (statusFilter !== "ALL") params.append("status", statusFilter);
      if (categoryFilter !== "ALL") params.append("category", categoryFilter);
      if (priorityFilter !== "ALL") params.append("priority", priorityFilter);

      const response = await fetch(`/api/intelligence/insights/list?${params}`);

      if (!response.ok) {
        throw new Error("Falha ao carregar insights");
      }

      const data = await response.json();
      setInsights(data.data.insights);
      setTotalCount(data.data.count);
      setHasMore(data.data.has_more);
    } catch (error) {
      logger.error("Error fetching insights", { error });
      toast.error("Erro ao carregar insights", {
        description: "Não foi possível carregar os insights. Tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, statusFilter, categoryFilter, priorityFilter, sortBy, sortOrder]);

  const handleDismiss = async (id: string) => {
    try {
      setActionLoading(id);

      const response = await fetch(`/api/intelligence/insights/${id}/dismiss`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Falha ao descartar insight");
      }

      toast.success("Insight descartado", {
        description: "O insight foi marcado como descartado.",
      });

      // Atualizar lista
      await fetchInsights();
    } catch (error) {
      logger.error("Error dismissing insight", { error, insightId: id });
      toast.error("Erro ao descartar insight", {
        description: "Não foi possível descartar o insight. Tente novamente.",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleComplete = async (id: string) => {
    try {
      setActionLoading(id);

      const response = await fetch(`/api/intelligence/insights/${id}/complete`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Falha ao completar insight");
      }

      const data = await response.json();

      toast.success("Insight concluído", {
        description: data.data.roi_realized
          ? `ROI realizado: R$ ${data.data.roi_realized.toFixed(2)}`
          : "O insight foi marcado como concluído.",
      });

      // Atualizar lista
      await fetchInsights();
    } catch (error) {
      logger.error("Error completing insight", { error, insightId: id });
      toast.error("Erro ao completar insight", {
        description: "Não foi possível completar o insight. Tente novamente.",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleRefresh = () => {
    setCurrentPage(1);
    fetchInsights();
  };

  const handleResetFilters = () => {
    setStatusFilter("ALL");
    setCategoryFilter("ALL");
    setPriorityFilter("ALL");
    setSearchQuery("");
    setCurrentPage(1);
  };

  // Filtro local por busca
  const filteredInsights = insights.filter((insight) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      insight.title.toLowerCase().includes(query) ||
      insight.description.toLowerCase().includes(query)
    );
  });

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="flex flex-col gap-4 p-4 bg-card rounded-lg border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-semibold">Filtros</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetFilters}
            className="h-8"
          >
            Limpar Filtros
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar insights..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as InsightStatus | "ALL")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos os Status</SelectItem>
              <SelectItem value="ACTIVE">Ativos</SelectItem>
              <SelectItem value="COMPLETED">Concluídos</SelectItem>
              <SelectItem value="DISMISSED">Descartados</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={categoryFilter}
            onValueChange={(value) => setCategoryFilter(value as InsightCategory | "ALL")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todas as Categorias</SelectItem>
              <SelectItem value="PRICE_OPTIMIZATION">Otimização de Preço</SelectItem>
              <SelectItem value="AUTOMATION_OPPORTUNITY">Automação</SelectItem>
              <SelectItem value="PERFORMANCE_WARNING">Alerta de Performance</SelectItem>
              <SelectItem value="MARKET_TREND">Tendência de Mercado</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={priorityFilter}
            onValueChange={(value) => setPriorityFilter(value as InsightPriority | "ALL")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Prioridade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todas as Prioridades</SelectItem>
              <SelectItem value="HIGH">Alta</SelectItem>
              <SelectItem value="MEDIUM">Média</SelectItem>
              <SelectItem value="LOW">Baixa</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Ordenar por:</span>
            <Select
              value={sortBy}
              onValueChange={(value) =>
                setSortBy(value as "created_at" | "priority" | "confidence_score")
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at">Data de Criação</SelectItem>
                <SelectItem value="priority">Prioridade</SelectItem>
                <SelectItem value="confidence_score">Confiança</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Select
            value={sortOrder}
            onValueChange={(value) => setSortOrder(value as "asc" | "desc")}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Decrescente</SelectItem>
              <SelectItem value="asc">Crescente</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            className="ml-auto"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Header com contagem */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Insights</h2>
          <p className="text-sm text-muted-foreground">
            {totalCount} insight{totalCount !== 1 ? "s" : ""} encontrado{totalCount !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Lista de Insights */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredInsights.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            Nenhum insight encontrado com os filtros selecionados.
          </p>
          <Button
            variant="outline"
            onClick={handleResetFilters}
            className="mt-4"
          >
            Limpar Filtros
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredInsights.map((insight) => (
            <InsightCard
              key={insight.id}
              insight={insight}
              onDismiss={handleDismiss}
              onComplete={handleComplete}
              onViewDetails={onViewDetails}
              isLoading={actionLoading === insight.id}
            />
          ))}
        </div>
      )}

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1 || isLoading}
          >
            Anterior
          </Button>
          <span className="text-sm text-muted-foreground px-4">
            Página {currentPage} de {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => p + 1)}
            disabled={!hasMore || isLoading}
          >
            Próxima
          </Button>
        </div>
      )}
    </div>
  );
}
