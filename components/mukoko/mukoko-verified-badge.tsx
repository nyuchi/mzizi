"use client"

// ── INFRASTRUCTURE HARNESS (auto-wired) ──
// Every brand component participates in observability, motion, a11y,
// and health monitoring via the harness. Zero manual config.
import { useNyuchiHarness } from "@/lib/harness"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Users, Phone, ShieldCheck, Award, Ban, Flower2 } from "@/lib/icons"
import { cn } from "@/lib/utils"

/* ═══════════════════════════════════════════════════════════════
   MUKOKO VERIFIED BADGE — Brand Identity Component
   
   Three-axis trust model (nyuchi_platform_db):
   
   AXIS 1 — STATUS (identity.person.mit_status)
     Platform lifecycle. Independent of verification.
     pre_verification | living | liveness_pending |
     suspended | presumed_ancestral | verified_ancestral
   
   AXIS 2 — VERIFICATION TIER (system.verification_tier)
     Identity ladder. How real are you?
     Level 0: Unverified     — no badge
     Level 1: Community      — Terracotta (var(--color-terracotta,#D4A574)) — +0.10
     Level 2: OTP            — Cobalt (var(--tier-otp,var(--color-cobalt,#00B0FF)))     — +0.10 (cumulative 0.20)
     Level 3: Government     — Gold (var(--tier-licensed,var(--color-gold,#FFD740)))       — +0.10 (cumulative 0.30)
     Level 4: Licensed       — Tanzanite (var(--tier-government,var(--color-tanzanite,#B388FF)))  — +0.20 (cumulative 0.50)
   
   AXIS 3 — TRUST SCORE (computed output)
     trust = sum(tier_increments up to current level) + status_modifier
     Suspended/ancestral = fixed at status modifier (trust frozen)
   
   The badge renders based on TIER (which mineral check you see)
   but respects STATUS (dimmed if suspended, memorial if ancestral).
   ═══════════════════════════════════════════════════════════════ */

/** Verification tier codes from system.verification_tier.tier_code */
type VerificationTier = "unverified" | "community" | "otp" | "government" | "licensed"

/** Platform status from identity.person.mit_status */
type PlatformStatus =
  | "pre_verification"
  | "living"
  | "liveness_pending"
  | "suspended"
  | "presumed_ancestral"
  | "verified_ancestral"

/** Full tier configuration mapping to system.verification_tier */
const TIER_CONFIG = {
  unverified: {
    level: 0,
    mineral: null,
    label: "Unverified",
    trustIncrement: 0.0,
    cumulativeTrust: 0.0,
    fg: "transparent",
    bg: "transparent",
    fgLight: "transparent",
    bgLight: "transparent",
    icon: null,
  },
  community: {
    level: 1,
    mineral: "Terracotta",
    label: "Community Verified",
    trustIncrement: 0.1,
    cumulativeTrust: 0.1,
    fg: "var(--color-terracotta,#D4A574)",
    bg: "rgba(212,165,116,0.15)",
    fgLight: "var(--color-terracotta-light,#8B4513)",
    bgLight: "rgba(139,69,19,0.12)",
    icon: Users,
  },
  otp: {
    level: 2,
    mineral: "Cobalt",
    label: "Contact Verified",
    trustIncrement: 0.1,
    cumulativeTrust: 0.2,
    fg: "var(--tier-otp,var(--color-cobalt,#00B0FF))",
    bg: "rgba(0,176,255,0.15)",
    fgLight: "var(--color-cobalt-light,#0047AB)",
    bgLight: "rgba(0,71,171,0.12)",
    icon: Phone,
  },
  government: {
    level: 3,
    mineral: "Gold",
    label: "Government Verified",
    trustIncrement: 0.1,
    cumulativeTrust: 0.3,
    fg: "var(--tier-licensed,var(--color-gold,#FFD740))",
    bg: "rgba(255,215,64,0.15)",
    fgLight: "var(--color-gold-light,#5D4037)",
    bgLight: "rgba(93,64,55,0.12)",
    icon: ShieldCheck,
  },
  licensed: {
    level: 4,
    mineral: "Tanzanite",
    label: "Licensed Professional",
    trustIncrement: 0.2,
    cumulativeTrust: 0.5,
    fg: "var(--tier-government,var(--color-tanzanite,#B388FF))",
    bg: "rgba(179,136,255,0.15)",
    fgLight: "var(--color-tanzanite-light,#4B0082)",
    bgLight: "rgba(75,0,130,0.12)",
    icon: Award,
  },
} as const

