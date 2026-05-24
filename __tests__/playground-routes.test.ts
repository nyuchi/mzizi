// @vitest-environment node
// Pure file-existence checks — must run in Node so `fs` / `path` resolve.
//
// Smoke coverage for issue #60: the playground routes must exist on disk.
// Real DB-backed render assertions live in the live deploy smoke checks.
// The dynamic route's `notFound()` branch is implicit — the `[name]` page
// imports it from `next/navigation` (asserted below).
import { describe, it, expect } from "vitest"
import fs from "node:fs"
import path from "node:path"

const root = process.cwd()
const indexRoute = path.join(root, "app/playground/page.tsx")
const dynamicRoute = path.join(root, "app/playground/[name]/page.tsx")

describe("Playground routes (issue #60)", () => {
  it("`/playground` index page exists", () => {
    expect(fs.existsSync(indexRoute)).toBe(true)
  })

  it("`/playground/[name]` dynamic page exists", () => {
    expect(fs.existsSync(dynamicRoute)).toBe(true)
  })

  it("index page declares ISR with `export const revalidate = 300`", () => {
    const src = fs.readFileSync(indexRoute, "utf-8")
    expect(src).toMatch(/export\s+const\s+revalidate\s*=\s*300/)
  })

  it("dynamic page declares ISR with `export const revalidate = 300`", () => {
    const src = fs.readFileSync(dynamicRoute, "utf-8")
    expect(src).toMatch(/export\s+const\s+revalidate\s*=\s*300/)
  })

  it("dynamic page handles unknown slugs via `notFound()`", () => {
    const src = fs.readFileSync(dynamicRoute, "utf-8")
    expect(src).toMatch(/import\s+\{\s*notFound\s*\}\s+from\s+["']next\/navigation["']/)
    expect(src).toMatch(/notFound\(\)/)
  })

  it("dynamic page generates static params from the registry (known slugs)", () => {
    const src = fs.readFileSync(dynamicRoute, "utf-8")
    expect(src).toMatch(/generateStaticParams/)
    expect(src).toMatch(/getAllComponents/)
  })

  it("index page renders the live component gallery", () => {
    const src = fs.readFileSync(indexRoute, "utf-8")
    expect(src).toMatch(/ComponentGallery/)
  })

  it("dynamic page wires the live preview, doc section, and API tester", () => {
    const src = fs.readFileSync(dynamicRoute, "utf-8")
    expect(src).toMatch(/ComponentPreview/)
    expect(src).toMatch(/ComponentDocSection/)
    expect(src).toMatch(/ApiTester/)
  })
})

describe("Playground navigation (issue #60)", () => {
  it("`lib/nav.ts` exposes a Playground entry in SIDEBAR_NAV and HEADER_NAV", async () => {
    const { SIDEBAR_NAV, HEADER_NAV } = await import("@/lib/nav")
    const sidebarHrefs = SIDEBAR_NAV.flatMap((g) => g.items.map((i) => i.href))
    const headerHrefs = HEADER_NAV.map((i) => i.href)
    expect(sidebarHrefs).toContain("/playground")
    expect(headerHrefs).toContain("/playground")
  })
})
