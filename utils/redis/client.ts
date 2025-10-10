/**
 * Upstash Redis Client Singleton
 * 
 * Provides a singleton Redis client instance using Upstash REST API.
 * Edge-compatible and works in Vercel Edge Functions.
 * 
 * @see https://upstash.com/docs/redis/sdks/ts/overview
 */

import { Redis } from '@upstash/redis'
import { logger } from '@/utils/logger'

let redisClient: Redis | null = null
let clientInitialized = false

/**
 * Get Upstash Redis client singleton
 * 
 * Uses REST API (edge-compatible) with automatic retries and connection pooling.
 * Safe to call multiple times - returns same instance.
 * 
 * @throws {Error} If UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN are missing
 * @returns {Redis} Upstash Redis client instance
 * 
 * @example
 * ```ts
 * const redis = getRedisClient()
 * await redis.set('key', 'value', { ex: 300 }) // 5 min TTL
 * const value = await redis.get('key')
 * ```
 */
export function getRedisClient(): Redis {
  // Return existing client if already initialized
  if (clientInitialized && redisClient) {
    return redisClient
  }

  // Validate environment variables
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN

  if (!url || !token) {
    const error = new Error(
      'Upstash Redis not configured. Missing UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN environment variables.'
    )
    logger.error('Redis client initialization failed', error, {
      hasUrl: !!url,
      hasToken: !!token,
      environment: process.env.NODE_ENV,
    })
    throw error
  }

  try {
    // Create Redis client with REST API
    redisClient = new Redis({
      url,
      token,
      // Automatic retries for failed requests
      automaticDeserialization: true,
    })

    clientInitialized = true

    logger.info('Redis client initialized successfully', {
      url: url.replace(/\/\/.*@/, '//***@'), // Mask credentials in logs
      environment: process.env.NODE_ENV,
    })

    return redisClient
  } catch (error) {
    logger.error('Failed to create Redis client', error instanceof Error ? error : new Error(String(error)), {
      environment: process.env.NODE_ENV,
    })
    throw error
  }
}

/**
 * Test Redis connection
 * 
 * Performs a PING command to verify Redis is accessible.
 * Useful for health checks and debugging.
 * 
 * @returns {Promise<boolean>} True if connection successful, false otherwise
 * 
 * @example
 * ```ts
 * const isHealthy = await testRedisConnection()
 * if (!isHealthy) {
 *   console.error('Redis is not available')
 * }
 * ```
 */
export async function testRedisConnection(): Promise<boolean> {
  try {
    const redis = getRedisClient()
    const result = await redis.ping()
    
    logger.info('Redis PING successful', { result })
    return result === 'PONG'
  } catch (error) {
    logger.error('Redis PING failed', error instanceof Error ? error : new Error(String(error)))
    return false
  }
}

/**
 * Reset Redis client (for testing/development)
 * 
 * Forces recreation of Redis client on next getRedisClient() call.
 * Useful for testing different configurations.
 */
export function resetRedisClient(): void {
  redisClient = null
  clientInitialized = false
  logger.info('Redis client reset')
}
