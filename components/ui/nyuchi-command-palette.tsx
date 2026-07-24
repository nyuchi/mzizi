"use client"
import * as React from "react"
import { cn } from "@/lib/utils"
import { useNyuchiHarness } from "@/lib/harness"

/* ═══════════════════════════════════════════════════════════════
   NYUCHI COMMAND PALETTE — Layer 7 App Shell
   Global search + actions. Cmd+K / Ctrl+K.

   Installed from the Mzizi registry (owner: nyuchi, node 7 / shell).
   Source of truth is the Supabase `components` row `nyuchi-command-palette`;
   do not hand-edit here — re-pull from the registry if it changes.
   ═══════════════════════════════════════════════════════════════ */

interface CommandItem {
  id: string
  label: string
  description?: string
  icon?: React.ReactNode
  category?: string
  shortcut?: string
  onSelect: () => void
}

interface NyuchiCommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  items?: CommandItem[]
  recentItems?: CommandItem[]
  placeholder?: string
  onSearch?: (query: string) => void
  loading?: boolean
  className?: string
}

export function NyuchiCommandPalette({
  open,
  onOpenChange,
  items = [],
  recentItems = [],
  placeholder = "Search or type a command...",
  onSearch,
  loading = false,
  className,
}: NyuchiCommandPaletteProps) {
  useNyuchiHarness("command-palette")
  const [query, setQuery] = React.useState("")
  const inputRef = React.useRef<HTMLInputElement>(null)

  // Keyboard shortcut
  React.useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        onOpenChange(!open)
      }
      if (e.key === "Escape" && open) onOpenChange(false)
    }
    document.addEventListener("keydown", handleKey)
    return () => document.removeEventListener("keydown", handleKey)
  }, [open, onOpenChange])

  React.useEffect(() => {
    if (open) {
      setQuery("")
      inputRef.current?.focus()
    }
  }, [open])
  React.useEffect(() => {
    onSearch?.(query)
  }, [query, onSearch])

  if (!open) return null

  const grouped = items.reduce<Record<string, CommandItem[]>>((acc, item) => {
    const cat = item.category || "Results"
    ;(acc[cat] ||= []).push(item)
    return acc
  }, {})

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/50"
        onClick={() => onOpenChange(false)}
        aria-hidden="true"
      />
      <div
        data-slot="nyuchi-command-palette"
        data-portal="https://mzizi.dev/components/nyuchi-command-palette"
        role="dialog"
        aria-label="Command palette"
        aria-modal="true"
        className={cn(
          "fixed inset-x-4 top-[15%] z-50 mx-auto max-w-lg overflow-hidden rounded-[var(--radius-xl,17px)] border border-border bg-card shadow-2xl",
          className
        )}
      >
        {/* Search input */}
        <div className="flex items-center border-b border-border px-4">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="shrink-0 text-muted-foreground"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.3-4.3" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="flex-1 bg-transparent px-3 py-4 text-sm outline-none placeholder:text-muted-foreground"
            aria-label="Search commands"
          />
          {loading && (
            <div className="size-4 animate-spin rounded-full border-2 border-muted border-t-primary" />
          )}
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto p-2" role="listbox">
          {query.length === 0 && recentItems.length > 0 && (
            <div>
              <p className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Recent</p>
              {recentItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    item.onSelect()
                    onOpenChange(false)
                  }}
                  role="option"
                  className="flex min-h-[44px] w-full items-center gap-3 rounded-[var(--radius-sm,7px)] px-3 py-2 text-left text-sm transition-colors hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          )}
          {Object.entries(grouped).map(([cat, catItems]) => (
            <div key={cat}>
              <p className="px-2 py-1.5 text-xs font-medium text-muted-foreground">{cat}</p>
              {catItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    item.onSelect()
                    onOpenChange(false)
                  }}
                  role="option"
                  className="flex min-h-[44px] w-full items-center justify-between gap-3 rounded-[var(--radius-sm,7px)] px-3 py-2 text-left text-sm transition-colors hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    {item.icon}
                    <div className="min-w-0">
                      <p className="truncate">{item.label}</p>
                      {item.description && (
                        <p className="truncate text-xs text-muted-foreground">{item.description}</p>
                      )}
                    </div>
                  </div>
                  {item.shortcut && (
                    <kbd className="shrink-0 rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                      {item.shortcut}
                    </kbd>
                  )}
                </button>
              ))}
            </div>
          ))}
          {query.length > 0 && items.length === 0 && !loading && (
            <p className="py-8 text-center text-sm text-muted-foreground">No results found</p>
          )}
        </div>
      </div>
    </>
  )
}

export type { CommandItem, NyuchiCommandPaletteProps }
