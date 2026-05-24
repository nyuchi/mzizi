import { NextResponse } from "next/server"
import { createLogger } from "@/lib/observability"
import { getComponent, isSupabaseConfigured } from "@/lib/db"
import { trackApiCall } from "@/lib/metrics"

const logger = createLogger("component-chaos")

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Cache-Control": "no-cache, no-store",
}

const COMPONENT_NAME_PATTERN = /^[a-z][a-z0-9-]*$/

type Fault = "render-error" | "slow-render" | "missing-data" | "network-timeout"

/**
 * GET /api/chaos/{name}
 *
 * Documents the chaos surface for a single component — what fault classes
 * the L8 chaos lib (`registry:lib chaos`, installed by consumer apps via
 * the shadcn CLI) can inject against this target. Read-only.
 *
 * The actual chaos engine runs IN-PROCESS in consumer apps (not in this
 * portal) — this endpoint exists so L8 dashboards, fundi, and external
 * audits can enumerate the supported fault classes per component without
 * importing the chaos lib.
 *
 * POST /api/chaos/{name}
 *
 * 405 — chaos injection is in-process only by design. Returning 405 with
 * a body that points at the chaos lib install is the honest contract; the
 * portal must never accept "inject failure into a live component" calls
 * over the public internet.
 *
 * Status semantics:
 *   200 — component exists, returns the supported-faults manifest
 *   404 — component does not exist
 *   405 — POST attempted (intentional: see the route docstring above)
 *   503 — Supabase unconfigured
 */
export async function GET(_request: Request, { params }: { params: Promise<{ name: string }> }) {
  const start = Date.now()
  const { name } = await params

  if (!COMPONENT_NAME_PATTERN.test(name)) {
    trackApiCall({
      endpoint: "/api/chaos/[name]",
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
      endpoint: `/api/chaos/${name}`,
      durationMs: Date.now() - start,
      statusCode: 503,
    })
    return NextResponse.json({ error: "Database not configured" }, { status: 503, headers: CORS })
  }

  try {
    const component = await getComponent(name)
    if (!component) {
      trackApiCall({
        endpoint: `/api/chaos/${name}`,
        durationMs: Date.now() - start,
        statusCode: 404,
      })
      return NextResponse.json(
        { error: `Component "${name}" not found` },
        { status: 404, headers: CORS }
      )
    }

    const faults: Record<Fault, { description: string; via: string }> = {
      "render-error": {
        description: "Throw inside the component's render — exercises Section error boundaries.",
        via: "chaos.injectRenderError(component)",
      },
      "slow-render": {
        description: "Block the render thread for N ms — exercises Suspense + skeleton paths.",
        via: "chaos.slowRender(component, ms)",
      },
      "missing-data": {
        description:
          "Force the component's primary data source to return null/empty — exercises empty-state UI.",
        via: "chaos.starveData(component)",
      },
      "network-timeout": {
        description:
          "Hold any fetch the component makes until timeout — exercises retry + fallback chain.",
        via: "chaos.timeout(component, ms)",
      },
    }

    trackApiCall({
      endpoint: `/api/chaos/${name}`,
      durationMs: Date.now() - start,
      statusCode: 200,
    })
    return NextResponse.json(
      {
        name: component.name,
        description: `Chaos surface for ${component.name}. Faults are injected in-process via the L8 chaos lib — install with \`npx shadcn@latest add https://mzizi.dev/api/v1/ui/chaos\`.`,
        node: component.ecosystem_node ?? null,
        node_label: component.node_label ?? null,
        registry_type: component.registry_type,
        supported_faults: faults,
        engine: {
          runtime: "in-process",
          install: "npx shadcn@latest add https://mzizi.dev/api/v1/ui/chaos",
          remote_injection: false,
        },
      },
      { headers: CORS }
    )
  } catch (error) {
    logger.error("Component chaos manifest error", {
      error: error instanceof Error ? error : new Error(String(error)),
      data: { name },
    })
    trackApiCall({
      endpoint: `/api/chaos/${name}`,
      durationMs: Date.now() - start,
      statusCode: 500,
    })
    return NextResponse.json({ error: "Internal server error" }, { status: 500, headers: CORS })
  }
}

export async function POST(_request: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params
  trackApiCall({ endpoint: `/api/chaos/${name}`, durationMs: 0, statusCode: 405 })
  return NextResponse.json(
    {
      error: "Method Not Allowed",
      message:
        "Chaos injection is in-process by design — this endpoint never accepts remote fault injection. Install the L8 chaos lib in your app: `npx shadcn@latest add https://mzizi.dev/api/v1/ui/chaos`.",
    },
    {
      status: 405,
      headers: { ...CORS, Allow: "GET, OPTIONS" },
    }
  )
}
