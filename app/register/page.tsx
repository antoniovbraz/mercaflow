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
      redirect('/register?message=Todos os campos são obrigatórios')
      return
    }

    if (password.length < 6) {
      redirect('/register?message=A senha deve ter pelo menos 6 caracteres')
      return
    }

    console.log('Attempting signup for email:', email)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        }
      }
    })

    if (error) {
      console.error('Supabase signup error:', error)
      let errorMessage = 'Erro ao criar conta'
      
      switch (error.message) {
        case 'User already registered':
          errorMessage = 'Usuário já cadastrado'
          break
        case 'Invalid email':
          errorMessage = 'Email inválido'
          break
        case 'Password should be at least 6 characters':
          errorMessage = 'Senha deve ter pelo menos 6 caracteres'
          break
        default:
          errorMessage = `Erro: ${error.message}`
      }
      
      redirect(`/register?message=${encodeURIComponent(errorMessage)}`)
      return
    }

    console.log('Signup successful:', data)
    redirect('/login?message=Verifique seu email para continuar o processo de login')
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

            {/* Error Message */}
            {searchParams?.message && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-800">
                  {searchParams.message}
                </div>
              </div>
            )}

            {/* Links */}
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">
                Já tem uma conta?{' '}
                <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                  Fazer login
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