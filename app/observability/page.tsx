import type { Metadata } from "next"
import {
  Activity,
  AlertTriangle,
  BarChart2,
  Boxes,
  CheckCircle,
  Clock,
  Code,
  ExternalLink,
  FlaskConical,
  ShieldCheck,
  Stethoscope,
  TrendingDown,
  TrendingUp,
  Wrench,
  Zap,
} from "lucide-react"
import { getUsageStats } from "@/lib/metrics"
import {
  getRegistryCounts,
  getFundiIssues,
  getChaosEvents,
  getSystemCounts,
  getNodeDistribution,
  isSupabaseConfigured,
} from "@/lib/db"
import { ObservabilityCharts, NodeDistributionChart } from "./charts"

export const metadata: Metadata = {
  title: "Observability",
  description:
    "Public API, MCP, Fundi, chaos, and registry telemetry for Mzizi — open data for the community.",
}

// ISR per issue #84: revalidate every 5 minutes. Long enough to keep
// the dashboard cheap; short enough that open data stays fresh.
export const revalidate = 300

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`
  return `${n}`
}

function errorRateColor(rate: number): string {
  if (rate === 0) return "text-[var(--color-malachite)]"
  if (rate < 1) return "text-[var(--color-gold)]"
  return "text-destructive"
}

function uptimePct(errorRate: number): string {
  return `${(100 - errorRate).toFixed(1)}%`
}

function relTime(iso: string): string {
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return ""
  const diffSec = Math.max(0, Math.floor((Date.now() - then) / 1000))
  if (diffSec < 60) return `${diffSec}s ago`
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`
  return `${Math.floor(diffSec / 86400)}d ago`
}

function severityColor(severity: string | null): string {
  switch ((severity ?? "").toLowerCase()) {
    case "critical":
    case "high":
      return "text-destructive"
    case "medium":
      return "text-[var(--color-gold)]"
    case "low":
      return "text-[var(--color-malachite)]"
    default:
      return "text-muted-foreground"
  }
}

function statusColor(status: string | null): string {
  switch ((status ?? "").toLowerCase()) {
    case "resolved":
    case "healed":
      return "text-[var(--color-malachite)]"
    case "open":
    case "investigating":
      return "text-[var(--color-gold)]"
    case "failed":
    case "escalated":
      return "text-destructive"
    default:
      return "text-muted-foreground"
  }
}

