import { getUbuntuPillars, getUbuntuPrinciples, getBrandMeta, isSupabaseConfigured } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { UbuntuPillarRow, UbuntuPrincipleRow } from "@/lib/db/types"

// Re-fetch hourly. The doctrine is the data — when a maintainer updates
// ubuntu_pillars / ubuntu_principles / brand_meta.philosophy in Supabase,
// the next read will see the new shape.
export const revalidate = 3600

export const metadata = {
  title: "Ubuntu — mzizi design portal",
  description:
    "The Ubuntu doctrine of the Mukoko platform: Five Pillars (where Ubuntu is situated), Five Principles (how Ubuntu is embodied), and the Five Questions (the product decision filter). African scholarship, sovereign derivation.",
}

function PillarCard({ pillar }: { pillar: UbuntuPillarRow }) {
  return (
    <Card>
      <CardHeader>
        <p className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
          Pillar {pillar.sort_order} · {pillar.sphere.split(" — ")[0] ?? "Sphere"}
        </p>
        <CardTitle className="font-serif text-2xl font-semibold text-foreground">
          {pillar.shona}
        </CardTitle>
        <CardDescription className="text-sm font-medium text-foreground/80">
          {pillar.title}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm leading-relaxed">
        <p className="text-muted-foreground">{pillar.description}</p>
        <dl className="space-y-2 border-t border-border pt-3">
          <div>
            <dt className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
              Sphere
            </dt>
            <dd className="mt-1 text-foreground">{pillar.sphere}</dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
              Platform surface
            </dt>
            <dd className="mt-1 text-foreground">{pillar.platform_surface}</dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
              Source
            </dt>
            <dd className="mt-1 text-xs text-muted-foreground italic">{pillar.source}</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  )
}

function PrincipleCard({ principle }: { principle: UbuntuPrincipleRow }) {
  return (
    <Card>
      <CardHeader>
        <p className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
          Principle {principle.sort_order}
        </p>
        <CardTitle className="font-serif text-2xl font-semibold text-foreground">
          {principle.shona}
        </CardTitle>
        <CardDescription className="text-sm font-medium text-foreground/80">
          {principle.title}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm leading-relaxed">
        <p className="text-muted-foreground">{principle.description}</p>
        <dl className="space-y-2 border-t border-border pt-3">
          <div>
            <dt className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
              Platform expression
            </dt>
            <dd className="mt-1 text-foreground">{principle.expression}</dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
              Source
            </dt>
            <dd className="mt-1 text-xs text-muted-foreground italic">{principle.source}</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  )
}

