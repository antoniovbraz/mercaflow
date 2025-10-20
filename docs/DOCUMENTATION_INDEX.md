# 📚 Índice de Documentação - MercaFlow

**Última atualização**: 19 de Outubro de 2025  
**Status**: ✅ Organizado e atualizado

---

## 🚀 Quick Start

### Para Novos Desenvolvedores

1. 📖 **[README Principal](../README.md)** - Visão geral do projeto
2. 🎓 **[Guia Iniciante](04-guias/GUIA_INICIANTE.md)** - Começar desenvolvimento
3. ⚡ **[Ações Rápidas](04-guias/ACOES_RAPIDAS.md)** - Comandos e workflows comuns

### Para Integração com Mercado Livre

1. 🔧 **[Integração ML Completa](05-integracoes/ml/INTEGRACAO_ML_COMPLETA.md)**
2. 📝 **[Guia Rápido ML](04-guias/GUIA_RAPIDO_ML.md)**
3. ⚠️ **[Issues Conhecidos ML](05-integracoes/ml/ISSUES_CONHECIDOS_ML.md)**

---

## 📋 1. PLANEJAMENTO & ESTRATÉGIA

### Visão do Produto

- **[Visão do Produto](01-planejamento/VISAO_PRODUTO_CORRETA.md)** - Objetivos, proposta de valor, personas
- **[Especificação Técnica](01-planejamento/ESPECIFICACAO_TECNICA.md)** - Arquitetura, stack, decisões técnicas
- **[Decisões Estratégicas](01-planejamento/DECISOES_ESTRATEGICAS.md)** - Decisões de produto e negócio

### Roadmaps

- **[Roadmap 90 Dias](01-planejamento/ROADMAP_EXECUTIVO_90DIAS.md)** - Planejamento trimestral executivo
- **[Roadmap Implementação](01-planejamento/ROADMAP_IMPLEMENTACAO.md)** - Roadmap técnico detalhado
- **[Análise Pricing MVP](01-planejamento/ANALISE_PRICING_MVP.md)** - Estratégia de preços e monetização

---

## 🔍 2. AUDITORIAS

### Auditorias Atuais

- **[Auditoria API ML Oficial](02-auditorias/AUDITORIA_ML_API_OFICIAL.md)** ⭐ **CRÍTICO**
  - Comparação implementação vs documentação oficial ML
  - Gaps identificados (Questions API v4, Webhooks, Orders)
  - Priorização de correções (84h total, 14h crítico)
- **[Auditoria UI/UX Completa](02-auditorias/AUDITORIA_UI_UX_COMPLETA.md)**
  - Análise de usabilidade, acessibilidade, consistência
  - Plano de ação com 50+ melhorias catalogadas
- **[Auditoria Schema Database](02-auditorias/AUDITORIA_SCHEMA_COMPLETA.md)**
  - Validação de schema, RLS policies, índices
  - Recomendações de otimização

### Auditorias Históricas

- **[Auditorias Antigas](archives/auditorias-antigas/)** - Auditorias obsoletas arquivadas

---

## 🎯 3. FASES DE IMPLEMENTAÇÃO

### Fase 1 - ML Integration (✅ 100% Completa)

- **[Fase 1 - 100% Completa](03-fases/fase-1/FASE1_100_COMPLETA.md)**
  - OAuth 2.0 + PKCE
  - Sincronização de produtos, pedidos, perguntas
  - Webhooks com processamento assíncrono
  - **Status**: Deployed em produção
- **[Progresso Detalhado Fase 1](03-fases/fase-1/PROGRESSO_IMPLEMENTACAO_FASE1.md)**
  - Timeline completo (21.5h de implementação)
  - Commits, decisões técnicas, troubleshooting

### Fase 3 - Features (✅ Completa)

- **[Fase 3 - Completa](03-fases/fase-3/FASE3_COMPLETA.md)**
  - Dashboard widgets
  - Sistema de notificações
  - Melhorias de UX
- **[Resumo Final Fase 3](03-fases/fase-3/RESUMO_FINAL_FASE3.md)**
  - Métricas de conclusão
  - Lições aprendidas

### Fase 4 - Refatoração (✅ 100% Completa)

- **[Fase 4 - 100% Completa](03-fases/fase-4/FASE4_100_COMPLETA.md)** ⭐
  - Service Layer pattern implementado
  - Repository pattern com injeção de dependência
  - Redução de 250+ linhas → 80 linhas por endpoint
  - **Status**: Deployed e validado
