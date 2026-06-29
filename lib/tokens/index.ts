/**
 * NYUCHI DESIGN TOKENS — Layer 1: The Mathematical Substrate
 *
 * Canonical source: mzizi.dev
 * W3C Design Tokens Specification (2025.10) compliant
 * Nyuchi Frontend Architecture Layer 1 of 7
 *
 * THREE-TIER TOKEN ARCHITECTURE:
 *   1. Primitive: Raw values — never change regardless of theme or brand
 *   2. Semantic: Purpose-mapped aliases that adapt per theme (light/dark/high-contrast)
 *   3. Component: Scoped tokens for specific brand components
 *
 * MULTI-PLATFORM OUTPUT:
 *   This file is the source of truth. Platform generators read from it:
 *   - Next.js/React: CSS custom properties + Tailwind @theme
 *   - Swift/SwiftUI: Asset catalog + Color extensions
 *   - Kotlin/Compose: NyuchiTheme composable
 *   - ArkTS/ArkUI: Resource files
 *   - React Native: StyleSheet constants
 *   - Rust: const values + config structs
 *   - Python: Config dataclass
 *
 * TEN LISTING THEMES:
 *   Five African Minerals (geological) + Five Heritage Colors (atmospheric)
 *
 * "Thou hast ordered all things in measure, and number, and weight."
 * — The Mukoko Order, v4.0.2
 */

import {
  minerals,
  heritageColors,
  type MineralToken,
  type HeritageToken,
} from "./palette.generated"

// The seven minerals + seven heritage tones are the single source of truth for
// the palette and are generated from the DB (see palette.generated.ts). Re-export
// them so consumers can read the canonical swatch list with role/family/origin.
export { minerals, heritageColors }
export type { MineralToken, HeritageToken }

/** Canonical render order: the seven minerals first, then the seven heritage tones. */
export const paletteSwatches = [...minerals, ...heritageColors]

const swatchByName = new Map(paletteSwatches.map((s) => [s.name, s]))

/**
 * Resolve a palette colour to its concrete hex, sourced from the DB snapshot.
 * Use this in raster/canvas/OG contexts where CSS custom properties don't
 * resolve (satori, Canvas 2D) so values stay DB-driven instead of hardcoded.
 */
export function paletteColor(name: string, mode: "dark" | "light" = "dark"): string {
  const s = swatchByName.get(name)
  if (!s) throw new Error(`unknown palette colour: ${name}`)
  return mode === "light" ? s.lightHex : s.darkHex
}

/** Mineral names in sort order — derived from the DB snapshot, never hardcoded. */
const mineralKeys = minerals.map((m) => m.name)
/** Heritage names in sort order — derived from the DB snapshot, never hardcoded. */
const heritageKeys = heritageColors.map((h) => h.name)

// ═══════════════════════════════════════════════════════════════
// TIER 1 — PRIMITIVE TOKENS
// These are absolute values. They never change.
// ═══════════════════════════════════════════════════════════════

