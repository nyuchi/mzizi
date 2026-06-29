#!/usr/bin/env -S tsx
/**
 * Sync the seven-mineral + seven-heritage colour palette from the Supabase
 * document store into the committed token artifacts.
 *
 * The DB is the single source of truth (collections `styling-minerals` and
 * `styling-heritage-colors` in `component_documents`). This script projects
 * those rows into:
 *   - lib/tokens/palette.generated.ts   (typed snapshot consumed by lib/tokens)
 *   - app/globals.css                   (the marked palette regions only)
 *
 * Modes:
 *   pnpm tokens:sync     regenerate the artifacts from the DB
 *   pnpm tokens:verify   non-mutating CI gate; exits non-zero if an artifact
 *                        has drifted from the DB (compared value-wise, so
 *                        formatting differences never trip the gate)
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY (same as
 * registry:sync). The store is anon-readable via RLS.
 */

import { readFile, writeFile } from "fs/promises"
import { join } from "path"
import { createClient } from "@supabase/supabase-js"

const CHECK = process.argv.includes("--check")

const PALETTE_TS = join(process.cwd(), "lib/tokens/palette.generated.ts")
const GLOBALS_CSS = join(process.cwd(), "app/globals.css")

interface Mineral {
  name: string
  role: string
  family: string
  cssVar: string
  darkHex: string
  lightHex: string
  containerDark: string
  containerLight: string
  onContainerDark: string
  onContainerLight: string
  sortOrder: number
  origin: string
  symbolism: string
  usage: string
}
interface Heritage {
  name: string
  cssVar: string
  darkHex: string
  lightHex: string
  sortOrder: number
  origin: string
  symbolism: string
  usage: string
}

function fail(msg: string): never {
  console.error(`✗ ${msg}`)
  process.exit(1)
}

async function fetchPalette(): Promise<{ minerals: Mineral[]; heritage: Heritage[] }> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) fail("NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY are required")

  const supabase = createClient(url, key)
  const { data, error } = await supabase
    .from("component_documents")
    .select("collection, document")
    .in("collection", ["styling-minerals", "styling-heritage-colors"])
  if (error) fail(`Supabase read failed: ${error.message}`)

  const docs = (data ?? []).map((r) => r.document as Record<string, unknown>)
  const str = (d: Record<string, unknown>, k: string) => String(d[k] ?? "")
  const num = (d: Record<string, unknown>, k: string) => Number(d[k] ?? 0)

  const minerals: Mineral[] = docs
    .filter((d) => d.collection === "styling-minerals")
    .map((d) => ({
      name: str(d, "name"),
      role: str(d, "role"),
      family: str(d, "family"),
      cssVar: str(d, "css_var"),
      darkHex: str(d, "dark_hex"),
      lightHex: str(d, "light_hex"),
      containerDark: str(d, "container_dark"),
      containerLight: str(d, "container_light"),
      onContainerDark: str(d, "on_container_dark"),
      onContainerLight: str(d, "on_container_light"),
      sortOrder: num(d, "sort_order"),
      origin: str(d, "origin"),
      symbolism: str(d, "symbolism"),
      usage: str(d, "usage"),
    }))
    .sort((a, b) => a.sortOrder - b.sortOrder)

  const heritage: Heritage[] = docs
    .filter((d) => d.collection === "styling-heritage-colors")
    .map((d) => ({
      name: str(d, "name"),
      cssVar: str(d, "css_var"),
      darkHex: str(d, "dark_hex"),
      lightHex: str(d, "light_hex"),
      sortOrder: num(d, "sort_order"),
      origin: str(d, "origin"),
      symbolism: str(d, "symbolism"),
      usage: str(d, "usage"),
    }))
    .sort((a, b) => a.sortOrder - b.sortOrder)

  if (minerals.length !== 7) fail(`expected 7 minerals, got ${minerals.length}`)
  if (heritage.length !== 7) fail(`expected 7 heritage tones, got ${heritage.length}`)
  return { minerals, heritage }
}

