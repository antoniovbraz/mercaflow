---
applyTo: "**/*"
---
# General Coding Standards - MercaFlow

## Project Context

MercaFlow is a **world-class SaaS platform** for Mercado Livre integration targeting the **Brazilian market**. All user-facing content must be in **Portuguese (pt-BR)**.

## Core Principles

### 1. Security First
- **NEVER** use service role client in user-facing operations
- **ALWAYS** respect RLS policies - security is enforced at database level
- **NEVER** trust client-side data - validate everything server-side
- **ALWAYS** use Zod schemas for external API validation
- Encrypt sensitive data (ML tokens use AES-256-GCM)

### 2. Multi-tenant Architecture
- Every database operation must respect `tenant_id` scoping
- Use `getCurrentTenantId()` before tenant-scoped operations
- Validate tenant access with `validateTenantAccess()`
- Never hardcode tenant IDs

### 3. Type Safety
- TypeScript strict mode is **mandatory**
- Use Zod for runtime validation of external data
- Never use `any` - prefer `unknown` and type guards
- Define proper types for all function parameters and returns

### 4. Error Handling
- Use structured logging with `logger` utility (not `console.log`)
- API responses follow format: `{ success: boolean, data?: any, error?: string }`
- Always log errors with context for Sentry tracking
- Handle Mercado Livre rate limits (429) with exponential backoff

### 5. Brazilian Market Standards
- All user-facing text in **Portuguese (pt-BR)**
- Comments and documentation can be in English or Portuguese
- Follow Brazilian date/time formats
- Respect Brazilian timezone considerations

## File Organization

### Naming Conventions
- Components: `PascalCase.tsx` (e.g., `ProductCard.tsx`)
- Utilities: `kebab-case.ts` (e.g., `token-manager.ts`)
- API routes: `route.ts` (Next.js 15 convention)
- Database migrations: `YYYYMMDDHHMMSS_descriptive_name.sql`

### Directory Structure
```
app/                    # Pages, layouts, API routes (Next.js 15 App Router)
components/            # Reusable React components
  ui/                 # shadcn/ui components
  sections/           # Page-specific sections
utils/                # Utility functions
  supabase/          # All Supabase integrations
  mercadolivre/      # ML API integrations
  validation/        # Zod schemas
supabase/migrations/  # Database schema and RLS
docs/pt/             # Portuguese documentation
```

## Code Style

### Formatting
- Use Prettier defaults (configured via Next.js)
- 2 spaces for indentation
- Single quotes for strings
- Semicolons required
- Max line length: 100 characters (guideline, not strict)

### Comments
- Write self-documenting code - prefer clear names over comments
- Use JSDoc for public APIs and complex functions
- Add `// CRITICAL:` for security-sensitive code
- Add `// TODO:` for planned improvements
- Explain **why**, not **what** (code shows what)

### Imports
- Use absolute imports with `@/` alias
- Group imports: React → Next.js → Third-party → Local
- Sort alphabetically within groups
- One blank line between import groups

Example:
```typescript
import { useState, useEffect } from "react";

import { redirect } from "next/navigation";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";

import { ProductCard } from "./ProductCard";
```

## Commit Messages

Follow conventional commits:

