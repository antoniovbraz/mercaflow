/**
 * Zod Validation Schemas for Mercado Livre API
 * 
 * This file contains all validation schemas for ML API responses and requests.
 * Based on official ML API documentation: https://developers.mercadolivre.com.br/
 * 
 * @see https://developers.mercadolivre.com.br/pt_br/autenticacao-e-autorizacao
 * @see https://developers.mercadolivre.com.br/pt_br/itens-e-buscas
 * @see https://developers.mercadolivre.com.br/pt_br/pedidos-e-opinioes
 * @see https://developers.mercadolivre.com.br/pt_br/perguntas-e-respostas
 */

import { z } from 'zod';

// ============================================================================
// AUTHENTICATION & OAUTH 2.0 SCHEMAS
// ============================================================================

/**
 * OAuth 2.0 Token Response from ML
 * Returned when exchanging code for tokens
 */
export const MLTokenResponseSchema = z.object({
  access_token: z.string().min(1, 'Access token cannot be empty'),
  token_type: z.literal('bearer'),
  expires_in: z.number().int().positive('Expires in must be positive'),
  scope: z.string(),
  user_id: z.number().int().positive('User ID must be positive'),
  refresh_token: z.string().min(1, 'Refresh token cannot be empty'),
});

export type MLTokenResponse = z.infer<typeof MLTokenResponseSchema>;

/**
 * ML User Data Response
 * Returned from /users/me endpoint
 */
export const MLUserDataSchema = z.object({
  id: z.number().int().positive(),
  nickname: z.string().min(1),
  email: z.string().email().optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  country_id: z.string().length(2), // BR, AR, MX, etc.
  address: z.object({
    state: z.string().optional(),
    city: z.string().optional(),
  }).optional(),
  site_id: z.string().optional(), // MLB, MLA, MLM, etc.
  permalink: z.string().url().optional(),
  registration_date: z.string().datetime().optional(),
  seller_reputation: z.object({
    level_id: z.string().nullable().optional(),
    power_seller_status: z.string().nullable().optional(),
    transactions: z.object({
      canceled: z.number().optional(),
      completed: z.number().optional(),
      ratings: z.object({
        negative: z.number().optional(),
        neutral: z.number().optional(),
        positive: z.number().optional(),
      }).optional(),
    }).optional(),
  }).optional(),
});

export type MLUserData = z.infer<typeof MLUserDataSchema>;

// ============================================================================
// ITEMS/PRODUCTS SCHEMAS
// ============================================================================

/**
 * ML Item Picture
 */
export const MLPictureSchema = z.object({
  id: z.string().optional(),
  url: z.string().url().optional(),
  secure_url: z.string().url().optional(),
  size: z.string().optional(),
  max_size: z.string().optional(),
  quality: z.string().optional(),
  source: z.string().url().optional(), // Used in POST requests
});

/**
 * ML Item Attribute
 */
export const MLAttributeSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  value_id: z.string().nullable().optional(),
  value_name: z.string().nullable().optional(),
  value_struct: z.any().nullable().optional(),
  values: z.array(z.object({
    id: z.string().optional(),
    name: z.string().optional(),
    struct: z.any().nullable().optional(),
  })).optional(),
  attribute_group_id: z.string().optional(),
  attribute_group_name: z.string().optional(),
});

/**
 * ML Item Shipping
 */
export const MLShippingSchema = z.object({
  mode: z.enum(['not_specified', 'me1', 'me2', 'custom']).optional(),
  methods: z.array(z.any()).optional(),
  tags: z.array(z.string()).optional(),
  dimensions: z.string().nullable().optional(),
  local_pick_up: z.boolean().optional(),
  free_shipping: z.boolean().optional(),
  logistic_type: z.string().optional(),
  store_pick_up: z.boolean().optional(),
});

/**
 * ML Item Sale Terms
 */
export const MLSaleTermSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  value_id: z.string().nullable().optional(),
  value_name: z.string().nullable().optional(),
  value_struct: z.any().nullable().optional(),
  values: z.array(z.object({
    id: z.string().optional(),
    name: z.string().optional(),
    struct: z.any().nullable().optional(),
  })).optional(),
});

/**
 * ML Item Variation
 */
export const MLVariationSchema = z.object({
  id: z.number().optional(),
  price: z.number().optional(),
  attribute_combinations: z.array(z.object({
    id: z.string(),
    name: z.string().optional(),
    value_id: z.string().optional(),
    value_name: z.string().optional(),
  })).optional(),
  available_quantity: z.number().int().nonnegative().optional(),
  sold_quantity: z.number().int().nonnegative().optional(),
  picture_ids: z.array(z.string()).optional(),
});

