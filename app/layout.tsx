import type { Metadata, Viewport } from "next"
import { Noto_Sans, Noto_Serif, JetBrains_Mono } from "next/font/google"
import "./globals.css"
import { MineralStrip } from "@/components/layout/mineral-strip"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AppShell } from "@/components/layout/app-shell"
import { ThemeProvider } from "@/components/theme-provider"

const fontSans = Noto_Sans({ subsets: ["latin"], variable: "--font-sans" })
const fontSerif = Noto_Serif({ subsets: ["latin"], variable: "--font-serif" })
const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

const SITE_URL = "https://mzizi.dev"
const SITE_NAME = "Mzizi"
const SITE_DESCRIPTION =
  "Mzizi — an open-architecture project of the Bundu Foundation. An open 3D frontend architecture, component registry, MCP server, and AI-native developer tooling built on the Seven African Minerals palette. Operated and developed by Nyuchi. Install directly into your project with the shadcn CLI."

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
    "Seven African Minerals",
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
    // No explicit `images` here on purpose: the `app/opengraph-image.tsx` file
    // convention supplies the og:image with an absolute, cache-busted URL. An
    // explicit array would *override* it — and the previous "/og-image.png"
    // pointed at a file that never existed, so every social/messaging scraper
    // got a 404 and rendered no preview. Add a route-level opengraph-image.tsx
    // to override per-page instead of hardcoding here.
  },
  twitter: {
    card: "summary_large_image",
    site: "@nyuchiafrica",
    creator: "@nyuchiafrica",
    title: "Mzizi",
    description: SITE_DESCRIPTION,
    // Likewise no `images`: with no `app/twitter-image.tsx`, the Twitter card
    // falls back to the generated opengraph-image automatically.
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
      softwareVersion: "4.1.8",
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
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* Mineral strip — 4px fixed left-edge accent, z-40 so the sticky
            header (z-50) covers it cleanly. `pl-1` on the content column
            reserves 4px so nothing overlaps. */}
          <MineralStrip className="fixed inset-y-0 left-0 z-40 h-screen rounded-none" />

          <TooltipProvider delayDuration={200}>
            <AppShell>{children}</AppShell>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
