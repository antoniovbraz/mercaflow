# Merca Flow Brasil - Checklist de Setup Completo
*Configuração passo-a-passo para implementação no Brasil com conformidade total*

## ✅ Status Atual das Contas
- [x] **Vercel** - Conta criada ✓
- [x] **Supabase** - Conta criada ✓ 
- [x] **GitHub** - Conta criada ✓
- [x] **MercadoLibre** - Conta criada ✓
- [ ] **Aplicação ML** - A criar
- [ ] **Projeto Vercel** - A criar
- [ ] **Projeto Supabase** - A criar

---

## 🏗️ 1. APLICAÇÃO MERCADOLIBRE (CRÍTICO)

### **Criar Aplicação no DevCenter**
📍 **URL**: https://developers.mercadolivre.com.br/devcenter

#### **Configurações da Aplicação**
```yaml
Nome da Aplicação: "Merca Flow Brasil"
Descrição: "Plataforma de Intelligence Comercial para Vendedores MercadoLibre"
Website: "https://mercaflow.vercel.app"
Callback URLs:
  - "https://mercaflow.vercel.app/api/auth/callback"
  - "https://mercaflow.vercel.app/api/ml/callback"
  - "http://localhost:3000/api/auth/callback" (desenvolvimento)
Notification URL: "https://mercaflow.vercel.app/api/webhooks/ml"
```

#### **Scopes Necessários** (Baseado na análise das APIs)
```yaml
Scopes Obrigatórios:
  - "offline_access" # Para refresh tokens
  - "read"          # Leitura de dados
  - "write"         # Criação/atualização (se necessário)

Permissões Específicas:
  - "items:read"    # Produtos e publicações
  - "orders:read"   # Vendas e pedidos  
  - "messages:read" # Mensagens
  - "users:read"    # Dados do usuário
```

#### **Variáveis que Receberá**
```env
ML_CLIENT_ID=123456789       # APP_ID da aplicação
ML_CLIENT_SECRET=xxxxxxxxxxx # Secret Key
ML_REDIRECT_URI=https://mercaflow.vercel.app/api/auth/callback
```

---

## 🗄️ 2. PROJETO SUPABASE

### **Criar Novo Projeto**
📍 **URL**: https://supabase.com/dashboard

#### **Configurações do Projeto**
```yaml
Nome do Projeto: "mercaflow-brasil"
Organização: [Sua organização]
Região: "South America (São Paulo)"
Database Password: [Senha forte - salvar no 1Password/BitWarden]
```

#### **Schema do Banco de Dados**

##### **Tabela: users**
```sql
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ml_user_id BIGINT UNIQUE NOT NULL,
  email VARCHAR(255),
  nickname VARCHAR(100),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  country_id VARCHAR(3) DEFAULT 'BR',
  site_id VARCHAR(10) DEFAULT 'MLB',
  access_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  refresh_token TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

##### **Tabela: webhooks_log**
```sql
CREATE TABLE webhooks_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  topic VARCHAR(50) NOT NULL,
  resource VARCHAR(255) NOT NULL,
  application_id BIGINT,
  attempts INTEGER DEFAULT 1,
  payload JSONB,
  processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

##### **Tabela: competition_intelligence**
```sql
CREATE TABLE competition_intelligence (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  item_id VARCHAR(50) NOT NULL,
  price_to_win DECIMAL(15,2),
  current_position VARCHAR(20),
  competitor_count INTEGER,
  last_check TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

##### **Tabela: price_suggestions**
```sql
CREATE TABLE price_suggestions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  item_id VARCHAR(50) NOT NULL,
  suggested_price DECIMAL(15,2),
  current_price DECIMAL(15,2),
  reason TEXT,
  accepted BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### **Row Level Security (RLS)**
```sql
-- Habilitar RLS em todas as tabelas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE competition_intelligence ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_suggestions ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (usuários só veem seus próprios dados)
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid()::text = id::text);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid()::text = id::text);
```

#### **Variáveis do Supabase**
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI....
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI.... # Para server-side
DATABASE_URL=postgresql://postgres:[password]@db.xxxxx.supabase.co:5432/postgres
```

---

## 🚀 3. PROJETO VERCEL

### **Criar Novo Projeto**
📍 **URL**: https://vercel.com/dashboard

#### **Configurações do Projeto**
```yaml
Nome do Projeto: "mercaflow"
Framework: "Next.js"
Root Directory: "./"
Build Command: "npm run build"
Install Command: "npm install"
Output Directory: ".next"
```

#### **Domínio Personalizado** (Opcional)
```yaml
Domínio Principal: "mercaflow.vercel.app" (gratuito)
Domínio Customizado: "mercaflow.com.br" (se adquirir)
```

#### **Variáveis de Ambiente** (Vercel Dashboard)
```env
# MercadoLibre API
ML_CLIENT_ID=123456789
ML_CLIENT_SECRET=xxxxxxxxxxx
ML_REDIRECT_URI=https://mercaflow.vercel.app/api/auth/callback
ML_API_BASE_URL=https://api.mercadolibre.com

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI....
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI....

