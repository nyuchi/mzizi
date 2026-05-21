/**
 * Nyuchi Design Portal Document Store — Supabase Backend
 *
 * Replaces hardcoded JSON files (registry.json, component-docs.ts) with
 * Supabase Postgres. All registry data lives in three tables:
 *
 *   components       — Component metadata (name, deps, files, category)
 *   component_docs   — Documentation (use cases, variants, features)
 *   component_demos  — Demo configuration
 *
 * Architecture:
 *   Browser  →  Next.js API routes  →  Supabase (Postgres + RLS)
 *                                         ↑
 *                                    Public read (anon key)
 *                                    Write via service_role key
 *
 * Env vars:
 *   NEXT_PUBLIC_SUPABASE_URL      — Supabase project URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY — Public anon key (read-only via RLS)
 *   SUPABASE_SERVICE_ROLE_KEY     — Service role key (write access, server only)
 *
 * Usage:
 *   import { getComponent, getAllComponents } from "@/lib/db"
 *   const button = await getComponent("button")
 */

import { createClient } from "@supabase/supabase-js"
import type {
  ComponentRow,
  ComponentDocRow,
  ComponentDemoRow,
  ComponentWithDocs,
  ComponentInsert,
  ComponentDocInsert,
  ComponentDemoInsert,
  DatabaseInfo,
  BrandMineralRow,
  BrandMineralInsert,
  BrandSemanticColorRow,
  BrandSemanticColorInsert,
  BrandTypographyRow,
  BrandTypographyInsert,
  BrandSpacingRow,
  BrandSpacingInsert,
  BrandEcosystemRow,
  BrandEcosystemInsert,
  BrandMetaRow,
  BrandMetaInsert,
  ArchitecturePrincipleRow,
  ArchitecturePrincipleInsert,
  ArchitectureFrameworkRow,
  ArchitectureFrameworkInsert,
  ArchitectureDataLayerRow,
  ArchitectureDataLayerInsert,
  ArchitectureCloudLayerRow,
  ArchitectureCloudLayerInsert,
  ArchitecturePipelineRow,
  ArchitecturePipelineInsert,
  ArchitectureDataOwnershipRow,
  ArchitectureDataOwnershipInsert,
  ArchitectureSovereigntyRow,
  ArchitectureSovereigntyInsert,
  ArchitectureRemovedRow,
  ArchitectureRemovedInsert,
  AiInstructionRow,
  AiInstructionInsert,
  ChangelogRow,
  ChangelogInsert,
  ComponentVersionRow,
  DesignTokens,
  ArchitectureFrontendAxisRow,
  ArchitectureFrontendLayerRow,
  AxisSummaryRow,
  LayerDetailRow,
  ArchitectureSnapshotAxis,
  ArchitectureSnapshotLayer,
  SkillRow,
  SkillSummary,
  UbuntuPillarRow,
  UbuntuPrincipleRow,
} from "./types"

// ── Supabase clients ────────────────────────────────────────────────

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ""

type SupabaseClient = ReturnType<typeof createClient>

/**
 * Public client (uses anon key, respects RLS).
 * Safe for client-side and server-side reads.
 */
let _publicClient: SupabaseClient | null = null

export function getPublicClient(): SupabaseClient {
  if (!_publicClient) {
    _publicClient = createClient(supabaseUrl, supabaseAnonKey)
  }
  return _publicClient
}

/**
 * Admin client (uses service_role key, bypasses RLS).
 * Server-only — for seed scripts and write operations.
 */
let _adminClient: SupabaseClient | null = null

export function getAdminClient(): SupabaseClient {
  if (!_adminClient) {
    _adminClient = createClient(supabaseUrl, supabaseServiceKey)
  }
  return _adminClient
}

/**
 * Check if Supabase is configured.
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey)
}

// ── Component queries ───────────────────────────────────────────────

/**
 * Get a single component by name.
 */
export async function getComponent(name: string): Promise<ComponentRow | null> {
  const { data, error } = await getPublicClient()
    .from("components")
    .select("*")
    .eq("name", name)
    .single()

  if (error) {
    if (error.code === "PGRST116") return null // not found
    throw new Error(error.message)
  }
  return data as unknown as ComponentRow
}

/**
 * Get all components, sorted by name.
 */
export async function getAllComponents(): Promise<ComponentRow[]> {
  const { data, error } = await getPublicClient().from("components").select("*").order("name")

  if (error) throw new Error(error.message)
  return (data ?? []) as unknown as ComponentRow[]
}

/**
 * Get components by category.
 */
export async function getComponentsByCategory(category: string): Promise<ComponentRow[]> {
  const { data, error } = await getPublicClient()
    .from("components")
    .select("*")
    .eq("category", category)
    .order("name")

  if (error) throw new Error(error.message)
  return (data ?? []) as unknown as ComponentRow[]
}

