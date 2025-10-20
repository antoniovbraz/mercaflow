# Prompt de Auditoria Completa UI/UX - MercaFlow

## 🎯 Objetivo da Auditoria

Preciso que você realize uma **auditoria completa e profunda** da aplicação MercaFlow, analisando toda a documentação existente, código implementado e arquitetura, com foco especial em entregar uma **UI/UX perfeita** alinhada com os objetivos estratégicos do produto.

---

## 📋 Escopo da Auditoria

### 1. Análise de Documentação e Contexto

Analise **todos** os documentos relevantes do projeto, incluindo mas não limitado a:

- ✅ `.github/copilot-instructions.md` - Instruções técnicas e arquiteturais
- ✅ `README.md` - Visão geral do projeto
- ✅ `VISAO_PRODUTO_CORRETA.md` - Visão estratégica do produto
- ✅ `ROADMAP_EXECUTIVO_90DIAS.md` - Planejamento de curto prazo
- ✅ `ESPECIFICACAO_TECNICA.md` - Especificações técnicas detalhadas
- ✅ `GUIA_INICIANTE.md` - Onboarding de novos usuários
- ✅ `GUIA_RAPIDO_ML.md` - Integração com Mercado Livre
- ✅ Todos os arquivos `FASE*.md` - Histórico de desenvolvimento
- ✅ Todos os arquivos `AUDITORIA*.md` - Auditorias anteriores
- ✅ `docs/pt/*.md` - Documentação em português

**Objetivo**: Compreender profundamente:

- Proposta de valor do MercaFlow
- Público-alvo (vendedores do Mercado Livre no Brasil)
- Problemas que resolve
- Fluxos de trabalho esperados
- Requisitos funcionais e não-funcionais

---

### 2. Auditoria de Código e Implementação

Analise a implementação atual em:

#### 2.1 Estrutura de Pastas e Arquitetura

```
app/                    # Next.js 15 App Router
├── (auth)/            # Rotas de autenticação
├── dashboard/         # Painel principal
├── ml/                # Integração Mercado Livre
├── produtos/          # Gestão de produtos
├── pedidos/           # Gestão de pedidos
├── admin/             # Administração
└── api/               # API routes

components/            # Componentes reutilizáveis
utils/                 # Utilitários (Supabase, ML, validação)
supabase/migrations/   # Migrações do banco de dados
```

**Avalie**:

- ✅ Estrutura de pastas está otimizada para UI/UX?
- ✅ Componentes estão bem organizados e reutilizáveis?
- ✅ Hierarquia de navegação é intuitiva?

#### 2.2 Componentes UI Existentes

Analise **todos os componentes** em `components/`:

- Componentes shadcn/ui implementados
- Componentes customizados
- Padrões de design consistentes
- Acessibilidade (a11y)
- Responsividade mobile-first

#### 2.3 Páginas e Fluxos de Usuário

Mapeie **todas as páginas** implementadas:

- `/login` e `/register` - Autenticação
- `/dashboard` - Painel principal
- `/ml/*` - Integração ML
- `/produtos/*` - Gestão de produtos
- `/pedidos/*` - Gestão de pedidos
- `/admin/*` - Administração

**Para cada página, avalie**:

- ✅ Layout e hierarquia visual
- ✅ Feedback de ações (loading, success, error)
- ✅ Validação de formulários
- ✅ Mensagens de erro amigáveis em português
- ✅ Estados vazios (empty states)
- ✅ Breadcrumbs e navegação
- ✅ Consistência com design system

#### 2.4 Integração Mercado Livre

Analise as telas de integração ML:

- OAuth flow e experiência de conexão
- Sincronização de produtos
- Gestão de perguntas
- Gestão de pedidos
- Webhooks e notificações em tempo real

---

### 3. Análise de UX (User Experience)

#### 3.1 Jornadas do Usuário

Mapeie e avalie as jornadas principais:

**Jornada 1: Primeiro Acesso**

```
Registro → Confirmação Email → Onboarding → Conexão ML → Dashboard
```

**Jornada 2: Vendedor Ativo Diário**

```
Login → Dashboard → Verificar Perguntas → Responder → Gerenciar Pedidos
```

**Jornada 3: Gestão de Produtos**

```
Dashboard → Produtos → Sincronizar ML → Editar → Publicar
```

**Para cada jornada, avalie**:

- ✅ Número de cliques necessários (princípio dos 3 cliques)
- ✅ Clareza de cada etapa
- ✅ Feedback visual constante
- ✅ Prevenção de erros
- ✅ Recovery de erros (mensagens claras)
- ✅ Performance percebida (loading states)

