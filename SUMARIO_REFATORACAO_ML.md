# 📋 SUMÁRIO EXECUTIVO - REFATORAÇÃO ML

**Data**: 2025-10-19  
**Status**: 🔴 **PLANEJAMENTO COMPLETO - AGUARDANDO EXECUÇÃO**

---

## 🎯 O QUE FOI IDENTIFICADO

### Problema Principal

```
❌ PRODUTOS NÃO SINCRONIZANDO: 0 de 90+ produtos
```

**Causa Raiz Descoberta:**

1. ❌ **API ML usada INCORRETAMENTE**

   - `/users/{id}/items/search` retorna APENAS IDs (strings)
   - Código assumia que retornava objetos completos
   - Resultado: `mlProduct.id`, `mlProduct.title` etc eram `undefined`
   - Database error: "null value in column ml_item_id"

2. ❌ **Migration dropou todas as tabelas**

   - Migration `20251018210135` fez DROP de tudo
   - Perdemos dados de integrações
   - Usuário precisa reconectar ML

3. ❌ **Arquitetura problemática**
   - Lógica de negócio misturada com API routes
   - Sem camada de serviços
   - Sem testes automatizados
   - RLS policies podem estar bloqueando

### Decisão Tomada

✅ **REFAZER TUDO DO ZERO**

**Justificativa:**

- Aplicação em desenvolvimento (sem usuários reais)
- Mais rápido refazer bem do que arrumar gambiarras
- Oportunidade de implementar best practices
- Código atual tem problemas arquiteturais fundamentais

---

## 📦 O QUE FOI CRIADO (Planejamento)

### 1. Documentos de Planejamento

| Arquivo                             | Descrição                                                                                                              |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `REFATORACAO_COMPLETA_ML.md`        | **Documento mestre** com análise completa, objetivos, schema novo do banco, arquitetura de serviços, decisões técnicas |
| `GUIA_REFATORACAO_PASSO_A_PASSO.md` | **Guia de execução** com checklist completo de todas as tarefas, fase por fase, com comandos e código                  |
| `scripts/diagnose_ml_database.sql`  | **Script SQL** para diagnosticar estado atual do banco antes de começar refatoração                                    |

### 2. Plano de Execução (7 Fases)

#### **Fase 0: Análise** (30min - 1h)

- Backup do banco
- Executar diagnóstico SQL
- Documentar estado atual

#### **Fase 1: Nova Migration** (2-3h)

- DROP todas as tabelas ML
- CREATE schema correto baseado na API oficial
- RLS policies com `security_invoker = true`
- Indexes otimizados

#### **Fase 2: Camada de Serviços** (4-6h)

- `MLApiClient` com retry logic
- `MLTokenService` (refresh automático)
- `MLProductService` (multiget CORRETO)
- `MLOrderService`, `MLQuestionService`
- `MLWebhookService`, `MLSyncService`
- `Repositories` para acesso ao banco

#### **Fase 3: API Routes** (2-3h)

- Refatorar `/api/ml/auth/*`
- Refatorar `/api/ml/products/*`
- Refatorar `/api/ml/orders/*`
- Refatorar `/api/ml/questions/*`
- Refatorar `/api/ml/webhooks/*`

#### **Fase 4: Frontend** (2-3h)

- `ProductList`, `OrderList`, `QuestionList`
- Dashboard principal `/ml`
- Páginas de produtos, pedidos, perguntas

#### **Fase 5: Testes** (3-4h)

- Testes unitários (services, repositories)
- Testes de integração (API routes)
- Testes E2E (fluxo completo)
- Alvo: 80%+ cobertura

#### **Fase 6: Documentação** (1-2h)

- README atualizado
- `docs/pt/INTEGRACAO_ML.md` (arquitetura)
- `docs/pt/TROUBLESHOOTING_ML.md` (guia)

#### **Fase 7: Deploy** (1-2h)

- Commit + push
- Aguardar deploy Vercel
- Reconectar conta ML
- Testar sync de 90+ produtos
- Monitorar 24h

**TOTAL**: 16-26 horas de trabalho focado

---

## 🗄️ NOVO SCHEMA DO BANCO

### Tabelas Principais

```sql
ml_oauth_states      -- OAuth temporário (PKCE)
ml_integrations      -- Credenciais e configurações
ml_products          -- Anúncios sincronizados
ml_orders            -- Pedidos sincronizados
ml_questions         -- Perguntas de compradores
ml_webhook_logs      -- Webhooks recebidos
ml_sync_logs         -- Histórico de sincronizações
```

### Características

- ✅ Normalizado (3NF)
- ✅ RLS em todas as tabelas
- ✅ Indexes otimizados
- ✅ Constraints de integridade
- ✅ JSONB para dados flexíveis (`ml_data`)
- ✅ Audit trail (created_at, updated_at)
- ✅ Baseado 100% na API oficial do ML

---

## 🏗️ NOVA ARQUITETURA

### Estrutura de Pastas

