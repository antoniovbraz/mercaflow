# GUIA DE REFATORAÇÃO COMPLETA - PASSO A PASSO

**Data**: 2025-10-19  
**Objetivo**: Refazer integração ML do zero com arquitetura correta  
**Tempo estimado**: 16-26 horas

---

## 📋 CHECKLIST DE EXECUÇÃO

### ✅ FASE 0: Análise e Preparação (30 min - 1h)

- [ ] **1. Backup do Banco de Dados**
  ```bash
  # Via Supabase Dashboard:
  # 1. Acesse: https://supabase.com/dashboard/project/pnzbnciiokgiadkfgrcn
  # 2. Settings > Database > Backup
  # 3. Criar backup manual antes de começar
  ```

- [ ] **2. Executar Diagnóstico SQL**
  ```sql
  -- Copie o conteúdo de: scripts/diagnose_ml_database.sql
  -- Cole no SQL Editor do Supabase Dashboard
  -- Execute e salve os resultados em: DIAGNOSTICO_BANCO_2025-10-19.md
  ```

- [ ] **3. Documentar Estado Atual**
  - Quantas integrações ativas existem?
  - Quantos produtos/pedidos/perguntas estão no banco?
  - Há dados órfãos (sem integration_id)?
  - Quais RLS policies existem?

---

### 🗄️ FASE 1: Nova Migration - Schema Limpo (2-3h)

- [ ] **1.1. Criar arquivo de migration**
  ```bash
  # Nome: 20251019150000_rebuild_ml_integration_from_scratch.sql
  # Local: supabase/migrations/
  ```

- [ ] **1.2. Implementar schema completo** (ver `REFATORACAO_COMPLETA_ML.md` seção 1)
  - [ ] DROP de todas as tabelas ML existentes
  - [ ] CREATE TABLE ml_oauth_states (OAuth temporário)
  - [ ] CREATE TABLE ml_integrations (credenciais + config)
  - [ ] CREATE TABLE ml_products (anúncios)
  - [ ] CREATE TABLE ml_orders (pedidos)
  - [ ] CREATE TABLE ml_questions (perguntas)
  - [ ] CREATE TABLE ml_webhook_logs (webhooks recebidos)
  - [ ] CREATE TABLE ml_sync_logs (histórico de syncs)
  - [ ] Todos os INDEXes necessários
  - [ ] Todos os CONSTRAINTs (FK, UNIQUE, CHECK)

- [ ] **1.3. Implementar RLS Policies**
  - [ ] Policy para ml_oauth_states (users manage own)
  - [ ] Policy para ml_integrations (tenant isolation)
  - [ ] Policy para ml_products (via integration → tenant)
  - [ ] Policy para ml_orders (via integration → tenant)
  - [ ] Policy para ml_questions (via integration → tenant)
  - [ ] Policy para ml_webhook_logs (service role only inserts)
  - [ ] Policy para ml_sync_logs (via integration → tenant)
  - [ ] Usar `security_invoker = true` em TODAS as policies

- [ ] **1.4. Testar migration localmente** (se possível)
  ```bash
  # Se Docker estiver rodando:
  npx supabase db reset
  npx supabase db push
  ```

- [ ] **1.5. Aplicar em produção**
  ```bash
  # Via Supabase Dashboard SQL Editor
  # OU via CLI:
  npx supabase db push
  ```

- [ ] **1.6. Validar schema criado**
  - [ ] Verificar todas as tabelas existem
  - [ ] Verificar RLS habilitado em todas
  - [ ] Verificar indexes criados
  - [ ] Verificar constraints corretos

---

### 🔧 FASE 2: Camada de Serviços (4-6h)

#### 2.1. Setup da Estrutura

- [ ] **Criar diretórios**
  ```bash
  mkdir -p utils/mercadolivre/services
  mkdir -p utils/mercadolivre/repositories
  mkdir -p utils/mercadolivre/api
  mkdir -p utils/mercadolivre/types
  ```

#### 2.2. Types e Interfaces

- [ ] **types/ml-api-types.ts** - Types da API oficial ML
  ```typescript
  // MLItemSearchResponse, MLItem, MLOrder, MLQuestion, etc.
  // Baseado em: https://developers.mercadolibre.com.ar/en_us/items-and-searches
  ```

- [ ] **types/ml-db-types.ts** - Types do banco de dados
  ```typescript
  // MLIntegration, MLProduct, MLOrder, MLQuestion, etc.
  // Baseado no schema SQL criado
  ```

