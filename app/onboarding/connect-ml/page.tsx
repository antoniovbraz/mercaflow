import { redirect } from "next/navigation";
import { getCurrentUser } from "@/utils/supabase/server";
import { ConnectMLContent } from "./components/ConnectMLContent";

/**
 * Onboarding - Conectar Mercado Livre
 *
 * Segunda etapa do onboarding
 * Conecta a conta do Mercado Livre via OAuth
 */
export default async function OnboardingConnectMLPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return <ConnectMLContent />;
}
