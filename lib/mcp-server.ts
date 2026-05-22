/**
 * Mzizi MCP Server
 *
 * Configures the McpServer instance with all tools and resources.
 * Served via the HTTP endpoint at /mcp (app/mcp/route.ts).
 *
 * All data is read from Supabase — zero hardcoded content.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import {
  getAllComponents,
  getComponent,
  getComponentWithDocs,
  searchComponents,
  getDatabaseInfo,
  getBrandSystem,
  getMinerals,
  getSemanticColors,
  getArchitecturePrinciples,
  getFrameworkDecision,
  getLocalDataLayer,
  getCloudLayer,
  getPipeline,
  getDataOwnership,
  getSovereignty,
  getRemovedTechnologies,
  getDesignTokens,
  getLayerSummary,
  getAiInstruction,
  getAiInstructionByTarget,
  getComponentLinks,
  getChangelogEntries,
  getChangelogByVersion,
  getComponentVersions,
  getArchitectureFrontendAxes,
  getArchitectureFrontendLayers,
  getArchitectureSnapshot,
  getAxesSummary,
  getLayerDetail,
  getSkill,
  listSkills,
  getUbuntuPillars,
  getUbuntuPrinciples,
} from "@/lib/db"
import { getUsageStats, trackMcpTool } from "@/lib/metrics"

// ─── System prompt cache (60s TTL) ─────────────────────────────────────────

const SYSTEM_PROMPT_NAME = "nyuchi-mcp-system-prompt"
const SYSTEM_PROMPT_TTL_MS = 60_000

let cachedSystemPrompt: { value: string | undefined; expiresAt: number } | null = null

/**
 * Load the MCP system prompt from the ai_instructions table with a 60s TTL.
 *
 * Each POST /mcp request creates a fresh transport/server pair (stateless) —
 * without caching, every request would hit Supabase. The cache keeps cold-call
 * latency bounded while still picking up prompt edits within a minute.
 */
async function loadSystemPrompt(): Promise<string | undefined> {
  const now = Date.now()
  if (cachedSystemPrompt && cachedSystemPrompt.expiresAt > now) {
    return cachedSystemPrompt.value
  }

  try {
    const instruction = await getAiInstruction(SYSTEM_PROMPT_NAME)
    const value = instruction?.content
    cachedSystemPrompt = { value, expiresAt: now + SYSTEM_PROMPT_TTL_MS }
    return value
  } catch {
    // On failure, short-lived negative cache so we don't hammer Supabase.
    cachedSystemPrompt = { value: undefined, expiresAt: now + 5_000 }
    return undefined
  }
}

// ─── Dependency inference (for scaffold output) ────────────────────────────

/**
 * Infer npm dependencies from component source code. Treats path-aliased
 * imports (anything starting with `@/` or `./` or `../`) as local — so icons
 * imported from `@/lib/icons` do NOT surface as `lucide-react` in the scaffold
 * output.
 */
