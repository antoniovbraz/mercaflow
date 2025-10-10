# 🚀 MercaFlow - Roadmap Executivo 90 Dias

**Data**: 10 de Outubro de 2025  
**Criado por**: PO/PM/Dev Sênior  
**Objetivo**: Lançar MVP funcional com tração inicial em 90 dias  
**Filosofia**: "Done is better than perfect. Ship, learn, iterate."

---

## 🎯 NORTH STAR GOAL (Dia 90)

**"100 usuários registrados, 60 ativos, 10 pagando, NPS > 40"**

**Por quê essas métricas?**
- 100 sign-ups = validação de interesse (marketing funcionando)
- 60 ativos (60%) = product-market fit inicial
- 10 pagos (R$470 MRR) = prova de valor real
- NPS > 40 = satisfação suficiente para crescer

---

## 📅 ROADMAP DE 90 DIAS

### 🔴 FASE 1: FUNDAÇÃO (Dias 1-14)

**Objetivo**: Código production-ready, seguro e monitorável

#### **Semana 1 (Dias 1-7): Segurança & Limpeza**

**Day 1-2: Segurança CRÍTICA** ⚠️
```bash
URGENTE - Fazer HOJE:
1. Adicionar NODE_ENV check em 11 endpoints debug
2. Mover 29 arquivos SQL para scripts/debug/
3. Atualizar .gitignore (scripts/debug/**)
4. Deploy teste em Vercel preview

Tempo: 2 dias
Risco: ALTO (segurança)
```

**Day 3-5: Logging Profissional**
```bash
1. Criar utils/logger.ts (info, warn, error)
2. Configurar Sentry.io (free tier)
3. Substituir 150+ console.log
4. Testar tracking de erros

Tempo: 3 dias
Benefício: Debug 10x mais rápido
```

**Day 6-7: Error Handling Global**
```bash
1. Criar utils/error-handler.ts
2. Error boundary React
3. Try-catch em APIs críticas
4. Documentar códigos de erro

Tempo: 2 dias
```

**✅ Resultado Semana 1**: App seguro e monitorável

---

#### **Semana 2 (Dias 8-14): Performance & RBAC**

**Day 8-9: Cache Estratégico**
```bash
1. Setup Upstash Redis (free tier)
2. Cachear dashboard stats (5min TTL)
3. Cachear listas (2min TTL)
4. Medir performance (before/after)

Tempo: 2 dias
Benefício: Dashboard 5-10x mais rápido
```

**Day 10-12: Validação de Permissões**
```bash
1. Criar utils/api-middleware.ts
2. Implementar requirePermission()
3. Adicionar em 10 APIs:
   - /api/ml/items
   - /api/ml/orders
   - /api/ml/questions
   - /api/ml/webhooks
   - /api/dashboard/*
4. Testes unitários

Tempo: 3 dias
```

**Day 13-14: Testes & Deploy**
```bash
1. Suite E2E (Playwright)
2. Fluxos críticos (login → sync → dashboard)
3. Deploy staging
4. Smoke tests

Tempo: 2 dias
```

**✅ Resultado Semana 2**: Código production-grade

---

### 🟡 FASE 2: MVP CORE (Dias 15-45)

**Objetivo**: Features que entregam VALOR REAL

#### **Semana 3-4 (Dias 15-28): Primeira IA 🧠**

**Por que começar com IA?** É o diferencial. Sem IA = só mais um dashboard.

**Day 15-21: Elasticidade-Preço (7 dias)**
```bash
Feature: Calcular elasticidade-preço

Algoritmo:
1. Histórico preços × vendas
2. Calcular slope (ΔQtd / ΔPreço)
3. Classificar (elástico/unitário/inelástico)
4. Gerar recomendação

Tasks:
Day 15-16: Schema + migration
Day 17-18: Algoritmo backend
Day 19-20: UI/UX (Recharts)
Day 21: Validar com 3 sellers

Impacto: CRÍTICO - core value
```

**Day 22-28: Margem Ótima + Break-Even (7 dias)**
```bash
Feature: Calculadora financeira

Fórmulas:
- Margem = (Preço - Custo) / Preço × 100
- Break-even = Fixos / (Preço - Variável)

Tasks:
Day 22-23: Campo custo (ml_items.cost)
Day 24-25: Calculadora backend
Day 26-27: UI (KPIs + simulador)
Day 28: Integração com elasticidade

Tempo: 7 dias
```

**✅ Resultado Semana 3-4**: Primeira IA funcional

