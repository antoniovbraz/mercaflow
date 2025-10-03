# MercaFlow AI Coding Instructions

## Project Context
MercaFlow is a **world-class SaaS platform** for Mercado Livre integration, built with Next.js 14, TypeScript, and Supabase. The project targets the **Brazilian market** specifically and implements **enterprise-grade multi-tenancy** with sophisticated RBAC.

## Architecture Overview

### Core Stack
- **Frontend**: Next.js 14 App Router with TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, RLS policies)
- **Authentication**: Supabase SSR with custom JWT claims
- **Security**: Row Level Security (RLS) + Role-Based Access Control (RBAC)

### Key Directories
```
utils/supabase/          # All Supabase integrations (client, server, roles, middleware)
app/                     # Next.js 14 App Router pages and API routes
supabase/migrations/     # Database schema and RLS policies
docs/pt/                 # Portuguese documentation (Brazilian market focus)
```

## Critical Patterns & Workflows

### 1. Supabase Client Pattern
Always use appropriate client based on context:
- **Server Components**: `await createClient()` from `utils/supabase/server.ts`
- **Client Components**: `createClient()` from `utils/supabase/client.ts`
- **Middleware**: Uses `createServerClient` with cookie handling

### 2. Authentication & RBAC System
**Role hierarchy**: `super_admin` > `admin` > `user`

```typescript
// Check user role (hierarchical)
import { hasRole, requireRole } from '@/utils/supabase/roles'
const isAdmin = await hasRole('admin') // true for admin and super_admin
const profile = await requireRole('admin') // throws if insufficient role
```

**Critical**: All database operations must respect RLS policies. The system uses `profiles` table with embedded `role` field for SSR compatibility.

### 3. Database Migration Strategy
Migrations follow naming convention: `YYYYMMDDHHMMSS_descriptive_name.sql`
- Latest migrations implement **complete RBAC system** with granular permissions
- Always use RLS policies, never bypass with service role client
- Current system uses simplified 3-role model in `profiles.role` field

### 4. Multi-tenant Architecture
- Complete tenant isolation via RLS policies
- User data scoped by tenant_id in all tenant-specific tables
- Tenant management through admin interfaces

## Development Workflows

### Build & Run
```bash
npm install          # Install dependencies
npm run dev         # Development server (localhost:3000)
npm run build       # Production build
npm run type-check  # TypeScript validation
```

### Database Operations
```bash
supabase link --project-ref YOUR_PROJECT_REF  # Link to remote project
supabase db pull                              # Sync remote schema locally
supabase migration new migration_name         # Create new migration
supabase db push                              # Apply migrations to remote
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
- `/private/*` - Role-based access control
- API routes in `/app/api/*` use Supabase server client

### Utility Organization
- `utils/supabase/roles.ts` - RBAC helper functions
- `utils/supabase/server.ts` - Server-side client
- `utils/supabase/client.ts` - Client-side client
- `utils/supabase/middleware.ts` - Session refresh logic

## Security Considerations
- **Never use service role key** in frontend code
- **Always validate permissions** on server-side before data access
- **RLS policies** handle multi-tenant data isolation automatically
- **Custom JWT claims** provide role information for fine-grained access control

## Brazilian Market Specifics
- All user-facing content in **Portuguese (pt-BR)**
- Documentation in `docs/pt/` follows Brazilian conventions
- Email templates configured for Portuguese language
- Timezone and locale considerations for Brazilian users

## Code Style
- TypeScript strict mode enabled
- Tailwind for styling (no custom CSS modules)
- Server Components by default, Client Components only when needed
- Error handling with try/catch and proper user feedback

## Common Gotchas
- Middleware only refreshes sessions - **no redirects** (handled by Server Components)
- `await` required for server-side Supabase operations
- Role checks must use server-side functions, not client-side
- Database schema changes require migrations, not direct ALTER statements