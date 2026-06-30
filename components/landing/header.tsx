// `"use client"` is required here, not redundant: PILL_ACTIONS passes
// component references (Search, Wrench, User from @/lib/icons) as the
// `icon` prop. Function references don't cross the RSC serialization
// boundary, so the boundary has to land at this file, before NyuchiHeader.
"use client"

import { Search } from "@/lib/icons"
import { NyuchiHeader, type NavItem, type PillAction } from "@/components/mukoko/mukoko-header"
import { HEADER_NAV } from "@/lib/nav"

/**
 * Portal-specific composition of the registry's `NyuchiHeader` (L7 shell).
 *
 * No design or behaviour lives here — this file only adapts the single
 * source-of-truth `HEADER_NAV` (lib/nav.ts) to the header's `navItems`
 * shape and configures the `pillActions` group, so the header and sidebar
 * never drift.
 *
 * Anything that would require a different header shape (logo, sticky,
 * scroll title, back button, blur background, etc.) belongs in
 * `components/mukoko/mukoko-header.tsx` (the registry source of truth).
 */

const NAV_ITEMS: NavItem[] = HEADER_NAV.map(({ label, href, external }) => ({
  label,
  href,
  external,
}))

const PILL_ACTIONS: PillAction[] = [
  { icon: Search, label: "Search components", href: "/components" },
]

export function Header() {
  return <NyuchiHeader appName="design" navItems={NAV_ITEMS} pillActions={PILL_ACTIONS} scrolled />
}