---

#### **Semana 5-6 (Dias 29-42): ML + Alertas 📊**

**Day 29-35: Previsão de Demanda (7 dias)**
```bash
Feature: Prever vendas 30/60/90 dias

Algoritmo (começar simples):
- Moving Average (baseline)
- Exponential Smoothing (melhor)
- Prophet (se tiver tempo)

Tasks:
Day 29-30: Coletar histórico
Day 31-32: Modelo (começar simples!)
Day 33-34: UI (gráfico + intervalo)
Day 35: Validar acurácia (MAPE < 20%)

Nota: SIMPLICIDADE > complexidade
```

**Day 36-42: Sistema de Alertas (7 dias)**
```bash
Feature: Notificar eventos críticos

Alertas:
1. Estoque baixo (< 5 un)
2. Preço fora mercado (±20%)
3. Ruptura prevista
4. Anomalia vendas (3x normal)
5. Nova pergunta/pedido

Tasks:
Day 36-37: Schema alertas
Day 38-39: Regras de negócio
Day 40: Email (Resend.com)
Day 41: WhatsApp (Twilio - opcional)
Day 42: UI (central notificações)

Impacto: ALTO - engajamento 3x
```

**✅ Resultado Semana 5-6**: ML + Alertas prontos

---

#### **Semana 6.5 (Dias 43-45): Beta Privado 🧪**

**Day 43-45: Recrutar e Onboarding**
```bash
Objetivo: 10 sellers testando

Processo:
1. Recrutar (grupos WhatsApp/Telegram)
2. Oferta: 6 meses grátis
3. Onboarding 1:1 (30min cada)
4. Feedback estruturado

Meta Validação:
- 7/10 usam diariamente
- 8/10 pagariam R$50-R$100/mês
- NPS > 40

Tasks:
Day 43: Recrutar 10 sellers
Day 44: Onboarding calls
Day 45: Setup tracking (Mixpanel)
```

**✅ Resultado Dia 45**: PMF inicial validado

---

### 🟢 FASE 3: SCALE PREP (Dias 46-75)

**Objetivo**: Features de crescimento

#### **Semana 7-9 (Dias 46-66): Website + Sazonalidade**

**Day 46-56: Website Builder (11 dias)**
```bash
Feature: Site auto-gerado

Fluxo:
1. Connect ML → produtos sync
2. Click "Gerar Site" → 3 templates
3. 30 segundos → site pronto
4. Deploy Vercel/Netlify
5. SEO otimizado

Tasks:
Day 46-48: 3 templates (React + Tailwind)
Day 49-50: Sistema geração (SSG)
Day 51-52: Integração Vercel API
Day 53-54: SEO (meta tags, sitemap)
Day 55: Domínio custom (opcional)
Day 56: Analytics (GA4)

Tempo: 11 dias
Impacto: ALTO - diferencial marketing
```

**Day 57-66: Sazonalidade BR (10 dias)**
```bash
Feature: Padrões sazonais

Calendário:
- Jan: Volta aulas
- Fev: Carnaval
- Mai: Dia Mães
- Jun: Namorados
- Nov: Black Friday
- Dez: Natal

Tasks:
Day 57-58: Modelar sazonalidade
Day 59-61: Algoritmo detecção
Day 62-63: Recomendações
Day 64-65: UI (calendário + insights)
Day 66: Validar com sellers

Tempo: 10 dias
```

**✅ Resultado Semana 7-9**: Website + Sazonalidade

---

#### **Semana 10 (Dias 67-73): Arquitetura Multi-Marketplace**

**Day 67-73: Produto vs. Listing (7 dias)**
```bash
Objetivo: Preparar para Shopee

Mudanças:
1. Tabela products (SKUs internos)
2. Tabela listings (anúncios marketplace)
3. Migração ml_items → listings
4. FK products → listings
5. Dashboard consolidado

Tasks:
Day 67: Migration (products + listings)
Day 68-69: Script migração dados
Day 70-71: Sync logic (2 tabelas)
Day 72: Dashboard (produto → N listings)
Day 73: Testes extensivos

Tempo: 7 dias
Risco: MÉDIO (migração dados)
```

**✅ Resultado Semana 10**: Arquitetura escalável

---

#### **Semana 11 (Dias 74-75): Pre-Launch**

**Day 74-75: Preparação Final**
```bash
- Landing page atualizada
- Termos de uso + Privacy
- FAQ (10 perguntas)
- Vídeo demo (3min YouTube)
- Blog post lançamento
- Email templates
- Smoke tests

Tempo: 2 dias
```

