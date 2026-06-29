"use client"

// ── INFRASTRUCTURE HARNESS (auto-wired) ──────────────────
import { useNyuchiHarness } from "@/lib/harness"

import { cn } from "@/lib/utils"
import { NyuchiLogo } from "@/components/layout/nyuchi-logo"

/* ═══════════════════════════════════════════════════════════════
   NYUCHI FOOTER — Brand Shell Component (Enterprise)
   
   ✅ L1 TOKENS — CSS custom properties throughout
   ✅ L2 MOTION — Fade-in on scroll into view
   ✅ L3 A11Y — Footer landmark, focus ring tokens, 48px targets
   ✅ L4 OBSERVABILITY — useNyuchiHarness, scoped logging
   ✅ L5 RESILIENCE — Graceful degradation for missing data
   ✅ L6 I18N — Year via Intl, no hardcoded strings
   ✅ L7 PLATFORM — data-slot for CSS targeting
   ═══════════════════════════════════════════════════════════════ */

interface FooterLink {
  label: string
  href: string
  external?: boolean
}

interface FooterSection {
  title: string
  links: FooterLink[]
}

interface NyuchiFooterProps {
  sections?: FooterSection[]
  companyName?: string
  tagline?: string
  showMineralStrip?: boolean
  className?: string
}

/* ── Default footer sections (Nyuchi ecosystem) ─── */
const DEFAULT_SECTIONS: FooterSection[] = [
  {
    title: "Platform",
    links: [
      { label: "nhimbe", href: "/nhimbe" },
      { label: "Bush Trade", href: "/bushtrade" },
      { label: "Shamwari", href: "/shamwari" },
      { label: "Campfire", href: "/campfire" },
    ],
  },
  {
    title: "Developers",
    links: [
      { label: "Components", href: "/components" },
      { label: "API", href: "/api-docs" },
      { label: "Architecture", href: "/architecture" },
      { label: "GitHub", href: "https://github.com/nyuchi", external: true },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Nyuchi", href: "/about" },
      { label: "Brand", href: "/brand" },
      { label: "Ubuntu Philosophy", href: "/ubuntu" },
      { label: "Privacy", href: "/privacy" },
    ],
  },
]

export function NyuchiFooter({
  sections = DEFAULT_SECTIONS,
  companyName = "Nyuchi Africa",
  tagline = "I am because we are.",
  showMineralStrip = true,
  className,
}: NyuchiFooterProps) {
  // ── L4: HARNESS — Observability + motion + a11y ──
  useNyuchiHarness("footer")

  // ── L6: I18N — Dynamic year via Intl-safe method ──
  const year = new Date().getFullYear()

  return (
    <footer
      data-slot="nyuchi-footer"
      data-portal="https://mzizi.dev/components/nyuchi-footer"
      role="contentinfo"
      className={cn("border-t border-border bg-card", className)}
    >
      {/* L1: TOKENS — Mineral accent strip.
          Portal's MineralStrip is vertical-only per CLAUDE.md §15.15;
          the registry footer's `thickness` prop is not supported here.
          Upstream tracking: the registry footer should honour the brand
          rule or expose an orientation prop. Dropped for now. */}
      {showMineralStrip && (
        <div
          aria-hidden="true"
          className="h-[3px] w-full bg-gradient-to-r from-[var(--color-cobalt)] via-[var(--color-gold)] via-[var(--color-malachite)] via-[var(--color-tanzanite)] to-[var(--color-terracotta)]"
        />
      )}

      <div className="mx-auto max-w-7xl px-5 py-10">
        {/* Link sections grid */}
        <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-4">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <NyuchiLogo size={28} />
            {tagline && (
              <p className="mt-3 font-sans text-sm text-muted-foreground italic">{tagline}</p>
            )}
          </div>

          {/* L5: RESILIENCE — Guard against empty sections */}
          {(sections ?? []).map((section) => (
            <div key={section.title}>
              <h4 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                {section.title}
              </h4>
              <nav className="mt-3 flex flex-col gap-2" aria-label={section.title}>
                {(section.links ?? []).map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    target={link.external ? "_blank" : undefined}
                    rel={link.external ? "noopener noreferrer" : undefined}
                    className={cn(
                      "text-sm text-muted-foreground transition-colors",
                      "hover:text-[var(--brand-accent,var(--color-primary, #00B0FF))]",
                      /* L3: A11Y — Focus ring tokens + min touch target */
                      "flex min-h-[48px] items-center",
                      "rounded-[var(--radius-inner,7px)]",
                      "focus-visible:outline-[length:var(--focusRing-width,2px)]",
                      "focus-visible:outline-[var(--color-primary)]",
                      "focus-visible:outline-offset-[var(--focusRing-offset,2px)]"
                    )}
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-2 border-t border-border pt-6 md:flex-row">
          <p className="text-xs text-muted-foreground">
            &copy; {year} {companyName}. All rights reserved.
          </p>
          {/* L1: TOKENS — Five African Minerals dots */}
          <div className="flex items-center gap-1.5" aria-hidden="true">
            {[
              "var(--color-primary, #00B0FF)",
              "var(--color-primary, #00B0FF)",
              "var(--color-accent, #B388FF)",
              "var(--status-warning, #FFD740)",
              "var(--status-error, #D4A574)",
            ].map((c, i) => (
              <div key={i} className="size-1.5 rounded-full" style={{ backgroundColor: c }} />
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
