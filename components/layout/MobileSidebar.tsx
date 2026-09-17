"use client";

import Link from "next/link";
import { Activity, LogOut } from "lucide-react";

import { NAV_LINKS } from "@/lib/constants";
import { NavLink } from "@/components/layout/NavLink";
import { logoutAction } from "@/app/actions/auth";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { UserProfile } from "@/types";

export interface MobileSidebarProps {
  user: UserProfile | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileSidebar({
  user,
  isOpen,
  onOpenChange,
}: MobileSidebarProps): React.ReactElement {
  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : "GL";

  const handleLinkClick = (): void => {
    onOpenChange(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="flex flex-col p-0 w-72">
        {/* Brand Header */}
        <SheetHeader className="border-b px-6 py-4 text-left">
          <SheetTitle asChild>
            <Link
              href="/dashboard"
              onClick={handleLinkClick}
              className="flex items-center gap-2.5 font-bold tracking-tight text-foreground"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                <Activity className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold">Gluvia</span>
            </Link>
          </SheetTitle>
        </SheetHeader>

        {/* Navigation Links */}
        <div className="flex flex-1 flex-col justify-between overflow-y-auto p-4">
          <nav className="space-y-1.5" aria-label="Mobile Navigation">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.href}
                href={link.href}
                label={link.label}
                onClick={handleLinkClick}
              />
            ))}
          </nav>

          {/* User Profile & Logout Section */}
          <div className="border-t pt-4 space-y-3">
            <div className="flex items-center gap-3 px-2 py-1">
              <Avatar className="h-9 w-9 border">
                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm font-medium text-foreground">
                  {user?.username ?? "Patient"}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  South Asian Care
                </span>
              </div>
            </div>

            <form action={logoutAction} className="w-full">
              <Button
                type="submit"
                variant="outline"
                size="sm"
                className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive hover:border-destructive/30"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </Button>
            </form>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
