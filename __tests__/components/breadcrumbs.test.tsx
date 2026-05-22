import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"

// Mock next/navigation so usePathname returns whatever we set per-test.
let currentPath = "/"
vi.mock("next/navigation", () => ({
  usePathname: () => currentPath,
}))

// Mock next/link to a plain anchor (avoids App Router context requirements).
vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}))

import { Breadcrumbs } from "@/components/landing/breadcrumbs"

describe("<Breadcrumbs />", () => {
  beforeEach(() => {
    currentPath = "/"
  })

  it("returns null on the landing route ('/')", () => {
    currentPath = "/"
    const { container } = render(<Breadcrumbs />)
    expect(container).toBeEmptyDOMElement()
  })

  it("renders 'Home' + each segment for /components/button", () => {
    currentPath = "/components/button"
    render(<Breadcrumbs />)

    expect(screen.getByRole("link", { name: "Home" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Components" })).toBeInTheDocument()
    // Last segment is rendered as a non-link span (aria-current="page")
    expect(screen.queryByRole("link", { name: "Button" })).toBeNull()
    expect(screen.getByText("Button")).toHaveAttribute("aria-current", "page")
  })

  it("maps known slugs through BREADCRUMB_LABELS (e.g. components → 'Components')", () => {
    currentPath = "/components/button"
    render(<Breadcrumbs />)
    expect(screen.getByText("Components")).toBeInTheDocument()
  })

  it("title-cases unknown slugs", () => {
    currentPath = "/something-else/another-thing"
    render(<Breadcrumbs />)
    expect(screen.getByRole("link", { name: "Something Else" })).toBeInTheDocument()
    expect(screen.getByText("Another Thing")).toHaveAttribute("aria-current", "page")
  })

  it("each link/span carries min-h-[48px] (touch-target floor per CLAUDE.md §8.2)", () => {
    currentPath = "/components/button"
    render(<Breadcrumbs />)

    expect(screen.getByRole("link", { name: "Home" })).toHaveClass("min-h-[48px]")
    expect(screen.getByRole("link", { name: "Components" })).toHaveClass("min-h-[48px]")
    expect(screen.getByText("Button")).toHaveClass("min-h-[48px]")
  })

  it("nav has aria-label='Breadcrumb' for SR navigation", () => {
    currentPath = "/architecture"
    render(<Breadcrumbs />)
    expect(screen.getByRole("navigation", { name: "Breadcrumb" })).toBeInTheDocument()
  })

  it("does not use physical CSS like pl-* on links", () => {
    currentPath = "/components/button"
    render(<Breadcrumbs />)
    const home = screen.getByRole("link", { name: "Home" })
    // px-1 is two-sided horizontal — fine. Just ensure no physical pl/pr left/right.
    expect(home.className).not.toMatch(/\bpl-\d/)
    expect(home.className).not.toMatch(/\bpr-\d/)
  })
})
