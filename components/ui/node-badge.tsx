import * as React from "react"

import { cn } from "@/lib/utils"

// NODE BADGE
//
// Renders an ecosystem node/rung (N1–N11) as a pill, coloured by its
// classification on the Mzizi DNA double helix (CLAUDE.md §6.2):
//
//   core-guarantee (N2, N4, N5, N8)  → Cobalt      (nodes on the engineering strand)
//   shipped        (N3, N6, N7)      → Tanzanite   (nodes on the engineering strand)
//   swappable      (N1)              → Malachite   (node on the engineering strand)
//   rung           (N9, N10, N11)    → Gold        (cross-cutting base pairs)
//
// There are no axes and no outliers. N-numbers are labels, not a sequence.

const NODE_LABELS: Record<number, string> = {
  1: "Tokens",
  2: "Primitives",
  3: "Brand",
  4: "Safety",
  5: "Resilience",
  6: "Pages",
  7: "Shell",
  8: "Assurance",
  9: "Fundi",
  10: "Documentation",
  11: "Discovery",
}

type HelixClass = "core-guarantee" | "shipped" | "swappable" | "rung"

const NODE_CLASS: Record<number, HelixClass> = {
  1: "swappable",
  2: "core-guarantee",
  3: "shipped",
  4: "core-guarantee",
  5: "core-guarantee",
  6: "shipped",
  7: "shipped",
  8: "core-guarantee",
  9: "rung",
  10: "rung",
  11: "rung",
}

const CLASS_COLOURS: Record<HelixClass, string> = {
  "core-guarantee": "bg-[var(--color-cobalt)]/10 text-[var(--color-cobalt)]",
  shipped: "bg-[var(--color-tanzanite)]/10 text-[var(--color-tanzanite)]",
  swappable: "bg-[var(--color-malachite)]/10 text-[var(--color-malachite)]",
  rung: "bg-[var(--color-gold)]/10 text-[var(--color-gold)]",
}

export interface NodeBadgeProps extends React.ComponentProps<"span"> {
  node: number
}

export function NodeBadge({ node, className, ...props }: NodeBadgeProps) {
  const cls = NODE_CLASS[node] ?? "core-guarantee"
  const label = NODE_LABELS[node] ?? "Unknown"
  const kind = cls === "rung" ? "rung" : `${cls} strand`
  return (
    <span
      data-slot="node-badge"
      data-node={node}
      data-helix-class={cls}
      title={`N${node} — ${label} (${kind})`}
      className={cn(
        "inline-flex h-5 items-center rounded-full px-2 py-0.5 text-xs font-medium",
        CLASS_COLOURS[cls],
        className
      )}
      {...props}
    >
      N{node}
    </span>
  )
}

export interface NodeBadgeListProps extends React.ComponentProps<"div"> {
  nodes: number[]
  label?: string
}

export function NodeBadgeList({
  nodes,
  label = "Nodes affected",
  className,
  ...props
}: NodeBadgeListProps) {
  if (!nodes || nodes.length === 0) return null
  return (
    <div
      data-slot="node-badge-list"
      aria-label={label}
      className={cn("flex flex-wrap gap-1", className)}
      {...props}
    >
      {nodes.map((n) => (
        <NodeBadge key={n} node={n} />
      ))}
    </div>
  )
}
