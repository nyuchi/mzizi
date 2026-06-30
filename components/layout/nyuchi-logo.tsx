import { cn } from "@/lib/utils"

export interface NyuchiLogoProps {
  size?: number
  /** When `true`, render the wordmark text alongside the mark. */
  showWordmark?: boolean
  /** Optional secondary word displayed in muted colour after "nyuchi". */
  suffix?: string
  className?: string
}

/**
 * Nyuchi brand mark — the bee (nyuchi = "bee"). Copper on light surfaces,
 * gold (honey) on dark surfaces. The variant is swapped purely via the
 * `.dark` class so it stays correct with the theme toggle and needs no JS.
 */
export function NyuchiLogo({
  size = 24,
  showWordmark = false,
  suffix,
  className,
}: NyuchiLogoProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 font-serif font-semibold whitespace-nowrap",
        className
      )}
    >
      {/* Light surfaces: copper bee. Dark surfaces: gold bee. Transparent PNGs. */}
      <img
        src="/icons/nyuchi-icon-light.png"
        alt="nyuchi"
        width={size}
        height={size}
        decoding="async"
        className="block shrink-0 dark:hidden"
      />
      <img
        src="/icons/nyuchi-icon-dark.png"
        alt=""
        aria-hidden="true"
        width={size}
        height={size}
        decoding="async"
        className="hidden shrink-0 dark:block"
      />
      {showWordmark && (
        <>
          <span className="tracking-tight lowercase">nyuchi</span>
          {suffix && (
            <span className="tracking-tight text-muted-foreground lowercase">{suffix}</span>
          )}
        </>
      )}
    </span>
  )
}
