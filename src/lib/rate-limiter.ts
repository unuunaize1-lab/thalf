/**
 * Abstract Rate Limiting System for THALF Authentication
 * Provides InMemoryRateLimiter for dev/testing and RedisRateLimiter stub for production.
 */

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetSeconds: number;
}

export interface RateLimiter {
  check(key: string, maxAttempts?: number, windowSeconds?: number): Promise<RateLimitResult>;
}

class InMemoryRateLimiterStore implements RateLimiter {
  private hits: Map<string, { count: number; expiresAt: number }> = new Map();

  async check(key: string, maxAttempts: number = 5, windowSeconds: number = 900): Promise<RateLimitResult> {
    const now = Date.now();
    const record = this.hits.get(key);

    if (!record || record.expiresAt < now) {
      const expiresAt = now + windowSeconds * 1000;
      this.hits.set(key, { count: 1, expiresAt });
      return {
        success: true,
        limit: maxAttempts,
        remaining: maxAttempts - 1,
        resetSeconds: windowSeconds,
      };
    }

    if (record.count >= maxAttempts) {
      const resetSeconds = Math.ceil((record.expiresAt - now) / 1000);
      return {
        success: false,
        limit: maxAttempts,
        remaining: 0,
        resetSeconds,
      };
    }

    record.count += 1;
    const resetSeconds = Math.ceil((record.expiresAt - now) / 1000);
    return {
      success: true,
      limit: maxAttempts,
      remaining: maxAttempts - record.count,
      resetSeconds,
    };
  }

  // Helper method for testing to reset rate limit states
  reset(): void {
    this.hits.clear();
  }
}

class RedisRateLimiterStore implements RateLimiter {
  async check(key: string, maxAttempts: number = 5, windowSeconds: number = 900): Promise<RateLimitResult> {
    // Production stub: In a full Redis setup, Upstash Redis client performs ratelimit
    // Fallback to in-memory for current environment
    return inMemoryRateLimiter.check(key, maxAttempts, windowSeconds);
  }
}

export const inMemoryRateLimiter = new InMemoryRateLimiterStore();
export const redisRateLimiter = new RedisRateLimiterStore();

export const authRateLimiter: RateLimiter =
  process.env.NODE_ENV === 'production' && process.env.UPSTASH_REDIS_REST_URL
    ? redisRateLimiter
    : inMemoryRateLimiter;
