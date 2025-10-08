import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/utils/supabase/server'
import { getUserRole, hasRole } from '@/utils/supabase/roles'
import { createClient } from '@/utils/supabase/server'

export default async function DebugRolePage() {
  // Require authentication
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/login')
  }

  // Debug: Get role through multiple methods
  const userRole = await getUserRole()
  const isSuperAdmin = await hasRole('super_admin')
  const isAdmin = await hasRole('admin')
  
  // Debug: Direct database query
  const supabase = await createClient()
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  
  const { data: allProfiles, error: allError } = await supabase
    .from('profiles')
    .select('id, role, created_at, updated_at')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🔍 Debug de Roles - MercaFlow</h1>
        
        {/* User Info */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">👤 Informações do Usuário Atual</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <strong>Email:</strong> {user.email}
            </div>
            <div>
              <strong>User ID:</strong> {user.id}
            </div>
            <div>
              <strong>Created At:</strong> {user.created_at}
            </div>
            <div>
              <strong>Email Confirmed:</strong> {user.email_confirmed_at ? '✅ Sim' : '❌ Não'}
            </div>
          </div>
        </div>

        {/* Role Analysis */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">🎭 Análise de Roles</h2>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded">
              <strong>getUserRole() resultado:</strong> 
              <span className={`ml-2 px-3 py-1 rounded-full text-sm ${
                userRole === 'super_admin' ? 'bg-red-100 text-red-800' :
                userRole === 'admin' ? 'bg-blue-100 text-blue-800' :
                'bg-green-100 text-green-800'
              }`}>
                {userRole || 'null'}
              </span>
            </div>
            
            <div className="p-4 bg-gray-50 rounded">
              <strong>hasRole(&apos;super_admin&apos;):</strong> 
              <span className={`ml-2 px-3 py-1 rounded-full text-sm ${
                isSuperAdmin ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {isSuperAdmin ? '✅ TRUE' : '❌ FALSE'}
              </span>
            </div>
            
            <div className="p-4 bg-gray-50 rounded">
              <strong>hasRole(&apos;admin&apos;):</strong> 
              <span className={`ml-2 px-3 py-1 rounded-full text-sm ${
                isAdmin ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {isAdmin ? '✅ TRUE' : '❌ FALSE'}
              </span>
            </div>
          </div>
        </div>

        {/* Profile Data */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">👤 Dados do Profile</h2>
          {profileError ? (
            <div className="p-4 bg-red-50 text-red-700 rounded">
              <strong>Erro ao buscar profile:</strong> {profileError.message}
            </div>
          ) : profile ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <strong>ID:</strong> {profile.id}
              </div>
              <div>
                <strong>Role:</strong> 
                <span className={`ml-2 px-3 py-1 rounded-full text-sm ${
                  profile.role === 'super_admin' ? 'bg-red-100 text-red-800' :
                  profile.role === 'admin' ? 'bg-blue-100 text-blue-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {profile.role}
                </span>
              </div>
              <div>
                <strong>Full Name:</strong> {profile.full_name || 'Não definido'}
              </div>
              <div>
                <strong>Created At:</strong> {profile.created_at}
              </div>
              <div>
                <strong>Updated At:</strong> {profile.updated_at}
              </div>
            </div>
          ) : (
            <div className="p-4 bg-yellow-50 text-yellow-700 rounded">
              ⚠️ Profile não encontrado!
            </div>
          )}
        </div>

        {/* All Profiles */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">📋 Todos os Profiles</h2>
          {allError ? (
            <div className="p-4 bg-red-50 text-red-700 rounded">
              <strong>Erro ao buscar profiles:</strong> {allError.message}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left">ID</th>
                    <th className="px-4 py-2 text-left">Role</th>
                    <th className="px-4 py-2 text-left">Created</th>
                    <th className="px-4 py-2 text-left">Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {allProfiles?.map((p) => (
                    <tr key={p.id} className={`border-t ${p.id === user.id ? 'bg-blue-50' : ''}`}>
                      <td className="px-4 py-2 font-mono text-xs">
                        {p.id.substring(0, 8)}...
                        {p.id === user.id && ' (SEU USUÁRIO)'}
                      </td>
                      <td className="px-4 py-2">
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          p.role === 'super_admin' ? 'bg-red-100 text-red-800' :
                          p.role === 'admin' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {p.role}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-600">
                        {new Date(p.created_at).toLocaleString('pt-BR')}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-600">
                        {new Date(p.updated_at).toLocaleString('pt-BR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-8 flex space-x-4">
          <a 
            href="/dashboard"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            ← Voltar ao Dashboard
          </a>
          <a 
            href="/login"
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            🔄 Fazer Logout/Login
          </a>
        </div>
      </div>
    </div>
  )
}