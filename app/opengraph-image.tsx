import { ImageResponse } from "next/og"
import { paletteColor } from "@/lib/tokens"

export const runtime = "edge"
export const alt = "Mzizi — an open-architecture project of the Bundu Foundation"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

/**
 * Dynamic OpenGraph image for the root route (issue #9). Rendered by
 * `next/og` (Satori) — no CSS custom properties, so hex values are
 * required here. The mineral strip on the left is the brand identity
 * element; the rest is the deep-night theme at 1200x630.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        backgroundColor: "#0A0A0A",
        color: "#F5F5F4",
        fontFamily: "Helvetica, Arial, sans-serif",
      }}
    >
      {/* Vertical mineral strip — 20px, 5 mineral bands (DB-sourced hexes;
          satori has no CSS custom properties so concrete values are required) */}
      <div style={{ width: 20, display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 1, backgroundColor: paletteColor("cobalt", "light") }} />
        <div style={{ flex: 1, backgroundColor: paletteColor("tanzanite") }} />
        <div style={{ flex: 1, backgroundColor: paletteColor("malachite") }} />
        <div style={{ flex: 1, backgroundColor: paletteColor("gold") }} />
        <div style={{ flex: 1, backgroundColor: paletteColor("terracotta") }} />
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px 96px",
        }}
      >
        <div
          style={{
            fontSize: 20,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: "#9A9A95",
          }}
        >
          mzizi
        </div>
        <div
          style={{
            marginTop: 28,
            fontSize: 72,
            lineHeight: 1.05,
            fontWeight: 700,
            letterSpacing: -1,
          }}
        >
          An open-architecture project of the Bundu Foundation.
        </div>
        <div
          style={{
            marginTop: 36,
            fontSize: 28,
            lineHeight: 1.4,
            color: "#9A9A95",
            maxWidth: 920,
          }}
        >
          Open 3D frontend architecture · Seven African Minerals palette · shadcn-compatible registry
          · MCP server.
        </div>
        <div
          style={{
            marginTop: "auto",
            paddingTop: 48,
            display: "flex",
            gap: 32,
            fontSize: 22,
            color: "#5C5B58",
          }}
        >
          <span>mzizi.dev</span>
          <span>·</span>
          <span>github.com/nyuchi/design-portal</span>
        </div>
      </div>
    </div>,
    { ...size }
  )
}
