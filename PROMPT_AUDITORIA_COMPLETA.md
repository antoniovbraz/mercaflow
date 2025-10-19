# 🎯 Prompt de Auditoria e Desenvolvimento Completo - MercaFlow

## 📋 Contexto do Projeto

MercaFlow é uma plataforma SaaS enterprise-grade para integração com Mercado Livre, construída com:

- **Stack**: Next.js 15.5.4, TypeScript, Supabase, Tailwind CSS, shadcn/ui
- **Mercado**: Brasil (conteúdo em português pt-BR)
- **Arquitetura**: Multi-tenant com RBAC hierárquico (64 permissões granulares)
- **Segurança**: RLS policies + profile-based roles (SEM JWT claims customizados)

## 🔍 FASE 1: Leitura Completa da Documentação

Por favor, leia e analise TODA a documentação do projeto na seguinte ordem:

### 1.1 Documentação Principal (Raiz do Projeto)

- [ ] `.github/copilot-instructions.md` - **CRÍTICO**: Instruções completas de arquitetura e padrões
- [ ] `README.md` - Overview do projeto
- [ ] `ESPECIFICACAO_TECNICA.md` - Especificações técnicas detalhadas
- [ ] `VISAO_PRODUTO_CORRETA.md` - Visão de produto e funcionalidades

### 1.2 Documentação de Planejamento

- [ ] `ROADMAP_EXECUTIVO_90DIAS.md` - Roadmap de 90 dias
- [ ] `ROADMAP_IMPLEMENTACAO.md` - Plano de implementação técnica
- [ ] `DECISOES_ESTRATEGICAS.md` - Decisões arquiteturais importantes
- [ ] `ANALISE_PRICING_MVP.md` - Estratégia de pricing e planos

### 1.3 Documentação de Integração ML

- [ ] `INTEGRACAO_ML_COMPLETA.md` - Guia completo de integração Mercado Livre
- [ ] `ANALISE_INTEGRACAO_ML_COMPLETA.md` - Análise detalhada da integração
- [ ] `CHECKLIST_DEPLOY_ML.md` - Checklist para deploy da integração
- [ ] `ISSUES_CONHECIDOS_ML.md` - Problemas conhecidos e soluções

### 1.4 Documentação Técnica (`docs/`)

- [ ] `docs/SENTRY_SETUP.md` - Configuração de monitoramento
- [ ] `docs/CACHE.md` - Estratégia de caching
- [ ] `docs/LOGGING.md` - Sistema de logging
- [ ] `docs/ML_API_AUDIT.md` - Auditoria da API do ML
- [ ] `docs/VERCEL_ENV_GUIDE.md` - Configuração de ambiente Vercel
- [ ] `docs/pt/ARQUITETURA.md` - Arquitetura do sistema
- [ ] `docs/pt/MULTI_TENANCY.md` - Sistema multi-tenant
- [ ] `docs/pt/RBAC.md` - Sistema de permissões

### 1.5 Auditorias e Análises

- [ ] `AUDITORIA_MERCAFLOW.md` - Auditoria geral do projeto
- [ ] `RESUMO_AUDITORIA_ML.md` - Resumo da auditoria ML
- [ ] `PROGRESSO_AUDITORIA.md` - Progresso das auditorias
- [ ] `SUMARIO_AUDITORIA.md` - Sumário executivo

### 1.6 Configuração do Projeto

- [ ] `package.json` - Dependências e scripts
- [ ] `next.config.ts` - Configuração Next.js
- [ ] `tsconfig.json` - Configuração TypeScript
- [ ] `tailwind.config.ts` - Configuração Tailwind
- [ ] `supabase/config.toml` - Configuração Supabase

## 🔎 FASE 2: Auditoria de Conformidade

Após ler toda a documentação, realize uma auditoria completa verificando:

### 2.1 Arquitetura e Padrões

**Verificar conformidade com:**

