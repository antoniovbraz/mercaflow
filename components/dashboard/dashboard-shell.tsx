"use client";

import Link from "next/link";
import { ReactNode, useMemo, useState } from "react";
import { Bell, LifeBuoy, Menu, Search, X, Building2 } from "lucide-react";

import {
  DashboardNavigation,
  DashboardNavSection,
} from "@/components/dashboard/dashboard-navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DashboardShellProps {
  sections: DashboardNavSection[];
  children: ReactNode;
  userEmail: string;
  userRole?: string | null;
  tenantName?: string | null;
  contentClassName?: string;
}

export function DashboardShell({
  sections,
  children,
  userEmail,
  userRole,
  tenantName,
  contentClassName,
}: DashboardShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const roleLabel = useMemo(() => {
    switch (userRole) {
      case "super_admin":
        return "Super admin";
      case "admin":
        return "Admin";
      default:
        return "Usuário";
    }
  }, [userRole]);

  return (
    <div className="flex min-h-screen bg-surface text-text-primary">
      <a
        href="#dashboard-content"
        className="absolute left-4 top-4 z-[999] -translate-y-16 rounded-md bg-intent-brand px-3 py-2 text-sm font-semibold text-white focus-visible:translate-y-0 focus-visible:outline-none"
      >
        Ir para o conteúdo
      </a>

      <aside className="hidden shrink-0 border-r border-outline-subtle bg-surface-elevated px-4 py-6 md:flex md:w-64 lg:w-72">
        <div className="flex h-full w-full flex-col">
          <div className="flex items-center gap-3 px-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-intent-brand text-base font-semibold text-white">
              MF
            </div>
            <div className="space-y-0.5">
              <p className="text-sm font-semibold text-text-primary">
                MercaFlow
              </p>
              <div className="flex items-center gap-1 text-xs text-text-muted">
                <Building2 className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="truncate" title={tenantName ?? "Conta"}>
                  {tenantName ?? "Conta"}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-8 flex-1 overflow-y-auto pr-2">
            <DashboardNavigation sections={sections} />
          </div>

          <div className="mt-6 rounded-lg border border-outline-subtle bg-surface p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-text-primary">
              <LifeBuoy className="h-4 w-4" aria-hidden="true" />
              Precisa de ajuda?
            </div>
            <p className="mt-1 text-xs text-text-secondary">
              Consulte a central de ajuda para guias rápidos e suporte dedicado.
            </p>
            <Button asChild size="sm" variant="outline" className="mt-3 w-full">
              <Link href="/ajuda">Central de ajuda</Link>
            </Button>
          </div>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-40 border-b border-outline-subtle bg-surface/95 backdrop-blur">
          <div className="flex h-16 items-center gap-4 px-4 md:px-6">
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-outline-subtle bg-surface text-text-primary transition-colors hover:bg-surface-muted md:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Abrir navegação"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>

            <div className="hidden md:flex md:flex-col md:items-start">
              <span className="text-xs font-medium uppercase tracking-wide text-text-muted">
                Tenant
              </span>
              <span className="text-sm font-semibold text-text-primary">
                {tenantName ?? "Conta"}
              </span>
            </div>

            <div className="flex flex-1 justify-center md:justify-start">
              <div className="relative w-full max-w-md">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  placeholder="Buscar no painel"
                  className="h-10 w-full rounded-md border border-outline-subtle bg-surface px-3 pl-9 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-intent-brand focus-visible:ring-opacity-30 focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                  aria-label="Buscar em todo o painel"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/ajuda"
                className="hidden h-10 w-10 items-center justify-center rounded-md border border-outline-subtle bg-surface text-text-secondary transition-colors hover:text-text-primary md:inline-flex"
                aria-label="Central de ajuda"
              >
                <LifeBuoy className="h-4 w-4" aria-hidden="true" />
              </Link>
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-outline-subtle bg-surface text-text-secondary transition-colors hover:text-text-primary"
                aria-label="Notificações"
              >
                <Bell className="h-4 w-4" aria-hidden="true" />
              </button>
              <div className="hidden min-w-[160px] flex-col items-start md:flex">
                <span
                  className="text-sm font-semibold text-text-primary"
                  title={userEmail}
                >
                  {userEmail}
                </span>
                <Badge variant="secondary" className="mt-1">
                  {roleLabel}
                </Badge>
              </div>
            </div>
          </div>
        </header>

        <main
          id="dashboard-content"
          className="flex-1 bg-surface px-4 pb-10 pt-6 md:px-8"
        >
          <div
            className={cn(
              "mx-auto w-full max-w-7xl space-y-8",
              contentClassName
            )}
          >
            {children}
          </div>
        </main>
      </div>

      {mobileOpen ? (
        <div
          className="fixed inset-0 z-50 flex md:hidden"
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            className="flex-1 bg-black/40"
            aria-label="Fechar navegação"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative flex w-72 max-w-full flex-col border-l border-outline-subtle bg-surface p-6 shadow-xl">
            <button
              type="button"
              className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-md border border-outline-subtle bg-surface text-text-secondary hover:text-text-primary"
              onClick={() => setMobileOpen(false)}
              aria-label="Fechar"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
            <div className="mt-8">
              <DashboardNavigation
                sections={sections}
                onNavigate={() => setMobileOpen(false)}
              />
            </div>
            <div className="mt-auto pt-6">
              <Button asChild variant="outline" className="w-full">
                <Link href="/ajuda">Central de ajuda</Link>
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
