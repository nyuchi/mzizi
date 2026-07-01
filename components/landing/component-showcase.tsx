"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { COMPONENT_DEMOS } from "@/components/playground/demos"
import { Section, SectionHeader } from "@/components/landing/section"

/**
 * Live component band — show, don't tell. A curated grid of *actual* rendered
 * components (the same demos the playground uses), so a first-time visitor sees
 * the quality on the landing rather than reading about it. Only self-contained,
 * non-modal demos are featured so nothing opens an overlay from the grid.
 */
const FEATURED = [
  "button",
  "badge",
  "tabs",
  "switch",
  "checkbox",
  "slider",
  "progress",
  "avatar",
  "select",
  "toggle",
  "rating",
  "stats-card",
] as const

export function ComponentShowcase() {
  return (
    <Section bordered>
      <SectionHeader
        eyebrow="The library"
        title="Components that look shipped, out of the box"
        sub="Real components, rendered live — theme-adaptive, accessible, and installed straight into your repo with the shadcn CLI. This is the same registry your AI assistant reads."
      />

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURED.filter((name) => COMPONENT_DEMOS[name]).map((name) => (
          <div
            key={name}
            className="group flex min-h-[184px] flex-col overflow-hidden rounded-xl border border-border bg-background transition-colors hover:border-foreground/30"
          >
            <div className="flex flex-1 items-center justify-center overflow-hidden p-6">
              {COMPONENT_DEMOS[name]}
            </div>
            <div className="flex items-center justify-between border-t border-border px-4 py-2.5">
              <span className="font-mono text-xs text-muted-foreground capitalize">
                {name.replace(/-/g, " ")}
              </span>
              <Link
                href={`/components/${name}`}
                className="text-xs text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-foreground focus-visible:opacity-100"
              >
                View →
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 flex justify-center">
        <Link
          href="/components"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground hover:underline"
        >
          Browse all components
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </Section>
  )
}
