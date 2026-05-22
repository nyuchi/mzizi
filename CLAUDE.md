# CLAUDE.md — Mzizi

> **An open-architecture project of the Bundu Foundation.**
> This file is the definitive reference for AI assistants working on this codebase.
> It also serves as the template for CLAUDE.md files across all bundu ecosystem repositories.

---

## 1. Project Identity

**Mzizi** is an **independent open-architecture project of the Bundu Foundation** — governed by the Bundu Foundation, operated and developed by Nyuchi. It is **not** a Nyuchi product. Mzizi owns the open 3D frontend architecture, the component registry (`mzizi.dev/r/`), the Mzizi API (`mzizi.dev/api`), the components, the infrastructure harness, and architecture nodes N4/N5/N8.

It serves the full stable registry across a 3D frontend architecture — **ten layers across five axes**: X-axis (horizontal composition — L2 primitives → L3 brand → L6 pages → L7 shell), Y-axis (vertical infrastructure — L1 tokens, L4 safety, L5 resilience), Z-axis (depth observation — L8 assurance), Outside (L9 fundi — self-healing actors), and Documentation (L10). Built on the **Five African Minerals** design system, installable via the shadcn CLI:

```
npx shadcn@latest add https://mzizi.dev/api/v1/ui/<component>
```

**Version:** 4.0.39

**Live at:** mzizi.dev

**Repository:** `github.com/nyuchi/design-portal`

**Governance:** Bundu Foundation. **Operated by:** Nyuchi — `github.com/nyuchi`

**Ecosystem context:** Mzizi is consumed across the bundu ecosystem — mukoko (17 consumer mini-apps + 4 substrate components), nyuchi (7 enterprise products), and sister brands (Zimbabwe Information Platform, Barstool by Nyuchi). It is the single source of truth for the design system, brand documentation, and the open architecture.

---

## 2. Ecosystem Overview

Mzizi exists within a broader ecosystem. Understanding the relationships prevents duplicate work and ensures consistency.

| Repository                    | Purpose                                | Stack                                            | Status            |
| ----------------------------- | -------------------------------------- | ------------------------------------------------ | ----------------- |
| **design-portal** (this repo) | Component registry + design system hub | Next.js 16, Tailwind 4, Radix UI                 | Canonical, active |
| **mukoko-weather**            | AI weather intelligence platform       | Next.js 16, FastAPI, ScyllaDB, Claude AI         | Production        |
| **mukoko-news**               | Pan-African news aggregator            | Next.js 15, Cloudflare Workers, Hono, D1         | Active            |
| **mukoko**                    | Super app (17 mini-apps, 4 substrate)  | Next.js + Capacitor, Preact mini-apps, Turborepo | Active            |
| **nhimbe**                    | Events platform                        | Next.js, TypeScript                              | Active            |
| **shamwari-ai**               | Sovereign AI companion                 | Python, Claude AI                                | Active            |
| **nyuchi-main**               | Core platform + API + marketing        | Next.js, Cloudflare Workers                      | Active            |
| **learning**                  | Digital learning experiences           | Astro                                            | Active            |

### Design System Flow

```
design-portal (this repo)
    │
    ├── Defines: Five African Minerals palette, typography, component API
    ├── Serves: the full stable registry across 10 architecture layers via shadcn CLI / API (live count: `GET /api/v1/stats`)
    │
    └── Consumed by:
        ├── mukoko-weather  (weather.mukoko.com)
        ├── mukoko-news     (news.mukoko.com)
        ├── mukoko super app (*.mukoko.com)
        ├── nhimbe          (events.mukoko.com)
        ├── Sister brands   (Zimbabwe Information Platform, Barstool by Nyuchi)
        └── Any new bundu ecosystem app
```

**Rule:** When building a new app, install components from this registry. Do not copy-paste component code or create parallel component libraries.

---

## 3. Tech Stack

