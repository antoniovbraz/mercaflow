'use client'

import { User } from '@supabase/supabase-js'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface DashboardClientProps {
  user: User
  isSuperAdmin: boolean
  userTenants: any[]
  children: React.ReactNode
}

export default function DashboardClient({ user, isSuperAdmin, userTenants, children }: DashboardClientProps) {

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                🚀 MercaFlow
              </h1>
              {isSuperAdmin && (
                <span className="ml-2 px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                  SUPER ADMIN
                </span>
              )}
            </div>
            
            {/* User Info */}
            <div className="flex items-center space-x-4">
              <div className="text-sm">
                <p className="text-gray-900 font-medium">{user.email}</p>
                <p className="text-gray-500 capitalize">
                  Role: user
                </p>
              </div>
              
              {/* Logout */}
              <form action="/auth/logout" method="post">
                <button
                  type="submit"
                  className="text-gray-500 hover:text-gray-700 text-sm font-medium"
                >
                  Logout
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-sm border-r min-h-screen">
          <div className="p-6">
            <nav className="space-y-2">
              <NavLink href="/dashboard" icon="📊">
                Dashboard
              </NavLink>
              <NavLink href="/dashboard/analytics" icon="📈">
                Analytics
              </NavLink>
              <NavLink href="/dashboard/products" icon="📦">
                Products
              </NavLink>
              <NavLink href="/dashboard/orders" icon="🛒">
                Orders
              </NavLink>
              <NavLink href="/dashboard/ml-users" icon="👥">
                ML Users
              </NavLink>
              
              {isSuperAdmin && (
                <>
                  <div className="pt-4 pb-2">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Admin
                    </p>
                  </div>
                  <NavLink href="/dashboard/tenants" icon="🏢">
                    Tenants
                  </NavLink>
                  <NavLink href="/dashboard/users" icon="👤">
                    Users
                  </NavLink>
                </>
              )}
            </nav>
            
            {/* Tenants */}
            {userTenants.length > 0 && (
              <div className="mt-6">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Your Tenants
                </p>
                <div className="space-y-1">
                  {userTenants.map((tenant: any) => (
                    <div 
                      key={tenant.id}
                      className="flex items-center p-2 text-sm text-gray-600 rounded-lg hover:bg-gray-50"
                    >
                      <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                      {tenant.name}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

function NavLink({ 
  href, 
  icon, 
  children 
}: { 
  href: string
  icon: string
  children: React.ReactNode 
}) {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <Link
      href={href}
      className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        isActive
          ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
      }`}
    >
      <span className="text-lg">{icon}</span>
      <span>{children}</span>
    </Link>
  )
}