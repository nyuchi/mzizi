"use client"

import { useNyuchiHarness } from "@/lib/harness"
import * as React from "react"
import { LogOut, Settings, User, ChevronsUpDown } from "@/lib/icons"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface UserMenuProps {
  /** User display name */
  name: string
  /** User email */
  email?: string
  /** Avatar image URL */
  avatarUrl?: string
  /** Called when Sign Out is clicked */
  onSignOut?: () => void
  /** Additional menu items rendered before the sign-out group */
  children?: React.ReactNode
  /** Additional links (e.g., Profile, Settings) */
  menuItems?: UserMenuItem[]
  className?: string
}

interface UserMenuItem {
  label: string
  icon?: React.ComponentType<{ className?: string }>
  href?: string
  onClick?: () => void
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

function UserMenu({
  name,
  email,
  avatarUrl,
  onSignOut,
  children,
  menuItems = [],
  className,
}: UserMenuProps) {
  // Harness pre-wires observability + motion + a11y; user-menu's current
  // render path doesn't consume those surfaces yet, but keeping the hook
  // call registers the component with the global health monitor.
  useNyuchiHarness("user-menu")
  const defaultItems: UserMenuItem[] = [
    { label: "Profile", icon: User, href: "/profile" },
    { label: "Settings", icon: Settings, href: "/settings" },
  ]

  const items = menuItems.length > 0 ? menuItems : defaultItems

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          data-slot="user-menu"
          data-portal="https://mzizi.dev/components/user-menu"
          role="menu"
          aria-label="User menu"
          className={cn(
            "flex min-h-[48px] items-center gap-2 rounded-lg p-1.5 text-left text-sm transition-colors outline-none hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary,#00B0FF)]",
            className
          )}
        >
          <Avatar className="size-8">
            <AvatarImage src={avatarUrl} alt={name} />
            <AvatarFallback className="text-xs">{getInitials(name)}</AvatarFallback>
          </Avatar>
          <div className="hidden flex-col sm:flex">
            <span className="text-sm leading-none font-medium">{name}</span>
            {email && <span className="text-xs text-muted-foreground">{email}</span>}
          </div>
          <ChevronsUpDown className="ml-auto hidden size-4 text-muted-foreground sm:block" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm leading-none font-medium">{name}</p>
            {email && <p className="text-xs leading-none text-muted-foreground">{email}</p>}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {items.map((item) => {
            const Icon = item.icon
            return (
              <DropdownMenuItem key={item.label} onClick={item.onClick} asChild={!!item.href}>
                {item.href ? (
                  <a href={item.href}>
                    {Icon && <Icon className="mr-2 size-4" />}
                    {item.label}
                  </a>
                ) : (
                  <>
                    {Icon && <Icon className="mr-2 size-4" />}
                    {item.label}
                  </>
                )}
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuGroup>
        {children && (
          <>
            <DropdownMenuSeparator />
            {children}
          </>
        )}
        {onSignOut && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onSignOut}>
              <LogOut className="mr-2 size-4" />
              Sign out
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export { UserMenu }
export type { UserMenuProps, UserMenuItem }
