"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Box } from "@/lib/icons"
import { NyuchiCommandPalette, type CommandItem } from "@/components/ui/nyuchi-command-palette"
import { SIDEBAR_NAV } from "@/lib/nav"

/**
 * Portal wiring for the registry command palette (`nyuchi-command-palette`,
 * node 7 / shell). This file is portal composition only — it owns open state
 * and data; the visual + keyboard behaviour lives in the registry component.
 *
 * Opens on ⌘K / Ctrl+K (handled inside the registry component) or when the
 * header search dispatches {@link COMMAND_OPEN_EVENT}. Data:
 *   - "Go to" — the curated SIDEBAR_NAV, client-filtered by query.
 *   - "Components" — live `/api/v1/search?q=` results (debounced, abortable).
 *   - "Recent" — last opened components, persisted in localStorage.
 */

const COMMAND_OPEN_EVENT = "mzizi:command-open"
const RECENTS_KEY = "mzizi:command-recents"
const MAX_RECENTS = 6

/** Open the global command palette from anywhere in the client tree. */
export function openCommandPalette() {
  window.dispatchEvent(new Event(COMMAND_OPEN_EVENT))
}

interface ComponentResult {
  name: string
  description: string | null
  layer: string | null
}

const QUICK_LINKS = SIDEBAR_NAV.flatMap((group) => group.items)

export function CommandPalette() {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [results, setResults] = React.useState<ComponentResult[]>([])
  const [loading, setLoading] = React.useState(false)
  const [recents, setRecents] = React.useState<string[]>([])

  // Header search (and any other UI) can open the palette via this event.
  React.useEffect(() => {
    const onOpen = () => setOpen(true)
    window.addEventListener(COMMAND_OPEN_EVENT, onOpen)
    return () => window.removeEventListener(COMMAND_OPEN_EVENT, onOpen)
  }, [])

  // Hydrate recents once on mount.
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(RECENTS_KEY)
      if (raw) setRecents(JSON.parse(raw) as string[])
    } catch {
      /* ignore malformed storage */
    }
  }, [])

  // Debounced, abortable registry search whenever the query changes.
  React.useEffect(() => {
    const q = query.trim()
    if (!q) {
      setResults([])
      setLoading(false)
      return
    }
    setLoading(true)
    const controller = new AbortController()
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/v1/search?q=${encodeURIComponent(q)}`, {
          signal: controller.signal,
        })
        if (!res.ok) throw new Error(`search ${res.status}`)
        const json = (await res.json()) as { data?: ComponentResult[] }
        setResults((json.data ?? []).slice(0, 20))
      } catch {
        if (!controller.signal.aborted) setResults([])
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }, 150)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [query])

  const recordRecent = React.useCallback((name: string) => {
    setRecents((prev) => {
      const next = [name, ...prev.filter((n) => n !== name)].slice(0, MAX_RECENTS)
      try {
        localStorage.setItem(RECENTS_KEY, JSON.stringify(next))
      } catch {
        /* ignore quota errors */
      }
      return next
    })
  }, [])

  const q = query.trim().toLowerCase()

  // "Go to" — curated nav, filtered client-side by the query.
  const navItems: CommandItem[] = (
    q ? QUICK_LINKS.filter((l) => l.label.toLowerCase().includes(q)) : QUICK_LINKS
  ).map((link) => {
    const Icon = link.icon
    return {
      id: `link:${link.href}`,
      label: link.label,
      category: "Go to",
      icon: Icon ? <Icon className="size-4 text-muted-foreground" /> : undefined,
      onSelect: () => router.push(link.href),
    }
  })

  // "Components" — live registry search results (only when a query is present).
  const componentItems: CommandItem[] = q
    ? results.map((c) => ({
        id: `component:${c.name}`,
        label: c.name,
        description: c.description ?? undefined,
        category: "Components",
        icon: <Box className="size-4 text-muted-foreground" />,
        node: c.layer ? Number(c.layer) : undefined,
        onSelect: () => {
          recordRecent(c.name)
          router.push(`/components/${c.name}`)
        },
      }))
    : []

  // "Recent" — last opened components (shown only with an empty query).
  const recentItems: CommandItem[] = recents.map((name) => ({
    id: `recent:${name}`,
    label: name,
    onSelect: () => {
      recordRecent(name)
      router.push(`/components/${name}`)
    },
  }))

  return (
    <NyuchiCommandPalette
      open={open}
      onOpenChange={setOpen}
      items={[...navItems, ...componentItems]}
      recentItems={recentItems}
      onSearch={setQuery}
      loading={loading}
      placeholder="Search components and pages…"
    />
  )
}