export default async function ObservabilityPage() {
  // Short-circuit to a graceful empty-state shell when Supabase env vars
  // are missing — every panel below depends on the public-read tables.
  if (!isSupabaseConfigured()) {
    return <UnconfiguredState />
  }

  const [stats30, stats7, counts, fundiIssues, chaosEvents, sysCounts, nodeDistribution] =
    await Promise.all([
      getUsageStats(30).catch(() => null),
      getUsageStats(7).catch(() => null),
      getRegistryCounts().catch(() => ({ total: 0, ui: 0, blocks: 0, hooks: 0, lib: 0 })),
      getFundiIssues(8).catch(() => []),
      getChaosEvents(10).catch(() => []),
      getSystemCounts().catch(() => null),
      getNodeDistribution().catch(() => []),
    ])

  const s = stats30
  const s7 = stats7
  const totalCalls = (s?.total_api_calls ?? 0) + (s?.total_mcp_calls ?? 0)
  const errorRate = s?.overall_error_rate ?? 0
  const avgMs = s?.avg_duration_ms ?? 0
  const totalNodes = sysCounts?.total_nodes ?? 0

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
      {/* Header */}
      <div className="mb-10">
        <div className="mb-2 flex items-center gap-2">
          <Activity className="size-5 text-[var(--color-cobalt)]" />
          <span className="font-mono text-xs font-medium tracking-widest text-muted-foreground uppercase">
            Open Data
          </span>
        </div>
        <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Observability
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          Live API usage, MCP tool calls, Fundi self-healing activity, chaos test feed, and
          component distribution by <span className="font-mono">ecosystem_node</span> — public by
          design, aligned with the open data philosophy of the bundu ecosystem.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <a
            href="/api/v1/stats"
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <Code className="size-3" />
            GET /api/v1/stats
          </a>
          <a
            href="/api/v1/stats?days=7"
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <Code className="size-3" />
            GET /api/v1/stats?days=7
          </a>
        </div>
      </div>

      {/* ── Health banner ─────────────────────────────────────────────── */}
      <div
        className={`mb-8 flex items-center gap-3 rounded-[var(--radius-xl)] border px-5 py-4 ${
          errorRate === 0
            ? "border-[var(--color-malachite)]/30 bg-[var(--color-malachite)]/5"
            : errorRate < 2
              ? "border-[var(--color-gold)]/30 bg-[var(--color-gold)]/5"
              : "border-destructive/30 bg-destructive/5"
        }`}
      >
        {errorRate === 0 ? (
          <CheckCircle className="size-5 shrink-0 text-[var(--color-malachite)]" />
        ) : (
          <AlertTriangle className="size-5 shrink-0 text-[var(--color-gold)]" />
        )}
        <div>
          <p className="text-sm font-semibold text-foreground">
            {errorRate === 0
              ? "All systems operational"
              : errorRate < 2
                ? "Elevated error rate — monitoring"
                : "Degraded — investigating"}
          </p>
          <p className="text-xs text-muted-foreground">
            {uptimePct(errorRate)} uptime over the last 30 days · {fmt(totalCalls)} total requests
          </p>
        </div>
      </div>

      {/* ── Good metrics ──────────────────────────────────────────────── */}
      <div className="mb-4">
        <div className="mb-3 flex items-center gap-2">
          <TrendingUp className="size-4 text-[var(--color-malachite)]" />
          <h2 className="text-sm font-semibold text-foreground">Positive signals</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: "API calls (30d)",
              value: fmt(s?.total_api_calls ?? 0),
              sub: s7 ? `${fmt(s7.total_api_calls)} this week` : undefined,
              icon: BarChart2,
              accent: "text-[var(--color-cobalt)]",
            },
            {
              label: "MCP tool calls (30d)",
              value: fmt(s?.total_mcp_calls ?? 0),
              sub: s7 ? `${fmt(s7.total_mcp_calls)} this week` : undefined,
              icon: Zap,
              accent: "text-[var(--color-tanzanite)]",
            },
            {
              label: "Avg response",
              value: avgMs > 0 ? `${avgMs}ms` : "—",
              sub: avgMs < 200 ? "fast" : avgMs < 500 ? "good" : "needs work",
              icon: Clock,
              accent: "text-[var(--color-malachite)]",
            },
            {
              label: "Registry items",
              value: counts.total > 0 ? fmt(counts.total) : "—",
              sub:
                totalNodes > 0
                  ? `${counts.ui} UI · ${totalNodes} ecosystem_node`
                  : counts.ui > 0
                    ? `${counts.ui} UI · ${counts.blocks} blocks`
                    : undefined,
              icon: Activity,
              accent: "text-[var(--color-gold)]",
            },
          ].map((card) => (
            <div
              key={card.label}
              className="flex flex-col gap-2 rounded-[var(--radius-xl)] border border-border bg-card p-5"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{card.label}</span>
                <card.icon className={`size-4 ${card.accent}`} />
              </div>
              <span className="font-mono text-2xl font-semibold text-foreground">{card.value}</span>
              {card.sub && <span className="text-xs text-muted-foreground">{card.sub}</span>}
            </div>
          ))}
        </div>
      </div>

      {/* ── Most popular components ───────────────────────────────────── */}
      {(s?.top_components?.length ?? 0) > 0 && (
        <div className="mb-8 rounded-[var(--radius-xl)] border border-border bg-card p-5">
          <h3 className="mb-4 text-sm font-semibold text-foreground">Most requested components</h3>
          <div className="space-y-2">
            {s!.top_components.slice(0, 8).map((c, i) => {
              const max = s!.top_components[0].total_calls
              const pct = max > 0 ? (c.total_calls / max) * 100 : 0
              return (
                <div key={c.component_name} className="flex items-center gap-3">
                  <span className="w-4 shrink-0 text-right font-mono text-xs text-muted-foreground">
                    {i + 1}
                  </span>
                  <a
                    href={`/components/${c.component_name}`}
                    className="w-32 shrink-0 truncate font-mono text-xs text-foreground hover:text-[var(--color-cobalt)]"
                  >
                    {c.component_name}
                  </a>
                  <div className="min-w-0 flex-1 rounded-full bg-muted">
                    <div
                      className="h-1.5 rounded-full bg-[var(--color-cobalt)]"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-10 shrink-0 text-right font-mono text-xs text-muted-foreground">
                    {fmt(c.total_calls)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Top MCP tools ─────────────────────────────────────────────── */}
      {(s?.top_mcp_tools?.length ?? 0) > 0 && (
        <div className="mb-8 rounded-[var(--radius-xl)] border border-border bg-card p-5">
          <h3 className="mb-4 text-sm font-semibold text-foreground">Top MCP tools</h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {s!.top_mcp_tools.slice(0, 6).map((t) => (
              <div
                key={t.tool_name}
                className="flex items-center justify-between rounded-[var(--radius-md)] bg-muted/50 px-3 py-2"
              >
                <span className="font-mono text-xs text-foreground">{t.tool_name}</span>
                <div className="flex items-center gap-3">
                  {t.avg_duration_ms > 0 && (
                    <span className="font-mono text-xs text-muted-foreground">
                      {t.avg_duration_ms}ms avg
                    </span>
                  )}
                  <span className="font-mono text-xs font-semibold text-foreground">
                    {fmt(t.total_calls)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Bad metrics ───────────────────────────────────────────────── */}
      <div className="mb-8">
        <div className="mb-3 flex items-center gap-2">
          <TrendingDown className="size-4 text-destructive" />
          <h2 className="text-sm font-semibold text-foreground">Error signals</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              label: "Total errors (30d)",
              value: fmt(s?.total_errors ?? 0),
              sub: "4xx + 5xx responses",
              bad: (s?.total_errors ?? 0) > 0,
            },
            {
              label: "Error rate",
              value: `${s?.overall_error_rate ?? 0}%`,
              sub: "% of all requests",
              bad: (s?.overall_error_rate ?? 0) >= 1,
            },
            {
              label: "Errors this week",
              value: fmt(s7?.total_errors ?? 0),
              sub: s7 ? `${s7.overall_error_rate}% of week traffic` : undefined,
              bad: (s7?.total_errors ?? 0) > 0,
            },
          ].map((card) => (
            <div
              key={card.label}
              className={`flex flex-col gap-2 rounded-[var(--radius-xl)] border bg-card p-5 ${
                card.bad ? "border-destructive/30" : "border-border"
              }`}
            >
              <span className="text-xs text-muted-foreground">{card.label}</span>
              <span
                className={`font-mono text-2xl font-semibold ${
                  card.bad ? "text-destructive" : errorRateColor(0)
                }`}
              >
                {card.value}
              </span>
              {card.sub && <span className="text-xs text-muted-foreground">{card.sub}</span>}
            </div>
          ))}
        </div>
      </div>

      {/* ── Endpoint error breakdown ───────────────────────────────────── */}
      {(s?.top_endpoints?.filter((e) => e.error_calls > 0).length ?? 0) > 0 && (
        <div className="mb-8 rounded-[var(--radius-xl)] border border-destructive/20 bg-card p-5">
          <h3 className="mb-4 text-sm font-semibold text-foreground">Endpoints with errors</h3>
          <div className="space-y-2">
            {s!.top_endpoints
              .filter((e) => e.error_calls > 0)
              .sort((a, b) => b.error_rate - a.error_rate)
              .map((e) => (
                <div key={e.endpoint} className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="min-w-0 flex-1 truncate font-mono text-foreground">
                    {e.endpoint}
                  </span>
                  <span className="shrink-0 text-muted-foreground">{fmt(e.total_calls)} calls</span>
                  <span className="shrink-0 text-destructive">{e.error_rate}% errors</span>
                  <span className="shrink-0 text-muted-foreground">{e.p95_duration_ms}ms p95</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ── All endpoints table ────────────────────────────────────────── */}
      {(s?.top_endpoints?.length ?? 0) > 0 && (
        <div className="mb-8 rounded-[var(--radius-xl)] border border-border bg-card p-5">
          <h3 className="mb-4 text-sm font-semibold text-foreground">All endpoints (30d)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="pr-4 pb-2 font-medium text-muted-foreground">Endpoint</th>
                  <th className="pr-4 pb-2 text-right font-medium text-muted-foreground">Calls</th>
                  <th className="pr-4 pb-2 text-right font-medium text-muted-foreground">Errors</th>
                  <th className="pr-4 pb-2 text-right font-medium text-muted-foreground">Avg ms</th>
                  <th className="pb-2 text-right font-medium text-muted-foreground">p95 ms</th>
                </tr>
              </thead>
              <tbody>
                {s!.top_endpoints.map((e) => (
                  <tr key={e.endpoint} className="border-b border-border/50 last:border-0">
                    <td className="py-2 pr-4 font-mono text-foreground">{e.endpoint}</td>
                    <td className="py-2 pr-4 text-right font-mono text-foreground">
                      {fmt(e.total_calls)}
                    </td>
                    <td
                      className={`py-2 pr-4 text-right font-mono ${e.error_calls > 0 ? "text-destructive" : "text-[var(--color-malachite)]"}`}
                    >
                      {e.error_calls > 0 ? fmt(e.error_calls) : "0"}
                    </td>
                    <td className="py-2 pr-4 text-right font-mono text-muted-foreground">
                      {e.avg_duration_ms}
                    </td>
                    <td className="py-2 text-right font-mono text-muted-foreground">
                      {e.p95_duration_ms}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Trend chart ────────────────────────────────────────────────── */}
      {(s?.calls_by_day?.length ?? 0) > 0 && (
        <div className="mb-8 rounded-[var(--radius-xl)] border border-border bg-card p-5">
          <h3 className="mb-1 text-sm font-semibold text-foreground">API usage trend (30d)</h3>
          <p className="mb-4 text-xs text-muted-foreground">
            API calls · MCP tool calls · Errors — daily breakdown from{" "}
            <span className="font-mono">usage_events</span>
          </p>
          <ObservabilityCharts data={s!.calls_by_day} />
        </div>
      )}

      {/* ── Component distribution by ecosystem_node ───────────────────── */}
      {nodeDistribution.length > 0 && (
        <div className="mb-8 rounded-[var(--radius-xl)] border border-border bg-card p-5">
          <div className="mb-1 flex items-center gap-2">
            <Boxes className="size-4 text-[var(--color-cobalt)]" />
            <h3 className="text-sm font-semibold text-foreground">
              Component distribution by node
            </h3>
          </div>
          <p className="mb-4 text-xs text-muted-foreground">
            From <span className="font-mono">get_system_counts()</span> · axes:{" "}
            <span className="font-mono">horizontal</span> ·{" "}
            <span className="font-mono">vertical</span> · <span className="font-mono">depth</span> ·{" "}
            <span className="font-mono">outlier</span>
          </p>
          <NodeDistributionChart data={nodeDistribution} />
          <div className="mt-3 flex flex-wrap gap-3 text-[10px] text-muted-foreground">
            {(["horizontal", "vertical", "depth", "outlier"] as const).map((axis) => (
              <span key={axis} className="inline-flex items-center gap-1.5">
                <span
                  className="size-2 rounded-full"
                  style={{
                    background:
                      axis === "horizontal"
                        ? "var(--color-cobalt)"
                        : axis === "vertical"
                          ? "var(--color-malachite)"
                          : axis === "depth"
                            ? "var(--color-tanzanite)"
                            : "var(--color-gold)",
                  }}
                />
                <span className="font-mono">{axis}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Fundi recent issues ────────────────────────────────────────── */}
      <div className="mb-8 rounded-[var(--radius-xl)] border border-border bg-card p-5">
        <div className="mb-1 flex items-center gap-2">
          <Wrench className="size-4 text-[var(--color-tanzanite)]" />
          <h3 className="text-sm font-semibold text-foreground">Fundi · recent issues</h3>
        </div>
        <p className="mb-4 text-xs text-muted-foreground">
          Self-healing actor at{" "}
          <a
            href="https://fundi.nyuchi.dev"
            className="inline-flex items-center gap-1 font-mono text-foreground hover:text-[var(--color-cobalt)]"
            target="_blank"
            rel="noreferrer"
          >
            fundi.nyuchi.dev
            <ExternalLink className="size-3" />
          </a>{" "}
          · reading <span className="font-mono">fundi_issues</span>
        </p>
        {fundiIssues.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="pr-3 pb-2 font-medium text-muted-foreground">When</th>
                  <th className="pr-3 pb-2 font-medium text-muted-foreground">Component</th>
                  <th className="pr-3 pb-2 font-medium text-muted-foreground">Severity</th>
                  <th className="pr-3 pb-2 font-medium text-muted-foreground">Error</th>
                  <th className="pb-2 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {fundiIssues.map((issue) => (
                  <tr key={issue.id} className="border-b border-border/50 last:border-0">
                    <td className="py-2 pr-3 font-mono text-muted-foreground">
                      {relTime(issue.created_at)}
                    </td>
                    <td className="py-2 pr-3 font-mono text-foreground">
                      {issue.component_name ?? "—"}
                    </td>
                    <td className={`py-2 pr-3 font-mono ${severityColor(issue.severity)}`}>
                      {issue.severity ?? "—"}
                    </td>
                    <td className="py-2 pr-3 font-mono text-muted-foreground">
                      {issue.error_type ?? "—"}
                    </td>
                    <td className={`py-2 font-mono ${statusColor(issue.status)}`}>
                      {issue.github_issue_url ? (
                        <a
                          className="inline-flex items-center gap-1 hover:underline"
                          href={issue.github_issue_url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {issue.status ?? "open"}
                          <ExternalLink className="size-3" />
                        </a>
                      ) : (
                        (issue.status ?? "open")
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--color-malachite)]/30 bg-[var(--color-malachite)]/5 px-4 py-3">
            <ShieldCheck className="size-4 shrink-0 text-[var(--color-malachite)]" />
            <p className="text-xs text-muted-foreground">
              No recent Fundi issues — every surface is healthy.
            </p>
          </div>
        )}
      </div>

      {/* ── Chaos test feed ────────────────────────────────────────────── */}
      <div className="mb-8 rounded-[var(--radius-xl)] border border-border bg-card p-5">
        <div className="mb-1 flex items-center gap-2">
          <FlaskConical className="size-4 text-[var(--color-gold)]" />
          <h3 className="text-sm font-semibold text-foreground">Chaos test feed</h3>
        </div>
        <p className="mb-4 text-xs text-muted-foreground">
          Injected and blocked faults from <span className="font-mono">chaos_events</span>
        </p>
        {chaosEvents.length > 0 ? (
          <div className="space-y-2">
            {chaosEvents.map((ev) => (
              <div
                key={ev.id}
                className="flex flex-wrap items-center gap-2 rounded-[var(--radius-md)] bg-muted/40 px-3 py-2 text-xs"
              >
                <span className="w-16 shrink-0 font-mono text-muted-foreground">
                  {relTime(ev.created_at)}
                </span>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 font-mono text-[10px] ${
                    ev.event_type === "blocked"
                      ? "bg-[var(--color-malachite)]/10 text-[var(--color-malachite)]"
                      : ev.event_type === "injected"
                        ? "bg-[var(--color-gold)]/10 text-[var(--color-gold)]"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {ev.event_type}
                </span>
                <span className="shrink-0 font-mono text-foreground">
                  {ev.injection_kind ?? "—"}
                </span>
                <span className="min-w-0 flex-1 truncate font-mono text-muted-foreground">
                  {ev.component_name ?? ev.page_path ?? ev.domain ?? ""}
                </span>
                {typeof ev.duration_ms === "number" && (
                  <span className="shrink-0 font-mono text-muted-foreground">
                    {ev.duration_ms}ms
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-[var(--radius-md)] border border-border bg-muted/30 px-4 py-3">
            <Stethoscope className="size-4 shrink-0 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">
              No chaos events recorded in the lookback window.
            </p>
          </div>
        )}
      </div>

      {/* ── Empty state when no data ────────────────────────────────────── */}
      {totalCalls === 0 && (
        <div className="rounded-[var(--radius-xl)] border border-border bg-card px-8 py-16 text-center">
          <Activity className="mx-auto mb-4 size-10 text-muted-foreground/40" />
          <p className="font-semibold text-foreground">No usage data yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Metrics are recorded as the API and MCP server receive requests.
          </p>
          <a
            href="/api/v1/stats"
            className="mt-4 inline-block font-mono text-xs text-muted-foreground underline-offset-4 hover:underline"
          >
            GET /api/v1/stats
          </a>
        </div>
      )}

      {/* ── Footer note ────────────────────────────────────────────────── */}
      <p className="mt-10 text-center text-xs text-muted-foreground">
        Data refreshes every 5 minutes · Lookback window: 30 days ·{" "}
        <a href="/api/v1/stats" className="underline-offset-4 hover:underline">
          Raw JSON
        </a>{" "}
        available under CC BY 4.0
      </p>
    </div>
  )
}

/**
 * Rendered when `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`
 * are missing — e.g. local clones with no `.env.local`. Keeps the page
 * chrome (so the route never hard-fails) and points the operator at the
 * env vars they need to set.
 */
function UnconfiguredState() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="mb-8">
        <div className="mb-2 flex items-center gap-2">
          <Activity className="size-5 text-[var(--color-cobalt)]" />
          <span className="font-mono text-xs font-medium tracking-widest text-muted-foreground uppercase">
            Open Data
          </span>
        </div>
        <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Observability
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          Public usage, Fundi, chaos, and registry telemetry for the Mzizi ecosystem.
        </p>
      </div>
      <div className="rounded-[var(--radius-xl)] border border-border bg-card px-8 py-16 text-center">
        <Activity className="mx-auto mb-4 size-10 text-muted-foreground/40" />
        <p className="font-semibold text-foreground">Database not configured</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Set <span className="font-mono">NEXT_PUBLIC_SUPABASE_URL</span> and{" "}
          <span className="font-mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</span> to load live data from
          the open-data tables (<span className="font-mono">usage_events</span>,{" "}
          <span className="font-mono">fundi_issues</span>,{" "}
          <span className="font-mono">chaos_events</span>,{" "}
          <span className="font-mono">observability_events</span>).
        </p>
      </div>
    </div>
  )
}
