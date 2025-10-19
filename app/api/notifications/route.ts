/**
 * Notifications API
 * 
 * Provides real-time notification counts for the dashboard:
 * - Unanswered ML questions
 * - Pending orders
 * - Price/metric anomaly alerts
 * 
 * @security Requires authentication, respects RLS policies
 * @cache Redis cached for 1 minute to reduce DB load
 */

import { NextResponse } from "next/server";
import { getCurrentUser, createClient } from "@/utils/supabase/server";
import { getCurrentTenantId } from "@/utils/supabase/tenancy";
import { logger } from "@/utils/logger";
import { getCached, buildCacheKey, CachePrefix, CacheTTL } from "@/utils/redis";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface NotificationCounts {
  unansweredQuestions: number;
  pendingOrders: number;
  alerts: number;
  urgentCount: number;
}

/**
 * GET /api/notifications - Get notification counts
 */
export async function GET() {
  try {
    // Verify authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get tenant ID
    const tenantId = await getCurrentTenantId();
    if (!tenantId) {
      logger.error("Failed to get tenant ID for notifications", {
        userId: user.id,
      });
      return NextResponse.json(
        { error: "Tenant not found" },
        { status: 400 }
      );
    }

    // Use cache-aside pattern with getCached
    const cacheKey = buildCacheKey(CachePrefix.DASHBOARD, 'notifications', tenantId);
    
    const data = await getCached<NotificationCounts>(
      cacheKey,
      async () => {
        const supabase = await createClient();

        // Get active ML integration for this tenant
        const { data: integration } = await supabase
          .from("ml_integrations")
          .select("id")
          .eq("tenant_id", tenantId)
          .eq("status", "active")
          .maybeSingle();

        if (!integration) {
          logger.warn("No active ML integration found for tenant", { tenantId });
          
          // Return zeros if no integration
          return {
            unansweredQuestions: 0,
            pendingOrders: 0,
            alerts: 0,
            urgentCount: 0,
          };
        }

        // Count unanswered questions
        const { count: unansweredQuestions, error: questionsError } =
          await supabase
            .from("ml_questions")
            .select("*", { count: "exact", head: true })
            .eq("integration_id", integration.id)
            .eq("status", "UNANSWERED");

        if (questionsError) {
          logger.error("Failed to count unanswered questions", {
            error: questionsError,
            integrationId: integration.id,
          });
        }

        // Count pending orders (confirmed, payment_required, paid, ready_to_ship)
        const { count: pendingOrders, error: ordersError } = await supabase
          .from("ml_orders")
          .select("*", { count: "exact", head: true })
          .eq("integration_id", integration.id)
          .in("status", ["confirmed", "payment_required", "paid", "ready_to_ship"]);

        if (ordersError) {
          logger.error("Failed to count pending orders", {
            error: ordersError,
            integrationId: integration.id,
          });
        }

        // TODO: Count price anomaly alerts (Phase 2 - Inteligência Econômica)
        // For now, return 0 as alerts feature is not yet implemented
        const alerts = 0;

        // Calculate urgent count (threshold: >5 questions OR >10 orders OR any alerts)
        const urgentCount =
          ((unansweredQuestions || 0) > 5 ? 1 : 0) +
          ((pendingOrders || 0) > 10 ? 1 : 0) +
          (alerts > 0 ? 1 : 0);

        const counts: NotificationCounts = {
          unansweredQuestions: unansweredQuestions || 0,
          pendingOrders: pendingOrders || 0,
          alerts,
          urgentCount,
        };

        logger.info("Notifications fetched successfully", {
          tenantId,
          integrationId: integration.id,
          counts,
        });

        return counts;
      },
      { ttl: CacheTTL.MINUTE } // 1 minute cache
    );

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    logger.error("Failed to fetch notifications", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      {
        error: "Failed to fetch notifications",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
