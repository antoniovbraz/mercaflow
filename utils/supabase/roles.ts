import { createClient } from './server'

// Tipos para roles
export type AppRole = 'user' | 'admin' | 'super_admin'

export interface UserProfile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: AppRole
  created_at: string
  updated_at: string
}

/**
 * Get user profile with role information
 * Use this for role-based access control
 */
export async function getUserProfileWithRole(): Promise<UserProfile | null> {
  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    console.error('Error getting user:', userError)
    return null
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) {
    console.error('Error getting user profile:', error)
    return null
  }

  return profile as UserProfile
}

/**
 * Check if current user has required role
 * Supports role hierarchy: super_admin > admin > user
 */
export async function hasRole(requiredRole: AppRole): Promise<boolean> {
  const profile = await getUserProfileWithRole()
  if (!profile) return false

  const roleHierarchy: Record<AppRole, number> = {
    'user': 1,
    'admin': 2,
    'super_admin': 3
  }

  return roleHierarchy[profile.role] >= roleHierarchy[requiredRole]
}

/**
 * Require specific role - throws if user doesn't have permission
 * Use this in Server Components that require specific roles
 */
export async function requireRole(requiredRole: AppRole): Promise<UserProfile> {
  const profile = await getUserProfileWithRole()
  if (!profile) {
    throw new Error('Authentication required')
  }

  const hasPermission = await hasRole(requiredRole)
  if (!hasPermission) {
    throw new Error(`Access denied. Required role: ${requiredRole}`)
  }

  return profile
}

/**
 * Check if user is admin (admin or super_admin)
 */
export async function isAdmin(): Promise<boolean> {
  return await hasRole('admin')
}

/**
 * Check if user is super admin
 */
export async function isSuperAdmin(): Promise<boolean> {
  return await hasRole('super_admin')
}

/**
 * Get all users (admin only)
 */
export async function getAllUsers(): Promise<UserProfile[]> {
  const supabase = await createClient()
  
  // Verify admin access
  const isUserAdmin = await isAdmin()
  if (!isUserAdmin) {
    throw new Error('Admin access required')
  }

  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error getting all users:', error)
    return []
  }

  return profiles as UserProfile[]
}

/**
 * Update user role (super admin only)
 */
export async function updateUserRole(userId: string, newRole: AppRole): Promise<boolean> {
  const supabase = await createClient()
  
  // Verify super admin access
  const isSuperAdminUser = await isSuperAdmin()
  if (!isSuperAdminUser) {
    throw new Error('Super admin access required')
  }

  const { error } = await supabase
    .from('profiles')
    .update({ role: newRole, updated_at: new Date().toISOString() })
    .eq('id', userId)

  if (error) {
    console.error('Error updating user role:', error)
    return false
  }

  return true
}