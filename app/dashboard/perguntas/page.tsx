import { redirect } from "next/navigation";
import { requireRole } from "@/utils/supabase/roles";
import { PerguntasContent } from "./components/PerguntasContent";

/**
 * Dashboard de Perguntas ML
 *
 * Features:
 * - Lista de perguntas não respondidas (prioridade)
 * - Filtros (produto, data, status)
 * - Resposta rápida com templates
 * - Histórico de conversas
 * - Notificações em tempo real
 *
 * Permissions: ml.messages.read, ml.messages.send
 */
export default async function PerguntasPage() {
  try {
    // Require authentication
    await requireRole("user");

    return <PerguntasContent />;
  } catch {
    redirect("/login");
  }
}