/**
 * Get components by layer.
 */
export async function getComponentsByLayer(layer: string): Promise<ComponentRow[]> {
  const { data, error } = await getPublicClient()
    .from("components")
    .select("*")
    .eq("layer", layer)
    .order("name")

  if (error) throw new Error(error.message)
  return (data ?? []) as unknown as ComponentRow[]
}

/**
 * Search components by name or description (case-insensitive).
 */
export async function searchComponents(query: string): Promise<ComponentRow[]> {
  const { data, error } = await getPublicClient()
    .from("components")
    .select("*")
    .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
    .order("name")

  if (error) throw new Error(error.message)
  return (data ?? []) as unknown as ComponentRow[]
}

// ── Component documentation queries ─────────────────────────────────

/**
 * Get documentation for a component.
 */
export async function getComponentDoc(name: string): Promise<ComponentDocRow | null> {
  const { data, error } = await getPublicClient()
    .from("component_docs")
    .select("*")
    .eq("component_name", name)
    .single()

  if (error) {
    if (error.code === "PGRST116") return null
    throw new Error(error.message)
  }
  return data as unknown as ComponentDocRow
}

/**
 * Get all component documentation.
 */
export async function getAllComponentDocs(): Promise<ComponentDocRow[]> {
  const { data, error } = await getPublicClient().from("component_docs").select("*")

  if (error) throw new Error(error.message)
  return (data ?? []) as unknown as ComponentDocRow[]
}

// ── Demo queries ────────────────────────────────────────────────────

/**
 * Check if a component has a demo.
 */
export async function hasDemoFor(name: string): Promise<boolean> {
  const { data } = await getPublicClient()
    .from("component_demos")
    .select("has_demo")
    .eq("component_name", name)
    .single()

  return (data as unknown as { has_demo: boolean } | null)?.has_demo ?? false
}

/**
 * Get all component names that have demos.
 */
export async function getDemoNames(): Promise<string[]> {
  const { data, error } = await getPublicClient()
    .from("component_demos")
    .select("component_name")
    .eq("has_demo", true)

  if (error) throw new Error(error.message)
  return ((data ?? []) as unknown as Array<{ component_name: string }>).map((d) => d.component_name)
}

// ── Enriched queries ────────────────────────────────────────────────

/**
 * Get a component with its documentation and demo info.
 */
export async function getComponentWithDocs(name: string): Promise<ComponentWithDocs | null> {
  const component = await getComponent(name)
  if (!component) return null

  const [docs, demo] = await Promise.all([
    getComponentDoc(name),
    getPublicClient()
      .from("component_demos")
      .select("*")
      .eq("component_name", name)
      .single()
      .then(({ data }) => data as unknown as ComponentDemoRow | null),
  ])

  return { ...component, docs, demo }
}

/**
 * Get all components with their docs (for catalog pages).
 */
export async function getAllComponentsWithDocs(): Promise<ComponentWithDocs[]> {
  const [components, docs, demos] = await Promise.all([
    getAllComponents(),
    getAllComponentDocs(),
    getPublicClient()
      .from("component_demos")
      .select("*")
      .eq("has_demo", true)
      .then(({ data }) => (data ?? []) as unknown as ComponentDemoRow[]),
  ])

  const docMap = new Map(docs.map((d) => [d.component_name, d]))
  const demoMap = new Map(demos.map((d) => [d.component_name, d]))

  return components.map((component) => ({
    ...component,
    docs: docMap.get(component.name) ?? null,
    demo: demoMap.get(component.name) ?? null,
  }))
}

// ── Write operations (server-only, uses service_role) ───────────────

/**
 * Upsert a component (insert or update on conflict).
 */
export async function upsertComponent(component: ComponentInsert): Promise<ComponentRow> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (getAdminClient() as any)
    .from("components")
    .upsert(component, { onConflict: "name" })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as ComponentRow
}

/**
 * Upsert component documentation.
 */
export async function upsertComponentDoc(doc: ComponentDocInsert): Promise<ComponentDocRow> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (getAdminClient() as any)
    .from("component_docs")
    .upsert(doc, { onConflict: "component_name" })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as ComponentDocRow
}

/**
 * Upsert a component demo.
 */
export async function upsertComponentDemo(demo: ComponentDemoInsert): Promise<ComponentDemoRow> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (getAdminClient() as any)
    .from("component_demos")
    .upsert(demo, { onConflict: "component_name" })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as ComponentDemoRow
}

/**
 * Delete a component and its docs/demos (cascade).
 */
export async function deleteComponent(name: string): Promise<void> {
  const { error } = await getAdminClient().from("components").delete().eq("name", name)

  if (error) throw new Error(error.message)
}

// ── Registry count queries ──────────────────────────────────────────

