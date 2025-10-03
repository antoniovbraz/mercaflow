import { getUserProfileWithRole, hasRole } from '@/utils/supabase/roles'
import { getUserTenants, getUserDefaultTenant } from '@/utils/supabase/tenants'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const profile = await getUserProfileWithRole()
  
  if (!profile) {
    redirect('/login?message=Você%20precisa%20estar%20logado%20para%20acessar%20o%20dashboard')
  }

  const [userTenants, defaultTenant, isAdmin] = await Promise.all([
    getUserTenants(),
    getUserDefaultTenant(),
    hasRole('admin')
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Bem-vindo ao MercaFlow!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-blue-600">{userTenants.length}</div>
          <div className="text-sm text-gray-500">Meus Tenants</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-green-600">{profile.role}</div>
          <div className="text-sm text-gray-500">Minha Role</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-purple-600">0</div>
          <div className="text-sm text-gray-500">Integrações ML</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-orange-600">0</div>
          <div className="text-sm text-gray-500">Pedidos Ativos</div>
        </div>
      </div>

      {/* Informações do Usuário */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Informações do Usuário</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p><strong>Nome:</strong> {profile.full_name || 'Não informado'}</p>
            <p><strong>Email:</strong> {profile.email}</p>
            <p><strong>Role Global:</strong> <span className="capitalize font-medium text-blue-600">{profile.role}</span></p>
          </div>
          <div>
            <p><strong>ID:</strong> <span className="text-xs font-mono">{profile.id}</span></p>
            <p><strong>Criado em:</strong> {new Date(profile.created_at).toLocaleDateString('pt-BR')}</p>
            {isAdmin && (
              <p><strong>Admin:</strong> <span className="text-green-600 font-medium">Sim</span></p>
            )}
          </div>
        </div>
      </div>

      {/* Tenant Atual */}
      {defaultTenant && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Tenant Atual</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p><strong>Nome:</strong> {defaultTenant.name}</p>
              <p><strong>Slug:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{defaultTenant.slug}</code></p>
              <p><strong>Status:</strong> <span className={`font-medium ${defaultTenant.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>{defaultTenant.status}</span></p>
            </div>
            <div>
              <p><strong>Minha Role:</strong> <span className="capitalize font-medium text-purple-600">{defaultTenant.user_role}</span></p>
              <p><strong>Criado em:</strong> {new Date(defaultTenant.created_at).toLocaleDateString('pt-BR')}</p>
            </div>
          </div>
        </div>
      )}

      {/* Lista de Tenants */}
      {userTenants.length > 1 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Todos os Meus Tenants</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userTenants.map((tenant) => (
              <div key={tenant.id} className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900">{tenant.name}</h3>
                <p className="text-sm text-gray-500">@{tenant.slug}</p>
                <div className="mt-2 flex justify-between items-center">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    tenant.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {tenant.status}
                  </span>
                  <span className="text-xs font-medium text-purple-600 capitalize">
                    {tenant.user_role}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Links de Navegação */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Navegação</h2>
        <div className="flex flex-wrap gap-4">
          <a href="/private" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
            Área Privada
          </a>
          {isAdmin && (
            <a href="/admin" className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors">
              Painel Admin
            </a>
          )}
          <form action="/auth/logout" method="post" className="inline">
            <button type="submit" className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors">
              Sair
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}