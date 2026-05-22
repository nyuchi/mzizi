import { describe, it, expect, vi, beforeEach } from "vitest"

// Mock next/server
vi.mock("next/server", () => ({
  NextResponse: {
    json: (data: unknown, init?: { headers?: Record<string, string>; status?: number }) => ({
      data,
      headers: init?.headers ?? {},
      status: init?.status ?? 200,
    }),
  },
}))

// Mock the DB layer — registry lives in Supabase.
const mockIsSupabaseConfigured = vi.fn()
const mockGetAllComponents = vi.fn()

vi.mock("@/lib/db", () => ({
  isSupabaseConfigured: () => mockIsSupabaseConfigured(),
  getAllComponents: () => mockGetAllComponents(),
}))

vi.mock("@/lib/observability", () => ({
  createLogger: () => ({ info: vi.fn(), warn: vi.fn(), error: vi.fn() }),
}))

import { GET } from "@/app/api/v1/ui/route"

describe("GET /api/v1/ui", () => {
  beforeEach(() => {
    mockIsSupabaseConfigured.mockReset()
    mockGetAllComponents.mockReset()
  })

  it("returns 503 when Supabase is not configured", async () => {
    mockIsSupabaseConfigured.mockReturnValue(false)

    const res = (await GET()) as unknown as { status: number; data: { error: string } }
    expect(res.status).toBe(503)
    expect(res.data.error).toBe("Database not configured")
  })

  it("returns registry payload with the correct schema and items", async () => {
    mockIsSupabaseConfigured.mockReturnValue(true)
    mockGetAllComponents.mockResolvedValue([
      {
        name: "button",
        registry_type: "registry:ui",
        description: "Displays a button or a component that looks like a button.",
        dependencies: ["class-variance-authority"],
        registry_dependencies: [],
      },
      {
        name: "card",
        registry_type: "registry:ui",
        description: "Surface container.",
        dependencies: [],
        registry_dependencies: [],
      },
    ])

    const res = (await GET()) as unknown as {
      status: number
      headers: Record<string, string>
      data: {
        $schema: string
        name: string
        homepage: string
        items: Array<{ name: string; type: string; description: string }>
      }
    }

    expect(res.status).toBe(200)
    expect(res.data.$schema).toBe("https://ui.shadcn.com/schema/registry.json")
    expect(res.data.name).toBe("mukoko")
    expect(res.data.homepage).toBe("https://mzizi.dev")
    expect(res.data.items).toHaveLength(2)
    expect(res.data.items[0]).toMatchObject({
      name: "button",
      type: "registry:ui",
    })
    expect(res.headers["Access-Control-Allow-Origin"]).toBe("*")
  })

  it("each item has required fields and a recognisable type", async () => {
    mockIsSupabaseConfigured.mockReturnValue(true)
    mockGetAllComponents.mockResolvedValue([
      {
        name: "button",
        registry_type: "registry:ui",
        description: "A button.",
        dependencies: [],
        registry_dependencies: [],
      },
      {
        name: "use-toast",
        registry_type: "registry:hook",
        description: "Toast state hook.",
        dependencies: [],
        registry_dependencies: [],
      },
      {
        name: "retry",
        registry_type: "registry:lib",
        description: "Retry utility.",
        dependencies: [],
        registry_dependencies: [],
      },
      {
        name: "dashboard-01",
        registry_type: "registry:block",
        description: "Dashboard block.",
        dependencies: [],
        registry_dependencies: [],
      },
    ])

    const res = (await GET()) as unknown as {
      data: { items: Array<{ name: string; type: string; description: string }> }
    }

    for (const item of res.data.items) {
      expect(item.name).toBeTruthy()
      expect(item.type).toMatch(/^registry:(ui|hook|lib|block)$/)
      expect(item.description).toBeTruthy()
    }
  })

  it("returns 500 when the DB query throws", async () => {
    mockIsSupabaseConfigured.mockReturnValue(true)
    mockGetAllComponents.mockRejectedValue(new Error("connection failed"))

    const res = (await GET()) as unknown as { status: number; data: { error: string } }
    expect(res.status).toBe(500)
    expect(res.data.error).toBe("Internal server error")
  })
})