export interface RegistryCounts {
  total: number
  ui: number
  blocks: number
  hooks: number
  lib: number
}

/**
 * Get live component counts from the database, grouped by registry_type.
 * Used to replace hardcoded numbers in landing page components.
 * Returns zeros if database is not configured or not seeded.
 */
export async function getRegistryCounts(): Promise<RegistryCounts> {
  if (!isSupabaseConfigured()) {
    return { total: 0, ui: 0, blocks: 0, hooks: 0, lib: 0 }
  }

  try {
    const [total, ui, blocks, hooks, lib] = await Promise.all([
      getPublicClient().from("components").select("*", { count: "exact", head: true }),
      getPublicClient()
        .from("components")
        .select("*", { count: "exact", head: true })
        .eq("registry_type", "registry:ui"),
      getPublicClient()
        .from("components")
        .select("*", { count: "exact", head: true })
        .eq("registry_type", "registry:block"),
      getPublicClient()
        .from("components")
        .select("*", { count: "exact", head: true })
        .eq("registry_type", "registry:hook"),
      getPublicClient()
        .from("components")
        .select("*", { count: "exact", head: true })
        .eq("registry_type", "registry:lib"),
    ])

    return {
      total: total.count ?? 0,
      ui: ui.count ?? 0,
      blocks: blocks.count ?? 0,
      hooks: hooks.count ?? 0,
      lib: lib.count ?? 0,
    }
  } catch {
    return { total: 0, ui: 0, blocks: 0, hooks: 0, lib: 0 }
  }
}

// ── Database info ───────────────────────────────────────────────────

/**
 * Get database status and counts.
 */
export async function getDatabaseInfo(): Promise<DatabaseInfo> {
  try {
    const [components, docs, demos] = await Promise.all([
      getPublicClient().from("components").select("*", { count: "exact", head: true }),
      getPublicClient().from("component_docs").select("*", { count: "exact", head: true }),
      getPublicClient().from("component_demos").select("*", { count: "exact", head: true }),
    ])

    return {
      provider: "supabase",
      components: components.count ?? 0,
      docs: docs.count ?? 0,
      demos: demos.count ?? 0,
      status: "connected",
    }
  } catch {
    return {
      provider: "supabase",
      components: 0,
      docs: 0,
      demos: 0,
      status: "error",
    }
  }
}

// ── Brand queries ──────────────────────────────────────────────────

/**
 * Get all brand minerals, sorted by sort_order.
 */
export async function getMinerals(): Promise<BrandMineralRow[]> {
  const { data, error } = await getPublicClient()
    .from("brand_minerals")
    .select("*")
    .order("sort_order")

  if (error) throw new Error(error.message)
  return (data ?? []) as unknown as BrandMineralRow[]
}

/**
 * Get all semantic colors.
 */
export async function getSemanticColors(): Promise<BrandSemanticColorRow[]> {
  const { data, error } = await getPublicClient()
    .from("brand_semantic_colors")
    .select("*")
    .order("name")

  if (error) throw new Error(error.message)
  return (data ?? []) as unknown as BrandSemanticColorRow[]
}

/**
 * Get semantic colors filtered by type (e.g. 'semantic' or 'background').
 */
export async function getSemanticColorsByType(colorType: string): Promise<BrandSemanticColorRow[]> {
  const { data, error } = await getPublicClient()
    .from("brand_semantic_colors")
    .select("*")
    .eq("color_type", colorType)
    .order("name")

  if (error) throw new Error(error.message)
  return (data ?? []) as unknown as BrandSemanticColorRow[]
}

/**
 * Get all typography entries, sorted by sort_order.
 */
export async function getTypography(): Promise<BrandTypographyRow[]> {
  const { data, error } = await getPublicClient()
    .from("brand_typography")
    .select("*")
    .order("sort_order")

  if (error) throw new Error(error.message)
  return (data ?? []) as unknown as BrandTypographyRow[]
}

/**
 * Get typography entries by type ('font' or 'scale').
 */
export async function getTypographyByType(entryType: string): Promise<BrandTypographyRow[]> {
  const { data, error } = await getPublicClient()
    .from("brand_typography")
    .select("*")
    .eq("entry_type", entryType)
    .order("sort_order")

  if (error) throw new Error(error.message)
  return (data ?? []) as unknown as BrandTypographyRow[]
}

/**
 * Get all spacing tokens, sorted by sort_order.
 */
export async function getSpacing(): Promise<BrandSpacingRow[]> {
  const { data, error } = await getPublicClient()
    .from("brand_spacing")
    .select("*")
    .order("sort_order")

  if (error) throw new Error(error.message)
  return (data ?? []) as unknown as BrandSpacingRow[]
}

/**
 * Get all ecosystem brands, sorted by sort_order.
 */
