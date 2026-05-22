import type { Metadata } from "next"
import { Hero } from "@/components/landing/hero"
import { InstallSteps } from "@/components/landing/install-steps"
import { BuildWithSection } from "@/components/landing/build-with-section"
import { AiNativeSection } from "@/components/landing/ai-native-section"
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
    <div className="full-bleed">
      <Hero />
      <InstallSteps />
      <BuildWithSection />
      <AiNativeSection />
      <ResilientBySection />
      <ExploreSection />
    </div>
  )
}
