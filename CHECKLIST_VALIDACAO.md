# ✅ Checklist de Validação Pré-Implementação
*Verificar todos os itens antes de começar o desenvolvimento*

## 🔐 CREDENCIAIS E ACESSOS

### MercadoLibre DevCenter
- [ ] **Aplicação criada** em https://developers.mercadolivre.com.br/devcenter
- [ ] **Nome**: "Merca Flow Brasil" ✓
- [ ] **Client ID** salvo com segurança
- [ ] **Client Secret** salvo com segurança  
- [ ] **Callback URL** configurada: `https://mercaflow.vercel.app/api/auth/callback`
- [ ] **Notification URL** configurada: `https://mercaflow.vercel.app/api/webhooks/ml`
- [ ] **Tópicos** selecionados: orders_v2, items, messages, catalog_item_competition_status, price_suggestion

### Supabase
- [ ] **Projeto criado**: "mercaflow-brasil"
- [ ] **Região**: South America (São Paulo)
- [ ] **Database** configurado com tabelas
- [ ] **RLS** habilitado nas tabelas
- [ ] **URL** salva: `https://xxxxx.supabase.co`
- [ ] **Anon Key** salva (pública)
- [ ] **Service Role Key** salva (privada)

### Vercel  
- [ ] **Projeto criado**: "mercaflow"
- [ ] **Conectado ao GitHub** 
- [ ] **Variáveis de ambiente** configuradas
- [ ] **Domain** funcionando: `https://mercaflow.vercel.app`
- [ ] **Build** funcionando

### GitHub
- [ ] **Repositório criado**: "mercaflow" 
- [ ] **Visibilidade**: Private
- [ ] **Clone local** funcionando
- [ ] **.gitignore** configurado para Node.js
- [ ] **.env.local** no .gitignore

---

## 📋 CONFORMIDADE DE NOMES

### Padrão de Nomenclatura
- [ ] **Projeto**: "mercaflow" (minúsculo, sem espaços)
- [ ] **Database**: "mercaflow-brasil" 
- [ ] **Repository**: "mercaflow"
- [ ] **Domain**: "mercaflow.vercel.app"
- [ ] **ML App**: "Merca Flow Brasil" (apenas aqui com espaços)

### Variáveis de Ambiente
- [ ] **Prefixos consistentes**: ML_*, SUPABASE_*, NEXTAUTH_*
- [ ] **Valores preenchidos** em .env.local
- [ ] **Valores configurados** no Vercel
- [ ] **.env.example** criado sem valores sensíveis

---

## 🔗 URLs E ENDPOINTS

### URLs Críticas Salvos
- [ ] **DevCenter**: https://developers.mercadolivre.com.br/devcenter
- [ ] **Supabase Dashboard**: https://supabase.com/dashboard
- [ ] **Vercel Dashboard**: https://vercel.com/dashboard  
- [ ] **GitHub Repo**: https://github.com/USERNAME/mercaflow
- [ ] **App URL**: https://mercaflow.vercel.app

### Endpoints Configurados
- [ ] **OAuth Callback**: `/api/auth/callback`
- [ ] **Webhook Handler**: `/api/webhooks/ml`
- [ ] **Test Endpoint**: `/api/test` (para validação)

---

## 🧪 TESTES DE CONECTIVIDADE

### Teste 1: Variáveis de Ambiente
```bash
# No terminal do projeto
echo $ML_CLIENT_ID          # Deve mostrar o ID
echo $NEXT_PUBLIC_SUPABASE_URL  # Deve mostrar URL do Supabase
```
- [ ] **ML_CLIENT_ID** visível
- [ ] **SUPABASE_URL** visível  
- [ ] **Sem valores vazios** ou undefined

### Teste 2: Supabase Connection
```sql
-- No SQL Editor do Supabase
SELECT COUNT(*) FROM users;  -- Deve retornar 0 (tabela vazia)
```
- [ ] **Query executada** com sucesso
- [ ] **Tabelas existem**: users, webhooks_log
- [ ] **RLS ativo** nas tabelas

