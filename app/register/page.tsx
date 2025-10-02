import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'

async function handleSignup(formData: FormData) {
  'use server'
  
  const { createClient } = await import('@/utils/supabase/server')
  const { redirect } = await import('next/navigation')
  
  try {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const fullName = formData.get('fullName') as string

    // Validação dos dados
    if (!email || !password || !fullName) {
      redirect('/register?message=Todos%20os%20campos%20são%20obrigatórios')
      return
    }

    if (password.length < 6) {
      redirect('/register?message=A%20senha%20deve%20ter%20pelo%20menos%206%20caracteres')
      return
    }

    // Validação de email básica
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      redirect('/register?message=Por%20favor,%20insira%20um%20email%20válido')
      return
    }

    console.log('Attempting signup for email:', email)

    const { data, error } = await supabase.auth.signUp({
      email: email.toLowerCase().trim(),
      password,
      options: {
        data: {
          full_name: fullName.trim(),
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/confirm`
      }
    })

    if (error) {
      console.error('Supabase signup error:', error)
      let errorMessage = 'Erro ao criar conta'
      
      switch (error.message) {
        case 'User already registered':
          errorMessage = 'Este email já está cadastrado. Tente fazer login ou recuperar sua senha.'
          break
        case 'Invalid email':
          errorMessage = 'Email inválido'
          break
        case 'Password should be at least 6 characters':
          errorMessage = 'A senha deve ter pelo menos 6 caracteres'
          break
        case 'Signup is disabled':
          errorMessage = 'Cadastro temporariamente desabilitado'
          break
        case 'To signup, please provide your email':
          errorMessage = 'Email é obrigatório'
          break
        default:
          errorMessage = `Erro: ${error.message}`
      }
      
      redirect(`/register?message=${encodeURIComponent(errorMessage)}`)
      return
    }

    console.log('Signup successful:', data)

    // Verificar se o usuário precisa confirmar email
    if (data.user && !data.session) {
      // Email confirmation é necessário
      redirect('/register?message=Conta%20criada%20com%20sucesso!%20Verifique%20seu%20email%20e%20clique%20no%20link%20de%20confirmação%20para%20ativar%20sua%20conta.')
    } else if (data.session) {
      // Usuário foi autenticado imediatamente (email confirmation desabilitada)
      redirect('/dashboard?message=Conta%20criada%20e%20login%20realizado%20com%20sucesso!')
    } else {
      // Caso edge
      redirect('/login?message=Conta%20criada.%20Tente%20fazer%20login.')
    }
  } catch (error) {
    console.error('Unexpected signup error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor'
    redirect(`/register?message=${encodeURIComponent(errorMessage)}`)
  }
}

export default function RegisterPage({
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
            Criar conta no MercaFlow
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Gerencie seus usuários do MercadoLibre
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" action={handleSignup}>
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                Nome completo
              </label>
              <div className="mt-1">
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Seu nome completo"
                />
              </div>
            </div>

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
                  autoComplete="new-password"
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
                Criar conta
              </button>
            </div>

            {/* Messages */}
            {searchParams?.message && (
              <div className={`rounded-md p-4 ${
                searchParams.message.includes('sucesso') || searchParams.message.includes('criada')
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-red-50 border border-red-200'
              }`}>
                <div className={`text-sm ${
                  searchParams.message.includes('sucesso') || searchParams.message.includes('criada')
                    ? 'text-green-800'
                    : 'text-red-800'
                }`}>
                  {decodeURIComponent(searchParams.message)}
                </div>
              </div>
            )}

            {/* Info sobre confirmação de email */}
            <div className="rounded-md bg-blue-50 p-4 border border-blue-200">
              <div className="text-sm text-blue-800">
                <strong>ℹ️ Como funciona o cadastro:</strong>
                <ol className="mt-2 ml-4 list-decimal space-y-1">
                  <li>Preencha seus dados e clique em "Criar conta"</li>
                  <li>Verifique seu email (incluindo pasta de spam)</li>
                  <li>Clique no link de confirmação que enviamos</li>
                  <li>Sua conta será ativada e você poderá fazer login</li>
                </ol>
              </div>
            </div>

            {/* Links */}
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">
                Já tem uma conta?{' '}
                <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                  Fazer login
                </Link>
              </p>
              <p className="text-sm text-gray-600">
                Não recebeu o email?{' '}
                <Link href="/auth/resend" className="font-medium text-blue-600 hover:text-blue-500">
                  Reenviar confirmação
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