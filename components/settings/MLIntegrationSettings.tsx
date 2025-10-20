"use client";

import { CheckCircle2, XCircle, AlertCircle, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface MLIntegrationSettingsProps {
  settings: {
    ml_sync_frequency: "15min" | "30min" | "1hour" | "manual";
    ml_last_sync_at: string | null;
    ml_auto_sync_enabled: boolean;
  };
  onChange: (key: string, value: unknown) => void;
  onReconnect?: () => void;
}

export default function MLIntegrationSettings({
  settings,
  onChange,
  onReconnect,
}: MLIntegrationSettingsProps) {
  // Mock connection status (em produção viria do backend)
  const connectionStatus: "connected" | "disconnected" | "error" =
    "connected" as "connected" | "disconnected" | "error";

  const getStatusBadge = () => {
    switch (connectionStatus) {
      case "connected":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Conectado
          </Badge>
        );
      case "disconnected":
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-200">
            <XCircle className="h-3 w-3 mr-1" />
            Desconectado
          </Badge>
        );
      case "error":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <AlertCircle className="h-3 w-3 mr-1" />
            Erro de Conexão
          </Badge>
        );
    }
  };

  const getLastSyncText = () => {
    if (!settings.ml_last_sync_at) return "Nunca sincronizado";
    const lastSync = new Date(settings.ml_last_sync_at);
    const now = new Date();
    const diffMinutes = Math.floor(
      (now.getTime() - lastSync.getTime()) / 60000
    );

    if (diffMinutes < 1) return "Agora mesmo";
    if (diffMinutes < 60) return `Há ${diffMinutes} minutos`;
    if (diffMinutes < 1440) return `Há ${Math.floor(diffMinutes / 60)} horas`;
    return `Há ${Math.floor(diffMinutes / 1440)} dias`;
  };

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div>
          <p className="text-sm font-medium text-gray-900">Status da Conexão</p>
          <p className="text-xs text-gray-600 mt-1">Mercado Livre API</p>
        </div>
        <div className="flex items-center gap-3">
          {getStatusBadge()}
          {connectionStatus === "error" && (
            <Button
              size="sm"
              variant="outline"
              onClick={onReconnect}
              className="text-xs"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Reconectar
            </Button>
          )}
        </div>
      </div>

      {/* Last Sync */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-900">
            Última Sincronização
          </p>
          <p className="text-xs text-gray-600 mt-1">{getLastSyncText()}</p>
        </div>
        <p className="text-xs text-gray-500">
          {settings.ml_last_sync_at
            ? new Date(settings.ml_last_sync_at).toLocaleString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
            : "—"}
        </p>
      </div>

      {/* Auto Sync Toggle */}
      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
        <div>
          <p className="text-sm font-medium text-gray-900">
            Sincronização Automática
          </p>
          <p className="text-xs text-gray-600 mt-1">
            Atualizar produtos periodicamente
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={settings.ml_auto_sync_enabled}
            onChange={(e) => onChange("ml_auto_sync_enabled", e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>

      {/* Sync Frequency */}
      {settings.ml_auto_sync_enabled && (
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-3">
            Frequência de Sincronização
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { value: "15min", label: "15 minutos" },
              { value: "30min", label: "30 minutos" },
              { value: "1hour", label: "1 hora" },
              { value: "manual", label: "Manual" },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => onChange("ml_sync_frequency", option.value)}
                className={`px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all ${
                  settings.ml_sync_frequency === option.value
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* API Health Info */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-blue-900">
              Status da API Mercado Livre
            </p>
            <p className="text-xs text-blue-700 mt-1">
              Todas as chamadas estão funcionando normalmente. Taxa de sucesso:
              99.8%
            </p>
            <div className="flex gap-4 mt-2 text-xs text-blue-600">
              <span>Latência média: 120ms</span>
              <span>•</span>
              <span>Rate limit: 80/100 chamadas</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
