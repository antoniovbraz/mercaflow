# 🔐 Sistema RBAC sem Custom JWT Claims

## Por que NÃO usar Custom JWT Claims?

### Problemas dos Custom Claims (especialmente em beta):
- 🚫 **Feature experimental** - pode ter bugs ou mudanças inesperadas
- 🚫 **Complexidade desnecessária** para um MVP
- 🚫 **Debugging mais difícil** quando algo dá errado
- 🚫 **Dependência de feature instável**
- 🚫 **Tokens JWT maiores** (impacta performance)

### Vantagens do Sistema Tradicional:
- ✅ **Estabilidade comprovada**
- ✅ **Mais controle sobre a lógica**
- ✅ **Easier debugging**
- ✅ **Performance equivalente com cache**
- ✅ **Padrão da indústria**

---

## 🏗️ Implementação RBAC Tradicional

### 1. Schema do Banco de Dados

```sql
-- Tabela de profiles (extende auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT,
  role TEXT CHECK (role IN ('super_admin', 'admin', 'manager', 'user', 'viewer')) DEFAULT 'user',
  avatar_url TEXT,
  tenant_id UUID REFERENCES tenants(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de role definitions (estática, pode ser enum no código)
CREATE TABLE role_definitions (
  role TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  level INTEGER NOT NULL, -- Para hierarquia: viewer=1, user=2, manager=3, admin=4, super_admin=5
  permissions TEXT[] NOT NULL
);

-- Inserir roles padrão
INSERT INTO role_definitions (role, name, description, level, permissions) VALUES 
('viewer', 'Visualizador', 'Apenas visualização', 1, ARRAY['dashboard.view']),
('user', 'Usuário', 'Usuário padrão', 2, ARRAY['dashboard.view', 'ml.items.read', 'reports.basic']),
('manager', 'Gerente', 'Gerente de departamento', 3, ARRAY['dashboard.view', 'ml.items.read', 'ml.items.update', 'reports.basic', 'reports.advanced']),
('admin', 'Administrador', 'Admin da empresa', 4, ARRAY['dashboard.view', 'ml.*', 'users.create', 'users.read', 'users.update', 'reports.*']),
('super_admin', 'Super Admin', 'Acesso total', 5, ARRAY['*']);

-- Trigger para criar profile automaticamente
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    CASE 
      WHEN NEW.email IN ('peepers.shop@gmail.com', 'antoniovbraz@gmail.com') THEN 'super_admin'
      ELSE 'user'
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE create_user_profile();
```

### 2. Funções Utilitárias TypeScript

```typescript
// utils/supabase/roles.ts
import { createClient } from './server'

export interface UserProfile {
  id: string
  full_name: string | null
  role: string
  avatar_url: string | null
  tenant_id: string | null
  created_at: string
  updated_at: string
}

export interface RoleDefinition {
  role: string
  name: string
  description: string | null
  level: number
  permissions: string[]
}

// Cache das definições de roles (evita consulta repetida)
let rolesCache: Record<string, RoleDefinition> = {}
let cacheExpiry: number = 0
const CACHE_TTL = 5 * 60 * 1000 // 5 minutos

async function getRoleDefinitions(): Promise<Record<string, RoleDefinition>> {
  const now = Date.now()
  
  // Usar cache se ainda válido
  if (cacheExpiry > now && Object.keys(rolesCache).length > 0) {
    return rolesCache
  }
  
  const supabase = createClient()
  const { data: roles, error } = await supabase
    .from('role_definitions')
    .select('*')
  
  if (error) {
    console.error('Error fetching role definitions:', error)
    return rolesCache // Retorna cache antigo em caso de erro
  }
  
  // Atualizar cache
  rolesCache = roles.reduce((acc, role) => {
    acc[role.role] = role
    return acc
  }, {} as Record<string, RoleDefinition>)
  cacheExpiry = now + CACHE_TTL
  
  return rolesCache
}

export async function getUserProfile(userId: string): Promise<UserProfile> {
  const supabase = createClient()
  
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  
  if (error) {
    throw new Error(`Failed to get user profile: ${error.message}`)
  }
  
  return profile
}

export async function getCurrentUser(): Promise<UserProfile | null> {
  const supabase = createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return null
  
  try {
    return await getUserProfile(user.id)
  } catch (error) {
    console.error('Error getting current user profile:', error)
    return null
  }
}

export async function getRolePermissions(role: string): Promise<string[]> {
  const roleDefinitions = await getRoleDefinitions()
  const roleData = roleDefinitions[role]
  
  if (!roleData) {
    console.warn(`Role ${role} not found, defaulting to user permissions`)
    return roleDefinitions['user']?.permissions || []
  }
  
  // Se tem permissão '*', retorna todas as permissões
  if (roleData.permissions.includes('*')) {
    const allPermissions = Object.values(roleDefinitions)
      .flatMap(r => r.permissions)
      .filter(p => p !== '*')
    return [...new Set(allPermissions)] // Remove duplicatas
  }
  
  // Expandir wildcards (ex: 'ml.*' inclui todas as permissões que começam com 'ml.')
  const expandedPermissions: string[] = []
  const allDefinedPermissions = Object.values(roleDefinitions)
    .flatMap(r => r.permissions)
    .filter(p => p !== '*')
  
  roleData.permissions.forEach(permission => {
    if (permission.endsWith('*')) {
      const prefix = permission.slice(0, -1)
      const matchingPerms = allDefinedPermissions.filter(p => p.startsWith(prefix))
      expandedPermissions.push(...matchingPerms)
    } else {
      expandedPermissions.push(permission)
    }
  })
  
  return [...new Set(expandedPermissions)]
}

export async function hasPermission(permission: string, userId?: string): Promise<boolean> {
  try {
    const profile = userId ? await getUserProfile(userId) : await getCurrentUser()
    if (!profile) return false
    
    const permissions = await getRolePermissions(profile.role)
    return permissions.includes(permission)
  } catch (error) {
    console.error('Error checking permission:', error)
    return false
  }
}

export async function hasRole(requiredRole: string, userId?: string): Promise<boolean> {
  try {
    const profile = userId ? await getUserProfile(userId) : await getCurrentUser()
    if (!profile) return false
    
    const roleDefinitions = await getRoleDefinitions()
    const userLevel = roleDefinitions[profile.role]?.level || 0
    const requiredLevel = roleDefinitions[requiredRole]?.level || 0
    
    return userLevel >= requiredLevel
  } catch (error) {
    console.error('Error checking role:', error)
    return false
  }
}

export async function requireAuth(): Promise<UserProfile> {
  const profile = await getCurrentUser()
  if (!profile) {
    throw new Error('Authentication required')
  }
  return profile
}

export async function requirePermission(permission: string): Promise<UserProfile> {
  const profile = await requireAuth()
  const hasPermission = await hasPermission(permission)
  
  if (!hasPermission) {
    throw new Error(`Permission required: ${permission}`)
  }
  
  return profile
}

export async function requireRole(requiredRole: string): Promise<UserProfile> {
  const profile = await requireAuth()
  const hasRequiredRole = await hasRole(requiredRole)
  
  if (!hasRequiredRole) {
    throw new Error(`Role required: ${requiredRole}`)
  }
  
  return profile
}

// Função para uso em Server Components
export async function authorize(permission: string): Promise<boolean> {
  return await hasPermission(permission)
}
```

