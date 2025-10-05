import { Suspense } from 'react'
import { signUpAction } from '@/app/login/actions'

async function ErrorDisplay({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams

  if (params.error) {
    return (
      <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded max-w-md mx-auto">
        {params.error}
      </div>
    )
  }

  return null
}

function SimpleRegisterForm() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Crie sua conta
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Comece a usar o MercaFlow hoje mesmo
          </p>
        </div>

        <form className="mt-8 space-y-6" action={signUpAction}>
          <div className="space-y-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                Nome completo
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                autoComplete="name"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Seu nome completo"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Mínimo 6 caracteres"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Criar conta
            </button>
          </div>

          <div className="text-center">
            <a
              href="/login"
              className="text-blue-600 hover:text-blue-500 text-sm"
            >
              Já tem conta? Faça login
            </a>
          </div>
        </form>
      </div>
    </div>
  )
}

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  // Check if Supabase is configured
  const isSupabaseConfigured = !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 p-4 rounded">
            <h2 className="font-bold">Configuração Pendente</h2>
            <p>As variáveis de ambiente do Supabase não estão configuradas.</p>
            <p className="text-sm mt-2">Verifique as configurações no Vercel.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Suspense fallback={<div>Carregando...</div>}>
        <ErrorDisplay searchParams={searchParams} />
      </Suspense>
      <SimpleRegisterForm />
    </div>
  )
}