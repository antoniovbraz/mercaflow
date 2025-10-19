/**
 * ML Orders API - List and manage orders
 * 
 * GET /api/ml/orders - List orders with pagination and filtering
 * POST /api/ml/orders - Sync orders, update local data, calculate analytics
 * 
 * @refactored Replaced console.log/error with logger, improved error handling
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { MLTokenManager } from '@/utils/mercadolivre/token-manager'
import { logger } from '@/utils/logger'
import { 
  OrdersSearchQuerySchema,
  validateQueryParams,
  ValidationError,
} from '@/utils/validation'

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { searchParams } = new URL(request.url)
        
        // Validate query parameters
        try {
          validateQueryParams(OrdersSearchQuerySchema, searchParams);
        } catch (error) {
          if (error instanceof ValidationError) {
            return NextResponse.json(
              { error: 'Parâmetros de consulta inválidos', details: error.details },
              { status: 400 }
            );
          }
          throw error;
        }
        
        // Verificar autenticação
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }

        // Parâmetros de consulta
        const integrationId = searchParams.get('integration_id')
        const sync = searchParams.get('sync') === 'true'
        const status = searchParams.get('status')
        const dateFrom = searchParams.get('date_from')
        const dateTo = searchParams.get('date_to')
        const limit = parseInt(searchParams.get('limit') || '50')
        const offset = parseInt(searchParams.get('offset') || '0')

        if (!integrationId) {
            return NextResponse.json({ error: 'integration_id é obrigatório' }, { status: 400 })
        }

        // Verificar se a integração pertence ao usuário
        const { data: integration, error: integrationError } = await supabase
            .from('ml_integrations')
            .select('id, access_token, user_id, ml_user_id')
            .eq('id', integrationId)
            .eq('user_id', user.id)
            .single()

        if (integrationError || !integration) {
            return NextResponse.json({ error: 'Integração não encontrada' }, { status: 404 })
        }

        // Se solicitada sincronização, buscar pedidos da API ML
        if (sync) {
            await syncOrdersFromML(integration, supabase)
        }

        // Construir query para buscar pedidos locais
        let query = supabase
            .from('ml_orders')
            .select(`
                *,
                ml_order_items (*)
            `)
            .eq('integration_id', integrationId)
            .order('date_created', { ascending: false })

        // Aplicar filtros
        if (status) {
            query = query.eq('status', status)
        }

        if (dateFrom) {
            query = query.gte('date_created', dateFrom)
        }

        if (dateTo) {
            query = query.lte('date_created', dateTo)
        }

        // Aplicar paginação
        query = query.range(offset, offset + limit - 1)

        const { data: orders, error: ordersError } = await query

        if (ordersError) {
            logger.error('Failed to fetch orders from database', { error: ordersError })
            return NextResponse.json({ error: 'Erro ao buscar pedidos' }, { status: 500 })
        }

        // Buscar estatísticas resumidas
        const { data: stats } = await supabase
            .from('ml_orders')
            .select('status, total_amount, date_created')
            .eq('integration_id', integrationId)

        const summary = calculateOrdersSummary(stats || [])

        return NextResponse.json({
            orders: orders || [],
            summary,
            pagination: {
                limit,
                offset,
                total: orders?.length || 0
            }
        })

    } catch (error) {
        logger.error('ML Orders GET Error', { error })
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()
        const body = await request.json()
        
        // Verificar autenticação
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }

        const { integration_id, action, order_data } = body

        if (!integration_id || !action) {
            return NextResponse.json({ 
                error: 'integration_id e action são obrigatórios' 
            }, { status: 400 })
        }

        // Verificar se a integração pertence ao usuário
        const { data: integration, error: integrationError } = await supabase
            .from('ml_integrations')
            .select('id, access_token, ml_user_id')
            .eq('id', integration_id)
            .eq('user_id', user.id)
            .single()

        if (integrationError || !integration) {
            return NextResponse.json({ error: 'Integração não encontrada' }, { status: 404 })
        }

        let result

        switch (action) {
            case 'sync_all':
                result = await syncOrdersFromML(integration, supabase)
                break
                
            case 'update_local':
                if (!order_data) {
                    return NextResponse.json({ 
                        error: 'order_data é obrigatório para update_local' 
                    }, { status: 400 })
                }
                result = await updateLocalOrderData(integration_id, order_data, supabase)
                break
                
            case 'calculate_analytics':
                result = await calculateOrderAnalytics(integration_id, supabase)
                break
                
            default:
                return NextResponse.json({ 
                    error: `Ação '${action}' não suportada` 
                }, { status: 400 })
        }

        return NextResponse.json({ success: true, result })

    } catch (error) {
        logger.error('ML Orders POST Error', { error })
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        )
    }
}

// Função para sincronizar pedidos da API ML
async function syncOrdersFromML(integration: any, supabase: any) {
    try {
        const tokenManager = new MLTokenManager()
        
        // Construir query string para buscar pedidos
        const searchParams = new URLSearchParams({
            seller: integration.ml_user_id.toString(),
            sort: 'date_desc',
            limit: '50'
        })
        
        // Buscar pedidos da API ML
        const response = await tokenManager.makeMLRequest(
            integration.id,
            `/orders/search?${searchParams.toString()}`
        )

        if (!response.ok) {
            throw new Error(`Erro na API ML: ${response.status}`)
        }

        const data = await response.json()
        const orders = data.results || []

        let syncedCount = 0
        let errorCount = 0

        for (const mlOrder of orders) {
            try {
                // Transformar dados da ML para nosso formato
                const orderData = transformMLOrderData(mlOrder, integration.id)

                // Inserir ou atualizar no banco
                const { error: upsertError } = await supabase
                    .from('ml_orders')
                    .upsert(orderData, {
                        onConflict: 'integration_id,ml_order_id',
                        ignoreDuplicates: false
                    })

                if (upsertError) {
                    logger.error('Failed to upsert order', { error: upsertError, orderId: mlOrder.id })
                    errorCount++
                } else {
                    syncedCount++
                    
                    // Se o pedido tem itens detalhados, sincronizar também
                    if (mlOrder.order_items?.length > 0) {
                        await syncOrderItems(mlOrder.id, mlOrder.order_items, integration.id, supabase)
                    }
                }

            } catch (itemError) {
                logger.error('Failed to process individual order', { error: itemError, orderId: mlOrder.id })
                errorCount++
            }
        }

        return {
            total_found: orders.length,
            synced: syncedCount,
            errors: errorCount
        }

    } catch (error) {
        logger.error('Failed to sync orders from ML', { error })
        throw error
    }
}

// Função para sincronizar itens do pedido
async function syncOrderItems(orderId: string, items: any[], integrationId: string, supabase: any) {
    try {
        // Buscar o pedido local para obter o UUID
        const { data: localOrder } = await supabase
            .from('ml_orders')
            .select('id')
            .eq('ml_order_id', orderId)
            .eq('integration_id', integrationId)
            .single()

        if (!localOrder) return

        for (const item of items) {
            const itemData = {
                order_id: localOrder.id,
                integration_id: integrationId,
                ml_item_id: item.item.id,
                item_title: item.item.title,
                item_category_id: item.item.category_id,
                item_variation_id: item.item.variation_id,
                item_variation_attributes: item.item.variation_attributes || {},
                quantity: item.quantity,
                unit_price: item.unit_price,
                total_price: item.unit_price * item.quantity,
                item_condition: item.item.condition,
                item_warranty: item.item.warranty,
                item_listing_type: item.item.listing_type_id
            }

            await supabase
                .from('ml_order_items')
                .upsert(itemData, {
                    onConflict: 'order_id,ml_item_id',
                    ignoreDuplicates: false
                })
        }

    } catch (error) {
        logger.error('Failed to sync order items', { error, orderId })
    }
}

// Função para transformar dados da ML para nosso formato
function transformMLOrderData(mlOrder: any, integrationId: string) {
    return {
        integration_id: integrationId,
        ml_order_id: mlOrder.id,
        ml_pack_id: mlOrder.pack_id,
        status: mlOrder.status,
        status_detail: mlOrder.status_detail?.description || mlOrder.status_detail,
        date_created: mlOrder.date_created,
        date_closed: mlOrder.date_closed,
        total_amount: mlOrder.total_amount,
        paid_amount: mlOrder.paid_amount,
        currency_id: mlOrder.currency_id || 'BRL',
        buyer_id: mlOrder.buyer?.id,
        buyer_nickname: mlOrder.buyer?.nickname,
        // Store all order items in JSONB
        items: mlOrder.order_items || [],
        // Store complete ML API response for reference
        ml_data: mlOrder,
        last_sync_at: new Date().toISOString()
    }
}

// Função para atualizar dados locais do pedido
async function updateLocalOrderData(integrationId: string, orderData: any, supabase: any) {
    const { data, error } = await supabase
        .from('ml_orders')
        .update({
            ...orderData,
            updated_at: new Date().toISOString()
        })
        .eq('integration_id', integrationId)
        .eq('ml_order_id', orderData.ml_order_id)
        .select()

    if (error) {
        throw error
    }

    return data
}

// Função para calcular analytics de pedidos
async function calculateOrderAnalytics(integrationId: string, supabase: any) {
    try {
        const { data: orders } = await supabase
            .from('ml_orders')
            .select('*')
            .eq('integration_id', integrationId)

        if (!orders || orders.length === 0) {
            return { message: 'Nenhum pedido encontrado para análise' }
        }

        // Calcular analytics por período
        const periods = ['daily', 'weekly', 'monthly']
        const results = []

        for (const period of periods) {
            const analytics = calculatePeriodAnalytics(orders, period)
            
            for (const analytic of analytics) {
                const { error } = await supabase
                    .from('ml_order_analytics')
                    .upsert({
                        integration_id: integrationId,
                        ...analytic
                    }, {
                        onConflict: 'integration_id,period_type,period_date',
                        ignoreDuplicates: false
                    })

                if (!error) {
                    results.push(analytic)
                }
            }
        }

        return {
            calculated_periods: results.length,
            details: results
        }

    } catch (error) {
        logger.error('Failed to calculate order analytics', { error })
        throw error
    }
}

// Função para calcular estatísticas do período
function calculatePeriodAnalytics(orders: any[], periodType: string) {
    const analytics: any[] = []
    const periodGroups = groupOrdersByPeriod(orders, periodType)

    for (const [periodDate, periodOrders] of Object.entries(periodGroups)) {
        const totalOrders = (periodOrders as any[]).length
        const totalRevenue = (periodOrders as any[]).reduce((sum, order) => sum + (parseFloat(order.total_amount) || 0), 0)
        const totalProfit = (periodOrders as any[]).reduce((sum, order) => sum + (parseFloat(order.net_profit) || 0), 0)
        const totalUnits = (periodOrders as any[]).reduce((sum, order) => sum + (order.quantity || 0), 0)

        // Distribuição por status
        const statusCounts = (periodOrders as any[]).reduce((acc, order) => {
            acc[order.status] = (acc[order.status] || 0) + 1
            return acc
        }, {} as Record<string, number>)

        analytics.push({
            period_type: periodType,
            period_date: periodDate,
            total_orders: totalOrders,
            total_revenue: totalRevenue,
            total_profit: totalProfit,
            total_units_sold: totalUnits,
            orders_pending: statusCounts.pending || 0,
            orders_paid: statusCounts.paid || 0,
            orders_shipped: statusCounts.shipped || 0,
            orders_delivered: statusCounts.delivered || 0,
            orders_cancelled: statusCounts.cancelled || 0,
            avg_order_value: totalOrders > 0 ? totalRevenue / totalOrders : 0,
            avg_profit_margin: totalRevenue > 0 ? totalProfit / totalRevenue : 0,
            unique_customers: new Set((periodOrders as any[]).map(o => o.buyer_id)).size,
            calculated_at: new Date().toISOString()
        })
    }

    return analytics
}

// Função para agrupar pedidos por período
function groupOrdersByPeriod(orders: any[], periodType: string) {
    const groups: Record<string, any[]> = {}

    orders.forEach(order => {
        if (!order.date_created) return

        const date = new Date(order.date_created)
        let periodKey: string

        switch (periodType) {
            case 'daily':
                periodKey = date.toISOString().split('T')[0]
                break
            case 'weekly':
                const weekStart = new Date(date)
                weekStart.setDate(date.getDate() - date.getDay())
                periodKey = weekStart.toISOString().split('T')[0]
                break
            case 'monthly':
                periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`
                break
            default:
                periodKey = date.toISOString().split('T')[0]
        }

        if (!groups[periodKey]) {
            groups[periodKey] = []
        }
        groups[periodKey].push(order)
    })

    return groups
}

// Função para calcular resumo dos pedidos
function calculateOrdersSummary(orders: any[]) {
    const total = orders.length
    const totalRevenue = orders.reduce((sum, order) => sum + (parseFloat(order.total_amount) || 0), 0)
    
    // Distribuição por status
    const byStatus = orders.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1
        return acc
    }, {} as Record<string, number>)

    // Pedidos por mês
    const byMonth = orders.reduce((acc, order) => {
        if (!order.date_created) return acc
        const month = new Date(order.date_created).toISOString().substring(0, 7)
        acc[month] = (acc[month] || 0) + 1
        return acc
    }, {} as Record<string, number>)

    return {
        total_orders: total,
        total_revenue: totalRevenue,
        avg_order_value: total > 0 ? totalRevenue / total : 0,
        by_status: byStatus,
        by_month: byMonth
    }
}
