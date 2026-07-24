"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ArrowUpRight, Box, Clock, CornerDownLeft, Loader2 } from "@/lib/icons"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { SIDEBAR_NAV } from "@/lib/nav"

/**
 * Global ⌘K command palette. Opens on ⌘K / Ctrl+K or when any UI dispatches
 * the {@link COMMAND_OPEN_EVENT} (see the header search). It offers:
 *
 *   - "Go to" — the curated portal nav (SIDEBAR_NAV), client-filtered by query.
 *   - "Components" — live results from `/api/v1/search?q=` (debounced, abortable).
 *   - "Recent" — the last components opened, persisted in localStorage.
 *
 * The palette owns navigation itself (`router.push`), so it never ships a text
 * input that discards what the user typed — every keystroke either filters nav
 * or hits the registry search.
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
  category: string | null
}

const QUICK_LINKS = SIDEBAR_NAV.flatMap((group) => group.items)

export function CommandPalette() {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [results, setResults] = React.useState<ComponentResult[]>([])
  const [loading, setLoading] = React.useState(false)
  const [recents, setRecents] = React.useState<string[]>([])

  // ⌘K / Ctrl+K + external open event.
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }
    const onOpen = () => setOpen(true)
    document.addEventListener("keydown", onKey)
    window.addEventListener(COMMAND_OPEN_EVENT, onOpen)
    return () => {
      document.removeEventListener("keydown", onKey)
      window.removeEventListener(COMMAND_OPEN_EVENT, onOpen)
    }
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

  // Debounced, abortable registry search.
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

  const go = React.useCallback(
    (href: string, recentName?: string) => {
      setOpen(false)
      setQuery("")
      if (recentName) {
        setRecents((prev) => {
          const next = [recentName, ...prev.filter((n) => n !== recentName)].slice(0, MAX_RECENTS)
          try {
            localStorage.setItem(RECENTS_KEY, JSON.stringify(next))
          } catch {
            /* ignore quota errors */
          }
          return next
        })
      }
      router.push(href)
    },
    [router]
  )

  const q = query.trim().toLowerCase()
  const filteredLinks = q
    ? QUICK_LINKS.filter((l) => l.label.toLowerCase().includes(q))
    : QUICK_LINKS

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      commandProps={{ shouldFilter: false, loop: true }}
    >
      <CommandInput
        placeholder="Search components and pages…"
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        {loading && (
          <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Searching…
          </div>
        )}

        {!loading && <CommandEmpty>No results found.</CommandEmpty>}

        {!q && recents.length > 0 && (
          <>
            <CommandGroup heading="Recent">
              {recents.map((name) => (
                <CommandItem
                  key={name}
                  value={`recent:${name}`}
                  onSelect={() => go(`/components/${name}`, name)}
                >
                  <Clock />
                  <span className="truncate">{name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        {filteredLinks.length > 0 && (
          <CommandGroup heading="Go to">
            {filteredLinks.map((link) => {
              const Icon = link.icon
              return (
                <CommandItem
                  key={link.href}
                  value={`link:${link.label}`}
                  onSelect={() => go(link.href, undefined)}
                >
                  {Icon ? <Icon /> : <Box />}
                  <span className="truncate">{link.label}</span>
                  {link.external && <ArrowUpRight className="ml-auto" />}
                </CommandItem>
              )
            })}
          </CommandGroup>
        )}

        {q && results.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Components">
              {results.map((c) => (
                <CommandItem
                  key={c.name}
                  value={`component:${c.name}`}
                  onSelect={() => go(`/components/${c.name}`, c.name)}
                >
                  <Box />
                  <span className="min-w-0 flex-1 truncate">
                    {c.name}
                    {c.description ? (
                      <span className="ml-2 text-muted-foreground">{c.description}</span>
                    ) : null}
                  </span>
                  {c.layer && (
                    <span className="ml-2 shrink-0 font-mono text-[10px] text-muted-foreground">
                      N{c.layer}
                    </span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>

      {/* Keyboard hint bar */}
      <div className="flex items-center gap-4 border-t border-border px-4 py-2 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <kbd className="rounded border border-border bg-muted px-1 font-mono">↑</kbd>
          <kbd className="rounded border border-border bg-muted px-1 font-mono">↓</kbd>
          navigate
        </span>
        <span className="flex items-center gap-1">
          <kbd className="rounded border border-border bg-muted px-1 font-mono">
            <CornerDownLeft className="size-3" />
          </kbd>
          select
        </span>
        <span className="ml-auto flex items-center gap-1">
          <kbd className="rounded border border-border bg-muted px-1 font-mono">esc</kbd>
          close
        </span>
      </div>
    </CommandDialog>
  )
}