- ✅ Uso correto dos clientes Supabase (server vs client)
- ✅ Pattern de autenticação profile-based (NÃO JWT claims)
- ✅ Implementação correta de RBAC hierárquico
- ✅ Multi-tenancy com isolamento via RLS
- ✅ Validação Zod em todas as APIs externas
- ✅ Logging estruturado (sem console.log em produção)

**Checklist específico:**

```typescript
// ❌ ERRADO - Não fazer
const supabase = createClient(); // Em Server Component sem await
const user = useUser(); // Confiar em dados do cliente para autorização
console.log("Debug"); // Logging não estruturado

// ✅ CORRETO - Fazer
const supabase = await createClient(); // Server Component
const profile = await requireRole("admin"); // Server-side auth
logger.info("User action", { userId }); // Logging estruturado
```

### 2.2 Segurança

**Verificar:**

- [ ] RLS policies com `security_invoker = true` em TODAS as tabelas
- [ ] Service role NUNCA usado em código user-facing
- [ ] Tokens ML criptografados com AES-256-GCM
- [ ] Validação de tenant em operações cross-tenant
- [ ] Variáveis de ambiente validadas no startup
- [ ] Secrets NUNCA em código ou logs

### 2.3 Integração Mercado Livre

**Verificar:**

- [ ] MLTokenManager usado para TODOS os tokens
- [ ] Auto-refresh de tokens implementado
- [ ] Webhooks com processamento assíncrono
- [ ] Rate limiting com exponential backoff
- [ ] Questions API usando v4: `/my/received_questions/search?api_version=4`
- [ ] Validação Zod de todas as respostas ML

### 2.4 Database & Migrations

**Verificar:**

- [ ] Migrations com naming `YYYYMMDDHHMMSS_descriptive.sql`
- [ ] Todas as tabelas tenant-specific têm `tenant_id`
- [ ] RLS policies implementadas em todas as tabelas
- [ ] Índices apropriados para queries frequentes
- [ ] Tipo `jsonb` para dados flexíveis do ML

### 2.5 Frontend & UX

**Verificar:**

- [ ] Componentes usando shadcn/ui
- [ ] Todo conteúdo em português pt-BR
- [ ] Loading states e error handling
- [ ] Responsividade mobile-first
- [ ] Acessibilidade (ARIA labels, keyboard navigation)

### 2.6 API Routes

**Verificar padrão consistente:**

```typescript
export async function GET(request: NextRequest) {
  try {
    // 1. Autenticação
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    // 2. Validação de tenant (se aplicável)
    const tenantId = await getCurrentTenantId();

    // 3. Verificação de permissões
    const hasPermission = await requireRole("admin");

    // 4. Business logic
    const data = await fetchData(tenantId);

    // 5. Resposta padronizada
    return NextResponse.json({ success: true, data });
  } catch (error) {
    logger.error("Erro na operação", { error, endpoint: "/api/example" });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro desconhecido" },
      { status: 500 }
    );
  }
}
```

## 🏗️ FASE 3: Criação de Páginas Conforme Documentação

Com base na documentação lida e na auditoria realizada, crie TODAS as páginas faltantes:

### 3.1 Páginas de Dashboard

**Estrutura esperada em `/dashboard`:**

#### `/dashboard` - Overview Principal

- [ ] Métricas principais (vendas, produtos, pedidos)
- [ ] Gráficos de performance (últimos 30 dias)
- [ ] Atividades recentes
- [ ] Status da integração ML
- [ ] Alertas e notificações

#### `/dashboard/produtos` - Gestão de Produtos

- [ ] Lista de produtos sincronizados com ML
- [ ] Filtros (status, categoria, preço)
- [ ] Busca e ordenação
- [ ] Ações em lote (atualizar preços, pausar/ativar)
- [ ] Sincronização manual
- [ ] Detalhes do produto com histórico de alterações

#### `/dashboard/pedidos` - Gestão de Pedidos

- [ ] Lista de pedidos do ML
- [ ] Filtros (status, data, valor)
- [ ] Timeline de status
- [ ] Integração com envio
- [ ] Detalhes completos do pedido
- [ ] Ações (aprovar pagamento, enviar, cancelar)

