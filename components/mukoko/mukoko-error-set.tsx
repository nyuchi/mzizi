"use client"

// ── INFRASTRUCTURE HARNESS (auto-wired) ──
// Every brand component participates in observability, motion, a11y,
// and health monitoring via the harness. Zero manual config.

import * as React from "react"
import {
  AlertTriangle,
  WifiOff,
  Wifi,
  RefreshCw,
  ArrowLeft,
  Home,
  Shield,
  ChevronRight,
} from "@/lib/icons"
import { cn } from "@/lib/utils"

/* ═══════════════════════════════════════════════════════════════
   NYUCHI ERROR SET — Brand Feedback Components
   
   Error states are part of brand identity. When things go wrong,
   the experience should still feel like Mukoko — mineral colors,
   branded typography, Ubuntu-spirited copy ("The community is
   here to help"), and clear paths forward.
   
   The 7-layer architecture means errors are nuanced:
   - Offline? Data may still be available from local layer
   - Section failed? The page survives, only that section shows fallback
   - Trust-gated? Show which tier is needed and how to get there
   
   These are BRAND components, not primitives. They compose
   error-boundary, button, badge, and verified-badge primitives
   into the Mukoko visual language.
   ═══════════════════════════════════════════════════════════════ */

/* ── 1. ERROR CARD (inline, within feeds/lists) ─────────────── */
interface ErrorCardProps {
  title?: string
  message?: string
  onRetry?: () => void
  mineral?: "malachite" | "cobalt" | "gold" | "tanzanite" | "terracotta"
  className?: string
}

function ErrorCard({
  title = "Something went wrong",
  message = "We could not load this content. Please try again.",
  onRetry,
  mineral = "terracotta",
  className,
}: ErrorCardProps) {
  const mineralColors: Record<string, string> = {
    malachite: "var(--status-success, #22C55E)",
    cobalt: "var(--status-info, #3B82F6)",
    gold: "var(--status-warning, #F59E0B)",
    tanzanite: "var(--status-info, #3B82F6)",
    terracotta: "var(--status-error, #EF4444)",
  }
  const color = mineralColors[mineral]

  return (
    <div
      data-slot="nyuchi-error-card"
      data-portal="https://mzizi.dev/components/nyuchi-error-card"
      role="alert"
      className={cn(
        "flex items-center gap-3 rounded-[var(--radius-card,14px)] border-l-4 bg-card px-4 py-3 ring-1 ring-foreground/10",
        className
      )}
      style={{ borderLeftColor: color }}
    >
      <div
        className="flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-inner,7px)]"
        style={{ backgroundColor: `color-mix(in srgb, ${color} 15%, transparent)` }}
      >
        <AlertTriangle className="size-4" style={{ color }} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-foreground">{title}</div>
        <div className="mt-0.5 text-xs text-muted-foreground">{message}</div>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex size-9 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-foreground/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary,#00B0FF)]"
        >
          <RefreshCw className="size-4 text-muted-foreground" />
        </button>
      )}
    </div>
  )
}

/* ── 2. NOT FOUND (brand 404 page) ──────────────────────────── */
interface NotFoundProps {
  title?: string
  message?: string
  onBack?: () => void
  onHome?: () => void
  className?: string
}

function NotFound({
  title = "Page not found",
  message = "The page you are looking for does not exist or has been moved.",
  onBack,
  onHome,
  className,
}: NotFoundProps) {
  return (
    <div
      data-slot="nyuchi-not-found"
      className={cn(
        "flex min-h-[60vh] flex-col items-center justify-center px-6 text-center",
        className
      )}
    >
      {/* 404 display with mineral dots */}
      <div className="mb-6 flex items-baseline gap-1 text-7xl font-bold text-foreground/10">
        <span>4</span>
        <div className="flex gap-1.5 pb-2">
          {[
            "var(--status-info, #3B82F6)",
            "var(--status-info, #3B82F6)",
            "var(--status-success, #22C55E)",
            "var(--status-warning, #F59E0B)",
            "var(--status-error, #EF4444)",
          ].map((c, i) => (
            <div key={i} className="size-2.5 rounded-full" style={{ backgroundColor: c }} />
          ))}
        </div>
        <span>4</span>
      </div>

      <h1 className="font-serif text-2xl font-bold text-foreground">{title}</h1>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">{message}</p>

      <div className="mt-6 flex gap-3">
        {onBack && (
          <button
            onClick={onBack}
            className="flex h-11 items-center gap-2 rounded-full border border-border px-5 text-sm font-medium text-foreground transition-colors hover:bg-foreground/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary,#00B0FF)]"
          >
            <ArrowLeft className="size-4" />
            Go Back
          </button>
        )}
        {onHome && (
          <button
            onClick={onHome}
            className="bg-[var(--status-success, #22C55E)] flex h-11 items-center gap-2 rounded-full px-5 text-sm font-semibold text-background"
          >
            <Home className="size-4" />
            Home
          </button>
        )}
      </div>
    </div>
  )
}

