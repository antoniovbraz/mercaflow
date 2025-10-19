/**
 * Mercado Livre Types - Central Export
 */

// API Types (from ML API responses)
export type {
  MLPaging,
  MLTokenResponse,
  MLUserInfo,
  MLItemSearchResponse,
  MLMultiGetResponse,
  MLMultiGetResult,
  MLItem,
  MLPicture,
  MLAttribute,
  MLVariation,
  MLSaleTerm,
  MLOrderSearchResponse,
  MLOrder as MLOrderAPI,
  MLOrderItem,
  MLQuestionSearchResponse,
  MLQuestion as MLQuestionAPI,
  MLAnswerQuestionRequest,
  MLWebhookNotification,
  MLSite,
  MLCategory,
} from './ml-api-types';

// Database Types (from our PostgreSQL schema)
export type {
  MLOAuthState,
  CreateMLOAuthStateInput,
  MLIntegration,
  CreateMLIntegrationInput,
  UpdateMLIntegrationInput,
  UpdateMLIntegrationTokensInput,
  MLProduct,
  UpsertMLProductInput,
  MLOrder as MLOrderDB,
  UpsertMLOrderInput,
  MLQuestion as MLQuestionDB,
  UpsertMLQuestionInput,
  MLWebhookLog,
  CreateMLWebhookLogInput,
  UpdateMLWebhookLogInput,
  MLSyncLog,
  CreateMLSyncLogInput,
  UpdateMLSyncLogInput,
  SyncResult,
} from './ml-db-types';

// Error Types
export {
  MLError,
  MLApiError,
  MLRateLimitError,
  MLNotFoundError,
  MLUnauthorizedError,
  MLForbiddenError,
  MLBadRequestError,
  MLTokenError,
  MLTokenExpiredError,
  MLTokenRefreshError,
  MLTokenEncryptionError,
  MLSyncError,
  MLPartialSyncError,
  MLIntegrationError,
  MLIntegrationNotFoundError,
  MLIntegrationInactiveError,
  MLWebhookError,
  MLWebhookProcessingError,
  MLValidationError,
  toMLError,
  isRetryableError,
  requiresTokenRefresh,
} from './ml-errors';
