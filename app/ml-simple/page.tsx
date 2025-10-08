import { getCurrentUser } from '@/utils/supabase/server'
import { getUserRole } from '@/utils/supabase/roles'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function MLDashboardSimple() {
  console.log('=== ML DASHBOARD SIMPLE START ===')
  
  // Usar getCurrentUser ao invés de requireRole para evitar exceções
  const user = await getCurrentUser()
  
  if (!user) {
    console.log('No user - redirecting to login')
    redirect('/login')
  }

  // Verificar role sem usar requireRole
  const userRole = await getUserRole()
  console.log('User role in ML dashboard:', userRole)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link 
                href="/dashboard"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                ← Voltar ao Dashboard
              </Link>
              <div className="border-l border-gray-300 h-6"></div>
              <h1 className="text-xl font-semibold text-gray-900">
                Mercado Livre Integration (Simplified)
              </h1>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Page Header */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">✅ Integração Mercado Livre</h2>
            <p className="text-gray-600 mb-4">
              Esta é uma versão simplificada para testar a navegação
            </p>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-2">Sucesso!</h3>
              <p className="text-green-700 mb-4">
                Se você está vendo esta página, a navegação está funcionando corretamente.
              </p>
              
              <div className="space-y-2 text-sm text-green-600">
                <div><strong>Usuário:</strong> {user.email}</div>
                <div><strong>Role:</strong> {userRole}</div>
                <div><strong>ID:</strong> {user.id}</div>
              </div>
            </div>

            <div className="mt-6 space-x-4">
              <Link 
                href="/dashboard"
                className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
              >
                ← Voltar ao Dashboard
              </Link>
              
              <Link 
                href="/debug-ml"
                className="inline-block bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 transition-colors"
              >
                Ver Debug Page
              </Link>
            </div>
          </div>

          {/* Status Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Status da Integração</h3>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
              <span className="text-gray-600">Não conectado ao Mercado Livre</span>
            </div>
            <button className="mt-4 bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition-colors">
              Conectar ao Mercado Livre
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}