**✅ Resultado Dia 75**: Pronto para launch

---

### 🚀 FASE 4: LAUNCH (Dias 76-90)

#### **Semana 12-13 (Dias 76-90): Go-to-Market**

**Day 76: Launch Day 🎉**
```bash
Canais:
1. Grupos WhatsApp/Telegram (10+ grupos)
2. LinkedIn (post pessoal)
3. ProductHunt (opcional)
4. YouTube (vídeo demo)
5. Blog

Oferta:
"Primeiros 50: 50% OFF vitalício"

Meta Day 1: 20 sign-ups
```

**Day 77-90: Growth Loop**
```bash
Semana 12:
- Monitorar métricas diariamente
- Responder feedbacks < 2h
- Fixar bugs < 24h
- Iterar features

Meta: 50 sign-ups, 30 ativos

Semana 13:
- Google Ads (R$1k budget)
- Influencers (afiliação 30%)
- Content marketing (2 posts/sem)
- Referral program
- NPS survey

Meta: 100 sign-ups, 60 ativos, 10 pagos
```

**✅ Resultado Dia 90**: MVP com tração

---

## 🎯 KPIs SEMANAIS

```
Semana 1-2 (Fundação):
□ 0 erros críticos produção
□ 100% debug endpoints protegidos
□ < 1s response time (p95)

Semana 3-6 (MVP Core):
□ 10 beta testers ativos
□ 70%+ uso diário
□ NPS > 40
□ 2+ features IA funcionais

Semana 7-11 (Scale Prep):
□ Website builder: 5 sites gerados
□ Sazonalidade: 10 insights
□ Arquitetura refatorada

Semana 12-13 (Launch):
□ 100 sign-ups
□ 60 ativados (60%)
□ 10 pagos (R$470 MRR)
□ Churn < 10%
```

---

## 💰 BUDGET 90 DIAS

**Infraestrutura**:
```
Mês 1-2 (Beta): R$0
- Vercel Hobby: $0
- Supabase Free: $0
- Upstash: $0
- Sentry: $0
- Resend: $0

Mês 3 (Launch): R$225
- Vercel Pro: $20
- Supabase Pro: $25 (se necessário)
```

**Marketing (Mês 3)**:
```
- Google Ads: R$1.000
- Influencers: R$0 (afiliação)
- Content: R$0 (você escreve)
Total: R$1.000
```

**One-time**:
```
- Designer (Fiverr): R$500
- Consultor ML: R$2k (opcional)
Total: R$2.500
```

**TOTAL 90 DIAS**: R$3.725 (~R$1.2k/mês)

**ROI**: 10 pagos × R$47 = R$470 MRR  
**Payback**: 8 meses (ótimo para SaaS)

---

## ⚠️ RISCOS & MITIGAÇÕES

**Risco 1**: Não conseguir 10 beta testers  
**Mitigação**: Recrutar AGORA (grupos), oferecer 6 meses grátis

**Risco 2**: IA não funciona (dados insuficientes)  
**Mitigação**: Começar simples (Moving Average), comunicar honestamente

**Risco 3**: Sellers não pagam R$47  
**Mitigação**: Validar pricing no beta, mostrar ROI claro

**Risco 4**: Desenvolvimento atrasa  
**Mitigação**: Buffer 20% incluído, cortar COULD HAVE se necessário

**Risco 5**: Competidor lança antes  
**Mitigação**: Executar RÁPIDO (90 dias é agressivo)

---

## ✅ DECISÕES CRÍTICAS (PO/PM)

### 1. ML + Shopee ou ML only no MVP?
**Decisão**: **ML only**

Razões:
- Foco > dispersão
- Validar PMF primeiro
- Adicionar Shopee em 30 dias (Fase 4)

---

### 2. Python ou TypeScript para ML?
**Decisão**: **TypeScript no MVP**

Razões:
- Stack unificado (menos complexidade)
- Deploy simples (1 projeto)
- Migrar para Python depois se necessário

---

### 3. Free tier 25 ou 50 produtos?
**Decisão**: **25 produtos**

Razões:
- Cobre 75% faturamento (Pareto)
- Conversão 25-30% (melhor)
- Custo 40% menor

---

### 4. Website builder no MVP?
**Decisão**: **Sim (Fase 3)**

Razões:
- Diferencial marketing
- Não é complexo (templates prontos)
- Começar com 1 template

---

