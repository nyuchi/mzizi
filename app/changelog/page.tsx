import type { Metadata } from "next"

import { listChangelog, isSupabaseConfigured } from "@/lib/db"
import { NodeBadgeList } from "@/components/ui/node-badge"

// CHANGELOG — issue #85
//
// Server-rendered timeline of releases. Reads from the node-aware
// `list_changelog()` RPC introduced by the `versioning_and_changelog_v2`
// migration; renders each release with its version, title, release date,
// description, and the ecosystem nodes (N1–N10) touched. The node
// badges are axis-coloured per the live `nyuchi-changelog-renderer`
// (registry v2.0.0).

export const revalidate = 3600

export const metadata: Metadata = {
  title: "Changelog — Mzizi",
  description:
    "Release notes for the Mzizi component registry — each entry tagged with the ecosystem nodes (N1–N10) it touched.",
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return ""
  try {
    return new Date(iso).toISOString().slice(0, 10)
  } catch {
    return ""
  }
}

export default async function ChangelogPage() {
  if (!isSupabaseConfigured()) {
    return (
      <article className="mx-auto w-full max-w-3xl space-y-6 py-8">
        <header className="space-y-3">
          <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Changelog
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Release notes for the Mzizi component registry.
          </p>
        </header>
        <p className="rounded-xl border border-border bg-muted/30 p-6 text-sm text-muted-foreground">
          Supabase is not configured. The changelog is served live from the{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">changelog</code> table
          via the{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">list_changelog()</code>{" "}
          RPC.
        </p>
      </article>
    )
  }

  const entries = await listChangelog(100, 0).catch(() => [])

  return (
    <article className="mx-auto w-full max-w-3xl space-y-8 py-8">
      <header className="space-y-3">
        <p className="font-mono text-[11px] tracking-widest text-muted-foreground uppercase">
          Releases
        </p>
        <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Changelog
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          Every Mzizi release, newest first. Each entry is tagged with the ecosystem nodes (N1–N10)
          it touched — colour-coded by axis (cobalt = horizontal, tanzanite = vertical, malachite =
          depth, gold = outlier).
        </p>
      </header>

      {entries.length === 0 ? (
        <p className="rounded-xl border border-border bg-muted/30 p-6 text-sm text-muted-foreground">
          No changelog entries available yet.
        </p>
      ) : (
        <ol
          className="flex flex-col gap-8"
          role="feed"
          aria-label="Changelog"
          data-slot="changelog-timeline"
        >
          {entries.map((entry) => (
            <li
              key={entry.version}
              className="relative space-y-3 border-l-2 border-border pb-4 pl-6 last:pb-0"
            >
              {/* Timeline dot */}
              <div className="absolute top-1 -left-[5px] size-2 rounded-full bg-primary" />

              <div className="flex flex-wrap items-baseline gap-3">
                <span className="font-mono text-sm font-bold text-primary">v{entry.version}</span>
                <time className="font-mono text-xs text-muted-foreground">
                  {formatDate(entry.created_at)}
                </time>
                {entry.changed_by ? (
                  <span className="font-mono text-[10px] text-muted-foreground">
                    by {entry.changed_by}
                  </span>
                ) : null}
              </div>

              {entry.title ? (
                <h2 className="text-lg font-semibold text-foreground">{entry.title}</h2>
              ) : null}
              {entry.description ? (
                <p className="text-sm leading-relaxed text-muted-foreground">{entry.description}</p>
              ) : null}

              {entry.nodes_affected && entry.nodes_affected.length > 0 ? (
                <NodeBadgeList nodes={entry.nodes_affected} label="Nodes affected" />
              ) : null}

              {/* Component deltas */}
              {entry.components_added && entry.components_added.length > 0 ? (
                <div className="flex flex-wrap gap-1" aria-label="Components added">
                  {entry.components_added.map((c) => (
                    <span
                      key={`added-${c}`}
                      className="inline-flex h-5 items-center rounded-full bg-[var(--color-malachite)]/10 px-2 py-0.5 font-mono text-[11px] text-[var(--color-malachite)]"
                    >
                      +{c}
                    </span>
                  ))}
                </div>
              ) : null}

              {entry.components_modified && entry.components_modified.length > 0 ? (
                <div className="flex flex-wrap gap-1" aria-label="Components modified">
                  {entry.components_modified.map((c) => (
                    <span
                      key={`mod-${c}`}
                      className="inline-flex h-5 items-center rounded-full bg-[var(--color-cobalt)]/10 px-2 py-0.5 font-mono text-[11px] text-[var(--color-cobalt)]"
                    >
                      ~{c}
                    </span>
                  ))}
                </div>
              ) : null}

              {entry.components_deprecated && entry.components_deprecated.length > 0 ? (
                <div className="flex flex-wrap gap-1" aria-label="Components deprecated">
                  {entry.components_deprecated.map((c) => (
                    <span
                      key={`dep-${c}`}
                      className="inline-flex h-5 items-center rounded-full bg-[var(--color-terracotta)]/10 px-2 py-0.5 font-mono text-[11px] text-[var(--color-terracotta)] line-through"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              ) : null}

              {entry.components_removed && entry.components_removed.length > 0 ? (
                <div className="flex flex-wrap gap-1" aria-label="Components removed">
                  {entry.components_removed.map((c) => (
                    <span
                      key={`rem-${c}`}
                      className="inline-flex h-5 items-center rounded-full bg-destructive/10 px-2 py-0.5 font-mono text-[11px] text-destructive line-through"
                    >
                      −{c}
                    </span>
                  ))}
                </div>
              ) : null}
            </li>
          ))}
        </ol>
      )}
    </article>
  )
}
