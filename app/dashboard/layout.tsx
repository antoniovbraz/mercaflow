'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, isLoading, isSuperAdmin, userTenants } = useAuth()
  const router = useRouter()
  
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [user, isLoading, router])
  
  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }
  
  // Don't render anything if not authenticated
  if (!user) {
    return null
  }
  
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
      
      {/* Sidebar */}
      <div className="flex">
        <nav className="w-64 bg-white shadow-sm min-h-[calc(100vh-4rem)]">
          <div className="p-4">
            <div className="space-y-2">
              <NavLink href="/dashboard" icon="🏠">
                Dashboard
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
                  <NavLink href="/dashboard/system" icon="⚙️">
                    System
                  </NavLink>
                </>
              )}
            </div>
            
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
                      className="text-sm text-gray-600 p-2 rounded-md bg-gray-50"
                    >
                      🏢 {tenant.name}
                      <span className="block text-xs text-gray-400">
                        {tenant.tenant_users[0]?.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </nav>
        
        {/* Main Content */}
        <main className="flex-1 p-8">
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
  return (
    <a 
      href={href}
      className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-gray-900"
    >
      <span className="mr-3">{icon}</span>
      {children}
    </a>
  )
}