# MercaFlow AI Coding Instructions

## Project Context
MercaFlow is a **world-class SaaS platform** for Mercado Livre integration, built with Next.js 15, TypeScript, and Supabase. The project targets the **Brazilian market** specifically and implements **enterprise-grade multi-tenancy** with sophisticated RBAC.

## Architecture Overview

### Core Stack
- **Frontend**: Next.js 15 App Router with TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, RLS policies, Edge Functions)
- **Authentication**: Supabase SSR with custom JWT claims and hierarchical RBAC
- **Security**: Row Level Security (RLS) + Role-Based Access Control (RBAC) with 64 granular permissions
- **Integration**: Mercado Livre REST API with OAuth 2.0, webhooks, and real-time sync

### Key Directories
```
utils/supabase/          # All Supabase integrations (client, server, roles, middleware, tenancy)
app/                     # Next.js 15 App Router pages and API routes
supabase/migrations/     # Database schema and RLS policies (YYYYMMDDHHMMSS naming)
components/              # Reusable components with shadcn/ui
docs/pt/                 # Portuguese documentation (Brazilian market focus)
```

## Critical Patterns & Workflows

### 1. Supabase Client Pattern
Always use appropriate client based on context:
- **Server Components**: `await createClient()` from `utils/supabase/server.ts`
- **Client Components**: `createClient()` from `utils/supabase/client.ts`
- **Middleware**: Uses `createServerClient` with cookie handling
- **API Routes**: Server client for database operations

### 2. Authentication & RBAC System
**Role hierarchy**: `super_admin` > `admin` > `user`

```typescript
// Check user role (hierarchical)
import { hasRole, requireRole } from '@/utils/supabase/roles'
const isAdmin = await hasRole('admin') // true for admin and super_admin
const profile = await requireRole('admin') // throws if insufficient role

// Get current tenant for multi-tenant operations
import { getCurrentTenantId, validateTenantAccess } from '@/utils/supabase/tenancy'
const tenantId = await getCurrentTenantId()
const hasAccess = await validateTenantAccess(targetTenantId)
```

**Critical**: All database operations must respect RLS policies. The system uses `profiles` table with embedded `role` field for SSR compatibility.

### 3. Multi-tenant Architecture
Complete tenant isolation via RLS policies:
- User data scoped by `tenant_id` in all tenant-specific tables
- Automatic tenant validation in `utils/supabase/tenancy.ts`
- Tenant management through admin interfaces

### 4. Mercado Livre Integration
OAuth 2.0 flow with automatic token refresh:
```typescript
// ML API calls require tenant context and proper error handling
const mlResponse = await fetch(`https://api.mercadolibre.com/users/${userId}/items`, {
  headers: { 'Authorization': `Bearer ${accessToken}` }
})
```

**API Patterns**:
- Use `/my/received_questions/search?api_version=4` for questions
- Handle rate limiting and token refresh automatically
- Webhook endpoints in `/app/api/ml/webhooks/`

### 5. Database Migration Strategy
Migrations follow strict naming convention: `YYYYMMDDHHMMSS_descriptive_name.sql`
- Latest migrations implement complete RBAC with granular permissions
- Always use RLS policies, never bypass with service role client
- Current system uses hierarchical role model in `profiles.role` field

## Development Workflows

### Build & Run
```bash
npm install          # Install dependencies
npm run dev         # Development server (localhost:3000)
npm run dev:turbo   # Turbo mode for faster development
npm run build       # Production build
npm run type-check  # TypeScript validation (strict mode)
npm run lint        # ESLint validation
```

### Database Operations
```bash
npx supabase link --project-ref YOUR_PROJECT_REF  # Link to remote project
npx supabase db pull                              # Sync remote schema locally
npx supabase migration new migration_name         # Create new migration
npx supabase db push                              # Apply migrations to remote
```

### Authentication Flow
1. **Sign up**: User registers → email confirmation required → profile created automatically
2. **Sign in**: Credentials validated → session created → role-based dashboard access
3. **Role management**: Super admins can promote users via `/dashboard` interface

## File Structure Conventions

### Authentication Routes
- `/login`, `/register` - Public auth pages
- `/auth/callback` - OAuth/email confirmation handler
- `/auth/logout` - Sign out endpoint

### Protected Routes
- `/dashboard/*` - Requires authentication
- `/admin/*` - Super admin only access
- `/ml/*` - Mercado Livre integration pages
- API routes in `/app/api/*` use Supabase server client

### Utility Organization
- `utils/supabase/roles.ts` - RBAC helper functions (64 permissions system)
- `utils/supabase/server.ts` - Server-side client with cookie handling
- `utils/supabase/client.ts` - Client-side client for components
- `utils/supabase/middleware.ts` - Session refresh logic
- `utils/supabase/tenancy.ts` - Multi-tenant helper functions

## Security Considerations
- **Never use service role key** in frontend code
- **Always validate permissions** on server-side before data access
- **RLS policies** handle multi-tenant data isolation automatically
- **Custom JWT claims** provide role information for fine-grained access control
- **Tenant validation** required for all cross-tenant operations

## Brazilian Market Specifics
- All user-facing content in **Portuguese (pt-BR)**
- Documentation in `docs/pt/` follows Brazilian conventions
- Email templates configured for Portuguese language
- Timezone and locale considerations for Brazilian users
- Mercado Livre API integration with Brazilian marketplace specifics

## Code Style & Patterns
- TypeScript strict mode enabled
- Tailwind for styling (no custom CSS modules)
- Server Components by default, Client Components only when needed
- Error handling with try/catch and proper user feedback
- Component library: shadcn/ui with Radix UI primitives

## Common Gotchas
- Middleware only refreshes sessions - **no redirects** (handled by Server Components)
- `await` required for server-side Supabase operations
- Role checks must use server-side functions, not client-side
- Database schema changes require migrations, not direct ALTER statements
- Always validate tenant access for multi-tenant operations
- ML API calls require proper error handling for rate limits and token refresh