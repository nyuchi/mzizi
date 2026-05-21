// `"use client"` is required here, not redundant: PILL_ACTIONS passes
// component references (Search, Wrench, User from @/lib/icons) as the
// `icon` prop. Function references don't cross the RSC serialization
// boundary, so the boundary has to land at this file, before NyuchiHeader.
"use client"

import { Search } from "@/lib/icons"
import { NyuchiHeader, type NavItem, type PillAction } from "@/components/mukoko/mukoko-header"

/**
 * Portal-specific composition of the registry's `NyuchiHeader` (L7 shell).
 *
 * No design or behaviour lives here — this file only configures the
 * `navItems` (the portal's four top-level architecture surfaces) and
 * the `pillActions` group.
 *
 * Anything that would require a different header shape (logo, sticky,
 * scroll title, back button, blur background, etc.) belongs in
 * `components/mukoko/mukoko-header.tsx` (the registry source of truth).
 * Keep this file under 30 lines.
 */

const NAV_ITEMS: NavItem[] = [
  { label: "Components", href: "/components" },
  { label: "Brand", href: "/brand" },
  { label: "Architecture", href: "/architecture" },
  { label: "Docs", href: "/docs" },
]

const PILL_ACTIONS: PillAction[] = [
  { icon: Search, label: "Search components", href: "/components" },
]

export function Header() {
  return <NyuchiHeader appName="design" navItems={NAV_ITEMS} pillActions={PILL_ACTIONS} scrolled />
}
