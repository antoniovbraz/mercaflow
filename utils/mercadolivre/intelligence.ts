/**
 * Mercado Livre Intelligence API
 * 
 * High-level intelligence features for ML integration:
 * - Price Intelligence: Suggestions, automation rules, history
 * - Market Intelligence: Trends, catalog competitors
 * - Performance Intelligence: Visits, quality score, seller reputation
 * 
 * Features:
 * - Automatic token refresh via MLTokenManager
 * - Response validation with Zod schemas
 * - Redis caching with appropriate TTLs
 * - Structured logging for debugging
 * - Robust error handling
 * 
 * @see docs/05-integracoes/mercado-livre.md
 * @see ML_API_COMPLETA_ANALISE.md
 */

import { logger } from '@/utils/logger';
import { getMLApiClient } from './api/MLApiClient';
import { MLTokenManager } from './token-manager';
import { getCached, invalidateCacheKey } from '@/utils/redis/cache';
import { validateOutput } from '@/utils/validation';
import {
  MLPriceSuggestionSchema,
  MLAutomationRulesResponseSchema,
  MLPriceHistoryResponseSchema,
  MLTrendsResponseSchema,
  MLVisitsSchema,
  MLPerformanceSchema,
  MLReputationSchema,
  MLCatalogCompetitorsResponseSchema,
  type MLPriceSuggestion,
  type MLAutomationRule,
  type MLAutomationRulesResponse,
  type MLPriceHistoryEvent,
  type MLPriceHistoryResponse,
  type MLTrend,
  type MLTrendsResponse,
  type MLVisits,
  type MLPerformance,
  type MLReputation,
  type MLCatalogCompetitorsResponse,
} from '@/utils/validation/ml-intelligence-schemas';

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Cache TTL values for intelligence features (in seconds)
 */
export const IntelligenceCacheTTL = {
  PRICE_SUGGESTIONS: 1800,    // 30min - Price data changes frequently
  PRICE_AUTOMATION: 3600,     // 1h - Rules are relatively static
  PRICE_HISTORY: 7200,        // 2h - Historical data changes slowly
  TRENDS: 21600,              // 6h - Trends are weekly updates
  VISITS: 1800,               // 30min - Visit metrics update frequently
  PERFORMANCE: 3600,          // 1h - Quality score changes moderately
  REPUTATION: 7200,           // 2h - Reputation changes slowly
  CATALOG_COMPETITORS: 3600,  // 1h - Competitor list is semi-static
} as const;

// ============================================================================
// TYPES
// ============================================================================

/**
 * Parameters for setting price automation
 */
export interface SetPriceAutomationParams {
  item_id: string;
  rule_type: 'INT' | 'INT_EXT';
  min_price: number;
  max_price: number;
}

/**
 * Parameters for getting item visits
 */
export interface GetVisitsParams {
  item_id: string;
  date_from?: string;  // YYYY-MM-DD format
  date_to?: string;    // YYYY-MM-DD format
  last?: number;       // Last N days
  unit?: 'day';        // Time unit
}

// ============================================================================
// CLASS
// ============================================================================

/**
 * MLIntelligenceAPI - High-level intelligence features for ML integration
 * 
 * Provides access to ML's intelligence APIs with automatic token management,
 * caching, and validation.
 * 
 * @example
 * ```ts
 * const intelligence = new MLIntelligenceAPI(integrationId);
 * 
 * // Get price suggestions
 * const suggestions = await intelligence.getPriceSuggestions('MLB123456789');
 * 
 * // Get trending products
 * const trends = await intelligence.getTrends('MLB', 'MLB1234');
 * 
 * // Get item performance score
 * const performance = await intelligence.getItemPerformance('MLB123456789');
 * ```
 */
export class MLIntelligenceAPI {
  private readonly apiClient = getMLApiClient();
  private readonly tokenManager: MLTokenManager;
  private integrationId: string;

  constructor(integrationId: string) {
    this.integrationId = integrationId;
    this.tokenManager = new MLTokenManager();
  }

  // ==========================================================================
  // PRICE INTELLIGENCE (4 methods)
  // ==========================================================================

