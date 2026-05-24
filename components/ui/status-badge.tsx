import * as React from "react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

// STATUS BADGE
//
// Pill-shaped lifecycle indicator built on the shadcn `Badge` primitive.
// Three statuses, each tinted with a Five-African-Minerals colour:
//   - stable     → Malachite (cyan) — assurance, ready for production
//   - alpha      → Gold (yellow)    — preview / unstable surface
//   - deprecated → Terracotta (warm) — slated for removal
//
// CLAUDE.md §7.5 — buttons / badges are always pill-shaped (`rounded-full`).
// CLAUDE.md §7.4 — colours come from CSS custom properties, not hex.

export type StatusBadgeStatus = "stable" | "alpha" | "deprecated"

const STATUS_STYLES: Record<StatusBadgeStatus, string> = {
  stable: "bg-[var(--color-malachite)]/10 text-[var(--color-malachite)]",
  alpha: "bg-[var(--color-gold)]/10 text-[var(--color-gold)]",
  deprecated: "bg-[var(--color-terracotta)]/10 text-[var(--color-terracotta)] line-through",
}

const STATUS_LABELS: Record<StatusBadgeStatus, string> = {
  stable: "stable",
  alpha: "alpha",
  deprecated: "deprecated",
}

export interface StatusBadgeProps extends React.ComponentProps<"span"> {
  status: StatusBadgeStatus
}

export function StatusBadge({ status, className, children, ...props }: StatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      data-slot="status-badge"
      data-status={status}
      className={cn(
        "rounded-full border-transparent font-mono text-[10px] tracking-wide uppercase",
        STATUS_STYLES[status],
        className
      )}
      {...props}
    >
      {children ?? STATUS_LABELS[status]}
    </Badge>
  )
}