export const primitives = {
  // ─── FIVE AFRICAN MINERALS (geological, from underground) ───
  // Each mineral has a dark-mode and light-mode value.
  // Dark mode values are used in the Nyuchi default dark theme.
  // Light mode values are used for light theme and text-on-light.
  color: {
    // ─── PALETTE (seven minerals + seven heritage) ─────────────
    // Sourced from the DB and generated into ./palette.generated.ts
    // (see `minerals` / `heritageColors`). They are intentionally NOT
    // duplicated here — every generator below reads the snapshot directly,
    // so there is exactly one source of truth and no value can drift from
    // the live database.

    // Neutrals — warm stone palette (April 2026, AAA-optimised)
    // Named by role, not arbitrary grey percentage.
    white: { value: "#FAFAFA" },
    cream: { value: "#FAF9F5", description: "Light mode muted fill / warm cream" },
    warmGrey: { value: "#F3F2EE", description: "Light mode ambient background" },
    stone68: { value: "#B2AFA8", description: "Dark mode muted-foreground (AAA on all surfaces)" },
    stone27: { value: "#494840", description: "Light mode muted-foreground (AAA on all surfaces)" },
    overlay: { value: "#252421", description: "Dark mode modal/sheet surface (L14%)" },
    ambient: { value: "#1B1A17", description: "Dark mode page background (L10%, warm stone)" },
    surface: { value: "#100F0E", description: "Dark mode card surface (L6%)" },
    deep: { value: "#050504", description: "Dark mode deepest fill (L2%, max text contrast)" },
    black: { value: "#000000" },

    // Semantic raw values
    success: { value: "#4ADE80" },
    warning: { value: "#FBBF24" },
    error: { value: "#F87171" },
    info: { value: "#00B0FF" },
  },

  // ─── SPACING SCALE (design portal canonical) ───────────────
  spacing: {
    "0": { value: "0px" },
    xs: { value: "4px", description: "Tight gaps, icon padding" },
    sm: { value: "8px", description: "Compact spacing, inline gaps" },
    md: { value: "12px", description: "Default component padding" },
    base: { value: "16px", description: "Standard spacing" },
    lg: { value: "24px", description: "Section padding, card gaps" },
    xl: { value: "32px", description: "Page margins, large gaps" },
    "2xl": { value: "48px", description: "Section margins" },
    "3xl": { value: "64px", description: "Page section spacing" },
  },

  // ─── BORDER RADIUS (design portal canonical) ──────────────
  // Base unit: 7px (--radius-unit). Ecosystem numbers: 7, 12, 14, 17.
  // Buttons are ALWAYS pill (rounded-full, 9999px).
  radius: {
    none: { value: "0px" },
    sm: { value: "7px", description: "Subtle rounding, checkboxes, small elements" },
    md: { value: "12px", description: "Cards, inputs, containers" },
    lg: { value: "14px", description: "Default radius, medium containers" },
    xl: { value: "17px", description: "Large cards, dialogs, prominent surfaces" },
    full: { value: "9999px", description: "Buttons, badges, pills, avatars — ALWAYS pill" },
    circle: { value: "50%", description: "Perfect circles" },
  },

  // ─── TYPOGRAPHY (design portal canonical) ─────────────────
  // Noto Sans/Serif chosen for cross-language compatibility
  // (800+ languages including African languages and diacritics)
  fontFamily: {
    sans: {
      value: '"Noto Sans", system-ui, -apple-system, sans-serif',
      description: "Body/UI — all text, labels, descriptions",
    },
    serif: {
      value: '"Noto Serif", Georgia, "Times New Roman", serif',
      description: "Display — page titles, hero text, H1-H3",
    },
    mono: {
      value: '"JetBrains Mono", "Fira Code", monospace',
      description: "Code — blocks, terminal, technical",
    },
  },

  // Type scale (design portal canonical)
  fontSize: {
    caption: { value: "12px", description: "0.75rem — Labels, metadata, timestamps" },
    bodySmall: { value: "14px", description: "0.875rem — Secondary text, descriptions" },
    body: { value: "16px", description: "1rem — Default body text" },
    bodyLarge: { value: "18px", description: "1.125rem — Lead paragraphs" },
    h5: { value: "20px", description: "1.25rem — Noto Sans 600 — Small headings" },
    h4: { value: "24px", description: "1.5rem — Noto Sans 600 — Card titles" },
    h3: { value: "30px", description: "1.875rem — Noto Serif 600 — Sub-sections" },
    h2: { value: "36px", description: "2.25rem — Noto Serif 600 — Section headings" },
    h1: { value: "48px", description: "3rem — Noto Serif 700 — Page titles" },
    display: { value: "72px", description: "4.5rem — Noto Serif 700 — Hero headlines" },
  },

  fontWeight: {
    light: { value: "300" },
    regular: { value: "400" },
    medium: { value: "500" },
    semibold: { value: "600" },
    bold: { value: "700" },
  },

  // ─── TOUCH TARGETS (design portal canonical) ──────────────
  // APCA 3.0 AAA accessibility standard
  touchTarget: {
    default: { value: "56px", description: "Default interactive element height" },
    sm: { value: "48px", description: "Minimum — NEVER below this" },
  },

  // ─── MOTION (design portal canonical) ─────────────────────
  motion: {
    duration: {
      quick: { value: "100ms", description: "Micro-interactions, toggles" },
      standard: { value: "200ms", description: "Default transitions" },
      emphasis: { value: "350ms", description: "Entry/exit animations" },
      dramatic: { value: "500ms", description: "Page transitions, celebrations" },
    },
    easing: {
      entrance: { value: "cubic-bezier(0.0, 0.0, 0.2, 1)", description: "Elements entering view" },
      exit: { value: "cubic-bezier(0.4, 0.0, 1, 1)", description: "Elements leaving view" },
      standard: { value: "cubic-bezier(0.4, 0.0, 0.2, 1)", description: "General movement" },
      spring: { value: "cubic-bezier(0.175, 0.885, 0.32, 1.275)", description: "Bouncy, playful" },
    },
    stagger: {
      delay: { value: "50ms", description: "Per-item delay in lists" },
      maxItems: {
        value: "8",
        description: "Max items to stagger (beyond this, all appear together)",
      },
    },
  },

  // ─── SHADOWS / ELEVATION ──────────────────────────────────
  shadow: {
    sm: { value: "0 1px 2px rgba(0,0,0,0.15)" },
    md: { value: "0 4px 12px rgba(0,0,0,0.2)" },
    lg: { value: "0 8px 24px rgba(0,0,0,0.25)" },
    xl: { value: "0 20px 60px rgba(0,0,0,0.4)" },
    glow: { value: "0 4px 20px rgba(100,255,218,0.3)", description: "Malachite glow for FABs" },
  },

  // ─── Z-INDEX SCALE ────────────────────────────────────────
  zIndex: {
    base: { value: "0" },
    dropdown: { value: "10" },
    sticky: { value: "20" },
    overlay: { value: "30" },
    modal: { value: "40" },
    toast: { value: "50" },
    tooltip: { value: "60" },
  },

  // ─── BREAKPOINTS ──────────────────────────────────────────
  breakpoint: {
    mobile: { value: "0px" },
    tablet: { value: "640px" },
    desktop: { value: "1024px" },
    wide: { value: "1440px" },
  },
} as const

// ═══════════════════════════════════════════════════════════════
// TIER 2 — SEMANTIC TOKENS
// These change per theme. Values from design portal canonical.
// ═══════════════════════════════════════════════════════════════

export type ThemeMode = "dark" | "light" | "high-contrast"

export const semanticTokens: Record<ThemeMode, Record<string, { value: string }>> = {
  dark: {
    // Surfaces — SWAPPED arrangement, AAA-optimised (April 2026)
    // background is the AMBIENT page base (lighter, L10%)
    // card is the CONTENT surface (darker, L6%)
    // muted is the DEEPEST fill (L2%, maximum text contrast)
    // overlay is the MODAL/SHEET surface (L14%, scrim creates pop)
    background: { value: "#1B1A17" },
    foreground: { value: "#F5F5F4" },
    card: { value: "#100F0E" },
    "card-foreground": { value: "#F5F5F4" },
    muted: { value: "#050504" },
    "muted-foreground": { value: "#B2AFA8" },
    overlay: { value: "#252421" },
    scrim: { value: "rgba(0,0,0,0.60)" },
    primary: { value: "#F5F5F4" },
    "primary-foreground": { value: "#1B1A17" },
    secondary: { value: "#050504" },
    "secondary-foreground": { value: "#F5F5F4" },
    accent: { value: "#050504" },
    "accent-foreground": { value: "#F5F5F4" },
    destructive: { value: "#F2B8B5" },
    border: { value: "rgba(255,255,255,0.06)" },
    input: { value: "rgba(255,255,255,0.06)" },
    ring: { value: "#F5F5F4" },
  },
  light: {
    // Surfaces — SWAPPED arrangement, AAA-optimised (April 2026)
    // background is the AMBIENT page base (warm grey, slightly tinted)
    // card is the CONTENT surface (pure white)
    // muted is the WARM CREAM fill
    // overlay is the MODAL/SHEET surface (white, same as card in light mode)
    background: { value: "#F3F2EE" },
    foreground: { value: "#141413" },
    card: { value: "#FFFFFF" },
    "card-foreground": { value: "#141413" },
    muted: { value: "#FAF9F5" },
    "muted-foreground": { value: "#494840" },
    overlay: { value: "#FFFFFF" },
    scrim: { value: "rgba(0,0,0,0.40)" },
    primary: { value: "#141413" },
    "primary-foreground": { value: "#FFFFFF" },
    secondary: { value: "#FAF9F5" },
    "secondary-foreground": { value: "#141413" },
    accent: { value: "#FAF9F5" },
    "accent-foreground": { value: "#141413" },
    destructive: { value: "#B3261E" },
    border: { value: "rgba(10,10,10,0.06)" },
    input: { value: "rgba(10,10,10,0.06)" },
    ring: { value: "#141413" },
  },
  "high-contrast": {
    background: { value: "#000000" },
    foreground: { value: "#FFFFFF" },
    card: { value: "#1A1A1A" },
    "card-foreground": { value: "#FFFFFF" },
    muted: { value: "#2A2A2A" },
    "muted-foreground": { value: "#E0E0E0" },
    primary: { value: "#FFFFFF" },
    "primary-foreground": { value: "#000000" },
    secondary: { value: "#2A2A2A" },
    "secondary-foreground": { value: "#FFFFFF" },
    accent: { value: "#2A2A2A" },
    "accent-foreground": { value: "#FFFFFF" },
    destructive: { value: "#FCA5A5" },
    border: { value: "#FFFFFF" },
    input: { value: "#FFFFFF" },
    ring: { value: "#FFFFFF" },
  },
}

