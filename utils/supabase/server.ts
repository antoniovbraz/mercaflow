import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function createClient() {
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

// Helper functions for authentication
export async function getCurrentUser() {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      // Don't log auth session missing errors as they're expected
      if (error.message !== 'Auth session missing!') {
        console.error('Error getting user:', error)
      }
      return null
    }
    
    return user
  } catch (_error) {
    // Silently handle auth errors for unauthenticated requests
    return null
  }
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login')
  }
  return user
}

export async function getProfile(userId?: string) {
  const supabase = await createClient()
  const targetUserId = userId || (await getCurrentUser())?.id
  
  if (!targetUserId) return null
  
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', targetUserId)
    .single()
  
  if (error) {
    console.error('Error getting profile:', error)
    return null
  }
  
  return profile
}

export async function requireProfile() {
  const profile = await getProfile()
  if (!profile) {
    redirect('/onboarding')
  }
  return profile
}

export async function createServiceClient() {
  const { createClient } = await import('@supabase/supabase-js')
  
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!serviceRoleKey) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is required for createServiceClient(). ' +
      'This function bypasses RLS and should only be used for server-side operations ' +
      'like webhook processing. For user-authenticated requests, use createClient() instead.'
    )
  }
  
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}