import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getCurrentUser } from "@/utils/supabase/roles";
import { getCurrentTenantId } from "@/utils/supabase/tenancy";
import { logger } from "@/utils/logger";

/**
 * GET /api/settings
 * Retrieve user settings (creates default if not exists)
 */
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const tenantId = await getCurrentTenantId();
    if (!tenantId) {
      return NextResponse.json(
        { error: "No tenant found for user" },
        { status: 403 }
      );
    }

    const supabase = await createClient();

    // Try to get existing settings
    const { data: existingSettings, error: fetchError } = await supabase
      .from("user_settings")
      .select("*")
      .eq("user_id", user.id)
      .eq("tenant_id", tenantId)
      .maybeSingle();

    if (fetchError) {
      logger.error("Error fetching user settings", {
        error: fetchError,
        userId: user.id,
        tenantId,
      });
      return NextResponse.json(
        { error: "Failed to fetch settings" },
        { status: 500 }
      );
    }

    // If settings exist, return them
    if (existingSettings) {
      return NextResponse.json(
        { success: true, settings: existingSettings },
        {
          headers: {
            "Cache-Control": "private, no-cache, no-store, must-revalidate",
          },
        }
      );
    }

    // If no settings exist, create default settings
    const defaultSettings = {
      user_id: user.id,
      tenant_id: tenantId,
      ml_sync_frequency: "30min",
      ml_last_sync_at: new Date().toISOString(),
      ml_auto_sync_enabled: true,
      email_notifications_enabled: true,
      notification_roi_threshold: 1000,
      notification_confidence_threshold: 70,
      notification_priority_filter: "medium",
      notification_business_hours_only: false,
      widget_intelligence_center_visible: true,
      widget_quick_metrics_visible: true,
      widget_analytics_visible: true,
      widget_products_visible: true,
      dashboard_auto_refresh_interval: 5,
      dashboard_default_page: "dashboard",
      dashboard_compact_mode: false,
      data_retention_days: 90,
      data_export_include_sensitive: false,
    };

    const { data: newSettings, error: insertError } = await supabase
      .from("user_settings")
      .insert(defaultSettings)
      .select()
      .single();

    if (insertError) {
      logger.error("Error creating default user settings", {
        error: insertError,
        userId: user.id,
        tenantId,
      });
      return NextResponse.json(
        { error: "Failed to create default settings" },
        { status: 500 }
      );
    }

    logger.info("Created default user settings", {
      userId: user.id,
      tenantId,
      settingsId: newSettings.id,
    });

    return NextResponse.json(
      { success: true, settings: newSettings },
      {
        status: 201,
        headers: {
          "Cache-Control": "private, no-cache, no-store, must-revalidate",
        },
      }
    );
  } catch (error) {
    logger.error("Unexpected error in GET /api/settings", { error });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/settings
 * Update user settings
 */
export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const tenantId = await getCurrentTenantId();
    if (!tenantId) {
      return NextResponse.json(
        { error: "No tenant found for user" },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate required fields and types
    const allowedFields = [
      "ml_sync_frequency",
      "ml_last_sync_at",
      "ml_auto_sync_enabled",
      "email_notifications_enabled",
      "notification_roi_threshold",
      "notification_confidence_threshold",
      "notification_priority_filter",
      "notification_business_hours_only",
      "widget_intelligence_center_visible",
      "widget_quick_metrics_visible",
      "widget_analytics_visible",
      "widget_products_visible",
      "dashboard_auto_refresh_interval",
      "dashboard_default_page",
      "dashboard_compact_mode",
      "data_retention_days",
      "data_export_include_sensitive",
    ];

    // Filter only allowed fields
    const updateData: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (field in body) {
        updateData[field] = body[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Update settings
    const { data: updatedSettings, error: updateError } = await supabase
      .from("user_settings")
      .update(updateData)
      .eq("user_id", user.id)
      .eq("tenant_id", tenantId)
      .select()
      .single();

    if (updateError) {
      logger.error("Error updating user settings", {
        error: updateError,
        userId: user.id,
        tenantId,
        updateData,
      });
      return NextResponse.json(
        { error: "Failed to update settings" },
        { status: 500 }
      );
    }

    logger.info("Updated user settings", {
      userId: user.id,
      tenantId,
      fieldsUpdated: Object.keys(updateData),
    });

    return NextResponse.json({
      success: true,
      settings: updatedSettings,
      message: "Settings updated successfully",
    });
  } catch (error) {
    logger.error("Unexpected error in PUT /api/settings", { error });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