// ═══════════════════════════════════════════════════════════════
// LISTING THEMES — Ten Colors of Africa
// Five Minerals (geological) + Five Heritage (atmospheric)
// Each theme provides a background gradient for listing pages.
// ═══════════════════════════════════════════════════════════════

export type ListingTheme =
  | "default"
  | "cobalt"
  | "tanzanite"
  | "malachite"
  | "gold"
  | "terracotta"
  | "sodalite"
  | "copper"
  | "indigo"
  | "savanna"
  | "baobab"
  | "sunset"
  | "river"
  | "hematite"
  | "kalahari"

export const listingThemes: Record<
  ListingTheme,
  {
    name: string
    accent: string | null
    bg: string
    surface: string
    gradient: string | null
    family: "mineral" | "heritage" | "default"
    origin: string
  }
> = {
  default: {
    name: "Default",
    accent: null,
    bg: "#1B1A17",
    surface: "#100F0E",
    gradient: null,
    family: "default",
    origin: "",
  },
  // Minerals
  cobalt: {
    name: "Cobalt",
    accent: "#00B0FF",
    bg: "#001833",
    surface: "#002244",
    gradient: "linear-gradient(145deg, #000D1A 0%, #001833 50%, #002244 100%)",
    family: "mineral",
    origin: "Katanga (DRC), Zambian Copperbelt",
  },
  tanzanite: {
    name: "Tanzanite",
    accent: "#B388FF",
    bg: "#1A0033",
    surface: "#2A0055",
    gradient: "linear-gradient(145deg, #0D001A 0%, #1A0033 50%, #2A0055 100%)",
    family: "mineral",
    origin: "Merelani Hills, Tanzania",
  },
  malachite: {
    name: "Malachite",
    accent: "#64FFDA",
    bg: "#002E25",
    surface: "#003D32",
    gradient: "linear-gradient(145deg, #001A14 0%, #002E25 50%, #003D32 100%)",
    family: "mineral",
    origin: "Congo Copper Belt",
  },
  gold: {
    name: "Gold",
    accent: "#FFD740",
    bg: "#1A1400",
    surface: "#2A2200",
    gradient: "linear-gradient(145deg, #0D0A00 0%, #1A1400 50%, #2A2200 100%)",
    family: "mineral",
    origin: "Ghana, South Africa, Mali",
  },
  terracotta: {
    name: "Terracotta",
    accent: "#E1B07E",
    bg: "#1A0F05",
    surface: "#2A1A0A",
    gradient: "linear-gradient(145deg, #0D0800 0%, #1A0F05 50%, #2A1A0A 100%)",
    family: "mineral",
    origin: "Pan-African Sahel",
  },
  sodalite: {
    name: "Sodalite",
    accent: "#3D5AFE",
    bg: "#0D1240",
    surface: "#141A66",
    gradient: "linear-gradient(145deg, #060920 0%, #0D1240 50%, #141A66 100%)",
    family: "mineral",
    origin: "Kunene River, Namibia & South Africa",
  },
  copper: {
    name: "Copper",
    accent: "#FF8A65",
    bg: "#2A1206",
    surface: "#3D1C0E",
    gradient: "linear-gradient(145deg, #1A0B03 0%, #2A1206 50%, #3D1C0E 100%)",
    family: "mineral",
    origin: "Central African Copperbelt, Zambia & DRC",
  },
  // Heritage
  indigo: {
    name: "Indigo",
    accent: "#8C9EFF",
    bg: "#0D1040",
    surface: "#141866",
    gradient: "linear-gradient(145deg, #050820 0%, #0D1040 50%, #141866 100%)",
    family: "heritage",
    origin: "Yoruba adire, Kano dye pits, Shweshwe cloth",
  },
  savanna: {
    name: "Savanna",
    accent: "#FFCC80",
    bg: "#1A1408",
    surface: "#2A2010",
    gradient: "linear-gradient(145deg, #0D0A03 0%, #1A1408 50%, #2A2010 100%)",
    family: "heritage",
    origin: "Golden grasslands, Sahel to Southern Africa",
  },
  baobab: {
    name: "Baobab",
    accent: "#A5D6A7",
    bg: "#0F1A0F",
    surface: "#1A2A1A",
    gradient: "linear-gradient(145deg, #060D06 0%, #0F1A0F 50%, #1A2A1A 100%)",
    family: "heritage",
    origin: "Tree of life, sub-Saharan Africa",
  },
  sunset: {
    name: "Sunset",
    accent: "#FF8A80",
    bg: "#2A0A02",
    surface: "#3D1005",
    gradient: "linear-gradient(145deg, #1A0500 0%, #2A0A02 50%, #3D1005 100%)",
    family: "heritage",
    origin: "African dusk, rose-copper sky",
  },
  river: {
    name: "River",
    accent: "#4DD0E1",
    bg: "#002025",
    surface: "#003035",
    gradient: "linear-gradient(145deg, #001418 0%, #002025 50%, #003035 100%)",
    family: "heritage",
    origin: "Zambezi, Limpopo, Nile, Congo",
  },
  hematite: {
    name: "Hematite",
    accent: "#90A4AE",
    bg: "#14191C",
    surface: "#20282C",
    gradient: "linear-gradient(145deg, #0B0E10 0%, #14191C 50%, #20282C 100%)",
    family: "heritage",
    origin: "Sishen & Thabazimbi, South Africa",
  },
  kalahari: {
    name: "Kalahari",
    accent: "#E8D9B5",
    bg: "#1F1B12",
    surface: "#2E281B",
    gradient: "linear-gradient(145deg, #100E09 0%, #1F1B12 50%, #2E281B 100%)",
    family: "heritage",
    origin: "Kalahari & Namib, Southern Africa",
  },
}

