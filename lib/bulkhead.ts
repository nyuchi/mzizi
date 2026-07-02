/**
 * Bulkhead pattern for the Nyuchi ecosystem.
 * Inspired by Resilience4j Bulkhead — limits concurrent calls to a dependency
 * so one slow service cannot starve all available connections.
 *
 * Named after ship bulkheads: isolated compartments that prevent a single
 * breach from flooding the entire vessel.
 *
 * Two modes:
 * - Semaphore: limits max concurrent executions (default)
 * - Queue: limits max concurrent + max waiting in queue
 *
 * Install via: npx shadcn@latest add https://mzizi.dev/api/v1/ui/bulkhead
 */

import { createLogger } from "@/lib/observability"

const logger = createLogger("bulkhead")

export interface BulkheadConfig {
  /** Identifier for this bulkhead (e.g., "supabase-queries", "api-calls") */
  name: string
  /** Maximum number of concurrent executions allowed (default: 10) */
  maxConcurrent: number
  /** Maximum number of calls waiting in queue when at capacity (default: 0 = no queue, reject immediately) */
  maxQueue: number
  /** Maximum time in ms a call can wait in the queue before being rejected (default: 5000) */
  maxQueueWaitMs: number
  /** Called when a call is rejected due to bulkhead full */
  onReject?: (name: string, concurrent: number, queued: number) => void
}

const DEFAULT_CONFIG: Omit<BulkheadConfig, "name"> = {
  maxConcurrent: 10,
  maxQueue: 0,
  maxQueueWaitMs: 5_000,
}

/**
 * Error thrown when the bulkhead rejects a call because it is at capacity.
 */
export class BulkheadFullError extends Error {
  readonly bulkheadName: string
  readonly concurrent: number
  readonly queued: number

  constructor(name: string, concurrent: number, queued: number) {
    super(`Bulkhead "${name}" is full — ${concurrent} concurrent, ${queued} queued`)
    this.name = "BulkheadFullError"
    this.bulkheadName = name
    this.concurrent = concurrent
    this.queued = queued
  }
}

/**
 * Bulkhead that limits concurrent access to a resource.
 *
 * @example
 * ```ts
 * import { Bulkhead } from "@/lib/bulkhead"
 *
 * // Allow max 5 concurrent Supabase queries
 * const dbBulkhead = new Bulkhead({ name: "supabase", maxConcurrent: 5 })
 *
 * // With queue: allow 5 concurrent, 10 waiting
 * const apiBulkhead = new Bulkhead({ name: "external-api", maxConcurrent: 5, maxQueue: 10 })
 *
 * try {
 *   const data = await dbBulkhead.execute(() => supabase.from("events").select("*"))
 * } catch (error) {
 *   if (error instanceof BulkheadFullError) {
 *     // All slots occupied — show cached data or queue message
 *   }
 * }
 * ```
 */
export class Bulkhead {
  private activeCalls = 0
  private waitingQueue: Array<{
    resolve: () => void
    reject: (err: Error) => void
    timer: ReturnType<typeof setTimeout>
  }> = []
  private readonly config: BulkheadConfig

  constructor(config: Partial<BulkheadConfig> & { name: string }) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  /** Current number of active concurrent executions */
  get concurrent(): number {
    return this.activeCalls
  }

  /** Current number of calls waiting in queue */
  get queued(): number {
    return this.waitingQueue.length
  }

  /** Whether the bulkhead can accept another call */
  get isAvailable(): boolean {
    return (
      this.activeCalls < this.config.maxConcurrent ||
      this.waitingQueue.length < this.config.maxQueue
    )
  }

  /** Metrics snapshot */
  get metrics() {
    return {
      name: this.config.name,
      concurrent: this.activeCalls,
      queued: this.waitingQueue.length,
      maxConcurrent: this.config.maxConcurrent,
      maxQueue: this.config.maxQueue,
      utilization: this.activeCalls / this.config.maxConcurrent,
    }
  }

  /**
   * Execute a function within the bulkhead.
   * If at capacity, either queues (if maxQueue > 0) or rejects immediately.
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // If under capacity, execute immediately
    if (this.activeCalls < this.config.maxConcurrent) {
      return this.executeProtected(fn)
    }

    // If no queue configured or queue full, reject
    if (this.config.maxQueue <= 0 || this.waitingQueue.length >= this.config.maxQueue) {
      const error = new BulkheadFullError(
        this.config.name,
        this.activeCalls,
        this.waitingQueue.length
      )
      logger.warn("Call rejected — bulkhead full", {
        data: {
          name: this.config.name,
          concurrent: this.activeCalls,
          queued: this.waitingQueue.length,
        },
      })
      this.config.onReject?.(this.config.name, this.activeCalls, this.waitingQueue.length)
      throw error
    }

    // Queue the call
    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => {
        // Remove from queue on timeout
        this.waitingQueue = this.waitingQueue.filter((w) => w.timer !== timer)
        reject(new BulkheadFullError(this.config.name, this.activeCalls, this.waitingQueue.length))
      }, this.config.maxQueueWaitMs)

      this.waitingQueue.push({
        resolve: () => {
          clearTimeout(timer)
          this.executeProtected(fn).then(resolve, reject)
        },
        reject: (err: Error) => {
          clearTimeout(timer)
          reject(err)
        },
        timer,
      })

      logger.info("Call queued", {
        data: {
          name: this.config.name,
          queuePosition: this.waitingQueue.length,
          concurrent: this.activeCalls,
        },
      })
    })
  }

  private async executeProtected<T>(fn: () => Promise<T>): Promise<T> {
    this.activeCalls++
    try {
      const result = await fn()
      return result
    } finally {
      this.activeCalls--
      this.dequeueNext()
    }
  }

  private dequeueNext(): void {
    if (this.waitingQueue.length > 0 && this.activeCalls < this.config.maxConcurrent) {
      const next = this.waitingQueue.shift()
      next?.resolve()
    }
  }
}
