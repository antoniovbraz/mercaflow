import { getCurrentUser, createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function SuperAdminSetup() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/login')
  }

  // Verificar se é email de super admin
  const isSuperAdminEmail = user.email === 'peepers.shop@gmail.com' || user.email === 'antoniovbraz@gmail.com'
  
  if (!isSuperAdminEmail) {
    return (
      <div className="min-h-screen bg-red-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow p-6">
            <h1 className="text-2xl font-bold text-red-600 mb-4">❌ Acesso Negado</h1>
            <p className="text-red-700">
              Esta página é exclusiva para super administradores da aplicação.
            </p>
            <p className="text-sm text-gray-600 mt-4">
              Email atual: {user.email}
            </p>
          </div>
        </div>
      </div>
    )
  }

  const supabase = await createClient()
  
  // Verificar profile atual
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Verificar roles atuais
  const { data: roles } = await supabase
    .from('user_roles')
    .select('*')
    .eq('user_id', user.id)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🚀 Super Admin Setup - MercaFlow
          </h1>
          <p className="text-gray-600">
            Configuração completa para o proprietário da aplicação
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Status Atual */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">📊 Status Atual</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="font-medium text-blue-900">Email:</span>
                <span className="text-blue-700">{user.email}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="font-medium text-green-900">Autenticado:</span>
                <span className="text-green-700">✅ Sim</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <span className="font-medium text-yellow-900">Profile:</span>
                <span className="text-yellow-700">
                  {profile ? '✅ Criado' : '❌ Ausente'}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <span className="font-medium text-purple-900">Super Admin:</span>
                <span className="text-purple-700">
                  {roles?.some(r => r.role === 'super_admin') ? '✅ Configurado' : '❌ Pendente'}
                </span>
              </div>
            </div>
            
            {profile && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Dados do Profile:</h3>
                <pre className="text-xs overflow-auto">
{JSON.stringify(profile, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Ações de Configuração */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">⚙️ Configuração Automática</h2>
            
            <div className="space-y-4">
              {!profile && (
                <form action="/api/setup/create-super-admin-profile" method="post">
                  <button 
                    type="submit"
                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <span>🔧</span>
                    <span>Criar Profile Super Admin</span>
                  </button>
                </form>
              )}
              
              {!roles?.some(r => r.role === 'super_admin') && (
                <form action="/api/setup/assign-super-admin-role" method="post">
                  <button 
                    type="submit"
                    className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <span>👑</span>
                    <span>Atribuir Role Super Admin</span>
                  </button>
                </form>
              )}
              
              <form action="/api/setup/complete-super-admin-setup" method="post">
                <button 
                  type="submit"
                  className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <span>🚀</span>
                  <span>Configuração Completa (Tudo)</span>
                </button>
              </form>
              
              <div className="pt-4 border-t">
                <a 
                  href="/dashboard"
                  className="w-full bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <span>←</span>
                  <span>Voltar ao Dashboard</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Explicação do Sistema */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">📚 Como Funciona o Sistema</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">👤</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">1. Profile</h3>
              <p className="text-sm text-gray-600">
                Dados pessoais, configurações e informações da sua conta como proprietário da loja
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">👑</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">2. Super Admin</h3>
              <p className="text-sm text-gray-600">
                Acesso total ao sistema, gerenciamento de usuários e configurações globais
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🛍️</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">3. Integração ML</h3>
              <p className="text-sm text-gray-600">
                Conecta sua conta do Mercado Livre para gerenciar produtos e vendas centralmente
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}