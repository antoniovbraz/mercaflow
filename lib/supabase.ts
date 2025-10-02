// Configuração do cliente Supabase
import { createClient } from '@supabase/supabase-js'
import { createClientComponentClient, createServerComponentClient } from '@supabase/auth-helpers-nextjs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Cliente para uso geral
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
  }
})

// Cliente para componentes do lado do cliente
export const createSupabaseClient = () => createClientComponentClient()

// Cliente com service role para operações server-side
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Tipos para o banco de dados
export interface PlatformOwner {
  id: string
  email: string
  role: 'super_admin' | 'platform_admin'
  permissions: Record<string, any>
  personal_tenant_id?: string
  personal_tenant_enabled: boolean
  two_factor_enabled: boolean
  full_name?: string
  phone?: string
  avatar_url?: string
  created_at: string
  updated_at: string
  last_login?: string
}

export interface Tenant {
  id: string
  name: string
  slug: string
  plan: 'free' | 'starter' | 'professional' | 'enterprise'
  status: 'active' | 'suspended' | 'cancelled'
  billing_status: string
  billing_email?: string
  owner_user_id?: string
  created_by?: string
  is_platform_owner_tenant: boolean
  custom_domain?: string
  logo_url?: string
  primary_color: string
  settings: Record<string, any>
  ml_integration_enabled: boolean
  created_at: string
  updated_at: string
}

export interface TenantUser {
  id: string
  tenant_id: string
  user_id: string
  email: string
  role: 'customer_admin' | 'customer_user' | 'customer_viewer'
  permissions: Record<string, any>
  status: string
  invited_at?: string
  joined_at?: string
  last_active?: string
  created_at: string
  updated_at: string
}

export interface MLUser {
  id: string
  tenant_id: string
  ml_user_id: number
  ml_nickname?: string
  ml_email?: string
  access_token: string
  refresh_token?: string
  expires_in?: number
  token_expires_at?: string
  user_info: Record<string, any>
  status: string
  last_sync?: string
  sync_enabled: boolean
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  email: string
  created_at: string
  updated_at: string
}

export interface WebhookLog {
  id: string
  tenant_id?: string
  topic: string
  resource: string
  user_id?: number
  application_id: number
  attempts: number
  sent: string
  received: string
  processed_at?: string
  status: 'pending' | 'processed' | 'failed'
  payload: Record<string, any>
  created_at: string
}