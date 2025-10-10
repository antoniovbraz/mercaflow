# Guia de Configuração do Sentry

## 🎯 Passo a Passo para Integrar com Vercel

### 1️⃣ Obter Credenciais no Sentry.io

1. Acesse [sentry.io](https://sentry.io) e faça login
2. Crie um novo projeto ou selecione um existente
3. Vá em **Settings** > **Projects** > **[Seu Projeto]** > **Client Keys (DSN)**
4. Copie o **DSN** (exemplo: `https://abc123@o123456.ingest.sentry.io/123456`)
5. Anote também:
   - **Organization Slug** (exemplo: `mercaflow`)
   - **Project Slug** (exemplo: `mercaflow-nextjs`)

### 2️⃣ Configurar Variáveis de Ambiente Localmente

Adicione no arquivo `.env.local`:

```bash
# Sentry Configuration
NEXT_PUBLIC_SENTRY_DSN=https://YOUR_DSN_HERE@o123456.ingest.sentry.io/123456
SENTRY_ORG=seu-organization-slug
SENTRY_PROJECT=seu-project-slug

# Auth Token para upload de source maps (obtenha em sentry.io/settings/account/api/auth-tokens/)
SENTRY_AUTH_TOKEN=seu-auth-token-aqui
```

### 3️⃣ Criar Auth Token no Sentry

1. Vá em [sentry.io/settings/account/api/auth-tokens/](https://sentry.io/settings/account/api/auth-tokens/)
2. Clique em **Create New Token**
3. Dê um nome: `Vercel Source Maps`
4. Selecione as permissões:
   - ✅ `project:read`
   - ✅ `project:releases`
   - ✅ `org:read`
5. Copie o token gerado (começa com `sntrys_`)

### 4️⃣ Configurar no Vercel

#### Opção A: Via Dashboard do Vercel (Recomendado)

1. Acesse [vercel.com/dashboard](https://vercel.com/dashboard)
2. Selecione seu projeto **mercaflow**
3. Vá em **Settings** > **Environment Variables**
4. Adicione as seguintes variáveis:

| Nome | Valor | Ambiente |
|------|-------|----------|
| `NEXT_PUBLIC_SENTRY_DSN` | `https://...` | Production, Preview, Development |
| `SENTRY_ORG` | `seu-org-slug` | Production, Preview, Development |
| `SENTRY_PROJECT` | `seu-project-slug` | Production, Preview, Development |
| `SENTRY_AUTH_TOKEN` | `sntrys_...` | Production, Preview, Development |

5. Clique em **Save**

#### Opção B: Via Integração Oficial (Mais Fácil)

1. No Vercel Dashboard, vá em **Integrations**
2. Procure por **Sentry**
3. Clique em **Add Integration**
4. Autorize a conexão entre Vercel e Sentry
5. Selecione o projeto **mercaflow**
6. As variáveis serão configuradas automaticamente! ✨

### 5️⃣ Testar Localmente

```bash
# Instalar dependências (já feito)
npm install

# Executar em desenvolvimento
npm run dev

# Testar erro manualmente
# Acesse: http://localhost:3000/api/debug-sentry
# Ou adicione em qualquer página:
# throw new Error('Teste do Sentry');
```

### 6️⃣ Deploy e Validação

```bash
# Fazer commit e push
git add -A
git commit -m "feat: Integrar Sentry para monitoramento de erros"
git push origin main

# O Vercel vai:
# 1. Fazer build com Sentry configurado
# 2. Upload automático de source maps
# 3. Instrumentação de erros habilitada
```

Depois do deploy, acesse:
- **Dashboard Sentry**: [sentry.io/organizations/SEU_ORG/issues/](https://sentry.io)
- **Teste de erro**: Acesse sua aplicação e force um erro para validar

---

## 🔧 Configurações Importantes

### Source Maps

Os source maps são automaticamente enviados para o Sentry durante o build no Vercel. Isso permite que você veja o código original (não minificado) nos stack traces.

**Configuração no `next.config.ts`:**
```typescript
sourcemaps: {
  deleteSourcemapsAfterUpload: true, // Remove source maps do bundle público
}
```

### Filtragem de Erros

O Sentry está configurado para **NÃO** capturar:
- ❌ Logs de `info` ou `warning`
- ❌ Erros comuns do browser (`ResizeObserver`, `cancelled`, `Failed to fetch`)
- ❌ Headers sensíveis (`authorization`, `cookie`)
- ❌ Query params com `access_token`

**Edite em:**
- `sentry.client.config.ts` - Filtros do browser
- `sentry.server.config.ts` - Filtros do servidor

### Performance Monitoring

**Configuração atual:**
- **Produção**: 10% das transações (reduz custos)
- **Desenvolvimento**: 100% das transações (debug completo)

**Para ajustar:**
```typescript
tracesSampleRate: 0.1, // 0.0 a 1.0 (0% a 100%)
```

### Session Replay

Captura replays de sessões com erros para debug visual.

**Configuração atual:**
- **Erros**: 100% das sessões com erros
- **Normal**: 10% das sessões sem erros

**Para ajustar:**
```typescript
replaysOnErrorSampleRate: 1.0, // Sessões com erro
replaysSessionSampleRate: 0.1,  // Sessões normais
```

---

## 🚨 Troubleshooting

### Erro: "Sentry DSN not found"
- ✅ Verifique se `NEXT_PUBLIC_SENTRY_DSN` está configurado no Vercel
- ✅ Certifique-se de que a variável começa com `NEXT_PUBLIC_` (obrigatório!)

### Source Maps não aparecem no Sentry
- ✅ Confirme que `SENTRY_AUTH_TOKEN` está configurado no Vercel
- ✅ Verifique se o token tem permissões `project:releases`
- ✅ Veja os logs de build do Vercel para erros de upload

### Muitos eventos sendo enviados
- ⚙️ Reduza `tracesSampleRate` em produção (ex: 0.05 = 5%)
- ⚙️ Adicione mais filtros em `beforeSend()`
- ⚙️ Use `ignoreErrors` para erros específicos

### Custos do Sentry
- 💰 Plano gratuito: 5.000 errors/month + 100 replays/month
- 💰 Monitore uso em: [sentry.io/settings/account/subscriptions/](https://sentry.io/settings/account/subscriptions/)
- 💰 Ajuste sample rates se necessário

---

## 📊 Próximos Passos

Após configurar o Sentry:

1. ✅ **Testar captura de erros**: Force um erro na aplicação
2. ✅ **Configurar alertas**: Configure notificações no Sentry
3. ✅ **Adicionar contexto**: Use `Sentry.setContext()` para dados adicionais
4. ✅ **Monitorar performance**: Analise transações lentas
5. ✅ **Revisar replays**: Veja sessões com erros

---

## 🔗 Links Úteis

- [Documentação Sentry Next.js](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Configuração Vercel](https://vercel.com/docs/integrations/sentry)
- [Best Practices](https://docs.sentry.io/platforms/javascript/best-practices/)
- [Performance Monitoring](https://docs.sentry.io/product/performance/)
- [Session Replay](https://docs.sentry.io/product/session-replay/)
