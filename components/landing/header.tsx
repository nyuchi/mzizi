"use client"

import { NyuchiHeader, type NavItem } from "@/components/mukoko/mukoko-header"
import { HeaderSearch } from "@/components/landing/header-search"
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

export function Header({ showLogo = true }: { showLogo?: boolean }) {
  return (
    <NyuchiHeader
      appName="mzizi"
      navItems={NAV_ITEMS}
      actions={<HeaderSearch />}
      showLogo={showLogo}
      scrolled
    />
  )
}
