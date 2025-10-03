# 🚀 MercaFlow - Plataforma World-Class para Mercado Livre

**MercaFlow** é uma plataforma SaaS enterprise-grade para integração com Mercado Livre, posicionada como "Linktree Premium para E-commerce Brasileiro", combinando Next.js 15, Supabase, Vercel e ML API.

## ✨ Características Principais

- 🏢 **Sistema Multi-Tenant** com isolamento completo de dados
- 🔐 **RBAC Hierárquico** com 5 roles e 64 permissões granulares  
- 🤖 **Integração Nativa ML API** com OAuth 2.0 e webhooks em tempo real
- 🧠 **IA para Otimização** de preços, títulos e análise competitiva
- 🏗️ **Arquitetura Enterprise** seguindo padrões oficiais mais avançados

## 🛠️ Stack Tecnológico

### Frontend & Backend
- **Next.js 15.5.4**: App Router com Server Components e SSR
- **TypeScript**: Strict mode para type safety completo
- **Tailwind CSS**: Styling moderno e responsivo
- **shadcn/ui**: Componentes UI padronizados

### Database & Authentication  
- **Supabase**: PostgreSQL + Auth + RLS + Traditional RBAC
- **Row Level Security**: Isolamento automático de dados por tenant
- **Profile-based RBAC**: Sistema de roles robusto baseado em tabela profiles
- **🛡️ Segurança Enterprise**: Row Level Security (RLS) + JWT claims customizados
- **🤖 IA Integrada**: Otimização de preços e títulos com OpenAI
- **📊 Analytics Real-time**: Dashboards com métricas em tempo real
- **🔄 Sincronização ML**: Integração completa com APIs do Mercado Livre
- **🌐 Multi-idioma**: Suporte completo ao português brasileiro

## 🛠️ Tecnologias

### Core Stack
- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + RLS)
- **Deploy**: Vercel + Edge Functions
- **Autenticação**: Supabase SSR + Custom JWT Claims

### Integrações
- **APIs**: Mercado Livre REST API
- **IA**: OpenAI GPT-4 para otimizações
- **Cache**: Redis (Upstash)
- **Monitoramento**: Sentry + Analytics

## 🚀 Instalação

### Pré-requisitos
- Node.js 18+
- npm ou yarn
- Conta Supabase
- Conta Vercel (opcional)

### 1. Clone o repositório

```bash
git clone https://github.com/antoniovbraz/mercaflow.git
cd mercaflow
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

```bash
cp .env.example .env.local
```

Edite `.env.local` com suas credenciais:

```env
NEXT_PUBLIC_SUPABASE_URL=sua-url-supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role

# API Mercado Livre
MERCADOLIBRE_CLIENT_ID=seu-client-id
MERCADOLIBRE_CLIENT_SECRET=seu-client-secret

# OpenAI (opcional)
OPENAI_API_KEY=sua-chave-openai

# Redis (opcional)
UPSTASH_REDIS_REST_URL=sua-url-redis
UPSTASH_REDIS_REST_TOKEN=seu-token-redis
```

### 4. Configure o banco de dados

```bash
npx supabase link --project-ref seu-project-ref
npx supabase db pull
npx supabase db push
```

### 5. Execute o projeto

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## 📦 Deploy

### Deploy no Vercel (Recomendado)

1. **Conecte o repositório ao Vercel**
2. **Configure as variáveis de ambiente** no dashboard
3. **Deploy automático** a cada push na branch main

```bash
npx vercel --prod
```

## 🏗️ Arquitetura

### Estrutura de Pastas

```
merca-flow/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Rotas de autenticação
│   ├── dashboard/         # Dashboard multi-tenant
│   ├── admin/            # Painel super admin
│   └── api/              # API routes
├── components/           # Componentes reutilizáveis
│   ├── ui/               # shadcn/ui components
│   └── providers/        # Context providers
├── lib/                  # Utilitários e configurações
│   ├── supabase/         # Clientes Supabase
│   └── utils/            # Helpers
├── utils/               # Utilitários do Supabase
│   └── supabase/        # Configurações Supabase
└── docs/               # Documentação completa
```

### Fluxo de Dados

1. **Autenticação**: Supabase Auth → JWT Claims → RLS
2. **Multi-tenancy**: Tenant isolation via RLS policies
3. **API ML**: Background sync → Edge Functions → Database
4. **Real-time**: Supabase subscriptions → UI updates

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch: `git checkout -b feature/nova-funcionalidade`
3. Commit: `git commit -m 'Adiciona nova funcionalidade'`
4. Push: `git push origin feature/nova-funcionalidade`
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.

---

**Desenvolvido com ❤️ para o ecossistema Mercado Livre brasileiro**
