-- Migration: Add user_settings table for dashboard configuration
-- Created: 2025-10-20
-- Description: Store user preferences for ML integration, notifications, dashboard customization, and data management

-- Create user_settings table
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- ML Integration Settings
  ml_sync_frequency TEXT NOT NULL DEFAULT '30min' 
    CHECK (ml_sync_frequency IN ('15min', '30min', '1hour', 'manual')),
  ml_last_sync_at TIMESTAMPTZ,
  ml_auto_sync_enabled BOOLEAN NOT NULL DEFAULT true,
  
  -- Notification Settings
  email_notifications_enabled BOOLEAN NOT NULL DEFAULT true,
  notification_roi_threshold NUMERIC NOT NULL DEFAULT 1000,
  notification_confidence_threshold INTEGER NOT NULL DEFAULT 70 
    CHECK (notification_confidence_threshold BETWEEN 0 AND 100),
  notification_priority_filter TEXT NOT NULL DEFAULT 'medium' 
    CHECK (notification_priority_filter IN ('high', 'medium', 'all')),
  notification_business_hours_only BOOLEAN NOT NULL DEFAULT false,
  
  -- Dashboard Customization Settings
  widget_intelligence_center_visible BOOLEAN NOT NULL DEFAULT true,
  widget_quick_metrics_visible BOOLEAN NOT NULL DEFAULT true,
  widget_analytics_visible BOOLEAN NOT NULL DEFAULT true,
  widget_products_visible BOOLEAN NOT NULL DEFAULT true,
  dashboard_auto_refresh_interval INTEGER NOT NULL DEFAULT 5,
  dashboard_default_page TEXT NOT NULL DEFAULT 'dashboard' 
    CHECK (dashboard_default_page IN ('dashboard', 'products', 'analytics')),
  dashboard_compact_mode BOOLEAN NOT NULL DEFAULT false,
  
  -- Data Management Settings
  data_retention_days INTEGER NOT NULL DEFAULT 90,
  data_export_include_sensitive BOOLEAN NOT NULL DEFAULT false,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(user_id, tenant_id)
);

-- Create index on user_id for fast lookups
CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);
CREATE INDEX idx_user_settings_tenant_id ON user_settings(tenant_id);

-- Enable Row Level Security
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own settings
CREATE POLICY "Users can view own settings"
  ON user_settings
  FOR SELECT
  USING (
    auth.uid() = user_id
  );

-- RLS Policy: Users can insert their own settings (on first access)
CREATE POLICY "Users can insert own settings"
  ON user_settings
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
  );

-- RLS Policy: Users can update their own settings
CREATE POLICY "Users can update own settings"
  ON user_settings
  FOR UPDATE
  USING (
    auth.uid() = user_id
  )
  WITH CHECK (
    auth.uid() = user_id
  );

-- RLS Policy: Users can delete their own settings
CREATE POLICY "Users can delete own settings"
  ON user_settings
  FOR DELETE
  USING (
    auth.uid() = user_id
  );

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_settings_updated_at()
RETURNS TRIGGER
SECURITY INVOKER
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on every UPDATE
CREATE TRIGGER user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_user_settings_updated_at();

-- Add helpful comment
COMMENT ON TABLE user_settings IS 'User preferences for ML integration, notifications, dashboard customization, and data management. One row per user per tenant.';
COMMENT ON COLUMN user_settings.ml_sync_frequency IS 'Frequency of automatic ML product sync: 15min, 30min, 1hour, or manual';
COMMENT ON COLUMN user_settings.notification_roi_threshold IS 'Minimum ROI value (in BRL) to trigger notifications';
COMMENT ON COLUMN user_settings.notification_confidence_threshold IS 'Minimum confidence percentage (0-100) to trigger notifications';
COMMENT ON COLUMN user_settings.dashboard_auto_refresh_interval IS 'Auto-refresh interval in minutes (0 = disabled)';
COMMENT ON COLUMN user_settings.data_retention_days IS 'Number of days to keep historical data before cleanup';
