---
name: nyuchi-design-system
version: 1.0.0
description: Core doctrine for building with the Nyuchi Design System
agents: claude-code, cursor, copilot, cline, windsurf
requires_mcp: true
---

# Nyuchi Design System — Core Doctrine

You are working on a Nyuchi-ecosystem project. The Nyuchi Design System is a 3D component architecture that powers mukoko, nyuchi, shamwari, bundu, and nhimbe. Read this skill whenever you are about to generate component code, styling, or architecture decisions.

## No hardcoded numbers

This prompt contains no counts deliberately. Component counts, layer counts, and token counts drift as the system evolves. When you need a current number, query the database via the MCP server at mzizi.dev/mcp:

- get_layer_counts()           — per-layer component counts
- get_system_counts()          — system-wide totals
- get_token_counts()           — token counts per category (every brand_* table)
- get_layer_categories(N)      — category breakdown for layer N
- get_latest_release()         — current version
- get_accessibility_summary()  — WCAG and color-blindness validation

## The 3D architecture

The system is not a flat stack. It is a three-dimensional space:

- X-axis (horizontal composition, what users see): L2 Primitives → L3 Brand → L6 Pages → L7 Shell
- Y-axis (vertical infrastructure, what flows through): L1 Tokens · L4 Safety · L5 Resilience
- Z-axis (depth observation, what watches): L8 Assurance — accessibility audit, RTL conformity, probes, alerts
- Outside actors: L9 Fundi (self-healing), L10 Documentation

Each layer has exactly ONE sub-label value in components.layer: tokens, primitive, brand, safety, resilience, pages, shell, assurance, fundi, documentation.

## Source code lives in the database

Production source for every stable component is stored in the components.source_code column in Supabase. The frontend repo pulls from the database at build time — it does not maintain a separate source-of-truth in the file system.

When you add or modify a component: write the source directly to components.source_code via SQL, and flip its status from alpha to stable.

## The five African minerals

Our colour palette draws from the continent's mineral wealth. For canonical hex values and container colours, query brand_minerals — the database is the source of truth.

- Cobalt — primary actions, links, active states (DRC)
- Tanzanite — brand identity, premium features, purple accents (Tanzania)
- Malachite — success states, positive indicators, growth (Congo)
- Gold — achievements, warmth, premium badges (Ghana, South Africa)
- Terracotta — community features, grounding, heritage (Pan-African)

Never hardcode hex values for these colours. Reference them via CSS variables or query brand_minerals.

## Implementation rules

1. CSS values live only in L1 tokens (the brand_* tables). Other layers consume via var() references.
2. Icons come from @/lib/icons (nyuchi-icons registry). Never import lucide-react directly.
3. L2 primitives never import useNyuchiHarness. They use cn() for classNames and carry data-slot.
4. L3 brand components always destructure { log, motion, LiveRegion } from useNyuchiHarness.
5. L3 brand components always use the nyuchi- prefix in their name.
6. L6 pages are pure composition — no inline buttons, cards, SVGs, or brand fonts.
7. Every rendered component has data-slot and data-portal attributes.
8. All status colours use semantic tokens (--status-success, --status-error, etc.). Third-party brand colours (Ethereum, Google, EcoCash) are the only raw hex exceptions.
9. Buttons, inputs, avatars, badges, toggles are ALWAYS pill-shaped (borderRadius 9999).
10. Touch targets default to 48px (brand_touch_targets.comfortable). 44px absolute minimum per WCAG 2.5.5.
11. Density-aware components reference brand_density values. Never hardcode tier behaviour.
12. RTL support: use logical CSS properties (margin-inline-start, padding-inline-end). Mark directional icons with data-rtl-mirror="true".
13. Versioning: 4.0.x is internal. 4.1.0 is the first public release. Breaking changes require a 5.0.0 bump.

## Accessibility is continuous

An L8 accessibility-audit component runs daily at 02:00 UTC, validating every semantic-colour pair against protanopia, deuteranopia, tritanopia, and achromatopsia simulations. Regressions file a Fundi issue within 24 hours.

Before shipping a new colour pair, validate with `SELECT calculate_contrast_ratio(fg_hex, bg_hex)`. WCAG AA normal text needs 4.5, AAA needs 7.0. High-contrast mode reads from brand_semantic_colors.hc_light_value and hc_dark_value.

## Renames are safe

Foreign keys on component_docs and component_demos use ON UPDATE CASCADE. Renaming a component in the components table automatically updates its docs and demos rows. Check registry_dependencies on other components for stale references.

## When you need more

Connect to the Nyuchi Design MCP at mzizi.dev/mcp for live data. The MCP exposes tools for components, design tokens, architecture, accessibility, and version history. Prefer MCP queries over assumptions.
