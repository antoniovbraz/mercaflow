import { createClient } from '@/utils/supabase/server'
import { getCurrentUser } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function TestRolePage() {
  // Protect debug endpoint in production
  if (process.env.NODE_ENV === 'production') {
    redirect('/')
  }

  const supabase = await createClient()
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/login')
  }

  // Get user profile with role
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            🔍 Teste de Role do Usuário
          </h1>
          
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900">Informações do Auth User:</h3>
              <p><strong>ID:</strong> {user.id}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Email Confirmado:</strong> {user.email_confirmed_at ? '✅ Sim' : '❌ Não'}</p>
              <p><strong>Criado em:</strong> {new Date(user.created_at).toLocaleDateString('pt-BR')}</p>
            </div>

            {profile ? (
              <div className={`p-4 rounded-lg ${
                profile.role === 'super_admin' ? 'bg-red-50' : 
                profile.role === 'admin' ? 'bg-yellow-50' : 'bg-green-50'
              }`}>
                <h3 className={`font-semibold ${
                  profile.role === 'super_admin' ? 'text-red-900' : 
                  profile.role === 'admin' ? 'text-yellow-900' : 'text-green-900'
                }`}>
                  Profile Information:
                </h3>
                <p><strong>Role:</strong> <span className={`font-bold ${
                  profile.role === 'super_admin' ? 'text-red-600' : 
                  profile.role === 'admin' ? 'text-yellow-600' : 'text-green-600'
                }`}>{profile.role}</span></p>
                <p><strong>Full Name:</strong> {profile.full_name || 'Não definido'}</p>
                <p><strong>Profile Criado:</strong> {new Date(profile.created_at).toLocaleDateString('pt-BR')}</p>
                <p><strong>Última Atualização:</strong> {new Date(profile.updated_at).toLocaleDateString('pt-BR')}</p>
                
                {profile.role === 'super_admin' && (
                  <div className="mt-4 p-3 bg-red-100 rounded border border-red-200">
                    <p className="text-red-800 font-semibold">🎉 SUPER ADMIN CONFIRMADO!</p>
                    <p className="text-red-700 text-sm">Você tem acesso total ao sistema administrativo.</p>
                  </div>
                )}
              </div>
            ) : error ? (
              <div className="bg-red-50 p-4 rounded-lg">
                <h3 className="font-semibold text-red-900">❌ Erro ao carregar profile:</h3>
                <p className="text-red-700">{error.message}</p>
                
                <div className="mt-4 p-3 bg-yellow-100 rounded border border-yellow-200">
                  <p className="text-yellow-800 font-semibold">🔧 Ação necessária:</p>
                  <p className="text-yellow-700 text-sm">O profile não foi criado automaticamente. Faça logout e login novamente.</p>
                </div>
              </div>
            ) : (
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="font-semibold text-yellow-900">⚠️ Profile não encontrado</h3>
                <p className="text-yellow-700">O profile ainda não foi criado para este usuário.</p>
              </div>
            )}

            <div className="flex space-x-4 pt-4">
              <a 
                href="/dashboard"
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
              >
                ← Voltar ao Dashboard
              </a>
              
              {profile?.role === 'super_admin' && (
                <a 
                  href="/admin"
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors"
                >
                  🔧 Acessar Admin
                </a>
              )}
              
              <form action="/auth/logout" method="post" className="inline">
                <button className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors">
                  🔄 Fazer Logout/Login
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}