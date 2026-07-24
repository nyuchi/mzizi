import { ImageResponse } from "next/og"
import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { paletteColor } from "@/lib/tokens"

/*
 * Shared Mzizi OpenGraph / social-preview template — the Seven-Minerals "hive"
 * card. One template, every route, EVERY BRAND: the root and each content
 * route render it with their OWN title + description + site icon, so previews
 * are dynamic and brand-agnostic.
 *
 * Brand-agnostic by design: the hero mark is whatever `iconPath` points at
 * (defaults to this site's icon). Nyuchi → the bee, mukoko → the swarm, bundu
 * / shamwari → their own mark — the same template, just a different icon file.
 * The icon sits ABOVE the title (centred) to build brand recognition.
 *
 * Rendered by `next/og` (Satori). Background is the honeycomb: a faint
 * flat-top hex lattice + mineral accent cells (hexes from the design DB via
 * paletteColor). Text colours are APCA-checked against the #1B1A17 ground
 * (title Lc 92, secondary #E5E3DE Lc 81, gold Lc 76 — all clear the Lc 75
 * large-text floor).
 *
 * Routes MUST set `export const runtime = "nodejs"` (the icon is read off
 * disk) and re-export OG_SIZE / OG_CONTENT_TYPE. This is the ONLY OG source —
 * never set an explicit `openGraph.images` in metadata or it overrides the
 * file-convention route and previews break.
 */

export const OG_SIZE = { width: 1200, height: 630 }
export const OG_CONTENT_TYPE = "image/png"

const W = OG_SIZE.width
const H = OG_SIZE.height

// APCA-verified against #1B1A17 (reverse polarity):
//   title #F5F5F4 → Lc 92 · secondary #E5E3DE → Lc 81 · gold → Lc 76.
const BG = "#1B1A17"
const INK = "#F5F5F4"
const INK_SOFT = "#E5E3DE"

// Flat-top hexagon: vertices at 0°,60°,…,300°. Returns an SVG `points` string.
function hex(cx: number, cy: number, r: number): string {
  const pts: string[] = []
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 180) * (60 * i)
    pts.push(`${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`)
  }
  return pts.join(" ")
}

// Faint background lattice — flat-top hex grid across the whole canvas.
function latticeCells(): { key: string; points: string }[] {
  const r = 46
  const dx = 1.5 * r
  const dy = Math.sqrt(3) * r
  const cells: { key: string; points: string }[] = []
  let col = 0
  for (let x = -r; x < W + r; x += dx, col++) {
    const yOffset = col % 2 === 0 ? 0 : dy / 2
    for (let y = -r; y < H + r; y += dy) {
      cells.push({ key: `${col}-${y.toFixed(0)}`, points: hex(x, y + yOffset, r * 0.9) })
    }
  }
  return cells
}

// Solid accent cells in the four corners, using the mineral palette — framing
// a centred composition while keeping the middle band clear for the content.
const ACCENTS: { cx: number; cy: number; r: number; c: string; o: number }[] = [
  { cx: 78, cy: 70, r: 40, c: paletteColor("gold"), o: 0.85 },
  { cx: 150, cy: 150, r: 30, c: paletteColor("cobalt"), o: 0.5 },
  { cx: 1122, cy: 70, r: 40, c: paletteColor("cobalt"), o: 0.85 },
  { cx: 1050, cy: 150, r: 30, c: paletteColor("gold"), o: 0.5 },
  { cx: 78, cy: 560, r: 40, c: paletteColor("tanzanite"), o: 0.8 },
  { cx: 152, cy: 482, r: 30, c: paletteColor("malachite"), o: 0.5 },
  { cx: 1122, cy: 560, r: 40, c: paletteColor("gold"), o: 0.85 },
  { cx: 1048, cy: 482, r: 30, c: paletteColor("copper"), o: 0.55 },
]

// Title size scales down as the title grows, so a long page title and the
// short "mzizi" wordmark both sit well in the frame.
function titleFontSize(title: string): number {
  const n = title.length
  if (n <= 6) return 132
  if (n <= 12) return 100
  if (n <= 20) return 76
  if (n <= 32) return 58
  return 46
}

export interface MziziOgProps {
  /** The headline — page title or the brand wordmark on the root. */
  title: string
  /** Tracked, uppercase kicker between the icon and the title. */
  eyebrow?: string
  /** SEO description line under the title. */
  description?: string
  /**
   * Public-relative path to the site icon (raster PNG — Satori composites it).
   * Defaults to this site's icon; other brands pass their own mark so the one
   * template serves nyuchi / mukoko / bundu / shamwari.
   */
  iconPath?: string
  /** Domain shown in the footer (defaults to mzizi.dev). */
  domain?: string
}

/**
 * Build the OG `ImageResponse` for a Mzizi surface. Async because it reads the
 * site-icon PNG off disk (hence the route must run on the Node runtime).
 */
export async function renderMziziOg({
  title,
  eyebrow = "open architecture · bundu foundation",
  description = "Seven African Minerals · shadcn-compatible registry · MCP server.",
  iconPath = "public/icons/nyuchi-icon-dark.png",
  domain = "mzizi.dev",
}: MziziOgProps): Promise<ImageResponse> {
  const lattice = latticeCells()
  const icon = await readFile(join(process.cwd(), iconPath))
  const iconSrc = `data:image/png;base64,${icon.toString("base64")}`

  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        backgroundColor: BG,
        fontFamily: "Helvetica, Arial, sans-serif",
        padding: "56px 90px",
      }}
    >
      {/* Honeycomb graphics */}
      <svg
        width={W}
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        style={{ position: "absolute", top: 0, left: 0 }}
      >
        {lattice.map((c) => (
          <polygon
            key={c.key}
            points={c.points}
            fill="none"
            stroke="#FFFFFF"
            strokeOpacity={0.05}
            strokeWidth={1.5}
          />
        ))}
        {ACCENTS.map((a, i) => (
          <polygon key={`a${i}`} points={hex(a.cx, a.cy, a.r)} fill={a.c} fillOpacity={a.o} />
        ))}
      </svg>

      {/* Hero: the SITE ICON, above the title (brand recognition first) */}
      <img src={iconSrc} width={168} height={168} alt="" />

      {eyebrow ? (
        <div
          style={{
            marginTop: 30,
            fontSize: 22,
            letterSpacing: 5,
            textTransform: "uppercase",
            color: INK_SOFT,
          }}
        >
          {eyebrow}
        </div>
      ) : null}

      <div
        style={{
          marginTop: 14,
          fontSize: titleFontSize(title),
          lineHeight: 1.02,
          fontWeight: 700,
          letterSpacing: -2,
          color: INK,
          textAlign: "center",
          maxWidth: 1000,
        }}
      >
        {title}
      </div>

      {description ? (
        <div
          style={{
            marginTop: 22,
            fontSize: 28,
            lineHeight: 1.35,
            color: INK_SOFT,
            textAlign: "center",
            maxWidth: 900,
            display: "flex",
          }}
        >
          {description}
        </div>
      ) : null}

      <div
        style={{
          marginTop: 28,
          fontSize: 24,
          fontWeight: 700,
          color: paletteColor("gold"),
        }}
      >
        {domain}
      </div>
    </div>,
    { ...OG_SIZE }
  )
}
