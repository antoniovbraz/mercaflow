"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  Eye,
  Edit,
  Plus,
  Package,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ProductCardSkeleton,
  StatCardSkeleton,
} from "@/components/ui/skeleton-variants";
import {
  NoProducts,
  NoSearchResults,
  ErrorState,
} from "@/components/ui/empty-state-variants";

interface MLProduct {
  id: string;
  ml_item_id: string;
  title: string;
  category_id: string | null;
  price: number;
  available_quantity: number;
  sold_quantity: number;
  status: string;
  permalink: string;
  last_sync_at: string;
  thumbnail?: string;
  condition?: string;
  listing_type_id?: string;
  ml_data?: Record<string, unknown>;
}

interface ProductStats {
  total: number;
  active: number;
  paused: number;
  sold: number;
}

export function MLProductManager() {
  const [products, setProducts] = useState<MLProduct[]>([]);
  const [stats, setStats] = useState<ProductStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1); // 1-based for display
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  useEffect(() => {
    loadProducts();
    loadStats(); // Load stats separately
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Reload when filters or items per page change
  useEffect(() => {
    if (currentPage === 1) {
      loadProducts(1);
    } else {
      setCurrentPage(1);
    }
  }, [statusFilter, itemsPerPage]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadStats = useCallback(async () => {
    try {
      // Use dedicated stats endpoint for accurate and fast statistics
      const response = await fetch("/api/ml/stats");

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to load statistics");
      }

      const statsData = await response.json();

      setStats({
        total: statsData.total || 0,
        active: statsData.active || 0,
        paused: statsData.paused || 0,
        sold: statsData.sold || 0,
      });
    } catch (err) {
      console.error("Failed to load stats:", err);
      // Fallback to basic stats if dedicated endpoint fails
      setStats({
        total: 0,
        active: 0,
        paused: 0,
        sold: 0,
      });
    }
  }, []);

  const loadProducts = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({
          page: page.toString(),
          limit: itemsPerPage.toString(),
        });

        if (searchQuery.trim()) {
          params.append("search", searchQuery.trim());
        }

        if (statusFilter !== "all") {
          params.append("status", statusFilter);
        }

        const response = await fetch(`/api/ml/products?${params}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to load products");
        }

        const data = await response.json();

        setProducts(data.products);
        setCurrentPage(data.pagination.page);
        setTotalPages(data.pagination.totalPages);
        setTotalProducts(data.pagination.total);
      } catch (err) {
        console.error("Failed to load products:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load products"
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [searchQuery, statusFilter, itemsPerPage]
  );

  const refreshProducts = async () => {
    setRefreshing(true);
    await Promise.all([loadProducts(1), loadStats()]);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      loadProducts(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      loadProducts(currentPage + 1);
    }
  };

  const handleItemsPerPageChange = (newLimit: number) => {
    setItemsPerPage(newLimit);
    setCurrentPage(1);
    // loadProducts will be called by useEffect when itemsPerPage changes
  };

  const syncProducts = async () => {
    try {
      setSyncing(true);

      const response = await fetch("/api/products/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fullSync: true }),
      });

      const result = await response.json();

      if (response.ok) {
        alert(
          `Sincronização concluída! ${result.synced} produtos sincronizados.`
        );
        // Recarregar produtos após sincronização
        await refreshProducts();
      } else {
        alert(`Erro na sincronização: ${result.error || "Erro desconhecido"}`);
      }
    } catch (error) {
      console.error("Sync error:", error);
      alert("Erro ao sincronizar produtos. Tente novamente.");
    } finally {
      setSyncing(false);
    }
  };

  const refreshToken = async () => {
    try {
      setSyncing(true);

      const response = await fetch("/api/ml/refresh-token", {
        method: "POST",
      });

      const result = await response.json();

      if (response.ok && result.success) {
        alert(
          `Token renovado com sucesso! (${result.method}) Agora tente sincronizar os produtos.`
        );
      } else {
        if (result.suggestion) {
          alert(`${result.error}\n\n${result.suggestion}`);
        } else {
          alert(
            `Erro ao renovar token: ${result.error || "Erro desconhecido"}`
          );
        }
      }
    } catch (error) {
      console.error("Token refresh error:", error);
      alert("Erro ao renovar token. Verifique os logs para mais detalhes.");
    } finally {
      setSyncing(false);
    }
  };

  const reAuthorize = async () => {
    try {
      setSyncing(true);

      const response = await fetch("/api/ml/re-auth", {
        method: "POST",
      });

      const result = await response.json();

      if (response.ok && result.oauth_url) {
        // Redirect to Mercado Livre OAuth
        window.location.href = result.oauth_url;
      } else {
        alert(
          `Erro ao iniciar re-autorização: ${
            result.error || "Erro desconhecido"
          }`
        );
      }
    } catch (error) {
      console.error("Re-auth error:", error);
      alert("Erro ao iniciar re-autorização. Tente novamente.");
    } finally {
      setSyncing(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadProducts(1);
  };

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
    // Will trigger loadProducts via useEffect
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "default";
      case "paused":
        return "secondary";
      case "closed":
        return "outline";
      default:
        return "secondary";
    }
  };

  const formatCurrency = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  if (loading && products.length === 0) {
    return (
      <div className="space-y-6">
        {/* Stats Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>

        {/* Products Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-blue-500" />
                <div>
                  <div className="text-2xl font-bold">{stats.total}</div>
                  <div className="text-xs text-muted-foreground">Total</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <div>
                  <div className="text-2xl font-bold">{stats.active}</div>
                  <div className="text-xs text-muted-foreground">Ativos</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
                <div>
                  <div className="text-2xl font-bold">{stats.paused}</div>
                  <div className="text-xs text-muted-foreground">Pausados</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-purple-500" />
                <div>
                  <div className="text-2xl font-bold">{stats.sold}</div>
                  <div className="text-xs text-muted-foreground">Vendidos</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Produtos Mercado Livre
            </CardTitle>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={refreshProducts}
                disabled={refreshing}
              >
                <RefreshCw
                  className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
                />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={refreshToken}
                disabled={syncing}
              >
                <RefreshCw
                  className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`}
                />
                Renovar Token
              </Button>

              <Button
                variant="destructive"
                size="sm"
                onClick={reAuthorize}
                disabled={syncing}
              >
                Re-autorizar ML
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={syncProducts}
                disabled={syncing}
              >
                <TrendingUp
                  className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`}
                />
                {syncing ? "Sincronizando..." : "Sincronizar"}
              </Button>

              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Novo Produto
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Search Form */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar produtos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit" disabled={loading}>
              Buscar
            </Button>
          </form>

          {/* Status Filters */}
          <div className="flex flex-wrap gap-2">
            {[
              { key: "all", label: "Todos" },
              { key: "active", label: "Ativos" },
              { key: "paused", label: "Pausados" },
              { key: "closed", label: "Finalizados" },
            ].map(({ key, label }) => (
              <Button
                key={key}
                variant={statusFilter === key ? "default" : "outline"}
                size="sm"
                onClick={() => handleStatusFilterChange(key)}
              >
                <Filter className="w-3 h-3 mr-1" />
                {label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <ErrorState
          title="Erro ao carregar produtos"
          description={error}
          action={{
            label: "Tentar Novamente",
            onClick: () => {
              setError(null);
              loadProducts();
            },
          }}
          secondaryAction={{
            label: "Renovar Token",
            onClick: refreshToken,
          }}
        />
      )}

      {/* Products List */}
      <div className="space-y-4">
        {products.map((product) => (
          <Card key={product.id}>
            <CardContent className="p-4">
              <div className="flex gap-4">
                {/* Product Image */}
                <div className="w-20 h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                  {product.thumbnail || product.ml_data?.thumbnail ? (
                    <Image
                      src={
                        (product.thumbnail ||
                          product.ml_data?.thumbnail) as string
                      }
                      alt={product.title}
                      width={80}
                      height={80}
                      className="object-cover rounded-md"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium line-clamp-2 mb-1">
                        {product.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        ID: {product.ml_item_id} • ML Item: {product.id}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <Badge variant={getStatusColor(product.status)}>
                        {product.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Preço</div>
                      <div className="font-medium">
                        {formatCurrency(product.price)}
                      </div>
                    </div>

                    <div>
                      <div className="text-muted-foreground">Disponível</div>
                      <div className="font-medium">
                        {product.available_quantity}
                      </div>
                    </div>

                    <div>
                      <div className="text-muted-foreground">Vendidos</div>
                      <div className="font-medium">
                        {product.sold_quantity || 0}
                      </div>
                    </div>

                    <div>
                      <div className="text-muted-foreground">Atualizado</div>
                      <div className="font-medium">
                        {formatDistanceToNow(new Date(product.last_sync_at), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(product.permalink, "_blank")}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      window.open(
                        `/dashboard/ml/products/${product.id}`,
                        "_self"
                      )
                    }
                  >
                    <Eye className="w-4 h-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      window.open(
                        `/dashboard/ml/products/${product.id}/edit`,
                        "_self"
                      )
                    }
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Pagination Controls */}
        {!loading && products.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                {/* Items per page selector */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Itens por página:
                  </span>
                  <div className="flex gap-1">
                    {[20, 50, 100].map((limit) => (
                      <Button
                        key={limit}
                        variant={itemsPerPage === limit ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleItemsPerPageChange(limit)}
                        disabled={loading}
                      >
                        {limit}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Page info */}
                <div className="text-sm text-muted-foreground">
                  Página {currentPage} de {totalPages} ({totalProducts} produtos
                  {statusFilter !== "all" ? ` ${statusFilter}` : ""})
                </div>

                {/* Previous/Next buttons */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreviousPage}
                    disabled={loading || currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={loading || currentPage >= totalPages}
                  >
                    Próximo
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* No Products or No Search Results */}
        {!loading && products.length === 0 && (
          <>
            {searchQuery || statusFilter !== "all" ? (
              <NoSearchResults
                action={{
                  label: "Limpar Filtros",
                  onClick: () => {
                    setSearchQuery("");
                    setStatusFilter("all");
                    setCurrentPage(1);
                  },
                }}
              />
            ) : (
              <NoProducts
                action={{
                  label: "Sincronizar Produtos",
                  onClick: syncProducts,
                }}
                secondaryAction={{
                  label: "Ver Tutorial",
                  onClick: () => window.open("/ajuda/produtos", "_self"),
                }}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
