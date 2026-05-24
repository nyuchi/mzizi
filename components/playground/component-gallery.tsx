import { getAllComponents, isSupabaseConfigured } from "@/lib/db"
import { ComponentGalleryClient, type GalleryItem } from "./component-gallery-client"

/**
 * Server component that fetches the full registry from Supabase and hands it
 * to the client filter UI. Replaces the previous `registry.json` import so
 * the catalog reflects live DB state (545+ components, 10 architecture layers).
 *
 * `basePath` controls where the per-card links go — `/components` (the docs
 * surface) by default, `/playground` when rendered from the playground index.
 */
export async function ComponentGallery({ basePath }: { basePath?: string } = {}) {
  let items: GalleryItem[] = []

  if (isSupabaseConfigured()) {
    try {
      const components = await getAllComponents()
      items = components.map((c) => ({
        name: c.name,
        type: c.registry_type,
        description: c.description,
      }))
    } catch {
      items = []
    }
  }

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-muted/30 p-8 text-center text-sm text-muted-foreground">
        Registry is currently unavailable. Check that{" "}
        <code className="font-mono">NEXT_PUBLIC_SUPABASE_URL</code> is set and the database is
        seeded.
      </div>
    )
  }

  return <ComponentGalleryClient items={items} basePath={basePath} />
}
