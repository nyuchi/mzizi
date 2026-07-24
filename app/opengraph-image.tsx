import { ImageResponse } from "next/og"
import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { paletteColor } from "@/lib/tokens"

// Node runtime so the site-icon PNG can be read off disk and embedded (same as
// app/icon.tsx). Satori (next/og) then composites it over the honeycomb.
export const runtime = "nodejs"
export const alt = "mzizi — open architecture on the Seven African Minerals design system"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

/**
 * Dynamic OpenGraph / social-preview image for the root route.
 *
 * Rendered by `next/og` (Satori). The hero mark is the SITE ICON — the nyuchi
 * bee (`public/icons/nyuchi-icon-dark.png`), the same asset `app/icon.tsx`
 * serves as the favicon — NOT the mukoko swarm/hex-flower. The background is
 * the "hive" honeycomb: a faint flat-top hex lattice plus cobalt/gold accent
 * cells (mineral hexes from the design DB via `paletteColor()`).
 *
 * NOTE: this is the ONLY OG source. `app/layout.tsx` must NOT set an explicit
 * `openGraph.images` / `twitter.images` — Next's file convention wires this
 * route (and the twitter card falls back to it) with an absolute, hashed URL.
 * Per-page OG should live in a shared template (see the SEO/AIO toolkit) so
 * every route can emit a card carrying its own title + description + icon.
 */

const W = 1200
const H = 630

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

// Solid accent cells framing the hero, using the mineral palette (cobalt +
// gold lead; a few extra minerals for warmth). Kept clear of the text column.
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

export default async function OpengraphImage() {
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
          width: 680,
          height: H,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 84px",
        }}
      >
        <div
          style={{
            fontSize: 22,
            letterSpacing: 5,
            textTransform: "uppercase",
            color: "#B2AFA8",
          }}
        >
          open architecture · bundu foundation
        </div>
        <div
          style={{
            marginTop: 18,
            fontSize: 150,
            lineHeight: 1,
            fontWeight: 700,
            letterSpacing: -3,
            color: "#F5F5F4",
          }}
        >
          mzizi
        </div>
        <div
          style={{
            marginTop: 28,
            fontSize: 30,
            lineHeight: 1.35,
            color: "#B2AFA8",
            maxWidth: 480,
          }}
        >
          Seven African Minerals · shadcn-compatible registry · MCP server.
        </div>
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
    { ...size }
  )
}
