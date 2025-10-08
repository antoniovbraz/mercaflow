import { createClient } from './server'

// Role hierarchy levels (simplified for MercaFlow)
export const ROLE_LEVELS = {
  user: 1,
  admin: 2,
  super_admin: 3,
} as const

export type UserRole = keyof typeof ROLE_LEVELS

// All 64 permissions as defined in the spec
export const PERMISSIONS = {
  // Users (8 permissions)
  'users.create': 'Criar usuários',
  'users.read': 'Visualizar usuários',
  'users.update': 'Editar usuários',
  'users.delete': 'Deletar usuários',
  'users.list': 'Listar usuários',
  'users.invite': 'Convidar usuários',
  'users.roles.manage': 'Gerenciar roles',
  'users.permissions.view': 'Ver permissões',

  // Tenants (8 permissions)
  'tenants.create': 'Criar tenants',
  'tenants.read': 'Visualizar tenants',
  'tenants.update': 'Editar tenants',
  'tenants.delete': 'Deletar tenants',
  'tenants.list': 'Listar tenants',
  'tenants.settings': 'Configurar tenant',
  'tenants.billing': 'Gerenciar cobrança',
  'tenants.analytics': 'Ver analytics tenant',

  // ML Integration (16 permissions)
  'ml.auth.connect': 'Conectar conta ML',
  'ml.auth.disconnect': 'Desconectar conta ML',
  'ml.items.read': 'Visualizar produtos',
  'ml.items.create': 'Criar produtos',
  'ml.items.update': 'Editar produtos',
  'ml.items.delete': 'Deletar produtos',
  'ml.orders.read': 'Visualizar vendas',
  'ml.orders.manage': 'Gerenciar vendas',
  'ml.messages.read': 'Ver mensagens',
  'ml.messages.send': 'Enviar mensagens',
  'ml.analytics.basic': 'Analytics básico',
  'ml.analytics.advanced': 'Analytics avançado',
  'ml.webhooks.manage': 'Gerenciar webhooks',
  'ml.catalog.access': 'Acessar catálogo',
  'ml.pricing.suggestions': 'Sugestões preço',
  'ml.competition.analysis': 'Análise competitiva',

  // Dashboard & Reports (16 permissions)
  'dashboard.view': 'Visualizar dashboard',
  'dashboard.customize': 'Customizar dashboard',
  'reports.basic': 'Relatórios básicos',
  'reports.advanced': 'Relatórios avançados',
  'reports.export': 'Exportar relatórios',
  'reports.schedule': 'Agendar relatórios',
  'analytics.revenue': 'Analytics receita',
  'analytics.performance': 'Analytics performance',
  'analytics.customers': 'Analytics clientes',
  'analytics.products': 'Analytics produtos',
  'analytics.competition': 'Analytics competição',
  'analytics.forecasting': 'Previsões IA',
  'metrics.kpis': 'KPIs principais',
  'metrics.custom': 'Métricas customizadas',
  'alerts.create': 'Criar alertas',
  'alerts.manage': 'Gerenciar alertas',

  // System Admin (16 permissions)
  'system.logs.view': 'Ver logs sistema',
  'system.logs.export': 'Exportar logs',
  'system.health.monitor': 'Monitorar saúde',
  'system.settings.global': 'Configurações globais',
  'system.maintenance': 'Modo manutenção',
  'system.backup.create': 'Criar backups',
  'system.backup.restore': 'Restaurar backups',
  'system.integrations.manage': 'Gerenciar integrações',
  'system.webhooks.global': 'Webhooks globais',
  'system.api.limits': 'Limites API',
  'system.security.audit': 'Auditoria segurança',
  'system.performance.tune': 'Tuning performance',
  'system.database.admin': 'Admin database',
  'system.cache.manage': 'Gerenciar cache',
  'system.monitoring.alerts': 'Alertas monitoramento',
  'system.feature.flags': 'Feature flags',
} as const

export type Permission = keyof typeof PERMISSIONS

// Base permissions for each role (simplified)
const USER_PERMISSIONS: Permission[] = [
  'dashboard.view',
  'ml.items.read',
  'ml.orders.read',
  'ml.messages.read',
  'ml.analytics.basic',
  'reports.basic',
  'reports.export',
  'analytics.revenue',
  'analytics.performance',
  'alerts.create',
]

const ADMIN_PERMISSIONS: Permission[] = [
  ...USER_PERMISSIONS,
  'users.read',
  'users.list',
  'tenants.read',
  'tenants.settings',
  'ml.auth.connect',
  'ml.auth.disconnect',
  'ml.items.create',
  'ml.items.update',
  'ml.orders.manage',
  'ml.messages.send',
  'ml.analytics.advanced',
  'reports.advanced',
  'reports.schedule',
  'analytics.customers',
  'analytics.products',
  'analytics.competition',
  'analytics.forecasting',
  'metrics.kpis',
  'metrics.custom',
  'alerts.manage',
]

const SUPER_ADMIN_PERMISSIONS: Permission[] = [
  ...Object.keys(PERMISSIONS) as Permission[],
]

// Role-based permissions mapping
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  user: USER_PERMISSIONS,
  admin: ADMIN_PERMISSIONS,
  super_admin: SUPER_ADMIN_PERMISSIONS,
}

// Helper functions
export async function getUserRole(): Promise<UserRole | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null
  
  // USAR FUNÇÃO SEGURA PARA EVITAR RECURSÃO RLS
  try {
    const { data, error } = await supabase.rpc('get_current_user_role_safe')
    
    if (!error && data) {
      return data as UserRole
    }
  } catch {
    console.log('RPC function not available, using fallback')
  }
  
  // Fallback: Check JWT claims
  const roleFromClaims = user.app_metadata?.app_role as UserRole
  if (roleFromClaims && roleFromClaims in ROLE_LEVELS) {
    return roleFromClaims
  }
  
  // Último fallback: verificar por email (super admins)
  if (user.email === 'peepers.shop@gmail.com' || user.email === 'antoniovbraz@gmail.com') {
    return 'super_admin'
  }
  
  // Default fallback
  return 'user'
}

export async function hasRole(requiredRole: UserRole): Promise<boolean> {
  const userRole = await getUserRole()
  if (!userRole) return false
  
  return ROLE_LEVELS[userRole] >= ROLE_LEVELS[requiredRole]
}

export async function requireRole(requiredRole: UserRole) {
  const hasRequiredRole = await hasRole(requiredRole)
  if (!hasRequiredRole) {
    throw new Error(`Insufficient permissions. Required: ${requiredRole}`)
  }
  
  const profile = await getProfile()
  return profile
}

export async function hasPermission(permission: Permission): Promise<boolean> {
  const userRole = await getUserRole()
  if (!userRole) return false
  
  const userPermissions = ROLE_PERMISSIONS[userRole]
  return userPermissions.includes(permission)
}

export async function authorize(permission: Permission): Promise<boolean> {
  try {
    return await hasPermission(permission)
  } catch (error) {
    console.error('Authorization error:', error)
    return false
  }
}

export async function requirePermission(permission: Permission) {
  const hasRequiredPermission = await hasPermission(permission)
  if (!hasRequiredPermission) {
    throw new Error(`Insufficient permissions. Required: ${permission}`)
  }
  
  return true
}

// Get profile helper (moved here to avoid circular dependency)
async function getProfile(userId?: string) {
  const supabase = await createClient()
  const user = await supabase.auth.getUser()
  const targetUserId = userId || user.data.user?.id
  
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