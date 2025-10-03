import { requireAuth } from '@/utils/supabase/server'
import { signOutAction } from '../login/actions'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  // Require authentication
  const user = await requireAuth()
  
  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                MercaFlow Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Olá, {user.email}
              </span>
              <form action={signOutAction}>
                <button 
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                >
                  Sair
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Bem-vindo ao MercaFlow!
              </h2>
              <p className="text-gray-600">
                Sua plataforma de integração com Mercado Livre está pronta.
              </p>
              <div className="mt-8 bg-white p-4 rounded-lg shadow">
                <h3 className="font-semibold mb-2">Informações do usuário:</h3>
                <p><span className="font-medium">Email:</span> {user.email}</p>
                <p><span className="font-medium">ID:</span> {user.id}</p>
                <p><span className="font-medium">Confirmado:</span> {user.email_confirmed_at ? 'Sim' : 'Não'}</p>
                <p><span className="font-medium">Criado em:</span> {new Date(user.created_at).toLocaleDateString('pt-BR')}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}