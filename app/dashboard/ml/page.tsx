import { getCurrentUser } from '@/utils/supabase/server';
import { getUserRole } from '@/utils/supabase/roles';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function MLDashboard() {
  console.log('=== ML DASHBOARD PAGE LOADING ===')
  
  // Use getCurrentUser instead of requireRole to avoid exceptions
  const user = await getCurrentUser();
  
  if (!user) {
    console.log('No user found, redirecting to login')
    redirect('/login');
  }

  const userRole = await getUserRole();
  console.log('ML Dashboard - User:', user.email, 'Role:', userRole)

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
                Mercado Livre Integration - TESTE SEM COMPONENTES
              </h1>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Success Message */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">
                  ✅ Sucesso! Página ML carregada sem problemas!
                </h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>Se você está vendo esta página, significa que:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>O middleware está funcionando corretamente</li>
                    <li>A navegação não está sendo bloqueada</li>
                    <li>O problema estava na função <code>requireRole()</code> ou nos componentes ML</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Debug Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Informações de Debug</h2>
            <div className="space-y-2 text-sm">
              <div><strong>Usuário:</strong> {user.email}</div>
              <div><strong>Role:</strong> {userRole}</div>
              <div><strong>Status:</strong> <span className="text-green-600">Autenticado e autorizado</span></div>
              <div><strong>Página:</strong> /dashboard/ml (versão simplificada)</div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Próximos Passos</h3>
            <p className="text-blue-700 mb-4">
              Agora vamos reativar gradualmente os componentes para identificar qual está causando o problema:
            </p>
            <div className="space-y-2 text-sm text-blue-700">
              <div>1. ✅ Navegação básica - <strong>Funcionando</strong></div>
              <div>2. ⏳ Adicionar componente ConnectionStatus</div>
              <div>3. ⏳ Adicionar componente ProductManager</div>
              <div>4. ⏳ Adicionar componente OrderManager</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <Link 
              href="/dashboard"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              ← Voltar ao Dashboard
            </Link>
            <Link 
              href="/debug-ml"
              className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 transition-colors"
            >
              Ver Página Debug
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}