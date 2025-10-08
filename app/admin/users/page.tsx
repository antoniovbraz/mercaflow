import { createClient } from '@/utils/supabase/server'

export default async function UsersManagement() {
  const supabase = await createClient()
  
  // Get all users with profiles
  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
  
  const { data: authUsers } = await supabase.auth.admin.listUsers()
  
  // Merge auth users with profile data
  const users = authUsers?.users?.map(authUser => {
    const profile = profiles?.find(p => p.id === authUser.id)
    return {
      ...authUser,
      profile
    }
  }) || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            👥 Gerenciamento de Usuários
          </h1>
          <p className="text-gray-600 mt-1">
            Visualizar e gerenciar todos os usuários da plataforma
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            📊 Exportar Dados
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
            ➕ Convidar Usuário
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
              <span className="text-white text-sm">👥</span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total</p>
              <p className="text-xl font-semibold">{users.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center mr-3">
              <span className="text-white text-sm">⚡</span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Super Admins</p>
              <p className="text-xl font-semibold">{users.filter(u => u.profile?.role === 'super_admin').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center mr-3">
              <span className="text-white text-sm">👤</span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Admins</p>
              <p className="text-xl font-semibold">{users.filter(u => u.profile?.role === 'admin').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
              <span className="text-white text-sm">🙋</span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Usuários</p>
              <p className="text-xl font-semibold">{users.filter(u => u.profile?.role === 'user' || !u.profile?.role).length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Lista de Usuários
            </h3>
            <div className="flex items-center space-x-3">
              <select className="border border-gray-300 rounded-md px-3 py-1 text-sm">
                <option value="">Todos os roles</option>
                <option value="super_admin">Super Admin</option>
                <option value="admin">Admin</option>
                <option value="user">Usuário</option>
              </select>
              <input 
                type="search" 
                placeholder="Buscar usuários..."
                className="border border-gray-300 rounded-md px-3 py-1 text-sm w-64"
              />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuário
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Criado em
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Último acesso
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Ações</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">
                              {user.email?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.user_metadata?.full_name || user.email}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.profile?.role === 'super_admin' 
                          ? 'bg-red-100 text-red-800'
                          : user.profile?.role === 'admin'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {user.profile?.role === 'super_admin' ? 'Super Admin' : 
                         user.profile?.role === 'admin' ? 'Admin' : 'Usuário'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.email_confirmed_at
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {user.email_confirmed_at ? 'Confirmado' : 'Pendente'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString('pt-BR') : 'Nunca'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-2">
                        <button className="text-indigo-600 hover:text-indigo-900">
                          Editar
                        </button>
                        <button className="text-green-600 hover:text-green-900">
                          Promover
                        </button>
                        {user.profile?.role !== 'super_admin' && (
                          <button className="text-red-600 hover:text-red-900">
                            Excluir
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {users.length === 0 && (
            <div className="text-center py-8">
              <div className="text-gray-500">
                <p>Nenhum usuário encontrado.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* User Actions Panel */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            🛠️ Ações Administrativas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
              <span className="mr-2">➕</span>
              Criar Usuário Manual
            </button>
            <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
              <span className="mr-2">📧</span>
              Enviar Convite em Lote
            </button>
            <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
              <span className="mr-2">🔄</span>
              Sincronizar Profiles
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}