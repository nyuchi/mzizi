/**
 * Netflix Hystrix-inspired circuit breaker for the Nyuchi ecosystem.
 *
 * Prevents cascading failures by tracking error rates per external dependency
 * and short-circuiting calls when a provider is unhealthy. Ported from
 * mukoko-weather's production Python implementation.
 *
 * State machine: CLOSED → OPEN → HALF_OPEN → CLOSED (success) or OPEN (failure)
 *
 * Install via: npx shadcn@latest add https://mzizi.dev/api/v1/ui/circuit-breaker
 */

import { withTimeout } from "@/lib/timeout"
import { createLogger } from "@/lib/observability"

const logger = createLogger("circuit-breaker")

export type CircuitState = "closed" | "open" | "half_open"

export interface CircuitBreakerConfig {
  /** Identifier for this breaker (e.g., "tomorrow-io", "mongodb") */
  name: string
  /** Number of failures within windowMs before opening the circuit (default: 3) */
  failureThreshold: number
  /** Time in ms to stay OPEN before transitioning to HALF_OPEN (default: 30000) */
  cooldownMs: number
  /** Sliding window in ms for counting failures (default: 60000) */
  windowMs: number
  /** Per-call timeout in ms — calls exceeding this are treated as failures (default: 5000) */
  timeoutMs: number
  /** Optional callback when the circuit changes state */
  onStateChange?: (from: CircuitState, to: CircuitState, name: string) => void
}

const DEFAULT_CONFIG: Omit<CircuitBreakerConfig, "name"> = {
  failureThreshold: 3,
  cooldownMs: 30_000,
  windowMs: 60_000,
  timeoutMs: 5_000,
}

/**
 * Pre-configured breaker settings for common Nyuchi providers.
 * Based on production tuning from mukoko-weather.
 */
export const PROVIDER_CONFIGS = {
  /** Tomorrow.io: aggressive — fails fast, recovers quickly */
  "tomorrow-io": { failureThreshold: 3, cooldownMs: 120_000, windowMs: 300_000, timeoutMs: 5_000 },
  /** Open-Meteo: lenient — tolerates more failures, longer cooldown */
  "open-meteo": { failureThreshold: 5, cooldownMs: 300_000, windowMs: 300_000, timeoutMs: 8_000 },
  /** Anthropic Claude: conservative — protect AI budget */
  anthropic: { failureThreshold: 3, cooldownMs: 300_000, windowMs: 600_000, timeoutMs: 15_000 },
  /** MongoDB: very lenient — database should be highly available */
  mongodb: { failureThreshold: 5, cooldownMs: 60_000, windowMs: 120_000, timeoutMs: 10_000 },
} as const satisfies Record<string, Omit<CircuitBreakerConfig, "name">>

/**
 * Error thrown when a call is rejected because the circuit is open.
 */
export class CircuitOpenError extends Error {
  readonly breakerName: string
  readonly state: CircuitState

  constructor(name: string) {
    super(`Circuit breaker "${name}" is open — call rejected`)
    this.name = "CircuitOpenError"
    this.breakerName = name
    this.state = "open"
  }
}

/**
 * Circuit breaker that wraps async operations with failure tracking and
 * automatic short-circuiting.
 *
 * @example
 * ```ts
 * import { CircuitBreaker, PROVIDER_CONFIGS } from "@/lib/circuit-breaker"
 *
 * const weatherBreaker = new CircuitBreaker({
 *   name: "tomorrow-io",
 *   ...PROVIDER_CONFIGS["tomorrow-io"],
 * })
 *
 * try {
 *   const data = await weatherBreaker.execute(() =>
 *     fetch("https://api.tomorrow.io/v4/weather/forecast")
 *   )
 * } catch (error) {
 *   if (error instanceof CircuitOpenError) {
 *     // Circuit is open — use fallback
 *     return getCachedWeather()
 *   }
 * }
 * ```
 */
export class CircuitBreaker {
  private _state: CircuitState = "closed"
  private failures: number[] = [] // timestamps of recent failures
  private lastFailureTime = 0
  private readonly config: CircuitBreakerConfig

  constructor(config: Partial<CircuitBreakerConfig> & { name: string }) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  /** Current circuit state */
  get state(): CircuitState {
    this.evaluateState()
    return this._state
  }

  /** Whether the circuit will allow the next call through */
  get isAllowed(): boolean {
    this.evaluateState()
    return this._state !== "open"
  }

  /** Number of failures in the current sliding window */
  get failureCount(): number {
    this.pruneOldFailures()
    return this.failures.length
  }

  /**
   * Execute an async function through the circuit breaker.
   *
   * - If CLOSED: executes normally, tracks failures
   * - If OPEN: rejects immediately with CircuitOpenError
   * - If HALF_OPEN: allows one probe call — success closes, failure re-opens
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    this.evaluateState()

    if (this._state === "open") {
      logger.warn(`Call rejected — circuit open`, {
        data: { name: this.config.name, failureCount: this.failures.length },
      })
      throw new CircuitOpenError(this.config.name)
    }

    try {
      const result = await withTimeout(fn, this.config.timeoutMs, this.config.name)
      this.recordSuccess()
      return result
    } catch (error) {
      this.recordFailure()
      throw error
    }
  }

  /** Manually reset the circuit to CLOSED state */
  reset(): void {
    const prev = this._state
    this._state = "closed"
    this.failures = []
    this.lastFailureTime = 0
    if (prev !== "closed") {
      this.transition(prev, "closed")
    }
  }

  private evaluateState(): void {
    const now = Date.now()
    this.pruneOldFailures()

    if (this._state === "closed") {
      if (this.failures.length >= this.config.failureThreshold) {
        this.transition("closed", "open")
        this._state = "open"
      }
    } else if (this._state === "open") {
      if (now - this.lastFailureTime >= this.config.cooldownMs) {
        this.transition("open", "half_open")
        this._state = "half_open"
      }
    }
    // half_open stays until success (→ closed) or failure (→ open)
  }

  private recordSuccess(): void {
    if (this._state === "half_open") {
      this.transition("half_open", "closed")
      this._state = "closed"
      this.failures = []
    }
  }

  private recordFailure(): void {
    const now = Date.now()
    this.failures.push(now)
    this.lastFailureTime = now

    if (this._state === "half_open") {
      this.transition("half_open", "open")
      this._state = "open"
    }
  }

  private pruneOldFailures(): void {
    const cutoff = Date.now() - this.config.windowMs
    this.failures = this.failures.filter((t) => t > cutoff)
  }

  private transition(from: CircuitState, to: CircuitState): void {
    logger.info(`State transition: ${from} → ${to}`, {
      data: {
        name: this.config.name,
        from,
        to,
        failureCount: this.failures.length,
        threshold: this.config.failureThreshold,
      },
    })
    this.config.onStateChange?.(from, to, this.config.name)
  }
}
