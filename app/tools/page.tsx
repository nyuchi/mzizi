import type { Metadata } from "next"
import Link from "next/link"

import { listMcpToolRegistry, isSupabaseConfigured } from "@/lib/db"
import { StatusBadge, type StatusBadgeStatus } from "@/components/ui/status-badge"

// TOOLS INDEX — issue #85
//
// Server-rendered index of the published Mzizi tools. Hydrated from the
// Supabase `mcp_tool_registry` table when available, falling back to the
// known set (mzizi-mcp, mzizi-sdk, mzizi-skills, mzizi-cli) when the
// registry doesn't yet include them. The full registry-driven endpoints
// are tracked in #83.

export const revalidate = 3600

export const metadata: Metadata = {
  title: "Tools — Mzizi",
  description:
    "Published Mzizi tools — MCP server, SDK, skills bundle, and CLI. Install via npm or npx.",
}

interface ToolCardData {
  name: string
  description: string
  category: string
  status: StatusBadgeStatus
  version: string | null
}

const KNOWN_TOOLS: ToolCardData[] = [
  {
    name: "mzizi-mcp",
    description: "Model Context Protocol server exposing the Mzizi registry to AI assistants.",
    category: "mcp",
    status: "stable",
    version: null,
  },
  {
    name: "mzizi-sdk",
    description: "TypeScript SDK for the Mzizi API — fetch components, brand tokens, and skills.",
    category: "sdk",
    status: "alpha",
    version: null,
  },
  {
    name: "mzizi-skills",
    description: "Markdown bundle of design-system skills for any AI assistant.",
    category: "skills",
    status: "stable",
    version: null,
  },
  {
    name: "mzizi-cli",
    description: "Bootstrap and maintain Bundu ecosystem apps from the registry.",
    category: "cli",
    status: "stable",
    version: null,
  },
]

function statusFromStability(stability: string | null | undefined): StatusBadgeStatus {
  switch (stability) {
    case "stable":
    case "frozen":
      return "stable"
    case "deprecated":
      return "deprecated"
    default:
      return "alpha"
  }
}

export default async function ToolsPage() {
  let tools: ToolCardData[] = KNOWN_TOOLS

  if (isSupabaseConfigured()) {
    const rows = await listMcpToolRegistry().catch(() => [])
    const fromDb: ToolCardData[] = rows
      .filter((r) => r.tool_name.startsWith("mzizi-"))
      .map((r) => ({
        name: r.tool_name,
        description: r.description ?? "",
        category: r.category ?? "tool",
        status: statusFromStability(r.stability),
        version: r.current_version,
      }))
    // Merge: prefer DB rows, fall back to known set for missing names.
    const byName = new Map<string, ToolCardData>(KNOWN_TOOLS.map((t) => [t.name, t]))
    for (const t of fromDb) byName.set(t.name, t)
    tools = Array.from(byName.values()).sort((a, b) => a.name.localeCompare(b.name))
  }

  return (
    <article className="mx-auto w-full max-w-3xl space-y-8 py-8">
      <header className="space-y-3">
        <p className="font-mono text-[11px] tracking-widest text-muted-foreground uppercase">
          Tools
        </p>
        <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Published Mzizi tools
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          The Mzizi distribution surface — MCP server, SDK, skills bundle, and CLI. Each tool is
          installable via npm or npx and lives in the bundu ecosystem GitHub org.
        </p>
      </header>

      <ul className="grid gap-3 sm:grid-cols-2">
        {tools.map((tool) => (
          <li key={tool.name}>
            <Link
              href={`/tools/${tool.name}`}
              className="group flex h-full flex-col gap-2 rounded-xl border border-border bg-card p-4 transition-colors hover:border-foreground/20"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-sm font-medium text-foreground">{tool.name}</span>
                <StatusBadge status={tool.status} />
              </div>
              {tool.description ? (
                <p className="text-xs leading-relaxed text-muted-foreground">{tool.description}</p>
              ) : null}
              <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                <span className="font-mono text-[10px] text-muted-foreground uppercase">
                  {tool.category}
                </span>
                {tool.version ? (
                  <span className="font-mono text-[10px] text-muted-foreground">
                    v{tool.version}
                  </span>
                ) : null}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </article>
  )
}
