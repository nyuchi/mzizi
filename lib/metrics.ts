/**
 * Usage Metrics — fire-and-forget event tracking for public observability
 *
 * Records API calls and MCP tool invocations in the `usage_events` table.
 * Inserts are non-blocking (fire-and-forget) so they never slow down responses.
 *
 * Data is exposed publicly via GET /api/v1/stats — aligned with the open data philosophy.
 */

import { getAdminClient, getPublicClient, isAdminConfigured, isSupabaseConfigured } from "@/lib/db"

export interface TrackApiCallOptions {
  endpoint: string
  durationMs: number
  statusCode: number
  componentName?: string
}

export interface TrackMcpToolOptions {
  toolName: string
  durationMs: number
  componentName?: string
  isError?: boolean
}

/**
 * Track an API route call. Fire-and-forget — never throws.
 */
export function trackApiCall(opts: TrackApiCallOptions): void {
  // Writes go through the service-role client — no-op cleanly when it isn't configured.
  if (!isAdminConfigured()) return

  const isError = opts.statusCode >= 400

  // Non-blocking insert — intentionally not awaited
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  void (getAdminClient() as any)
    .from("usage_events")
    .insert({
      event_type: "api_call",
      endpoint: opts.endpoint,
      component_name: opts.componentName ?? null,
      duration_ms: opts.durationMs,
      status_code: opts.statusCode,
      is_error: isError,
    })
    .then(() => {
      // silent success
    })
    .catch(() => {
      // silent failure — metrics must never affect the critical path
    })
}

/**
 * Track an MCP tool invocation. Fire-and-forget — never throws.
 */
export function trackMcpTool(opts: TrackMcpToolOptions): void {
  if (!isAdminConfigured()) return

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  void (getAdminClient() as any)
    .from("usage_events")
    .insert({
      event_type: "mcp_tool",
      tool_name: opts.toolName,
      component_name: opts.componentName ?? null,
      duration_ms: opts.durationMs,
      is_error: opts.isError ?? false,
    })
    .then(() => {})
    .catch(() => {})
}

// ── Aggregate query helpers ─────────────────────────────────────────

export interface EndpointStat {
  endpoint: string
  total_calls: number
  error_calls: number
  avg_duration_ms: number
  p95_duration_ms: number
  error_rate: number
}

export interface ToolStat {
  tool_name: string
  total_calls: number
  error_calls: number
  avg_duration_ms: number
}

export interface ComponentStat {
  component_name: string
  total_calls: number
}

export interface UsageStats {
  period_days: number
  total_api_calls: number
  total_mcp_calls: number
  total_errors: number
  overall_error_rate: number
  avg_duration_ms: number
  top_endpoints: EndpointStat[]
  top_mcp_tools: ToolStat[]
  top_components: ComponentStat[]
  calls_by_day: Array<{ date: string; api_calls: number; mcp_calls: number; errors: number }>
}

/**
 * Get aggregated usage statistics for the observability dashboard and /api/v1/stats.
 */
export async function getUsageStats(periodDays = 30): Promise<UsageStats> {
  if (!isSupabaseConfigured()) {
    return emptyStats(periodDays)
  }

  try {
    // Public, RLS-public read of usage_events — no need for the service-role key.
    const db = getPublicClient()
    const since = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000).toISOString()

    // Total counts
    const [apiTotal, mcpTotal, errorTotal, avgQuery] = await Promise.all([
      db
        .from("usage_events")
        .select("*", { count: "exact", head: true })
        .eq("event_type", "api_call")
        .gte("created_at", since),
      db
        .from("usage_events")
        .select("*", { count: "exact", head: true })
        .eq("event_type", "mcp_tool")
        .gte("created_at", since),
      db
        .from("usage_events")
        .select("*", { count: "exact", head: true })
        .eq("is_error", true)
        .gte("created_at", since),
      db
        .from("usage_events")
        .select("duration_ms")
        .gte("created_at", since)
        .not("duration_ms", "is", null),
    ])

    const totalApiCalls = apiTotal.count ?? 0
    const totalMcpCalls = mcpTotal.count ?? 0
    const totalErrors = errorTotal.count ?? 0
    const totalCalls = totalApiCalls + totalMcpCalls
    const overallErrorRate = totalCalls > 0 ? (totalErrors / totalCalls) * 100 : 0

    const durations = ((avgQuery.data ?? []) as unknown as Array<{ duration_ms: number | null }>)
      .map((r) => r.duration_ms)
      .filter((d): d is number => d !== null)
    const avgDuration =
      durations.length > 0 ? Math.round(durations.reduce((s, d) => s + d, 0) / durations.length) : 0

    // Top endpoints
    const endpointsQuery = await db
      .from("usage_events")
      .select("endpoint, duration_ms, is_error, status_code")
      .eq("event_type", "api_call")
      .gte("created_at", since)
      .not("endpoint", "is", null)

    const topEndpoints = aggregateEndpoints(
      (endpointsQuery.data ?? []) as unknown as Array<{
        endpoint: string
        duration_ms: number | null
        is_error: boolean
      }>
    )

    // Top MCP tools
    const toolsQuery = await db
      .from("usage_events")
      .select("tool_name, duration_ms, is_error")
      .eq("event_type", "mcp_tool")
      .gte("created_at", since)
      .not("tool_name", "is", null)

    const topMcpTools = aggregateTools(
      (toolsQuery.data ?? []) as unknown as Array<{
        tool_name: string
        duration_ms: number | null
        is_error: boolean
      }>
    )

    // Top components
    const componentsQuery = await db
      .from("usage_events")
      .select("component_name")
      .gte("created_at", since)
      .not("component_name", "is", null)

    const topComponents = aggregateComponents(
      (componentsQuery.data ?? []) as unknown as Array<{ component_name: string }>
    )

    // Daily breakdown
    const dailyQuery = await db
      .from("usage_events")
      .select("event_type, is_error, created_at")
      .gte("created_at", since)
      .order("created_at", { ascending: true })

    const callsByDay = aggregateByDay(
      (dailyQuery.data ?? []) as unknown as Array<{
        event_type: string
        is_error: boolean
        created_at: string
      }>,
      periodDays
    )

    return {
      period_days: periodDays,
      total_api_calls: totalApiCalls,
      total_mcp_calls: totalMcpCalls,
      total_errors: totalErrors,
      overall_error_rate: Math.round(overallErrorRate * 10) / 10,
      avg_duration_ms: avgDuration,
      top_endpoints: topEndpoints,
      top_mcp_tools: topMcpTools,
      top_components: topComponents,
      calls_by_day: callsByDay,
    }
  } catch {
    return emptyStats(periodDays)
  }
}

