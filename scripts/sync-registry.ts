#!/usr/bin/env -S tsx
/**
 * Sync registry.json and (optionally) components/ui/ from the Supabase `components` table.
 *
 * Modes:
 *   pnpm registry:sync              — regenerate registry.json + committed primitives
 *   pnpm registry:verify            — non-mutating; exit non-zero if registry.json drifts
 *   pnpm tsx scripts/sync-registry.ts --ui-only   — only refresh components/ui/*
 *   pnpm tsx scripts/sync-registry.ts --json-only — only refresh registry.json
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY to be set.
 *
 * Post-v4.0.26 the authoritative source of truth is the Supabase `components`
 * table. `registry.json` is a committed snapshot so PRs show registry deltas
 * clearly; `registry:verify` runs in CI to make sure the snapshot matches.
 * Only the ~35 primitives actually consumed by this Next.js app are written
 * into `components/ui/` — everything else in the DB is served via /api/v1/ui.
 */

import { readFile, writeFile, mkdir } from "fs/promises"
import { existsSync } from "fs"
import { join, dirname } from "path"
import { getAllComponents, getComponent, isSupabaseConfigured } from "../lib/db"

const REGISTRY_PATH = join(process.cwd(), "registry.json")
const REGISTRY_HEADER = {
  $schema: "https://ui.shadcn.com/schema/registry.json",
  name: "mukoko",
  homepage: "https://mzizi.dev",
}

// ── Primitives the portal itself imports from components/ui/ ──────────────
// When they change, regenerate /tmp/keep.txt via:
//   grep -rhEo "@/components/ui/[a-z0-9-]+" app components/landing \
//     components/playground components/patterns components/docs \
//     components/error-boundary.tsx components/theme-provider.tsx \
//     components/theme-toggle.tsx | sed 's|@/components/ui/||' | sort -u
const PORTAL_PRIMITIVES = new Set([
  "accordion",
  "alert",
  "alert-dialog",
  "avatar",
  "badge",
  "button",
  "card",
  "chart",
  "checkbox",
  "collapsible",
  "dialog",
  "direction",
  "dropdown-menu",
  "hover-card",
  "input",
  "kbd",
  "label",
  "popover",
  "progress",
  "radio-group",
  "scroll-area",
  "select",
  "separator",
  "sheet", // transitive via sidebar
  "sidebar",
  "skeleton",
  "slider",
  "spinner",
  "switch",
  "table",
  "tabs",
  "textarea",
  "toggle",
  "tooltip",
  "typography",
])

function parseArgs() {
  const args = process.argv.slice(2)
  return {
    check: args.includes("--check"),
    uiOnly: args.includes("--ui-only"),
    jsonOnly: args.includes("--json-only"),
  }
}

function sortKeys<T>(obj: T): T {
  if (Array.isArray(obj)) return obj.map(sortKeys) as unknown as T
  if (obj && typeof obj === "object") {
    const sorted: Record<string, unknown> = {}
    for (const key of Object.keys(obj).sort()) {
      sorted[key] = sortKeys((obj as Record<string, unknown>)[key])
    }
    return sorted as T
  }
  return obj
}

async function buildRegistryJson() {
  const components = await getAllComponents()
  const items = components
    .map((c) => ({
      name: c.name,
      type: c.registry_type,
      description: c.description,
      dependencies: c.dependencies ?? [],
      registryDependencies: c.registry_dependencies ?? [],
      files: c.files ?? [],
    }))
    .sort((a, b) => a.name.localeCompare(b.name))

  return {
    ...REGISTRY_HEADER,
    items,
  }
}

async function writeRegistryJson(payload: unknown) {
  const serialised = JSON.stringify(payload, null, 2) + "\n"
  await writeFile(REGISTRY_PATH, serialised, "utf-8")
}

async function readRegistryJson(): Promise<string | null> {
  if (!existsSync(REGISTRY_PATH)) return null
  return readFile(REGISTRY_PATH, "utf-8")
}

async function syncPrimitiveFiles() {
  const writes: Array<{ path: string; changed: boolean }> = []
  for (const name of PORTAL_PRIMITIVES) {
    const component = await getComponent(name)
    if (!component || !component.source_code) {
      console.warn(`  skipped ${name} — not in DB or missing source_code`)
      continue
    }
    const firstFile = component.files?.[0]
    if (!firstFile) {
      console.warn(`  skipped ${name} — no files[] entry`)
      continue
    }
    const target = join(process.cwd(), firstFile.path)
    await mkdir(dirname(target), { recursive: true })
    let prev: string | null = null
    if (existsSync(target)) prev = await readFile(target, "utf-8")
    if (prev !== component.source_code) {
      await writeFile(target, component.source_code, "utf-8")
      writes.push({ path: firstFile.path, changed: true })
    }
  }
  return writes
}

async function main() {
  const args = parseArgs()

  if (!isSupabaseConfigured()) {
    console.error(
      "✖ Supabase env vars not set. Configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
    )
    process.exit(1)
  }

  // Registry JSON
  if (!args.uiOnly) {
    console.log("→ Building registry.json from Supabase…")
    const payload = sortKeys(await buildRegistryJson())
    const serialised = JSON.stringify(payload, null, 2) + "\n"

    if (args.check) {
      const existing = await readRegistryJson()
      if (existing !== serialised) {
        console.error("✖ registry.json is out of sync with the database.")
        console.error("  Run `pnpm registry:sync` and commit the result.")
        process.exit(1)
      }
      console.log("✓ registry.json matches the database.")
    } else {
      await writeRegistryJson(payload)
      console.log(
        `✓ registry.json written (${(payload as { items: unknown[] }).items.length} items)`
      )
    }
  }

  // Primitive files
  if (!args.jsonOnly && !args.check) {
    console.log(`→ Syncing ${PORTAL_PRIMITIVES.size} portal primitives into components/ui/…`)
    const writes = await syncPrimitiveFiles()
    const changed = writes.filter((w) => w.changed)
    if (changed.length === 0) {
      console.log("✓ All primitives up to date.")
    } else {
      console.log(`✓ Updated ${changed.length} primitive(s):`)
      for (const w of changed) console.log(`    ${w.path}`)
    }
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
