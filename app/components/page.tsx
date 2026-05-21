import type { Metadata } from "next"
import { ComponentGallery } from "@/components/playground/component-gallery"

export const metadata: Metadata = {
  title: "Components — Mzizi",
  description:
    "Browse the full Mzizi component library. Each component has a live preview, source code, and an API tester.",
}

export const revalidate = 300

export default function ComponentsPage() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 py-8">
      <header className="space-y-3">
        <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Components
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          Browse the full component library. Each component has a live preview, full source code,
          and an API tester to fetch it programmatically.
        </p>
        <pre className="overflow-x-auto rounded-lg border border-border bg-muted/40 p-3 font-mono text-xs">
          <code>npx shadcn@latest add https://mzizi.dev/api/v1/ui/&lt;component-name&gt;</code>
        </pre>
      </header>

      <ComponentGallery />
    </div>
  )
}
