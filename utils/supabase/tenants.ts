import { createClient } from './server'

// Tipos para o sistema multi-tenant
export interface Tenant {
  id: string
  name: string
  slug: string
  status: 'active' | 'inactive' | 'suspended'
  settings: Record<string, any>
  created_at: string
  updated_at: string
}

export interface TenantUser {
  id: string
  tenant_id: string
  user_id: string
  role: 'user' | 'admin' | 'owner'
  status: 'active' | 'inactive' | 'pending'
  created_at: string
  updated_at: string
}

export interface TenantWithRole extends Tenant {
  user_role: 'user' | 'admin' | 'owner'
  user_status: 'active' | 'inactive' | 'pending'
}

/**
 * Obter todos os tenants do usuário atual
 */
export async function getUserTenants(): Promise<TenantWithRole[]> {
  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    return []
  }

  const { data, error } = await supabase
    .from('tenant_users')
    .select(`
      role,
      status,
      tenants:tenant_id (
        id,
        name,
        slug,
        status,
        settings,
        created_at,
        updated_at
      )
    `)
    .eq('user_id', user.id)
    .eq('status', 'active')

  if (error) {
    console.error('Error fetching user tenants:', error)
    return []
  }

  return (data || [])
    .filter(item => item.tenants)
    .map(item => ({
      ...(item.tenants as unknown as Tenant),
      user_role: item.role,
      user_status: item.status
    } as TenantWithRole))
}

/**
 * Obter tenant específico por slug
 */
export async function getTenantBySlug(slug: string): Promise<Tenant | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('tenants')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'active')
    .single()

  if (error) {
    console.error('Error fetching tenant by slug:', error)
    return null
  }

  return data as Tenant
}

/**
 * Verificar se usuário é owner de um tenant
 */
export async function isUserTenantOwner(tenantId: string): Promise<boolean> {
  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    return false
  }

  const { data, error } = await supabase
    .from('tenant_users')
    .select('role')
    .eq('tenant_id', tenantId)
    .eq('user_id', user.id)
    .eq('role', 'owner')
    .eq('status', 'active')
    .single()

  return !error && !!data
}

/**
 * Obter usuários de um tenant (apenas para owners e admins)
 */
export async function getTenantUsers(tenantId: string): Promise<TenantUser[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('tenant_users')
    .select(`
      *,
      profiles:user_id (
        id,
        email,
        full_name,
        avatar_url
      )
    `)
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching tenant users:', error)
    return []
  }

  return data || []
}

/**
 * Convidar usuário para tenant
 */
export async function inviteUserToTenant(tenantId: string, email: string, role: 'user' | 'admin' = 'user'): Promise<boolean> {
  const supabase = await createClient()
  
  // Verificar se usuário já existe
  const { data: existingUser } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .single()

  if (!existingUser) {
    console.error('User not found with email:', email)
    return false
  }

  // Verificar se já está no tenant
  const { data: existingAssociation } = await supabase
    .from('tenant_users')
    .select('id')
    .eq('tenant_id', tenantId)
    .eq('user_id', existingUser.id)
    .single()

  if (existingAssociation) {
    console.error('User already associated with tenant')
    return false
  }

  // Criar associação
  const { error } = await supabase
    .from('tenant_users')
    .insert({
      tenant_id: tenantId,
      user_id: existingUser.id,
      role,
      status: 'pending'
    })

  if (error) {
    console.error('Error inviting user to tenant:', error)
    return false
  }

  return true
}

/**
 * Criar novo tenant (apenas para super_admins)
 */
export async function createTenant(name: string, slug: string): Promise<Tenant | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('tenants')
    .insert({
      name,
      slug,
      status: 'active'
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating tenant:', error)
    return null
  }

  return data as Tenant
}

/**
 * Obter tenant padrão do usuário (primeiro tenant onde é owner)
 */
export async function getUserDefaultTenant(): Promise<TenantWithRole | null> {
  const tenants = await getUserTenants()
  
  // Priorizar tenant onde é owner
  const ownedTenant = tenants.find(t => t.user_role === 'owner')
  if (ownedTenant) return ownedTenant
  
  // Senão, retornar primeiro tenant disponível
  return tenants[0] || null
}