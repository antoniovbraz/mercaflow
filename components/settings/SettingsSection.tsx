"use client";

import { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface SettingsSectionProps {
  title: string;
  description: string;
  icon?: ReactNode;
  children: ReactNode;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

export default function SettingsSection({
  title,
  description,
  icon,
  children,
  collapsible = false,
  defaultExpanded = true,
}: SettingsSectionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <Card className="overflow-hidden">
      <div
        className={`px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white ${
          collapsible ? "cursor-pointer hover:bg-gray-100" : ""
        }`}
        onClick={() => collapsible && setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                {icon}
              </div>
            )}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <p className="text-sm text-gray-600 mt-0.5">{description}</p>
            </div>
          </div>
          {collapsible && (
            <div className="text-gray-400">
              {expanded ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </div>
          )}
        </div>
      </div>
      {(!collapsible || expanded) && (
        <div className="px-6 py-5">{children}</div>
      )}
    </Card>
  );
}