/**
 * Complete ML Item Schema
 * Covers all fields from GET /items/{id}
 */
export const MLItemSchema = z.object({
  id: z.string(),
  site_id: z.string(), // MLB, MLA, MLM, etc.
  title: z.string().min(1).max(200),
  subtitle: z.string().nullable().optional(),
  seller_id: z.number().int().positive(),
  category_id: z.string(),
  official_store_id: z.number().nullable().optional(),
  price: z.number().positive(),
  base_price: z.number().optional(),
  original_price: z.number().nullable().optional(),
  currency_id: z.string(), // BRL, ARS, MXN, etc.
  initial_quantity: z.number().int().nonnegative(),
  available_quantity: z.number().int().nonnegative(),
  sold_quantity: z.number().int().nonnegative().optional(),
  sale_terms: z.array(MLSaleTermSchema).optional(),
  buying_mode: z.enum(['buy_it_now', 'auction', 'classified']),
  listing_type_id: z.string(), // gold_special, gold_pro, free, etc.
  start_time: z.string().datetime().optional(),
  stop_time: z.string().datetime().optional(),
  condition: z.enum(['new', 'used', 'not_specified']),
  permalink: z.string().url().optional(),
  thumbnail: z.string().url().optional(),
  thumbnail_id: z.string().optional(),
  pictures: z.array(MLPictureSchema).optional(),
  video_id: z.string().nullable().optional(),
  descriptions: z.array(z.any()).optional(),
  accepts_mercadopago: z.boolean().optional(),
  non_mercado_pago_payment_methods: z.array(z.any()).optional(),
  shipping: MLShippingSchema.optional(),
  international_delivery_mode: z.string().optional(),
  seller_address: z.object({
    city: z.object({
      id: z.string().optional(),
      name: z.string().optional(),
    }).optional(),
    state: z.object({
      id: z.string().optional(),
      name: z.string().optional(),
    }).optional(),
    country: z.object({
      id: z.string().optional(),
      name: z.string().optional(),
    }).optional(),
    search_location: z.object({
      neighborhood: z.object({
        id: z.string().optional(),
        name: z.string().optional(),
      }).optional(),
      city: z.object({
        id: z.string().optional(),
        name: z.string().optional(),
      }).optional(),
      state: z.object({
        id: z.string().optional(),
        name: z.string().optional(),
      }).optional(),
    }).optional(),
  }).optional(),
  seller_contact: z.any().nullable().optional(),
  location: z.any().optional(),
  coverage_areas: z.array(z.any()).optional(),
  attributes: z.array(MLAttributeSchema).optional(),
  variations: z.array(MLVariationSchema).optional(),
  status: z.enum(['active', 'paused', 'closed', 'under_review', 'inactive']),
  sub_status: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  warranty: z.string().nullable().optional(),
  catalog_product_id: z.string().nullable().optional(),
  domain_id: z.string().optional(),
  parent_item_id: z.string().nullable().optional(),
  differential_pricing: z.any().nullable().optional(),
  deal_ids: z.array(z.string()).optional(),
  automatic_relist: z.boolean().optional(),
  date_created: z.string().datetime().optional(),
  last_updated: z.string().datetime().optional(),
  health: z.number().nullable().optional(),
  catalog_listing: z.boolean().optional(),
});

export type MLItem = z.infer<typeof MLItemSchema>;

/**
 * Create Item Request Schema
 * For POST /items
 */
export const CreateMLItemSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be max 200 characters'),
  category_id: z.string().regex(/^ML[A-Z]\d+$/, 'Invalid category ID format'),
  price: z.number().positive('Price must be positive').max(999999999, 'Price too large'),
  currency_id: z.string().default('BRL'),
  available_quantity: z.number().int().nonnegative('Quantity cannot be negative'),
  buying_mode: z.enum(['buy_it_now', 'auction']),
  condition: z.enum(['new', 'used', 'not_specified']),
  listing_type_id: z.string().min(1, 'Listing type is required'),
  description: z.string().optional(),
  video_id: z.string().optional(),
  warranty: z.string().optional(),
  pictures: z.array(MLPictureSchema).max(12, 'Maximum 12 pictures allowed').optional(),
  attributes: z.array(MLAttributeSchema).optional(),
  variations: z.array(MLVariationSchema).optional(),
  sale_terms: z.array(MLSaleTermSchema).optional(),
  shipping: MLShippingSchema.optional(),
});

