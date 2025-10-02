# � Merca Flow - Intelligence Comercial para MercadoLibre

Plataforma de análise e automação para vendedores do MercadoLibre Brasil, baseada em dados reais das APIs oficiais.

## ✨ Funcionalidades Principais

- 🎯 **Otimização de Preços**: Sugestões diretas do algoritmo MercadoLibre
- 📊 **Intelligence de Competição**: Monitoramento em tempo real da concorrência  
- 🔔 **Alertas Inteligentes**: Notificações instantâneas sobre vendas, feedbacks e mudanças
- 🤖 **Automação Completa**: Ajustes automáticos baseados em dados reais
- 📈 **Analytics Avançado**: Insights comportamentais e preditivos

## 🛠️ Stack Técnico

- **Framework**: Next.js 14 + TypeScript
- **Database**: Supabase (PostgreSQL)
- **Deploy**: Vercel  
- **Styling**: Tailwind CSS
- **Auth**: OAuth 2.0 MercadoLibre
- **APIs**: MercadoLibre REST APIs + Webhooks (25+ tópicos)

## 🚀 Quick Start

### Pré-requisitos
- Node.js 18+
- Conta MercadoLibre (vendedor)
- Aplicação ML criada no DevCenter
- Contas Supabase e Vercel

### 1. Clone e configure
```bash
git clone https://github.com/antoniovbraz/mercaflow.git
cd mercaflow
npm install
cp .env.example .env.local
# Preencher .env.local com suas credenciais
```

### 2. Execute localmente
```bash
npm run dev
# Acesse: http://localhost:3000
```

## 📋 DOCUMENTO MASTER

Este é o **índice central** de toda a documentação da plataforma Merca Flow. Aqui você encontra navegação organizacional, controle de versões e status de cada documento.

### 🎯 **Estrutura Organizacional**

```
📁 MERCA FLOW DOCUMENTATION
├── 📄 Core Documentation (Documentos Principais)
│   ├── PROJECT_SOT.md ................................. [SOURCE OF TRUTH]
│   ├── BUSINESS_STRATEGY.md ........................... [STRATEGY & MARKET]
│   └── TECHNICAL_ARCHITECTURE.md ..................... [TECH DEEP DIVE]
│
├── 🔐 Administration & Security
│   ├── SUPER_ADMIN_SETUP.md ........................... [ADMIN CONFIG]
│   ├── IMPERSONATION_LEGAL_GUIDE.md ................... [LEGAL COMPLIANCE]
│   ├── SECURITY_PROTOCOLS.md .......................... [SECURITY GUIDE]
│   └── GDPR_LGPD_COMPLIANCE.md ........................ [PRIVACY LAWS]
│
├── 👥 User Experience & Interface
│   ├── DUAL_ROLE_GUIDE.md ............................. [ADMIN/USER UX]
│   ├── USER_JOURNEY_MAPS.md ........................... [UX FLOWS]
│   └── UI_COMPONENT_LIBRARY.md ........................ [DESIGN SYSTEM]
│
├── 🛠️ Development & Technical
│   ├── AI_DOCUMENTATION_STANDARDS.md .................. [DEV STANDARDS]
│   ├── API_REFERENCE.md ............................... [API DOCS]
│   ├── DATABASE_SCHEMA.md ............................. [DB STRUCTURE]
│   └── DEPLOYMENT_GUIDE.md ............................ [DEVOPS GUIDE]
│
├── 📊 Business & Operations
│   ├── PRICING_STRATEGY.md ............................ [PRICING MODEL]
│   ├── MARKET_ANALYSIS.md ............................. [MARKET RESEARCH]
│   └── GROWTH_METRICS.md .............................. [KPI TRACKING]
│
└── 📈 Extras & Utilities
    ├── CHANGELOG.md ................................... [VERSION HISTORY]
    ├── ROADMAP.md ..................................... [FUTURE PLANS]
    └── QUICK_REFERENCE.md ............................. [CHEAT SHEET]
```

---

## 📊 STATUS DOS DOCUMENTOS

