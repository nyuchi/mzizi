import type { Metadata } from "next"
import { minerals, heritageColors, type MineralToken, type HeritageToken } from "@/lib/tokens"

export const revalidate = 3600

export const metadata: Metadata = {
  title: "Colour tokens — mzizi.dev",
  description:
    "The seven minerals and seven heritage tones — the Mzizi colour system, grouped by family, every value sourced live from the design database.",
}

const FAMILIES: { id: MineralToken["family"]; label: string; blurb: string }[] = [
  {
    id: "deep-earth",
    label: "Deep Earth",
    blurb: "Drawn from underground — knowledge, identity, growth and intelligence.",
  },
  {
    id: "hand",
    label: "Hand",
    blurb: "Worked metals and clay — value, community and stewardship.",
  },
]

function MineralCard({ m }: { m: MineralToken }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-background transition-colors hover:border-foreground/30">
      <div className="h-24 w-full" style={{ background: `var(${m.cssVar})` }} aria-hidden />
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-base font-semibold capitalize">{m.name}</h3>
          <span className="rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">
            {m.role}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">{m.symbolism}</p>
        <dl className="mt-1 grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
          <div className="flex items-center justify-between gap-2">
            <dt className="text-muted-foreground">Dark</dt>
            <dd className="font-mono uppercase">{m.darkHex}</dd>
          </div>
          <div className="flex items-center justify-between gap-2">
            <dt className="text-muted-foreground">Light</dt>
            <dd className="font-mono uppercase">{m.lightHex}</dd>
          </div>
        </dl>
        <div
          className="mt-2 rounded-lg px-3 py-2 text-xs font-medium"
          style={{
            background: `var(--color-${m.name}-container)`,
            color: `var(--color-${m.name}-on-container)`,
          }}
        >
          container · on-container
        </div>
        <p className="mt-auto pt-2 text-xs text-muted-foreground">{m.origin}</p>
      </div>
    </div>
  )
}

function HeritageCard({ h }: { h: HeritageToken }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-background transition-colors hover:border-foreground/30">
      <div className="h-16 w-full" style={{ background: `var(${h.cssVar})` }} aria-hidden />
      <div className="flex flex-1 flex-col gap-1 p-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold capitalize">{h.name}</h3>
          <span className="font-mono text-xs text-muted-foreground uppercase">{h.darkHex}</span>
        </div>
        <p className="text-xs text-muted-foreground">{h.symbolism}</p>
        <p className="mt-auto pt-2 text-xs text-muted-foreground">{h.origin}</p>
      </div>
    </div>
  )
}

// N1 surface tokens — the ambient/elevation ladder + chrome. Swatches read the
// live CSS custom properties so they stay accurate and theme-adaptive; no
// hardcoded hex to drift. (Values live in globals.css :root / .dark.)
const SURFACES: { token: string; label: string; role: string }[] = [
  { token: "--background", label: "background", role: "Ambient page base" },
  { token: "--card", label: "card", role: "Content surface" },
  { token: "--popover", label: "popover", role: "Popovers, dropdowns, menus" },
  { token: "--overlay", label: "overlay", role: "Modal / sheet surface" },
  { token: "--muted", label: "muted", role: "Deepest fill · subtle blocks" },
  { token: "--secondary", label: "secondary", role: "Secondary surface" },
  { token: "--accent", label: "accent", role: "Hover / active surface" },
  { token: "--primary", label: "primary", role: "Primary interactive" },
  { token: "--border", label: "border", role: "Hairline borders" },
  { token: "--scrim", label: "scrim", role: "Modal backdrop" },
]

function SurfaceCard({ token, label, role }: { token: string; label: string; role: string }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-background transition-colors hover:border-foreground/30">
      <div
        className="h-16 w-full ring-1 ring-border ring-inset"
        style={{ background: `var(${token})` }}
        aria-hidden
      />
      <div className="flex flex-1 flex-col gap-1 p-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold">{label}</h3>
          <span className="font-mono text-xs text-muted-foreground">{token}</span>
        </div>
        <p className="text-xs text-muted-foreground">{role}</p>
      </div>
    </div>
  )
}

export default function TokensPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-3 border-b border-border pb-8">
        <p className="text-sm font-medium text-[var(--color-copper)]">Colour system</p>
        <h1 className="font-serif text-4xl font-bold tracking-tight sm:text-5xl">
          Seven Minerals &amp; Seven Heritage
        </h1>
        <p className="max-w-2xl text-base text-muted-foreground">
          The Mzizi palette layers three systems. <strong>Surfaces</strong> set the ambient page
          ground and elevation ladder; <strong>seven minerals</strong> carry brand meaning — each
          with a role and family; and <strong>seven heritage tones</strong> are atmospheric anchors
          for surfaces and mood. Every value here is sourced live from the design database and is
          theme-adaptive across light and dark.
        </p>
      </header>

      <section className="mt-12 flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="font-serif text-2xl font-semibold">Surfaces</h2>
          <p className="text-sm text-muted-foreground">
            The ambient-to-elevated surface ladder and chrome tokens. Every swatch reads its live
            CSS variable, so it reflects the current theme exactly as the product does.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {SURFACES.map((s) => (
            <SurfaceCard key={s.token} {...s} />
          ))}
        </div>
      </section>

      <section className="mt-16 flex flex-col gap-10 border-t border-border pt-12">
        <div className="flex flex-col gap-1">
          <h2 className="font-serif text-2xl font-semibold">Seven Minerals</h2>
          <p className="text-sm text-muted-foreground">
            Grouped by family — the structure of the system, not a flat list.
          </p>
        </div>

        {FAMILIES.map((family) => {
          const group = minerals.filter((m) => m.family === family.id)
          return (
            <div key={family.id} className="flex flex-col gap-4">
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="text-lg font-semibold">{family.label}</h3>
                <p className="text-right text-sm text-muted-foreground">{family.blurb}</p>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {group.map((m) => (
                  <MineralCard key={m.name} m={m} />
                ))}
              </div>
            </div>
          )
        })}
      </section>

      <section className="mt-16 flex flex-col gap-4 border-t border-border pt-12">
        <div className="flex flex-col gap-1">
          <h2 className="font-serif text-2xl font-semibold">Seven Heritage</h2>
          <p className="text-sm text-muted-foreground">
            Atmospheric tones for surfaces, moods and mini-app theming.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-7">
          {heritageColors.map((h) => (
            <HeritageCard key={h.name} h={h} />
          ))}
        </div>
      </section>
    </div>
  )
}
