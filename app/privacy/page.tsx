import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How mzizi.dev — the Mzizi design-system registry, API, and MCP server — handles data. An open-architecture project of the Bundu Foundation, operated by nyuchi.",
  alternates: { canonical: "/privacy" },
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

export default function PrivacyPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-3 border-b border-border pb-8">
        <p className="text-sm font-medium text-[var(--color-cobalt)]">Legal</p>
        <h1 className="font-serif text-4xl font-bold tracking-tight sm:text-5xl">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground">Last updated: {LAST_UPDATED}</p>
      </header>

      <div className="mt-10 flex flex-col gap-10">
        <Section title="Who we are">
          <p>
            mzizi (mzizi.dev) is the open component registry, brand system, and 3D frontend
            architecture of the Mzizi design system — an open-architecture project governed by the
            Bundu Foundation and operated by nyuchi (Nyuchi Africa (Pvt) Ltd). This policy explains
            what data mzizi.dev handles when you browse the site or use its public API and Model
            Context Protocol (MCP) server.
          </p>
          <p>
            Product and engineering documentation is published on the official documentation portal
            at{" "}
            <a
              href="https://docs.nyuchi.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground underline underline-offset-2 hover:text-muted-foreground"
            >
              docs.nyuchi.com
            </a>
            .
          </p>
        </Section>

        <Section title="What we collect">
          <p>
            mzizi.dev is a public, anonymous-read surface. There are no user accounts on the site,
            and we do not ask you to sign in to read the registry, brand data, architecture, or
            documentation. Specifically:
          </p>
          <ul className="flex list-disc flex-col gap-1.5 pl-5">
            <li>
              <span className="text-foreground">No personal accounts.</span> Browsing the site, the
              registry, or the API requires no login and collects no personal profile.
            </li>
            <li>
              <span className="text-foreground">Aggregate usage telemetry.</span> We record
              anonymous, aggregate counts of API and MCP usage (for example, which endpoints are
              called and how often) to operate the service and publish open metrics. This telemetry
              is not tied to your identity and is surfaced publicly on our{" "}
              <Link
                href="/observability"
                className="text-foreground underline underline-offset-2 hover:text-muted-foreground"
              >
                observability dashboard
              </Link>
              .
            </li>
            <li>
              <span className="text-foreground">Standard server logs.</span> Our hosting providers
              process routine request metadata (IP address, user agent, timestamp) transiently for
              security, abuse prevention, and reliability.
            </li>
            <li>
              <span className="text-foreground">MCP connector sign-up.</span> Connecting to the
              hosted MCP server (mcp.mzizi.dev) is fronted by a free WorkOS Connect sign-up. If you
              choose to connect, WorkOS processes the identity you register with under its own
              privacy terms; mzizi.dev receives only the minimum needed to authorise your session.
            </li>
          </ul>
        </Section>

        <Section title="Cookies and local storage">
          <p>
            mzizi.dev does not use advertising or cross-site tracking cookies. The site stores a
            small amount of data in your browser&apos;s local storage to remember your theme
            preference (light/dark) and to cache the component registry so pages load quickly. You
            can clear this at any time from your browser settings.
          </p>
        </Section>

        <Section title="How we use data">
          <p>
            We use the limited data above only to operate, secure, and improve the registry and its
            APIs, and to publish open, aggregate usage statistics for the community. We do not sell
            personal data, and we do not build advertising profiles.
          </p>
        </Section>

        <Section title="Service providers">
          <p>
            mzizi.dev runs on infrastructure operated by trusted providers who process data on our
            behalf: Supabase (database and document store), Cloudflare (the MCP worker and edge
            delivery), Vercel (site hosting), and WorkOS (the optional MCP connector sign-up). Each
            processes data under its own terms and applicable data-protection obligations.
          </p>
        </Section>

        <Section title="Data sovereignty">
          <p>
            Data sovereignty is a core value of the Bundu ecosystem. We collect the minimum data
            required to run an open, public registry, keep telemetry anonymous and aggregate, and
            publish it as open data so the community can audit how the service is used.
          </p>
        </Section>

        <Section title="Your rights">
          <p>
            Because mzizi.dev holds no personal accounts and no identifiable profiles, there is
            generally no personal data to access, correct, or delete. If you have connected via the
            MCP sign-up and want your WorkOS identity removed, or you have any other privacy
            request, contact us and we will act on it promptly.
          </p>
        </Section>

        <Section title="Children">
          <p>
            mzizi.dev is a developer tool and is not directed at children. We do not knowingly
            collect personal data from children.
          </p>
        </Section>

        <Section title="Changes to this policy">
          <p>
            We may update this policy as the service evolves. Material changes will be reflected by
            the &ldquo;last updated&rdquo; date above, and significant changes will be noted in our
            documentation and changelog.
          </p>
        </Section>

        <Section title="Contact">
          <p>
            Questions about this policy can be raised through the official documentation portal at{" "}
            <a
              href="https://docs.nyuchi.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground underline underline-offset-2 hover:text-muted-foreground"
            >
              docs.nyuchi.com
            </a>{" "}
            or by opening an issue at{" "}
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
              href="/terms"
              className="text-foreground underline underline-offset-2 hover:text-muted-foreground"
            >
              Terms of Service
            </Link>
            .
          </p>
        </Section>
      </div>
    </div>
  )
}
