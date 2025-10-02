import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/dashboard'

  if (token_hash && type) {
    const supabase = await createClient()

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })
    if (!error) {
      // redirect user to specified redirect URL or dashboard with success message
      redirect('/dashboard?message=Email%20confirmado%20com%20sucesso!%20Bem-vindo%20ao%20MercaFlow!')
    }
  }

  // redirect the user to login with error message
  redirect('/login?message=Erro%20ao%20confirmar%20email.%20Link%20inválido%20ou%20expirado.')
}