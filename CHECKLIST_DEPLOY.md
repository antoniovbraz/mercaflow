# 🚀 Checklist de Deploy - MercaFlow ML Integration

**Data de Criação**: 19 de Outubro de 2025  
**Status Atual**: ✅ Código pronto, aguardando deploy

---

## ✅ PRÉ-REQUISITOS (COMPLETOS)

- [x] Schema do banco criado e validado
- [x] 7 tabelas ML com RLS 100% habilitado
- [x] Services implementados (MLTokenService, MLProductService, MLApiClient)
- [x] Repositories implementados (MLIntegration, MLProduct, MLSyncLog)
- [x] 3 rotas críticas refatoradas
- [x] Bug crítico corrigido (access_token vs encrypted_access_token)
- [x] Código pushed para GitHub
- [x] Documentação completa criada

---

## 📋 CHECKLIST DE DEPLOY

### 1. Vercel Deploy

- [ ] **Fazer deploy via Vercel Dashboard ou CLI**
  ```bash
  vercel deploy --prod
  ```
- [ ] **Verificar build bem-sucedido**
- [ ] **Verificar URL de produção ativa**

### 2. Environment Variables (Vercel)

Configure estas variáveis no Vercel Dashboard → Settings → Environment Variables:

#### Supabase:
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - Exemplo: `https://xxxxxxxxxxxxxx.supabase.co`
  - Obter em: Supabase Dashboard → Settings → API

- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - Chave pública (anon key)
  - Obter em: Supabase Dashboard → Settings → API

- [ ] `SUPABASE_SERVICE_ROLE_KEY`
  - ⚠️ CRÍTICO: Manter secreto!
  - Apenas para webhooks/operações de sistema
  - Obter em: Supabase Dashboard → Settings → API

#### Mercado Livre OAuth:
- [ ] `ML_CLIENT_ID`
  - Obter em: https://developers.mercadolibre.com.br/apps
  - ID do aplicativo ML

- [ ] `ML_CLIENT_SECRET`
  - ⚠️ CRÍTICO: Manter secreto!
  - Secret do aplicativo ML

- [ ] `ML_REDIRECT_URI`
  - Exemplo: `https://seu-dominio.vercel.app/api/ml/auth/callback`
  - Deve estar cadastrado no app ML

#### Encryption:
- [ ] `ENCRYPTION_KEY`
  - ⚠️ CRÍTICO: Manter secreto!
  - Mínimo 32 caracteres
  - Gerar: `openssl rand -base64 32`
  - Usado para criptografar tokens ML

#### Sentry (Opcional mas recomendado):
- [ ] `SENTRY_DSN`
  - Para tracking de erros
  - Obter em: https://sentry.io

- [ ] `SENTRY_AUTH_TOKEN`
  - Para upload de source maps
  - Obter em: Sentry → Settings → Auth Tokens

#### Next.js:
- [ ] `NEXTAUTH_SECRET`
  - Se usar NextAuth
  - Gerar: `openssl rand -base64 32`

### 3. Configuração ML App

