import { getCurrentUser } from '@/utils/supabase/auth-helpers'
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

  return <DashboardClient user={user}>{children}</DashboardClient>
}