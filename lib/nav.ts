import {
  Activity,
  BookOpen,
  Box,
  HeartHandshake,
  Layers,
  Palette,
  ScrollText,
  Sparkles,
  Wrench,
  type LucideIcon,
} from "lucide-react"

// Shared navigation structure for the Mzizi portal shell.
// Curated (not auto-generated) — the portal hosts the functional
// surfaces only; long-form guides live in the standalone Mintlify
// docs site at docs.bundu.org/mzizi.
//
//   Explore       — the component gallery, tools, and the 3D architecture explorer
//   Playground    — interactive registry browser (live preview + API tester)
//   Doctrine      — Ubuntu Five Pillars + Five Principles (issue #45)
//   Releases      — the node-aware changelog (issue #85)
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
      { label: "Colour tokens", href: "/tokens", icon: Palette },
      { label: "Tools", href: "/tools", icon: Wrench },
      { label: "3D architecture", href: "/architecture", icon: Box },
      { label: "Observability", href: "/observability", icon: Activity },
    ],
  },
  {
    label: "Playground",
    items: [{ label: "Playground", href: "/playground", icon: Sparkles }],
  },
  {
    label: "Doctrine",
    items: [{ label: "Ubuntu", href: "/ubuntu", icon: HeartHandshake }],
  },
  {
    label: "Releases",
    items: [{ label: "Changelog", href: "/changelog", icon: ScrollText }],
  },
  {
    label: "Documentation",
    items: [
      { label: "Docs", href: "https://docs.bundu.org/mzizi", icon: BookOpen, external: true },
    ],
  },
]

// Header top-level nav (desktop-only). Mirrors the sidebar so the header
// and sidebar tell the same story.
export const HEADER_NAV: NavItem[] = [
  { label: "Components", href: "/components" },
  { label: "Tokens", href: "/tokens" },
  { label: "Tools", href: "/tools" },
  { label: "Architecture", href: "/architecture" },
  { label: "Playground", href: "/playground" },
  { label: "Ubuntu", href: "/ubuntu" },
  { label: "Changelog", href: "/changelog" },
  { label: "Observability", href: "/observability" },
  { label: "Docs", href: "https://docs.bundu.org/mzizi", external: true },
]

// Pretty labels for breadcrumbs — maps URL segments to display strings.
// Missing keys fall back to Title Case of the segment (see `labelFor`
// in `components/landing/breadcrumbs.tsx`).
export const BREADCRUMB_LABELS: Record<string, string> = {
  components: "Components",
  architecture: "Architecture",
  observability: "Observability",
  playground: "Playground",
  changelog: "Changelog",
  tools: "Tools",
  source: "Source",
  layers: "Layers",
  ubuntu: "Ubuntu",
}
