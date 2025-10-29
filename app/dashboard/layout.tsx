import { redirect } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  BarChart2,
  Zap,
  Settings2,
  Users2,
  ShieldCheck,
  ServerCog,
} from "lucide-react";
import { ReactNode } from "react";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { type DashboardNavSection } from "@/components/dashboard/dashboard-navigation";
import { getCurrentTenant } from "@/utils/supabase/tenancy";
import { getCurrentUser } from "@/utils/supabase/server";
import { getUserRole, type UserRole } from "@/utils/supabase/roles";

const baseSections: DashboardNavSection[] = [
  {
    label: "Operações",
    items: [
      { label: "Visão geral", href: "/dashboard", icon: LayoutDashboard },
      { label: "Produtos", href: "/dashboard/produtos", icon: Package },
      { label: "Pedidos", href: "/dashboard/pedidos", icon: ShoppingCart },
    ],
  },
  {
    label: "Inteligência",
    items: [
      { label: "Analytics", href: "/dashboard/analytics", icon: BarChart2 },
      { label: "Integrações ML", href: "/dashboard/ml", icon: Zap },
      {
        label: "Webhooks",
        href: "/dashboard/webhooks",
        icon: ServerCog,
        roles: ["admin", "super_admin"],
      },
    ],
  },
  {
    label: "Administração",
    items: [
      {
        label: "Configurações",
        href: "/dashboard/configuracoes",
        icon: Settings2,
      },
      {
        label: "Equipe e permissões",
        href: "/dashboard/configuracoes/equipe",
        icon: Users2,
        roles: ["admin", "super_admin"],
      },
      {
        label: "Painel super admin",
        href: "/admin",
        icon: ShieldCheck,
        roles: ["super_admin"],
      },
    ],
  },
];

function filterSections(sections: typeof baseSections, role: UserRole) {
  return sections
    .map((section) => ({
      label: section.label,
      items: section.items.filter(
        (item) => !item.roles || item.roles.includes(role)
      ),
    }))
    .filter((section) => section.items.length > 0);
}

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const [tenant, role] = await Promise.all([getCurrentTenant(), getUserRole()]);
  const normalizedRole: UserRole = role ?? "user";
  const sections = filterSections(baseSections, normalizedRole);

  return (
    <DashboardShell
      sections={sections}
      userEmail={user.email ?? ""}
      userRole={normalizedRole}
      tenantName={tenant?.name ?? tenant?.slug ?? null}
    >
      {children}
    </DashboardShell>
  );
}