export type CreateMLItem = z.infer<typeof CreateMLItemSchema>;

/**
 * Update Item Request Schema
 * For PUT /items/{id}
 */
export const UpdateMLItemSchema = CreateMLItemSchema.partial().extend({
  status: z.enum(['active', 'paused', 'closed']).optional(),
  sold_quantity: z.number().int().nonnegative().optional(),
});

export type UpdateMLItem = z.infer<typeof UpdateMLItemSchema>;

/**
 * Items Search Response Schema
 * For GET /users/{user_id}/items/search
 */
export const MLItemsSearchResponseSchema = z.object({
  seller_id: z.string().or(z.number()).optional(),
  query: z.string().nullable().optional(),
  paging: z.object({
    total: z.number().int().nonnegative(),
    offset: z.number().int().nonnegative(),
    limit: z.number().int().positive(),
    primary_results: z.number().int().nonnegative().optional(),
  }),
  results: z.array(z.string()), // Array of item IDs
  scroll_id: z.string().optional(), // For pagination > 1000
  orders: z.array(z.object({
    id: z.string(),
    name: z.string(),
  })).optional(),
  available_orders: z.array(z.object({
    id: z.string().or(z.object({ // Some orders have nested structure
      id: z.string(),
      field: z.string(),
      missing: z.string(),
      order: z.string(),
    })),
    name: z.string(),
  })).optional(),
});

export type MLItemsSearchResponse = z.infer<typeof MLItemsSearchResponseSchema>;

// ============================================================================
// ORDERS SCHEMAS
// ============================================================================

/**
 * ML Order Buyer
 */
export const MLBuyerSchema = z.object({
  id: z.number().int().positive(),
  nickname: z.string(),
  email: z.string().email().optional(),
  phone: z.object({
    area_code: z.string().optional(),
    number: z.string().optional(),
    extension: z.string().optional(),
    verified: z.boolean().optional(),
  }).optional(),
  alternative_phone: z.object({
    area_code: z.string().optional(),
    number: z.string().optional(),
    extension: z.string().optional(),
  }).optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  billing_info: z.object({
    doc_type: z.string().optional(),
    doc_number: z.string().optional(),
  }).optional(),
});

/**
 * ML Order Item
 */
export const MLOrderItemSchema = z.object({
  item: z.object({
    id: z.string(),
    title: z.string(),
    category_id: z.string().optional(),
    variation_id: z.number().nullable().optional(),
    seller_custom_field: z.string().nullable().optional(),
    variation_attributes: z.array(z.any()).optional(),
    warranty: z.string().nullable().optional(),
    condition: z.string().optional(),
    seller_sku: z.string().nullable().optional(),
    global_price: z.number().nullable().optional(),
    net_weight: z.number().nullable().optional(),
  }),
  quantity: z.number().int().positive(),
  unit_price: z.number(),
  full_unit_price: z.number().optional(),
  currency_id: z.string(),
  manufacturing_days: z.number().nullable().optional(),
  sale_fee: z.number().optional(),
  listing_type_id: z.string().optional(),
});

/**
 * ML Order Payment
 */
export const MLPaymentSchema = z.object({
  id: z.number().int().positive(),
  transaction_amount: z.number(),
  currency_id: z.string(),
  status: z.string(),
  status_detail: z.string().nullable().optional(),
  operation_type: z.string().optional(),
  date_created: z.string().datetime().optional(),
  date_last_updated: z.string().datetime().optional(),
  payment_method_id: z.string().optional(),
  payment_type: z.string().optional(),
  installments: z.number().int().optional(),
  issuer_id: z.string().nullable().optional(),
  atm_transfer_reference: z.object({
    company_id: z.string().nullable().optional(),
    transaction_id: z.string().nullable().optional(),
  }).nullable().optional(),
  coupon_amount: z.number().optional(),
  shipping_cost: z.number().optional(),
  installment_amount: z.number().nullable().optional(),
  deferred_period: z.string().nullable().optional(),
  marketplace_fee: z.number().optional(),
  payer_id: z.number().optional(),
  collector_id: z.number().optional(),
  authorization_code: z.string().nullable().optional(),
  taxes_amount: z.number().optional(),
  card_id: z.number().nullable().optional(),
  reason: z.string().nullable().optional(),
  activation_uri: z.string().nullable().optional(),
});

/**
 * ML Order Shipping
 */
