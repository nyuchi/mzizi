# Security Policy

The Mzizi is the public registry + design system for the bundu ecosystem. It handles no end-user PII, but because it serves source code and AI instructions into downstream production apps (mukoko, nyuchi, nhimbe, shamwari, etc.), a supply-chain issue here can ripple out. Please report issues responsibly.

## Supported Versions

Only the latest minor line receives security fixes. Everything else is best-effort at the maintainers' discretion.

| Version | Supported | Notes                                                      |
| ------- | --------- | ---------------------------------------------------------- |
| 4.0.x   | Yes       | Current pre-public line; active security + feature updates |
| 4.1.x   | Planned   | Reserved for the first community-contributed release       |
| < 4.0   | No        | Pre-rebrand releases; upgrade to the current 4.x line      |

The authoritative current version is served live at `GET /api/v1/changelog` (first row's `version` field) — do not rely on a number pasted into this file.

## Reporting a Vulnerability

**Do NOT open a public issue or pull request.**

Use GitHub's private security advisory flow so we can investigate and ship a fix before disclosure:

1. Go to <https://github.com/nyuchi/design-portal/security/advisories/new>
2. Fill in: a clear title, a description, steps to reproduce, affected version / endpoint, impact (confidentiality / integrity / availability), and any suggested mitigation
3. Submit — the maintainers are notified privately

If GitHub advisories are unavailable to you, email `security@nyuchi.com` with the same information. PGP is not required.

### What to include

- Reproduction: request payload, MCP tool call, or DB query that triggers the issue
- Affected surface: which URL / table / tool
- Version: whatever `GET /api/v1/changelog` reports at the time of discovery, and (ideally) the Git SHA
- Impact: who is exposed and how
- Proposed fix, if you have one — we welcome patches proposed through the advisory UI

## Response Timeline

These are commitments, not aspirations. If we miss them, call it out in the advisory thread.

| Stage                                                 | Target                                     |
| ----------------------------------------------------- | ------------------------------------------ |
| Acknowledgement of the advisory                       | Within 48 hours                            |
| Initial severity triage and reproduction confirmation | Within 5 business days                     |
| Fix merged to `main` (critical / high)                | Within 7 days of triage                    |
| Fix merged to `main` (medium / low)                   | Within 30 days of triage                   |
| CVE requested (if external identifier warranted)      | At patch time                              |
| Public disclosure via GitHub advisory + release notes | After fix ships, coordinated with reporter |

Severity is graded using the [CVSS 3.1 calculator](https://www.first.org/cvss/calculator/3.1). The `audit` CI job additionally blocks any new moderate-or-higher transitive CVE.

## Scope

This policy covers anything the portal itself owns:

- The Next.js app deployed to `mzizi.dev` (and `registry.mukoko.com`)
- The registry API (`/api/v1/ui`, `/api/v1/ui/{name}`, `/api/v1/ui/{name}/{docs,versions}`, `/api/v1/stats`, `/api/v1/search`)
- The content API (`/api/v1/changelog`, `/api/v1/ai/instructions`) — `/api/v1/docs/*` is HTTP 410 (long-form docs moved to repo MDX, see CLAUDE.md §15.18)
- The fundi self-healing surface (`/api/v1/fundi`, `/api/v1/fundi/{id}`, `/api/v1/fundi/stats`)
- The brand + architecture APIs (`/api/v1/brand`, `/api/v1/ecosystem`, `/api/v1/data-layer`, `/api/v1/pipeline`, `/api/v1/sovereignty`)
- The Model Context Protocol server at `/mcp` (Streamable HTTP)
- Component source code served via the registry — an XSS or RCE-by-scaffold is in scope
- Supabase row-level security policies captured in `supabase/schema.sql`
- GitHub Actions workflows in `.github/workflows/` — malicious-input, token-exfiltration, or privilege-escalation issues
- The shadcn CLI `install` surface: any way the registry can serve a response that runs unexpected code on a developer's machine

## Out of Scope

- Third-party npm dependencies — report those to their respective maintainers. We'll track and patch via `pnpm.overrides` once fixes ship; see `package.json`.
- Applications that _consume_ the registry (`mukoko`, `nyuchi`, `nhimbe`, `shamwari`, etc.) — report those to their own repositories.
- Vulnerabilities that require a compromised maintainer account as a precondition.
- Social engineering or physical attacks against maintainers.
- Denial-of-service through volumetric means against Vercel / Supabase — those platforms own their edge.
- Missing cache headers, `X-Content-Type-Options`, and similar header hygiene — already enforced in `next.config.mjs`; open an issue rather than an advisory.

## Our Commitments

- We will credit reporters by name (or handle) in the GitHub advisory and the `CHANGELOG.md` entry, unless you ask us not to.
- We will not take legal action against anyone acting in good faith within this policy.
- We will coordinate disclosure timing with you — the default is "fix first, publish after," but if the issue is being actively exploited we may accelerate.

## Safe Harbour

Testing against `mzizi.dev` is welcome under these conditions:

- No automated scans that generate disruptive load.
- No extraction of data beyond what is necessary to demonstrate the issue.
- No degradation of service for other users.
- No testing against third-party integrations (Supabase, Vercel, GitHub, Anthropic) — only the portal's own surface.
- If you inadvertently access production data, stop, delete it, and include the fact in your report.

Actions within these conditions will not be pursued as violations of computer-misuse law, DMCA, or ToS.

## Dependency Management

- `.github/workflows/ci.yml` runs `pnpm audit --audit-level=moderate` on every PR and push to `main` — any moderate-or-higher vulnerability fails CI.
- Dependabot is enabled (`.github/dependabot.yml`) for weekly grouped upgrades.
- Transitive vulnerabilities are patched via `pnpm.overrides` in `package.json` when a direct dep has not yet shipped a fix.
- CodeQL analysis (JavaScript / TypeScript + Actions) runs via GitHub code-scanning on every PR.
- Secret scanning with push-protection is enabled at the repository level.

## How CI enforces these gates

The same checks that block a merge to `main` are runnable locally with one command:

```bash
pnpm check
```

This chains every CI gate — `format:check`, `lint`, `lint:md`, `lint:json`, `typecheck`, `test`, `audit:check`, `registry:verify`, `build` — and exits non-zero on the first failure. Run it before every push to keep contributions clean and tidy. See [`CONTRIBUTING.md`](CONTRIBUTING.md#before-submitting--run-the-same-gates-ci-runs) for the contributor workflow and one-time tooling setup.

CI workflows that gate merge to `main`:

| Workflow                                                                 | Security-relevant jobs                                                                                                             |
| ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| [`ci.yml`](.github/workflows/ci.yml)                                     | `Security Audit` (pnpm audit, fails on moderate+), `Lint`, `Type Check`, `Test`, `Build`                                           |
| [`lint.yml`](.github/workflows/lint.yml)                                 | `lint / actionlint` (workflow YAML lint), `lint / yamllint`, `lint / JSON validity`, `lint / prettier`, `lint / markdownlint`      |
| [CodeQL](https://github.com/nyuchi/design-portal/security/code-scanning) | `Analyze (actions)` and `Analyze (javascript-typescript)` — autocatches `actions/missing-workflow-permissions`, common JS/TS sinks |

Every job in every workflow declares an explicit `permissions:` block (`contents: read` by default) — required by the org-wide `actions/missing-workflow-permissions` CodeQL rule.

### No-deferral policy

Per `CLAUDE.md` §15 rule 22, **security findings from any review/audit (`/security-review`, manual audit, CodeQL alert, Dependabot advisory, `pnpm audit`) must be fixed in the current PR — never deferred to a follow-up issue.** This rule applies even when the original PR scope is "docs only" and even when false-positive filtering downgrades a finding to "lack of hardening". The only acceptable exception is when the fix concretely depends on infrastructure that isn't on the PR's branch (e.g. a Supabase migration the developer must run); in that case, document the gap here in `SECURITY.md`, open a tracking issue, and still ship every code-level mitigation that doesn't require the missing infrastructure.

## Contact

- Primary: GitHub security advisories — <https://github.com/nyuchi/design-portal/security/advisories/new>
- Fallback: `security@nyuchi.com`

Thank you for helping keep the bundu ecosystem safe.
