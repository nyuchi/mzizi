/**
 * Database types for the Nyuchi Design Portal Supabase document store.
 *
 * These types mirror the Supabase tables defined in supabase/schema.sql.
 * Components, docs, and demos are stored as rows in Postgres — queryable,
 * indexable, and protected by RLS.
 */

// ── Row types (what comes back from Supabase) ───────────────────────

export interface ComponentRow {
  id: number
  name: string
  registry_type: string
  description: string
  dependencies: string[]
  registry_dependencies: string[]
  files: ComponentFile[]
  category: string | null
  layer: string | null
  is_mukoko_component: boolean
  tags: string[]
  added_in_version: string | null
  source_code: string | null
  created_at: string
  updated_at: string
}

export interface ComponentDocRow {
  id: number
  component_name: string
  use_cases: string[]
  variants: string[]
  sizes: string[]
  features: string[]
  a11y: string[]
  examples: CodeExample[]
  created_at: string
  updated_at: string
}

export interface ComponentDemoRow {
  id: number
  component_name: string
  has_demo: boolean
  demo_type: string | null
  created_at: string
  updated_at: string
}

// ── Insert types (what we send to Supabase) ─────────────────────────

export interface ComponentInsert {
  name: string
  registry_type: string
  description: string
  dependencies?: string[]
  registry_dependencies?: string[]
  files?: ComponentFile[]
  category?: string | null
  layer?: string | null
  is_mukoko_component?: boolean
  tags?: string[]
  added_in_version?: string | null
  source_code?: string | null
}

export interface ComponentDocInsert {
  component_name: string
  use_cases: string[]
  variants?: string[]
  sizes?: string[]
  features?: string[]
  a11y?: string[]
  examples?: CodeExample[]
}

export interface ComponentDemoInsert {
  component_name: string
  has_demo: boolean
  demo_type?: string | null
}

// ── Shared types ────────────────────────────────────────────────────

export interface ComponentFile {
  path: string
  type: string
}

export interface CodeExample {
  title: string
  code: string
  language?: string
}

export type ComponentCategory =
  | "input"
  | "action"
  | "data-display"
  | "feedback"
  | "layout"
  | "navigation"
  | "overlay"
  | "utility"
  | "mukoko"
  | "infrastructure"

// ── Enriched types ──────────────────────────────────────────────────

export interface ComponentWithDocs extends ComponentRow {
  docs?: ComponentDocRow | null
  demo?: ComponentDemoRow | null
}

// ── Database info ───────────────────────────────────────────────────

export interface DatabaseInfo {
  provider: "supabase"
  components: number
  docs: number
  demos: number
  status: "connected" | "error"
}

// ── Brand table types ──────────────────────────────────────────────

export interface BrandMineralRow {
  id: number
  name: string
  hex: string
  light_hex: string
  dark_hex: string
  container_light: string
  container_dark: string
  css_var: string
  origin: string
  symbolism: string
  usage: string
  sort_order: number
  created_at: string
  updated_at: string
}

export interface BrandMineralInsert {
  name: string
  hex: string
  light_hex: string
  dark_hex: string
  container_light: string
  container_dark: string
  css_var: string
  origin: string
  symbolism: string
  usage: string
  sort_order?: number
}

export interface BrandSemanticColorRow {
  id: number
  name: string
  light_value: string
  dark_value: string
  usage: string
  color_type: string
  created_at: string
  updated_at: string
}

export interface BrandSemanticColorInsert {
  name: string
  light_value: string
  dark_value: string
  usage: string
  color_type?: string
}

export interface BrandTypographyRow {
  id: number
  name: string
  entry_type: string
  size_px: number | null
  size_rem: string | null
  line_height: string | null
  weight: number | null
  font: string | null
  usage: string
  family: string | null
  reason: string | null
  sort_order: number
  created_at: string
  updated_at: string
}

export interface BrandTypographyInsert {
  name: string
  entry_type?: string
  size_px?: number | null
  size_rem?: string | null
  line_height?: string | null
  weight?: number | null
  font?: string | null
  usage: string
  family?: string | null
  reason?: string | null
  sort_order?: number
}

export interface BrandSpacingRow {
  id: number
  name: string
  px: number
  rem: string
  usage: string
  sort_order: number
  created_at: string
  updated_at: string
}

export interface BrandSpacingInsert {
  name: string
  px: number
  rem: string
  usage: string
  sort_order?: number
}

export interface BrandEcosystemRow {
  id: number
  name: string
  meaning: string
  language: string
  role: string
  mineral: string
  url: string
  description: string
  voice: string
  sort_order: number
  created_at: string
  updated_at: string
}