// ═══════════════════════════════════════════════════════════════
// BRAND OVERRIDES — Per-app accent colors
// Each mini-app overrides the primary accent.
// ═══════════════════════════════════════════════════════════════

export type BrandId =
  | "mukoko"
  | "nhimbe"
  | "bushtrade"
  | "lingo"
  | "shamwari"
  | "campfire"
  | "bytes"
  | "novels"
  | "news"
  | "places"
  | "circles"
  | "planner"
  | "transport"
  | "weather"
  | "health"
  | "jobs"
  | "wallet"

export const brandOverrides: Record<
  BrandId,
  {
    primary: string
    mineral: string
    primaryHover: string
    primaryMuted: string
    container: string
    onContainer: string
  }
> = {
  // ─── Mini-App accents (canonical from brand_ecosystem table) ──
  // Mineral assignments: tanzanite=identity/social/premium, cobalt=info/education/productivity,
  // malachite=events/health/nature, gold=commerce/places/wallet, terracotta=community
  mukoko: {
    primary: "#B388FF",
    mineral: "tanzanite",
    primaryHover: "#CE9FFF",
    primaryMuted: "rgba(179,136,255,0.12)",
    container: "#F3E5F5",
    onContainer: "#2E004D",
  },
  nhimbe: {
    primary: "#64FFDA",
    mineral: "malachite",
    primaryHover: "#80FFE4",
    primaryMuted: "rgba(100,255,218,0.12)",
    container: "#E0F2F1",
    onContainer: "#00332B",
  },
  bushtrade: {
    primary: "#FFD740",
    mineral: "gold",
    primaryHover: "#FFDF6B",
    primaryMuted: "rgba(255,215,64,0.12)",
    container: "#FFF8E1",
    onContainer: "#3E2723",
  },
  lingo: {
    primary: "#00B0FF",
    mineral: "cobalt",
    primaryHover: "#40C4FF",
    primaryMuted: "rgba(0,176,255,0.12)",
    container: "#E3F2FD",
    onContainer: "#002966",
  },
  shamwari: {
    primary: "#B388FF",
    mineral: "tanzanite",
    primaryHover: "#CE9FFF",
    primaryMuted: "rgba(179,136,255,0.12)",
    container: "#F3E5F5",
    onContainer: "#2E004D",
  },
  campfire: {
    primary: "#64FFDA",
    mineral: "malachite",
    primaryHover: "#80FFE4",
    primaryMuted: "rgba(100,255,218,0.12)",
    container: "#E0F2F1",
    onContainer: "#00332B",
  },
  bytes: {
    primary: "#B388FF",
    mineral: "tanzanite",
    primaryHover: "#CE9FFF",
    primaryMuted: "rgba(179,136,255,0.12)",
    container: "#F3E5F5",
    onContainer: "#2E004D",
  },
  novels: {
    primary: "#64FFDA",
    mineral: "malachite",
    primaryHover: "#80FFE4",
    primaryMuted: "rgba(100,255,218,0.12)",
    container: "#E0F2F1",
    onContainer: "#00332B",
  },
  news: {
    primary: "#00B0FF",
    mineral: "cobalt",
    primaryHover: "#40C4FF",
    primaryMuted: "rgba(0,176,255,0.12)",
    container: "#E3F2FD",
    onContainer: "#002966",
  },
  places: {
    primary: "#FFD740",
    mineral: "gold",
    primaryHover: "#FFDF6B",
    primaryMuted: "rgba(255,215,64,0.12)",
    container: "#FFF8E1",
    onContainer: "#3E2723",
  },
  circles: {
    primary: "#D4A574",
    mineral: "terracotta",
    primaryHover: "#E0B88A",
    primaryMuted: "rgba(212,165,116,0.12)",
    container: "#FBE9E7",
    onContainer: "#5D2906",
  },
  planner: {
    primary: "#00B0FF",
    mineral: "cobalt",
    primaryHover: "#40C4FF",
    primaryMuted: "rgba(0,176,255,0.12)",
    container: "#E3F2FD",
    onContainer: "#002966",
  },
  transport: {
    primary: "#FFD740",
    mineral: "gold",
    primaryHover: "#FFDF6B",
    primaryMuted: "rgba(255,215,64,0.12)",
    container: "#FFF8E1",
    onContainer: "#3E2723",
  },
  weather: {
    primary: "#00B0FF",
    mineral: "cobalt",
    primaryHover: "#40C4FF",
    primaryMuted: "rgba(0,176,255,0.12)",
    container: "#E3F2FD",
    onContainer: "#002966",
  },
  health: {
    primary: "#64FFDA",
    mineral: "malachite",
    primaryHover: "#80FFE4",
    primaryMuted: "rgba(100,255,218,0.12)",
    container: "#E0F2F1",
    onContainer: "#00332B",
  },
  jobs: {
    primary: "#FFD740",
    mineral: "gold",
    primaryHover: "#FFDF6B",
    primaryMuted: "rgba(255,215,64,0.12)",
    container: "#FFF8E1",
    onContainer: "#3E2723",
  },
  wallet: {
    primary: "#FFD740",
    mineral: "gold",
    primaryHover: "#FFDF6B",
    primaryMuted: "rgba(255,215,64,0.12)",
    container: "#FFF8E1",
    onContainer: "#3E2723",
  },
}

// ═══════════════════════════════════════════════════════════════
// BRAND INDUSTRY CATEGORIES — Mineral associations by sector
// Each brand (Nyuchi enterprise, Mukoko super app, Shamwari AI)
// organises products into industry categories, each with a
// mineral accent that reflects the industry's emotional tone.
// ═══════════════════════════════════════════════════════════════

export type IndustryCategory = {
  mineral: string
  label: string
  products: string[]
}

