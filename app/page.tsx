import type { Metadata } from "next"
import { Hero } from "@/components/landing/hero"
import { InstallSteps } from "@/components/landing/install-steps"
import { BuildWithSection } from "@/components/landing/build-with-section"
import { AiNativeSection } from "@/components/landing/ai-native-section"
import { HarnessSection } from "@/components/landing/harness-section"
import { ResilientBySection } from "@/components/landing/resilient-by-design-section"
import { ExploreSection } from "@/components/landing/explore-section"

export const metadata: Metadata = {
  title: "Mzizi",
  description:
    "An open-architecture project of the Bundu Foundation — components, brand, MCP server, and AI-native developer tooling. Operated and developed by Nyuchi.",
}

export const revalidate = 300

export default function HomePage() {
  return (
    // The marketing shell already renders this route full-width — no `.full-bleed`
    // breakout needed (that 100vw escape overflows on mobile post shell-split).
    <div className="flex flex-col">
      <Hero />
      <InstallSteps />
      <BuildWithSection />
      <AiNativeSection />
      <HarnessSection />
      <ResilientBySection />
      <ExploreSection />
    </div>
  )
}
