/**
 * Empty State Variants
 *
 * Casos específicos de empty states para diferentes contextos da aplicação.
 * Cada variante é pré-configurada com ícone, textos e ações apropriadas.
 *
 * Casos cobertos:
 * - NoProducts: Lista de produtos vazia
 * - NoOrders: Lista de pedidos vazia
 * - NoQuestions: Lista de perguntas vazia
 * - NoSearchResults: Busca sem resultados
 * - NoNotifications: Central de notificações vazia
 * - NoMLIntegration: Mercado Livre não conectado
 * - NoData: Dados genéricos vazios
 * - ErrorState: Estado de erro com retry
 * - MaintenanceState: Manutenção ou indisponibilidade
 * - UnauthorizedState: Sem permissão de acesso
 *
 * @module components/ui/empty-state-variants
 */

import {
  Package,
  ShoppingCart,
  MessageCircle,
  Search,
  Bell,
  Link2,
  Database,
  AlertTriangle,
  Wrench,
  Lock,
  FileQuestion,
  TrendingDown,
  Filter,
  Calendar,
} from "lucide-react";
import { EmptyState } from "./empty-state";

interface EmptyStateVariantProps {
  /** Ação primária customizada (sobrescreve a padrão) */
  action?: {
    label: string;
    onClick: () => void;
    variant?: "default" | "outline" | "secondary" | "ghost";
  };

  /** Ação secundária customizada */
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };

  /** Tamanho do empty state */
  size?: "sm" | "md" | "lg";

  /** Modo bare (sem Card wrapper) */
  bare?: boolean;

  /** Classes CSS adicionais */
  className?: string;
}

/**
 * Empty State: Nenhum Produto
 *
 * Usado em: ProductManager, lista de produtos, dashboard
 *
 * @example
 * <NoProducts
 *   action={{
 *     label: "Conectar Mercado Livre",
 *     onClick: () => router.push('/dashboard/ml')
 *   }}
 * />
 */
export function NoProducts({
  action,
  secondaryAction,
  size = "md",
  bare = false,
  className,
}: EmptyStateVariantProps) {
  return (
    <EmptyState
      icon={<Package className="w-8 h-8" />}
      title="Nenhum produto encontrado"
      description="Conecte sua conta do Mercado Livre para sincronizar seus produtos e começar a monitorar preços e estoque."
      action={
        action || {
          label: "Conectar Mercado Livre",
          onClick: () =>
            console.warn("NoProducts: action.onClick não definido"),
        }
      }
      secondaryAction={secondaryAction}
      size={size}
      bare={bare}
      className={className}
    />
  );
}

/**
 * Empty State: Nenhum Pedido
 *
 * Usado em: OrderManager, lista de pedidos
 *
 * @example
 * <NoOrders
 *   action={{
 *     label: "Atualizar Pedidos",
 *     onClick: handleRefresh
 *   }}
 * />
 */
export function NoOrders({
  action,
  secondaryAction,
  size = "md",
  bare = false,
  className,
}: EmptyStateVariantProps) {
  return (
    <EmptyState
      icon={<ShoppingCart className="w-8 h-8" />}
      title="Nenhum pedido ainda"
      description="Quando você receber pedidos no Mercado Livre, eles aparecerão aqui com todas as informações relevantes."
      action={action}
      secondaryAction={secondaryAction}
      size={size}
      bare={bare}
      className={className}
    />
  );
}

/**
 * Empty State: Nenhuma Pergunta
 *
 * Usado em: QuestionManager, lista de perguntas
 *
 * @example
 * <NoQuestions
 *   action={{
 *     label: "Ver Tutorial",
 *     onClick: () => router.push('/ajuda/perguntas'),
 *     variant: "outline"
 *   }}
 * />
 */
export function NoQuestions({
  action,
  secondaryAction,
  size = "md",
  bare = false,
  className,
}: EmptyStateVariantProps) {
  return (
    <EmptyState
      icon={<MessageCircle className="w-8 h-8" />}
      title="Nenhuma pergunta ainda"
      description="Quando clientes fizerem perguntas sobre seus produtos no Mercado Livre, elas aparecerão aqui para você responder."
      action={action}
      secondaryAction={secondaryAction}
      size={size}
      bare={bare}
      className={className}
    />
  );
}

/**
 * Empty State: Sem Resultados de Busca
 *
 * Usado em: Filtros, busca, pesquisa
 *
 * @example
 * <NoSearchResults
 *   action={{
 *     label: "Limpar Filtros",
 *     onClick: handleClearFilters
 *   }}
 * />
 */
