import { getComponent } from "@/lib/db"
import { renderMziziOg, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og/mzizi-og"

// Node runtime: the shared template reads the site-icon PNG off disk.
export const runtime = "nodejs"
export const alt = "mzizi component"
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

/**
 * Per-component social-preview card. Picks up the component's own name +
 * description from the registry so a shared link to /components/<name> unfurls
 * with that component's title and SEO description (not the generic root card).
 * Degrades to the slug + a generic line if the DB is unreachable.
 */
export default async function Image({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params
  const item = await getComponent(name).catch(() => null)
  return renderMziziOg({
    title: item?.name ?? name,
    eyebrow: item?.layer ? `component · ${item.layer}` : "mzizi component",
    description: item?.description ?? "A component in the Mzizi registry.",
  })
}
