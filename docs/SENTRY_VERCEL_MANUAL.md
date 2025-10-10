# 🔧 Guia Rápido: Configurar Sentry no Vercel (Manual)

## ⚠️ Se você recebeu erro "Could not update VERCEL_GIT_COMMIT_SHA"

**Isso é NORMAL!** Essa variável é gerenciada pelo sistema do Vercel e não pode ser modificada.

**Solução**: Configure manualmente seguindo os passos abaixo (é mais seguro e dá mais controle).

---

## 📋 Passo a Passo Completo

### 1️⃣ Obter Credenciais no Sentry.io

#### A. Pegar o DSN (Data Source Name)

1. Acesse [sentry.io](https://sentry.io) e faça login
2. Vá em **Projects** no menu lateral
3. Selecione ou crie um projeto para o MercaFlow
4. Clique em **Settings** (⚙️) no canto superior direito
5. No menu lateral, clique em **Client Keys (DSN)**
6. **Copie o DSN completo** (exemplo: `https://abc123def456@o123456.ingest.sentry.io/7890123`)

   📋 **Anote em algum lugar:**
   ```
   DSN: https://___________@o_______.ingest.sentry.io/_______
   ```

#### B. Pegar Organization e Project Slugs

Ainda na página do Sentry, observe a URL:
```
https://sentry.io/organizations/SEU-ORG-SLUG/projects/SEU-PROJECT-SLUG/
```

📋 **Anote:**
```
Organization Slug: _________________
Project Slug: _________________
```

---

### 2️⃣ Criar Auth Token para Source Maps

1. Vá em [sentry.io/settings/account/api/auth-tokens/](https://sentry.io/settings/account/api/auth-tokens/)
2. Clique no botão **Create New Token**
3. Preencha:
   - **Name**: `Vercel Source Maps - MercaFlow`
   - **Scopes** (marque estas 3 opções):
     - ✅ `project:read`
     - ✅ `project:releases`
     - ✅ `org:read`
4. Clique em **Create Token**
5. **COPIE O TOKEN AGORA** (só aparece uma vez!)

   📋 **Anote:**
   ```
   Auth Token: sntrys_________________________________
   ```

---

### 3️⃣ Adicionar Variáveis de Ambiente no Vercel

1. Acesse [vercel.com/dashboard](https://vercel.com/dashboard)
2. Selecione o projeto **mercaflow**
3. Clique em **Settings** (no topo)
4. No menu lateral, clique em **Environment Variables**
5. Adicione **QUATRO variáveis** (uma por vez):

#### Variável 1: NEXT_PUBLIC_SENTRY_DSN

```
Name: NEXT_PUBLIC_SENTRY_DSN
Value: https://___________@o_______.ingest.sentry.io/_______
```

- **Environments**: Marque todas as 3 opções
  - ✅ Production
  - ✅ Preview
  - ✅ Development
- Clique em **Save**

#### Variável 2: SENTRY_ORG

```
Name: SENTRY_ORG
Value: seu-organization-slug
```

- **Environments**: Marque todas as 3 opções
  - ✅ Production
  - ✅ Preview
  - ✅ Development
- Clique em **Save**

#### Variável 3: SENTRY_PROJECT

```
Name: SENTRY_PROJECT
Value: seu-project-slug
```

- **Environments**: Marque todas as 3 opções
  - ✅ Production
  - ✅ Preview
  - ✅ Development
- Clique em **Save**

#### Variável 4: SENTRY_AUTH_TOKEN

```
Name: SENTRY_AUTH_TOKEN
Value: sntrys_seu-token-aqui
```

- **Environments**: Marque todas as 3 opções
  - ✅ Production
  - ✅ Preview
  - ✅ Development
- **⚠️ IMPORTANTE**: Marque a opção **Sensitive** (🔒) para ocultar o valor
- Clique em **Save**

---

### 4️⃣ Forçar Novo Deploy

Depois de adicionar todas as variáveis:

1. Vá em **Deployments** (no topo)
2. Clique nos **3 pontinhos (⋮)** do último deployment
3. Selecione **Redeploy**
4. Marque a opção **Use existing Build Cache**
5. Clique em **Redeploy**

---

### 5️⃣ Validar Integração

Aguarde o deploy completar (~2 minutos), depois:

1. **Teste o endpoint de debug**:
   ```
   https://mercaflow.vercel.app/api/debug-sentry
   ```

2. **Verifique no Sentry**:
   - Acesse [sentry.io](https://sentry.io)
   - Vá em **Issues** (menu lateral)
   - Deve aparecer um erro com a mensagem:
     ```
     🧪 This is a test error from /api/debug-sentry
     ```

3. **Verifique source maps**:
   - Clique no erro
   - Veja se o stack trace mostra **código TypeScript** (não JavaScript minificado)
   - Deve mostrar nomes de arquivos como `route.ts` em vez de `route.abc123.js`

---

## ✅ Checklist Final

Depois de configurar, confirme que:

- [ ] 4 variáveis adicionadas no Vercel
- [ ] Deploy bem-sucedido (sem erros de build)
- [ ] Endpoint `/api/debug-sentry` retorna erro 500 (esperado)
- [ ] Erro aparece no dashboard do Sentry
- [ ] Source maps funcionando (código legível no stack trace)

---

## 🐛 Troubleshooting

### Erro: "Sentry DSN not found"

**Sintoma**: Aplicação roda mas não envia erros para Sentry

**Causa**: Variável `NEXT_PUBLIC_SENTRY_DSN` não configurada ou incorreta

**Solução**:
1. Verifique se a variável existe no Vercel
2. Confirme que começa com `https://`
3. Refaça o deploy

### Erro: "Source maps upload failed"

**Sintoma**: Build bem-sucedido mas source maps não aparecem no Sentry

**Causa**: Token sem permissões ou incorreto

**Solução**:
1. Verifique o token em [sentry.io/settings/account/api/auth-tokens/](https://sentry.io/settings/account/api/auth-tokens/)
2. Confirme as permissões: `project:read`, `project:releases`, `org:read`
3. Se necessário, crie um novo token
4. Atualize `SENTRY_AUTH_TOKEN` no Vercel
5. Refaça o deploy

### Erro: "Organization/Project not found"

**Sintoma**: Build falha com erro de Sentry

**Causa**: `SENTRY_ORG` ou `SENTRY_PROJECT` incorretos

**Solução**:
1. Verifique os slugs na URL do Sentry:
   ```
   https://sentry.io/organizations/SEU-ORG/projects/SEU-PROJECT/
   ```
2. Atualize as variáveis no Vercel
3. Refaça o deploy

### Muitos eventos sendo enviados

**Sintoma**: Plano gratuito do Sentry esgotando rapidamente

**Solução**:
1. Edite `sentry.client.config.ts`
2. Reduza `tracesSampleRate` para `0.05` (5%)
3. Reduza `replaysSessionSampleRate` para `0.01` (1%)
4. Faça commit e push

---

## 📊 Próximos Passos

Depois de validar a integração:

1. **Configure alertas**:
   - Sentry → Settings → Alerts
   - Receba email/Slack quando houver erros

2. **Customize filtros**:
   - Edite `sentry.client.config.ts` e `sentry.server.config.ts`
   - Adicione mais erros para ignorar em `beforeSend()`

3. **Monitore performance**:
   - Sentry → Performance
   - Veja endpoints lentos e otimize

4. **Revise Session Replays**:
   - Sentry → Replays
   - Assista gravações de sessões com erros

---

## 🔗 Links Úteis

- [Dashboard Sentry](https://sentry.io)
- [Dashboard Vercel](https://vercel.com/dashboard)
- [Documentação Sentry + Next.js](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Documentação Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)

---

**Dúvidas?** Consulte `docs/SENTRY_SETUP.md` para informações detalhadas.
