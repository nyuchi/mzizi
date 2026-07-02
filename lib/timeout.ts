/**
 * Promise timeout wrapper for the Nyuchi ecosystem.
 *
 * Wraps any async operation with a configurable timeout. Used by the circuit
 * breaker, fallback chain, and any operation that should not hang indefinitely.
 *
 * Install via: npx shadcn@latest add https://mzizi.dev/api/v1/ui/timeout
 */

/**
 * Error thrown when an operation exceeds its timeout.
 *
 * @example
 * ```ts
 * try {
 *   await withTimeout(() => fetch("/api/weather"), 5000)
 * } catch (error) {
 *   if (error instanceof TimeoutError) {
 *     console.log(error.durationMs) // 5000
 *   }
 * }
 * ```
 */
export class TimeoutError extends Error {
  readonly durationMs: number
  readonly label: string

  constructor(ms: number, label?: string) {
    const tag = label ? ` [${label}]` : ""
    super(`Operation timed out after ${ms}ms${tag}`)
    this.name = "TimeoutError"
    this.durationMs = ms
    this.label = label ?? "unknown"
  }
}

/**
 * Wrap an async function with a timeout.
 *
 * If the function does not resolve within `ms` milliseconds, the promise
 * rejects with a `TimeoutError`. The underlying operation is NOT cancelled
 * (JavaScript has no cancellation primitive), but its result is ignored.
 *
 * @example
 * ```ts
 * import { withTimeout, TimeoutError } from "@/lib/timeout"
 *
 * // Basic usage
 * const data = await withTimeout(() => fetch("/api/data"), 5000)
 *
 * // With label for debugging
 * const weather = await withTimeout(
 *   () => fetch("https://api.tomorrow.io/v4/weather"),
 *   5000,
 *   "tomorrow-io-fetch"
 * )
 *
 * // Catch timeout specifically
 * try {
 *   await withTimeout(() => slowOperation(), 3000, "slow-op")
 * } catch (error) {
 *   if (error instanceof TimeoutError) {
 *     log.warn(`${error.label} timed out`, { data: { ms: error.durationMs } })
 *   }
 * }
 * ```
 */
export async function withTimeout<T>(fn: () => Promise<T>, ms: number, label?: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    let settled = false

    const timer = setTimeout(() => {
      if (!settled) {
        settled = true
        reject(new TimeoutError(ms, label))
      }
    }, ms)

    fn().then(
      (result) => {
        if (!settled) {
          settled = true
          clearTimeout(timer)
          resolve(result)
        }
      },
      (error) => {
        if (!settled) {
          settled = true
          clearTimeout(timer)
          reject(error)
        }
      }
    )
  })
}
