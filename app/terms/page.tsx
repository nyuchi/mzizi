import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms governing use of mzizi.dev — the Mzizi design-system registry, API, and MCP server. An open-architecture project of the Bundu Foundation, operated by nyuchi.",
  alternates: { canonical: "/terms" },
}

const LAST_UPDATED = "23 July 2026"

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-serif text-2xl font-semibold tracking-tight">{title}</h2>
      <div className="flex flex-col gap-3 text-sm leading-relaxed text-muted-foreground">
        {children}
      </div>
    </section>
  )
}

export default function TermsPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-3 border-b border-border pb-8">
        <p className="text-sm font-medium text-[var(--color-cobalt)]">Legal</p>
        <h1 className="font-serif text-4xl font-bold tracking-tight sm:text-5xl">
          Terms of Service
        </h1>
        <p className="text-sm text-muted-foreground">Last updated: {LAST_UPDATED}</p>
      </header>

      <div className="mt-10 flex flex-col gap-10">
        <Section title="Acceptance of these terms">
          <p>
            These terms govern your use of mzizi.dev — the Mzizi design-system registry, the public
            API under <code className="font-mono text-xs">/api/v1</code>, and the hosted Model
            Context Protocol (MCP) server. mzizi is an open-architecture project governed by the
            Bundu Foundation and operated by nyuchi (Nyuchi Africa (Pvt) Ltd). By accessing the site
            or its APIs you agree to these terms. If you do not agree, please do not use the
            service.
          </p>
        </Section>

        <Section title="The service">
          <p>
            mzizi.dev serves an open component registry, brand and design-token system, and 3D
            frontend architecture. Components are installable via the shadcn CLI against{" "}
            <code className="font-mono text-xs">/api/v1/ui/&lt;component&gt;</code>, and the same
            data is reachable over the MCP server for AI tools. The service is provided for building
            software within and beyond the Bundu ecosystem.
          </p>
        </Section>

        <Section title="Licence and intellectual property">
          <p>
            The Mzizi components and registry content are released under open-source licensing
            (Apache-2.0 unless a specific item states otherwise). You may install, use, modify, and
            redistribute them subject to that licence. The mzizi, nyuchi, and bundu names, logos,
            and wordmarks are trademarks of their respective owners and are not licensed for use in
            a way that implies endorsement or affiliation without permission.
          </p>
        </Section>

        <Section title="Open data">
          <p>
            The aggregate usage metrics published on the{" "}
            <Link
              href="/observability"
              className="text-foreground underline underline-offset-2 hover:text-muted-foreground"
            >
              observability dashboard
            </Link>{" "}
            and the <code className="font-mono text-xs">/api/v1/stats</code> endpoint are open data,
            made available under CC BY 4.0. You may reuse them with attribution.
          </p>
        </Section>

        <Section title="Acceptable use">
          <p>You agree not to:</p>
          <ul className="flex list-disc flex-col gap-1.5 pl-5">
            <li>
              abuse the API or MCP server, or attempt to disrupt, overload, or circumvent rate
              limits or access controls;
            </li>
            <li>
              use the service to build or distribute unlawful, harmful, or infringing material;
            </li>
            <li>
              misrepresent your identity or imply an affiliation with mzizi, nyuchi, or the Bundu
              Foundation that does not exist;
            </li>
            <li>attempt to gain unauthorised access to any non-public system, data, or account.</li>
          </ul>
          <p>
            We may apply reasonable rate limits and may suspend access that threatens the stability
            or security of the service.
          </p>
        </Section>

        <Section title="Availability and changes">
          <p>
            The service is offered on an ongoing but best-effort basis. We may change, add,
            deprecate, or remove components, endpoints, or features as the registry evolves; where
            practical, changes are recorded in the changelog and versioned APIs. We do not guarantee
            uninterrupted or error-free availability.
          </p>
        </Section>

        <Section title="Disclaimer of warranties">
          <p>
            The service and all registry content are provided &ldquo;as is&rdquo; and &ldquo;as
            available&rdquo;, without warranties of any kind, whether express or implied, including
            fitness for a particular purpose, merchantability, and non-infringement. You are
            responsible for testing and validating any component before using it in production.
          </p>
        </Section>

        <Section title="Limitation of liability">
          <p>
            To the fullest extent permitted by law, nyuchi, the Bundu Foundation, and their
            contributors will not be liable for any indirect, incidental, special, or consequential
            damages, or for any loss of data, profits, or business, arising out of or in connection
            with your use of the service or the registry content.
          </p>
        </Section>

        <Section title="Governing law">
          <p>
            These terms are governed by the laws of the Republic of Zimbabwe, where nyuchi (Nyuchi
            Africa (Pvt) Ltd) is established, without regard to conflict-of-laws rules.
          </p>
        </Section>

        <Section title="Changes to these terms">
          <p>
            We may update these terms from time to time. The &ldquo;last updated&rdquo; date above
            reflects the current version; continued use of the service after a change constitutes
            acceptance of the revised terms.
          </p>
        </Section>

        <Section title="Contact">
          <p>
            For questions about these terms, use the official documentation portal at{" "}
            <a
              href="https://docs.nyuchi.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground underline underline-offset-2 hover:text-muted-foreground"
            >
              docs.nyuchi.com
            </a>{" "}
            or open an issue at{" "}
            <a
              href="https://github.com/nyuchi/mzizi"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground underline underline-offset-2 hover:text-muted-foreground"
            >
              github.com/nyuchi/mzizi
            </a>
            .
          </p>
          <p>
            See also our{" "}
            <Link
              href="/privacy"
              className="text-foreground underline underline-offset-2 hover:text-muted-foreground"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </Section>
      </div>
    </div>
  )
}
