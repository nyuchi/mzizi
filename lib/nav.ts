import {
  Activity,
  BookOpen,
  Box,
  Compass,
  Download,
  GitPullRequest,
  Layers,
  Package,
  Paintbrush,
  Palette,
  Shield,
  Sparkles,
  Terminal,
  type LucideIcon,
} from "lucide-react"

// Shared navigation structure for the Mzizi portal shell.
// Curated (not auto-generated from `_meta.ts`) — groups matching
// the portal's information architecture:
//
//   Design system    — the component / brand / foundations / patterns quad
//   Architecture     — the 3D frontend doctrine, observability
//   Playground       — interactive exploration
//
// Header nav (top-right, 4 items) and sidebar (left, all groups) share
// this file so the two navigations never drift.

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
   * Guides (the `/docs/*` tree) defaults to collapsible so it doesn't
   * dominate the sidebar on non-docs routes.
   */
  collapsible?: boolean
}

export const SIDEBAR_NAV: NavGroup[] = [
  {
    label: "Design system",
    items: [
      { label: "Components", href: "/components", icon: Layers },
      { label: "Brand", href: "/brand", icon: Palette },
      { label: "Foundations", href: "/foundations", icon: BookOpen },
      { label: "Patterns", href: "/patterns", icon: Shield },
    ],
  },
  {
    label: "Architecture",
    items: [
      { label: "3D architecture", href: "/architecture", icon: Box },
      { label: "Observability", href: "/observability", icon: Activity },
    ],
  },
  {
    label: "Guides",
    collapsible: true,
    items: [
      { label: "Introduction", href: "/docs", icon: Compass },
      { label: "Installation", href: "/docs/installation", icon: Download },
      { label: "CLI", href: "/docs/cli", icon: Terminal },
      { label: "Skills", href: "/docs/skills", icon: Sparkles },
      { label: "Theming", href: "/docs/theming", icon: Paintbrush },
      { label: "Registry", href: "/registry", icon: Package },
      { label: "Contributing", href: "/docs/contributing", icon: GitPullRequest },
    ],
  },
]

// Header top-level nav (4 items, desktop-only). Mirrors the first item
// of each major sidebar group — ensures the header and sidebar tell the
// same story.
export const HEADER_NAV: NavItem[] = [
  { label: "Components", href: "/components" },
  { label: "Brand", href: "/brand" },
  { label: "Architecture", href: "/architecture" },
  { label: "Docs", href: "/docs" },
]

// Pretty labels for breadcrumbs — maps URL segments to display strings.
// Missing keys fall back to Title Case of the segment (see `labelFor`
// in `components/landing/breadcrumbs.tsx`).
export const BREADCRUMB_LABELS: Record<string, string> = {
  components: "Components",
  brand: "Brand",
  foundations: "Foundations",
  patterns: "Patterns",
  architecture: "Architecture",
  observability: "Observability",
  playground: "Playground",
  docs: "Guides",
  installation: "Installation",
  cli: "CLI",
  theming: "Theming",
  contributing: "Contributing",
  changelog: "Changelog",
  "api-reference": "API reference",
  "api-docs": "API reference",
  registry: "Registry",
  mcp: "MCP server",
  blocks: "Blocks",
  charts: "Charts",
  layers: "Layer decision guide",
  "component-backlinks": "Component backlinks",
  tokens: "Design tokens",
  icons: "Icons",
  accessibility: "Accessibility",
  typography: "Typography",
  schema: "Schema",
  consuming: "Consuming",
}
