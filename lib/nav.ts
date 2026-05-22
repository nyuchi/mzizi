import { Activity, Box, BookOpen, Layers, type LucideIcon } from "lucide-react"

// Shared navigation structure for the Mzizi portal shell.
// Curated (not auto-generated) — the portal hosts the functional
// surfaces only; long-form guides live in the standalone Mintlify
// docs site at mzizi.dev/docs.
//
//   Explore       — the component gallery + the 3D architecture explorer
//   Observability — live registry / API / MCP usage metrics
//   Documentation — external link to the Mintlify docs site
//
// Header nav (top-right) and sidebar (left) share this file so the two
// navigations never drift.

export interface NavItem {
  label: string
  href: string
  icon?: LucideIcon
  external?: boolean
}

export interface NavGroup {
  label: string
  items: NavItem[]
  /**
   * Collapsible groups render as an expandable section in the sidebar.
   */
  collapsible?: boolean
}

export const SIDEBAR_NAV: NavGroup[] = [
  {
    label: "Explore",
    items: [
      { label: "Components", href: "/components", icon: Layers },
      { label: "3D architecture", href: "/architecture", icon: Box },
      { label: "Observability", href: "/observability", icon: Activity },
    ],
  },
  {
    label: "Documentation",
    items: [{ label: "Docs", href: "https://mzizi.dev/docs", icon: BookOpen, external: true }],
  },
]

// Header top-level nav (desktop-only). Mirrors the sidebar so the header
// and sidebar tell the same story.
export const HEADER_NAV: NavItem[] = [
  { label: "Components", href: "/components" },
  { label: "Architecture", href: "/architecture" },
  { label: "Observability", href: "/observability" },
  { label: "Docs", href: "https://mzizi.dev/docs", external: true },
]

// Pretty labels for breadcrumbs — maps URL segments to display strings.
// Missing keys fall back to Title Case of the segment (see `labelFor`
// in `components/landing/breadcrumbs.tsx`).
export const BREADCRUMB_LABELS: Record<string, string> = {
  components: "Components",
  architecture: "Architecture",
  observability: "Observability",
  changelog: "Changelog",
  source: "Source",
  layers: "Layers",
}
