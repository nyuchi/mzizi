# CLAUDE.md — Mzizi

> **An open-architecture project of the Bundu Foundation.**
> This file is the definitive reference for AI assistants working on this codebase.
> It also serves as the template for CLAUDE.md files across all bundu ecosystem repositories.

---

## 1. Project Identity

**Mzizi** is an **independent open-architecture project of the Bundu Foundation** — governed by the Bundu Foundation, operated and developed by Nyuchi. It is **not** a Nyuchi product. Mzizi owns the open 3D frontend architecture, the component registry (`mzizi.dev/r/`), the Mzizi API (`mzizi.dev/api`), the components, the infrastructure harness, and the architecture nodes it serves.

It serves the full stable registry across a 3D frontend architecture — **ten nodes across five axes**: X-axis (horizontal composition — N2 primitives → N3 brand → N6 pages → N7 shell), Y-axis (vertical infrastructure — N1 tokens, N4 safety, N5 resilience), Z-axis (depth observation — N8 assurance), Outside (N9 — self-healing actors, now owned by `mzizi-tools`), and Documentation (N10). Built on the **Five African Minerals** design system, installable via the shadcn CLI:

```
npx shadcn@latest add https://mzizi.dev/api/v1/ui/<component>
```

**Version:** 4.0.40

**Live at:** mzizi.dev

**Repository:** `github.com/nyuchi/design-portal`

**Governance:** Bundu Foundation. **Operated by:** Nyuchi — `github.com/nyuchi`

**Ecosystem context:** Mzizi is consumed across the bundu ecosystem — the Mukoko consumer family (mini-apps), Nyuchi enterprise products (delivered through the Console), and sister brands. It is the single source of truth for the design system, the component registry, the brand documentation, and the open 3D frontend architecture. Long-form product documentation lives at **docs.bundu.org** (bundu-docs); engineering / how-things-are-done content lives at **docs.nyuchi.com** (nyuchi-docs).

---

## 2. Ecosystem Overview

Mzizi exists within a broader ecosystem. Understanding the relationships prevents duplicate work and keeps the doctrinal split (Mzizi / Mukoko / Nyuchi / Bundu) clean.

