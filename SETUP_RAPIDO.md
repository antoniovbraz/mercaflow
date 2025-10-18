# ⚡ Setup Rápido - MercaFlow

## Para quem acabou de clonar o repositório

Siga estes passos **na ordem**:

---

## 1️⃣ Instalar Dependências

```powershell
npm install
```

⏱️ **Aguarde:** ~2 minutos

---

## 2️⃣ Criar Arquivo de Variáveis de Ambiente

```powershell
copy .env.example .env.local
```

---

## 3️⃣ Configurar Credenciais

Abra `.env.local` e preencha:

### 🔴 OBRIGATÓRIO:

```bash
# Supabase (crie em: https://supabase.com)
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-aqui
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key-aqui

# Mercado Livre (crie em: https://developers.mercadolibre.com.br/)
ML_CLIENT_ID=seu-client-id
ML_CLIENT_SECRET=seu-client-secret
ML_REDIRECT_URI=http://localhost:3000/api/ml/auth/callback

# Gerar com: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
ENCRYPTION_KEY=sua-chave-de-32-caracteres-aqui
```

### 🟡 OPCIONAL (pode deixar vazio):

```bash
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
OPENAI_API_KEY=
SENTRY_AUTH_TOKEN=
```

---

## 4️⃣ Configurar Banco de Dados

### Conectar ao Supabase:

```powershell
npx supabase link --project-ref SEU_PROJECT_REF
```

### Aplicar Migrations (criar tabelas):

```powershell
npx supabase db push
```

---

## 5️⃣ Rodar o Projeto

```powershell
npm run dev
```

### ✅ Pronto!

Acesse: **http://localhost:3000**

---

## 📊 Resumo Visual

```
Clonou repo
    ↓
npm install (2 min)
    ↓
Criar .env.local
    ↓
Preencher credenciais Supabase + ML
    ↓
npx supabase link
    ↓
npx supabase db push
    ↓
npm run dev
    ↓
🎉 localhost:3000
```

---

## ❓ Onde conseguir as credenciais?

### Supabase:

1. Acesse: https://supabase.com/
2. Crie projeto (grátis)
3. Settings → API
4. Copie as 3 chaves

### Mercado Livre:

1. Acesse: https://developers.mercadolibre.com.br/
2. Meus Apps → Criar Aplicação
3. Copie Client ID e Secret Key

### Chave de Criptografia:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 🆘 Problemas?

### "Port 3000 already in use"

```powershell
npx kill-port 3000
```

### "Cannot find module"

```powershell
Remove-Item -Recurse -Force node_modules
npm install
```

### Variáveis não carregam

- Salve o `.env.local`
- Pare o servidor (Ctrl + C)
- Rode `npm run dev` novamente

---

## 📚 Guia Completo

Para explicação detalhada, veja: **GUIA_INICIANTE.md**