function renderPaletteModule(minerals: Mineral[], heritage: Heritage[]): string {
  const mineral = (m: Mineral) =>
    `  {
    name: ${JSON.stringify(m.name)},
    role: ${JSON.stringify(m.role)},
    family: ${JSON.stringify(m.family)},
    cssVar: ${JSON.stringify(m.cssVar)},
    darkHex: ${JSON.stringify(m.darkHex)},
    lightHex: ${JSON.stringify(m.lightHex)},
    containerDark: ${JSON.stringify(m.containerDark)},
    containerLight: ${JSON.stringify(m.containerLight)},
    onContainerDark: ${JSON.stringify(m.onContainerDark)},
    onContainerLight: ${JSON.stringify(m.onContainerLight)},
    sortOrder: ${m.sortOrder},
    origin: ${JSON.stringify(m.origin)},
    symbolism: ${JSON.stringify(m.symbolism)},
    usage: ${JSON.stringify(m.usage)},
  },`
  const heri = (h: Heritage) =>
    `  {
    name: ${JSON.stringify(h.name)},
    cssVar: ${JSON.stringify(h.cssVar)},
    darkHex: ${JSON.stringify(h.darkHex)},
    lightHex: ${JSON.stringify(h.lightHex)},
    sortOrder: ${h.sortOrder},
    origin: ${JSON.stringify(h.origin)},
    symbolism: ${JSON.stringify(h.symbolism)},
    usage: ${JSON.stringify(h.usage)},
  },`

  return `/**
 * SEVEN MINERALS + SEVEN HERITAGE — canonical colour palette snapshot.
 *
 * AUTO-GENERATED by \`scripts/sync-tokens.ts\` from the Supabase document store
 * (collections \`styling-minerals\` and \`styling-heritage-colors\`). The database
 * is the single source of truth — DO NOT EDIT THIS FILE BY HAND.
 *
 *   pnpm tokens:sync     regenerate this file + the globals.css palette block
 *   pnpm tokens:verify   CI gate — fails if this snapshot drifts from the DB
 *
 * Two mineral families: \`deep-earth\` (cobalt, tanzanite, malachite, sodalite)
 * and \`hand\` (gold, terracotta, copper). Heritage tones are atmospheric
 * anchors with no family/role.
 */

export interface MineralToken {
  name: string
  role: string
  family: "deep-earth" | "hand"
  cssVar: string
  darkHex: string
  lightHex: string
  containerDark: string
  containerLight: string
  onContainerDark: string
  onContainerLight: string
  sortOrder: number
  origin: string
  symbolism: string
  usage: string
}

export interface HeritageToken {
  name: string
  cssVar: string
  darkHex: string
  lightHex: string
  sortOrder: number
  origin: string
  symbolism: string
  usage: string
}

export const minerals: MineralToken[] = [
${minerals.map(mineral).join("\n")}
]

export const heritageColors: HeritageToken[] = [
${heritage.map(heri).join("\n")}
]
`
}

function renderThemeBlock(minerals: Mineral[], heritage: Heritage[]): string {
  const m = minerals
    .map(
      (x) =>
        `  --color-${x.name}: var(--mineral-${x.name});\n` +
        `  --color-${x.name}-container: var(--mineral-${x.name}-container);\n` +
        `  --color-${x.name}-on-container: var(--mineral-${x.name}-on-container);`
    )
    .join("\n")
  const h = heritage.map((x) => `  --color-${x.name}: var(--heritage-${x.name});`).join("\n")
  return `${m}\n${h}`
}

function renderVars(minerals: Mineral[], heritage: Heritage[], mode: "light" | "dark"): string {
  const m = minerals
    .map((x) => {
      const base = mode === "light" ? x.lightHex : x.darkHex
      const con = mode === "light" ? x.containerLight : x.containerDark
      const onc = mode === "light" ? x.onContainerLight : x.onContainerDark
      return (
        `  --mineral-${x.name}: ${base.toLowerCase()};\n` +
        `  --mineral-${x.name}-container: ${con.toLowerCase()};\n` +
        `  --mineral-${x.name}-on-container: ${onc.toLowerCase()};`
      )
    })
    .join("\n")
  const h = heritage
    .map(
      (x) => `  --heritage-${x.name}: ${(mode === "light" ? x.lightHex : x.darkHex).toLowerCase()};`
    )
    .join("\n")
  return `${m}\n${h}`
}

function spliceRegion(css: string, region: string, body: string): string {
  const start = `/* tokens:generated:${region}:start */`
  const end = `/* tokens:generated:${region}:end */`
  const s = css.indexOf(start)
  const e = css.indexOf(end)
  if (s === -1 || e === -1) fail(`globals.css is missing the ${region} generated markers`)
  return css.slice(0, s + start.length) + "\n" + body + "\n  " + css.slice(e)
}

/** Strip whitespace so value drift is caught but formatting differences are not. */
const norm = (s: string) => s.replace(/\s+/g, "")

async function main() {
  const { minerals, heritage } = await fetchPalette()

  const paletteModule = renderPaletteModule(minerals, heritage)
  let css = await readFile(GLOBALS_CSS, "utf8")
  css = spliceRegion(css, "theme", renderThemeBlock(minerals, heritage))
  css = spliceRegion(css, "light", renderVars(minerals, heritage, "light"))
  css = spliceRegion(css, "dark", renderVars(minerals, heritage, "dark"))

  if (CHECK) {
    const onDiskPalette = await readFile(PALETTE_TS, "utf8")
    const onDiskCss = await readFile(GLOBALS_CSS, "utf8")
    const drift: string[] = []
    if (norm(onDiskPalette) !== norm(paletteModule)) drift.push("lib/tokens/palette.generated.ts")
    if (norm(onDiskCss) !== norm(css)) drift.push("app/globals.css")
    if (drift.length) {
      fail(`token artifacts drifted from the DB: ${drift.join(", ")}. Run \`pnpm tokens:sync\`.`)
    }
    console.log("✓ tokens in sync with the DB (7 minerals, 7 heritage)")
    return
  }

  await writeFile(PALETTE_TS, paletteModule)
  await writeFile(GLOBALS_CSS, css)
  console.log(
    `✓ synced ${minerals.length} minerals + ${heritage.length} heritage tones → palette.generated.ts, globals.css`
  )
}

main().catch((e) => fail(e instanceof Error ? e.message : String(e)))