| Repository                    | Purpose                                                                                                                                    | Stack                                                   | Status                               |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------- | ------------------------------------ |
| **design-portal** (this repo) | Mzizi portal — component registry, brand, 3D architecture, document-route MCP                                                              | Next.js 16, Tailwind 4, Radix UI, Supabase              | Canonical, active                    |
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
    ├── Defines: Five African Minerals palette, typography, component API,
    │            3D frontend architecture, Ubuntu doctrine
    ├── Serves: the full stable registry across 10 architecture nodes via the
    │           shadcn CLI / `/api/v1/*` (live count: GET /api/v1/stats)
    │           and the document-route MCP at /mcp (mzizi://components, mzizi://nodes)
    │
    └── Consumed by:
        ├── Mukoko consumer apps  (weather, news, nhimbe, super app, …)
        ├── Nyuchi enterprise products — surfaced inside the Console
        │   (each Mzizi mini-app ships as the `mzizi-console-app` npm package
        │    and plugs into platform.nyuchi.com)
        ├── Sister brands (Zimbabwe Information Platform, Barstool by Nyuchi)
        └── Any new bundu ecosystem app — via @nyuchi/design-cli init
```

**Rule:** When building a new app, install components from this registry. Do not copy-paste component code or create parallel component libraries. Mzizi-side agentic tooling (the Fundi self-healing agent, MCP transport, console mini-app shell) lives in `nyuchi/mzizi-tools`; long-form product docs live in `nyuchi/bundu-docs`; engineering docs in `nyuchi/nyuchi-docs`. Do not reintroduce any of those into `design-portal`.

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
| Charts               | Recharts                                           | 3.8.1                                      |
| Testing              | Vitest + Testing Library                           | 4.1.5                                      |
| Observability        | Structured logging (`lib/observability.ts`)        | Built-in                                   |
| Metrics              | MCP usage tracking (`lib/metrics.ts`)              | Built-in                                   |
| Site search          | Pagefind (built in `postbuild` step)               | 1.5.2, static index in `public/_pagefind/` |
| Database             | Supabase (PostgreSQL) — single source of truth     | @supabase/supabase-js 2.104.0              |
| Supabase request ctx | `@supabase/server` (`createSupabaseContext`, anon) | latest                                     |
| MCP Server           | @modelcontextprotocol/sdk (Streamable HTTP)        | 1.29.0                                     |
| CI/CD                | GitHub Actions + Vercel                            | —                                          |
| Deployment           | Vercel                                             | —                                          |

### Mzizi tooling — out-of-repo

The Mzizi agent + MCP + SDK + console mini-app shell are **not** in this repo. They live in `nyuchi/mzizi-tools` and are consumed as published npm packages:

| Package             | Purpose                                                                                                 |
| ------------------- | ------------------------------------------------------------------------------------------------------- |
| `mzizi-mcp`         | Standalone Cloudflare Worker MCP transport (mirrors `/mcp` for non-portal consumers)                    |
| `mzizi-sdk`         | TypeScript SDK + the **Fundi self-healing agent** (Outside-axis actor)                                  |
| `mzizi-skills`      | Published skill bundle (`.md` files) for AI assistants — successor to the in-repo `design-agent-skills` |
| `mzizi-console-app` | Svelte mini-app that surfaces Mzizi inside the Nyuchi Console (platform.nyuchi.com)                     |

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
pnpm registry:sync    # Regenerate registry.json (and committed primitives in components/ui/) from Supabase
pnpm registry:verify  # Non-mutating check — fails CI if registry.json drifts from Supabase
pnpm audit:check      # pnpm audit --audit-level=moderate --ignore-registry-errors
```

Sync flags (passed to `tsx scripts/sync-registry.ts`):

- `--ui-only` — only refresh `components/ui/*` files
- `--json-only` — only refresh `registry.json` snapshot
- `--check` — same as `pnpm registry:verify`

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
│   └── api/
│       ├── brand-route.test.ts       # /api/v1/brand response & headers
│       ├── registry-route.test.ts    # /api/v1/ui registry integrity
│       └── v1/
│           └── architecture-routes.test.ts  # v1 route file existence
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
│   │       ├── architecture/         # /architecture, /architecture/axes, /architecture/layers/[n],
│   │       │                         #   /architecture/frontend/{axes,layers}
│   │       ├── brand/                # Brand system
│   │       ├── changelog/            # Releases (root + [version])
│   │       ├── data-layer/, ecosystem/, pipeline/, sovereignty/
│   │       ├── docs/                 # HTTP 410 — docs moved to bundu-docs (root + [slug])
│   │       ├── health/               # Health check
│   │       ├── search/               # Cross-resource search
│   │       ├── skills/               # Skills index + summary + [name]
│   │       ├── stats/                # Live counts + observability metrics
│   │       ├── ubuntu/               # /ubuntu/pillars, /ubuntu/principles
│   │       └── ui/                   # Registry: list, [name], [name]/docs, [name]/versions
│   ├── mcp/route.ts                  # MCP server HTTP endpoint (document-route)
│   ├── architecture/                 # 3D architecture explorer (page.tsx + layers/[n])
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
│   ├── mcp-server.ts                 # MCP server factory — `createMziziMcpServer(supabase)`
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
└── package.json                      # v4.0.40 (the Next.js app at root)
```

> **Note on `registry.json`:** post-v4.0.26 the authoritative registry lives in the
> Supabase `components` table. `registry.json` is a committed snapshot so PRs show
> registry deltas clearly; `pnpm registry:verify` runs in CI to enforce the snapshot
> stays in sync. Only the primitives the portal itself imports are written into
> `components/ui/`; the rest of the stable registry is served only via `/api/v1/ui`.

---

## 6. Architecture

### 6.1 Registry System

**Single source of truth: the Supabase `components` table** — the stable registry across 10 architecture nodes (live count: `GET /api/v1/stats`), with metadata, dependencies, source code, docs, and version history split across:

| Table                                                  | Purpose                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `components`                                           | Name, type, description, deps, files, source_code, `node` / `architecture_layer`, category, status                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `component_documents`                                  | **Document-route staging table** (the spine of the new lean MCP). One self-contained JSON document per component (`{ owner, sources, legacy, files, … }`) keyed by node collection (`n1_tokens … n10_documentation`). The MCP at `/mcp` reads exclusively from here; the portal's `/api/v1/*` routes read from `components` and `component_docs`. The two surfaces are intentionally separate but stay in lock-step via a read-across pattern — `component_documents.legacy` mirrors the row in `components` so downstream consumers can pivot without duplicate fetches. |
| `component_docs`                                       | Use cases, variants, a11y notes (per component) — served by `/api/v1/ui/{name}/docs`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `component_versions`                                   | Per-component version history — served by `/api/v1/ui/{name}/versions`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `documentation_pages`                                  | **HISTORICAL — content moved to bundu-docs and nyuchi-docs.** All published rows shipped as Astro Starlight pages on `docs.bundu.org` (product docs) and `docs.nyuchi.com` (engineering docs). The DB-driven renderers, the dynamic `[slug]` route, and the `get_documentation_page` MCP tool are all removed; `/api/v1/docs/*` returns HTTP 410 with a `migrated_to` map. The table remains in Supabase as the historical source-of-record. Do not add new rows; author new docs in the Starlight repos. See §15.18.                                                     |
| `changelog`                                            | Releases — `nodes_affected` (1–10), `tools_added/modified/deprecated/removed`, `components_added/modified/deprecated/removed`, `linked_issues`, `released_at`. Served at `/api/v1/changelog` and `/api/v1/changelog/{version}`; rendered into `/changelog` (#107).                                                                                                                                                                                                                                                                                                        |
| `ai_instructions`                                      | System prompts per target (mcp-server, claude, copilot)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `skills`                                               | Agent-skill MDX bodies (single source for `/api/v1/skills*` and the published `mzizi-skills` bundle in `nyuchi/mzizi-tools`)                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `brand_*`                                              | Minerals, semantic colors, typography, spacing, ecosystem brands                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `architecture_*`                                       | Principles, data layer, pipeline, sovereignty assessments, frontend axes/layers                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `ubuntu_pillars/principles`                            | Doctrine rows served at `/api/v1/ubuntu/{pillars,principles}` (and consumed by `app/ubuntu` once #108 lands)                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `fundi_issues`, `observability_events`, `chaos_events` | Open-data event streams behind the `/observability` dashboard (#105) — public, schema.org `Dataset` JSON-LD                                                                                                                                                                                                                                                                                                                                                                                                                                                               |

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
     ├── app/mcp/route.ts (document-route MCP)
     │     └──► createMziziMcpServer(supabase) — reads `component_documents` only
     │
     ├── pnpm registry:sync ──► registry.json + components/ui/*  (committed snapshot)
     │                          (CI runs `pnpm registry:verify` to fail on drift)
     │
     └── lib/db/client.ts (browser localStorage cache, fetched from /api/v1/ui)
```

**`registry.json`** must exist in the repo root, but it is **never hand-edited**. It is regenerated dynamically from Supabase by `pnpm registry:sync` whenever a component is added, modified, or removed in the database. The file is committed so that diffs are visible in PRs and CI can detect drift via `pnpm registry:verify`.

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

The frontend architecture is a **3D model with ten nodes across five axes**. Each component in `components.architecture_layer` (1–10) sits at exactly one position; per-node collections (`n1_tokens … n10_documentation`) are the canonical document-route keying.

| #   | sub_label       | Axis          | Covenant                                                |
| --- | --------------- | ------------- | ------------------------------------------------------- |
| 1   | `tokens`        | Y-axis        | Design decisions are data, not code.                    |
| 2   | `primitive`     | X-axis        | A primitive does one thing well.                        |
| 3   | `brand`         | X-axis        | A brand component is a primitive with Ubuntu in it.     |
| 4   | `safety`        | Y-axis        | Nothing harmful reaches the user.                       |
| 5   | `resilience`    | Y-axis        | Failure in one part never breaks the whole.             |
| 6   | `pages`         | X-axis        | A page is a composition, not an implementation.         |
| 7   | `shell`         | X-axis        | The shell holds the product.                            |
| 8   | `assurance`     | Z-axis        | What breaks is seen before users feel it.               |
| 9   | `fundi`         | Outside       | Failure is a learning event — owned by `mzizi-tools`.   |
| 10  | `documentation` | Documentation | The system documents itself — bundu-docs + nyuchi-docs. |

**Axis meanings:** X = horizontal composition flow (primitives → brand → pages → shell, what the user sees); Y = vertical infrastructure (tokens, safety, resilience threading through every X-layer); Z = depth observation (assurance watching X and Y without being inside anything); Outside = actors beyond the build (Fundi heals autonomously); Documentation = the system describing itself.

**Rules:**

- Components import from the layer below on the same axis — never sideways or upward
- Each component is a standalone file
- N6 pages NEVER hardcode buttons/cards/SVGs — pure composition of N2/N3
- N1 is the only layer allowed to define CSS values — every other layer consumes via `var()`
- N3 always destructures `{ log, motion, LiveRegion }` from `useNyuchiHarness`; N2 never imports it
- All colors and styles come from CSS custom properties in `globals.css`
- This 3D frontend model is **distinct** from the 7-layer data architecture at `/architecture`. Never conflate the two numberings.

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

## 7. Five African Minerals Design System

This is the canonical design system. All bundu ecosystem apps MUST use these tokens.

### 7.1 Color Palette

**Mineral accent colors** (constant across light/dark):

| Mineral    | Hex       | CSS Variable         | Usage                             |
| ---------- | --------- | -------------------- | --------------------------------- |
| Cobalt     | `#0047AB` | `--color-cobalt`     | Primary blue, links, CTAs         |
| Tanzanite  | `#B388FF` | `--color-tanzanite`  | Purple accent, brand/logo         |
| Malachite  | `#64FFDA` | `--color-malachite`  | Cyan accent, success states       |
| Gold       | `#FFD740` | `--color-gold`       | Yellow accent, rewards/highlights |
| Terracotta | `#D4A574` | `--color-terracotta` | Warm accent, community            |

**Semantic color tokens** (theme-adaptive via CSS custom properties):

> **Values synced from the `nyuchi-tokens` registry (N1), April 2026 AAA-optimised swap.**
> Surfaces were re-arranged: `background` is now the ambient page base, `card` is the content surface, `muted` is the deepest fill. Border/input alpha tightened to 0.06. Two new tokens added: `overlay` (modal/sheet surface) and `scrim` (modal backdrop).

| Token                  | Light                 | Dark                     | Usage                         |
| ---------------------- | --------------------- | ------------------------ | ----------------------------- |
| `--background`         | `#F3F2EE`             | `#1B1A17`                | Ambient page base (L10% dark) |
| `--foreground`         | `#141413`             | `#F5F5F4`                | Primary text                  |
| `--card`               | `#FFFFFF`             | `#100F0E`                | Content surface (L6% dark)    |
| `--muted`              | `#FAF9F5`             | `#050504`                | Deepest fill (L2% dark)       |
| `--muted-foreground`   | `#494840`             | `#B2AFA8`                | Secondary text (AAA)          |
| `--overlay`            | `#FFFFFF`             | `#252421`                | Modal / sheet surface (L14%)  |
| `--scrim`              | `rgba(0,0,0,0.40)`    | `rgba(0,0,0,0.60)`       | Modal backdrop                |
| `--border`             | `rgba(10,10,10,0.06)` | `rgba(255,255,255,0.06)` | Borders                       |
| `--primary`            | `#141413`             | `#F5F5F4`                | Primary interactive           |
| `--primary-foreground` | `#FFFFFF`             | `#1B1A17`                | Text on `--primary`           |
| `--destructive`        | `#B3261E`             | `#F2B8B5`                | Error / danger                |

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

1. **Touch targets** — 56px default height, 48px minimum for small variants. Non-negotiable for the African mobile market
2. **Accessibility** — ARIA attributes where needed, semantic HTML, keyboard navigation via Radix primitives
3. **Global styles only** — Tailwind classes backed by CSS custom properties from `globals.css`
4. **`cn()` composition** — all className props composed through `cn()`
5. **CVA variants** — use class-variance-authority for any component with visual variants
6. **Radix primitives** — use Radix UI for accessible behavior (focus management, keyboard nav, screen readers)
7. **`data-slot` attribute** — for component identification in CSS selectors

### 8.3 Adding a New Component

Components are authored **in the Supabase `components` table**, not as files in this repo. The committed `components/ui/*` files are a derived snapshot of the primitives the portal itself imports.

1. Insert the row into `components` (and `component_docs`) in Supabase, including `source_code`, `architecture_layer`, `category`, `dependencies`, `registry_dependencies`, and `status = 'stable'`
2. If the new component should be reachable via the document-route MCP, also insert a row into `component_documents` keyed by the right `n{N}_*` collection
3. Author the source following the CVA + Radix + cn() pattern (see `button.tsx`)
4. Run `pnpm registry:sync` locally to regenerate `registry.json` and (if the new component is portal-imported) `components/ui/<name>.tsx`
5. Verify the API serves it: `curl http://localhost:11736/api/v1/ui/<component-name>`
6. Commit the resulting `registry.json` (and `components/ui/*` if changed) — CI runs `pnpm registry:verify` to fail if the snapshot drifts

### 8.4 Modifying Existing Components

- Edit `source_code` in the `components` table; do not edit `components/ui/*.tsx` directly — they get overwritten by `pnpm registry:sync`
- Preserve the existing CVA variant pattern — add variants, don't restructure
- Keep Radix UI accessibility primitives intact
- Don't break the shadcn registry schema — `https://ui.shadcn.com/schema/registry.json`
- Bump the row's `version` and append to `component_versions` so the changelog API reflects the change
- If the component has a `component_documents` row, also update the document so the MCP stays in sync
- Re-run `pnpm registry:sync` and commit the updated snapshot

### 8.5 When Building a New Bundu Ecosystem App

Install components via the shadcn CLI directly against the registry:

```bash
npx shadcn@latest add https://mzizi.dev/api/v1/ui/button
npx shadcn@latest add https://mzizi.dev/api/v1/ui/card
```

Every new app inherits the canonical typography (Noto Sans / Noto Serif / JetBrains Mono), the Five African Minerals palette, the layered architecture, the pill-button identity, and the touch-target floor. Long-form product docs for any bundu app belong in `nyuchi/bundu-docs`; engineering docs belong in `nyuchi/nyuchi-docs`. Mzizi tooling (MCP, SDK, skills, console mini-app) is consumed from `nyuchi/mzizi-tools` as published npm packages.

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

1. **`components/mukoko/*` paths, `nyuchi-*` item names.** The registry is mid-rename; vendored files keep the `components/mukoko/*` path so that `pnpm registry:sync` sees them as unchanged. When the registry itself completes the rename to `components/nyuchi/*`, run `pnpm registry:sync` + rename locally in a single commit.
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

---

## 9. Mzizi API (v1)

All endpoints are under `/api/v1/` and documented in `openapi.yaml` (OpenAPI 3.1).

All responses include schema.org JSON-LD metadata (`@context`, `@type`) where applicable.

**Common headers:** `Cache-Control: public, max-age=3600, s-maxage=86400`, `Access-Control-Allow-Origin: *` (except `/stats` which is `max-age=60, s-maxage=120` and `/health` which is `no-cache, no-store`).

| Endpoint                                   | Description                                                  | Landed in |
| ------------------------------------------ | ------------------------------------------------------------ | --------- |
| `GET /api/v1`                              | Discovery document — lists all resources                     | —         |
| `GET /api/v1/brand`                        | Brand system (minerals, typography, spacing, ecosystem)      | —         |
| `GET /api/v1/ui`                           | Component registry index                                     | —         |
| `GET /api/v1/ui/{name}`                    | Individual component (shadcn format, with source code)       | —         |
| `GET /api/v1/ui/{name}/docs`               | Component docs (use cases, variants, a11y)                   | —         |
| `GET /api/v1/ui/{name}/versions`           | Component version history                                    | —         |
| `GET /api/v1/ecosystem`                    | Architecture principles & framework decision                 | —         |
| `GET /api/v1/data-layer`                   | Local-first + cloud layer specification                      | —         |
| `GET /api/v1/pipeline`                     | Open data pipeline (Redpanda → Flink → Doris)                | —         |
| `GET /api/v1/sovereignty`                  | Technology sovereignty assessments                           | —         |
| `GET /api/v1/architecture`                 | Full 3D architecture snapshot                                | —         |
| `GET /api/v1/architecture/axes`            | Per-axis summary with live component counts                  | —         |
| `GET /api/v1/architecture/layers/{n}`      | Per-layer detail (covenant, rules, breakdown)                | —         |
| `GET /api/v1/architecture/frontend/axes`   | 5 axes of the 3D frontend architecture                       | —         |
| `GET /api/v1/architecture/frontend/layers` | 10 layers of the 3D frontend architecture                    | —         |
| `GET /api/v1/ubuntu/pillars`               | 5 Ubuntu Pillars                                             | —         |
| `GET /api/v1/ubuntu/principles`            | 5 Ubuntu Principles                                          | —         |
| `GET /api/v1/docs`                         | **HTTP 410 Gone** — content moved to bundu-docs              | —         |
| `GET /api/v1/docs/{slug}`                  | **HTTP 410 Gone** — see `/api/v1/docs` for the slug map      | —         |
| `GET /api/v1/changelog`                    | All releases (from `changelog` table)                        | #107      |
| `GET /api/v1/changelog/{version}`          | Single release                                               | #107      |
| `GET /api/v1/ai/instructions`              | List AI instruction sets                                     | —         |
| `GET /api/v1/ai/instructions/{name}`       | Instruction set by target (mcp-server, claude, copilot)      | —         |
| `GET /api/v1/skills`                       | List published agent skills (lightweight, no body_mdx)       | —         |
| `GET /api/v1/skills/summary`               | Same shape as `/skills`; reserved for CLI update path        | —         |
| `GET /api/v1/skills/{name}`                | Single skill with full `body_mdx`                            | —         |
| `GET /api/v1/search?q=`                    | Cross-resource search (components + docs + changelog)        | —         |
| `GET /api/v1/stats?days=`                  | Open-data usage metrics (CC BY 4.0) — backs `/observability` | #105      |
| `GET /api/v1/health`                       | Service health check (`no-cache, no-store`)                  | —         |

Routes outside `/api/v1/` (intentionally not part of the public v1 contract): `GET /api/openapi` (serves `openapi.yaml`), `GET /api/chaos/{name}` (N5/Y-axis chaos-injection), `GET /api/health/{name}` (per-resource health probe).

**Error responses:** 400 (invalid input), 404 (not found), 410 (gone — `/docs*`), 500 (server error), **503** (Supabase env vars missing — clear "Database not configured" message).

The OpenAPI document is also served at `GET /api/openapi`.

---

## 10. MCP Server (document-route)

The portal runs the **Mzizi MCP server** at `/mcp` via Streamable HTTP transport — a **lean document-route MCP** that reads from `component_documents` and returns whole-document responses.

### Setup

The MCP server is a Next.js API route at `app/mcp/route.ts`, powered by `lib/mcp-server.ts` (`createMziziMcpServer(supabase)`).

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

### Auth model — @supabase/server with `auth: 'none'`

The route handler builds a per-request anon-scoped `SupabaseClient` via `createSupabaseContext` from `@supabase/server` with `auth: 'none'`. The resulting client is read-only under RLS — no service-role key in scope, no write APIs exposed. The factory in `lib/mcp-server.ts` just consumes that client.

```typescript
const { data: ctx, error } = await createSupabaseContext(request, {
  auth: "none",
  cors: false, // CORS handled by the route's own headers
  env: { url: SUPABASE_URL, publishableKeys: { default: SUPABASE_PUBLISHABLE_KEY } },
})
const server = await createMziziMcpServer(ctx.supabase)
```

### Resources (read-only data)

| URI                  | Description                                                                    |
| -------------------- | ------------------------------------------------------------------------------ |
| `mzizi://components` | Mzizi component registry index — name / node / collection / owner per row      |
| `mzizi://nodes`      | Per-node collection summary — counts + ownership breakdown across all 10 nodes |

### Tools (callable actions)

| Tool                  | Description                                                                                                                                                                    |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `list_components`     | List components, optionally filtered by node (1–10) or owner (`bundu` / `nyuchi` / `mzizi` / `framework`). Returns the lean index — use `get_component` for the full document. |
| `get_component`       | Fetch one component as its full JSON document — one read, everything (metadata, owner, sources/descriptors, legacy source code, files, docs)                                   |
| `list_collections`    | List the per-node collections (`n1_tokens … n10_documentation`) with total counts and ownership breakdown                                                                      |
| `get_database_status` | Supabase connection health + document-store row count                                                                                                                          |

### Legacy MCP — protected branch

The previous relational MCP (the wider tool surface that read from `components`, `component_docs`, `brand_*`, `architecture_*`, `ubuntu_*`) lives on the protected `legacy` branch and deploys to `design.nyuchi.com/mcp`. The two are split deliberately — the document-route MCP on `main` is the canonical Mzizi surface; the legacy MCP stays available for consumers that haven't migrated.

---

## 11. Component Categories

The stable registry items live in the Supabase `components` table and are organised across 10 architecture nodes and by function.

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
└── api/
    ├── brand-route.test.ts                      # /api/v1/brand response, headers, data
    ├── registry-route.test.ts                   # /api/v1/ui registry integrity
    └── v1/
        └── architecture-routes.test.ts          # v1 route file existence; legacy routes removed
```

### What Tests Cover

- **API routes:** Brand API returns the correct headers/status/payload shape; the registry response matches the shadcn schema; all expected v1 route files exist on disk; removed legacy routes are confirmed gone.
- **Portal pages:** `/playground` + `/playground/[name]` exist and render through the playground demo registry.

### Running Tests

```bash
pnpm test             # Run all tests once
pnpm test:watch       # Watch mode for development
```

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

- **Current version:** 4.0.40 (must match in `package.json`, `lib/mcp-server.ts` (`VERSION` const), the `changelog` table in Supabase, `components/landing/footer.tsx`, `components/landing/dashboard-sidebar.tsx`, `app/layout.tsx` (`softwareVersion`), `README.md`, and CLAUDE.md §1)
- **Scheme:** `4.0.x` is the internal pre-1.0-public iteration; `4.1.0` is reserved for the first community-contributed release
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

CI additionally runs `pnpm test`, `pnpm build`, and `pnpm registry:verify`.

### Deployment

- **Platform:** Vercel (`mzizi.dev`); automatic deploys from `main`
- **CI gates:** Security audit, lint (zero warnings), typecheck, tests, build, and `registry:verify` must all pass before merge
- **Search index:** the `postbuild` step runs Pagefind against `.next/server/app` and writes the static index into `public/_pagefind/`

---

## 15. LLM Instructions

When working on this codebase as an AI assistant:

1. **Supabase is the source of truth.** Component source code, docs, brand data, architecture data, AI instructions, changelog, document-route docs — all live in Supabase. Do not reintroduce hardcoded JSON/TS files for any of these.
2. **`registry.json` is generated, not authored.** Never hand-edit it. CI runs `pnpm registry:verify` to catch drift.
3. **Never break the shadcn registry schema** — downstream apps depend on it.
4. **Use the Five African Minerals palette** — never introduce colors outside the token system.
5. **Follow the CVA + Radix + cn() pattern** — every component uses this stack.
6. **Keep components self-contained** — each file is independently installable via the registry.
7. **Preserve accessibility** — APCA 3.0 AAA contrast, 56px default / 48px minimum touch targets, Radix primitives for keyboard/screen reader behaviour.
8. **Test API output** — after modifying a component, verify it serves correctly via `/api/v1/ui/[name]`.
9. **Respect the layered architecture** — primitives don't import page-level code. The 3D frontend model has five axes (X horizontal, Y vertical, Z depth, Outside, Documentation). This is distinct from the 7-layer data architecture served at `/architecture` — never conflate the two numberings.
10. **All brand wordmarks lowercase** — `mzizi`, `mukoko`, `nyuchi`, `shamwari`, `bundu`, `nhimbe`.
11. **This is the canonical design system** — changes here propagate to all bundu ecosystem apps.
12. **Run tests before committing** — `pnpm test` must pass; add tests for new behaviour, especially around API routes.
13. **Keep versions in sync** — `package.json`, `lib/mcp-server.ts` (`VERSION`), the `changelog` Supabase row, `components/landing/footer.tsx`, `components/landing/dashboard-sidebar.tsx`, `app/layout.tsx` (`softwareVersion`), `README.md`, and CLAUDE.md §1.
14. **The mineral strip uses 5 mineral colors** and is always vertical (left-edge accent only).
15. **Use the MCP server** — served at `/mcp` via `lib/mcp-server.ts` (`createMziziMcpServer`); reads `component_documents` only. The legacy relational MCP lives on the `legacy` branch.
16. **Resilience patterns** (circuit-breaker, retry, timeout, fallback-chain, ai-safety, chaos) are vendored in `lib/` and also published as `registry:lib` items in Supabase. Consumer apps install them via the shadcn CLI.
17. **Long-form documentation lives outside this repo** — product docs in `nyuchi/bundu-docs` (Astro Starlight → `docs.bundu.org`), engineering docs in `nyuchi/nyuchi-docs` (Astro Starlight → `docs.nyuchi.com`). The portal is a registry + brand + architecture surface, not a docs site. The `documentation_pages` Supabase table is HISTORICAL — content was migrated to the Starlight repos; `/api/v1/docs/*` returns HTTP 410 with a `migrated_to` map; the `get_documentation_page` MCP tool is gone. The `changelog` Supabase table is unaffected — it remains the source of truth for the release-bump workflow.
18. **The playground (`components/playground/`) reads from the API**, not from local files.
19. **API is versioned under `/api/v1/`** — `openapi.yaml` is the contract; update it whenever a route or schema changes.
20. **Buttons are always pill-shaped (`rounded-full`)** across the entire ecosystem.
21. **Security findings are never deferred.** Any vulnerability surfaced during a `/security-review`, a manual audit, a CodeQL alert, a Dependabot advisory, or `pnpm audit` must be fixed inside the current PR — even if the original PR scope is "docs only". The only acceptable exception is when the fix concretely requires infrastructure that isn't available on the PR's branch; in that case, document the gap in `SECURITY.md`, open a tracking issue, AND still ship every code-level mitigation that doesn't require the missing infrastructure.

22. **No known bugs are ever deferred to a follow-up PR.** This is the canonical design system for the bundu ecosystem — every consumer app inherits whatever ships from `main`.

    **A known bug means:** any verified-broken behaviour, any documented contract the code does not honour (e.g. a URL pattern documented in MDX that returns 404, a type/interface name promised in doctrine that doesn't exist), any dependency-version drift that breaks links/state in production, any runtime error path that has been reproduced.

    **NOT bugs (can ship as separate PRs):** unbuilt features documented as `(planned)`; quality work without a runtime symptom; enhancements to surfaces that already function; parallel-track work explicitly carved out by another doctrine section.

    **The audit gate before merge.** Every PR runs through (1) `/security-review`, (2) a gap analysis against this CLAUDE.md, and (3) a sweep of open GitHub issues. Anything matching the bug definition above lands in the same PR — re-scope rather than defer.

23. **Skills are MDX bodies authored once in Supabase.** The `skills` table is the SINGLE source of truth; content flows to `/api/v1/skills*` (HTTP), MCP (when bridged), and the published `mzizi-skills` bundle in `nyuchi/mzizi-tools`. Never duplicate skill content — edit the Supabase row, never the published bundle.

24. **Mzizi vs Mukoko vs Nyuchi vs Bundu — keep the split clean.**
    - **Bundu Foundation** owns Mzizi (governance); Mzizi serves the open 3D architecture, the component registry, and the brand system.
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

When in doubt about whether something is canonical, prefer the Supabase row over any file in the repo.
