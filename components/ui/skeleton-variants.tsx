/**
 * Skeleton Variants for MercaFlow
 *
 * Componentes de skeleton especializados para diferentes tipos de conteúdo.
 * Usados durante loading states para melhorar a percepção de performance.
 *
 * @module components/ui/skeleton-variants
 */

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

/**
 * Skeleton para Product Card
 *
 * Usado em: ProductManager, Dashboard de Produtos
 *
 * @example
 * {isLoading ? (
 *   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 *     {Array.from({ length: 6 }).map((_, i) => (
 *       <ProductCardSkeleton key={i} />
 *     ))}
 *   </div>
 * ) : (
 *   <ProductGrid products={products} />
 * )}
 */
export function ProductCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Product Image */}
          <Skeleton className="h-20 w-20 flex-shrink-0 rounded-lg" />

          <div className="flex-1 space-y-2">
            {/* Product Title */}
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />

            {/* Status Badge + Stock */}
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-4 w-12" />
            </div>

            {/* Price */}
            <Skeleton className="h-6 w-24" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Skeleton para Order Card
 *
 * Usado em: OrderManager, Dashboard de Pedidos
 */
export function OrderCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Order Header */}
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" /> {/* Order ID */}
              <Skeleton className="h-4 w-24" /> {/* Date */}
            </div>
            <Skeleton className="h-6 w-20 rounded-full" /> {/* Status Badge */}
          </div>

          {/* Order Items */}
          <div className="flex gap-3">
            <Skeleton className="h-16 w-16 rounded-lg" /> {/* Product Image */}
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>

          {/* Order Total */}
          <div className="flex justify-between items-center pt-2 border-t">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-6 w-24" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Skeleton para Question Card
 *
 * Usado em: QuestionManager, Dashboard de Perguntas
 */
export function QuestionCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Question Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
            <Skeleton className="h-6 w-24 rounded-full" /> {/* Status Badge */}
          </div>

          {/* Question Meta */}
          <div className="flex items-center gap-4">
            <Skeleton className="h-4 w-20" /> {/* Date */}
            <Skeleton className="h-4 w-32" /> {/* Product */}
          </div>

          {/* Answer Section (if answered) */}
          <div className="pl-4 border-l-2 space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Skeleton para Stat Card (Dashboard)
 *
 * Usado em: Dashboard principal, Analytics
 */
export function StatCardSkeleton() {
  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-6">
        <div className="space-y-3">
          {/* Icon + Label */}
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <Skeleton className="h-4 w-24" />
          </div>

          {/* Value */}
          <Skeleton className="h-8 w-32" />

          {/* Trend */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>

        {/* Background Gradient Effect */}
        <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
          <Skeleton className="h-full w-full rounded-full" />
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Skeleton para Table Row
 *
 * Usado em: Tabelas de produtos, pedidos, etc.
 */
export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <tr className="border-b">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="p-4">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}

/**
 * Skeleton para List Item
 *
 * Usado em: Listas simples (notificações, mensagens, etc.)
 */
export function ListItemSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border">
      <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-8 w-8 rounded" />
    </div>
  );
}

/**
 * Skeleton para Chart/Graph
 *
 * Usado em: Dashboard analytics, relatórios
 */
export function ChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-32" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {/* Chart bars */}
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="flex items-end gap-2 h-32">
              <Skeleton
                className="flex-1"
                style={{ height: `${Math.random() * 60 + 40}%` }}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Skeleton para Form
 *
 * Usado em: Loading de formulários
 */
export function FormSkeleton({ fields = 4 }: { fields?: number }) {
  return (
    <div className="space-y-6">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" /> {/* Label */}
          <Skeleton className="h-10 w-full rounded-md" /> {/* Input */}
        </div>
      ))}
      <Skeleton className="h-10 w-32 rounded-md" /> {/* Button */}
    </div>
  );
}

/**
 * Skeleton para Dashboard completo
 *
 * Usado em: Carregamento inicial do dashboard
 */
export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      {/* Charts/Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartSkeleton />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <ListItemSkeleton key={i} />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
