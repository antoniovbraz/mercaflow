# Verificação de Tabelas ML no Supabase

Este guia mostra como verificar se as tabelas do Mercado Livre foram criadas corretamente no seu banco de dados Supabase.

## 📋 Scripts Disponíveis

Temos 3 scripts SQL para verificação:

1. **`verify-ml-tables-simple.sql`** ⭐ **RECOMENDADO**
   - Verificação rápida e simplificada
   - 5 verificações essenciais
   - Resultado fácil de ler

2. **`verify-ml-tables.sql`** 
   - Verificação completa e detalhada
   - 10 tipos de verificações
   - Inclui indexes, constraints, triggers, policies

3. **`verify-complete-schema.sql`** 🔍 **AUDITORIA COMPLETA** (múltiplos resultados)
   - Verifica **TODO O SCHEMA** do Supabase
   - 17 seções de análise
   - Inclui: todas as tabelas, FKs, RLS, triggers, functions, enums, espaço em disco
   - ⚠️ Supabase SQL Editor só mostra o último resultado

4. **`verify-schema-single-result.sql`** ⭐ **RECOMENDADO PARA SUPABASE**
   - Mesma verificação completa do schema
   - **RETORNA UM ÚNICO RESULTADO** consolidado
   - Funciona perfeitamente no Supabase SQL Editor
   - 14 seções em uma única tabela de resultados

---

## 🚀 COMO USAR

### Opção 1: Script Simples ⭐ (Recomendado para verificação rápida)

1. **Acesse o Supabase Dashboard:**
   ```
   https://supabase.com/dashboard/project/YOUR_PROJECT_ID/sql/new
   ```

2. **Copie o conteúdo de:**
   ```
   scripts/verify-ml-tables-simple.sql
   ```

3. **Cole no SQL Editor e clique em "RUN"**

4. **Você verá 5 tabelas de resultados:**
   - ✅ Lista de tabelas ML (deve mostrar 7 tabelas)
   - ✅ Contagem de registros (provavelmente 0 em todas)
   - ✅ Colunas da ml_integrations
   - ✅ Status do RLS (deve estar habilitado)
   - ✅ Verificação de nomes de colunas (access_token OK)

---

### Opção 2: Script Completo (Tabelas ML detalhado)

1. **Acesse o Supabase Dashboard SQL Editor**

2. **Copie o conteúdo de:**
   ```
   scripts/verify-ml-tables.sql
   ```

3. **Cole e execute**

4. **Você verá 10 seções de resultados:**
   - Tabelas existentes
   - Detalhes de todas as colunas
   - Indexes
   - Constraints (PK, FK, UNIQUE, CHECK)
   - Status do RLS
   - Policies do RLS
   - Contagem de registros
   - Triggers
   - Verificação de colunas críticas
   - Resumo final

---

### Opção 3: Script de Auditoria Completa 🔍 (TODO O SCHEMA)

1. **Acesse o Supabase Dashboard SQL Editor**

2. **Copie o conteúdo de:**
   ```
   scripts/verify-complete-schema.sql
   ```

3. **Cole e execute**

4. **Você verá 17 seções de análise completa:**
   - **Seção 1**: Resumo geral do banco (total de tabelas, colunas, indexes, etc)
   - **Seção 2**: Todas as tabelas do schema public (não apenas ML)
   - **Seção 3**: Detalhes de colunas de TODAS as tabelas
   - **Seção 4**: Todos os indexes
   - **Seção 5**: Todas as constraints (PK, FK, UNIQUE, CHECK)
   - **Seção 6**: Relacionamentos (Foreign Keys)
   - **Seção 7**: Status RLS de todas as tabelas
   - **Seção 8**: Todos os triggers
   - **Seção 9**: Functions/Procedures
   - **Seção 10**: Enums (tipos customizados)
   - **Seção 11**: Contagem de registros em todas as tabelas
   - **Seção 12**: Verificação específica das tabelas ML
   - **Seção 13**: Verificação do sistema de autenticação (profiles, tenants, etc)
   - **Seção 14**: Estatísticas de espaço em disco
   - **Seção 15**: Grafo de dependências (quais tabelas referenciam quais)
   - **Seção 16**: Schemas e Extensions instaladas
   - **Seção 17**: Resumo final

