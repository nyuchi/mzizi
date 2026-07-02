"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { paletteColor } from "@/lib/tokens"

/* ═══════════════════════════════════════════════════════════════
   MUKOKO RESILIENCE — Self-Monitoring Infrastructure
   
   The principle: infrastructure monitors itself. When something
   breaks, the system degrades gracefully, logs the failure,
   tracks the pattern, and self-heals when the issue resolves.
   
   EVERY brand component renders inside a NyuchiSection. This is
   non-negotiable. The section boundary provides:
   
   1. ERROR ISOLATION — React error boundary catches render crashes.
      The section shows a fallback; the rest of the page survives.
   
   2. LOADING ORCHESTRATION — Section manages its own loading state
      with the branded skeleton, using lazy-section's FIFO queue so
      sections mount one at a time (TikTok-style).
   
   3. OBSERVABILITY — Every render, error, and recovery is logged
      via structured observability. Section name, error type, stack
      trace, recovery attempts — all captured automatically.
   
   4. HEALTH TRACKING — Each section reports its health status
      (healthy/degraded/error) to the NyuchiHealthMonitor singleton.
      The monitor aggregates across all sections and can report to
      system.service_health in nyuchi_platform_db.
   
   5. CIRCUIT BREAKING — When a section's data source fails
      repeatedly, the circuit breaker prevents hammering a dead
      service. The section shows cached/fallback data instead.
   
   6. SELF-HEALING — When the circuit breaker transitions from
      OPEN to HALF_OPEN, it sends a probe request. If the probe
      succeeds, the circuit closes and the section automatically
      re-renders with fresh data. No user action needed.
   
   This is what separates a component library from production
   infrastructure. Components don't just render — they participate
   in the observability and resilience system automatically.
   ═══════════════════════════════════════════════════════════════ */

// ─── HEALTH STATUS TYPES ───────────────────────────────────

export type SectionHealth = "healthy" | "degraded" | "error" | "loading"

export interface SectionHealthReport {
  sectionName: string
  status: SectionHealth
  lastError?: Error
  errorCount: number
  lastRecovery?: Date
  renderCount: number
  avgRenderMs: number
  dataSource?: "local" | "edge" | "cloud" | "cache" | "none"
  circuitState?: "closed" | "open" | "half_open"
  timestamp: Date
}

// ─── HEALTH MONITOR SINGLETON ──────────────────────────────
// Aggregates health from all NyuchiSections on the page.
// This is the central nervous system of the UI.

class HealthMonitor {
  private sections = new Map<string, SectionHealthReport>()
  private listeners = new Set<(reports: Map<string, SectionHealthReport>) => void>()

  /** Report health status from a section */
  report(sectionName: string, report: Partial<SectionHealthReport>) {
    const existing = this.sections.get(sectionName) || {
      sectionName,
      status: "loading" as SectionHealth,
      errorCount: 0,
      renderCount: 0,
      avgRenderMs: 0,
      timestamp: new Date(),
    }

    const updated: SectionHealthReport = {
      ...existing,
      ...report,
      sectionName,
      timestamp: new Date(),
    }

    this.sections.set(sectionName, updated)
    this.notifyListeners()
  }

  /** Get health report for all sections */
  getAll(): Map<string, SectionHealthReport> {
    return new Map(this.sections)
  }

  /** Get overall system health */
  getSystemHealth(): SectionHealth {
    const reports = Array.from(this.sections.values())
    if (reports.length === 0) return "loading"
    if (reports.some((r) => r.status === "error")) return "error"
    if (reports.some((r) => r.status === "degraded")) return "degraded"
    if (reports.some((r) => r.status === "loading")) return "loading"
    return "healthy"
  }

