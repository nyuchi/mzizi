import { NextResponse } from "next/server"
import { createLogger } from "@/lib/observability"
import { isSupabaseConfigured, getDatabaseInfo } from "@/lib/db"

const logger = createLogger("api")

export async function GET() {
  try {
    let dbStatus = "not_configured"
    let componentCount = 0

    if (isSupabaseConfigured()) {
      const info = await getDatabaseInfo().catch(() => null)
      if (info?.status === "connected") {
        dbStatus = "connected"
        componentCount = info.components
      } else {
        dbStatus = "error"
      }
    }

    logger.info("API discovery served")

    return NextResponse.json(
      {
        $schema: "https://mzizi.dev/schema/api.json",
        "@context": "https://schema.org",
        "@type": "WebAPI",
        name: "Mzizi API",
        version: "1.0.0",
        description:
          "The Mzizi API — components, brand, architecture, and design system. Mzizi is an open-architecture project of the Bundu Foundation, operated and developed by Nyuchi.",
        homepage: "https://mzizi.dev",
        database: {
          status: dbStatus,
          components: componentCount,
        },
        resources: {
          brand: {
            href: "/api/v1/brand",
            description:
              "Brand system — Five African Minerals palette, typography, spacing, ecosystem brands.",
          },
          ui: {
            href: "/api/v1/ui",
            description: `Component registry — ${componentCount} items served from database.`,
          },
          ecosystem: {
            href: "/api/v1/ecosystem",
            description: "Architecture principles, framework decision, and Ubuntu philosophy.",
          },
          dataLayer: {
            href: "/api/v1/data-layer",
            description: "Local-first data layer and cloud services.",
          },
          pipeline: {
            href: "/api/v1/pipeline",
            description: "Open data pipeline — Redpanda, Flink, Doris.",
          },
          sovereignty: {
            href: "/api/v1/sovereignty",
            description: "Technology sovereignty assessments.",
          },
          health: {
            href: "/api/v1/health",
            description: "Service health check — database and registry status.",
          },
          architectureFrontendAxes: {
            href: "/api/v1/architecture/frontend/axes",
            description:
              "Five axes of the 3D frontend architecture (X, Y, Z, Outside, Documentation).",
          },
          architectureFrontendLayers: {
            href: "/api/v1/architecture/frontend/layers",
            description:
              "Ten layers of the 3D frontend architecture (L1 tokens .. L10 documentation).",
          },
          ubuntuPillars: {
            href: "/api/v1/ubuntu/pillars",
            description: "Five Ubuntu pillars — spheres in which Ubuntu is lived.",
          },
          ubuntuPrinciples: {
            href: "/api/v1/ubuntu/principles",
            description: "Five Ubuntu principles — operating rules translating Ubuntu to software.",
          },
          mcp: {
            href: "/mcp",
            description: "Model Context Protocol server — Streamable HTTP transport.",
          },
          search: {
            href: "/api/v1/search",
            description: "Search components by name/description; filter by layer and category.",
          },
          componentDocs: {
            href: "/api/v1/ui/{name}/docs",
            description: "Component documentation — use cases, variants, accessibility.",
          },
          componentVersions: {
            href: "/api/v1/ui/{name}/versions",
            description: "Component version history.",
          },
          docs: {
            href: "/api/v1/docs",
            description:
              "GONE (HTTP 410). Long-form documentation moved to the standalone Mzizi docs site — see https://docs.mzizi.dev.",
            status: "gone",
          },
          changelog: {
            href: "/api/v1/changelog",
            description: "Release changelog.",
          },
          aiInstructions: {
            href: "/api/v1/ai/instructions",
            description: "AI assistant instructions (Claude, Copilot, Cursor, MCP).",
          },
          skills: {
            href: "/api/v1/skills",
            description:
              "Agent-skill MDX bodies — reusable workflows AI assistants invoke on specific tasks. Use /skills/{name} for a single skill's full body, /skills/summary for the cheap version-drift check.",
          },
          stats: {
            href: "/api/v1/stats",
            description: "Public usage statistics (CC BY 4.0).",
          },
        },
      },
      {
        headers: {
          "Cache-Control": "public, max-age=3600, s-maxage=86400",
          "Access-Control-Allow-Origin": "*",
        },
      }
    )
  } catch (error) {
    logger.error("API discovery error", {
      error: error instanceof Error ? error : new Error(String(error)),
    })
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: { "Access-Control-Allow-Origin": "*" } }
    )
  }
}