export interface BrandEcosystemInsert {
  name: string
  meaning: string
  language: string
  role: string
  mineral: string
  url: string
  description: string
  voice: string
  sort_order?: number
}

export interface BrandMetaRow {
  id: number
  version: string
  name: string
  last_updated: string
  homepage: string
  philosophy: Record<string, unknown>
  voice_and_tone: Record<string, unknown>
  accessibility: Record<string, unknown>
  radii: Record<string, unknown>
  component_specs: Record<string, unknown>[]
  created_at: string
  updated_at: string
}

export interface BrandMetaInsert {
  version: string
  name: string
  last_updated: string
  homepage: string
  philosophy?: Record<string, unknown>
  voice_and_tone?: Record<string, unknown>
  accessibility?: Record<string, unknown>
  radii?: Record<string, unknown>
  component_specs?: Record<string, unknown>[]
}

// ── Architecture table types ───────────────────────────────────────

export interface ArchitecturePrincipleRow {
  id: number
  name: string
  title: string
  description: string
  rationale: string
  implementation: string
  sort_order: number
  created_at: string
  updated_at: string
}

export interface ArchitecturePrincipleInsert {
  name: string
  title: string
  description: string
  rationale: string
  implementation: string
  sort_order?: number
}

export interface ArchitectureFrameworkRow {
  id: number
  name: string
  approach: string
  framework: string
  rationale: string
  sovereignty_advantage: string
  platforms: Record<string, unknown>[]
  harmony_os: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface ArchitectureFrameworkInsert {
  name: string
  approach: string
  framework: string
  rationale: string
  sovereignty_advantage: string
  platforms?: Record<string, unknown>[]
  harmony_os?: Record<string, unknown>
}

export interface ArchitectureDataLayerRow {
  id: number
  name: string
  role: string
  platform: string
  description: string
  sovereignty: Record<string, unknown>
  sort_order: number
  created_at: string
  updated_at: string
}

export interface ArchitectureDataLayerInsert {
  name: string
  role: string
  platform: string
  description: string
  sovereignty?: Record<string, unknown>
  sort_order?: number
}

export interface ArchitectureCloudLayerRow {
  id: number
  name: string
  role: string
  consistency_model: string
  database: string
  data_categories: string[]
  description: string
  sovereignty: Record<string, unknown>
  sort_order: number
  created_at: string
  updated_at: string
}

export interface ArchitectureCloudLayerInsert {
  name: string
  role: string
  consistency_model: string
  database: string
  data_categories?: string[]
  description: string
  sovereignty?: Record<string, unknown>
  sort_order?: number
}

export interface ArchitecturePipelineRow {
  id: number
  name: string
  role: string
  description: string
  sovereignty: Record<string, unknown>
  sort_order: number
  created_at: string
  updated_at: string
}

export interface ArchitecturePipelineInsert {
  name: string
  role: string
  description: string
  sovereignty?: Record<string, unknown>
  sort_order?: number
}

export interface ArchitectureDataOwnershipRow {
  id: number
  category: string
  consistency_model: string
  database: string
  examples: string[]
  conflict_resolution: string
  ownership: string
  description: string
  sort_order: number
  created_at: string
  updated_at: string
}

export interface ArchitectureDataOwnershipInsert {
  category: string
  consistency_model: string
  database: string
  examples?: string[]
  conflict_resolution: string
  ownership: string
  description: string
  sort_order?: number
}

export interface ArchitectureSovereigntyRow {
  id: number
  technology: string
  role: string
  license: string
  governance: string
  sovereignty_risk: string
  forkable: boolean
  self_hostable: boolean
  rationale: string
  sort_order: number
  created_at: string
  updated_at: string
}

export interface ArchitectureSovereigntyInsert {
  technology: string
  role: string
  license: string
  governance: string
  sovereignty_risk: string
  forkable?: boolean
  self_hostable?: boolean
  rationale: string
  sort_order?: number
}

export interface ArchitectureRemovedRow {
  id: number
  name: string
  previous_role: string
  reason: string
  replacement: string
  migration_path: string
  created_at: string
  updated_at: string
}

export interface ArchitectureRemovedInsert {
  name: string
  previous_role: string
  reason: string
  replacement: string
  migration_path: string
}

// ── AI instruction table types ──────────────────────────────────────

export interface AiInstructionRow {
  id: number
  name: string
  target: string
  title: string | null
  description: string | null
  content: string
  version: string | null
  metadata: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

export interface AiInstructionInsert {
  name: string
  target: string
  title?: string | null
  description?: string | null
  content: string
  version?: string | null
  metadata?: Record<string, unknown> | null
}

// ── Skills table types ──────────────────────────────────────────────

/**
 * Agent-skill MDX bodies served three ways: as `.claude/skills/*.md` files
 * in any consumer repo (via the `@nyuchi/design-agent-skills` npm package),
 * via the HTTP API at `/api/v1/skills/{name}`, and via the MCP `get_skill`
 * tool. The Supabase `skills` table is the single source of truth.
 *
 * Distinct from `ai_instructions` — those are per-AI-target system prompts
 * (one row per target like `claude-system-prompt`, `mcp-server`,
 * `github-copilot`); skills are reusable workflows an agent invokes on
 * specific tasks (one row per skill like `nyuchi-design-system`,
 * `scaffold-component`, `ecosystem-app-setup`).
 */
export interface SkillRow {
  id: number
  name: string
  description: string
  body_mdx: string
  agents: string[]
  requires_mcp: boolean
  applies_to: string[]
  status: string | null
  version: string
  created_at: string
  updated_at: string
}

/**
 * Lightweight summary shape returned by `list_skills()` and
 * `get_skills_summary()` SQL helpers — same as `SkillRow` minus the heavy
 * `body_mdx` field, for consumers that only need the index.
 */
export type SkillSummary = Omit<SkillRow, "body_mdx" | "id" | "created_at">

// ── Changelog table types ───────────────────────────────────────────
//
// The `changelog` table was migrated by `versioning_and_changelog_v2`
// to a node-aware shape. Each row tracks which ecosystem nodes (N1–N10)
// and which components / tools moved in the release. The legacy
// optional fields (`body`, `is_latest`, `categories`, `updated_at`)
// are retained for backwards compatibility with the older
// `getChangelogEntries` / `db-changelog.tsx` rendering path; they are
// null/undefined on rows fetched via the new `list_changelog()` RPC.

export interface ChangelogRow {
  id: number
  version: string
  title: string
  description: string | null
  /**
   * Ecosystem nodes (N1–N10) touched by this release. Rendered as
   * axis-coloured pill badges via the nyuchi-changelog-renderer.
   */
  nodes_affected: number[] | null
  axes_affected: string[] | null
  components_added: string[] | null
  components_modified: string[] | null
  components_deprecated: string[] | null
  components_removed: string[] | null
  tools_added: string[] | null
  tools_modified: string[] | null
  tools_deprecated: string[] | null
  tools_removed: string[] | null
  total_stable: number | null
  total_deprecated: number | null
  total_alpha: number | null
  changed_by: string | null
  released_at: string
  linked_issues: string[] | null
  created_at: string
  // legacy fields (post-v2 migration leaves these absent)
  body?: string | null
  is_latest?: boolean
  categories?: Record<string, unknown> | null
  updated_at?: string
}

export interface ChangelogInsert {
  version: string
  title: string
  description?: string | null
  nodes_affected?: number[] | null
  axes_affected?: string[] | null
  components_added?: string[] | null
  components_modified?: string[] | null
  components_deprecated?: string[] | null
  components_removed?: string[] | null
  released_at: string
}

/**
 * Shape returned by the `list_changelog(p_limit, p_offset)` RPC. Mirrors
 * the row shape minus the ID / archive columns. Used by `/changelog`.
 */
export interface ChangelogListRow {
  version: string
  title: string
  description: string | null
  nodes_affected: number[] | null
  axes_affected: string[] | null
  components_added: string[] | null
  components_modified: string[] | null
  components_deprecated: string[] | null
  components_removed: string[] | null
  total_stable: number | null
  total_deprecated: number | null
  total_alpha: number | null
  changed_by: string | null
  created_at: string
}

// ── mcp_tool_registry table types ───────────────────────────────────

export type ToolStability = "experimental" | "evolving" | "stable" | "frozen" | "deprecated"

export interface McpToolRegistryRow {
  tool_name: string
  category: string | null
  description: string | null
  sql_function: string | null
  source_table: string | null
  input_schema: Record<string, unknown> | null
  output_shape: Record<string, unknown> | null
  stability: ToolStability | null
  tool_kind: string | null
  requires_first_party: boolean | null
  requires_domain_feature: string | null
  cache_ttl_seconds: number | null
  enabled: boolean | null
  added_in_version: string | null
  notes: string | null
  created_at: string
  updated_at: string
  current_version: string | null
  version_count: number | null
  edge_function: string | null
}

// ── Component version table types ───────────────────────────────────

export interface ComponentVersionRow {
  id: number
  component_name: string
  version: string
  changes: string | null
  source_code: string | null
  released_at: string
  metadata: Record<string, unknown> | null
  created_at: string
}

export interface ComponentVersionInsert {
  component_name: string
  version: string
  changes?: string | null
  source_code?: string | null
  released_at: string
  metadata?: Record<string, unknown> | null
}

// ── Design token types (from nyuchi-tokens component source_code) ──

export interface DesignTokens {
  minerals?: Record<string, unknown>
  semanticColors?: Record<string, unknown>
  typography?: Record<string, unknown>
  spacing?: Record<string, unknown>
  radii?: Record<string, unknown>
  [key: string]: unknown
}

// ── Supabase database type helper ───────────────────────────────────

export interface Database {
  public: {
    Tables: {
      components: {
        Row: ComponentRow
        Insert: ComponentInsert
        Update: Partial<ComponentInsert>
      }
      component_docs: {
        Row: ComponentDocRow
        Insert: ComponentDocInsert
        Update: Partial<ComponentDocInsert>
      }
      component_demos: {
        Row: ComponentDemoRow
        Insert: ComponentDemoInsert
        Update: Partial<ComponentDemoInsert>
      }
      brand_minerals: {
        Row: BrandMineralRow
        Insert: BrandMineralInsert
        Update: Partial<BrandMineralInsert>
      }
      brand_semantic_colors: {
        Row: BrandSemanticColorRow
        Insert: BrandSemanticColorInsert
        Update: Partial<BrandSemanticColorInsert>
      }
      brand_typography: {
        Row: BrandTypographyRow
        Insert: BrandTypographyInsert
        Update: Partial<BrandTypographyInsert>
      }
      brand_spacing: {
        Row: BrandSpacingRow
        Insert: BrandSpacingInsert
        Update: Partial<BrandSpacingInsert>
      }
      brand_ecosystem: {
        Row: BrandEcosystemRow
        Insert: BrandEcosystemInsert
        Update: Partial<BrandEcosystemInsert>
      }
      brand_meta: {
        Row: BrandMetaRow
        Insert: BrandMetaInsert
        Update: Partial<BrandMetaInsert>
      }
      architecture_principles: {
        Row: ArchitecturePrincipleRow
        Insert: ArchitecturePrincipleInsert
        Update: Partial<ArchitecturePrincipleInsert>
      }
      architecture_framework: {
        Row: ArchitectureFrameworkRow
        Insert: ArchitectureFrameworkInsert
        Update: Partial<ArchitectureFrameworkInsert>
      }
      architecture_data_layer: {
        Row: ArchitectureDataLayerRow
        Insert: ArchitectureDataLayerInsert
        Update: Partial<ArchitectureDataLayerInsert>
      }
      architecture_cloud_layer: {
        Row: ArchitectureCloudLayerRow
        Insert: ArchitectureCloudLayerInsert
        Update: Partial<ArchitectureCloudLayerInsert>
      }
      architecture_pipeline: {
        Row: ArchitecturePipelineRow
        Insert: ArchitecturePipelineInsert
        Update: Partial<ArchitecturePipelineInsert>
      }
      architecture_data_ownership: {
        Row: ArchitectureDataOwnershipRow
        Insert: ArchitectureDataOwnershipInsert
        Update: Partial<ArchitectureDataOwnershipInsert>
      }
      architecture_sovereignty: {
        Row: ArchitectureSovereigntyRow
        Insert: ArchitectureSovereigntyInsert
        Update: Partial<ArchitectureSovereigntyInsert>
      }
      architecture_removed: {
        Row: ArchitectureRemovedRow
        Insert: ArchitectureRemovedInsert
        Update: Partial<ArchitectureRemovedInsert>
      }
      ai_instructions: {
        Row: AiInstructionRow
        Insert: AiInstructionInsert
        Update: Partial<AiInstructionInsert>
      }
      changelog: {
        Row: ChangelogRow
        Insert: ChangelogInsert
        Update: Partial<ChangelogInsert>
      }
      component_versions: {
        Row: ComponentVersionRow
        Insert: ComponentVersionInsert
        Update: Partial<ComponentVersionInsert>
      }
    }
  }
}

// ── Architecture (3D frontend model — issue #46 table-backed doctrine) ──

export type ArchitectureAxisGeometry = "horizontal" | "vertical" | "depth" | "external"

export interface ArchitectureFrontendAxisRow {
  id: number
  name: string
  title: string
  description: string
  geometry: ArchitectureAxisGeometry | string
  metaphor: string
  sort_order: number
  created_at: string
  updated_at: string
}

export interface ArchitectureFrontendLayerRow {
  id: number
  layer_number: number
  sub_label: string
  title: string
  axis_name: string
  role: string
  description: string
  covenant: string
  stakeholder: string
  implementation_rules: string[]
  sort_order: number
  created_at: string
  updated_at: string
}

// RPC return shapes for the `get_axes_summary()` and `get_layer_detail()`
// helper functions. These are derived views (axes joined to component
// counts; layers joined to component counts + category breakdowns), so
// they don't share a schema with the base tables.

export interface AxisSummaryRow {
  name: string
  title: string
  description: string
  geometry: ArchitectureAxisGeometry | string
  metaphor: string
  sort_order: number
  layer_count: number
  component_count: number
}

export interface LayerCategoryCount {
  category: string
  count: number
}

export interface LayerDetailRow {
  layer_number: number
  sub_label: string
  title: string
  axis_name: string
  role: string
  description: string
  covenant: string
  stakeholder: string
  implementation_rules: string[]
  component_count: number
  categories: LayerCategoryCount[]
}

export interface ArchitectureSnapshotLayer {
  layer_number: number
  sub_label: string
  title: string
  role: string
  description: string
  covenant: string
  stakeholder: string
  implementation_rules: string[]
  sort_order: number
  component_count: number
  stable_count: number
  alpha_count: number
  deprecated_count: number
}

export interface ArchitectureSnapshotAxis {
  name: string
  title: string
  description: string
  geometry: ArchitectureAxisGeometry | string
  metaphor: string
  sort_order: number
  layers: ArchitectureSnapshotLayer[]
}
//
// Five Ubuntu Pillars (the spheres in which Ubuntu is lived) and Five
// Ubuntu Principles (the operating rules that translate Ubuntu to software).
// Tables are the canonical structure; seeding is out-of-band.

export interface UbuntuPillarRow {
  id: number
  name: string
  shona: string
  title: string
  description: string
  sphere: string
  platform_surface: string
  source: string
  sort_order: number
  created_at: string
  updated_at: string
}

export interface UbuntuPrincipleRow {
  id: number
  name: string
  shona: string
  title: string
  description: string
  expression: string
  source: string
  sort_order: number
  created_at: string
  updated_at: string
}

// ── Observability open-data tables — issue #84 ──────────────────────
//
// The /observability dashboard reads from four public tables (and the
// `get_system_counts()` RPC). All rows are public-read via RLS — see
// nyuchi/design-portal#82.

export interface FundiIssueRow {
  id: number
  github_issue_number: number | null
  github_issue_url: string | null
  component_name: string | null
  ecosystem_node: number | null
  portal_url: string | null
  severity: string | null
  error_type: string | null
  blast_radius: string | null
  status: string | null
  resolution: string | null
  auto_fixable: boolean | null
  requires_human: boolean | null
  root_cause: string | null
  resolved_by: string | null
  resolved_at: string | null
  created_at: string
  updated_at: string
}

export interface ObservabilityEventRow {
  id: number
  event_type: string
  component_name: string | null
  ecosystem_node: number | null
  domain: string | null
  page_path: string | null
  created_at: string
  metadata: Record<string, unknown> | null
}

export interface ChaosEventRow {
  id: number
  event_type: string
  injection_kind: string | null
  domain: string | null
  environment: string | null
  component_name: string | null
  ecosystem_node: number | null
  page_path: string | null
  blocked_reason: string | null
  injected_by: string | null
  duration_ms: number | null
  metadata: Record<string, unknown> | null
  created_at: string
}

/**
 * Row from the `get_system_counts()` RPC (v4.0.33+ replacement for the
 * deprecated `get_layer_counts()`). The dashboard reads `total_nodes`.
 */
export interface SystemCountsRow {
  total_components: number
  total_stable: number
  total_alpha: number
  total_deprecated: number
  total_nodes: number
  total_categories: number
  total_mini_apps: number
  total_doc_pages: number
  total_ai_instructions: number
  total_changelog_entries: number
}

/**
 * Component count per `ecosystem_node`, enriched with the node's
 * sub_label, title, and axis from `architecture_frontend_layers`.
 */
export interface NodeDistributionRow {
  ecosystem_node: number
  sub_label: string
  title: string
  ecosystem_axis: string
  component_count: number
}
