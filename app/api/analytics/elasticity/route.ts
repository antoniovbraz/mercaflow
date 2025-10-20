import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getCurrentUser } from "@/utils/supabase/roles";
import { getCurrentTenantId } from "@/utils/supabase/tenancy";
import { logger } from "@/utils/logger";
import * as Sentry from "@sentry/nextjs";

/**
 * GET /api/analytics/elasticity
 * Calculate price-demand elasticity from historical order data
 * 
 * Algorithm:
 * 1. Group orders by price points (±5% tolerance)
 * 2. Calculate average demand (quantity) per price point
 * 3. Use linear regression to find elasticity coefficient
 * 4. Estimate optimal price (max revenue = price × demand)
 */
export async function GET(request: NextRequest) {
  return Sentry.withServerActionInstrumentation(
    "api.analytics.elasticity",
    {
      recordResponse: true,
    },
    async () => {
  try {
    Sentry.addBreadcrumb({
      category: "analytics",
      message: "Elasticity API called",
      level: "info",
    });

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

    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get("item_id");
    const days = parseInt(searchParams.get("days") || "30");

    // Add context tags for Sentry
    Sentry.setTag("api.endpoint", "elasticity");
    Sentry.setTag("api.item_id", itemId || "all");
    Sentry.setTag("api.days", days.toString());
    Sentry.setUser({ id: user.id });

    const supabase = await createClient();

    // Get historical order data
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    let query = supabase
      .from("ml_orders")
      .select("id, total_amount, items")
      .eq("tenant_id", tenantId)
      .gte("created_at", startDate.toISOString())
      .order("created_at", { ascending: true });

    if (itemId) {
      // Filter by specific item (requires parsing items JSON)
      // This is a simplified version - in production, use a proper JSON query
      query = query.contains("items", [{ item_id: itemId }]);
    }

    const { data: orders, error: ordersError } = await query;

    if (ordersError) {
      logger.error("Error fetching orders for elasticity", {
        error: ordersError,
        tenantId,
        itemId,
      });
      return NextResponse.json(
        { error: "Failed to fetch order data" },
        { status: 500 }
      );
    }

    if (!orders || orders.length < 5) {
      // Not enough data for meaningful elasticity calculation
      return NextResponse.json({
        success: true,
        elasticity: -1.0,
        optimalPrice: null,
        dataPoints: [],
        message: "Insufficient data for elasticity calculation (need 5+ orders)",
      });
    }

    // Calculate elasticity from order data
    const elasticityData = calculateElasticity(orders);

    return NextResponse.json(
      {
        success: true,
        ...elasticityData,
        itemId,
        period: `${days} days`,
        orderCount: orders.length,
      },
      {
        headers: {
          "Cache-Control": "s-maxage=900, stale-while-revalidate=1800", // 15min cache
        },
      }
    );
  } catch (error) {
    logger.error("Unexpected error in GET /api/analytics/elasticity", {
      error,
    });
    Sentry.captureException(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
  }
  );
}

/**
 * Calculate price elasticity from order data
 */
function calculateElasticity(
  orders: { total_amount: number; items: unknown }[]
) {
  // Group orders by price points (±5% tolerance)
  const pricePoints: { price: number; quantity: number; revenue: number }[] =
    [];

  const tolerance = 0.05; // 5% price tolerance for grouping

  for (const order of orders) {
    const price = order.total_amount;

    // Find existing price point (within tolerance)
    let pricePoint = pricePoints.find(
      (pp) => Math.abs(pp.price - price) / price < tolerance
    );

    if (!pricePoint) {
      pricePoint = { price, quantity: 0, revenue: 0 };
      pricePoints.push(pricePoint);
    }

    pricePoint.quantity += 1; // Assuming 1 item per order (simplified)
    pricePoint.revenue += price;
  }

  // Sort by price
  pricePoints.sort((a, b) => a.price - b.price);

  if (pricePoints.length < 2) {
    return {
      elasticity: -1.0,
      optimalPrice: null,
      currentPrice: pricePoints[0]?.price || 0,
      dataPoints: pricePoints,
    };
  }

  // Calculate elasticity using midpoint formula
  // E = (ΔQ/Q_avg) / (ΔP/P_avg)
  let totalElasticity = 0;
  let elasticityCount = 0;

  for (let i = 1; i < pricePoints.length; i++) {
    const p1 = pricePoints[i - 1];
    const p2 = pricePoints[i];

    const deltaQ = p2.quantity - p1.quantity;
    const deltaP = p2.price - p1.price;
    const avgQ = (p1.quantity + p2.quantity) / 2;
    const avgP = (p1.price + p2.price) / 2;

    if (avgP > 0 && avgQ > 0 && deltaP !== 0) {
      const elasticity = (deltaQ / avgQ) / (deltaP / avgP);
      totalElasticity += elasticity;
      elasticityCount++;
    }
  }

  const avgElasticity =
    elasticityCount > 0 ? totalElasticity / elasticityCount : -1.0;

  // Find optimal price (max revenue point)
  let optimalPrice = pricePoints[0].price;
  let maxRevenue = pricePoints[0].revenue;

  for (const pp of pricePoints) {
    if (pp.revenue > maxRevenue) {
      maxRevenue = pp.revenue;
      optimalPrice = pp.price;
    }
  }

  const currentPrice = pricePoints[pricePoints.length - 1].price; // Latest price

  return {
    elasticity: avgElasticity,
    optimalPrice,
    currentPrice,
    dataPoints: pricePoints,
    maxRevenue,
  };
}
