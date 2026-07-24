"use client"

import type { ReactNode } from "react"
import { usePathname } from "next/navigation"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { DashboardSidebar } from "@/components/landing/dashboard-sidebar"
import { Header } from "@/components/landing/header"
import { CommandPalette } from "@/components/landing/command-palette"
import { Breadcrumbs } from "@/components/landing/breadcrumbs"
import { Toc } from "@/components/landing/toc"
import { Footer as CustomFooter } from "@/components/landing/footer"

/**
 * AppShell — chooses the page frame by route.
 *
 *   Marketing (`/`)        → a clean, full-bleed top-nav shell with no dashboard
 *                            sidebar and no breadcrumb/TOC rail, so the hero reads
 *                            as a product landing (shadcn/Vercel/Linear style).
 *   Everything else        → the docs/app shell: dashboard sidebar + sticky header
 *                            + breadcrumb + content + TOC rail.
 *
 * `SidebarProvider` wraps both branches so the header's `SidebarTrigger` always
 * has its context (it's simply a no-op on the marketing route). This keeps the
 * landing free of the "internal admin tool" framing the dashboard sidebar gives
 * every other page.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const isMarketing = pathname === "/"

  // Load collapsed to the icon rail. The sidebar is `collapsible="icon"`, so
  // this renders a stable icon-only strip on first paint — no expanded-then-hide
  // flash on reload, and no cookie/dynamic-rendering cost (reading a cookie in
  // the root layout would opt the whole site out of static prerendering).
  return (
    <SidebarProvider defaultOpen={false}>
      <CommandPalette />
      {!isMarketing && <DashboardSidebar />}

      <SidebarInset className="pl-1">
        <Header />

        {isMarketing ? (
          children
        ) : (
          <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-8 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_12rem] lg:py-8">
            <div className="min-w-0">
              <Breadcrumbs className="mb-4" />
              <article data-mdx className="prose-mdx">
                {children}
              </article>
            </div>
            <aside className="hidden self-start lg:sticky lg:top-20 lg:block">
              <Toc />
            </aside>
          </div>
        )}

        <CustomFooter />
      </SidebarInset>
    </SidebarProvider>
  )
}
