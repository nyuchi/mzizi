import { Suspense } from "react"
import { getHelixModel, isSupabaseConfigured } from "@/lib/db"
import type { HelixNode, HelixStrand } from "@/lib/db/types"
import { Skeleton } from "@/components/ui/skeleton"
import { ArchitectureExplorer } from "@/components/landing/architecture-explorer"

export const revalidate = 3600

export const metadata = {
  title: "Architecture — Mzizi DNA double helix",
  description:
    "The Mzizi DNA double helix — two entwined backbones (engineering + meaning) held by cross-cutting rungs. Nodes on strands, no axes, no outliers. Every count read live from Supabase.",
}

const STRAND_BADGE: Record<string, string> = {
  "core-guarantee": "bg-[var(--color-cobalt)]/10 text-[var(--color-cobalt)]",
  shipped: "bg-[var(--color-tanzanite)]/10 text-[var(--color-tanzanite)]",
  swappable: "bg-[var(--color-malachite)]/10 text-[var(--color-malachite)]",
  spine: "bg-[var(--color-copper)]/10 text-[var(--color-copper)]",
  "genetic-code": "bg-[var(--color-terracotta)]/10 text-[var(--color-terracotta)]",
  transcription: "bg-[var(--color-sodalite)]/10 text-[var(--color-sodalite)]",
}
const RUNG_BADGE = "bg-[var(--color-gold)]/10 text-[var(--color-gold)]"

function strandBadge(strand: string): string {
  return STRAND_BADGE[strand] ?? "bg-muted text-muted-foreground"
}

function NodeCard({ node }: { node: HelixNode }) {
  return (
    <article className="flex flex-col gap-3 rounded-xl border border-border bg-background p-5">
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
          {node.sub_label} · {node.title}
        </span>
        <span className="font-mono text-xs text-muted-foreground">
          {node.component_count} {node.component_count === 1 ? "component" : "components"}
        </span>
      </div>
      <p className="text-sm leading-relaxed text-muted-foreground">{node.role}</p>
      <p className="border-l-2 border-border pl-3 text-sm leading-relaxed text-foreground italic">
        &ldquo;{node.covenant}&rdquo;
      </p>
    </article>
  )
}

function StrandBlock({ strand, nodes }: { strand: HelixStrand; nodes: HelixNode[] }) {
  const componentTotal = nodes.reduce((sum, n) => sum + n.component_count, 0)
  return (
    <section className="rounded-2xl border border-border bg-muted/10 p-5 sm:p-6">
      <header className="mb-5 flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <span
            className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] font-medium tracking-widest uppercase ${strandBadge(
              strand.name
            )}`}
          >
            {strand.name}
          </span>
          <span className="font-mono text-xs text-muted-foreground">
            {nodes.length === 0
              ? "doctrine strand"
              : `${nodes.length} ${nodes.length === 1 ? "node" : "nodes"} · ${componentTotal} ${
                  componentTotal === 1 ? "component" : "components"
                }`}
          </span>
        </div>
        <h3 className="font-serif text-xl font-semibold text-foreground">{strand.title}</h3>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          <span className="text-foreground italic">&ldquo;{strand.covenant}&rdquo;</span>{" "}
          {strand.description}
        </p>
      </header>
      {nodes.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {nodes
            .slice()
            .sort((a, b) => a.node_number - b.node_number)
            .map((node) => (
              <NodeCard key={node.node_number} node={node} />
            ))}
        </div>
      )}
    </section>
  )
}

function RungCard({ rung }: { rung: HelixNode }) {
  return (
    <article className="flex flex-col gap-3 rounded-xl border border-border bg-background p-5">
      <div className="flex items-center justify-between gap-3">
        <span className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
          {rung.sub_label} · {rung.title}
        </span>
        <span
          className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-medium ${RUNG_BADGE}`}
        >
          rung
        </span>
      </div>
      <p className="text-sm leading-relaxed text-muted-foreground">{rung.description}</p>
      <p className="border-l-2 border-border pl-3 text-sm leading-relaxed text-foreground italic">
        &ldquo;{rung.covenant}&rdquo;
      </p>
    </article>
  )
}

function BackboneSection({
  title,
  blurb,
  strands,
  nodesByStrand,
}: {
  title: string
  blurb: string
  strands: HelixStrand[]
  nodesByStrand: Map<string, HelixNode[]>
}) {
  if (strands.length === 0) return null
  return (
    <section className="border-t border-border pt-10 first:border-t-0 first:pt-0">
      <header className="mb-6 flex flex-col gap-2">
        <h2 className="font-serif text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {title}
        </h2>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          {blurb}
        </p>
      </header>
      <div className="space-y-5">
        {strands.map((strand) => (
          <StrandBlock
            key={strand.name}
            strand={strand}
            nodes={nodesByStrand.get(strand.name) ?? []}
          />
        ))}
      </div>
    </section>
  )
}