### Teste 3: Vercel Deploy
```
https://mercaflow.vercel.app
```
- [ ] **Site carrega** sem erro 404
- [ ] **Environment variables** disponíveis no build
- [ ] **Domain** acessível

### Teste 4: MercadoLibre API
```bash
# Teste simples com curl
curl "https://api.mercadolibre.com/sites/MLB"
```
- [ ] **API responde** com dados do Brasil
- [ ] **Sem rate limit** errors
- [ ] **JSON válido** retornado

---

## 🚨 SEGURANÇA E COMPLIANCE

### Dados Sensíveis
- [ ] **.env.local** no .gitignore
- [ ] **Secrets** nunca commitados
- [ ] **Client Secret** salvo com segurança (1Password/Bitwarden) 
- [ ] **Service Role Key** salvo com segurança

### URLs de Callback
- [ ] **HTTPS obrigatório** em produção
- [ ] **URLs exatas** na aplicação ML (sem / extra)
- [ ] **Domains verificados** no Vercel

### Rate Limiting
- [ ] **Entender limites** do ML (não documentados)
- [ ] **Implementar retry logic** para APIs
- [ ] **Queue system** planejado para webhooks

---

## 🏗️ ESTRUTURA DE DESENVOLVIMENTO

### Ambiente Local  
- [ ] **Node.js** instalado (v18+)
- [ ] **Git** configurado
- [ ] **ngrok** instalado (para webhooks locais)
- [ ] **Editor** configurado (VSCode recomendado)

### Dependências Críticas
- [ ] **Next.js** (framework)
- [ ] **TypeScript** (type safety) 
- [ ] **@supabase/supabase-js** (database)
- [ ] **next-auth** (autenticação)
- [ ] **axios** (HTTP client)

### Scripts de Desenvolvimento
```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start", 
  "type-check": "tsc --noEmit"
}
```
- [ ] **Scripts** configurados no package.json
- [ ] **TypeScript** funcionando
- [ ] **Hot reload** ativo em desenvolvimento

---

## 🎯 PRÓXIMOS PASSOS VALIDADOS

### Implementação Fase 1 (MVP)
- [ ] **OAuth Flow** com MercadoLibre
- [ ] **Webhook Handler** básico  
- [ ] **Dashboard** de login
- [ ] **Lista de produtos** do usuário

### Testes de Integração
- [ ] **Login ML** funcionando
- [ ] **Webhook** recebido e logado
- [ ] **API calls** para ML funcionando
- [ ] **Dados** persistindo no Supabase

### Deploy e Produção
- [ ] **Build** sem erros
- [ ] **Environment variables** em produção
- [ ] **HTTPS** funcionando
- [ ] **Webhooks** chegando na Vercel

---

## ⚡ VALIDAÇÃO FINAL

### Comando de Teste Completo
```bash
# Clonar e configurar
git clone https://github.com/USERNAME/mercaflow.git
cd mercaflow
cp .env.example .env.local
# Preencher .env.local com valores reais
npm install
npm run dev
# Acessar: http://localhost:3000/api/test
```

### Resposta Esperada do /api/test
```json
{
  "status": "OK",
  "timestamp": "2025-10-02T...",
  "env": {
    "hasMLClientId": true,
    "hasSupabaseUrl": true,
    "nodeEnv": "development"
  },
  "connections": {
    "supabase": "connected",
    "mercadolibre": "ready"
  }
}
```

---

## 🚀 PRONTO PARA IMPLEMENTAR!

Se todos os itens acima estão ✅, você está **100% pronto** para começar o desenvolvimento do Merca Flow com:

- ✅ **Infraestrutura completa** configurada
- ✅ **Credenciais** todas obtidas
- ✅ **Nomes** padronizados e consistentes  
- ✅ **Segurança** implementada
- ✅ **Testes** validados

**Próximo passo**: Implementar o OAuth flow e primeiro webhook! 🎉

---

*Checklist validado com base no estudo completo das APIs MercadoLibre Brasil*