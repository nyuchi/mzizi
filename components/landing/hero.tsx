import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight } from "lucide-react"
import { CopyCommand } from "@/components/landing/copy-command"
import { getRegistryCounts } from "@/lib/db"

const minerals = [
  { name: "cobalt", color: "bg-[var(--color-cobalt)]" },
  { name: "tanzanite", color: "bg-[var(--color-tanzanite)]" },
  { name: "malachite", color: "bg-[var(--color-malachite)]" },
  { name: "gold", color: "bg-[var(--color-gold)]" },
  { name: "terracotta", color: "bg-[var(--color-terracotta)]" },
]

const products = [
  { label: "bundu", href: "https://bundu.family" },
  { label: "nyuchi", href: "https://nyuchi.com" },
  { label: "bushtrade", href: "https://bushtrade.co.zw" },
  { label: "mukoko", href: "https://www.mukoko.com" },
  { label: "weather", href: "https://weather.mukoko.com" },
  { label: "news", href: "https://news.mukoko.com" },
  { label: "lingo", href: "https://lingo.mukoko.com" },
  { label: "nhimbe", href: "https://nhimbe.com" },
  { label: "shamwari", href: "https://shamwari.ai" },
]

export async function Hero() {
  const counts = await getRegistryCounts().catch(() => ({
    total: 0,
    ui: 0,
    blocks: 0,
    hooks: 0,
    lib: 0,
  }))

  const totalLabel = counts.total > 0 ? `${counts.total}` : "production-ready"

  return (
    <section className="relative flex flex-col items-center gap-8 px-4 pt-12 pb-16 text-center sm:gap-10 sm:px-6 md:pt-20 md:pb-32">
      {/* Subtle grid */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />

      <div className="flex w-full max-w-full flex-col items-center gap-4">
        <Badge variant="outline" className="max-w-full gap-2 px-3 py-1 text-[11px] sm:text-xs">
          <span className="flex shrink-0 gap-1">
            {minerals.map((m) => (
              <span key={m.name} className={`size-1.5 rounded-full ${m.color}`} />
            ))}
          </span>
          <span className="truncate text-muted-foreground sm:whitespace-normal">
            Ndiri nekuti tiri — I am because we are
          </span>
        </Badge>

        <div className="flex w-full flex-wrap items-center justify-center gap-1.5 px-2">
          {products.map((p) => (
            <a
              key={p.label}
              href={p.href}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-border px-2.5 py-0.5 font-mono text-[11px] text-muted-foreground transition-colors hover:text-foreground"
            >
              {p.label}
            </a>
          ))}
        </div>
      </div>

      <div className="flex max-w-3xl flex-col items-center gap-4 sm:gap-6">
        <h1 className="font-serif text-[clamp(1.75rem,6vw,2rem)] leading-[1.1] font-bold tracking-tight text-balance text-foreground sm:text-4xl md:text-6xl lg:text-7xl">
          The design system
          <br />
          for the bundu ecosystem
        </h1>
        <p className="max-w-xl text-sm leading-relaxed text-pretty text-muted-foreground sm:text-base md:text-lg">
          {totalLabel} components, blocks, and charts rooted in the Five African Minerals palette.
          One design system powering mukoko, nyuchi, and every app in the bundu family. Install with
          the shadcn CLI — no packages, no lock-in.
        </p>
      </div>

      <div className="flex w-full flex-col items-center gap-4 sm:gap-5">
        <CopyCommand />
        <div className="flex w-full flex-col items-center gap-2 sm:w-auto sm:flex-row sm:gap-3">
          <Button size="lg" className="w-full gap-2 sm:w-auto" asChild>
            <a href="/components">
              Browse components
              <ArrowRight className="size-4" />
            </a>
          </Button>
          <Button variant="outline" size="lg" className="w-full sm:w-auto" asChild>
            <a href="https://docs.mzizi.dev" target="_blank" rel="noopener noreferrer">
              Documentation
            </a>
          </Button>
        </div>
      </div>

      {/* Stats — live from DB */}
      <div className="flex flex-wrap items-center justify-center gap-6 pt-4 sm:gap-8">
        {[
          { label: "Registry Items", value: counts.total > 0 ? `${counts.total}` : "—" },
          { label: "Mini-Apps", value: "17" },
          { label: "Enterprise Products", value: "7" },
          { label: "Data Layers", value: "7" },
          { label: "Palette", value: "5 minerals" },
        ].map((stat) => (
          <div key={stat.label} className="flex flex-col items-center gap-0.5">
            <span className="font-mono text-lg font-semibold text-foreground">{stat.value}</span>
            <span className="text-xs text-muted-foreground">{stat.label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