export async function getEcosystemBrands(): Promise<BrandEcosystemRow[]> {
  const { data, error } = await getPublicClient()
    .from("brand_ecosystem")
    .select("*")
    .order("sort_order")

  if (error) throw new Error(error.message)
  return (data ?? []) as unknown as BrandEcosystemRow[]
}

/**
 * Get brand metadata (single row).
 */
export async function getBrandMeta(): Promise<BrandMetaRow | null> {
  const { data, error } = await getPublicClient().from("brand_meta").select("*").limit(1).single()

  if (error) {
    if (error.code === "PGRST116") return null
    throw new Error(error.message)
  }
  return data as unknown as BrandMetaRow
}

/**
 * Get the full brand system from DB, assembled into the same shape as BRAND_SYSTEM.
 */
export async function getBrandSystem(): Promise<{
  minerals: BrandMineralRow[]
  semanticColors: BrandSemanticColorRow[]
  backgrounds: BrandSemanticColorRow[]
  typography: BrandTypographyRow[]
  spacing: BrandSpacingRow[]
  ecosystem: BrandEcosystemRow[]
  meta: BrandMetaRow | null
} | null> {
  try {
    const [minerals, semanticColors, backgrounds, typography, spacing, ecosystem, meta] =
      await Promise.all([
        getMinerals(),
        getSemanticColorsByType("semantic"),
        getSemanticColorsByType("background"),
        getTypography(),
        getSpacing(),
        getEcosystemBrands(),
        getBrandMeta(),
      ])

    if (minerals.length === 0 && !meta) return null

    return { minerals, semanticColors, backgrounds, typography, spacing, ecosystem, meta }
  } catch {
    return null
  }
}

// ── Architecture queries ───────────────────────────────────────────

/**
 * Get all architecture principles, sorted by sort_order.
 */
export async function getArchitecturePrinciples(): Promise<ArchitecturePrincipleRow[]> {
  const { data, error } = await getPublicClient()
    .from("architecture_principles")
    .select("*")
    .order("sort_order")

  if (error) throw new Error(error.message)
  return (data ?? []) as unknown as ArchitecturePrincipleRow[]
}

/**
 * Get the framework decision (single row).
 */
export async function getFrameworkDecision(): Promise<ArchitectureFrameworkRow | null> {
  const { data, error } = await getPublicClient()
    .from("architecture_framework")
    .select("*")
    .limit(1)
    .single()

  if (error) {
    if (error.code === "PGRST116") return null
    throw new Error(error.message)
  }
  return data as unknown as ArchitectureFrameworkRow
}

/**
 * Get local data layer technologies, sorted by sort_order.
 */
export async function getLocalDataLayer(): Promise<ArchitectureDataLayerRow[]> {
  const { data, error } = await getPublicClient()
    .from("architecture_data_layer")
    .select("*")
    .order("sort_order")

  if (error) throw new Error(error.message)
  return (data ?? []) as unknown as ArchitectureDataLayerRow[]
}

/**
 * Get cloud layer services, sorted by sort_order.
 */
export async function getCloudLayer(): Promise<ArchitectureCloudLayerRow[]> {
  const { data, error } = await getPublicClient()
    .from("architecture_cloud_layer")
    .select("*")
    .order("sort_order")

  if (error) throw new Error(error.message)
  return (data ?? []) as unknown as ArchitectureCloudLayerRow[]
}

/**
 * Get pipeline stages, sorted by sort_order.
 */
export async function getPipeline(): Promise<ArchitecturePipelineRow[]> {
  const { data, error } = await getPublicClient()
    .from("architecture_pipeline")
    .select("*")
    .order("sort_order")

  if (error) throw new Error(error.message)
  return (data ?? []) as unknown as ArchitecturePipelineRow[]
}

/**
 * Get data ownership rules, sorted by sort_order.
 */
export async function getDataOwnership(): Promise<ArchitectureDataOwnershipRow[]> {
  const { data, error } = await getPublicClient()
    .from("architecture_data_ownership")
    .select("*")
    .order("sort_order")

  if (error) throw new Error(error.message)
  return (data ?? []) as unknown as ArchitectureDataOwnershipRow[]
}

/**
 * Get sovereignty assessments, sorted by sort_order.
 */
export async function getSovereignty(): Promise<ArchitectureSovereigntyRow[]> {
  const { data, error } = await getPublicClient()
    .from("architecture_sovereignty")
    .select("*")
    .order("sort_order")

  if (error) throw new Error(error.message)
  return (data ?? []) as unknown as ArchitectureSovereigntyRow[]
}

/**
 * Get removed technologies.
 */
export async function getRemovedTechnologies(): Promise<ArchitectureRemovedRow[]> {
  const { data, error } = await getPublicClient()
    .from("architecture_removed")
    .select("*")
    .order("name")

  if (error) throw new Error(error.message)
  return (data ?? []) as unknown as ArchitectureRemovedRow[]
}

