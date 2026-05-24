import * as React from "react"

import { cn } from "@/lib/utils"

// NODE BADGE
//
// Renders a single ecosystem node (N1–N10) as a pill, axis-coloured per
// the `nyuchi-changelog-renderer` (registry) v2.0.0 convention.
//
//   horizontal (N2, N3, N6, N7)            → Cobalt
//   vertical   (N1, N4, N5)                → Tanzanite
//   depth      (N8)                        → Malachite
//   outlier    (N9, N10)                   → Gold
//
// The labels / axis mapping mirror CLAUDE.md §6.2.

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
}

type NodeAxis = "horizontal" | "vertical" | "depth" | "outlier"

const NODE_AXIS: Record<number, NodeAxis> = {
  1: "vertical",
  2: "horizontal",
  3: "horizontal",
  4: "vertical",
  5: "vertical",
  6: "horizontal",
  7: "horizontal",
  8: "depth",
  9: "outlier",
  10: "outlier",
}

const AXIS_COLOURS: Record<NodeAxis, string> = {
  horizontal: "bg-[var(--color-cobalt)]/10 text-[var(--color-cobalt)]",
  vertical: "bg-[var(--color-tanzanite)]/10 text-[var(--color-tanzanite)]",
  depth: "bg-[var(--color-malachite)]/10 text-[var(--color-malachite)]",
  outlier: "bg-[var(--color-gold)]/10 text-[var(--color-gold)]",
}

export interface NodeBadgeProps extends React.ComponentProps<"span"> {
  node: number
}

export function NodeBadge({ node, className, ...props }: NodeBadgeProps) {
  const axis = NODE_AXIS[node] ?? "horizontal"
  const label = NODE_LABELS[node] ?? "Unknown"
  return (
    <span
      data-slot="node-badge"
      data-node={node}
      data-axis={axis}
      title={`N${node} — ${label} (${axis} axis)`}
      className={cn(
        "inline-flex h-5 items-center rounded-full px-2 py-0.5 text-xs font-medium",
        AXIS_COLOURS[axis],
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
