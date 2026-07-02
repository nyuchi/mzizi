---
name: scaffold-component
version: 1.0.0
description: How to scaffold a new Nyuchi component correctly
agents: claude-code, cursor, copilot, cline
requires_mcp: true
---

# Scaffolding a Nyuchi Component

Follow this workflow whenever you are creating a new component in the Nyuchi Design System. The system is DB-first: production source lives in components.source_code, not in the file system. The frontend pulls from the DB at build time.

## Step 1 — Decide the layer

Use the Layer Decision Guide:

- L1 Tokens — CSS value, spacing, colour, motion, radius (goes in a brand_* table, not components)
- L2 Primitive — generic UI (button, card, input, dialog, toolbar, bento-grid)
- L3 Brand — Nyuchi-branded composition with mineral palette and harness integration
- L4 Safety — conditional-rendering gate (permission, geo, rate limit)
- L5 Resilience — error boundary, skeleton, offline banner, fallback chain
- L6 Page — full-screen layout composition
- L7 Shell — app container (navigation, routing, lifecycle)
- L8 Assurance — instrumentation, a11y audit, RTL conformity, probes
- L9 Fundi — automated healing
- L10 Documentation — docs, AI instructions, docs infrastructure

If you are unsure, query the MCP: `get_layer_categories(N)` shows what lives in each layer.

## Step 2 — Register in the components table with status=alpha

```sql
INSERT INTO components (
  name, description, category, layer, architecture_layer, status, added_in_version,
  portal_url, playground_url, health_endpoint, source_url, changelog_url, api_endpoint,
  platforms, source_code
) VALUES (
  'your-component-name',
  'Short description of what it does',
  'category',   -- e.g. layout, form, feedback, navigation, conformity
  'primitive',  -- layer sub-label: primitive/brand/safety/resilience/pages/shell/assurance/fundi/documentation
  2,            -- architecture_layer number
  'alpha',      -- start as alpha; flip to stable once source is production-ready
  '4.1.0',
  'https://mzizi.dev/components/your-component-name',
  'https://mzizi.dev/playground/your-component-name',
  'https://mzizi.dev/health/your-component-name',
  'https://mzizi.dev/source/your-component-name',
  'https://mzizi.dev/changelog/your-component-name',
  'https://mzizi.dev/api/your-component-name',
  '{web}',
  ''  -- source_code starts empty, will be filled below
);
```

## Step 3 — Write the source

Once registered, write the production source straight to the components.source_code column via SQL. Follow the enterprise criteria for the chosen layer.

### L2 Primitive checklist

- No useNyuchiHarness import
- data-slot attribute on root element
- data-portal attribute pointing to mzizi.dev/components/{name}
- cn() for className composition
- No raw Tailwind colours — use semantic tokens (bg-primary, text-foreground, etc.)
- Icons from @/lib/icons, never lucide-react directly
- Touch targets follow brand_touch_targets (48px minimum)
- If pill-shaped category (button, input, avatar, badge, toggle), use borderRadius 9999

### L3 Brand checklist

- nyuchi- prefix on the name
- useNyuchiHarness hook with full destructure { log, motion, LiveRegion }
- animStyle with motion.prefersReduced check
- ARIA role or aria-label
- data-slot and data-portal attributes
- focus-visible ring on interactive elements
- min-h-[48px] touch targets on buttons (brand_touch_targets.comfortable)
- I18N via Intl formatters for dates, numbers, currency
- Semantic tokens for status-bearing colours

### L6 Page checklist

- Pure composition — no inline buttons, cards, or SVGs
- Accept children/slots for content
- Semantic CSS vars only (bg-card, text-foreground, bg-primary)
- Loading state prop
- role="main" and aria-label

### L8 Assurance checklist

- TypeScript module exporting typed functions and React hooks
- Banner comment identifying layer and purpose
- Configurable rules array
- Optional onViolation/onComplete callbacks
- React hook variant for continuous monitoring

## Step 4 — Add docs and demos

```sql
INSERT INTO component_docs (component_name, use_cases, variants, features, a11y)
VALUES (
  'your-component-name',
  ARRAY['Use case 1', 'Use case 2'],
  ARRAY['variant-1', 'variant-2'],
  ARRAY['Feature description'],
  ARRAY['Accessibility feature']
);

INSERT INTO component_demos (component_name, has_demo, demo_type)
VALUES ('your-component-name', true, 'interactive');
```

## Step 5 — Flip status to stable

Once the source is production-ready and has been dogfooded somewhere:

```sql
UPDATE components SET status = 'stable' WHERE name = 'your-component-name';
SELECT log_version('your-component-name', 'promoted', 'Promoted from alpha to stable', 'your-handle');
```

## Step 6 — Validate accessibility

If your component introduces a new colour pair, validate before shipping:

```sql
SELECT calculate_contrast_ratio('#FFFFFF', '#0047AB');
-- Returns the WCAG 2.1 contrast ratio. AA 4.5, AAA 7.0.
```

For systematic pair tracking look at brand_accessibility_checks — critical pairs have a row with computed ratio and colour-blindness safety flags.

## What to avoid

- Never store component source in the file system if it's meant to be distributed via the registry. The DB is canonical.
- Never hardcode hex colour values (except documented third-party brands like Ethereum, Google, EcoCash).
- Never use lucide-react directly — go through @/lib/icons.
- Never use margin-left / padding-right / left — use logical properties (margin-inline-start etc.) for RTL support.
- Never bump major version without architectural redesign. 4.0.x is internal patches, 4.1.0 is first public release, 5.0.0 reserved for redesign.
