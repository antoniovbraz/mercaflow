import { getCurrentUser, getUserTenants, isSuperAdmin } from '@/utils/supabase/auth-helpers'
import { redirect } from 'next/navigation'
import DashboardClient from './dashboard-client'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/login')
  }

  const [tenants, isSuper] = await Promise.all([
    getUserTenants(),
    isSuperAdmin()
  ])

  return (
    <DashboardClient 
      user={user} 
      isSuperAdmin={isSuper}
      userTenants={tenants}
    >
      {children}
    </DashboardClient>
  )
}