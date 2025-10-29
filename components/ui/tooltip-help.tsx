"use client";

import { HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface TooltipHelpProps {
  label: string;
  description?: string;
  className?: string;
}

export function TooltipHelp({ label, description, className }: TooltipHelpProps) {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={150} disableHoverableContent>
        <TooltipTrigger
          type="button"
          aria-label={label}
          className={cn(
            "inline-flex h-5 w-5 items-center justify-center rounded-full border border-outline-subtle bg-surface text-text-secondary transition-colors",
            "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-intent-brand focus-visible:ring-opacity-30 focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
            className
          )}
        >
          <HelpCircle className="h-3.5 w-3.5" aria-hidden="true" />
        </TooltipTrigger>
        <TooltipContent className="text-sm">
          <p className="font-semibold text-text-primary">{label}</p>
          {description ? (
            <span className="mt-1 block text-sm text-text-secondary">{description}</span>
          ) : null}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
