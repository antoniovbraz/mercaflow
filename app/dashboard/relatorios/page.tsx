import { redirect } from "next/navigation";
import { requireRole } from "@/utils/supabase/roles";
import { RelatoriosContent } from "./components/RelatoriosContent";

/**
 * Dashboard de Relatórios e Analytics
 *
 * Features:
 * - Vendas por período
 * - Performance de produtos
 * - Taxa de conversão
 * - Exportação de dados (CSV, Excel)
 * - Gráficos interativos
 *
 * Permissions: reports.basic, reports.export
 */
export default async function RelatoriosPage() {
  try {
    await requireRole("user");
    return <RelatoriosContent />;
  } catch {
    redirect("/login");
  }
}