export const brandIndustryCategories: Record<string, Record<string, IndustryCategory>> = {
  nyuchi: {
    services: {
      mineral: "gold",
      label: "Services",
      products: ["Nyuchi Platform", "Tukmart", "Nyuchi Honey"],
    },
    travel: {
      mineral: "malachite",
      label: "Travel",
      products: ["Zimbabwe Travel Information", "Iconic Expeditions"],
    },
    education: {
      mineral: "cobalt",
      label: "Education",
      products: ["Nyuchi Learning", "Nyuchi Lingo"],
    },
    community: {
      mineral: "terracotta",
      label: "Community",
      products: ["Nyuchi Foundation", "Technology Leaders of Africa"],
    },
  },
  mukoko: {
    id: { mineral: "tanzanite", label: "Identity", products: ["Mukoko ID", "Digital Twin"] },
    news: { mineral: "cobalt", label: "News", products: ["Mukoko News"] },
    social: {
      mineral: "tanzanite",
      label: "Social",
      products: ["Campfire", "Bytes", "Novels", "Circles"],
    },
    events: { mineral: "malachite", label: "Events", products: ["Nhimbe"] },
    commerce: { mineral: "gold", label: "Commerce", products: ["BushTrade", "Wallet"] },
    places: { mineral: "gold", label: "Places", products: ["Places", "Transport"] },
    productivity: {
      mineral: "cobalt",
      label: "Productivity",
      products: ["Planner", "Weather", "Jobs"],
    },
    wellness: { mineral: "malachite", label: "Wellness", products: ["Health"] },
    language: { mineral: "cobalt", label: "Language", products: ["Lingo"] },
  },
  shamwari: {
    ai: { mineral: "tanzanite", label: "AI Companion", products: ["Shamwari AI", "Digital Twin"] },
  },
}

// ═══════════════════════════════════════════════════════════════
// TIER 3 — COMPONENT TOKENS
// Scoped values for specific brand components.
// ═══════════════════════════════════════════════════════════════

export const componentTokens = {
  header: { height: "56px", zIndex: "50" },
  bottomNav: { height: "80px", fabSize: "52px", fabRise: "24px" },
  sidebar: { width: "256px", collapsedWidth: "64px" },
  avatar: { sm: "32px", md: "40px", lg: "64px", xl: "80px", xxl: "120px" },
  badge: { height: "20px", padding: "0 8px", fontSize: "10px" },
  input: { height: "48px" },
  button: { height: "56px", heightSm: "48px", heightLg: "56px" },
  card: { padding: "16px", gap: "14px" },
  page: { maxWidth: "1280px", margin: "20px" },
  focusRing: { width: "2px", offset: "2px", color: "var(--ring)" },
  // GLOBAL CSS RULE (add to globals.css):
  // :focus-visible { outline: 2px solid var(--ring); outline-offset: 2px; }
  // button:focus-visible, a:focus-visible, [role="button"]:focus-visible,
  // input:focus-visible, select:focus-visible, textarea:focus-visible {
  //   outline: 2px solid var(--ring); outline-offset: 2px;
  // }
  mineralStrip: { width: "4px", position: "left", direction: "vertical" },
  listingImage: {
    aspectRatio: "1/1",
    description: "Always square — events, products, articles, places",
  },
} as const

// ═══════════════════════════════════════════════════════════════
// CSS GENERATOR — Produces CSS custom properties for :root
// ═══════════════════════════════════════════════════════════════

export function generateCSSVariables(theme: ThemeMode = "dark", brand: BrandId = "mukoko"): string {
  const semantic = semanticTokens[theme]
  const brandColors = brandOverrides[brand]

  const lines: string[] = [":root {"]

  // Seven minerals — theme-adaptive, each with container / on-container surfaces.
  // Values come straight from the DB snapshot (palette.generated.ts).
  for (const m of minerals) {
    lines.push(`  --color-${m.name}: ${theme === "light" ? m.lightHex : m.darkHex};`)
    lines.push(
      `  --color-${m.name}-container: ${theme === "light" ? m.containerLight : m.containerDark};`
    )
    lines.push(
      `  --color-${m.name}-on-container: ${
        theme === "light" ? m.onContainerLight : m.onContainerDark
      };`
    )
  }

  // Seven heritage tones — theme-adaptive.
  for (const h of heritageColors) {
    lines.push(`  --color-${h.name}: ${theme === "light" ? h.lightHex : h.darkHex};`)
  }

  // Radii
  for (const [key, val] of Object.entries(primitives.radius)) {
    lines.push(`  --radius-${key}: ${val.value};`)
  }

  // Spacing
  for (const [key, val] of Object.entries(primitives.spacing)) {
    lines.push(`  --space-${key}: ${val.value};`)
  }

  // Shadows
  for (const [key, val] of Object.entries(primitives.shadow)) {
    lines.push(`  --shadow-${key}: ${val.value};`)
  }

  // Touch targets
  lines.push(`  --touch-target: ${primitives.touchTarget.default.value};`)
  lines.push(`  --touch-target-sm: ${primitives.touchTarget.sm.value};`)

  // Motion
  for (const [key, val] of Object.entries(primitives.motion.duration)) {
    lines.push(`  --motion-${key}: ${val.value};`)
  }
  for (const [key, val] of Object.entries(primitives.motion.easing)) {
    lines.push(`  --easing-${key}: ${val.value};`)
  }

  // Semantic tokens (theme-dependent)
  for (const [key, val] of Object.entries(semantic)) {
    lines.push(`  --${key}: ${val.value};`)
  }

  // Brand overrides
  lines.push(`  --color-primary: ${brandColors.primary};`)
  lines.push(`  --color-primary-hover: ${brandColors.primaryHover};`)
  lines.push(`  --color-primary-muted: ${brandColors.primaryMuted};`)

  // Component tokens
  for (const [comp, tokens] of Object.entries(componentTokens)) {
    for (const [key, val] of Object.entries(tokens)) {
      lines.push(`  --${comp}-${key}: ${val};`)
    }
  }

  lines.push("}")
  return lines.join("\n")
}

// ═══════════════════════════════════════════════════════════════
// MULTI-PLATFORM TOKEN GENERATOR
// Produces token files for every platform in the ecosystem.
// ═══════════════════════════════════════════════════════════════

export type PlatformFormat =
  | "css"
  | "swift"
  | "kotlin"
  | "arkts"
  | "react-native"
  | "rust"
  | "python"
  | "json"

export function generateTokens(format: PlatformFormat): string {
  switch (format) {
    case "json":
      return JSON.stringify(
        {
          primitives,
          minerals,
          heritageColors,
          semanticTokens,
          brandOverrides,
          listingThemes,
          componentTokens,
        },
        null,
        2
      )

    case "swift":
      return generateSwiftTokens()

    case "kotlin":
      return generateKotlinTokens()

    case "rust":
      return generateRustTokens()

    case "python":
      return generatePythonTokens()

    default:
      return generateCSSVariables()
  }
}