### 🟢 **COMPLETOS E VALIDADOS**
| Documento | Versão | Última Atualização | Status | Responsável |
|-----------|--------|-------------------|---------|-------------|
| `PROJECT_SOT.md` | v1.2 | 02/10/2025 | ✅ Production Ready | Solution Architect |
| `SUPER_ADMIN_SETUP.md` | v1.1 | 02/10/2025 | ✅ Production Ready | Platform Owner |
| `AI_DOCUMENTATION_STANDARDS.md` | v1.0 | 01/10/2025 | ✅ Production Ready | Tech Lead |

### 🟡 **EM REVISÃO/ATUALIZAÇÃO**
| Documento | Versão | Status | Próxima Ação |
|-----------|--------|--------|---------------|
| `DUAL_ROLE_GUIDE.md` | v1.0 | 🔄 Needs Restructure | Migrate to UX section |
| `IMPERSONATION_LEGAL_GUIDE.md` | v1.0 | 📋 Legal Review | Legal compliance audit |
| `LEGAL_EXECUTIVE_SUMMARY.md` | v1.0 | 🔄 Consolidate | Merge with legal guide |

### 🔴 **FALTANDO/CRIAR**
| Documento | Prioridade | Prazo Estimado | Descrição |
|-----------|------------|----------------|-----------|
| `BUSINESS_STRATEGY.md` | 🔥 Critical | 1 dia | Estratégia separada do SOT |
| `TECHNICAL_ARCHITECTURE.md` | 🔥 Critical | 1 dia | Arquitetura técnica detalhada |
| `API_REFERENCE.md` | ⚡ High | 2 dias | Documentação completa das APIs |
| `DATABASE_SCHEMA.md` | ⚡ High | 2 dias | Schema completo do banco |
| `SECURITY_PROTOCOLS.md` | ⚡ High | 1 dia | Protocolos de segurança |
| `PRICING_STRATEGY.md` | 📈 Medium | 3 dias | Estratégia de pricing detalhada |

---

## 🎯 **NAVEGAÇÃO RÁPIDA**

### 🚀 **Para Desenvolvedores**
- [📋 Tech Standards](./AI_DOCUMENTATION_STANDARDS.md) - Padrões de desenvolvimento
- [🔧 Admin Setup](./SUPER_ADMIN_SETUP.md) - Configuração administrativa
- [🏗️ Architecture](./TECHNICAL_ARCHITECTURE.md) - Arquitetura técnica (em breve)
- [📡 API Docs](./API_REFERENCE.md) - Referência de APIs (em breve)

### 👔 **Para Stakeholders/Business**
- [📊 Project SOT](./PROJECT_SOT.md) - Visão geral completa
- [💼 Strategy](./BUSINESS_STRATEGY.md) - Estratégia de negócio (em breve)
- [💰 Pricing](./PRICING_STRATEGY.md) - Modelo de pricing (em breve)
- [📈 Metrics](./GROWTH_METRICS.md) - Métricas de crescimento (em breve)

### 🔐 **Para Administradores**
- [⚙️ Super Admin](./SUPER_ADMIN_SETUP.md) - Setup de administrador
- [🔄 Dual Role](./DUAL_ROLE_GUIDE.md) - Guia de duplo papel
- [⚖️ Legal Guide](./IMPERSONATION_LEGAL_GUIDE.md) - Conformidade legal
- [🛡️ Security](./SECURITY_PROTOCOLS.md) - Protocolos de segurança (em breve)

### 🎨 **Para Designers/UX**
- [👤 Dual Role UX](./DUAL_ROLE_GUIDE.md) - Experiência de usuário dual
- [🎨 Components](./UI_COMPONENT_LIBRARY.md) - Biblioteca de componentes (em breve)
- [🗺️ User Journey](./USER_JOURNEY_MAPS.md) - Jornadas do usuário (em breve)

---

## 🔄 **CONTROLE DE VERSÕES**

### Política de Versionamento
- **Major**: Mudanças estruturais ou breaking changes (x.0.0)
- **Minor**: Novas funcionalidades ou seções importantes (0.x.0)  
- **Patch**: Correções, atualizações menores (0.0.x)

