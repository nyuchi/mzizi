"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { NyuchiLogo } from "@/components/layout/nyuchi-logo"
import { SIDEBAR_NAV } from "@/lib/nav"

/**
 * Portal-specific dashboard sidebar. Composes `components/ui/sidebar.tsx`
 * (the vendored shadcn primitives) with the curated nav from
 * `lib/nav.ts` — four groups:
 *
 *   Design system   — Components / Brand / Foundations / Patterns
 *   Architecture    — 3D architecture / Observability
 *   Playground      — one link
 *
 * Active-route detection: a nav item is active when `pathname === href`
 * OR `pathname.startsWith(href + "/")`. That means `/components/button`
 * highlights "Components" (parent route).
 *
 * On mobile the sidebar renders as a Sheet (via `<Sidebar>`'s internal
 * media-query switch) and the header's `SidebarTrigger` toggles it.
 */
export function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="flex h-14 items-start justify-center px-4">
        <Link
          href="/"
          className="flex shrink-0 items-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          aria-label="Nyuchi Design Portal home"
        >
          <NyuchiLogo size={24} showWordmark suffix="design" />
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {SIDEBAR_NAV.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarMenu>
              {group.items.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
                      <Link
                        href={item.href}
                        target={item.external ? "_blank" : undefined}
                        rel={item.external ? "noopener noreferrer" : undefined}
                      >
                        {Icon && <Icon className="size-4" />}
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="text-xs text-muted-foreground">
        <span className="px-2 font-mono">v4.0.39</span>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