// ── Aggregation helpers ─────────────────────────────────────────────

function aggregateEndpoints(
  rows: Array<{ endpoint: string; duration_ms: number | null; is_error: boolean }>
): EndpointStat[] {
  const map = new Map<string, { total: number; errors: number; durations: number[] }>()

  for (const row of rows) {
    const key = row.endpoint
    if (!map.has(key)) map.set(key, { total: 0, errors: 0, durations: [] })
    const entry = map.get(key)!
    entry.total++
    if (row.is_error) entry.errors++
    if (row.duration_ms !== null) entry.durations.push(row.duration_ms)
  }

  return [...map.entries()]
    .map(([endpoint, stats]) => {
      const sorted = [...stats.durations].sort((a, b) => a - b)
      const avg =
        sorted.length > 0 ? Math.round(sorted.reduce((s, d) => s + d, 0) / sorted.length) : 0
      const p95 =
        sorted.length > 0
          ? (sorted[Math.floor(sorted.length * 0.95)] ?? sorted[sorted.length - 1])
          : 0
      return {
        endpoint,
        total_calls: stats.total,
        error_calls: stats.errors,
        avg_duration_ms: avg,
        p95_duration_ms: p95,
        error_rate: Math.round((stats.errors / stats.total) * 1000) / 10,
      }
    })
    .sort((a, b) => b.total_calls - a.total_calls)
    .slice(0, 10)
}

function aggregateTools(
  rows: Array<{ tool_name: string; duration_ms: number | null; is_error: boolean }>
): ToolStat[] {
  const map = new Map<string, { total: number; errors: number; durations: number[] }>()

  for (const row of rows) {
    const key = row.tool_name
    if (!map.has(key)) map.set(key, { total: 0, errors: 0, durations: [] })
    const entry = map.get(key)!
    entry.total++
    if (row.is_error) entry.errors++
    if (row.duration_ms !== null) entry.durations.push(row.duration_ms)
  }

  return [...map.entries()]
    .map(([tool_name, stats]) => ({
      tool_name,
      total_calls: stats.total,
      error_calls: stats.errors,
      avg_duration_ms:
        stats.durations.length > 0
          ? Math.round(stats.durations.reduce((s, d) => s + d, 0) / stats.durations.length)
          : 0,
    }))
    .sort((a, b) => b.total_calls - a.total_calls)
    .slice(0, 10)
}

function aggregateComponents(rows: Array<{ component_name: string }>): ComponentStat[] {
  const map = new Map<string, number>()
  for (const row of rows) {
    map.set(row.component_name, (map.get(row.component_name) ?? 0) + 1)
  }
  return [...map.entries()]
    .map(([component_name, total_calls]) => ({ component_name, total_calls }))
    .sort((a, b) => b.total_calls - a.total_calls)
    .slice(0, 10)
}

function aggregateByDay(
  rows: Array<{ event_type: string; is_error: boolean; created_at: string }>,
  periodDays: number
): Array<{ date: string; api_calls: number; mcp_calls: number; errors: number }> {
  const map = new Map<string, { api_calls: number; mcp_calls: number; errors: number }>()

  // Pre-populate all days in range
  for (let i = periodDays - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
    const key = d.toISOString().slice(0, 10)
    map.set(key, { api_calls: 0, mcp_calls: 0, errors: 0 })
  }

  for (const row of rows) {
    const key = row.created_at.slice(0, 10)
    const entry = map.get(key)
    if (!entry) continue
    if (row.event_type === "api_call") entry.api_calls++
    else if (row.event_type === "mcp_tool") entry.mcp_calls++
    if (row.is_error) entry.errors++
  }

  return [...map.entries()].map(([date, counts]) => ({ date, ...counts }))
}

function emptyStats(periodDays: number): UsageStats {
  return {
    period_days: periodDays,
    total_api_calls: 0,
    total_mcp_calls: 0,
    total_errors: 0,
    overall_error_rate: 0,
    avg_duration_ms: 0,
    top_endpoints: [],
    top_mcp_tools: [],
    top_components: [],
    calls_by_day: [],
  }
}
