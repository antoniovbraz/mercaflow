'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Package, 
  TrendingUp, 
  Calendar, 
  DollarSign, 
  User, 
  RefreshCw,
  Filter,
  BarChart3,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye
} from 'lucide-react'

interface Order {
  id: string
  ml_order_id: string
  status: string
  status_detail?: string
  date_created: string
  date_closed?: string
  total_amount: number
  currency_id: string
  buyer_nickname?: string
  buyer_email?: string
  item_title?: string
  quantity: number
  unit_price?: number
  shipping_status?: string
  payment_status?: string
  payment_method?: string
  feedback_rating?: number
  ml_order_items?: OrderItem[]
}

interface OrderItem {
  id: string
  ml_item_id: string
  item_title: string
  quantity: number
  unit_price: number
  total_price: number
}

interface OrderSummary {
  total_orders: number
  total_revenue: number
  avg_order_value: number
  by_status: Record<string, number>
  by_month: Record<string, number>
}

interface MLOrderManagerProps {
  integrationId?: string
}

export default function MLOrderManager({ integrationId: propIntegrationId }: MLOrderManagerProps) {
  const [orders, setOrders] = useState<Order[]>([])
  const [summary, setSummary] = useState<OrderSummary | null>(null)
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [integrationId, setIntegrationId] = useState<string | null>(propIntegrationId || null)
  
  // Filtros
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [dateFromFilter, setDateFromFilter] = useState<string>('')
  const [dateToFilter, setDateToFilter] = useState<string>('')
  const [searchFilter, setSearchFilter] = useState<string>('')

  // Formatação de moeda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  // Formatação de data
  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString))
  }

  // Buscar integração ativa
  const loadIntegration = useCallback(async () => {
    if (integrationId) return
    
    try {
      const response = await fetch('/api/ml/integration')
      if (!response.ok) {
        throw new Error('Integração não encontrada')
      }
      
      const data = await response.json()
      setIntegrationId(data.id)
    } catch (err) {
      console.error('Erro ao carregar integração:', err)
      setError('Nenhuma integração ativa encontrada')
    }
  }, [integrationId])

  // Carregar pedidos
  const loadOrders = useCallback(async (syncFirst = false) => {
    if (!integrationId) return
    
    setLoading(true)
    setError(null)
    
    try {
      const params = new URLSearchParams({
        integration_id: integrationId,
        sync: syncFirst ? 'true' : 'false',
        limit: '100'
      })
      
      if (statusFilter && statusFilter !== 'all') params.append('status', statusFilter)
      if (dateFromFilter) params.append('date_from', dateFromFilter)
      if (dateToFilter) params.append('date_to', dateToFilter)
      
      const response = await fetch(`/api/ml/orders?${params}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao carregar pedidos')
      }
      
      const data = await response.json()
      setOrders(data.orders || [])
      setSummary(data.summary)
      
    } catch (err) {
      console.error('Erro ao carregar pedidos:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }, [integrationId, statusFilter, dateFromFilter, dateToFilter])

  // Sincronizar com ML
  const syncOrders = async () => {
    setSyncing(true)
    try {
      await loadOrders(true)
    } finally {
      setSyncing(false)
    }
  }

  // Calcular analytics
  const calculateAnalytics = async () => {
    try {
      const response = await fetch('/api/ml/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          integration_id: integrationId,
          action: 'calculate_analytics'
        })
      })
      
      if (!response.ok) {
        throw new Error('Erro ao calcular analytics')
      }
      
      const result = await response.json()
      console.log('Analytics calculadas:', result)
      
    } catch (err) {
      console.error('Erro ao calcular analytics:', err)
      setError(err instanceof Error ? err.message : 'Erro ao calcular analytics')
    }
  }

  // Carregar ao montar o componente
  useEffect(() => {
    const initializeComponent = async () => {
      await loadIntegration()
      if (integrationId) {
        loadOrders()
      }
    }
    
    initializeComponent()
  }, [loadIntegration, loadOrders, integrationId])

  // Filtrar pedidos localmente
  const filteredOrders = orders.filter(order => {
    if (searchFilter) {
      const search = searchFilter.toLowerCase()
      return (
        order.ml_order_id.toLowerCase().includes(search) ||
        order.buyer_nickname?.toLowerCase().includes(search) ||
        order.item_title?.toLowerCase().includes(search)
      )
    }
    return true
  })

  // Função para obter cor do status
  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'confirmed': 'bg-blue-100 text-blue-800',
      'payment_required': 'bg-orange-100 text-orange-800',
      'payment_in_process': 'bg-yellow-100 text-yellow-800',
      'paid': 'bg-green-100 text-green-800',
      'shipped': 'bg-purple-100 text-purple-800',
      'delivered': 'bg-emerald-100 text-emerald-800',
      'cancelled': 'bg-red-100 text-red-800',
    }
    return statusColors[status] || 'bg-gray-100 text-gray-800'
  }

  // Função para obter ícone do status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
      case 'delivered':
        return <CheckCircle className="h-4 w-4" />
      case 'cancelled':
        return <XCircle className="h-4 w-4" />
      case 'pending':
      case 'payment_required':
        return <Clock className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header com resumo */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Package className="h-4 w-4" />
                Total de Pedidos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.total_orders}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Receita Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(summary.total_revenue)}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Ticket Médio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(summary.avg_order_value)}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {Object.entries(summary.by_status).slice(0, 3).map(([status, count]) => (
                  <div key={status} className="flex justify-between text-sm">
                    <span className="capitalize">{status}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="orders" className="space-y-6">
        <TabsList>
          <TabsTrigger value="orders">Pedidos</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-4">
          {/* Controles e filtros */}
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-wrap gap-2">
              <Button 
                onClick={() => loadOrders()} 
                disabled={loading}
                variant="outline"
                size="sm"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
              
              <Button 
                onClick={syncOrders} 
                disabled={syncing}
                size="sm"
              >
                <Package className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
                Sincronizar ML
              </Button>
              
              <Button 
                onClick={calculateAnalytics}
                variant="outline"
                size="sm"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Calcular Analytics
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Input
                placeholder="Buscar pedidos..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-48"
              />
              <Filter className="h-8 w-8 p-2 text-gray-500" />
            </div>
          </div>

          {/* Filtros avançados */}
          <div className="flex flex-wrap gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="paid">Pago</SelectItem>
                <SelectItem value="shipped">Enviado</SelectItem>
                <SelectItem value="delivered">Entregue</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
              </SelectContent>
            </Select>
            
            <Input
              type="date"
              value={dateFromFilter}
              onChange={(e) => setDateFromFilter(e.target.value)}
              className="w-40"
              placeholder="Data início"
            />
            
            <Input
              type="date"
              value={dateToFilter}
              onChange={(e) => setDateToFilter(e.target.value)}
              className="w-40"
              placeholder="Data fim"
            />
            
            {(statusFilter !== 'all' || dateFromFilter || dateToFilter) && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setStatusFilter('all')
                  setDateFromFilter('')
                  setDateToFilter('')
                }}
              >
                Limpar filtros
              </Button>
            )}
          </div>

          {/* Lista de pedidos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Lista de pedidos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Pedidos ({filteredOrders.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-96">
                  <div className="space-y-2 p-4">
                    {filteredOrders.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        {loading ? 'Carregando pedidos...' : 'Nenhum pedido encontrado'}
                      </div>
                    ) : (
                      filteredOrders.map((order) => (
                        <div
                          key={order.id}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            selectedOrder?.id === order.id 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setSelectedOrder(order)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-sm">#{order.ml_order_id}</span>
                            <Badge className={`${getStatusColor(order.status)} text-xs`}>
                              <span className="flex items-center gap-1">
                                {getStatusIcon(order.status)}
                                {order.status}
                              </span>
                            </Badge>
                          </div>
                          
                          <div className="space-y-1 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {order.buyer_nickname || 'Comprador'}
                            </div>
                            <div className="flex items-center gap-1">
                              <Package className="h-3 w-3" />
                              {order.item_title || 'Produto'}
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />
                                {formatCurrency(order.total_amount)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(order.date_created)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Detalhes do pedido selecionado */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Detalhes do Pedido
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedOrder ? (
                  <ScrollArea className="h-96">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-sm mb-2">Informações Gerais</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>ID ML:</span>
                            <span className="font-mono">{selectedOrder.ml_order_id}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Status:</span>
                            <Badge className={getStatusColor(selectedOrder.status)}>
                              {selectedOrder.status}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Data:</span>
                            <span>{formatDate(selectedOrder.date_created)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Valor Total:</span>
                            <span className="font-medium">{formatCurrency(selectedOrder.total_amount)}</span>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <h4 className="font-medium text-sm mb-2">Comprador</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Nickname:</span>
                            <span>{selectedOrder.buyer_nickname || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Email:</span>
                            <span>{selectedOrder.buyer_email || 'N/A'}</span>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <h4 className="font-medium text-sm mb-2">Produto</h4>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="font-medium">{selectedOrder.item_title}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Quantidade:</span>
                            <span>{selectedOrder.quantity}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Preço Unit.:</span>
                            <span>{formatCurrency(selectedOrder.unit_price || 0)}</span>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <h4 className="font-medium text-sm mb-2">Entrega & Pagamento</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Status Envio:</span>
                            <span>{selectedOrder.shipping_status || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Status Pagamento:</span>
                            <span>{selectedOrder.payment_status || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Método Pagamento:</span>
                            <span>{selectedOrder.payment_method || 'N/A'}</span>
                          </div>
                        </div>
                      </div>

                      {selectedOrder.feedback_rating && (
                        <>
                          <Separator />
                          <div>
                            <h4 className="font-medium text-sm mb-2">Avaliação</h4>
                            <div className="text-sm">
                              <span className="text-yellow-500">
                                {'★'.repeat(selectedOrder.feedback_rating)}
                                {'☆'.repeat(5 - selectedOrder.feedback_rating)}
                              </span>
                              <span className="ml-2">{selectedOrder.feedback_rating}/5</span>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Selecione um pedido para ver os detalhes
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analytics de Vendas</CardTitle>
              <CardDescription>
                Métricas de performance e análise de vendas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                Analytics em desenvolvimento
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}