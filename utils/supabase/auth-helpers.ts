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
 * Get user session information
 * Note: Only use this for display purposes, never for security
 */
export async function getUserSession() {
  const supabase = await createClient()
  const { data: { session }, error } = await supabase.auth.getSession()
  
  if (error) {
    console.error('Error getting session:', error)
    return null
  }
  
  return session
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