/** Status overlay configuration from system.platform_status_trust */
const STATUS_OVERLAY = {
  pre_verification: { modifier: 0.0, active: true, overlay: null },
  living: { modifier: 0.0, active: true, overlay: null },
  liveness_pending: { modifier: 0.0, active: true, overlay: null },
  suspended: { modifier: -0.05, active: false, overlay: "suspended" as const },
  presumed_ancestral: { modifier: 0.05, active: false, overlay: "ancestral" as const },
  verified_ancestral: { modifier: 0.05, active: false, overlay: "ancestral" as const },
} as const

const badgeSizeVariants = cva(
  "inline-flex shrink-0 items-center justify-center rounded-full transition-opacity",
  {
    variants: {
      size: {
        sm: "size-3.5" /* Inline with text — next to names */,
        md: "size-[18px]" /* Default — cards, headers */,
        lg: "size-6" /* Profile pages */,
        xl: "size-8" /* Verification detail views */,
      },
    },
    defaultVariants: { size: "md" },
  }
)

const iconSizeMap = { sm: 10, md: 12, lg: 16, xl: 20 } as const

interface NyuchiVerifiedBadgeProps extends VariantProps<typeof badgeSizeVariants> {
  /** Verification tier code (system.verification_tier.tier_code) */
  tier: VerificationTier
  /** Platform status (identity.person.mit_status). Affects badge appearance. */
  status?: PlatformStatus
  /** Show tooltip with tier name on hover */
  showTooltip?: boolean
  /** Render a skeleton placeholder instead of the badge */
  loading?: boolean
  className?: string
}

function NyuchiVerifiedBadge({
  tier,
  status = "living",
  size = "md",
  showTooltip = true,
  loading = false,
  className,
}: NyuchiVerifiedBadgeProps) {
  useNyuchiHarness("verified-badge") // harness pre-wires observability + motion + a11y
  if (loading)
    return (
      <span
        data-slot="nyuchi-verified-badge"
        data-portal="https://mzizi.dev/components/nyuchi-verified-badge"
        data-loading
        className="inline-flex size-4 animate-pulse rounded-full bg-muted"
      />
    )

  const config = TIER_CONFIG[tier]
  const statusConfig = STATUS_OVERLAY[status]
  const iconSize = iconSizeMap[size || "md"]

  /* Level 0 = no badge */
  if (!config.icon || tier === "unverified") return null

  /* Suspended: show ban overlay instead of tier icon */
  if (statusConfig.overlay === "suspended") {
    return (
      <span
        data-slot="nyuchi-verified-badge"
        data-tier={tier}
        data-status="suspended"
        aria-label="Account Suspended"
        title={showTooltip ? "Account Suspended" : undefined}
        className={cn(badgeSizeVariants({ size }), "opacity-40", className)}
        style={{ backgroundColor: "rgba(107,107,102,0.15)" }}
      >
        <Ban width={iconSize} height={iconSize} strokeWidth={2.5} color="#6B6B66" />
      </span>
    )
  }

  /* Ancestral: show memorial flower with dimmed tier color */
  if (statusConfig.overlay === "ancestral") {
    return (
      <span
        data-slot="nyuchi-verified-badge"
        data-tier={tier}
        data-status={status}
        aria-label={`${config.label} — Memorial`}
        title={showTooltip ? `${config.label} — Memorial` : undefined}
        className={cn(badgeSizeVariants({ size }), "opacity-60", className)}
        style={{ backgroundColor: config.bg }}
      >
        <Flower2 width={iconSize} height={iconSize} strokeWidth={2} style={{ color: config.fg }} />
      </span>
    )
  }

  /* Active: show full tier badge */
  const Icon = config.icon
  return (
    <span
      data-slot="nyuchi-verified-badge"
      data-tier={tier}
      data-level={config.level}
      data-trust={config.cumulativeTrust}
      aria-label={config.label}
      title={showTooltip ? `${config.label} · Trust ${config.cumulativeTrust}` : undefined}
      className={cn(badgeSizeVariants({ size }), className)}
      style={{ backgroundColor: config.bg }}
    >
      <Icon width={iconSize} height={iconSize} strokeWidth={2.5} style={{ color: config.fg }} />
    </span>
  )
}

/* ── Utility: compute trust score on the client ──────────────── */
function computeTrustScore(tier: VerificationTier, status: PlatformStatus): number {
  const statusConfig = STATUS_OVERLAY[status]

  // Suspended/ancestral = fixed at modifier only
  if (!statusConfig.active) return statusConfig.modifier

  // Active = cumulative tier score + status modifier
  return TIER_CONFIG[tier].cumulativeTrust + statusConfig.modifier
}

export { NyuchiVerifiedBadge, computeTrustScore, TIER_CONFIG, STATUS_OVERLAY }
export type { NyuchiVerifiedBadgeProps, VerificationTier, PlatformStatus }
