# 🚀 MercaFlow

<div align="center">
  <h3>Plataforma Completa de Gestão para Mercado Livre</h3>
  <p>
    <strong>Centralize, Automatize e Escale</strong> suas vendas no maior marketplace da América Latina
  </p>
  
  [![Next.js](https://img.shields.io/badge/next.js-15.5-black)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/typescript-5.0-blue)](https://www.typescriptlang.org/)
  [![Supabase](https://img.shields.io/badge/supabase-latest-green)](https://supabase.com/)
  [![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
</div>

---

## � O Problema que Resolvemos

Vendedores no Mercado Livre enfrentam diariamente:

- ❌ **Gestão manual** de produtos em múltiplas categorias
- ❌ **Resposta lenta** a perguntas de clientes
- ❌ **Dificuldade** em analisar concorrência e precificar corretamente
- ❌ **Falta de visão consolidada** de vendas e métricas
- ❌ **Processos repetitivos** e demorados

## ✨ Nossa Solução

**MercaFlow** é uma plataforma SaaS enterprise-grade que oferece **gestão completa e inteligente** para vendedores do Mercado Livre.

### 🔗 Integração Nativa com Mercado Livre
- ✅ OAuth 2.0 seguro com PKCE
- ✅ Sincronização automática de produtos e pedidos
- ✅ Webhooks em tempo real para notificações instantâneas
- ✅ Gestão de perguntas e mensagens de clientes

### 📊 Dashboard Inteligente
- ✅ Métricas de vendas e performance em tempo real
- ✅ Análise de produtos e categorias
- ✅ Histórico completo de pedidos
- ✅ Relatórios customizáveis

### 🤖 Automação Inteligente
- ✅ Sincronização automática de dados
- ✅ Notificações em tempo real via webhooks
- ✅ Processamento de eventos do Mercado Livre
- ✅ Gestão centralizada de múltiplas contas (multi-tenant)

### � Segurança Enterprise
- ✅ Multi-tenancy com isolamento completo de dados
- ✅ RBAC hierárquico com 64 permissões granulares
- ✅ Token encryption (AES-256-GCM)
- ✅ Row Level Security (RLS) em todas as tabelas
- ✅ Auditoria completa de ações

### 🌐 Feito para o Brasil
- 🇧🇷 Interface 100% em português
- 🇧🇷 Otimizado para Mercado Livre Brasil
- 🇧� Suporte a todas as categorias MLBr

---

## 🛠️ Stack Tecnológico

### Frontend
- **Next.js 15.5.4** - React framework com App Router e Server Components
- **TypeScript** - Type safety completo com strict mode
- **Tailwind CSS** - Styling moderno e responsivo
- **shadcn/ui** - Componentes UI reutilizáveis baseados em Radix UI

### Backend
- **Supabase** - PostgreSQL + Auth + RLS + Edge Functions
- **Row Level Security** - Isolamento automático multi-tenant
- **Supabase SSR** - Server-Side Rendering com autenticação

### Integrações
- **Mercado Livre API** - OAuth 2.0 com PKCE + Webhooks + REST API
- **OpenAI** *(opcional)* - IA para otimizações
- **Upstash Redis** *(opcional)* - Cache e performance

### Deploy
- **Vercel** - Hosting otimizado para Next.js
- **Edge Middleware** - Autenticação e proteção de rotas
- **CI/CD** - Deploy automático via GitHub

---

## 🚀 Quick Start

### Pré-requisitos

- Node.js 18 ou superior
- npm ou yarn
- Conta Supabase (gratuita em [supabase.com](https://supabase.com))
- Aplicação registrada no [Mercado Livre Developers](https://developers.mercadolibre.com.br/)

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
# Supabase (obtenha em: https://app.supabase.com/project/_/settings/api)
NEXT_PUBLIC_SUPABASE_URL=sua-url-supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role

# Mercado Livre (registre em: https://developers.mercadolibre.com.br/)
ML_CLIENT_ID=seu-client-id
ML_CLIENT_SECRET=seu-client-secret

# Encryption (gere uma chave de 32+ caracteres)
ENCRYPTION_KEY=sua-chave-de-criptografia-32-chars

# URL da aplicação
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. Configure o banco de dados

```bash
# Conecte ao seu projeto Supabase
npx supabase link --project-ref SEU_PROJECT_REF

# Aplique as migrations
npx supabase db push
```

### 5. Execute localmente

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) no navegador.

---

## 📖 Documentação Completa

- [📘 Especificação Técnica](ESPECIFICACAO_TECNICA.md) - Arquitetura e design do sistema
- [🗺️ Roadmap de Implementação](ROADMAP_IMPLEMENTACAO.md) - Plano de desenvolvimento
- [🔗 Integração Mercado Livre](INTEGRACAO_ML_COMPLETA.md) - Guia completo de integração ML
- [🔍 Auditoria do Projeto](AUDITORIA_MERCAFLOW.md) - Análise técnica e recomendações
- [📚 Documentação Detalhada](docs/pt/) - Guias e referências

---

## 🎯 Principais Funcionalidades

### ✅ Implementado

#### Autenticação e Segurança
- [x] Sistema de autenticação completo com Supabase
- [x] Multi-tenancy com isolamento total de dados
- [x] RBAC hierárquico (3 roles principais: user, admin, super_admin)
- [x] 64 permissões granulares definidas
- [x] Row Level Security (RLS) em todas as tabelas
- [x] Token encryption com AES-256-GCM

#### Integração Mercado Livre
- [x] OAuth 2.0 com PKCE para máxima segurança
- [x] Refresh automático de tokens
- [x] Sincronização de produtos (items)
- [x] Sincronização de pedidos (orders)
- [x] Gestão de perguntas (questions)
- [x] Gestão de mensagens (messages)
- [x] Webhooks para notificações em tempo real

#### Dashboard e Interface
- [x] Dashboard responsivo com métricas
- [x] Listagem e busca de produtos
- [x] Gestão de pedidos
- [x] Histórico de sincronizações
- [x] Interface moderna com Tailwind + shadcn/ui

### 🔄 Em Desenvolvimento

- [ ] Analytics avançado com gráficos
- [ ] Otimização de preços com IA
- [ ] Respostas automáticas de perguntas
- [ ] Relatórios customizáveis
- [ ] API pública para integrações

### 📋 Roadmap Futuro

- [ ] Integração com outros marketplaces
- [ ] App mobile (React Native)
- [ ] Automação avançada de processos
- [ ] Sistema de templates para anúncios
- [ ] Análise de concorrência com IA

---

## 🏗️ Arquitetura

### Estrutura de Pastas

```
mercaflow/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── dashboard/         # Dashboard pages
│   ├── login/             # Autenticação
│   └── ml/                # Páginas ML integration
├── components/            # Componentes React
│   ├── ui/               # shadcn/ui components
│   └── ml/               # Componentes ML específicos
├── utils/                 # Utilitários
│   ├── supabase/         # Cliente Supabase + RBAC + Tenancy
│   └── mercadolivre/     # Token manager + APIs
├── supabase/
│   └── migrations/       # Database migrations
├── docs/                  # Documentação
└── public/               # Assets estáticos
```

### Fluxo de Dados

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       ▼
┌─────────────┐     ┌──────────────┐
│  Next.js    │────▶│  Supabase    │
│  App Router │     │  (PostgreSQL)│
└──────┬──────┘     └──────────────┘
       │
       ▼
┌─────────────┐
│   ML API    │
│  (OAuth +   │
│  Webhooks)  │
└─────────────┘
```

---

## 🔐 Segurança

O MercaFlow implementa múltiplas camadas de segurança:

### Autenticação
- ✅ Supabase Auth com JWT tokens
- ✅ Session management automático via middleware
- ✅ Proteção de rotas no edge

### Autorização
- ✅ RBAC hierárquico com 3 níveis de acesso
- ✅ 64 permissões granulares por recurso
- ✅ Validação server-side em todas as APIs

### Dados
- ✅ Row Level Security (RLS) no PostgreSQL
- ✅ Isolamento multi-tenant automático
- ✅ Encryption de tokens sensíveis (AES-256-GCM)
- ✅ HTTPS obrigatório em produção

### APIs Externas
- ✅ OAuth 2.0 com PKCE (RFC 7636)
- ✅ Token refresh automático
- ✅ Rate limiting (confia no ML API)
- ✅ Webhook signature validation

---

## 🧪 Testes

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Build production
npm run build
```

**Nota**: Testes automatizados estão no roadmap (ver [AUDITORIA_MERCAFLOW.md](AUDITORIA_MERCAFLOW.md))

---

## 🚀 Deploy

### Vercel (Recomendado)

1. **Conecte seu repositório GitHub à Vercel**

2. **Configure as variáveis de ambiente** no painel da Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ML_CLIENT_ID`
   - `ML_CLIENT_SECRET`
   - `ENCRYPTION_KEY`
   - `NEXT_PUBLIC_SITE_URL`

3. **Deploy**:
   ```bash
   npm run deploy
   # ou push para branch main (auto-deploy)
   ```

4. **Configure callback URL no Mercado Livre**:
   ```
   https://seu-dominio.vercel.app/api/ml/auth/callback
   ```

### Outras Plataformas

O MercaFlow pode ser deployado em qualquer plataforma que suporte Next.js:
- Railway
- Netlify
- AWS Amplify
- DigitalOcean App Platform

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Para contribuir:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

### Guidelines

- Use TypeScript strict mode
- Siga o style guide (ESLint + Prettier)
- Adicione testes para novas funcionalidades
- Atualize a documentação quando necessário

---

## 📊 Status do Projeto

| Área | Status | Cobertura |
|------|--------|-----------|
| **Autenticação** | ✅ Completo | 100% |
| **Multi-tenancy** | ✅ Completo | 100% |
| **RBAC** | ⚠️ Parcial | 70% |
| **Integração ML** | ✅ Completo | 90% |
| **Dashboard** | ✅ Completo | 80% |
| **Testes** | ❌ Pendente | 0% |
| **Documentação** | ✅ Boa | 85% |

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 💬 Suporte e Comunidade

- **Issues**: [GitHub Issues](https://github.com/antoniovbraz/mercaflow/issues)
- **Discussions**: [GitHub Discussions](https://github.com/antoniovbraz/mercaflow/discussions)
- **Email**: antoniovbraz@gmail.com

---

## 🙏 Agradecimentos

- [Next.js](https://nextjs.org/) - Framework React incrível
- [Supabase](https://supabase.com/) - Backend as a Service
- [Mercado Livre](https://developers.mercadolibre.com.br/) - API e documentação
- [shadcn/ui](https://ui.shadcn.com/) - Componentes UI lindos
- [Vercel](https://vercel.com/) - Hosting e deploy

---

<div align="center">
  <p><strong>Desenvolvido com ❤️ no Brasil 🇧🇷</strong></p>
  <p>
    <a href="https://github.com/antoniovbraz">GitHub</a> •
    <a href="https://linkedin.com/in/antoniovbraz">LinkedIn</a>
  </p>
</div>

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
