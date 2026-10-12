"use client";

import { CreditCard, LogOut, User } from "lucide-react";

import { signout } from "@/app/login/actions";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

// Top bar for the authenticated app: sidebar toggle + app name on the left, a
// user menu (avatar dropdown) on the right. The user menu's profile/billing
// items are placeholders; only Sign out is wired (to the existing server action).
export function AppHeader({ userEmail }: { userEmail: string }) {
  const name = userEmail ? userEmail.split("@")[0] : "Account";
  const initials = (userEmail || "?").slice(0, 2).toUpperCase();

  return (
    <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/80 px-4 backdrop-blur">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-1 h-5" />
      <span className="text-sm font-semibold tracking-tight">Learn Tagalog</span>

      <div className="ml-auto flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-9 gap-2 px-1.5 hover:bg-accent"
              aria-label="Open user menu"
            >
              <Avatar className="size-7">
                <AvatarFallback className="bg-accent text-xs font-semibold text-accent-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="hidden max-w-[12rem] truncate text-sm font-medium sm:inline">
                {name}
              </span>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="flex flex-col">
              <span className="text-sm font-medium">{name}</span>
              <span className="truncate text-xs font-normal text-muted-foreground">
                {userEmail}
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {/* TODO(integration): wire profile + billing to real pages. */}
            <DropdownMenuItem disabled>
              <User />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem disabled>
              <CreditCard />
              Billing
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <form action={signout}>
                <button type="submit" className="flex w-full items-center gap-2">
                  <LogOut />
                  Sign out
                </button>
              </form>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
