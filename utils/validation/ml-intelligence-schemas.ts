/**
 * Mercado Livre Intelligence API - Zod Schemas
 * 
 * Validation schemas for ML Intelligence APIs:
 * - Price Suggestions (competitor analysis, optimal pricing)
 * - Price Automation (dynamic pricing rules)
 * - Price History (automation events timeline)
 * - Trends (weekly trending products)
 * - Visits (item visit metrics)
 * - Performance/Quality (item health score 0-100)
 * - Reputation (seller metrics and ratings)
 * 
 * Based on official ML API docs:
 * https://developers.mercadolivre.com.br/pt_br/
 */

import { z } from 'zod';

// ============================================================================
// PRICE SUGGESTIONS API
// https://developers.mercadolivre.com.br/pt_br/referencias-de-precos
// ============================================================================

/**
 * Price suggestion status from ML API
 */
export const MLPriceSuggestionStatusSchema = z.enum([
  'with_benchmark_highest',    // Preço acima do benchmark
  'with_benchmark_high',        // Preço alto comparado ao benchmark
  'with_benchmark_ok',          // Preço OK comparado ao benchmark
  'with_benchmark_low',         // Preço baixo comparado ao benchmark
  'no_benchmark_ok',            // Sem benchmark mas preço OK
  'no_benchmark_low',           // Sem benchmark e preço baixo
]);

/**
 * Costs breakdown (selling fees + shipping)
 */
export const MLPriceCostsSchema = z.object({
  selling_fees: z.number().optional(),      // Taxa de venda ML
  shipping_fees: z.number().optional(),     // Custo de envio
});

/**
 * Competitor data point in graph
 */
export const MLCompetitorDataPointSchema = z.object({
  price: z.number(),
  quantity: z.number(),
});

/**
 * Price suggestion metadata (competitor graph)
 */
export const MLPriceSuggestionMetadataSchema = z.object({
  competitor_graph: z.array(MLCompetitorDataPointSchema).optional(),
});

/**
 * Main price suggestion response
 * Endpoint: GET /suggestions/items/{id}/details
 */
export const MLPriceSuggestionSchema = z.object({
  item_id: z.string(),
  current_price: z.number().optional(),
  suggested_price: z.number().optional(),
  lowest_price: z.number().optional(),
  status: MLPriceSuggestionStatusSchema,
  costs: MLPriceCostsSchema.optional(),
  metadata: MLPriceSuggestionMetadataSchema.optional(),
  applicable_suggestion: z.boolean().optional(),
});

export type MLPriceSuggestion = z.infer<typeof MLPriceSuggestionSchema>;

// ============================================================================
// PRICE AUTOMATION API
// https://developers.mercadolivre.com.br/pt_br/automatizacoes-de-precos
// ============================================================================

/**
 * Automation rule types
 */
export const MLAutomationRuleTypeSchema = z.enum([
  'INT',      // Best price internal (only Mercado Livre)
  'INT_EXT',  // Best price internal + external (all channels)
]);

/**
 * Automation rule status
 */
export const MLAutomationStatusSchema = z.enum([
  'ACTIVE',
  'PAUSED',
]);

/**
 * Status detail with cause
 */
export const MLAutomationStatusDetailSchema = z.object({
  cause: z.string().optional(),
});

/**
 * Price automation rule
 * Endpoint: GET /pricing-automation/items/{id}/rules
 */
export const MLAutomationRuleSchema = z.object({
  item_id: z.string(),
  rule_type: MLAutomationRuleTypeSchema,
  min_price: z.number(),
  max_price: z.number(),
  status: MLAutomationStatusSchema,
  status_detail: MLAutomationStatusDetailSchema.optional(),
});

export type MLAutomationRule = z.infer<typeof MLAutomationRuleSchema>;

/**
 * Automation rules list response
 */
export const MLAutomationRulesResponseSchema = z.object({
  rules: z.array(MLAutomationRuleSchema),
});

export type MLAutomationRulesResponse = z.infer<typeof MLAutomationRulesResponseSchema>;

/**
 * Price history event types
 */
