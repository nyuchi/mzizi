"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import { Toggle } from "@/components/ui/toggle"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Kbd } from "@/components/ui/kbd"
import { Spinner } from "@/components/ui/spinner"
import {
  AlertCircle,
  Bold,
  Calendar,
  ChevronDown,
  Italic,
  Settings,
  Terminal,
  Underline,
  User,
} from "lucide-react"

export const COMPONENT_DEMOS: Record<string, React.ReactNode> = {
  accordion: (
    <Accordion type="single" collapsible className="w-full max-w-md">
      <AccordionItem value="item-1">
        <AccordionTrigger>Is it accessible?</AccordionTrigger>
        <AccordionContent>Yes. It adheres to the WAI-ARIA design pattern.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Is it styled?</AccordionTrigger>
        <AccordionContent>Yes. It comes with Mukoko design system styles.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Is it animated?</AccordionTrigger>
        <AccordionContent>Yes. It animates open and closed by default.</AccordionContent>
      </AccordionItem>
    </Accordion>
  ),

  alert: (
    <div className="flex w-full max-w-md flex-col gap-4">
      <Alert>
        <Terminal className="size-4" />
        <AlertTitle>Heads up!</AlertTitle>
        <AlertDescription>You can add components using the CLI.</AlertDescription>
      </Alert>
      <Alert variant="destructive">
        <AlertCircle className="size-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Your session has expired. Please log in again.</AlertDescription>
      </Alert>
    </div>
  ),

  "alert-dialog": (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline">Delete account</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),

  avatar: (
    <div className="flex gap-4">
      <Avatar>
        <AvatarFallback>MK</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>NY</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>SA</AvatarFallback>
      </Avatar>
    </div>
  ),

  badge: (
    <div className="flex flex-wrap gap-2">
      <Badge>Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="outline">Outline</Badge>
    </div>
  ),

  button: (
    <div className="flex flex-wrap gap-3">
      <Button>Default</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
    </div>
  ),

  card: (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Create project</CardTitle>
        <CardDescription>Deploy your new project in one click.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="card-name">Name</Label>
          <Input id="card-name" placeholder="Name of your project" />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">Cancel</Button>
        <Button>Deploy</Button>
      </CardFooter>
    </Card>
  ),

  checkbox: (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Checkbox id="terms" />
        <Label htmlFor="terms">Accept terms and conditions</Label>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id="newsletter" defaultChecked />
        <Label htmlFor="newsletter">Subscribe to newsletter</Label>
      </div>
    </div>
  ),

  collapsible: (
    <Collapsible className="w-full max-w-sm space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold">3 starred repositories</h4>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm">
            <ChevronDown className="size-4" />
          </Button>
        </CollapsibleTrigger>
      </div>
      <div className="rounded-md border border-border px-4 py-2 text-sm">design-portal</div>
      <CollapsibleContent className="space-y-2">
        <div className="rounded-md border border-border px-4 py-2 text-sm">mukoko-weather</div>
        <div className="rounded-md border border-border px-4 py-2 text-sm">mukoko-news</div>
      </CollapsibleContent>
    </Collapsible>
  ),

  dialog: (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Edit Profile</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>Make changes to your profile here.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2 sm:grid-cols-4 sm:items-center sm:gap-4">
            <Label htmlFor="dialog-name" className="sm:text-right">
              Name
            </Label>
            <Input id="dialog-name" defaultValue="Mukoko" className="sm:col-span-3" />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit">Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),

  "dropdown-menu": (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <Settings className="mr-2 size-4" /> Options
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Profile</DropdownMenuItem>
        <DropdownMenuItem>Settings</DropdownMenuItem>
        <DropdownMenuItem>Billing</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Log out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),

  "hover-card": (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button variant="link">@mukoko</Button>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="flex gap-4">
          <Avatar>
            <AvatarFallback>MK</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h4 className="text-sm font-semibold">mukoko</h4>
            <p className="text-sm text-muted-foreground">
              Africa&apos;s super app — weather, news, events, and more.
            </p>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  ),

  input: (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <Input placeholder="Email" type="email" />
      <Input placeholder="Password" type="password" />
      <Input placeholder="Disabled" disabled />
    </div>
  ),

  kbd: (
    <div className="flex items-center gap-2">
      <Kbd>⌘</Kbd>
      <span className="text-sm text-muted-foreground">+</span>
      <Kbd>K</Kbd>
    </div>
  ),

  label: (
    <div className="flex flex-col gap-2">
      <Label htmlFor="label-demo">Email</Label>
      <Input id="label-demo" placeholder="you@example.com" />
    </div>
  ),

  popover: (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">
          <Calendar className="mr-2 size-4" /> Pick a date
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-2">
          <h4 className="font-medium">Schedule</h4>
          <p className="text-sm text-muted-foreground">Choose a date for your event.</p>
          <Input type="date" />
        </div>
      </PopoverContent>
    </Popover>
  ),

  progress: (
    <div className="w-full max-w-md space-y-4">
      <Progress value={33} />
      <Progress value={66} />
      <Progress value={100} />
    </div>
  ),

  "radio-group": (
    <RadioGroup defaultValue="comfortable">
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="default" id="r1" />
        <Label htmlFor="r1">Default</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="comfortable" id="r2" />
        <Label htmlFor="r2">Comfortable</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="compact" id="r3" />
        <Label htmlFor="r3">Compact</Label>
      </div>
    </RadioGroup>
  ),

  "scroll-area": (
    <ScrollArea className="h-48 w-48 rounded-md border border-border">
      <div className="p-4">
        <h4 className="mb-4 text-sm font-medium">Minerals</h4>
        {[
          "Cobalt",
          "Tanzanite",
          "Malachite",
          "Gold",
          "Terracotta",
          "Diamond",
          "Copper",
          "Platinum",
          "Chromite",
          "Manganese",
        ].map((mineral) => (
          <div key={mineral} className="text-sm">
            {mineral}
            <Separator className="my-2" />
          </div>
        ))}
      </div>
    </ScrollArea>
  ),

  select: (
    <Select>
      <SelectTrigger className="w-full max-w-[200px]">
        <SelectValue placeholder="Select a mineral" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="cobalt">Cobalt</SelectItem>
        <SelectItem value="tanzanite">Tanzanite</SelectItem>
        <SelectItem value="malachite">Malachite</SelectItem>
        <SelectItem value="gold">Gold</SelectItem>
        <SelectItem value="terracotta">Terracotta</SelectItem>
      </SelectContent>
    </Select>
  ),

  separator: (
    <div className="w-full max-w-sm">
      <div className="space-y-1">
        <h4 className="text-sm font-medium">nyuchi design portal</h4>
        <p className="text-sm text-muted-foreground">Component registry and design system.</p>
      </div>
      <Separator className="my-4" />
      <div className="flex h-5 items-center space-x-4 text-sm">
        <div>Docs</div>
        <Separator orientation="vertical" />
        <div>API</div>
        <Separator orientation="vertical" />
        <div>Source</div>
      </div>
    </div>
  ),

  skeleton: (
    <div className="flex w-full max-w-full items-center space-x-4">
      <Skeleton className="size-12 shrink-0 rounded-full" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-4 w-full max-w-[250px]" />
        <Skeleton className="h-4 w-full max-w-[200px]" />
      </div>
    </div>
  ),

  slider: (
    <div className="w-full max-w-sm space-y-6">
      <Slider defaultValue={[50]} max={100} step={1} />
      <Slider defaultValue={[25, 75]} max={100} step={1} />
    </div>
  ),

  spinner: (
    <div className="flex gap-4">
      <Spinner />
    </div>
  ),

  switch: (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Switch id="airplane" />
        <Label htmlFor="airplane">Airplane Mode</Label>
      </div>
      <div className="flex items-center gap-3">
        <Switch id="notifications" defaultChecked />
        <Label htmlFor="notifications">Notifications</Label>
      </div>
    </div>
  ),

  table: (
    <Table>
      <TableCaption>Five African Minerals</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Mineral</TableHead>
          <TableHead>Hex</TableHead>
          <TableHead>Usage</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell className="font-medium">Cobalt</TableCell>
          <TableCell>#0047AB</TableCell>
          <TableCell>Primary blue, links</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium">Tanzanite</TableCell>
          <TableCell>#B388FF</TableCell>
          <TableCell>Purple accent, brand</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium">Malachite</TableCell>
          <TableCell>#64FFDA</TableCell>
          <TableCell>Success states</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),

  tabs: (
    <Tabs defaultValue="account" className="w-full max-w-md">
      <TabsList>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
      </TabsList>
      <TabsContent value="account" className="space-y-2">
        <p className="text-sm text-muted-foreground">Make changes to your account here.</p>
        <Input defaultValue="Mukoko" />
      </TabsContent>
      <TabsContent value="password" className="space-y-2">
        <p className="text-sm text-muted-foreground">Change your password here.</p>
        <Input type="password" />
      </TabsContent>
    </Tabs>
  ),

  textarea: (
    <div className="w-full max-w-sm space-y-2">
      <Label htmlFor="message">Message</Label>
      <Textarea id="message" placeholder="Type your message here." />
    </div>
  ),

  toggle: (
    <div className="flex gap-2">
      <Toggle aria-label="Toggle bold">
        <Bold className="size-4" />
      </Toggle>
      <Toggle aria-label="Toggle italic">
        <Italic className="size-4" />
      </Toggle>
      <Toggle aria-label="Toggle underline">
        <Underline className="size-4" />
      </Toggle>
    </div>
  ),

  tooltip: (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">
            <User className="mr-2 size-4" /> Hover me
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Your profile settings</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),

  "mukoko-sidebar": (
    <div className="w-full max-w-xs rounded-lg border border-border bg-muted/30 p-4">
      <div className="mb-3 flex h-1 w-full gap-0.5 overflow-hidden rounded-full">
        <span className="flex-1 bg-[var(--color-cobalt)]" />
        <span className="flex-1 bg-[var(--color-tanzanite)]" />
        <span className="flex-1 bg-[var(--color-malachite)]" />
        <span className="flex-1 bg-[var(--color-gold)]" />
        <span className="flex-1 bg-[var(--color-terracotta)]" />
      </div>
      <div className="mb-3 text-sm font-bold">nyuchi design portal</div>
      <div className="space-y-0.5">
        <div className="rounded-md bg-primary/10 px-3 py-1.5 text-xs font-medium text-foreground">
          Components
        </div>
        <div className="rounded-md px-3 py-1.5 text-xs text-muted-foreground">Brand</div>
        <div className="rounded-md px-3 py-1.5 text-xs text-muted-foreground">Architecture</div>
        <div className="rounded-md px-3 py-1.5 text-xs text-muted-foreground">API</div>
      </div>
      <div className="mt-3 border-t border-border pt-2 text-[10px] text-muted-foreground">
        v4.0.40
      </div>
    </div>
  ),

  "mukoko-header": (
    <div className="w-full max-w-lg rounded-lg border border-border bg-background/80 px-4 py-2 backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm font-bold">nyuchi design portal</span>
          <div className="hidden items-center gap-2 sm:flex">
            <span className="text-xs text-muted-foreground">Components</span>
            <span className="text-xs text-muted-foreground">Brand</span>
            <span className="text-xs text-muted-foreground">API</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Badge variant="outline" className="text-[10px]">
            Theme
          </Badge>
        </div>
      </div>
    </div>
  ),

  "mukoko-footer": (
    <div className="w-full max-w-md rounded-lg border border-border p-4">
      <div className="mb-3 text-sm font-bold">mukoko</div>
      <p className="mb-2 text-xs text-muted-foreground">
        Built on the Five African Minerals palette.
      </p>
      <div className="mb-3 flex items-center gap-1.5">
        <span className="size-2 rounded-full bg-[var(--color-cobalt)]" />
        <span className="size-2 rounded-full bg-[var(--color-tanzanite)]" />
        <span className="size-2 rounded-full bg-[var(--color-malachite)]" />
        <span className="size-2 rounded-full bg-[var(--color-gold)]" />
        <span className="size-2 rounded-full bg-[var(--color-terracotta)]" />
      </div>
      <div className="flex gap-6 text-xs text-muted-foreground">
        <div className="space-y-1">
          <p className="font-medium text-foreground">Products</p>
          <p>mukoko.com</p>
          <p>Nhimbe</p>
        </div>
        <div className="space-y-1">
          <p className="font-medium text-foreground">Services</p>
          <p>News</p>
          <p>Weather</p>
        </div>
      </div>
      <div className="mt-3 border-t border-border pt-2 text-[10px] text-muted-foreground">
        Built by Nyuchi — v4.0.40
      </div>
    </div>
  ),

  "mukoko-bottom-nav": (
    <div className="w-full max-w-sm rounded-lg border border-border bg-background/80 px-2 py-2 backdrop-blur-xl">
      <div className="flex items-center justify-around">
        <div className="flex flex-col items-center gap-0.5">
          <div className="size-5 rounded bg-[var(--color-cobalt)]/20" />
          <span className="text-[10px] font-medium text-[var(--color-cobalt)]">Home</span>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <div className="size-5 rounded bg-muted" />
          <span className="text-[10px] text-muted-foreground">Explore</span>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <div className="size-5 rounded bg-muted" />
          <span className="text-[10px] text-muted-foreground">Library</span>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <div className="size-5 rounded bg-muted" />
          <span className="text-[10px] text-muted-foreground">Settings</span>
        </div>
      </div>
    </div>
  ),

  "detail-layout": (
    <div className="w-full max-w-md rounded-lg border border-border p-4">
      <div className="mb-2 text-xs text-muted-foreground">← Back to events</div>
      <div className="mb-1 aspect-video w-full rounded-lg bg-muted" />
      <h3 className="mt-3 font-serif text-lg font-bold">Event Title</h3>
      <p className="text-sm text-muted-foreground">A brief description of the event.</p>
      <div className="mt-2 flex gap-2">
        <Badge variant="outline">Category</Badge>
        <span className="text-xs text-muted-foreground">March 14, 2026</span>
      </div>
      <div className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">
        Content goes here with readable line length...
      </div>
    </div>
  ),

  "dashboard-layout": (
    <div className="flex w-full max-w-lg overflow-hidden rounded-lg border border-border">
      {/* Sidebar mockup */}
      <div className="hidden w-40 shrink-0 border-r border-border bg-muted/30 p-3 sm:block">
        <div className="mb-3 flex h-0.5 gap-0.5 overflow-hidden rounded-full">
          <span className="flex-1 bg-[var(--color-cobalt)]" />
          <span className="flex-1 bg-[var(--color-tanzanite)]" />
          <span className="flex-1 bg-[var(--color-malachite)]" />
          <span className="flex-1 bg-[var(--color-gold)]" />
          <span className="flex-1 bg-[var(--color-terracotta)]" />
        </div>
        <div className="mb-2 text-xs font-bold">mukoko</div>
        <div className="space-y-0.5 text-[10px]">
          <div className="rounded bg-primary/10 px-2 py-1 font-medium">Dashboard</div>
          <div className="rounded px-2 py-1 text-muted-foreground">Analytics</div>
          <div className="rounded px-2 py-1 text-muted-foreground">Settings</div>
        </div>
      </div>
      {/* Content area */}
      <div className="flex-1">
        <div className="border-b border-border bg-background/80 px-3 py-2 text-xs font-medium">
          Header
        </div>
        <div className="grid grid-cols-2 gap-2 p-3">
          <div className="rounded-lg bg-muted p-3 text-center text-xs text-muted-foreground">
            Card 1
          </div>
          <div className="rounded-lg bg-muted p-3 text-center text-xs text-muted-foreground">
            Card 2
          </div>
          <div className="col-span-2 rounded-lg bg-muted p-3 text-center text-xs text-muted-foreground">
            Chart
          </div>
        </div>
      </div>
    </div>
  ),

  "data-table": (
    <div className="w-full max-w-md space-y-3">
      <div className="flex items-center gap-2">
        <div className="h-9 flex-1 rounded-lg border border-border bg-background px-3 text-xs leading-9 text-muted-foreground">
          Filter emails...
        </div>
        <div className="rounded-lg border border-border bg-background px-3 py-2 text-xs">
          Columns ▾
        </div>
      </div>
      <div className="rounded-xl border border-border">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b">
              <th className="p-2 text-left font-medium">Status</th>
              <th className="p-2 text-left font-medium">Email</th>
              <th className="p-2 text-right font-medium">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="p-2">
                <span className="rounded-full bg-[var(--color-malachite)]/20 px-2 py-0.5 text-[10px] text-[var(--color-malachite)]">
                  Success
                </span>
              </td>
              <td className="p-2">ken@example.com</td>
              <td className="p-2 text-right">$316.00</td>
            </tr>
            <tr className="border-b">
              <td className="p-2">
                <span className="rounded-full bg-[var(--color-malachite)]/20 px-2 py-0.5 text-[10px] text-[var(--color-malachite)]">
                  Success
                </span>
              </td>
              <td className="p-2">abe@example.com</td>
              <td className="p-2 text-right">$242.00</td>
            </tr>
            <tr>
              <td className="p-2">
                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px]">Processing</span>
              </td>
              <td className="p-2">monse@example.com</td>
              <td className="p-2 text-right">$837.00</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
        <span>0 of 3 row(s) selected.</span>
        <div className="flex gap-1">
          <span className="rounded border border-border px-2 py-1">Previous</span>
          <span className="rounded border border-border px-2 py-1">Next</span>
        </div>
      </div>
    </div>
  ),

  "date-picker": (
    <div className="flex flex-col gap-3">
      <button className="inline-flex h-10 w-full max-w-[280px] items-center rounded-lg border border-border bg-background px-3 text-left text-sm">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mr-2 text-muted-foreground"
        >
          <path d="M8 2v4" />
          <path d="M16 2v4" />
          <rect width="18" height="18" x="3" y="4" rx="2" />
          <path d="M3 10h18" />
        </svg>
        <span className="text-muted-foreground">Pick a date</span>
      </button>
      <button className="inline-flex h-10 w-full max-w-[280px] items-center rounded-lg border border-border bg-background px-3 text-left text-sm">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mr-2 text-muted-foreground"
        >
          <path d="M8 2v4" />
          <path d="M16 2v4" />
          <rect width="18" height="18" x="3" y="4" rx="2" />
          <path d="M3 10h18" />
        </svg>
        <span>Mar 14, 2026</span>
      </button>
    </div>
  ),

  typography: (
    <div className="w-full max-w-sm space-y-4 text-left">
      <h1 className="scroll-m-20 font-serif text-3xl font-extrabold tracking-tight">
        The Mukoko Platform
      </h1>
      <p className="text-xl text-muted-foreground">
        A unified design system for the African digital ecosystem.
      </p>
      <h2 className="scroll-m-20 border-b pb-2 text-2xl font-semibold tracking-tight">
        Typography
      </h2>
      <p className="leading-7">
        The typography system uses{" "}
        <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
          Noto Sans
        </code>{" "}
        for body and{" "}
        <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
          Noto Serif
        </code>{" "}
        for display.
      </p>
      <blockquote className="border-l-2 pl-6 italic">
        &ldquo;Built for Africa, by Africa.&rdquo;
      </blockquote>
      <p className="text-sm text-muted-foreground">Every mineral tells a story.</p>
    </div>
  ),

  "search-bar": (
    <div className="w-full max-w-sm">
      <div className="relative">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <div className="flex h-10 w-full items-center rounded-lg border border-border bg-background pr-16 pl-9 text-sm text-muted-foreground">
          Search components...
        </div>
        <div className="absolute top-1/2 right-2 -translate-y-1/2">
          <kbd className="inline-flex h-5 items-center rounded border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground">
            ⌘K
          </kbd>
        </div>
      </div>
    </div>
  ),

  "user-menu": (
    <div className="flex items-center gap-2 rounded-lg border border-border p-2">
      <div className="flex size-8 items-center justify-center rounded-full bg-[var(--color-tanzanite)]/20 text-xs font-medium text-[var(--color-tanzanite)]">
        TN
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-medium">Tinashe Nyuchi</span>
        <span className="text-xs text-muted-foreground">tinashe@nyuchi.com</span>
      </div>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="ml-2 text-muted-foreground"
      >
        <path d="m7 15 5 5 5-5" />
        <path d="m7 9 5-5 5 5" />
      </svg>
    </div>
  ),

  "stats-card": (
    <div className="grid w-full max-w-lg grid-cols-2 gap-3">
      <div className="rounded-xl border border-border p-4">
        <p className="text-xs text-muted-foreground">Total Revenue</p>
        <p className="mt-1 text-2xl font-bold">$45,231</p>
        <p className="mt-1 flex items-center gap-1 text-xs text-[var(--color-malachite)]">
          ↑ +20.1% from last month
        </p>
      </div>
      <div className="rounded-xl border border-border p-4">
        <p className="text-xs text-muted-foreground">Active Users</p>
        <p className="mt-1 text-2xl font-bold">2,350</p>
        <p className="mt-1 flex items-center gap-1 text-xs text-[var(--color-malachite)]">
          ↑ +12.5% from last month
        </p>
      </div>
    </div>
  ),

  "filter-bar": (
    <div className="flex flex-wrap items-center gap-2">
      <span className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
        All
      </span>
      <span className="rounded-full border border-border px-3 py-1 text-xs">Weather</span>
      <span className="rounded-full border border-border px-3 py-1 text-xs">News</span>
      <span className="rounded-full border border-border px-3 py-1 text-xs">Events</span>
      <span className="rounded-full border border-border px-3 py-1 text-xs">Sports</span>
    </div>
  ),

  "share-dialog": (
    <div className="w-full max-w-sm space-y-3 rounded-xl border border-border p-4">
      <div>
        <p className="text-sm font-semibold">Share</p>
        <p className="text-xs text-muted-foreground">Mukoko Design System v7.0</p>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1 truncate rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs">
          https://mzizi.dev/...
        </div>
        <span className="rounded-lg border border-border px-3 py-2 text-xs">Copy</span>
      </div>
      <div className="flex gap-2">
        <span className="flex-1 rounded-lg border border-border px-3 py-2 text-center text-xs">
          X
        </span>
        <span className="flex-1 rounded-lg border border-border px-3 py-2 text-center text-xs">
          LinkedIn
        </span>
        <span className="flex-1 rounded-lg border border-border px-3 py-2 text-center text-xs">
          Email
        </span>
      </div>
    </div>
  ),

  "notification-bell": (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <div className="flex size-9 items-center justify-center rounded-lg border border-border">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
          </svg>
        </div>
        <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-white">
          3
        </span>
      </div>
      <p className="text-xs text-muted-foreground">3 unread notifications</p>
    </div>
  ),

  "file-upload": (
    <div className="w-full max-w-sm">
      <div className="flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-border p-6 text-center">
        <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-muted-foreground"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" x2="12" y1="3" y2="15" />
          </svg>
        </div>
        <p className="text-sm font-medium">Click to upload or drag and drop</p>
        <p className="text-xs text-muted-foreground">Any file type · Max 10MB</p>
      </div>
    </div>
  ),

  "copy-button": (
    <div className="flex items-center gap-3">
      <code className="rounded-lg bg-muted px-3 py-2 text-xs">
        npx shadcn@latest add https://mzizi.dev/api/r/button
      </code>
      <span className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
          <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
        </svg>
        Copy
      </span>
    </div>
  ),

  "status-indicator": (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-1.5">
        <span className="relative flex">
          <span className="size-2.5 rounded-full bg-[var(--color-malachite)]" />
          <span className="absolute inset-0 animate-ping rounded-full bg-[var(--color-malachite)] opacity-75" />
        </span>
        <span className="text-xs text-muted-foreground">Online</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="size-2.5 rounded-full bg-[var(--color-gold)]" />
        <span className="text-xs text-muted-foreground">Away</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="size-2.5 rounded-full bg-destructive" />
        <span className="text-xs text-muted-foreground">Busy</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="size-2.5 rounded-full bg-muted-foreground" />
        <span className="text-xs text-muted-foreground">Offline</span>
      </div>
    </div>
  ),

  timeline: (
    <div className="w-full max-w-sm space-y-0">
      <div className="relative flex gap-4 pb-8">
        <div className="relative flex flex-col items-center">
          <div className="z-10 size-3 rounded-full bg-[var(--color-cobalt)]" />
          <div className="w-px flex-1 bg-border" />
        </div>
        <div className="flex-1 space-y-1 pt-0">
          <h4 className="text-sm font-medium">Registry v7.0 released</h4>
          <p className="text-xs text-muted-foreground">
            Five African Minerals design system launched.
          </p>
          <time className="text-xs text-muted-foreground">March 2026</time>
        </div>
      </div>
      <div className="relative flex gap-4 pb-8">
        <div className="relative flex flex-col items-center">
          <div className="z-10 size-3 rounded-full bg-[var(--color-tanzanite)]" />
          <div className="w-px flex-1 bg-border" />
        </div>
        <div className="flex-1 space-y-1 pt-0">
          <h4 className="text-sm font-medium">90+ components</h4>
          <p className="text-xs text-muted-foreground">Cross-app standardized components added.</p>
          <time className="text-xs text-muted-foreground">March 2026</time>
        </div>
      </div>
      <div className="relative flex gap-4">
        <div className="relative flex flex-col items-center">
          <div className="z-10 size-3 rounded-full bg-[var(--color-malachite)]" />
        </div>
        <div className="flex-1 space-y-1 pt-0">
          <h4 className="text-sm font-medium">Error boundaries</h4>
          <p className="text-xs text-muted-foreground">Layered fault isolation architecture.</p>
          <time className="text-xs text-muted-foreground">March 2026</time>
        </div>
      </div>
    </div>
  ),

  "pricing-card": (
    <div className="flex gap-4">
      <div className="w-48 rounded-xl border border-border p-4">
        <div className="text-center">
          <p className="text-sm font-semibold">Starter</p>
          <p className="mt-2">
            <span className="text-3xl font-bold">Free</span>
          </p>
        </div>
        <div className="my-3 h-px bg-border" />
        <ul className="space-y-2 text-xs">
          <li className="flex items-center gap-1.5">✓ 5 components</li>
          <li className="flex items-center gap-1.5">✓ Community support</li>
        </ul>
        <button className="mt-4 w-full rounded-lg border border-border py-2 text-xs">
          Get started
        </button>
      </div>
      <div className="relative w-48 rounded-xl border-2 border-primary p-4 shadow-lg">
        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-medium text-primary-foreground">
          Popular
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold">Pro</p>
          <p className="mt-2">
            <span className="text-3xl font-bold">$29</span>
            <span className="text-xs text-muted-foreground">/mo</span>
          </p>
        </div>
        <div className="my-3 h-px bg-border" />
        <ul className="space-y-2 text-xs">
          <li className="flex items-center gap-1.5">✓ All components</li>
          <li className="flex items-center gap-1.5">✓ Priority support</li>
        </ul>
        <button className="mt-4 w-full rounded-lg bg-primary py-2 text-xs text-primary-foreground">
          Get started
        </button>
      </div>
    </div>
  ),

  rating: (
    <div className="flex flex-col items-center gap-3">
      <div className="flex gap-0.5">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="var(--color-gold)"
          stroke="var(--color-gold)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="var(--color-gold)"
          stroke="var(--color-gold)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="var(--color-gold)"
          stroke="var(--color-gold)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="var(--color-gold)"
          stroke="var(--color-gold)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-muted-foreground/30"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      </div>
      <p className="text-xs text-muted-foreground">4.0 / 5.0</p>
    </div>
  ),
}
