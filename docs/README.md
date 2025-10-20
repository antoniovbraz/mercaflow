# 📚 Documentação MercaFlow

Documentação completa do projeto MercaFlow - SaaS para integração com Mercado Livre.

---

## 🗂️ Estrutura

```
docs/
├── 📖 DOCUMENTATION_INDEX.md       ← COMECE AQUI (índice completo)
│
├── 01-planejamento/                ← Visão, estratégia, roadmaps
├── 02-auditorias/                  ← Auditorias técnicas atuais
├── 03-fases/                       ← Fases de implementação
│   ├── fase-1/                       (ML Integration - ✅ 100%)
│   ├── fase-3/                       (Features - ✅ 100%)
│   └── fase-4/                       (Refatoração - ✅ 100%)
├── 04-guias/                       ← Guias práticos e tutoriais
│   └── testing/
├── 05-integracoes/                 ← Integrações (ML, etc.)
│   └── ml/
│       └── troubleshooting/
├── 06-deploy/                      ← Checklists de deploy
├── 07-seguranca/                   ← Segurança e secrets
├── 08-ui-ux/                       ← Design e experiência
│
└── archives/                       ← Documentação histórica
    ├── auditorias-antigas/
    ├── fases-validacoes/
    ├── migracoes-ml/
    └── refatoracoes/
```

---

## 🚀 Quick Links

### Novos Desenvolvedores

1. **[Índice Completo](DOCUMENTATION_INDEX.md)** ⭐ Comece aqui!
2. **[Guia Iniciante](04-guias/GUIA_INICIANTE.md)** - Setup e primeiros passos
3. **[Ações Rápidas](04-guias/ACOES_RAPIDAS.md)** - Comandos comuns

### Integração ML

1. **[Integração ML Completa](05-integracoes/ml/INTEGRACAO_ML_COMPLETA.md)**
2. **[Guia Rápido ML](04-guias/GUIA_RAPIDO_ML.md)**
3. **[Debug Webhook Errors](05-integracoes/ml/troubleshooting/DEBUG_WEBHOOK_400_ERRORS.md)**

### Auditorias & Roadmap

1. **[Auditoria API ML Oficial](02-auditorias/AUDITORIA_ML_API_OFICIAL.md)** 🔥 CRÍTICO
2. **[Auditoria UI/UX](02-auditorias/AUDITORIA_UI_UX_COMPLETA.md)**
3. **[Roadmap 90 Dias](01-planejamento/ROADMAP_EXECUTIVO_90DIAS.md)**

### Deploy

1. **[Checklist Deploy](06-deploy/CHECKLIST_DEPLOY.md)**
2. **[Deploy Fase 1](06-deploy/DEPLOY_FASE1_PRODUCAO.md)**

---

## 📊 Status do Projeto

### Fases Concluídas

- ✅ **Fase 1** - ML Integration (100%) - OAuth, sync, webhooks
- ✅ **Fase 3** - Features (100%) - Dashboard, notifications
- ✅ **Fase 4** - Refatoração (100%) - Service layer, clean code

### Próximas Ações (Auditoria API ML)

- 🔴 **CRÍTICO**: Questions API v4, Webhooks <500ms, Fraud detection (14h)
- 🟡 **IMPORTANTE**: Products scroll, Orders filters, Topics faltantes (34h)
- 🟢 **MELHORIAS**: Messages API, Products CRUD, Discounts (36h)

---

## 🔍 Busca por Tópico

- **OAuth** → [Integração ML](05-integracoes/ml/INTEGRACAO_ML_COMPLETA.md)
- **Products** → [Auditoria ML API](02-auditorias/AUDITORIA_ML_API_OFICIAL.md) seção 1
- **Orders** → [Auditoria ML API](02-auditorias/AUDITORIA_ML_API_OFICIAL.md) seção 2
- **Questions** → [Auditoria ML API](02-auditorias/AUDITORIA_ML_API_OFICIAL.md) seção 3 ⚠️
- **Webhooks** → [Auditoria ML API](02-auditorias/AUDITORIA_ML_API_OFICIAL.md) seção 4
- **UI/UX** → [Plano de Ação UI/UX](08-ui-ux/PLANO_ACAO_UI_UX.md)
- **Database** → [Auditoria Schema](02-auditorias/AUDITORIA_SCHEMA_COMPLETA.md)

---

## 📝 Contribuindo

Para adicionar nova documentação:

1. **Identifique a categoria** correta (01-planejamento, 02-auditorias, etc.)
2. **Crie o arquivo** no diretório apropriado
3. **Atualize o índice** em `DOCUMENTATION_INDEX.md`
4. **Siga o padrão** de formatação existente

### Arquivamento

Documentos obsoletos devem ser movidos para `archives/` com contexto no README.

---

## 📦 Documentação Histórica

Consulte **[archives/](archives/)** para documentação obsoleta mantida para contexto histórico.

---

**Última atualização**: 19 de Outubro de 2025  
**Status**: ✅ Organizado e atualizado  
**Redução**: 64% menos arquivos (70 → 25)