- **[Refatoração Completa](03-fases/fase-4/FASE4_REFATORACAO_COMPLETA.md)**
  - Detalhes técnicos da refatoração
  - Before/After comparisons
- **[Resumo Executivo Fase 4](03-fases/fase-4/FASE4_RESUMO_EXECUTIVO.md)**
  - Métricas de impacto
  - ROI da refatoração

### Validações Históricas

- **[Validações de Fases](archives/fases-validacoes/)** - Checkpoints intermediários arquivados

---

## 📖 4. GUIAS & TUTORIAIS

### Guias Principais

- **[Guia Iniciante](04-guias/GUIA_INICIANTE.md)**
  - Setup do ambiente de desenvolvimento
  - Estrutura do projeto
  - Primeiros passos
- **[Guia Rápido ML](04-guias/GUIA_RAPIDO_ML.md)**
  - Troubleshooting de integração ML
  - OAuth state table fixes
  - Soluções rápidas para problemas comuns
- **[Ações Rápidas](04-guias/ACOES_RAPIDAS.md)**
  - Comandos frequentes (dev, build, deploy, db)
  - Workflows comuns
  - Atalhos de produtividade

### Testing

- **[Como Testar Notifications Widget](04-guias/testing/COMO_TESTAR_NOTIFICATIONS_WIDGET.md)**
  - Testes de componentes
  - Testes de integração
  - Mock de dados ML

---

## 🔧 5. INTEGRAÇÕES

### Mercado Livre

- **[Integração ML Completa](05-integracoes/ml/INTEGRACAO_ML_COMPLETA.md)**
  - OAuth 2.0 + PKCE flow
  - Token management com refresh automático
  - Endpoints implementados (products, orders, questions, webhooks)
- **[Análise Integração ML](05-integracoes/ml/ANALISE_INTEGRACAO_ML_COMPLETA.md)**
  - Análise técnica detalhada
  - Diagramas de sequência
  - Fluxos de dados
- **[Issues Conhecidos ML](05-integracoes/ml/ISSUES_CONHECIDOS_ML.md)** ⚠️
  - Problemas conhecidos e workarounds
  - Limitações da API ML
  - Status de resolução

### Troubleshooting

- **[Debug Webhook 400 Errors](05-integracoes/ml/troubleshooting/DEBUG_WEBHOOK_400_ERRORS.md)**
  - Resolver erros de webhook
  - Schema mismatch fixes
  - Logs e debugging

### Migrações Históricas

- **[Migrações ML](archives/migracoes-ml/)** - Migrações já concluídas (20251019 rebuild)

---

## 🚀 6. DEPLOY & PRODUÇÃO

### Checklists

- **[Checklist Deploy](06-deploy/CHECKLIST_DEPLOY.md)**
  - Pré-deploy: variáveis, migrações, testes
  - Deploy: Vercel, Supabase
  - Pós-deploy: validação, monitoramento
- **[Deploy Fase 1 Produção](06-deploy/DEPLOY_FASE1_PRODUCAO.md)**
  - Deploy específico da Fase 1
  - Configurações ML em produção
  - Validações pós-deploy

---

## 🔒 7. SEGURANÇA

- **[Security & Environment Cleanup](07-seguranca/SECURITY_ENV_CLEANUP.md)**
  - Variáveis de ambiente obrigatórias
  - Secrets management
  - Token encryption (AES-256-GCM)
  - RLS policies

---

## 🎨 8. UI/UX

- **[Plano de Ação UI/UX](08-ui-ux/PLANO_ACAO_UI_UX.md)**
  - 50+ melhorias catalogadas
  - Priorização (crítico, alto, médio, baixo)
  - Design system e componentes
  - Acessibilidade (WCAG 2.1 AA)

---

## 📦 9. ARQUIVOS HISTÓRICOS

### Auditorias Antigas

- **[Auditorias Antigas](archives/auditorias-antigas/)** - 13 auditorias obsoletas
  - Substituídas por auditorias mais recentes
  - Mantidas para contexto histórico

### Validações de Fases

- **[Validações de Fases](archives/fases-validacoes/)** - 13 validações intermediárias
  - VALIDACAO_FASE1_1 até FASE1_5
  - FASE1_1_APROVADA, FASE1_4_APROVADA
  - Checkpoints já integrados nos documentos de fase completa

### Migrações ML

- **[Migrações ML](archives/migracoes-ml/)** - 8 documentos de migração
  - Rebuild do schema ML (20251019)
  - Processos já concluídos
  - Mantidos para referência histórica

