import { redirect } from 'next/navigation'
import { requireRole } from '@/utils/supabase/roles'

export default async function AdminPage() {
  // Verifica se o usuário tem role admin ou superior
  const profile = await requireRole('admin')
  
  if (!profile) {
    redirect('/login?message=Acesso%20negado.%20Você%20precisa%20ser%20admin%20para%20acessar%20esta%20página')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Painel de Administração
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Informações do Admin */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold text-blue-900 mb-4">
                Suas Informações
              </h2>
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-blue-700">Nome:</span>
                  <p className="text-blue-900">{profile.full_name || 'Não informado'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-blue-700">Email:</span>
                  <p className="text-blue-900">{profile.email}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-blue-700">Role:</span>
                  <p className="text-blue-900 font-bold uppercase">{profile.role}</p>
                </div>
              </div>
            </div>

            {/* Ações de Admin */}
            <div className="bg-green-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold text-green-900 mb-4">
                Ações Administrativas
              </h2>
              <div className="space-y-3">
                <button className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">
                  Gerenciar Usuários
                </button>
                <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                  Configurações do Sistema
                </button>
                <button className="w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors">
                  Relatórios
                </button>
              </div>
            </div>

            {/* Estatísticas */}
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold text-yellow-900 mb-4">
                Estatísticas
              </h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-yellow-700">Usuários Ativos:</span>
                  <span className="font-bold text-yellow-900">--</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-yellow-700">Tenants:</span>
                  <span className="font-bold text-yellow-900">--</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-yellow-700">Integrações ML:</span>
                  <span className="font-bold text-yellow-900">--</span>
                </div>
              </div>
            </div>

            {/* Links de Navegação */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Navegação
              </h2>
              <div className="space-y-2">
                <a 
                  href="/dashboard" 
                  className="block text-blue-600 hover:text-blue-800 underline"
                >
                  ← Voltar ao Dashboard
                </a>
                <a 
                  href="/private" 
                  className="block text-blue-600 hover:text-blue-800 underline"
                >
                  Área Privada
                </a>
                <form action="/auth/logout" method="post" className="mt-4">
                  <button
                    type="submit"
                    className="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                  >
                    Sair
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}