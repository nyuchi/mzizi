/**
 * Chaos testing utilities for the Nyuchi ecosystem.
 *
 * Netflix chaos engineering patterns for testing application resilience.
 * Inject random errors and latency to verify that circuit breakers,
 * fallback chains, and error boundaries work under stress.
 *
 * SAFETY: All chaos functions are disabled by default. You must explicitly
 * set `enabled: true` to activate them. Never enable in production.
 *
 * Install via: npx shadcn@latest add https://mzizi.dev/api/v1/ui/chaos
 */

import { createLogger } from "@/lib/observability"

const logger = createLogger("chaos")

export interface ChaosConfig {
  /** Master kill switch — chaos functions are no-ops when false (default: false) */
  enabled: boolean
  /** Probability of injecting an error, 0–1 (default: 0.3 = 30%) */
  errorRate: number
  /** Range for random latency injection in ms [min, max] (default: [100, 500]) */
  latencyMs: [number, number]
}

const DEFAULT_CONFIG: ChaosConfig = {
  enabled: false,
  errorRate: 0.3,
  latencyMs: [100, 500],
}

/**
 * Error injected by chaos testing. Distinguishable from real errors.
 */
export class ChaosError extends Error {
  readonly injected = true as const
  readonly chaosType: "error" | "latency"

  constructor(type: "error" | "latency", message?: string) {
    super(message ?? `Chaos ${type} injected`)
    this.name = "ChaosError"
    this.chaosType = type
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Wrap an async function with chaos injection.
 *
 * When enabled, randomly:
 * - Throws a ChaosError based on `errorRate`
 * - Adds random latency within `latencyMs` range
 *
 * When disabled (default), the function passes through unchanged.
 *
 * @example
 * ```ts
 * import { withChaos } from "@/lib/chaos"
 *
 * // In development/testing only
 * const data = await withChaos(
 *   () => fetch("/api/weather"),
 *   { enabled: process.env.NODE_ENV === "development", errorRate: 0.5 }
 * )
 *
 * // Combined with circuit breaker for resilience testing
 * const result = await breaker.execute(() =>
 *   withChaos(() => fetchProvider(), { enabled: true, errorRate: 0.4 })
 * )
 * ```
 */
export async function withChaos<T>(
  fn: () => Promise<T>,
  config?: Partial<ChaosConfig>
): Promise<T> {
  const cfg = { ...DEFAULT_CONFIG, ...config }

  if (!cfg.enabled) {
    return fn()
  }

  // Random error injection
  if (Math.random() < cfg.errorRate) {
    logger.warn("Injecting random error", {
      data: { errorRate: cfg.errorRate },
    })
    throw new ChaosError(
      "error",
      `Chaos: random failure (${Math.round(cfg.errorRate * 100)}% rate)`
    )
  }

  // Random latency injection
  const [minLatency, maxLatency] = cfg.latencyMs
  const latency = Math.round(minLatency + Math.random() * (maxLatency - minLatency))
  if (latency > 0) {
    logger.info(`Injecting ${latency}ms latency`, {
      data: { latencyMs: latency, range: cfg.latencyMs },
    })
    await sleep(latency)
  }

  return fn()
}

/**
 * Create a chaos middleware function with fixed configuration.
 *
 * @example
 * ```ts
 * import { chaosMiddleware } from "@/lib/chaos"
 *
 * const devChaos = chaosMiddleware({
 *   enabled: true,
 *   errorRate: 0.2,
 *   latencyMs: [50, 200],
 * })
 *
 * // Wrap any operation
 * const data = await devChaos(() => fetchWeather())
 * const user = await devChaos(() => getUser(id))
 * ```
 */
export function chaosMiddleware(
  config?: Partial<ChaosConfig>
): <T>(fn: () => Promise<T>) => Promise<T> {
  return <T>(fn: () => Promise<T>) => withChaos(fn, config)
}

/**
 * Create a chaos-wrapped version of a function for testing.
 *
 * @example
 * ```ts
 * const riskyFetch = chaosWrap(
 *   (url: string) => fetch(url).then(r => r.json()),
 *   { enabled: true, errorRate: 0.5 }
 * )
 *
 * // Use like the original function — chaos is injected transparently
 * const data = await riskyFetch("/api/data")
 * ```
 */
export function chaosWrap<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
  config?: Partial<ChaosConfig>
): (...args: TArgs) => Promise<TResult> {
  return (...args: TArgs) => withChaos(() => fn(...args), config)
}
