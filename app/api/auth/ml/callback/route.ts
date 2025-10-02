import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/utils/supabase/admin'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const state = searchParams.get('state')

  if (!code) {
    return NextResponse.json({ error: 'Authorization code not provided' }, { status: 400 })
  }

  try {
    // 1. Trocar código por access_token
    const tokenResponse = await fetch('https://api.mercadolibre.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: process.env.ML_CLIENT_ID!,
        client_secret: process.env.ML_CLIENT_SECRET!,
        code: code,
        redirect_uri: process.env.ML_REDIRECT_URI!,
      }),
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text()
      console.error('Token exchange failed:', errorData)
      return NextResponse.json({ error: 'Failed to exchange code for token' }, { status: 400 })
    }

    const tokenData = await tokenResponse.json()

    // 2. Obter informações do usuário
    const userResponse = await fetch(`https://api.mercadolibre.com/users/me`, {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
    })

    if (!userResponse.ok) {
      console.error('Failed to get user info')
      return NextResponse.json({ error: 'Failed to get user information' }, { status: 400 })
    }

    const userData = await userResponse.json()

    // 3. Salvar no Supabase
    const supabase = supabaseAdmin
    
    const { data, error } = await supabase
      .from('ml_users')
      .upsert({
        ml_user_id: userData.id,
        ml_nickname: userData.nickname,
        ml_email: userData.email,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_in: tokenData.expires_in,
        token_expires_at: new Date(Date.now() + (tokenData.expires_in * 1000)).toISOString(),
        user_info: userData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to save user data' }, { status: 500 })
    }

    // 4. Redirecionar para dashboard com sucesso
    const dashboardUrl = new URL('/dashboard', request.url)
    dashboardUrl.searchParams.set('auth', 'success')
    dashboardUrl.searchParams.set('user', userData.nickname)
    
    return NextResponse.redirect(dashboardUrl)

  } catch (error) {
    console.error('Authorization callback error:', error)
    return NextResponse.json(
      { error: 'Failed to process authorization' },
      { status: 500 }
    )
  }
}