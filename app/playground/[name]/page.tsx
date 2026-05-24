import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { ComponentPreview } from "@/components/playground/component-preview"
import { ApiTester } from "@/components/playground/api-tester"
import { DemoRenderer } from "@/components/playground/demo-renderer"
import { hasDemoFor } from "@/components/playground/demo-names"
import { ComponentDocSection } from "@/components/playground/component-doc-section"
import { SafeSection } from "@/components/error-boundary"
import { Badge } from "@/components/ui/badge"
import { getAllComponents, getComponent, isSupabaseConfigured } from "@/lib/db"

/**
 * Per-component playground page.
 *
 * Mirrors `/components/[name]` (which is the canonical "docs" surface for
 * each registry item) but flavoured as a playground: the API tester is
 * top-billed, the breadcrumb points back to `/playground`, and the
 * heading frames each item as something to *play with* not read about.
 *
 * Static params are generated from the Supabase registry. Unknown slugs
 * fall through to `notFound()` so we serve a real 404 instead of a stub.
 *
 * ISR: revalidate every 5 minutes — matches the index page (CLAUDE.md §15).
 */

export const revalidate = 300

export async function generateStaticParams() {
  if (!isSupabaseConfigured()) return []
  try {
    const components = await getAllComponents()
    return components.map((c) => ({ name: c.name }))
  } catch {
    return []
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ name: string }>
}): Promise<Metadata> {
  const { name } = await params
  const item = await getComponent(name).catch(() => null)
  if (!item) return { title: "Not Found" }
  return {
    title: `${item.name} — Playground`,
    description: `Interactive playground for the ${item.name} component: ${item.description}`,
  }
}

export default async function PlaygroundComponentPage({
  params,
}: {
  params: Promise<{ name: string }>
}) {
  const { name } = await params
  const item = await getComponent(name).catch(() => null)

  if (!item) notFound()

  const sourceCode = item.source_code ?? "// Source not available"
  const firstFilePath = item.files[0]?.path ?? ""
  const installUrl = `https://mzizi.dev/api/v1/ui/${item.name}`
  const hasDemo = hasDemoFor(item.name)

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8 py-8">
      {/* Breadcrumb — wayfinding back to the playground index */}
      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
        <ol className="flex items-center gap-1.5">
          <li>
            <a
              href="/playground"
              className="rounded-md transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              Playground
            </a>
          </li>
          <li aria-hidden="true" className="text-border">
            /
          </li>
          <li aria-current="page" className="font-mono text-foreground">
            {item.name}
          </li>
        </ol>
      </nav>

      {/* Header — pure server markup */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <h1 className="font-serif text-3xl font-bold tracking-tight">{item.name}</h1>
          <Badge variant="outline" className="font-mono text-xs">
            {item.registry_type.replace("registry:", "")}
          </Badge>
          {item.layer && (
            <Badge variant="secondary" className="font-mono text-xs">
              L{item.layer}
            </Badge>
          )}
        </div>
        <p className="text-lg text-muted-foreground">{item.description}</p>
      </div>

      {/* Live preview (top-billed for the playground) */}
      <SafeSection section="Preview">
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">{hasDemo ? "Live preview" : "Source code"}</h2>
          <p className="text-sm text-muted-foreground">
            {hasDemo
              ? "Interactive preview with a light/dark toggle. Switch to Code to read the full source."
              : "No interactive demo is registered for this component yet — the source is shown directly."}
          </p>
          <ComponentPreview code={sourceCode} hasDemo={hasDemo}>
            <DemoRenderer name={item.name} />
          </ComponentPreview>
        </section>
      </SafeSection>

      {/* Variants + props inspector (use cases, variants, sizes, features) */}
      <SafeSection section="Variants and props">
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Variants & props</h2>
          <p className="text-sm text-muted-foreground">
            The variants, sizes, and props surfaced by the registry. Each is sourced from the
            Supabase <code className="font-mono text-xs">component_docs</code> table.
          </p>
          <ComponentDocSection name={item.name} />
        </section>
      </SafeSection>

      {/* Live API tester */}
      <SafeSection section="API tester">
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">API tester</h2>
          <p className="text-sm text-muted-foreground">
            Hit the registry API live and see the JSON the shadcn CLI consumes when it installs this
            component.
          </p>
          <ApiTester name={item.name} />
        </section>
      </SafeSection>

      {/* Install */}
      <SafeSection section="Installation">
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Install</h2>
          <div className="rounded-xl border border-border bg-muted/50 p-4">
            <code className="text-sm text-foreground">npx shadcn@latest add {installUrl}</code>
          </div>
        </section>
      </SafeSection>

      {/* Dependencies */}
      {((item.dependencies && item.dependencies.length > 0) ||
        (item.registry_dependencies && item.registry_dependencies.length > 0)) && (
        <SafeSection section="Dependencies">
          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Dependencies</h2>
            <div className="flex flex-wrap gap-2">
              {item.dependencies?.map((dep) => (
                <Badge key={dep} variant="secondary">
                  {dep}
                </Badge>
              ))}
              {item.registry_dependencies?.map((dep) => (
                <Badge key={dep} variant="outline">
                  <a href={`/playground/${dep}`} className="hover:underline">
                    {dep}
                  </a>
                </Badge>
              ))}
            </div>
          </section>
        </SafeSection>
      )}

      {/* Source file path */}
      {firstFilePath && (
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Source path</h2>
          <p className="text-sm text-muted-foreground">
            <code className="rounded-md bg-muted px-2 py-1 text-xs">{firstFilePath}</code>
          </p>
        </section>
      )}
    </div>
  )
}
