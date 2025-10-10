/**
 * Redis Cache Helper Functions
 * 
 * High-level cache utilities with automatic serialization, TTL management,
 * and invalidation patterns. Built on top of Upstash Redis client.
 * 
 * @see docs/CACHE.md for architecture and usage patterns
 */

import { getRedisClient } from './client'
import { logger } from '@/utils/logger'

/**
 * Default TTL values (in seconds)
 */
export const CacheTTL = {
  /** 1 minute - for rapidly changing data */
  MINUTE: 60,
  /** 3 minutes - for semi-dynamic data like orders */
  SHORT: 180,
  /** 5 minutes - default for most dashboard queries */
  MEDIUM: 300,
  /** 10 minutes - for slower-changing data like product lists */
  LONG: 600,
  /** 30 minutes - for relatively static data */
  VERY_LONG: 1800,
  /** 1 hour - for rarely changing data */
  HOUR: 3600,
} as const

/**
 * Cache key prefixes for organization and invalidation
 */
export const CachePrefix = {
  DASHBOARD: 'dashboard',
  ML_ITEMS: 'ml:items',
  ML_ORDERS: 'ml:orders',
  ML_QUESTIONS: 'ml:questions',
  ML_MESSAGES: 'ml:messages',
  ML_USER: 'ml:user',
} as const

/**
 * Options for getCached function
 */
interface CacheOptions {
  /** Time-to-live in seconds */
  ttl?: number
  /** Whether to skip cache and force fresh data */
  skipCache?: boolean
  /** Additional context for logging */
  context?: Record<string, unknown>
}

/**
 * Get data from cache or fetch fresh if not cached
 * 
 * This is the primary cache function. It implements "cache-aside" pattern:
 * 1. Try to get from cache
 * 2. If miss, call fetcher function
 * 3. Store result in cache
 * 4. Return result
 * 
 * @template T - Type of cached data
 * @param key - Cache key (use buildCacheKey for consistency)
 * @param fetcher - Async function that fetches fresh data
 * @param options - Cache options (TTL, skip cache, etc)
 * @returns Cached or fresh data
 * 
 * @example
 * ```ts
 * const stats = await getCached(
 *   buildCacheKey(CachePrefix.DASHBOARD, 'stats', tenantId),
 *   async () => {
 *     const supabase = await createClient()
 *     return supabase.from('orders').select('count').single()
 *   },
 *   { ttl: CacheTTL.MEDIUM }
 * )
 * ```
 */
export async function getCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: CacheOptions = {}
): Promise<T> {
  const { ttl = CacheTTL.MEDIUM, skipCache = false, context } = options

  // Skip cache if requested (useful for debugging)
  if (skipCache) {
    logger.debug('Cache skip requested', { key, ...context })
    return fetcher()
  }

  try {
    const redis = getRedisClient()

    // Try to get from cache
    const cached = await redis.get<T>(key)

    if (cached !== null) {
      logger.debug('Cache HIT', { key, ...context })
      return cached
    }

    // Cache miss - fetch fresh data
    logger.debug('Cache MISS', { key, ...context })
    const data = await fetcher()

    // Store in cache with TTL
    await redis.set(key, data, { ex: ttl })
    logger.debug('Cache SET', { key, ttl, ...context })

    return data
  } catch (error) {
    // On Redis errors, fall back to fetcher (degraded mode)
    logger.warn('Cache operation failed, falling back to fetcher', {
      key,
      error: error instanceof Error ? error.message : String(error),
      ...context,
    })
    return fetcher()
  }
}

/**
 * Build consistent cache key from parts
 * 
 * Creates cache keys in format: "prefix:part1:part2:..."
 * Ensures consistency across the application.
 * 
 * @param parts - Key components (prefix, IDs, etc)
 * @returns Formatted cache key
 * 
 * @example
 * ```ts
 * buildCacheKey(CachePrefix.ML_ITEMS, tenantId, userId)
 * // Returns: "ml:items:tenant-123:user-456"
 * ```
 */
export function buildCacheKey(...parts: (string | number)[]): string {
  return parts.map(String).join(':')
}

/**
 * Invalidate cache entries by pattern
 * 
 * Uses Redis SCAN to find keys matching pattern, then deletes them.
 * Useful for invalidating related cache entries (e.g., all items for a user).
 * 
 * @param pattern - Redis key pattern (supports * wildcard)
 * @returns Number of keys deleted
 * 
 * @example
 * ```ts
 * // Invalidate all ML items cache for a tenant
 * await invalidateCache(`${CachePrefix.ML_ITEMS}:${tenantId}:*`)
 * 
 * // Invalidate all dashboard caches
 * await invalidateCache(`${CachePrefix.DASHBOARD}:*`)
 * ```
 */
