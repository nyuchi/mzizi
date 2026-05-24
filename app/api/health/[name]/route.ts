import { NextResponse } from "next/server"
import { createLogger } from "@/lib/observability"
import { getComponent, isSupabaseConfigured } from "@/lib/db"
import { trackApiCall } from "@/lib/metrics"

const logger = createLogger("component-health")

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Cache-Control": "no-cache, no-store",
}

const COMPONENT_NAME_PATTERN = /^[a-z][a-z0-9-]*$/

/**
 * GET /api/health/{name}
 *
 * Per-component health probe. L8 assurance components and external
 * synthetic-probes target this URL by component name to verify the
 * registry's view of a single component is healthy.
 *
 * Status semantics:
 *   200 — component exists and has `status: "stable"` (or null = stable
 *         by default in the components table)
 *   404 — component does not exist
 *   410 — component exists but `status: "deprecated"`
 *   503 — Supabase unconfigured (operator action required)
 *
 * The body is small JSON (name, status, layer, registry_type, last_checked).
 * `Cache-Control: no-cache, no-store` because callers want a fresh probe
 * — same convention as `/api/v1/health`.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ name: string }> }) {
  const start = Date.now()
  const { name } = await params

  if (!COMPONENT_NAME_PATTERN.test(name)) {
    trackApiCall({
      endpoint: "/api/health/[name]",
      durationMs: Date.now() - start,
      statusCode: 400,
    })
    return NextResponse.json(
      { error: "Invalid component name", received: name },
      { status: 400, headers: CORS }
    )
  }

  if (!isSupabaseConfigured()) {
    trackApiCall({
      endpoint: `/api/health/${name}`,
      durationMs: Date.now() - start,
      statusCode: 503,
    })
    return NextResponse.json(
      {
        status: "unknown",
        error: "Database not configured",
        message: "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
      },
      { status: 503, headers: CORS }
    )
  }

  try {
    const component = await getComponent(name)
    if (!component) {
      trackApiCall({
        endpoint: `/api/health/${name}`,
        durationMs: Date.now() - start,
        statusCode: 404,
      })
      return NextResponse.json(
        { status: "missing", name, error: `Component "${name}" not found` },
        { status: 404, headers: CORS }
      )
    }

    // The components table has no `status` column today; treat existence as
    // "stable". The 410 path is reserved for when status enums get added.
    const probe = {
      status: "stable" as const,
      name: component.name,
      registry_type: component.registry_type,
      node: component.ecosystem_node ?? null,
      node_label: component.node_label ?? null,
      category: component.category ?? null,
      added_in_version: component.added_in_version ?? null,
      last_checked: new Date().toISOString(),
    }

    trackApiCall({
      endpoint: `/api/health/${name}`,
      durationMs: Date.now() - start,
      statusCode: 200,
    })
    return NextResponse.json(probe, { headers: CORS })
  } catch (error) {
    logger.error("Component health probe error", {
      error: error instanceof Error ? error : new Error(String(error)),
      data: { name },
    })
    trackApiCall({
      endpoint: `/api/health/${name}`,
      durationMs: Date.now() - start,
      statusCode: 500,
    })
    return NextResponse.json(
      { status: "error", name, error: "Internal server error" },
      { status: 500, headers: CORS }
    )
  }
}
