import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"

let currentPath = "/"
vi.mock("next/navigation", () => ({
  usePathname: () => currentPath,
}))

vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}))

// jsdom doesn't ship matchMedia — required by next-themes / shadcn primitives.
beforeEach(() => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
})

import { DashboardSidebar } from "@/components/landing/dashboard-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { SIDEBAR_NAV } from "@/lib/nav"

function renderInProvider(path: string) {
  currentPath = path
  return render(
    <TooltipProvider>
      <SidebarProvider>
        <DashboardSidebar />
      </SidebarProvider>
    </TooltipProvider>
  )
}

describe("<DashboardSidebar />", () => {
  it("renders every group label from SIDEBAR_NAV", () => {
    renderInProvider("/")
    for (const group of SIDEBAR_NAV) {
      // GroupLabel is a div, not a heading — match by text
      expect(screen.getAllByText(group.label).length).toBeGreaterThan(0)
    }
  })

  it("renders every item from SIDEBAR_NAV (at least one link per item)", () => {
    renderInProvider("/")
    for (const group of SIDEBAR_NAV) {
      for (const item of group.items) {
        // Each item appears at least once (sidebar may dedupe / collapse — check >= 1)
        expect(screen.getAllByText(item.label).length).toBeGreaterThanOrEqual(1)
      }
    }
  })

  it("home link points at '/' with the right aria-label", () => {
    renderInProvider("/")
    expect(screen.getByLabelText("Mzizi home")).toHaveAttribute("href", "/")
  })

  it("renders the version footer", () => {
    renderInProvider("/")
    expect(screen.getByText(/^v\d+\.\d+\.\d+$/)).toBeInTheDocument()
  })

  it("has a /playground link (restored in #60 — page is now wired)", () => {
    renderInProvider("/")
    const playground = screen.queryAllByText("Playground")
    expect(playground.length).toBeGreaterThan(0)
  })
})
