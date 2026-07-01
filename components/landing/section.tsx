import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

/**
 * One section shell + one section header for the whole landing/showcase, so
 * every band shares the same vertical rhythm, max-width, eyebrow, and heading
 * scale (previously each section invented its own — 4 eyebrow styles, 2 widths,
 * 2 padding scales). This is the backbone of a polished, showcase-grade page.
 */
export function Section({
  children,
  className,
  bordered = false,
  muted = false,
  id,
}: {
  children: ReactNode
  className?: string
  /** Top hairline divider between bands. */
  bordered?: boolean
  /** Subtle tinted background to alternate bands. */
  muted?: boolean
  id?: string
}) {
  return (
    <section
      id={id}
      className={cn(
        "px-4 py-16 sm:px-6 md:py-24",
        bordered && "border-t border-border",
        muted && "bg-muted/30"
      )}
    >
      <div className={cn("mx-auto max-w-6xl", className)}>{children}</div>
    </section>
  )
}

export function SectionHeader({
  eyebrow,
  title,
  sub,
  align = "left",
  className,
}: {
  eyebrow?: string
  title: ReactNode
  sub?: ReactNode
  align?: "left" | "center"
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        align === "center" && "items-center text-center",
        className
      )}
    >
      {eyebrow && (
        <span className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
          {eyebrow}
        </span>
      )}
      <h2 className="font-serif text-2xl font-bold tracking-tight text-balance sm:text-3xl md:text-4xl">
        {title}
      </h2>
      {sub && (
        <p
          className={cn(
            "max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base",
            align === "center" && "mx-auto"
          )}
        >
          {sub}
        </p>
      )}
    </div>
  )
}
