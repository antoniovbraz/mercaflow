import { createClient } from './server'
import { User } from '@supabase/supabase-js'

/**
 * Get the current authenticated user
 * Uses supabase.auth.getUser() which validates the JWT on every call
 */
export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error) {
    console.error('Error getting user:', error)
    return null
  }
  
  return user
}

/**
 * Require authentication - throws if user is not authenticated
 * Use this in Server Components that require authentication
 */
export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Authentication required')
  }
  return user
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser()
  return !!user
}

/**
 * Get user profile data from database
 * Use this instead of getSession() for user data
 */
export async function getUserProfile() {
  const user = await getCurrentUser()
  if (!user) return null
  
  const supabase = await createClient()
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  
  if (error) {
    console.error('Error getting user profile:', error)
    return null
  }
  
  return profile
}

/**
 * Get user metadata
 */
export async function getUserMetadata() {
  const user = await getCurrentUser()
  return user?.user_metadata || {}
}

/**
 * Get user email (verified)
 */
export async function getUserEmail(): Promise<string | null> {
  const user = await getCurrentUser()
  return user?.email || null
}

/**
 * Check if user email is confirmed
 */
export async function isEmailConfirmed(): Promise<boolean> {
  const user = await getCurrentUser()
  return !!user?.email_confirmed_at
}

/**
 * Simple admin check based on email (temporary until proper RBAC)
 * This is just for basic access control
 */
export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser()
  if (!user?.email) return false
  
  // Simple admin check - replace with proper RBAC later
  const adminEmails = ['peepers.shop@gmail.com', 'antoniovbraz@gmail.com']
  return adminEmails.includes(user.email)
}

/**
 * Check if user is super admin
 * Currently uses email-based check, will be replaced with proper RBAC
 */
export async function isSuperAdmin(): Promise<boolean> {
  const user = await getCurrentUser()
  if (!user?.email) return false
  
  // Super admin emails - replace with proper RBAC later
  const superAdminEmails = ['peepers.shop@gmail.com', 'antoniovbraz@gmail.com']
  return superAdminEmails.includes(user.email)
}

/**
 * Get user tenants (simplified version)
 * Returns empty array for now - implement when tenant system is ready
 */
export async function getUserTenants(): Promise<any[]> {
  const user = await getCurrentUser()
  if (!user) return []
  
  // TODO: Implement proper tenant fetching when tenant system is ready
  // For now return empty array to prevent build errors
  return []
}

/**
 * Authorize user - redirect to login if not authenticated
 */
export async function authorize() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Authentication required')
  }
  return user
}