function generateSwiftTokens(): string {
  const lines = [
    "// MUKOKO DESIGN TOKENS — Auto-generated from tokens.ts",
    "// Do not edit manually. Source: mzizi.dev",
    "import SwiftUI",
    "",
    "extension Color {",
  ]
  for (const key of [...mineralKeys, ...heritageKeys]) {
    // Swift color values are baked at asset-catalog generation time; the
    // emitted line just references the catalog key, so the dark/light
    // values aren't used in this loop.
    lines.push(
      `    static let mukoko${key.charAt(0).toUpperCase() + key.slice(1)} = Color("nyuchi-${key}")`
    )
  }
  lines.push("}")
  return lines.join("\n")
}

function generateKotlinTokens(): string {
  const lines = [
    "// MUKOKO DESIGN TOKENS — Auto-generated from tokens.ts",
    "// Do not edit manually. Source: mzizi.dev",
    "package com.mukoko.design.tokens",
    "",
    "import androidx.compose.ui.graphics.Color",
    "",
    "object MukokoColors {",
  ]
  for (const sw of paletteSwatches) {
    const hex = sw.darkHex.replace("#", "")
    lines.push(`    val ${sw.name.charAt(0).toUpperCase() + sw.name.slice(1)} = Color(0xFF${hex})`)
  }
  lines.push("}")
  return lines.join("\n")
}

function generateRustTokens(): string {
  const lines = [
    "// MUKOKO DESIGN TOKENS — Auto-generated from tokens.ts",
    "// Do not edit manually. Source: mzizi.dev",
    "",
  ]
  for (const sw of paletteSwatches) {
    lines.push(`pub const MUKOKO_${sw.name.toUpperCase()}: &str = "${sw.darkHex}";`)
  }
  return lines.join("\n")
}

function generatePythonTokens(): string {
  const lines = [
    "# MUKOKO DESIGN TOKENS — Auto-generated from tokens.ts",
    "# Do not edit manually. Source: mzizi.dev",
    "from dataclasses import dataclass",
    "",
    "@dataclass(frozen=True)",
    "class MukokoColors:",
  ]
  for (const sw of paletteSwatches) {
    lines.push(`    ${sw.name.toUpperCase()}: str = "${sw.darkHex}"`)
  }
  return lines.join("\n")
}

// ═══════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════
// SEMANTIC STATUS & ALERT TOKEN SYSTEM
//
// IMPORTANT: These use GLOBALLY RECOGNIZED accessibility colors,
// NOT the Five African Minerals. The minerals are brand identity
// (links, CTAs, achievements, community). Status colors are a
// SEPARATE universal system that works across all languages,
// literacy levels, and cultures. Color is the first thing people
// see — especially across Africa and different languages.
//
// WCAG AA compliant on both light and dark backgrounds.
// Based on: Material Design, Apple HIG, W3C accessibility guidelines.
// ═══════════════════════════════════════════════════════════════

/**
 * Universal status colors — WCAG AA compliant, globally recognized.
 * These are NOT minerals. Red = error. Amber = warning. Green = success.
 * People see color before text. This is critical for accessibility.
 */
export const universalStatus = {
  success: "#22C55E", // Green-500 — universal "go/safe/done/complete"
  warning: "#F59E0B", // Amber-500 — universal "caution/attention/pending"
  error: "#EF4444", // Red-500 — universal "stop/danger/error/failed"
  info: "#3B82F6", // Blue-500 — universal "notice/information/help"
  neutral: "#6B7280", // Gray-500 — neutral/inactive/disabled/unknown
} as const

/**
 * Status tokens — the universal 5-state status system.
 * Every component that shows success/warning/error/info/neutral uses these.
 */
export const statusTokens = {
  success: {
    value: "var(--status-success, #22C55E)",
    css: "--status-success",
    hex: "#22C55E",
    label: "Success",
  },
  warning: {
    value: "var(--status-warning, #F59E0B)",
    css: "--status-warning",
    hex: "#F59E0B",
    label: "Warning",
  },
  error: {
    value: "var(--status-error, #EF4444)",
    css: "--status-error",
    hex: "#EF4444",
    label: "Error",
  },
  info: {
    value: "var(--status-info, #3B82F6)",
    css: "--status-info",
    hex: "#3B82F6",
    label: "Info",
  },
  neutral: {
    value: "var(--status-neutral, #6B7280)",
    css: "--status-neutral",
    hex: "#6B7280",
    label: "Neutral",
  },
} as const

/**
 * Severity tokens — graduated urgency scale for alerts, weather, health.
 * Uses universally recognized color escalation: green → amber → orange → red.
 */
export const severityTokens = {
  low: {
    value: "var(--severity-low, #22C55E)",
    css: "--severity-low",
    hex: "#22C55E",
    label: "Low",
  },
  moderate: {
    value: "var(--severity-moderate, #F59E0B)",
    css: "--severity-moderate",
    hex: "#F59E0B",
    label: "Moderate",
  },
  high: {
    value: "var(--severity-high, #F97316)",
    css: "--severity-high",
    hex: "#F97316",
    label: "High",
  },
  severe: {
    value: "var(--severity-severe, #EF4444)",
    css: "--severity-severe",
    hex: "#EF4444",
    label: "Severe",
  },
  extreme: {
    value: "var(--severity-extreme, #DC2626)",
    css: "--severity-extreme",
    hex: "#DC2626",
    label: "Extreme",
  },
  cold: {
    value: "var(--severity-cold, #3B82F6)",
    css: "--severity-cold",
    hex: "#3B82F6",
    label: "Cold",
  },
} as const

/**
 * Notification tokens — for toast, banner, and notification components.
 * Same universal colors as status — consistency across all notification types.
 */
export const notificationTokens = {
  success: {
    value: "var(--notification-success, #22C55E)",
    css: "--notification-success",
    hex: "#22C55E",
  },
  warning: {
    value: "var(--notification-warning, #F59E0B)",
    css: "--notification-warning",
    hex: "#F59E0B",
  },
  error: {
    value: "var(--notification-error, #EF4444)",
    css: "--notification-error",
    hex: "#EF4444",
  },
  info: { value: "var(--notification-info, #3B82F6)", css: "--notification-info", hex: "#3B82F6" },
} as const

/**
 * Connection tokens — connectivity gradient for local-first architecture.
 * Green = online, Blue = syncing, Amber = cached, Red/Orange = offline.
 */
