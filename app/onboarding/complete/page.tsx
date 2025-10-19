import { redirect } from "next/navigation";
import { getCurrentUser } from "@/utils/supabase/server";
import { CompleteContent } from "./components/CompleteContent";

/**
 * Onboarding - Conclusão
 *
 * Última etapa do onboarding
 * Confirma conclusão e redireciona para dashboard
 */
export default async function OnboardingCompletePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return <CompleteContent />;
}