export async function invalidateCache(pattern: string): Promise<number> {
  try {
    const redis = getRedisClient()

    // Scan for matching keys
    const keys: string[] = []
    let cursor = '0'

    do {
      const [nextCursor, foundKeys] = await redis.scan(cursor, {
        match: pattern,
        count: 100,
      })
      cursor = String(nextCursor)
      keys.push(...foundKeys)
    } while (cursor !== '0')

    // Delete all matching keys
    if (keys.length > 0) {
      await redis.del(...keys)
      logger.info('Cache invalidated', { pattern, keysDeleted: keys.length })
    } else {
      logger.debug('No cache keys found for invalidation', { pattern })
    }

    return keys.length
  } catch (error) {
    logger.error('Cache invalidation failed', error instanceof Error ? error : new Error(String(error)), {
      pattern,
    })
    return 0
  }
}

/**
 * Invalidate specific cache key
 * 
 * Simpler version of invalidateCache for single keys (no pattern matching).
 * 
 * @param key - Exact cache key to delete
 * @returns True if key was deleted, false otherwise
 * 
 * @example
 * ```ts
 * await invalidateCacheKey(buildCacheKey(CachePrefix.ML_ITEMS, tenantId, userId))
 * ```
 */
export async function invalidateCacheKey(key: string): Promise<boolean> {
  try {
    const redis = getRedisClient()
    const result = await redis.del(key)
    
    logger.debug('Cache key invalidated', { key, deleted: result > 0 })
    return result > 0
  } catch (error) {
    logger.error('Cache key invalidation failed', error instanceof Error ? error : new Error(String(error)), {
      key,
    })
    return false
  }
}

/**
 * Wrap an async function with caching logic
 * 
 * Higher-order function that adds caching to any async function.
 * Useful for creating reusable cached functions.
 * 
 * @template TArgs - Function argument types
 * @template TReturn - Function return type
 * @param fn - Function to wrap with cache
 * @param keyBuilder - Function that builds cache key from arguments
 * @param options - Cache options
 * @returns Wrapped function with caching
 * 
 * @example
 * ```ts
 * const getCachedUserItems = wrapWithCache(
 *   (tenantId: string, userId: string) => fetchItemsFromML(userId),
 *   (tenantId, userId) => buildCacheKey(CachePrefix.ML_ITEMS, tenantId, userId),
 *   { ttl: CacheTTL.LONG }
 * )
 * 
 * // Now call it like normal function, but with automatic caching
 * const items = await getCachedUserItems(tenantId, userId)
 * ```
 */
export function wrapWithCache<TArgs extends unknown[], TReturn>(
  fn: (...args: TArgs) => Promise<TReturn>,
  keyBuilder: (...args: TArgs) => string,
  options: Omit<CacheOptions, 'context'> = {}
) {
  return async (...args: TArgs): Promise<TReturn> => {
    const key = keyBuilder(...args)
    return getCached(key, () => fn(...args), {
      ...options,
      context: { fnName: fn.name, args: args.map(String) },
    })
  }
}

/**
 * Get multiple cache entries at once
 * 
 * Batch operation for fetching multiple cache keys efficiently.
 * 
 * @template T - Type of cached data
 * @param keys - Array of cache keys
 * @returns Array of cached values (null for misses)
 * 
 * @example
 * ```ts
 * const keys = userIds.map(id => buildCacheKey(CachePrefix.ML_USER, id))
 * const users = await getManyCached<User>(keys)
 * ```
 */
export async function getManyCached<T>(keys: string[]): Promise<(T | null)[]> {
  if (keys.length === 0) return []

  try {
    const redis = getRedisClient()
    // Use Promise.all to get multiple keys
    const promises = keys.map(key => redis.get<T>(key))
    const values = await Promise.all(promises)
    
    const hits = values.filter(v => v !== null).length
    logger.debug('Cache batch GET', { keysRequested: keys.length, hits })
    return values
  } catch (error) {
    logger.error('Cache batch GET failed', error instanceof Error ? error : new Error(String(error)), {
      keysCount: keys.length,
    })
    return keys.map(() => null)
  }
}
