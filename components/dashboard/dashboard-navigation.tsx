"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DashboardNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  description?: string;
  badge?: string;
  external?: boolean;
  roles?: Array<"user" | "admin" | "super_admin">;
}

export interface DashboardNavSection {
  label: string;
  items: DashboardNavItem[];
}

interface DashboardNavigationProps {
  sections: DashboardNavSection[];
  onNavigate?: () => void;
}

export function DashboardNavigation({
  sections,
  onNavigate,
}: DashboardNavigationProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col gap-6">
      {sections.map((section) => (
        <div key={section.label} className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-muted/80">
            {section.label}
          </p>
          <ul className="space-y-1">
            {section.items.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(`${item.href}/`);

              const linkClasses = cn(
                "group inline-flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-intent-brand/10 text-intent-brand"
                  : "text-text-secondary hover:bg-surface-muted hover:text-text-primary"
              );

              const ItemIcon = item.icon;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    className={linkClasses}
                    aria-current={isActive ? "page" : undefined}
                    target={item.external ? "_blank" : undefined}
                    rel={item.external ? "noreferrer" : undefined}
                  >
                    <ItemIcon className="h-4 w-4" aria-hidden="true" />
                    <span className="flex-1 font-medium">{item.label}</span>
                    {item.badge ? (
                      <span className="rounded-full bg-surface-muted px-2 py-0.5 text-xs font-semibold text-text-muted">
                        {item.badge}
                      </span>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
