import { getHelixModel } from "@/lib/db"
// Direct import is fine: `architecture-canvas.tsx` carries `"use client"`,
// so Next.js evaluates it only in the browser. Three.js never runs during
// SSR. Next.js automatically code-splits the client bundle.
import { ArchitectureCanvas } from "./architecture-canvas"

/**
 * Server wrapper for the interactive DNA-helix architecture explorer.
 *
 * Reads the live model from Supabase `component_documents`
 * (`documentation-architecture-{nodes,strands}`) — the single source of
 * truth the MCP serves. If the collections are empty, renders an
 * empty-state notice instead of a broken canvas. The canvas itself is a
 * client component — three.js never runs during SSR.
 */
export async function ArchitectureExplorer() {
  const model = await getHelixModel()

  if (model.nodes.length === 0 || model.strands.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-muted/20 p-8 text-center text-sm text-muted-foreground">
        The DNA-helix explorer needs the{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
          documentation-architecture-nodes
        </code>{" "}
        and{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
          documentation-architecture-strands
        </code>{" "}
        collections to be populated in{" "}
        <code className="font-mono text-xs">component_documents</code>.
      </div>
    )
  }

  return <ArchitectureCanvas model={model} />
}