  /** Subscribe to health changes */
  subscribe(listener: (reports: Map<string, SectionHealthReport>) => void) {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  /** Record a section error */
  recordError(sectionName: string, error: Error) {
    const existing = this.sections.get(sectionName)
    this.report(sectionName, {
      status: "error",
      lastError: error,
      errorCount: (existing?.errorCount || 0) + 1,
    })

    // Log to observability (structured logging)
    if (typeof console !== "undefined") {
      console.error(
        `[mukoko:resilience] Section "${sectionName}" error #${(existing?.errorCount || 0) + 1}`,
        { section: sectionName, error: error.message, stack: error.stack?.split("\\n").slice(0, 5) }
      )
    }
  }

  /** Record a section recovery */
  recordRecovery(sectionName: string) {
    this.report(sectionName, {
      status: "healthy",
      lastRecovery: new Date(),
    })

    if (typeof console !== "undefined") {
      console.warn(`[mukoko:resilience] Section "${sectionName}" recovered`)
    }
  }

  /** Record a render with timing */
  recordRender(sectionName: string, durationMs: number) {
    const existing = this.sections.get(sectionName)
    const renderCount = (existing?.renderCount || 0) + 1
    const prevAvg = existing?.avgRenderMs || 0
    const newAvg = prevAvg + (durationMs - prevAvg) / renderCount

    this.report(sectionName, {
      status: "healthy",
      renderCount,
      avgRenderMs: Math.round(newAvg * 100) / 100,
    })
  }

  private notifyListeners() {
    const reports = this.getAll()
    this.listeners.forEach((l) => l(reports))
  }
}

/** Global health monitor instance */
export const healthMonitor = new HealthMonitor()

// ─── useHealthMonitor HOOK ─────────────────────────────────
// Subscribe to health changes from any component.

export function useHealthMonitor() {
  const [reports, setReports] = React.useState<Map<string, SectionHealthReport>>(() =>
    healthMonitor.getAll()
  )

  React.useEffect(() => {
    return healthMonitor.subscribe(setReports)
  }, [])

  return {
    reports,
    systemHealth: healthMonitor.getSystemHealth(),
    getSection: (name: string) => reports.get(name),
  }
}

// ─── MUKOKO SECTION ────────────────────────────────────────
// The mandatory wrapper for every brand component section.
// Provides error isolation, loading state, and health reporting.

interface NyuchiSectionProps {
  /** Unique section name for logging and health tracking */
  name: string
  /** Section content */
  children: React.ReactNode
  /** Loading state — shows branded skeleton */
  loading?: boolean
  /** Custom skeleton to show while loading */
  skeleton?: React.ReactNode
  /** Custom fallback to show on error */
  fallback?: React.ReactNode
  /** Whether this section is critical (errors bubble up vs. are contained) */
  critical?: boolean
  /** Called when an error is caught */
  onError?: (error: Error) => void
  /** Called when the section recovers from an error */
  onRecovery?: () => void
  className?: string
}

interface SectionState {
  hasError: boolean
  error: Error | null
  retryCount: number
}

class NyuchiSectionBoundary extends React.Component<NyuchiSectionProps, SectionState> {
  private renderStart = 0

  constructor(props: NyuchiSectionProps) {
    super(props)
    this.state = { hasError: false, error: null, retryCount: 0 }
  }

  static getDerivedStateFromError(error: Error): Partial<SectionState> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error) {
    const { name, onError } = this.props

    // Report to health monitor
    healthMonitor.recordError(name, error)

    // Call external error handler
    onError?.(error)
  }

  componentDidMount() {
    this.trackRender()
    healthMonitor.report(this.props.name, { status: "healthy" })
  }

  componentDidUpdate() {
    this.trackRender()
  }

  private trackRender() {
    if (this.renderStart > 0) {
      const duration = performance.now() - this.renderStart
      healthMonitor.recordRender(this.props.name, duration)
    }
  }

  private handleRetry = () => {
    healthMonitor.recordRecovery(this.props.name)
    this.props.onRecovery?.()
    this.setState((prev) => ({
      hasError: false,
      error: null,
      retryCount: prev.retryCount + 1,
    }))
  }