  /**
   * Get price suggestions with competitor analysis
   * 
   * Endpoint: GET /suggestions/items/{id}/details
   * 
   * Returns ML's recommended optimal price based on:
   * - Competition analysis (competitor price distribution)
   * - Item's current price status (too high/low/ok)
   * - Cost breakdown (selling fees + shipping)
   * - Historical performance data
   * 
   * @param itemId - ML item ID (e.g., "MLB123456789")
   * @returns Price suggestion data with competitor graph
   * 
   * @example
   * ```ts
   * const suggestion = await intelligence.getPriceSuggestions('MLB123456789');
   * console.log(`Suggested price: R$ ${suggestion.suggested_price}`);
   * console.log(`Status: ${suggestion.status}`);
   * ```
   */
  async getPriceSuggestions(itemId: string): Promise<MLPriceSuggestion> {
    const context = { 
      integrationId: this.integrationId, 
      itemId,
      method: 'getPriceSuggestions' 
    };
    
    logger.info('Fetching price suggestions', context);

    const cacheKey = `ml:price-suggestions:${itemId}`;
    
    const result = await getCached<MLPriceSuggestion>(
      cacheKey,
      async () => {
        // Get valid access token (auto-refreshes if needed)
        const accessToken = await this.tokenManager.getValidToken(this.integrationId);
        if (!accessToken) {
          throw new Error('No valid access token available');
        }

        // Fetch from ML API
        const response = await this.apiClient.request<MLPriceSuggestion>(
          `/suggestions/items/${itemId}/details`,
          { 
            method: 'GET',
            accessToken,
          }
        );

        // Validate response with Zod schema
        return validateOutput(MLPriceSuggestionSchema, response.data);
      },
      { ttl: IntelligenceCacheTTL.PRICE_SUGGESTIONS }
    );

    logger.info('Price suggestions fetched successfully', {
      ...context,
      suggested_price: result.suggested_price,
      status: result.status,
    });

    return result;
  }

  /**
   * Get price automation rules for an item
   * 
   * Endpoint: GET /pricing-automation/items/{id}/rules
   * 
   * Returns active automation rules that control dynamic pricing:
   * - INT: Internal competition (same seller's items)
   * - INT_EXT: Internal + External competition (all marketplace)
   * 
   * @param itemId - ML item ID
   * @returns Array of automation rules
   * 
   * @example
   * ```ts
   * const rules = await intelligence.getPriceAutomationRules('MLB123456789');
   * rules.forEach(rule => {
   *   console.log(`Rule: ${rule.type} - Min: ${rule.min_price} Max: ${rule.max_price}`);
   * });
   * ```
   */
  async getPriceAutomationRules(itemId: string): Promise<MLAutomationRule[]> {
    const context = {
      integrationId: this.integrationId,
      itemId,
      method: 'getPriceAutomationRules',
    };

    logger.info('Fetching price automation rules', context);

    const cacheKey = `ml:price-automation:${itemId}`;

    const result = await getCached<MLAutomationRule[]>(
      cacheKey,
      async () => {
        const accessToken = await this.tokenManager.getValidToken(this.integrationId);
        if (!accessToken) {
          throw new Error('No valid access token available');
        }

        const response = await this.apiClient.request<MLAutomationRulesResponse>(
          `/pricing-automation/items/${itemId}/rules`,
          {
            method: 'GET',
            accessToken,
          }
        );

        // Validate response and extract rules array
        const validated = validateOutput(MLAutomationRulesResponseSchema, response.data);
        return validated.rules || [];
      },
      { ttl: IntelligenceCacheTTL.PRICE_AUTOMATION }
    );

    logger.info('Price automation rules fetched successfully', {
      ...context,
      rulesCount: result.length,
    });

    return result;
  }

  /**
   * Get price change history for an item
   * 
   * Endpoint: GET /pricing-automation/items/{id}/price/history?days={days}
   * 
   * Returns timeline of price changes including:
   * - Manual price updates by seller
   * - Automatic price adjustments by automation rules
   * - Timestamps and reasons for each change
   * 
   * @param itemId - ML item ID
   * @param days - Number of days to look back (default: 30, max: 365)
   * @returns Array of price history events
   * 
   * @example
   * ```ts
   * // Get last 90 days of price changes
   * const history = await intelligence.getPriceHistory('MLB123456789', 90);
   * history.forEach(event => {
   *   console.log(`${event.date}: ${event.old_price} -> ${event.new_price}`);
   * });
   * ```
   */
  async getPriceHistory(itemId: string, days: number = 30): Promise<MLPriceHistoryEvent[]> {
    const context = {
      integrationId: this.integrationId,
      itemId,
      days,
      method: 'getPriceHistory',
    };

    logger.info('Fetching price history', context);

    const cacheKey = `ml:price-history:${itemId}:${days}`;

    const result = await getCached<MLPriceHistoryEvent[]>(
      cacheKey,
      async () => {
        const accessToken = await this.tokenManager.getValidToken(this.integrationId);
        if (!accessToken) {
          throw new Error('No valid access token available');
        }

        const response = await this.apiClient.request<MLPriceHistoryResponse>(
          `/pricing-automation/items/${itemId}/price/history?days=${days}`,
          {
            method: 'GET',
            accessToken,
          }
        );

        // Validate response and extract events array
        const validated = validateOutput(MLPriceHistoryResponseSchema, response.data);
        return validated.events || [];
      },
      { ttl: IntelligenceCacheTTL.PRICE_HISTORY }
    );

    logger.info('Price history fetched successfully', {
      ...context,
      eventsCount: result.length,
    });

    return result;
  }