### Últimas Atualizações Globais
- **v1.2.0** (02/10/2025): Reestruturação completa da documentação
- **v11.0** (01/10/2025): Criação dos documentos principais
- **v1.0.0** (01/10/2025): Versão inicial do PROJECT_SOT

---

## 📋 **PADRÕES DE QUALIDADE**

### ✅ **Checklist de Qualidade para Novos Documentos**
- [ ] **Header padrão** com versão, data, responsável
- [ ] **Índice navegável** com links internos
- [ ] **Seções bem estruturadas** com hierarquia clara
- [ ] **Exemplos práticos** sempre que possível
- [ ] **Links cruzados** com outros documentos
- [ ] **Linguagem AI-friendly** conforme standards
- [ ] **Versionamento semântico** implementado
- [ ] **Review técnico** realizado
- [ ] **Review de negócio** (quando aplicável)
- [ ] **Aprovação final** do responsável

### 🎯 **Padrões Enterprise**
- **Consistência**: Terminologia unificada em todos os docs
- **Rastreabilidade**: Histórico de mudanças documentado
- **Acessibilidade**: Navegação clara e intuitiva
- **Manutenibilidade**: Estrutura fácil de atualizar
- **Completude**: Informações suficientes para implementação

---

## 🤝 **RESPONSABILIDADES**

### 👤 **Roles e Responsabilidades**
- **Solution Architect**: PROJECT_SOT, arquitetura técnica
- **Platform Owner**: SUPER_ADMIN_SETUP, security protocols
- **Tech Lead**: Development standards, API reference
- **Legal Counsel**: Legal guides, compliance documentation
- **UX Designer**: User journeys, component library
- **Product Manager**: Business strategy, pricing, metrics

### 📝 **Processo de Atualização**
1. **Proposta**: Issue/PR com justificativa da mudança
2. **Review**: Revisão técnica pelo responsável da área
3. **Aprovação**: Sign-off do stakeholder apropriado
4. **Update**: Atualização do documento + versionamento
5. **Notification**: Comunicação das mudanças para equipe

---

## 🔍 **COMO USAR ESTA DOCUMENTAÇÃO**

### 🎯 **Para Novos Desenvolvedores**
1. Comece com [PROJECT_SOT.md](./PROJECT_SOT.md) para visão geral
2. Leia [AI_DOCUMENTATION_STANDARDS.md](./AI_DOCUMENTATION_STANDARDS.md) para padrões
3. Configure ambiente com [SUPER_ADMIN_SETUP.md](./SUPER_ADMIN_SETUP.md)
4. Consulte documentos técnicos específicos conforme necessidade

### 📊 **Para Stakeholders**
1. [PROJECT_SOT.md](./PROJECT_SOT.md) - Visão estratégica completa
2. `BUSINESS_STRATEGY.md` - Estratégia de mercado (em desenvolvimento)
3. `GROWTH_METRICS.md` - KPIs e métricas (em desenvolvimento)

### 🔐 **Para Administradores**
1. [SUPER_ADMIN_SETUP.md](./SUPER_ADMIN_SETUP.md) - Setup inicial
2. [IMPERSONATION_LEGAL_GUIDE.md](./IMPERSONATION_LEGAL_GUIDE.md) - Compliance
3. [DUAL_ROLE_GUIDE.md](./DUAL_ROLE_GUIDE.md) - Experiência dual

---

## 📞 **SUPORTE E CONTATO**

- **Dúvidas Técnicas**: Consulte AI_DOCUMENTATION_STANDARDS.md
- **Questões de Negócio**: Referir ao PROJECT_SOT.md
- **Issues de Segurança**: SUPER_ADMIN_SETUP.md + IMPERSONATION_LEGAL_GUIDE.md
- **Atualizações**: Monitore este índice para novos documentos

---

**Última Atualização**: 02/10/2025  
**Próxima Revisão**: 09/10/2025  
**Responsável**: Solution Architect Team