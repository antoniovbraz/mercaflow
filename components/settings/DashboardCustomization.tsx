"use client";

import { LayoutDashboard, Eye, EyeOff } from "lucide-react";

interface DashboardCustomizationProps {
  settings: {
    widget_intelligence_center_visible: boolean;
    widget_quick_metrics_visible: boolean;
    widget_analytics_visible: boolean;
    widget_products_visible: boolean;
    dashboard_auto_refresh_interval: number;
    dashboard_default_page: "dashboard" | "products" | "analytics";
    dashboard_compact_mode: boolean;
  };
  onChange: (key: string, value: unknown) => void;
}

export default function DashboardCustomization({
  settings,
  onChange,
}: DashboardCustomizationProps) {
  const widgets = [
    {
      key: "widget_intelligence_center_visible",
      label: "Intelligence Center",
      description: "Hub central de insights e alertas",
    },
    {
      key: "widget_quick_metrics_visible",
      label: "Métricas Rápidas",
      description: "KPIs principais no topo do dashboard",
    },
    {
      key: "widget_analytics_visible",
      label: "Analytics Charts",
      description: "Gráficos de elasticidade e forecast",
    },
    {
      key: "widget_products_visible",
      label: "Produtos Intelligence",
      description: "Insights por produto individual",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Widget Visibility */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <LayoutDashboard className="h-5 w-5 text-gray-700" />
          <h4 className="text-sm font-semibold text-gray-900">
            Visibilidade de Widgets
          </h4>
        </div>
        <div className="space-y-3">
          {widgets.map((widget) => (
            <div
              key={widget.key}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-1.5 rounded ${
                    settings[widget.key as keyof typeof settings]
                      ? "bg-green-100"
                      : "bg-gray-100"
                  }`}
                >
                  {settings[widget.key as keyof typeof settings] ? (
                    <Eye className="h-4 w-4 text-green-600" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {widget.label}
                  </p>
                  <p className="text-xs text-gray-600 mt-0.5">
                    {widget.description}
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={
                    settings[widget.key as keyof typeof settings] as boolean
                  }
                  onChange={(e) => onChange(widget.key, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Auto-refresh Interval */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-3">
          Intervalo de Atualização Automática
        </label>
        <select
          value={settings.dashboard_auto_refresh_interval}
          onChange={(e) =>
            onChange("dashboard_auto_refresh_interval", parseInt(e.target.value))
          }
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
        >
          <option value={1}>1 minuto</option>
          <option value={5}>5 minutos (recomendado)</option>
          <option value={15}>15 minutos</option>
          <option value={30}>30 minutos</option>
          <option value={0}>Manual (sem auto-refresh)</option>
        </select>
        <p className="text-xs text-gray-600 mt-2">
          Frequência de atualização automática dos dados do dashboard
        </p>
      </div>

      {/* Default Page */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-3">
          Página Inicial ao Fazer Login
        </label>
        <div className="grid grid-cols-3 gap-3">
          {[
            {
              value: "dashboard",
              label: "Dashboard",
              emoji: "📊",
            },
            {
              value: "products",
              label: "Produtos",
              emoji: "📦",
            },
            {
              value: "analytics",
              label: "Analytics",
              emoji: "📈",
            },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => onChange("dashboard_default_page", option.value)}
              className={`px-4 py-4 rounded-lg border-2 text-center transition-all ${
                settings.dashboard_default_page === option.value
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className="text-2xl mb-2">{option.emoji}</div>
              <p
                className={`text-sm font-medium ${
                  settings.dashboard_default_page === option.value
                    ? "text-blue-700"
                    : "text-gray-900"
                }`}
              >
                {option.label}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Compact Mode */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
        <div>
          <p className="text-sm font-medium text-gray-900">Modo Compacto</p>
          <p className="text-xs text-gray-600 mt-1">
            Mostrar informações de forma mais condensada (ideal para monitores
            menores)
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={settings.dashboard_compact_mode}
            onChange={(e) =>
              onChange("dashboard_compact_mode", e.target.checked)
            }
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
        </label>
      </div>
    </div>
  );
}