#### `/dashboard/perguntas` - Perguntas ML

- [ ] Lista de perguntas não respondidas (prioridade)
- [ ] Filtros (produto, data, status)
- [ ] Resposta rápida com templates
- [ ] Histórico de conversas
- [ ] Notificações em tempo real

#### `/dashboard/integracao` - Configuração ML

- [ ] Status da integração (conectado/desconectado)
- [ ] Botão "Conectar com Mercado Livre" (OAuth)
- [ ] Configurações de sincronização
- [ ] Logs de sincronização
- [ ] Webhooks configurados
- [ ] Testes de conexão

#### `/dashboard/relatorios` - Relatórios e Analytics

- [ ] Vendas por período
- [ ] Performance de produtos
- [ ] Taxa de conversão
- [ ] Exportação de dados (CSV, Excel)
- [ ] Gráficos interativos

#### `/dashboard/configuracoes` - Configurações

- [ ] Perfil da empresa
- [ ] Configurações de notificações
- [ ] Regras de precificação
- [ ] Templates de respostas
- [ ] Preferências de sincronização

### 3.2 Páginas de Admin

**Estrutura esperada em `/admin`:**

#### `/admin/usuarios` - Gestão de Usuários

- [ ] Lista de usuários do tenant
- [ ] Adicionar/remover usuários
- [ ] Gerenciar roles (user, admin)
- [ ] Histórico de atividades

#### `/admin/tenants` (Super Admin Only)

- [ ] Lista de todos os tenants
- [ ] Criar novo tenant
- [ ] Configurações globais
- [ ] Estatísticas de uso

### 3.3 Páginas de Onboarding

#### `/onboarding/welcome` - Boas-vindas

- [ ] Introdução ao MercaFlow
- [ ] Benefícios principais
- [ ] Próximos passos

#### `/onboarding/connect-ml` - Conectar ML

- [ ] Instruções de conexão
- [ ] Botão de autorização OAuth
- [ ] Tratamento de callbacks

#### `/onboarding/configure` - Configuração Inicial

- [ ] Configurar preferências
- [ ] Selecionar produtos para sincronizar
- [ ] Configurar regras de precificação

#### `/onboarding/complete` - Conclusão

- [ ] Resumo da configuração
- [ ] Próximos passos
- [ ] Link para dashboard

### 3.4 Páginas Públicas

#### Landing Page (`/`)

- [ ] Hero section com value proposition
- [ ] Seções de recursos/benefícios
- [ ] Pricing plans
- [ ] Depoimentos (futuros)
- [ ] CTA para registro
- [ ] Footer com links

#### `/precos` - Pricing

- [ ] Comparação de planos (Básico, Profissional, Empresarial)
- [ ] FAQ de pricing
- [ ] CTA para registro

#### `/recursos` - Recursos

- [ ] Lista detalhada de funcionalidades
- [ ] Screenshots/demos
- [ ] Casos de uso

#### `/sobre` - Sobre

- [ ] História da empresa
- [ ] Missão e valores
- [ ] Equipe (futura)

#### `/contato` - Contato

- [ ] Formulário de contato
- [ ] Informações de suporte
- [ ] Links de redes sociais

### 3.5 Páginas Legais

- [ ] `/termos` - Termos de Uso
- [ ] `/privacidade` - Política de Privacidade
- [ ] `/ajuda` - Central de Ajuda/FAQ

## 📝 FASE 4: Relatório de Auditoria

Após completar as fases anteriores, gere um relatório detalhado com:

### 4.1 Conformidade com Documentação

**Para cada área verificada:**

- ✅ Conforme / ⚠️ Parcialmente / ❌ Não conforme
- Detalhes específicos de não conformidade
- Arquivos/linhas afetados
- Recomendações de correção

### 4.2 Gaps Identificados

**Liste:**

- Funcionalidades documentadas mas não implementadas
- Páginas faltantes
- Padrões não seguidos
- Problemas de segurança
- Issues de performance

