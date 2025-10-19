import { redirect } from "next/navigation";
import { getCurrentUser } from "@/utils/supabase/server";
import { WelcomeContent } from "./components/WelcomeContent";

/**
 * Onboarding - Página de Boas-Vindas
 *
 * Primeira etapa do onboarding para novos usuários
 * Apresenta o MercaFlow e benefícios da plataforma
 */
export default async function OnboardingWelcomePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return <WelcomeContent />;
}
