# Nyuchi Design Portal — Claude Code Skills

Installable Claude Code skills for working with the bundu ecosystem. Each `.md` file in this directory is a self-contained skill with YAML frontmatter describing when Claude should invoke it.

## What's in here

| Skill                  | When to use                                                                                                                            |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `nyuchi-design-system` | Working on any bundu-ecosystem app — design tokens, component patterns, Ubuntu doctrine, APCA accessibility, shadcn CLI install flows. |
| `ecosystem-app-setup`  | Bootstrapping a brand-new ecosystem app (new mukoko mini-app, nyuchi product, sister brand, etc.).                                     |
| `scaffold-component`   | Adding a new UI component to the registry (Supabase-first: MCP `scaffold_component` → upsert → `pnpm registry:sync`).                  |

All three skills assume the live portal at <https://mzizi.dev> and the MCP server at <https://mzizi.dev/mcp>.

## Install into another Claude Code project

Skills live in one of two places:

- `<project>/.claude/skills/` — project-scoped (recommended for ecosystem apps)
- `~/.claude/skills/` — user-global

Install via any of these paths.

### Option A — Clone the repo (always up-to-date)

```bash
cd ~/src # wherever you keep repos
git clone https://github.com/nyuchi/design-portal.git
mkdir -p ~/.claude/skills
ln -s "$PWD/design-portal/.claude/skills/nyuchi-design-system.md"   ~/.claude/skills/
ln -s "$PWD/design-portal/.claude/skills/ecosystem-app-setup.md"    ~/.claude/skills/
ln -s "$PWD/design-portal/.claude/skills/scaffold-component.md"     ~/.claude/skills/
```

Symlinking means `git pull` in the portal repo auto-updates the skills in every other project.

### Option B — Copy into an ecosystem app's project scope

```bash
# From the root of the consumer app (e.g. mukoko-weather):
mkdir -p .claude/skills
curl -fsSL -o .claude/skills/nyuchi-design-system.md   https://raw.githubusercontent.com/nyuchi/design-portal/main/.claude/skills/nyuchi-design-system.md
curl -fsSL -o .claude/skills/ecosystem-app-setup.md    https://raw.githubusercontent.com/nyuchi/design-portal/main/.claude/skills/ecosystem-app-setup.md
curl -fsSL -o .claude/skills/scaffold-component.md     https://raw.githubusercontent.com/nyuchi/design-portal/main/.claude/skills/scaffold-component.md
```

Project-scoped skills ship with the repo — every contributor and every Claude Code session automatically gets the right skills.

### Option C — Pair with the MCP server

For the richest experience, also wire up the live MCP server. Add to your Claude Code settings (`.claude/settings.json`):

```json
{
  "mcpServers": {
    "nyuchi-design": {
      "type": "url",
      "url": "https://mzizi.dev/mcp"
    }
  }
}
```

The MCP server exposes tools and resources that read live data from the Supabase registry — call `tools/list` or `resources/list` for the current inventory (the set is never hardcoded, it grows as the registry grows). The skills are the _doctrine_ ("what does it mean?"); the MCP server is the _data_ ("what does it currently contain?"). Use them together.

## Verifying installation

Start a new Claude Code session in the target project and type:

```
/nyuchi-design-system
```

If the skill is registered, Claude will acknowledge the trigger and load the instructions. You can also type `/` to browse available skills — the three Nyuchi skills should appear with their descriptions.

## Updating

- **If you symlinked (Option A):** `git pull` in the portal repo.
- **If you copied (Option B):** rerun the `curl` commands; they'll overwrite with the latest version.

## Contributing to the skills

Edit the `.md` file directly in this repo. Open a PR. The skill frontmatter format is:

```yaml
---
name: skill-slug-kebab-case
description: One-sentence trigger guide — "Use when …"; include keywords Claude's router should match on. This field is the ONLY signal for when the skill activates, so make it concrete.
---
# Skill content in Markdown …
```

Keep `description` specific and in imperative voice starting with "Use when". Do not bury the triggers — the first sentence is what Claude's router matches against.

## License

MIT — see `../../LICENSE`. These skills are free to fork, extend, and redistribute. If you derive a skill for another design system, please credit the Nyuchi Design Portal in your own README.