export default async function UbuntuPage() {
  if (!isSupabaseConfigured()) {
    return (
      <article className="mx-auto max-w-3xl py-12">
        <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground">Ubuntu</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          Supabase is not configured for this environment. Set{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
            NEXT_PUBLIC_SUPABASE_URL
          </code>{" "}
          and{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
            NEXT_PUBLIC_SUPABASE_ANON_KEY
          </code>{" "}
          to render the live Ubuntu doctrine.
        </p>
      </article>
    )
  }

  const [pillars, principles, meta] = await Promise.all([
    getUbuntuPillars(),
    getUbuntuPrinciples(),
    getBrandMeta(),
  ])

  // The five Ubuntu Questions live in brand_meta.philosophy.ubuntuQuestions
  // (see issue #45 task 5.4). Read defensively — empty array if the JSONB
  // shape ever drifts.
  const philosophy = (meta?.philosophy as { ubuntuQuestions?: unknown } | undefined) ?? undefined
  const ubuntuQuestions = Array.isArray(philosophy?.ubuntuQuestions)
    ? (philosophy.ubuntuQuestions as string[])
    : []

  return (
    <article data-mdx className="mx-auto max-w-5xl py-8">
      {/* ── 1. Ubuntu intro ─────────────────────────────────────────── */}
      <header className="mb-12">
        <p className="mb-3 font-mono text-[11px] tracking-widest text-muted-foreground sm:text-xs">
          UBUNTU DOCTRINE
        </p>
        <h1 className="mb-4 font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
          Ubuntu
        </h1>
        <p className="mb-3 font-serif text-xl text-foreground italic">
          Umuntu ngumuntu ngabantu / Ndiri nekuti tiri.
        </p>
        <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
          A person is a person through other people. I am because we are. Ubuntu is the foundational
          African principle of relational personhood — identity given by community rather than
          claimed by the individual. The maxim is Nguni Bantu (Zulu and Xhosa); the Shona rendering
          carries the same shape: ndiri nekuti tiri.
        </p>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
          Ubuntu is the philosophical substrate of the Mukoko platform. It does not live at one
          layer of the architecture — it sits underneath every layer. The doctrine has three
          five-fold expressions: <strong className="text-foreground">Pillars</strong> (where Ubuntu
          is situated), <strong className="text-foreground">Principles</strong> (how Ubuntu is
          embodied), and <strong className="text-foreground">Questions</strong> (the decision filter
          that evaluates whether a product change ships).
        </p>
      </header>

      {/* ── 2. The Five Pillars ─────────────────────────────────────── */}
      <section className="mb-16 border-t border-border pt-10">
        <header className="mb-6">
          <p className="mb-2 font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
            Where Ubuntu is situated
          </p>
          <h2 className="mb-3 font-serif text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            The Five Pillars
          </h2>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            The five spheres of relationship in which Ubuntu is lived. Family is the first sphere
            and spirituality the vertical axis that holds the other four. Derived from Mugumbate et
            al. (2023). Rendered live from{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">ubuntu_pillars</code>.
          </p>
        </header>
        {pillars.length === 0 ? (
          <p className="rounded-xl border border-border bg-muted/20 p-6 text-sm text-muted-foreground">
            No pillars in the database yet. Seed{" "}
            <code className="rounded bg-background px-1 py-0.5 font-mono text-xs">
              ubuntu_pillars
            </code>{" "}
            from{" "}
            <code className="rounded bg-background px-1 py-0.5 font-mono text-xs">
              lib/db/seed-data/ubuntu.ts
            </code>
            .
          </p>
        ) : (
          <div className="grid gap-4 sm:gap-5 lg:grid-cols-2">
            {pillars.map((pillar) => (
              <PillarCard key={pillar.id} pillar={pillar} />
            ))}
          </div>
        )}
      </section>

      {/* ── 3. The Five Principles ──────────────────────────────────── */}
      <section className="mb-16 border-t border-border pt-10">
        <header className="mb-6">
          <p className="mb-2 font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
            How Ubuntu is embodied
          </p>
          <h2 className="mb-3 font-serif text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            The Five Principles
          </h2>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            The behavioural virtues that translate Ubuntu into software. From Lovemore Mbigi&apos;s
            Collective Fingers Theory — <em>chara chimwe hachitswanyi inda</em>, one finger cannot
            crush a louse. Rendered live from{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
              ubuntu_principles
            </code>
            .
          </p>
        </header>
        {principles.length === 0 ? (
          <p className="rounded-xl border border-border bg-muted/20 p-6 text-sm text-muted-foreground">
            No principles in the database yet. Seed{" "}
            <code className="rounded bg-background px-1 py-0.5 font-mono text-xs">
              ubuntu_principles
            </code>{" "}
            from{" "}
            <code className="rounded bg-background px-1 py-0.5 font-mono text-xs">
              lib/db/seed-data/ubuntu.ts
            </code>
            .
          </p>
        ) : (
          <div className="grid gap-4 sm:gap-5 lg:grid-cols-2">
            {principles.map((principle) => (
              <PrincipleCard key={principle.id} principle={principle} />
            ))}
          </div>
        )}
      </section>

      {/* ── 4. The Five Questions ───────────────────────────────────── */}
      <section className="mb-16 border-t border-border pt-10">
        <header className="mb-6">
          <p className="mb-2 font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
            The decision filter
          </p>
          <h2 className="mb-3 font-serif text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            The Five Questions
          </h2>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            The Pillars name the spheres. The Principles name the virtues. The Questions evaluate
            every product decision against both. A change that fails any one of these questions does
            not ship. Stored in{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
              brand_meta.philosophy.ubuntuQuestions
            </code>
            .
          </p>
        </header>
        {ubuntuQuestions.length === 0 ? (
          <p className="rounded-xl border border-border bg-muted/20 p-6 text-sm text-muted-foreground">
            No Ubuntu Questions in <code className="font-mono text-xs">brand_meta.philosophy</code>{" "}
            yet.
          </p>
        ) : (
          <ol className="space-y-3">
            {ubuntuQuestions.map((question, index) => (
              <li
                key={index}
                className="flex gap-4 rounded-xl border border-border bg-background p-5"
              >
                <span className="font-mono text-sm font-medium text-muted-foreground">
                  {index + 1}.
                </span>
                <span className="font-serif text-lg text-foreground">{question}</span>
              </li>
            ))}
          </ol>
        )}
      </section>

      {/* ── 5. Scholarly provenance ─────────────────────────────────── */}
      <section className="mb-16 border-t border-border pt-10">
        <header className="mb-6">
          <p className="mb-2 font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
            Cite these, do not invent alternatives
          </p>
          <h2 className="mb-3 font-serif text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Scholarly provenance
          </h2>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Both five-fold sets are derived from published African scholarship. Lovemore Mbigi was
            Zimbabwean (died in Harare, June 2023). The derivation is sovereign.
          </p>
        </header>
        <ul className="space-y-3 text-sm leading-relaxed text-foreground">
          <li className="rounded-xl border border-border bg-background p-4">
            Mugumbate, J., Mupedziswa, R., Twikirize, J., Mthethwa, E., Desta, A., &amp; Oyinlola,
            O. (2023).{" "}
            <em>
              Understanding Ubuntu and its contribution to social work education in Africa and other
              regions of the world.
            </em>{" "}
            Social Work Education, 43(4), 1123–1139.
          </li>
          <li className="rounded-xl border border-border bg-background p-4">
            Mbigi, L. (1997). <em>Ubuntu: The African Dream in Management.</em> Pretoria: Sigma
            Press. (The Collective Fingers Theory: <em>chara chimwe hachitswanyi inda</em> — one
            finger cannot crush a louse.)
          </li>
          <li className="rounded-xl border border-border bg-background p-4">
            Samkange, S. &amp; Samkange, T.M. (1980).{" "}
            <em>Hunhuism or Ubuntuism: A Zimbabwe Indigenous Political Philosophy.</em> Salisbury:
            Graham Publishing.
          </li>
          <li className="rounded-xl border border-border bg-background p-4">
            Ramose, M. (2002). <em>The Philosophy of Ubuntu as a Philosophy.</em> Oxford University
            Press.
          </li>
          <li className="rounded-xl border border-border bg-background p-4">
            Poovan, N. et al. (2006), and Du Toit, Poovan &amp; Engelbretch (2006) — additional
            attribution for respect/dignity and compassion.
          </li>
        </ul>
      </section>

      {/* ── 6. Why restorative justice is not here ─────────────────── */}
      <section className="mb-8 border-t border-border pt-10">
        <header className="mb-6">
          <p className="mb-2 font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
            Explicit exclusion
          </p>
          <h2 className="mb-3 font-serif text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Why restorative justice is not here
          </h2>
        </header>
        <blockquote className="rounded-xl border-l-4 border-foreground bg-muted/30 p-6 text-base leading-relaxed text-foreground">
          Restorative justice is not one of the five principles. It is a modern American framework
          developed in juvenile justice and therapeutic discourse, not an African one. Ubuntu
          addresses harm through the continuous practice of the virtues above, not through a
          separate remedial process. The community does not define itself by how it handles
          wrongdoing — it defines itself by how it lives.
        </blockquote>
      </section>

      <footer className="mt-16 rounded-2xl border border-border bg-muted/20 p-6 text-sm leading-relaxed text-muted-foreground">
        <p className="mb-3 font-mono text-[10px] tracking-widest text-foreground uppercase">
          Source of truth
        </p>
        <p>
          The doctrine is the data. Pillars, Principles, and Questions live in Supabase — update a
          row with an{" "}
          <code className="rounded bg-background px-1 py-0.5 font-mono text-xs">UPDATE</code> and
          every consumer (this page, the API at{" "}
          <code className="rounded bg-background px-1 py-0.5 font-mono text-xs">
            /api/v1/ubuntu
          </code>
          , the MCP server, AI assistants) sees the new shape on the next read. No migration. No
          drift.
        </p>
      </footer>
    </article>
  )
}