### 4.3 Páginas Criadas

**Para cada página criada, documente:**

- Path da página
- Componentes utilizados
- Integrações (APIs, Supabase, ML)
- Permissões necessárias
- Testes sugeridos

### 4.4 Próximos Passos

**Priorize:**

1. Correções críticas de segurança
2. Implementação de funcionalidades core
3. Melhorias de UX
4. Otimizações de performance
5. Features nice-to-have

## 🎯 Instruções de Execução

### Como usar este prompt:

1. **Cole este prompt completo no Copilot Chat**
2. **Aguarde o Copilot**:
   - Ler toda a documentação
   - Realizar a auditoria completa
   - Identificar gaps e não conformidades
3. **Revise o relatório de auditoria**
4. **Aprove a criação das páginas** (ou ajuste prioridades)
5. **Acompanhe a criação** de cada página/componente

### Formato de resposta esperado:

```markdown
# Relatório de Auditoria MercaFlow

Data: [DATA]

## 1. Documentação Lida ✅

- [x] 32 arquivos de documentação analisados
- Resumo de insights principais

## 2. Conformidade

### Arquitetura: ⚠️ 85% conforme

- [Detalhes...]

### Segurança: ✅ 100% conforme

- [Detalhes...]

[... continua ...]

## 3. Gaps Identificados

1. **CRÍTICO**: [Gap 1]
2. **ALTO**: [Gap 2]
   [...]

## 4. Páginas a Criar

Total: 23 páginas

### Fase 1 (Core - 1-2 dias)

- [ ] /dashboard
- [ ] /dashboard/produtos
      [...]

### Fase 2 (Essencial - 3-5 dias)

[...]

## 5. Plano de Ação

1. Corrigir [X] problemas críticos
2. Implementar [Y] páginas core
3. Adicionar [Z] funcionalidades
```

## ⚙️ Configurações Importantes

### Ao criar páginas, SEMPRE:

1. **Use os componentes do shadcn/ui** existentes em `components/ui/`
2. **Siga o padrão de autenticação** com `getCurrentUser()` e `requireRole()`
3. **Implemente loading states** e error boundaries
4. **Adicione logs estruturados** com `logger`
5. **Valide dados externos** com Zod schemas
6. **Escreva em português pt-BR** (comentários podem ser em inglês)
7. **Use Tailwind CSS** para estilização
8. **Implemente responsividade** mobile-first
9. **Adicione acessibilidade** (ARIA, keyboard navigation)
10. **Documente decisões** técnicas no código

### Padrões de Código:

```typescript
// ✅ Server Component Pattern
import { getCurrentUser, requireRole } from "@/utils/supabase/roles";
import { getCurrentTenantId } from "@/utils/supabase/tenancy";

export default async function DashboardPage() {
  // Autenticação obrigatória
  const profile = await requireRole("user");
  const tenantId = await getCurrentTenantId();

  // Buscar dados com RLS automático
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("tenant_id", tenantId);

  if (error) {
    logger.error("Erro ao buscar produtos", { error, tenantId });
    return <ErrorComponent />;
  }

  return <ProductsList products={data} />;
}
```

```typescript
// ✅ Client Component Pattern
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { logger } from "@/utils/logger";

export function ProductsClient({ initialProducts }) {
  const [products, setProducts] = useState(initialProducts);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel("products-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        (payload) => {
          logger.info("Produto atualizado", { productId: payload.new.id });
          // Atualizar estado
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return <div>{/* Render products */}</div>;
}
```

## 🚀 Início da Auditoria

Copilot, por favor, execute este prompt completo seguindo as 4 fases:

1. ✅ Leia toda a documentação listada
2. ✅ Realize auditoria completa de conformidade
3. ✅ Identifique e liste todas as páginas a criar
4. ✅ Gere relatório detalhado de auditoria

Após minha aprovação do relatório, prossiga com a criação das páginas priorizadas.

**Pronto para começar? Por favor, confirme o entendimento e inicie a FASE 1.**