export const MLOrderShippingSchema = z.object({
  id: z.number().int().positive(),
  shipment_type: z.string(),
  status: z.string(),
  status_history: z.object({
    date_shipped: z.string().datetime().nullable().optional(),
    date_delivered: z.string().datetime().nullable().optional(),
    date_first_visit: z.string().datetime().nullable().optional(),
    date_not_delivered: z.string().datetime().nullable().optional(),
    date_cancelled: z.string().datetime().nullable().optional(),
    date_handling: z.string().datetime().nullable().optional(),
    date_ready_to_ship: z.string().datetime().nullable().optional(),
  }).optional(),
  date_created: z.string().datetime().optional(),
  last_updated: z.string().datetime().optional(),
  tracking_number: z.string().optional(),
  tracking_method: z.string().nullable().optional(),
  service_id: z.number().nullable().optional(),
  sender_id: z.number().nullable().optional(),
  receiver_id: z.number().nullable().optional(),
  receiver_address: z.object({
    id: z.number().optional(),
    address_line: z.string().optional(),
    street_name: z.string().optional(),
    street_number: z.string().optional(),
    comment: z.string().optional(),
    zip_code: z.string().optional(),
    city: z.object({
      id: z.string().optional(),
      name: z.string().optional(),
    }).optional(),
    state: z.object({
      id: z.string().optional(),
      name: z.string().optional(),
    }).optional(),
    country: z.object({
      id: z.string().optional(),
      name: z.string().optional(),
    }).optional(),
    neighborhood: z.object({
      id: z.string().nullable().optional(),
      name: z.string().nullable().optional(),
    }).optional(),
    latitude: z.number().nullable().optional(),
    longitude: z.number().nullable().optional(),
    receiver_name: z.string().optional(),
    receiver_phone: z.string().optional(),
    apartment: z.string().optional(),
    floor: z.string().optional(),
  }).optional(),
  shipping_items: z.array(z.object({
    id: z.string(),
    description: z.string().optional(),
    quantity: z.number().int().optional(),
    dimensions: z.string().optional(),
  })).optional(),
  shipping_option: z.object({
    id: z.number().optional(),
    shipping_method_id: z.number().optional(),
    name: z.string().optional(),
    currency_id: z.string().optional(),
    cost: z.number().optional(),
    list_cost: z.number().optional(),
  }).optional(),
});

/**
 * Complete ML Order Schema
 * For GET /orders/{id}
 */
export const MLOrderSchema = z.object({
  id: z.number().int().positive(),
  status: z.enum(['confirmed', 'payment_required', 'payment_in_process', 'paid', 'cancelled']),
  status_detail: z.string().nullable().optional(),
  date_created: z.string().datetime(),
  date_closed: z.string().datetime().nullable().optional(),
  order_items: z.array(MLOrderItemSchema),
  total_amount: z.number(),
  currency_id: z.string(),
  buyer: MLBuyerSchema,
  seller: z.object({
    id: z.number().int().positive(),
    nickname: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.object({
      area_code: z.string().optional(),
      number: z.string().optional(),
      extension: z.string().optional(),
    }).optional(),
  }),
  payments: z.array(MLPaymentSchema).optional(),
  feedback: z.object({
    buyer: z.any().nullable().optional(),
    seller: z.any().nullable().optional(),
  }).optional(),
  shipping: MLOrderShippingSchema.optional(),
  tags: z.array(z.string()).optional(),
  pack_id: z.number().nullable().optional(),
  pickup_id: z.number().nullable().optional(),
  order_request: z.object({
    change: z.string().nullable().optional(),
    return: z.string().nullable().optional(),
  }).nullable().optional(),
  context: z.object({
    channel: z.string().optional(),
    site: z.string().optional(),
    flows: z.array(z.string()).optional(),
  }).optional(),
  taxes: z.object({
    amount: z.number().nullable().optional(),
    currency_id: z.string().nullable().optional(),
  }).nullable().optional(),
});

export type MLOrder = z.infer<typeof MLOrderSchema>;

/**
 * Orders Search Response Schema
 * For GET /orders/search
 */
export const MLOrdersSearchResponseSchema = z.object({
  query: z.string().optional(),
  display: z.string().optional(),
  paging: z.object({
    total: z.number().int().nonnegative(),
    offset: z.number().int().nonnegative(),
    limit: z.number().int().positive(),
  }),
  results: z.array(MLOrderSchema),
  applied_filters: z.array(z.object({
    id: z.string(),
    name: z.string(),
    values: z.array(z.object({
      id: z.string(),
      name: z.string(),
    })),
  })).optional(),
  available_filters: z.array(z.any()).optional(),
  sort: z.object({
    id: z.string(),
    name: z.string(),
  }).optional(),
  available_sorts: z.array(z.object({
    id: z.string(),
    name: z.string(),
  })).optional(),
});