# NextAuth (para autenticação)
NEXTAUTH_URL=https://mercaflow.vercel.app
NEXTAUTH_SECRET=[gerar-secret-forte]

# App Config
NODE_ENV=production
NEXT_PUBLIC_APP_ENV=production
```

---

## 📁 4. REPOSITÓRIO GITHUB

### **Criar Repositório**
📍 **URL**: https://github.com/new

#### **Configurações do Repositório**
```yaml
Nome: "mercaflow"
Descrição: "Plataforma de Intelligence Comercial para MercadoLibre Brasil"
Visibilidade: "Private" (recomendado inicialmente)
Template: "None"
README: "Yes"
.gitignore: "Node"
License: "MIT" (ou escolha de preferência)
```

#### **Estrutura de Branches**
```yaml
Branch Principal: "main"
Branch de Desenvolvimento: "develop"
Branch de Features: "feature/nome-da-feature"
Branch de Hotfix: "hotfix/nome-do-fix"
```

#### **Secrets do GitHub** (Para CI/CD)
```env
VERCEL_TOKEN=xxxxxxxxx        # Token do Vercel
VERCEL_ORG_ID=team_xxxxxxxxx  # Organization ID
VERCEL_PROJECT_ID=prj_xxxxxxx # Project ID
```

---

## 🔧 5. CONFIGURAÇÕES ADICIONAIS

### **URLs de Teste para Webhooks**
Durante desenvolvimento, usar **ngrok** ou similar:
```bash
# Instalar ngrok
npm install -g ngrok

# Expor localhost:3000
ngrok http 3000

# URL gerada para webhooks: https://xxxxx.ngrok.io/api/webhooks/ml
```

### **IPs para Whitelist** (Se necessário)
Baseado na análise das APIs, os webhooks vêm destes IPs:
```yaml
IPs_ML_Webhooks:
  - "54.88.218.97"
  - "18.215.140.160"
  - "18.213.114.129"
  - "18.206.34.84"
```

### **Certificados SSL**
Vercel fornece automaticamente, mas verificar:
```yaml
SSL: "Automático via Vercel"
HTTPS: "Forçado para todas as rotas"
```

---

## 📋 6. CHECKLIST DE VERIFICAÇÃO

### **Antes de Começar o Desenvolvimento**
- [ ] Aplicação ML criada e configurada
- [ ] Client ID e Secret salvos com segurança
- [ ] Projeto Supabase criado com schema
- [ ] Projeto Vercel criado e linkado ao GitHub
- [ ] Todas as variáveis de ambiente configuradas
- [ ] Webhooks testados (ngrok para desenvolvimento)
- [ ] Repository clonado localmente

### **Conformidade de Nomes**
```yaml
Projeto: "mercaflow" (tudo minúsculo, sem espaços)
Database: "mercaflow-brasil" 
Dominio: "mercaflow.vercel.app"
Repo: "mercaflow"
Aplicação ML: "Merca Flow Brasil"
```

### **Variáveis de Ambiente Consistentes**
```env
# Prefixos padronizados
ML_*          # Tudo relacionado ao MercadoLibre
SUPABASE_*    # Tudo relacionado ao Supabase  
NEXTAUTH_*    # Tudo relacionado à autenticação
NEXT_PUBLIC_* # Variáveis públicas do Next.js
```

---

## 🚨 PRÓXIMOS PASSOS OBRIGATÓRIOS

### **1. Criar Aplicação MercadoLibre** (PRIMEIRO)
- Acesse https://developers.mercadolivre.com.br/devcenter
- Crie a aplicação com as configurações acima
- **SALVE** Client ID e Secret em local seguro

### **2. Configurar Supabase**
- Crie projeto "mercaflow-brasil"
- Execute os scripts SQL fornecidos
- Configure RLS e políticas de segurança

### **3. Configurar Vercel**
- Crie projeto linkado ao GitHub
- Configure todas as variáveis de ambiente
- Faça deploy inicial

### **4. Testar Integração**
- Webhook local com ngrok
- OAuth flow completo
- Primeira chamada à API ML

---

## 🔍 VALIDAÇÃO FINAL

Após todas as configurações, deve ser possível:
1. ✅ **Login com MercadoLibre**: OAuth flow funcionando
2. ✅ **Receber Webhooks**: Notificações chegando
3. ✅ **Acessar APIs**: Dados sendo recuperados
4. ✅ **Persistir Dados**: Salvando no Supabase
5. ✅ **Deploy Funcionando**: App rodando na Vercel

---

*Checklist baseado na análise completa das APIs MercadoLibre Brasil*