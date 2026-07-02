/**
 * Token bucket rate limiter for the Nyuchi ecosystem.
 * Inspired by Resilience4j RateLimiter.
 *
 * Controls how many operations can execute within a time window.
 * Critical for protecting external API quotas (Tomorrow.io has 500/day,
 * Anthropic has token limits, government registries have strict throttles).
 *
 * Uses the token bucket algorithm:
 * - Bucket starts full (capacity = limit)
 * - Each call consumes one token
 * - Tokens refill at a fixed rate (limit per window)
 * - When empty, calls either wait or are rejected
 *
 * Install via: npx shadcn@latest add https://mzizi.dev/api/v1/ui/rate-limiter
 */

import { createLogger } from "@/lib/observability"

const logger = createLogger("rate-limiter")

export interface RateLimiterConfig {
  /** Identifier for this limiter (e.g., "tomorrow-io", "anthropic") */
  name: string
  /** Maximum number of calls allowed per window (default: 100) */
  limit: number
  /** Time window in ms (default: 60000 = 1 minute) */
  windowMs: number
  /** Maximum burst above the limit (default: 0 = no burst) */
  burstAllowance: number
  /** Whether to queue calls that exceed the limit instead of rejecting (default: false) */
  queueExcess: boolean
  /** Maximum time in ms to wait in queue (default: 5000) */
  maxWaitMs: number
  /** Called when a call is rate-limited */
  onLimit?: (name: string, remainingTokens: number) => void
}

const DEFAULT_CONFIG: Omit<RateLimiterConfig, "name"> = {
  limit: 100,
  windowMs: 60_000,
  burstAllowance: 0,
  queueExcess: false,
  maxWaitMs: 5_000,
}

/** Pre-configured limiter settings for known Nyuchi API providers */
export const API_RATE_CONFIGS = {
  /** Tomorrow.io: 500 calls/day, 25 per hour */
  "tomorrow-io": { limit: 25, windowMs: 3_600_000, burstAllowance: 5 },
  /** Open-Meteo: generous free tier, 10K/day */
  "open-meteo": { limit: 600, windowMs: 3_600_000, burstAllowance: 50 },
  /** Anthropic Claude: token-limited, rate varies by plan */
  anthropic: { limit: 60, windowMs: 60_000, burstAllowance: 10 },
  /** Government registries (ZIMRA, CIPC): very strict */
  "government-api": { limit: 10, windowMs: 60_000, burstAllowance: 0 },
  /** Supabase: generous but protect connection pool */
  supabase: { limit: 200, windowMs: 60_000, burstAllowance: 50 },
  /** Stytch auth: protect auth endpoints */
  stytch: { limit: 30, windowMs: 60_000, burstAllowance: 10 },
} as const satisfies Record<string, Partial<Omit<RateLimiterConfig, "name">>>

/**
 * Error thrown when a call is rejected by the rate limiter.
 */
export class RateLimitExceededError extends Error {
  readonly limiterName: string
  readonly limit: number
  readonly windowMs: number
  readonly retryAfterMs: number

  constructor(name: string, limit: number, windowMs: number, retryAfterMs: number) {
    super(
      `Rate limit exceeded for "${name}" — ${limit} calls per ${windowMs}ms. Retry after ${retryAfterMs}ms`
    )
    this.name = "RateLimitExceededError"
    this.limiterName = name
    this.limit = limit
    this.windowMs = windowMs
    this.retryAfterMs = retryAfterMs
  }
}

/**
 * Token bucket rate limiter.
 *
 * @example
 * ```ts
 * import { RateLimiter, API_RATE_CONFIGS } from "@/lib/rate-limiter"
 *
 * // Protect Tomorrow.io API quota
 * const weatherLimiter = new RateLimiter({
 *   name: "tomorrow-io",
 *   ...API_RATE_CONFIGS["tomorrow-io"],
 * })
 *
 * try {
 *   const data = await weatherLimiter.execute(() =>
 *     fetch("https://api.tomorrow.io/v4/weather/forecast")
 *   )
 * } catch (error) {
 *   if (error instanceof RateLimitExceededError) {
 *     // Use cached weather data instead
 *     return getCachedWeather()
 *   }
 * }
 *
 * // Check before calling
 * if (weatherLimiter.isAllowed) {
 *   await weatherLimiter.execute(() => fetchWeather())
 * }
 * ```
 */
export class RateLimiter {
  private tokens: number
  private lastRefill: number
  private readonly config: RateLimiterConfig

  constructor(config: Partial<RateLimiterConfig> & { name: string }) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.tokens = this.config.limit + this.config.burstAllowance
    this.lastRefill = Date.now()
  }

  /** Whether a call is currently allowed */
  get isAllowed(): boolean {
    this.refill()
    return this.tokens > 0
  }

  /** Number of remaining tokens in the bucket */
  get remaining(): number {
    this.refill()
    return Math.max(0, Math.floor(this.tokens))
  }

  /** Metrics snapshot */
  get metrics() {
    this.refill()
    return {
      name: this.config.name,
      remaining: Math.floor(this.tokens),
      limit: this.config.limit,
      burstAllowance: this.config.burstAllowance,
      windowMs: this.config.windowMs,
      utilization: 1 - this.tokens / (this.config.limit + this.config.burstAllowance),
    }
  }

  /** Time in ms until the next token is available */
  get retryAfterMs(): number {
    if (this.tokens > 0) return 0
    const refillRate = (this.config.limit + this.config.burstAllowance) / this.config.windowMs
    return Math.ceil(1 / refillRate)
  }

  /**
   * Execute a function through the rate limiter.
   * Consumes one token. If no tokens available, either waits or rejects.
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    this.refill()

    if (this.tokens >= 1) {
      this.tokens--
      return fn()
    }

    // No tokens available
    if (this.config.queueExcess) {
      // Wait for a token to become available
      const waitMs = Math.min(this.retryAfterMs, this.config.maxWaitMs)
      if (waitMs > this.config.maxWaitMs) {
        throw new RateLimitExceededError(
          this.config.name,
          this.config.limit,
          this.config.windowMs,
          waitMs
        )
      }

      logger.info(`Rate limited — waiting ${waitMs}ms for token`, {
        data: { name: this.config.name, remaining: Math.floor(this.tokens), waitMs },
      })
      await new Promise((r) => setTimeout(r, waitMs))

      this.refill()
      if (this.tokens >= 1) {
        this.tokens--
        return fn()
      }
    }

    const retryAfter = this.retryAfterMs
    logger.warn("Rate limit exceeded", {
      data: {
        name: this.config.name,
        limit: this.config.limit,
        windowMs: this.config.windowMs,
        retryAfterMs: retryAfter,
      },
    })
    this.config.onLimit?.(this.config.name, Math.floor(this.tokens))
    throw new RateLimitExceededError(
      this.config.name,
      this.config.limit,
      this.config.windowMs,
      retryAfter
    )
  }

  /** Manually reset the limiter (refills all tokens) */
  reset(): void {
    this.tokens = this.config.limit + this.config.burstAllowance
    this.lastRefill = Date.now()
  }

  /** Refill tokens based on elapsed time */
  private refill(): void {
    const now = Date.now()
    const elapsed = now - this.lastRefill
    const maxTokens = this.config.limit + this.config.burstAllowance
    const refillRate = maxTokens / this.config.windowMs // tokens per ms
    const tokensToAdd = elapsed * refillRate

    this.tokens = Math.min(maxTokens, this.tokens + tokensToAdd)
    this.lastRefill = now
  }
}
