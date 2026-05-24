import type { Metadata } from "next"
import { ComponentGallery } from "@/components/playground/component-gallery"

/**
 * Playground index — interactive browser for the full stable registry.
 *
 * Mirrors `/components` but with playground-flavoured copy (preview +
 * variants + props inspector + live API tester per item). Both routes
 * share `ComponentGallery`; the `basePath="/playground"` prop rewrites
 * the per-card links so the gallery stays on its own route.
 *
 * ISR: revalidate every 5 minutes so new components in the Supabase
 * registry surface without redeploying. See CLAUDE.md §15.
 */

export const metadata: Metadata = {
  title: "Playground — Mzizi",
  description:
    "Interactive playground for the Mzizi component registry — live preview, variants, props inspector, and an API tester for every stable component.",
}

export const revalidate = 300

export default function PlaygroundPage() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 py-8">
      <header className="space-y-3">
        <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Playground
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          Interactive playground for the full Mzizi registry. Pick a component to open its
          live preview, browse its variants, and call the registry API live to fetch its
          source.
        </p>
        <pre className="overflow-x-auto rounded-lg border border-border bg-muted/40 p-3 font-mono text-xs">
          <code>npx shadcn@latest add https://mzizi.dev/api/v1/ui/&lt;component-name&gt;</code>
        </pre>
      </header>

      <ComponentGallery basePath="/playground" />
    </div>
  )
}
