"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { TooltipHelp } from "@/components/ui/tooltip-help";
import { PageHeaderActions } from "@/components/ui/page-header-actions";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderAction {
  href: string;
  label: string;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link";
}

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: PageHeaderAction[];
  breadcrumbs?: BreadcrumbItem[];
  helpText?: string;
  className?: string;
}

export function PageHeader({
  title,
  description,
  actions,
  breadcrumbs,
  helpText,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {breadcrumbs && breadcrumbs.length > 0 ? (
        <nav
          aria-label="Breadcrumb"
          className="flex items-center text-sm text-text-muted"
        >
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            return (
              <span
                key={`${crumb.label}-${index}`}
                className="flex items-center"
              >
                {crumb.href && !isLast ? (
                  <Link
                    href={crumb.href}
                    className="font-medium text-text-secondary transition-colors hover:text-intent-brand"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span
                    className={cn(
                      "font-medium",
                      isLast ? "text-text-primary" : "text-text-secondary"
                    )}
                  >
                    {crumb.label}
                  </span>
                )}
                {!isLast ? (
                  <ChevronRight
                    className="mx-2 h-4 w-4 text-outline-strong/60"
                    aria-hidden="true"
                  />
                ) : null}
              </span>
            );
          })}
        </nav>
      ) : null}

      <div className="flex flex-col gap-4 border-b border-outline-subtle pb-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold text-text-primary md:text-3xl">
              {title}
            </h1>
            {helpText ? (
              <TooltipHelp label={title} description={helpText} />
            ) : null}
          </div>
          {description ? (
            <p className="max-w-2xl text-sm text-text-secondary">
              {description}
            </p>
          ) : null}
        </div>
        {actions && actions.length > 0 ? (
          <PageHeaderActions actions={actions} />
        ) : null}
      </div>
    </div>
  );
}
