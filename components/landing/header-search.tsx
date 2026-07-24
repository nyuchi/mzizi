"use client"

import Link from "next/link"
import { Search } from "@/lib/icons"
import { cn } from "@/lib/utils"
import { openCommandPalette } from "@/components/landing/command-palette"

/**
 * Responsive header search affordance — opens the global ⌘K command palette.
 *
 *   < md  (mobile)          → a single circular icon button.
 *   ≥ md  (tablet/desktop)  → a search-bar-shaped control with a ⌘K hint.
 *
 * The two variants are swapped with pure CSS breakpoints (no `useIsMobile`),
 * so there is no hydration/first-paint flash. Both open the command palette on
 * click; each keeps an `href` to the component browser so a no-JS / middle-click
 * still lands somewhere useful.
 */
function open(e: React.MouseEvent) {
  // Let modified clicks (new tab) and middle-click follow the href instead.
  if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
    return
  }
  e.preventDefault()
  openCommandPalette()
}

export function HeaderSearch({ className }: { className?: string }) {
  return (
    <>
      {/* Mobile: icon only */}
      <Link
        href="/components"
        onClick={open}
        aria-label="Search"
        aria-keyshortcuts="Meta+K Control+K"
        className={cn(
          "flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden",
          className
        )}
      >
        <Search className="size-4" />
      </Link>

      {/* Tablet + desktop: search bar */}
      <Link
        href="/components"
        onClick={open}
        aria-label="Search"
        aria-keyshortcuts="Meta+K Control+K"
        className={cn(
          "hidden h-9 w-56 items-center gap-2 rounded-full border border-border bg-muted/40 px-3.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:inline-flex",
          className
        )}
      >
        <Search className="size-4 shrink-0" />
        <span className="truncate">Search components…</span>
        <kbd className="ml-auto shrink-0 rounded border border-border bg-background px-1.5 font-mono text-[10px] text-muted-foreground">
          ⌘K
        </kbd>
      </Link>
    </>
  )
}
