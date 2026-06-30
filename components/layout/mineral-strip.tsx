import { cn } from "@/lib/utils"

/**
 * Vertical 4px accent stripe using the Seven African Minerals (top-to-bottom:
 * Cobalt → Tanzanite → Malachite → Gold → Terracotta). Always vertical per the
 * brand rule. Self-contained — the full styled variants live in the registry.
 */
export function MineralStrip({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("flex w-1 flex-col overflow-hidden rounded-full", className)}
    >
      <div className="flex-1 bg-[var(--color-cobalt)]" />
      <div className="flex-1 bg-[var(--color-tanzanite)]" />
      <div className="flex-1 bg-[var(--color-malachite)]" />
      <div className="flex-1 bg-[var(--color-gold)]" />
      <div className="flex-1 bg-[var(--color-terracotta)]" />
    </div>
  )
}
