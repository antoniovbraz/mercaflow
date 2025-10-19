import { redirect } from "next/navigation";
import { requireRole } from "@/utils/supabase/roles";
import { TenantsContent } from "./components/TenantsContent";

/**
 * Admin - Gestão de Tenants
 *
 * Página exclusiva para super_admin
 * Gerenciamento de todos os tenants da plataforma
 *
 * Features:
 * - Lista de todos os tenants
 * - Criar novo tenant
 * - Editar configurações de tenant
 * - Estatísticas de uso por tenant
 * - Desabilitar/habilitar tenant
 */
export default async function AdminTenantsPage() {
  try {
    // Require super_admin role
    await requireRole("super_admin");
    return <TenantsContent />;
  } catch {
    redirect("/dashboard");
  }
}
