/**
 * Configurações centralizadas do MercaFlow
 * Este arquivo centraliza todas as URLs e configurações importantes
 */

export const config = {
  // URLs base
  site: {
    url: process.env.NEXT_PUBLIC_SITE_URL || 
          (process.env.NODE_ENV === 'production' 
            ? 'https://mercaflow.vercel.app' 
            : 'http://localhost:3000'),
    name: 'MercaFlow',
    description: 'Plataforma de Intelligence Comercial para Mercado Livre Brasil'
  },

  // Rotas de autenticação
  auth: {
    callback: '/auth/callback',
    logout: '/auth/logout', 
    login: '/login',
    register: '/register',
    resend: '/auth/resend'
  },

  // Rotas protegidas
  protected: {
    dashboard: '/dashboard',
    private: '/private',
    admin: '/admin'
  },

  // Configurações do Supabase
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY
  },

  // Configurações do Mercado Livre
  mercadoLibre: {
    clientId: process.env.ML_CLIENT_ID,
    clientSecret: process.env.ML_CLIENT_SECRET,
    redirectUri: process.env.ML_REDIRECT_URI,
    baseUrl: 'https://api.mercadolibre.com'
  }
} as const

// Helper functions
export const getAuthRedirectUrl = () => `${config.site.url}${config.auth.callback}`
export const getLogoutUrl = () => `${config.site.url}${config.auth.logout}`
export const getDashboardUrl = () => `${config.site.url}${config.protected.dashboard}`

// Validar configurações essenciais
export const validateConfig = () => {
  const missing = []
  
  if (!config.supabase.url) missing.push('NEXT_PUBLIC_SUPABASE_URL')
  if (!config.supabase.anonKey) missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY')
  
  if (missing.length > 0) {
    throw new Error(`Configurações obrigatórias faltando: ${missing.join(', ')}`)
  }
  
  return true
}