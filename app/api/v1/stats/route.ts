import { NextResponse } from "next/server"
import { createLogger } from "@/lib/observability"
import { getUsageStats } from "@/lib/metrics"
import { getPublicClient, isSupabaseConfigured } from "@/lib/db"

const logger = createLogger("api")

/**
 * Count stable components grouped by ecosystem node. Returns an empty object
 * if Supabase is unreachable — callers should treat the absence of data as
 * "don't render the node breakdown". Keyed by `node_label` (the v4.0.33+
 * rename of the legacy `layer` column).
 */
async function getNodeBreakdown(): Promise<Record<string, number>> {
  if (!isSupabaseConfigured()) return {}
  try {
    const { data, error } = await getPublicClient()
      .from("components")
      .select("node_label")
      .not("source_code", "is", null)

    if (error || !data) return {}

    const breakdown: Record<string, number> = {}
    for (const row of data as unknown as Array<{ node_label: string | null }>) {
      const key = row.node_label ?? "unknown"
      breakdown[key] = (breakdown[key] ?? 0) + 1
    }
    return breakdown
  } catch {
    return {}
  }
}

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Cache-Control": "public, max-age=60, s-maxage=120",
}

/**
 * GET /api/v1/stats — Public usage statistics
 *
 * Returns aggregate API and MCP usage data for the observability dashboard.
 * Aligned with the open data philosophy — all data is public.
 *
 * Query params:
 *   ?days=7|30|90  — lookback period (default 30)
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const daysParam = url.searchParams.get("days")
    const days = daysParam ? Math.min(Math.max(parseInt(daysParam, 10) || 30, 1), 90) : 30

    const [stats, nodes] = await Promise.all([getUsageStats(days), getNodeBreakdown()])

    logger.info("Stats served", {
      data: { days, totalCalls: stats.total_api_calls + stats.total_mcp_calls },
    })

    return NextResponse.json(
      {
        "@context": "https://schema.org",
        "@type": "Dataset",
        name: "Nyuchi Design Portal — Usage Statistics",
        description:
          "Public API and MCP usage metrics for the Nyuchi Design Portal. Open data aligned with the bundu ecosystem philosophy.",
        license: "https://creativecommons.org/licenses/by/4.0/",
        ...stats,
        nodes,
      },
      { headers: CORS }
    )
  } catch (error) {
    logger.error("Stats error", {
      error: error instanceof Error ? error : new Error(String(error)),
    })
    return NextResponse.json({ error: "Internal server error" }, { status: 500, headers: CORS })
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: { ...CORS, Allow: "GET, OPTIONS" } })
}
