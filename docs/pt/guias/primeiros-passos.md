# Merca Flow - Primeiros Passos Práticos
*Guia step-by-step para começar AGORA*

## 🎯 ORDEM DE EXECUÇÃO (CRÍTICA)

### **PASSO 1: Criar Aplicação Mercado Livre** ⚡ PRIMEIRO
**Por quê primeiro?** Sem o Client ID/Secret, nada funciona.

#### Acesse:
```
https://developers.mercadolivre.com.br/devcenter
```

#### Clique em "Criar Aplicação" e preencha:
```yaml
Nome: "Merca Flow Brasil"
URL da aplicação: "https://mercaflow.vercel.app" 
Breve descrição: "Plataforma de Intelligence Comercial para vendedores Mercado Livre"
URL de callback: "https://mercaflow.vercel.app/api/auth/callback"
URL de notificações: "https://mercaflow.vercel.app/api/webhooks/ml"
Tópicos: 
  - orders_v2
  - items  
  - messages
  - catalog_item_competition_status
  - price_suggestion
```

#### ⚠️ SALVE IMEDIATAMENTE:
```env
ML_CLIENT_ID=123456789123456789  # APP_ID
ML_CLIENT_SECRET=AbCdEf123456789  # CLIENT_SECRET  
```

---

### **PASSO 2: Configurar Repositório GitHub**

#### Criar repo:
```bash
# No GitHub, criar repositório "mercaflow" (private)
git clone https://github.com/SEU_USER/mercaflow.git
cd mercaflow
```

#### Estrutura inicial:
```
mercaflow/
├── .env.local                 # Variáveis locais
├── .env.example              # Template de variáveis
├── .gitignore               
├── package.json
├── next.config.js
├── tailwind.config.js
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   └── callback/
│   │   │       └── route.ts
│   │   └── webhooks/
│   │       └── ml/
│   │           └── route.ts
│   ├── dashboard/
│   └── layout.tsx
└── lib/
    ├── supabase.ts
    ├── mercadolibre.ts
    └── auth.ts
```

---

### **PASSO 3: Criar Projeto Supabase**

#### Acesse e crie:
```
https://supabase.com/dashboard
```

#### Configurações:
```yaml
Nome: "mercaflow-brasil"  
Região: "South America (São Paulo)"
Plano: "Free" (inicialmente)
```

#### Execute no SQL Editor:
```sql
-- Tabela principal de usuários
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ml_user_id BIGINT UNIQUE NOT NULL,
  email VARCHAR(255),
  nickname VARCHAR(100) NOT NULL,
  access_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  refresh_token TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de logs de webhook
CREATE TABLE webhooks_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  topic VARCHAR(50) NOT NULL,
  resource VARCHAR(255) NOT NULL,
  payload JSONB,
  processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks_log ENABLE ROW LEVEL SECURITY;

-- Políticas básicas
CREATE POLICY "Users can view own data" ON users 
FOR SELECT USING (ml_user_id = (current_setting('app.current_user_id'))::bigint);
```

#### ⚠️ SALVE as credenciais:
```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefgh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### **PASSO 4: Criar Projeto Vercel**

#### Conecte o GitHub repo:
```
https://vercel.com/new
```

#### Configure:
```yaml
Repository: "mercaflow" (do seu GitHub)
Framework: "Next.js"
Root Directory: "./"
```

#### Adicione Environment Variables:
```env
# Mercado Livre
ML_CLIENT_ID=123456789123456789
ML_CLIENT_SECRET=AbCdEf123456789
ML_REDIRECT_URI=https://mercaflow.vercel.app/api/auth/callback

