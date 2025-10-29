"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ReactNode } from "react";

interface PageHeaderActionsProps {
  children?: ReactNode;
  actions?: Array<{
    href: string;
    label: string;
    variant?: "default" | "outline" | "secondary" | "ghost" | "link";
  }>;
}

export function PageHeaderActions({
  children,
  actions,
}: PageHeaderActionsProps) {
  if (children) {
    return <div className="flex flex-wrap items-center gap-2">{children}</div>;
  }

  if (actions && actions.length > 0) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        {actions.map((action, index) => (
          <Button
            key={`${action.href}-${index}`}
            variant={action.variant ?? "default"}
            size="sm"
            asChild
          >
            <Link href={action.href}>{action.label}</Link>
          </Button>
        ))}
      </div>
    );
  }

  return null;
}
