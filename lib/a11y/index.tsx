"use client"

// Infrastructure lib — accessibility primitives for brand components.
import * as React from "react"
import { cn } from "@/lib/utils"
import { paletteColor } from "@/lib/tokens"

/* ═══════════════════════════════════════════════════════════════
   MUKOKO ACCESSIBILITY INFRASTRUCTURE
   
   Accessibility is not a feature — it is infrastructure.
   Every brand component depends on these utilities.
   
   WCAG 2.2 AA minimum. Our target is AAA where possible.
   
   Exports:
   - FocusTrap: Contains focus within modals/overlays
   - LiveRegion: Announces dynamic content to screen readers
   - SkipNav: Keyboard shortcut to skip navigation
   - VisuallyHidden: Content visible only to screen readers
   - useAnnounce: Imperative screen reader announcements
   - a11yTokens: Focus ring, touch targets, contrast pairs
   ═══════════════════════════════════════════════════════════════ */

// ─── A11Y TOKENS ───────────────────────────────────────────
// Accessibility design decisions as tokens so they are
// consistent and auditable across all components.

export const a11yTokens = {
  /** Focus ring: 2px solid malachite with 2px offset */
  focusRing: {
    width: "2px",
    style: "solid",
    color: "var(--color-primary, #64FFDA)",
    offset: "2px",
    css: "outline: 2px solid var(--color-primary, #64FFDA); outline-offset: 2px;",
  },

  /** Minimum touch target size — Nyuchi exceeds WCAG 2.2 (44px) for the African mobile market */
  minTouchTarget: {
    width: "48px",
    height: "48px",
    css: "min-width: 48px; min-height: 48px;",
    default: "56px",
    defaultCss: "min-width: 56px; min-height: 56px;",
    note: "Default 56px, minimum 48px. Never below 48px.",
  },

  /** Contrast-safe mineral color pairings.
   *  Each mineral paired with its safe text color for both themes. */
  contrastPairs: {
    dark: {
      malachite: { bg: paletteColor("malachite"), text: "#0A0A0A", ratio: 15.9 },
      cobalt: { bg: paletteColor("cobalt"), text: "#0A0A0A", ratio: 8.2 },
      tanzanite: { bg: paletteColor("tanzanite"), text: "#0A0A0A", ratio: 7.4 },
      gold: { bg: paletteColor("gold"), text: "#0A0A0A", ratio: 14.2 },
      terracotta: { bg: paletteColor("terracotta"), text: "#0A0A0A", ratio: 8.9 },
    },
    light: {
      malachite: { bg: paletteColor("malachite", "light"), text: "#FFFFFF", ratio: 9.1 },
      cobalt: { bg: paletteColor("cobalt", "light"), text: "#FFFFFF", ratio: 7.3 },
      tanzanite: { bg: paletteColor("tanzanite", "light"), text: "#FFFFFF", ratio: 12.6 },
      gold: { bg: paletteColor("gold", "light"), text: "#FFFFFF", ratio: 7.5 },
      terracotta: { bg: paletteColor("terracotta", "light"), text: "#FFFFFF", ratio: 6.8 },
    },
  },

  /** Screen reader text for trust/verification tiers */
  trustAnnouncements: {
    unverified: "Unverified account",
    community: "Community verified — trust level one of four",
    otp: "Contact verified — trust level two of four",
    government: "Government verified — trust level three of four",
    licensed: "Licensed professional — trust level four of four, highest tier",
    suspended: "Account suspended",
    ancestral: "Memorial account",
  },
} as const

// ─── FOCUS TRAP ────────────────────────────────────────────
// Contains tab focus within a boundary (modals, drawers, overlays).
// Traps focus on mount, restores previous focus on unmount.

interface FocusTrapProps {
  children: React.ReactNode
  /** Whether the trap is active */
  active?: boolean
  /** Restore focus to previously focused element on unmount */
  restoreFocus?: boolean
  className?: string
}

export function FocusTrap({
  children,
  active = true,
  restoreFocus = true,
  className,
}: FocusTrapProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const previousFocusRef = React.useRef<HTMLElement | null>(null)

  React.useEffect(() => {
    if (!active) return
    previousFocusRef.current = document.activeElement as HTMLElement

    const container = containerRef.current
    if (!container) return

    // Focus first focusable element
    const focusable = container.querySelectorAll<HTMLElement>(
      'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])'
    )
    if (focusable.length > 0) focusable[0].focus()

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !container) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last?.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first?.focus()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      if (restoreFocus && previousFocusRef.current) previousFocusRef.current.focus()
    }
  }, [active, restoreFocus])

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  )
}

// ─── LIVE REGION ───────────────────────────────────────────
// Screen reader announcement zone for dynamic content.
// Renders a visually hidden aria-live region that announces
// changes to assistive technology.

interface LiveRegionProps {
  /** The message to announce */
  message: string
  /** Politeness level: polite waits, assertive interrupts */
  politeness?: "polite" | "assertive"
  className?: string
}

export function LiveRegion({ message, politeness = "polite", className }: LiveRegionProps) {
  return (
    <div
      role="status"
      aria-live={politeness}
      aria-atomic="true"
      className={cn(
        "absolute -m-px size-px overflow-hidden border-0 p-0 whitespace-nowrap",
        "[clip:rect(0,0,0,0)]",
        className
      )}
    >
      {message}
    </div>
  )
}

// ─── useAnnounce HOOK ──────────────────────────────────────
// Imperatively announce a message to screen readers.
// Use for: trust score changes, notification arrivals,
// loading completions, RSVP confirmations, etc.

export function useAnnounce() {
  const [message, setMessage] = React.useState("")
  const [politeness, setPoliteness] = React.useState<"polite" | "assertive">("polite")

  const announce = React.useCallback((msg: string, level: "polite" | "assertive" = "polite") => {
    // Clear then set to force re-announcement of same message
    setMessage("")
    setPoliteness(level)
    requestAnimationFrame(() => setMessage(msg))
  }, [])

  const Region = React.useMemo(
    () => <LiveRegion message={message} politeness={politeness} />,
    [message, politeness]
  )

  return { announce, Region }
}

// ─── SKIP NAV ──────────────────────────────────────────────
// Keyboard shortcut link that skips past navigation to main content.
// Visually hidden until focused.

interface SkipNavProps {
  /** ID of the main content container to skip to */
  contentId?: string
  /** Skip link text */
  label?: string
}

export function SkipNav({ contentId = "main-content", label = "Skip to content" }: SkipNavProps) {
  return (
    <a
      href={`#${contentId}`}
      className={cn(
        "fixed top-4 left-4 z-[100] -translate-y-full rounded-full px-4 py-2",
        "bg-[var(--color-primary)] text-sm font-semibold text-[var(--color-background)]",
        "transition-transform focus:translate-y-0",
        "outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2"
      )}
    >
      {label}
    </a>
  )
}

// ─── VISUALLY HIDDEN ───────────────────────────────────────
// Content visible only to screen readers, not sighted users.
// Use for: additional context, relationship descriptions,
// trust tier explanations, action confirmations.

export function VisuallyHidden({ children, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      {...props}
      className={cn(
        "absolute -m-px size-px overflow-hidden border-0 p-0 whitespace-nowrap",
        "[clip:rect(0,0,0,0)]",
        props.className
      )}
    >
      {children}
    </span>
  )
}

export type { FocusTrapProps, LiveRegionProps, SkipNavProps }
