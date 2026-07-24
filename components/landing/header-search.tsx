import Link from "next/link"
import { Search } from "@/lib/icons"
import { cn } from "@/lib/utils"

/**
 * Responsive header search affordance.
 *
 *   < md  (mobile)          → a single circular icon button.
 *   ≥ md  (tablet/desktop)  → a search-bar-shaped control.
 *
 * The two variants are swapped with pure CSS breakpoints (no `useIsMobile`),
 * so there is no hydration/first-paint flash. Both navigate to the component
 * browser — the portal has no query-param search page or command palette yet,
 * so this is deliberately a labelled link, not a text input that would discard
 * whatever the user typed.
 */
export function HeaderSearch({ className }: { className?: string }) {
  return (
    <>
      {/* Mobile: icon only */}
      <Link
        href="/components"
        aria-label="Search components"
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
        aria-label="Search components"
        className={cn(
          "hidden h-9 w-56 items-center gap-2 rounded-full border border-border bg-muted/40 px-3.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:inline-flex",
          className
        )}
      >
        <Search className="size-4 shrink-0" />
        <span className="truncate">Search components</span>
      </Link>
    </>
  )
}