export type MLOrdersSearchResponse = z.infer<typeof MLOrdersSearchResponseSchema>;

// ============================================================================
// QUESTIONS SCHEMAS
// ============================================================================

/**
 * ML Question Schema
 * For GET /my/received_questions/search?api_version=4
 * 
 * IMPORTANT: Must use api_version=4 and correct endpoint
 * OLD endpoint /questions/search returns 400 error
 */
export const MLQuestionSchema = z.object({
  id: z.number().int().positive(),
  status: z.enum(['UNANSWERED', 'ANSWERED', 'CLOSED_UNANSWERED', 'UNDER_REVIEW', 'BANNED', 'DELETED']),
  text: z.string(),
  date_created: z.string().datetime(),
  item_id: z.string(),
  answer: z.object({
    text: z.string(),
    status: z.string(),
    date_created: z.string().datetime(),
  }).nullable().optional(),
  from: z.object({
    id: z.number().int().positive(),
    answered_questions: z.number().int().nonnegative().optional(),
  }),
  seller_id: z.number().int().positive(),
  deleted_from_listing: z.boolean().optional(),
  hold: z.boolean().optional(),
  item_status: z.string().optional(),
  item_price: z.number().optional(),
  item_currency_id: z.string().optional(),
});

export type MLQuestion = z.infer<typeof MLQuestionSchema>;

/**
 * Questions Search Response Schema
 * For GET /my/received_questions/search?api_version=4
 */
export const MLQuestionsSearchResponseSchema = z.object({
  total: z.number().int().nonnegative(),
  limit: z.number().int().positive(),
  questions: z.array(MLQuestionSchema),
});

export type MLQuestionsSearchResponse = z.infer<typeof MLQuestionsSearchResponseSchema>;

/**
 * Answer Question Request Schema
 * For POST /answers
 */
export const AnswerQuestionSchema = z.object({
  question_id: z.number().int().positive(),
  text: z.string().min(1, 'Answer text cannot be empty').max(2000, 'Answer too long'),
});

export type AnswerQuestion = z.infer<typeof AnswerQuestionSchema>;

// ============================================================================
// WEBHOOKS SCHEMAS
// ============================================================================

/**
 * All supported webhook topics from ML documentation
 */
export const MLWebhookTopicSchema = z.enum([
  // Orders & Sales
  'orders',
  'orders_v2',
  'orders_feedback',
  // Messages & Communication
  'messages',
  // Items & Catalog
  'items',
  'price_suggestion',
  'quotations',
  'items_prices',
  'stock_locations',
  'user_products_families',
  'catalog_item_competition',
  'catalog_suggestions',
  // Shipments & Logistics
  'shipments',
  'fbm_stock_operations',
  'flex_handshakes',
  // Promotions
  'public_offers',
  'public_candidates',
  // VIS Leads (Real Estate/Motors)
  'vis_leads',
  // Post Purchase
  'post_purchase',
  // Questions & Claims
  'questions',
  'claims',
  // Payments & Finance
  'payments',
  'invoices',
  'leads_credits',
]);

export type MLWebhookTopic = z.infer<typeof MLWebhookTopicSchema>;

/**
 * Webhook Actions for structured webhooks
 */
export const MLWebhookActionSchema = z.enum([
  // Messages actions
  'created',
  'read',
  // VIS Leads actions
  'whatsapp',
  'call',
  'question',
  'contact_request',
  'reservation',
  'visit_request',
  // Post Purchase actions
  'claims',
  'claims_actions',
]);

export type MLWebhookAction = z.infer<typeof MLWebhookActionSchema>;

/**
 * ML Webhook Notification Schema
 * Received from ML when webhook is triggered
 */
export const MLWebhookNotificationSchema = z.object({
  _id: z.string().or(z.number()).optional(), // Some webhooks use string, others number
  id: z.string().or(z.number()).optional(), // Alternative to _id
  resource: z.string().min(1, 'Resource is required'), // e.g., "/orders/123456789"
  user_id: z.number().int().positive(),
  topic: MLWebhookTopicSchema,
  application_id: z.number().int().positive(),
  attempts: z.number().int().nonnegative(),
  sent: z.string().datetime(),
  received: z.string().datetime(),
  actions: z.array(MLWebhookActionSchema).optional(), // For structured webhooks
}).refine(
  (data) => data._id !== undefined || data.id !== undefined,
  { message: 'Either _id or id must be present' }
);

