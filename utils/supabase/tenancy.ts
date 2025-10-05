import { createClient } from './server'

/**
 * Get the current user's tenant ID
 * This function ensures proper tenant isolation for all operations
 */
export async function getCurrentTenantId(): Promise<string | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single()

  return profile?.tenant_id || null
}

/**
 * Ensure user has access to a specific tenant
 * This is used for additional security checks
 */
export async function validateTenantAccess(tenantId: string): Promise<boolean> {
  const currentTenantId = await getCurrentTenantId()
  return currentTenantId === tenantId
}

/**
 * Get tenant information for the current user
 */
export async function getCurrentTenant() {
  const supabase = await createClient()
  const tenantId = await getCurrentTenantId()

  if (!tenantId) return null

  const { data: tenant } = await supabase
    .from('tenants')
    .select('*')
    .eq('id', tenantId)
    .single()

  return tenant
}

/**
 * Check if current user is tenant owner
 */
export async function isTenantOwner(): Promise<boolean> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return false

  const tenant = await getCurrentTenant()
  return tenant?.owner_id === user.id
}

/**
 * Get all users in the current tenant
 */
export async function getTenantUsers() {
  const supabase = await createClient()
  const tenantId = await getCurrentTenantId()

  if (!tenantId) return []

  const { data: users } = await supabase
    .from('profiles')
    .select('*')
    .eq('tenant_id', tenantId)

  return users || []
}

/**
 * Create a new tenant (only for super admins)
 */
export async function createTenant(name: string, slug: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('User not authenticated')

  // Check if user is super admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'super_admin') {
    throw new Error('Only super admins can create tenants')
  }

  const { data: tenant, error } = await supabase
    .from('tenants')
    .insert({
      name,
      slug,
      owner_id: user.id,
    })
    .select()
    .single()

  if (error) throw error
  return tenant
}

/**
 * Update tenant settings
 */
export async function updateTenantSettings(settings: Record<string, unknown>) {
  const supabase = await createClient()
  const tenantId = await getCurrentTenantId()

  if (!tenantId) throw new Error('No tenant found')

  // Check if user can update tenant
  const isOwner = await isTenantOwner()
  if (!isOwner) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', (await supabase.auth.getUser()).data.user?.id)
      .single()

    if (profile?.role !== 'admin' && profile?.role !== 'super_admin') {
      throw new Error('Insufficient permissions to update tenant')
    }
  }

  const { data: tenant, error } = await supabase
    .from('tenants')
    .update({
      settings,
      updated_at: new Date().toISOString(),
    })
    .eq('id', tenantId)
    .select()
    .single()

  if (error) throw error
  return tenant
}