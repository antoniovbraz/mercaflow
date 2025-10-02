import Link from 'next/link'
import { Mail } from 'lucide-react'

async function handleResendConfirmation(formData: FormData) {
  'use server'
  
  const { createClient } = await import('@/utils/supabase/server')
  const { redirect } = await import('next/navigation')
  
  try {
    const supabase = await createClient()
    const email = formData.get('email') as string

    if (!email) {
      redirect('/auth/resend?message=Email%20é%20obrigatório')
      return
    }

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email.toLowerCase().trim(),
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`
      }
    })

    if (error) {
      console.error('Resend confirmation error:', error)
      redirect(`/auth/resend?message=${encodeURIComponent(error.message)}`)
      return
    }

    redirect('/auth/resend?message=Email%20de%20confirmação%20reenviado!%20Verifique%20sua%20caixa%20de%20entrada.')
  } catch (error) {
    console.error('Unexpected resend error:', error)
    redirect('/auth/resend?message=Erro%20inesperado.%20Tente%20novamente.')
  }
}

export default function ResendConfirmationPage({
  searchParams,
}: {
  searchParams: { message: string }
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-yellow-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
            <Mail className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Reenviar confirmação
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Não recebeu o email de confirmação?
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" action={handleResendConfirmation}>
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email da conta
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Reenviar email de confirmação
              </button>
            </div>

            {/* Messages */}
            {searchParams?.message && (
              <div className={`rounded-md p-4 ${
                searchParams.message.includes('reenviado') || searchParams.message.includes('sucesso')
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-red-50 border border-red-200'
              }`}>
                <div className={`text-sm ${
                  searchParams.message.includes('reenviado') || searchParams.message.includes('sucesso')
                    ? 'text-green-800'
                    : 'text-red-800'
                }`}>
                  {decodeURIComponent(searchParams.message)}
                </div>
              </div>
            )}

            {/* Info */}
            <div className="rounded-md bg-yellow-50 p-4 border border-yellow-200">
              <div className="text-sm text-yellow-800">
                <strong>💡 Dicas:</strong>
                <ul className="mt-2 ml-4 list-disc space-y-1">
                  <li>Verifique sua pasta de spam/lixo eletrônico</li>
                  <li>Aguarde alguns minutos para o email chegar</li>
                  <li>Certifique-se de usar o mesmo email do cadastro</li>
                </ul>
              </div>
            </div>

            {/* Links */}
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">
                Já confirmou seu email?{' '}
                <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                  Fazer login
                </Link>
              </p>
              <p className="text-sm">
                <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
                  ← Voltar ao cadastro
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}