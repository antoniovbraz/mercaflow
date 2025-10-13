'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  Loader2,
  DollarSign,
  TrendingUp
} from 'lucide-react';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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
  last_synced_at: string;
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
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const ITEMS_PER_PAGE = 20;

  useEffect(() => {
    loadProducts();
    loadStats(); // Load stats separately
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadStats = useCallback(async () => {
    try {
      // Use dedicated stats endpoint for accurate and fast statistics
      const response = await fetch('/api/ml/stats');

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to load statistics');
      }

      const statsData = await response.json();

      setStats({
        total: statsData.total || 0,
        active: statsData.active || 0,
        paused: statsData.paused || 0,
        sold: statsData.sold || 0,
      });

    } catch (err) {
      console.error('Failed to load stats:', err);
      // Fallback to basic stats if dedicated endpoint fails
      setStats({
        total: 0,
        active: 0,
        paused: 0,
        sold: 0,
      });
    }
  }, []);

  const loadProducts = useCallback(async (reset = true, page = 0) => {
    try {
      if (reset) {
        setLoading(true);
        setProducts([]);
        setCurrentPage(0);
      }
      
      setError(null);
      
      const params = new URLSearchParams({
        page: (page + 1).toString(), // API uses 1-based pagination
        limit: ITEMS_PER_PAGE.toString(),
      });

      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }

      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      const response = await fetch(`/api/ml/products?${params}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to load products');
      }
      
      const data = await response.json();

      if (reset) {
        setProducts(data.products);
      } else {
        setProducts(prev => [...prev, ...data.products]);
      }

      setHasMore(data.pagination.hasNext);
      setCurrentPage(page);
      
    } catch (err) {
      console.error('Failed to load products:', err);
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchQuery, statusFilter]);

  const refreshProducts = async () => {
    setRefreshing(true);
    await Promise.all([
      loadProducts(),
      loadStats()
    ]);
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      loadProducts(false, currentPage + 1);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadProducts();
  };

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    setTimeout(() => loadProducts(), 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'paused':
        return 'secondary';
      case 'closed':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const formatCurrency = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  if (loading && products.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-muted-foreground">Carregando produtos...</span>
          </div>
        </CardContent>
      </Card>
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
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
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
              { key: 'all', label: 'Todos' },
              { key: 'active', label: 'Ativos' },
              { key: 'paused', label: 'Pausados' },
              { key: 'closed', label: 'Finalizados' },
            ].map(({ key, label }) => (
              <Button
                key={key}
                variant={statusFilter === key ? 'default' : 'outline'}
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

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Products List */}
      <div className="space-y-4">
        {products.map((product) => (
          <Card key={product.id}>
            <CardContent className="p-4">
              <div className="flex gap-4">
                {/* Product Image */}
                <div className="w-20 h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                  {product.ml_data?.thumbnail ? (
                    <Image
                      src={product.ml_data.thumbnail as string}
                      alt={product.title}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
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
                      <div className="font-medium">{product.available_quantity}</div>
                    </div>
                    
                    <div>
                      <div className="text-muted-foreground">Vendidos</div>
                      <div className="font-medium">{product.sold_quantity || 0}</div>
                    </div>
                    
                    <div>
                      <div className="text-muted-foreground">Atualizado</div>
                      <div className="font-medium">
                        {formatDistanceToNow(
                          new Date(product.last_synced_at),
                          { addSuffix: true, locale: ptBR }
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(product.permalink, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(`/dashboard/ml/products/${product.id}`, '_self')}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(`/dashboard/ml/products/${product.id}/edit`, '_self')}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Load More Button */}
        {hasMore && !loading && (
          <div className="flex justify-center pt-4">
            <Button
              variant="outline"
              onClick={loadMore}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Carregar Mais
            </Button>
          </div>
        )}

        {/* No Products */}
        {!loading && products.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium mb-2">Nenhum produto encontrado</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {searchQuery || statusFilter !== 'all' 
                  ? 'Tente ajustar os filtros de busca'
                  : 'Você ainda não possui produtos no Mercado Livre'
                }
              </p>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeiro Produto
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}