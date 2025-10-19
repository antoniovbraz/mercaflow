import { redirect } from "next/navigation";
import { requireRole } from "@/utils/supabase/roles";
import { ConfiguracoesContent } from "./components/ConfiguracoesContent";

/**
 * Dashboard de Configurações
 *
 * Features:
 * - Perfil da empresa
 * - Configurações de notificações
 * - Regras de precificação
 * - Templates de respostas
 * - Preferências de sincronização
 *
 * Permissions: settings.update, settings.templates
 */
export default async function ConfiguracoesPage() {
  try {
    await requireRole("user");
    return <ConfiguracoesContent />;
  } catch {
    redirect("/login");
  }
}
