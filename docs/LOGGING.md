# Logger System - MercaFlow

Sistema de logging profissional para substituir `console.log/error/warn` por logging estruturado.

## ✅ O que foi implementado

- ✅ `utils/logger.ts` - Logger universal com 4 níveis
- ✅ Logs coloridos em desenvolvimento
- ✅ JSON estruturado em produção  
- ✅ Suporte para contexto adicional
- ✅ Integração com Sentry preparada (opcional)
- ✅ Type-safe com TypeScript

## 📖 Como usar

### Importar o logger

```typescript
import { logger } from '@/utils/logger'
```

### Exemplos de uso

#### 1. **Debug** (apenas em dev, não aparece em produção)
```typescript
logger.debug('ML API response', { data, userId })
// 🔍 [DEBUG] 10:30:45 - ML API response
//   📋 Context: { data: {...}, userId: '123' }
```

#### 2. **Info** (informações gerais)
```typescript
logger.info('User logged in', { userId: user.id, email: user.email })
// ℹ️  [INFO] 10:30:45 - User logged in
//   📋 Context: { userId: '123', email: 'user@example.com' }
```

#### 3. **Warning** (situações potencialmente problemáticas)
```typescript
logger.warn('Rate limit approaching', { remaining: 10, limit: 100 })
// ⚠️  [WARN] 10:30:45 - Rate limit approaching
//   📋 Context: { remaining: 10, limit: 100 }
```

#### 4. **Error** (erros que precisam atenção)
```typescript
logger.error('Payment failed', error, { orderId: '456', amount: 100 })
// ❌ [ERROR] 10:30:45 - Payment failed
//   📋 Context: { orderId: '456', amount: 100 }
//   💥 Error: Payment gateway timeout
//   📚 Stack: Error: Payment gateway timeout at...
```

## 🔄 Migração de console.* para logger.*

### Antes (console.*)
```typescript
console.log('User logged in', userId)
console.error('Error:', error)
console.warn('Token expiring soon')
```

### Depois (logger.*)
```typescript
logger.info('User logged in', { userId })
logger.error('Payment failed', error, { orderId })
logger.warn('Token expiring soon', { expiresIn: '5min' })
```

## 📊 Formato de Output

### Development (colorido)
```
ℹ️  [INFO] 10:30:45 - User logged in
  📋 Context: { userId: '123', email: 'user@example.com' }
```

### Production (JSON)
```json
{"timestamp":"2025-10-10T10:30:45.123Z","level":"info","message":"User logged in","context":{"userId":"123","email":"user@example.com"}}
```

## 🚀 Próximos passos (Days 4-5)

### Prioridade Alta (fazer primeiro)
1. ✅ **app/api/ml/auth/callback/route.ts** (~22 console.*)
2. ✅ **app/api/ml/webhooks/notifications/route.ts** (~50 console.*)
3. ✅ **app/api/ml/items/route.ts** (~20 console.*)
4. ✅ **app/api/ml/questions/route.ts** (~15 console.*)
5. ✅ **app/api/ml/messages/route.ts** (~20 console.*)

### Script automatizado
```bash
# Listar todos os console.* no projeto
grep -rn "console\.\(log\|error\|warn\)" app/ --include="*.ts" --include="*.tsx"

# Substituir em um arquivo específico (exemplo)
# 1. Adicionar import: import { logger } from '@/utils/logger'
# 2. Substituir: console.log → logger.info
# 3. Substituir: console.error → logger.error  
# 4. Substituir: console.warn → logger.warn
```

## 🔧 Integração Sentry (Opcional - MVP pode pular)

### Instalar
```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

### Configurar
O logger já está preparado para Sentry. Quando Sentry estiver configurado, erros serão enviados automaticamente em produção.

## 📝 Checklist de Migração

- [x] Day 3: Logger criado e testado
- [ ] Day 4: Substituir 5 arquivos prioritários
- [ ] Day 4: Substituir API routes restantes
- [ ] Day 5: Substituir components/
- [ ] Day 5: Substituir utils/
- [ ] Day 5: Testar em dev
- [ ] Day 5: Validar logs em produção (Vercel)
- [ ] Opcional: Configurar Sentry

## 🎯 Meta Day 5

**0 console.* em produção** - Todos substituídos por `logger.*`

---

**Status**: ✅ Logger implementado | 🔄 Substituições em andamento (150+ para fazer)
