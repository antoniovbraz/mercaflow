import { getCurrentUser, getUserTenants, authorize } from '@/utils/supabase/auth-helpers'
import { createServerSupabase } from '@/utils/supabase/auth-helpers'

export default async function DashboardPage() {
  const user = await getCurrentUser()
  const tenants = await getUserTenants()
  
  // Verificar algumas permissões para demonstração
  const canCreateUsers = await authorize('users.create')
  const canManageSystem = await authorize('system.manage')
  const canViewMLUsers = await authorize('ml_users.read')
  
  // Buscar estatísticas
  const supabase = await createServerSupabase()
  
  let mlUsersCount = 0
  let tenantsCount = 0
  
  if (canViewMLUsers) {
    const { count } = await supabase
      .from('ml_users')
      .select('*', { count: 'exact', head: true })
    mlUsersCount = count || 0
  }
  
  if (canManageSystem) {
    const { count } = await supabase
      .from('tenants')
      .select('*', { count: 'exact', head: true })
    tenantsCount = count || 0
  }
  
  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Bem-vindo ao MercaFlow! 🚀
        </h1>
        <p className="mt-2 text-gray-600">
          Sistema world-class de integração com MercadoLibre
        </p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {canViewMLUsers && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-2xl">👥</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">ML Users</p>
                <p className="text-2xl font-bold text-gray-900">{mlUsersCount}</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-2xl">🏢</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Your Tenants</p>
              <p className="text-2xl font-bold text-gray-900">{tenants.length}</p>
            </div>
          </div>
        </div>
        
        {canManageSystem && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <span className="text-2xl">🌟</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Tenants</p>
                <p className="text-2xl font-bold text-gray-900">{tenantsCount}</p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* User Info */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Your Profile 👤
        </h2>
        <div className="space-y-3">
          <div>
            <span className="text-sm font-medium text-gray-500">Email:</span>
            <span className="ml-2 text-sm text-gray-900">{user?.email}</span>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-500">Role:</span>
            <span className="ml-2 text-sm text-gray-900 capitalize">
              {user?.role || 'user'}
            </span>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-500">User ID:</span>
            <span className="ml-2 text-sm text-gray-500 font-mono">
              {user?.id}
            </span>
          </div>
        </div>
      </div>
      
      {/* Permissions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Your Permissions 🔐
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <PermissionBadge 
            label="Create Users" 
            granted={canCreateUsers} 
          />
          <PermissionBadge 
            label="System Management" 
            granted={canManageSystem} 
          />
          <PermissionBadge 
            label="View ML Users" 
            granted={canViewMLUsers} 
          />
        </div>
      </div>
      
      {/* Tenants List */}
      {tenants.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Your Tenants 🏢
          </h2>
          <div className="space-y-3">
            {tenants.map((tenant: any) => (
              <div 
                key={tenant.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <h3 className="font-medium text-gray-900">{tenant.name}</h3>
                  <p className="text-sm text-gray-500">
                    Role: {tenant.tenant_users[0]?.role}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    tenant.status === 'active' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {tenant.status}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">
                    {tenant.plan}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function PermissionBadge({ 
  label, 
  granted 
}: { 
  label: string
  granted: boolean 
}) {
  return (
    <div className={`flex items-center p-3 rounded-lg ${
      granted 
        ? 'bg-green-50 text-green-700' 
        : 'bg-red-50 text-red-700'
    }`}>
      <span className="mr-2">
        {granted ? '✅' : '❌'}
      </span>
      <span className="text-sm font-medium">{label}</span>
    </div>
  )
}