export const connectionTokens = {
  online: {
    value: "var(--connection-online, #22C55E)",
    css: "--connection-online",
    hex: "#22C55E",
    label: "Connected",
  },
  syncing: {
    value: "var(--connection-syncing, #3B82F6)",
    css: "--connection-syncing",
    hex: "#3B82F6",
    label: "Syncing",
  },
  cached: {
    value: "var(--connection-cached, #F59E0B)",
    css: "--connection-cached",
    hex: "#F59E0B",
    label: "Cached",
  },
  offline: {
    value: "var(--connection-offline, #EF4444)",
    css: "--connection-offline",
    hex: "#EF4444",
    label: "Offline",
  },
} as const

/**
 * Verification tier tokens — these DO use minerals because they are BRAND identity.
 * Verification tiers are a Mukoko-specific concept, not a universal status.
 * The minerals communicate prestige and progression within the ecosystem.
 */
export const verificationTokens = {
  unverified: {
    value: "var(--tier-unverified, #6B7280)",
    css: "--tier-unverified",
    hex: "#6B7280",
    label: "Unverified",
  },
  community: {
    value: "var(--tier-community, var(--color-malachite, #64FFDA))",
    css: "--tier-community",
    mineral: "malachite",
    label: "Community",
  },
  otp: {
    value: "var(--tier-otp, var(--color-cobalt, #00B0FF))",
    css: "--tier-otp",
    mineral: "cobalt",
    label: "OTP Verified",
  },
  government: {
    value: "var(--tier-government, var(--color-tanzanite, #B388FF))",
    css: "--tier-government",
    mineral: "tanzanite",
    label: "Government ID",
  },
  licensed: {
    value: "var(--tier-licensed, var(--color-gold, #FFD740))",
    css: "--tier-licensed",
    mineral: "gold",
    label: "Licensed",
  },
} as const

/**
 * Crypto level tokens — universal color scale (green = safe, red = none).
 * NOT minerals — these are security indicators that must be instantly readable.
 */
export const cryptoTokens = {
  quantumSafe: {
    value: "var(--crypto-quantum-safe, #22C55E)",
    css: "--crypto-quantum-safe",
    hex: "#22C55E",
    label: "Quantum Safe",
  },
  classical: {
    value: "var(--crypto-classical, #3B82F6)",
    css: "--crypto-classical",
    hex: "#3B82F6",
    label: "Classical",
  },
  weak: {
    value: "var(--crypto-weak, #F59E0B)",
    css: "--crypto-weak",
    hex: "#F59E0B",
    label: "Weak",
  },
  none: {
    value: "var(--crypto-none, #EF4444)",
    css: "--crypto-none",
    hex: "#EF4444",
    label: "None",
  },
} as const

/**
 * Moderation tokens — universal colors (green = approved, red = rejected).
 */
export const moderationTokens = {
  approved: {
    value: "var(--moderation-approved, #22C55E)",
    css: "--moderation-approved",
    hex: "#22C55E",
    label: "Approved",
  },
  pending: {
    value: "var(--moderation-pending, #F59E0B)",
    css: "--moderation-pending",
    hex: "#F59E0B",
    label: "Pending",
  },
  flagged: {
    value: "var(--moderation-flagged, #F97316)",
    css: "--moderation-flagged",
    hex: "#F97316",
    label: "Flagged",
  },
  rejected: {
    value: "var(--moderation-rejected, #EF4444)",
    css: "--moderation-rejected",
    hex: "#EF4444",
    label: "Rejected",
  },
} as const

/**
 * Service health tokens — universal colors (green = operational, red = outage).
 */
export const serviceHealthTokens = {
  operational: {
    value: "var(--health-operational, #22C55E)",
    css: "--health-operational",
    hex: "#22C55E",
    label: "Operational",
  },
  degraded: {
    value: "var(--health-degraded, #F59E0B)",
    css: "--health-degraded",
    hex: "#F59E0B",
    label: "Degraded",
  },
  outage: {
    value: "var(--health-outage, #EF4444)",
    css: "--health-outage",
    hex: "#EF4444",
    label: "Outage",
  },
  maintenance: {
    value: "var(--health-maintenance, #3B82F6)",
    css: "--health-maintenance",
    hex: "#3B82F6",
    label: "Maintenance",
  },
} as const

/**
 * Generate CSS custom property declarations for all semantic tokens.
 */
export function generateStatusCSS(): string {
  const lines = [":root {", "  /* Universal status colors — NOT minerals */"]
  const groups = [
    { name: "Status", tokens: statusTokens },
    { name: "Severity", tokens: severityTokens },
    { name: "Notification", tokens: notificationTokens },
    { name: "Connection", tokens: connectionTokens },
    { name: "Crypto", tokens: cryptoTokens },
    { name: "Moderation", tokens: moderationTokens },
    { name: "Health", tokens: serviceHealthTokens },
  ]
  for (const group of groups) {
    lines.push(`  /* ${group.name} */`)
    for (const [, token] of Object.entries(group.tokens)) {
      if ("css" in token && "hex" in token) lines.push(`  ${token.css}: ${token.hex};`)
    }
  }
  lines.push("  /* Verification tiers — these use minerals (brand identity) */")
  lines.push("  --tier-unverified: #6B7280;")
  lines.push("  --tier-community: var(--color-malachite, #64FFDA);")
  lines.push("  --tier-otp: var(--color-cobalt, #00B0FF);")
  lines.push("  --tier-government: var(--color-tanzanite, #B388FF);")
  lines.push("  --tier-licensed: var(--color-gold, #FFD740);")
  lines.push("}")
  return lines.join("\n")
}

// CHART COLOR SYSTEM
// Maps chart indices to Five African Minerals + Heritage colors.
// Replaces shadcn default --chart-1..5 with Nyuchi mineral palette.
// Import mineralChartConfig in any chart block for instant brand compliance.
// ═══════════════════════════════════════════════════════════════

/**
 * CSS custom property definitions for globals.css:
 *
 * :root (light mode):
 *   --chart-1: #0047AB;  (cobalt)
 *   --chart-2: #4B0082;  (tanzanite)
 *   --chart-3: #004D40;  (malachite)
 *   --chart-4: #5D4037;  (gold)
 *   --chart-5: #8B4513;  (terracotta)
 *
 * .dark:
 *   --chart-1: #00B0FF;  (cobalt)
 *   --chart-2: #B388FF;  (tanzanite)
 *   --chart-3: #64FFDA;  (malachite)
 *   --chart-4: #FFD740;  (gold)
 *   --chart-5: #D4A574;  (terracotta)
 */