export function NoSearchResults({
  action,
  secondaryAction,
  size = "md",
  bare = false,
  className,
}: EmptyStateVariantProps) {
  return (
    <EmptyState
      icon={<Search className="w-8 h-8" />}
      title="Nenhum resultado encontrado"
      description="Tente ajustar seus filtros ou termo de busca para encontrar o que você procura."
      action={
        action || {
          label: "Limpar Filtros",
          onClick: () =>
            console.warn("NoSearchResults: action.onClick não definido"),
          variant: "outline",
        }
      }
      secondaryAction={secondaryAction}
      size={size}
      bare={bare}
      className={className}
    />
  );
}

/**
 * Empty State: Sem Notificações
 *
 * Usado em: NotificationsWidget, central de notificações
 *
 * @example
 * <NoNotifications size="sm" bare />
 */
export function NoNotifications({
  action,
  secondaryAction,
  size = "sm",
  bare = true,
  className,
}: EmptyStateVariantProps) {
  return (
    <EmptyState
      icon={<Bell className="w-8 h-8" />}
      title="Tudo em dia!"
      description="Você não tem notificações pendentes no momento."
      action={action}
      secondaryAction={secondaryAction}
      size={size}
      bare={bare}
      className={className}
    />
  );
}

/**
 * Empty State: Mercado Livre Não Conectado
 *
 * Usado em: Dashboard, páginas que requerem integração ML
 *
 * @example
 * <NoMLIntegration
 *   action={{
 *     label: "Conectar Agora",
 *     onClick: () => router.push('/dashboard/ml')
 *   }}
 * />
 */
export function NoMLIntegration({
  action,
  secondaryAction,
  size = "md",
  bare = false,
  className,
}: EmptyStateVariantProps) {
  return (
    <EmptyState
      icon={<Link2 className="w-8 h-8" />}
      title="Mercado Livre não conectado"
      description="Conecte sua conta do Mercado Livre para acessar insights de preços, gerenciar produtos e responder perguntas."
      action={
        action || {
          label: "Conectar Mercado Livre",
          onClick: () =>
            console.warn("NoMLIntegration: action.onClick não definido"),
        }
      }
      secondaryAction={
        secondaryAction || {
          label: "Saiba Mais",
          onClick: () =>
            console.warn(
              "NoMLIntegration: secondaryAction.onClick não definido"
            ),
        }
      }
      size={size}
      bare={bare}
      className={className}
    />
  );
}

/**
 * Empty State: Sem Dados Genéricos
 *
 * Usado em: Listas genéricas, tabelas
 *
 * @example
 * <NoData
 *   title="Nenhum item cadastrado"
 *   description="Adicione itens para visualizá-los aqui."
 *   action={{
 *     label: "Adicionar Item",
 *     onClick: handleAdd
 *   }}
 * />
 */
export function NoData({
  title = "Nenhum dado disponível",
  description = "Não há dados para exibir no momento.",
  action,
  secondaryAction,
  size = "md",
  bare = false,
  className,
}: EmptyStateVariantProps & {
  title?: string;
  description?: string;
}) {
  return (
    <EmptyState
      icon={<Database className="w-8 h-8" />}
      title={title}
      description={description}
      action={action}
      secondaryAction={secondaryAction}
      size={size}
      bare={bare}
      className={className}
    />
  );
}

/**
 * Empty State: Estado de Erro
 *
 * Usado em: Erros de carregamento, falhas de API
 *
 * @example
 * <ErrorState
 *   title="Falha ao carregar produtos"
 *   description="Não foi possível conectar ao Mercado Livre. Tente novamente."
 *   action={{
 *     label: "Tentar Novamente",
 *     onClick: handleRetry
 *   }}
 * />
 */
export function ErrorState({
  title = "Algo deu errado",
  description = "Não foi possível carregar os dados. Tente novamente.",
  action,
  secondaryAction,
  size = "md",
  bare = false,
  className,
}: EmptyStateVariantProps & {
  title?: string;
  description?: string;
}) {
  return (
    <EmptyState
      icon={<AlertTriangle className="w-8 h-8 text-red-500" />}
      title={title}
      description={description}
      action={
        action || {
          label: "Tentar Novamente",
          onClick: () => window.location.reload(),
          variant: "outline",
        }
      }
      secondaryAction={secondaryAction}
      size={size}
      bare={bare}
      className={className}
    />
  );
}

/**
 * Empty State: Manutenção
 *
 * Usado em: Páginas em manutenção, funcionalidades temporariamente indisponíveis
 *
 * @example
 * <MaintenanceState />
 */
export function MaintenanceState({
  action,
  secondaryAction,
  size = "md",
  bare = false,
  className,
}: EmptyStateVariantProps) {
  return (
    <EmptyState
      icon={<Wrench className="w-8 h-8 text-orange-500" />}
      title="Em manutenção"
      description="Esta funcionalidade está temporariamente indisponível. Estamos trabalhando para reestabelecê-la o mais rápido possível."
      action={action}
      secondaryAction={secondaryAction}
      size={size}
      bare={bare}
      className={className}
    />
  );
}

