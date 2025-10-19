import { redirect } from "next/navigation";
import { requireRole } from "@/utils/supabase/roles";

/**
 * Dashboard de Produtos - Redirecionamento
 *
 * Por enquanto, redireciona para a página de produtos existente.
 * TODO: Implementar dashboard completo com filtros avançados e ações em lote.
 */
export default async function ProdutosPage() {
  try {
    // Require authentication and user role
    await requireRole("user");

    // Redirect to existing products page
    redirect("/produtos");
  } catch {
    redirect("/login");
  }
}
