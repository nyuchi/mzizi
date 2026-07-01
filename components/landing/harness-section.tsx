import { Activity, Accessibility, Sparkles, Shield, HeartPulse, Languages } from "lucide-react"
import { Section, SectionHeader } from "@/components/landing/section"

/**
 * The Harness spotlight — Mzizi's differentiator. Component libraries ship
 * components; Mzizi ships the *spine* that wires every component to
 * infrastructure with zero config. This is part of the helix (the vertical
 * axis that connects layers 3–5 to observability, a11y, motion, resilience).
 */

const capabilities: Array<{
  icon: typeof Activity
  name: string
  mineral: string
  desc: string
}> = [
  {
    icon: Activity,
    name: "Observability",
    mineral: "cobalt",
    desc: "A scoped logger per component and render timing, reported to the health monitor.",
  },
  {
    icon: Accessibility,
    name: "Accessibility",
    mineral: "malachite",
    desc: "Auto-mounted aria-live region, announce(), and focus-ring tokens — for free.",
  },
  {
    icon: Sparkles,
    name: "Motion",
    mineral: "tanzanite",
    desc: "Entry animation from the motion tokens, automatically honouring reduced-motion.",
  },
  {
    icon: Shield,
    name: "Error boundary",
    mineral: "copper",
    desc: "A branded fallback with retry and structured error tracking around every section.",
  },
  {
    icon: HeartPulse,
    name: "Health",
    mineral: "gold",
    desc: "Reports healthy / degraded / error / loading to the global health monitor.",
  },
  {
    icon: Languages,
    name: "Locale",
    mineral: "sodalite",
    desc: "Text direction (RTL/LTR) and a string-token accessor via useLocale.",
  },
]

export function HarnessSection() {
  return (
    <Section bordered muted>
      <SectionHeader
        eyebrow="The helix"
        title="One harness wires every component"
        sub="Other libraries hand you components. Mzizi ships the spine that connects them to infrastructure — observability, accessibility, motion, resilience and health — with zero config. Wrap a section or call the hook; everything else is wired."
      />

      <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-start">
        {/* Usage — show, don't tell */}
        <div className="flex flex-col gap-3">
          <span className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
            Drop-in
          </span>
          <pre className="overflow-x-auto rounded-xl border border-border bg-background p-4 font-mono text-xs leading-relaxed">
            <code>{`// Declarative — wrap any section
<NyuchiHarness name="events-feed" skeleton={<FeedSkeleton />}>
  <EventsFeed />
</NyuchiHarness>

// Imperative — inside a component
const { log, motion, announce } = useNyuchiHarness("listing-card")`}</code>
          </pre>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Tokens (L1) and primitives (L2) stay pure. Brand (L3), safety (L4) and resilience (L5)
            components plug into the same harness — so behaviour is consistent across the whole
            system, not re-implemented per component.
          </p>
        </div>

        {/* Capabilities */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {capabilities.map((c) => {
            const Icon = c.icon
            return (
              <div
                key={c.name}
                className="flex flex-col gap-2 rounded-xl border border-border bg-background p-4 transition-colors hover:border-foreground/30"
              >
                <span
                  className="flex size-9 items-center justify-center rounded-lg"
                  style={{
                    backgroundColor: `color-mix(in oklab, var(--color-${c.mineral}) 14%, transparent)`,
                    color: `var(--color-${c.mineral})`,
                  }}
                >
                  <Icon className="size-4" />
                </span>
                <h3 className="text-sm font-semibold">{c.name}</h3>
                <p className="text-xs leading-relaxed text-muted-foreground">{c.desc}</p>
              </div>
            )
          })}
        </div>
      </div>
    </Section>
  )
}
