import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'

async function handleLogin(formData: FormData) {
  'use server'
  
  const { createClient } = await import('@/utils/supabase/server')
  const { redirect } = await import('next/navigation')
  
  try {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    // Validação dos dados
    if (!email || !password) {
      redirect('/login?message=Email%20e%20senha%20são%20obrigatórios')
      return
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase().trim(),
      password,
    })

    if (error) {
      console.error('Login error:', error)
      let errorMessage = 'Erro ao fazer login'
      
      switch (error.message) {
        case 'Invalid login credentials':
          errorMessage = 'Email ou senha incorretos'
          break
        case 'Email not confirmed':
          errorMessage = 'Email ainda não foi confirmado. Verifique sua caixa de entrada ou solicite um novo email de confirmação.'
          break
        case 'Too many requests':
          errorMessage = 'Muitas tentativas de login. Tente novamente em alguns minutos.'
          break
        case 'Signup is disabled':
          errorMessage = 'Login temporariamente desabilitado'
          break
        default:
          errorMessage = `Erro: ${error.message}`
      }
      
      redirect(`/login?message=${encodeURIComponent(errorMessage)}`)
      return
    }

    redirect('/dashboard')
  } catch (error) {
    console.error('Unexpected login error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor'
    redirect(`/login?message=${encodeURIComponent(errorMessage)}`)
  }
}

export default function LoginPage({
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
            <ShoppingCart className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Entre no MercaFlow
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Gerencie seus usuários do MercadoLibre
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" action={handleLogin}>
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
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

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Senha
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Sua senha"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Entrar
              </button>
            </div>

            {/* Messages */}
            {searchParams?.message && (
              <div className={`rounded-md p-4 ${
                searchParams.message.includes('sucesso') || searchParams.message.includes('confirmado')
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-red-50 border border-red-200'
              }`}>
                <div className={`text-sm ${
                  searchParams.message.includes('sucesso') || searchParams.message.includes('confirmado')
                    ? 'text-green-800'
                    : 'text-red-800'
                }`}>
                  {decodeURIComponent(searchParams.message)}
                </div>
              </div>
            )}

            {/* Email confirmation help */}
            {searchParams?.message && searchParams.message.includes('confirmado') && (
              <div className="text-center">
                <Link 
                  href="/auth/resend" 
                  className="inline-block text-sm font-medium text-blue-600 hover:text-blue-500 bg-blue-50 px-3 py-2 rounded-md"
                >
                  Reenviar email de confirmação
                </Link>
              </div>
            )}

            {/* Links */}
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">
                Não tem uma conta?{' '}
                <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
                  Criar conta
                </Link>
              </p>
              <p className="text-sm text-gray-600">
                Esqueceu sua senha?{' '}
                <Link href="/auth/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
                  Recuperar senha
                </Link>
              </p>
              <p className="text-sm">
                <Link href="/" className="font-medium text-blue-600 hover:text-blue-500">
                  ← Voltar ao início
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}