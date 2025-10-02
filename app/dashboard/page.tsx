import { getCurrentUser, isSuperAdmin } from '@/utils/supabase/auth-helpers'

export default async function DashboardPage() {
  const user = await getCurrentUser()
  const isSuper = await isSuperAdmin()

  if (!user) {
    return <div>Not authenticated</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Bem-vindo ao MercaFlow!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-blue-600">0</div>
          <div className="text-sm text-gray-500">Total Users</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-green-600">0</div>
          <div className="text-sm text-gray-500">Total Tenants</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-purple-600">0</div>
          <div className="text-sm text-gray-500">Total Products</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-orange-600">0</div>
          <div className="text-sm text-gray-500">Total Orders</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">User Information</h2>
        <div className="space-y-2">
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Super Admin:</strong> {isSuper ? 'Yes' : 'No'}</p>
          <p><strong>User ID:</strong> {user.id}</p>
        </div>
      </div>
    </div>
  )
}