- [ ] **types/ml-errors.ts** - Custom error classes
  ```typescript
  // MLApiError, MLTokenError, MLSyncError, etc.
  ```

#### 2.3. API Client

- [ ] **api/MLApiClient.ts**
  - [ ] Implementar classe com retry logic
  - [ ] Exponential backoff para 429 errors
  - [ ] Timeout de 30s em todas as requests
  - [ ] Logging estruturado de todas as calls
  - [ ] Validação de responses com Zod

#### 2.4. Services

- [ ] **services/MLTokenService.ts**
  - [ ] `getValidToken(integrationId)` - retorna token válido, refresh se necessário
  - [ ] `refreshToken(integrationId)` - faz refresh do token
  - [ ] `encryptToken(token)` - AES-256-GCM encryption
  - [ ] `decryptToken(encrypted)` - AES-256-GCM decryption

- [ ] **services/MLAuthService.ts**
  - [ ] `initiateOAuth()` - gera URL + PKCE
  - [ ] `handleCallback(code, state)` - troca code por tokens
  - [ ] `revokeIntegration(integrationId)` - revoga tokens

- [ ] **services/MLProductService.ts**
  - [ ] `syncAllProducts(integrationId)` - sync completo com multiget
  - [ ] `syncSingleProduct(integrationId, mlItemId)` - sync de 1 produto
  - [ ] `fetchProductDetails(mlItemId)` - busca detalhes na API
  - [ ] Implementar padrão correto: IDs → multiget → upsert

- [ ] **services/MLOrderService.ts**
  - [ ] `syncAllOrders(integrationId)` - sync de pedidos
  - [ ] `syncSingleOrder(integrationId, mlOrderId)` - sync de 1 pedido

- [ ] **services/MLQuestionService.ts**
  - [ ] `syncAllQuestions(integrationId)` - sync de perguntas
  - [ ] `answerQuestion(integrationId, questionId, answer)` - responder pergunta

- [ ] **services/MLWebhookService.ts**
  - [ ] `processWebhook(payload)` - processa notificação
  - [ ] `handleItemsNotification(resource)` - produto atualizado
  - [ ] `handleOrdersNotification(resource)` - pedido atualizado
  - [ ] `handleQuestionsNotification(resource)` - nova pergunta

- [ ] **services/MLSyncService.ts** (orchestrator)
  - [ ] `fullSync(integrationId)` - synca tudo (products + orders + questions)
  - [ ] `logSyncStart(integrationId, type)` - cria log de início
  - [ ] `logSyncComplete(logId, stats)` - atualiza log com resultado

#### 2.5. Repositories

- [ ] **repositories/MLIntegrationRepository.ts**
  - [ ] `findById(id)`, `findByUserId(userId)`, `findByTenantId(tenantId)`
  - [ ] `create(data)`, `update(id, data)`, `delete(id)`
  - [ ] `updateTokens(id, tokens)`, `updateSyncTime(id)`

- [ ] **repositories/MLProductRepository.ts**
  - [ ] `findByIntegration(integrationId)`, `findByMlItemId(mlItemId)`
  - [ ] `upsert(data)`, `upsertBatch(data[])`
  - [ ] `delete(id)`, `deleteByIntegration(integrationId)`

- [ ] **repositories/MLOrderRepository.ts**
  - [ ] Similar ao product repository

- [ ] **repositories/MLQuestionRepository.ts**
  - [ ] Similar ao product repository

---

### 🌐 FASE 3: API Routes (2-3h)

- [ ] **app/api/ml/auth/login/route.ts**
  - [ ] POST - inicia OAuth flow, retorna URL de autorização

- [ ] **app/api/ml/auth/callback/route.ts**
  - [ ] GET - recebe callback, troca code por tokens, salva integração

- [ ] **app/api/ml/products/route.ts**
  - [ ] GET - lista produtos (paginado)

- [ ] **app/api/ml/products/sync/route.ts**
  - [ ] POST - trigger sync de produtos

- [ ] **app/api/ml/products/[id]/route.ts**
  - [ ] GET - detalhe de 1 produto
  - [ ] DELETE - remove produto do DB (não do ML!)

- [ ] **app/api/ml/orders/route.ts**
  - [ ] GET - lista pedidos (paginado, filtros)

- [ ] **app/api/ml/orders/sync/route.ts**
  - [ ] POST - trigger sync de pedidos

- [ ] **app/api/ml/questions/route.ts**
  - [ ] GET - lista perguntas (não respondidas first)

