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

export default function TokensPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-3 border-b border-border pb-8">
        <p className="text-sm font-medium text-[var(--color-copper)]">Colour system</p>
        <h1 className="font-serif text-4xl font-bold tracking-tight sm:text-5xl">
          Seven Minerals &amp; Seven Heritage
        </h1>
        <p className="max-w-2xl text-base text-muted-foreground">
          The Mzizi palette is two systems. <strong>Seven minerals</strong> carry brand meaning —
          each has a role and belongs to one of two families. <strong>Seven heritage tones</strong>{" "}
          are atmospheric anchors for surfaces and mood. Every value here is sourced live from the
          design database and is theme-adaptive across light and dark.
        </p>
      </header>

      <section className="mt-12 flex flex-col gap-10">
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