# Supabase  
NEXT_PUBLIC_SUPABASE_URL=https://abcdefgh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Auth
NEXTAUTH_URL=https://mercaflow.vercel.app
NEXTAUTH_SECRET=um-secret-muito-forte-aqui-123456789
```

---

## 🚀 DESENVOLVIMENTO LOCAL

### **Configurar ambiente local:**

#### 1. Instalar dependências:
```bash
npm init -y
npm install next react react-dom typescript @types/node @types/react
npm install @supabase/supabase-js
npm install tailwindcss autoprefixer postcss
npm install next-auth
npm install axios
```

#### 2. Criar .env.local:
```env
# Mercado Livre API
ML_CLIENT_ID=123456789123456789
ML_CLIENT_SECRET=AbCdEf123456789  
ML_REDIRECT_URI=http://localhost:3000/api/auth/callback
ML_API_BASE_URL=https://api.mercadolibre.com

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://abcdefgh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Auth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=um-secret-muito-forte-local-123456789

# Desenvolvimento
NODE_ENV=development
```

#### 3. Package.json scripts:
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build", 
    "start": "next start",
    "type-check": "tsc --noEmit"
  }
}
```

---

## 🔧 CONFIGURAÇÃO DE WEBHOOKS PARA DESENVOLVIMENTO

### **Usar ngrok para webhooks locais:**

#### 1. Instalar ngrok:
```bash
npm install -g ngrok
# ou
brew install ngrok  # Mac
```

#### 2. Expor localhost:
```bash
ngrok http 3000
```

#### 3. Atualizar URL na aplicação ML:
```
URL de notificações: https://abc123.ngrok.io/api/webhooks/ml
```

---

## ✅ PRIMEIRA VALIDAÇÃO

### **Teste básico de integração:**

#### 1. Criar rota de teste:
```typescript
// app/api/test/route.ts
export async function GET() {
  return Response.json({ 
    status: "OK",
    timestamp: new Date().toISOString(),
    env: {
      hasMLClientId: !!process.env.ML_CLIENT_ID,
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      nodeEnv: process.env.NODE_ENV
    }
  });
}
```

#### 2. Testar no browser:
```
http://localhost:3000/api/test
```

#### 3. Deve retornar:
```json
{
  "status": "OK",
  "timestamp": "2025-10-02T...",
  "env": {
    "hasMLClientId": true,
    "hasSupabaseUrl": true, 
    "nodeEnv": "development"
  }
}
```

---

## 🎯 PRÓXIMOS PASSOS APÓS SETUP

### **1. Implementar OAuth Flow**
- Rota de login com Mercado Livre
- Callback para receber authorization code  
- Troca por access token
- Salvar no Supabase

### **2. Implementar Webhook Handler**
- Rota para receber notificações ML
- Validação de assinatura (se disponível)
- Processamento assíncrono
- Log no Supabase

### **3. Dashboard Básico**
- Login/logout
- Exibir dados do usuário ML
- Lista de itens/produtos
- Logs de webhooks recebidos

---

## 🚨 PONTOS CRÍTICOS

### **Segurança:**
- ✅ Nunca commitar .env.local
- ✅ Usar HTTPS em produção
- ✅ Validar tokens expirados
- ✅ Implementar rate limiting

### **Conformidade de Nomes:**
```yaml
Tudo minúsculo: "mercaflow"
Sem espaços: mercaflow-brasil, não "merca flow brasil"
Consistência: mesmo nome em GitHub, Vercel, Supabase
```

### **URLs Críticas para Salvar:**
```yaml
DevCenter ML: https://developers.mercadolivre.com.br/devcenter
Supabase Dashboard: https://supabase.com/dashboard  
Vercel Dashboard: https://vercel.com/dashboard
GitHub Repo: https://github.com/SEU_USER/mercaflow
App URL: https://mercaflow.vercel.app
```

---

## 🔥 COMEÇAR AGORA

**Ordem de execução (não pule passos):**

1. ⚡ **5 min**: Criar aplicação Mercado Livre
2. ⚡ **5 min**: Criar repositório GitHub  
3. ⚡ **10 min**: Configurar Supabase (criar projeto + SQL)
4. ⚡ **10 min**: Configurar Vercel (conectar GitHub)
5. ⚡ **15 min**: Setup local (clone, .env, dependencies)
6. ⚡ **5 min**: Testar integração básica

**Total: ~50 minutos para ter toda a infraestrutura pronta!**

---

*Pronto para começar a implementar o Merca Flow com intelligence real do Mercado Livre!* 🚀