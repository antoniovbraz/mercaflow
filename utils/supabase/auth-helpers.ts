import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createServerSupabase() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

// 🔐 Verificar se usuário tem permissão específica
export async function authorize(permission: string): Promise<boolean> {
  const supabase = await createServerSupabase()
  
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return false
    
    // Verificar no banco usando nossa função authorize
    const { data, error } = await supabase
      .rpc('authorize', { requested_permission: permission })
    
    if (error) {
      console.error('Error checking authorization:', error)
      return false
    }
    
    return data === true
  } catch (error) {
    console.error('Authorization check failed:', error)
    return false
  }
}

// 👤 Pegar usuário atual com role do JWT
export async function getCurrentUser() {
  const supabase = await createServerSupabase()
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) return null
    
    return {
      ...user,
      role: user.app_metadata?.app_role || null
    }
  } catch (error) {
    console.error('Failed to get current user:', error)
    return null
  }
}

// 🏢 Pegar tenants do usuário atual
export async function getUserTenants() {
  const supabase = await createServerSupabase()
  
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return []
    
    const { data: tenants, error } = await supabase
      .from('tenants')
      .select(`
        *,
        tenant_users!inner(
          role,
          status,
          joined_at
        )
      `)
      .eq('tenant_users.user_id', user.id)
      .eq('tenant_users.status', 'active')
    
    if (error) {
      console.error('Error fetching user tenants:', error)
      return []
    }
    
    return tenants || []
  } catch (error) {
    console.error('Failed to get user tenants:', error)
    return []
  }
}

// ⚡ Helper para verificar se é super admin
export async function isSuperAdmin(): Promise<boolean> {
  return await authorize('system.manage')
}

// 📊 Helper para verificar múltiplas permissões
export async function hasAnyPermission(permissions: string[]): Promise<boolean> {
  for (const permission of permissions) {
    if (await authorize(permission)) {
      return true
    }
  }
  return false
}

// 🔒 Helper para verificar todas as permissões
export async function hasAllPermissions(permissions: string[]): Promise<boolean> {
  for (const permission of permissions) {
    if (!(await authorize(permission))) {
      return false
    }
  }
  return true
}