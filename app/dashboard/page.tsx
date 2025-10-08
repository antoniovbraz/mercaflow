import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/utils/supabase/server'
import { getUserRole, hasRole } from '@/utils/supabase/roles'
import { signOutAction } from '../login/actions'

export default async function DashboardPage() {
  // Require authentication
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/login')
  }

  // Get user role and profile data
  const userRole = await getUserRole()
  const isSuperAdmin = await hasRole('super_admin')
  const isAdmin = await hasRole('admin')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-semibold text-gray-900">
                  MercaFlow {isSuperAdmin ? '⚡ Super Admin' : isAdmin ? '👤 Admin' : ''}
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {userRole && (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    userRole === 'super_admin' 
                      ? 'bg-red-100 text-red-800' 
                      : userRole === 'admin'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {userRole === 'super_admin' ? 'Super Admin' : userRole === 'admin' ? 'Admin' : 'Usuário'}
                  </span>
                )}
                <span className="text-sm text-gray-700">
                  {user.email}
                </span>
              </div>
              <form action={signOutAction}>
                <button 
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
                >
                  Sair
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Bem-vindo ao MercaFlow! 🚀
          </h2>
          <p className="text-gray-600">
            Sua plataforma de integração com Mercado Livre está pronta para uso.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">👥</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Usuários Ativos
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      0
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">🛒</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Integrações ML
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      0
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">📊</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Produtos Sync
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      0
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">💰</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Vendas Hoje
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      R$ 0,00
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Mercado Livre Integration */}
          <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-lg">🛒</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Integração Mercado Livre
                  </h3>
                  <p className="text-sm text-gray-500">
                    Configure sua conta do ML
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <button className="w-full bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                  Conectar Conta ML
                </button>
              </div>
            </div>
          </div>

          {/* Analytics */}
          <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-lg">📊</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Analytics & Relatórios
                  </h3>
                  <p className="text-sm text-gray-500">
                    Visualize suas métricas
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <button className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                  Ver Analytics
                </button>
              </div>
            </div>
          </div>

          {/* Super Admin Panel */}
          {isSuperAdmin && (
            <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow border-2 border-red-200">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-lg">⚡</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Painel Super Admin
                    </h3>
                    <p className="text-sm text-gray-500">
                      Gerenciar sistema e usuários
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <a 
                    href="/admin"
                    className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors inline-block text-center"
                  >
                    Acessar Admin
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Information */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Informações da Conta
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900">{user.email}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Role</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {userRole === 'super_admin' ? 'Super Administrador' : 
                   userRole === 'admin' ? 'Administrador' : 'Usuário'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">ID do Usuário</dt>
                <dd className="mt-1 text-sm text-gray-900 font-mono">{user.id}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Confirmado</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {user.email_confirmed_at ? (
                    <span className="text-green-600">✅ Confirmado</span>
                  ) : (
                    <span className="text-orange-600">⏳ Pendente</span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Membro desde</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(user.created_at).toLocaleDateString('pt-BR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </dd>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}