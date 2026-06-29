#!/usr/bin/env -S tsx
/**
 * Hardcoded-palette-colour lint.
 *
 * The seven minerals and seven heritage tones are the brand palette and must be
 * referenced as tokens — the Tailwind utility (`bg-sodalite`, `text-copper`,
 * `bg-cobalt-container`) or the CSS var (`var(--color-sodalite)`) — never pasted
 * in as a raw hex. This lint fails when a raw hex that EQUALS a known palette
 * value appears outside the canonical token files.
 *
 * The vocabulary is DB-driven: it is read from lib/tokens/palette.generated.ts
 * (itself generated from the DB by sync-tokens.ts), so adding a colour to the
 * store needs no change here. Non-palette hexes (status greens/ambers, chart
 * fallbacks, SVG gradients) are intentionally NOT flagged — this guards the
 * brand palette specifically, not every colour literal.
 *
 *   pnpm lint:colors
 */

import { readdir, readFile } from "fs/promises"
import { join, relative } from "path"
import { minerals, heritageColors } from "../lib/tokens/palette.generated"

const ROOT = process.cwd()
const SCAN_DIRS = ["app", "components", "lib", "hooks"]
// Canonical token files may legitimately hold raw palette hexes.
const ALLOW = ["lib/tokens/", "app/globals.css", "packages/design-cli/templates/", "scripts/"]

// hex (lowercase) -> token name, for a helpful message.
const paletteHex = new Map<string, string>()
for (const m of minerals) {
  for (const hex of [
    m.darkHex,
    m.lightHex,
    m.containerDark,
    m.containerLight,
    m.onContainerDark,
    m.onContainerLight,
  ]) {
    paletteHex.set(hex.toLowerCase(), m.name)
  }
}
for (const h of heritageColors) {
  paletteHex.set(h.darkHex.toLowerCase(), h.name)
  paletteHex.set(h.lightHex.toLowerCase(), h.name)
}

const HEX = /#[0-9a-fA-F]{6}\b/g

async function* walk(dir: string): AsyncGenerator<string> {
  let entries
  try {
    entries = await readdir(dir, { withFileTypes: true })
  } catch {
    return
  }
  for (const e of entries) {
    const full = join(dir, e.name)
    if (e.isDirectory()) {
      if (e.name === "node_modules" || e.name === ".next") continue
      yield* walk(full)
    } else if (/\.(ts|tsx)$/.test(e.name)) {
      yield full
    }
  }
}

async function main() {
  const violations: string[] = []
  for (const base of SCAN_DIRS) {
    for await (const file of walk(join(ROOT, base))) {
      const rel = relative(ROOT, file)
      if (ALLOW.some((a) => rel.startsWith(a))) continue
      // Blank out block + line comments so documented hexes aren't flagged,
      // preserving newlines so reported line numbers stay accurate.
      const text = (await readFile(file, "utf8")).replace(/\/\*[\s\S]*?\*\//g, (m) =>
        m.replace(/[^\n]/g, " ")
      )
      const seen = new Set<string>()
      text.split("\n").forEach((line, i) => {
        const code = line.replace(/\/\/.*$/, "")
        for (const match of code.matchAll(HEX)) {
          const hex = match[0].toLowerCase()
          const token = paletteHex.get(hex)
          // A hex used as a `var(--color-x, #fallback)` fallback is correct
          // token usage — skip it. We're inside a var() if more `var(` than `)`
          // precede the match on this line.
          const before = code.slice(0, match.index ?? 0)
          const openVars =
            (before.match(/var\(/g)?.length ?? 0) - (before.match(/\)/g)?.length ?? 0)
          if (token && openVars <= 0) {
            const k = `${rel}:${i + 1}:${hex}`
            if (!seen.has(k)) {
              seen.add(k)
              violations.push(
                `  ${rel}:${i + 1}  ${match[0]} is the "${token}" token — use var(--color-${token}) or the bg-${token}/text-${token} utility`
              )
            }
          }
        }
      })
    }
  }

  if (violations.length) {
    console.error(`✗ hardcoded palette colours found (${violations.length}):`)
    console.error(violations.join("\n"))
    console.error(
      `\nThe palette is brand identity — reference the token, never the raw hex. (vocabulary: ${paletteHex.size} hexes across ${minerals.length} minerals + ${heritageColors.length} heritage tones)`
    )
    process.exit(1)
  }
  console.log(
    `✓ no hardcoded palette colours (checked against ${paletteHex.size} palette hexes from the DB snapshot)`
  )
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : String(e))
  process.exit(1)
})