#### 3.2 Princípios de UX Aplicados

Verifique aplicação de:

- **Lei de Fitts**: Elementos importantes são fáceis de clicar?
- **Lei de Hick**: Evitamos sobrecarga de opções?
- **Lei de Jakob**: Interface familiar para usuários brasileiros?
- **Princípio da Proximidade**: Elementos relacionados estão agrupados?
- **Feedback Visual**: Toda ação tem feedback imediato?
- **Progressive Disclosure**: Complexidade revelada progressivamente?

---

### 4. Análise de UI (User Interface)

#### 4.1 Design System

Avalie consistência do design system:

- ✅ Paleta de cores (acessibilidade WCAG AA)
- ✅ Tipografia (hierarquia clara)
- ✅ Espaçamento (grid system consistente)
- ✅ Componentes shadcn/ui customizados
- ✅ Iconografia (Lucide React)
- ✅ Estados interativos (hover, active, disabled)

#### 4.2 Responsividade

Teste em breakpoints:

- Mobile: 320px - 767px
- Tablet: 768px - 1023px
- Desktop: 1024px+

**Verifique**:

- ✅ Layout adapta corretamente
- ✅ Touch targets mínimos (44px)
- ✅ Menu mobile funcional
- ✅ Tabelas responsivas (scroll horizontal ou cards)

#### 4.3 Acessibilidade

Auditoria a11y:

- ✅ Contraste de cores (WCAG AA mínimo)
- ✅ Navegação por teclado
- ✅ Screen reader friendly
- ✅ Labels ARIA adequados
- ✅ Foco visível em elementos interativos
- ✅ Mensagens de erro associadas a campos

#### 4.4 Performance Percebida

Avalie estratégias de performance:

- ✅ Skeleton loaders
- ✅ Optimistic UI updates
- ✅ Lazy loading de imagens
- ✅ Code splitting
- ✅ Prefetching de rotas críticas

---

### 5. Análise de Lacunas (Gap Analysis)

Compare **o que está documentado** vs **o que está implementado**:

#### 5.1 Funcionalidades Faltantes

Liste funcionalidades mencionadas na documentação mas não implementadas.

#### 5.2 UI/UX Incompleta

Identifique telas ou fluxos parcialmente implementados.

#### 5.3 Inconsistências

Aponte discrepâncias entre documentação e implementação.

---

## 🎨 Entregáveis Esperados

### 1. Relatório de Auditoria Completo

Documento estruturado em Markdown com:

```markdown
# Auditoria UI/UX - MercaFlow

## Executive Summary

- Pontos fortes identificados
- Problemas críticos
- Oportunidades de melhoria

## Análise Detalhada

### Arquitetura de Informação

- Estrutura atual
- Recomendações

### Jornadas do Usuário

- Mapeamento completo
- Pontos de fricção
- Otimizações sugeridas

### Design System

- Estado atual
- Gaps identificados
- Padrões recomendados

### Acessibilidade

- Conformidade WCAG
- Issues encontrados
- Correções necessárias

### Performance

- Métricas atuais
- Gargalos
- Melhorias propostas

## Priorização

- P0 (Crítico): Bloqueadores de UX
- P1 (Alto): Impacto significativo
- P2 (Médio): Melhorias incrementais
- P3 (Baixo): Nice to have

## Roadmap de Implementação

- Sprint 1: Quick wins (1 semana)
- Sprint 2-3: Melhorias estruturais (2 semanas)
- Sprint 4+: Polimento e otimizações
```

### 2. Plano de Ação UI/UX

Arquivo `PLANO_ACAO_UI_UX.md` com:

```markdown
# Plano de Ação UI/UX

## Fase 1: Foundation (Semana 1)

- [ ] Corrigir inconsistências de design system
- [ ] Implementar loading states faltantes
- [ ] Melhorar mensagens de erro
- [ ] Adicionar empty states

## Fase 2: Core Experience (Semanas 2-3)

- [ ] Otimizar fluxo de onboarding
- [ ] Melhorar dashboard (widgets, cards)
- [ ] Refinar integração ML UX
- [ ] Implementar notificações em tempo real

## Fase 3: Polish (Semana 4+)

- [ ] Animações e micro-interações
- [ ] Temas (light/dark)
- [ ] Personalização de dashboard
- [ ] Shortcuts de teclado
```

