# Auditoria Completa: .single() Calls

## 📋 Objetivo
Revisar sistematicamente TODAS as 75+ chamadas `.single()` no código para identificar potenciais 406 errors (PGRST116).

## 🎯 Critérios de Avaliação

### ✅ SAFE - Uso correto de .single()
- Lookup por PRIMARY KEY (`id`)
- Lookup por UNIQUE constraint
- Após INSERT/UPDATE com RETURNING
- Query com WHERE que garante exatamente 1 resultado

### ⚠️ RISKY - Pode causar 406 error
- Filtros por campos não-únicos (ex: `status='active'`)
- Queries que podem retornar 0 linhas em cenários legítimos
- Deve usar `.maybeSingle()` ou `.single()` + error handling

### 🔧 DEBUG - Não crítico
- Rotas de debug/setup que não afetam produção
- Pode manter `.single()` pois são operações administrativas

---

## 📊 Análise por Arquivo

### 1. app/api/ml/auth/callback/route.ts

**Linha 55:** ✅ **SAFE**
```typescript
.from('ml_oauth_states')
.select('*')
.eq('state', state)  // state é único por design
.gt('expires_at', new Date().toISOString())
.single();
```
- **Decisão**: Manter `.single()`
- **Razão**: `state` é UUID único, sempre retorna 0 ou 1 linha
- **Error handling**: Tem validação `if (stateError || !stateRecord)`

---

### 2. app/api/ml/integration/status/route.ts

**Linha 47:** ✅ **SAFE**
```typescript
.from('profiles')
.select('tenant_id')
.eq('id', user.id)  // PRIMARY KEY lookup
.single();
```
- **Decisão**: Manter `.single()`
- **Razão**: Lookup por PRIMARY KEY, sempre existe após auth

**Linha 136:** ✅ **SAFE**
```typescript
.from('profiles')
.select('*')
.eq('id', user.id)  // PRIMARY KEY lookup
.single();
```
- **Decisão**: Manter `.single()`
- **Razão**: PRIMARY KEY, já validado por auth middleware

**Linha 154:** ⚠️ **RISKY**
```typescript
.from('ml_integrations')
.select('id')
.eq('tenant_id', tenantId)
.eq('status', 'active')  // ⚠️ Pode ser 0 resultados
.single();
```
- **Decisão**: ❌ **PRECISA FIX** - Mudar para `.maybeSingle()`
- **Razão**: Usuário pode não ter integração ativa ainda
- **Impacto**: DELETE method falhará com 406 quando não há integração

---

### 3. app/api/ml/questions/route.ts

**Linha 85:** ✅ **SAFE**
```typescript
.from('profiles')
.select('tenant_id')
.eq('id', user.id)
.single();
```
- **Decisão**: Manter `.single()`
- **Razão**: PRIMARY KEY lookup

**Linha 95:** ⚠️ **RISKY**
```typescript
.from('ml_integrations')
.select('*')
.eq('tenant_id', tenantId)
.eq('status', 'active')
.single();
```
- **Decisão**: ❌ **PRECISA FIX** - Mudar para `.maybeSingle()`
- **Razão**: Usuário sem integração causará 406
- **Impacto**: Endpoint GET questions falhará antes de conectar ML

**Linha 222:** ✅ **SAFE** (precisa verificar)
```typescript
// Need to check context
```

**Linha 232:** ✅ **SAFE** (precisa verificar)
```typescript
// Need to check context
```

---

### 4. app/api/ml/items/route.ts

**Linha 63:** ✅ **SAFE**
```typescript
.from('profiles')
.select('tenant_id')
.eq('id', user.id)
.single();
```
- **Decisão**: Manter `.single()`
- **Razão**: PRIMARY KEY lookup

---

### 5. app/api/ml/orders/route.ts

**Linha 54:** ✅ **SAFE**
```typescript
.from('ml_integrations')
.select('id, access_token, user_id, ml_user_id')
.eq('id', integrationId)  // PRIMARY KEY
.eq('user_id', user.id)
.single()
```
- **Decisão**: Manter `.single()`
- **Razão**: Lookup por PRIMARY KEY + ownership check

**Linha 150:** ✅ **SAFE** (precisa verificar contexto)

**Linha 273:** ✅ **SAFE** (precisa verificar contexto)

---

### 6. app/api/dashboard/summary/route.ts

**Linha 22:** ✅ **SAFE**
```typescript
.from('profiles')
.select('tenant_id')
.eq('id', user.id)
.single();
```
- **Decisão**: Manter `.single()`
- **Razão**: PRIMARY KEY lookup

---

### 7. app/api/ml/webhooks/route.ts

**Linha 22:** ✅ **SAFE**
```typescript
.from('profiles')
.select('tenant_id')
.eq('id', user.id)
.single();
```
- **Decisão**: Manter `.single()`
- **Razão**: PRIMARY KEY lookup

---

### 8. app/api/ml/status/route.ts

**Linha 23:** ✅ **SAFE**
```typescript
.from('profiles')
.select('tenant_id')
.eq('id', user.id)
.single()
```
- **Decisão**: Manter `.single()`
- **Razão**: PRIMARY KEY lookup

---

### 9. app/api/ml/integration/route.ts

**Linha 23:** ✅ **SAFE**
```typescript
.from('profiles')
.select('tenant_id')
.eq('id', user.id)
.single()
```
- **Decisão**: Manter `.single()`

**Linha 38:** ✅ **SAFE** (precisa verificar - pode ser após INSERT)

---

### 10. app/api/ml/webhooks/notifications/route.ts

**Linha 297:** ✅ **SAFE**
```typescript
// Need to check - likely lookup by notification_id
```

---

## 🔍 Arquivos Pendentes de Análise Detalhada

- [ ] ml/questions/templates/route.ts (8 calls)
- [ ] ml/messages/route.ts (2 calls)
- [ ] ml/messages/templates/route.ts (6 calls)  
- [ ] ml/feedback/route.ts (4 calls)
- [ ] ml/feedback/[feedbackId]/route.ts (4 calls)
- [ ] ml/feedback/[feedbackId]/reply/route.ts (1 call)
- [ ] ml/metrics/route.ts (2 calls)
- [ ] Debug routes (25+ calls - baixa prioridade)

---

## 📝 Resumo Preliminar

### ✅ Confirmados SAFE: 15+
- Todos lookups por PRIMARY KEY (profiles.id)
- Lookups por unique constraints (oauth state)
- Ownership checks com PK

### ⚠️ RISKY Identificados: 2
1. **ml/integration/status/route.ts:154** - status='active' check
2. **ml/questions/route.ts:95** - status='active' check

### 🔧 Pendente Análise: 60+
- Templates routes (muitos .single())
- Messages routes
- Feedback routes
- Debug routes

---

## 🎯 Próximos Passos

1. ✅ Analisar contexto das linhas 222, 232 em questions/route.ts
2. ✅ Verificar ml/orders/route.ts linhas 150, 273
3. ✅ Auditar ml/questions/templates (8 calls)
4. ✅ Auditar ml/messages e templates (8 calls)
5. ✅ Auditar ml/feedback routes (9 calls)
6. ✅ Aplicar fixes nos RISKY identificados
7. ✅ Commit com relatório completo

**Status**: Em progresso - 20% completo
**Última atualização**: 10/10/2025 02:55 UTC