export type MLWebhookNotification = z.infer<typeof MLWebhookNotificationSchema>;

/**
 * Processed Notification Schema
 * After fetching resource data and processing
 * Note: Cannot use .extend() on schemas with .refine(), so we recreate the full schema
 */
export const ProcessedNotificationSchema = z.object({
  _id: z.string().or(z.number()).optional(),
  id: z.string().or(z.number()).optional(),
  resource: z.string().min(1, 'Resource is required'),
  user_id: z.number().int().positive(),
  topic: MLWebhookTopicSchema,
  application_id: z.number().int().positive(),
  attempts: z.number().int().nonnegative(),
  sent: z.string().datetime(),
  received: z.string().datetime(),
  actions: z.array(MLWebhookActionSchema).optional(),
  // Additional fields for processed notification
  resource_data: z.record(z.string(), z.unknown()).optional(),
  processed_at: z.string().datetime(),
  status: z.enum(['success', 'error', 'skipped']),
  error_message: z.string().optional(),
}).refine(
  (data) => data._id !== undefined || data.id !== undefined,
  { message: 'Either _id or id must be present' }
);

export type ProcessedNotification = z.infer<typeof ProcessedNotificationSchema>;

// ============================================================================
// COMMON REQUEST VALIDATION SCHEMAS
// ============================================================================

/**
 * Query Parameters for Items Search
 */
export const ItemsSearchQuerySchema = z.object({
  offset: z.coerce.number().int().nonnegative().default(0),
  limit: z.coerce.number().int().positive().max(100).default(50),
  status: z.enum(['active', 'paused', 'closed', 'under_review', 'inactive']).optional(),
  search: z.string().optional(),
  sku: z.string().optional(),
  seller_sku: z.string().optional(),
  missing_product_identifiers: z.enum(['true', 'false']).optional(),
  search_type: z.enum(['scan']).optional(), // For > 1000 results
  scroll_id: z.string().optional(),
});

export type ItemsSearchQuery = z.infer<typeof ItemsSearchQuerySchema>;

/**
 * Query Parameters for Orders Search
 */
export const OrdersSearchQuerySchema = z.object({
  seller: z.coerce.number().int().positive().optional(),
  buyer: z.coerce.number().int().positive().optional(),
  offset: z.coerce.number().int().nonnegative().default(0),
  limit: z.coerce.number().int().positive().max(50).default(50),
  sort: z.enum(['date_asc', 'date_desc']).optional(),
  'order.status': z.enum([
    'confirmed',
    'payment_required',
    'payment_in_process',
    'paid',
    'cancelled',
  ]).optional(),
  'order.date_created.from': z.string().datetime().optional(),
  'order.date_created.to': z.string().datetime().optional(),
});

export type OrdersSearchQuery = z.infer<typeof OrdersSearchQuerySchema>;

/**
 * Query Parameters for Questions Search
 */
export const QuestionsSearchQuerySchema = z.object({
  item: z.string().optional(), // Item ID
  status: z.enum(['UNANSWERED', 'ANSWERED', 'CLOSED_UNANSWERED']).optional(),
  limit: z.coerce.number().int().positive().max(50).default(50),
  offset: z.coerce.number().int().nonnegative().default(0),
  api_version: z.literal('4').default('4'), // REQUIRED for correct endpoint
});

export type QuestionsSearchQuery = z.infer<typeof QuestionsSearchQuerySchema>;

// ============================================================================
// HELPER TYPES AND VALIDATORS
// ============================================================================

/**
 * Generic ML API Error Response
 */
export const MLErrorResponseSchema = z.object({
  message: z.string(),
  error: z.string(),
  status: z.number().int(),
  cause: z.array(z.object({
    code: z.string().optional(),
    message: z.string().optional(),
  })).optional(),
});

export type MLErrorResponse = z.infer<typeof MLErrorResponseSchema>;

/**
 * Generic Paging Schema
 */
export const MLPagingSchema = z.object({
  total: z.number().int().nonnegative(),
  offset: z.number().int().nonnegative(),
  limit: z.number().int().positive(),
  primary_results: z.number().int().nonnegative().optional(),
});

export type MLPaging = z.infer<typeof MLPagingSchema>;
