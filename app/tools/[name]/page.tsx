import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, ExternalLink, Package } from "lucide-react"

import { getMcpTool, isSupabaseConfigured } from "@/lib/db"
import { StatusBadge, type StatusBadgeStatus } from "@/components/ui/status-badge"

// TOOL DETAIL — issue #85
//
// Server-rendered detail page for a single published Mzizi tool. For
// known slugs (mzizi-mcp, mzizi-sdk, mzizi-skills, mzizi-cli) we render
// the install command, npm + GitHub links, and the latest version
// (pulled from `mcp_tool_registry` when available, otherwise from the
// hardcoded fallback set). Unknown slugs return a 404.
//
// TODO(#83): when the registry-driven endpoints land, drop the hardcoded
// fallback and surface every row in `mcp_tool_registry` via this page.

export const revalidate = 3600

const SLUG_PATTERN = /^[a-z][a-z0-9-]*$/

interface KnownTool {
  name: string
  npm: string
  github: string
  install: string
  binary: string | null
  description: string
  defaultStatus: StatusBadgeStatus
}

const KNOWN_TOOLS: Record<string, KnownTool> = {
  "mzizi-mcp": {
    name: "mzizi-mcp",
    npm: "https://www.npmjs.com/package/@nyuchi/mzizi-mcp",
    github: "https://github.com/nyuchi/fundi/tree/main/packages/mzizi-mcp",
    install: "npx @nyuchi/mzizi-mcp",
    binary: "mzizi-mcp",
    description:
      "Model Context Protocol server exposing the Mzizi registry, brand tokens, design tokens, and architecture data to AI assistants via Streamable HTTP. Mirrors the live /mcp endpoint.",
    defaultStatus: "stable",
  },
  "mzizi-sdk": {
    name: "mzizi-sdk",
    npm: "https://www.npmjs.com/package/@nyuchi/mzizi-sdk",
    github: "https://github.com/nyuchi/fundi/tree/main/packages/mzizi-sdk",
    install: "npm install @nyuchi/mzizi-sdk",
    binary: null,
    description:
      "TypeScript SDK for the Mzizi API. Fetch the component registry, brand tokens, agent skills, and changelog without hand-rolling HTTP plumbing.",
    defaultStatus: "alpha",
  },
  "mzizi-skills": {
    name: "mzizi-skills",
    npm: "https://www.npmjs.com/package/@nyuchi/mzizi-skills",
    github: "https://github.com/nyuchi/fundi/tree/main/packages/mzizi-skills",
    install: "npx skills add @nyuchi/mzizi-skills",
    binary: null,
    description:
      "Offline-friendly Markdown bundle of design-system skills, regenerated from the Supabase `skills` table on every release. Any AI assistant with a skills loader can ingest it.",
    defaultStatus: "stable",
  },
  "mzizi-cli": {
    name: "mzizi-cli",
    npm: "https://www.npmjs.com/package/@nyuchi/mzizi-cli",
    github: "https://github.com/nyuchi/fundi/tree/main/packages/mzizi-cli",
    install: "npx @nyuchi/mzizi-cli init",
    binary: "mzizi",
    description:
      "Command-line bootstrap and maintenance for Bundu ecosystem apps. Scaffolds a project, installs components, syncs agent skills, and exposes status / changelog subcommands.",
    defaultStatus: "stable",
  },
}

function statusFromStability(stability: string | null | undefined): StatusBadgeStatus | null {
  switch (stability) {
    case "stable":
    case "frozen":
      return "stable"
    case "deprecated":
      return "deprecated"
    case "experimental":
    case "evolving":
      return "alpha"
    default:
      return null
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ name: string }>
}): Promise<Metadata> {
  const { name } = await params
  if (!SLUG_PATTERN.test(name) || !KNOWN_TOOLS[name]) {
    return { title: "Tool not found — Mzizi" }
  }
  const tool = KNOWN_TOOLS[name]
  return {
    title: `${tool.name} — Mzizi tools`,
    description: tool.description,
  }
}

export default async function ToolDetailPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params
  if (!SLUG_PATTERN.test(name)) notFound()

  const known = KNOWN_TOOLS[name]
  if (!known) notFound()

  // Pull live version + DB-derived status when the registry has the row.
  const registryRow = isSupabaseConfigured() ? await getMcpTool(name).catch(() => null) : null
  const status: StatusBadgeStatus =
    statusFromStability(registryRow?.stability) ?? known.defaultStatus
  const version = registryRow?.current_version ?? null

  return (
    <article className="mx-auto w-full max-w-3xl space-y-8 py-8">
      <Link
        href="/tools"
        className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3" /> Back to tools
      </Link>

      <header className="space-y-3">
        <p className="font-mono text-[11px] tracking-widest text-muted-foreground uppercase">
          Tool
        </p>
        <div className="flex flex-wrap items-baseline gap-3">
          <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {known.name}
          </h1>
          <StatusBadge status={status} />
          {version ? (
            <span className="font-mono text-xs text-muted-foreground">v{version}</span>
          ) : null}
        </div>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          {known.description}
        </p>
      </header>

      <section className="space-y-3" aria-label="Install command">
        <h2 className="font-serif text-lg font-semibold text-foreground">Install</h2>
        <pre className="overflow-x-auto rounded-lg border border-border bg-muted/40 p-3 font-mono text-xs">
          <code>{known.install}</code>
        </pre>
        {known.binary ? (
          <p className="text-xs text-muted-foreground">
            Binary:{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-[11px]">
              {known.binary}
            </code>
          </p>
        ) : null}
      </section>

      <section className="space-y-3" aria-label="Links">
        <h2 className="font-serif text-lg font-semibold text-foreground">Links</h2>
        <ul className="flex flex-wrap gap-2">
          <li>
            <a
              href={known.npm}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-foreground/20"
            >
              <Package className="size-3" aria-hidden="true" />
              npm
            </a>
          </li>
          <li>
            <a
              href={known.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-foreground/20"
            >
              <ExternalLink className="size-3" aria-hidden="true" />
              GitHub
            </a>
          </li>
        </ul>
      </section>

      {registryRow ? (
        <section className="space-y-3" aria-label="Registry metadata">
          <h2 className="font-serif text-lg font-semibold text-foreground">Registry metadata</h2>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
            {registryRow.category ? (
              <>
                <dt className="font-mono text-muted-foreground uppercase">Category</dt>
                <dd className="font-mono text-foreground">{registryRow.category}</dd>
              </>
            ) : null}
            {registryRow.tool_kind ? (
              <>
                <dt className="font-mono text-muted-foreground uppercase">Kind</dt>
                <dd className="font-mono text-foreground">{registryRow.tool_kind}</dd>
              </>
            ) : null}
            {registryRow.added_in_version ? (
              <>
                <dt className="font-mono text-muted-foreground uppercase">Added in</dt>
                <dd className="font-mono text-foreground">v{registryRow.added_in_version}</dd>
              </>
            ) : null}
            {registryRow.version_count !== null && registryRow.version_count !== undefined ? (
              <>
                <dt className="font-mono text-muted-foreground uppercase">Versions</dt>
                <dd className="font-mono text-foreground">{registryRow.version_count}</dd>
              </>
            ) : null}
          </dl>
        </section>
      ) : null}
    </article>
  )
}
