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
  Package,
  AlertTriangle,
  Loader2,
  DollarSign,
  TrendingUp,
  User,
  MapPin,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MLOrder {
  id: number;
  status: string;
  status_detail?: string;
  date_created: string;
  date_closed?: string;
  order_items: Array<{
    item: {
      id: string;
      title: string;
      category_id: string;
      variation_id?: number;
    };
    quantity: number;
    unit_price: number;
    full_unit_price: number;
  }>;
  total_amount: number;
  currency_id: string;
  buyer: {
    id: number;
    nickname: string;
    email?: string;
    first_name?: string;
    last_name?: string;
  };
  shipping?: {
    id: number;
    status: string;
    substatus?: string;
    receiver_address: {
      address_line: string;
      city: {
        name: string;
      };
      state: {
        name: string;
      };
      zip_code: string;
    };
  };
  payments?: Array<{
    id: number;
    status: string;
    transaction_amount: number;
    payment_method_id: string;
    installments: number;
    date_created: string;
  }>;
}

interface OrdersResponse {
  results: MLOrder[];
  paging: {
    total: number;
    limit: number;
    offset: number;
  };
}

interface OrderStats {
  total: number;
  confirmed: number;
  paid: number;
  shipped: number;
  delivered: number;
}

export function MLOrderManager() {
  const [orders, setOrders] = useState<MLOrder[]>([]);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const ITEMS_PER_PAGE = 20;

  useEffect(() => {
    loadOrders();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadOrders = useCallback(async (reset = true, page = 0) => {
    try {
      if (reset) {
        setLoading(true);
        setOrders([]);
        setCurrentPage(0);
      }
      
      setError(null);
      
      const params = new URLSearchParams({
        offset: (page * ITEMS_PER_PAGE).toString(),
        limit: ITEMS_PER_PAGE.toString(),
      });

      if (searchQuery.trim()) {
        params.append('q', searchQuery.trim());
      }

      if (statusFilter !== 'all') {
        params.append('order.status', statusFilter);
      }

      // Set date range for recent orders (last 30 days by default)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      params.append('order.date_created.from', thirtyDaysAgo.toISOString());

      const response = await fetch(`/api/ml/orders?${params}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to load orders');
      }
      
      const data: OrdersResponse = await response.json();
      
      if (reset) {
        setOrders(data.results);
      } else {
        setOrders(prev => [...prev, ...data.results]);
      }
      
      setHasMore(data.results.length === ITEMS_PER_PAGE);
      setCurrentPage(page);
      
      // Calculate stats
      const confirmedCount = data.results.filter(o => o.status === 'confirmed').length;
      const paidCount = data.results.filter(o => o.status === 'paid').length;
      const shippedCount = data.results.filter(o => o.shipping?.status === 'shipped').length;
      const deliveredCount = data.results.filter(o => o.shipping?.status === 'delivered').length;
      
      setStats({
        total: data.paging.total,
        confirmed: confirmedCount,
        paid: paidCount,
        shipped: shippedCount,
        delivered: deliveredCount,
      });
      
    } catch (err) {
      console.error('Failed to load orders:', err);
      setError(err instanceof Error ? err.message : 'Failed to load orders');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchQuery, statusFilter]);

  const refreshOrders = async () => {
    setRefreshing(true);
    await loadOrders();
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      loadOrders(false, currentPage + 1);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadOrders();
  };

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    setTimeout(() => loadOrders(), 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'default';
      case 'paid':
        return 'default';
      case 'shipped':
        return 'secondary';
      case 'delivered':
        return 'default';
      case 'cancelled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmado';
      case 'paid':
        return 'Pago';
      case 'shipped':
        return 'Enviado';
      case 'delivered':
        return 'Entregue';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const getShippingStatusLabel = (status?: string) => {
    if (!status) return '-';
    
    switch (status) {
      case 'pending':
        return 'Pendente';
      case 'handling':
        return 'Preparando';
      case 'shipped':
        return 'Enviado';
      case 'delivered':
        return 'Entregue';
      default:
        return status;
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency === 'ARS' ? 'ARS' : 'BRL',
    }).format(amount);
  };

  if (loading && orders.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-muted-foreground">Carregando pedidos...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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
                  <div className="text-2xl font-bold">{stats.confirmed}</div>
                  <div className="text-xs text-muted-foreground">Confirmados</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-purple-500" />
                <div>
                  <div className="text-2xl font-bold">{stats.paid}</div>
                  <div className="text-xs text-muted-foreground">Pagos</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-orange-500" />
                <div>
                  <div className="text-2xl font-bold">{stats.shipped}</div>
                  <div className="text-xs text-muted-foreground">Enviados</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-500" />
                <div>
                  <div className="text-2xl font-bold">{stats.delivered}</div>
                  <div className="text-xs text-muted-foreground">Entregues</div>
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
              Pedidos Mercado Livre
            </CardTitle>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={refreshOrders}
                disabled={refreshing}
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
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
                placeholder="Buscar por ID do pedido, comprador..."
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
              { key: 'confirmed', label: 'Confirmados' },
              { key: 'paid', label: 'Pagos' },
              { key: 'shipped', label: 'Enviados' },
              { key: 'delivered', label: 'Entregues' },
              { key: 'cancelled', label: 'Cancelados' },
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

      {/* Orders List */}
      <div className="space-y-4">
        {orders.map((order) => (
          <Card key={order.id}>
            <CardContent className="p-4">
              <div className="space-y-4">
                {/* Order Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">
                      Pedido #{order.id}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(order.date_created), "dd 'de' MMM, yyyy 'às' HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusColor(order.status)}>
                      {getStatusLabel(order.status)}
                    </Badge>
                    {order.shipping && (
                      <Badge variant="outline">
                        {getShippingStatusLabel(order.shipping.status)}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Buyer Info */}
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span>
                    {order.buyer.nickname}
                    {order.buyer.first_name && order.buyer.last_name && (
                      <span className="text-muted-foreground ml-1">
                        ({order.buyer.first_name} {order.buyer.last_name})
                      </span>
                    )}
                  </span>
                </div>

                {/* Items */}
                <div className="space-y-2">
                  {order.order_items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium line-clamp-1">{item.item.title}</p>
                        <p className="text-sm text-muted-foreground">
                          Qtd: {item.quantity} • ID: {item.item.id}
                        </p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="font-medium">
                          {formatCurrency(item.unit_price, order.currency_id)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          por unidade
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Shipping Address */}
                {order.shipping?.receiver_address && (
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p>{order.shipping.receiver_address.address_line}</p>
                      <p className="text-muted-foreground">
                        {order.shipping.receiver_address.city.name}, {order.shipping.receiver_address.state.name}
                      </p>
                      <p className="text-muted-foreground">
                        CEP: {order.shipping.receiver_address.zip_code}
                      </p>
                    </div>
                  </div>
                )}

                {/* Total and Actions */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="text-lg font-bold">
                    Total: {formatCurrency(order.total_amount, order.currency_id)}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`https://www.mercadolivre.com.br/vendas/${order.id}`, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Ver no ML
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(`/dashboard/ml/orders/${order.id}`, '_self')}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
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

        {/* No Orders */}
        {!loading && orders.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium mb-2">Nenhum pedido encontrado</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {searchQuery || statusFilter !== 'all' 
                  ? 'Tente ajustar os filtros de busca ou o período'
                  : 'Você ainda não possui pedidos nos últimos 30 dias'
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}