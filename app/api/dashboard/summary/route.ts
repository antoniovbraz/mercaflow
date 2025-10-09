import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    // Buscar profile e tenant
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('tenant_id')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Profile não encontrado' },
        { status: 404 }
      );
    }

    // Get dashboard summary data with optimized queries
    const tenantId = profile.tenant_id;

    // Parallel queries for better performance
    const [
      integrationsResult,
      ordersStatsResult,
      itemsStatsResult,
      webhooksStatsResult
    ] = await Promise.all([
      // ML Integrations status
      supabase
        .from('ml_integrations')
        .select('id, status, ml_user_id, created_at, last_sync_at')
        .eq('tenant_id', tenantId),
        
      // Orders stats (last 30 days)
      supabase
        .from('ml_orders')
        .select('id, status, total_amount, created_at')
        .eq('tenant_id', tenantId)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(1000),

      // Items/Products stats
      supabase
        .from('ml_products')
        .select('id, status, price, sold_quantity, available_quantity')
        .eq('tenant_id', tenantId),

      // Recent webhooks (last 24h)
      supabase
        .from('ml_webhook_logs')
        .select('id, topic, status, created_at')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(100)
    ]);

    // Process integrations
    const integrations = integrationsResult.data || [];
    const activeIntegrations = integrations.filter(i => i.status === 'active').length;
    const totalIntegrations = integrations.length;

    // Process orders stats
    const orders = ordersStatsResult.data || [];
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
    const ordersCount = orders.length;
    const ordersByStatus = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Process items stats
    const items = itemsStatsResult.data || [];
    const totalItems = items.length;
    const activeItems = items.filter(item => item.status === 'active').length;
    const totalInventory = items.reduce((sum, item) => sum + (item.available_quantity || 0), 0);
    const totalSold = items.reduce((sum, item) => sum + (item.sold_quantity || 0), 0);

    // Process webhooks stats
    const webhooks = webhooksStatsResult.data || [];
    const webhooksByStatus = webhooks.reduce((acc, webhook) => {
      acc[webhook.status] = (acc[webhook.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const webhooksByTopic = webhooks.reduce((acc, webhook) => {
      acc[webhook.topic] = (acc[webhook.topic] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate growth trends (simplified - comparing with previous period)
    const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentOrders = orders.filter(o => new Date(o.created_at) >= last7Days);
    const recentRevenue = recentOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);

    const dashboardSummary = {
      integrations: {
        total: totalIntegrations,
        active: activeIntegrations,
        inactive: totalIntegrations - activeIntegrations,
        lastSync: integrations[0]?.last_sync_at || null
      },
      orders: {
        total: ordersCount,
        revenue: totalRevenue,
        recentRevenue: recentRevenue,
        byStatus: ordersByStatus,
        recentCount: recentOrders.length
      },
      products: {
        total: totalItems,
        active: activeItems,
        inventory: totalInventory,
        sold: totalSold,
        averagePrice: totalItems > 0 ? items.reduce((sum, item) => sum + (item.price || 0), 0) / totalItems : 0
      },
      webhooks: {
        total: webhooks.length,
        byStatus: webhooksByStatus,
        byTopic: webhooksByTopic,
        last24h: webhooks.length
      },
      performance: {
        webhookSuccessRate: webhooks.length > 0 ? ((webhooksByStatus.success || 0) / webhooks.length) * 100 : 100,
        integrationHealthScore: totalIntegrations > 0 ? (activeIntegrations / totalIntegrations) * 100 : 0
      }
    };

    // Set cache headers (5 minutes cache)
    const response = NextResponse.json({
      dashboard: dashboardSummary,
      lastUpdated: new Date().toISOString()
    });

    response.headers.set('Cache-Control', 'private, max-age=300, stale-while-revalidate=600');
    
    return response;

  } catch (error) {
    console.error('Erro na API dashboard summary:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}