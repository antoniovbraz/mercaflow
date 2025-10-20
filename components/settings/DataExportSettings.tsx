"use client";

import { Download, Database, Trash2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface DataExportSettingsProps {
  settings: {
    data_retention_days: number;
    data_export_include_sensitive: boolean;
  };
  onChange: (key: string, value: unknown) => void;
  onExportInsights?: () => void;
  onExportProducts?: () => void;
  onDeleteOldData?: () => void;
}

export default function DataExportSettings({
  settings,
  onChange,
  onExportInsights,
  onExportProducts,
  onDeleteOldData,
}: DataExportSettingsProps) {
  return (
    <div className="space-y-6">
      {/* Export Buttons */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Download className="h-4 w-4" />
          Exportar Dados
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={onExportInsights}
            className="justify-start h-auto py-4"
          >
            <div className="flex items-center gap-3 w-full">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Download className="h-5 w-5 text-blue-600" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">
                  Insights (CSV)
                </p>
                <p className="text-xs text-gray-600 mt-0.5">
                  Todos os insights gerados
                </p>
              </div>
            </div>
          </Button>

          <Button
            variant="outline"
            onClick={onExportProducts}
            className="justify-start h-auto py-4"
          >
            <div className="flex items-center gap-3 w-full">
              <div className="p-2 bg-green-100 rounded-lg">
                <Database className="h-5 w-5 text-green-600" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">
                  Produtos (JSON)
                </p>
                <p className="text-xs text-gray-600 mt-0.5">
                  Catálogo completo de produtos
                </p>
              </div>
            </div>
          </Button>
        </div>
      </div>

      {/* Data Retention */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-gray-900 flex items-center gap-2">
            <Database className="h-4 w-4" />
            Período de Retenção de Dados
          </label>
          <Badge variant="secondary" className="text-xs">
            {settings.data_retention_days} dias
          </Badge>
        </div>
        <select
          value={settings.data_retention_days}
          onChange={(e) =>
            onChange("data_retention_days", parseInt(e.target.value))
          }
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
        >
          <option value={30}>30 dias</option>
          <option value={60}>60 dias</option>
          <option value={90}>90 dias (recomendado)</option>
          <option value={180}>180 dias</option>
          <option value={365}>1 ano</option>
        </select>
        <p className="text-xs text-gray-600 mt-2">
          Dados históricos mais antigos que este período serão automaticamente
          removidos
        </p>
      </div>

      {/* Delete Old Data */}
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-start gap-3 mb-3">
          <Trash2 className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-900">
              Limpar Dados Antigos
            </p>
            <p className="text-xs text-red-700 mt-1">
              Remove manualmente dados históricos além do período de retenção.
              Esta ação é irreversível.
            </p>
          </div>
        </div>
        <Button
          variant="destructive"
          size="sm"
          onClick={onDeleteOldData}
          className="w-full"
        >
          <Trash2 className="h-3.5 w-3.5 mr-2" />
          Limpar Dados Antigos
        </Button>
      </div>

      {/* Privacy Settings */}
      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Shield className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">
              Incluir Dados Sensíveis em Exports
            </p>
            <p className="text-xs text-gray-600 mt-1">
              Tokens de API e informações privadas (requer senha admin)
            </p>
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={settings.data_export_include_sensitive}
            onChange={(e) =>
              onChange("data_export_include_sensitive", e.target.checked)
            }
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
        </label>
      </div>

      {/* Info Box */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-900">
          <strong>Sobre seus dados:</strong> Todos os dados são armazenados de
          forma segura e criptografada. Exports incluem apenas informações do
          seu tenant. Você pode solicitar remoção completa entrando em contato
          com o suporte.
        </p>
      </div>
    </div>
  );
}
