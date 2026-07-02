/**
 * Fallback chain for the Nyuchi ecosystem.
 *
 * Implements the sequential fallback strategy from mukoko-weather:
 * try stages in order, return the first success. Each stage has an
 * independent timeout. If all stages fail, throw with all collected errors.
 *
 * Production example from mukoko-weather:
 *   MongoDB cache (15min TTL) → Tomorrow.io → Open-Meteo → seasonal estimates
 *
 * Install via: npx shadcn@latest add https://mzizi.dev/api/v1/ui/fallback-chain
 */

import { withTimeout, TimeoutError } from "@/lib/timeout"
import { createLogger } from "@/lib/observability"

const logger = createLogger("fallback")

export interface FallbackStage<T> {
  /** Human-readable name for logging (e.g., "mongodb-cache", "tomorrow-io") */
  name: string
  /** The async operation to attempt */
  execute: () => Promise<T>
  /** Per-stage timeout in ms (default: no timeout) */
  timeoutMs?: number
}

/**
 * Error thrown when all fallback stages fail.
 */
export class AllStagesFailedError extends Error {
  readonly stageErrors: Array<{ stage: string; error: unknown }>

  constructor(stageErrors: Array<{ stage: string; error: unknown }>) {
    const names = stageErrors.map((s) => s.stage).join(" → ")
    super(`All fallback stages failed: ${names}`)
    this.name = "AllStagesFailedError"
    this.stageErrors = stageErrors
  }
}

/**
 * Execute stages in order, returning the first successful result.
 *
 * @example
 * ```ts
 * import { withFallback } from "@/lib/fallback-chain"
 *
 * // Weather data fallback (from mukoko-weather production)
 * const weather = await withFallback([
 *   {
 *     name: "mongodb-cache",
 *     execute: () => getCachedWeather(slug),
 *     timeoutMs: 2000,
 *   },
 *   {
 *     name: "tomorrow-io",
 *     execute: () => fetchTomorrowIO(lat, lon),
 *     timeoutMs: 5000,
 *   },
 *   {
 *     name: "open-meteo",
 *     execute: () => fetchOpenMeteo(lat, lon),
 *     timeoutMs: 8000,
 *   },
 *   {
 *     name: "seasonal-estimate",
 *     execute: () => getSeasonalEstimate(lat, lon, month),
 *   },
 * ])
 * ```
 */
export async function withFallback<T>(stages: FallbackStage<T>[]): Promise<T> {
  if (stages.length === 0) {
    throw new Error("withFallback requires at least one stage")
  }

  const errors: Array<{ stage: string; error: unknown }> = []

  for (const stage of stages) {
    try {
      const result = stage.timeoutMs
        ? await withTimeout(stage.execute, stage.timeoutMs, stage.name)
        : await stage.execute()

      logger.info(`Stage "${stage.name}" succeeded`, {
        data: {
          stage: stage.name,
          attemptNumber: errors.length + 1,
          totalStages: stages.length,
        },
      })

      return result
    } catch (error) {
      const isTimeout = error instanceof TimeoutError
      errors.push({ stage: stage.name, error })

      logger.warn(`Stage "${stage.name}" failed${isTimeout ? " (timeout)" : ""}`, {
        data: {
          stage: stage.name,
          attemptNumber: errors.length,
          totalStages: stages.length,
          isTimeout,
        },
        error: error instanceof Error ? error : new Error(String(error)),
      })
    }
  }

  logger.error("All fallback stages exhausted", {
    data: {
      stages: errors.map((e) => e.stage),
      totalStages: stages.length,
    },
  })

  throw new AllStagesFailedError(errors)
}
