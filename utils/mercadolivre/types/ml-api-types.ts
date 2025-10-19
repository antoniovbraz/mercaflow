/**
 * Mercado Livre API Types
 * Based on official API documentation: https://developers.mercadolibre.com.ar/en_us/
 */

// ============================================================================
// COMMON TYPES
// ============================================================================

export interface MLPaging {
  total: number;
  offset: number;
  limit: number;
  primary_results?: number;
}

export interface MLError {
  message: string;
  error: string;
  status: number;
  cause?: unknown[];
}

// ============================================================================
// OAUTH & AUTH
// ============================================================================

export interface MLTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  user_id: number;
  refresh_token: string;
}

export interface MLUserInfo {
  id: number;
  nickname: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  country_id?: string;
  address?: {
    city?: string;
    state?: string;
  };
  user_type?: string;
  site_id: string;
}

// ============================================================================
// ITEMS / PRODUCTS
// ============================================================================

/**
 * Response from /users/{user_id}/items/search
 * Returns ONLY array of item IDs, not full objects!
 */
export interface MLItemSearchResponse {
  results: string[]; // Array of item IDs like ["MLB123", "MLB456"]
  paging: MLPaging;
  seller_id?: number;
  query?: string;
}

/**
 * Response from /items?ids=ID1,ID2,ID3 (multiget)
 * Returns array of {code, body} objects
 */
export type MLMultiGetResponse = MLMultiGetResult[];

export interface MLMultiGetResult {
  code: number; // HTTP status (200 = success, 404 = not found)
  body: MLItem | MLError;
}

/**
 * Full item/product object from ML API
 * Based on: https://developers.mercadolibre.com.ar/en_us/items-and-searches
 */
export interface MLItem {
  id: string; // "MLB123456789"
  site_id: string; // "MLB"
  title: string;
  subtitle?: string | null;
  seller_id: number;
  category_id: string;
  official_store_id?: number | null;
  price: number;
  base_price?: number;
  original_price?: number | null;
  currency_id: string; // "BRL"
  
  // Inventory
  initial_quantity: number;
  available_quantity: number;
  sold_quantity: number;
  
  // Status
  status: 'active' | 'paused' | 'closed' | 'under_review' | 'inactive';
  sub_status?: string[];
  
  // Type
  listing_type_id: string; // "gold_special", "gold_pro", "free", etc
  buying_mode: string; // "buy_it_now", "auction"
  condition: 'new' | 'used' | 'not_specified';
  
  // Catalog
  catalog_product_id?: string | null;
  catalog_listing?: boolean;
  
  // Media
  pictures: MLPicture[];
  video_id?: string | null;
  thumbnail: string;
  thumbnail_id?: string;
  secure_thumbnail: string;
  
  // URLs
  permalink: string;
  
  // Dates
  date_created: string; // ISO 8601
  last_updated: string; // ISO 8601
  start_time?: string;
  stop_time?: string;
  
  // Shipping
  shipping?: {
    mode?: string;
    free_shipping?: boolean;
    logistic_type?: string;
    tags?: string[];
    dimensions?: string | null;
    local_pick_up?: boolean;
    store_pick_up?: boolean;
  };
  
  // Location
  seller_address?: {
    id?: number;
    city?: { id?: string; name?: string };
    state?: { id?: string; name?: string };
    country?: { id?: string; name?: string };
    latitude?: number;
    longitude?: number;
  };
  
  // Attributes
  attributes?: MLAttribute[];
  variations?: MLVariation[];
  
  // Sales
  sale_terms?: MLSaleTerm[];
  
  // Tags
  tags?: string[];
  
  // Warranty
  warranty?: string | null;
  
  // Health
  health?: number;
  
  // Description (needs separate API call)
  // GET /items/{item_id}/description
  
  // Others (API may return more fields)
  [key: string]: unknown;
}

export interface MLPicture {
  id: string;
  url: string;
  secure_url: string;
  size: string;
  max_size: string;
  quality: string;
}

