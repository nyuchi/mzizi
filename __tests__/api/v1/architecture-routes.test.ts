// @vitest-environment node
// Pure file-existence checks — must run in Node so `fs` / `path` resolve.
import { describe, it, expect } from "vitest"
import fs from "node:fs"
import path from "node:path"

describe("Architecture API v1 Routes", () => {
  describe("API route files exist", () => {
    const routeFiles = [
      "app/api/v1/route.ts",
      "app/api/v1/brand/route.ts",
      "app/api/v1/ui/route.ts",
      "app/api/v1/ui/[name]/route.ts",
      "app/api/v1/ecosystem/route.ts",
      "app/api/v1/data-layer/route.ts",
      "app/api/v1/pipeline/route.ts",
      "app/api/v1/sovereignty/route.ts",
      "app/api/v1/health/route.ts",
      "app/api/v1/architecture/frontend/axes/route.ts",
      "app/api/v1/architecture/frontend/layers/route.ts",
      "app/api/v1/architecture/route.ts",
      "app/api/v1/architecture/axes/route.ts",
      "app/api/v1/architecture/layers/[n]/route.ts",
      "app/source/[name]/page.tsx",
      "app/changelog/[name]/page.tsx",
      "app/api/health/[name]/route.ts",
      "app/api/chaos/[name]/route.ts",
      "app/architecture/page.tsx",
      "app/architecture/layers/[n]/page.tsx",
      "app/api/v1/ubuntu/pillars/route.ts",
      "app/api/v1/ubuntu/principles/route.ts",
    ]

    for (const file of routeFiles) {
      it(`${file} exists`, () => {
        const filePath = path.join(process.cwd(), file)
        expect(fs.existsSync(filePath)).toBe(true)
      })
    }
  })

  describe("Old API routes removed", () => {
    const oldRoutes = [
      "app/api/r/route.ts",
      "app/api/brand/route.ts",
      "app/api/health/route.ts",
      "app/api/fundi/[name]/route.ts",
      "app/api/v1/fundi/route.ts",
    ]

    for (const file of oldRoutes) {
      it(`${file} no longer exists`, () => {
        const filePath = path.join(process.cwd(), file)
        expect(fs.existsSync(filePath)).toBe(false)
      })
    }
  })

  describe("Architecture data module", () => {
    it("architecture data is served from Supabase (lib/architecture.ts retired)", () => {
      const filePath = path.join(process.cwd(), "lib/architecture.ts")
      // Post-v4.0.26: the legacy lib/architecture.ts is gone; architecture data
      // is now served from the Supabase `architecture_*` tables via lib/db.
      expect(fs.existsSync(filePath)).toBe(false)
    })
  })

  describe("OpenAPI spec", () => {
    it("openapi.yaml exists", () => {
      const filePath = path.join(process.cwd(), "openapi.yaml")
      expect(fs.existsSync(filePath)).toBe(true)
    })

    it("openapi.yaml is valid YAML with correct version", () => {
      const filePath = path.join(process.cwd(), "openapi.yaml")
      const content = fs.readFileSync(filePath, "utf-8")
      expect(content).toContain('openapi: "3.1.0"')
      expect(content).toContain("Nyuchi Architecture API")
    })
  })
})