  /**
   * Set price automation rule for an item
   * 
   * Endpoint: POST /pricing-automation/items/{id}/automation
   * 
   * Enables dynamic pricing with automatic adjustments based on competition.
   * ML will automatically adjust prices within min/max range to stay competitive.
   * 
   * Rule types:
   * - INT: Match prices against seller's own items
   * - INT_EXT: Match prices against all marketplace competition
   * 
   * @param params - Automation configuration
   * @returns void (throws on error)
   * 
   * @example
   * ```ts
   * await intelligence.setPriceAutomation({
   *   item_id: 'MLB123456789',
   *   rule_type: 'INT_EXT',
   *   min_price: 50.00,
   *   max_price: 100.00,
   * });
   * ```
   */
  async setPriceAutomation(params: SetPriceAutomationParams): Promise<void> {
    const context = {
      integrationId: this.integrationId,
      itemId: params.item_id,
      ruleType: params.rule_type,
      method: 'setPriceAutomation',
    };

    logger.info('Setting price automation', context);

    const accessToken = await this.tokenManager.getValidToken(this.integrationId);
    if (!accessToken) {
      throw new Error('No valid access token available');
    }

    await this.apiClient.request(
      `/pricing-automation/items/${params.item_id}/automation`,
      {
        method: 'POST',
        accessToken,
        body: {
          rule_type: params.rule_type,
          min_price: params.min_price,
          max_price: params.max_price,
        },
      }
    );

    // Invalidate related caches after update
    await invalidateCacheKey(`ml:price-automation:${params.item_id}`);
    await invalidateCacheKey(`ml:price-suggestions:${params.item_id}`);

    logger.info('Price automation set successfully', {
      ...context,
      minPrice: params.min_price,
      maxPrice: params.max_price,
    });
  }

  // ==========================================================================
  // MARKET INTELLIGENCE (2 methods)
  // ==========================================================================

  /**
   * Get trending products in marketplace
   * 
   * Endpoint: GET /trends/{SITE_ID} or GET /trends/{SITE_ID}/{CATEGORY_ID}
   * 
   * Returns 50 trending products updated weekly:
   * - 10 growth products (fastest growing searches)
   * - 20 desired products (most wished for)
   * - 20 popular products (most visited)
   * 
   * @param siteId - ML site ID (default: 'MLB' for Brazil)
   * @param categoryId - Optional category filter (e.g., 'MLB1234')
   * @returns Array of trending products with keyword and URL
   * 
   * @example
   * ```ts
   * // Get all Brazil trends
   * const trends = await intelligence.getTrends('MLB');
   * 
   * // Get trends for specific category
   * const categoryTrends = await intelligence.getTrends('MLB', 'MLB1234');
   * ```
   */
  async getTrends(siteId: string = 'MLB', categoryId?: string): Promise<MLTrend[]> {
    const context = {
      integrationId: this.integrationId,
      siteId,
      categoryId,
      method: 'getTrends',
    };

    logger.info('Fetching marketplace trends', context);

    const endpoint = categoryId 
      ? `/trends/${siteId}/${categoryId}`
      : `/trends/${siteId}`;
    
    const cacheKey = categoryId
      ? `ml:trends:${siteId}:${categoryId}`
      : `ml:trends:${siteId}`;

    const result = await getCached<MLTrend[]>(
      cacheKey,
      async () => {
        const accessToken = await this.tokenManager.getValidToken(this.integrationId);
        if (!accessToken) {
          throw new Error('No valid access token available');
        }

        const response = await this.apiClient.request<MLTrendsResponse>(
          endpoint,
          {
            method: 'GET',
            accessToken,
          }
        );

        // Validate response (returns array directly)
        return validateOutput(MLTrendsResponseSchema, response.data);
      },
      { ttl: IntelligenceCacheTTL.TRENDS }
    );

    logger.info('Trends fetched successfully', {
      ...context,
      trendsCount: result.length,
    });

    return result;
  }