// ── Brand write operations (server-only) ───────────────────────────

/**
 * Upsert a brand mineral.
 */
export async function upsertBrandMineral(mineral: BrandMineralInsert): Promise<BrandMineralRow> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (getAdminClient() as any)
    .from("brand_minerals")
    .upsert(mineral, { onConflict: "name" })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as BrandMineralRow
}

/**
 * Upsert a semantic color.
 */
export async function upsertBrandSemanticColor(
  color: BrandSemanticColorInsert
): Promise<BrandSemanticColorRow> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (getAdminClient() as any)
    .from("brand_semantic_colors")
    .upsert(color, { onConflict: "name" })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as BrandSemanticColorRow
}

/**
 * Upsert a typography entry.
 */
export async function upsertBrandTypography(
  entry: BrandTypographyInsert
): Promise<BrandTypographyRow> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (getAdminClient() as any)
    .from("brand_typography")
    .upsert(entry, { onConflict: "name" })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as BrandTypographyRow
}

/**
 * Upsert a spacing token.
 */
export async function upsertBrandSpacing(spacing: BrandSpacingInsert): Promise<BrandSpacingRow> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (getAdminClient() as any)
    .from("brand_spacing")
    .upsert(spacing, { onConflict: "name" })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as BrandSpacingRow
}

/**
 * Upsert an ecosystem brand.
 */
export async function upsertBrandEcosystem(
  brand: BrandEcosystemInsert
): Promise<BrandEcosystemRow> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (getAdminClient() as any)
    .from("brand_ecosystem")
    .upsert(brand, { onConflict: "name" })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as BrandEcosystemRow
}

/**
 * Upsert brand metadata (single row — deletes existing then inserts).
 */
export async function upsertBrandMeta(meta: BrandMetaInsert): Promise<BrandMetaRow> {
  const admin = getAdminClient()

  // Delete existing rows (single row table)
  await admin.from("brand_meta").delete().neq("id", 0)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (admin as any).from("brand_meta").insert(meta).select().single()

  if (error) throw new Error(error.message)
  return data as BrandMetaRow
}

// ── Architecture write operations (server-only) ────────────────────

/**
 * Upsert an architecture principle.
 */
export async function upsertArchitecturePrinciple(
  principle: ArchitecturePrincipleInsert
): Promise<ArchitecturePrincipleRow> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (getAdminClient() as any)
    .from("architecture_principles")
    .upsert(principle, { onConflict: "name" })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as ArchitecturePrincipleRow
}

/**
 * Upsert the framework decision.
 */
export async function upsertArchitectureFramework(
  framework: ArchitectureFrameworkInsert
): Promise<ArchitectureFrameworkRow> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (getAdminClient() as any)
    .from("architecture_framework")
    .upsert(framework, { onConflict: "name" })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as ArchitectureFrameworkRow
}

/**
 * Upsert a data layer technology.
 */
export async function upsertArchitectureDataLayer(
  tech: ArchitectureDataLayerInsert
): Promise<ArchitectureDataLayerRow> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (getAdminClient() as any)
    .from("architecture_data_layer")
    .upsert(tech, { onConflict: "name" })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as ArchitectureDataLayerRow
}

/**
 * Upsert a cloud layer service.
 */
export async function upsertArchitectureCloudLayer(
  service: ArchitectureCloudLayerInsert
): Promise<ArchitectureCloudLayerRow> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (getAdminClient() as any)
    .from("architecture_cloud_layer")
    .upsert(service, { onConflict: "name" })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as ArchitectureCloudLayerRow
}

/**
 * Upsert a pipeline stage.
 */
export async function upsertArchitecturePipeline(
  stage: ArchitecturePipelineInsert
): Promise<ArchitecturePipelineRow> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (getAdminClient() as any)
    .from("architecture_pipeline")
    .upsert(stage, { onConflict: "name" })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as ArchitecturePipelineRow
}

/**
 * Upsert a data ownership rule.
 */
export async function upsertArchitectureDataOwnership(
  rule: ArchitectureDataOwnershipInsert
): Promise<ArchitectureDataOwnershipRow> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (getAdminClient() as any)
    .from("architecture_data_ownership")
    .upsert(rule, { onConflict: "category" })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as ArchitectureDataOwnershipRow
}

/**
 * Upsert a sovereignty assessment.
 */
export async function upsertArchitectureSovereignty(
  assessment: ArchitectureSovereigntyInsert
): Promise<ArchitectureSovereigntyRow> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (getAdminClient() as any)
    .from("architecture_sovereignty")
    .upsert(assessment, { onConflict: "technology" })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as ArchitectureSovereigntyRow
}

/**
 * Upsert a removed technology.
 */