/** Pre-built chart configs mapping data keys to mineral colors */
export const mineralChartConfig = {
  /** Single-series chart — uses cobalt */
  single: (label: string) => ({
    value: { label, color: "var(--color-cobalt, #00B0FF)" },
  }),
  /** Two-series chart — cobalt + malachite */
  dual: (label1: string, label2: string) => ({
    [label1.toLowerCase().replace(/\\s/g, "_")]: {
      label: label1,
      color: "var(--color-cobalt, #00B0FF)",
    },
    [label2.toLowerCase().replace(/\\s/g, "_")]: {
      label: label2,
      color: "var(--color-malachite, #64FFDA)",
    },
  }),
  /** Five-series chart — all five minerals */
  fiveMinerals: (labels: [string, string, string, string, string]) => ({
    [labels[0].toLowerCase().replace(/\\s/g, "_")]: {
      label: labels[0],
      color: "var(--color-cobalt, #00B0FF)",
    },
    [labels[1].toLowerCase().replace(/\\s/g, "_")]: {
      label: labels[1],
      color: "var(--color-tanzanite, #B388FF)",
    },
    [labels[2].toLowerCase().replace(/\\s/g, "_")]: {
      label: labels[2],
      color: "var(--color-malachite, #64FFDA)",
    },
    [labels[3].toLowerCase().replace(/\\s/g, "_")]: {
      label: labels[3],
      color: "var(--color-gold, #FFD740)",
    },
    [labels[4].toLowerCase().replace(/\\s/g, "_")]: {
      label: labels[4],
      color: "var(--color-terracotta, #E1B07E)",
    },
  }),
  /** Heritage colors for the atmospheric series — all seven, DB-sourced */
  heritage: Object.fromEntries(
    heritageColors.map((h) => [h.name, `var(${h.cssVar}, ${h.darkHex})`])
  ) as Record<string, string>,
} as const

/** Chart color array for recharts — seven minerals then seven heritage, DB order */
export const mineralChartColors: readonly string[] = paletteSwatches.map(
  (sw) => `var(${sw.cssVar}, ${sw.darkHex})`
)

// ═══════════════════════════════════════════════════════════════
// COLOR RESOLUTION UTILITIES
// For Canvas-based charts and non-CSS-aware rendering contexts.
// CSS var() references don't work in Canvas 2D — these resolve
// them to concrete hex values at runtime.
// ═══════════════════════════════════════════════════════════════

/**
 * Resolve a CSS custom property to its computed value.
 * Returns the concrete color for Canvas 2D, WebGL, or native contexts.
 * Falls back to the raw string if resolution fails (SSR, DOM not ready).
 */
export function resolveColor(color: string): string {
  if (typeof window === "undefined") return color
  if (!color.startsWith("var(")) return color
  const prop = color
    .replace(/^var\(/, "")
    .replace(/\)$/, "")
    .split(",")[0]
    .trim()
  try {
    const resolved = getComputedStyle(document.documentElement).getPropertyValue(prop).trim()
    return resolved || color
  } catch {
    return color
  }
}

/**
 * Apply alpha to a resolved color string.
 * Handles hex (#RGB, #RRGGBB), rgb(), rgba(), hsl(), hsla(), oklch().
 * Canvas 2D cannot use CSS opacity — must compute rgba directly.
 */
export function hexWithAlpha(color: string, alpha: number): string {
  const a = Math.max(0, Math.min(1, alpha))
  if (!color || color.startsWith("var(")) return `rgba(0,0,0,${a})`

  const rgbMatch = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/)
  if (rgbMatch) return `rgba(${rgbMatch[1]},${rgbMatch[2]},${rgbMatch[3]},${a})`

  const hslMatch = color.match(/^hsla?\(\s*([\d.]+),\s*([\d.]+)%,\s*([\d.]+)%/)
  if (hslMatch) return `hsla(${hslMatch[1]},${hslMatch[2]}%,${hslMatch[3]}%,${a})`

  const oklchMatch = color.match(/^oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)/)
  if (oklchMatch) return `oklch(${oklchMatch[1]} ${oklchMatch[2]} ${oklchMatch[3]} / ${a})`

  if (color.startsWith("#")) {
    const hex = color.replace("#", "")
    const base =
      hex.length === 3
        ? hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2]
        : hex.length >= 6
          ? hex.slice(0, 6)
          : hex
    return `#${base}${Math.round(a * 255)
      .toString(16)
      .padStart(2, "0")}`
  }

  return `rgba(0,0,0,${a})`
}

/**
 * Generate the canonical tokens.json — single source of truth for all platform generators.
 * The architecture doc specifies: "The source of truth is a single tokens.json file
 * that all platform generators read from."
 */
export function generateTokensJSON(): string {
  // Upstream bug: the registry source of this function references
  // `primitives.typography`, `primitives.typeScale`, and `primitives.touchTargets`
  // which don't exist on the current primitives shape. Aligned to actual
  // shape (`primitives.touchTarget`, no typography/typeScale) so the module
  // type-checks. Tracking upstream — the intent is to fold typography into
  // primitives or reference it from componentTokens.
  return JSON.stringify(
    {
      $schema: "https://mzizi.dev/tokens/v1",
      version: "4.0.2",
      generated: new Date().toISOString(),
      colors: { minerals, heritage: heritageColors, semantic: semanticTokens },
      radii: primitives.radius,
      spacing: primitives.spacing,
      motion: primitives.motion,
      touchTarget: primitives.touchTarget,
      brandOverrides,
      chartColors: mineralChartColors,
      status: statusTokens,
      severity: severityTokens,
      notifications: notificationTokens,
      connection: connectionTokens,
      verification: verificationTokens,
      crypto: cryptoTokens,
      moderation: moderationTokens,
      serviceHealth: serviceHealthTokens,
    },
    null,
    2
  )
}

/**
 * Generate ArkTS/ArkUI tokens for HarmonyOS native shell.
 * Maps minerals + semantics to ArkUI Resource files + theme tokens.
 */
export function generateArkTS(): string {
  const lines: string[] = [
    "// Auto-generated — Nyuchi Design Tokens for ArkUI",
    "// Source: mzizi.dev",
    "",
  ]
  lines.push("export const NyuchiColors = {")
  for (const sw of paletteSwatches) {
    lines.push(`  ${sw.name}: "${sw.darkHex}",`)
  }
  lines.push("}")
  lines.push("")
  lines.push("export const NyuchiRadii = {")
  lines.push("  sm: 7, md: 12, lg: 14, xl: 17, full: 9999,")
  lines.push("}")
  return lines.join("\n")
}