### Refatorações

- **[Refatorações](archives/refatoracoes/)** - 7 documentos de refatoração
  - Correções TypeScript
  - Fixes de produção
  - Processos já concluídos

---

## 🔍 BUSCA RÁPIDA

### Por Tópico

#### OAuth & Autenticação

- [Especificação Técnica](01-planejamento/ESPECIFICACAO_TECNICA.md) - Seção 2.2 Authentication
- [Integração ML](05-integracoes/ml/INTEGRACAO_ML_COMPLETA.md) - OAuth 2.0 + PKCE
- [Fase 1](03-fases/fase-1/FASE1_100_COMPLETA.md) - Implementação OAuth

#### Produtos (Items)

- [Auditoria API ML](02-auditorias/AUDITORIA_ML_API_OFICIAL.md) - Seção 1 Products/Items
- [Fase 1](03-fases/fase-1/FASE1_100_COMPLETA.md) - Sincronização de produtos

#### Pedidos (Orders)

- [Auditoria API ML](02-auditorias/AUDITORIA_ML_API_OFICIAL.md) - Seção 2 Orders
- [Issues Conhecidos](05-integracoes/ml/ISSUES_CONHECIDOS_ML.md) - Problemas com orders

#### Perguntas (Questions)

- [Auditoria API ML](02-auditorias/AUDITORIA_ML_API_OFICIAL.md) - Seção 3 Questions ⚠️ CRÍTICO
- Problema: Não usa API v4 (obrigatório)

#### Webhooks

- [Auditoria API ML](02-auditorias/AUDITORIA_ML_API_OFICIAL.md) - Seção 4 Webhooks
- [Debug Webhook Errors](05-integracoes/ml/troubleshooting/DEBUG_WEBHOOK_400_ERRORS.md)
- [Fase 1](03-fases/fase-1/FASE1_100_COMPLETA.md) - Webhook implementation

#### Database & Schema

- [Auditoria Schema](02-auditorias/AUDITORIA_SCHEMA_COMPLETA.md)
- [Especificação Técnica](01-planejamento/ESPECIFICACAO_TECNICA.md) - Seção 2.3 Database

#### UI/UX

- [Auditoria UI/UX](02-auditorias/AUDITORIA_UI_UX_COMPLETA.md)
- [Plano de Ação UI/UX](08-ui-ux/PLANO_ACAO_UI_UX.md)

#### Deploy

- [Checklist Deploy](06-deploy/CHECKLIST_DEPLOY.md)
- [Deploy Fase 1](06-deploy/DEPLOY_FASE1_PRODUCAO.md)

---

## 📊 MÉTRICAS DO PROJETO

### Fases Concluídas

```
✅ Fase 1 - ML Integration:      100% (21.5h)
✅ Fase 3 - Features:             100%
✅ Fase 4 - Refatoração:          100%
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Status Geral:                    Em Produção
```

### Próximas Ações (conforme Auditoria API ML)

```
🔴 CRÍTICO (Sprint 1):           14h
   - Questions API v4 migration
   - Webhooks <500ms response
   - Orders fraud detection

🟡 IMPORTANTE (Sprint 2):        34h
   - Products scroll +1000 items
   - Orders advanced filters
   - Webhooks missing topics

🟢 MELHORIAS (Sprint 3-4):       36h
   - Messages API
   - Products CRUD
   - Orders discounts/packs
```

### Documentação

```
Arquivos totais:                 63 documentos
Documentos ativos:               25 (40%)
Arquivos históricos:             38 (60%)
Redução de complexidade:         64%
```

---

## 🆘 SUPORTE

### Problemas Comuns

1. **Webhook errors** → [Debug Webhook Errors](05-integracoes/ml/troubleshooting/DEBUG_WEBHOOK_400_ERRORS.md)
2. **OAuth failures** → [Guia Rápido ML](04-guias/GUIA_RAPIDO_ML.md)
3. **Database migrations** → [Checklist Deploy](06-deploy/CHECKLIST_DEPLOY.md)
4. **API rate limits** → [Issues Conhecidos ML](05-integracoes/ml/ISSUES_CONHECIDOS_ML.md)

### Contato

- **GitHub Issues**: Para bugs e feature requests
- **Documentation**: Este índice e documentos referenciados

---

**Mantido por**: Equipe MercaFlow  
**Última revisão**: 19 de Outubro de 2025
