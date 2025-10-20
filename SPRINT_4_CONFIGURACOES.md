# Sprint 4 - Configurações & Dashboard Customization

## 📋 Objetivo
Criar página `/dashboard/configuracoes` com gerenciamento de integrações ML, preferências de notificações e customização de dashboard.

## 🎯 Escopo do Sprint 4

### Seções da Página

```
┌─────────────────────────────────────────────────────┐
│ ⚙️ Configurações do Sistema                         │
└─────────────────────────────────────────────────────┘
┌──────────────────┬──────────────────────────────────┐
│ 📱 ML Integration│ 🔔 Notificações                  │
│ - Status conexão │ - Email alerts                    │
│ - Sync frequency │ - Thresholds ROI                  │
│ - API health     │ - Priority filters                │
└──────────────────┴──────────────────────────────────┘
┌─────────────────────────────────────────────────────┐
│ 🎨 Dashboard Customization                          │
│ - Widget visibility toggles                         │
│ - Refresh intervals                                 │
│ - Default views                                     │
└─────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────┐
│ 📊 Data & Privacy                                   │
│ - Export insights (CSV/JSON)                        │
│ - Data retention                                    │
│ - Privacy settings                                  │
└─────────────────────────────────────────────────────┘
```

## 🧩 Componentes Necessários

### 1. MLIntegrationSettings
**Arquivo:** `components/settings/MLIntegrationSettings.tsx`
**Features:**
- Status da conexão ML (conectado/desconectado/erro)
- Última sincronização timestamp
- Configuração de frequência (15min/30min/1h/manual)
- Botão "Reconectar" se houver erro
- Health check da API ML

### 2. NotificationSettings
**Arquivo:** `components/settings/NotificationSettings.tsx`
**Features:**
- Toggle email notifications (on/off)
- Threshold ROI mínimo para alerta (slider R$0-10k)
- Confidence mínimo para insights (slider 0-100%)
- Priority filter (High only / Medium+ / All)
- Horário de notificações (business hours only toggle)

### 3. DashboardCustomization
**Arquivo:** `components/settings/DashboardCustomization.tsx`
**Features:**
- Widget visibility (checkboxes):
  * IntelligenceCenter
  * QuickMetricsBar
  * Analytics Charts
  * Product Intelligence
- Auto-refresh intervals (dropdown: 1min/5min/15min/manual)
- Default page on login (dropdown: Dashboard/Products/Analytics)
- Compact mode preference (toggle)

### 4. DataExportSettings
**Arquivo:** `components/settings/DataExportSettings.tsx`
**Features:**
- Export insights button (CSV format)
- Export products button (JSON format)
- Data retention period (dropdown: 30/60/90/180 days)
- Delete old data button (with confirmation)
- Privacy: Show/hide sensitive data in exports

### 5. SettingsSection (Wrapper)
**Arquivo:** `components/settings/SettingsSection.tsx`
**Features:**
- Consistent card layout
- Title + description
- Expandable/collapsible sections
- Save/Cancel actions

## 📊 Estrutura de Dados

### User Settings Schema
```typescript
interface UserSettings {
  id: string;
  user_id: string;
  tenant_id: string;
  
  // ML Integration
  ml_sync_frequency: '15min' | '30min' | '1hour' | 'manual';
  ml_last_sync_at: string;
  ml_auto_sync_enabled: boolean;
  
  // Notifications
  email_notifications_enabled: boolean;
  notification_roi_threshold: number; // R$ value
  notification_confidence_threshold: number; // 0-100
  notification_priority_filter: 'high' | 'medium' | 'all';
  notification_business_hours_only: boolean;
  
  // Dashboard
  widget_intelligence_center_visible: boolean;
  widget_quick_metrics_visible: boolean;
  widget_analytics_visible: boolean;
  widget_products_visible: boolean;
  dashboard_auto_refresh_interval: number; // minutes
  dashboard_default_page: 'dashboard' | 'products' | 'analytics';
  dashboard_compact_mode: boolean;
  
  // Data
  data_retention_days: number;
  data_export_include_sensitive: boolean;
  
  created_at: string;
  updated_at: string;
}
```