| Layer                | Technology                                      | Version                                    |
| -------------------- | ----------------------------------------------- | ------------------------------------------ |
| Framework            | Next.js (App Router) + `@next/mdx`              | 16.2.4                                     |
| Language             | TypeScript (strict mode)                        | 6.0.3                                      |
| Package Manager      | pnpm                                            | 10.33.0                                    |
| Styling              | Tailwind CSS + CSS custom properties            | 4.2.4                                      |
| Component Primitives | Radix UI + Base UI                              | radix-ui 1.4.3, @base-ui/react 1.4.1       |
| Variant Management   | class-variance-authority (CVA)                  | 0.7.1                                      |
| Class Composition    | clsx + tailwind-merge                           | via `cn()` in `lib/utils.ts`               |
| Icons                | Lucide React                                    | 1.8.0                                      |
| Theming              | next-themes                                     | 0.4.6                                      |
| Forms                | react-hook-form + zod                           | 7.73.1 / 4.3.6                             |
| Charts               | Recharts                                        | 3.8.1                                      |
| Testing              | Vitest + Testing Library                        | 4.1.5                                      |
| Observability        | Structured logging (`lib/observability.ts`)     | Built-in                                   |
| Metrics              | MCP usage tracking (`lib/metrics.ts`)           | Built-in                                   |
| Site search          | Pagefind (built in `postbuild` step)            | 1.5.2, static index in `public/_pagefind/` |
| Database             | Supabase (PostgreSQL) — single source of truth  | @supabase/supabase-js 2.104.0              |
| MCP Server           | @modelcontextprotocol/sdk (Streamable HTTP)     | 1.29.0                                     |
| CLI                  | @nyuchi/design-cli (workspace package)          | 0.1.0                                      |
| Skills bundle        | @nyuchi/design-agent-skills (workspace package) | 1.0.0                                      |
| Workspace            | pnpm workspace (`packages/*`)                   | pnpm 10.33                                 |
| CI/CD                | GitHub Actions + Vercel                         | —                                          |
| Deployment           | Vercel                                          | —                                          |

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
│   └── skills/
│       ├── nyuchi-design-system.md   # Design system guidance skill
│       ├── ecosystem-app-setup.md    # Bootstrapping a new bundu ecosystem app
│       └── scaffold-component.md     # Pattern for adding a new registry component
├── .github/
│   └── workflows/
│       ├── ci.yml                    # Lint, typecheck, test, build, audit
│       ├── claude-review.yml         # AI code review on PRs via Claude
│       └── release.yml               # Validate + create GitHub release on tags
├── .husky/
│   └── pre-commit                    # lint-staged → typecheck → audit
├── __tests__/                        # Vitest test suite (currently 3 files)
│   └── api/
│       ├── brand-route.test.ts       # /api/v1/brand response & headers
│       ├── registry-route.test.ts    # /api/v1/ui registry integrity
│       └── v1/
│           └── architecture-routes.test.ts  # v1 route file existence
├── app/                              # Next.js App Router (@next/mdx for .mdx routes)
│   ├── globals.css                   # Theme tokens + Tailwind imports (token SOURCE OF TRUTH)
│   ├── layout.tsx                    # Root layout (fonts, ThemeProvider)
│   ├── page.mdx                      # Landing page
│   ├── error.tsx, global-error.tsx, not-found.tsx
│   ├── icon.svg, apple-icon.svg
│   ├── robots.ts                     # robots.txt generator
│   ├── sitemap.ts                    # sitemap.xml generator
│   ├── api/
│   │   ├── openapi/route.ts          # OpenAPI document
│   │   └── v1/                       # Mzizi API v1 (see §9)
│   │       ├── route.ts              # Discovery document
│   │       ├── ai/instructions/      # AI instruction sets (mcp-server / claude / copilot)
│   │       ├── brand/                # Brand system
│   │       ├── changelog/            # Releases (root + [version])
│   │       ├── data-layer/, ecosystem/, pipeline/, sovereignty/  # Architecture topics
│   │       ├── docs/                 # HTTP 410 — docs moved to mzizi.dev/docs (root + [slug])
│   │       ├── health/               # Health check
│   │       ├── search/               # Cross-resource search
│   │       ├── stats/                # Live counts + layer breakdown
│   │       └── ui/                   # Registry: list, [name], [name]/docs, [name]/versions
│   ├── mcp/route.ts                  # MCP server HTTP endpoint
│   ├── architecture/                 # 3D architecture explorer (page.tsx + layers/[n])
│   ├── components/                   # Component gallery (page.tsx + [name])
│   ├── design/, docs/, foundations/, observability/, patterns/, registry/   # MDX doc routes
├── components/
│   ├── docs/                         # DB-driven docs renderers (DEPRECATED — see §15.18)
│   ├── landing/                      # Portal-specific compositions over registry components
│   │                                 #   (header, footer, dashboard-sidebar, breadcrumbs, toc,
│   │                                 #   hero, install-steps, ai-native, build-with, explore,
│   │                                 #   resilient-by-design, architecture-canvas / explorer)
│   ├── layout/                       # mineral-strip.tsx, nyuchi-logo.tsx
│   ├── mdx/                          # MDX-author-facing components (Callout, ...)
│   ├── mukoko/                       # Vendored registry:ui brand components
│   │                                 #   (mukoko-header, mukoko-footer, mukoko-theme-provider,
│   │                                 #   mukoko-skeleton-set, mukoko-error-set,
│   │                                 #   mukoko-verified-badge) — registry paths kept as-is
│   │                                 #   for pnpm registry:sync parity, see §8.6 note
│   ├── patterns/                     # Pattern demos (architecture, observability,
│   │                                 #   error-boundary, lazy-loading, component-pattern, code-block)
│   ├── playground/                   # Interactive component gallery + API tester
│   ├── ui/                           # ~35 portal primitives (the only registry items committed
│   │                                 #   to disk; the other ~510 live only in Supabase
│   │                                 #   and are served via /api/v1/ui) — plus user-menu.tsx
│   │                                 #   (vendored from nyuchi-user-menu)
│   ├── error-boundary.tsx, lazy-section.tsx, section-error-boundary.tsx
│   ├── theme-provider.tsx, theme-toggle.tsx
│   └── example.tsx
├── hooks/
│   ├── use-mobile.ts                 # Mobile breakpoint (768px)
│   └── use-memory-pressure.ts        # Memory pressure observer
├── lib/
│   ├── utils.ts                      # cn() utility (clsx + tailwind-merge)
│   ├── icons.ts                      # Re-export shim for @/lib/icons (lucide-react passthrough)
│   ├── observability.ts              # Structured logging with [mukoko] prefix
│   ├── metrics.ts                    # MCP/API usage tracking
│   ├── mcp-server.ts                 # MCP server factory (served at /mcp)
│   ├── nav.ts                        # Shared nav data for header + sidebar (curated, not auto-gen)
│   ├── harness/                      # Vendored: NyuchiHarness + useNyuchiHarness hook
│   │                                 #   (observability + motion + a11y + health wiring)
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
├── packages/                         # pnpm workspace — published npm packages
│   ├── design-cli/                   # @nyuchi/design-cli — bootstraps consumer
│   │                                 #   apps (init / add / skills install/update)
│   └── design-agent-skills/          # @nyuchi/design-agent-skills — published
│                                     #   snapshot of the Supabase `skills` table;
│                                     #   regenerated by `pnpm skills:sync`
├── pnpm-workspace.yaml               # declares packages/* as workspace members
├── .claude-plugin/
│   └── plugin.json                   # Claude Code plugin marketplace manifest
│                                     #   (skills paths + MCP server + icons)
├── registry.json                     # Generated snapshot of Supabase `components` (CI verifies drift)
├── openapi.yaml                      # OpenAPI 3.1 specification for /api/v1/
├── vitest.config.ts, vitest.setup.ts
├── components.json                   # shadcn CLI configuration
├── next.config.mjs, tsconfig.json, postcss.config.mjs, eslint.config.mjs, .prettierrc
└── package.json                      # v4.0.39 (private; the Next.js app at root)
```

> **Note on `registry.json`:** post-v4.0.26 the authoritative registry lives in the
> Supabase `components` table. `registry.json` is a committed snapshot so PRs show
> registry deltas clearly; `pnpm registry:verify` runs in CI to enforce the snapshot
> stays in sync. Only the ~35 primitives the portal itself imports are written into
> `components/ui/`; the rest of the stable registry is served only via `/api/v1/ui` (live count from `GET /api/v1/stats`).

---

## 6. Architecture

### 6.1 Registry System

**Single source of truth: the Supabase `components` table** — the stable registry across 10 architecture layers (live count: `GET /api/v1/stats` → `stable`), with metadata, dependencies, source code, docs, and version history split across:

| Table                 | Purpose                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `components`          | Name, type, description, deps, files, source_code, architecture_layer, category, status                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `component_docs`      | Use cases, variants, a11y notes (per component)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `component_versions`  | Per-component version history                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `documentation_pages` | **HISTORICAL — content migrated to repo MDX, renderers + API removed.** All 10 published rows shipped as repo MDX under `/docs/*`, `/architecture/*`, `/brand`, and `/foundations/tokens`. The DB-driven renderers (`components/docs/db-doc-page.tsx`, `db-doc-index.tsx`) and the dynamic `[slug]` route are deleted; `/api/v1/docs/*` returns HTTP 410 with a `migrated_to` map; the `get_documentation_page` MCP tool is removed. The table remains in Supabase as the historical source-of-record. Do not add new rows; author new docs as MDX. See §15.18. |
| `changelog`           | Releases (currently 4.0.0 → 4.0.39)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `ai_instructions`     | System prompts per target (mcp-server, claude, copilot)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `brand_*`             | Minerals, semantic colors, typography, spacing, ecosystem brands                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `architecture_*`      | Principles, data layer, pipeline, sovereignty assessments                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |

API responses follow the shadcn registry schema at `https://ui.shadcn.com/schema/registry.json`.

**Data flow:**

```
Supabase (source of truth)
     │
     ├── lib/db/index.ts (server-side queries)
     │     ├──► /api/v1/* (Next.js API routes — CORS + 1h cache)
     │     ├──► /mcp      (MCP server — tools & resources)
     │     └──► Server components (architecture / brand / docs MDX pages)
     │
     ├── pnpm registry:sync ──► registry.json + components/ui/*  (committed snapshot)
     │                          (CI runs `pnpm registry:verify` to fail on drift)
     │
     └── lib/db/client.ts (browser localStorage cache, fetched from /api/v1/ui)
```

**`registry.json`** must exist in the repo root, but it is **never hand-edited**. It is regenerated dynamically from Supabase by `pnpm registry:sync` whenever a component is added, modified, or removed in the database. The file is committed so that diffs are visible in PRs and CI can detect drift via `pnpm registry:verify`.

**Registry item schema:**

```json
{
  "name": "button",
  "type": "registry:ui",
  "description": "Displays a button or a component that looks like a button.",
  "dependencies": ["radix-ui", "class-variance-authority"],
  "registryDependencies": ["other-component-names"],
  "files": [{ "path": "components/ui/button.tsx", "type": "registry:ui" }]
}
```

**Item types:** `registry:ui` (components), `registry:hook` (hooks), `registry:lib` (utilities), `registry:block` (page blocks)

**Required env vars:**

```
NEXT_PUBLIC_SUPABASE_URL       — Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY  — public anon key (read-only via RLS)
SUPABASE_SERVICE_ROLE_KEY      — write access; server-only, never expose
```

Every route in the portal is public and anon-readable. There is no authenticated surface — the registry, brand, MCP, and API routes are all open. (The Fundi self-healing dashboard and its Stytch B2B auth were removed when Fundi moved to the Nyuchi platform.)

### 6.2 Layered Component Architecture

Every component follows a layered pattern. This is mandatory for all bundu ecosystem apps consuming this registry.

The frontend architecture is a **3D model with ten layers across five axes**. Each component in `components.architecture_layer` (1-10) and `components.layer` (sub-label) sits at exactly one position. Issue #46 tracks moving this mapping into first-class Supabase tables (`architecture_frontend_layers`, `architecture_frontend_axes`); until then the mapping is also enumerated in `get_layer_counts()`.

| #   | sub_label       | Axis          | Covenant                                                 |
| --- | --------------- | ------------- | -------------------------------------------------------- |
| 1   | `tokens`        | Y-axis        | Design decisions are data, not code.                     |
| 2   | `primitive`     | X-axis        | A primitive does one thing well.                         |
| 3   | `brand`         | X-axis        | A brand component is a primitive with Ubuntu in it.      |
| 4   | `safety`        | Y-axis        | Nothing harmful reaches the user.                        |
| 5   | `resilience`    | Y-axis        | Failure in one part never breaks the whole.              |
| 6   | `pages`         | X-axis        | A page is a composition, not an implementation.          |
| 7   | `shell`         | X-axis        | The shell holds the product.                             |
| 8   | `assurance`     | Z-axis        | What breaks is seen before users feel it.                |
| 9   | `fundi`         | Outside       | Failure is a learning event, not a user-facing incident. |
| 10  | `documentation` | Documentation | The system documents itself in code — MDX in the repo.   |

**Axis meanings:** X = horizontal composition flow (primitives → brand → pages → shell, what the user sees); Y = vertical infrastructure (tokens, safety, resilience threading through every X-layer); Z = depth observation (assurance watching X and Y without being inside anything); Outside = actors beyond the build (fundi heals autonomously); Documentation = the system describing itself.

**Rules:**

- Components import from the layer below on the same axis — never sideways or upward
- Each component is a standalone file
- L6 pages NEVER hardcode buttons/cards/SVGs — pure composition of L2/L3
- L1 is the only layer allowed to define CSS values — every other layer consumes via `var()`
- L3 always destructures `{ log, motion, LiveRegion }` from `useNyuchiHarness`; L2 never imports it
- All colors and styles come from CSS custom properties in `globals.css`
- This 3D frontend model is **distinct** from the 7-layer data architecture at `/architecture` (Pod → Relational → Document → Orchestration → Edge → Device → Open Data). Never conflate the two numberings — a component can sit at frontend L3 and read from data L2 without contradiction.

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
        // ...
      },
      size: {
        default: "h-9 gap-1.5 px-3",
        sm: "h-8 gap-1 px-3",
        // ...
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
- All errors logged via `createLogger("<scope>")` from `lib/observability.ts`, with `[mukoko]` prefix for grep-ability
- Components and resilience patterns (circuit-breaker, retry, timeout, fallback-chain, ai-safety, chaos) are no longer kept as `lib/*` files in this repo — their canonical source lives in the Supabase `components` table as `registry:lib` items and is installed by consumer apps via the shadcn CLI

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

> **Values synced from the `nyuchi-tokens` registry (L1), April 2026 AAA-optimised swap.**
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

All brand wordmarks are **lowercase**: `mukoko`, `nyuchi`, `shamwari`.

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

**Buttons are always pill-shaped (`rounded-full`).** This is an executive brand identity decision — not a radius scale value. All buttons, tabs, and interactive pill-shaped controls use `rounded-full` (9999px). This applies across the entire ecosystem: every app, every API response, every MCP tool, every documentation reference.

---

## 8. Conventions

### 8.1 Code Style

- **Path alias:** `@/*` maps to project root (e.g., `import { cn } from "@/lib/utils"`)
- **shadcn style:** "new-york" with neutral base color
- **Tailwind utility classes only** — no inline styles, no CSS modules (except embed widgets)
- **TypeScript strict mode** — maintain type safety, no `any` without justification
- **Exports:** Named exports for components (`export { Button, buttonVariants }`), not default exports
- **File naming:** kebab-case for files (`button-group.tsx`), PascalCase for components (`ButtonGroup`)

### 8.2 Component Requirements

Every component in `components/ui/` MUST have:

1. **Touch targets** — 56px default height, 48px minimum for small variants. This is non-negotiable for the African mobile market (outdoor use, varied screen sizes, accessibility)
2. **Accessibility** — ARIA attributes where needed, semantic HTML, keyboard navigation via Radix primitives
3. **Global styles only** — Tailwind classes backed by CSS custom properties from `globals.css`
4. **`cn()` composition** — all className props composed through `cn()`
5. **CVA variants** — use class-variance-authority for any component with visual variants
6. **Radix primitives** — use Radix UI for accessible behavior (focus management, keyboard nav, screen readers)
7. **`data-slot` attribute** — for component identification in CSS selectors

### 8.3 Adding a New Component

Components are authored **in the Supabase `components` table**, not as files in this repo. The committed `components/ui/*` files are a derived snapshot of the ~35 primitives the portal itself imports.

1. Insert the row into `components` (and `component_docs`) in Supabase, including `source_code`, `architecture_layer`, `category`, `dependencies`, `registry_dependencies`, and `status = 'stable'`
2. Author the source following the CVA + Radix + cn() pattern (see `button.tsx` as reference)
3. Run `pnpm registry:sync` locally to regenerate `registry.json` and (if the new component is portal-imported) `components/ui/<name>.tsx`
4. Verify the API serves it: `curl http://localhost:11736/api/v1/ui/<component-name>`
5. Commit the resulting `registry.json` (and `components/ui/*` if changed) — CI runs `pnpm registry:verify` to fail if the snapshot drifts

### 8.4 Modifying Existing Components

- Edit `source_code` in the `components` table; do not edit `components/ui/*.tsx` directly — they get overwritten by `pnpm registry:sync`
- Preserve the existing CVA variant pattern — add variants, don't restructure
- Keep Radix UI accessibility primitives intact
- Don't break the shadcn registry schema — `https://ui.shadcn.com/schema/registry.json`
- Bump the row's `version` and append to `component_versions` so the changelog API reflects the change
- Re-run `pnpm registry:sync` and commit the updated snapshot

### 8.5 When Building a New Bundu Ecosystem App

One command:

```bash
npx @nyuchi/design-cli init
```

This scaffolds a fresh project with `app/globals.css` (the L1 token block — `:root` + `.dark` + `@theme inline`), `lib/utils.ts` (the `cn()` helper), `components/theme-provider.tsx` (next-themes wrapper), and `components.json` (shadcn CLI config). Pass `--force` to overwrite existing files.

Then install components from the registry as needed:

```bash
npx @nyuchi/design-cli add button card data-table       # wraps shadcn CLI
# or directly:
npx shadcn@latest add https://mzizi.dev/api/v1/ui/button
```

And install agent skills so AI assistants in the project know the doctrine:

```bash
npx @nyuchi/design-cli skills install                   # all skills, live from /api/v1/skills
# or, equivalent, via the community skills CLI:
npx skills add @nyuchi/design-agent-skills              # offline-friendly, ships .md files
```

Every new app inherits the canonical typography (Noto Sans / Noto Serif / JetBrains Mono), the Five African Minerals palette, the layered architecture, the pill-button identity, and the touch-target floor. The CLI is the single source of bootstrap truth.

### 8.6 Distribution surface — shipped

Three distribution surfaces, all live:

```bash
# 1. shadcn CLI — components from the registry
npx shadcn@latest add https://mzizi.dev/api/v1/ui/<component>

# 2. Nyuchi Design CLI — bootstrap + components + skills
npx @nyuchi/design-cli init
npx @nyuchi/design-cli add <component>
npx @nyuchi/design-cli skills install
npx @nyuchi/design-cli skills update

# 3. Skills installer — markdown bundle for any AI assistant
npx skills add @nyuchi/design-agent-skills

# 4. Claude Code plugin marketplace (declared via .claude-plugin/plugin.json)
/plugin marketplace add nyuchi/design-portal
/plugin install nyuchi-design

# 5. Direct HTTP — raw MDX for any consumer
GET https://mzizi.dev/api/v1/skills           # list
GET https://mzizi.dev/api/v1/skills/summary   # light list for version diff
GET https://mzizi.dev/api/v1/skills/{name}    # full MDX body
```

Both npm packages live in this repo as workspace members under `packages/` and are published on every `v*` tag by `.github/workflows/release.yml` (uses `NPM_TOKEN`). Skills are source-of-truthed in the Supabase `skills` table; `pnpm skills:sync` regenerates `packages/design-agent-skills/skills/*.md` from the live DB before publish (CI verifies via `pnpm skills:verify`). The `@nyuchi/design-cli` `skills install` subcommand fetches live from the API on every run, so consumers always pull the latest doctrine without re-installing the npm package.

### 8.7 Vendored registry stack — path + naming drift

The portal dogfoods its own registry. The 33-item transitive closure of `nyuchi-header` / `nyuchi-footer` / `nyuchi-user-menu` is vendored into this repo — the harness, resilience, tokens, motion, a11y, theme-provider, skeleton/error sets, verified-badge, and the seven resilience primitives (circuit-breaker, retry, timeout, fallback-chain, bulkhead, rate-limiter, chaos).

**Two divergences between the registry's declared paths and the portal's reality**:

1. **`components/mukoko/*` paths, `nyuchi-*` item names.** The registry is mid-rename (CLAUDE.md §11 already reflects the `nyuchi-*` names, but the registry's `files[].path` still points at `components/mukoko/mukoko-header.tsx`, etc.). Vendored files keep the `components/mukoko/*` path so that future `pnpm registry:sync` sees them as unchanged and doesn't try to overwrite with reshaped paths. When the registry itself completes the rename to `components/nyuchi/*`, run `pnpm registry:sync` + rename locally in a single commit.
2. **Brand component imports use `@/components/brand/*` paths** that don't exist in this repo. The portal keeps `nyuchi-logo.tsx` and `mineral-strip.tsx` under `@/components/layout/` instead. Vendored files are patched on install to target the portal's real paths. Next `pnpm registry:sync` will re-patch automatically via the sync script (issue to be filed against the registry to align paths).

**Upstream-bug tracking.** The vendor pass fixed 11 genuine bugs in the registry source code (template-literal escape artefacts, broken exports, missing prop definitions, type mismatches). They are listed in the commit message of the vendor commit and mirrored in a tracking GitHub issue. Re-running `pnpm registry:sync` before the upstream issues close will reintroduce the bugs — the sync script may need a patch-set overlay until the registry is clean.

**Footer composition note.** `components/landing/footer.tsx` is deliberately NOT a one-line wrapper over `NyuchiFooter`. The portal footer has four portal-specific features NyuchiFooter doesn't currently expose: (1) the ecosystem brand grid (mukoko-consumer + nyuchi-enterprise columns), (2) a socials row (GitHub x2, X/Twitter), (3) an inline `ThemeToggle`, (4) a version line. The portal footer is a composition of primitives (`Separator`, `NyuchiLogo`, `ThemeToggle`) — not a hand-rolled variation of `NyuchiFooter`. Extending `NyuchiFooter` upstream with `ecosystem` / `socials` / `actions` / `version` props so the portal can fully dogfood it is a tracked follow-up.

### 8.8 registry.json Schema Reference

```json
{
  "$schema": "https://ui.shadcn.com/schema/registry.json",
  "name": "mukoko",
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

**Common headers:** `Cache-Control: public, max-age=3600, s-maxage=86400`, `Access-Control-Allow-Origin: *`

| Endpoint                                   | Description                                                | Supabase source                |
| ------------------------------------------ | ---------------------------------------------------------- | ------------------------------ |
| `GET /api/v1`                              | Discovery document — lists all resources                   | —                              |
| `GET /api/v1/brand`                        | Brand system (minerals, typography, spacing, ecosystem)    | `brand_*` tables               |
| `GET /api/v1/ui`                           | Component registry index                                   | `components`                   |
| `GET /api/v1/ui/{name}`                    | Individual component (shadcn format, with source code)     | `components`                   |
| `GET /api/v1/ui/{name}/docs`               | Component docs (use cases, variants, a11y)                 | `component_docs`               |
| `GET /api/v1/ui/{name}/versions`           | Component version history                                  | `component_versions`           |
| `GET /api/v1/ecosystem`                    | Architecture principles & framework decision               | `architecture_principles`      |
| `GET /api/v1/data-layer`                   | Local-first + cloud layer specification                    | `architecture_data_layer`      |
| `GET /api/v1/pipeline`                     | Open data pipeline (Redpanda → Flink → Doris)              | `architecture_pipeline`        |
| `GET /api/v1/sovereignty`                  | Technology sovereignty assessments                         | `architecture_sovereignty`     |
| `GET /api/v1/architecture/frontend/axes`   | 5 axes of the 3D frontend architecture                     | `architecture_frontend_axes`   |
| `GET /api/v1/architecture/frontend/layers` | 10 layers of the 3D frontend architecture                  | `architecture_frontend_layers` |
| `GET /api/v1/ubuntu/pillars`               | 5 Ubuntu Pillars                                           | `ubuntu_pillars`               |
| `GET /api/v1/ubuntu/principles`            | 5 Ubuntu Principles                                        | `ubuntu_principles`            |
| `GET /api/v1/docs`                         | **HTTP 410 Gone** — content moved to repo MDX (see §15.18) | —                              |
| `GET /api/v1/docs/{slug}`                  | **HTTP 410 Gone** — content moved to repo MDX (see §15.18) | —                              |
| `GET /api/v1/changelog`                    | All releases                                               | `changelog`                    |
| `GET /api/v1/changelog/{version}`          | Single release                                             | `changelog`                    |
| `GET /api/v1/ai/instructions`              | List AI instruction sets                                   | `ai_instructions`              |
| `GET /api/v1/ai/instructions/{name}`       | Instruction set by target (mcp-server, claude, copilot)    | `ai_instructions`              |
| `GET /api/v1/skills`                       | List published agent skills (lightweight, no body_mdx)     | `skills`                       |
| `GET /api/v1/skills/summary`               | Same shape as `/skills`; reserved for the CLI update path  | `skills`                       |
| `GET /api/v1/skills/{name}`                | Single skill with full `body_mdx`                          | `skills`                       |
| `GET /api/v1/search?q=`                    | Cross-resource search (components + docs + changelog)      | multiple                       |
| `GET /api/v1/stats`                        | Live counts (total stable, per layer, per category)        | `components`                   |
| `GET /api/v1/health`                       | Service health check (`no-cache, no-store`)                | runtime checks                 |

**Common response headers:** `Cache-Control: public, max-age=3600, s-maxage=86400`, `Access-Control-Allow-Origin: *` (except `/health` which is `no-cache, no-store`).

**Error responses:** 400 (invalid input), 404 (not found), 500 (server error), **503** (Supabase env vars missing — the API replies with a clear "Database not configured" message).

The OpenAPI document is also served at `GET /api/openapi`.

---

## 10. MCP Server

The registry includes a **Model Context Protocol (MCP) server** served at `/mcp` via Streamable HTTP transport. It exposes the registry, brand system, and design tokens to AI assistants.

### Setup

The MCP server is a Next.js API route at `app/mcp/route.ts`, powered by `lib/mcp-server.ts`.

Configured in `.claude/settings.json`:

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

**Endpoint:** `POST /mcp` (JSON-RPC), `GET /mcp` (SSE), `DELETE /mcp` (cleanup), `OPTIONS /mcp` (CORS preflight)

### Resources (read-only data)

| URI                      | Description                                                 |
| ------------------------ | ----------------------------------------------------------- |
| `mukoko://registry`      | Full component registry index                               |
| `mukoko://brand`         | Complete brand system data                                  |
| `mukoko://design-tokens` | Five African Minerals palette + semantic tokens             |
| `mukoko://architecture`  | Ecosystem architecture (principles, framework, sovereignty) |
| `mukoko://ubuntu`        | Ubuntu philosophy — community-first design doctrine         |

### Tools (callable actions)

| Tool                        | Description                                                                                       |
| --------------------------- | ------------------------------------------------------------------------------------------------- |
| `list_components`           | List all registry components, optionally filtered by type/layer                                   |
| `get_component`             | Get a component's source code + metadata                                                          |
| `get_component_docs`        | Get a component's structured documentation (use cases, variants, a11y notes)                      |
| `get_component_links`       | Get all portal URLs for a component                                                               |
| `get_component_versions`    | Get version history for a component                                                               |
| `search_components`         | Search components by name / description / category                                                |
| `get_design_tokens`         | Get color palette, typography, spacing tokens                                                     |
| `scaffold_component`        | Generate a new component following the CVA + Radix + cn() pattern                                 |
| `get_install_command`       | Get the shadcn CLI install command for one or more components                                     |
| `get_brand_info`            | Get information about a specific ecosystem brand                                                  |
| `get_architecture_info`     | Get architecture info by category (ecosystem, data-layer, pipeline, sovereignty)                  |
| `get_ubuntu_doctrine`       | Read the static Ubuntu philosophy doctrine (philosophy, design, community, AI framing, languages) |
| `get_ubuntu_pillars`        | Five Ubuntu Pillars — rows from `ubuntu_pillars`                                                  |
| `get_ubuntu_principles`     | Five Ubuntu Principles — rows from `ubuntu_principles`                                            |
| `get_architecture_frontend` | 3D frontend axes + layers — rows from `architecture_frontend_axes`/`_layers`                      |
| `get_database_status`       | Health/diagnostic info about the Supabase connection                                              |
| `get_usage_stats`           | MCP/API usage metrics                                                                             |
| `get_layer_summary`         | Component count, categories, and names for a given architecture layer (1–10)                      |
| `list_skills`               | List every published agent skill (summary; no body_mdx). Reads the Supabase `skills` table.       |
| `get_skill`                 | Fetch a single skill (full body_mdx) by name. Reads via `get_skill(name)` SQL helper.             |
| `get_ai_instructions`       | Read system prompts from `ai_instructions` by target                                              |
| `get_changelog`             | Recent releases from the `changelog` table                                                        |

### Architecture

- **`lib/mcp-server.ts`** — Server factory (`createMukokoMcpServer()`) with all tools and resources
- **`app/mcp/route.ts`** — HTTP endpoint using `WebStandardStreamableHTTPServerTransport` (stateless)
- All data read from Supabase — zero hardcoded content

---

## 11. Component Categories

The stable registry items live in the Supabase `components` table and are organised across 10 architecture layers and by function. Counts/items below are a snapshot — **query `GET /api/v1/stats` or the `get_layer_summary` MCP tool for live numbers, and never hardcode a component count anywhere in the repo** (user-facing docs render the live value via `<LiveComponentCount />` from `components/live-component-count.tsx`). Only the ~35 portal primitives are committed to `components/ui/`; the rest are served only via `/api/v1/ui` and installed by consumer apps via the shadcn CLI.

| Category                  | Count | Components                                                                                                                                                                                                                                                                                                                                                                 |
| ------------------------- | ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Forms & Input**         | 28    | calendar, checkbox, combobox, command, date-picker, date-range-picker, field, file-upload, form, input, input-group, input-otp, label, native-select, radio-group, search-bar, select, slider, switch, textarea, phone-input, tag-input, time-picker, rich-text-editor, code-editor, color-picker, address-input, transfer-list, number-input, autocomplete, mention-input |
| **Chat & Messaging**      | 8     | chat-bubble, chat-list, chat-input, chat-layout, typing-indicator, message-thread, reaction-picker                                                                                                                                                                                                                                                                         |
| **AI & Chatbot**          | 8     | ai-chat, prompt-input, streaming-text, ai-feedback, ai-response-card, source-citation, suggested-prompts                                                                                                                                                                                                                                                                   |
| **Data Display**          | 14    | avatar, badge, chart, data-table, kbd, pricing-card, stats-card, status-indicator, table, timeline, typography, tree-view, kanban-board, virtual-list, property-list, json-viewer, schema-viewer, description-list                                                                                                                                                         |
| **User & Profile**        | 8     | avatar-group, user-card, profile-header, activity-feed, notification-list                                                                                                                                                                                                                                                                                                  |
| **E-commerce**            | 7     | product-card, price-display, cart-item, order-summary, payment-method-card, subscription-card, invoice-row                                                                                                                                                                                                                                                                 |
| **Calendar & Scheduling** | 7     | calendar-week-view, calendar-day-view, event-card, time-slot-picker, agenda-view                                                                                                                                                                                                                                                                                           |
| **Productivity**          | 6     | todo-item, checklist, note-card, comment-thread, drag-handle                                                                                                                                                                                                                                                                                                               |
| **Developer Tools**       | 7     | api-key-display, webhook-card, env-editor, code-tabs, code-block, endpoint-card, log-viewer                                                                                                                                                                                                                                                                                |
| **Security & Auth**       | 5     | permission-badge, role-selector, mfa-setup, session-list, audit-log-entry                                                                                                                                                                                                                                                                                                  |
| **Content & Media**       | 6     | markdown-renderer, lightbox, video-player, audio-player, file-preview                                                                                                                                                                                                                                                                                                      |
| **Action**                | 6     | button, button-group, copy-button, rating, toggle, toggle-group                                                                                                                                                                                                                                                                                                            |
| **Feedback**              | 10    | alert, empty, progress, skeleton, sonner, spinner, toast, toaster, announcement-bar, cookie-consent, password-strength, onboarding-tour, changelog-entry, maintenance-page                                                                                                                                                                                                 |
| **Navigation**            | 8     | breadcrumb, menubar, navigation-menu, pagination, tabs, stepper, app-switcher, bottom-sheet, mega-menu                                                                                                                                                                                                                                                                     |
| **Layout**                | 10    | accordion, aspect-ratio, card, carousel, collapsible, drawer, resizable, scroll-area, separator, sheet, sidebar, page-header, section-header, settings-layout, split-view, masonry-grid, sticky-bar, infinite-scroll, pull-to-refresh                                                                                                                                      |
| **Overlay**               | 11    | alert-dialog, context-menu, dialog, dropdown-menu, filter-bar, hover-card, notification-bell, popover, share-dialog, tooltip, user-menu                                                                                                                                                                                                                                    |
| **Directory & Listings**  | 6     | listing-card, category-browser, review-card, contact-card, featured-card, map-placeholder                                                                                                                                                                                                                                                                                  |
| **Nyuchi Ecosystem**      | 4     | nyuchi-bottom-nav, nyuchi-footer, nyuchi-header, nyuchi-sidebar                                                                                                                                                                                                                                                                                                            |
| **Infrastructure**        | 3     | error-boundary, lazy-section, section-error-boundary                                                                                                                                                                                                                                                                                                                       |
| **Hooks**                 | 3     | use-memory-pressure, use-mobile, use-toast                                                                                                                                                                                                                                                                                                                                 |
| **Resilience (lib)**      | 9     | ai-safety, chaos, circuit-breaker, fallback-chain, observability, retry, timeout, utils, architecture (served only via the registry — no longer files in this repo)                                                                                                                                                                                                        |
| **Chart Blocks**          | 70    | area (10), bar (10), line (10), pie (11), radar (14), radial (6), tooltip (9)                                                                                                                                                                                                                                                                                              |
| **Page Blocks**           | 35    | dashboard-01, login-01–05, signup-01–05, sidebar-01–16, profile-page, profile-settings, onboarding-flow, error-page, empty-state, notification-center, search-results, command-center                                                                                                                                                                                      |

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
└── api/
    ├── brand-route.test.ts                  # /api/v1/brand response, headers, data
    ├── registry-route.test.ts               # /api/v1/ui registry integrity
    └── v1/
        └── architecture-routes.test.ts      # v1 route file existence; legacy routes removed
```

### What Tests Cover

- **API routes:** Brand API returns the correct headers/status/payload shape; the registry response matches the shadcn schema; all expected v1 route files exist on disk; removed legacy routes are confirmed gone.

### Tests removed in the Supabase migration

The earlier file-based brand / architecture / component-rendering tests (against `lib/brand.ts`, `lib/architecture.ts`, `components/brand/*`) have been deleted along with the modules they covered. New tests should target the Supabase-backed data flow, the API-route contracts, and the playground / docs renderers that read from the API.

### Running Tests

```bash
pnpm test             # Run all tests once
pnpm test:watch       # Watch mode for development
```

---

## 14. CI/CD & Versioning

### PR & Commit Workflow

**One PR = many commits. Not one-to-one.**

A PR is a logical unit of work — "add mobile responsiveness", "drop Nextra and wire the dashboard shell", "publish the CLI and skills". Commits inside the PR are the incremental steps that get there. The PR is what reviewers review, what CI gates, what merges to main. The commits are the paper trail of how we got there.

**Hard rules:**

- Never split a logical unit of work across multiple PRs just to keep each PR small. A cohesive change ships as one PR with as many commits as it takes to reach a merge-ready state.
- Never collapse a PR's history into a single commit. Multiple commits show the incremental steps, make `git bisect` useful, and make review tractable when the reader wants to follow the reasoning.
- Commit messages are part of the documentation. Each commit's subject + body explains the step it represents and why; reviewers can read the commit graph as a timeline of the PR's reasoning.
- Target the ratio at roughly **~10 commits per PR**, ~100 PRs to ~1000 commits in a year. That means PRs are substantial, not trivial; commits are incremental, not speculative.
- A PR does not ship until it is **100% right end-to-end** — no half-measures, no "we'll clean that up in the follow-up". If the app doesn't hold together, the PR doesn't merge. Add more commits to the same PR until it does.
- Exceptions to bundle-per-PR: security fixes, CI unblocks, and genuinely orthogonal infrastructure changes (see `claude/publish-cli-and-skills` as a parallel-track example) get their own PRs because their merge order is independent.

**Why not one PR per commit?** Because PR overhead (branch protection, CI token spend, human review attention, merge-order sequencing) scales per-PR, not per-commit. A thousand tiny PRs burn a thousand tokens of review attention and produce a thousand merge conflicts. A hundred substantive PRs with ten commits each produce the same code volume with a tenth of the ceremony.

### GitHub Actions

Three workflows in `.github/workflows/`:

**`ci.yml`** — Runs on every push to `main` and all PRs:

1. **Lint** — `pnpm lint` (ESLint with typescript-eslint, flat config in `eslint.config.mjs`)
2. **Type Check** — `pnpm typecheck`
3. **Test** — `pnpm test`
4. **Build** — `pnpm build` (runs after lint, typecheck, test pass)

**`claude-review.yml`** — AI code review on every PR and `@claude` mentions:

- Triggers on PR open/sync, issue comments, review comments, and reviews
- Uses `anthropics/claude-code-action@v1` preceded by an explicit `actions/checkout@v6` step with `fetch-depth: 0` (the action itself does not check out the repo — it expects a populated `.git` directory so it can `git fetch origin main` to build the review diff)
- Reviews for: code quality, design system adherence, accessibility (APCA 3.0 AAA, 56px default / 48px minimum touch targets), security, registry compatibility
- Permissions: `contents: write`, `pull-requests: write`, `issues: write`, `id-token: write`, `actions: read`
- Secret required: `CLAUDE_CODE_OAUTH_TOKEN` (generated via `claude setup-token`). Routes review runs through the Claude Code subscription quota instead of API-key billing — bypasses the org-level TPM cap on the API path. Trade-off: shares the personal 5-hour rolling subscription bucket with interactive Claude Code use, so heavy CI days compete with IDE work.

**`release.yml`** — Runs on version tags (`v*`):

1. Validates (lint + typecheck + test + build)
2. Verifies tag version matches `package.json` version
3. Creates a GitHub release with auto-generated release notes

### Org-wide required checks — naming conventions per workflow

Every bundu ecosystem repo's branch-protection rule on `main` requires the following check names, exactly. **The convention is asymmetric across workflows** — the CI workflow uses bare job names, the lint workflow uses prefixed names. Not stylistic — both must match the org rule literally.

| Reported check name    | Source workflow / job                          | Required by branch protection |
| ---------------------- | ---------------------------------------------- | ----------------------------- |
| `Build`                | `.github/workflows/ci.yml` → `build`           | Yes                           |
| `Lint`                 | `.github/workflows/ci.yml` → `lint`            | Yes                           |
| `Type Check`           | `.github/workflows/ci.yml` → `typecheck`       | Yes                           |
| `Security Audit`       | `.github/workflows/ci.yml` → `audit`           | Yes                           |
| `Test`                 | `.github/workflows/ci.yml` → `test`            | No (informational)            |
| `Registry Snapshot`    | `.github/workflows/ci.yml` → `registry`        | No (informational)            |
| `lint / actionlint`    | `.github/workflows/lint.yml` → `actionlint`    | Yes                           |
| `lint / JSON validity` | `.github/workflows/lint.yml` → `json-validity` | Yes                           |
| `lint / prettier`      | `.github/workflows/lint.yml` → `prettier`      | Yes                           |
| `lint / markdownlint`  | `.github/workflows/lint.yml` → `markdownlint`  | Yes                           |
| `lint / yamllint`      | `.github/workflows/lint.yml` → `yamllint`      | Yes                           |

**Critical implementation detail.** GitHub Actions reports the bare job `name:` field to the Checks API — the `<workflow> /` prefix that the PR UI shows is a visual grouping label, NOT part of the reported check name. So the job's `name:` field must literally match the required check name:

```yaml
# ci.yml — CI required checks are bare names
jobs:
  build:
    name: Build           # not "CI / Build"
  lint:
    name: Lint            # not "CI / Lint"

# lint.yml — lint required checks include the "lint / " prefix
jobs:
  actionlint:
    name: lint / actionlint   # not just "actionlint"
```

The two conventions are inconsistent at the org level (history, not design), but both need to match what branch protection has configured. If you rename a job, update the org-level branch-protection rule in the same change. Both `ci.yml` and `lint.yml` in this repo are the canonical templates; copy the `name:` pattern when bootstrapping a new ecosystem repo.

### Versioning

- **Current version:** 4.0.39 (must match in `package.json`, `lib/mcp-server.ts`, the `changelog` table in Supabase, `components/landing/footer.tsx`, `components/landing/dashboard-sidebar.tsx`, `app/layout.tsx` (`softwareVersion`), `README.md`, and CLAUDE.md §1)
- **Scheme:** `4.0.x` is the internal pre-1.0-public iteration; `4.1.0` is reserved for the first community-contributed release
- **Release process:**
  1. Update version in `package.json`
  2. Update the version constant in `lib/mcp-server.ts`
  3. Update the footer version in `components/landing/footer.tsx`
  4. Insert a row into the `changelog` Supabase table for the new version
  5. Commit: `git commit -m "Release v4.0.x"`
  6. Tag: `git tag v4.0.x`
  7. Push: `git push && git push --tags`
  8. GitHub Actions (`release.yml`) verifies the tag matches `package.json` and creates the GitHub release

### Dependency Management — Upgrade-First Policy

**This registry is the testing ground for major version upgrades.** All dependency upgrades happen here FIRST, before touching any production app. The workflow:

1. **Upgrade here first** — always update to the latest version, including major versions
2. **Run all CI gates** — lint, typecheck, test, build must all pass
3. **If breaking changes exist** — fix them here in the registry components
4. **If unfixable** — roll back here before it ever touches production
5. **Once passing** — production apps (weather, news, events, super app) can safely upgrade

**Why:** This registry defines the component API surface for the entire ecosystem. If a major version upgrade (e.g., Recharts 2→3, Zod 3→4) changes how components work, that change propagates to every app that installs from the registry. Better to catch and fix it here than discover it in production.

**Rule:** Never leave packages outdated "because it's a major version." Upgrade, test, fix. If it breaks and can't be fixed, document why and pin the version with a comment explaining the blocker.

**Current known pins:**

- `@vitejs/plugin-react@5` — v6 requires vite@8; vitest@4 peer-requires vite@7. `vite` is pinned as a direct devDependency at `^7.3.2` to ensure the patched version is used. Upgrade `@vitejs/plugin-react` to v6 together with vitest@5 when vitest@5 ships.

### Pre-commit Gates

Every commit must pass all gates before pushing. `.husky/pre-commit` enforces this automatically and runs three steps:

| Gate                       | Command                                                              | Failure means                                               |
| -------------------------- | -------------------------------------------------------------------- | ----------------------------------------------------------- |
| **Lint + format (staged)** | `pnpm exec lint-staged` (eslint --max-warnings=0 + prettier --write) | ESLint warning/error or unformatted code                    |
| **Type check (project)**   | `pnpm typecheck`                                                     | TypeScript error                                            |
| **Security audit**         | `pnpm audit --audit-level=moderate --ignore-registry-errors`         | Unresolved vulnerability — update deps or add pnpm override |

CI additionally runs `pnpm test` and `pnpm build` (and `pnpm registry:verify` to guard against `registry.json` drifting from Supabase).

`--ignore-registry-errors` is required because the npm "quick" audit endpoint that pnpm 10.x calls was retired in April 2026; remove the flag once pnpm ships a fix.

**Hard rules:**

- Zero ESLint warnings allowed — `--max-warnings=0` is enforced
- All packages must be at latest, or pinned with a documented reason in this file
- `pnpm audit --audit-level=moderate` must return clean — use `pnpm.overrides` in `package.json` for transitive vulnerabilities that can't be fixed by upgrading direct deps
- Prettier formats everything — `.prettierrc` is the canonical style config
- The CI `audit` job runs the same check — PRs with vulnerabilities will not be merged

**Adding a pnpm override for a transitive vulnerability:**

```json
// In package.json → "pnpm" → "overrides":
"vulnerable-package": "^safe-version",
"parent-package>vulnerable-package": "^safe-version"  // scoped override for version conflicts
```

### Deployment

- **Platform:** Vercel (Vercel project `mukoko-registry`, domains `mzizi.dev`, `registry.mukoko.com`); automatic deploys from `main`
- **CI gates:** Security audit, lint (zero warnings), typecheck, tests, build, and `registry:verify` must all pass before merge
- **Search index:** the `postbuild` step runs Pagefind against `.next/server/app` and writes the static index into `public/_pagefind/`

---

## 15. LLM Instructions

When working on this codebase as an AI assistant:

1. **Supabase is the source of truth.** Component source code, docs, brand data, architecture data, AI instructions, changelog — all live in Supabase. Do not reintroduce hardcoded JSON/TS files for any of these.
2. **`registry.json` is generated, not authored.** It must exist in the repo root, but it is regenerated dynamically from the Supabase `components` table by `pnpm registry:sync`. Never hand-edit it. CI runs `pnpm registry:verify` to catch drift.
3. **Never break the shadcn registry schema** — downstream apps depend on it.
4. **Use the Five African Minerals palette** — never introduce colors outside the token system.
5. **Follow the CVA + Radix + cn() pattern** — every component uses this stack.
6. **Keep components self-contained** — each file is independently installable via the registry.
7. **Preserve accessibility** — APCA 3.0 AAA contrast, 56px default / 48px minimum touch targets, Radix primitives for keyboard/screen reader behaviour.
8. **Test API output** — after modifying a component, verify it serves correctly via `/api/v1/ui/[name]`.
9. **Respect the layered architecture** — primitives don't import page-level code. The 3D frontend model has five axes: X-axis (L2 primitives / L3 brand / L6 pages / L7 shell — horizontal composition), Y-axis (L1 tokens / L4 safety / L5 resilience — vertical infrastructure), Z-axis (L8 assurance — depth observation), Outside (L9 fundi — self-healing actors), Documentation (L10). This is distinct from the 7-layer data architecture served at `/architecture` — never conflate the two numberings. See issue #46 for the table-backed doctrine (`architecture_frontend_layers`, `architecture_frontend_axes`).
10. **All brand wordmarks lowercase** — `mukoko`, `nyuchi`, `shamwari`, `bundu`, `nhimbe`.
11. **This is the canonical design system** — changes here propagate to all bundu ecosystem apps.
12. **Run tests before committing** — `pnpm test` must pass; add tests for new behaviour, especially around API routes and DB-driven renderers.
13. **Keep versions in sync** — `package.json`, `lib/mcp-server.ts`, the `changelog` Supabase row, and `components/landing/footer.tsx` must all match.
14. **The mineral strip uses 5 mineral colors** — not flag colors; it's the brand identity element.
15. **The mineral strip is always vertical** — used only as a left-edge accent (cards, sidebars, page borders); never horizontal.
16. **Use the MCP server** — served at `/mcp` via `lib/mcp-server.ts`; all reads go through `lib/db/`.
17. **Resilience patterns (circuit-breaker, retry, timeout, fallback-chain, ai-safety, chaos)** are registry items in Supabase, not files in this repo. Consumer apps install them via the shadcn CLI.
18. **Long-form documentation lives in the repo as `.mdx` files** — _not_ in Supabase. The portal is a documentation site, not a blog. Guides (`/docs/*`) and architecture/foundations/brand pages (`/architecture`, `/foundations`, `/brand`, …) are authored as `.mdx` in `app/` and compiled via `@next/mdx`. The `documentation_pages` Supabase table is HISTORICAL — content was migrated to repo MDX, the DB-driven renderers (`components/docs/db-doc-page.tsx`, `db-doc-index.tsx`) and `app/docs/[slug]` dynamic route are deleted, `/api/v1/docs/*` returns HTTP 410, and the `get_documentation_page` MCP tool is gone. Do not add new rows to `documentation_pages`; author new docs as MDX. The `changelog` Supabase table is unaffected — it remains the source-of-truth for the release-bump workflow (§14) and is read by `components/docs/db-changelog.tsx`.
19. **The playground (`components/playground/`) reads from the API**, not from local files. If you find a `registry.json` import there, refactor it to fetch `/api/v1/ui` (tracked in issue #26).
20. **API is versioned under `/api/v1/`** — `openapi.yaml` is the contract; update it whenever a route changes.
21. **Buttons are always pill-shaped (`rounded-full`)** across the entire ecosystem.
22. **Security findings are never deferred.** Any vulnerability surfaced during a `/security-review`, a manual audit, a CodeQL alert, a Dependabot advisory, or `pnpm audit` must be fixed inside the current PR — even if the original PR scope is "docs only" or "feature X". Do not file a follow-up issue and merge the unfixed code. The only acceptable exception is when the fix concretely requires infrastructure that isn't available on the PR's branch (e.g. a Supabase migration the developer must run); in that case, document the gap in `SECURITY.md`, open a tracking issue, AND still ship every code-level mitigation that doesn't require the missing infrastructure. This rule applies even when the finding is downgraded to "lack of hardening" during false-positive filtering — if a reviewer flagged it, the patch goes in this PR.

23. **No known bugs are ever deferred to a follow-up PR.** This is the canonical design system for the bundu ecosystem — every consumer app (mukoko's 17 mini-apps, nyuchi's 7 enterprise products, sister brands) inherits whatever ships from `main`. Deferring a known bug to "next PR" exposes every downstream consumer to risk we already know about. That is unacceptable on critical infrastructure.

    **A known bug means:** any verified-broken behaviour, any documented contract the code does not honour (e.g. a URL pattern documented in MDX that returns 404, a type/interface name promised in doctrine that doesn't exist), any dependency-version drift that breaks links/state in production, any runtime error path that has been reproduced. If it has been seen and confirmed, it is not deferred.

    **In contrast, the following are NOT bugs and can ship as separate PRs:**
    - Unbuilt features documented as `(planned)` (a doc that explicitly says "not yet wired" is honest, not a bug)
    - Quality work without a runtime symptom (missing tests on portal-internal components covered by manual sweep, undeclared `revalidate` defaults that Next.js handles silently, redundant directives that don't break anything)
    - Enhancements to surfaces that already function (e.g. consuming a new live-data source on a page that already renders)
    - Parallel-track work explicitly carved out by another doctrine section (e.g. §8.6 CLI publishing)

    **The audit gate before merge.** Every PR runs through (1) `/security-review`, (2) a gap analysis against this CLAUDE.md, and (3) a sweep of open GitHub issues. Anything matching the bug definition above lands in the same PR — re-scope rather than defer. Anything that is genuinely feature/enhancement gets a tracking issue and a one-line note in the PR body explaining why it is not a bug.

    **No exceptions for "PR scope".** A PR titled "drop Nextra" still fixes a 22-link `nyuchitech → nyuchi` rename if that surfaces during the audit, because the linked URLs 404 in production. The doctrine of one-PR-many-commits (§14) exists precisely so we can re-scope without splitting work across PRs that ship serially over weeks.

24. **Skills are MDX bodies authored once, served four ways.** The Supabase `skills` table is the SINGLE source of truth. From there, content flows to:
    1. **`/api/v1/skills/{name}`** — the HTTP endpoint that any consumer can `curl` or fetch.
    2. **MCP `get_skill(name)`** — the same content via the Model Context Protocol; AI assistants connected to `/mcp` can load skills without HTTP plumbing.
    3. **`@nyuchi/design-agent-skills`** — a published npm-package snapshot of the table; offline-friendly, regenerated by `pnpm skills:sync` before each publish (CI verifies via `pnpm skills:verify`).
    4. **`@nyuchi/design-cli skills install`** — the CLI subcommand that fetches live from the API and writes `.claude/skills/*.md` into a consumer project; tracks versions in `.nyuchi-design.json` for `update`.

    All four paths converge on the same `skills.body_mdx` column. **Never duplicate skill content.** If you find yourself editing a `.md` file directly under `packages/design-agent-skills/skills/` or `.claude/skills/` (in any consumer repo), stop — the change won't survive the next sync. Edit the Supabase row, then run `pnpm skills:sync` to refresh the published snapshot.

    The `packages/design-agent-skills/skills/` directory is added to `.prettierignore` so prettier never reformats the canonical content (escaped underscores, JSX reflows) and silently breaks the bit-identity contract `pnpm skills:verify` enforces.

### Open work to be aware of

The repo is mid-migration to a Supabase-first model. Several issues track outstanding cleanup — see #25 (remove redundant files), #26 (Portal UI off `registry.json`), #27 (REST API expansion), #28 (MCP server fixes), #29 (DB-driven docs), #30 (this CLAUDE.md update), and #31 (dependabot deployment errors). When in doubt about whether something is canonical, prefer the Supabase row over any file in the repo.
