# 🚀 Guia do Iniciante - MercaFlow

## Bem-vindo ao MercaFlow!

Este guia vai te ensinar **passo a passo** como configurar e rodar o projeto após clonar do GitHub.

---

## 📋 Pré-requisitos (o que você precisa ter instalado)

Antes de começar, certifique-se de ter instalado:

- ✅ **Node.js** (versão 18 ou superior) - [Download aqui](https://nodejs.org/)
- ✅ **Git** - [Download aqui](https://git-scm.com/)
- ✅ **Visual Studio Code** (recomendado) - [Download aqui](https://code.visualstudio.com/)
- ✅ **PowerShell** ou **Git Bash** (vem com o Git no Windows)

Para verificar se estão instalados, abra o terminal e digite:

```powershell
node --version    # Deve mostrar algo como: v22.20.0
npm --version     # Deve mostrar algo como: 10.9.3
git --version     # Deve mostrar algo como: git version 2.x.x
```

---

## 🎯 Passo 1: Clonar o Repositório

Se você ainda não clonou, faça isso:

```powershell
# Navegue até a pasta onde quer colocar o projeto
cd C:\Work\microsaas

# Clone o repositório
git clone https://github.com/antoniovbraz/mercaflow.git

# Entre na pasta do projeto
cd mercaflow
```

---

## 📦 Passo 2: Instalar as Dependências

**O que são dependências?** São bibliotecas e ferramentas que o projeto precisa para funcionar.

```powershell
# Este comando lê o arquivo package.json e instala tudo que o projeto precisa
npm install
```

**O que acontece:**

- ✅ Cria uma pasta `node_modules` com todas as bibliotecas
- ✅ Cria/atualiza o arquivo `package-lock.json`
- ⏱️ Pode demorar 1-3 minutos dependendo da internet

**Aguarde até ver:** `added XXX packages in XXs`

---

## 🔐 Passo 3: Configurar Variáveis de Ambiente

**O que são variáveis de ambiente?** São informações secretas e configurações que o projeto precisa (senhas, chaves de API, etc).

### 3.1 Copiar o arquivo de exemplo

```powershell
# Copia o arquivo .env.example para .env.local
copy .env.example .env.local
```

### 3.2 Preencher as variáveis

Abra o arquivo `.env.local` no VS Code e preencha com suas credenciais:

```bash
# ==============================================
# CONFIGURAÇÕES OBRIGATÓRIAS
# ==============================================

# 1. SUPABASE (Banco de Dados)
# Pegue em: https://supabase.com/dashboard/project/SEU_PROJETO/settings/api
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-aqui
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role-aqui

# 2. MERCADO LIVRE (Integração)
# Pegue em: https://developers.mercadolibre.com.br/apps
ML_CLIENT_ID=seu-client-id-aqui
ML_CLIENT_SECRET=seu-client-secret-aqui
ML_REDIRECT_URI=http://localhost:3000/api/ml/auth/callback

# 3. CRIPTOGRAFIA (para tokens do ML)
# Gere uma chave segura de 32+ caracteres
ENCRYPTION_KEY=sua-chave-de-criptografia-min-32-chars

# ==============================================
# CONFIGURAÇÕES OPCIONAIS (pode deixar vazio por enquanto)
# ==============================================

# Redis (cache - opcional)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# OpenAI (IA - opcional)
OPENAI_API_KEY=

# Sentry (monitoramento de erros - opcional)
SENTRY_AUTH_TOKEN=
```

### 3.3 Como conseguir as credenciais?

#### **Supabase** (Banco de Dados):

1. Acesse: https://supabase.com/
2. Crie uma conta (gratuito)
3. Crie um novo projeto
4. Vá em **Settings** → **API**
5. Copie:
   - `URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` → `SUPABASE_SERVICE_ROLE_KEY`

#### **Mercado Livre** (Integração):

1. Acesse: https://developers.mercadolibre.com.br/
2. Faça login com sua conta do Mercado Livre
3. Vá em **Meus Apps** → **Criar Aplicação**
4. Preencha os dados e configure:
   - **Redirect URI**: `http://localhost:3000/api/ml/auth/callback`
5. Copie:
   - `App ID` → `ML_CLIENT_ID`
   - `Secret Key` → `ML_CLIENT_SECRET`

#### **Chave de Criptografia**:

Gere uma string aleatória de 32+ caracteres. Exemplo:

```powershell
# Use este comando para gerar uma chave segura:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 🗄️ Passo 4: Configurar o Banco de Dados

### 4.1 Conectar ao Supabase remoto

```powershell
# Conectar ao seu projeto Supabase
npx supabase link --project-ref SEU_PROJECT_REF
```

**Como encontrar o PROJECT_REF:**

- Acesse: https://supabase.com/dashboard/project/SEU_PROJETO/settings/general
- Copie o **Reference ID**

### 4.2 Aplicar as migrations (criar tabelas)

```powershell
# Cria todas as tabelas e configurações no banco de dados
npx supabase db push
```

**O que acontece:**

- ✅ Cria todas as tabelas necessárias
- ✅ Configura permissões (RLS policies)
- ✅ Cria funções e triggers

---

## 🚀 Passo 5: Rodar o Projeto

Agora você está pronto para rodar o projeto!

```powershell
# Iniciar o servidor de desenvolvimento
npm run dev
```

**O que você verá:**

```
  ▲ Next.js 15.5.4
  - Local:        http://localhost:3000
  - Network:      http://192.168.x.x:3000

 ✓ Ready in 2.5s
```

### 5.1 Acessar o projeto

Abra seu navegador em: **http://localhost:3000**

Você verá a página inicial do MercaFlow! 🎉

---

## 🔧 Comandos Úteis no Dia a Dia

### Desenvolvimento:

```powershell
# Rodar o projeto em modo desenvolvimento
npm run dev

# Rodar com Turbo (mais rápido)
npm run dev:turbo

# Parar o servidor: Ctrl + C
```

### Build e Produção:

```powershell
# Verificar se o TypeScript está correto
npm run type-check

# Verificar erros de código (ESLint)
npm run lint

# Fazer build de produção (antes de deploy)
npm run build

# Rodar versão de produção localmente
npm run start
```

### Banco de Dados (Supabase):

```powershell
# Ver mudanças no banco de dados
npx supabase db diff

# Baixar schema do banco remoto
npm run db:pull

# Aplicar migrations ao banco remoto
npm run db:push

# Criar nova migration
npm run db:migration nome_da_migration

# Rodar Supabase localmente (Docker necessário)
npm run db:start
```

### Git (Controle de Versão):

```powershell
# Ver arquivos modificados
git status

# Ver mudanças específicas
git diff

# Adicionar arquivos para commit
git add .

# Fazer commit (salvar mudanças)
git commit -m "Descrição das mudanças"

# Enviar para o GitHub
git push

# Baixar mudanças do GitHub
git pull

# Ver histórico de commits
git log --oneline
```

---

## 📁 Estrutura do Projeto

```
mercaflow/
├── app/                    # Páginas e rotas do Next.js 15
│   ├── page.tsx           # Página inicial (/)
│   ├── login/             # Página de login (/login)
│   ├── dashboard/         # Dashboard do usuário
│   ├── api/               # API routes (backend)
│   │   ├── ml/           # Endpoints do Mercado Livre
│   │   └── auth/         # Endpoints de autenticação
│   └── layout.tsx        # Layout principal
│
├── components/            # Componentes reutilizáveis
│   ├── ui/               # Componentes de interface (botões, inputs)
│   ├── auth-button.tsx   # Botão de autenticação
│   └── ...
│
├── utils/                # Funções auxiliares
│   ├── supabase/        # Configurações do Supabase
│   │   ├── client.ts   # Cliente para componentes
│   │   ├── server.ts   # Cliente para server components
│   │   └── roles.ts    # Controle de permissões
│   ├── mercadolivre/   # Integrações do ML
│   └── validation/     # Validações com Zod
│
├── supabase/
│   └── migrations/      # Histórico de mudanças no banco
│
├── public/              # Arquivos públicos (imagens, etc)
├── .env.local          # Variáveis de ambiente (NUNCA commitar!)
├── .env.example        # Exemplo de variáveis
├── package.json        # Dependências e scripts
└── README.md           # Documentação principal
```

---

## 🐛 Problemas Comuns e Soluções

### 1. **Erro: "Cannot find module"**

**Solução:**

```powershell
# Deletar node_modules e reinstalar
Remove-Item -Recurse -Force node_modules
npm install
```

### 2. **Erro: "Port 3000 already in use"**

**Solução:**

```powershell
# Matar processo na porta 3000
npx kill-port 3000

# Ou use outra porta
npm run dev -- -p 3001
```

### 3. **Erro de autenticação Supabase**

**Solução:**

- Verifique se as variáveis `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` estão corretas
- Certifique-se que não há espaços extras
- Reinicie o servidor (`Ctrl + C` e `npm run dev` novamente)

### 4. **Erro de migrations do Supabase**

**Solução:**

```powershell
# Resetar migrations e aplicar novamente
npx supabase db reset
npx supabase db push
```

### 5. **Erro: "ENCRYPTION_KEY must be at least 32 characters"**

**Solução:**

```powershell
# Gerar nova chave
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Copiar resultado para .env.local na variável ENCRYPTION_KEY
```

---

## 📚 Próximos Passos

Agora que o projeto está rodando, você pode:

1. ✅ **Explorar o código**: Comece pelos arquivos em `app/page.tsx`
2. ✅ **Criar uma conta**: Teste o sistema de registro
3. ✅ **Ler a documentação**: Veja `docs/pt/` para guias específicos
4. ✅ **Fazer mudanças**: Edite um arquivo e veja atualizar ao vivo!
5. ✅ **Conectar ao Mercado Livre**: Configure a integração

---

## 🆘 Precisa de Ajuda?

- 📖 **Documentação completa**: `README.md`
- 🔧 **Instruções técnicas**: `.github/copilot-instructions.md`
- 🐛 **Problemas conhecidos**: `docs/pt/TROUBLESHOOTING.md` (se existir)
- 💬 **Dúvidas**: Abra uma issue no GitHub

---

## ✅ Checklist Rápido

Use este checklist para confirmar que tudo está configurado:

- [ ] Node.js instalado (`node --version`)
- [ ] Projeto clonado (`git clone`)
- [ ] Dependências instaladas (`npm install`)
- [ ] Arquivo `.env.local` criado e preenchido
- [ ] Supabase conectado (`npx supabase link`)
- [ ] Migrations aplicadas (`npx supabase db push`)
- [ ] Projeto rodando (`npm run dev`)
- [ ] Página abre no navegador (`http://localhost:3000`)

---

## 🎓 Glossário para Iniciantes

- **CLI**: Interface de linha de comando (terminal)
- **Dependências**: Bibliotecas que o projeto precisa
- **Environment Variables**: Configurações secretas (senhas, chaves)
- **Migration**: Mudança na estrutura do banco de dados
- **Build**: Compilar o código para produção
- **Deploy**: Colocar o projeto no ar (publicar)
- **Commit**: Salvar mudanças no histórico do Git
- **Push**: Enviar commits para o GitHub
- **Pull**: Baixar mudanças do GitHub

---

**Boa sorte! 🚀 Você está pronto para começar!**
