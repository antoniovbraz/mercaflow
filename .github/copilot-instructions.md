# MercaFlow AI Coding Instructions

## Project Context

MercaFlow is a **world-class SaaS platform** for Mercado Livre integration, built with Next.js 15, TypeScript, and Supabase. The project targets the **Brazilian market** specifically and implements **enterprise-grade multi-tenancy** with sophisticated RBAC.

**Developer Environment**: This project is primarily developed on Windows with PowerShell. All shell scripts (`.sh` files) may need conversion or execution via WSL/Git Bash.

## Architecture Overview

### Core Stack

- **Frontend**: Next.js 15.5.4 App Router with TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, RLS policies)
- **Authentication**: Supabase SSR with profile-based hierarchical RBAC (NO custom JWT claims)
- **Security**: Row Level Security (RLS) + Role-Based Access Control (RBAC) with 64 granular permissions
- **Integration**: Mercado Livre REST API with OAuth 2.0 + PKCE, webhooks, real-time sync
- **Caching**: Upstash Redis for performance optimization (optional but recommended)
- **Monitoring**: Sentry for error tracking and performance monitoring

### Key Directories

```
utils/supabase/          # All Supabase integrations (client, server, roles, middleware, tenancy)
app/                     # Next.js 15 App Router pages and API routes
supabase/migrations/     # Database schema and RLS policies (YYYYMMDDHHMMSS naming)
components/              # Reusable components with shadcn/ui
docs/pt/                 # Portuguese documentation (Brazilian market focus)
utils/mercadolivre/      # ML token management and API integrations
utils/validation/        # Zod schemas for type-safe API validation
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

**Architecture**: Profile-based RBAC using `profiles.role` field (NOT JWT claims). This enables SSR compatibility and avoids complex JWT refresh logic.

```typescript
// Check user role (hierarchical - server-side only)
import { hasRole, requireRole, getCurrentUser } from "@/utils/supabase/roles";
const isAdmin = await hasRole("admin"); // true for admin and super_admin
const profile = await requireRole("admin"); // throws if insufficient role
const user = await getCurrentUser(); // returns null if not authenticated

// Get current tenant for multi-tenant operations
import {
  getCurrentTenantId,
  validateTenantAccess,
} from "@/utils/supabase/tenancy";
const tenantId = await getCurrentTenantId();
const hasAccess = await validateTenantAccess(targetTenantId);
```

**Critical Patterns**:

- All database operations MUST respect RLS policies
- NEVER use service role client except for webhooks/system operations
- Role checks are ALWAYS server-side (never trust client-side role data)
- Middleware handles session refresh but NOT authorization (use Server Components for auth checks)

### 3. Multi-tenant Architecture

Complete tenant isolation via RLS policies:

- User data scoped by `tenant_id` in all tenant-specific tables
- Automatic tenant validation in `utils/supabase/tenancy.ts`
- Tenant management through admin interfaces

### 4. Mercado Livre Integration

OAuth 2.0 with PKCE flow and automatic token refresh via `MLTokenManager`:

```typescript
// Get valid access token (auto-refreshes if expired)
import { MLTokenManager } from "@/utils/mercadolivre/token-manager";
const tokenManager = new MLTokenManager();
const accessToken = await tokenManager.getValidToken(integrationId);

// ML API calls require tenant context and proper error handling
const mlResponse = await fetch(
  `https://api.mercadolibre.com/users/${userId}/items`,
  {
    headers: { Authorization: `Bearer ${accessToken}` },
  }
);

// Validate ML API responses with Zod
import { validateOutput, MLItemSchema } from "@/utils/validation";
const validatedItem = validateOutput(MLItemSchema, mlResponse);
```

**Critical ML API Patterns**:

- Use `/my/received_questions/search?api_version=4` for questions API
- Token storage: AES-256-GCM encryption in database (ENCRYPTION_KEY env var required)
- Webhook endpoints: `/app/api/ml/webhooks/` with async processing
- Rate limiting: Automatic 429 handling with exponential backoff
- `.maybeSingle()` vs `.single()`: Use `.maybeSingle()` to allow 0 or 1 results (avoids 406 errors)

### 5. Database Migration Strategy

**Strict naming convention**: `YYYYMMDDHHMMSS_descriptive_name.sql` (timestamp-based ordering)

```bash
# Create new migration
npx supabase migration new add_feature_name

# Apply to remote
npx supabase db push

