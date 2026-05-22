import type { MetadataRoute } from "next"

const BASE = "https://mzizi.dev"
const NOW = new Date()

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    // ── Root ──────────────────────────────────────────────────────────
    {
      url: BASE,
      lastModified: NOW,
      changeFrequency: "weekly",
      priority: 1,
    },

    // ── Components ────────────────────────────────────────────────────
    {
      url: `${BASE}/components`,
      lastModified: NOW,
      changeFrequency: "weekly",
      priority: 0.9,
    },

    // ── Architecture ──────────────────────────────────────────────────
    {
      url: `${BASE}/architecture`,
      lastModified: NOW,
      changeFrequency: "monthly",
      priority: 0.8,
    },

    // ── Observability ─────────────────────────────────────────────────
    {
      url: `${BASE}/observability`,
      lastModified: NOW,
      changeFrequency: "weekly",
      priority: 0.6,
    },
  ]
}