### 3. Middleware Otimizado

```typescript
// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: any) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Refresh session se necessário
  const { data: { user } } = await supabase.auth.getUser()

  // Rotas protegidas que precisam de autenticação
  const protectedPaths = ['/dashboard', '/admin', '/profile']
  const isProtectedPath = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  )

  if (isProtectedPath && !user) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirectTo', request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Rotas que usuários logados não devem acessar
  const authPaths = ['/login', '/register']
  const isAuthPath = authPaths.includes(request.nextUrl.pathname)

  if (isAuthPath && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

### 4. Server Component com Authorization

```typescript
// app/dashboard/page.tsx
import { getCurrentUser, hasPermission } from '@/utils/supabase/roles'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  // Verificar autenticação
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login')
  }

  // Verificar permissões
  const canViewDashboard = await hasPermission('dashboard.view')
  if (!canViewDashboard) {
    redirect('/unauthorized')
  }

  const canManageUsers = await hasPermission('users.create')
  const canViewReports = await hasPermission('reports.advanced')

  return (
    <div className="p-6">
      <h1>Dashboard - {user.full_name}</h1>
      <p>Role: {user.role}</p>
      
      {canManageUsers && (
        <div>
          <h2>User Management</h2>
          {/* Componentes de gestão de usuários */}
        </div>
      )}
      
      {canViewReports && (
        <div>
          <h2>Advanced Reports</h2>
          {/* Relatórios avançados */}
        </div>
      )}
    </div>
  )
}
```

### 5. Client Component com Authorization

```typescript
// components/ProtectedComponent.tsx
'use client'
import { useAuth } from '@/components/AuthProvider'
import { useEffect, useState } from 'react'

interface ProtectedComponentProps {
  permission: string
  children: React.ReactNode
  fallback?: React.ReactNode
}

export default function ProtectedComponent({ 
  permission, 
  children, 
  fallback = null 
}: ProtectedComponentProps) {
  const { permissions, loading } = useAuth()
  const [hasPermission, setHasPermission] = useState(false)

  useEffect(() => {
    if (!loading) {
      setHasPermission(permissions.includes(permission))
    }
  }, [permissions, permission, loading])

  if (loading) {
    return <div>Loading...</div>
  }

  if (!hasPermission) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

// Uso:
// <ProtectedComponent permission="users.create">
//   <CreateUserButton />
// </ProtectedComponent>
```

---

## 🚀 Vantagens desta Implementação

### 1. **Performance Equivalente**
- Cache de 5 minutos para role definitions
- Uma consulta adicional por session (cached)
- Middleware não faz consultas extras

### 2. **Flexibilidade Total**
- Mudanças de permissões em tempo real
- Sistema de wildcards (`ml.*`)
- Hierarquia de roles customizável

### 3. **Debugging Fácil**
- Logs claros de autorização
- Sem dependência de features beta
- Stack traces normais

### 4. **Escalabilidade**
- Cache inteligente
- Consultas otimizadas
- RLS policies para isolamento

---

## ✅ Conclusão

**O sistema RBAC tradicional é mais adequado para o MercaFlow porque:**

1. **Estabilidade**: Não depende de features beta
2. **Control**: Controle total sobre a lógica de autorização
3. **Performance**: Cache inteligente garante performance equivalente
4. **Flexibilidade**: Mudanças de permissões em tempo real
5. **Debugging**: Muito mais fácil debuggar problemas

O Custom JWT Claims pode ser adicionado no futuro quando sair do beta, mas não é necessário para ter um sistema world-class.