export default async function ArchitecturePage() {
  if (!isSupabaseConfigured()) {
    return (
      <article className="mx-auto max-w-3xl py-12">
        <h1 className="font-serif text-3xl font-bold">Architecture</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          Supabase is not configured for this environment. Set{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
            NEXT_PUBLIC_SUPABASE_URL
          </code>{" "}
          and{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
            NEXT_PUBLIC_SUPABASE_ANON_KEY
          </code>{" "}
          to render the live DNA-helix model.
        </p>
      </article>
    )
  }

  const model = await getHelixModel()
  const nodesByStrand = new Map<string, HelixNode[]>()
  for (const node of model.nodes) {
    if (!node.strand) continue
    const list = nodesByStrand.get(node.strand) ?? []
    list.push(node)
    nodesByStrand.set(node.strand, list)
  }
  const engineeringStrands = model.strands.filter((s) => s.backbone === "engineering")
  const meaningStrands = model.strands.filter((s) => s.backbone === "meaning")
  const totalComponents = model.nodes.reduce((sum, n) => sum + n.component_count, 0)

  return (
    <article data-mdx className="mx-auto max-w-5xl py-8">
      <header className="mb-8">
        <p className="mb-3 font-mono text-[11px] tracking-widest text-muted-foreground sm:text-xs">
          DNA DOUBLE HELIX
        </p>
        <h1 className="mb-4 font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
          Two backbones. Cross-cutting rungs. No axes.
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
          Most component libraries are flat: primitives at the bottom, composed components above,
          pages on top. Mzizi is a <span className="text-foreground">double helix</span>. Two
          entwined backbones run through it — an{" "}
          <span className="text-foreground">engineering</span> backbone that builds the product and
          a <span className="text-foreground">meaning</span> backbone that carries the doctrine —
          held together by cross-cutting <span className="text-foreground">rungs</span>. Nodes sit
          on strands; rungs bridge both. The node numbers (N1–N11) are labels, not a sequence, and
          nothing lives &ldquo;outside.&rdquo;
        </p>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Every element and count below is read live from{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
            component_documents
          </code>{" "}
          (
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
            documentation-architecture-&#123;nodes,strands&#125;
          </code>
          ) — the single source of truth the MCP serves — never hardcoded. Click any bead or strand
          chip in the model for its covenant and rules.
        </p>

        <dl className="mt-6 grid grid-cols-2 gap-4 border-y border-border py-4 text-sm sm:grid-cols-4">
          <div>
            <dt className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
              Nodes
            </dt>
            <dd className="font-serif text-2xl font-semibold text-foreground">
              {model.nodes.length}
            </dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
              Rungs
            </dt>
            <dd className="font-serif text-2xl font-semibold text-foreground">
              {model.rungs.length}
            </dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
              Strands
            </dt>
            <dd className="font-serif text-2xl font-semibold text-foreground">
              {model.strands.length}
            </dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
              Components
            </dt>
            <dd className="font-serif text-2xl font-semibold text-foreground">{totalComponents}</dd>
          </div>
        </dl>
      </header>

      {/* Interactive 3D double-helix explorer */}
      <div className="mb-12 overflow-hidden">
        <Suspense
          fallback={
            <Skeleton className="h-[340px] w-full rounded-2xl border border-border sm:h-[440px]" />
          }
        >
          <ArchitectureExplorer />
        </Suspense>
      </div>

      <div className="space-y-12">
        <BackboneSection
          title="Engineering backbone"
          blurb="The strands that build the product. Core guarantees travel unchanged; shipped components come in the box but evolve; swappable seams are the only defined fork points; the spine pre-wires it all."
          strands={engineeringStrands}
          nodesByStrand={nodesByStrand}
        />
        <BackboneSection
          title="Meaning backbone"
          blurb="The strands that carry the doctrine. The genetic code is the Ubuntu + Bundu sequence everything is read from; transcription stores every convention and decision as queryable data — not tribal knowledge."
          strands={meaningStrands}
          nodesByStrand={nodesByStrand}
        />

        {model.rungs.length > 0 && (
          <section className="border-t border-border pt-10">
            <header className="mb-6 flex flex-col gap-2">
              <h2 className="font-serif text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Cross-cutting rungs
              </h2>
              <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                The base pairs that bridge both backbones. Bound to no single strand, they keep the
                system healing, documented, and discoverable.
              </p>
            </header>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {model.rungs
                .slice()
                .sort((a, b) => a.node_number - b.node_number)
                .map((rung) => (
                  <RungCard key={rung.node_number} rung={rung} />
                ))}
            </div>
          </section>
        )}
      </div>

      <footer className="mt-16 rounded-2xl border border-border bg-muted/20 p-6 text-sm leading-relaxed text-muted-foreground">
        <p className="mb-3 font-mono text-[10px] tracking-widest text-foreground uppercase">
          Source of truth
        </p>
        <p>
          The doctrine is the data. Node covenants, strand groupings, and rung classifications live
          in Supabase as documents — relabel one with an{" "}
          <code className="rounded bg-background px-1 py-0.5 font-mono text-xs">UPDATE</code> and
          every consumer (this page, the MCP server, AI assistants) sees the new shape on the next
          read. No migration. No drift.
        </p>
      </footer>
    </article>
  )
}