  /**
   * Get competing items for same catalog product
   * 
   * Endpoint: GET /products/{PRODUCT_ID}/items_ids
   * 
   * Returns all item IDs that are linked to the same catalog product.
   * Useful for analyzing direct competition on identical products.
   * 
   * @param productId - ML catalog product ID (e.g., "MLB123456")
   * @returns Array of competing item IDs
   * 
   * @example
   * ```ts
   * const competitors = await intelligence.getCatalogCompetitors('MLB123456');
   * console.log(`Found ${competitors.length} competing items`);
   * ```
   */
  async getCatalogCompetitors(productId: string): Promise<string[]> {
    const context = {
      integrationId: this.integrationId,
      productId,
      method: 'getCatalogCompetitors',
    };

    logger.info('Fetching catalog competitors', context);

    const cacheKey = `ml:catalog-competitors:${productId}`;

    const result = await getCached<string[]>(
      cacheKey,
      async () => {
        const accessToken = await this.tokenManager.getValidToken(this.integrationId);
        if (!accessToken) {
          throw new Error('No valid access token available');
        }

        const response = await this.apiClient.request<MLCatalogCompetitorsResponse>(
          `/products/${productId}/items_ids`,
          {
            method: 'GET',
            accessToken,
          }
        );

        // Validate response (returns array directly)
        return validateOutput(MLCatalogCompetitorsResponseSchema, response.data);
      },
      { ttl: IntelligenceCacheTTL.CATALOG_COMPETITORS }
    );

    logger.info('Catalog competitors fetched successfully', {
      ...context,
      competitorsCount: result.length,
    });

    return result;
  }

  // ==========================================================================
  // PERFORMANCE INTELLIGENCE (3 methods)
  // ==========================================================================

  /**
   * Get item visit metrics
   * 
   * Endpoint: GET /items/{item_id}/visits/time_window
   * 
   * Returns detailed visit statistics for an item:
   * - Total visits in time window
   * - Daily breakdown of visits
   * - Historical data up to 150 days
   * 
   * @param params - Query parameters (item_id + date range or last N days)
   * @returns Visit metrics with daily breakdown
   * 
   * @example
   * ```ts
   * // Get last 30 days of visits
   * const visits = await intelligence.getItemVisits({
   *   item_id: 'MLB123456789',
   *   last: 30,
   *   unit: 'day',
   * });
   * 
   * // Get visits for specific date range
   * const rangeVisits = await intelligence.getItemVisits({
   *   item_id: 'MLB123456789',
   *   date_from: '2025-01-01',
   *   date_to: '2025-01-31',
   * });
   * ```
   */
  async getItemVisits(params: GetVisitsParams): Promise<MLVisits> {
    const context = {
      integrationId: this.integrationId,
      itemId: params.item_id,
      dateFrom: params.date_from,
      dateTo: params.date_to,
      last: params.last,
      method: 'getItemVisits',
    };

    logger.info('Fetching item visit metrics', context);

    // Build query string
    const queryParams = new URLSearchParams();
    if (params.date_from) queryParams.append('date_from', params.date_from);
    if (params.date_to) queryParams.append('date_to', params.date_to);
    if (params.last) queryParams.append('last', params.last.toString());
    if (params.unit) queryParams.append('unit', params.unit);

    const queryString = queryParams.toString();
    const endpoint = `/items/${params.item_id}/visits/time_window${queryString ? `?${queryString}` : ''}`;
    
    // Cache key includes query params for uniqueness
    const cacheKey = `ml:visits:${params.item_id}:${queryString || 'default'}`;

    const result = await getCached<MLVisits>(
      cacheKey,
      async () => {
        const accessToken = await this.tokenManager.getValidToken(this.integrationId);
        if (!accessToken) {
          throw new Error('No valid access token available');
        }

        const response = await this.apiClient.request<MLVisits>(
          endpoint,
          {
            method: 'GET',
            accessToken,
          }
        );

        // Validate response
        return validateOutput(MLVisitsSchema, response.data);
      },
      { ttl: IntelligenceCacheTTL.VISITS }
    );

    logger.info('Item visits fetched successfully', {
      ...context,
      totalVisits: result.total_visits,
      resultsCount: result.results?.length || 0,
    });

    return result;
  }

