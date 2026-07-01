import { notFound } from "next/navigation"
import { ComponentPreview } from "@/components/playground/component-preview"
import { ApiTester } from "@/components/playground/api-tester"
import { DemoRenderer } from "@/components/playground/demo-renderer"
import { hasDemoFor } from "@/components/playground/demo-names"
import { ComponentDocSection } from "@/components/playground/component-doc-section"
import { SafeSection } from "@/components/error-boundary"
import { Badge } from "@/components/ui/badge"
import { getAllComponents, getComponent, isSupabaseConfigured } from "@/lib/db"

/**
 * Static params: generate a page per component by listing the DB registry.
 * If Supabase is unreachable at build time we emit an empty set and let the
 * page render on demand — avoiding a build failure in preview environments.
 */
export async function generateStaticParams() {
  if (!isSupabaseConfigured()) return []
  try {
    const components = await getAllComponents()
    return components.map((c) => ({ name: c.name }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params
  const item = await getComponent(name).catch(() => null)
  if (!item) return { title: "Not Found" }
  return {
    title: `${item.name} — nyuchi design portal`,
    description: item.description,
  }
}

export default async function ComponentPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params
  const item = await getComponent(name).catch(() => null)

  if (!item) notFound()

  const sourceCode = item.source_code ?? "// Source not available"
  const firstFilePath = item.files?.[0]?.path ?? ""
  const registryType = item.registry_type?.replace("registry:", "") ?? "component"
  const installUrl = `https://mzizi.dev/api/v1/ui/${item.name}`
  const hasDemo = hasDemoFor(item.name)

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8 py-8">
      {/* Breadcrumb — wayfinding back to the gallery */}
      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
        <ol className="flex items-center gap-1.5">
          <li>
            <a
              href="/components"
              className="rounded-md transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              Components
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

      {/* Header — always renders (no boundary needed, pure server markup) */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <h1 className="font-serif text-3xl font-bold tracking-tight">{item.name}</h1>
          <Badge variant="outline" className="font-mono text-xs">
            {registryType}
          </Badge>
          {item.layer && (
            <Badge variant="secondary" className="font-mono text-xs">
              L{item.layer}
            </Badge>
          )}
        </div>
        <p className="text-lg text-muted-foreground">{item.description}</p>
      </div>

      {/* Use cases, variants, sizes, features */}
      <SafeSection section="Documentation">
        <ComponentDocSection name={item.name} />
      </SafeSection>

      {/* Preview + Code */}
      <SafeSection section="Preview">
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">{hasDemo ? "Preview" : "Source Code"}</h2>
          <p className="text-sm text-muted-foreground">
            {hasDemo
              ? "Interactive preview with light/dark mode toggle. Switch to Code tab to view the full source."
              : "View the full component source code below."}
          </p>
          <ComponentPreview code={sourceCode} hasDemo={hasDemo}>
            <DemoRenderer name={item.name} />
          </ComponentPreview>
        </section>
      </SafeSection>

      {/* Install */}
      <SafeSection section="Installation">
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Installation</h2>
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
                  <a href={`/components/${dep}`} className="hover:underline">
                    {dep}
                  </a>
                </Badge>
              ))}
            </div>
          </section>
        </SafeSection>
      )}

      {/* API Tester */}
      <SafeSection section="API Tester">
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">API</h2>
          <p className="text-sm text-muted-foreground">
            Fetch this component&apos;s metadata and source code from the registry API.
          </p>
          <ApiTester name={item.name} />
        </section>
      </SafeSection>

      {/* Source file path */}
      {firstFilePath && (
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Source</h2>
          <p className="text-sm text-muted-foreground">
            <code className="rounded-md bg-muted px-2 py-1 text-xs">{firstFilePath}</code>
          </p>
        </section>
      )}
    </div>
  )
}