**⚠️ IMPORTANTE**: Este script verifica TUDO no banco, não apenas as tabelas ML. Use quando precisar de uma auditoria completa.

**⚠️ LIMITAÇÃO**: Supabase SQL Editor só mostra o último SELECT, então você verá apenas a mensagem final de conclusão.

---

### Opção 4: Script Completo de Resultado Único ⭐ (RECOMENDADO PARA SUPABASE)

1. **Acesse o Supabase Dashboard SQL Editor**

2. **Copie o conteúdo de:**
   ```
   scripts/verify-schema-single-result.sql
   ```

3. **Cole e execute**

4. **Você verá UMA ÚNICA TABELA com todas as 14 seções:**
   - **Seção 1**: Resumo geral (6 métricas)
   - **Seção 2**: Lista de todas as tabelas com contagem de colunas e status RLS
   - **Seção 3**: Tabelas ML específicas com verificação de integridade
   - **Seção 4**: Verificação crítica de ml_integrations (access_token vs encrypted_access_token)
   - **Seção 5**: Todas as colunas de ml_integrations com tipos e nullable
   - **Seção 6**: Indexes das tabelas ML
   - **Seção 7**: Foreign Keys completas (origem → destino, ON DELETE)
   - **Seção 8**: RLS Policies detalhadas (roles, USING, WITH CHECK)
   - **Seção 9**: Triggers (eventos, timing)
   - **Seção 10**: Contagem de registros em TODAS as tabelas
   - **Seção 11**: Sistema de autenticação (profiles, tenants, etc)
   - **Seção 12**: Enums (tipos customizados com valores)
   - **Seção 13**: Extensions instaladas
   - **Seção 14**: Estatísticas de espaço em disco (top 20 maiores tabelas)

**✅ VANTAGEM**: Este script usa uma tabela temporária para consolidar TUDO em um único resultado, perfeito para o Supabase SQL Editor!

---

## ✅ O QUE ESPERAR (Resultados Corretos)

### 1. Tabelas ML (7 no total):
```sql
ml_oauth_states     (7 colunas)
ml_integrations     (20 colunas)
ml_orders           (18 colunas)
ml_products         (18 colunas)
ml_questions        (15 colunas)
ml_sync_logs        (14 colunas)
ml_webhook_logs     (12 colunas)
```

### 2. Contagem de Registros:
```
Todas as tabelas: 0 registros (esperado após DROP CASCADE)
```

### 3. RLS Status:
```
Todas as 7 tabelas: ✅ Habilitado
```

### 4. Colunas críticas de ml_integrations:
```sql
✅ access_token        (TEXT, NOT NULL)
✅ refresh_token       (TEXT, NOT NULL)
✅ token_expires_at    (TIMESTAMPTZ, NOT NULL)
✅ ml_user_id          (BIGINT, NOT NULL)
✅ status              (TEXT, NOT NULL, DEFAULT 'active')

❌ encrypted_access_token  (NÃO DEVE EXISTIR!)
❌ encrypted_refresh_token (NÃO DEVE EXISTIR!)
```

### 5. Indexes Principais:
```sql
✅ idx_ml_integrations_user_id
✅ idx_ml_integrations_tenant_id
✅ idx_ml_integrations_ml_user_id
✅ idx_ml_products_integration_id
✅ idx_ml_products_ml_item_id
... (deve ter ~20-25 indexes no total)
```

---

## 🐛 PROBLEMAS COMUNS

### ❌ Problema 1: Tabelas não existem
**Sintoma:**
```
Nenhuma tabela encontrada com prefixo 'ml_'
```

