import { renderMziziOg, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og/mzizi-og"

// Node runtime: the shared template reads the site-icon PNG off disk.
export const runtime = "nodejs"
export const alt = "mzizi — open architecture on the Seven African Minerals design system"
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

// Root social-preview card. Per-page routes add their own opengraph-image.tsx
// and call renderMziziOg({ title, eyebrow, description }) with page-specific
// values, so every share carries the right title + SEO description + icon.
export default function OpengraphImage() {
  return renderMziziOg({ title: "mzizi" })
}
