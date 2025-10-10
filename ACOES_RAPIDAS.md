# ⚡ Ações Rápidas - MercaFlow

Este arquivo contém comandos prontos para executar as melhorias críticas identificadas na auditoria.

---

## 🔴 CRÍTICO - Execute AGORA

### 1. Limpar Arquivos Obsoletos

```bash
# Tornar script executável
chmod +x scripts/cleanup.sh

# Executar limpeza
bash scripts/cleanup.sh

# Revisar arquivos movidos
ls -la scripts/debug/
```

### 2. Proteger Endpoints de Debug

Adicione este código no **início** de cada arquivo abaixo:

**Arquivos a proteger**:
- `app/api/debug/create-profile/route.ts`
- `app/api/debug/create-role/route.ts`
- `app/api/debug/ml-api-test/route.ts`
- `app/api/debug/ml-integration/route.ts`
- `app/api/setup/assign-super-admin-role/route.ts`
- `app/api/setup/complete-super-admin-setup/route.ts`
- `app/api/setup/create-super-admin-profile/route.ts`
- `app/api/debug-ml/route.ts`

**Código a adicionar**:
```typescript
export async function GET(request: NextRequest) {
  // PROTEÇÃO: Bloquear em produção
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Debug endpoints are disabled in production' },
      { status: 403 }
    );
  }
  
  // ... resto do código existente
}
```

### 3. Remover Emails Hardcoded

**Arquivo**: `middleware.ts` (linhas 26-28)

**Remover**:
```typescript
if (user.email === 'peepers.shop@gmail.com' || user.email === 'antoniovbraz@gmail.com') {
  return ROLE_LEVELS['super_admin'] >= ROLE_LEVELS[requiredRole]
}
```

**Adicionar ao `.env.local`**:
```bash
SUPER_ADMIN_EMAILS=seu-email@exemplo.com,outro-admin@exemplo.com
```

**Substituir por**:
```typescript
// Verificar super admins via env var
const superAdminEmails = process.env.SUPER_ADMIN_EMAILS?.split(',').map(e => e.trim()) || [];
if (superAdminEmails.includes(user.email || '')) {
  return ROLE_LEVELS['super_admin'] >= ROLE_LEVELS[requiredRole]
}
```

### 4. Validar Environment Variables

**Criar arquivo**: `utils/env-validation.ts`

```typescript
/**
 * Validate required environment variables on startup
 */
export function validateEnvVars() {
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'ML_CLIENT_ID',
    'ML_CLIENT_SECRET',
    'ENCRYPTION_KEY',
  ] as const;

  const missing: string[] = [];

  requiredEnvVars.forEach(envVar => {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  });

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missing.map(v => `  - ${v}`).join('\n')}\n\n` +
      `Please check your .env.local file.`
    );
  }

  // Validar comprimento mínimo de encryption key
  if (process.env.ENCRYPTION_KEY && process.env.ENCRYPTION_KEY.length < 32) {
    throw new Error('ENCRYPTION_KEY must be at least 32 characters long');
  }

  console.log('✅ All required environment variables are set');
}
```

**Adicionar em**: `next.config.ts` (no topo do arquivo)

```typescript
import { validateEnvVars } from './utils/env-validation';

// Validate env vars on build and dev
if (process.env.NODE_ENV !== 'test') {
  validateEnvVars();
}

// ... resto do config
```

---

## 🟡 ALTO - Próximas 2 Semanas

### 5. Instalar Zod para Validação

```bash
npm install zod
```

**Criar arquivo**: `lib/validations/ml-items.ts`

```typescript
import { z } from 'zod';