# Pull remote changes
npx supabase db pull
```

**Migration Guidelines**:

- Latest migrations (20251011+) implement complete RBAC with 64 permissions
- Always use RLS policies with `security_invoker = true` (fixes recursion issues)
- NEVER bypass RLS with service role client in user-facing operations
- Profile-based roles stored in `profiles.role` field (not JWT claims)
- Webhook tables require special RLS policies allowing service role inserts

### 6. Validation & Type Safety

All external API inputs use Zod schemas for runtime validation:

```typescript
// Import schemas from centralized validation module
import {
  validateOutput,
  MLTokenResponseSchema,
  MLItemSchema,
  MLOrderSchema,
} from "@/utils/validation";

// Validate ML API responses
const validatedData = validateOutput(MLTokenResponseSchema, apiResponse);

// Available schemas: MLItem, MLOrder, MLQuestion, MLWebhookNotification, etc.
// See: utils/validation/ml-schemas.ts for complete list
```

### 7. Logging & Monitoring

```typescript
// Use structured logging instead of console.log
import { logger } from "@/utils/logger";
logger.info("User logged in", { userId: "123" });
logger.warn("Rate limit approaching", { remaining: 10 });
logger.error("Payment failed", { error, orderId: "456" });
```

- Sentry integration for error tracking (configured in `instrumentation.ts`)
- Debug endpoints available: `/api/debug-*`, `/api/diagnostic`
- Colored output in development, JSON in production

### 8. Caching Strategy

```typescript
// Redis-based caching with TTL management
import { cacheGet, cacheSet, CacheTTL } from "@/utils/redis/cache";
const data = await cacheGet("ml-products", userId);
if (!data) {
  const freshData = await fetchFromML();
  await cacheSet("ml-products", userId, freshData, CacheTTL.MEDIUM);
}
```

- Upstash Redis for production caching
- Predefined TTL constants for different data types
- Automatic serialization/deserialization

### 9. Error Handling Patterns

API routes follow consistent structure with authentication, logging, and proper error responses:

```typescript
// Standard API route pattern
import { NextResponse, NextRequest } from "next/server";
import { getCurrentUser } from "@/utils/supabase/server";
import { logger } from "@/utils/logger";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Business logic here
    const data = await someOperation();

    return NextResponse.json({ success: true, data });
  } catch (error) {
    logger.error("Operation failed", { error, endpoint: "/api/example" });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
```

**Response Format Convention**:

- Success: `{ success: true, data?: any }`
- Error: `{ error: string }` with appropriate HTTP status code
- Always log errors with context for debugging

## Development Workflows

### Build & Run

```bash
npm install          # Install dependencies
npm run dev         # Development server (localhost:3000) - RECOMMENDED
npm run dev:turbo   # Turbo mode (experimental, may conflict with Sentry)
npm run build       # Production build
npm run type-check  # TypeScript validation (strict mode)
npm run lint        # ESLint validation
```

**Key npm scripts for Supabase**:

```bash
npm run db:start     # Start local Supabase (Docker required)
npm run db:stop      # Stop local Supabase
npm run db:status    # Check Supabase local instance status
npm run db:reset     # Reset local database (destructive!)
npm run db:push      # Apply migrations to remote
npm run db:pull      # Sync remote schema locally
npm run db:migration # Create new timestamped migration file
```

### Debugging & Testing

- **Debug Endpoints**: `/api/debug-ml`, `/api/debug-sentry`, `/api/diagnostic`
- **Test Scripts**: `test_ml_api.sh`, `test_vercel_api.sh` for API validation
- **Development Scripts**: Use `scripts/` directory for maintenance tasks
- **Sentry Testing**: Visit `/sentry-example-page` to test error tracking
- **Environment Variables**: Validated on startup - missing vars cause immediate error
- **Role Testing**: Use `/debug-roles` and `/debug-user` pages for auth debugging

**Available npm scripts**:

```bash
npm run dev          # Development server (RECOMMENDED - stable with Sentry)
npm run dev:turbo    # Faster dev mode with Turbopack (experimental)
npm run type-check   # TypeScript validation without build
npm run db:status    # Check Supabase local instance status
npm run db:migration # Create new timestamped migration file
npm run db:push      # Apply local migrations to remote Supabase
npm run db:pull      # Pull remote schema to local migrations
```

**Testing ML Integration**:

```powershell
# PowerShell (native Windows)
curl http://localhost:3000/api/debug-ml

# Or use Git Bash/WSL for .sh scripts
bash test_ml_api.sh
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

### ML Integration Setup

1. Register app at [Mercado Livre Developers](https://developers.mercadolibre.com.br/)
2. Configure OAuth redirect URI: `https://yourdomain.com/api/ml/oauth/callback`
3. Set environment variables: `ML_CLIENT_ID`, `ML_CLIENT_SECRET`
4. Implement webhook endpoints for real-time updates

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
- `utils/mercadolivre/token-manager.ts` - ML OAuth token management
- `utils/mercadolivre/product-sync.ts` - ML product synchronization
- `utils/validation/` - Zod schemas for API validation

## Security Considerations

- **Never use service role key** in frontend code or user-facing operations
- **Always validate permissions** on server-side before data access
- **RLS policies** handle multi-tenant data isolation automatically (all policies use `security_invoker = true`)
- **Profile-based roles** stored in `profiles.role` field - NO JWT claims used for authorization
- **Tenant validation** required for all cross-tenant operations via `getCurrentTenantId()`
- **AES-256-GCM encryption** for sensitive ML tokens (requires `ENCRYPTION_KEY` env var)
- **Zod validation** for all external API inputs (centralized in `utils/validation/`)
- **Environment validation** runs on startup via `utils/env-validation.ts`

## Brazilian Market Specifics

- All user-facing content in **Portuguese (pt-BR)**
- Documentation in `docs/pt/` follows Brazilian conventions
- Email templates configured for Portuguese language
- Timezone and locale considerations for Brazilian users
- Mercado Livre API integration with Brazilian marketplace specifics

## Code Style & Patterns

- TypeScript strict mode enabled (`tsconfig.json`)
- Tailwind for styling (no custom CSS modules) with shadcn/ui components
- Server Components by default, Client Components marked with `"use client"`
- Async/await for all database operations (never forget to `await createClient()`)
- Error handling with try/catch and proper user feedback
- Component library: shadcn/ui with Radix UI primitives
- Consistent API response format: `{ success: boolean, data?: any, error?: string }`
- Structured logging via `logger` utility (never use `console.log` in production code)

## Common Gotchas & Best Practices

### Critical Patterns

- **Middleware**: Only refreshes sessions - NO redirects/authorization (use Server Components)
- **Server-side operations**: Always `await` Supabase client creation: `await createClient()`
- **Role checks**: Server-side only via `hasRole()`, `requireRole()` - never trust client data
- **Migrations**: Use timestamp-based naming `YYYYMMDDHHMMSS_name.sql`, never direct ALTER
- **Multi-tenancy**: Call `await getCurrentTenantId()` before tenant-scoped DB operations
- **Service role**: ONLY for webhooks/system operations, never user-facing features

### ML API Specific

- **Token refresh**: Always use `MLTokenManager.getValidToken()` - handles expiration automatically
- **Rate limiting**: Implement exponential backoff for 429 errors (built into token manager)
- **Questions API**: Use `/my/received_questions/search?api_version=4` (not v3)
- **Supabase queries**: Prefer `.maybeSingle()` over `.single()` to avoid 406 errors on 0 results
- **Webhook processing**: Must be async, idempotent, and handle service role inserts

### Security & Validation

- **RLS policies**: Set `security_invoker = true` to avoid recursion issues
- **Input validation**: Use Zod schemas from `@/utils/validation` for all external data
- **Token encryption**: Requires `ENCRYPTION_KEY` env var (32+ characters)
- **Error logging**: Use `logger.error()` instead of `console.log()` for Sentry integration

### Windows Development

- **Shell scripts**: `.sh` files need WSL/Git Bash or conversion to PowerShell (`.ps1`)
- **Test scripts**: Use `bash test_ml_api.sh` in Git Bash, or convert to PowerShell equivalents
- **Path handling**: Node.js handles Windows paths correctly, but shell commands may need adjustment
- **PowerShell commands**: Use native PowerShell for most operations (npm scripts work natively)
- **Environment variables**: Use `$env:VARIABLE_NAME` syntax in PowerShell vs `$VARIABLE_NAME` in bash

**PowerShell Equivalents**:

```powershell
# Check Supabase status
npm run db:status

# Test API endpoints
Invoke-WebRequest -Uri http://localhost:3000/api/debug-ml | Select-Object -Expand Content

# View environment variables
Get-ChildItem Env: | Where-Object { $_.Name -like "*SUPABASE*" }

# Run development server
npm run dev:turbo
```
