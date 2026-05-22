import { Terminal, FolderOpen, Palette } from "lucide-react"

const steps = [
  {
    icon: Terminal,
    title: "Install from the registry",
    description:
      "Use the shadcn CLI to add any component. Dependencies and tokens resolve automatically.",
    code: "npx shadcn@latest add https://mzizi.dev/api/v1/ui/button",
    mineralColor: "bg-[var(--color-tanzanite)]",
  },
  {
    icon: FolderOpen,
    title: "Own your code",
    description:
      "Components land in your project as source files. Full ownership, zero hidden dependencies.",
    code: "components/ui/button.tsx",
    mineralColor: "bg-[var(--color-malachite)]",
  },
  {
    icon: Palette,
    title: "Inherit the brand",
    description:
      "Five African Minerals built in. Swap tokens to match your product, or ship as-is.",
    code: '<Button variant="outline">Ship it</Button>',
    mineralColor: "bg-[var(--color-gold)]",
  },
]

export function InstallSteps() {
  return (
    <section className="px-4 py-16 sm:px-6 md:py-28">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 text-center sm:mb-14">
          <p className="mb-3 text-sm font-medium tracking-widest text-muted-foreground uppercase">
            How it works
          </p>
          <h2 className="font-serif text-2xl font-bold tracking-tight text-balance text-foreground sm:text-3xl md:text-4xl">
            Three steps. Zero friction.
          </h2>
        </div>

        <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
          {steps.map((step, i) => (
            <div
              key={step.title}
              className="group relative flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 transition-all hover:border-foreground/12"
            >
              <div className="flex items-center justify-between">
                <div className="flex size-10 items-center justify-center rounded-xl bg-secondary text-foreground">
                  <step.icon className="size-5" />
                </div>
                <div className="flex items-center gap-2">
                  <span className={`size-2 rounded-full ${step.mineralColor}`} />
                  <span className="font-mono text-xs text-muted-foreground">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <h3 className="text-base font-semibold text-foreground">{step.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{step.description}</p>
              </div>

              <div className="mt-auto overflow-hidden rounded-xl bg-secondary px-3 py-2.5">
                <code className="block font-mono text-[11px] leading-relaxed break-all text-muted-foreground sm:text-xs">
                  {step.code}
                </code>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
