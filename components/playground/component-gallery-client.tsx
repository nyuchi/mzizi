"use client"

import { useState } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { COMPONENT_DEMOS } from "./demos"

export interface GalleryItem {
  name: string
  type: string
  description: string
}

const TYPE_LABELS: Record<string, string> = {
  "registry:ui": "UI",
  "registry:hook": "Hook",
  "registry:lib": "Lib",
  "registry:block": "Block",
}

const TYPE_COLORS: Record<string, string> = {
  "registry:ui": "bg-[var(--color-cobalt)]/10 text-[var(--color-cobalt)]",
  "registry:hook": "bg-[var(--color-tanzanite)]/10 text-[var(--color-tanzanite)]",
  "registry:lib": "bg-[var(--color-malachite)]/10 text-[var(--color-malachite)]",
  "registry:block": "bg-[var(--color-terracotta)]/10 text-[var(--color-terracotta)]",
}

export function ComponentGalleryClient({
  items,
  basePath = "/components",
}: {
  items: GalleryItem[]
  basePath?: string
}) {
  const [filter, setFilter] = useState<string>("all")
  const [search, setSearch] = useState("")

  const availableTypes = Array.from(new Set(items.map((i) => i.type)))
  const types = ["all", ...availableTypes]

  const filtered = items.filter((item) => {
    if (filter !== "all" && item.type !== filter) return false
    if (search && !item.name.includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="space-y-6">
      {/* Filters — touch targets 48px min per CLAUDE.md §8.2 */}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <input
          type="text"
          placeholder="Search components..."
          aria-label="Search components by name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-12 w-full rounded-lg border border-border bg-background px-4 text-sm outline-none focus:ring-2 focus:ring-ring/50 sm:w-auto sm:min-w-[240px] sm:flex-1"
        />
        <div
          role="group"
          aria-label="Filter by registry type"
          className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0"
        >
          {types.map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              aria-pressed={filter === t}
              className={cn(
                "inline-flex h-12 shrink-0 items-center rounded-full px-4 text-sm font-medium transition-colors",
                filter === t
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              {t === "all" ? "All" : (TYPE_LABELS[t] ?? t)}
            </button>
          ))}
        </div>
        <span aria-live="polite" className="text-xs text-muted-foreground">
          {filtered.length} components
        </span>
      </div>

      {/* Grid */}
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {filtered.map((item) => {
          const hasDemo = item.name in COMPONENT_DEMOS
          return (
            <Link
              key={item.name}
              href={`${basePath}/${item.name}`}
              className="group flex flex-col rounded-xl border border-border p-4 transition-colors hover:border-foreground/20 hover:bg-muted/50"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm font-medium text-foreground">{item.name}</span>
                <div className="flex items-center gap-1.5">
                  {hasDemo && (
                    <span
                      className="size-1.5 rounded-full bg-[var(--color-malachite)]"
                      title="Has live preview"
                    />
                  )}
                  <span
                    className={cn(
                      "rounded-md px-1.5 py-0.5 text-[10px] font-medium",
                      TYPE_COLORS[item.type] ?? "bg-muted text-muted-foreground"
                    )}
                  >
                    {TYPE_LABELS[item.type] ?? item.type}
                  </span>
                </div>
              </div>
              <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground">
                {item.description}
              </p>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