### Database Migration (Future)
```sql
-- Sprint 4 migration (NOT implemented in this sprint, just mock)
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- ML Integration
  ml_sync_frequency TEXT DEFAULT '30min' CHECK (ml_sync_frequency IN ('15min', '30min', '1hour', 'manual')),
  ml_last_sync_at TIMESTAMPTZ,
  ml_auto_sync_enabled BOOLEAN DEFAULT true,
  
  -- Notifications
  email_notifications_enabled BOOLEAN DEFAULT true,
  notification_roi_threshold NUMERIC DEFAULT 1000,
  notification_confidence_threshold INTEGER DEFAULT 70 CHECK (notification_confidence_threshold BETWEEN 0 AND 100),
  notification_priority_filter TEXT DEFAULT 'medium' CHECK (notification_priority_filter IN ('high', 'medium', 'all')),
  notification_business_hours_only BOOLEAN DEFAULT false,
  
  -- Dashboard
  widget_intelligence_center_visible BOOLEAN DEFAULT true,
  widget_quick_metrics_visible BOOLEAN DEFAULT true,
  widget_analytics_visible BOOLEAN DEFAULT true,
  widget_products_visible BOOLEAN DEFAULT true,
  dashboard_auto_refresh_interval INTEGER DEFAULT 5,
  dashboard_default_page TEXT DEFAULT 'dashboard' CHECK (dashboard_default_page IN ('dashboard', 'products', 'analytics')),
  dashboard_compact_mode BOOLEAN DEFAULT false,
  
  -- Data
  data_retention_days INTEGER DEFAULT 90,
  data_export_include_sensitive BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, tenant_id)
);

-- RLS policies
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own settings"
  ON user_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON user_settings FOR UPDATE
  USING (auth.uid() = user_id);
```

## 🔄 Implementação

### Fase 1: Components (1-1.5h)
1. ✅ SettingsSection.tsx (wrapper reutilizável)
2. ✅ MLIntegrationSettings.tsx (status + sync config)
3. ✅ NotificationSettings.tsx (toggles + sliders)
4. ✅ DashboardCustomization.tsx (widget visibility)
5. ✅ DataExportSettings.tsx (export + retention)

### Fase 2: Page Integration (30min)
6. ✅ Criar /dashboard/configuracoes/page.tsx
7. ✅ Layout com tabs ou accordion
8. ✅ State management (useState para settings locais)
9. ✅ Save/Reset handlers

### Fase 3: Mock Storage (30min)
10. ✅ localStorage para persistir configurações (demo)
11. ✅ Default values no primeiro acesso
12. ✅ Toast notifications em save/reset

### Fase 4: Polish (30min)
13. ✅ TypeScript validation
14. ✅ Responsive design
15. ✅ Commit + Push

## 📝 Notas de Implementação

### Mock vs Real
- **Sprint 4**: localStorage para demo (sem backend)
- **Future**: API `/api/settings` + database table
- **Migration**: Fácil trocar localStorage por fetch

### UX Decisions
- **Auto-save** vs **Manual save**: Manual com botão "Salvar Alterações"
- **Confirmation**: Apenas em ações destrutivas (delete data)
- **Feedback**: Toast notifications em todas ações
- **Validation**: Client-side com Zod schemas

### Component Patterns
```typescript
// SettingsSection wrapper
<SettingsSection
  title="Integração Mercado Livre"
  description="Configure conexão e sincronização"
  icon={<ShoppingBag />}
>
  <MLIntegrationSettings settings={settings} onChange={handleChange} />
</SettingsSection>
```

## 🎨 Design System

**Colors:**
- Success (conectado): green-500
- Warning (sync pendente): yellow-500
- Error (desconectado): red-500
- Info: blue-500

**Icons (lucide-react):**
- Settings: Settings
- ML: ShoppingBag
- Notifications: Bell
- Dashboard: LayoutDashboard
- Data: Database
- Export: Download
- Save: Save
- Reset: RotateCcw

## 📈 Métricas de Sucesso

- ✅ 5 componentes funcionais
- ✅ Persistência em localStorage
- ✅ Toast feedback em todas ações
- ✅ TypeScript 0 errors
- ✅ Responsive (mobile stack, desktop grid)
- ✅ ~800-1000 linhas de código

## 🚀 Future Enhancements

**Post-Sprint 4:**
1. Backend API `/api/settings` (GET/PUT)
2. Database migration `user_settings` table
3. RLS policies para multi-tenancy
4. Real-time sync status (webhooks)
5. Advanced: drag-and-drop dashboard widgets (react-grid-layout)
6. Email templates para notificações
7. Webhook configuration para integrações externas
