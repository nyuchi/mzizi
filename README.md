# Mzizi

> An open-architecture project of the Bundu Foundation — an open 3D frontend architecture, component registry, brand documentation, AI-native tooling, and developer portal. Operated and developed by Nyuchi.

[![CI](https://github.com/nyuchi/design-portal/actions/workflows/ci.yml/badge.svg)](https://github.com/nyuchi/design-portal/actions/workflows/ci.yml)
[![Release](https://github.com/nyuchi/design-portal/actions/workflows/release.yml/badge.svg)](https://github.com/nyuchi/design-portal/actions/workflows/release.yml)
[![CodeQL](https://github.com/nyuchi/design-portal/actions/workflows/github-code-scanning/codeql/badge.svg)](https://github.com/nyuchi/design-portal/security/code-scanning)

**Version:** 4.0.39 | **Live:** [mzizi.dev](https://mzizi.dev) | **Docs:** [mzizi.dev/docs](https://mzizi.dev/docs) | **Observability:** [mzizi.dev/observability](https://mzizi.dev/observability)

---

## What is this?

Mzizi is an **independent open-architecture project of the Bundu Foundation** — operated and developed by Nyuchi, governed by the Bundu Foundation. It owns the open 3D frontend architecture, the component registry (`mzizi.dev/r/`), the Mzizi API (`mzizi.dev/api`), the components, and the infrastructure harness. Consumed across the bundu ecosystem — mukoko (Africa's super app — 17 mini-apps), nyuchi (7 enterprise products), and every app in the bundu family.

The registry is backed by a **DB-first architecture** (Supabase) and served as a shadcn-compatible API — every component is installable directly into any project with one command. It is also **AI-native**: a full Model Context Protocol (MCP) server at `/mcp` gives Claude Code and other AI assistants direct access to the registry, brand tokens, and design system documentation. Long-form guides live in the standalone Mintlify docs site at [mzizi.dev/docs](https://mzizi.dev/docs).

---

## Quick install

Bootstrap a fresh project:

```bash
npx @nyuchi/design-cli init
```

This writes `app/globals.css` (the Five African Minerals tokens), `lib/utils.ts` (the `cn()` helper), `components/theme-provider.tsx`, and `components.json` — everything a new Nyuchi-branded app needs to start.

Install components (wraps the shadcn CLI under the hood):

```bash
npx @nyuchi/design-cli add button card data-table
```

Install agent skills so AI tools in your project know the doctrine:

```bash
npx @nyuchi/design-cli skills install
```

Or use the shadcn CLI directly:

```bash
npx shadcn@latest add https://mzizi.dev/api/v1/ui/button
```

Install multiple via shadcn:

```bash
npx shadcn@latest add \
  https://mzizi.dev/api/v1/ui/card \
  https://mzizi.dev/api/v1/ui/dialog \
  https://mzizi.dev/api/v1/ui/data-table
```

---

## AI-Native: MCP Server + Claude Code Skill

### Connect Claude Code (or any MCP client)

Add to your `.claude/settings.json`:

```json
{
  "mcpServers": {
    "mzizi": {
      "type": "url",
      "url": "https://mzizi.dev/mcp"
    }
  }
}
```

Your AI assistant can now call the full tool surface — live at `https://mzizi.dev/mcp` via `tools/list`:

| Tool                        | What it does                                                                 |
| --------------------------- | ---------------------------------------------------------------------------- |
| `list_components`           | Browse all registry items, filter by type/layer/category                     |
| `get_component`             | Fetch full source code + metadata for any component                          |
| `get_component_docs`        | Structured docs (use cases, variants, a11y notes)                            |
| `get_component_versions`    | Version history for a component                                              |
| `get_component_links`       | All portal URLs for a component                                              |
| `search_components`         | Search by name, description, or category                                     |
| `scaffold_component`        | Generate a new component following CVA + Radix + cn() patterns               |
| `get_design_tokens`         | Fetch the Five African Minerals palette + semantic tokens                    |
| `get_install_command`       | Get the shadcn CLI install command for one or more components                |
| `get_brand_info`            | Brand system — ecosystem brands, typography, spacing                         |
| `get_architecture_info`     | Data architecture (principles, data layer, pipeline, sovereignty)            |
| `get_ubuntu_doctrine`       | Static Ubuntu philosophy doctrine (philosophy, design, community, languages) |
| `get_ubuntu_pillars`        | Five Ubuntu Pillars — rows from `ubuntu_pillars`                             |
| `get_ubuntu_principles`     | Five Ubuntu Principles — rows from `ubuntu_principles`                       |
| `get_architecture_frontend` | 3D frontend axes + layers                                                    |
| `get_layer_summary`         | Component count / categories / names for a given frontend layer (1–10)       |
| `get_ai_instructions`       | System prompts from `ai_instructions` by target (mcp-server/claude/copilot)  |
| `get_changelog`             | Recent releases from the `changelog` table                                   |
| `list_skills`               | List every published agent skill (summary only; no body_mdx)                 |
| `get_skill`                 | Fetch a single skill (full MDX body) by name                                 |
| `get_usage_stats`           | Public API and MCP usage metrics (open data, CC BY 4.0)                      |
| `get_database_status`       | Registry database status and row counts                                      |

**Endpoint:** `POST /mcp` (JSON-RPC) | `GET /mcp` (SSE) | `DELETE /mcp` (cleanup) | `OPTIONS /mcp` (CORS preflight)

### Claude Code Skill

The `nyuchi-design-system` skill (`/.claude/skills/nyuchi-design-system.md`) is a pre-built Claude Code skill that teaches AI assistants the Five African Minerals design system:

- Full color palette with APCA contrast values
- CVA + Radix + `cn()` component patterns
- Ubuntu design checklist (touch targets, connectivity, shared devices)
- APCA Lc 90+ accessibility quick reference
- Registry install commands

Activate in any session: `/nyuchi-design-system`

---

## Five African Minerals

The design system is built on five colors named after African minerals — constant across light and dark mode:

| Mineral    | Hex       | CSS Variable         | Usage                              |
| ---------- | --------- | -------------------- | ---------------------------------- |
| Cobalt     | `#0047AB` | `--color-cobalt`     | Primary blue, links, CTAs          |
| Tanzanite  | `#B388FF` | `--color-tanzanite`  | Purple accent, brand/logo          |
| Malachite  | `#64FFDA` | `--color-malachite`  | Cyan accent, success states        |
| Gold       | `#FFD740` | `--color-gold`       | Yellow accent, rewards, highlights |
| Terracotta | `#D4A574` | `--color-terracotta` | Warm accent, community             |

**Buttons are always pill-shaped (`rounded-full`).** This is a brand identity decision — not a radius scale value.

---

## Registry

The registry is live at [mzizi.dev/components](https://mzizi.dev/components). Component counts are always live from the database — see [/observability](https://mzizi.dev/observability) for real-time totals.

| Category             | Examples                                                                                                                                   |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **Forms & Input**    | input, phone-input, date-range-picker, tag-input, rich-text-editor, combobox                                                               |
| **Chat & Messaging** | chat-bubble, chat-list, chat-input, chat-layout, typing-indicator                                                                          |
| **AI & Chatbot**     | ai-chat, prompt-input, streaming-text, ai-feedback, suggested-prompts                                                                      |
| **Data Display**     | data-table, kanban-board, tree-view, virtual-list, json-viewer, timeline                                                                   |
| **User & Profile**   | avatar-group, user-card, profile-header, activity-feed                                                                                     |
| **E-commerce**       | product-card, cart-item, order-summary, subscription-card                                                                                  |
| **Calendar**         | calendar, calendar-week-view, event-card, time-slot-picker                                                                                 |
| **Developer Tools**  | api-key-display, code-tabs, log-viewer, endpoint-card                                                                                      |
| **Navigation**       | tabs, stepper, app-switcher, bottom-sheet, mega-menu                                                                                       |
| **Layout**           | split-view, masonry-grid, infinite-scroll, page-header                                                                                     |
| **Feedback**         | announcement-bar, cookie-consent, onboarding-tour, toast                                                                                   |
| **Chart Blocks**     | area (10), bar (10), line (10), pie (11), radar (14), radial (6), tooltip (9)                                                              |
| **Page Blocks**      | dashboard, login (5), signup (5), sidebar (16), profile, settings                                                                          |
| **Mukoko Ecosystem** | mukoko-header, mukoko-footer, mukoko-sidebar, mukoko-bottom-nav                                                                            |
| **Infrastructure**   | error-boundary, lazy-section, section-error-boundary                                                                                       |
| **Hooks**            | use-toast, use-mobile, use-memory-pressure                                                                                                 |
| **Lib Utilities**    | utils, observability, circuit-breaker, retry, timeout, fallback-chain, ai-safety, chaos (installed via shadcn; not committed in this repo) |

---

## API

All endpoints under `/api/v1/`. Full spec in [`openapi.yaml`](openapi.yaml).

| Endpoint                         | Method   | Description                                                |
| -------------------------------- | -------- | ---------------------------------------------------------- |
| `/api/v1`                        | GET      | Discovery document                                         |
| `/api/v1/ui`                     | GET      | Component registry index                                   |
| `/api/v1/ui/{name}`              | GET      | Component source + metadata (shadcn format)                |
| `/api/v1/ui/{name}/docs`         | GET      | Structured docs (use cases, variants, a11y)                |
| `/api/v1/ui/{name}/versions`     | GET      | Component version history                                  |
| `/api/v1/brand`                  | GET      | Brand system (minerals, typography, spacing)               |
| `/api/v1/docs`                   | GET      | **HTTP 410 Gone** — long-form docs moved to mzizi.dev/docs |
| `/api/v1/docs/{slug}`            | GET      | **HTTP 410 Gone** — see `/api/v1/docs` for slug map        |
| `/api/v1/changelog`              | GET      | Release history                                            |
| `/api/v1/changelog/{version}`    | GET      | Single release                                             |
| `/api/v1/ai/instructions`        | GET      | List AI instruction sets                                   |
| `/api/v1/ai/instructions/{name}` | GET      | Instructions by target (mcp-server/claude/copilot)         |
| `/api/v1/search?q=`              | GET      | Cross-resource search (components + docs + changelog)      |
| `/api/v1/ecosystem`              | GET      | Architecture principles + framework decision               |
| `/api/v1/data-layer`             | GET      | Local-first + cloud layer specification                    |
| `/api/v1/pipeline`               | GET      | Open data pipeline (Redpanda, Flink, Doris)                |
| `/api/v1/sovereignty`            | GET      | Technology sovereignty assessments                         |
| `/api/v1/stats`                  | GET      | Public usage metrics (CC BY 4.0, `?days=7\|30\|90`)        |
| `/api/v1/health`                 | GET      | Service health check                                       |
| `/api/openapi`                   | GET      | OpenAPI 3.1 specification (YAML)                           |
| `/mcp`                           | POST/GET | MCP server (Streamable HTTP)                               |

---

## Open Data & Observability

Usage metrics are public by design — aligned with the bundu open data philosophy. The [/observability](https://mzizi.dev/observability) dashboard shows:

- API call volumes, error rates, and p95 latency per endpoint
- Most requested components (live install popularity ranking)
- MCP tool usage breakdown
- 30-day traffic trends

Raw data: `GET https://mzizi.dev/api/v1/stats` — licensed CC BY 4.0.

---

## Architecture

### DB-First

All data flows through Supabase. API routes read from the database with no hardcoded fallbacks:

```
Supabase (PostgreSQL)
  components, component_docs, component_demos
  brand_minerals, brand_semantic_colors, brand_typography
  brand_spacing, brand_ecosystem, brand_meta
  architecture_principles, architecture_framework
  architecture_data_layer, architecture_pipeline
  architecture_sovereignty, architecture_removed
  usage_events          ← API + MCP observability
        │
        ▼
Next.js API Routes (/api/v1/)
        │
   ┌────┼────┐
   ▼    ▼    ▼
shadcn  MCP  Portal
  CLI server  pages
```

### Layered Component Architecture

```
Layer 1: Primitives    (Button, Input, Card, Badge)
    ↓
Layer 2: Composites    (ChatLayout, DataTable)
    ↓
Layer 3: Orchestrators (Page sections)
    ↓
Layer 4: Error boundaries + loading states
    ↓
Layer 5: Server page wrappers (page.tsx)
```

### Three Sources of Truth

| Source         | Database              | Role                                                       |
| -------------- | --------------------- | ---------------------------------------------------------- |
| Relational     | Supabase / PostgreSQL | Identity, places, events, commerce, wallet                 |
| Non-relational | ScyllaDB              | Content and streams — messages, articles, AI conversations |
| Personal       | Web3 Pod (TBD)        | Digital Twin memory, preferences, AI context               |

**Speed is rented. Truth is owned.**

---

## Tech Stack

| Layer                | Technology                             | Version        |
| -------------------- | -------------------------------------- | -------------- |
| Framework            | Next.js (App Router)                   | 16.2.2         |
| Language             | TypeScript (strict mode)               | 6.0.2          |
| Package Manager      | pnpm                                   | —              |
| Styling              | Tailwind CSS 4 + CSS custom properties | 4.2.2          |
| Component Primitives | Radix UI + Base UI                     | radix-ui 1.4.3 |
| Variant Management   | class-variance-authority (CVA)         | 0.7.1          |
| HTML Sanitization    | sanitize-html                          | 2.17.2         |
| Charts               | Recharts                               | 3.8.1          |
| Forms                | react-hook-form + zod                  | 7.73.1 / 4.3.6 |
| Database             | Supabase                               | 2.104.0        |
| Documentation (MDX)  | @next/mdx + rehype-slug + autolink     | 16.2.4         |
| Icons                | Lucide React                           | 1.8.0          |
| MCP                  | @modelcontextprotocol/sdk              | 1.29.0         |
| Testing              | Vitest + Testing Library               | 4.1.5          |
| CI/CD                | GitHub Actions + Vercel                | —              |

---

## Commands

| Command                | Description                                                                          |
| ---------------------- | ------------------------------------------------------------------------------------ |
| `pnpm dev`             | Start development server (port 11736)                                                |
| `pnpm build`           | Production build (postbuild runs Pagefind to index `.next/server/app`)               |
| `pnpm check`           | **Run every CI gate locally** — same set CI runs on a PR. Use this before pushing.   |
| `pnpm format`          | Auto-fix formatting (prettier) across the whole tree                                 |
| `pnpm format:check`    | Check formatting without writing — fails if anything would change                    |
| `pnpm lint`            | ESLint (zero warnings enforced)                                                      |
| `pnpm lint:fix`        | ESLint with `--fix`                                                                  |
| `pnpm lint:md`         | markdownlint-cli2 across all `*.md` (config: `.markdownlint-cli2.jsonc`)             |
| `pnpm lint:json`       | Parse every tracked `*.json` to ensure validity                                      |
| `pnpm lint:yaml`       | yamllint (requires `pip install yamllint`)                                           |
| `pnpm typecheck`       | TypeScript type check (`tsc --noEmit`)                                               |
| `pnpm test`            | Vitest, single run                                                                   |
| `pnpm test:watch`      | Vitest watch mode                                                                    |
| `pnpm audit:check`     | `pnpm audit --audit-level=moderate` — same gate CI runs                              |
| `pnpm registry:sync`   | Regenerate `registry.json` + committed primitives from Supabase                      |
| `pnpm registry:verify` | Non-mutating; CI-safe drift check (run this before pushing if you've touched the DB) |

### Run every CI gate before pushing

`pnpm check` chains all of the above (except dev/build watch modes) into one command. **It is the local mirror of CI** — if `pnpm check` is green, CI will be too:

```bash
pnpm check
# = format:check && lint && lint:md && lint:json
#   && typecheck && test && audit:check && registry:verify && build
```

Run it before every push. It's also the recommended pre-PR check; the husky pre-commit hook is the safety net (`lint-staged → typecheck → audit`), not a substitute.

---

## CI workflows

Three workflows enforce the gates that block a merge to `main`. All are in `.github/workflows/`. The full required-check matrix lives in [`CLAUDE.md`](CLAUDE.md) §14.

| Workflow                                                   | Trigger                             | Jobs / required checks                                                                                   |
| ---------------------------------------------------------- | ----------------------------------- | -------------------------------------------------------------------------------------------------------- |
| [`ci.yml`](.github/workflows/ci.yml)                       | push to `main`, PR to `main`        | `Lint`, `Type Check`, `Test`, `Build`, `Security Audit`, `Registry Snapshot`                             |
| [`lint.yml`](.github/workflows/lint.yml)                   | push to `main`, PR to `main`        | `lint / actionlint`, `lint / JSON validity`, `lint / prettier`, `lint / markdownlint`, `lint / yamllint` |
| [`claude-review.yml`](.github/workflows/claude-review.yml) | PR open/sync, PR comment, PR review | AI code review on every human comment (advisory, not a merge gate)                                       |
| [`release.yml`](.github/workflows/release.yml)             | push to `main`                      | Auto-creates a GitHub release when `package.json` version bumps                                          |

Dependency tree inside `ci.yml`:

```text
Tier 1 (parallel, fast)
├── Security Audit
├── Lint
├── Type Check
└── Registry Snapshot

Tier 2
└── Test                   (waits on Lint, Type Check)

Tier 3 — terminal gate
└── Build                  (waits on Audit, Lint, Type Check, Test, Registry)
```

`Build` is the slowest — it never starts unless every cheaper signal is green.

---

## Local Development

```bash
git clone https://github.com/nyuchi/design-portal.git
cd design-portal
pnpm install

# DB-first API + MCP server
cp .env.example .env.local
# NEXT_PUBLIC_SUPABASE_URL=...
# NEXT_PUBLIC_SUPABASE_ANON_KEY=...

pnpm dev
```

---

## Releases

Every merge to `main` that bumps `package.json` version triggers an automatic GitHub release. The release workflow validates all CI gates (lint, typecheck, tests, build) before tagging.

To release a new version:

1. Update `version` in `package.json`
2. Update `BRAND_SYSTEM.version` in `lib/brand.ts`
3. Update the version in `components/landing/footer.tsx`
4. Open a PR — the merge creates the release automatically

See [CHANGELOG.md](CHANGELOG.md) for release history.

---

## Ecosystem

| App            | URL                                              | Role                                       |
| -------------- | ------------------------------------------------ | ------------------------------------------ |
| mukoko         | [mukoko.com](https://mukoko.com)                 | Africa's super app — 17 mini-apps          |
| mukoko weather | [weather.mukoko.com](https://weather.mukoko.com) | Hyperlocal forecasts, farming intelligence |
| mukoko news    | [news.mukoko.com](https://news.mukoko.com)       | Pan-African news aggregation               |
| nhimbe         | [nhimbe.com](https://nhimbe.com)                 | Events and cultural gatherings             |
| lingo          | [lingo.mukoko.com](https://lingo.mukoko.com)     | African language learning                  |
| shamwari       | [shamwari.ai](https://shamwari.ai)               | Sovereign AI companion                     |
| bushtrade      | [bushtrade.co.zw](https://bushtrade.co.zw)       | Rentals-first marketplace                  |
| nyuchi         | [nyuchi.com](https://nyuchi.com)                 | Enterprise layer — 7 products              |
| bundu          | [bundu.family](https://bundu.family)             | The ecosystem                              |

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines, code standards, and the PR process.

For questions and ideas, use [GitHub Discussions](https://github.com/nyuchi/design-portal/discussions).

## Code of Conduct

See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md). Built on Ubuntu: _umuntu ngumuntu ngabantu_ — a person is a person through other persons.

## Security

See [SECURITY.md](SECURITY.md) or report privately via [GitHub Security Advisories](https://github.com/nyuchi/design-portal/security/advisories/new).

## License

Copyright Nyuchi Africa (PVT) Ltd. All rights reserved.
