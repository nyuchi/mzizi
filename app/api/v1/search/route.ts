import { NextResponse } from "next/server"
import { createLogger } from "@/lib/observability"
import {
  searchComponents,
  getComponentsByNode,
  getComponentsByCategory,
  isSupabaseConfigured,
} from "@/lib/db"
import { trackApiCall } from "@/lib/metrics"

const logger = createLogger("api")

const CORS_CACHE = {
  "Cache-Control": "public, max-age=300, s-maxage=3600",
  "Access-Control-Allow-Origin": "*",
}

const CORS = { "Access-Control-Allow-Origin": "*" }

/**
 * GET /api/v1/search?q=&node=&category=
 *
 * Search components by name or description, optionally filtered by ecosystem
 * node (integer 1–10) and/or category. The `node` filter replaces the legacy
 * `layer` text filter — the DB column was renamed in v4.0.33–v4.0.36.
 */
export async function GET(request: Request) {
  const start = Date.now()
  try {
    const url = new URL(request.url)
    const q = (url.searchParams.get("q") ?? "").trim()
    const nodeParam = url.searchParams.get("node")
    const category = url.searchParams.get("category")

    const node = nodeParam !== null ? Number.parseInt(nodeParam, 10) : null
    if (nodeParam !== null && (node === null || Number.isNaN(node) || node < 1 || node > 10)) {
      trackApiCall({ endpoint: "/api/v1/search", durationMs: Date.now() - start, statusCode: 400 })
      return NextResponse.json(
        { error: "node must be an integer between 1 and 10" },
        { status: 400, headers: CORS }
      )
    }

    if (!isSupabaseConfigured()) {
      trackApiCall({ endpoint: "/api/v1/search", durationMs: Date.now() - start, statusCode: 503 })
      return NextResponse.json({ error: "Database not configured" }, { status: 503, headers: CORS })
    }

    let results
    if (q) {
      results = await searchComponents(q)
    } else if (node !== null) {
      results = await getComponentsByNode(node)
    } else if (category) {
      results = await getComponentsByCategory(category)
    } else {
      trackApiCall({ endpoint: "/api/v1/search", durationMs: Date.now() - start, statusCode: 400 })
      return NextResponse.json(
        { error: "At least one of q, node, or category is required" },
        { status: 400, headers: CORS }
      )
    }

    if (node !== null) results = results.filter((c) => c.ecosystem_node === node)
    if (category) results = results.filter((c) => c.category === category)

    const items = results.map((c) => ({
      name: c.name,
      type: c.registry_type,
      description: c.description,
      category: c.category,
      node: c.ecosystem_node,
      nodeLabel: c.node_label,
    }))

    trackApiCall({ endpoint: "/api/v1/search", durationMs: Date.now() - start, statusCode: 200 })

    return NextResponse.json(
      {
        data: items,
        meta: { total: items.length, query: q || null, node, category },
      },
      { headers: CORS_CACHE }
    )
  } catch (error) {
    logger.error("Search error", {
      error: error instanceof Error ? error : new Error(String(error)),
    })
    trackApiCall({ endpoint: "/api/v1/search", durationMs: Date.now() - start, statusCode: 500 })
    return NextResponse.json({ error: "Internal server error" }, { status: 500, headers: CORS })
  }
}