### 5. Cobrar no beta?
**Decisão**: **Grátis por 6 meses**

Razões:
- Feedback > receita nesta fase
- Validar PMF antes de cobrar
- Beta testers = evangelistas

---

## 🚦 GO/NO-GO GATES

**Gate 1 (Dia 14)**: Fundação OK?
- 0 endpoints debug expostos
- Sentry funcionando
- Cache < 1s
- 0 erros críticos staging

**Gate 2 (Dia 45)**: PMF inicial?
- 7/10 beta testers usam diariamente
- NPS > 40
- 8/10 pagariam R$50-R$100/mês

**Gate 3 (Dia 75)**: Ready to Launch?
- Website builder funcional
- Sazonalidade implementada
- 0 bugs críticos

**Gate 4 (Dia 90)**: Tração validada?
- 100+ sign-ups
- 60+ ativos (60%)
- 10+ pagos (R$470 MRR)
- Churn < 10%

---

## 🎯 PRIORIZAÇÃO (Se Atrasar)

**MUST HAVE** (Não lançar sem):
1. Elasticidade-preço (IA core)
2. Sistema alertas (engajamento)
3. Dashboard métricas básicas
4. Sync ML 100%
5. Pricing + payments

**SHOULD HAVE** (Importante mas não bloqueante):
1. Previsão demanda
2. Website builder
3. Sazonalidade
4. Modelo produto/listing

**COULD HAVE** (Nice to have):
1. WhatsApp integration
2. Multi-marketplace (Shopee)
3. API pública
4. Relatórios customizados

**Regra**: Dia 60 atrasado? Cortar COULD HAVE, avaliar SHOULD HAVE

---

## 📚 RECURSOS

**Livros (1/semana)**:
1. "The Mom Test" - Rob Fitzpatrick
2. "Hooked" - Nir Eyal
3. "Traction" - Gabriel Weinberg

**Podcasts (diário)**:
1. Masters of Scale
2. Indie Hackers
3. My First Million

**Comunidades**:
1. Indie Hackers
2. r/SaaS
3. SaaS Brasil (Telegram)

---

## 🚀 PRÓXIMA AÇÃO (AGORA)

### Esta Semana (Dia 1-7):

**Dia 1 (HOJE)**:
```bash
1. Proteger endpoints debug (2h)
2. Mover arquivos SQL (1h)
3. Commit + push

Total: 3h
```

**Dia 2**:
```bash
1. Criar conta Sentry.io
2. Configurar projeto
3. Testar tracking erro

Total: 2h
```

**Dia 3-5**:
```bash
1. Criar utils/logger.ts
2. Substituir 150+ console.log
3. Integrar Sentry

Total: 3 dias (8h/dia = 24h)
```

**Dia 6-7**:
```bash
1. utils/error-handler.ts
2. Error boundary React
3. Try-catch APIs

Total: 2 dias (16h)
```

---

### ✋ ANTES DE COMEÇAR

Checklist:
- [ ] Commit código atual (backup)
- [ ] Criar branch `feature/foundation`
- [ ] Ler roadmap inteiro
- [ ] Configurar contas (Sentry, Upstash)
- [ ] Timeboxing: Pomodoro 25min
- [ ] Desligar notificações

---

## 💡 LEMBRETE FINAL

> **"Done is better than perfect. MVP = Minimum VIABLE, not Minimum Impressive. Ship, learn, iterate."** 🚀

**Pronto para começar?** 💪

---

## 🎯 PRIMEIRA TAREFA (15 MIN)

Vou implementar AGORA:

**Proteger endpoints debug** (Dia 1 - Tarefa 1)

```typescript
// Adicionar no início de cada endpoint debug:
if (process.env.NODE_ENV === 'production') {
  return NextResponse.json(
    { error: 'Debug endpoints disabled in production' },
    { status: 403 }
  );
}
```

**Arquivos para atualizar** (11 endpoints):
1. app/api/debug/create-profile/route.ts
2. app/api/debug/create-role/route.ts
3. app/api/debug/ml-api-test/route.ts
4. app/api/debug/ml-integration/route.ts
5. app/api/setup/assign-super-admin-role/route.ts
6. app/api/setup/complete-super-admin-setup/route.ts
7. app/api/setup/create-super-admin-profile/route.ts
8. app/api/debug-ml/route.ts
9. app/api/dashboard/data/route.ts
10. app/test-db/route.ts (se existir)
11. app/test-role/route.ts (se existir)

**Quer que eu comece?** 🚀
