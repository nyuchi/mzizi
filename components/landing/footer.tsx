import { Separator } from "@/components/ui/separator"
import { NyuchiLogo } from "@/components/layout/nyuchi-logo"
import { ThemeToggle } from "@/components/theme-toggle"

const minerals = [
  { name: "cobalt", color: "bg-[var(--color-cobalt)]" },
  { name: "tanzanite", color: "bg-[var(--color-tanzanite)]" },
  { name: "malachite", color: "bg-[var(--color-malachite)]" },
  { name: "gold", color: "bg-[var(--color-gold)]" },
  { name: "terracotta", color: "bg-[var(--color-terracotta)]" },
]

// ──────────────────────────────────────────────────────────────────────────
// Footer columns — the full navigation map.
//
// The header only carries four top-level items (Components, Brand,
// Architecture, Docs) on desktop. Below md the header hides its nav
// entirely, so the footer is the authoritative navigation surface at
// every breakpoint.
//
// Mobile: single stacked column (one section at a time, no cramped
// 2-column split). Tablet: 2 columns. Desktop: 4 columns.
// ──────────────────────────────────────────────────────────────────────────

type FooterColumn = {
  title: string
  links: Array<{ label: string; href: string; external?: boolean }>
}

const columns: FooterColumn[] = [
  {
    title: "Explore",
    links: [
      { label: "Components", href: "/components" },
      { label: "3D architecture", href: "/architecture" },
      { label: "Observability", href: "/observability" },
    ],
  },
  {
    title: "Documentation",
    links: [
      { label: "Docs home", href: "https://mzizi.dev/docs", external: true },
      { label: "Installation", href: "https://mzizi.dev/docs/installation", external: true },
      { label: "CLI", href: "https://mzizi.dev/docs/cli", external: true },
      { label: "Theming", href: "https://mzizi.dev/docs/theming", external: true },
      { label: "API reference", href: "https://mzizi.dev/docs/api-reference", external: true },
      { label: "Contributing", href: "https://mzizi.dev/docs/contributing", external: true },
    ],
  },
  {
    title: "Developer",
    links: [
      { label: "Registry API", href: "/api/v1" },
      { label: "OpenAPI", href: "/api/openapi" },
      { label: "MCP server", href: "/mcp" },
    ],
  },
]

const ecosystem: { heading: string; links: Array<{ label: string; href: string }> }[] = [
  {
    heading: "mukoko — consumer",
    links: [
      { label: "mukoko.com", href: "https://www.mukoko.com" },
      { label: "weather", href: "https://weather.mukoko.com" },
      { label: "news", href: "https://news.mukoko.com" },
      { label: "lingo", href: "https://lingo.mukoko.com" },
      { label: "nhimbe", href: "https://nhimbe.com" },
      { label: "shamwari", href: "https://shamwari.ai" },
    ],
  },
  {
    heading: "nyuchi — enterprise",
    links: [
      { label: "nyuchi.com", href: "https://nyuchi.com" },
      { label: "bushtrade", href: "https://bushtrade.co.zw" },
    ],
  },
]

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  )
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

const socials = [
  {
    label: "GitHub — design portal",
    href: "https://github.com/nyuchi/design-portal",
    Icon: GithubIcon,
  },
  {
    label: "GitHub — Nyuchi Africa",
    href: "https://github.com/nyuchi",
    Icon: GithubIcon,
  },
  {
    label: "Twitter / X",
    href: "https://twitter.com/nyuchiafrica",
    Icon: XIcon,
  },
]

const footerLink =
  "text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary rounded-sm"

export function Footer() {
  return (
    // Full-bleed: the dashboard shell constrains the article column, so the
    // negative margins + 100vw width here break out of that container so the
    // footer spans the full viewport, then re-centres its grid via mx-auto.
    <div className="relative right-1/2 left-1/2 -mx-[50vw] w-screen px-4 pt-8 pb-10 sm:px-6 sm:pb-12">
      <div className="mx-auto max-w-6xl">
        <Separator className="mb-10" />

        {/* Primary nav: 1 column at mobile, 2 at sm, 3 at lg. */}
        <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {columns.map((col) => (
            <div key={col.title} className="flex flex-col gap-2">
              <span className="text-xs font-medium text-foreground">{col.title}</span>
              {col.links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target={link.external ? "_blank" : undefined}
                  rel={link.external ? "noopener noreferrer" : undefined}
                  className={footerLink}
                >
                  {link.label}
                </a>
              ))}
            </div>
          ))}
        </div>

        <Separator className="my-8" />

        {/* Brand lockup + ecosystem family */}
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-col gap-3">
            <NyuchiLogo size={24} showWordmark suffix="mzizi" />
            <p className="max-w-xs text-xs leading-relaxed text-muted-foreground">
              Mzizi — an open-architecture project of the Bundu Foundation, operated and developed
              by Nyuchi. Built on the Five African Minerals palette.
            </p>
            <div className="flex items-center gap-1.5 pt-1" aria-label="Five African Minerals">
              {minerals.map((m) => (
                <span key={m.name} className={`size-2 rounded-full ${m.color}`} title={m.name} />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-10 md:gap-12">
            {ecosystem.map((group) => (
              <div key={group.heading} className="flex flex-col gap-2">
                <span className="text-xs font-medium text-foreground">{group.heading}</span>
                {group.links.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={footerLink}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            ))}
          </div>
        </div>

        <Separator className="my-6" />

        {/* Bottom bar — socials, theme, version, credit */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-1">
            {socials.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <Icon className="size-4" />
              </a>
            ))}
            <ThemeToggle />
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span>
              Built by{" "}
              <a
                href="https://github.com/nyuchi"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground underline underline-offset-2 transition-colors hover:text-muted-foreground"
              >
                Nyuchi Africa
              </a>
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-[10px]">v4.0.39</span>
          </div>
        </div>
      </div>
    </div>
  )
}
