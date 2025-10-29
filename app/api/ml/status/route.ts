import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    // Get user's tenant ID
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('tenant_id')
      .eq('id', user.id)
      .maybeSingle()

    if (profileError) {
      console.error('Error loading profile for ML status:', profileError)
      return NextResponse.json(
        { error: 'Erro ao carregar perfil do usuário' },
        { status: 500 }
      )
    }

    const tenantId = profile?.tenant_id || user.id

    // Get all ML integrations for this tenant
    const { data: integrations, error: integrationError } = await supabase
      .from('ml_integrations')
      .select('*')
      .eq('tenant_id', tenantId)

    if (integrationError) {
      console.error('ML Status Error:', integrationError)
      return NextResponse.json(
        { error: 'Erro ao buscar status das integrações' },
        { status: 500 }
      )
    }
    
    const integrationList = integrations ?? []

    // Get counts separately to avoid RLS issues
    const integrationIds = integrationList.map(i => i.id);
    
    const productCounts: Record<string, number> = {};
    const orderCounts: Record<string, number> = {};
    
    if (integrationIds.length > 0) {
      // Get product counts
      const { data: products } = await supabase
        .from('ml_products')
        .select('integration_id')
        .in('integration_id', integrationIds);
      
      products?.forEach(p => {
        productCounts[p.integration_id] = (productCounts[p.integration_id] || 0) + 1;
      });
      
      // Get order counts
      const { data: orders } = await supabase
        .from('ml_orders')
        .select('integration_id')
        .in('integration_id', integrationIds);
      
      orders?.forEach(o => {
        orderCounts[o.integration_id] = (orderCounts[o.integration_id] || 0) + 1;
      });
    }

    // Calculate overall status
    // Calculate overall status using the separate counts
  const hasActiveIntegration = integrationList.some(int => int.status === 'active')
    const totalProducts = Object.values(productCounts).reduce((sum, count) => sum + count, 0)
    const totalOrders = Object.values(orderCounts).reduce((sum, count) => sum + count, 0)

    // Add counts to each integration
    const integrationsWithCounts = integrationList.map(int => ({
      ...int,
      product_count: productCounts[int.id] || 0,
      order_count: orderCounts[int.id] || 0
    }))

    return NextResponse.json({
      status: hasActiveIntegration ? 'connected' : 'disconnected',
      integrations: integrationList.length,
      active_integrations: integrationList.filter(int => int.status === 'active').length,
      total_products: totalProducts,
      total_orders: totalOrders,
      details: integrationsWithCounts,
      last_sync: integrationList.length > 0 ? Math.max(...integrationList.map(int => new Date(int.last_sync_at || int.created_at).getTime())) : null
    })

  } catch (error) {
    console.error('Error fetching ML status:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
