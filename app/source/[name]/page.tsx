import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Copy } from "lucide-react"
import { getComponent, isSupabaseConfigured } from "@/lib/db"

export const revalidate = 3600

const COMPONENT_NAME_PATTERN = /^[a-z][a-z0-9-]*$/

export async function generateMetadata({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params
  if (!COMPONENT_NAME_PATTERN.test(name)) {
    return { title: "Component not found — nyuchi design portal" }
  }
  return {
    title: `Source: ${name} — nyuchi design portal`,
    description: `Read the full TypeScript source for the \`${name}\` registry component.`,
  }
}

/**
 * Per-component source-code page. Documented in the component-backlinks
 * doctrine table at /architecture/component-backlinks; data lives in
 * `components.source_code` on Supabase.
 *
 * For the JSON shape with metadata, dependencies, and shadcn-format
 * registry response, use `/api/v1/ui/{name}` instead.
 */
export default async function SourcePage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params
  if (!COMPONENT_NAME_PATTERN.test(name)) notFound()
  if (!isSupabaseConfigured()) {
    return (
      <article className="mx-auto max-w-4xl py-12">
        <h1 className="font-serif text-3xl font-bold">Source: {name}</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          Supabase is not configured. Source is read live from{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
            components.source_code
          </code>
          .
        </p>
      </article>
    )
  }

  const component = await getComponent(name).catch(() => null)
  if (!component) notFound()
  if (!component.source_code) {
    return (
      <article className="mx-auto max-w-4xl py-12">
        <p className="font-mono text-[11px] tracking-widest text-muted-foreground uppercase">
          {component.layer ?? "—"} · {component.category ?? "—"}
        </p>
        <h1 className="mt-3 font-serif text-3xl font-bold">{component.name}</h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          {component.description}
        </p>
        <p className="mt-6 rounded-lg border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
          No inline source is stored for this component. It may be a registry:block or a composition
          that points at other registry items via{" "}
          <code className="rounded bg-background px-1 py-0.5 font-mono text-xs">
            registryDependencies
          </code>
          . Try{" "}
          <Link
            className="font-medium text-foreground hover:underline"
            href={`/api/v1/ui/${component.name}`}
          >
            /api/v1/ui/{component.name}
          </Link>{" "}
          for the full JSON manifest.
        </p>
      </article>
    )
  }

  return (
    <article data-mdx className="mx-auto max-w-4xl py-8">
      <Link
        href={`/components/${component.name}`}
        className="mb-6 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3" /> Back to component
      </Link>

      <header className="mb-6">
        <p className="mb-3 font-mono text-[11px] tracking-widest text-muted-foreground uppercase">
          Source · {component.registry_type} · {component.layer ?? "—"} ·{" "}
          {component.category ?? "—"}
        </p>
        <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {component.name}
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
          {component.description}
        </p>
      </header>

      <div className="mb-4 flex flex-wrap items-center gap-2 text-xs">
        <Link
          href={`/api/v1/ui/${component.name}`}
          className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 font-medium text-foreground transition-colors hover:bg-muted"
        >
          /api/v1/ui/{component.name}
        </Link>
        <Link
          href={`/changelog/${component.name}`}
          className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 font-medium text-foreground transition-colors hover:bg-muted"
        >
          Version history
        </Link>
        <a
          href={`shadcn@latest add https://mzizi.dev/api/v1/ui/${component.name}`}
          aria-disabled="true"
          tabIndex={-1}
          onClick={(e) => e.preventDefault()}
          className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 font-mono text-[10px] text-muted-foreground"
        >
          <Copy className="size-3" /> npx shadcn@latest add ...
        </a>
      </div>

      <pre className="overflow-x-auto rounded-xl border border-border bg-muted/30 p-4 text-xs leading-relaxed">
        <code className="font-mono">{component.source_code}</code>
      </pre>
    </article>
  )
}