export const MLPriceEventTypeSchema = z.enum([
  'PRICE_CHANGE',
  'AUTOMATION_ACTIVATED',
  'AUTOMATION_PAUSED',
  'MANUAL_CHANGE',
]);

/**
 * Price history event
 * Endpoint: GET /pricing-automation/items/{id}/price/history
 */
export const MLPriceHistoryEventSchema = z.object({
  date_time: z.string(), // ISO 8601 datetime
  price: z.number(),
  event: MLPriceEventTypeSchema,
  strategy_type: MLAutomationRuleTypeSchema.optional(),
});

export type MLPriceHistoryEvent = z.infer<typeof MLPriceHistoryEventSchema>;

/**
 * Price history response
 */
export const MLPriceHistoryResponseSchema = z.object({
  item_id: z.string(),
  events: z.array(MLPriceHistoryEventSchema),
});

export type MLPriceHistoryResponse = z.infer<typeof MLPriceHistoryResponseSchema>;

// ============================================================================
// TRENDS API
// https://developers.mercadolivre.com.br/pt_br/tendencias
// ============================================================================

/**
 * Trending product
 * Endpoint: GET /trends/{SITE_ID} or /trends/{SITE_ID}/{CATEGORY_ID}
 */
export const MLTrendSchema = z.object({
  keyword: z.string(),                    // Trending search term
  url: z.string(),                        // URL to search results with #trend
});

export type MLTrend = z.infer<typeof MLTrendSchema>;

/**
 * Trends response (returns 50 products)
 * - 10 highest growth
 * - 20 most desired
 * - 20 most popular
 */
export const MLTrendsResponseSchema = z.array(MLTrendSchema);

export type MLTrendsResponse = z.infer<typeof MLTrendsResponseSchema>;

// ============================================================================
// VISITS API
// https://developers.mercadolivre.com.br/pt_br/recurso-visits
// ============================================================================

/**
 * Visit detail by site/company
 */
export const MLVisitDetailSchema = z.object({
  site_id: z.string().optional(),         // MLB, MLA, etc
  company_id: z.string().optional(),      // Company identifier
  visits: z.number(),
});

export type MLVisitDetail = z.infer<typeof MLVisitDetailSchema>;

/**
 * Visit result for time interval
 */
export const MLVisitResultSchema = z.object({
  date: z.string(),                       // YYYY-MM-DD
  total: z.number(),
});

export type MLVisitResult = z.infer<typeof MLVisitResultSchema>;

/**
 * Item visits response
 * Endpoint: GET /items/{item_id}/visits/time_window
 */
export const MLVisitsSchema = z.object({
  item_id: z.string(),
  total_visits: z.number(),
  visits_detail: z.array(MLVisitDetailSchema).optional(),
  results: z.array(MLVisitResultSchema).optional(),
});

export type MLVisits = z.infer<typeof MLVisitsSchema>;

// ============================================================================
// PERFORMANCE/QUALITY API (replaces deprecated /health)
// https://developers.mercadolivre.com.br/pt_br/qualidade-das-publicacoes
// ============================================================================

/**
 * Performance level
 */
export const MLPerformanceLevelSchema = z.enum([
  'Básica',           // MLB
  'Satisfatória',     // MLB
  'Profissional',     // MLB
  'Básica',           // MLA (duplicate intentional - depends on site)
  'Estándar',         // MLA
  'Profesional',      // MLA
]);

/**
 * Bucket status
 */
export const MLBucketStatusSchema = z.enum([
  'PENDING',
  'COMPLETED',
]);

/**
 * Rule mode
 */
export const MLRuleModeSchema = z.enum([
  'OPPORTUNITY',    // Improvement opportunity
  'WARNING',        // Warning/issue
]);

/**
 * Rule wording (actionable suggestions)
 */
export const MLRuleWordingSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  link: z.string().optional(),       // URL to fix the issue
});

/**
 * Performance rule
 */
export const MLPerformanceRuleSchema = z.object({
  status: MLBucketStatusSchema,
  progress: z.number().min(0).max(1).optional(), // 0-1 progress
  mode: MLRuleModeSchema.optional(),
  wordings: MLRuleWordingSchema.optional(),
});

/**
 * Performance variable with rules
 */