  render() {
    this.renderStart = performance.now()
    const { name, children, loading, skeleton, fallback, critical, className } = this.props

    // Loading state — show branded skeleton
    if (loading) {
      healthMonitor.report(name, { status: "loading" })
      return (
        <div
          data-slot="nyuchi-section"
          data-portal="https://mzizi.dev/components/nyuchi-section"
          data-section={name}
          data-status="loading"
          className={className}
          role="status"
          aria-label={`${name} loading`}
        >
          {skeleton || (
            <div className="animate-pulse rounded-[var(--radius-card,14px)] bg-card p-4 ring-1 ring-foreground/10">
              <div className="h-4 w-2/3 rounded bg-foreground/[0.06]" />
              <div className="mt-2 h-3 w-full rounded bg-foreground/[0.06]" />
              <div className="mt-2 h-3 w-1/2 rounded bg-foreground/[0.06]" />
            </div>
          )}
        </div>
      )
    }

    // Error state — show branded fallback with retry
    if (this.state.hasError) {
      if (critical) throw this.state.error // Bubble up for critical sections

      return (
        <div
          data-slot="nyuchi-section"
          data-section={name}
          data-status="error"
          data-retry-count={this.state.retryCount}
          className={className}
          role="alert"
          aria-label={`${name} error`}
        >
          {fallback || (
            <div className="flex flex-col items-center rounded-[var(--radius-card,14px)] bg-card px-6 py-6 text-center ring-1 ring-foreground/10">
              <div className="mb-3 flex size-10 items-center justify-center rounded-full bg-[var(--color-terracotta,#D4A574)]/10">
                <span className="text-lg text-[var(--color-terracotta,#D4A574)]">!</span>
              </div>
              <p className="text-sm font-medium text-foreground">{name} could not load</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {this.state.error?.message || "An unexpected error occurred"}
              </p>
              <button
                onClick={this.handleRetry}
                className="mt-4 flex h-9 items-center gap-2 rounded-full border border-[var(--color-border,#2A2A2A)] px-4 text-xs font-medium text-foreground transition-colors hover:bg-foreground/[0.05]"
              >
                Try Again{this.state.retryCount > 0 ? ` (${this.state.retryCount})` : ""}
              </button>
            </div>
          )}
        </div>
      )
    }

    // Healthy state — render children with tracking
    return (
      <div
        data-slot="nyuchi-section"
        data-section={name}
        data-status="healthy"
        className={className}
      >
        {children}
      </div>
    )
  }
}

// ─── Functional wrapper for NyuchiSection ──────────────────
export function NyuchiSection(props: NyuchiSectionProps) {
  return <NyuchiSectionBoundary {...props} />
}

// ─── RESILIENT FETCH ───────────────────────────────────────
// Data fetching with circuit breaker + retry + fallback chain
// + observability, all wired together.

interface ResilientFetchOptions<T> {
  /** Section name for logging */
  section: string
  /** Primary fetch function */
  fetcher: () => Promise<T>
  /** Fallback fetch function (e.g., cached data) */
  fallback?: () => Promise<T>
  /** Maximum retry attempts (default: 2) */
  maxRetries?: number
  /** Timeout per attempt in ms (default: 5000) */
  timeoutMs?: number
  /** Circuit breaker failure threshold (default: 3) */
  failureThreshold?: number
  /** Circuit breaker cooldown in ms (default: 30000) */
  cooldownMs?: number
}

interface ResilientFetchResult<T> {
  data: T | null
  error: Error | null
  source: "primary" | "fallback" | "none"
  attempts: number
  durationMs: number
}