```
utils/mercadolivre/
├── services/         # Lógica de negócio
│   ├── MLAuthService.ts
│   ├── MLTokenService.ts
│   ├── MLProductService.ts    ← CORRIGE O MULTIGET!
│   ├── MLOrderService.ts
│   ├── MLQuestionService.ts
│   ├── MLWebhookService.ts
│   └── MLSyncService.ts
├── repositories/     # Acesso ao banco
│   ├── MLIntegrationRepository.ts
│   ├── MLProductRepository.ts
│   ├── MLOrderRepository.ts
│   └── MLQuestionRepository.ts
├── api/
│   └── MLApiClient.ts         ← Retry logic + timeouts
└── types/
    ├── ml-api-types.ts        ← Types da API oficial
    └── ml-db-types.ts         ← Types do banco
```

### Padrão Correto de Sync

```typescript
// ❌ ANTES (ERRADO):
const response = await fetch('/users/{id}/items/search');
const products = response.results;  // Array de IDs (strings)!
products.forEach(p => insert(p.id, p.title, ...));  // undefined!

// ✅ DEPOIS (CORRETO):
// 1. Buscar IDs
const idsResponse = await fetch('/users/{id}/items/search');
const productIds = idsResponse.results;  // ["MLB123", "MLB456", ...]

// 2. Multiget (20 por vez)
const batches = chunk(productIds, 20);
for (const batch of batches) {
  const multigetResponse = await fetch(`/items?ids=${batch.join(',')}`);
  // multigetResponse = [
  //   { code: 200, body: {id, title, price, ...} },
  //   { code: 200, body: {id, title, price, ...} }
  // ]

  // 3. Extrair objetos completos
  const products = multigetResponse
    .filter(r => r.code === 200)
    .map(r => r.body);

  // 4. Inserir no banco (agora com dados reais!)
  await upsertBatch(products);
}
```

---

## 🚀 PRÓXIMOS PASSOS (O QUE VOCÊ PRECISA FAZER)

### Passo 1: Diagnóstico ⏳ **FAZER AGORA**

1. **Acesse Supabase Dashboard**

   ```
   https://supabase.com/dashboard/project/pnzbnciiokgiadkfgrcn
   ```

2. **Vá em: SQL Editor**

3. **Copie e execute:**

   - Abra: `scripts/diagnose_ml_database.sql`
   - Copie todo o conteúdo
   - Cole no SQL Editor
   - Clique "Run"

4. **Salve os resultados**
   - Copie a saída completa
   - Salve em: `DIAGNOSTICO_BANCO_2025-10-19.txt`
   - Compartilhe comigo

### Passo 2: Decidir Estratégia

**Após ver os resultados do diagnóstico:**

**OPÇÃO A**: Se houver dados importantes (integrações ativas, produtos, etc)
→ Criar script de migração preservando dados

**OPÇÃO B**: Se não houver nada crítico (recomendado para MVP)
→ DROP completo + recria tudo limpo + reconecta ML

### Passo 3: Executar Refatoração

**Com base na decisão:**

- Seguir checklist do `GUIA_REFATORACAO_PASSO_A_PASSO.md`
- Marcar cada item conforme completa
- Testar após cada fase

---

## 📊 CRITÉRIOS DE SUCESSO

### Must Have ✅

- [ ] 90+ produtos sincronizando corretamente
- [ ] Pedidos sendo buscados e exibidos
- [ ] Perguntas sincronizando
- [ ] Webhooks processando
- [ ] Token refresh automático funcionando
- [ ] Zero erros em 24h

### Should Have 🎨

- [ ] Testes automatizados (80%+)
- [ ] Documentação completa
- [ ] Logs estruturados
- [ ] Error handling robusto

---

## 🤔 PERGUNTAS PARA VOCÊ

Antes de começarmos, preciso saber:

1. **Quantas integrações ML ativas você tem agora?**

   - Nenhuma? (pode dropar tudo)
   - Uma ou mais? (precisamos migrar dados)

2. **Há dados importantes no banco?**

   - Produtos históricos que não podem ser perdidos?
   - Pedidos antigos importantes?
   - Perguntas respondidas que devem ser preservadas?

3. **Preferência de estratégia:**
   - ✅ **DROP TOTAL** + reconectar (mais rápido, recomendado)
   - ⚠️ **MIGRAR DADOS** + preservar histórico (mais lento, complexo)

---

## 🎬 VAMOS COMEÇAR?

**FAÇA AGORA:**

1. Execute o diagnóstico SQL (Passo 1 acima)
2. Compartilhe os resultados comigo
3. Responda as 3 perguntas
4. Vou criar a migration perfeita para seu caso

**Arquivos de referência:**

- `REFATORACAO_COMPLETA_ML.md` - Análise técnica completa
- `GUIA_REFATORACAO_PASSO_A_PASSO.md` - Checklist de execução
- `scripts/diagnose_ml_database.sql` - Script de diagnóstico

---

**Estou pronto para começar quando você executar o diagnóstico!** 🚀

---

## 📝 COMMITS RECENTES

- ✅ `acf36f2` - Fix: implementado padrão correto de multiget (ainda com problemas)
- ✅ `4530345` - Fix: corrigido `last_synced_at` → `last_sync_at` (16 arquivos)
- ⏳ Próximo commit será: **"feat: complete ML integration refactor"**
