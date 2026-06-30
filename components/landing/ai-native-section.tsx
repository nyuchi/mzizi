"use client"

import { useState } from "react"
import { Check, Copy, Bot, Zap, BarChart2, Terminal } from "lucide-react"
import { LiveMcpStats } from "@/components/live-mcp-stats"

function CopySnippet({ code, label }: { code: string; label: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <div className="group relative">
      <p className="mb-1.5 text-xs font-medium text-muted-foreground">{label}</p>
      <div className="flex items-start gap-2 rounded-[var(--radius-md)] border border-border bg-muted/50 px-4 py-3 font-mono text-xs">
        <code className="flex-1 break-all whitespace-pre-wrap text-foreground">{code}</code>
        <button
          onClick={() => {
            navigator.clipboard.writeText(code)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
          }}
          className="mt-0.5 shrink-0 text-muted-foreground transition-colors hover:text-foreground"
        >
          {copied ? (
            <Check className="size-3.5 text-[var(--color-malachite)]" />
          ) : (
            <Copy className="size-3.5" />
          )}
        </button>
      </div>
    </div>
  )
}

const mcpConfig = `{
  "mcpServers": {
    "mzizi": {
      "type": "url",
      "url": "https://mzizi.dev/mcp"
    }
  }
}`

const skillUsage = `# In any Claude Code session:
/nyuchi-design-system

# Or ask Claude directly:
@design-portal get_component button
@design-portal scaffold_component data-table`

export function AiNativeSection() {
  return (
    <section className="px-4 py-12 sm:px-6 sm:py-16 md:py-24">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8 text-center sm:mb-14">
          <p className="mb-3 text-xs font-medium tracking-widest text-muted-foreground uppercase sm:text-sm">
            AI-Native
          </p>
          <h2 className="font-serif text-2xl font-bold tracking-tight text-balance text-foreground sm:text-3xl md:text-4xl">
            Your design system, inside your AI assistant
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground sm:mt-4 sm:text-base">
            Mzizi ships with a Model Context Protocol server and a Claude Code skill. Your AI
            assistant can browse components, generate scaffolds, and fetch source code — without
            leaving the conversation.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* MCP Server */}
          <div className="flex flex-col gap-4 rounded-[var(--radius-xl)] border border-border bg-card p-6">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-cobalt)]/10">
                <Bot className="size-5 text-[var(--color-cobalt)]" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">MCP Server</h3>
                <p className="text-xs text-muted-foreground">
                  Streamable HTTP · <LiveMcpStats format="tools" />
                </p>
              </div>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Connect Claude Code, Cursor, or any MCP-compatible assistant to the full component
              registry. Browse, search, scaffold, and fetch source — live from the database.
            </p>
            <CopySnippet code={mcpConfig} label=".claude/settings.json" />
            <div className="mt-auto grid grid-cols-2 gap-1.5">
              {[
                "list_components",
                "get_component",
                "search_components",
                "scaffold_component",
                "get_design_tokens",
                "get_usage_stats",
              ].map((tool) => (
                <span
                  key={tool}
                  className="truncate rounded-full bg-muted px-2 py-0.5 font-mono text-[10px] text-muted-foreground"
                >
                  {tool}
                </span>
              ))}
            </div>
          </div>

          {/* Claude Code Skill */}
          <div className="flex flex-col gap-4 rounded-[var(--radius-xl)] border border-border bg-card p-6">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-tanzanite)]/10">
                <Terminal className="size-5 text-[var(--color-tanzanite)]" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">Claude Code Skill</h3>
                <p className="text-xs text-muted-foreground">Slash command · Design system aware</p>
              </div>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              The{" "}
              <code className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">
                nyuchi-design-system
              </code>{" "}
              skill teaches Claude Code the Seven African Minerals palette, component patterns,
              Ubuntu design principles, and APCA accessibility standards.
            </p>
            <CopySnippet code={skillUsage} label="Usage" />
            <ul className="mt-auto space-y-1.5 text-xs text-muted-foreground">
              {[
                "Seven African Minerals palette",
                "CVA + Radix + cn() patterns",
                "Ubuntu design checklist",
                "APCA Lc 90+ contrast guide",
                "56px touch target enforcement",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <span className="size-1 shrink-0 rounded-full bg-[var(--color-tanzanite)]" />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Open Data / Observability */}
          <div className="flex flex-col gap-4 rounded-[var(--radius-xl)] border border-border bg-card p-6">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-malachite)]/10">
                <BarChart2 className="size-5 text-[var(--color-malachite)]" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">Open Data</h3>
                <p className="text-xs text-muted-foreground">Public metrics · CC BY 4.0</p>
              </div>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Usage metrics are public — aligned with the bundu open data philosophy. See which
              components are most installed, API latency, error rates, and MCP tool usage in real
              time.
            </p>
            <div className="space-y-2">
              <a
                href="/observability"
                className="flex items-center justify-between rounded-[var(--radius-md)] border border-border bg-muted/50 px-3 py-2 text-xs transition-colors hover:border-foreground/15"
              >
                <span className="font-mono text-foreground">/observability</span>
                <Zap className="size-3 text-[var(--color-malachite)]" />
              </a>
              <a
                href="/api/v1/stats"
                className="flex items-center justify-between rounded-[var(--radius-md)] border border-border bg-muted/50 px-3 py-2 text-xs transition-colors hover:border-foreground/15"
              >
                <span className="font-mono text-foreground">GET /api/v1/stats</span>
                <Copy className="size-3 text-muted-foreground" />
              </a>
            </div>
            <ul className="mt-auto space-y-1.5 text-xs text-muted-foreground">
              {[
                "Most installed components",
                "API call volumes + latency",
                "MCP tool usage breakdown",
                "Error rates by endpoint",
                "30-day traffic trends",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <span className="size-1 shrink-0 rounded-full bg-[var(--color-malachite)]" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