export function inferDependencies(sourceCode: string): string[] {
  const deps = new Set<string>()
  const importRegex = /import\s+(?:[^'"]*?from\s+)?['"]([^'"]+)['"]/g
  let match: RegExpExecArray | null
  while ((match = importRegex.exec(sourceCode)) !== null) {
    const specifier = match[1]
    // Skip local imports — path aliases and relative paths
    if (
      specifier.startsWith("@/") ||
      specifier.startsWith("./") ||
      specifier.startsWith("../") ||
      specifier.startsWith("/")
    ) {
      continue
    }
    // Scoped packages keep both segments; unscoped take the first path segment
    const pkg = specifier.startsWith("@")
      ? specifier.split("/").slice(0, 2).join("/")
      : specifier.split("/")[0]
    deps.add(pkg)
  }
  return Array.from(deps).sort()
}

// ─── Server Factory ────────────────────────────────────────────────────────

/**
 * Creates and configures the Mzizi MCP server with all tools and resources.
 *
 * Async because the server's system prompt is loaded from the `ai_instructions`
 * Supabase table (with a 60s TTL cache). See `loadSystemPrompt()`.
 */
export async function createMukokoMcpServer(): Promise<McpServer> {
  const instructions = await loadSystemPrompt()
  const server = new McpServer(
    {
      name: "mzizi",
      version: "4.0.39",
    },
    instructions ? { instructions } : undefined
  )

  // ─── Resources ───────────────────────────────────────────────────────

  server.resource(
    "registry",
    "mukoko://registry",
    { description: "Full Mukoko component registry index" },
    async () => {
      const components = await getAllComponents()
      const items = components.map((c) => ({
        name: c.name,
        type: c.registry_type,
        description: c.description,
        dependencies: c.dependencies,
        registryDependencies: c.registry_dependencies,
      }))
      return {
        contents: [
          {
            uri: "mukoko://registry",
            mimeType: "application/json",
            text: JSON.stringify(
              {
                $schema: "https://ui.shadcn.com/schema/registry.json",
                name: "mukoko",
                homepage: "https://mzizi.dev",
                items,
              },
              null,
              2
            ),
          },
        ],
      }
    }
  )

  server.resource(
    "brand",
    "mukoko://brand",
    { description: "Complete Mukoko brand system — minerals, typography, spacing, ecosystem" },
    async () => {
      const brand = await getBrandSystem()
      return {
        contents: [
          {
            uri: "mukoko://brand",
            mimeType: "application/json",
            text: JSON.stringify(brand, null, 2),
          },
        ],
      }
    }
  )

  server.resource(
    "design-tokens",
    "mukoko://design-tokens",
    { description: "Five African Minerals palette and semantic color tokens" },
    async () => {
      const [minerals, semanticColors] = await Promise.all([getMinerals(), getSemanticColors()])
      return {
        contents: [
          {
            uri: "mukoko://design-tokens",
            mimeType: "application/json",
            text: JSON.stringify({ minerals, semanticColors }, null, 2),
          },
        ],
      }
    }
  )

  server.resource(
    "architecture",
    "mukoko://architecture",
    { description: "Mukoko ecosystem architecture, data layer, and sovereignty information" },
    async () => {
      const [principles, framework, localData, cloud, pipeline, ownership, sovereignty, removed] =
        await Promise.all([
          getArchitecturePrinciples(),
          getFrameworkDecision(),
          getLocalDataLayer(),
          getCloudLayer(),
          getPipeline(),
          getDataOwnership(),
          getSovereignty(),
          getRemovedTechnologies(),
        ])
      return {
        contents: [
          {
            uri: "mukoko://architecture",
            mimeType: "application/json",
            text: JSON.stringify(
              {
                principles,
                frameworkDecision: framework,
                localDataLayer: localData,
                cloudLayer: cloud,
                pipeline,
                dataOwnership: ownership,
                sovereignty,
                removedTechnologies: removed,
              },
              null,
              2
            ),
          },
        ],
      }
    }
  )

  server.resource(
    "ubuntu",
    "mukoko://ubuntu",
    {
      description: "Ubuntu philosophy and community-first design doctrine for the bundu ecosystem",
    },
    async () => {
      const ubuntuData = {
        philosophy: {
          principle: "Umuntu ngumuntu ngabantu — A person is a person through other persons.",
          origin:
            "Nguni Bantu — rooted in Zulu, Ndebele, Xhosa, and related Southern African languages",
          meaning:
            "Ubuntu describes the essence of being human: humanity, dignity, communal interdependence, and shared prosperity. It is not merely a philosophy but a lived behavioural framework.",
          aiFraming:
            "AI systems in the bundu ecosystem operate in the Ubuntu tradition: community-first, dignity-centred, context-aware, and locally grounded.",
        },
        designPrinciples: [
          {
            title: "Shared devices",
            description:
              "Design for multiple family members on one account — not individual user isolation. Account switching, family profiles, and shared history are first-class features.",
          },
          {
            title: "Outdoor readability",
            description:
              "High contrast (APCA Lc 90+ for body text), large touch targets (56px default), sun-readable colour choices. Users are in markets, fields, and streets — not air-conditioned offices.",
          },
          {
            title: "Intermittent connectivity",
            description:
              "Offline-first architecture. Graceful degradation. Every action that can be queued locally must be. Connectivity is a gift, not a given.",
          },
          {
            title: "Budget hardware",
            description:
              "Performance budget: 100KB JS, 3G-optimised, <3s TTI on mid-range Android. The flagship experience must work on a Tecno Spark.",
          },
          {
            title: "All ages and literacy levels",
            description:
              "No age-gate assumptions. Iconography supplements text. Voice input is a peer-class interaction method. Swahili, Shona, Ndebele, and English are all valid primary languages.",
          },
          {
            title: "Community data ownership",
            description:
              "Individual data belongs to the individual and their community. No dark patterns. Data portability is non-negotiable. The community's aggregate data benefits the community first.",
          },
        ],
        communityFirst: {
          description:
            "Every feature decision asks: does this benefit the community, or just the individual? Does it strengthen relationships, or fragment them?",
          examples: [
            "Shared watchlists (nhimbe events) — 'who else is going?' over 'my tickets'",
            "Group weather summaries (mukoko-weather) — 'your farming area' over 'your personal forecast'",
            "Community marketplace trust scores — built on social proof, not anonymous ratings",
          ],
        },
        aiResponseStyle: [
          "Frame benefits in terms of community and shared prosperity — not individual gain",
          "Use local examples (Zimbabwe, Southern Africa, East Africa) where relevant",
          "Respect elders, family structures, and communal decision-making patterns",
          "Avoid individualist framing: prefer 'you and your community' over 'you personally'",
          "Acknowledge that multiple languages coexist — Shona, Ndebele, and English are all valid primary languages",
          "Do not assume Western infrastructure: credit cards, fast broadband, and single-user households are not universal",
        ],
        languages: {
          primary: ["English (en-ZW)", "Shona (sn)", "Ndebele (nd)"],
          supported: ["Zulu (zu)", "Sotho (st)", "Swahili (sw)", "Chewa (ny)"],
          note: "All user-facing text should be designed for localisation. String externalisation is required from day one.",
        },
      }

      return {
        contents: [
          {
            uri: "mukoko://ubuntu",
            mimeType: "application/json",
            text: JSON.stringify(ubuntuData, null, 2),
          },
        ],
      }
    }
  )

  // ─── Tools ───────────────────────────────────────────────────────────

  function toolError(context: string, err: unknown) {
    const message = err instanceof Error ? err.message : JSON.stringify(err)
    return {
      content: [{ type: "text" as const, text: `${context}: ${message}` }],
      isError: true as const,
    }
  }

  server.tool(
    "list_components",
    "List Mzizi components. Filter by registry type (ui/hook/lib) and/or category.",
    {
      type: z
        .enum(["all", "registry:ui", "registry:hook", "registry:lib", "registry:block"])
        .default("all")
        .describe("Filter by registry type"),
      category: z
        .string()
        .optional()
        .describe(
          "Filter by category (e.g. 'forms', 'overlay', 'navigation', 'data-display', 'layout', 'feedback', 'action', 'ai', 'chat', 'calendar', 'developer', 'security', 'ecommerce', 'mukoko')"
        ),
    },
    async ({ type, category }) => {
      const start = Date.now()
      try {
        const components = await getAllComponents()

        let items = type === "all" ? components : components.filter((c) => c.registry_type === type)

        if (category) {
          const lower = category.toLowerCase()
          items = items.filter((c) => c.category?.toLowerCase().includes(lower))
        }

        const summary = items.map((c) => ({
          name: c.name,
          type: c.registry_type,
          category: c.category,
          description: c.description,
          dependencies: c.dependencies,
          registryDependencies: c.registry_dependencies,
          installCommand: `npx shadcn@latest add https://mzizi.dev/api/v1/ui/${c.name}`,
        }))

        trackMcpTool({ toolName: "list_components", durationMs: Date.now() - start })
        return {
          content: [{ type: "text" as const, text: JSON.stringify(summary, null, 2) }],
        }
      } catch (err) {
        trackMcpTool({ toolName: "list_components", durationMs: Date.now() - start, isError: true })
        return toolError("Failed to list components", err)
      }
    }
  )

  server.tool(
    "get_component",
    "Get a component's full source code, metadata, and dependencies from the Mzizi.",
    {
      name: z.string().describe("Component name (e.g., 'button', 'card', 'use-toast')"),
      include_docs: z
        .boolean()
        .default(false)
        .describe("Include documentation, use cases, and examples"),
    },
    async ({ name, include_docs }) => {
      const start = Date.now()
      try {
        const component = include_docs ? await getComponentWithDocs(name) : await getComponent(name)

        if (!component) {
          const all = await getAllComponents()
          const available = all.map((c) => c.name).join(", ")
          trackMcpTool({
            toolName: "get_component",
            durationMs: Date.now() - start,
            componentName: name,
            isError: true,
          })
          return {
            content: [
              {
                type: "text" as const,
                text: `Component "${name}" not found. Available: ${available}`,
              },
            ],
            isError: true,
          }
        }

        // Source code is stored in Supabase; no disk fallback post-v4.0.26.
        const sourceCode = component.source_code ?? null

        const result: Record<string, unknown> = {
          name: component.name,
          type: component.registry_type,
          category: component.category,
          description: component.description,
          dependencies: component.dependencies,
          registryDependencies: component.registry_dependencies,
          files: component.files,
          tags: component.tags,
          sourceCode,
          installCommand: `npx shadcn@latest add https://mzizi.dev/api/v1/ui/${component.name}`,
        }

        if (include_docs && "docs" in component && component.docs) {
          result.docs = component.docs
        }

        trackMcpTool({
          toolName: "get_component",
          durationMs: Date.now() - start,
          componentName: name,
        })
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        }
      } catch (err) {
        trackMcpTool({
          toolName: "get_component",
          durationMs: Date.now() - start,
          componentName: name,
          isError: true,
        })
        return toolError(`Failed to get component "${name}"`, err)
      }
    }
  )

  server.tool(
    "get_component_docs",
    "Get detailed documentation for a component: use cases, variants, accessibility notes, and code examples.",
    {
      name: z.string().describe("Component name (e.g., 'button', 'dialog', 'data-table')"),
    },
    async ({ name }) => {
      try {
        const component = await getComponentWithDocs(name)

        if (!component) {
          return {
            content: [{ type: "text" as const, text: `Component "${name}" not found.` }],
            isError: true,
          }
        }

        if (!component.docs) {
          return {
            content: [
              {
                type: "text" as const,
                text: JSON.stringify(
                  {
                    name: component.name,
                    description: component.description,
                    message: "No extended documentation available for this component.",
                    installCommand: `npx shadcn@latest add https://mzizi.dev/api/v1/ui/${component.name}`,
                  },
                  null,
                  2
                ),
              },
            ],
          }
        }

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  name: component.name,
                  description: component.description,
                  ...component.docs,
                  installCommand: `npx shadcn@latest add https://mzizi.dev/api/v1/ui/${component.name}`,
                },
                null,
                2
              ),
            },
          ],
        }
      } catch (err) {
        return toolError(`Failed to get docs for "${name}"`, err)
      }
    }
  )

  server.tool(
    "search_components",
    "Search Mzizi components by name or description keyword.",
    {
      query: z.string().describe("Search query to match against component names and descriptions"),
      type: z
        .enum(["all", "registry:ui", "registry:hook", "registry:lib", "registry:block"])
        .default("all")
        .describe("Filter results by registry type"),
    },
    async ({ query, type }) => {
      try {
        // Use DB-level ilike search for accuracy
        let matches = await searchComponents(query)

        if (type !== "all") {
          matches = matches.filter((c) => c.registry_type === type)
        }

        if (matches.length === 0) {
          return {
            content: [{ type: "text" as const, text: `No components found matching "${query}".` }],
          }
        }

        const results = matches.map((c) => ({
          name: c.name,
          type: c.registry_type,
          category: c.category,
          description: c.description,
          installCommand: `npx shadcn@latest add https://mzizi.dev/api/v1/ui/${c.name}`,
        }))

        return {
          content: [{ type: "text" as const, text: JSON.stringify(results, null, 2) }],
        }
      } catch (err) {
        return toolError(`Failed to search components for "${query}"`, err)
      }
    }
  )

  server.tool(
    "get_design_tokens",
    "Get Mukoko design tokens: Five African Minerals palette, semantic colors, typography, spacing, or radii.",
    {
      category: z
        .enum(["minerals", "semantic-colors", "typography", "spacing", "radii", "all"])
        .default("all")
        .describe("Token category to retrieve"),
    },
    async ({ category }) => {
      // Prefer tokens from the `nyuchi-tokens` component.source_code JSON.
      // Fall back to the legacy brand_* tables if the migrated row is missing.
      const tokens = await getDesignTokens()
      const brand = tokens ? null : await getBrandSystem()

      if (!tokens && !brand) {
        return {
          content: [
            {
              type: "text" as const,
              text: "Design tokens not available. Ensure the `nyuchi-tokens` component is seeded.",
            },
          ],
          isError: true,
        }
      }

      const source = (tokens ?? brand) as Record<string, unknown>
      const data: Record<string, unknown> = {}
      if (category === "all" || category === "minerals") data.minerals = source.minerals
      if (category === "all" || category === "semantic-colors")
        data.semanticColors =
          source.semanticColors ?? (source as { semantic_colors?: unknown }).semantic_colors
      if (category === "all" || category === "typography") data.typography = source.typography
      if (category === "all" || category === "spacing") data.spacing = source.spacing
      if (category === "all" || category === "radii")
        data.radii =
          (source as { radii?: unknown }).radii ??
          (source as { meta?: { radii?: unknown } }).meta?.radii

      return {
        content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
      }
    }
  )

  server.tool(
    "scaffold_component",
    "Generate a new Mukoko UI component following the CVA + Radix + cn() pattern.",
    {
      name: z.string().describe("Component name in kebab-case (e.g., 'status-badge')"),
      description: z.string().describe("One-line description of the component"),
      variants: z.array(z.string()).optional().describe("Visual variant names"),
      sizes: z.array(z.string()).optional().describe("Size variant names"),
      hasRadix: z
        .boolean()
        .default(false)
        .describe("Whether the component uses Radix UI primitives"),
      isClient: z
        .boolean()
        .default(false)
        .describe("Whether the component needs 'use client' directive"),
    },
    async ({ name, description, variants, sizes, hasRadix, isClient }) => {
      const pascalName = name
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join("")

      const camelVariants = name.replace(/-./g, (x) => x[1].toUpperCase())
      const variantEntries = (variants || ["default"]).map((v) => `        ${v}: "",`).join("\n")
      const sizeEntries = (sizes || ["default"]).map((s) => `        ${s}: "",`).join("\n")

      const imports = [
        'import * as React from "react"',
        'import { cva, type VariantProps } from "class-variance-authority"',
      ]
      if (hasRadix) imports.push('import { Slot } from "radix-ui"')
      imports.push("", 'import { cn } from "@/lib/utils"')

      const source = `${isClient ? '"use client"\n\n' : ""}${imports.join("\n")}

const ${camelVariants}Variants = cva(
  "inline-flex items-center justify-center",
  {
    variants: {
      variant: {
${variantEntries}
      },
      size: {
${sizeEntries}
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
)

function ${pascalName}({
  className,
  variant,
  size,${hasRadix ? "\n  asChild = false," : ""}
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof ${camelVariants}Variants>${hasRadix ? " & { asChild?: boolean }" : ""}) {${hasRadix ? '\n  const Comp = asChild ? Slot.Root : "div"' : ""}

  return (
    <${hasRadix ? "Comp" : "div"}
      data-slot="${name}"
      className={cn(${camelVariants}Variants({ variant, size, className }))}
      {...props}
    />
  )
}

export { ${pascalName}, ${camelVariants}Variants }
`

      const dependencies = inferDependencies(source)

      return {
        content: [
          {
            type: "text" as const,
            text: `## ${pascalName}\n\n\`\`\`tsx\n${source}\`\`\`\n\n### Registry Entry\n\n\`\`\`json\n${JSON.stringify({ name, type: "registry:ui", description, dependencies, files: [{ path: `components/ui/${name}.tsx`, type: "registry:ui" }] }, null, 2)}\n\`\`\`\n\n### Next Steps\n1. Create \`components/ui/${name}.tsx\` with the code above\n2. Upsert into the \`components\` Supabase table (name, registry_type, description, source_code, dependencies)\n3. Verify: \`curl http://localhost:3000/api/v1/ui/${name}\`\n\n### Ubuntu Design Checklist\n- [ ] Touch target ≥ 56px (h-14) default, ≥ 48px (h-12) minimum — outdoor use, all ages\n- [ ] APCA contrast Lc 90+ for body text against both light (#FAF9F5) and dark (#0A0A0A) backgrounds\n- [ ] Designed for shared devices — avoid personal-only state assumptions\n- [ ] Works at 3G speeds — no heavy dependencies unless necessary\n- [ ] All strings externalisable for Shona/Ndebele/English localisation\n- [ ] Community-first framing — benefits the group, not just the individual`,
          },
        ],
      }
    }
  )

  server.tool(
    "get_install_command",
    "Get the shadcn CLI install command for one or more Mukoko components.",
    {
      components: z.array(z.string()).describe("Component names to install"),
    },
    async ({ components: requested }) => {
      try {
        const all = await getAllComponents()
        const names = new Set(all.map((c) => c.name))
        const valid = requested.filter((n) => names.has(n))
        const invalid = requested.filter((n) => !names.has(n))

        let text = ""
        if (valid.length > 0) {
          text += valid
            .map((n) => `npx shadcn@latest add https://mzizi.dev/api/v1/ui/${n}`)
            .join("\n")
        }
        if (invalid.length > 0) {
          text += `\n\nNot found: ${invalid.join(", ")}`
        }

        return { content: [{ type: "text" as const, text }] }
      } catch (err) {
        return toolError("Failed to get install commands", err)
      }
    }
  )

  server.tool(
    "get_brand_info",
    "Get information about a specific Mukoko ecosystem brand (bundu, nyuchi, mukoko, shamwari, nhimbe).",
    {
      brand: z.string().describe("Brand name"),
    },
    async ({ brand: brandName }) => {
      // Prefer the migrated `nyuchi-tokens` row; fall back to legacy brand_* tables.
      const tokens = await getDesignTokens()
      const brandData =
        (tokens as {
          ecosystem?: Array<{ name: string; mineral?: string; [k: string]: unknown }>
          minerals?: Array<{ name: string; [k: string]: unknown }>
        } | null) ?? (await getBrandSystem())

      const ecosystem = (
        brandData as { ecosystem?: Array<{ name: string; mineral?: string }> } | null
      )?.ecosystem
      const minerals = (brandData as { minerals?: Array<{ name: string }> } | null)?.minerals

      if (!ecosystem || !Array.isArray(ecosystem)) {
        return {
          content: [
            {
              type: "text" as const,
              text: "Brand ecosystem not available. Ensure nyuchi-tokens or the brand_* tables are seeded.",
            },
          ],
          isError: true,
        }
      }

      const found = ecosystem.find((b) => b.name === brandName.toLowerCase())

      if (!found) {
        const available = ecosystem.map((b) => b.name).join(", ")
        return {
          content: [
            {
              type: "text" as const,
              text: `Brand "${brandName}" not found. Available: ${available}`,
            },
          ],
          isError: true,
        }
      }

      const mineral = minerals?.find((m) => m.name === found.mineral)
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({ ...found, mineralDetails: mineral }, null, 2),
          },
        ],
      }
    }
  )

  server.tool(
    "get_architecture_info",
    "Get Mukoko ecosystem architecture information: principles, data layer, pipeline, or sovereignty details.",
    {
      category: z
        .enum([
          "principles",
          "framework",
          "local-data-layer",
          "cloud-layer",
          "open-data-pipeline",
          "data-ownership",
          "sovereignty",
          "removed",
          "all",
        ])
        .describe("Architecture category to retrieve"),
    },
    async ({ category }) => {
      try {
        const fetchMap: Record<string, () => Promise<unknown>> = {
          principles: () => getArchitecturePrinciples(),
          framework: () => getFrameworkDecision(),
          "local-data-layer": () => getLocalDataLayer(),
          "cloud-layer": () => getCloudLayer(),
          "open-data-pipeline": () => getPipeline(),
          "data-ownership": () => getDataOwnership(),
          sovereignty: () => getSovereignty(),
          removed: () => getRemovedTechnologies(),
        }

        if (category === "all") {
          const results = await Promise.all(
            Object.entries(fetchMap).map(async ([key, fn]) => [key, await fn()])
          )
          const data = Object.fromEntries(results)
          return {
            content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
          }
        }

        const data = await fetchMap[category]()
        return {
          content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
        }
      } catch (err) {
        return toolError("Failed to fetch architecture data", err)
      }
    }
  )

  server.tool(
    "get_ubuntu_doctrine",
    "Get the static Ubuntu philosophy doctrine for the bundu ecosystem — philosophy statement, design rules, community framing, AI framing, language stance. For the table-backed Five Pillars / Five Principles (structured rows) use get_ubuntu_pillars and get_ubuntu_principles instead.",
    {
      aspect: z
        .enum(["all", "philosophy", "design", "community", "ai-framing", "languages"])
        .default("all")
        .describe("Aspect of Ubuntu doctrine to retrieve"),
    },
    async ({ aspect }) => {
      const ubuntu = {
        philosophy: {
          principle: "Umuntu ngumuntu ngabantu — A person is a person through other persons.",
          origin: "Nguni Bantu (Zulu, Ndebele, Xhosa, Shona traditions)",
          meaning:
            "Ubuntu is the philosophical foundation of the bundu ecosystem. It defines how we build: community-first, dignity-centred, locally grounded.",
          aiFraming:
            "AI systems in the bundu ecosystem operate in the Ubuntu tradition: community benefit over individual optimisation, local context over universal assumptions, dignity as a non-negotiable baseline.",
        },
        design: [
          "Shared devices — design for families, not isolated individuals",
          "Outdoor readability — APCA Lc 90+ body text, 56px touch targets, sun-readable contrast",
          "Intermittent connectivity — offline-first, queue locally, sync when able",
          "Budget hardware — 100KB JS budget, 3G-optimised, Tecno Spark must work",
          "All ages — no age-gate assumptions, icons supplement text, voice is first-class",
          "Community data ownership — individual data benefits the community",
        ],
        community: {
          coreQuestion: "Does this feature benefit the community, or just the individual?",
          patterns: [
            "Group features over solo features",
            "Social proof over anonymous ratings",
            "Shared context over personal dashboards",
            "Local news over global feeds",
          ],
        },
        "ai-framing": [
          "Frame responses in terms of community and shared benefit",
          "Use local examples (Zimbabwe, Southern Africa) where relevant",
          "Respect communal decision-making: families and elders matter",
          "Do not assume Western infrastructure (credit cards, broadband, single-user households)",
          "Shona, Ndebele, and English are all valid primary languages — do not treat English as default",
          "Do not describe Africa as a monolith — specify countries and regions",
        ],
        languages: {
          primary: ["English (en-ZW)", "Shona (sn)", "Ndebele (nd)"],
          supported: ["Zulu (zu)", "Sotho (st)", "Swahili (sw)", "Chewa (ny)"],
          principle:
            "All UI must be designed for localisation from day one. String externalisation is required.",
        },
      }

      const result = aspect === "all" ? ubuntu : ubuntu[aspect as keyof typeof ubuntu]

      return {
        content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
      }
    }
  )

  server.tool(
    "get_ubuntu_pillars",
    "Get the Five Ubuntu Pillars from the ubuntu_pillars table — spheres in which Ubuntu is lived (e.g. family, community, language, spirituality, economy). Each pillar maps to a platform surface so the doctrine translates to software.",
    {},
    async () => {
      const start = Date.now()
      try {
        const rows = await getUbuntuPillars()
        trackMcpTool({ toolName: "get_ubuntu_pillars", durationMs: Date.now() - start })
        return {
          content: [{ type: "text" as const, text: JSON.stringify(rows, null, 2) }],
        }
      } catch (err) {
        return toolError("Failed to fetch Ubuntu pillars", err)
      }
    }
  )

  server.tool(
    "get_ubuntu_principles",
    "Get the Five Ubuntu Principles from the ubuntu_principles table — operating rules that translate Ubuntu to software engineering decisions. For the broader philosophy doctrine (design rules, community framing, languages) use get_ubuntu_doctrine.",
    {},
    async () => {
      const start = Date.now()
      try {
        const rows = await getUbuntuPrinciples()
        trackMcpTool({ toolName: "get_ubuntu_principles", durationMs: Date.now() - start })
        return {
          content: [{ type: "text" as const, text: JSON.stringify(rows, null, 2) }],
        }
      } catch (err) {
        return toolError("Failed to fetch Ubuntu principles", err)
      }
    }
  )

  server.tool(
    "get_architecture_frontend",
    "Get the 3D frontend architecture from the architecture_frontend_axes (5 rows) and architecture_frontend_layers (10 rows) tables. Returns axes (X, Y, Z, Outside, Documentation) and layers (L1 tokens .. L10 documentation) with the layer ↔ axis mapping.",
    {
      part: z
        .enum(["all", "axes", "layers"])
        .default("all")
        .describe("Which part of the 3D model to retrieve"),
    },
    async ({ part }) => {
      const start = Date.now()
      try {
        const [axes, layers] =
          part === "axes"
            ? [await getArchitectureFrontendAxes(), []]
            : part === "layers"
              ? [[], await getArchitectureFrontendLayers()]
              : await Promise.all([getArchitectureFrontendAxes(), getArchitectureFrontendLayers()])

        trackMcpTool({
          toolName: "get_architecture_frontend",
          durationMs: Date.now() - start,
        })

        const data = part === "axes" ? { axes } : part === "layers" ? { layers } : { axes, layers }

        return {
          content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
        }
      } catch (err) {
        return toolError("Failed to fetch frontend architecture", err)
      }
    }
  )

  server.tool(
    "get_architecture",
    "Full 3D-architecture snapshot — every axis with its layers, covenants, stakeholders, implementation rules, and live component counts. Single call powers the /architecture explorer page; uses get_architecture() SQL helper.",
    {},
    async () => {
      const start = Date.now()
      try {
        const axes = await getArchitectureSnapshot()
        trackMcpTool({ toolName: "get_architecture", durationMs: Date.now() - start })
        return {
          content: [{ type: "text" as const, text: JSON.stringify(axes, null, 2) }],
        }
      } catch (err) {
        trackMcpTool({
          toolName: "get_architecture",
          durationMs: Date.now() - start,
          isError: true,
        })
        return toolError("Failed to fetch architecture snapshot", err)
      }
    }
  )

  server.tool(
    "get_axes_summary",
    "Per-axis summary (5 rows: X-axis, Y-axis, Z-axis, Outside, Documentation) with live layer_count and component_count joins. Wraps get_axes_summary() SQL helper.",
    {},
    async () => {
      const start = Date.now()
      try {
        const axes = await getAxesSummary()
        trackMcpTool({ toolName: "get_axes_summary", durationMs: Date.now() - start })
        return {
          content: [{ type: "text" as const, text: JSON.stringify(axes, null, 2) }],
        }
      } catch (err) {
        trackMcpTool({
          toolName: "get_axes_summary",
          durationMs: Date.now() - start,
          isError: true,
        })
        return toolError("Failed to fetch axes summary", err)
      }
    }
  )

  server.tool(
    "get_layer_detail",
    "Single-layer detail (covenant, stakeholder, implementation rules, category breakdown). Used by the /architecture/layers/{n} page; wraps get_layer_detail(p_layer_number int).",
    {
      layer_number: z
        .number()
        .int()
        .min(1)
        .max(10)
        .describe("Layer number 1–10 (L1 tokens, L2 primitive, ..., L10 documentation)"),
    },
    async ({ layer_number }) => {
      const start = Date.now()
      try {
        const detail = await getLayerDetail(layer_number)
        if (!detail) {
          trackMcpTool({
            toolName: "get_layer_detail",
            durationMs: Date.now() - start,
            isError: true,
          })
          return {
            content: [{ type: "text" as const, text: `Layer ${layer_number} not found` }],
            isError: true,
          }
        }
        trackMcpTool({ toolName: "get_layer_detail", durationMs: Date.now() - start })
        return {
          content: [{ type: "text" as const, text: JSON.stringify(detail, null, 2) }],
        }
      } catch (err) {
        trackMcpTool({
          toolName: "get_layer_detail",
          durationMs: Date.now() - start,
          isError: true,
        })
        return toolError("Failed to fetch layer detail", err)
      }
    }
  )

  server.tool(
    "get_database_status",
    "Get the status and row counts for the Mzizi database.",
    {},
    async () => {
      const start = Date.now()
      try {
        const info = await getDatabaseInfo()
        trackMcpTool({ toolName: "get_database_status", durationMs: Date.now() - start })
        return {
          content: [{ type: "text" as const, text: JSON.stringify(info, null, 2) }],
        }
      } catch (err) {
        trackMcpTool({
          toolName: "get_database_status",
          durationMs: Date.now() - start,
          isError: true,
        })
        return toolError("Failed to get database status", err)
      }
    }
  )

  server.tool(
    "get_usage_stats",
    "Get public API and MCP usage statistics for Mzizi. Returns aggregate call counts, error rates, popular components, and daily trends. Data is open by design — CC BY 4.0.",
    {
      days: z
        .number()
        .int()
        .min(1)
        .max(90)
        .optional()
        .describe("Lookback period in days (1–90, default 30)"),
    },
    async ({ days = 30 }) => {
      const start = Date.now()
      try {
        const stats = await getUsageStats(days)
        trackMcpTool({ toolName: "get_usage_stats", durationMs: Date.now() - start })
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(stats, null, 2),
            },
          ],
        }
      } catch (err) {
        trackMcpTool({ toolName: "get_usage_stats", durationMs: Date.now() - start, isError: true })
        return toolError("Failed to get usage stats", err)
      }
    }
  )

  // ─── New tools (v4.0.26) ─────────────────────────────────────────────

  server.tool(
    "get_layer_summary",
    "Get a summary of components in a given architecture layer (1-10). Returns total count, per-category breakdown, and the full component list.",
    {
      layer: z
        .string()
        .describe(
          "Architecture layer identifier (e.g. '1', '2', '10'). See /docs/3d-architecture for the full layer model."
        ),
    },
    async ({ layer }) => {
      const start = Date.now()
      try {
        const summary = await getLayerSummary(layer)
        trackMcpTool({ toolName: "get_layer_summary", durationMs: Date.now() - start })
        return {
          content: [{ type: "text" as const, text: JSON.stringify(summary, null, 2) }],
        }
      } catch (err) {
        trackMcpTool({
          toolName: "get_layer_summary",
          durationMs: Date.now() - start,
          isError: true,
        })
        return toolError(`Failed to get summary for layer "${layer}"`, err)
      }
    }
  )

  server.tool(
    "get_ai_instructions",
    "Get the AI assistant instruction set for a given target (mcp-server, claude, github-copilot, cursor, etc.). Reads from the `ai_instructions` Supabase table.",
    {
      target: z
        .string()
        .describe("Target audience name or instruction name (e.g. 'claude', 'github-copilot')"),
    },
    async ({ target }) => {
      const start = Date.now()
      try {
        const instruction =
          (await getAiInstruction(target)) ?? (await getAiInstructionByTarget(target))

        if (!instruction) {
          trackMcpTool({
            toolName: "get_ai_instructions",
            durationMs: Date.now() - start,
            isError: true,
          })
          return {
            content: [{ type: "text" as const, text: `No AI instruction found for "${target}"` }],
            isError: true,
          }
        }

        trackMcpTool({ toolName: "get_ai_instructions", durationMs: Date.now() - start })
        return {
          content: [{ type: "text" as const, text: JSON.stringify(instruction, null, 2) }],
        }
      } catch (err) {
        trackMcpTool({
          toolName: "get_ai_instructions",
          durationMs: Date.now() - start,
          isError: true,
        })
        return toolError(`Failed to fetch AI instruction for "${target}"`, err)
      }
    }
  )

  server.tool(
    "get_component_links",
    "Get all portal URLs (docs, API, source) for a component, via the `get_component_links` Supabase RPC.",
    {
      name: z.string().describe("Component name"),
    },
    async ({ name }) => {
      const start = Date.now()
      try {
        const links = await getComponentLinks(name)
        trackMcpTool({
          toolName: "get_component_links",
          durationMs: Date.now() - start,
          componentName: name,
        })
        return {
          content: [{ type: "text" as const, text: JSON.stringify(links, null, 2) }],
        }
      } catch (err) {
        trackMcpTool({
          toolName: "get_component_links",
          durationMs: Date.now() - start,
          componentName: name,
          isError: true,
        })
        return toolError(`Failed to get links for "${name}"`, err)
      }
    }
  )

  server.tool(
    "get_changelog",
    "Get the release changelog. Returns a single entry if `version` is provided, otherwise the full history (most recent first).",
    {
      version: z
        .string()
        .optional()
        .describe("Specific release version (e.g. '4.0.39'). Omit to get the full history."),
    },
    async ({ version }) => {
      const start = Date.now()
      try {
        const payload = version ? await getChangelogByVersion(version) : await getChangelogEntries()

        if (version && !payload) {
          trackMcpTool({
            toolName: "get_changelog",
            durationMs: Date.now() - start,
            isError: true,
          })
          return {
            content: [{ type: "text" as const, text: `Version "${version}" not found` }],
            isError: true,
          }
        }

        trackMcpTool({ toolName: "get_changelog", durationMs: Date.now() - start })
        return {
          content: [{ type: "text" as const, text: JSON.stringify(payload, null, 2) }],
        }
      } catch (err) {
        trackMcpTool({ toolName: "get_changelog", durationMs: Date.now() - start, isError: true })
        return toolError("Failed to fetch changelog", err)
      }
    }
  )

  server.tool(
    "get_component_versions",
    "Get the version history for a component from the `component_versions` Supabase table.",
    {
      name: z.string().describe("Component name"),
    },
    async ({ name }) => {
      const start = Date.now()
      try {
        const versions = await getComponentVersions(name)
        trackMcpTool({
          toolName: "get_component_versions",
          durationMs: Date.now() - start,
          componentName: name,
        })
        return {
          content: [{ type: "text" as const, text: JSON.stringify(versions, null, 2) }],
        }
      } catch (err) {
        trackMcpTool({
          toolName: "get_component_versions",
          durationMs: Date.now() - start,
          componentName: name,
          isError: true,
        })
        return toolError(`Failed to get versions for "${name}"`, err)
      }
    }
  )

  server.tool(
    "list_skills",
    "List every published skill from the Supabase `skills` table — agent-skill MDX bodies that AI assistants invoke on specific tasks (e.g. nyuchi-design-system, scaffold-component, ecosystem-app-setup). Returns the lightweight summary shape (no body_mdx); use get_skill(name) to fetch the full MDX. Wraps the list_skills() SQL helper.",
    {},
    async () => {
      const start = Date.now()
      try {
        const skills = await listSkills()
        trackMcpTool({ toolName: "list_skills", durationMs: Date.now() - start })
        return {
          content: [{ type: "text" as const, text: JSON.stringify(skills, null, 2) }],
        }
      } catch (err) {
        trackMcpTool({
          toolName: "list_skills",
          durationMs: Date.now() - start,
          isError: true,
        })
        return toolError("Failed to list skills", err)
      }
    }
  )

  server.tool(
    "get_skill",
    "Fetch a single skill (with full body_mdx) from the Supabase `skills` table by name. Used by agents that already know the skill name and want to load its workflow. The body_mdx is large (~5KB per skill); list_skills returns the summary shape if you only need the index.",
    {
      name: z
        .string()
        .describe("Skill name in kebab-case (e.g. 'nyuchi-design-system', 'scaffold-component')"),
    },
    async ({ name }) => {
      const start = Date.now()
      try {
        const skill = await getSkill(name)
        if (!skill) {
          trackMcpTool({
            toolName: "get_skill",
            durationMs: Date.now() - start,
            isError: true,
          })
          return {
            content: [{ type: "text" as const, text: `Skill "${name}" not found` }],
            isError: true,
          }
        }
        trackMcpTool({ toolName: "get_skill", durationMs: Date.now() - start })
        return {
          content: [{ type: "text" as const, text: JSON.stringify(skill, null, 2) }],
        }
      } catch (err) {
        trackMcpTool({
          toolName: "get_skill",
          durationMs: Date.now() - start,
          isError: true,
        })
        return toolError(`Failed to fetch skill "${name}"`, err)
      }
    }
  )

  return server
}
