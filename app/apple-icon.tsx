import { ImageResponse } from "next/og"
import { readFile } from "node:fs/promises"
import { join } from "node:path"

// Apple touch icon — the gold bee on a solid nyuchi night tile. Apple applies
// its own rounded mask; a solid (non-transparent) background is what keeps it
// legible on the home screen. Node runtime so the PNG can be read + embedded.
export const runtime = "nodejs"
export const size = { width: 180, height: 180 }
export const contentType = "image/png"

export default async function AppleIcon() {
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
        backgroundColor: "#1b1a17",
      }}
    >
      <img src={src} width={128} height={128} alt="" />
    </div>,
    { ...size }
  )
}
