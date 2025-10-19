/**
 * Database Types for Mercado Livre Integration
 * Based on migration: 20251019160000_rebuild_ml_from_scratch.sql
 */

// ============================================================================
// ML OAUTH STATES
// ============================================================================

export interface MLOAuthState {
  id: string;
  state: string;
  code_verifier: string;
  user_id: string;
  tenant_id: string;
  expires_at: string; // ISO 8601
  created_at: string; // ISO 8601
}

export interface CreateMLOAuthStateInput {
  state: string;
  code_verifier: string;
  user_id: string;
  tenant_id: string;
  expires_at: Date | string;
}

// ============================================================================
// ML INTEGRATIONS
// ============================================================================

export interface MLIntegration {
  id: string;
  user_id: string;
  tenant_id: string;
  
  // ML User Info
  ml_user_id: number;
  ml_nickname: string | null;
  ml_email: string | null;
  ml_site_id: string;
  
  // OAuth Tokens (encrypted)
  access_token: string;
  refresh_token: string;
  token_expires_at: string; // ISO 8601
  scopes: string[];
  
  // Status
  status: 'active' | 'expired' | 'revoked' | 'error' | 'pending';
  
  // Config
  auto_sync_enabled: boolean;
  sync_frequency_minutes: number;
  
  // Timestamps
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601
  last_sync_at: string | null; // ISO 8601
  last_token_refresh_at: string | null; // ISO 8601
  
  // Error tracking
  last_error: string | null;
  error_count: number;
}

export interface CreateMLIntegrationInput {
  user_id: string;
  tenant_id: string;
  ml_user_id: number;
  ml_nickname?: string;
  ml_email?: string;
  ml_site_id?: string;
  access_token: string; // Should be encrypted before insert
  refresh_token: string; // Should be encrypted before insert
  token_expires_at: Date | string;
  scopes?: string[];
}

export interface UpdateMLIntegrationInput {
  ml_nickname?: string;
  ml_email?: string;
  status?: MLIntegration['status'];
  auto_sync_enabled?: boolean;
  sync_frequency_minutes?: number;
  last_sync_at?: Date | string | null;
  last_token_refresh_at?: Date | string | null;
  last_error?: string | null;
  error_count?: number;
}

export interface UpdateMLIntegrationTokensInput {
  access_token: string; // Should be encrypted before update
  refresh_token: string; // Should be encrypted before update
  token_expires_at: Date | string;
  last_token_refresh_at?: Date | string;
}

// ============================================================================
// ML PRODUCTS
// ============================================================================

export interface MLProduct {
  id: string;
  integration_id: string;
  
  // ML Item Info
  ml_item_id: string;
  title: string;
  category_id: string | null;
  
  // Pricing
  price: number | null;
  currency_id: string;
  
  // Inventory
  available_quantity: number;
  sold_quantity: number;
  
  // Status
  status: 'active' | 'paused' | 'closed' | 'under_review' | 'inactive' | null;
  listing_type_id: string | null;
  condition: 'new' | 'used' | 'not_specified' | null;
  
  // Media
  permalink: string | null;
  thumbnail: string | null;
  
  // Full ML data
  ml_data: Record<string, unknown>; // JSONB
  
  // Timestamps
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601
  last_sync_at: string; // ISO 8601
}

export interface UpsertMLProductInput {
  integration_id: string;
  ml_item_id: string;
  title: string;
  category_id?: string | null;
  price?: number | null;
  currency_id?: string;
  available_quantity?: number;
  sold_quantity?: number;
  status?: MLProduct['status'];
  listing_type_id?: string | null;
  condition?: MLProduct['condition'];
  permalink?: string | null;
  thumbnail?: string | null;
  ml_data: Record<string, unknown>;
}

// ============================================================================
// ML ORDERS
// ============================================================================

export interface MLOrder {
  id: string;
  integration_id: string;
  
  // ML Order Info
  ml_order_id: number;
  status: string;
  status_detail: string | null;
  
  // Buyer
  buyer_id: number | null;
  buyer_nickname: string | null;
  
  // Financial
  total_amount: number;
  paid_amount: number;
  currency_id: string;
  
  // Dates
  date_created: string; // ISO 8601
  date_closed: string | null; // ISO 8601
  date_last_updated: string | null; // ISO 8601
  
  // Shipping
  shipping_status: string | null;
  
  // Full ML data
  ml_data: Record<string, unknown>; // JSONB
  
