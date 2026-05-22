import { NextResponse } from "next/server"
import { createLogger } from "@/lib/observability"
import { getComponentWithDocs, isSupabaseConfigured } from "@/lib/db"
import { trackApiCall } from "@/lib/metrics"

const logger = createLogger("api")

const CORS_CACHE = {
  "Cache-Control": "public, max-age=3600, s-maxage=86400",
  "Access-Control-Allow-Origin": "*",
}

const CORS = { "Access-Control-Allow-Origin": "*" }

/**
 * GET /api/v1/ui/[name]/docs — Component documentation from component_docs table.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ name: string }> }) {
  const start = Date.now()
  try {
    const { name } = await params

    if (!name || typeof name !== "string") {
      trackApiCall({
        endpoint: "/api/v1/ui/[name]/docs",
        durationMs: Date.now() - start,
        statusCode: 400,
      })
      return NextResponse.json({ error: "Invalid component name" }, { status: 400, headers: CORS })
    }

    if (!isSupabaseConfigured()) {
      trackApiCall({
        endpoint: `/api/v1/ui/${name}/docs`,
        durationMs: Date.now() - start,
        statusCode: 503,
        componentName: name,
      })
      return NextResponse.json({ error: "Database not configured" }, { status: 503, headers: CORS })
    }

    const component = await getComponentWithDocs(name)

    if (!component) {
      trackApiCall({
        endpoint: `/api/v1/ui/${name}/docs`,
        durationMs: Date.now() - start,
        statusCode: 404,
        componentName: name,
      })
      return NextResponse.json(
        { error: `Component "${name}" not found` },
        { status: 404, headers: CORS }
      )
    }

    trackApiCall({
      endpoint: `/api/v1/ui/${name}/docs`,
      durationMs: Date.now() - start,
      statusCode: 200,
      componentName: name,
    })

    return NextResponse.json(
      {
        name: component.name,
        description: component.description,
        node: component.ecosystem_node,
        node_label: component.node_label,
        category: component.category,
        docs: component.docs ?? null,
        demo: component.demo ?? null,
      },
      { headers: CORS_CACHE }
    )
  } catch (error) {
    logger.error("Component docs error", {
      error: error instanceof Error ? error : new Error(String(error)),
    })
    trackApiCall({
      endpoint: "/api/v1/ui/[name]/docs",
      durationMs: Date.now() - start,
      statusCode: 500,
    })
    return NextResponse.json({ error: "Internal server error" }, { status: 500, headers: CORS })
  }
}