  /**
   * Get item performance/quality score
   * 
   * Endpoint: GET /item/{ITEM_ID}/performance
   * 
   * Returns ML's quality assessment of an item listing:
   * - Overall score (0-100)
   * - Performance level (Básica, Satisfatória, Profissional)
   * - Improvement suggestions grouped by buckets
   * - Specific actions to improve quality
   * 
   * @param itemId - ML item ID
   * @returns Performance score and improvement buckets
   * 
   * @example
   * ```ts
   * const performance = await intelligence.getItemPerformance('MLB123456789');
   * console.log(`Score: ${performance.score}/100`);
   * console.log(`Level: ${performance.level}`);
   * performance.buckets.forEach(bucket => {
   *   console.log(`${bucket.name}: ${bucket.suggestions.length} suggestions`);
   * });
   * ```
   */
  async getItemPerformance(itemId: string): Promise<MLPerformance> {
    const context = {
      integrationId: this.integrationId,
      itemId,
      method: 'getItemPerformance',
    };

    logger.info('Fetching item performance score', context);

    const cacheKey = `ml:performance:${itemId}`;

    const result = await getCached<MLPerformance>(
      cacheKey,
      async () => {
        const accessToken = await this.tokenManager.getValidToken(this.integrationId);
        if (!accessToken) {
          throw new Error('No valid access token available');
        }

        const response = await this.apiClient.request<MLPerformance>(
          `/item/${itemId}/performance`,
          {
            method: 'GET',
            accessToken,
          }
        );

        // Validate response
        return validateOutput(MLPerformanceSchema, response.data);
      },
      { ttl: IntelligenceCacheTTL.PERFORMANCE }
    );

    logger.info('Item performance fetched successfully', {
      ...context,
      score: result.score,
      level: result.level,
      bucketsCount: result.buckets?.length || 0,
    });

    return result;
  }

  /**
   * Get seller reputation metrics
   * 
   * Endpoint: GET /users/{USER_ID}
   * 
   * Returns comprehensive seller reputation data:
   * - Reputation level (1-5 stars + color)
   * - Power Seller status
   * - Transaction metrics (completed, canceled)
   * - Quality metrics (claims, delays, cancellations)
   * - Historical sales data
   * 
   * Note: This endpoint returns full user data; we extract the seller_reputation field.
   * 
   * @param userId - ML user ID (numeric)
   * @returns Seller reputation metrics
   * 
   * @example
   * ```ts
   * const reputation = await intelligence.getSellerReputation(123456789);
   * console.log(`Level: ${reputation.level_id}`);
   * console.log(`Power Seller: ${reputation.power_seller_status}`);
   * console.log(`Completed transactions: ${reputation.transactions?.completed}`);
   * ```
   */
  async getSellerReputation(userId: number): Promise<MLReputation> {
    const context = {
      integrationId: this.integrationId,
      userId,
      method: 'getSellerReputation',
    };

    logger.info('Fetching seller reputation', context);

    const cacheKey = `ml:reputation:${userId}`;

    const result = await getCached<MLReputation>(
      cacheKey,
      async () => {
        const accessToken = await this.tokenManager.getValidToken(this.integrationId);
        if (!accessToken) {
          throw new Error('No valid access token available');
        }

        const response = await this.apiClient.request<{ seller_reputation: MLReputation }>(
          `/users/${userId}`,
          {
            method: 'GET',
            accessToken,
          }
        );

        // Extract seller_reputation field and validate
        if (!response.data?.seller_reputation) {
          throw new Error('seller_reputation field not found in user response');
        }

        // Validate the extracted reputation data
        return validateOutput(MLReputationSchema, {
          ...response.data.seller_reputation,
          user_id: userId, // Ensure user_id is included
        });
      },
      { ttl: IntelligenceCacheTTL.REPUTATION }
    );

    logger.info('Seller reputation fetched successfully', {
      ...context,
      levelId: result.level_id,
      powerSellerStatus: result.power_seller_status,
    });

    return result;
  }
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

/**
 * Factory function to create MLIntelligenceAPI instance
 * 
 * Provides a consistent way to instantiate the API client.
 * 
 * @param integrationId - ML integration ID from database
 * @returns New MLIntelligenceAPI instance
 * 
 * @example
 * ```ts
 * const intelligence = getMLIntelligenceAPI(integrationId);
 * const suggestions = await intelligence.getPriceSuggestions(itemId);
 * ```
 */
export function getMLIntelligenceAPI(integrationId: string): MLIntelligenceAPI {
  return new MLIntelligenceAPI(integrationId);
}