- [ ] **app/api/ml/questions/sync/route.ts**
  - [ ] POST - trigger sync de perguntas

- [ ] **app/api/ml/questions/[id]/answer/route.ts**
  - [ ] POST - responde pergunta

- [ ] **app/api/ml/webhooks/route.ts**
  - [ ] POST - recebe notificações do ML, processa async

- [ ] **app/api/ml/sync/full/route.ts**
  - [ ] POST - sync completo (products + orders + questions)

---

### 🎨 FASE 4: Frontend Components (2-3h)

- [ ] **components/ml/MLConnectButton.tsx**
  - [ ] Botão para conectar conta ML
  - [ ] Mostra status da integração

- [ ] **components/ml/ProductList.tsx**
  - [ ] Lista produtos com paginação
  - [ ] Filtros por status
  - [ ] Botão "Sincronizar Agora"

- [ ] **components/ml/ProductCard.tsx**
  - [ ] Card individual de produto
  - [ ] Mostra imagem, título, preço, estoque, vendidos

- [ ] **components/ml/OrderList.tsx**
  - [ ] Lista pedidos com filtros

- [ ] **components/ml/QuestionList.tsx**
  - [ ] Lista perguntas não respondidas
  - [ ] Form para responder inline

- [ ] **components/ml/SyncStatus.tsx**
  - [ ] Mostra status do último sync
  - [ ] Progress bar durante sync
  - [ ] Estatísticas (produtos synced, erros, etc)

- [ ] **app/ml/page.tsx** - Dashboard principal ML
  - [ ] Overview de produtos, pedidos, perguntas
  - [ ] Botões de sync rápido
  - [ ] Últimos logs de sync

- [ ] **app/ml/produtos/page.tsx**
  - [ ] Página completa de gerenciamento de produtos

- [ ] **app/ml/pedidos/page.tsx**
  - [ ] Página completa de pedidos

- [ ] **app/ml/perguntas/page.tsx**
  - [ ] Página completa de perguntas

---

### 🧪 FASE 5: Testes (3-4h)

#### 5.1. Setup de Testes

- [ ] **Instalar dependências**
  ```bash
  npm install -D vitest @testing-library/react @testing-library/jest-dom
  npm install -D @vitest/ui
  ```

- [ ] **Configurar vitest**
  ```typescript
  // vitest.config.ts
  ```

#### 5.2. Testes Unitários

- [ ] **services/MLTokenService.test.ts**
  - [ ] Testa getValidToken com token válido
  - [ ] Testa getValidToken com token expirado (deve fazer refresh)
  - [ ] Testa refreshToken com sucesso
  - [ ] Testa refreshToken com erro
  - [ ] Testa encrypt/decrypt

- [ ] **services/MLProductService.test.ts**
  - [ ] Testa syncAllProducts - fluxo completo
  - [ ] Testa fetchAllProductIds com paginação
  - [ ] Testa fetchProductDetailsBatch com multiget
  - [ ] Testa tratamento de erros da API

- [ ] **repositories/MLProductRepository.test.ts**
  - [ ] Testa upsert de produto
  - [ ] Testa upsertBatch
  - [ ] Testa queries (findByIntegration, etc)

#### 5.3. Testes de Integração

- [ ] **ml-oauth-flow.test.ts**
  - [ ] Testa fluxo OAuth completo (mock da API ML)

- [ ] **ml-product-sync.test.ts**
  - [ ] Testa sync completo end-to-end com banco de teste

- [ ] **ml-webhook-processing.test.ts**
  - [ ] Testa processamento de diferentes tipos de webhook

#### 5.4. Testes E2E (opcional)

- [ ] **ml-complete-flow.test.ts**
  - [ ] Conecta ML → Synca produtos → Verifica no banco

---

### 📚 FASE 6: Documentação (1-2h)

- [ ] **README.md** - Atualizar seção de ML Integration
  - [ ] Como conectar conta ML
  - [ ] Como fazer sync manual
  - [ ] Como configurar webhooks
  - [ ] Troubleshooting comum

- [ ] **docs/pt/INTEGRACAO_ML.md** - Guia completo
  - [ ] Arquitetura da integração
  - [ ] Fluxo de dados (diagramas)
  - [ ] Tabelas do banco
  - [ ] Endpoints da API
  - [ ] Como funciona o OAuth
  - [ ] Como funciona o sync
  - [ ] Como funcionam os webhooks

