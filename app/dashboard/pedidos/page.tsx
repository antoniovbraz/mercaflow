import { redirect } from "next/navigation";
import { requireRole } from "@/utils/supabase/roles";

/**
 * Dashboard de Pedidos
 *
 * Redireciona para a página de pedidos existente.
 * A página /pedidos já implementa todas as funcionalidades necessárias.
 */
export default async function PedidosPage() {
  try {
    // Require authentication and user role
    await requireRole("user");

    // Redirect to existing orders page
    redirect("/pedidos");
  } catch {
    redirect("/login");
  }
}
