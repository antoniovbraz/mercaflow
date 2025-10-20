"use client";

import { Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface NotificationSettingsProps {
  settings: {
    email_notifications_enabled: boolean;
    notification_roi_threshold: number;
    notification_confidence_threshold: number;
    notification_priority_filter: "high" | "medium" | "all";
    notification_business_hours_only: boolean;
  };
  onChange: (key: string, value: unknown) => void;
}

export default function NotificationSettings({
  settings,
  onChange,
}: NotificationSettingsProps) {
  return (
    <div className="space-y-6">
      {/* Email Notifications Toggle */}
      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Bell className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">
              Notificações por Email
            </p>
            <p className="text-xs text-gray-600 mt-1">
              Receber alerts de insights prioritários
            </p>
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={settings.email_notifications_enabled}
            onChange={(e) =>
              onChange("email_notifications_enabled", e.target.checked)
            }
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>

      {settings.email_notifications_enabled && (
        <>
          {/* ROI Threshold */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-900">
                Threshold ROI Mínimo
              </label>
              <Badge variant="secondary" className="text-xs">
                R${" "}
                {settings.notification_roi_threshold.toLocaleString("pt-BR")}
              </Badge>
            </div>
            <input
              type="range"
              min="0"
              max="10000"
              step="500"
              value={settings.notification_roi_threshold}
              onChange={(e) =>
                onChange(
                  "notification_roi_threshold",
                  parseInt(e.target.value)
                )
              }
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>R$ 0</span>
              <span>R$ 5.000</span>
              <span>R$ 10.000</span>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              Apenas insights com ROI estimado acima deste valor gerarão
              notificação
            </p>
          </div>

          {/* Confidence Threshold */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-900">
                Confiança Mínima
              </label>
              <Badge variant="secondary" className="text-xs">
                {settings.notification_confidence_threshold}%
              </Badge>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={settings.notification_confidence_threshold}
              onChange={(e) =>
                onChange(
                  "notification_confidence_threshold",
                  parseInt(e.target.value)
                )
              }
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              Nível de confiança mínimo para notificações (maior = mais preciso,
              menos notificações)
            </p>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-3">
              Filtro de Prioridade
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  value: "high",
                  label: "Apenas Alta",
                  description: "Urgente apenas",
                },
                {
                  value: "medium",
                  label: "Média+",
                  description: "Alta e Média",
                },
                { value: "all", label: "Todas", description: "Sem filtro" },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() =>
                    onChange("notification_priority_filter", option.value)
                  }
                  className={`px-4 py-3 rounded-lg border-2 text-left transition-all ${
                    settings.notification_priority_filter === option.value
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <p
                    className={`text-sm font-medium ${
                      settings.notification_priority_filter === option.value
                        ? "text-blue-700"
                        : "text-gray-900"
                    }`}
                  >
                    {option.label}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {option.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Business Hours Only */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-900">
                Apenas Horário Comercial
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Enviar notificações apenas das 9h às 18h (seg-sex)
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notification_business_hours_only}
                onChange={(e) =>
                  onChange("notification_business_hours_only", e.target.checked)
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </>
      )}
    </div>
  );
}