### 3. Componentes UI/UX Prioritários

Lista de componentes a implementar/melhorar:

```markdown
# Componentes Prioritários

## Alta Prioridade

1. **DashboardWidget** - Cards modulares para dashboard
2. **MLSyncStatus** - Status visual da sincronização
3. **QuestionCard** - Card de pergunta ML com ações rápidas
4. **OrderTimeline** - Timeline visual de pedidos
5. **EmptyState** - Estados vazios consistentes
6. **LoadingState** - Skeleton loaders padronizados
7. **ErrorBoundary** - Tratamento de erros amigável
8. **Toast** - Notificações não-intrusivas

## Média Prioridade

9. **OnboardingWizard** - Wizard de primeiro acesso
10. **ProductCard** - Card de produto com status ML
11. **SearchBar** - Busca avançada com filtros
12. **DataTable** - Tabela responsiva com ações
13. **StatCard** - Card de estatísticas/métricas
14. **NotificationCenter** - Centro de notificações

## Baixa Prioridade (Polish)

15. **CommandPalette** - Paleta de comandos (Cmd+K)
16. **TourGuide** - Tour guiado pela aplicação
17. **ThemeSwitcher** - Alternador light/dark
18. **KeyboardShortcuts** - Atalhos de teclado
```

### 4. Protótipos de Telas Críticas

Para cada tela crítica, forneça:

- Estrutura atual (descritiva)
- Problemas identificados
- Proposta de melhoria (código React/TSX)
- Justificativa das mudanças

**Telas Críticas**:

1. `/dashboard` - Painel principal
2. `/ml/perguntas` - Gestão de perguntas ML
3. `/ml/pedidos` - Gestão de pedidos ML
4. `/produtos` - Lista de produtos
5. `/onboarding` - Primeiro acesso

### 5. Guia de Estilo UI/UX

Documento `GUIA_ESTILO_UI_UX.md`:

```markdown
# Guia de Estilo UI/UX - MercaFlow

## Princípios de Design

### 1. Clareza sobre Sutileza

- Informações críticas sempre visíveis
- Hierarquia visual clara
- Call-to-actions óbvios

### 2. Eficiência

- Reduzir cliques necessários
- Ações rápidas contextuais
- Bulk actions quando aplicável

### 3. Feedback Constante

- Loading states sempre presentes
- Success/error messages claras
- Progress indicators em processos longos

### 4. Mercado Livre First

- Cores e linguagem familiar para vendedores ML
- Terminologia consistente com ML
- Integração visual fluida

## Componentes Padrão

### Button

\`\`\`tsx
<Button variant="primary" size="md">Ação Principal</Button>
<Button variant="secondary">Ação Secundária</Button>
<Button variant="ghost">Ação Terciária</Button>
\`\`\`

### Card

\`\`\`tsx
<Card>
<CardHeader>
<CardTitle>Título</CardTitle>
<CardDescription>Descrição</CardDescription>
</CardHeader>
<CardContent>Conteúdo</CardContent>
<CardFooter>Ações</CardFooter>
</Card>
\`\`\`

[... continuar com todos os padrões ...]
```

---

## 🔧 Instruções Técnicas para Implementação

### Tecnologias a Utilizar

- **Framework**: Next.js 15 App Router
- **UI Library**: shadcn/ui + Radix UI
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod
- **State**: React Query (para server state)
- **Animations**: Framer Motion (opcional)

### Padrões de Código

```tsx
// Componente de exemplo seguindo padrões do projeto
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FeatureCardProps {
  title: string;
  description: string;
  onAction: () => Promise<void>;
}

export function FeatureCard({
  title,
  description,
  onAction,
}: FeatureCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleAction = async () => {
    try {
      setIsLoading(true);
      await onAction();
      toast({
        title: "Sucesso!",
        description: "Ação realizada com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível completar a ação. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">{description}</p>
        <Button onClick={handleAction} disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Executar Ação
        </Button>
      </CardContent>
    </Card>
  );
}
```

### Checklist de Qualidade

Cada componente/página deve ter:

- ✅ TypeScript types/interfaces
- ✅ Loading states
- ✅ Error handling
- ✅ Empty states
- ✅ Responsive design
- ✅ Acessibilidade básica
- ✅ Feedback de ações
- ✅ Comentários em código complexo

---

## 📊 Critérios de Sucesso

A auditoria será considerada bem-sucedida se entregar:

