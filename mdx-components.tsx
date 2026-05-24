// MDX components map for @next/mdx. Every MDX file under `app/` can
// reference these identifiers directly without importing them.
// Previously this merged in `nextra-theme-docs`'s theme components
// (prose layout, Callout, etc.); under @next/mdx we're framework-free
// and do our own typography via the rehype plugins + globals.css.

import type { MDXComponents } from "mdx/types"
import type { ComponentPropsWithoutRef } from "react"

// ── Layout brand marks (self-contained) ─────────────────────────────
import { MineralStrip } from "@/components/layout/mineral-strip"
import { NyuchiLogo } from "@/components/layout/nyuchi-logo"

// ── Brand callout (replaces `nextra/components/Callout`) ────────────
import { Callout } from "@/components/mdx/callout"

// ── UI primitives actually consumed by the portal (35) ──────────────
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Input } from "@/components/ui/input"
import { Kbd } from "@/components/ui/kbd"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Slider } from "@/components/ui/slider"
import { Spinner } from "@/components/ui/spinner"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Toggle } from "@/components/ui/toggle"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// ── Native markdown element styling ─────────────────────────────────
// Without these, MDX renders raw browser-default <h1>/<p>/<ul>/… and the
// pages look unstyled ("plain text"). The base style matches CLAUDE.md §7:
// Noto Serif for headings, Noto Sans for body, JetBrains Mono for code.
// Inline `code` gets a chip; fenced code blocks are left to rehype-pretty-code
// (the wrapping `pre` provides the surface, the inner `code` keeps its
// language-* class so syntax tokens render).
const markdownComponents: MDXComponents = {
  h1: (props: ComponentPropsWithoutRef<"h1">) => (
    <h1
      className="mt-12 mb-4 font-serif text-4xl font-bold tracking-tight text-foreground"
      {...props}
    />
  ),
  h2: (props: ComponentPropsWithoutRef<"h2">) => (
    <h2
      className="mt-10 mb-3 font-serif text-3xl font-semibold tracking-tight text-foreground"
      {...props}
    />
  ),
  h3: (props: ComponentPropsWithoutRef<"h3">) => (
    <h3
      className="mt-8 mb-3 font-serif text-2xl font-semibold tracking-tight text-foreground"
      {...props}
    />
  ),
  h4: (props: ComponentPropsWithoutRef<"h4">) => (
    <h4 className="mt-6 mb-2 font-serif text-xl font-semibold text-foreground" {...props} />
  ),
  h5: (props: ComponentPropsWithoutRef<"h5">) => (
    <h5 className="mt-4 mb-2 font-serif text-lg font-semibold text-foreground" {...props} />
  ),
  h6: (props: ComponentPropsWithoutRef<"h6">) => (
    <h6 className="mt-4 mb-2 font-serif text-base font-semibold text-foreground" {...props} />
  ),
  p: (props: ComponentPropsWithoutRef<"p">) => (
    <p className="my-4 leading-7 text-foreground" {...props} />
  ),
  ul: (props: ComponentPropsWithoutRef<"ul">) => (
    <ul className="my-4 ml-6 list-disc space-y-2 text-foreground" {...props} />
  ),
  ol: (props: ComponentPropsWithoutRef<"ol">) => (
    <ol className="my-4 ml-6 list-decimal space-y-2 text-foreground" {...props} />
  ),
  li: (props: ComponentPropsWithoutRef<"li">) => <li className="leading-7" {...props} />,
  a: (props: ComponentPropsWithoutRef<"a">) => (
    <a
      className="font-medium text-primary underline underline-offset-4 hover:no-underline"
      {...props}
    />
  ),
  blockquote: (props: ComponentPropsWithoutRef<"blockquote">) => (
    <blockquote
      className="my-6 border-l-4 border-border pl-6 text-muted-foreground italic"
      {...props}
    />
  ),
  hr: (props: ComponentPropsWithoutRef<"hr">) => <hr className="my-8 border-border" {...props} />,
  strong: (props: ComponentPropsWithoutRef<"strong">) => (
    <strong className="font-semibold text-foreground" {...props} />
  ),
  em: (props: ComponentPropsWithoutRef<"em">) => <em className="italic" {...props} />,
  pre: (props: ComponentPropsWithoutRef<"pre">) => (
    <pre
      className="my-6 overflow-x-auto rounded-lg border border-border bg-muted/40 p-4 font-mono text-sm"
      {...props}
    />
  ),
  code: ({ className, ...props }: ComponentPropsWithoutRef<"code">) =>
    className && className.startsWith("language-") ? (
      <code className={`${className} font-mono`} {...props} />
    ) : (
      <code
        className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm text-foreground"
        {...props}
      />
    ),
  table: (props: ComponentPropsWithoutRef<"table">) => (
    <div className="my-6 overflow-x-auto">
      <table className="w-full border-collapse text-sm" {...props} />
    </div>
  ),
  thead: (props: ComponentPropsWithoutRef<"thead">) => (
    <thead className="border-b border-border" {...props} />
  ),
  th: (props: ComponentPropsWithoutRef<"th">) => (
    <th className="px-4 py-2 text-left font-semibold text-foreground" {...props} />
  ),
  td: (props: ComponentPropsWithoutRef<"td">) => (
    <td className="border-b border-border px-4 py-2 text-foreground" {...props} />
  ),
  img: (props: ComponentPropsWithoutRef<"img">) => (
    <img alt={props.alt ?? ""} className="my-6 rounded-lg" {...props} />
  ),
}

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // Native markdown elements first, so explicit overrides below win
    ...markdownComponents,

    // Layout marks
    MineralStrip,
    NyuchiLogo,

    // Brand callout for MDX authors (replaces nextra/components Callout)
    Callout,

    // Accordion
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,

    // Alerts
    Alert,
    AlertDescription,
    AlertTitle,

    // Alert Dialog
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,

    // Avatar
    Avatar,
    AvatarFallback,
    AvatarImage,

    // Basic primitives
    Badge,
    Button,

    // Card
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,

    // Form primitives
    Checkbox,
    Input,
    Label,
    RadioGroup,
    RadioGroupItem,
    Switch,
    Textarea,
    Toggle,

    // Collapsible
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,

    // Dialog
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,

    // Dropdown
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,

    // Hover Card
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,

    // Misc
    Kbd,
    Popover,
    PopoverContent,
    PopoverTrigger,
    Progress,
    ScrollArea,

    // Select
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,

    // Separators + feedback
    Separator,
    Skeleton,
    Slider,
    Spinner,

    // Table
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,

    // Tabs
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,

    // Tooltip
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,

    ...components,
  }
}
