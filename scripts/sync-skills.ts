/**
 * sync-skills — pulls every skill from the Supabase `skills` table and
 * writes the body_mdx into BOTH:
 *
 *   packages/design-agent-skills/skills/<name>.md   (npm package snapshot)
 *   .claude/skills/<name>.md                        (portal dogfood — Claude
 *                                                    Code reads from here
 *                                                    when running in this repo)
 *
 * The Supabase `skills` table is the SINGLE source of truth for skill
 * content (CLAUDE.md §15.24). Both file locations are published snapshots,
 * refreshed on every `pnpm skills:sync` run. The portal dogfoods its own
 * package — both copies must stay byte-identical to the DB row, otherwise
 * AI assistants in the portal repo (reading .claude/skills/) and
 * consumers (reading the npm package) would see different content for
 * the same skill name.
 *
 * Run before `pnpm publish --filter @nyuchi/design-agent-skills`:
 *
 *   pnpm skills:sync       (pulls live + rewrites both file locations)
 *   pnpm skills:verify     (--check mode; non-zero exit if drift found)
 *
 * Required env (read from .env.local or process.env):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY  (anon read is sufficient — RLS lets
 *                                   anon SELECT skills.body_mdx)
 *
 * Author: nyuchi/core
 */

import { createClient } from "@supabase/supabase-js"
import { existsSync, readFileSync, writeFileSync } from "node:fs"
import { join, resolve } from "node:path"
import { createHash } from "node:crypto"

const SKILLS_PACKAGE_DIR = resolve(import.meta.dirname, "../packages/design-agent-skills")
const MANIFEST_PATH = join(SKILLS_PACKAGE_DIR, "skills.json")

// Two write targets — both must stay in sync with Supabase. The package
// dir feeds `npx skills add @nyuchi/design-agent-skills` and the npm
// publish flow; the portal dir feeds Claude Code running in this repo.
const SKILLS_TARGETS = [
  { label: "package", dir: join(SKILLS_PACKAGE_DIR, "skills") },
  { label: "portal", dir: resolve(import.meta.dirname, "../.claude/skills") },
] as const

interface SkillRow {
  name: string
  description: string
  body_mdx: string
  agents: string[]
  applies_to: string[]
  requires_mcp: boolean
  version: string
  status: string | null
  updated_at: string
}

interface SkillsManifest {
  $schema: string
  name: string
  description: string
  homepage: string
  live: string
  skills: Array<{
    name: string
    path: string
    description: string
    agents: string[]
    applies_to: string[]
    requires_mcp: boolean
  }>
}

async function fetchSkills(): Promise<SkillRow[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required")
  }
  const supabase = createClient(url, key)
  const { data, error } = await supabase
    .from("skills")
    .select(
      "name, description, body_mdx, agents, applies_to, requires_mcp, version, status, updated_at"
    )
    .order("name")
  if (error) throw new Error(`Supabase: ${error.message}`)
  return (data ?? []) as unknown as SkillRow[]
}

function md5(s: string): string {
  return createHash("md5").update(s).digest("hex")
}

function buildManifest(skills: SkillRow[]): SkillsManifest {
  return {
    $schema: "https://mzizi.dev/schema/skills.json",
    name: "@nyuchi/design-agent-skills",
    description: "Agent skills for AI assistants working with the Nyuchi Design system.",
    homepage: "https://mzizi.dev",
    live: "https://mzizi.dev/api/v1/skills",
    skills: skills.map((s) => ({
      name: s.name,
      path: `skills/${s.name}.md`,
      description: s.description,
      agents: s.agents,
      applies_to: s.applies_to,
      requires_mcp: s.requires_mcp,
    })),
  }
}

async function main() {
  const checkOnly = process.argv.includes("--check")
  const skills = await fetchSkills()
  console.log(`Pulled ${skills.length} skill(s) from Supabase.`)

  let drift = 0
  for (const skill of skills) {
    const dbHash = md5(skill.body_mdx)
    for (const target of SKILLS_TARGETS) {
      const path = join(target.dir, `${skill.name}.md`)
      const localHash = existsSync(path) ? md5(readFileSync(path, "utf-8")) : null

      if (localHash === dbHash) {
        console.log(`  ok      ${target.label}/${skill.name}.md`)
        continue
      }

      drift += 1
      if (checkOnly) {
        console.log(
          `  DRIFT   ${target.label}/${skill.name}.md (db=${dbHash.slice(0, 8)} local=${localHash?.slice(0, 8) ?? "missing"})`
        )
      } else {
        writeFileSync(path, skill.body_mdx)
        console.log(
          `  write   ${target.label}/${skill.name}.md (was ${localHash?.slice(0, 8) ?? "missing"} → ${dbHash.slice(0, 8)})`
        )
      }
    }
  }

  // Manifest
  const newManifest = JSON.stringify(buildManifest(skills), null, 2) + "\n"
  const oldManifest = existsSync(MANIFEST_PATH) ? readFileSync(MANIFEST_PATH, "utf-8") : ""
  if (newManifest === oldManifest) {
    console.log("  ok      skills.json")
  } else {
    drift += 1
    if (checkOnly) {
      console.log("  DRIFT   skills.json")
    } else {
      writeFileSync(MANIFEST_PATH, newManifest)
      console.log("  write   skills.json")
    }
  }

  if (checkOnly && drift > 0) {
    console.error(`\nDrift detected (${drift} file(s)). Run \`pnpm skills:sync\` to refresh.`)
    process.exit(1)
  }
  if (drift === 0) {
    console.log("\nAll skill files match Supabase.")
  } else {
    console.log(`\n${drift} file(s) updated from Supabase.`)
  }
}

main().catch((err) => {
  console.error(err.message ?? err)
  process.exit(1)
})
