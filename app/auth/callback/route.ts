import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as 'email' | null
  const next = searchParams.get('next') ?? '/dashboard'
  
  // Support both new format (token_hash) and legacy format (code)
  const code = searchParams.get('code')

  if (token_hash && type) {
    // New format - using token_hash (recommended by Supabase)
    const supabase = await createClient()
    
    try {
      const { error } = await supabase.auth.verifyOtp({
        type,
        token_hash,
      })
      
      if (!error) {
        // Sucesso - redirecionar para dashboard
        return NextResponse.redirect(`${origin}/dashboard?message=Email%20confirmado%20com%20sucesso!%20Bem-vindo%20ao%20MercaFlow!`)
      } else {
        console.error('Error verifying OTP:', error)
        return NextResponse.redirect(`${origin}/login?message=Erro%20ao%20confirmar%20email.%20Tente%20fazer%20login%20ou%20solicite%20um%20novo%20link%20de%20confirmação.`)
      }
    } catch (error) {
      console.error('Unexpected error during email confirmation:', error)
      return NextResponse.redirect(`${origin}/login?message=Erro%20inesperado%20ao%20confirmar%20email.`)
    }
  } else if (code) {
    // Legacy format - using code (for backward compatibility)  
    const supabase = await createClient()
    
    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (!error) {
        return NextResponse.redirect(`${origin}/dashboard?message=Email%20confirmado%20com%20sucesso!%20Bem-vindo%20ao%20MercaFlow!`)
      } else {
        console.error('Error exchanging code for session:', error)
        return NextResponse.redirect(`${origin}/login?message=Erro%20ao%20confirmar%20email.%20Tente%20fazer%20login%20ou%20solicite%20um%20novo%20link%20de%20confirmação.`)
      }
    } catch (error) {
      console.error('Unexpected error during email confirmation:', error)
      return NextResponse.redirect(`${origin}/login?message=Erro%20inesperado%20ao%20confirmar%20email.`)
    }
  }

  // Nenhum parâmetro válido fornecido
  return NextResponse.redirect(`${origin}/login?message=Link%20de%20confirmação%20inválido.`)
}