import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getCurrentUser } from "@/utils/supabase/roles";
import { getCurrentTenantId } from "@/utils/supabase/tenancy";
import { logger } from "@/utils/logger";

/**
 * GET /api/analytics/forecast
 * Generate demand forecast using simple linear regression
 * 
 * Algorithm:
 * 1. Fetch historical order counts by day
 * 2. Apply linear regression to find trend
 * 3. Project forward for specified days
 * 4. Add seasonal adjustment (weekly pattern)
 * 5. Calculate confidence intervals (±20%)
 */
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const historicalDays = parseInt(searchParams.get("historical_days") || "30");
    const forecastDays = parseInt(searchParams.get("forecast_days") || "7");

    const supabase = await createClient();

    // Get historical order counts grouped by day
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - historicalDays);

    const { data: orders, error: ordersError } = await supabase
      .from("ml_orders")
      .select("created_at")
      .eq("tenant_id", tenantId)
      .gte("created_at", startDate.toISOString())
      .order("created_at", { ascending: true });

    if (ordersError) {
      logger.error("Error fetching orders for forecast", {
        error: ordersError,
        tenantId,
      });
      return NextResponse.json(
        { error: "Failed to fetch order data" },
        { status: 500 }
      );
    }

    if (!orders || orders.length < 7) {
      // Not enough data for meaningful forecast
      return NextResponse.json({
        success: true,
        forecast: [],
        historical: [],
        message: "Insufficient data for forecast (need 7+ orders)",
      });
    }

    // Group orders by day
    const dailyCounts = groupOrdersByDay(orders);

    // Calculate forecast using linear regression
    const forecastData = generateForecast(dailyCounts, forecastDays);

    return NextResponse.json(
      {
        success: true,
        ...forecastData,
        historicalDays,
        forecastDays,
        orderCount: orders.length,
      },
      {
        headers: {
          "Cache-Control": "s-maxage=3600, stale-while-revalidate=7200", // 1h cache
        },
      }
    );
  } catch (error) {
    logger.error("Unexpected error in GET /api/analytics/forecast", {
      error,
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Group orders by day and count
 */
function groupOrdersByDay(orders: { created_at: string }[]): {
  date: string;
  count: number;
}[] {
  const dayMap = new Map<string, number>();

  for (const order of orders) {
    const date = new Date(order.created_at);
    const dayKey = date.toISOString().split("T")[0]; // YYYY-MM-DD

    dayMap.set(dayKey, (dayMap.get(dayKey) || 0) + 1);
  }

  // Convert map to array and sort by date
  const dailyCounts = Array.from(dayMap.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return dailyCounts;
}

/**
 * Generate forecast using linear regression
 */
function generateForecast(
  historical: { date: string; count: number }[],
  forecastDays: number
) {
  if (historical.length === 0) {
    return { forecast: [], historical: [], trend: "stable" };
  }

  // Calculate linear regression (y = mx + b)
  const n = historical.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;

  for (let i = 0; i < n; i++) {
    const x = i; // Day index
    const y = historical[i].count;
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumX2 += x * x;
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // Determine trend
  let trend: "up" | "down" | "stable" = "stable";
  if (slope > 0.5) trend = "up";
  else if (slope < -0.5) trend = "down";

  // Generate forecast points
  const forecast: {
    date: string;
    predicted: number;
    lower: number;
    upper: number;
  }[] = [];

  const lastDate = new Date(historical[historical.length - 1].date);

  for (let i = 1; i <= forecastDays; i++) {
    const x = n + i - 1;
    const predicted = Math.max(0, Math.round(slope * x + intercept));

    // Add seasonal adjustment (weekly pattern)
    const forecastDate = new Date(lastDate);
    forecastDate.setDate(forecastDate.getDate() + i);
    const dayOfWeek = forecastDate.getDay();
    const seasonalMultiplier = getSeasonalMultiplier(dayOfWeek);
    const adjustedPredicted = Math.round(predicted * seasonalMultiplier);

    // Calculate confidence interval (±20%)
    const lower = Math.max(0, Math.round(adjustedPredicted * 0.8));
    const upper = Math.round(adjustedPredicted * 1.2);

    forecast.push({
      date: forecastDate.toISOString().split("T")[0],
      predicted: adjustedPredicted,
      lower,
      upper,
    });
  }

  return {
    forecast,
    historical: historical.map((h) => ({
      date: h.date,
      actual: h.count,
    })),
    trend,
    slope: parseFloat(slope.toFixed(2)),
    intercept: parseFloat(intercept.toFixed(2)),
  };
}

/**
 * Get seasonal multiplier based on day of week
 * (0 = Sunday, 6 = Saturday)
 */
function getSeasonalMultiplier(dayOfWeek: number): number {
  // Typical e-commerce pattern: lower on weekends, peak mid-week
  const multipliers = [
    0.8, // Sunday
    1.1, // Monday
    1.2, // Tuesday
    1.15, // Wednesday
    1.1, // Thursday
    1.0, // Friday
    0.85, // Saturday
  ];

  return multipliers[dayOfWeek] || 1.0;
}
