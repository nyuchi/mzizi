import type { Metadata, Viewport } from "next"
import { Noto_Sans, Noto_Serif, JetBrains_Mono } from "next/font/google"
import "./globals.css"
import { MineralStrip } from "@/components/layout/mineral-strip"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { DashboardSidebar } from "@/components/landing/dashboard-sidebar"
import { Header } from "@/components/landing/header"
import { Breadcrumbs } from "@/components/landing/breadcrumbs"
import { Toc } from "@/components/landing/toc"
import { Footer as CustomFooter } from "@/components/landing/footer"

const fontSans = Noto_Sans({ subsets: ["latin"], variable: "--font-sans" })
const fontSerif = Noto_Serif({ subsets: ["latin"], variable: "--font-serif" })
const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

const SITE_URL = "https://mzizi.dev"
const SITE_NAME = "Mzizi"
const SITE_DESCRIPTION =
  "Mzizi — an open-architecture project of the Bundu Foundation. An open 3D frontend architecture, component registry, MCP server, and AI-native developer tooling built on the Five African Minerals palette. Operated and developed by Nyuchi. Install directly into your project with the shadcn CLI."

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Mzizi",
    template: "%s | Mzizi",
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: "Bundu Foundation" }, { name: "Nyuchi", url: "https://nyuchi.com" }],
  keywords: [
    "open architecture",
    "design system",
    "component library",
    "shadcn",
    "Africa",
    "React",
    "Next.js",
    "Tailwind CSS",
    "Five African Minerals",
    "mzizi",
    "bundu",
    "UI components",
    "TypeScript",
  ],
  creator: "Bundu Foundation",
  publisher: "Bundu Foundation",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: "website",
    locale: "en_ZW",
    alternateLocale: ["en_ZA", "en_GB", "en_US"],
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "Mzizi",
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Mzizi — open architecture on the Five African Minerals design system",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@nyuchiafrica",
    creator: "@nyuchiafrica",
    title: "Mzizi",
    description: SITE_DESCRIPTION,
    images: ["/og-image.png"],
  },
}

export const viewport: Viewport = {
  // Must match the semantic `--background` token in app/globals.css.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F3F2EE" },
    { media: "(prefers-color-scheme: dark)", color: "#1B1A17" },
  ],
}

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      description: SITE_DESCRIPTION,
      publisher: { "@id": `${SITE_URL}/#organization` },
      inLanguage: "en-ZW",
    },
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "Bundu Foundation",
      description:
        "The Bundu Foundation governs Mzizi, an open-architecture project operated and developed by Nyuchi.",
      sameAs: ["https://github.com/nyuchi/design-portal"],
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${SITE_URL}/#app`,
      name: SITE_NAME,
      url: SITE_URL,
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Web",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      description: SITE_DESCRIPTION,
      creator: { "@id": `${SITE_URL}/#organization` },
      softwareVersion: "4.0.40",
      downloadUrl: "https://mzizi.dev/api/v1/ui",
    },
  ],
}

/**
 * Root layout — Mzizi dashboard shell.
 *
 * The Mzizi dashboard pattern:
 *   - `<SidebarProvider>` (from vendored shadcn sidebar primitive) provides
 *     the toggle context for the header's built-in `SidebarTrigger`.
 *   - `<DashboardSidebar>` — curated nav from `lib/nav.ts`. Collapses to
 *     an icon strip on narrow desktops; renders as a Sheet on mobile.
 *   - `<SidebarInset>` — the main content column, shifts to accommodate
 *     the sidebar on desktop and becomes full-width on mobile.
 *   - Inside the inset: sticky header, then a grid that holds the
 *     breadcrumb + page body + TOC rail + portal footer.
 *
 * Layout behaviour by route:
 *   - Landing `/`           — Breadcrumbs + Toc self-hide (both return null
 *                             on empty path / no headings); sidebar collapses
 *                             to icon strip so the hero feels full-bleed.
 *   - architecture / …      — full shell: sidebar + breadcrumbs + TOC.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      dir="ltr"
      className={`${fontSans.variable} ${fontSerif.variable} ${fontMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-sans antialiased">
        {/* Mineral strip — 4px fixed left-edge accent, z-40 so the sticky
            header (z-50) covers it cleanly. `pl-1` on the content column
            reserves 4px so nothing overlaps. */}
        <MineralStrip className="fixed inset-y-0 left-0 z-40 h-screen rounded-none" />

        <TooltipProvider delayDuration={200}>
          <SidebarProvider defaultOpen>
            <DashboardSidebar />

            <SidebarInset className="pl-1">
              <Header />

              <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-8 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_12rem] lg:py-8">
                <div className="min-w-0">
                  <Breadcrumbs className="mb-4" />
                  <article data-mdx className="prose-mdx">
                    {children}
                  </article>
                </div>
                <aside className="hidden self-start lg:sticky lg:top-20 lg:block">
                  <Toc />
                </aside>
              </div>

              <CustomFooter />
            </SidebarInset>
          </SidebarProvider>
        </TooltipProvider>
      </body>
    </html>
  )
}