export async function upsertArchitectureRemoved(
  removed: ArchitectureRemovedInsert
): Promise<ArchitectureRemovedRow> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (getAdminClient() as any)
    .from("architecture_removed")
    .upsert(removed, { onConflict: "name" })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as ArchitectureRemovedRow
}

// ── AI instruction queries ─────────────────────────────────────────

/**
 * Get an AI instruction by name (e.g., "nyuchi-mcp-system-prompt").
 */
export async function getAiInstruction(name: string): Promise<AiInstructionRow | null> {
  const { data, error } = await getPublicClient()
    .from("ai_instructions")
    .select("*")
    .eq("name", name)
    .single()

  if (error) {
    if (error.code === "PGRST116") return null
    throw new Error(error.message)
  }
  return data as unknown as AiInstructionRow
}

/**
 * Get an AI instruction by target audience (mcp-server, claude, github-copilot, cursor).
 */
export async function getAiInstructionByTarget(target: string): Promise<AiInstructionRow | null> {
  const { data, error } = await getPublicClient()
    .from("ai_instructions")
    .select("*")
    .eq("target", target)
    .order("updated_at", { ascending: false })
    .limit(1)
    .single()

  if (error) {
    if (error.code === "PGRST116") return null
    throw new Error(error.message)
  }
  return data as unknown as AiInstructionRow
}

/**
 * Get all AI instructions.
 */
export async function getAllAiInstructions(): Promise<AiInstructionRow[]> {
  const { data, error } = await getPublicClient().from("ai_instructions").select("*").order("name")

  if (error) throw new Error(error.message)
  return (data ?? []) as unknown as AiInstructionRow[]
}

/**
 * Upsert an AI instruction (admin only).
 */
export async function upsertAiInstruction(
  instruction: AiInstructionInsert
): Promise<AiInstructionRow> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (getAdminClient() as any)
    .from("ai_instructions")
    .upsert(instruction, { onConflict: "name" })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as AiInstructionRow
}

// ── Changelog queries ───────────────────────────────────────────────

/**
 * Get all changelog entries, most recent first.
 */
export async function getChangelogEntries(): Promise<ChangelogRow[]> {
  const { data, error } = await getPublicClient()
    .from("changelog")
    .select("*")
    .order("released_at", { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []) as unknown as ChangelogRow[]
}

/**
 * Get a single changelog entry by version.
 */
export async function getChangelogByVersion(version: string): Promise<ChangelogRow | null> {
  const { data, error } = await getPublicClient()
    .from("changelog")
    .select("*")
    .eq("version", version)
    .single()

  if (error) {
    if (error.code === "PGRST116") return null
    throw new Error(error.message)
  }
  return data as unknown as ChangelogRow
}

/**
 * Get the latest released version string.
 */
export async function getLatestVersion(): Promise<string | null> {
  const { data, error } = await getPublicClient()
    .from("changelog")
    .select("version")
    .order("released_at", { ascending: false })
    .limit(1)
    .single()

  if (error) {
    if (error.code === "PGRST116") return null
    throw new Error(error.message)
  }
  return (data as unknown as { version: string } | null)?.version ?? null
}

/**
 * Upsert a changelog entry (admin only).
 */
export async function upsertChangelog(entry: ChangelogInsert): Promise<ChangelogRow> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (getAdminClient() as any)
    .from("changelog")
    .upsert(entry, { onConflict: "version" })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as ChangelogRow
}

// ── Component version queries ───────────────────────────────────────

/**
 * Get version history for a component, most recent first.
 */
