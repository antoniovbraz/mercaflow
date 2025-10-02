// Configuração do cliente Supabase
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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
export interface User {
  id: string
  ml_user_id: number
  email?: string
  nickname: string
  access_token?: string
  token_expires_at?: string
  refresh_token?: string
  created_at: string
  updated_at: string
}

export interface WebhookLog {
  id: string
  user_id?: string
  topic: string
  resource: string
  application_id?: number
  payload: any
  processed: boolean
  created_at: string
}