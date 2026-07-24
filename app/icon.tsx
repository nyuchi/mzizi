import { ImageResponse } from "next/og"
import { readFile } from "node:fs/promises"
import { join } from "node:path"

// Node runtime so we can read the bee PNG off disk and embed it. Satori (next/og)
// composites it onto a solid tile — the transparent bee alone gave a
// background-less favicon that vanished on dark browser chrome.
export const runtime = "nodejs"
export const size = { width: 64, height: 64 }
export const contentType = "image/png"

export default async function Icon() {
  const bee = await readFile(join(process.cwd(), "public/icons/nyuchi-icon-dark.png"))
  const src = `data:image/png;base64,${bee.toString("base64")}`
  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        // Solid nyuchi night surface (--background dark). Satori has no CSS
        // custom properties, so the concrete hex is required here.
        backgroundColor: "#1b1a17",
      }}
    >
      <img src={src} width={46} height={46} alt="" />
    </div>,
    { ...size }
  )
}