export interface MLAttribute {
  id: string;
  name: string;
  value_id?: string | null;
  value_name?: string | null;
  value_struct?: unknown | null;
  values?: Array<{
    id?: string | null;
    name?: string;
    struct?: unknown | null;
  }>;
  attribute_group_id?: string;
  attribute_group_name?: string;
}

export interface MLVariation {
  id: number;
  price: number;
  attribute_combinations: Array<{
    id: string;
    name: string;
    value_id: string;
    value_name: string;
  }>;
  available_quantity: number;
  sold_quantity: number;
  sale_terms?: MLSaleTerm[];
  picture_ids?: string[];
  catalog_product_id?: string | null;
}

export interface MLSaleTerm {
  id: string;
  name: string;
  value_id?: string | null;
  value_name?: string;
  value_struct?: {
    number?: number;
    unit?: string;
  } | null;
  values?: Array<{
    id?: string | null;
    name?: string;
    struct?: {
      number?: number;
      unit?: string;
    } | null;
  }>;
}

// ============================================================================
// ORDERS
// ============================================================================

/**
 * Response from /orders/search
 */
export interface MLOrderSearchResponse {
  results: MLOrder[];
  paging: MLPaging;
  sort: {
    id: string;
    name: string;
  };
  available_sorts: Array<{
    id: string;
    name: string;
  }>;
  filters?: unknown[];
  display?: string;
}

/**
 * Full order object from ML API
 * Based on: https://developers.mercadolibre.com.ar/en_us/orders-management
 */
export interface MLOrder {
  id: number;
  status: string; // "confirmed", "payment_required", "payment_in_process", "paid", "cancelled"
  status_detail?: string | null;
  date_created: string; // ISO 8601
  date_closed?: string | null; // ISO 8601
  date_last_updated?: string; // ISO 8601
  
  // Financial
  total_amount: number;
  currency_id: string; // "BRL"
  paid_amount: number;
  
  // Buyer
  buyer: {
    id: number;
    nickname: string;
    email?: string;
    phone?: {
      area_code?: string;
      number?: string;
      extension?: string;
    };
    first_name?: string;
    last_name?: string;
    billing_info?: {
      doc_type?: string;
      doc_number?: string;
    };
  };
  
  // Seller
  seller: {
    id: number;
    nickname?: string;
    email?: string;
    phone?: {
      area_code?: string;
      number?: string;
    };
  };
  
  // Items
  order_items: MLOrderItem[];
  
  // Payments
  payments?: Array<{
    id?: number;
    transaction_amount?: number;
    currency_id?: string;
    status?: string;
    date_created?: string;
    date_last_modified?: string;
    payment_method_id?: string;
    payment_type?: string;
    installments?: number;
  }>;
  
  // Shipping
  shipping?: {
    id?: number;
    shipment_type?: string;
    status?: string;
    substatus?: string | null;
    date_created?: string;
    receiver_address?: {
      id?: number;
      address_line?: string;
      street_name?: string;
      street_number?: string;
      comment?: string;
      zip_code?: string;
      city?: { id?: string; name?: string };
      state?: { id?: string; name?: string };
      country?: { id?: string; name?: string };
      neighborhood?: { id?: string; name?: string };
      latitude?: number;
      longitude?: number;
      receiver_name?: string;
      receiver_phone?: string;
    };
  };
  
  // Feedback
  feedback?: {
    buyer?: unknown | null;
    seller?: unknown | null;
  };
  
  // Context
  context?: {
    channel?: string;
    site?: string;
    flows?: string[];
  };
  
  // Tags
  tags?: string[];
  
  // Pack info
  pack_id?: number | null;
  
  // Manufacturing days
  manufacturing_ending_date?: string | null;
  
  // Others
  [key: string]: unknown;
}

