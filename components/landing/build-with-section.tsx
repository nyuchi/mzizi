import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { CopyCommand } from "@/components/landing/copy-command"
import { LiveMcpStats } from "@/components/live-mcp-stats"

/**
 * "Build with the design portal" — five-step orientation for any developer
 * landing here. Each step is concrete and links to the canonical doc/page,
 * so a new visitor can go from zero to shipping a Five-African-Minerals
 * page without leaving the portal.
 *
 * Sits on the landing between InstallSteps (which only covers the shadcn
 * CLI install) and AiNativeSection (which covers the MCP + skills layer).
 * InstallSteps says "how to install one component"; this section says
 * "what does building a whole app look like".
 */
export function BuildWithSection() {
  return (
    <section className="border-t border-border bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 md:py-24">
        <div className="mb-10 max-w-2xl sm:mb-12">
          <p className="mb-3 font-mono text-[11px] tracking-widest text-muted-foreground sm:text-xs">
            BUILD WITH THE PORTAL
          </p>
          <h2 className="font-serif text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl">
            Five steps from new repo to shipped page
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            The portal is a registry, a token system, an MCP server, and a set of installable Claude
            Code skills. You don&apos;t pull a package — you pull exactly the pieces you need and
            own the source. Here&apos;s the full authoring loop.
          </p>
        </div>

        <ol className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          <li className="flex flex-col gap-3 rounded-2xl border border-border bg-background p-6">
            <span className="font-mono text-xs text-muted-foreground">01</span>
            <h3 className="font-serif text-xl font-semibold">Install a component</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Every registry item is installable through the shadcn CLI. The CLI copies the source
              into your repo — you own and modify it freely.
            </p>
            <CopyCommand command="npx shadcn@latest add https://design.nyuchi.com/api/v1/ui/button" />
            <Link
              href="/components"
              className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-foreground hover:underline"
            >
              Browse the live registry <ArrowRight className="size-3" />
            </Link>
          </li>

          <li className="flex flex-col gap-3 rounded-2xl border border-border bg-background p-6">
            <span className="font-mono text-xs text-muted-foreground">02</span>
            <h3 className="font-serif text-xl font-semibold">Adopt the tokens</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Copy the <code className="font-mono text-xs">:root</code> and{" "}
              <code className="font-mono text-xs">.dark</code> blocks from{" "}
              <code className="font-mono text-xs">app/globals.css</code> — Five African Minerals,
              semantic colors, typography, radius scale. Every component reads from these CSS
              variables.
            </p>
            <Link
              href="https://docs.mzizi.dev/brand"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-auto inline-flex items-center gap-1 text-xs font-medium text-foreground hover:underline"
            >
              Brand &amp; tokens reference <ArrowRight className="size-3" />
            </Link>
          </li>

          <li className="flex flex-col gap-3 rounded-2xl border border-border bg-background p-6">
            <span className="font-mono text-xs text-muted-foreground">03</span>
            <h3 className="font-serif text-xl font-semibold">Wire the MCP server</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Add <code className="font-mono text-xs">https://design.nyuchi.com/mcp</code> to your
              Claude Code settings. <LiveMcpStats /> let your AI assistant install components,
              scaffold new ones, look up tokens, and read live docs without round-tripping to the
              browser.
            </p>
            <Link
              href="https://docs.mzizi.dev/mcp"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-auto inline-flex items-center gap-1 text-xs font-medium text-foreground hover:underline"
            >
              MCP server reference <ArrowRight className="size-3" />
            </Link>
          </li>

          <li className="flex flex-col gap-3 rounded-2xl border border-border bg-background p-6">
            <span className="font-mono text-xs text-muted-foreground">04</span>
            <h3 className="font-serif text-xl font-semibold">Install the skills</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Three Claude Code skills ship in this repo:{" "}
              <code className="font-mono text-xs">nyuchi-design-system</code>,{" "}
              <code className="font-mono text-xs">scaffold-component</code>,{" "}
              <code className="font-mono text-xs">ecosystem-app-setup</code>. Symlink or copy into
              your project&apos;s <code className="font-mono text-xs">.claude/skills/</code> and the
              router activates them automatically.
            </p>
            <Link
              href="https://github.com/nyuchi/design-portal/blob/main/.claude/skills/README.md"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-auto inline-flex items-center gap-1 text-xs font-medium text-foreground hover:underline"
            >
              Skill install guide <ArrowRight className="size-3" />
            </Link>
          </li>

          <li className="flex flex-col gap-3 rounded-2xl border border-border bg-background p-6">
            <span className="font-mono text-xs text-muted-foreground">05</span>
            <h3 className="font-serif text-xl font-semibold">Ship and observe</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              The L8 assurance layer surfaces runtime failures across the ecosystem. Run{" "}
              <code className="font-mono text-xs">pnpm check</code> before every push to mirror the
              full CI gate locally.
            </p>
            <Link
              href="/architecture"
              className="mt-auto inline-flex items-center gap-1 text-xs font-medium text-foreground hover:underline"
            >
              The 3D architecture model <ArrowRight className="size-3" />
            </Link>
          </li>

          <li className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-foreground/10 bg-foreground/5 p-6">
            <div>
              <span className="font-mono text-xs text-muted-foreground">NEXT</span>
              <h3 className="mt-3 font-serif text-xl font-semibold">Bootstrap a whole new app</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Going from <code className="font-mono text-xs">create-next-app</code> to a
                portal-consuming production build? The{" "}
                <code className="font-mono text-xs">ecosystem-app-setup</code> skill walks Claude
                Code through the eight setup steps end-to-end.
              </p>
            </div>
            <Button asChild className="rounded-full">
              <Link href="https://docs.mzizi.dev/installation" target="_blank" rel="noopener noreferrer">
                Read the installation guide
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </li>
        </ol>
      </div>
    </section>
  )
}
