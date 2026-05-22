import { NextResponse } from "next/server"
import { trackApiCall } from "@/lib/metrics"

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Cache-Control": "public, max-age=3600, s-maxage=86400",
}

/**
 * GET /api/v1/docs — Soft-410 Gone.
 *
 * Long-form documentation now lives in the standalone Mzizi Mintlify
 * docs site at mzizi.dev/docs. The `documentation_pages` Supabase table
 * is HISTORICAL.
 *
 * Returns HTTP 410 with a migration note so consumers know to fetch
 * the live docs site instead of relying on the API.
 */
export async function GET() {
  trackApiCall({ endpoint: "/api/v1/docs", durationMs: 0, statusCode: 410 })
  return NextResponse.json(
    {
      error: "Gone",
      message:
        "Long-form documentation now lives in the standalone Mzizi docs site (Mintlify). The documentation_pages Supabase table is historical. See https://mzizi.dev/docs.",
      migrated_to: {
        "3d-architecture": "https://mzizi.dev/docs/architecture",
        "fundi-guide": "https://mzizi.dev/docs/architecture/fundi",
        "layer-decision-guide": "https://mzizi.dev/docs/architecture/layers",
        "component-backlinks": "https://mzizi.dev/docs/architecture/component-backlinks",
        "brand-guidelines": "https://mzizi.dev/docs/brand",
        "semantic-tokens": "https://mzizi.dev/docs/foundations/tokens",
        introduction: "https://mzizi.dev/docs",
        installation: "https://mzizi.dev/docs/installation",
        "api-reference": "https://mzizi.dev/docs/api-reference",
        contributing: "https://mzizi.dev/docs/contributing",
      },
    },
    { status: 410, headers: CORS }
  )
}