export interface MLOrderItem {
  item: {
    id: string;
    title: string;
    category_id?: string;
    variation_id?: number | null;
    seller_custom_field?: string | null;
    variation_attributes?: unknown[];
    warranty?: string | null;
    condition?: string;
    seller_sku?: string | null;
  };
  quantity: number;
  requested_quantity?: {
    value?: number;
    measure?: string;
  };
  picked_quantity?: number | null;
  unit_price: number;
  full_unit_price: number;
  currency_id: string;
  manufacturing_days?: number | null;
  sale_fee?: number;
  listing_type_id?: string;
}

// ============================================================================
// QUESTIONS
// ============================================================================

/**
 * Response from /my/received_questions/search?api_version=4
 */
export interface MLQuestionSearchResponse {
  total: number;
  limit: number;
  questions: MLQuestion[];
}

/**
 * Question object from ML API
 * Based on: https://developers.mercadolibre.com.ar/en_us/questions
 */
export interface MLQuestion {
  id: number;
  text: string;
  status: 'UNANSWERED' | 'ANSWERED' | 'CLOSED_UNANSWERED' | 'UNDER_REVIEW' | 'BANNED' | 'DELETED';
  date_created: string; // ISO 8601
  item_id: string;
  
  // Answer
  answer?: {
    text?: string;
    status?: string;
    date_created?: string;
  } | null;
  
  // From user
  from: {
    id: number;
    answered_questions?: number;
  };
  
  // Deleted from listing
  deleted_from_listing?: boolean;
  
  // Hold
  hold?: boolean;
  
  // Others
  [key: string]: unknown;
}

/**
 * Request to answer a question
 */
export interface MLAnswerQuestionRequest {
  question_id: number;
  text: string;
}

// ============================================================================
// NOTIFICATIONS / WEBHOOKS
// ============================================================================

/**
 * Webhook notification payload from ML
 * Based on: https://developers.mercadolibre.com.ar/en_us/notifications
 */
export interface MLWebhookNotification {
  _id: string;
  resource: string; // "/orders/123456" or "/items/MLB123" or "/questions/123"
  user_id: number;
  topic: string; // "orders", "items", "questions", "messages", "invoices"
  application_id: number;
  attempts: number;
  sent: string; // ISO 8601
  received: string; // ISO 8601
}

// ============================================================================
// SITE INFO
// ============================================================================

export interface MLSite {
  id: string; // "MLB", "MLA", "MLM", etc
  name: string;
  country_id: string;
  default_currency_id: string;
}

// ============================================================================
// CATEGORIES
// ============================================================================

export interface MLCategory {
  id: string;
  name: string;
  picture?: string;
  permalink?: string;
  total_items_in_this_category?: number;
  path_from_root?: Array<{
    id: string;
    name: string;
  }>;
  children_categories?: MLCategory[];
  attribute_types?: string;
  settings?: {
    adult_content?: boolean;
    buying_allowed?: boolean;
    buying_modes?: string[];
    catalog_domain?: string;
    coverage_areas?: string;
    currencies?: string[];
    fragile?: boolean;
    immediate_payment?: string;
    item_conditions?: string[];
    items_reviews_allowed?: boolean;
    listing_allowed?: boolean;
    max_description_length?: number;
    max_pictures_per_item?: number;
    max_pictures_per_item_var?: number;
    max_sub_title_length?: number;
    max_title_length?: number;
    max_variations_allowed?: number;
    maximum_price?: number;
    maximum_price_currency?: string;
    minimum_price?: number;
    minimum_price_currency?: string;
    mirror_category?: string | null;
    mirror_master_category?: string | null;
    mirror_slave_categories?: string[];
    price?: string;
    reservation_allowed?: string;
    restrictions?: string[];
    rounded_address?: boolean;
    seller_contact?: string;
    shipping_options?: string[];
    shipping_profile?: string;
    show_contact_information?: boolean;
    simple_shipping?: string;
    stock?: string;
    sub_vertical?: string;
    subscribable?: boolean;
    tags?: string[];
    vertical?: string;
    vip_subdomain?: string;
    buyer_protection_programs?: string[];
    status?: string;
  };
}
