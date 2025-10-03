# 🔐 Sistema RBAC MercaFlow - Guia de Configuração

## 📋 Visão Geral

Sistema completo de Role-Based Access Control (RBAC) implementado seguindo as melhores práticas da documentação oficial do Supabase.

## 🚀 Configuração Passo a Passo

### 1. Executar Migration SQL

1. Acesse o [SQL Editor](https://supabase.com/dashboard/project/_/sql) do seu projeto Supabase
2. Execute o script `supabase/migrations/20241002_rbac_system.sql`
3. Isso criará:
   - Types: `app_role` e `app_permission`
   - Tables: `user_roles` e `role_permissions`
   - Functions: `custom_access_token_hook`, `authorize`, helpers
   - RLS Policies: Segurança de acesso
   - Permissions: Para Auth Hook

### 2. Configurar Auth Hook

1. Vá para [Authentication > Hooks (Beta)](https://supabase.com/dashboard/project/_/auth/hooks)
2. Selecione **Custom Access Token**
3. Escolha a função: `public.custom_access_token_hook`
4. Salve a configuração

### 3. Definir Primeiro Super Admin

Execute no SQL Editor (substitua pelo seu email):

```sql
SELECT public.promote_to_super_admin('seu@email.com');
```

## 🏗️ Estrutura do Sistema

### Roles Disponíveis

| Role | Descrição | Permissões |
|------|-----------|------------|
| `user` | Usuário comum | `users.read`, `tenants.read` |
| `admin` | Admin de tenant | `users.*`, `tenants.read/write` |
| `super_admin` | Proprietário da plataforma | Todas as permissões |

### Permissions Disponíveis

```typescript
type AppPermission = 
  | 'users.read'           // Ler usuários
  | 'users.write'          // Criar/editar usuários  
  | 'users.delete'         // Deletar usuários
  | 'tenants.read'         // Ler tenants
  | 'tenants.write'        // Criar/editar tenants
  | 'tenants.delete'       // Deletar tenants
  | 'platform.admin'       // Admin da plataforma
  | 'platform.super_admin' // Super admin da plataforma
```

## 💻 Como Usar no Código

### Server-Side (Server Components/Actions)

```typescript
import { 
  getCurrentUser, 
  getCurrentUserRole,
  isSuperAdmin,
  isAdmin,
  hasPermission,
  authorize,
  authorizeSuperAdmin,
  authorizeAdmin
} from '@/utils/supabase/auth-helpers'

// Verificar role atual
const role = await getCurrentUserRole() // 'user' | 'admin' | 'super_admin'

// Verificar se é super admin
const isSuperAdminUser = await isSuperAdmin() // boolean

// Verificar permissão específica
const canDeleteUsers = await hasPermission('users.delete') // boolean

// Autorizar e redirecionar se necessário
const user = await authorize() // Redireciona para /login se não logado
const superAdmin = await authorizeSuperAdmin() // Redireciona se não for super admin
const admin = await authorizeAdmin() // Redireciona se não for admin
```

### Client-Side (Client Components)

```typescript
'use client'
import { createClient } from '@/utils/supabase/client'
import { jwtDecode } from 'jwt-decode'
import { useEffect, useState } from 'react'

function useUserRole() {
  const [role, setRole] = useState<'user' | 'admin' | 'super_admin'>('user')
  const supabase = createClient()

  useEffect(() => {
    const getRole = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.access_token) {
        const jwt = jwtDecode<any>(session.access_token)
        setRole(jwt.user_role || 'user')
      }
    }

    getRole()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.access_token) {
          const jwt = jwtDecode<any>(session.access_token)
          setRole(jwt.user_role || 'user')
        } else {
          setRole('user')
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return role
}

// Usar no componente
function MyComponent() {
  const role = useUserRole()
  
  return (
    <div>
      {role === 'super_admin' && <SuperAdminPanel />}
      {role === 'admin' && <AdminPanel />}
      <UserPanel />
    </div>
  )
}
```

### RLS Policies (Banco de Dados)

```sql
-- Exemplo: Apenas super admins podem deletar tenants
CREATE POLICY "Super admins can delete tenants" ON public.tenants
FOR DELETE TO authenticated
USING (
  (SELECT authorize('platform.super_admin'))
);

-- Exemplo: Admins podem ver tenants que gerenciam
CREATE POLICY "Admins can view managed tenants" ON public.tenants
FOR SELECT TO authenticated
USING (
  (SELECT authorize('tenants.read')) AND
  (SELECT current_user_role()) IN ('admin', 'super_admin')
);
```

## 🔧 Funções Úteis

### Verificação de Role

```typescript
// Server-side
const isSuperAdminUser = await isSuperAdmin()
const isAdminUser = await isAdmin()
const currentRole = await getCurrentUserRole()

// Client-side
const role = useUserRole() // custom hook
```

### Verificação de Permissões

```typescript
// Verificar permissão específica
const canDeleteUsers = await hasPermission('users.delete')

// Verificar no banco via RLS
const { data } = await supabase.rpc('authorize', {
  requested_permission: 'users.delete'
})
```

### Autorização com Redirect

```typescript
// Em Server Components/Actions
export default async function AdminPage() {
  await authorizeAdmin() // Redireciona se não for admin
  
  return <AdminDashboard />
}
```

## 🛠️ Gerenciamento de Usuários

### Promover Usuário

```sql
-- SQL direto
SELECT public.promote_to_super_admin('usuario@email.com');
```

```typescript
// Via função helper
const success = await promoteToSuperAdmin('usuario@email.com')
```

### Adicionar Role Manualmente

```sql
-- Inserir role para usuário específico
INSERT INTO public.user_roles (user_id, role) VALUES 
('user-uuid-here', 'admin');
```

### Remover Role

```sql
-- Remover role específico
DELETE FROM public.user_roles 
WHERE user_id = 'user-uuid-here' AND role = 'admin';
```

## 🔍 Debug e Monitoramento

### Verificar Roles de Usuário

```sql
-- Ver todos os usuários e seus roles
SELECT 
  u.email,
  ur.role,
  ur.created_at
FROM auth.users u
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
ORDER BY u.email;
```

### Verificar Permissões

```sql
-- Ver todas as permissões por role
SELECT role, permission 
FROM public.role_permissions 
ORDER BY role, permission;
```

### Testar Auth Hook

```sql
-- Verificar se JWT contém user_role
SELECT auth.jwt();
```

## ⚠️ Segurança e Melhores Práticas

### 1. Princípio do Menor Privilégio
- Usuários começam como `user` por padrão
- Promova apenas quando necessário
- Revise roles periodicamente

### 2. Auditorias
- Monitore mudanças de roles
- Log acessos administrativos
- Revise permissões regularmente

### 3. Backup de Segurança
- Sempre tenha pelo menos 2 super admins
- Documente quem tem acesso administrativo
- Mantenha emails de recuperação atualizados

### 4. Testing
```typescript
// Sempre teste as permissões
describe('RBAC System', () => {
  test('user cannot access admin features', async () => {
    // Test user permissions
  })
  
  test('super admin has all permissions', async () => {
    // Test super admin permissions
  })
})
```

## 🎯 Checklist de Configuração

- [ ] Migration SQL executada
- [ ] Auth Hook configurado no dashboard
- [ ] Primeiro super admin definido
- [ ] Permissions testadas
- [ ] RLS policies aplicadas
- [ ] Client-side hooks implementados
- [ ] Error handling implementado
- [ ] Documentação da equipe atualizada

## 📚 Referências

- [Supabase Custom Claims & RBAC](https://supabase.com/docs/guides/database/postgres/custom-claims-and-role-based-access-control-rbac)
- [Auth Hooks](https://supabase.com/docs/guides/auth/auth-hooks)
- [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [JWT Decode](https://www.npmjs.com/package/jwt-decode)

---

**Status**: ✅ Sistema RBAC completo implementado
**Atualização**: Outubro 2025  
**Responsável**: Antonio Braz