- [ ] **docs/pt/TROUBLESHOOTING_ML.md**
  - [ ] Produtos não sincronizando → possíveis causas
  - [ ] Token expirado → como resolver
  - [ ] Erros comuns da API ML
  - [ ] Como verificar logs
  - [ ] Como reconectar integração

- [ ] **Comentários no código**
  - [ ] JSDoc em todas as funções públicas
  - [ ] Comentários explicativos em lógica complexa

---

### 🚀 FASE 7: Deploy e Validação (1-2h)

- [ ] **7.1. Commit e Push**
  ```bash
  git add .
  git commit -m "feat: complete ML integration refactor

  - New database schema with proper normalization
  - Service layer with correct ML API multiget pattern
  - Repository pattern for data access
  - Comprehensive error handling and logging
  - RLS policies with security_invoker
  - Full test coverage
  - Complete documentation
  
  BREAKING CHANGE: All ML integrations need to be reconnected"
  
  git push origin main
  ```

- [ ] **7.2. Aguardar Deploy Vercel**
  - [ ] Verificar build passou
  - [ ] Verificar não há erros de TypeScript

- [ ] **7.3. Reconectar Conta ML**
  - [ ] Acessar `/ml` no dashboard
  - [ ] Clicar "Conectar Mercado Livre"
  - [ ] Autorizar no ML
  - [ ] Verificar integração criada no banco

- [ ] **7.4. Testar Sync de Produtos**
  - [ ] Clicar "Sincronizar Produtos"
  - [ ] Aguardar conclusão
  - [ ] Verificar mensagem: "✅ 90+ produtos sincronizados"
  - [ ] Verificar produtos aparecem na lista

- [ ] **7.5. Verificar Logs**
  - [ ] Supabase Dashboard → Logs
  - [ ] Verificar sem erros
  - [ ] Verificar queries corretas
  - [ ] Sentry → verificar sem erros

- [ ] **7.6. Testar Outros Fluxos**
  - [ ] Sync de pedidos
  - [ ] Sync de perguntas
  - [ ] Responder uma pergunta
  - [ ] Processar webhook (simular)

- [ ] **7.7. Monitoramento 24h**
  - [ ] Verificar logs a cada 6h
  - [ ] Verificar sem erros recorrentes
  - [ ] Verificar performance OK
  - [ ] Verificar auto-sync funcionando (se habilitado)

---

## 🎯 CRITÉRIOS DE ACEITAÇÃO

### Must Have ✅
- [ ] Migration aplicada sem erros
- [ ] Tabelas criadas corretamente com RLS
- [ ] OAuth flow funcionando
- [ ] Token refresh automático funcionando
- [ ] Sync de produtos com multiget correto (90+ produtos)
- [ ] Sync de pedidos funcionando
- [ ] Sync de perguntas funcionando
- [ ] Webhooks sendo recebidos e processados
- [ ] Frontend mostrando dados corretamente
- [ ] Zero erros em produção após 24h

### Should Have 🎨
- [ ] Testes automatizados (80%+ cobertura)
- [ ] Documentação completa
- [ ] Logs estruturados em toda a aplicação
- [ ] Error handling robusto
- [ ] Loading states no frontend
- [ ] Retry logic com exponential backoff

### Nice to Have 🌟
- [ ] Dashboard de estatísticas ML
- [ ] Gráficos de vendas
- [ ] Notificações de novas perguntas
- [ ] Resposta automática com IA
- [ ] Exportação de dados para Excel

---

## 🚨 PRÓXIMOS PASSOS IMEDIATOS

**AGORA (você deve fazer):**

1. **Acesse Supabase Dashboard**
   - URL: https://supabase.com/dashboard/project/pnzbnciiokgiadkfgrcn
   - Vá em SQL Editor

2. **Execute o diagnóstico**
   - Copie: `scripts/diagnose_ml_database.sql`
   - Cole no SQL Editor
   - Execute
   - Salve resultados em um arquivo `.txt`

3. **Compartilhe os resultados**
   - Envie o resultado do diagnóstico
   - Vou analisar e criar a migration perfeita

4. **Decidir sobre dados existentes**
   - Se houver integrações ativas: criar script de migração de dados
   - Se não houver: DROP simples e recria tudo limpo

**Perguntas para você:**
- Quantas integrações ML ativas você tem agora?
- Há dados importantes que precisam ser preservados?
- Prefere DROP total e reconectar tudo, ou migração preservando dados?

---

**Vamos começar?** Execute o passo 2 (diagnóstico SQL) e me mostre os resultados! 🚀
