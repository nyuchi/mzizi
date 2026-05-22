import { NextResponse } from "next/server"
import { createLogger } from "@/lib/observability"
import { isSupabaseConfigured, getBrandSystem } from "@/lib/db"

const logger = createLogger("brand")

const CORS_CACHE = {
  "Cache-Control": "public, max-age=3600, s-maxage=86400",
  "Access-Control-Allow-Origin": "*",
}

export async function GET() {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        {
          error: "Database not configured",
          message: "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
        },
        { status: 503, headers: { "Access-Control-Allow-Origin": "*" } }
      )
    }

    const dbBrand = await getBrandSystem()

    if (!dbBrand || !dbBrand.meta) {
      return NextResponse.json(
        { error: "Brand data not found in database" },
        { status: 404, headers: { "Access-Control-Allow-Origin": "*" } }
      )
    }

    const fontEntries = dbBrand.typography.filter((t) => t.entry_type === "font")
    const scaleEntries = dbBrand.typography.filter((t) => t.entry_type === "scale")

    const fonts: Record<string, { family: string; usage: string; reason: string }> = {}
    for (const f of fontEntries) {
      const key = f.name.replace("font-", "")
      fonts[key] = {
        family: f.family ?? "",
        usage: f.usage,
        reason: f.reason ?? "",
      }
    }

    const brandSystem = {
      $schema: "https://mzizi.dev/schema/brand.json",
      "@context": "https://schema.org",
      "@type": "Brand",
      version: dbBrand.meta.version,
      name: dbBrand.meta.name,
      lastUpdated: dbBrand.meta.last_updated,
      homepage: dbBrand.meta.homepage,
      minerals: dbBrand.minerals.map((m) => ({
        name: m.name,
        hex: m.hex,
        lightHex: m.light_hex,
        darkHex: m.dark_hex,
        containerLight: m.container_light,
        containerDark: m.container_dark,
        cssVar: m.css_var,
        origin: m.origin,
        symbolism: m.symbolism,
        usage: m.usage,
      })),
      ecosystem: dbBrand.ecosystem.map((b) => ({
        name: b.name,
        meaning: b.meaning,
        language: b.language,
        role: b.role,
        description: b.description,
        voice: b.voice,
        mineral: b.mineral,
        url: b.url,
      })),
      typography: {
        fonts,
        scale: scaleEntries.map((t) => ({
          name: t.name,
          sizePx: t.size_px ?? 0,
          sizeRem: t.size_rem ?? "",
          lineHeight: t.line_height ?? "",
          weight: t.weight ?? 400,
          font: (t.font ?? "sans") as "sans" | "serif" | "mono",
          usage: t.usage,
        })),
      },
      spacing: dbBrand.spacing.map((s) => ({
        name: s.name,
        px: s.px,
        rem: s.rem,
        usage: s.usage,
      })),
      radii: dbBrand.meta.radii,
      semanticColors: dbBrand.semanticColors.map((c) => ({
        name: c.name,
        light: c.light_value,
        dark: c.dark_value,
        usage: c.usage,
      })),
      backgrounds: dbBrand.backgrounds.map((c) => ({
        name: c.name.replace("bg-", ""),
        light: c.light_value,
        dark: c.dark_value,
        usage: c.usage,
      })),
      componentSpecs: dbBrand.meta.component_specs,
      accessibility: dbBrand.meta.accessibility,
      voiceAndTone: dbBrand.meta.voice_and_tone,
      philosophy: dbBrand.meta.philosophy,
    }

    logger.info("Brand system served", {
      data: { version: brandSystem.version },
    })

    return NextResponse.json(brandSystem, { headers: CORS_CACHE })
  } catch (error) {
    logger.error("Brand API error", {
      error: error instanceof Error ? error : new Error(String(error)),
    })
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: { "Access-Control-Allow-Origin": "*" } }
    )
  }
}
