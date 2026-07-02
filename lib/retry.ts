/**
 * Retry with exponential backoff for the Nyuchi ecosystem.
 *
 * Wraps async operations with configurable retry logic, exponential delays,
 * and jitter to prevent thundering herd problems.
 *
 * Install via: npx shadcn@latest add https://mzizi.dev/api/v1/ui/retry
 */

import { createLogger } from "@/lib/observability"

const logger = createLogger("retry")

export interface RetryConfig {
  /** Maximum number of attempts including the first try (default: 3) */
  maxAttempts: number
  /** Base delay in ms before first retry (default: 1000) */
  baseDelayMs: number
  /** Maximum delay in ms — caps exponential growth (default: 30000) */
  maxDelayMs: number
  /** Add random jitter to prevent thundering herd (default: true) */
  jitter: boolean
  /** Custom predicate — return false to skip retry for certain errors */
  retryIf?: (error: unknown, attempt: number) => boolean
  /** Called before each retry — useful for logging or metrics */
  onRetry?: (error: unknown, attempt: number, delayMs: number) => void
}

const DEFAULT_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelayMs: 1000,
  maxDelayMs: 30_000,
  jitter: true,
}

/**
 * Error thrown when all retry attempts are exhausted.
 */
export class RetriesExhaustedError extends Error {
  readonly attempts: number
  readonly lastError: unknown

  constructor(attempts: number, lastError: unknown) {
    const msg = lastError instanceof Error ? lastError.message : String(lastError)
    super(`All ${attempts} retry attempts exhausted. Last error: ${msg}`)
    this.name = "RetriesExhaustedError"
    this.attempts = attempts
    this.lastError = lastError
  }
}

function computeDelay(attempt: number, config: RetryConfig): number {
  // Exponential: baseDelay * 2^attempt
  const exponential = config.baseDelayMs * Math.pow(2, attempt)
  const capped = Math.min(exponential, config.maxDelayMs)

  if (config.jitter) {
    // Add 0–50% random jitter
    return capped + Math.random() * capped * 0.5
  }
  return capped
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Retry an async operation with exponential backoff.
 *
 * @example
 * ```ts
 * import { withRetry } from "@/lib/retry"
 *
 * // Basic usage — 3 attempts with 1s base delay
 * const data = await withRetry(() => fetch("/api/weather").then(r => r.json()))
 *
 * // Custom configuration
 * const result = await withRetry(
 *   () => fetchFromProvider(),
 *   {
 *     maxAttempts: 5,
 *     baseDelayMs: 500,
 *     retryIf: (error) => {
 *       // Don't retry 404s or 400s
 *       if (error instanceof Response && error.status < 500) return false
 *       return true
 *     },
 *   }
 * )
 *
 * // With git push retry pattern (from CLAUDE.md)
 * await withRetry(() => gitPush(), {
 *   maxAttempts: 4,
 *   baseDelayMs: 2000,  // 2s, 4s, 8s, 16s
 *   jitter: false,
 * })
 * ```
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  config?: Partial<RetryConfig>
): Promise<T> {
  const cfg = { ...DEFAULT_CONFIG, ...config }
  let lastError: unknown

  for (let attempt = 0; attempt < cfg.maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      const isLastAttempt = attempt === cfg.maxAttempts - 1

      // Check if we should retry this error
      if (!isLastAttempt && cfg.retryIf && !cfg.retryIf(error, attempt)) {
        logger.info("Retry skipped by predicate", {
          data: { attempt: attempt + 1, maxAttempts: cfg.maxAttempts },
        })
        throw error
      }

      if (!isLastAttempt) {
        const delay = computeDelay(attempt, cfg)
        logger.warn(
          `Attempt ${attempt + 1}/${cfg.maxAttempts} failed, retrying in ${Math.round(delay)}ms`,
          {
            data: {
              attempt: attempt + 1,
              maxAttempts: cfg.maxAttempts,
              delayMs: Math.round(delay),
            },
          }
        )
        cfg.onRetry?.(error, attempt + 1, delay)
        await sleep(delay)
      }
    }
  }

  logger.error(`All ${cfg.maxAttempts} attempts exhausted`, {
    data: { maxAttempts: cfg.maxAttempts },
    error: lastError instanceof Error ? lastError : new Error(String(lastError)),
  })
  throw new RetriesExhaustedError(cfg.maxAttempts, lastError)
}
