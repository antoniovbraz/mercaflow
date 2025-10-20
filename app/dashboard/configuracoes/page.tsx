"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Settings,
  ShoppingBag,
  Bell,
  LayoutDashboard,
  Database,
  Save,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { hasRole } from "@/utils/supabase/client-roles";
import { Button } from "@/components/ui/button";
import SettingsSection from "@/components/settings/SettingsSection";
import MLIntegrationSettings from "@/components/settings/MLIntegrationSettings";
import NotificationSettings from "@/components/settings/NotificationSettings";
import DashboardCustomization from "@/components/settings/DashboardCustomization";
import DataExportSettings from "@/components/settings/DataExportSettings";

interface UserSettings {
  // ML Integration
  ml_sync_frequency: "15min" | "30min" | "1hour" | "manual";
  ml_last_sync_at: string | null;
  ml_auto_sync_enabled: boolean;

  // Notifications
  email_notifications_enabled: boolean;
  notification_roi_threshold: number;
  notification_confidence_threshold: number;
  notification_priority_filter: "high" | "medium" | "all";
  notification_business_hours_only: boolean;

  // Dashboard
  widget_intelligence_center_visible: boolean;
  widget_quick_metrics_visible: boolean;
  widget_analytics_visible: boolean;
  widget_products_visible: boolean;
  dashboard_auto_refresh_interval: number;
  dashboard_default_page: "dashboard" | "products" | "analytics";
  dashboard_compact_mode: boolean;

  // Data
  data_retention_days: number;
  data_export_include_sensitive: boolean;
}

const DEFAULT_SETTINGS: UserSettings = {
  // ML Integration
  ml_sync_frequency: "30min",
  ml_last_sync_at: new Date().toISOString(),
  ml_auto_sync_enabled: true,

  // Notifications
  email_notifications_enabled: true,
  notification_roi_threshold: 1000,
  notification_confidence_threshold: 70,
  notification_priority_filter: "medium",
  notification_business_hours_only: false,

  // Dashboard
  widget_intelligence_center_visible: true,
  widget_quick_metrics_visible: true,
  widget_analytics_visible: true,
  widget_products_visible: true,
  dashboard_auto_refresh_interval: 5,
  dashboard_default_page: "dashboard",
  dashboard_compact_mode: false,

  // Data
  data_retention_days: 90,
  data_export_include_sensitive: false,
};

export default function ConfiguracoesPage() {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [hasAccess, setHasAccess] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const access = await hasRole("user");
        setHasAccess(access);
        if (!access) {
          router.push("/auth/login");
        }
      } catch {
        router.push("/auth/login");
      }
    };
    checkAccess();
  }, [router]);

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem("mercaflow_user_settings");
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch {
        // If parsing fails, use defaults
        setSettings(DEFAULT_SETTINGS);
      }
    }
  }, []);

  const handleChange = (key: string, value: unknown) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    try {
      localStorage.setItem("mercaflow_user_settings", JSON.stringify(settings));
      setHasChanges(false);
      toast.success("Configurações salvas!", {
        description: "Suas preferências foram atualizadas com sucesso.",
      });
    } catch {
      toast.error("Erro ao salvar", {
        description: "Não foi possível salvar as configurações.",
      });
    }
  };

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
    setHasChanges(true);
    toast.info("Configurações resetadas", {
      description: "Valores padrão restaurados. Clique em Salvar para confirmar.",
    });
  };

  const handleExportInsights = () => {
    toast.info("Export iniciado", {
      description: "Gerando arquivo CSV de insights...",
    });
    // Mock: em produção, chamaria API /api/export/insights
  };

  const handleExportProducts = () => {
    toast.info("Export iniciado", {
      description: "Gerando arquivo JSON de produtos...",
    });
    // Mock: em produção, chamaria API /api/export/products
  };

  const handleDeleteOldData = () => {
    if (
      confirm(
        `Tem certeza que deseja remover dados com mais de ${settings.data_retention_days} dias? Esta ação é irreversível.`
      )
    ) {
      toast.success("Dados removidos", {
        description: `Dados históricos além de ${settings.data_retention_days} dias foram removidos.`,
      });
      // Mock: em produção, chamaria API /api/data/cleanup
    }
  };

  const handleReconnect = () => {
    toast.info("Reconectando...", {
      description: "Tentando restabelecer conexão com Mercado Livre API.",
    });
    // Mock: em produção, chamaria API /api/ml/reconnect
  };

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Settings className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Configurações
                  </h1>
                  <p className="mt-1 text-sm text-gray-600">
                    Personalize sua experiência no MercaFlow
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={handleReset}
                  disabled={!hasChanges}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Resetar
                </Button>
                <Button onClick={handleSave} disabled={!hasChanges}>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Alterações
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* ML Integration */}
          <SettingsSection
            title="Integração Mercado Livre"
            description="Configure conexão e sincronização com ML API"
            icon={<ShoppingBag className="h-5 w-5" />}
          >
            <MLIntegrationSettings
              settings={{
                ml_sync_frequency: settings.ml_sync_frequency,
                ml_last_sync_at: settings.ml_last_sync_at,
                ml_auto_sync_enabled: settings.ml_auto_sync_enabled,
              }}
              onChange={handleChange}
              onReconnect={handleReconnect}
            />
          </SettingsSection>

          {/* Notifications */}
          <SettingsSection
            title="Notificações"
            description="Defina quando e como receber alertas de insights"
            icon={<Bell className="h-5 w-5" />}
          >
            <NotificationSettings
              settings={{
                email_notifications_enabled: settings.email_notifications_enabled,
                notification_roi_threshold: settings.notification_roi_threshold,
                notification_confidence_threshold:
                  settings.notification_confidence_threshold,
                notification_priority_filter:
                  settings.notification_priority_filter,
                notification_business_hours_only:
                  settings.notification_business_hours_only,
              }}
              onChange={handleChange}
            />
          </SettingsSection>

          {/* Dashboard Customization */}
          <SettingsSection
            title="Personalização do Dashboard"
            description="Customize widgets, intervalos e preferências de visualização"
            icon={<LayoutDashboard className="h-5 w-5" />}
          >
            <DashboardCustomization
              settings={{
                widget_intelligence_center_visible:
                  settings.widget_intelligence_center_visible,
                widget_quick_metrics_visible:
                  settings.widget_quick_metrics_visible,
                widget_analytics_visible: settings.widget_analytics_visible,
                widget_products_visible: settings.widget_products_visible,
                dashboard_auto_refresh_interval:
                  settings.dashboard_auto_refresh_interval,
                dashboard_default_page: settings.dashboard_default_page,
                dashboard_compact_mode: settings.dashboard_compact_mode,
              }}
              onChange={handleChange}
            />
          </SettingsSection>

          {/* Data & Privacy */}
          <SettingsSection
            title="Dados & Privacidade"
            description="Gerencie exports, retenção e configurações de privacidade"
            icon={<Database className="h-5 w-5" />}
          >
            <DataExportSettings
              settings={{
                data_retention_days: settings.data_retention_days,
                data_export_include_sensitive:
                  settings.data_export_include_sensitive,
              }}
              onChange={handleChange}
              onExportInsights={handleExportInsights}
              onExportProducts={handleExportProducts}
              onDeleteOldData={handleDeleteOldData}
            />
          </SettingsSection>
        </div>

        {/* Save Button (Bottom) */}
        {hasChanges && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
            <p className="text-sm text-blue-900">
              Você tem alterações não salvas
            </p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleReset}>
                Cancelar
              </Button>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Salvar Alterações
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

