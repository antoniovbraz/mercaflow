import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    
    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (!error) {
        // Sucesso - redirecionar para dashboard
        return NextResponse.redirect(`${origin}/dashboard?message=Email%20confirmado%20com%20sucesso!%20Bem-vindo%20ao%20MercaFlow!`)
      } else {
        console.error('Error exchanging code for session:', error)
        // Erro na confirmação
        return NextResponse.redirect(`${origin}/login?message=Erro%20ao%20confirmar%20email.%20Tente%20fazer%20login%20ou%20solicite%20um%20novo%20link%20de%20confirmação.`)
      }
    } catch (error) {
      console.error('Unexpected error during email confirmation:', error)
      return NextResponse.redirect(`${origin}/login?message=Erro%20inesperado%20ao%20confirmar%20email.`)
    }
  }

  // Código não fornecido - redirecionar para login
  return NextResponse.redirect(`${origin}/login?message=Link%20de%20confirmação%20inválido.`)
}