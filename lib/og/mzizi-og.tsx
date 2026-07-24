import { ImageResponse } from "next/og"
import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { paletteColor } from "@/lib/tokens"

/*
 * Shared Mzizi OpenGraph / social-preview template — the Seven-Minerals "hive"
 * card. One template, every route: the root and each content route render it
 * with their OWN title + description so social/messaging previews are dynamic
 * (they pick up the page's title + SEO description + the site icon), never a
 * single static image.
 *
 * Rendered by `next/og` (Satori). The hero mark is the SITE ICON — the nyuchi
 * bee (`public/icons/nyuchi-icon-dark.png`), the same asset `app/icon.tsx`
 * serves as the favicon. Background is the honeycomb: a faint flat-top hex
 * lattice + mineral accent cells (hexes from the design DB via paletteColor).
 *
 * Routes that use this MUST set `export const runtime = "nodejs"` (the icon is
 * read off disk) and re-export OG_SIZE / OG_CONTENT_TYPE. This is the ONLY OG
 * source — never set an explicit `openGraph.images` in metadata, or it will
 * override the file-convention route and previews break.
 */

export const OG_SIZE = { width: 1200, height: 630 }
export const OG_CONTENT_TYPE = "image/png"

const W = OG_SIZE.width
const H = OG_SIZE.height

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

// Solid accent cells framing the hero, using the mineral palette. Clear of the
// text column on the left.
const ACCENTS: { cx: number; cy: number; r: number; c: string; o: number }[] = [
  { cx: 1140, cy: 70, r: 40, c: paletteColor("gold"), o: 0.9 },
  { cx: 1070, cy: 150, r: 40, c: paletteColor("cobalt"), o: 0.55 },
  { cx: 1150, cy: 545, r: 40, c: paletteColor("cobalt"), o: 0.9 },
  { cx: 1075, cy: 470, r: 34, c: paletteColor("gold"), o: 0.5 },
  { cx: 690, cy: 545, r: 34, c: paletteColor("malachite"), o: 0.7 },
  { cx: 640, cy: 75, r: 34, c: paletteColor("tanzanite"), o: 0.7 },
  { cx: 1015, cy: 300, r: 30, c: paletteColor("copper"), o: 0.55 },
  { cx: 735, cy: 300, r: 30, c: paletteColor("gold"), o: 0.5 },
]

// Title size scales down as the title grows, so a long page title and the
// short "mzizi" wordmark both sit well in the frame.
function titleFontSize(title: string): number {
  const n = title.length
  if (n <= 6) return 150
  if (n <= 12) return 104
  if (n <= 20) return 78
  if (n <= 32) return 60
  return 48
}

export interface MziziOgProps {
  /** The headline — page title or the "mzizi" wordmark on the root. */
  title: string
  /** Tracked, uppercase kicker above the title. */
  eyebrow?: string
  /** SEO description line under the title. */
  description?: string
}

/**
 * Build the OG `ImageResponse` for a Mzizi surface. Async because it reads the
 * site-icon PNG off disk (hence the route must run on the Node runtime).
 */
export async function renderMziziOg({
  title,
  eyebrow = "open architecture · bundu foundation",
  description = "Seven African Minerals · shadcn-compatible registry · MCP server.",
}: MziziOgProps): Promise<ImageResponse> {
  const lattice = latticeCells()
  const bee = await readFile(join(process.cwd(), "public/icons/nyuchi-icon-dark.png"))
  const beeSrc = `data:image/png;base64,${bee.toString("base64")}`

  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        position: "relative",
        backgroundColor: "#1B1A17",
        fontFamily: "Helvetica, Arial, sans-serif",
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

      {/* Hero: the site icon (nyuchi bee) on the honeycomb, right of centre */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: 560,
          height: H,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <img src={beeSrc} width={300} height={300} alt="" />
      </div>

      {/* Text column (left) */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 700,
          height: H,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 84px",
        }}
      >
        {eyebrow ? (
          <div
            style={{
              fontSize: 22,
              letterSpacing: 5,
              textTransform: "uppercase",
              color: "#B2AFA8",
            }}
          >
            {eyebrow}
          </div>
        ) : null}
        <div
          style={{
            marginTop: 18,
            fontSize: titleFontSize(title),
            lineHeight: 1,
            fontWeight: 700,
            letterSpacing: -2,
            color: "#F5F5F4",
          }}
        >
          {title}
        </div>
        {description ? (
          <div
            style={{
              marginTop: 28,
              fontSize: 30,
              lineHeight: 1.35,
              color: "#B2AFA8",
              maxWidth: 500,
              display: "flex",
            }}
          >
            {description}
          </div>
        ) : null}
        <div
          style={{
            marginTop: 40,
            fontSize: 26,
            fontWeight: 700,
            color: paletteColor("gold"),
          }}
        >
          mzizi.dev
        </div>
      </div>
    </div>,
    { ...OG_SIZE }
  )
}