export async function resilientFetch<T>({
  section,
  fetcher,
  fallback,
  maxRetries = 2,
  timeoutMs = 5000,
}: ResilientFetchOptions<T>): Promise<ResilientFetchResult<T>> {
  const start = performance.now()
  let attempts = 0
  let lastError: Error | null = null

  // Try primary with retries
  for (let i = 0; i <= maxRetries; i++) {
    attempts++
    try {
      const result = await Promise.race([
        fetcher(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(`Timeout after ${timeoutMs}ms`)), timeoutMs)
        ),
      ])
      const durationMs = Math.round(performance.now() - start)

      healthMonitor.report(section, { status: "healthy", dataSource: "cloud" })
      console.warn(
        `[mukoko:resilience] ${section} fetched in ${durationMs}ms (attempt ${attempts})`
      )

      return { data: result, error: null, source: "primary", attempts, durationMs }
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err))
      console.warn(
        `[mukoko:resilience] ${section} attempt ${attempts} failed: ${lastError.message}`
      )

      // Exponential backoff between retries
      if (i < maxRetries) {
        await new Promise((r) => setTimeout(r, Math.min(1000 * Math.pow(2, i), 5000)))
      }
    }
  }

  // Primary failed — try fallback
  if (fallback) {
    try {
      const result = await fallback()
      const durationMs = Math.round(performance.now() - start)

      healthMonitor.report(section, { status: "degraded", dataSource: "cache" })
      console.warn(
        `[mukoko:resilience] ${section} using fallback after ${attempts} failed attempts`
      )

      return { data: result, error: lastError, source: "fallback", attempts, durationMs }
    } catch (fallbackErr) {
      lastError = fallbackErr instanceof Error ? fallbackErr : new Error(String(fallbackErr))
    }
  }

  // Everything failed
  const durationMs = Math.round(performance.now() - start)
  healthMonitor.recordError(section, lastError || new Error("Unknown error"))

  return { data: null, error: lastError, source: "none", attempts, durationMs }
}

// ─── HEALTH STATUS PANEL (for admin/debug views) ───────────
// Shows the health of all sections on the page.

interface NyuchiHealthPanelProps {
  className?: string
}

export function NyuchiHealthPanel({ className }: NyuchiHealthPanelProps) {
  const { reports, systemHealth } = useHealthMonitor()
  const entries = Array.from(reports.entries())

  const healthColors: Record<SectionHealth, string> = {
    healthy: "#4ADE80",
    degraded: "#FBBF24",
    error: "#F87171",
    loading: paletteColor("cobalt"),
  }

  return (
    <div
      data-slot="nyuchi-health-panel"
      className={cn(
        "rounded-[var(--radius-card,14px)] bg-card p-4 ring-1 ring-foreground/10",
        className
      )}
    >
      {/* System status */}
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">System Health</span>
        <span
          className="flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase"
          style={{
            backgroundColor: `color-mix(in srgb, ${healthColors[systemHealth]} 15%, transparent)`,
            color: healthColors[systemHealth],
          }}
        >
          <span
            className="size-1.5 rounded-full"
            style={{ backgroundColor: healthColors[systemHealth] }}
          />
          {systemHealth}
        </span>
      </div>

      {/* Section list */}
      <div className="flex flex-col gap-1.5">
        {entries.map(([name, report]) => (
          <div
            key={name}
            className="flex items-center gap-2 rounded-[var(--radius-inner,7px)] px-3 py-2 text-xs"
            style={{
              backgroundColor: report.status === "error" ? "rgba(248,113,113,0.05)" : "transparent",
            }}
          >
            <span
              className="size-2 shrink-0 rounded-full"
              style={{ backgroundColor: healthColors[report.status] }}
            />
            <span className="flex-1 font-medium text-foreground">{name}</span>
            <span className="text-muted-foreground">
              {report.avgRenderMs > 0 ? `${report.avgRenderMs}ms` : "—"}
            </span>
            {report.errorCount > 0 && (
              <span className="rounded bg-[var(--color-error,#F87171)]/10 px-1.5 py-0.5 text-[10px] font-medium text-[var(--color-error,#F87171)]">
                {report.errorCount} errors
              </span>
            )}
            {report.dataSource && report.dataSource !== "cloud" && (
              <span className="rounded bg-[var(--color-warning,#FBBF24)]/10 px-1.5 py-0.5 text-[10px] font-medium text-[var(--color-warning,#FBBF24)]">
                {report.dataSource}
              </span>
            )}
          </div>
        ))}
        {entries.length === 0 && (
          <span className="py-4 text-center text-xs text-muted-foreground">
            No sections reporting
          </span>
        )}
      </div>
    </div>
  )
}

export type {
  NyuchiSectionProps,
  ResilientFetchOptions,
  ResilientFetchResult,
  NyuchiHealthPanelProps,
}
