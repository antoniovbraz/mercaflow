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
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Perfil não encontrado' },
        { status: 404 }
      )
    }

    // Get ML integration for this tenant
    const { data: integration, error: integrationError } = await supabase
      .from('ml_integrations')
      .select('*')
      .eq('tenant_id', profile.id)
      .eq('status', 'active')
      .single()

    if (integrationError) {
      console.error('ML Integration Error:', integrationError)
      return NextResponse.json(
        { error: 'Integração não encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      id: integration.id,
      ml_user_id: integration.ml_user_id,
      ml_nickname: integration.ml_nickname,
      ml_email: integration.ml_email,
      status: integration.status,
      token_expires_at: integration.token_expires_at,
      last_sync_at: integration.last_sync_at,
      created_at: integration.created_at
    })

  } catch (error) {
    console.error('Error fetching ML integration:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}