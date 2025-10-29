/**
 * ML Integration Service
 *
 * High-level facade built on top of the new repository/service layer.
 * Provides helpers for fetching active integrations, retrieving
 * access tokens, and performing authenticated ML API requests.
 */

import { createClient } from '@/utils/supabase/server';
import { logger } from '@/utils/logger';
import { getMLApiClient, type MLRequestOptions, type MLApiResponse } from '../api/MLApiClient';
import { getMLIntegrationRepository } from '../repositories';
import { getMLTokenService } from './MLTokenService';
import type { MLIntegration } from '../types';

const ML_API_BASE_URL = 'https://api.mercadolibre.com';

export class MLIntegrationService {
  private readonly integrationRepo = getMLIntegrationRepository();
  private readonly tokenService = getMLTokenService();
  private readonly apiClient = getMLApiClient();

  /**
   * Fetch all integrations for tenant
   */
  async listTenantIntegrations(tenantId: string): Promise<MLIntegration[]> {
    return this.integrationRepo.findByTenant(tenantId);
  }

  /**
   * Fetch most recently updated active integration for tenant
   */
  async getActiveTenantIntegration(tenantId: string): Promise<MLIntegration | null> {
    return this.integrationRepo.findActiveByTenant(tenantId);
  }

  /**
   * Fetch active integration for tenant or throw descriptive error
   */
  async requireActiveTenantIntegration(tenantId: string): Promise<MLIntegration> {
    const integration = await this.getActiveTenantIntegration(tenantId);

    if (!integration) {
      throw new Error('No active ML integration found. Please connect your Mercado Livre account.');
    }

    return integration;
  }

  /**
   * Fetch integration by identifier
   */
  async getIntegrationById(integrationId: string): Promise<MLIntegration | null> {
    return this.integrationRepo.findById(integrationId);
  }

  /**
   * Check if tenant has active integration
   */
  async hasActiveIntegration(tenantId: string): Promise<boolean> {
    const integration = await this.getActiveTenantIntegration(tenantId);
    return Boolean(integration);
  }

  /**
   * Return integration and a valid access token (auto-refresh aware)
   */
  async getIntegrationWithToken(tenantId: string): Promise<{ integration: MLIntegration; accessToken: string }> {
    const integration = await this.requireActiveTenantIntegration(tenantId);
    const accessToken = await this.tokenService.getValidToken(integration.id);

    return { integration, accessToken };
  }

  /**
   * Retrieve valid access token for integration
   */
  async getValidAccessToken(integrationId: string): Promise<string> {
    return this.tokenService.getValidToken(integrationId);
  }

  /**
   * Perform authenticated ML API request using central API client
   */
  async request<T = unknown>(
    integrationId: string,
    endpoint: string,
    options: Omit<MLRequestOptions, 'accessToken'> = {}
  ): Promise<MLApiResponse<T>> {
    const accessToken = await this.getValidAccessToken(integrationId);
    return this.apiClient.request<T>(endpoint, {
      ...options,
      accessToken,
    });
  }

  /**
   * Helper to perform raw fetch calls when streaming/body access is required
   */
  async fetch(
    integrationId: string,
    endpoint: string,
    init: RequestInit = {}
  ): Promise<Response> {
    const accessToken = await this.getValidAccessToken(integrationId);
    return this.performRawFetch(endpoint, accessToken, init);
  }

  /**
   * Log sync event to ml_sync_logs table (legacy compatibility helper)
   */
  async logSyncEvent(
    integrationId: string,
    syncType: string,
    status: 'success' | 'error' | 'partial',
    metadata: Record<string, unknown> = {}
  ): Promise<void> {
    try {
      const supabase = await createClient();
      await supabase
        .from('ml_sync_logs')
        .insert({
          integration_id: integrationId,
          sync_type: syncType,
          status,
          sync_data: metadata,
          completed_at: new Date().toISOString(),
        });
    } catch (error) {
      logger.error('Failed to log ML sync event', {
        integrationId,
        syncType,
        status,
        error,
      });
    }
  }

  private async performRawFetch(
    endpoint: string,
    accessToken: string,
    init: RequestInit
  ): Promise<Response> {
    const headers = new Headers(init.headers);

    if (!headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${accessToken}`);
    }

    if (!headers.has('Accept')) {
      headers.set('Accept', 'application/json');
    }

    const url = this.buildUrl(endpoint);

    return fetch(url, {
      ...init,
      headers,
    });
  }

  private buildUrl(endpoint: string): string {
    return endpoint.startsWith('http') ? endpoint : `${ML_API_BASE_URL}${endpoint}`;
  }
}

let integrationServiceInstance: MLIntegrationService | null = null;

export function getMLIntegrationService(): MLIntegrationService {
  if (!integrationServiceInstance) {
    integrationServiceInstance = new MLIntegrationService();
  }

  return integrationServiceInstance;
}
