import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { jwtDecode } from 'jwt-decode'

export async function createServerSupabase() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

// ==========================================
// MERCAFLOW RBAC AUTH HELPERS
// ==========================================
// Baseado na documentação oficial do Supabase Custom Claims & RBAC

export type AppRole = 'user' | 'admin' | 'super_admin'
export type AppPermission = 'users.read' | 'users.write' | 'users.delete' | 
                           'tenants.read' | 'tenants.write' | 'tenants.delete' |
                           'platform.admin' | 'platform.super_admin'

interface JwtPayload {
  user_role?: AppRole
  [key: string]: any
}

// 👤 Pegar usuário atual
export async function getCurrentUser() {
  const supabase = await createServerSupabase()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return null
  }
  
  return user
}

// 🎫 Pegar sessão atual
export async function getCurrentSession() {
  const supabase = await createServerSupabase()
  const { data: { session }, error } = await supabase.auth.getSession()
  
  if (error || !session) {
    return null
  }
  
  return session
}

// 🏷️ Pegar role do usuário atual do JWT
export async function getCurrentUserRole(): Promise<AppRole> {
  const session = await getCurrentSession()
  
  if (!session?.access_token) {
    return 'user'
  }
  
  try {
    const jwt = jwtDecode<JwtPayload>(session.access_token)
    return jwt.user_role || 'user'
  } catch (error) {
    console.error('Error decoding JWT:', error)
    return 'user'
  }
}

// � Verificar se é super admin
export async function isSuperAdmin(): Promise<boolean> {
  const role = await getCurrentUserRole()
  return role === 'super_admin'
}

// 🛡️ Verificar se é admin (admin ou super_admin)
export async function isAdmin(): Promise<boolean> {
  const role = await getCurrentUserRole()
  return role === 'admin' || role === 'super_admin'
}

// 🔐 Verificar permissão específica
export async function hasPermission(permission: AppPermission): Promise<boolean> {
  const supabase = await createServerSupabase()
  
  try {
    const { data, error } = await supabase.rpc('authorize', {
      requested_permission: permission
    })
    
    if (error) {
      console.error('Error checking permission:', error)
      return false
    }
    
    return data === true
  } catch (error) {
    console.error('Error checking permission:', error)
    return false
  }
}

// 🚪 Autorizar usuário (redireciona se não logado)
export async function authorize() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/login')
  }
  
  return user
}

// 👑 Autorizar super admin (redireciona se não for)
export async function authorizeSuperAdmin() {
  const user = await authorize()
  const isSuperAdminUser = await isSuperAdmin()
  
  if (!isSuperAdminUser) {
    redirect('/dashboard?message=Acesso%20negado.%20Você%20precisa%20ser%20super%20admin.')
  }
  
  return user
}

// 🛡️ Autorizar admin (redireciona se não for)
export async function authorizeAdmin() {
  const user = await authorize()
  const isAdminUser = await isAdmin()
  
  if (!isAdminUser) {
    redirect('/dashboard?message=Acesso%20negado.%20Você%20precisa%20ser%20admin.')
  }
  
  return user
}

// 🏢 Pegar tenants do usuário
export async function getUserTenants(userId: string) {
  const supabase = await createServerSupabase()
  
  const { data: tenants, error } = await supabase
    .from('user_tenants')
    .select(`
      tenant_id,
      role,
      tenants:tenant_id (
        id,
        name,
        subdomain,
        settings
      )
    `)
    .eq('user_id', userId)
  
  if (error) {
    console.error('Error fetching user tenants:', error)
    return []
  }
  
  return tenants || []
}

// 📊 Pegar estatísticas do usuário (para super admin)
export async function getUserStats() {
  const supabase = await createServerSupabase()
  
  try {
    // Total de usuários
    const { count: usersCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
    
    // Total de tenants
    const { count: tenantsCount } = await supabase
      .from('tenants')
      .select('*', { count: 'exact', head: true })
    
    return {
      totalUsers: usersCount || 0,
      totalTenants: tenantsCount || 0
    }
  } catch (error) {
    console.error('Error fetching user stats:', error)
    return {
      totalUsers: 0,
      totalTenants: 0
    }
  }
}

// � Promover usuário para super admin (função auxiliar)
export async function promoteToSuperAdmin(userEmail: string) {
  const supabase = await createServerSupabase()
  
  try {
    const { data, error } = await supabase.rpc('promote_to_super_admin', {
      user_email: userEmail
    })
    
    if (error) {
      console.error('Error promoting user to super admin:', error)
      return false
    }
    
    return true
  } catch (error) {
    console.error('Error promoting user to super admin:', error)
    return false
  }
}