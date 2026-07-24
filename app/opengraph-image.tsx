import { ImageResponse } from "next/og"
import { paletteColor } from "@/lib/tokens"

export const runtime = "edge"
export const alt = "mzizi — open architecture on the Seven African Minerals design system"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

/**
 * Dynamic OpenGraph / social-preview image for the root route.
 *
 * Rendered by `next/og` (Satori). Satori has no CSS custom properties, so the
 * mineral hexes below use concrete hexes pulled from the design database via
 * `paletteColor(...)` (the same source `tokens:sync` reads) — never hand-typed.
 *
 * Design: the "hive" honeycomb — a faint flat-top hex lattice across a
 * deep-night ground, a few solid cobalt/gold accent cells, and the hero
 * seven-mineral hex flower (1 centre + 6 petals = the seven minerals). Text
 * sits on the left; the flower anchors the right.
 *
 * NOTE: this is the ONLY OG source. `app/layout.tsx` must NOT set an explicit
 * `openGraph.images` / `twitter.images` — Next's file convention wires this
 * route (and the twitter card falls back to it) with an absolute, hashed URL.
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

// Seven-mineral hero flower: centre + 6 petals. 7 minerals, exactly.
function flower() {
  const cx = 872
  const cy = 300
  const r = 78 // circumradius of the drawn cell
  const gap = 1.03 // slight breathing room between petals
  const d = Math.sqrt(3) * r * gap // centre-to-neighbour distance
  const petalAngles = [30, 90, 150, 210, 270, 330]
  // Alternating cool / warm around the ring so neighbours contrast.
  const petals = [
    paletteColor("cobalt"),
    paletteColor("gold"),
    paletteColor("malachite"),
    paletteColor("copper"),
    paletteColor("sodalite"),
    paletteColor("terracotta"),
  ]
  const cells: { fill: string; points: string }[] = [
    { fill: paletteColor("tanzanite"), points: hex(cx, cy, r * 0.94) }, // centre = Identity
  ]
  petalAngles.forEach((deg, i) => {
    const a = (Math.PI / 180) * deg
    cells.push({
      fill: petals[i],
      points: hex(cx + d * Math.cos(a), cy + d * Math.sin(a), r * 0.94),
    })
  })
  return cells
}

// A handful of solid accent cells framing the corners — cobalt + gold, the
// two "hive" colours. Kept clear of the left text column.
const ACCENTS: { cx: number; cy: number; r: number; c: string; o: number }[] = [
  { cx: 1140, cy: 70, r: 40, c: paletteColor("gold"), o: 0.9 },
  { cx: 1070, cy: 150, r: 40, c: paletteColor("cobalt"), o: 0.55 },
  { cx: 1150, cy: 540, r: 40, c: paletteColor("cobalt"), o: 0.9 },
  { cx: 1075, cy: 470, r: 34, c: paletteColor("gold"), o: 0.5 },
  { cx: 700, cy: 560, r: 34, c: paletteColor("gold"), o: 0.75 },
  { cx: 640, cy: 70, r: 34, c: paletteColor("cobalt"), o: 0.7 },
]

export default function OpengraphImage() {
  const lattice = latticeCells()
  const petals = flower()

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
        {/* faint lattice */}
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
        {/* solid accent cells */}
        {ACCENTS.map((a, i) => (
          <polygon key={`a${i}`} points={hex(a.cx, a.cy, a.r)} fill={a.c} fillOpacity={a.o} />
        ))}
        {/* hero seven-mineral flower */}
        {petals.map((p, i) => (
          <polygon key={`p${i}`} points={p.points} fill={p.fill} />
        ))}
      </svg>

      {/* Text column (left) */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 660,
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
            maxWidth: 470,
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
