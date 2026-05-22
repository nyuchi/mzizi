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
 * docs site at docs.bundu.org/mzizi. The `documentation_pages` Supabase table
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
        "Long-form documentation now lives in the standalone Mzizi docs site (Mintlify). The documentation_pages Supabase table is historical. See https://docs.bundu.org/mzizi.",
      migrated_to: {
        "3d-architecture": "https://docs.bundu.org/mzizi/architecture",
        "fundi-guide": "https://docs.bundu.org/mzizi/architecture/fundi",
        "layer-decision-guide": "https://docs.bundu.org/mzizi/architecture/layers",
        "component-backlinks": "https://docs.bundu.org/mzizi/architecture/component-backlinks",
        "brand-guidelines": "https://docs.bundu.org/mzizi/brand",
        "semantic-tokens": "https://docs.bundu.org/mzizi/foundations/tokens",
        introduction: "https://docs.bundu.org/mzizi",
        installation: "https://docs.bundu.org/mzizi/installation",
        "api-reference": "https://docs.bundu.org/mzizi/api-reference",
        contributing: "https://docs.bundu.org/mzizi/contributing",
      },
    },
    { status: 410, headers: CORS }
  )
}