export const MLPerformanceVariableSchema = z.object({
  key: z.string(),
  rules: z.array(MLPerformanceRuleSchema).optional(),
});

/**
 * Performance bucket (category of improvements)
 */
export const MLPerformanceBucketSchema = z.object({
  key: z.string(),
  status: MLBucketStatusSchema,
  variables: z.array(MLPerformanceVariableSchema).optional(),
});

/**
 * Item performance/quality score
 * Endpoint: GET /item/{ITEM_ID}/performance
 */
export const MLPerformanceSchema = z.object({
  item_id: z.string(),
  score: z.number().min(0).max(100),      // 0-100 quality score
  level: MLPerformanceLevelSchema,
  calculated_at: z.string(),              // ISO 8601 datetime
  buckets: z.array(MLPerformanceBucketSchema).optional(),
});

export type MLPerformance = z.infer<typeof MLPerformanceSchema>;

// ============================================================================
// REPUTATION API
// https://developers.mercadolivre.com.br/pt_br/reputacao-de-vendedores
// ============================================================================

/**
 * Power seller status
 */
export const MLPowerSellerStatusSchema = z.enum([
  'silver',
  'gold',
  'platinum',
]);

/**
 * Reputation level ID
 */
export const MLReputationLevelSchema = z.enum([
  '1_red',
  '2_orange',
  '3_yellow',
  '4_light_green',
  '5_green',
]);

/**
 * Transaction metrics
 */
export const MLTransactionsSchema = z.object({
  canceled: z.number().optional(),
  completed: z.number().optional(),
  period: z.string().optional(),          // e.g., "60 days", "365 days"
  total: z.number().optional(),
  ratings: z.object({
    negative: z.number().optional(),
    neutral: z.number().optional(),
    positive: z.number().optional(),
  }).optional(),
});

/**
 * Quality metric (claims, delays, cancellations)
 */
export const MLQualityMetricSchema = z.object({
  rate: z.number().optional(),            // Percentage rate
  value: z.number().optional(),           // Absolute value
  excluded: z.object({
    real_value: z.number().optional(),
    real_rate: z.number().optional(),
  }).optional(),
});

/**
 * Sales metrics
 */
export const MLSalesMetricsSchema = z.object({
  period: z.string().optional(),
  completed: z.number().optional(),
});

/**
 * Seller reputation (from /users/{USER_ID} response)
 * Field: seller_reputation
 */
export const MLReputationSchema = z.object({
  user_id: z.number(),
  level_id: MLReputationLevelSchema.optional(),
  power_seller_status: MLPowerSellerStatusSchema.optional().nullable(),
  transactions: MLTransactionsSchema.optional(),
  sales: MLSalesMetricsSchema.optional(),
  
  // Quality metrics
  claims: MLQualityMetricSchema.optional(),
  delayed_handling_time: MLQualityMetricSchema.optional(),
  cancellations: MLQualityMetricSchema.optional(),
});

export type MLReputation = z.infer<typeof MLReputationSchema>;

// ============================================================================
// CATALOG COMPETITORS API
// https://developers.mercadolivre.com.br/pt_br/catalogo-de-produtos
// ============================================================================

/**
 * Catalog competitors response
 * Endpoint: GET /products/{PRODUCT_ID}/items_ids
 * Returns array of item IDs competing for same product
 */
export const MLCatalogCompetitorsResponseSchema = z.array(z.string());

export type MLCatalogCompetitorsResponse = z.infer<typeof MLCatalogCompetitorsResponseSchema>;

// ============================================================================
// EXPORT ALL SCHEMAS
// ============================================================================

export const MLIntelligenceSchemas = {
  // Price Intelligence
  MLPriceSuggestionSchema,
  MLAutomationRuleSchema,
  MLAutomationRulesResponseSchema,
  MLPriceHistoryEventSchema,
  MLPriceHistoryResponseSchema,
  
  // Market Intelligence
  MLTrendSchema,
  MLTrendsResponseSchema,
  MLCatalogCompetitorsResponseSchema,
  
  // Performance Intelligence
  MLVisitsSchema,
  MLPerformanceSchema,
  MLReputationSchema,
};
