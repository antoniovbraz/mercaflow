import { createClient } from './server'

// Role hierarchy levels
export const ROLE_LEVELS = {
  viewer: 1,
  user: 2,
  manager: 3,
  admin: 4,
  super_admin: 5,
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

// Base permissions for each role
const VIEWER_PERMISSIONS: Permission[] = [
  'dashboard.view',
  'ml.items.read',
  'ml.orders.read',
  'ml.messages.read',
  'ml.analytics.basic',
  'reports.basic',
]

const USER_PERMISSIONS: Permission[] = [
  ...VIEWER_PERMISSIONS,
  'ml.auth.connect',
  'ml.auth.disconnect',
  'ml.items.create',
  'ml.items.update',
  'ml.messages.send',
  'ml.catalog.access',
  'ml.pricing.suggestions',
  'dashboard.customize',
  'analytics.revenue',
  'analytics.performance',
  'analytics.products',
  'metrics.kpis',
  'alerts.create',
]

const MANAGER_PERMISSIONS: Permission[] = [
  ...USER_PERMISSIONS,
  'ml.items.delete',
  'ml.orders.manage',
  'ml.analytics.advanced',
  'ml.webhooks.manage',
  'ml.competition.analysis',
  'reports.advanced',
  'reports.export',
  'reports.schedule',
  'analytics.customers',
  'analytics.competition',
  'analytics.forecasting',
  'metrics.custom',
  'alerts.manage',
]

const ADMIN_PERMISSIONS: Permission[] = [
  ...MANAGER_PERMISSIONS,
  'users.create',
  'users.read',
  'users.update',
  'users.list',
  'users.invite',
  'users.permissions.view',
  'tenants.read',
  'tenants.update',
  'tenants.settings',
  'tenants.billing',
  'tenants.analytics',
]

const SUPER_ADMIN_PERMISSIONS: Permission[] = [
  ...Object.keys(PERMISSIONS) as Permission[],
]

// Role-based permissions mapping
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  viewer: VIEWER_PERMISSIONS,
  user: USER_PERMISSIONS,
  manager: MANAGER_PERMISSIONS,
  admin: ADMIN_PERMISSIONS,
  super_admin: SUPER_ADMIN_PERMISSIONS,
}

// Helper functions
export async function getUserRole(): Promise<UserRole | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null
  
  // Check custom JWT claims first
  const roleFromClaims = user.app_metadata?.app_role as UserRole
  if (roleFromClaims && roleFromClaims in ROLE_LEVELS) {
    return roleFromClaims
  }
  
  // Fallback to profile table
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  
  return profile?.role as UserRole || 'user'
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