1. ✅ **Compreensão Total**: Demonstrar entendimento profundo do produto e objetivos
2. ✅ **Análise Abrangente**: Cobrir 100% das áreas listadas acima
3. ✅ **Acionável**: Todas as recomendações são implementáveis
4. ✅ **Priorizado**: Clear roadmap com P0, P1, P2, P3
5. ✅ **Code-Ready**: Exemplos de código prontos para usar
6. ✅ **UX-Focused**: Foco em resolver problemas reais do usuário
7. ✅ **Brazilian Market**: Adequado para vendedores brasileiros do ML

---

## 🚀 Próximos Passos Após Auditoria

Após receber a auditoria completa:

1. **Review e Validação** (1 dia)

   - Revisar todos os entregáveis
   - Validar prioridades
   - Ajustar roadmap se necessário

2. **Implementação Fase 1** (1 semana)

   - Implementar quick wins (P0)
   - Corrigir inconsistências críticas
   - Setup de design system robusto

3. **Implementação Fase 2** (2-3 semanas)

   - Componentes prioritários
   - Melhorias de fluxo
   - Polish de UX

4. **Testes e Iteração** (contínuo)
   - User testing com vendedores reais
   - Métricas de UX (tempo de conclusão, taxa de erro)
   - Iterações baseadas em feedback

---

## 💡 Contexto Adicional

### Público-Alvo

- **Perfil**: Vendedores brasileiros do Mercado Livre
- **Nível Técnico**: Variado (de iniciantes a avançados)
- **Principais Dores**: Gestão manual de perguntas, pedidos, estoque
- **Objetivo**: Automatizar e centralizar operações ML

### Diferencial Competitivo

- Integração nativa e profunda com ML
- Multi-tenancy para agências/equipes
- Real-time sync e notificações
- UX brasileira (idioma, cultura, fluxos locais)

### Referências de UX/UI Inspiradoras

- **Mercado Livre**: Simplicidade e familiaridade
- **Shopify**: Onboarding e dashboard
- **Linear**: Performance e keyboard shortcuts
- **Vercel**: Clareza e feedback visual
- **Stripe**: Tratamento de erros e documentação

---

## ❓ Perguntas para Guiar a Auditoria

Durante a análise, responda:

1. **Proposta de Valor**

   - O valor do MercaFlow está claro nos primeiros 5 segundos?
   - O onboarding comunica efetivamente os benefícios?

2. **Eficiência**

   - Quantos cliques para responder uma pergunta ML?
   - Quanto tempo para sincronizar produtos?
   - Há atalhos para ações frequentes?

3. **Prevenção de Erros**

   - Formulários têm validação inline?
   - Ações destrutivas pedem confirmação?
   - Mensagens de erro são claras e acionáveis?

4. **Mobile Experience**

   - Vendedores conseguem usar no celular?
   - Touch targets são adequados?
   - Performance em 3G é aceitável?

5. **Escalabilidade**
   - Dashboard funciona com 1.000+ produtos?
   - Listas longas têm paginação/virtualização?
   - Filtros e busca são eficientes?

---

## 📝 Formato de Entrega

Por favor, entregue a auditoria em:

1. **Arquivo Principal**: `AUDITORIA_UI_UX_COMPLETA.md`

   - Relatório completo estruturado
   - Markdown formatado
   - Seções claras com TOC

2. **Arquivo de Ação**: `PLANO_ACAO_UI_UX.md`

   - Checklist acionável
   - Prioridades claras
   - Estimativas de esforço

3. **Guia de Estilo**: `GUIA_ESTILO_UI_UX.md`

   - Padrões de design
   - Componentes exemplo
   - Boas práticas

4. **Componentes Exemplo**: Pasta `components/examples/`
   - Código TSX pronto
   - Componentes prioritários implementados
   - Comentários explicativos

---

## 🎯 Resultado Esperado Final

Ao final desta auditoria, eu devo ter:

✅ **Visão Clara**: Entendimento completo do estado atual UI/UX
✅ **Roadmap Acionável**: Plano priorizado de melhorias
✅ **Guia de Implementação**: Padrões e exemplos de código
✅ **Quick Wins Identificados**: Melhorias de alto impacto e baixo esforço
✅ **Fundação Sólida**: Base para evolução contínua de UX

---

**Inicie a auditoria agora, analisando primeiro toda a documentação do projeto, depois o código implementado, e finalmente compilando suas descobertas nos formatos especificados acima.**

**Seja meticuloso, crítico e construtivo. O objetivo é elevar o MercaFlow ao nível de UX de produtos SaaS world-class.**
