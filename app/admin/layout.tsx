import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/utils/supabase/server'
import { hasRole } from '@/utils/supabase/roles'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Require authentication
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/login')
  }

  // Require super admin role
  const isSuperAdmin = await hasRole('super_admin')
  
  if (!isSuperAdmin) {
    redirect('/dashboard?error=' + encodeURIComponent('Acesso negado: apenas super admins podem acessar esta área'))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Navigation */}
      <nav className="bg-white shadow-sm border-b border-red-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-red-600">
                  ⚡ MercaFlow Admin
                </h1>
              </div>
              <div className="hidden md:flex space-x-8">
                <a href="/admin" className="text-gray-900 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Dashboard
                </a>
                <a href="/admin/users" className="text-gray-500 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Usuários
                </a>
                <a href="/admin/tenants" className="text-gray-500 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Tenants
                </a>
                <a href="/admin/api-tester" className="text-gray-500 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  🧪 API Tester
                </a>
                <a href="/admin/system" className="text-gray-500 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Sistema
                </a>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                Super Admin
              </span>
              <span className="text-sm text-gray-700">
                {user.email}
              </span>
              <a 
                href="/dashboard"
                className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm transition-colors"
              >
                ← Voltar
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Admin Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}