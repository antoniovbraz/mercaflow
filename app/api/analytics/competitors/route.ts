import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getCurrentUser } from "@/utils/supabase/roles";
import { getCurrentTenantId } from "@/utils/supabase/tenancy";
import { logger } from "@/utils/logger";
import { MLTokenManager } from "@/utils/mercadolivre/token-manager";

/**
 * GET /api/analytics/competitors
 * Analyze competitor pricing and positioning
 * 
 * Algorithm:
 * 1. Fetch user's products with category info
 * 2. For each product, search ML for similar items in same category
 * 3. Compare prices, sales, reputation
 * 4. Calculate market positioning metrics
 * 5. Generate competitive insights
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
    const itemId = searchParams.get("item_id");
    const limit = parseInt(searchParams.get("limit") || "5");

    const supabase = await createClient();

    // Get user's products
    let productsQuery = supabase
      .from("ml_products")
      .select("id, ml_item_id, title, price, category_id, sold_quantity")
      .eq("tenant_id", tenantId)
      .eq("status", "active")
      .order("sold_quantity", { ascending: false });

    if (itemId) {
      productsQuery = productsQuery.eq("ml_item_id", itemId);
    }

    const { data: products, error: productsError } = await productsQuery.limit(
      limit
    );

    if (productsError) {
      logger.error("Error fetching products for competitor analysis", {
        error: productsError,
        tenantId,
      });
      return NextResponse.json(
        { error: "Failed to fetch products" },
        { status: 500 }
      );
    }

    if (!products || products.length === 0) {
      return NextResponse.json({
        success: true,
        competitors: [],
        message: "No active products found",
      });
    }

    // Get ML integration
    const { data: integration } = await supabase
      .from("ml_integrations")
      .select("id")
      .eq("tenant_id", tenantId)
      .eq("is_active", true)
      .maybeSingle();

    if (!integration || !integration.id) {
      return NextResponse.json(
        { error: "No active ML integration found" },
        { status: 403 }
      );
    }

    // Fetch competitor data from ML API
    const tokenManager = new MLTokenManager();
    const integrationId = integration.id as string; // Type assertion after null check
    const accessToken = await tokenManager.getValidToken(integrationId);

    if (!accessToken) {
      return NextResponse.json(
        { error: "Failed to get valid ML access token" },
        { status: 500 }
      );
    }

    const competitorAnalysis = await Promise.all(
      products.map((product) =>
        analyzeCompetitors(product, accessToken)
      )
    );

    return NextResponse.json(
      {
        success: true,
        competitors: competitorAnalysis,
        productCount: products.length,
      },
      {
        headers: {
          "Cache-Control": "s-maxage=1800, stale-while-revalidate=3600", // 30min cache
        },
      }
    );
  } catch (error) {
    logger.error("Unexpected error in GET /api/analytics/competitors", {
      error,
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Analyze competitors for a single product
 */
async function analyzeCompetitors(
  product: {
    id: string;
    ml_item_id: string;
    title: string;
    price: number;
    category_id: string | null;
    sold_quantity: number;
  },
  accessToken: string
) {
  try {
    // Search for similar items in same category
    const searchQuery = encodeURIComponent(
      product.title.split(" ").slice(0, 3).join(" ")
    ); // First 3 words

    let searchUrl = `https://api.mercadolibre.com/sites/MLB/search?q=${searchQuery}&limit=10`;
    
    // Only add category filter if category_id exists
    if (product.category_id) {
      searchUrl += `&category=${product.category_id}`;
    }

    const searchResponse = await fetch(searchUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!searchResponse.ok) {
      logger.error("ML API search failed", {
        status: searchResponse.status,
        itemId: product.ml_item_id,
      });
      return {
        productId: product.id,
        productTitle: product.title,
        competitors: [],
        error: "Search failed",
      };
    }

    const searchData = await searchResponse.json();
    const results = searchData.results || [];

    // Filter out own product and analyze competitors
    const competitors = results
      .filter((item: { id: string }) => item.id !== product.ml_item_id)
      .slice(0, 5) // Top 5 competitors
      .map((item: {
        id: string;
        title: string;
        price: number;
        sold_quantity: number;
        seller: { id: number; nickname: string };
        thumbnail: string;
        permalink: string;
      }) => {
        const priceDiff = item.price - product.price;
        const priceDiffPercent = (priceDiff / product.price) * 100;

        return {
          itemId: item.id,
          title: item.title,
          price: item.price,
          soldQuantity: item.sold_quantity || 0,
          seller: {
            id: item.seller.id,
            nickname: item.seller.nickname,
          },
          priceDifference: parseFloat(priceDiff.toFixed(2)),
          priceDifferencePercent: parseFloat(priceDiffPercent.toFixed(1)),
          positioning:
            priceDiff > 0 ? "cheaper" : priceDiff < 0 ? "expensive" : "equal",
          thumbnail: item.thumbnail,
          permalink: item.permalink,
        };
      });

    // Calculate market insights
    const avgCompetitorPrice =
      competitors.length > 0
        ? competitors.reduce((sum: number, c: { price: number }) => sum + c.price, 0) /
          competitors.length
        : product.price;

    const avgSoldQuantity =
      competitors.length > 0
        ? competitors.reduce((sum: number, c: { soldQuantity: number }) => sum + c.soldQuantity, 0) /
          competitors.length
        : 0;

    const marketPosition =
      product.price < avgCompetitorPrice * 0.9
        ? "budget"
        : product.price > avgCompetitorPrice * 1.1
        ? "premium"
        : "mid-range";

    const competitiveAdvantage =
      product.sold_quantity > avgSoldQuantity * 1.2
        ? "high"
        : product.sold_quantity < avgSoldQuantity * 0.8
        ? "low"
        : "medium";

    return {
      productId: product.id,
      productTitle: product.title,
      productPrice: product.price,
      productSoldQuantity: product.sold_quantity,
      competitors,
      insights: {
        avgCompetitorPrice: parseFloat(avgCompetitorPrice.toFixed(2)),
        avgSoldQuantity: Math.round(avgSoldQuantity),
        marketPosition,
        competitiveAdvantage,
        totalCompetitors: competitors.length,
        cheaperThanAvg: product.price < avgCompetitorPrice,
        priceVsMarket: parseFloat(
          (((product.price - avgCompetitorPrice) / avgCompetitorPrice) * 100).toFixed(1)
        ),
      },
    };
  } catch (error) {
    logger.error("Error analyzing competitors", {
      error,
      productId: product.id,
    });
    return {
      productId: product.id,
      productTitle: product.title,
      competitors: [],
      error: "Analysis failed",
    };
  }
}