/* ── 3. OFFLINE BANNER (local-first connection status) ──────── */
interface OfflineBannerProps {
  /** Whether the device is connected to the network */
  isOnline: boolean
  /** Whether data is being served from local cache */
  isUsingCache?: boolean
  /** Last successful sync timestamp */
  lastSyncAt?: Date | string
  className?: string
}

function OfflineBanner({
  isOnline,
  isUsingCache = false,
  lastSyncAt,
  className,
}: OfflineBannerProps) {
  if (isOnline && !isUsingCache) return null

  const lastSync = lastSyncAt
    ? typeof lastSyncAt === "string"
      ? new Date(lastSyncAt)
      : lastSyncAt
    : null

  return (
    <div
      data-slot="nyuchi-offline-banner"
      className={cn(
        "flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium",
        isOnline
          ? "bg-[var(--status-warning, #F59E0B)]/10 text-[var(--status-warning, #F59E0B)]"
          : "bg-foreground/5 text-muted-foreground",
        className
      )}
    >
      {isOnline ? (
        <>
          <Wifi className="size-3.5" />
          <span>Showing cached data</span>
          {lastSync && (
            <span className="opacity-60">
              · Last synced{" "}
              {lastSync.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
        </>
      ) : (
        <>
          <WifiOff className="size-3.5" />
          <span>You are offline</span>
          {lastSync && (
            <span className="opacity-60">
              · Using data from{" "}
              {lastSync.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
        </>
      )}
    </div>
  )
}

/* ── 4. PERMISSION GATE (trust-tier access restriction) ────── */
interface PermissionGateProps {
  /** The verification tier required to access this feature */
  requiredTier: "community" | "otp" | "government" | "licensed"
  /** The user current tier */
  currentTier?: "unverified" | "community" | "otp" | "government" | "licensed"
  /** Feature name that is restricted */
  featureName?: string
  /** CTA callback */
  onVerify?: () => void
  className?: string
}

const tierLabels: Record<string, string> = {
  community: "Community Verified",
  otp: "Contact Verified",
  government: "Government Verified",
  licensed: "Licensed Professional",
}

const tierColors: Record<string, string> = {
  community: "var(--status-error, #EF4444)",
  otp: "var(--status-info, #3B82F6)",
  government: "var(--status-warning, #F59E0B)",
  licensed: "var(--status-info, #3B82F6)",
}

function PermissionGate({
  requiredTier,
  currentTier: _currentTier = "unverified",
  featureName = "this feature",
  onVerify,
  className,
}: PermissionGateProps) {
  const color = tierColors[requiredTier]

  return (
    <div
      data-slot="nyuchi-permission-gate"
      className={cn(
        "flex flex-col items-center rounded-[var(--radius-card,14px)] bg-card px-6 py-8 text-center ring-1 ring-foreground/10",
        className
      )}
    >
      <div
        className="mb-4 flex size-14 items-center justify-center rounded-full"
        style={{ backgroundColor: `color-mix(in srgb, ${color} 15%, transparent)` }}
      >
        <Shield className="size-7" style={{ color }} />
      </div>

      <h3 className="font-serif text-lg font-bold text-foreground">Verification Required</h3>
      <p className="mt-2 max-w-xs text-sm text-muted-foreground">
        {featureName} requires{" "}
        <span className="font-medium" style={{ color }}>
          {tierLabels[requiredTier]}
        </span>{" "}
        status. Complete verification to unlock access.
      </p>

      {onVerify && (
        <button
          onClick={onVerify}
          className="mt-5 flex h-11 items-center gap-2 rounded-full px-6 text-sm font-semibold text-background"
          style={{ backgroundColor: color }}
        >
          <Shield className="size-4" />
          Verify Now
          <ChevronRight className="size-4" />
        </button>
      )}
    </div>
  )
}

/* ── 5. SECTION FALLBACK (section-level error with retry) ──── */
interface SectionFallbackProps {
  sectionName?: string
  error?: Error | string
  onRetry?: () => void
  className?: string
}

function SectionFallback({
  sectionName = "This section",
  error,
  onRetry,
  className,
}: SectionFallbackProps) {
  return (
    <div
      data-slot="nyuchi-section-fallback"
      className={cn(
        "flex flex-col items-center rounded-[var(--radius-card,14px)] bg-card px-6 py-6 text-center ring-1 ring-foreground/10",
        className
      )}
    >
      <AlertTriangle className="text-[var(--status-error, #EF4444)] size-8" />
      <p className="mt-3 text-sm font-medium text-foreground">{sectionName} could not load</p>
      {error && (
        <p className="mt-1 text-xs text-muted-foreground">
          {typeof error === "string" ? error : error.message}
        </p>
      )}
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 flex h-9 items-center gap-2 rounded-full border border-border px-4 text-xs font-medium text-foreground transition-colors hover:bg-foreground/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary,#00B0FF)]"
        >
          <RefreshCw className="size-3.5" />
          Try Again
        </button>
      )}
    </div>
  )
}

export { ErrorCard, NotFound, OfflineBanner, PermissionGate, SectionFallback }
export type {
  ErrorCardProps,
  NotFoundProps,
  OfflineBannerProps,
  PermissionGateProps,
  SectionFallbackProps,
}