/**
 * Empty State: Não Autorizado
 *
 * Usado em: Páginas sem permissão de acesso
 *
 * @example
 * <UnauthorizedState
 *   action={{
 *     label: "Voltar ao Dashboard",
 *     onClick: () => router.push('/dashboard')
 *   }}
 * />
 */
export function UnauthorizedState({
  action,
  secondaryAction,
  size = "md",
  bare = false,
  className,
}: EmptyStateVariantProps) {
  return (
    <EmptyState
      icon={<Lock className="w-8 h-8 text-gray-500" />}
      title="Acesso não autorizado"
      description="Você não tem permissão para acessar esta área. Entre em contato com o administrador se precisar de acesso."
      action={
        action || {
          label: "Voltar ao Dashboard",
          onClick: () =>
            console.warn("UnauthorizedState: action.onClick não definido"),
          variant: "outline",
        }
      }
      secondaryAction={secondaryAction}
      size={size}
      bare={bare}
      className={className}
    />
  );
}

/**
 * Empty State: Sem Filtros Aplicados
 *
 * Usado em: Listas com filtros que resultaram em 0 resultados
 *
 * @example
 * <NoFiltersApplied
 *   action={{
 *     label: "Resetar Filtros",
 *     onClick: handleReset
 *   }}
 * />
 */
export function NoFiltersApplied({
  action,
  secondaryAction,
  size = "md",
  bare = false,
  className,
}: EmptyStateVariantProps) {
  return (
    <EmptyState
      icon={<Filter className="w-8 h-8" />}
      title="Nenhum resultado com esses filtros"
      description="Tente ajustar os filtros aplicados ou remova alguns para ver mais resultados."
      action={
        action || {
          label: "Resetar Filtros",
          onClick: () =>
            console.warn("NoFiltersApplied: action.onClick não definido"),
          variant: "outline",
        }
      }
      secondaryAction={secondaryAction}
      size={size}
      bare={bare}
      className={className}
    />
  );
}

/**
 * Empty State: Sem Dados no Período
 *
 * Usado em: Gráficos, relatórios com filtro de data
 *
 * @example
 * <NoDataInPeriod
 *   action={{
 *     label: "Alterar Período",
 *     onClick: handleChangePeriod
 *   }}
 * />
 */
export function NoDataInPeriod({
  action,
  secondaryAction,
  size = "md",
  bare = false,
  className,
}: EmptyStateVariantProps) {
  return (
    <EmptyState
      icon={<Calendar className="w-8 h-8" />}
      title="Sem dados neste período"
      description="Não há dados disponíveis para o período selecionado. Tente selecionar um período diferente."
      action={
        action || {
          label: "Alterar Período",
          onClick: () =>
            console.warn("NoDataInPeriod: action.onClick não definido"),
          variant: "outline",
        }
      }
      secondaryAction={secondaryAction}
      size={size}
      bare={bare}
      className={className}
    />
  );
}

/**
 * Empty State: Sem Anomalias Detectadas
 *
 * Usado em: Dashboard de anomalias, alertas
 *
 * @example
 * <NoAnomalies size="sm" bare />
 */
export function NoAnomalies({
  action,
  secondaryAction,
  size = "sm",
  bare = true,
  className,
}: EmptyStateVariantProps) {
  return (
    <EmptyState
      icon={<TrendingDown className="w-8 h-8 text-green-500" />}
      title="Nenhuma anomalia detectada"
      description="Todos os seus produtos estão com preços normais no momento. Continue monitorando!"
      action={action}
      secondaryAction={secondaryAction}
      size={size}
      bare={bare}
      className={className}
    />
  );
}

/**
 * Empty State: FAQ ou Ajuda Vazia
 *
 * Usado em: Páginas de ajuda, FAQ
 *
 * @example
 * <NoHelpArticles
 *   action={{
 *     label: "Voltar",
 *     onClick: () => router.back()
 *   }}
 * />
 */
export function NoHelpArticles({
  action,
  secondaryAction,
  size = "md",
  bare = false,
  className,
}: EmptyStateVariantProps) {
  return (
    <EmptyState
      icon={<FileQuestion className="w-8 h-8" />}
      title="Nenhum artigo encontrado"
      description="Não encontramos artigos de ajuda correspondentes à sua busca. Tente outros termos ou entre em contato conosco."
      action={
        action || {
          label: "Contato",
          onClick: () =>
            console.warn("NoHelpArticles: action.onClick não definido"),
          variant: "outline",
        }
      }
      secondaryAction={secondaryAction}
      size={size}
      bare={bare}
      className={className}
    />
  );
}