export const CreateItemSchema = z.object({
  title: z.string().min(1).max(200, 'Título deve ter no máximo 200 caracteres'),
  category_id: z.string().regex(/^MLB\d+$/, 'Categoria inválida'),
  price: z.number().positive('Preço deve ser positivo').max(999999999),
  currency_id: z.string().default('BRL'),
  available_quantity: z.number().int().nonnegative('Quantidade não pode ser negativa'),
  buying_mode: z.enum(['buy_it_now', 'auction']),
  condition: z.enum(['new', 'used']),
  listing_type_id: z.string(),
  description: z.string().optional(),
  pictures: z.array(z.object({
    source: z.string().url('URL da imagem inválida')
  })).optional(),
});

export type CreateItemInput = z.infer<typeof CreateItemSchema>;
```

**Usar em API**:
```typescript
import { CreateItemSchema } from '@/lib/validations/ml-items';

export async function POST(request: NextRequest) {
  const body = await request.json();
  
  // Validar input
  const validated = CreateItemSchema.safeParse(body);
  if (!validated.success) {
    return NextResponse.json(
      { 
        error: 'Invalid input', 
        details: validated.error.format() 
      },
      { status: 400 }
    );
  }
  
  const data = validated.data;
  // ... usar data (já validado e tipado)
}
```

### 6. Criar Logger Estruturado

**Criar arquivo**: `utils/logger.ts`

```typescript
type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogContext {
  [key: string]: any;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private isProduction = process.env.NODE_ENV === 'production';

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? `\n${JSON.stringify(context, null, 2)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
  }

  info(message: string, context?: LogContext) {
    if (this.isDevelopment) {
      console.log(this.formatMessage('info', message, context));
    }
    // Em produção, enviar para serviço de logging (Sentry, DataDog, etc)
  }

  warn(message: string, context?: LogContext) {
    console.warn(this.formatMessage('warn', message, context));
  }

  error(message: string, context?: LogContext) {
    const formatted = this.formatMessage('error', message, context);
    console.error(formatted);
    
    if (this.isProduction) {
      // Enviar para Sentry ou similar
      // Sentry.captureException(new Error(message), { extra: context });
    }
  }

  debug(message: string, context?: LogContext) {
    if (this.isDevelopment) {
      console.debug(this.formatMessage('debug', message, context));
    }
  }
}

export const logger = new Logger();
```

**Substituir console.log/error**:
```typescript
// ❌ Antes:
console.error('No ML integration found for tenant:', tenantId);

// ✅ Depois:
import { logger } from '@/utils/logger';

logger.error('No ML integration found for tenant', { 
  tenantId, 
  userId: user.id,
  timestamp: new Date().toISOString()
});
```

### 7. Implementar Validação de Permissões

**Criar arquivo**: `utils/permissions/middleware.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { hasPermission, type Permission } from '@/utils/supabase/roles';

export function requirePermission(permission: Permission) {
  return async (request: NextRequest) => {
    const hasAccess = await hasPermission(permission);
    
    if (!hasAccess) {
      return NextResponse.json(
        { 
          error: 'Insufficient permissions',
          required: permission 
        },
        { status: 403 }
      );
    }
    
    return null; // Continue
  };
}
```

**Usar em APIs**:
```typescript
import { requirePermission } from '@/utils/permissions/middleware';

export async function GET(request: NextRequest) {
  // Validar permissão
  const permissionCheck = await requirePermission('ml.items.read')(request);
  if (permissionCheck) return permissionCheck;
  
  // ... resto do código
}

export async function POST(request: NextRequest) {
  const permissionCheck = await requirePermission('ml.items.create')(request);
  if (permissionCheck) return permissionCheck;
  
  // ... resto do código
}
```

### 8. Adicionar Testes Unitários

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

**Criar**: `vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
```

**Criar**: `vitest.setup.ts`

```typescript
import '@testing-library/jest-dom';
```

**Criar teste**: `__tests__/utils/roles.test.ts`

```typescript
import { describe, it, expect, vi } from 'vitest';
import { ROLE_LEVELS, hasRole } from '@/utils/supabase/roles';

describe('RBAC System', () => {
  describe('ROLE_LEVELS', () => {
    it('should have correct hierarchy', () => {
      expect(ROLE_LEVELS.super_admin).toBeGreaterThan(ROLE_LEVELS.admin);
      expect(ROLE_LEVELS.admin).toBeGreaterThan(ROLE_LEVELS.user);
    });
  });

  describe('hasRole', () => {
    // Adicionar testes quando implementar mock do Supabase
  });
});
```

**Adicionar script**: `package.json`

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

---

## 🟢 MÉDIO - Próximo Mês

### 9. Implementar Rate Limiting

```bash
npm install @upstash/ratelimit @upstash/redis
```

**Criar**: `lib/rate-limit.ts`

```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Cache em memória para desenvolvimento
const cache = new Map();

export const ratelimit = process.env.UPSTASH_REDIS_REST_URL
  ? new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(10, '10 s'),
      analytics: true,
    })
  : {
      // Fallback para desenvolvimento
      limit: async (identifier: string) => {
        const key = `ratelimit:${identifier}`;
        const count = (cache.get(key) || 0) + 1;
        cache.set(key, count);
        
        setTimeout(() => cache.delete(key), 10000);
        
        return {
          success: count <= 10,
          limit: 10,
          remaining: Math.max(0, 10 - count),
          reset: Date.now() + 10000,
        };
      },
    };
```

**Usar em API**:
```typescript
import { ratelimit } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  const ip = request.ip ?? '127.0.0.1';
  const { success, limit, remaining, reset } = await ratelimit.limit(ip);
  
  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': new Date(reset).toISOString(),
        }
      }
    );
  }
  
  // ... resto do código
}
```

---

## ✅ Checklist de Execução

### Dia 1 (2-3 horas)
- [ ] Executar `bash scripts/cleanup.sh`
- [ ] Proteger todos endpoints de debug
- [ ] Remover emails hardcoded
- [ ] Adicionar validação de env vars

### Dia 2 (3-4 horas)
- [ ] Instalar Zod
- [ ] Criar schemas de validação para principais APIs
- [ ] Implementar validação em 3-5 endpoints críticos

### Dia 3 (3-4 horas)
- [ ] Criar logger estruturado
- [ ] Substituir console.log/error em utils/
- [ ] Substituir console.log/error em app/api/

### Dia 4 (4-5 horas)
- [ ] Implementar middleware de permissões
- [ ] Adicionar validação em APIs de ML
- [ ] Documentar permissões necessárias

### Dia 5 (3-4 horas)
- [ ] Setup Vitest
- [ ] Criar testes para RBAC
- [ ] Criar testes para token-manager
- [ ] Atualizar documentação

---

## 📊 Acompanhamento de Progresso

Marque conforme for completando:

```markdown
## Status de Melhorias

### 🔴 Críticas
- [ ] Arquivos obsoletos limpos
- [ ] Debug endpoints protegidos
- [ ] Emails hardcoded removidos
- [ ] Env vars validadas

### 🟡 Altas
- [ ] Zod instalado e configurado
- [ ] Logger estruturado implementado
- [ ] Validação de permissões em APIs
- [ ] Testes unitários básicos

### 🟢 Médias
- [ ] Rate limiting implementado
- [ ] Testes E2E configurados
- [ ] Monitoramento configurado
- [ ] Performance otimizada
```

---

## 🚀 Comandos Úteis

```bash
# Verificar tipos
npm run type-check

# Lint
npm run lint

# Build (testa se não tem erros)
npm run build

# Rodar testes
npm run test

# Limpar cache Next.js
rm -rf .next

# Ver estrutura do projeto
tree -I 'node_modules|.next|.git' -L 3
```

---

**Dúvidas?** Consulte:
- [Relatório Completo](AUDITORIA_MERCAFLOW.md)
- [Sumário Executivo](SUMARIO_AUDITORIA.md)
- [Documentação](README.md)
