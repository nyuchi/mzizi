# Mzizi

> An open-architecture project of the Bundu Foundation — the canonical component registry, brand system, 3D frontend architecture, and AI-native developer portal for the bundu ecosystem. Operated and developed by Nyuchi.

[![CI](https://github.com/nyuchi/design-portal/actions/workflows/ci.yml/badge.svg)](https://github.com/nyuchi/design-portal/actions/workflows/ci.yml)
[![Release](https://github.com/nyuchi/design-portal/actions/workflows/release.yml/badge.svg)](https://github.com/nyuchi/design-portal/actions/workflows/release.yml)
[![CodeQL](https://github.com/nyuchi/design-portal/actions/workflows/github-code-scanning/codeql/badge.svg)](https://github.com/nyuchi/design-portal/security/code-scanning)
[![License: Apache 2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://www.apache.org/licenses/LICENSE-2.0)

**Version:** 4.0.41 | **Live:** [mzizi.dev](https://mzizi.dev) | **Product docs:** [docs.bundu.org](https://docs.bundu.org) | **Engineering docs:** [docs.nyuchi.com](https://docs.nyuchi.com) | **Observability:** [mzizi.dev/observability](https://mzizi.dev/observability)

> The previous Mintlify docs site is retired — long-form docs now live at [docs.bundu.org](https://docs.bundu.org) (product) and [docs.nyuchi.com](https://docs.nyuchi.com) (engineering).

---

## What is Mzizi?

**Mzizi** (Swahili for _root_) is an independent open-architecture project of the **Bundu Foundation**, operated and developed by **Nyuchi**. It owns the open 3D frontend architecture, the component registry served at `mzizi.dev/r/`, the Mzizi API at `mzizi.dev/api`, the Five African Minerals design system, and the document-route Model Context Protocol (MCP) server at `mzizi.dev/mcp`. It is **not** a Nyuchi product — it is a Bundu-governed standard the whole bundu ecosystem (Mukoko consumer mini-apps, Nyuchi enterprise products, sister brands) installs from. Backed by a DB-first architecture (Supabase) and served as a shadcn-compatible API, every component is installable into any project with one command.

---

## Quick install

```bash
npx shadcn@latest add https://mzizi.dev/api/v1/ui/button
```

Install several at once:

```bash
npx shadcn@latest add \
  https://mzizi.dev/api/v1/ui/card \
  https://mzizi.dev/api/v1/ui/dialog \
  https://mzizi.dev/api/v1/ui/data-table
```

Every install carries the canonical typography (Noto Sans / Noto Serif / JetBrains Mono), the Five African Minerals palette, the layered architecture, the pill-button identity, and the 56px touch-target floor.

---

## AI-Native: MCP server

The portal exposes a **document-route MCP server** at `https://mzizi.dev/mcp` (Streamable HTTP transport). Each tool returns a whole self-contained JSON document per component — one fetch, no joins. Configure it in `.claude/settings.json`:

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

Resources:

- `mzizi://components` — component index (name / node / collection / owner)
- `mzizi://nodes` — per-node collection summary

Tools:

- `list_components` — filter by node (1–10) or owner
- `get_component` — full document for one component
- `list_collections` — counts + ownership across all 10 nodes
- `get_database_status` — connection health

The standalone Cloudflare Worker variant (for consumers that don't want to go through `mzizi.dev`), the Fundi self-healing agent, the TypeScript SDK, the published `mzizi-skills` bundle, and the `mzizi-console-app` (Svelte mini-app that surfaces Mzizi inside the Nyuchi Console at `platform.nyuchi.com`) all live in **[`nyuchi/mzizi-tools`](https://github.com/nyuchi/mzizi-tools)** — not in this repo.

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

The registry is live at [mzizi.dev/components](https://mzizi.dev/components). Component counts are always live from the database — see [`/observability`](https://mzizi.dev/observability) for real-time totals and [`GET /api/v1/stats`](https://mzizi.dev/api/v1/stats) for the raw open-data feed (CC BY 4.0).

Browse categories at [mzizi.dev/components](https://mzizi.dev/components) — they are derived live from `components.category`, never hardcoded in this README.

---

## API

All endpoints under `/api/v1/`. Full spec in [`openapi.yaml`](openapi.yaml) (also served at `GET /api/openapi`).

| Endpoint                                       | Method   | Description                                                |
| ---------------------------------------------- | -------- | ---------------------------------------------------------- |
| `/api/v1`                                      | GET      | Discovery document                                         |
| `/api/v1/ui`                                   | GET      | Component registry index                                   |
| `/api/v1/ui/{name}`                            | GET      | Component source + metadata (shadcn format)                |
| `/api/v1/ui/{name}/docs`                       | GET      | Structured docs (use cases, variants, a11y)                |
| `/api/v1/ui/{name}/versions`                   | GET      | Component version history                                  |
| `/api/v1/brand`                                | GET      | Brand system (minerals, typography, spacing)               |
| `/api/v1/architecture`                         | GET      | Full 3D architecture snapshot                              |
| `/api/v1/architecture/axes`                    | GET      | Per-axis summary with live counts                          |
| `/api/v1/architecture/layers/{n}`              | GET      | Per-layer detail (covenant, rules, breakdown)              |
| `/api/v1/architecture/frontend/{axes\|layers}` | GET      | 3D frontend axes / layers                                  |
| `/api/v1/ubuntu/pillars`                       | GET      | Five Ubuntu Pillars                                        |
| `/api/v1/ubuntu/principles`                    | GET      | Five Ubuntu Principles                                     |
| `/api/v1/docs`                                 | GET      | **HTTP 410 Gone** — long-form docs moved to docs.bundu.org |
| `/api/v1/docs/{slug}`                          | GET      | **HTTP 410 Gone** — see `/api/v1/docs` for slug map        |
| `/api/v1/changelog`                            | GET      | Release history                                            |
| `/api/v1/changelog/{version}`                  | GET      | Single release                                             |
| `/api/v1/ai/instructions{,/{name}}`            | GET      | AI instruction sets (mcp-server / claude / copilot)        |
| `/api/v1/skills{,/{name},/summary}`            | GET      | Published agent skills                                     |
| `/api/v1/search?q=`                            | GET      | Cross-resource search (components + docs + changelog)      |
| `/api/v1/ecosystem`                            | GET      | Architecture principles + framework decision               |
| `/api/v1/data-layer`                           | GET      | Local-first + cloud layer specification                    |
| `/api/v1/pipeline`                             | GET      | Open data pipeline (Redpanda, Flink, Doris)                |
| `/api/v1/sovereignty`                          | GET      | Technology sovereignty assessments                         |
| `/api/v1/stats?days=`                          | GET      | Open-data usage metrics (CC BY 4.0, `?days=7\|30\|90`)     |
| `/api/v1/health`                               | GET      | Service health check                                       |
| `/api/openapi`                                 | GET      | OpenAPI 3.1 specification (YAML)                           |
| `/mcp`                                         | POST/GET | MCP server (Streamable HTTP)                               |

---

## Open Data & Observability

Usage metrics are public by design — aligned with the bundu open data philosophy. The [`/observability`](https://mzizi.dev/observability) dashboard shows API call volumes, error rates, p95 latency per endpoint, most-requested components, MCP tool usage breakdown, and 30-day traffic trends (live from `usage_events`, `fundi_issues`, `chaos_events`).

Raw data: `GET https://mzizi.dev/api/v1/stats` — licensed CC BY 4.0.

---

## Tech Stack

| Layer                | Technology                                         | Version        |
| -------------------- | -------------------------------------------------- | -------------- |
| Framework            | Next.js (App Router)                               | 16.2.4         |
| Language             | TypeScript (strict mode)                           | 6.0.3          |
| Styling              | Tailwind CSS 4 + CSS custom properties             | 4.2.4          |
| Component Primitives | Radix UI + Base UI                                 | radix-ui 1.4.3 |
| Variant Management   | class-variance-authority (CVA)                     | 0.7.1          |
| Charts               | Recharts                                           | 3.8.1          |
| Forms                | react-hook-form + zod                              | 7.73.1 / 4.3.6 |
| Database             | Supabase (PostgreSQL)                              | 2.104.0        |
| MCP request context  | `@supabase/server` (`createSupabaseContext`, anon) | latest         |
| MCP SDK              | @modelcontextprotocol/sdk                          | 1.29.0         |
| Icons                | Lucide React                                       | 1.8.0          |
| Testing              | Vitest + Testing Library                           | 4.1.5          |
| CI/CD                | GitHub Actions + Vercel                            | —              |

---

## Commands

| Command                | Description                                                                        |
| ---------------------- | ---------------------------------------------------------------------------------- |
| `pnpm dev`             | Start development server (port 11736)                                              |
| `pnpm build`           | Production build (postbuild runs Pagefind to index `.next/server/app`)             |
| `pnpm check`           | **Run every CI gate locally** — same set CI runs on a PR. Use this before pushing. |
| `pnpm format`          | Auto-fix formatting (prettier) across the whole tree                               |
| `pnpm format:check`    | Check formatting without writing — fails if anything would change                  |
| `pnpm lint`            | ESLint (zero warnings enforced)                                                    |
| `pnpm lint:fix`        | ESLint with `--fix`                                                                |
| `pnpm lint:md`         | markdownlint-cli2 across all `*.md`                                                |
| `pnpm lint:json`       | Parse every tracked `*.json` to ensure validity                                    |
| `pnpm lint:yaml`       | yamllint (requires `pip install yamllint`)                                         |
| `pnpm typecheck`       | TypeScript type check (`tsc --noEmit`)                                             |
| `pnpm test`            | Vitest, single run                                                                 |
| `pnpm test:watch`      | Vitest watch mode                                                                  |
| `pnpm audit:check`     | `pnpm audit --audit-level=moderate` — same gate CI runs                            |
| `pnpm registry:sync`   | Regenerate `registry.json` + committed primitives from Supabase                    |
| `pnpm registry:verify` | Non-mutating drift check (run this if you've touched the DB)                       |

### Run every CI gate before pushing

```bash
pnpm check
# = format:check && lint && lint:md && lint:json
#   && typecheck && test && audit:check && registry:verify && build
```

If `pnpm check` is green, CI will be too.

---

## CI workflows

| Workflow                                                   | Trigger                             | Required checks                                                                                          |
| ---------------------------------------------------------- | ----------------------------------- | -------------------------------------------------------------------------------------------------------- |
| [`ci.yml`](.github/workflows/ci.yml)                       | push to `main`, PR to `main`        | `Lint`, `Type Check`, `Test`, `Build`, `Security Audit`, `Registry Snapshot`                             |
| [`lint.yml`](.github/workflows/lint.yml)                   | push to `main`, PR to `main`        | `lint / actionlint`, `lint / JSON validity`, `lint / prettier`, `lint / markdownlint`, `lint / yamllint` |
| [`claude-review.yml`](.github/workflows/claude-review.yml) | PR open/sync, PR comment, PR review | AI code review on every human comment (advisory, not a merge gate)                                       |
| [`release.yml`](.github/workflows/release.yml)             | tag push (`v*`)                     | Validates `package.json` version matches the tag, then creates a GitHub release                          |

---

## Local Development

```bash
git clone https://github.com/nyuchi/design-portal.git
cd design-portal
pnpm install

cp .env.example .env.local
# NEXT_PUBLIC_SUPABASE_URL=...
# NEXT_PUBLIC_SUPABASE_ANON_KEY=...
# SUPABASE_URL=...                # alias used by @supabase/server (/mcp)
# SUPABASE_PUBLISHABLE_KEY=...    # alias used by @supabase/server (/mcp)

pnpm dev
```

---

## Ecosystem

| Repository                                                               | URL                                                | Role                                                                                                        |
| ------------------------------------------------------------------------ | -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| **[design-portal](https://github.com/nyuchi/design-portal)** (this repo) | [mzizi.dev](https://mzizi.dev)                     | Mzizi portal — registry, brand, 3D architecture, document-route MCP                                         |
| **[nyuchi/mzizi-tools](https://github.com/nyuchi/mzizi-tools)**          | npm packages                                       | Mzizi tooling — `mzizi-mcp` worker, `mzizi-sdk` (with the Fundi agent), `mzizi-skills`, `mzizi-console-app` |
| **[nyuchi/mukoko-platform](https://github.com/nyuchi/mukoko-platform)**  | [platform.nyuchi.com](https://platform.nyuchi.com) | Nyuchi Console — B2B platform (will be renamed `nyuchi-console`)                                            |
| **[nyuchi/bundu-docs](https://github.com/nyuchi/bundu-docs)**            | [docs.bundu.org](https://docs.bundu.org)           | Outward-facing product documentation (Astro Starlight)                                                      |
| **[nyuchi/nyuchi-docs](https://github.com/nyuchi/nyuchi-docs)**          | [docs.nyuchi.com](https://docs.nyuchi.com)         | Engineering / how-things-are-done docs (Astro Starlight)                                                    |
| mukoko                                                                   | [mukoko.com](https://mukoko.com)                   | Africa's super app                                                                                          |
| mukoko weather                                                           | [weather.mukoko.com](https://weather.mukoko.com)   | Hyperlocal forecasts, farming intelligence                                                                  |
| mukoko news                                                              | [news.mukoko.com](https://news.mukoko.com)         | Pan-African news aggregation                                                                                |
| nhimbe                                                                   | [nhimbe.com](https://nhimbe.com)                   | Events and cultural gatherings                                                                              |
| shamwari                                                                 | [shamwari.ai](https://shamwari.ai)                 | Sovereign AI companion                                                                                      |
| nyuchi                                                                   | [nyuchi.com](https://nyuchi.com)                   | Enterprise layer                                                                                            |
| bundu                                                                    | [bundu.family](https://bundu.family)               | The ecosystem                                                                                               |

---

## Releases

Every merge to `main` that bumps `package.json` version triggers an automatic GitHub release. The release workflow validates all CI gates (lint, typecheck, tests, build) before tagging.

The version-bump propagation surfaces are listed in [`CLAUDE.md`](CLAUDE.md) §14. See [`CHANGELOG.md`](CHANGELOG.md) for release history.

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines, code standards, and the PR process. For questions and ideas, use [GitHub Discussions](https://github.com/nyuchi/design-portal/discussions).

## Code of Conduct

See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md). Built on Ubuntu: _umuntu ngumuntu ngabantu_ — a person is a person through other persons.

## Security

See [SECURITY.md](SECURITY.md) or report privately via [GitHub Security Advisories](https://github.com/nyuchi/design-portal/security/advisories/new).

## Governance & License

Mzizi is an **independent open-architecture project of the [Bundu Foundation](https://bundu.family)**, operated and developed by [Nyuchi Africa (PVT) Ltd](https://nyuchi.com). It is **not** a Nyuchi product — Nyuchi is the operator, the Bundu Foundation is the governance body. Anyone in the bundu ecosystem can consume the registry; contribution and direction-setting flow through the Bundu Foundation.

Licensed under the [Apache License 2.0](LICENSE). © Bundu Foundation, operated by Nyuchi Africa (PVT) Ltd. See [NOTICE](NOTICE) for attribution.
