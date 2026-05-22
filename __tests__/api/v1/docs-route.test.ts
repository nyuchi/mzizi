import { describe, it, expect, vi } from "vitest"

// Mock next/server before importing the route
vi.mock("next/server", () => ({
  NextResponse: {
    json: (data: unknown, init?: { headers?: Record<string, string>; status?: number }) => ({
      data,
      headers: init?.headers ?? {},
      status: init?.status ?? 200,
    }),
  },
}))

vi.mock("@/lib/metrics", () => ({
  trackApiCall: vi.fn(),
}))

const EXPECTED_MIGRATED_SLUGS = [
  "3d-architecture",
  "fundi-guide",
  "layer-decision-guide",
  "component-backlinks",
  "brand-guidelines",
  "semantic-tokens",
  "introduction",
  "installation",
  "api-reference",
  "contributing",
] as const

type ListResponse = {
  data: { error: string; message: string; migrated_to: Record<string, string> }
  headers: Record<string, string>
  status: number
}

type SlugResponse = {
  data: { error: string; message: string; slug: string }
  headers: Record<string, string>
  status: number
}

describe("GET /api/v1/docs (soft-410)", () => {
  it("returns HTTP 410 Gone", async () => {
    const { GET } = await import("@/app/api/v1/docs/route")
    const response = (await GET()) as unknown as ListResponse

    expect(response.status).toBe(410)
    expect(response.data.error).toBe("Gone")
  })

  it("body message references the docs-site migration and the historical Supabase table", async () => {
    const { GET } = await import("@/app/api/v1/docs/route")
    const response = (await GET()) as unknown as ListResponse

    expect(response.data.message).toContain("mzizi.dev/docs")
    expect(response.data.message).toContain("documentation_pages")
  })

  it("migrated_to has every former slug → live URL", async () => {
    const { GET } = await import("@/app/api/v1/docs/route")
    const response = (await GET()) as unknown as ListResponse

    for (const slug of EXPECTED_MIGRATED_SLUGS) {
      expect(response.data.migrated_to).toHaveProperty(slug)
      const url = response.data.migrated_to[slug]
      expect(url).toMatch(/^https:\/\/mzizi\.dev\/docs(\/|$)/)
    }
  })

  it("sets CORS + cacheable headers", async () => {
    const { GET } = await import("@/app/api/v1/docs/route")
    const response = (await GET()) as unknown as ListResponse

    expect(response.headers["Access-Control-Allow-Origin"]).toBe("*")
    expect(response.headers["Cache-Control"]).toBe("public, max-age=3600, s-maxage=86400")
  })

  it("calls trackApiCall once with statusCode 410", async () => {
    const { trackApiCall } = await import("@/lib/metrics")
    const mocked = vi.mocked(trackApiCall)
    mocked.mockClear()

    const { GET } = await import("@/app/api/v1/docs/route")
    await GET()

    expect(mocked).toHaveBeenCalledTimes(1)
    expect(mocked).toHaveBeenCalledWith(
      expect.objectContaining({ endpoint: "/api/v1/docs", statusCode: 410 })
    )
  })
})

describe("GET /api/v1/docs/[slug] (soft-410)", () => {
  it("returns HTTP 410 Gone for a known migrated slug", async () => {
    const { GET } = await import("@/app/api/v1/docs/[slug]/route")
    const response = (await GET(
      new Request("https://design.nyuchi.com/api/v1/docs/3d-architecture"),
      {
        params: Promise.resolve({ slug: "3d-architecture" }),
      }
    )) as unknown as SlugResponse

    expect(response.status).toBe(410)
    expect(response.data.error).toBe("Gone")
  })

  it("echoes the input slug in the response body", async () => {
    const { GET } = await import("@/app/api/v1/docs/[slug]/route")
    const slugs = ["3d-architecture", "unknown-slug", "with-dashes-and-words"]

    for (const slug of slugs) {
      const response = (await GET(new Request(`https://design.nyuchi.com/api/v1/docs/${slug}`), {
        params: Promise.resolve({ slug }),
      })) as unknown as SlugResponse

      expect(response.data.slug).toBe(slug)
    }
  })

  it("body message points at the per-slug migration map", async () => {
    const { GET } = await import("@/app/api/v1/docs/[slug]/route")
    const response = (await GET(new Request("https://design.nyuchi.com/api/v1/docs/foo"), {
      params: Promise.resolve({ slug: "foo" }),
    })) as unknown as SlugResponse

    expect(response.data.message).toContain("/api/v1/docs")
  })

  it("sets CORS + cacheable headers", async () => {
    const { GET } = await import("@/app/api/v1/docs/[slug]/route")
    const response = (await GET(new Request("https://design.nyuchi.com/api/v1/docs/foo"), {
      params: Promise.resolve({ slug: "foo" }),
    })) as unknown as SlugResponse

    expect(response.headers["Access-Control-Allow-Origin"]).toBe("*")
    expect(response.headers["Cache-Control"]).toBe("public, max-age=3600, s-maxage=86400")
  })

  it("calls trackApiCall once with the per-slug endpoint and statusCode 410", async () => {
    const { trackApiCall } = await import("@/lib/metrics")
    const mocked = vi.mocked(trackApiCall)
    mocked.mockClear()

    const { GET } = await import("@/app/api/v1/docs/[slug]/route")
    await GET(new Request("https://design.nyuchi.com/api/v1/docs/3d-architecture"), {
      params: Promise.resolve({ slug: "3d-architecture" }),
    })

    expect(mocked).toHaveBeenCalledTimes(1)
    expect(mocked).toHaveBeenCalledWith(
      expect.objectContaining({ endpoint: "/api/v1/docs/3d-architecture", statusCode: 410 })
    )
  })

  it("handles URL-encoded slugs without throwing", async () => {
    const { GET } = await import("@/app/api/v1/docs/[slug]/route")
    const slug = "with%20spaces"
    const response = (await GET(new Request(`https://design.nyuchi.com/api/v1/docs/${slug}`), {
      params: Promise.resolve({ slug }),
    })) as unknown as SlugResponse

    expect(response.status).toBe(410)
    expect(response.data.slug).toBe(slug)
  })
})
