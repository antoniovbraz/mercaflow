/**
 * Empty State Component
 *
 * Componente versátil para exibir estados vazios contextuais e guiados.
 * Usado quando listas, tabelas ou dashboards não têm dados para exibir.
 *
 * Segue best practices:
 * - Ícone visual claro
 * - Título descritivo
 * - Descrição explicativa
 * - CTA (call-to-action) quando apropriado
 *
 * @module components/ui/empty-state
 */

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  /** Ícone React (Lucide Icon) */
  icon: React.ReactNode;

  /** Título principal (curto e direto) */
  title: string;

  /** Descrição explicativa (contexto e próximos passos) */
  description: string;

  /** Call-to-action primária (opcional) */
  action?: {
    label: string;
    onClick: () => void;
    variant?: "default" | "outline" | "secondary" | "ghost";
  };

  /** Call-to-action secundária (opcional) */
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };

  /** Ilustração ou imagem customizada (opcional) */
  illustration?: React.ReactNode;

  /** Tamanho do empty state */
  size?: "sm" | "md" | "lg";

  /** Remove o Card wrapper (útil quando já está dentro de um Card) */
  bare?: boolean;

  /** Classes CSS adicionais */
  className?: string;
}

/**
 * Empty State Component
 *
 * @example
 * // Empty state básico
 * <EmptyState
 *   icon={<Package className="w-8 h-8 text-gray-400" />}
 *   title="Nenhum produto encontrado"
 *   description="Conecte sua conta do Mercado Livre para sincronizar seus produtos."
 * />
 *
 * @example
 * // Com ação primária
 * <EmptyState
 *   icon={<Package className="w-8 h-8 text-gray-400" />}
 *   title="Nenhum produto ainda"
 *   description="Importe seus produtos do Mercado Livre para começar."
 *   action={{
 *     label: "Conectar Mercado Livre",
 *     onClick: () => router.push('/dashboard/ml')
 *   }}
 * />
 *
 * @example
 * // Com ação primária e secundária
 * <EmptyState
 *   icon={<MessageCircle className="w-8 h-8 text-gray-400" />}
 *   title="Nenhuma pergunta ainda"
 *   description="Quando clientes fizerem perguntas, elas aparecerão aqui."
 *   action={{
 *     label: "Ver Tutorial",
 *     onClick: () => router.push('/ajuda/perguntas'),
 *     variant: "outline"
 *   }}
 *   secondaryAction={{
 *     label: "Atualizar",
 *     onClick: handleRefresh
 *   }}
 * />
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  illustration,
  size = "md",
  bare = false,
  className,
}: EmptyStateProps) {
  const sizes = {
    sm: {
      container: "py-8",
      iconContainer: "w-12 h-12",
      icon: "w-6 h-6",
      title: "text-lg",
      description: "text-sm",
      maxWidth: "max-w-sm",
    },
    md: {
      container: "py-16",
      iconContainer: "w-16 h-16",
      icon: "w-8 h-8",
      title: "text-xl",
      description: "text-base",
      maxWidth: "max-w-md",
    },
    lg: {
      container: "py-24",
      iconContainer: "w-20 h-20",
      icon: "w-10 h-10",
      title: "text-2xl",
      description: "text-lg",
      maxWidth: "max-w-lg",
    },
  };

  const sizeConfig = sizes[size];

  const content = (
    <div
      className={cn(
        "flex flex-col items-center text-center space-y-6",
        sizeConfig.maxWidth,
        "mx-auto",
        sizeConfig.container,
        className
      )}
    >
      {/* Icon or Illustration */}
      {illustration ? (
        <div className="mb-2">{illustration}</div>
      ) : (
        <div
          className={cn(
            sizeConfig.iconContainer,
            "rounded-full bg-gradient-to-br from-gray-100 to-gray-200",
            "dark:from-gray-800 dark:to-gray-900",
            "flex items-center justify-center",
            "shadow-sm"
          )}
        >
          <div className="text-gray-400 dark:text-gray-500">{icon}</div>
        </div>
      )}

      {/* Text Content */}
      <div className="space-y-2">
        <h3
          className={cn(
            sizeConfig.title,
            "font-semibold text-gray-900 dark:text-gray-100"
          )}
        >
          {title}
        </h3>
        <p
          className={cn(
            sizeConfig.description,
            "text-gray-600 dark:text-gray-400",
            "leading-relaxed"
          )}
        >
          {description}
        </p>
      </div>

      {/* Actions */}
      {(action || secondaryAction) && (
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          {action && (
            <Button
              onClick={action.onClick}
              variant={action.variant || "default"}
              size={size === "sm" ? "sm" : "default"}
              className="w-full sm:w-auto"
            >
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              onClick={secondaryAction.onClick}
              variant="ghost"
              size={size === "sm" ? "sm" : "default"}
              className="w-full sm:w-auto"
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );

  if (bare) {
    return content;
  }

  return (
    <Card>
      <CardContent className="p-0">{content}</CardContent>
    </Card>
  );
}
