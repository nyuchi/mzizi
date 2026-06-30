"use client"

// ── INFRASTRUCTURE HARNESS (auto-wired) ──
// Every brand component participates in observability, motion, a11y,
// and health monitoring via the harness. Zero manual config.
import { useNyuchiHarness } from "@/lib/harness"

import * as React from "react"
import { cn } from "@/lib/utils"
import { NyuchiLogo } from "@/components/layout/nyuchi-logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ExternalLink } from "@/lib/icons"

/* ═══════════════════════════════════════════════════════════════
   NYUCHI HEADER — Brand Shell Component
   
   Two modes:
   1. Desktop: Logo + nav links + actions area (traditional)
   2. Mobile / App: Logo + pill action group (brand identity)
   
   The pill action group is a capsule-shaped container (9999px
   radius) in the brand accent color with 2-3 circular icon
   buttons inside. This is the brand identity — recognizable
   across nhimbe, bushtrade, shamwari, and all ecosystem apps.
   ═══════════════════════════════════════════════════════════════ */

export interface NavItem {
  label: string
  href: string
  external?: boolean
}

export interface PillAction {
  /** Lucide icon component */
  icon: React.ComponentType<{ className?: string }>
  /** Accessible label */
  label: string
  /** Click handler or route */
  onClick?: () => void
  href?: string
}

interface NyuchiHeaderProps {
  /** App name displayed after the ecosystem logo */
  appName?: string
  /** Desktop navigation items */
  navItems?: NavItem[]
  /** Right-side action slot (desktop) */
  actions?: React.ReactNode
  /** Pill action buttons (mobile app identity pattern) */
  pillActions?: PillAction[]
  /** Whether header has scrolled (enables blur background) */
  scrolled?: boolean
  /** Custom page title shown when scrolled */
  scrollTitle?: string
  /** Show back button instead of sidebar trigger */
  showBack?: boolean
  onBack?: () => void
  className?: string
}

const DEFAULT_NAV_ITEMS: NavItem[] = [
  { label: "Components", href: "/components" },
  { label: "Brand", href: "/brand" },
  { label: "Architecture", href: "/architecture" },
  { label: "API", href: "/api-docs" },
]

export function NyuchiHeader({
  appName,
  navItems = DEFAULT_NAV_ITEMS,
  actions,
  pillActions,
  scrolled = false,
  scrollTitle,
  showBack = false,
  onBack,
  className,
}: NyuchiHeaderProps) {
  useNyuchiHarness("header") // harness pre-wires observability + motion + a11y

  return (
    <header
      data-slot="nyuchi-header"
      data-portal="https://mzizi.dev/components/nyuchi-header"
      className={cn(
        "sticky top-0 z-50 flex h-14 items-center gap-2 px-5 transition-all duration-300",
        scrolled ? "border-b border-border/50 bg-background/80 backdrop-blur-xl" : "bg-transparent",
        className
      )}
    >
      {/* Left: sidebar trigger / back button + logo */}
      <div className="flex min-w-0 flex-1 items-center gap-3">
        {showBack ? (
          <button onClick={onBack} className="flex items-center p-0" aria-label="Go back">
            <svg
              className="size-[22px] text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        ) : (
          <SidebarTrigger className="md:hidden" />
        )}

        {/* App icon — rounded-lg square with border (brand marker) */}
        <a href="/" className="flex items-center gap-3">
          <NyuchiLogo size={24} suffix={appName} />
        </a>

        {/* Scroll title override */}
        {scrolled && scrollTitle && (
          <span className="truncate text-lg font-bold text-foreground transition-opacity">
            {scrollTitle}
          </span>
        )}
      </div>

      {/* Desktop navigation */}
      <nav className="ml-6 hidden items-center gap-1 md:flex">
        {navItems.map((item) => (
          <a
            key={item.href}
            href={item.href}
            target={item.external ? "_blank" : undefined}
            rel={item.external ? "noopener noreferrer" : undefined}
            className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            {item.label}
            {item.external && <ExternalLink className="size-3 opacity-50" />}
          </a>
        ))}
      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      {/* ── ACTION GROUP — restrained ghost icon buttons (shadcn-style chrome) ── */}
      {pillActions && pillActions.length > 0 && (
        <div data-slot="pill-actions" className="flex items-center gap-1">
          {pillActions.map((action, i) => {
            const Icon = action.icon
            const shared = cn(
              "flex size-9 items-center justify-center rounded-full",
              "text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            )
            if (action.href) {
              return (
                <a key={i} href={action.href} aria-label={action.label} className={shared}>
                  <Icon className="size-4" />
                </a>
              )
            }
            return (
              <button key={i} onClick={action.onClick} aria-label={action.label} className={shared}>
                <Icon className="size-4" />
              </button>
            )
          })}
        </div>
      )}

      {/* Desktop actions area */}
      <div className="flex items-center gap-1">
        {actions}
        <ThemeToggle />
      </div>
    </header>
  )
}