export async function getComponentVersions(componentName: string): Promise<ComponentVersionRow[]> {
  const { data, error } = await getPublicClient()
    .from("component_versions")
    .select("*")
    .eq("component_name", componentName)
    .order("released_at", { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []) as unknown as ComponentVersionRow[]
}

/**
 * Get a specific component version.
 */
export async function getComponentVersion(
  componentName: string,
  version: string
): Promise<ComponentVersionRow | null> {
  const { data, error } = await getPublicClient()
    .from("component_versions")
    .select("*")
    .eq("component_name", componentName)
    .eq("version", version)
    .single()

  if (error) {
    if (error.code === "PGRST116") return null
    throw new Error(error.message)
  }
  return data as unknown as ComponentVersionRow
}

// ── Design token queries (from nyuchi-tokens component) ─────────────

/**
 * Get the design tokens payload from the nyuchi-tokens component's source_code.
 *
 * In the migrated schema, design tokens (minerals, semantic colors, typography,
 * spacing, radii) live as a JSON payload in `components.source_code` where
 * `name = 'nyuchi-tokens'` — not in the legacy brand_* tables.
 *
 * Returns null if the component row is missing or source_code doesn't parse.
 */
export async function getDesignTokens(): Promise<DesignTokens | null> {
  const { data, error } = await getPublicClient()
    .from("components")
    .select("source_code")
    .eq("name", "nyuchi-tokens")
    .single()

  if (error) {
    if (error.code === "PGRST116") return null
    throw new Error(error.message)
  }

  const source = (data as unknown as { source_code: string | null } | null)?.source_code
  if (!source) return null

  try {
    return JSON.parse(source) as DesignTokens
  } catch {
    return null
  }
}

// ── Layer summary query ─────────────────────────────────────────────

export interface LayerSummary {
  layer: string
  total: number
  byCategory: Record<string, number>
  components: Array<{ name: string; category: string | null; description: string }>
}

/**
 * Get a summary of components in a given architecture layer.
 * Used by the MCP server's get_layer_summary tool.
 */
export async function getLayerSummary(layer: string): Promise<LayerSummary> {
  const components = await getComponentsByLayer(layer)

  const byCategory: Record<string, number> = {}
  for (const c of components) {
    const key = c.category ?? "uncategorized"
    byCategory[key] = (byCategory[key] ?? 0) + 1
  }

  return {
    layer,
    total: components.length,
    byCategory,
    components: components.map((c) => ({
      name: c.name,
      category: c.category,
      description: c.description,
    })),
  }
}

// ── Component links (RPC wrapper) ───────────────────────────────────

export interface ComponentLink {
  url: string
  kind: string
  title?: string
}

/**
 * Get portal URLs for a component via the Supabase RPC `get_component_links`.
 * Falls back to canonical portal URLs if the RPC is not available.
 */
export async function getComponentLinks(name: string): Promise<ComponentLink[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (getPublicClient() as any).rpc("get_component_links", {
    component_name: name,
  })

  if (!error && Array.isArray(data)) {
    return data as ComponentLink[]
  }

  // Fallback: canonical URL pattern for the portal
  return [
    { url: `https://design.nyuchi.com/components/${name}`, kind: "portal" },
    { url: `https://design.nyuchi.com/api/v1/ui/${name}`, kind: "api" },
  ]
}

// ── 3D Frontend Architecture — issue #46 (`architecture_frontend_*`) ──
//
// The `architecture_frontend_layers` (10 rows) and `architecture_frontend_axes`
// (5 rows) tables are the source of truth for the 3D architecture explorer.
// No in-code fallback dataset is kept — per doctrine, the DB is the only
// source of truth and seeding happens out-of-band. Callers must tolerate
// an empty array and render an empty state.

/**
 * Live fetch from `architecture_frontend_axes`. Returns an empty array if
 * Supabase isn't configured or the table is empty — the DB is the single
 * source of truth and callers must tolerate an empty response.
 */
export async function getArchitectureFrontendAxes(): Promise<ArchitectureFrontendAxisRow[]> {
  if (!isSupabaseConfigured()) return []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (getPublicClient() as any)
    .from("architecture_frontend_axes")
    .select("*")
    .order("sort_order", { ascending: true })

  if (error || !Array.isArray(data)) return []
  return data as ArchitectureFrontendAxisRow[]
}

/**
 * Live fetch from `architecture_frontend_layers`. Returns an empty array
 * if Supabase isn't configured or the table is empty.
 */
export async function getArchitectureFrontendLayers(): Promise<ArchitectureFrontendLayerRow[]> {
  if (!isSupabaseConfigured()) return []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (getPublicClient() as any)
    .from("architecture_frontend_layers")
    .select("*")
    .order("layer_number", { ascending: true })

  if (error || !Array.isArray(data)) return []
  return data as ArchitectureFrontendLayerRow[]
}

/**
 * Per-axis summary with live `layer_count` and `component_count` joins.
 * Wraps the `get_axes_summary()` SQL helper.
 */
export async function getAxesSummary(): Promise<AxisSummaryRow[]> {
  if (!isSupabaseConfigured()) return []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (getPublicClient() as any).rpc("get_axes_summary")
  if (error || !Array.isArray(data)) return []
  return data as AxisSummaryRow[]
}

/**
 * Single-layer detail (covenant, stakeholder, implementation rules,
 * category breakdown). Wraps `get_layer_detail(p_layer_number int)`.
 * Returns null if the layer number is out of range.
 */
export async function getLayerDetail(layerNumber: number): Promise<LayerDetailRow | null> {
  if (!isSupabaseConfigured()) return null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (getPublicClient() as any).rpc("get_layer_detail", {
    p_layer_number: layerNumber,
  })
  if (error || !Array.isArray(data) || data.length === 0) return null
  return data[0] as LayerDetailRow
}

/**
 * Full architecture snapshot — every axis with its layers, covenants,
 * stakeholders, implementation rules, and live component counts.
 * Wraps `get_architecture()` and reshapes the flat row set into a
 * nested `axes[].layers[]` structure for client consumption.
 */
export async function getArchitectureSnapshot(): Promise<ArchitectureSnapshotAxis[]> {
  if (!isSupabaseConfigured()) return []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (getPublicClient() as any).rpc("get_architecture")
  if (error || !Array.isArray(data)) return []

  type Row = {
    axis_name: string
    axis_title: string
    axis_description: string
    axis_geometry: string
    axis_metaphor: string
    axis_sort_order: number
    layer_number: number
    layer_sub_label: string
    layer_title: string
    layer_role: string
    layer_description: string
    layer_covenant: string
    layer_stakeholder: string
    layer_implementation_rules: string[]
    layer_sort_order: number
    component_count: number
    stable_count: number
    alpha_count: number
    deprecated_count: number
  }

  const byAxis = new Map<string, ArchitectureSnapshotAxis>()
  for (const row of data as Row[]) {
    let axis = byAxis.get(row.axis_name)
    if (!axis) {
      axis = {
        name: row.axis_name,
        title: row.axis_title,
        description: row.axis_description,
        geometry: row.axis_geometry,
        metaphor: row.axis_metaphor,
        sort_order: row.axis_sort_order,
        layers: [],
      }
      byAxis.set(row.axis_name, axis)
    }
    const layer: ArchitectureSnapshotLayer = {
      layer_number: row.layer_number,
      sub_label: row.layer_sub_label,
      title: row.layer_title,
      role: row.layer_role,
      description: row.layer_description,
      covenant: row.layer_covenant,
      stakeholder: row.layer_stakeholder,
      implementation_rules: row.layer_implementation_rules ?? [],
      sort_order: row.layer_sort_order,
      component_count: row.component_count,
      stable_count: row.stable_count,
      alpha_count: row.alpha_count,
      deprecated_count: row.deprecated_count,
    }
    axis.layers.push(layer)
  }

  return Array.from(byAxis.values()).sort((a, b) => a.sort_order - b.sort_order)
}

// ── Skills — issue #54 / #58 (FRD-15 Part A, `skills` table) ────────
//
// Agent-skill MDX bodies. Three RPC helpers in Supabase:
//   list_skills()           returns the index without body_mdx
//   get_skill(name)          returns one row including body_mdx
//   get_skills_summary()     returns the index without body_mdx (alias)

/**
 * Live fetch of all skills via the `list_skills()` RPC. Returns an empty
 * array if Supabase isn't configured. Body MDX is omitted — use
 * {@link getSkill} when the full body is needed.
 */
export async function listSkills(): Promise<SkillSummary[]> {
  if (!isSupabaseConfigured()) return []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (getPublicClient() as any).rpc("list_skills")
  if (error || !Array.isArray(data)) return []
  return data as SkillSummary[]
}

/**
 * Lightweight summary list (same shape as {@link listSkills}). Wraps the
 * `get_skills_summary()` SQL helper.
 */
export async function getSkillsSummary(): Promise<SkillSummary[]> {
  if (!isSupabaseConfigured()) return []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (getPublicClient() as any).rpc("get_skills_summary")
  if (error || !Array.isArray(data)) return []
  return data as SkillSummary[]
}

/**
 * Fetch a single skill (with full `body_mdx`) via `get_skill(name)`.
 * Returns null when Supabase isn't configured or the row is missing.
 */
export async function getSkill(name: string): Promise<SkillRow | null> {
  if (!isSupabaseConfigured()) return null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (getPublicClient() as any).rpc("get_skill", { p_name: name })
  if (error || !Array.isArray(data) || data.length === 0) return null
  return data[0] as SkillRow
}

// ── Ubuntu doctrine — issue #45 (`ubuntu_pillars`, `ubuntu_principles`) ──
//
// Two tables, five rows each. Tables are canonical; seeding is out-of-band.
// Callers must tolerate an empty array and render an empty state.

/**
 * Live fetch from `ubuntu_pillars`. Returns an empty array if Supabase
 * isn't configured or the table is empty.
 */
export async function getUbuntuPillars(): Promise<UbuntuPillarRow[]> {
  if (!isSupabaseConfigured()) return []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (getPublicClient() as any)
    .from("ubuntu_pillars")
    .select("*")
    .order("sort_order", { ascending: true })

  if (error || !Array.isArray(data)) return []
  return data as UbuntuPillarRow[]
}

/**
 * Live fetch from `ubuntu_principles`. Returns an empty array if Supabase
 * isn't configured or the table is empty.
 */
export async function getUbuntuPrinciples(): Promise<UbuntuPrincipleRow[]> {
  if (!isSupabaseConfigured()) return []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (getPublicClient() as any)
    .from("ubuntu_principles")
    .select("*")
    .order("sort_order", { ascending: true })

  if (error || !Array.isArray(data)) return []
  return data as UbuntuPrincipleRow[]
}
