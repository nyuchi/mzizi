import Link from "next/link"
import { Suspense } from "react"
import { ArrowRight } from "lucide-react"
import { ArchitectureExplorer } from "@/components/landing/architecture-explorer"
import { Skeleton } from "@/components/ui/skeleton"
import { Section, SectionHeader } from "@/components/landing/section"

/**
 * "Resilient by design" — explains two of the Mzizi DNA helix's cross-cutting
 * rungs (N9 fundi and N10 documentation) and why they exist.
 *
 * Most design systems ship as a snapshot — frozen at release time, drift
 * sets in, security findings pile up, docs go stale. The Mzizi helix has two
 * rungs — cross-cutting base pairs that bridge both backbones — whose entire
 * job is to prevent that:
 *
 *   - N9 fundi: the self-healing rung. It consumes N8 assurance signals and
 *     remediates the root cause.
 *   - N10 documentation: the system documents itself — every component and
 *     every version is in Supabase, served live, never copy-pasted.
 *
 * Together they're why the system stays current and secure without
 * manual maintenance pressure.
 */
// `ResilientBySection` is async because it embeds the server-rendered
// `ArchitectureExplorer` (which fetches axes + layers from Supabase).
export async function ResilientBySection() {
  return (
    <Section bordered>
      <SectionHeader
        eyebrow="Resilient by design"
        title="Two rungs keep the system current and secure"
        sub="The Mzizi DNA helix has two backbones that build the product; two cross-cutting rungs — fundi and documentation — exist so the system never goes stale or insecure."
      />

      {/* Interactive model explorer */}
      <div className="mt-12 mb-10 overflow-hidden">
        <Suspense
          fallback={
            <Skeleton className="h-[320px] w-full rounded-xl border border-border sm:h-[420px]" />
          }
        >
          <ArchitectureExplorer />
        </Suspense>
      </div>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        <article className="flex flex-col gap-4 rounded-2xl border border-border bg-background p-6 sm:p-8">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-muted-foreground">N9 · RUNG</span>
            <span className="rounded-full bg-[var(--color-cobalt)]/10 px-2.5 py-0.5 font-mono text-[10px] font-medium text-[var(--color-cobalt)]">
              fundi
            </span>
          </div>
          <h3 className="font-serif text-2xl font-semibold">
            Self-healing — failure becomes a learning event
          </h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Fundi (Shona for &quot;artisan&quot;) is a <strong>rung</strong> — a cross-cutting base
            pair that bridges both backbones of the helix rather than sitting on a single strand. It
            consumes the N8 assurance node&apos;s runtime signals and remediates the root cause, so
            a failure becomes a learning event rather than a user-facing incident.
          </p>
          <ul className="space-y-1.5 text-sm leading-relaxed text-muted-foreground">
            <li className="flex gap-2">
              <span aria-hidden="true">→</span>
              <span>A cross-cutting rung — bridges both backbones, sits on neither strand</span>
            </li>
            <li className="flex gap-2">
              <span aria-hidden="true">→</span>
              <span>Consumes N8 assurance signals; never sits inside a component</span>
            </li>
            <li className="flex gap-2">
              <span aria-hidden="true">→</span>
              <span>Failure is treated as a learning event, not an incident</span>
            </li>
            <li className="flex gap-2">
              <span aria-hidden="true">→</span>
              <span>Open architecture — consumers wire their own healing actor</span>
            </li>
          </ul>
          <Link
            href="/architecture"
            className="mt-auto inline-flex items-center gap-1.5 text-sm font-medium text-foreground hover:underline"
          >
            The DNA helix model <ArrowRight className="size-4" />
          </Link>
        </article>

        <article className="flex flex-col gap-4 rounded-2xl border border-border bg-background p-6 sm:p-8">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-muted-foreground">N10 · RUNG</span>
            <span className="rounded-full bg-[var(--color-tanzanite)]/10 px-2.5 py-0.5 font-mono text-[10px] font-medium text-[var(--color-tanzanite)]">
              documentation
            </span>
          </div>
          <h3 className="font-serif text-2xl font-semibold">
            The system documents itself — no stale truth
          </h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Every component, brand spec, and changelog entry lives in Supabase; long-form guides
            live in standalone Mintlify docs sites. The Next.js app and the MCP server read live;
            nothing is copy-pasted between them. When a component changes in the database, the
            portal, the API, and the AI tools all pick it up on the next request. Drift becomes
            structurally impossible.
          </p>
          <ul className="space-y-1.5 text-sm leading-relaxed text-muted-foreground">
            <li className="flex gap-2">
              <span aria-hidden="true">→</span>
              <span>Long-form guides ship as standalone Mintlify documentation sites</span>
            </li>
            <li className="flex gap-2">
              <span aria-hidden="true">→</span>
              <span>
                <code className="font-mono text-xs">/api/v1/*</code> endpoints serve component +
                brand + changelog data live from the database
              </span>
            </li>
            <li className="flex gap-2">
              <span aria-hidden="true">→</span>
              <span>
                <code className="font-mono text-xs">registry.json</code> is a CI-verified snapshot,
                never hand-edited
              </span>
            </li>
            <li className="flex gap-2">
              <span aria-hidden="true">→</span>
              <span>MCP tools surface live counts; AI never quotes a stale number</span>
            </li>
          </ul>
          <Link
            href="/architecture"
            className="mt-auto inline-flex items-center gap-1.5 text-sm font-medium text-foreground hover:underline"
          >
            The DNA helix model <ArrowRight className="size-4" />
          </Link>
        </article>
      </div>

      <div className="mt-10 rounded-2xl border border-foreground/10 bg-foreground/5 px-6 py-5 sm:px-8 sm:py-6">
        <p className="text-sm leading-relaxed text-muted-foreground">
          <span className="font-medium text-foreground">Net effect.</span> Five CVEs cleared in this
          PR alone — caught by <code className="font-mono text-xs">pnpm audit</code>, fixed inside
          the same PR per the no-deferral rule. CodeQL workflow-permissions findings, Dependabot
          advisories, and security-review notes never wait for a follow-up PR. See{" "}
          <Link href="/architecture" className="underline hover:no-underline">
            the architecture page
          </Link>{" "}
          for the full helix model and{" "}
          <a
            href="https://github.com/nyuchi/mzizi/blob/main/SECURITY.md"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:no-underline"
          >
            SECURITY.md
          </a>{" "}
          for the disclosure process.
        </p>
      </div>
    </Section>
  )
}