No Mercado Livre Developers (https://developers.mercadolibre.com.br/apps):

- [ ] **Adicionar Redirect URI**
  - `https://seu-dominio.vercel.app/api/ml/auth/callback`

- [ ] **Configurar Notifications URL (Webhooks)**
  - `https://seu-dominio.vercel.app/api/ml/webhooks/notifications`
  - Topics: `items`, `orders`, `questions`

- [ ] **Verificar Scopes necessários**
  - `read` - Ler dados
  - `write` - Escrever dados
  - `offline_access` - Refresh token

### 4. Verificação Pós-Deploy

- [ ] **Acessar URL de produção**
  - https://seu-dominio.vercel.app

- [ ] **Verificar página inicial carrega**

- [ ] **Fazer login**
  - Criar conta ou usar existente

- [ ] **Verificar conexão com Supabase**
  - Dashboard deve carregar dados do usuário

### 5. Teste do OAuth Flow

- [ ] **Acessar Dashboard ML**
  - https://seu-dominio.vercel.app/dashboard/ml

- [ ] **Clicar em "Conectar com Mercado Livre"**

- [ ] **Autorizar no ML**
  - Redireciona para ML
  - Login no ML
  - Autoriza aplicativo

- [ ] **Verificar redirect de volta**
  - Deve voltar para `/dashboard/ml?connected=success`

- [ ] **Verificar integração salva**
  - Fazer GET `/api/ml/integration`
  - Deve retornar `{ connected: true, integration: {...} }`

- [ ] **Verificar no Supabase**
  - Tabela `ml_integrations` deve ter 1 registro
  - Campo `access_token` deve estar preenchido (criptografado)
  - Campo `status` deve ser `active`

### 6. Teste de Sincronização 🎯 **CRÍTICO**

- [ ] **Trigger manual sync**
  - POST `/api/ml/products/sync-all`
  - Ou usar botão no dashboard

- [ ] **Monitorar logs**
  - Vercel Dashboard → Functions → Logs
  - Procurar por "Products synced successfully"

- [ ] **Verificar ml_products table**
  ```sql
  SELECT COUNT(*) FROM ml_products;
  ```
  - **Esperado**: 90+ registros

- [ ] **Verificar dados dos produtos**
  ```sql
  SELECT 
    ml_item_id,
    title,
    price,
    status,
    created_at
  FROM ml_products
  LIMIT 5;
  ```
  - Campos devem estar preenchidos corretamente

- [ ] **Verificar sync logs**
  ```sql
  SELECT 
    sync_type,
    status,
    items_processed,
    items_success,
    items_failed,
    error_message
  FROM ml_sync_logs
  ORDER BY started_at DESC
  LIMIT 5;
  ```
  - Status deve ser `success`
  - `items_success` deve ser 90+
  - `items_failed` deve ser 0

### 7. Teste de Listagem

- [ ] **Acessar página de produtos**
  - https://seu-dominio.vercel.app/produtos

- [ ] **Verificar produtos aparecem**
  - Deve mostrar 90+ produtos
  - Com imagens, preços, status

- [ ] **Testar filtros e busca**
  - Buscar por nome de produto
  - Filtrar por status

### 8. Monitoramento

- [ ] **Configurar Sentry Alerts**
  - Erros críticos → Email/Slack

- [ ] **Verificar logs no Vercel**
  - Acessar regularmente
  - Procurar por erros

- [ ] **Monitorar uso de API ML**
  - ML tem rate limits
  - 10k requests/hora tipicamente

### 9. Performance

- [ ] **Verificar tempo de sync**
  - 90+ produtos deve levar <30 segundos
  - Se demorar muito, investigar

- [ ] **Verificar uso de RAM**
  - Vercel Dashboard → Analytics
  - Não deve exceder limite da tier

- [ ] **Verificar cold starts**
  - Primeira request pode ser lenta
  - Normal em serverless

---

## 🔧 TROUBLESHOOTING

### OAuth não funciona:

1. **Verificar ML_REDIRECT_URI**
   - Deve ser EXATAMENTE o cadastrado no ML
   - Incluir protocolo (https://)
   - Sem trailing slash

2. **Verificar ML_CLIENT_ID e ML_CLIENT_SECRET**
   - Copiar novamente do ML Dashboard
   - Sem espaços extras

3. **Verificar state expirado**
   - States expiram em 10 minutos
   - Tentar novamente

### Sync falha:

1. **Verificar tokens**
   ```sql
   SELECT 
     token_expires_at,
     status,
     last_error
   FROM ml_integrations;
   ```
   - Se expirado, fazer refresh manual

2. **Verificar ENCRYPTION_KEY**
   - Deve ser o mesmo usado para criptografar
   - Se mudou, tokens ficam inválidos

3. **Verificar logs no Vercel**
   - Procurar por erros ML API
   - Status 401: token inválido
   - Status 429: rate limit

### Produtos não aparecem:

1. **Verificar RLS policies**
   ```sql
   SELECT * FROM pg_policies 
   WHERE tablename = 'ml_products';
   ```

2. **Verificar tenant_id**
   - User e integration devem ter mesmo tenant_id

3. **Verificar diretamente no Supabase**
   ```sql
   SELECT COUNT(*) FROM ml_products;
   ```
   - Se 0, sync não funcionou

---

## ✅ SUCCESS CRITERIA

Considere o deploy bem-sucedido quando:

- [x] ✅ OAuth flow completo funciona
- [x] ✅ 90+ produtos sincronizados
- [x] ✅ Produtos aparecem no dashboard
- [x] ✅ Tokens criptografados corretamente
- [x] ✅ RLS funcionando (users só veem seus dados)
- [x] ✅ Sem erros no Sentry
- [x] ✅ Logs de sync mostram sucesso

---

## 📞 SUPORTE

**Documentação**:
- `FASE4_REFATORACAO_COMPLETA.md` - Detalhes técnicos
- `FASE4_RESUMO_EXECUTIVO.md` - Resumo rápido
- `docs/pt/VERIFICACAO_TABELAS_ML.md` - SQL queries

**Logs**:
- Vercel: https://vercel.com/dashboard/logs
- Sentry: https://sentry.io
- Supabase: https://supabase.com/dashboard/logs

**APIs**:
- ML Docs: https://developers.mercadolibre.com.br/
- Supabase Docs: https://supabase.com/docs

---

**Criado em**: 19 de Outubro de 2025  
**Última atualização**: 19 de Outubro de 2025  
**Status**: ⏳ Aguardando deploy
