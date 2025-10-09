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
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Perfil não encontrado' },
        { status: 404 }
      )
    }

    // Get all ML integrations for this tenant with stats
    const { data: integrations, error: integrationError } = await supabase
      .from('ml_integrations')
      .select(`
        *,
        ml_products!inner(count),
        ml_orders!inner(count)
      `)
      .eq('tenant_id', profile.id)

    if (integrationError) {
      console.error('ML Status Error:', integrationError)
      return NextResponse.json(
        { error: 'Erro ao buscar status das integrações' },
        { status: 500 }
      )
    }

    // Calculate overall status
    const hasActiveIntegration = integrations.some(int => int.status === 'active')
    const totalProducts = integrations.reduce((sum, int) => sum + (int.ml_products?.length || 0), 0)
    const totalOrders = integrations.reduce((sum, int) => sum + (int.ml_orders?.length || 0), 0)

    return NextResponse.json({
      status: hasActiveIntegration ? 'connected' : 'disconnected',
      integrations: integrations.length,
      active_integrations: integrations.filter(int => int.status === 'active').length,
      total_products: totalProducts,
      total_orders: totalOrders,
      last_sync: integrations.length > 0 ? Math.max(...integrations.map(int => new Date(int.last_sync_at || int.created_at).getTime())) : null
    })

  } catch (error) {
    console.error('Error fetching ML status:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}