```
<type>(<scope>): <description>

[optional body]
[optional footer]
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style (formatting, no logic change)
- `refactor`: Code refactoring
- `perf`: Performance improvement
- `test`: Add/update tests
- `chore`: Build process, tooling
- `security`: Security fixes

### Emojis (optional but encouraged)
- 🔒 Security fixes
- 🐛 Bug fixes
- ✨ New features
- 📝 Documentation
- ♻️ Refactoring
- ⚡ Performance
- 🔧 Configuration

Example:
```
feat(ml): add automatic token refresh
fix(auth): resolve session timeout issue
docs: update setup guide for beginners
🔒 security: remove .env.production from git history
```

## Environment Variables

### Naming
- Prefix public vars with `NEXT_PUBLIC_`
- Use `SCREAMING_SNAKE_CASE`
- Group by service (e.g., `ML_`, `SUPABASE_`)

### Security
- **NEVER** commit `.env.production` or `.env.local`
- Keep `.env.example` updated with all required variables
- Document each variable in `.env.example`
- Rotate credentials if exposed

## Testing

### File Naming
- Test files: `*.test.ts` or `*.test.tsx`
- Located next to the code they test

### What to Test
- Utility functions (100% coverage goal)
- API route handlers (authentication, validation, responses)
- Zod schemas (edge cases, invalid data)
- Critical business logic

### What NOT to Test
- UI components (rely on TypeScript and visual testing)
- Third-party library internals
- Simple getters/setters

## Performance

### Best Practices
- Use Redis caching for ML API responses
- Implement pagination for large datasets
- Use Next.js Image component for images
- Lazy load components when appropriate
- Minimize API calls - batch when possible

### Monitoring
- Sentry tracks errors and performance automatically
- Use `logger.info()` for important operations
- Add timing logs for slow operations
- Monitor Supabase query performance

## Accessibility

### Requirements
- All interactive elements keyboard accessible
- Proper ARIA labels where needed
- Color contrast meets WCAG AA standards
- Forms include proper labels and error messages

### Tools
- shadcn/ui components are accessible by default
- Use semantic HTML elements
- Test with keyboard navigation

## Documentation

### Code Documentation
- Complex functions need JSDoc comments
- Public APIs need full documentation
- Add examples for non-obvious usage

### Project Documentation
- Keep `README.md` up to date
- Add guides to `docs/pt/` for Brazilian users
- Update `GUIA_INICIANTE.md` when setup process changes
- Document architectural decisions

## Brazilian Portuguese Standards

### Terminology
- "Login" → "Entrar" or "Fazer login"
- "Sign up" → "Cadastrar" or "Criar conta"
- "Dashboard" → "Painel" or keep "Dashboard"
- "Settings" → "Configurações"
- "Admin" → "Administrador"
- "User" → "Usuário"

### Tone
- Professional but friendly (você, not tu)
- Clear and concise
- Avoid jargon when possible
- Use active voice

### Formatting
- Dates: dd/MM/yyyy (e.g., 18/10/2025)
- Currency: R$ 1.234,56
- Decimal separator: comma (vírgula)
- Thousands separator: dot (ponto)

## Git Workflow

### Branch Naming
- `main` - Production ready code
- `develop` - Development branch
- `feature/feature-name` - New features
- `fix/bug-name` - Bug fixes
- `hotfix/critical-fix` - Production hotfixes

### Before Committing
```powershell
npm run type-check    # TypeScript validation
npm run lint          # ESLint validation
git status            # Review changes
```

### Pull Requests
- Descriptive title and description
- Reference related issues
- Wait for CI checks to pass
- Request review when ready

## Code Review Standards

### Reviewer Checklist
- ✅ Security considerations addressed
- ✅ Multi-tenancy respected
- ✅ Type safety maintained
- ✅ Error handling implemented
- ✅ Tests added/updated
- ✅ Documentation updated
- ✅ Performance impact considered
- ✅ Accessibility maintained

### Author Responsibilities
- Self-review before requesting review
- Respond to feedback promptly
- Update based on comments
- Keep PR scope focused

## Anti-Patterns to Avoid

### ❌ Never Do This
- Service role in frontend
- Bypass RLS policies
- Store credentials in code
- Use `any` type
- Ignore TypeScript errors
- Skip error handling
- Hardcode tenant IDs
- Use `console.log()` in production code
- Trust client input without validation
- Mix languages (Portuguese + English in UI)

### ✅ Always Do This
- Validate external data with Zod
- Use appropriate Supabase client
- Handle errors gracefully
- Log with context
- Respect tenant boundaries
- Type everything strictly
- Use structured logging
- Encrypt sensitive data
- Test security-critical code
- Keep Portuguese consistent

## Resources

### Internal Documentation
- `.github/copilot-instructions.md` - Complete technical guide
- `GUIA_INICIANTE.md` - Beginner setup guide
- `SETUP_RAPIDO.md` - Quick setup checklist
- `docs/pt/` - Portuguese documentation

### External Resources
- [Next.js 15 Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Mercado Livre API](https://developers.mercadolibre.com.br/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Zod](https://zod.dev/)

---

**Remember:** Code is read more than it's written. Prioritize clarity, security, and maintainability.