  // Timestamps
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601
  last_sync_at: string; // ISO 8601
}

export interface UpsertMLOrderInput {
  integration_id: string;
  ml_order_id: number;
  status: string;
  status_detail?: string | null;
  buyer_id?: number | null;
  buyer_nickname?: string | null;
  total_amount: number;
  paid_amount?: number;
  currency_id?: string;
  date_created: Date | string;
  date_closed?: Date | string | null;
  date_last_updated?: Date | string | null;
  shipping_status?: string | null;
  ml_data: Record<string, unknown>;
}

// ============================================================================
// ML QUESTIONS
// ============================================================================

export interface MLQuestion {
  id: string;
  integration_id: string;
  
  // ML Question Info
  ml_question_id: number;
  ml_item_id: string;
  
  // Status
  status: 'UNANSWERED' | 'ANSWERED' | 'CLOSED_UNANSWERED' | 'UNDER_REVIEW' | 'BANNED' | 'DELETED';
  
  // Content
  text: string;
  answer_text: string | null;
  
  // Dates
  date_created: string; // ISO 8601
  date_answered: string | null; // ISO 8601
  
  // From user
  from_user_id: number | null;
  from_user_nickname: string | null;
  
  // Full ML data
  ml_data: Record<string, unknown>; // JSONB
  
  // Timestamps
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601
  last_sync_at: string; // ISO 8601
}

export interface UpsertMLQuestionInput {
  integration_id: string;
  ml_question_id: number;
  ml_item_id: string;
  status: MLQuestion['status'];
  text: string;
  answer_text?: string | null;
  date_created: Date | string;
  date_answered?: Date | string | null;
  from_user_id?: number | null;
  from_user_nickname?: string | null;
  ml_data: Record<string, unknown>;
}

// ============================================================================
// ML WEBHOOK LOGS
// ============================================================================

export interface MLWebhookLog {
  id: string;
  
  // Webhook metadata
  topic: string;
  resource: string;
  user_id: number;
  application_id: number;
  
  // Payload
  payload: Record<string, unknown>; // JSONB
  
  // Processing
  processed: boolean;
  processed_at: string | null; // ISO 8601
  processing_error: string | null;
  retry_count: number;
  
  // Timestamps
  received_at: string; // ISO 8601
  
  // Attempts
  attempts: number;
}

export interface CreateMLWebhookLogInput {
  topic: string;
  resource: string;
  user_id: number;
  application_id: number;
  payload: Record<string, unknown>;
  attempts?: number;
}

export interface UpdateMLWebhookLogInput {
  processed?: boolean;
  processed_at?: Date | string;
  processing_error?: string | null;
  retry_count?: number;
}

// ============================================================================
// ML SYNC LOGS
// ============================================================================

export interface MLSyncLog {
  id: string;
  integration_id: string;
  
  // Sync metadata
  sync_type: 'products' | 'orders' | 'questions' | 'messages' | 'full';
  status: 'started' | 'in_progress' | 'completed' | 'failed' | 'partial';
  
  // Statistics
  items_fetched: number;
  items_synced: number;
  items_failed: number;
  
  // Timing
  started_at: string; // ISO 8601
  completed_at: string | null; // ISO 8601
  duration_seconds: number | null;
  
  // Error tracking
  error_message: string | null;
  error_details: Record<string, unknown> | null; // JSONB
  
  // Additional metadata
  metadata: Record<string, unknown>; // JSONB
  
  // Timestamps
  created_at: string; // ISO 8601
}

export interface CreateMLSyncLogInput {
  integration_id: string;
  sync_type: MLSyncLog['sync_type'];
  status?: MLSyncLog['status'];
  started_at?: Date | string;
  metadata?: Record<string, unknown>;
}

export interface UpdateMLSyncLogInput {
  status?: MLSyncLog['status'];
  items_fetched?: number;
  items_synced?: number;
  items_failed?: number;
  completed_at?: Date | string;
  duration_seconds?: number;
  error_message?: string | null;
  error_details?: Record<string, unknown> | null;
  metadata?: Record<string, unknown>;
}

// ============================================================================
// SYNC RESULT (used by services)
// ============================================================================

export interface SyncResult {
  success: boolean;
  sync_log_id: string;
  items_fetched: number;
  items_synced: number;
  items_failed: number;
  duration_seconds: number;
  errors?: Array<{
    item_id?: string;
    error: string;
  }>;
}
