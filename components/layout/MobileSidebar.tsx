"use client";

import Link from "next/link";
import { Activity, ChevronRight, User, LogOut } from "lucide-react";

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
        <SheetHeader className="border-b border-[#E8EEF2] px-6 py-4 text-left">
          <SheetTitle asChild>
            <Link
              href="/dashboard"
              onClick={handleLinkClick}
              className="flex items-center gap-3 font-bold tracking-tight"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-[#20B486] to-[#3DD5A3] text-white shadow-xs">
                <Activity className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-[#17324D]">
                Gluvia
              </span>
            </Link>
          </SheetTitle>
        </SheetHeader>

        {/* Navigation Links */}
        <div className="flex flex-1 flex-col justify-between overflow-y-auto px-4 pb-6">
          <nav className="space-y-2" aria-label="Mobile Navigation">
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
          <div className="border-t border-[#E8EEF2] dark:border-border pt-4 px-1">
            {/* Profile Card Link */}
            <Link
              href="/profile"
              onClick={handleLinkClick}
              className="flex items-center justify-between rounded-xl p-2 transition-colors hover:bg-slate-100/80 dark:hover:bg-muted/50 group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Avatar className="h-10 w-10 border border-[#E8EEF2] dark:border-border">
                  <AvatarFallback className="bg-[#7190AB] text-white font-semibold text-xs">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col min-w-0">
                  <span className="truncate text-sm font-semibold text-[#17324D] dark:text-foreground group-hover:text-primary transition-colors">
                    {user?.username ?? "Zarak Khan"}
                  </span>
                  <span className="text-[11px] text-[#718096] dark:text-muted-foreground flex items-center gap-1">
                    <User className="h-3 w-3 text-[#20B486]" />
                    Manage profile
                  </span>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-[#718096] dark:text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all shrink-0" />
            </Link>

            {/* Decent Sign Out Button */}
            <form action={logoutAction} className="mt-2">
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-[#718096] dark:text-muted-foreground hover:text-rose-600 dark:hover:text-rose-400 bg-white dark:bg-card hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-[#E8EEF2] dark:border-border hover:border-rose-200 dark:hover:border-rose-900/50 shadow-2xs transition-all cursor-pointer active:scale-98"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign out</span>
              </button>
            </form>

            {/* Creator Attribution */}
            <div className="mt-3 pt-2 pb-1 text-center">
              <p className="text-[10px] text-[#718096] tracking-tight">
                Designed & Engineered by{" "}
                <span className="font-semibold text-[#17324D]">
                  Zarak K.
                </span>
              </p>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