**Solução:**
```bash
# Aplicar migration
npx supabase db push
```

---

### ❌ Problema 2: Coluna encrypted_access_token existe
**Sintoma:**
```sql
encrypted_access_token | TEXT | NO
```

**Solução:**
Migration está desatualizada. Execute:
```bash
# Pull do schema remoto
npx supabase db pull

# Verificar migrations
ls supabase/migrations/

# Aplicar novamente
npx supabase db push
```

---

### ❌ Problema 3: RLS desabilitado
**Sintoma:**
```
ml_products | ❌ Desabilitado
```

**Solução:**
```sql
-- Execute no SQL Editor:
ALTER TABLE ml_products ENABLE ROW LEVEL SECURITY;
```

---

### ❌ Problema 4: Número de colunas diferente
**Sintoma:**
```
ml_integrations (18 colunas)  -- Esperado: 20
```

**Solução:**
Schema está desatualizado. Re-aplicar migration:
```bash
npx supabase db reset  # ⚠️ CUIDADO: Apaga todos os dados
# OU
npx supabase db push --linked  # Aplica apenas novas migrations
```

---

## 📊 COMPARAÇÃO COM MIGRATION

A migration `20251019160000_rebuild_ml_from_scratch.sql` deve criar:

| Tabela | Colunas | Indexes | RLS | Unique Constraints |
|--------|---------|---------|-----|-------------------|
| ml_oauth_states | 7 | 3 | ✅ | state |
| ml_integrations | 20 | 5 | ✅ | (user_id, ml_user_id) |
| ml_products | 18 | 4 | ✅ | (integration_id, ml_item_id) |
| ml_orders | 18 | 4 | ✅ | (integration_id, ml_order_id) |
| ml_questions | 15 | 4 | ✅ | (integration_id, ml_question_id) |
| ml_webhook_logs | 12 | 3 | ✅ | - |
| ml_sync_logs | 14 | 2 | ✅ | - |

---

## 🔧 COMANDOS ÚTEIS (CLI)

### Verificar status local:
```bash
npx supabase db status
```

### Verificar diferenças:
```bash
npx supabase db diff
```

### Aplicar migrations:
```bash
npx supabase db push
```

### Reset completo (⚠️ APAGA DADOS):
```bash
npx supabase db reset
```

---

## 📝 CHECKLIST DE VERIFICAÇÃO

Execute o script simples e confirme:

- [ ] 7 tabelas ML existem
- [ ] Todas as tabelas têm 0 registros (esperado)
- [ ] RLS está habilitado em todas
- [ ] `ml_integrations` tem coluna `access_token` (não `encrypted_access_token`)
- [ ] `ml_integrations` tem coluna `refresh_token` (não `encrypted_refresh_token`)
- [ ] Todas as tabelas têm coluna `id` (UUID, PRIMARY KEY)
- [ ] Todas as tabelas têm colunas `created_at` e `updated_at`
- [ ] `ml_products` tem UNIQUE constraint em `(integration_id, ml_item_id)`

---

## ✅ RESULTADO ESPERADO

Se tudo estiver correto, o script simples deve retornar:

```
📊 TABELAS ML: 7 tabelas encontradas
📈 REGISTROS: 0 em todas (esperado após rebuild)
✅ RLS: Habilitado em todas as 7 tabelas
✅ COLUNAS: access_token e refresh_token existem
✅ SCHEMA: Alinhado com migration 20251019160000
```

---

## 🆘 SUPORTE

Se encontrar problemas:

1. Compare resultados com a migration: `supabase/migrations/20251019160000_rebuild_ml_from_scratch.sql`
2. Verifique logs do Supabase: Dashboard → Logs
3. Execute o script completo (`verify-ml-tables.sql`) para detalhes
4. Consulte a auditoria: `AUDITORIA_FASE1-3.md`

---

**Criado em:** 2025-01-19  
**Commit:** 637713e  
**Migration:** 20251019160000_rebuild_ml_from_scratch.sql
